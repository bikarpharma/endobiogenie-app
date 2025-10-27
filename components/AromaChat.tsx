"use client";

import { useState, useRef, useEffect } from "react";

// 6 suggestions de questions pour l'aromathérapie
const SUGGESTIONS = [
  "Quelles huiles essentielles pour le stress et l'anxiété ?",
  "Comment utiliser l'HE de lavande vraie en toute sécurité ?",
  "Synergie anti-inflammatoire pour douleurs articulaires ?",
  "Précautions d'usage des huiles essentielles chez l'enfant ?",
  "Différence entre HE et hydrolat aromatique ?",
  "Voies d'administration : topique, diffusion ou orale ?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AromaChatProps {
  userId: string;
}

export function AromaChat({ userId }: AromaChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/aroma/chat", {
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

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Suggestions */}
      {messages.length === 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "#7c3aed" }}>
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
                  background: "#f5f3ff",
                  border: "1px solid #ddd6fe",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  color: "#7c3aed",
                  transition: "all 0.2s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#ede9fe";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f5f3ff";
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

      {/* Messages */}
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
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: msg.role === "user" ? "#3b82f6" : "#7c3aed",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  flexShrink: 0,
                }}
              >
                {msg.role === "user" ? "👤" : "🌺"}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    background: msg.role === "user" ? "#eff6ff" : "#f5f3ff",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: `1px solid ${msg.role === "user" ? "#dbeafe" : "#ddd6fe"}`,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                  }}
                >
                  {msg.content}
                </div>

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
                  borderTop: "3px solid #7c3aed",
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

      {/* Input */}
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
            placeholder="Posez votre question sur l'aromathérapie..."
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
              e.target.style.borderColor = "#7c3aed";
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
              background: loading || !input.trim() ? "#9ca3af" : "#7c3aed",
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
                e.currentTarget.style.background = "#6d28d9";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.background = "#7c3aed";
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
