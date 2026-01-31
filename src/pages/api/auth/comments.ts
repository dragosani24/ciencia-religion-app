import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitimos el método POST para guardar comentarios
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  // 1. Verificar si el usuario está logueado con Google
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Debes iniciar sesión para comentar' });
  }

  const { paragraphId, content } = req.body;

  // 2. Validar que los datos existan
  if (!paragraphId || !content) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    // 3. Guardar el comentario en MySQL usando Prisma
    const newComment = await prisma.comment.create({
      data: {
        content: content,
        paragraphId: parseInt(paragraphId),
        userId: session.userId as string, // Usamos el ID de usuario de la sesión de Google
      },
      include: {
        user: true, // Devolvemos también la info del usuario (nombre/foto) para actualizar la UI
      },
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Error al guardar comentario:", error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}