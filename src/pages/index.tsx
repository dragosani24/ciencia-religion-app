import { useSession, signIn, signOut } from "next-auth/react";
import { prisma } from "../lib/prisma";
import { useState } from "react";

export default function Home({ chapters }) {
  const { data: session } = useSession();
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [expandedParagraphs, setExpandedParagraphs] = useState({});
  const [commentText, setCommentText] = useState({});

  const handleExpandParagraph = (paragraphId) => {
    setExpandedParagraphs(prev => ({
      ...prev,
      [paragraphId]: !prev[paragraphId]
    }));
  };

  const handleCommentSubmit = async (paragraphId) => {
    if (!session || !commentText[paragraphId]) return;
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paragraphId,
          content: commentText[paragraphId]
        })
      });

      if (response.ok) {
        setCommentText(prev => ({ ...prev, [paragraphId]: '' }));
        window.location.reload();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const filteredChapters = selectedChapter 
    ? chapters.filter(c => c.id === selectedChapter)
    : chapters;

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html {
          background: #030303 !important;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          background: #030303 !important;
          color: #d7dadc;
          line-height: 1.6;
          min-height: 100vh;
        }

        .container {
          width: 100%;
          padding: 0;
          background: #030303;
        }

        .header {
          background: #1a1a1b;
          color: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          border-bottom: 1px solid #343536;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header h1 {
          font-size: 1.3rem;
          font-weight: 500;
          color: #fff;
        }

        .auth-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 20px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .btn-login {
          background: transparent;
          color: #fff;
          border: 1px solid #343536;
        }

        .btn-login:hover {
          border-color: #d7dadc;
        }

        .btn-logout {
          background: transparent;
          color: #818384;
          border: 1px solid #343536;
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
        }

        .btn-logout:hover {
          border-color: #d7dadc;
          color: #d7dadc;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .user-info span {
          font-size: 0.9rem;
          color: #d7dadc;
        }

        .layout {
          display: flex;
          width: 100%;
          padding: 0;
          align-items: flex-start;
        }

        .sidebar {
          width: 280px;
          min-width: 280px;
          max-width: 280px;
          background: #1a1a1b;
          padding: 1rem 0;
          border-right: 1px solid #343536;
          height: calc(100vh - 57px);
          overflow-y: auto;
          position: sticky;
          top: 57px;
          left: 0;
        }

        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: #1a1a1b;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #343536;
          border-radius: 4px;
        }
        
        .sidebar h1 {
          font-size: 1rem;
          padding: 1rem 1rem 0.5rem;
          color: #818384;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar h2 {
          font-size: 0.75rem;
          padding: 1rem 1rem 0.5rem;
          color: #818384;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chapter-list {
          list-style: none;
          padding: 0 0.5rem 0.5rem;
        }

        .chapter-item {
          padding: 0.6rem 0.8rem;
          margin-bottom: 0.2rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          font-size: 0.9rem;
          color: #d7dadc;
        }

        .chapter-item:hover {
          background: #272729;
        }

        .chapter-item.active {
          background: #272729;
          font-weight: 500;
          color: #fff;
        }

        .chapter-item.all {
          background: #0079d3;
          color: white;
          font-weight: 500;
          margin-bottom: 0.8rem;
        }

        .chapter-item.all:hover {
          background: #0c71c7;
        }

        .main-content {
          flex: 1;
          padding: 1.5rem 2rem;
          min-width: 0;
          max-width: 100%;
          background: #030303;
        }

        .chapter-title {
          font-size: 1.3rem;
          color: #d7dadc;
          margin-bottom: 1.2rem;
          font-weight: 500;
        }

        .paragraph-card {
          background: #0e1217;
          padding: 1rem;
          margin-bottom: 0.8rem;
          border-radius: 4px;
          border: 1px solid #343536;
          transition: all 0.2s;
        }

        .paragraph-card:hover {
          border-color: #474748;
        }

        .paragraph-content {
          font-size: 17px;
          line-height: 1.6;
          margin-bottom: 0.8rem;
          color: #d7dadc;
        }

        .paragraph-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.8rem;
          margin-top: 0.8rem;
          padding-top: 0.8rem;
          border-top: 1px solid #343536;
        }

        .stats {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #818384;
        }

        .comments-toggle {
          background: transparent;
          color: #818384;
          padding: 0.4rem 0.8rem;
          border: 1px solid #343536;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .comments-toggle:hover {
          background: #272729;
          border-color: #474748;
          color: #d7dadc;
        }

        .comments-section {
          margin-top: 1rem;
          padding: 1rem;
          background: #272729;
          border-radius: 4px;
        }

        .comment {
          padding: 0.8rem;
          background: #1a1a1b;
          border-radius: 4px;
          margin-bottom: 0.8rem;
          border: 1px solid #343536;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .comment-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
        }

        .comment-author {
          font-weight: 600;
          color: #0c71c7;
          font-size: 0.85rem;
        }

        .comment-content {
          color: #d7dadc;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        .comment-form {
          margin-top: 1rem;
        }

        .comment-input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #343536;
          background: #272729;
          color: #d7dadc;
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
          min-height: 80px;
        }

        .comment-input:focus {
          outline: none;
          border-color: #0c71c7;
          background: #1a1a1b;
        }

        .btn-submit {
          background: #0079d3;
          color: white;
          margin-top: 0.5rem;
          border-radius: 20px;
          font-weight: 600;
        }

        .btn-submit:hover {
          background: #0c71c7;
        }

        .no-comments {
          text-align: center;
          color: #818384;
          padding: 1rem;
          font-style: italic;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .layout {
            flex-direction: column;
          }
          
          .sidebar {
            width: 100%;
            max-width: 100%;
            position: relative;
            height: auto;
          }

          .main-content {
            width: 100%;
            padding: 1rem;
          }
        }
      `}</style>

      {/* <div className="header">
        <div className="header-content">
          <h1>Ciencia y Religión del Porvenir</h1>
          <div className="auth-section">
            {!session ? (
              <button onClick={() => signIn('google')} className="btn btn-login">
                Iniciar sesión
              </button>
            ) : (
              <div className="user-info">
                {session.user?.image && (
                  <img src={session.user.image} alt="Avatar" className="user-avatar" />
                )}
                <span>{session.user?.name}</span>
                <button onClick={() => signOut()} className="btn btn-logout">Salir</button>
              </div>
            )}
          </div>
        </div>
      </div> */}

      <div className="container">
        <div className="layout">
          <aside className="sidebar">
            <h1>Capítulos</h1>
            <ul className="chapter-list">
              <li 
                className={`chapter-item ${!selectedChapter ? 'all' : ''}`}
                onClick={() => setSelectedChapter(null)}
              >
                📚 Todos
              </li>
              {chapters.map(chapter => (
                <li
                  key={chapter.id}
                  className={`chapter-item ${selectedChapter === chapter.id ? 'active' : ''}`}
                  onClick={() => setSelectedChapter(chapter.id)}
                >
                  {chapter.title}
                </li>
              ))}
            </ul>
          </aside>

          <main className="main-content">
            {filteredChapters.map(chapter => (
              <div key={chapter.id}>
                <h2 className="chapter-title">{chapter.title}</h2>
                
                {chapter.paragraphs.map(paragraph => (
                  <div key={paragraph.id} className="paragraph-card">
                    <div className="paragraph-content">
                      {paragraph.content}
                    </div>
                    
                    <div className="paragraph-footer">
                      <div className="stats">
                        <span>💬 {paragraph.comments.length} comentarios</span>
                      </div>
                      <button 
                        className="comments-toggle"
                        onClick={() => handleExpandParagraph(paragraph.id)}
                      >
                        {expandedParagraphs[paragraph.id] ? 'Ocultar' : 'Ver comentarios'}
                      </button>
                    </div>

                    {expandedParagraphs[paragraph.id] && (
                      <div className="comments-section">
                        {paragraph.comments.length > 0 ? (
                          paragraph.comments.map(comment => (
                            <div key={comment.id} className="comment">
                              <div className="comment-header">
                                {comment.user.image && (
                                  <img src={comment.user.image} alt="" className="comment-avatar" />
                                )}
                                <span className="comment-author">{comment.user.name}</span>
                              </div>
                              <div className="comment-content">{comment.content}</div>
                            </div>
                          ))
                        ) : (
                          <p className="no-comments">No hay comentarios aún</p>
                        )}

                        {session ? (
                          <div className="comment-form">
                            <textarea
                              className="comment-input"
                              placeholder="Escribe tu análisis sobre este párrafo..."
                              value={commentText[paragraph.id] || ''}
                              onChange={(e) => setCommentText(prev => ({
                                ...prev,
                                [paragraph.id]: e.target.value
                              }))}
                            />
                            <button 
                              className="btn btn-submit"
                              onClick={() => handleCommentSubmit(paragraph.id)}
                            >
                              Publicar comentario
                            </button>
                          </div>
                        ) : (
                          <p className="no-comments">
                            Inicia sesión para comentar
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </main>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const chapters = await prisma.chapter.findMany({
      include: {
        paragraphs: {
          include: {
            comments: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'asc'
      }
    });

    return {
      props: {
        chapters: JSON.parse(JSON.stringify(chapters)),
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        chapters: [],
      },
    };
  }
}
