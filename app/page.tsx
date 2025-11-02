// ========================================
// PAGE D'ACCUEIL - /
// ========================================
// 📖 Explication simple :
// Cette page affiche :
// - Si connecté : redirige vers /dashboard
// - Si non connecté : affiche une landing page avec boutons "S'inscrire" et "Se connecter"

export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  // Récupérer la session
  const session = await auth();

  // Si connecté, rediriger vers dashboard
  if (session) {
    redirect("/dashboard");
  }

  // Si non connecté, afficher la landing page
  return (
    <div style={{ padding: "60px 0", textAlign: "center" }}>
      <span style={{ fontSize: "64px" }}>🌿</span>
      <h1 style={{ fontSize: "48px", margin: "16px 0" }}>
        Agent Endobiogénie
      </h1>
      <p style={{ fontSize: "18px", color: "var(--muted)", marginBottom: "32px" }}>
        Assistant RAG intelligent pour la phytothérapie endobiogénique
      </p>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        <Link href="/register" className="btn btn-primary">
          Commencer gratuitement
        </Link>
        <Link href="/login" className="btn btn-ghost">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
