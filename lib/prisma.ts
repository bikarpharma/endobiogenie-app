// ========================================
// PRISMA CLIENT - Connexion à la base de données
// ========================================
// 📖 Explication simple :
// Ce fichier crée UNE SEULE connexion à la base de données
// pour toute l'application (évite d'ouvrir 100 connexions).

// IMPORTANT: Charger les variables d'environnement avant Prisma
import { config } from "dotenv";
import { resolve } from "path";

// Charger .env explicitement (nécessaire pour Turbopack)
config({ path: resolve(process.cwd(), ".env") });

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
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// En développement, on garde la connexion ouverte
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
