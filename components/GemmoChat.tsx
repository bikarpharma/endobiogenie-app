"use client";

import { useState, useRef, useEffect } from "react";

// 6 suggestions de questions pour la gemmothérapie
const SUGGESTIONS = [
  "Quelles sont les propriétés du bourgeon de tilleul ?",
  "Quel macérat pour le stress chronique et l'anxiété ?",
  "Posologie standard des macérats glycérinés ?",
  "Contre-indications du bourgeon de cassis ?",
  "Différence entre bourgeon frais et macérat ?",
  "Bourgeons pour soutenir le système immunitaire ?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GemmoChatProps {
  userId: string;
}

export function GemmoChat({ userId }: GemmoChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Envoyer un message (question ou suggestion)
  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemmo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          chatId,
          userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur API");
      }

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Sauvegarder le chatId pour les prochains messages
      if (data.chatId) {
        setChatId(data.chatId);
      }
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Cliquer sur une suggestion
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Copier un message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Suggestions - affichées seulement si aucun message */}
      {messages.length === 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "#2d5016" }}>
            💡 Questions suggestions
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={loading}
                style={{
                  padding: "14px 16px",
                  background: "#f0f9e8",
                  border: "1px solid #d1e7c2",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  color: "#2d5016",
                  transition: "all 0.2s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#e3f4d7";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 80, 22, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f0f9e8";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de messages */}
      {messages.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            maxHeight: "500px",
            overflowY: "auto",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: msg.role === "user" ? "#3b82f6" : "#2d5016",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  flexShrink: 0,
                }}
              >
                {msg.role === "user" ? "👤" : "🌿"}
              </div>

              {/* Message content */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    background: msg.role === "user" ? "#eff6ff" : "#f0f9e8",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: `1px solid ${msg.role === "user" ? "#dbeafe" : "#d1e7c2"}`,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                  }}
                >
                  {msg.content}
                </div>

                {/* Bouton copier */}
                <button
                  onClick={() => copyMessage(msg.content)}
                  style={{
                    marginTop: "6px",
                    padding: "4px 10px",
                    background: "transparent",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  📋 Copier
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ textAlign: "center", color: "#6b7280", padding: "12px" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "20px",
                  height: "20px",
                  border: "3px solid #f3f4f6",
                  borderTop: "3px solid #2d5016",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Formulaire de saisie */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question sur la gemmothérapie..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "0.95rem",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2d5016";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: "12px 24px",
              background: loading || !input.trim() ? "#9ca3af" : "#2d5016",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: "500",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.background = "#1f3a0f";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.background = "#2d5016";
              }
            }}
          >
            {loading ? "..." : "Envoyer"}
          </button>
        </div>
      </form>
    </div>
  );
}
