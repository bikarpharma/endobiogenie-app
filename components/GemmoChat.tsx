// ========================================
// COMPOSANT GEMMO CHAT
// ========================================
// 📖 Interface de chat pour la gemmothérapie

"use client";

import { useEffect, useRef, useState } from "react";

type ApiReply = { reply?: string; error?: string; chatId?: string };

const SUGGESTIONS = [
  "Quelles sont les propriétés du bourgeon de tilleul ?",
  "Quel macérat pour le stress chronique et l'anxiété ?",
  "Posologie standard des macérats glycérinés ?",
  "Contre-indications du bourgeon de cassis ?",
  "Différence entre bourgeon frais et macérat ?",
  "Bourgeons pour soutenir le système immunitaire ?",
];

export function GemmoChat({ userId }: { userId: string }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(message: string) {
    setLoading(true);
    setError("");

    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/gemmo/chat", {
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
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const reply = (data.reply ?? "").trim();
      if (!reply) {
        setError("Réponse vide du serveur.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (data.chatId && !chatId) {
        setChatId(data.chatId);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e?.message || "Erreur réseau");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
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

  return (
    <div className="chat-container gemmo-chat">
      <div className="chat-header gemmo-header">
        <h2 style={{ color: "#2d5016", margin: 0 }}>🌿 Chat Gemmothérapie</h2>
        <p className="muted">
          Posez vos questions sur les macérats glycérinés et bourgeons
        </p>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <span style={{ fontSize: "48px" }}>🌸</span>
            <p className="muted">Commencez une conversation sur la gemmothérapie</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="suggestion-chip gemmo-chip"
                  onClick={() => useSuggestion(s)}
                  disabled={loading}
                >
                  🌿 {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === "user" ? "👤" : "🌿"}
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
          placeholder="Ex. Quelles sont les propriétés du bourgeon de tilleul ?"
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
          className="btn btn-primary gemmo-btn"
          type="submit"
          disabled={loading || !question.trim()}
        >
          {loading ? "Génération…" : "Envoyer"}
        </button>
      </form>

      <style jsx>{`
        .gemmo-header {
          border-left: 4px solid #2d5016;
        }

        .gemmo-chip {
          background: #f0f9e8 !important;
          border-color: #d1e7c2 !important;
        }

        .gemmo-chip:hover:not(:disabled) {
          background: #e3f4d7 !important;
        }

        .gemmo-btn {
          background: #2d5016 !important;
        }

        .gemmo-btn:hover:not(:disabled) {
          background: #1f3a0f !important;
        }
      `}</style>
    </div>
  );
}
