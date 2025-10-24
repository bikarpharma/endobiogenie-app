// ========================================
// COMPOSANT CHAT HISTORY
// ========================================
// 📖 Explication simple :
// Affiche l'historique complet d'une conversation
// et permet de continuer à discuter

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
};

type ApiReply = { reply?: string; error?: string };

export function ChatHistory({
  chatId,
  chatTitle,
  initialMessages,
  userId,
}: {
  chatId: string;
  chatTitle: string;
  initialMessages: Message[];
  userId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
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

    // Ajouter le message de l'utilisateur immédiatement
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          chatId,
          userId,
        }),
      });

      const data: ApiReply = await res.json();

      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : res.statusText);
        // Retirer le message temporaire en cas d'erreur
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const reply = (data.reply ?? "").trim();
      if (!reply) {
        setError("Réponse vide du serveur.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      // Ajouter la réponse de l'assistant
      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
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

  async function exportToPDF() {
    setExporting(true);
    try {
      const response = await fetch(`/api/chats/${chatId}/export`);

      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      // Créer un blob et télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conversation_${chatTitle.slice(0, 30)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError("Erreur lors de l'export PDF");
    } finally {
      setExporting(false);
    }
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content);
  }

  return (
    <div className="chat-container">
      {/* En-tête avec retour et export */}
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/dashboard" className="btn btn-ghost">
              ← Retour
            </Link>
            <div>
              <h1>💬 {chatTitle}</h1>
              <p className="muted" style={{ fontSize: "14px", marginTop: "4px" }}>
                {messages.length} message{messages.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={exportToPDF}
            disabled={exporting || messages.length === 0}
            className="btn btn-primary"
            title="Exporter en PDF"
          >
            {exporting ? "Export en cours..." : "📄 Exporter en PDF"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className={`message message-${msg.role}`}>
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
      </div>

      {/* Erreur */}
      {error && (
        <div className="error-message" style={{ marginBottom: "16px" }}>
          ❌ {error}
        </div>
      )}

      {/* Formulaire pour continuer la conversation */}
      <form onSubmit={onSubmit} className="chat-input-form">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Continuez la conversation…"
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
