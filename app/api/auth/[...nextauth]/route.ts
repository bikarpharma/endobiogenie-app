// ========================================
// ROUTE API NEXTAUTH - /api/auth/[...nextauth]
// ========================================
// 📖 Explication simple :
// Cette route gère TOUTES les requêtes d'authentification :
// - /api/auth/signin (connexion)
// - /api/auth/signout (déconnexion)
// - /api/auth/session (vérifier qui est connecté)
// - etc.

import { handlers } from "@/lib/auth";

// Export des handlers NextAuth (GET et POST)
export const { GET, POST } = handlers;
