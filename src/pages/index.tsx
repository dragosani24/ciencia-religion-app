import { useSession, signIn, signOut } from "next-auth/react";
import { prisma } from "../lib/prisma";
import { useState } from "react";
import AddParagraph from "../components/AddParagraph";
import Paragraph from "../components/Paragraph";

export default function Home({ chapters }) {
  const { data: session } = useSession();
  const [selectedChapter, setSelectedChapter] = useState(null);

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
                  <AddParagraph chapterId={chapter.id} />
                </h2>
                
                {chapter.paragraphs.map(paragraph => (
                  <Paragraph
                    key={paragraph.id}
                    id={paragraph.id}
                    content={paragraph.content}
                    comments={paragraph.comments}
                  />
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
