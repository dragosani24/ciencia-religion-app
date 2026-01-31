import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Debes iniciar sesión para comentar' });
  }

  const { paragraphId, content } = req.body;

  if (!paragraphId || !content) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        content: content,
        paragraphId: parseInt(paragraphId),
        userId: session.userId as string,
      },
      include: {
        user: true,
      },
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Error al guardar comentario:", error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
