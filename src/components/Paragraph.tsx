import { useState } from 'react';
import { useSession } from 'next-auth/react';
import CommentList from './CommentList';

interface User {
  id: string;
  name: string;
  image: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  user: User;
  userId: string;
}

interface ParagraphProps {
  id: number;
  content: string;
  comments?: Comment[];
  onDelete?: () => void;
  onReorder?: (direction: 'up' | 'down') => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export default function Paragraph({ id, content, comments: initialComments = [], onDelete, onReorder, canMoveUp = true, canMoveDown = true }: ParagraphProps) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(content);
  const [editedContent, setEditedContent] = useState(content);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paragraphId: id, content: newComment }),
    });

    if (res.ok) {
      const savedComment = await res.json();
      setComments([...comments, savedComment]);
      setNewComment("");
    }
  };

  const handleCommentsUpdated = async () => {
    // Recargar los comentarios desde el servidor
    try {
      const res = await fetch(`/api/paragraphs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error al recargar comentarios:', error);
    }
  };

  const handleEditParagraph = async () => {
    if (!editedContent.trim()) return;

    const res = await fetch('/api/paragraphs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content: editedContent }),
    });

    if (res.ok) {
      setCurrentContent(editedContent);
      setIsEditing(false);
    }
  };

  const handleDeleteParagraph = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este párrafo?')) return;

    const res = await fetch('/api/paragraphs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setIsDeleted(true);
      if (onDelete) {
        onDelete();
      }
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div className="paragraph-card">
      {/* El texto del libro */}
      {isEditing ? (
        <div className="edit-mode">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button onClick={handleEditParagraph} className="btn-save">Guardar</button>
            <button onClick={() => {
              setIsEditing(false);
              setEditedContent(currentContent);
            }} className="btn-cancel">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="paragraph-content">{currentContent}</div>
      )}

      {/* Botón de interacción */}
      <div className="paragraph-footer">
        <div className="stats">
          <span>💬 {comments.length} comentarios</span>
        </div>
        <div className="actions">
          <button onClick={() => setShowComments(!showComments)} className="comments-toggle">
            {showComments ? 'Ocultar' : 'Ver comentarios'}
          </button>
          
          {session && !isEditing && (
            <>
              {onReorder && (
                <>
                  <button 
                    onClick={() => onReorder('up')} 
                    className="order-btn"
                    disabled={!canMoveUp}
                    title="Mover arriba"
                  >
                    ⬆️
                  </button>
                  <button 
                    onClick={() => onReorder('down')} 
                    className="order-btn"
                    disabled={!canMoveDown}
                    title="Mover abajo"
                  >
                    ⬇️
                  </button>
                </>
              )}
              <button onClick={() => {
                setIsEditing(true);
                setEditedContent(currentContent);
              }} className="edit-btn">
                ✏️ Editar
              </button>
              <button onClick={handleDeleteParagraph} className="delete-btn">
                🗑️ Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sección de comentarios (Social) */}
      {showComments && (
        <div className="comments-section">
          <CommentList comments={comments} onCommentUpdated={handleCommentsUpdated} />

          {session ? (
            <div className="comment-form">
              <textarea
                className="comment-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu análisis sobre este párrafo..."
              />
              <button className="btn btn-submit" onClick={handleSubmitComment}>
                Publicar comentario
              </button>
            </div>
          ) : (
            <p className="no-comments">Inicia sesión para comentar</p>
          )}
        </div>
      )}
    </div>
  );
}