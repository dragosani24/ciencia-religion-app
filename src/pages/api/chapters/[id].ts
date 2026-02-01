import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      const chapter = await prisma.chapter.findUnique({
        where: { id: parseInt(id as string) },
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
      });

      if (!chapter) {
        return res.status(404).json({ error: 'Capítulo no encontrado' });
      }

      return res.status(200).json(chapter);
    } catch (error) {
      console.error('Error fetching chapter:', error);
      return res.status(500).json({ error: 'Error al obtener el capítulo' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
