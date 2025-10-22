export const metadata = {
  title: "Endobiogénie RAG",
  description:
    "Assistant RAG basé sur les volumes d’endobiogénie — démonstrateur avec chat + rubriques.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = "fr";
  return (
    <html lang={lang}>
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <div className="brand">
              <span className="logo">🌿</span>
              <strong>Agent Endobiogénie</strong>
            </div>
            <nav className="nav">
              <a href="/" className="nav-link">Chat</a>
              <a className="nav-link nav-link--muted" title="À venir">Fiches</a>
              <a className="nav-link nav-link--muted" title="À venir">Plantes</a>
              <a className="nav-link nav-link--muted" title="À venir">Indications</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <span>© {new Date().getFullYear()} Endobiogénie RAG — Démo</span>
            <a
              className="nav-link"
              href="https://endobiogenie-rag.vercel.app"
              target="_blank"
              rel="noreferrer"
            >
              Projet
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
