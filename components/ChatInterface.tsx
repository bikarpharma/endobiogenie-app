// ========================================
// CHAT INTERFACE - STYLE CHATGPT MINIMALISTE
// ========================================
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// ============== TYPES ==============
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

interface ChatInterfaceProps {
  useFalkorDB?: boolean;
}

// ============== COMPOSANT PRINCIPAL ==============
export function ChatInterface({ useFalkorDB = false }: ChatInterfaceProps) {
  // États
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [useFalkor, setUseFalkor] = useState(useFalkorDB);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Conversation active
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Auto-scroll aux nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConversationId]);

  // Créer nouvelle conversation
  const createNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: "Nouvelle conversation",
      messages: [],
      createdAt: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setError("");
  }, []);

  // Supprimer une conversation
  const deleteConversation = useCallback((convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversationId === convId) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  // Envoyer un message
  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    // Créer une conversation si aucune active
    let convId = activeConversationId;
    if (!convId) {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        title: msg.slice(0, 30) + (msg.length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
      };
      setConversations(prev => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConversationId(convId);
    }

    // Ajouter message utilisateur
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              title: c.messages.length === 0 ? msg.slice(0, 30) + (msg.length > 30 ? "..." : "") : c.title,
            }
          : c
      )
    );

    setInput("");
    setLoading(true);
    setError("");

    try {
      const endpoint = useFalkor ? "/api/chat/falkor" : "/api/chat";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erreur serveur");
      }

      const reply = (data.reply ?? "").trim();
      if (!reply) {
        throw new Error("Réponse vide");
      }

      // Ajouter réponse assistant
      const assistantMsg: Message = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      );
    } catch (e: any) {
      setError(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // Gérer Enter pour envoyer
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      {/* ============== SIDEBAR ============== */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Header Sidebar */}
        <div className="p-3 border-b border-slate-700">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 transition-colors text-sm"
          >
            <span>+</span>
            <span>Nouvelle conversation</span>
          </button>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto py-2">
          {conversations.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-4">
              Aucune conversation
            </p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`group flex items-center mx-2 mb-1 rounded-lg cursor-pointer ${
                  activeConversationId === conv.id
                    ? "bg-slate-700"
                    : "hover:bg-slate-800"
                }`}
              >
                <button
                  onClick={() => setActiveConversationId(conv.id)}
                  className="flex-1 text-left px-3 py-2 text-sm truncate"
                >
                  💬 {conv.title}
                </button>
                <button
                  onClick={() => deleteConversation(conv.id)}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 text-slate-400 hover:text-red-400 transition-opacity"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Toggle FalkorDB */}
        <div className="p-3 border-t border-slate-700">
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <div className="relative">
              <input
                type="checkbox"
                checked={useFalkor}
                onChange={(e) => setUseFalkor(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-8 h-4 rounded-full transition-colors ${useFalkor ? "bg-indigo-500" : "bg-slate-600"}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${useFalkor ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </div>
            <span className={useFalkor ? "text-indigo-400" : "text-slate-400"}>
              FalkorDB
            </span>
          </label>
        </div>
      </aside>

      {/* ============== ZONE PRINCIPALE ============== */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toggle Sidebar (mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-20 left-2 z-10 p-2 bg-slate-100 rounded-lg hover:bg-slate-200 md:hidden"
        >
          ☰
        </button>

        {/* Zone Messages */}
        <div className="flex-1 overflow-y-auto">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            /* ===== ÉCRAN D'ACCUEIL ===== */
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="text-5xl mb-4">🌿</div>
              <h2 className="text-xl font-medium text-slate-700 mb-2">
                IntegrIA Chat
              </h2>
              <p className="text-slate-500 text-sm text-center max-w-md mb-6">
                Assistant endobiogénique intelligent. Posez vos questions sur la phytothérapie, gemmothérapie, aromathérapie et biologie des fonctions.
              </p>

              {/* Suggestions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl w-full">
                {[
                  "Explique la relation αΣ / βΣ / πΣ",
                  "Cassis : axes sollicités ?",
                  "Drainage en terrain congestif",
                  "Différence TM / EPS / MG",
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="p-3 text-left text-sm border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    <span className="text-slate-400 mr-2">→</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ===== MESSAGES ===== */
            <div className="max-w-3xl mx-auto py-4 px-4">
              {activeConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 ${msg.role === "user" ? "text-right" : ""}`}
                >
                  {/* Bulle message */}
                  <div
                    className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-slate-100 text-slate-800 rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Indicateur de chargement */}
              {loading && (
                <div className="mb-4">
                  <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-md bg-slate-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ===== ERREUR ===== */}
        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ❌ {error}
          </div>
        )}

        {/* ===== ZONE INPUT ===== */}
        <div className="border-t bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                disabled={loading}
                rows={1}
                className="flex-1 bg-transparent px-4 py-3 resize-none focus:outline-none text-slate-700 placeholder-slate-400 max-h-32"
                style={{ minHeight: "48px" }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`m-2 p-2 rounded-xl transition-colors ${
                  input.trim() && !loading
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              Appuyez sur Entrée pour envoyer • Shift+Entrée pour nouvelle ligne
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
