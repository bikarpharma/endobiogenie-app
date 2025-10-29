"use client";
import { useEffect, useRef, useState } from "react";

type ApiReply = { reply?: string; error?: string };

const SUGGESTIONS = [
  "Explique la relation αΣ / βΣ / πΣ dans l’adaptation immédiate.",
  "Cassis (Ribes nigrum) : axes sollicités et lecture endobiogénique ?",
  "Quels émonctoires prioriser en terrain congestif hépatique ?",
  "Différence TM / EPS / macérat glycériné sur l’axe thyréotrope.",
];

export default function Page() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const ansRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!taRef.current) return;
    const el = taRef.current;
    const autosize = () => {
      el.style.height = "auto";
      el.style.height = Math.min(300, Math.max(80, el.scrollHeight)) + "px";
    };
    autosize();
    const h = () => autosize();
    el.addEventListener("input", h);
    return () => el.removeEventListener("input", h);
  }, []);

  useEffect(() => {
    if (answer && ansRef.current) ansRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [answer]);

  async function ask(message: string) {
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data: ApiReply = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error! : res.statusText);
        return;
      }
      const text = (data.reply ?? "").trim();
      if (!text) {
        setError("Réponse vide du serveur.");
        return;
      }
      setAnswer(formatAnswer(text));
    } catch (e: any) {
      setError(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = q.trim();
    if (!msg || loading) return;
    ask(msg);
  }

  function useSuggestion(s: string) {
    setQ(s);
    ask(s);
  }

  function copyAnswer() {
    if (!answer) return;
    navigator.clipboard.writeText(answer.replace(/<[^>]+>/g, ""));
  }

  // Mise en forme légère de la réponse
  function formatAnswer(text: string) {
    // Retourner le texte tel quel (plus de mise en évidence des sources)
    return text;
  }

  return (
    <div className="grid" style={{ marginTop: 22 }}>
      {/* Colonne principale */}
      <section className="panel" style={{ padding: 18 }}>
        <h1 style={{ margin: "0 0 6px" }}>Assistant RAG — Endobiogénie</h1>
        <p style={{ margin: "0 0 16px", color: "var(--muted)" }}>
          Posez vos questions. Les réponses s’appuient exclusivement sur vos volumes indexés.
        </p>

        <form onSubmit={onSubmit} className="row" style={{ alignItems: "flex-start" }}>
          <textarea
            ref={taRef}
            className="textarea"
            placeholder="Ex. Explique la dynamique αΣ ↔ βΣ ↔ πΣ dans une adaptation chronique…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" type="submit" disabled={loading || !q.trim()}>
            {loading ? "Génération…" : "Envoyer"}
          </button>
        </form>

        {/* Suggestions */}
        <div style={{ marginTop: 14 }}>
          <div className="chips">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                type="button"
                className="chip"
                onClick={() => useSuggestion(s)}
                title="Utiliser cette suggestion"
              >
                🔍 {s}
              </button>
            ))}
          </div>
        </div>

        {/* États */}
        {error && (
          <div style={{ marginTop: 14, color: "var(--err)" }}>
            ❌ {error}
          </div>
        )}

        {/* Réponse */}
        {answer && (
          <div ref={ansRef} style={{ marginTop: 18 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="badge">Réponse</span>
              <div className="row">
                <button className="btn btn-ghost" onClick={copyAnswer} type="button">Copier</button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setAnswer("");
                    setQ("");
                    taRef.current?.focus();
                  }}
                >
                  Effacer
                </button>
              </div>
            </div>
            <div
              className="answer"
              style={{ marginTop: 8 }}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </div>
        )}
      </section>

      {/* Colonne latérale (placeholders rubriques/fiches) */}
      <aside className="panel side-card">
        <h3 className="side-title">Rubriques</h3>
        <div className="side-list">
          <div className="side-item">🌿 Plantes médicinales (bientôt)</div>
          <div className="side-item">🧪 Molécules / constituants (bientôt)</div>
          <div className="side-item">🧩 Indications & axes (bientôt)</div>
          <div className="side-item">⚗️ Formes galéniques & posologies (bientôt)</div>
          <div className="side-item">📚 Références & niveaux d’évidence (bientôt)</div>
        </div>
        <div style={{ marginTop: 14, borderTop: "1px dashed var(--border)", paddingTop: 12 }}>
          <h4 style={{ margin: "0 0 8px" }}>Astuce</h4>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Les réponses s'appuient sur les volumes d'endobiogénie indexés. Posez des questions précises pour obtenir des explications détaillées.
          </p>
        </div>
      </aside>
    </div>
  );
}
