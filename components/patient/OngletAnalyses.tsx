"use client";

import { useState } from "react";

export function OngletAnalyses({ patient }: { patient: any }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);

  // Fonction pour obtenir les couleurs d'un index BdF
  const getIndexColor = (value: number) => {
    if (value < 0.8)
      return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" }; // Jaune (hypo)
    if (value > 1.2)
      return { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" }; // Rouge (hyper)
    return { bg: "#d1fae5", border: "#10b981", text: "#065f46" }; // Vert (normal)
  };

  // Si aucune analyse sélectionnée, afficher la liste
  if (!selectedAnalysis) {
    if (!patient.bdfAnalyses || patient.bdfAnalyses.length === 0) {
      return (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧬</div>
          <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            Aucune analyse BdF
          </div>
          <div style={{ fontSize: "14px" }}>
            Les analyses BdF du patient apparaîtront ici
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "16px",
          }}
        >
          🧬 Historique des analyses BdF ({patient.bdfAnalyses.length})
        </h2>
        <div
          style={{
            overflowX: "auto",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
            }}
          >
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Résumé
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Axes dominants
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {patient.bdfAnalyses.map((analysis: any, idx: number) => (
                <tr
                  key={analysis.id}
                  style={{
                    background: idx % 2 === 0 ? "white" : "#fafafa",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      color: "#374151",
                      borderBottom: "1px solid #f3f4f6",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(analysis.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      color: "#374151",
                      borderBottom: "1px solid #f3f4f6",
                      maxWidth: "400px",
                    }}
                  >
                    {analysis.summary.split("\n")[0].substring(0, 120)}
                    {analysis.summary.split("\n")[0].length > 120 && "..."}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      color: "#374151",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {analysis.axes && Array.isArray(analysis.axes) && analysis.axes.length > 0 ? (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {analysis.axes.slice(0, 2).map((axe: string, i: number) => (
                          <span
                            key={i}
                            style={{
                              padding: "4px 8px",
                              background: "#eff6ff",
                              color: "#1e40af",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {axe}
                          </span>
                        ))}
                        {analysis.axes.length > 2 && (
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            +{analysis.axes.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>—</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f3f4f6",
                      textAlign: "right",
                    }}
                  >
                    <button
                      onClick={() => setSelectedAnalysis(analysis)}
                      style={{
                        padding: "8px 16px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Voir le détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Vue détaillée d'une analyse
  return (
    <div>
      {/* Bouton retour */}
      <button
        onClick={() => setSelectedAnalysis(null)}
        style={{
          padding: "10px 20px",
          background: "#f3f4f6",
          color: "#374151",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "24px",
        }}
      >
        ← Retour à la liste
      </button>

      {/* Date de l'analyse */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "8px",
          }}
        >
          🧬 Analyse BdF
        </h2>
        <div style={{ fontSize: "16px", color: "#6b7280" }}>
          {new Date(selectedAnalysis.date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Grille des 8 index */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {selectedAnalysis.indexes.map((index: any, idx: number) => {
          const color = getIndexColor(index.value);
          return (
            <div
              key={idx}
              style={{
                padding: "20px",
                background: color.bg,
                border: `2px solid ${color.border}`,
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: color.text,
                  marginBottom: "12px",
                }}
              >
                {index.name}
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: color.text,
                  marginBottom: "12px",
                }}
              >
                {index.value.toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: color.text,
                  opacity: 0.85,
                }}
              >
                {index.comment}
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé */}
      <div
        style={{
          padding: "24px",
          background: "#f9fafb",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "12px",
          }}
        >
          📝 Résumé de l'analyse
        </div>
        <div
          style={{
            fontSize: "15px",
            color: "#4b5563",
            whiteSpace: "pre-line",
            lineHeight: "1.6",
          }}
        >
          {selectedAnalysis.summary}
        </div>
      </div>

      {/* Axes dominants */}
      {selectedAnalysis.axes && Array.isArray(selectedAnalysis.axes) && selectedAnalysis.axes.length > 0 && (
        <div
          style={{
            padding: "24px",
            background: "#eff6ff",
            borderRadius: "12px",
            border: "1px solid #93c5fd",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e40af",
              marginBottom: "12px",
            }}
          >
            🎯 Axes dominants
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {selectedAnalysis.axes.map((axe: string, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: "10px 16px",
                  background: "white",
                  color: "#1e40af",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "500",
                  border: "1px solid #93c5fd",
                }}
              >
                {axe}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Texte RAG optionnel */}
      {selectedAnalysis.ragText && selectedAnalysis.ragText.trim() !== "" && (
        <div
          style={{
            padding: "24px",
            background: "#fefce8",
            borderRadius: "12px",
            border: "1px solid #fcd34d",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#92400e",
              marginBottom: "12px",
            }}
          >
            📚 Contexte RAG
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#78350f",
              whiteSpace: "pre-line",
              lineHeight: "1.6",
            }}
          >
            {selectedAnalysis.ragText}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => alert("Fonction à implémenter : Export PDF")}
          style={{
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          📄 Exporter en PDF
        </button>
        <button
          onClick={() => alert("Fonction à implémenter : Comparer avec analyse précédente")}
          style={{
            padding: "12px 24px",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          📊 Comparer
        </button>
      </div>
    </div>
  );
}
