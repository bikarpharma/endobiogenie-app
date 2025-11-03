// ========================================
// COMPOSANT ORDONNANCE CHAT
// ========================================
// 📖 Explication simple :
// Interface de chat pour discuter de l'ordonnance générée.
// Permet au médecin de questionner, affiner, et justifier la prescription.

"use client";

import { useState, useRef, useEffect } from "react";

interface OrdonnanceChatProps {
  ordonnance: string;
  bdfContext: {
    indexes: Array<{ label: string; value: number; comment: string }>;
    inputs: Record<string, number>;
    ragEnrichment?: {
      resumeFonctionnel: string;
      axesSollicites: string[];
      lectureEndobiogenique: string;
    } | null;
  };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function OrdonnanceChat({ ordonnance, bdfContext }: OrdonnanceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const autosize = () => {
      el.style.height = "auto";
      el.style.height = Math.min(150, Math.max(60, el.scrollHeight)) + "px";
    };
    autosize();
    const handler = () => autosize();
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, []);

  // Message initial (instructions)
  const initialMessage = messages.length === 0;

  async function sendMessage(message: string) {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/bdf/ordonnance/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          ordonnance,
          bdfContext,
          chatHistory: messages,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la communication");
      }

      const data = await res.json();
      const reply = data.reply || "";

      // Ajouter la réponse de l'assistant
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      console.error("Erreur chat ordonnance:", err);
      setError(err.message || "Erreur réseau");
      // Retirer le message utilisateur en cas d'erreur
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;
    sendMessage(msg);
    setInput("");
  }

  function useSuggestion(suggestion: string) {
    if (loading) return;
    sendMessage(suggestion);
  }

  // Suggestions prédéfinies
  const suggestions = [
    "Peux-tu justifier le choix de ces plantes ?",
    "Y a-t-il des alternatives possibles ?",
    "Quelles sont les contre-indications ?",
    "Comment adapter la posologie pour une personne âgée ?",
  ];

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        marginTop: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "2px solid #a855f7",
      }}
    >
      <h3
        style={{
          fontSize: "1.1rem",
          marginBottom: "16px",
          color: "#7e22ce",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        💬 Discussion sur l'ordonnance
      </h3>

      <p
        style={{
          fontSize: "0.9rem",
          color: "#6b7280",
          marginBottom: "20px",
          lineHeight: "1.6",
        }}
      >
        Posez vos questions sur l'ordonnance générée. L'assistant s'appuie sur les connaissances en
        endobiogénie, gemmothérapie, aromathérapie et phytothérapie.
      </p>

      {/* Messages */}
      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          marginBottom: "16px",
          padding: "16px",
          background: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        {initialMessage ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <span style={{ fontSize: "48px" }}>💬</span>
            <p style={{ color: "#6b7280", fontSize: "0.95rem", marginTop: "12px" }}>
              Commencez la discussion en posant une question
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "8px",
                marginTop: "20px",
              }}
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => useSuggestion(s)}
                  disabled={loading}
                  style={{
                    padding: "10px 16px",
                    background: "white",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    color: "#374151",
                    cursor: loading ? "not-allowed" : "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = "#a855f7";
                      e.currentTarget.style.background = "#faf5ff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "white";
                    }
                  }}
                >
                  💡 {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: msg.role === "user" ? "#dbeafe" : "#faf5ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    flexShrink: 0,
                  }}
                >
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      background: msg.role === "user" ? "#eff6ff" : "white",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: msg.role === "user" ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
                      fontSize: "0.95rem",
                      color: "#1f2937",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => navigator.clipboard.writeText(msg.content)}
                      style={{
                        marginTop: "8px",
                        padding: "6px 12px",
                        background: "transparent",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      📋 Copier
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "2px solid #ef4444",
            fontSize: "0.9rem",
            color: "#991b1b",
            marginBottom: "16px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
        <textarea
          ref={textareaRef}
          placeholder="Ex. Peux-tu justifier le choix du Cassis ?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "2px solid #e5e7eb",
            borderRadius: "10px",
            fontSize: "0.95rem",
            resize: "none",
            minHeight: "60px",
            maxHeight: "150px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#a855f7";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "12px 24px",
            background:
              loading || !input.trim()
                ? "#9ca3af"
                : "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "⏳" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
