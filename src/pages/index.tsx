import { useSession, signIn, signOut } from "next-auth/react";
import { prisma } from "../lib/prisma";
import { useState } from "react";
import AddParagraph from "../components/AddParagraph";
import Paragraph from "../components/Paragraph";

export default function Home({ chapters: initialChapters }) {
  const { data: session } = useSession();
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapters, setChapters] = useState(initialChapters);

  const handleParagraphAdded = (chapterId: number, newParagraph: any) => {
    setChapters(prevChapters => 
      prevChapters.map(chapter => 
        chapter.id === chapterId
          ? { ...chapter, paragraphs: [...chapter.paragraphs, newParagraph] }
          : chapter
      )
    );
    
    // Scroll al nuevo párrafo después de un pequeño delay
    setTimeout(() => {
      const element = document.getElementById(`paragraph-${newParagraph.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleReorder = async (chapterId: number, paragraphId: number, direction: 'up' | 'down') => {
    try {
      const res = await fetch('/api/paragraphs/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraphId, direction }),
      });

      if (res.ok) {
        // Recargar los datos del capítulo para obtener el nuevo orden
        const response = await fetch(`/api/chapters/${chapterId}`);
        if (response.ok) {
          const updatedChapter = await response.json();
          setChapters(prevChapters =>
            prevChapters.map(chapter =>
              chapter.id === chapterId ? updatedChapter : chapter
            )
          );
        }
      }
    } catch (error) {
      console.error('Error reordering paragraph:', error);
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
                <h2 className="chapter-title">
                  {chapter.title}
                  <AddParagraph 
                    chapterId={chapter.id} 
                    onSuccess={(newParagraph) => handleParagraphAdded(chapter.id, newParagraph)}
                  />
                </h2>
                
                {chapter.paragraphs.map((paragraph, index) => (
                  <div key={paragraph.id} id={`paragraph-${paragraph.id}`}>
                    <Paragraph
                      id={paragraph.id}
                      content={paragraph.content}
                      comments={paragraph.comments || []}
                      onReorder={(direction) => handleReorder(chapter.id, paragraph.id, direction)}
                      canMoveUp={index > 0}
                      canMoveDown={index < chapter.paragraphs.length - 1}
                    />
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
          orderBy: { order: 'asc' },
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
