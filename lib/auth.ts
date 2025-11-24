// ========================================
// AUTH MAIN (NODE.JS) - Logique complète avec BDD
// ========================================
import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "./auth.config"; // <-- On importe la config légère

// ===== EXTENSION DES TYPES =====
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
  interface User {
    role: "USER" | "ADMIN";
  }
}

// ===== SCHÉMA DE VALIDATION =====
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

// ===== INITIALISATION NEXTAUTH =====
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // On fusionne avec la config légère
  providers: [
    // On définit le provider Credentials ICI seulement (car il utilise Prisma)
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;

        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});