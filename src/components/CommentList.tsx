import React from 'react';

interface User {
  name: string | null;
  image: string | null;
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  user: User;
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
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
          <div className="comment-body">
            <p>{comment.content}</p>
          </div>
        </div>
      ))}

      <style jsx>{`
        .comment-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
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