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
import Image from "next/image";
import { SignOutButton } from "@/components/SignOutButton";
import "./globals.css";

export const metadata = {
  title: "IntergIA",
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
      <body suppressHydrationWarning>
        {/* ===== HEADER ===== */}
        <header className="site-header">
          <div className="container header-inner">
            {/* Logo */}
            <div className="brand">
              <Image src="/integria-logo.jpg" alt="IntergIA" width={50} height={50} style={{ borderRadius: "8px" }} />
              <Link href={session ? "/dashboard" : "/"}>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
                  <strong>IntergIA</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>by Bikarpharma</span>
                </div>
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
                  <Link href="/patients" className="nav-link">
                    👤 Patients
                  </Link>
                  <Link href="/gemmo" className="nav-link">
                    🌿 Gemmo
                  </Link>
                  <Link href="/aroma" className="nav-link">
                    🌺 Aroma
                  </Link>
                  <Link href="/phyto" className="nav-link">
                    🌿 Phyto
                  </Link>
                  <Link href="/phytodex" className="nav-link">
                    📚 Phytodex
                  </Link>
                  <Link href="/fiches" className="nav-link nav-link--muted">
                    Fiches
                  </Link>
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
            <span>© {new Date().getFullYear()} IntergIA</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
