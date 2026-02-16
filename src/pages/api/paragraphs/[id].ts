import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const paragraph = await prisma.paragraph.findUnique({
        where: { id: parseInt(id as string) },
        include: {
          comments: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!paragraph) {
        return res.status(404).json({ message: 'Párrafo no encontrado' });
      }

      return res.status(200).json(paragraph);
    } catch (error) {
      console.error("Error al obtener párrafo:", error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
