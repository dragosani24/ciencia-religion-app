import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Debes iniciar sesión' });
  }

  // POST - Crear comentario
  if (req.method === 'POST') {
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

  // PUT - Editar comentario
  if (req.method === 'PUT') {
    const { commentId, content } = req.body;

    if (!commentId || !content) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    try {
      // Verificar que el comentario pertenece al usuario
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId) },
      });

      if (!comment) {
        return res.status(404).json({ message: 'Comentario no encontrado' });
      }

      if (comment.userId !== session.userId) {
        return res.status(403).json({ message: 'No tienes permiso para editar este comentario' });
      }

      const updatedComment = await prisma.comment.update({
        where: { id: parseInt(commentId) },
        data: { content },
        include: {
          user: true,
        },
      });

      return res.status(200).json(updatedComment);
    } catch (error) {
      console.error("Error al actualizar comentario:", error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // DELETE - Eliminar comentario
  if (req.method === 'DELETE') {
    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ message: 'Falta el ID del comentario' });
    }

    try {
      // Verificar que el comentario pertenece al usuario
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId) },
      });

      if (!comment) {
        return res.status(404).json({ message: 'Comentario no encontrado' });
      }

      if (comment.userId !== session.userId) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
      }

      await prisma.comment.delete({
        where: { id: parseInt(commentId) },
      });

      return res.status(200).json({ message: 'Comentario eliminado' });
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
