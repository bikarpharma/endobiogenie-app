// ========================================
// PRISMA CLIENT - Connexion à la base de données
// ========================================
// 📖 Explication simple :
// Ce fichier crée UNE SEULE connexion à la base de données
// pour toute l'application (évite d'ouvrir 100 connexions).

import { PrismaClient } from "@prisma/client";

// Typage pour le global (technique TypeScript)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Créer le client Prisma (ou réutiliser celui existant)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// En développement, on garde la connexion ouverte
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
