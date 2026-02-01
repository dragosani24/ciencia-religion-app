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
