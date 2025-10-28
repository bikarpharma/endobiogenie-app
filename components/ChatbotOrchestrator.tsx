// ========================================
// COMPOSANT CHATBOT ORCHESTRATEUR
// ========================================
// Exemple d'utilisation du chatbot orchestrateur côté frontend

"use client";

import { useState } from "react";
import type { ChatReply } from "@/lib/chatbot/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: "BDF_ANALYSE" | "ENDO_DISCUSSION";
}

export default function ChatbotOrchestrator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Envoie un message au chatbot orchestrateur
   */
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Appel à l'API /chatbot
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Erreur API");
      }

      const data: ChatReply = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
        mode: data.mode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erreur:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Une erreur s'est produite. Veuillez réessayer.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Badge de mode (BdF ou Discussion)
   */
  const ModeBadge = ({ mode }: { mode?: string }) => {
    if (!mode) return null;

    const isBdf = mode === "BDF_ANALYSE";
    const bgColor = isBdf ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
    const label = isBdf ? "🔬 Analyse BdF" : "💬 Discussion";

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${bgColor}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          🧬 Chatbot Endobiogénie
        </h1>
        <p className="text-sm text-gray-600">
          Posez vos questions sur l'endobiogénie ou fournissez vos valeurs biologiques
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-gray-50 p-4 rounded-lg">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">👋 Bonjour ! Comment puis-je vous aider ?</p>
            <p className="text-sm">
              Vous pouvez me poser des questions sur l'endobiogénie ou me donner vos valeurs biologiques à analyser.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 shadow-sm border border-gray-200"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="mb-2">
                  <ModeBadge mode={msg.mode} />
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">💭</div>
                <span>Réflexion en cours...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
          placeholder="Posez votre question ou collez vos valeurs biologiques..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "⏳" : "Envoyer"}
        </button>
      </div>

      {/* Exemples */}
      <div className="mt-4 text-xs text-gray-500">
        <p className="font-semibold mb-1">💡 Exemples de messages :</p>
        <ul className="space-y-1">
          <li>• "Qu'est-ce que l'axe thyréotrope ?"</li>
          <li>• "GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1"</li>
          <li>• "Explique-moi le terrain en endobiogénie"</li>
        </ul>
      </div>
    </div>
  );
}
