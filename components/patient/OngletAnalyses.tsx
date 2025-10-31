"use client";

import { useState } from "react";

type BdfIndex = {
  name: string;
  value: number | null;
  comment: string;
};

export function OngletAnalyses({ patient }: { patient: any }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);

  if (patient.bdfAnalyses.length === 0) {
    return (
      <div
        style={{
          background: "#f9fafb",
          padding: "48px",
          borderRadius: "12px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <p style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
          Aucune analyse BdF enregistrée
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Les analyses BdF apparaîtront ici une fois créées
        </p>
      </div>
    );
  }

  return (
    <div>
      {!selectedAnalysis ? (
        <>
          {/* Table des analyses */}
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            📊 Historique des analyses BdF
          </h3>

          <div
            style={{
              background: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            {/* En-tête tableau */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr 200px",
                padding: "12px 16px",
                background: "#f9fafb",
                borderBottom: "2px solid #e5e7eb",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
              }}
            >
              <div>Date</div>
              <div>Résumé</div>
              <div>Actions</div>
            </div>

            {/* Lignes */}
            {patient.bdfAnalyses.map((analysis: any) => {
              const indexes = analysis.indexes as BdfIndex[];
              const firstLine = analysis.summary.split("\n")[0];

              return (
                <div
                  key={analysis.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr 200px",
                    padding: "16px",
                    borderBottom: "1px solid #e5e7eb",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#1f2937" }}>
                    {new Date(analysis.date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#4b5563",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {firstLine.substring(0, 100)}
                    {firstLine.length > 100 ? "..." : ""}
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectedAnalysis(analysis)}
                      style={{
                        padding: "8px 16px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Voir le détail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Détail d'une analyse */}
          <div style={{ marginBottom: "24px" }}>
            <button
              onClick={() => setSelectedAnalysis(null)}
              style={{
                padding: "8px 16px",
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Retour à la liste
            </button>
          </div>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "8px",
            }}
          >
            Analyse du{" "}
            {new Date(selectedAnalysis.date).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {/* Valeurs biologiques */}
          <div style={{ marginBottom: "32px" }}>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "12px",
              }}
            >
              📋 Valeurs biologiques saisies
            </h4>
            <div
              style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              {Object.entries(selectedAnalysis.inputs as Record<string, number>)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}
            </div>
          </div>

          {/* Index BdF */}
          <div style={{ marginBottom: "32px" }}>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "12px",
              }}
            >
              📊 Index BdF calculés
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {(selectedAnalysis.indexes as BdfIndex[]).map((index, idx) => {
                const colors: Record<string, { bg: string; border: string; text: string }> = {
                  "Index génital": { bg: "#fef3c7", border: "#fbbf24", text: "#78350f" },
                  "Index thyroïdien": { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
                  "g/T": { bg: "#fce7f3", border: "#ec4899", text: "#9f1239" },
                  "Index adaptation": { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
                  "Index œstrogénique": { bg: "#e0e7ff", border: "#6366f1", text: "#3730a3" },
                  Turnover: { bg: "#fef3c7", border: "#eab308", text: "#854d0e" },
                  "Rendement thyroïdien": { bg: "#ccfbf1", border: "#14b8a6", text: "#115e59" },
                  "Remodelage osseux": { bg: "#fed7aa", border: "#f97316", text: "#9a3412" },
                };

                const color = colors[index.name] || {
                  bg: "#f3f4f6",
                  border: "#9ca3af",
                  text: "#374151",
                };

                return (
                  <div
                    key={idx}
                    style={{
                      background: color.bg,
                      padding: "16px",
                      borderRadius: "10px",
                      border: `2px solid ${color.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        fontWeight: "700",
                        color: color.text,
                        marginBottom: "8px",
                      }}
                    >
                      {index.name}
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: color.text,
                        marginBottom: "4px",
                      }}
                    >
                      {index.value !== null ? index.value.toFixed(2) : "N/A"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: color.text, lineHeight: "1.3" }}>
                      {index.comment}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Résumé fonctionnel */}
          <div style={{ marginBottom: "32px" }}>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "12px",
              }}
            >
              🔬 Résumé fonctionnel
            </h4>
            <div
              style={{
                background: "#f0f9ff",
                padding: "20px",
                borderRadius: "10px",
                border: "2px solid #0ea5e9",
                fontSize: "0.9rem",
                color: "#0c4a6e",
                lineHeight: "1.8",
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedAnalysis.summary}
            </div>
          </div>

          {/* Axes sollicités */}
          {selectedAnalysis.axes &&
            Array.isArray(selectedAnalysis.axes) &&
            selectedAnalysis.axes.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "12px",
                  }}
                >
                  ⚙️ Axes sollicités
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedAnalysis.axes.map((axe: string, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: "#fef3c7",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid #fbbf24",
                        fontSize: "0.85rem",
                        color: "#78350f",
                        fontWeight: "500",
                      }}
                    >
                      {axe}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Lecture endobiogénique */}
          {selectedAnalysis.ragText && (
            <div style={{ marginBottom: "32px" }}>
              <h4
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "12px",
                }}
              >
                🧠 Lecture endobiogénique du terrain
              </h4>
              <div
                style={{
                  background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                  border: "2px solid #667eea",
                  borderRadius: "12px",
                  padding: "20px",
                  fontSize: "0.9rem",
                  color: "#1f2937",
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedAnalysis.ragText}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}