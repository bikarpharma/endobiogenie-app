// ========================================
// NEXTAUTH CONFIGURATION - Gestion de l'authentification
// ========================================
// 📖 Explication simple :
// Ce fichier configure NextAuth pour gérer :
// - Connexion avec email/password
// - Connexion avec Google (plus tard)
// - Sessions utilisateur (qui est connecté ?)

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import Google from "next-auth/providers/google"; // Décommentez plus tard
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ===== EXTENSION DES TYPES NEXTAUTH =====
// (Pour ajouter "role" dans l'objet session.user)
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

// ===== VALIDATION DES DONNÉES DE CONNEXION =====
// (Avec la librairie "zod" pour vérifier que l'email est valide, etc.)
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

// ===== CONFIGURATION NEXTAUTH =====
export const { handlers, signIn, signOut, auth } = NextAuth({
  // Note: Pas d'adapter avec JWT sessions pour éviter les erreurs edge runtime

  // Mode de session : JWT (token stocké côté client)
  session: { strategy: "jwt" },

  // Redirection vers /login si non connecté
  pages: {
    signIn: "/login",
  },

  // ===== MÉTHODES DE CONNEXION =====
  providers: [
    // 1️⃣ Connexion avec email/password
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Valider les données
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Chercher l'utilisateur dans la base
        const user = await prisma.user.findUnique({ where: { email } });

        // Si pas trouvé ou pas de mot de passe (utilisateur OAuth)
        if (!user || !user.password) return null;

        // Vérifier le mot de passe (bcrypt compare)
        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        // Connexion réussie : retourner l'utilisateur
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // 2️⃣ Connexion avec Google (décommentez quand vous aurez les credentials)
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],

  // ===== CALLBACKS (personnalisation des sessions) =====
  callbacks: {
    // Ajouter l'ID et le rôle dans le JWT
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // Ajouter l'ID et le rôle dans la session accessible côté client
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
});
