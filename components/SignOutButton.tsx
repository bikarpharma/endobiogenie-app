// ========================================
// COMPOSANT SIGN OUT BUTTON - Bouton de déconnexion
// ========================================
// 📖 Explication simple :
// Ce composant affiche un bouton "Déconnexion".
// Quand on clique dessus :
// 1. NextAuth supprime la session
// 2. On est redirigé vers la page d'accueil

"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn btn-ghost"
    >
      Déconnexion
    </button>
  );
}
