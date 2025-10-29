// ========================================
// COMPOSANT CHAT INTERFACE
// ========================================
// 📖 Explication simple :
// Interface de chat qui :
// 1. Envoie les questions à l'assistant RAG
// 2. Affiche les réponses
// 3. Sauvegarde automatiquement l'historique
// 4. Détecte et analyse les valeurs biologiques (BdF)

"use client";

import { useEffect, useRef, useState } from "react";
import { BdfResultDrawer, type BdfAnalysis } from "./BdfResultDrawer";

// ========================================
// TYPES
// ========================================

type ApiReply = { reply?: string; error?: string; chatId?: string };

interface BdfInputs {
  gr?: number;
  gb?: number;
  hemoglobin?: number;
  neutrophils?: number;
  lymphocytes?: number;
  eosinophils?: number;
  monocytes?: number;
  platelets?: number;
  ldh?: number;
  cpk?: number;
  paoi?: number;
  osteocalcin?: number;
  tsh?: number;
}

// ========================================
// SUGGESTIONS
// ========================================

const SUGGESTIONS = [
  "Explique la relation αΣ / βΣ / πΣ dans l'adaptation immédiate.",
  "Cassis (Ribes nigrum) : axes sollicités et lecture endobiogénique ?",
  "Quels émonctoires prioriser en terrain congestif hépatique ?",
  "Différence TM / EPS / macérat glycériné sur l'axe thyréotrope.",
];

// ========================================
// PARSEUR DE VALEURS BIOLOGIQUES
// ========================================

function parseLabValues(message: string): BdfInputs | null {
  const normalized = message.toLowerCase();

  // Patterns de détection pour chaque biomarqueur
  const patterns = {
    gr: /(?:gr|globules?\s+rouges?)\s*[:=]?\s*([\d.,]+)/i,
    gb: /(?:gb|globules?\s+blancs?)\s*[:=]?\s*([\d.,]+)/i,
    hemoglobin: /(?:hb|h[eé]moglobine?)\s*[:=]?\s*([\d.,]+)/i,
    neutrophils: /(?:neutro(?:philes?)?|pnn)\s*[:=]?\s*([\d.,]+)/i,
    lymphocytes: /(?:lympho(?:cytes?)?)\s*[:=]?\s*([\d.,]+)/i,
    eosinophils: /(?:[eé]osino(?:philes?)?|[eé]os)\s*[:=]?\s*([\d.,]+)/i,
    monocytes: /(?:mono(?:cytes?)?)\s*[:=]?\s*([\d.,]+)/i,
    platelets: /(?:plaquettes?|plt)\s*[:=]?\s*([\d.,]+)/i,
    ldh: /ldh\s*[:=]?\s*([\d.,]+)/i,
    cpk: /cpk\s*[:=]?\s*([\d.,]+)/i,
    paoi: /paoi?\s*[:=]?\s*([\d.,]+)/i,
    osteocalcin: /(?:ost[eé]ocalcine?)\s*[:=]?\s*([\d.,]+)/i,
    tsh: /tsh\s*[:=]?\s*([\d.,]+)/i,
  };

  const results: BdfInputs = {};
  let matchCount = 0;

  // Extraire chaque valeur
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = normalized.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(value)) {
        results[key as keyof BdfInputs] = value;
        matchCount++;
      }
    }
  }

  // Retourner uniquement si on a au moins 5 valeurs détectées
  return matchCount >= 5 ? results : null;
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export function ChatInterface({ userId }: { userId: string }) {
  // États du chat
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  // États BdF
  const [bdfAnalysis, setBdfAnalysis] = useState<BdfAnalysis | null>(null);
  const [showBdfDrawer, setShowBdfDrawer] = useState(false);
  const [pendingLabs, setPendingLabs] = useState<BdfInputs | null>(null);
  const [loadingBdf, setLoadingBdf] = useState(false);
  const [ragText, setRagText] = useState<string | null>(null);
  const [loadingRag, setLoadingRag] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ========================================
  // EFFECTS
  // ========================================

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const autosize = () => {
      el.style.height = "auto";
      el.style.height = Math.min(300, Math.max(80, el.scrollHeight)) + "px";
    };
    autosize();
    const handler = () => autosize();
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Parser les valeurs biologiques après chaque message utilisateur
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") return;

    const parsedLabs = parseLabValues(lastMessage.content);
    if (parsedLabs) {
      setPendingLabs(parsedLabs);
    }
  }, [messages]);

  // ========================================
  // HANDLERS
  // ========================================

  async function sendMessage(message: string) {
    setLoading(true);
    setError("");

    // Ajouter le message de l'utilisateur immédiatement
    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          chatId,
          userId
        }),
      });

      const data: ApiReply = await res.json();

      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : res.statusText);
        // Retirer le message utilisateur en cas d'erreur
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const reply = (data.reply ?? "").trim();
      if (!reply) {
        setError("Réponse vide du serveur.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      // Sauvegarder le chatId si c'est le premier message
      if (data.chatId && !chatId) {
        setChatId(data.chatId);
      }

      // Ajouter la réponse de l'assistant
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e?.message || "Erreur réseau");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  async function runBdfAnalysis() {
    if (!pendingLabs) return;

    setLoadingBdf(true);
    try {
      // Mapper vers le format attendu par /api/bdf/analyse
      const payload = {
        GR: pendingLabs.gr,
        GB: pendingLabs.gb,
        neutrophiles: pendingLabs.neutrophils,
        lymphocytes: pendingLabs.lymphocytes,
        eosinophiles: pendingLabs.eosinophils,
        monocytes: pendingLabs.monocytes,
        plaquettes: pendingLabs.platelets,
        LDH: pendingLabs.ldh,
        CPK: pendingLabs.cpk,
        TSH: pendingLabs.tsh,
        osteocalcine: pendingLabs.osteocalcin,
        PAOi: pendingLabs.paoi,
      };

      const res = await fetch("/api/bdf/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'analyse BdF");
      }

      const data = await res.json();

      // Transformer la réponse en format BdfAnalysis
      const analysis: BdfAnalysis = {
        indexes: [
          {
            label: "Index Génital",
            value: data.indexes.indexGenital?.value ?? null,
            comment: data.indexes.indexGenital?.comment ?? "",
          },
          {
            label: "Index Thyroïdien",
            value: data.indexes.indexThyroidien?.value ?? null,
            comment: data.indexes.indexThyroidien?.comment ?? "",
          },
          {
            label: "g/T (Génito-Thyroïdien)",
            value: data.indexes.gT?.value ?? null,
            comment: data.indexes.gT?.comment ?? "",
          },
          {
            label: "Index d'Adaptation",
            value: data.indexes.indexAdaptation?.value ?? null,
            comment: data.indexes.indexAdaptation?.comment ?? "",
          },
          {
            label: "Index Œstrogénique",
            value: data.indexes.indexOestrogenique?.value ?? null,
            comment: data.indexes.indexOestrogenique?.comment ?? "",
          },
          {
            label: "Index de Turn-over",
            value: data.indexes.turnover?.value ?? null,
            comment: data.indexes.turnover?.comment ?? "",
          },
        ],
        summary: data.summary || "",
        axes: data.axesDominants || [],
        noteTechnique: data.noteTechnique || "Analyse fonctionnelle du terrain selon la Biologie des Fonctions. À corréler au contexte clinique.",
      };

      setBdfAnalysis(analysis);
      setShowBdfDrawer(true);
      setPendingLabs(null);
      setRagText(null); // Reset RAG text for new analysis
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l'analyse BdF");
    } finally {
      setLoadingBdf(false);
    }
  }

  async function handleRequestRag() {
    if (!bdfAnalysis) return;

    setLoadingRag(true);
    try {
      // Construire le prompt contextuel pour le RAG
      const ragQuery = `
Profil fonctionnel : ${bdfAnalysis.summary}

Axes dominants : ${bdfAnalysis.axes.join(", ")}

Index calculés :
${bdfAnalysis.indexes
  .map((idx) => `- ${idx.label}: ${idx.value !== null ? idx.value.toFixed(2) : "N/A"} (${idx.comment})`)
  .join("\n")}

À partir de ces données biologiques fonctionnelles, donne une lecture endobiogénique du terrain en français. Explique :
- Le rôle de l'axe corticotrope (ACTH → cortisol) dans l'adaptation
- La réponse de l'axe thyréotrope (métabolisme cellulaire et vitesse de réponse)
- La pression pro-croissance/anabolique (balance androgènes/œstrogènes)
- L'équilibre entre catabolisme et anabolisme
- Le remodelage et renouvellement tissulaire

Utilise le vocabulaire "profil fonctionnel", "axe sollicité", "dynamique adaptative", "terrain".
Pas de diagnostic médical, pas de traitement. Reste dans l'analyse fonctionnelle du terrain.
`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: ragQuery,
          chatId: null, // Nouvelle conversation pour RAG
          userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la génération RAG");
      }

      const ragData = await res.json();
      setRagText(ragData.reply || "Aucune interprétation disponible.");
    } catch (e: any) {
      setRagText(`Erreur : ${e?.message || "Impossible de générer la lecture endobiogénique"}`);
    } finally {
      setLoadingRag(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = question.trim();
    if (!msg || loading) return;
    sendMessage(msg);
    setQuestion("");
  }

  function useSuggestion(suggestion: string) {
    if (loading) return;
    setQuestion(suggestion);
    sendMessage(suggestion);
    setQuestion("");
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content);
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1>💬 Chat RAG - Endobiogénie</h1>
            <p className="muted">
              Posez vos questions. Les réponses s'appuient sur vos volumes indexés.
            </p>
          </div>
          {bdfAnalysis && (
            <button
              onClick={() => setShowBdfDrawer(true)}
              style={{
                padding: "10px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2563eb";
              }}
            >
              🧬 Ouvrir l'analyse BdF
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <span style={{ fontSize: "48px" }}>🌿</span>
            <p className="muted">Commencez une conversation en posant une question</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => useSuggestion(s)}
                  disabled={loading}
                >
                  🔍 {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  {msg.role === "assistant" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => copyMessage(msg.content)}
                      title="Copier"
                    >
                      📋 Copier
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Carte de suggestion BdF */}
            {pendingLabs && !loadingBdf && (
              <div
                style={{
                  background: "#f0f9ff",
                  border: "2px solid #3b82f6",
                  borderRadius: "12px",
                  padding: "20px",
                  margin: "16px 0",
                  animation: "slideInUp 0.3s ease-out",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "24px" }}>🧪</span>
                  <div>
                    <strong style={{ color: "#1e40af", fontSize: "1rem" }}>
                      Valeurs biologiques détectées
                    </strong>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "#6b7280" }}>
                      {Object.keys(pendingLabs).length} paramètres identifiés dans votre message
                    </p>
                  </div>
                </div>
                <button
                  onClick={runBdfAnalysis}
                  disabled={loadingBdf}
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    background: loadingBdf ? "#9ca3af" : "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: loadingBdf ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingBdf) {
                      e.currentTarget.style.background = "#1d4ed8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingBdf) {
                      e.currentTarget.style.background = "#2563eb";
                    }
                  }}
                >
                  {loadingBdf ? "Analyse en cours..." : "🧬 Analyser la BdF"}
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="error-message" style={{ marginBottom: "16px" }}>
          ❌ {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={onSubmit} className="chat-input-form">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Ex. Explique la dynamique αΣ ↔ βΣ ↔ πΣ… ou collez vos valeurs bio (GR, GB, TSH…)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading || !question.trim()}
        >
          {loading ? "Génération…" : "Envoyer"}
        </button>
      </form>

      {/* Drawer BdF */}
      {bdfAnalysis && (
        <BdfResultDrawer
          open={showBdfDrawer}
          onClose={() => setShowBdfDrawer(false)}
          analysis={bdfAnalysis}
          ragText={ragText}
          loadingRag={loadingRag}
          onRequestRag={handleRequestRag}
        />
      )}

      {/* Animations CSS */}
      <style>
        {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
