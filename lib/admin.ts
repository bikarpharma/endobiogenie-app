// ========================================
// ADMIN HELPERS - Vérification des permissions
// ========================================
// 📖 Explication simple :
// Fonctions utilitaires pour vérifier si l'utilisateur est admin

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session.user;
}

export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}
