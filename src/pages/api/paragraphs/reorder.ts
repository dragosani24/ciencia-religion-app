import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (req.method === 'PUT') {
    try {
      const { paragraphId, direction } = req.body;

      if (!paragraphId || !direction) {
        return res.status(400).json({ error: 'ID de párrafo y dirección son requeridos' });
      }

      // Obtener el párrafo actual
      const currentParagraph = await prisma.paragraph.findUnique({
        where: { id: parseInt(paragraphId) },
      });

      if (!currentParagraph) {
        return res.status(404).json({ error: 'Párrafo no encontrado' });
      }

      // Obtener todos los párrafos del capítulo ordenados
      const paragraphs = await prisma.paragraph.findMany({
        where: { chapterId: currentParagraph.chapterId },
        orderBy: { order: 'asc' },
      });

      const currentIndex = paragraphs.findIndex(p => p.id === parseInt(paragraphId));

      if (currentIndex === -1) {
        return res.status(404).json({ error: 'Párrafo no encontrado en el capítulo' });
      }

      let targetIndex = currentIndex;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < paragraphs.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        return res.status(200).json({ message: 'No se puede mover en esa dirección' });
      }

      // Intercambiar los valores de order
      const targetParagraph = paragraphs[targetIndex];

      await prisma.$transaction([
        prisma.paragraph.update({
          where: { id: currentParagraph.id },
          data: { order: targetParagraph.order },
        }),
        prisma.paragraph.update({
          where: { id: targetParagraph.id },
          data: { order: currentParagraph.order },
        }),
      ]);

      return res.status(200).json({ message: 'Orden actualizado exitosamente' });
    } catch (error) {
      console.error('Error reordering paragraph:', error);
      return res.status(500).json({ error: 'Error al reordenar el párrafo' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
