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

  return (
    <div className="paragraph-container">
      {/* El texto del libro */}
      <p className="book-text">{content}</p>

      {/* Botón de interacción */}
      <div className="actions">
        <button onClick={() => setShowComments(!showComments)} className="comment-btn">
          {showComments ? 'Ocultar análisis' : `Ver análisis (${comments.length})`}
        </button>
      </div>

      {/* Sección de comentarios (Social) */}
      {showComments && (
        <div className="comments-section">
          {comments.map((c) => (
            <div key={c.id} className="comment-card">
              <div className="user-info">
                <img src={c.user.image} alt={c.user.name} className="avatar" />
                <strong>{c.user.name}</strong>
              </div>
              <p className="comment-text">{c.content}</p>
            </div>
          ))}

          {session ? (
            <div className="comment-input-area">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu reflexión sobre este párrafo..."
              />
              <button onClick={handleSubmitComment}>Publicar análisis</button>
            </div>
          ) : (
            <p className="login-prompt">Inicia sesión con Google para comentar.</p>
          )}
        </div>
      )}

      <style jsx>{`
        .paragraph-container {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .book-text {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #333;
          margin-bottom: 1rem;
        }
        .comment-btn {
          background: none;
          border: 1px solid #d1d1d1;
          padding: 5px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #666;
        }
        .comment-btn:hover {
          background: #f0f0f0;
        }
        .comments-section {
          margin-top: 1.5rem;
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }
        .comment-card {
          padding: 10px 0;
          border-bottom: 1px solid #fafafa;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
        }
        .avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        .comment-text {
          margin: 5px 0 0 34px;
          font-size: 0.95rem;
          color: #444;
        }
        .comment-input-area textarea {
          width: 100%;
          margin-top: 1rem;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: sans-serif;
        }
        .login-prompt {
          font-size: 0.8rem;
          color: #888;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}