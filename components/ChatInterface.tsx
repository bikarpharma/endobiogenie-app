// ========================================
// COMPOSANT CHAT INTERFACE avec BdF
// ========================================
// Interface de chat qui :
// 1. Envoie les questions à l'assistant RAG
// 2. Affiche les réponses
// 3. Sauvegarde automatiquement l'historique
// 4. Détecte les valeurs biologiques et propose l'analyse BdF
// 5. Affiche les résultats BdF dans un Drawer réutilisable

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BdfResultDrawer } from "./BdfResultDrawer";
import { useBdfSession } from "@/store/useBdfSession";
import {
  detectLabValues,
  shouldSuggestBdfAnalysis,
  formatDetectedValues,
} from "@/lib/bdf/detectLabValues";
import { convertToBdfAnalysis } from "@/lib/bdf/convertToAnalysis";
import type { BdfAnalysis, BdfInputs } from "@/types/bdf";

type ApiReply = {
  reply?: string;
  error?: string;
  chatId?: string;
  chatTitle?: string;
  created?: boolean;
};

type ChatSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

type StoredMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

const SUGGESTIONS = [
  "Explique la relation αΣ / βΣ / πΣ dans l'adaptation immédiate.",
  "Cassis (Ribes nigrum) : axes sollicités et lecture endobiogénique ?",
  "Quels émonctoires prioriser en terrain congestif hépatique ?",
  "Différence TM / EPS / macérat glycériné sur l'axe thyréotrope.",
];

export function ChatInterface() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      role: string;
      content: string;
      bdfSuggestion?: { values: BdfInputs; formatted: string };
    }>
  >([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string | null>(null);
  const [availableChats, setAvailableChats] = useState<ChatSummary[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // État pour le Drawer BdF
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { lastAnalysis, setLastAnalysis } = useBdfSession();
  const [bdfAnalyzing, setBdfAnalyzing] = useState(false);

  // État pour le RAG
  const [ragContent, setRagContent] = useState<string | null>(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState<string | null>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    async function bootstrapHistory() {
      try {
        setHistoryLoading(true);
        const res = await fetch("/api/chat");
        if (!res.ok) {
          throw new Error("Impossible de charger l'historique");
        }

        const data: {
          chats?: ChatSummary[];
          activeChatId?: string | null;
          activeChatTitle?: string | null;
          messages?: StoredMessage[];
        } = await res.json();

        setAvailableChats(data.chats ?? []);

        if (data.activeChatId && data.messages && data.messages.length > 0) {
          setChatId(data.activeChatId);
          setChatTitle(data.activeChatTitle ?? null);
          setMessages(
            data.messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            }))
          );
        }
      } catch (err: any) {
        setError(err?.message ?? "Erreur lors du chargement de l'historique");
      } finally {
        setHistoryLoading(false);
      }
    }

    bootstrapHistory();
  }, []);

  async function loadChatHistory(selectedChatId: string) {
    try {
      setHistoryLoading(true);
      const res = await fetch(`/api/chat?chatId=${selectedChatId}`);
      if (!res.ok) {
        throw new Error("Conversation introuvable");
      }

      const data: {
        chat?: { id: string; title: string };
        messages?: StoredMessage[];
      } = await res.json();

      setChatId(selectedChatId);
      setChatTitle(data.chat?.title ?? null);
      setMessages(
        (data.messages ?? []).map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      );
    } catch (err: any) {
      setError(err?.message ?? "Impossible de charger la conversation");
    } finally {
      setHistoryLoading(false);
    }
  }

  function startNewConversation() {
    setChatId(null);
    setChatTitle(null);
    setMessages([]);
  }

  function handleChatSelection(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value;
    if (!selected) {
      startNewConversation();
      return;
    }

    loadChatHistory(selected).catch(() => {
      /* erreur déjà gérée */
    });
  }

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

    // Détecter les valeurs biologiques
    const detection = detectLabValues(message);
    const shouldSuggest = shouldSuggestBdfAnalysis(message);

    // Ajouter le message de l'utilisateur immédiatement
    const userMessage: any = { role: "user", content: message };
    if (shouldSuggest) {
      userMessage.bdfSuggestion = {
        values: detection.values,
        formatted: formatDetectedValues(detection.values),
      };
    }
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
        setError(
          typeof data?.error === "string" ? data.error : res.statusText
        );
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
      if (data.chatId) {
        setChatId(data.chatId);
        if (data.chatTitle) {
          setChatTitle(data.chatTitle);
        }

        setAvailableChats((prev) => {
          const updatedAt = new Date().toISOString();
          const existingIndex = prev.findIndex((chat) => chat.id === data.chatId);
          const summary: ChatSummary = {
            id: data.chatId!,
            title: data.chatTitle ?? "Nouvelle conversation",
            updatedAt,
          };

          if (existingIndex >= 0) {
            const clone = [...prev];
            clone.splice(existingIndex, 1);
            return [summary, ...clone];
          }

          return [summary, ...prev];
        });
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

  // Lancer l'analyse BdF
  async function handleLaunchBdfAnalysis(inputs: BdfInputs) {
    setBdfAnalyzing(true);
    setError("");

    try {
      const res = await fetch("/api/bdf/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'analyse BdF");
      }

      const apiPayload = await res.json();
      const analysis = convertToBdfAnalysis(apiPayload, inputs);

      // Stocker et ouvrir
      setLastAnalysis(analysis);
      setIsDrawerOpen(true);

      // Ajouter un message système
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "✅ Analyse BdF effectuée avec succès. Cliquez sur le bouton ci-dessus pour voir les résultats.",
        },
      ]);
    } catch (err: any) {
      console.error("Erreur BdF:", err);
      setError("Analyse BdF indisponible : " + err.message);
    } finally {
      setBdfAnalyzing(false);
    }
  }

  // Gérer l'appel RAG
  async function handleRequestRag(analysis: BdfAnalysis) {
    setRagLoading(true);
    setRagError(null);
    setRagContent(null);

    try {
      // Construire le prompt RAG
      const indexesSummary = analysis.indexes
        .map((idx) => `${idx.label}: ${idx.value?.toFixed(2) || "N/A"}`)
        .join(", ");

      const ragQuery = `
Analyse BdF effectuée :
- Index calculés : ${indexesSummary}
- Résumé fonctionnel : ${analysis.summary}
- Axes neuroendocriniens sollicités : ${analysis.axes.join(", ")}

Produis une lecture endobiogénique contextualisée de ce terrain biologique.
Utilise les documents du vector store pour expliquer :
1. La dynamique adaptative révélée par ces index
2. Les axes neuroendocriniens en jeu
3. La cohérence fonctionnelle globale du terrain

Sois pédagogique et accessible. Pas de diagnostic médical.
      `.trim();

      // Utiliser le RAG client existant
      const { queryVectorStore } = await import("@/lib/chatbot/ragClient");
      const chunks = await queryVectorStore(ragQuery, 3);

      if (chunks.length === 0) {
        throw new Error("Aucune réponse du vector store");
      }

      // Combiner les chunks
      const ragText = chunks.map((c) => c.text).join("\n\n");
      setRagContent(ragText);
    } catch (err: any) {
      console.error("Erreur RAG:", err);
      setRagError(
        "Lecture endobiogénique indisponible : " + (err.message || "Erreur")
      );
    } finally {
      setRagLoading(false);
    }
  }

  const chatSelectValue = useMemo(() => chatId ?? "", [chatId]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1>💬 Chat RAG - Endobiogénie</h1>
            <p className="muted">
              Posez vos questions. Les réponses s'appuient sur vos volumes
              indexés.
            </p>
            {availableChats.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <label htmlFor="chat-history-select" className="muted">
                  Conversations enregistrées :
                </label>
                <select
                  id="chat-history-select"
                  value={chatSelectValue}
                  onChange={handleChatSelection}
                  disabled={loading || historyLoading}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    minWidth: "240px",
                  }}
                >
                  <option value="">Nouvelle conversation</option>
                  {availableChats.map((chat) => (
                    <option key={chat.id} value={chat.id}>
                      {chat.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={startNewConversation}
                  disabled={loading}
                  className="btn btn-ghost"
                >
                  + Réinitialiser
                </button>
              </div>
            )}
            {chatTitle && (
              <p className="muted" style={{ marginTop: "8px", fontSize: "0.9rem" }}>
                Conversation : {chatTitle}
              </p>
            )}
          </div>

          {/* Bouton BdF global */}
          <button
            onClick={() => lastAnalysis && setIsDrawerOpen(true)}
            disabled={!lastAnalysis}
            style={{
              padding: "10px 20px",
              background: lastAnalysis
                ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                : "#e5e7eb",
              color: lastAnalysis ? "white" : "#9ca3af",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: lastAnalysis ? "pointer" : "not-allowed",
              transition: "all 0.3s",
              boxShadow: lastAnalysis
                ? "0 4px 12px rgba(37, 99, 235, 0.3)"
                : "none",
            }}
            title={
              lastAnalysis
                ? "Ouvrir la dernière analyse BdF"
                : "Aucune analyse BdF disponible"
            }
          >
            🔬 Ouvrir l'analyse BdF
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {historyLoading ? (
          <div className="chat-empty">
            <span style={{ fontSize: "32px" }}>⏳</span>
            <p className="muted">Chargement de vos conversations…</p>
          </div>
        ) : !hasMessages ? (
          <div className="chat-empty">
            <span style={{ fontSize: "48px" }}>🌿</span>
            <p className="muted">
              Commencez une conversation en posant une question
            </p>
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
              <div key={idx}>
                <div className={`message message-${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === "user"
                      ? "👤"
                      : msg.role === "system"
                      ? "ℹ️"
                      : "🤖"}
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

                {/* Carte suggestion BdF */}
                {msg.bdfSuggestion && (
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                      border: "2px solid #3b82f6",
                      borderRadius: "12px",
                      padding: "20px",
                      margin: "16px 0 16px 60px",
                      maxWidth: "600px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: "#1e3a8a",
                        marginBottom: "8px",
                      }}
                    >
                      💊 Valeurs biologiques détectées
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#1e40af",
                        marginBottom: "16px",
                      }}
                    >
                      {msg.bdfSuggestion.formatted}
                    </div>
                    <button
                      onClick={() =>
                        handleLaunchBdfAnalysis(msg.bdfSuggestion!.values)
                      }
                      disabled={bdfAnalyzing}
                      style={{
                        padding: "12px 24px",
                        background: bdfAnalyzing
                          ? "#9ca3af"
                          : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        cursor: bdfAnalyzing ? "not-allowed" : "pointer",
                        boxShadow: bdfAnalyzing
                          ? "none"
                          : "0 4px 12px rgba(59, 130, 246, 0.3)",
                      }}
                    >
                      {bdfAnalyzing
                        ? "⏳ Analyse en cours..."
                        : "🔬 Lancer l'analyse BdF"}
                    </button>
                  </div>
                )}
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
          placeholder="Ex. Explique la dynamique αΣ ↔ βΣ ↔ πΣ ou GR: 4.5, GB: 6, TSH: 2.1…"
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
      <BdfResultDrawer
        analysis={lastAnalysis}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setRagContent(null);
          setRagError(null);
        }}
        onRequestRag={handleRequestRag}
        ragContent={ragContent}
        ragLoading={ragLoading}
        ragError={ragError}
      />
    </div>
  );
}
