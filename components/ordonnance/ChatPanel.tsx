"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage, MessageAction } from "@/lib/ordonnance/types";

type ChatPanelProps = {
  ordonnanceId: string | null;
  initialMessages?: ChatMessage[];
  onApplyAction?: (action: MessageAction) => void;
};

export function ChatPanel({ ordonnanceId, initialMessages = [], onApplyAction }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger l'historique au montage
  useEffect(() => {
    if (ordonnanceId) {
      loadChatHistory();
    }
  }, [ordonnanceId]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ordonnances/${ordonnanceId}/chat`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Erreur chargement historique:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !ordonnanceId || sending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setSending(true);

    try {
      const response = await fetch(`/api/ordonnances/${ordonnanceId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (error: any) {
      console.error("❌ Erreur chat:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Désolé, une erreur est survenue. Veuillez réessayer.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!ordonnanceId) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          borderRadius: "12px",
        }}
      >
        <div style={{ textAlign: "center", padding: "48px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>💬</div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
            Chat non disponible
          </h3>
          <p style={{ fontSize: "0.95rem", color: "#6b7280" }}>
            Sélectionnez une ordonnance pour commencer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* En-tête */}
      <div
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        }}
      >
        <h3 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "4px" }}>
          💬 Assistant Endobiogénie
        </h3>
        <p style={{ fontSize: "0.85rem", opacity: 0.9 }}>
          Posez vos questions sur l'ordonnance ou demandez des modifications
        </p>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          background: "#f9fafb",
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
            <p style={{ fontSize: "0.95rem", color: "#6b7280" }}>
              Chargement de l'historique...
            </p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>👋</div>
            <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: "1.6" }}>
              Bonjour ! Je suis votre assistant endobiogénique.
              <br />
              Posez-moi vos questions sur cette ordonnance.
            </p>
            <div style={{ marginTop: "24px", display: "grid", gap: "8px" }}>
              <button
                onClick={() => setInputMessage("Pourquoi as-tu choisi Avena sativa ?")}
                style={{
                  padding: "12px 16px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                💡 Pourquoi as-tu choisi Avena sativa ?
              </button>
              <button
                onClick={() => setInputMessage("Peux-tu remplacer une plante par une autre ?")}
                style={{
                  padding: "12px 16px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                🔄 Peux-tu remplacer une plante ?
              </button>
              <button
                onClick={() => setInputMessage("Y a-t-il des interactions à surveiller ?")}
                style={{
                  padding: "12px 16px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                ⚠️ Y a-t-il des interactions ?
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            message={message}
            onApplyAction={onApplyAction}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #e5e7eb",
          background: "white",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre message... (Shift+Enter pour nouvelle ligne)"
            rows={2}
            disabled={sending}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              resize: "none",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || sending}
            style={{
              padding: "12px 24px",
              background: !inputMessage.trim() || sending
                ? "#9ca3af"
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: !inputMessage.trim() || sending ? "not-allowed" : "pointer",
              boxShadow: !inputMessage.trim() || sending ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            {sending ? "⏳" : "📤"} Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Composant Message Bubble
// ========================================
type ChatMessageBubbleProps = {
  message: ChatMessage;
  onApplyAction?: (action: MessageAction) => void;
};

function ChatMessageBubble({ message, onApplyAction }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        marginBottom: "16px",
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 16px",
          background: isUser
            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            : "white",
          color: isUser ? "white" : "#1f2937",
          borderRadius: isUser ? "16px 16px 0 16px" : "16px 16px 16px 0",
          boxShadow: isUser ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Contenu du message */}
        <div
          style={{
            fontSize: "0.95rem",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <div
          style={{
            marginTop: "8px",
            fontSize: "0.75rem",
            opacity: 0.7,
            textAlign: "right",
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Actions suggérées */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "12px", color: "#6b7280" }}>
              Actions suggérées:
            </div>
            <div style={{ display: "grid", gap: "8px" }}>
              {message.actions.map((action) => (
                <ActionCard key={action.id} action={action} onApply={onApplyAction} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// Composant Action Card
// ========================================
type ActionCardProps = {
  action: MessageAction;
  onApply?: (action: MessageAction) => void;
};

function ActionCard({ action, onApply }: ActionCardProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case "add": return "➕";
      case "replace": return "🔄";
      case "remove": return "➖";
      default: return "💡";
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case "add": return "Ajouter";
      case "replace": return "Remplacer";
      case "remove": return "Retirer";
      default: return "Action";
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case "add": return { bg: "#d1fae5", text: "#065f46", border: "#10b981" };
      case "replace": return { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" };
      case "remove": return { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" };
      default: return { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
    }
  };

  const colors = getActionColor(action.type);

  return (
    <div
      style={{
        padding: "12px",
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "1.2rem" }}>{getActionIcon(action.type)}</span>
            <strong style={{ color: colors.text, fontSize: "0.9rem" }}>
              {getActionLabel(action.type)}
            </strong>
          </div>
          {action.to && (
            <div style={{ fontSize: "0.85rem", color: colors.text, marginLeft: "28px" }}>
              <strong>{action.to.substance}</strong> ({action.to.forme})
              <br />
              <span style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                {action.to.posologie} • {action.to.duree}
              </span>
            </div>
          )}
        </div>
      </div>

      {action.justification && (
        <div
          style={{
            fontSize: "0.8rem",
            color: colors.text,
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: `1px solid ${colors.border}`,
            opacity: 0.9,
          }}
        >
          💡 {action.justification}
        </div>
      )}

      {!action.applied && onApply && (
        <button
          onClick={() => onApply(action)}
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            background: colors.border,
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer",
            width: "100%",
          }}
        >
          ✓ Appliquer cette action
        </button>
      )}

      {action.applied && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            background: "#10b981",
            color: "white",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          ✓ Action appliquée
        </div>
      )}
    </div>
  );
}
