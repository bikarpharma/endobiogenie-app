"use client";

import { FormEvent, useState } from "react";

type ChatResponse = {
  answer?: string;
  citations?: unknown[];
  error?: string;
};

export function GemmoChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setError("Veuillez saisir une question.");
      setAnswer(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await fetch("/api/gemmo/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmedQuestion }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Une erreur est survenue lors de l'appel à l'API.");
      }

      setAnswer(data.answer ?? "Aucune réponse disponible.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
        <label htmlFor="question" style={{ fontWeight: 500, color: "#2d5016" }}>
          Posez votre question
        </label>
        <textarea
          id="question"
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "1rem",
            resize: "vertical",
          }}
          placeholder="Exemple : Quels sont les bienfaits du macérat de bourgeons de cassis ?"
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#2d5016",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
          disabled={isLoading}
        >
          {isLoading ? "Envoi..." : "Envoyer"}
        </button>
      </form>

      {error ? (
        <div style={{
          background: "#fef2f2",
          color: "#b91c1c",
          borderRadius: "8px",
          padding: "12px",
          border: "1px solid #fecaca",
        }}>
          {error}
        </div>
      ) : null}

      {answer ? (
        <div
          style={{
            background: "#f0f9e8",
            borderRadius: "8px",
            padding: "16px",
            border: "1px solid #d1e7c2",
            color: "#2d5016",
          }}
        >
          {answer}
        </div>
      ) : null}
    </div>
  );
}
