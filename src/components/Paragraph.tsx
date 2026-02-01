import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Comment {
  id: number;
  content: string;
  user: {
    name: string;
    image: string;
  };
}

interface ParagraphProps {
  id: number;
  content: string;
  comments: Comment[];
}

export default function Paragraph({ id, content, comments: initialComments }: ParagraphProps) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(content);
  const [editedContent, setEditedContent] = useState(content);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    // Lógica para enviar el comentario a la API
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
      window.location.reload();
    }
  };

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
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="comment">
                <div className="comment-header">
                  {c.user.image && (
                    <img src={c.user.image} alt="" className="comment-avatar" />
                  )}
                  <span className="comment-author">{c.user.name}</span>
                </div>
                <div className="comment-content">{c.content}</div>
              </div>
            ))
          ) : (
            <p className="no-comments">No hay comentarios aún</p>
          )}

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