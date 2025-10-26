// ========================================
// LAYOUT GLOBAL - Structure de toutes les pages
// ========================================
// 📖 Explication simple :
// Ce fichier définit la structure HTML commune à toutes les pages :
// - Header (navigation)
// - Main (contenu de la page)
// - Footer
//
// La navigation s'adapte selon l'état de connexion :
// - Non connecté : Accueil, Connexion, Inscription
// - Connecté : Dashboard, Chat, Fiches, Admin (si ADMIN), Déconnexion

import { auth } from "@/lib/auth";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import "./globals.css";

export const metadata = {
  title: "Endobiogénie SaaS",
  description: "Assistant RAG avec auth, historique et fiches plantes.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Récupérer la session (qui est connecté ?)
  const session = await auth();

  return (
    <html lang="fr">
      <body>
        {/* ===== HEADER ===== */}
        <header className="site-header">
          <div className="container header-inner">
            {/* Logo */}
            <div className="brand">
              <span className="logo">🌿</span>
              <Link href={session ? "/dashboard" : "/"}>
                <strong>Agent Endobiogénie</strong>
              </Link>
            </div>

            {/* Navigation adaptée */}
            <nav className="nav">
              {session ? (
                // Utilisateur connecté
                <>
                  <Link href="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <Link href="/chat" className="nav-link">
                    Chat
                  </Link>
                  <Link href="/gemmo" className="nav-link">
                    🌿 Gemmo
                  </Link>
                  <Link href="/fiches" className="nav-link nav-link--muted">
                    Fiches
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin/documents" className="nav-link">
                      Admin
                    </Link>
                  )}
                  <span className="nav-link">{session.user.email}</span>
                  <SignOutButton />
                </>
              ) : (
                // Utilisateur non connecté
                <>
                  <Link href="/" className="nav-link">
                    Accueil
                  </Link>
                  <Link href="/login" className="nav-link">
                    Connexion
                  </Link>
                  <Link href="/register" className="nav-link">
                    Inscription
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* ===== CONTENU PRINCIPAL ===== */}
        <main className="container">{children}</main>

        {/* ===== FOOTER ===== */}
        <footer className="site-footer">
          <div className="container footer-inner">
            <span>© {new Date().getFullYear()} Endobiogénie SaaS</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
