import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AddParagraphProps {
  chapterId: number;
  onSuccess?: (newParagraph: any) => void;
}

export default function AddParagraph({ chapterId, onSuccess }: AddParagraphProps) {
  const { data: session } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newChapterId, setNewChapterId] = useState(chapterId.toString());
  const [newOrder, setNewOrder] = useState("");
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
          chapterId: parseInt(newChapterId),
          order: newOrder ? parseInt(newOrder) : undefined
        }),
      });

      if (res.ok) {
        const newParagraph = await res.json();
        setNewChapterId(chapterId.toString());
        setNewOrder("");
        setNewContent("");
        setIsAdding(false);
        if (onSuccess) {
          onSuccess(newParagraph);
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
            <div className="form-field">
              <label htmlFor="chapter-id">Capítulo ID:</label>
              <input
                id="chapter-id"
                type="number"
                value={newChapterId}
                onChange={(e) => setNewChapterId(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-field">
              <label htmlFor="order">Orden:</label>
              <input
                id="order"
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
                placeholder="Dejar vacío para agregar al final"
                className="input-field"
              />
            </div>
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
                  setNewChapterId(chapterId.toString());
                  setNewOrder("");
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
