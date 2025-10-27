export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-gradient-to-b from-[rgba(10,12,18,0.6)] to-[rgba(10,12,18,0.85)]">
      <div className="w-full max-w-[1100px] mx-auto px-4">
        <div className="flex items-center justify-between py-3.5 text-sm">
          <span className="text-muted">
            © {new Date().getFullYear()} Endobiogénie RAG — Démo
          </span>
          <a
            className="text-muted px-2.5 py-1.5 rounded-lg border border-transparent transition-all duration-200 hover:text-text hover:bg-white/5 hover:border-border"
            href="https://endobiogenie-rag.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            Projet
          </a>
        </div>
      </div>
    </footer>
  );
}
