import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AddParagraphProps {
  chapterId: number;
  onSuccess?: () => void;
}

export default function AddParagraph({ chapterId, onSuccess }: AddParagraphProps) {
  const { data: session } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddParagraph = async () => {
    if (!newContent.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/paragraphs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newContent,
          chapterId: chapterId 
        }),
      });

      if (res.ok) {
        setNewContent("");
        setIsAdding(false);
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error adding paragraph:', error);
      alert('Error al agregar el párrafo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <>
      {!isAdding ? (
        <button onClick={() => setIsAdding(true)} className="btn-add-paragraph" title="Agregar nuevo párrafo">
          ➕
        </button>
      ) : (
        <div className="add-paragraph-modal">
          <div className="add-paragraph-form">
            <h3>Agregar nuevo párrafo</h3>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Escribe el contenido del nuevo párrafo..."
              className="edit-textarea"
              autoFocus
            />
            <div className="edit-actions">
              <button 
                onClick={handleAddParagraph} 
                className="btn-save"
                disabled={isSubmitting || !newContent.trim()}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar párrafo'}
              </button>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setNewContent("");
                }} 
                className="btn-cancel"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
