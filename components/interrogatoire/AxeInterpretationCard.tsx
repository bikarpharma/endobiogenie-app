"use client";

import { AxeInterpretation, AXE_LABELS, AXE_EMOJIS } from "@/lib/interrogatoire/axeInterpretation";

interface AxeInterpretationCardProps {
  interpretation: AxeInterpretation;
}

/**
 * Carte d'affichage d'une interprétation d'axe clinique
 */
export function AxeInterpretationCard({ interpretation }: AxeInterpretationCardProps) {
  const axeLabel = AXE_LABELS[interpretation.axe] || interpretation.axe;
  const axeEmoji = AXE_EMOJIS[interpretation.axe] || "📊";

  // Couleur du badge de confiance
  const getConfianceColor = (confiance: number): string => {
    if (confiance >= 0.8) return "#059669"; // Vert
    if (confiance >= 0.6) return "#d97706"; // Orange
    return "#dc2626"; // Rouge
  };

  return (
    <div
      style={{
        background: "#f0fdf4",
        border: "2px solid #86efac",
        borderRadius: "12px",
        padding: "24px",
        marginTop: "16px",
      }}
    >
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
        <div>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#065f46", marginBottom: "4px" }}>
            {axeEmoji} Interprétation : {axeLabel}
          </h4>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Généré le {new Date(interpretation.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div
          style={{
            padding: "6px 12px",
            background: getConfianceColor(interpretation.confiance),
            color: "white",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: "600",
          }}
        >
          Confiance : {Math.round(interpretation.confiance * 100)}%
        </div>
      </div>

      {/* Orientation */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#047857",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          🎯 Orientation physiologique
        </div>
        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #d1fae5",
            fontSize: "1rem",
            lineHeight: "1.6",
            color: "#1f2937",
          }}
        >
          {interpretation.orientation}
        </div>
      </div>

      {/* Mécanismes */}
      {interpretation.mecanismes.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#047857",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            ⚙️ Mécanismes physiopathologiques
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.8" }}>
            {interpretation.mecanismes.map((mecanisme, idx) => (
              <li key={idx} style={{ color: "#374151", marginBottom: "6px" }}>
                {mecanisme}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prudences */}
      {interpretation.prudences.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#b45309",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            ⚠️ Points de vigilance
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.8" }}>
            {interpretation.prudences.map((prudence, idx) => (
              <li key={idx} style={{ color: "#374151", marginBottom: "6px" }}>
                {prudence}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modulateurs */}
      {interpretation.modulateurs.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#047857",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            💊 Modulateurs génériques adaptés
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {interpretation.modulateurs.map((modulateur, idx) => (
              <div
                key={idx}
                style={{
                  background: "white",
                  border: "1px solid #86efac",
                  borderRadius: "6px",
                  padding: "8px 14px",
                  fontSize: "0.9rem",
                  color: "#065f46",
                }}
              >
                {modulateur}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résumé clinique */}
      <div
        style={{
          background: "white",
          border: "1px solid #d1fae5",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#047857",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          📝 Synthèse clinique
        </div>
        <div style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#374151" }}>
          {interpretation.resumeClinique}
        </div>
      </div>
    </div>
  );
}
