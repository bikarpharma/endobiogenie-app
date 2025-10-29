"use client";

import { useState } from "react";
import type { BdfResultDrawerProps } from "@/types/bdf";
import { BdfIndexGrid } from "./BdfIndexGrid";

export function BdfResultDrawer({
  analysis,
  isOpen,
  onClose,
  onRequestRag,
}: BdfResultDrawerProps) {
  const [loadingRag, setLoadingRag] = useState(false);
  const [ragContent, setRagContent] = useState<string | null>(null);
  const [ragError, setRagError] = useState<string | null>(null);

  if (!isOpen || !analysis) return null;

  const handleRequestRag = async () => {
    if (!onRequestRag || !analysis) return;

    setLoadingRag(true);
    setRagError(null);

    try {
      await onRequestRag(analysis);
      // Le contenu RAG sera géré par le parent via une callback ou un état partagé
      // Pour l'instant, on simule un chargement
      setRagContent("Lecture endobiogénique chargée");
    } catch (error: any) {
      setRagError(error.message || "Erreur lors du chargement");
    } finally {
      setLoadingRag(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(90vw, 1200px)",
          background: "white",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.15)",
          zIndex: 9999,
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "2px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f9fafb",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#2563eb",
              margin: 0,
            }}
          >
            🔬 Analyse Biologie des Fonctions (BdF)
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#e5e7eb",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              color: "#374151",
            }}
          >
            ✕ Fermer
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          {/* Valeurs biologiques analysées */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              📋 Valeurs biologiques analysées
            </h3>
            <div
              style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: "#4b5563",
                lineHeight: "1.6",
              }}
            >
              {Object.entries(analysis.inputs)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ") || "Aucune valeur fournie"}
            </div>
          </div>

          {/* Grille des 8 index */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "16px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              📊 Lecture des index
            </h3>
            <BdfIndexGrid indexes={analysis.indexes} />
          </div>

          {/* Résumé fonctionnel */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              🔬 Résumé fonctionnel
            </h3>
            <div
              style={{
                background: "#f0f9ff",
                padding: "20px",
                borderRadius: "10px",
                border: "2px solid #0ea5e9",
                fontSize: "0.95rem",
                color: "#0c4a6e",
                lineHeight: "1.8",
              }}
            >
              {analysis.summary}
            </div>
          </div>

          {/* Axes sollicités */}
          {analysis.axes.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "12px",
                  color: "#1f2937",
                  fontWeight: "600",
                }}
              >
                ⚙️ Axes sollicités
              </h3>
              <ul
                style={{
                  background: "#fef3c7",
                  padding: "20px 20px 20px 48px",
                  borderRadius: "10px",
                  border: "2px solid #fbbf24",
                  fontSize: "0.95rem",
                  color: "#78350f",
                  lineHeight: "2",
                  listStyle: "disc",
                  margin: 0,
                }}
              >
                {analysis.axes.map((axe, idx) => (
                  <li key={idx}>{axe}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bouton RAG */}
          {onRequestRag && !ragContent && (
            <div style={{ marginBottom: "24px" }}>
              <button
                onClick={handleRequestRag}
                disabled={loadingRag}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  background: loadingRag
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: loadingRag ? "not-allowed" : "pointer",
                  boxShadow: loadingRag
                    ? "none"
                    : "0 4px 15px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                {loadingRag ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "16px",
                        height: "16px",
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                    Chargement du contexte endobiogénique...
                  </>
                ) : (
                  <>🧠 Obtenir la lecture endobiogénique du terrain</>
                )}
              </button>
              <style jsx>{`
                @keyframes spin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  marginTop: "8px",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                💡 Cliquez pour approfondir l'analyse avec le contexte
                endobiogénique
              </p>
            </div>
          )}

          {/* Erreur RAG */}
          {ragError && (
            <div
              style={{
                background: "#fee2e2",
                border: "2px solid #dc2626",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "24px",
                color: "#dc2626",
              }}
            >
              <strong>⚠️ Erreur:</strong> {ragError}
            </div>
          )}

          {/* Contenu RAG */}
          {ragContent && (
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                  border: "2px solid #667eea",
                  borderRadius: "12px",
                  padding: "24px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                }}
              >
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "#667eea",
                    marginBottom: "16px",
                  }}
                >
                  🧠 Lecture endobiogénique du terrain
                </div>
                <div style={{ color: "#1f2937", fontSize: "0.95rem" }}>
                  {ragContent}
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div
            style={{
              background: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "0.85rem",
              color: "#6b7280",
              fontStyle: "italic",
              lineHeight: "1.6",
            }}
          >
            <strong style={{ color: "#374151" }}>
              ⚠️ Analyse fonctionnelle du terrain selon la Biologie des
              Fonctions.
            </strong>{" "}
            À corréler au contexte clinique. Ne se substitue pas à un avis
            médical.
          </div>
        </div>
      </div>
    </>
  );
}
