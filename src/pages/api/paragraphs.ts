import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  // CREATE - Crear nuevo párrafo
  if (req.method === 'POST') {
    try {
      const { content, chapterId } = req.body;

      if (!content || !chapterId) {
        return res.status(400).json({ error: 'Contenido y capítulo son requeridos' });
      }

      // Obtener el último order del capítulo
      const lastParagraph = await prisma.paragraph.findFirst({
        where: { chapterId: parseInt(chapterId) },
        orderBy: { order: 'desc' },
      });

      const newOrder = lastParagraph ? lastParagraph.order + 1 : 0;

      const paragraph = await prisma.paragraph.create({
        data: {
          content,
          chapterId: parseInt(chapterId),
          order: newOrder,
        },
      });

      return res.status(201).json({ ...paragraph, comments: [] });
    } catch (error) {
      console.error('Error creating paragraph:', error);
      return res.status(500).json({ error: 'Error al crear el párrafo' });
    }
  }

  // UPDATE - Editar párrafo existente
  if (req.method === 'PUT') {
    try {
      const { id, content } = req.body;

      if (!id || !content) {
        return res.status(400).json({ error: 'ID y contenido son requeridos' });
      }

      const paragraph = await prisma.paragraph.update({
        where: { id: parseInt(id) },
        data: { content },
      });

      return res.status(200).json(paragraph);
    } catch (error) {
      console.error('Error updating paragraph:', error);
      return res.status(500).json({ error: 'Error al actualizar el párrafo' });
    }
  }

  // DELETE - Eliminar párrafo
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID es requerido' });
      }

      // Primero eliminar todos los comentarios asociados
      await prisma.comment.deleteMany({
        where: { paragraphId: parseInt(id) },
      });

      // Luego eliminar el párrafo
      await prisma.paragraph.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({ message: 'Párrafo eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting paragraph:', error);
      return res.status(500).json({ error: 'Error al eliminar el párrafo' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
