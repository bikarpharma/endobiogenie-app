"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Textarea, Badge, Chip, Spinner } from "@/components/ui";
import { Sidebar } from "@/components/Sidebar";

type ApiReply = { reply?: string; error?: string };

const SUGGESTIONS = [
  "Explique la relation αΣ / βΣ / πΣ dans l'adaptation immédiate.",
  "Cassis (Ribes nigrum) : axes sollicités et lecture endobiogénique ?",
  "Quels émonctoires prioriser en terrain congestif hépatique ?",
  "Différence TM / EPS / macérat glycériné sur l'axe thyréotrope.",
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
    if (answer && ansRef.current) {
      ansRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  // Mise en forme légère : met en évidence "(Source : ...)"
  function formatAnswer(text: string) {
    const withSources = text.replace(
      /\(Source\s*:[^)]+\)/gi,
      (m) => `<span class="text-muted">${m}</span>`
    );
    return withSources;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mt-5 pb-8">
      {/* Colonne principale */}
      <section>
        <Card className="p-4 md:p-5">
          <h1 className="text-2xl md:text-3xl font-bold text-text m-0 mb-1.5">
            Assistant RAG — Endobiogénie
          </h1>
          <p className="text-sm md:text-base text-muted m-0 mb-4">
            Posez vos questions. Les réponses s'appuient exclusivement sur vos
            volumes indexés.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2.5 items-start">
            <Textarea
              ref={taRef}
              placeholder="Ex. Explique la dynamique αΣ ↔ βΣ ↔ πΣ dans une adaptation chronique…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !q.trim()}
              className="w-full sm:w-auto whitespace-nowrap flex items-center gap-2"
            >
              {loading && <Spinner className="w-4 h-4" />}
              {loading ? "Génération…" : "Envoyer"}
            </Button>
          </form>

          {/* Suggestions */}
          {!loading && (
            <div className="mt-3.5 animate-fade-in">
              <div className="flex flex-wrap gap-2.5">
                {SUGGESTIONS.map((s, i) => (
                  <Chip
                    key={i}
                    onClick={() => useSuggestion(s)}
                    title="Utiliser cette suggestion"
                  >
                    🔍 {s}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="mt-5 flex items-center gap-3 text-muted animate-fade-in">
              <Spinner />
              <span>Recherche dans la base de connaissances...</span>
            </div>
          )}

          {/* États */}
          {error && (
            <div className="mt-3.5 text-err flex items-start gap-2 animate-fade-in">
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          {/* Réponse */}
          {answer && (
            <div ref={ansRef} className="mt-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <Badge>Réponse</Badge>
                <div className="flex gap-2.5">
                  <Button variant="ghost" onClick={copyAnswer} type="button">
                    Copier
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setAnswer("");
                      setQ("");
                      taRef.current?.focus();
                    }}
                  >
                    Effacer
                  </Button>
                </div>
              </div>
              <div
                className="whitespace-pre-wrap border-t border-dashed border-border pt-3.5 text-sm md:text-base leading-relaxed"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: answer }}
              />
            </div>
          )}
        </Card>
      </section>

      {/* Sidebar responsive */}
      <Sidebar />
    </div>
  );
}
