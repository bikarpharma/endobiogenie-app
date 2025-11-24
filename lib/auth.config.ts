// ========================================
// AUTH CONFIG (EDGE SAFE) - Configuration légère
// ========================================
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // Mode de session : JWT
  session: { strategy: "jwt" },

  // Pages de redirection
  pages: {
    signIn: "/login",
  },

  // Callbacks (Gestion du token et de la session)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },

  // Fournisseurs vides pour l'instant (le middleware n'a pas besoin de la logique DB)
  providers: [], 
} satisfies NextAuthConfig;