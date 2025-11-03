// ========================================
// COMPOSANT CHAT INTERFACE
// ========================================
// 📖 Explication simple :
// Interface de chat qui :
// 1. Envoie les questions à l'assistant RAG
// 2. Affiche les réponses
// 3. Sauvegarde automatiquement l'historique

"use client";

import { useEffect, useRef, useState } from "react";

type ApiReply = { reply?: string; error?: string; chatId?: string };

const SUGGESTIONS = [
  "Explique la relation αΣ / βΣ / πΣ dans l'adaptation immédiate.",
  "Cassis (Ribes nigrum) : axes sollicités et lecture endobiogénique ?",
  "Quels émonctoires prioriser en terrain congestif hépatique ?",
  "Différence TM / EPS / macérat glycériné sur l'axe thyréotrope.",
];

export function ChatInterface() {
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div className="chat-container">
      <div className="chat-header">
        <h1>💬 Chat RAG - Endobiogénie</h1>
        <p className="muted">
          Posez vos questions. Les réponses s'appuient sur vos volumes indexés.
        </p>
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
          placeholder="Ex. Explique la dynamique αΣ ↔ βΣ ↔ πΣ…"
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
    </div>
  );
}
