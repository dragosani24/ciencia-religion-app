import { PrismaClient } from "@prisma/client";

// Evita múltiples instancias de Prisma Client en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Muestra las consultas SQL en la consola para depuración
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;