import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  user: User;
  userId: string;
}

interface CommentListProps {
  comments: Comment[];
  onCommentUpdated?: () => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onCommentUpdated }) => {
  const { data: session } = useSession();
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commentId,
          content: editContent 
        }),
      });

      if (res.ok) {
        setEditingCommentId(null);
        setEditContent("");
        if (onCommentUpdated) {
          onCommentUpdated();
        }
      } else {
        alert('Error al actualizar el comentario');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error al actualizar el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });

      if (res.ok) {
        if (onCommentUpdated) {
          onCommentUpdated();
        }
      } else {
        alert('Error al eliminar el comentario');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar el comentario');
    }
  };

  const canModifyComment = (comment: Comment) => {
    return session && session.userId === comment.userId;
  };

  if (comments.length === 0) {
    return (
      <div className="no-comments">
        <p>Aún no hay análisis para este párrafo. ¡Sé el primero en comentar!</p>
        <style jsx>{`
          .no-comments {
            padding: 20px;
            text-align: center;
            color: #888;
            font-style: italic;
            font-size: 0.9rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <div key={comment.id} className="comment-item">
          <div className="comment-header">
            {comment.user.image ? (
              <img src={comment.user.image} alt={comment.user.name || ""} className="user-avatar" />
            ) : (
              <div className="avatar-placeholder" />
            )}
            <div className="user-meta">
              <span className="user-name">{comment.user.name || "Usuario Anónimo"}</span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          {editingCommentId === comment.id ? (
            <div className="edit-mode">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="edit-textarea"
                autoFocus
              />
              <div className="edit-actions">
                <button 
                  onClick={() => handleSaveEdit(comment.id)}
                  className="btn-save"
                  disabled={isSubmitting || !editContent.trim()}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="btn-cancel"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="comment-body">
                <p>{comment.content}</p>
              </div>
              {canModifyComment(comment) && (
                <div className="comment-actions">
                  <button 
                    onClick={() => handleEditClick(comment)}
                    className="edit-btn"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="delete-btn"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      <style jsx>{`
        .comment-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        .comment-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .edit-mode {
          margin-top: 8px;
        }
        .edit-textarea {
          width: 100%;
          min-height: 80px;
          padding: 8px;
          font-size: 0.9rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          resize: vertical;
        }
        .edit-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .btn-save, .btn-cancel, .edit-btn, .delete-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-save {
          background: #0079d3;
          color: white;
        }
        .btn-save:hover:not(:disabled) {
          background: #0c71c7;
        }
        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-cancel {
          background: transparent;
          color: #666;
          border: 1px solid #ddd;
        }
        .btn-cancel:hover:not(:disabled) {
          background: #f5f5f5;
        }
        .edit-btn {
          background: transparent;
          color: #0079d3;
          border: 1px solid #0079d3;
        }
        .edit-btn:hover {
          background: #e8f4fd;
        }
        .delete-btn {
          background: transparent;
          color: #e74c3c;
          border: 1px solid #e74c3c;
        }
        .delete-btn:hover {
          background: #fde8e8;
        }
          margin-top: 10px;
        }
        .comment-item {
          padding: 12px;
          background-color: #f9f9f7;
          border-left: 3px solid #d4af37; /* Color dorado para resaltar el análisis */
          border-radius: 4px;
        }
        .comment-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #ddd;
        }
        .avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #ccc;
        }
        .user-meta {
          display: flex;
          flex-direction: column;
        }
        .user-name {
          font-weight: bold;
          font-size: 0.9rem;
          color: #333;
        }
        .comment-date {
          font-size: 0.75rem;
          color: #999;
        }
        .comment-body p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #444;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
};

export default CommentList;