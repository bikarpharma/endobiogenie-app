"use client";

import Link from "next/link";

type BdfIndex = {
  name: string;
  value: number | null;
  comment: string;
};

export function OngletApercu({ patient }: { patient: any }) {
  const derniereBdf = patient.bdfAnalyses[0];
  const hasAllergies = patient.allergies && patient.allergies.trim() !== "";
  const hasTraitements = patient.traitements && patient.traitements.trim() !== "";

  return (
    <div>
      {/* Badges alertes */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
        {hasAllergies && (
          <div
            style={{
              padding: "8px 16px",
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              border: "1px solid #dc2626",
            }}
          >
            🔴 Allergies
          </div>
        )}
        {hasTraitements && (
          <div
            style={{
              padding: "8px 16px",
              background: "#dbeafe",
              color: "#2563eb",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              border: "1px solid #2563eb",
            }}
          >
            💊 Traitements en cours
          </div>
        )}
        {patient.tags && Array.isArray(patient.tags) && patient.tags.length > 0 && (
          <>
            {patient.tags.map((tag: string, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: "8px 16px",
                  background: "#fef3c7",
                  color: "#92400e",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  border: "1px solid #fbbf24",
                }}
              >
                🏷️ {tag}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Snapshot dernière BdF */}
      {derniereBdf ? (
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#1f2937", margin: 0 }}>
              📊 Dernière analyse BdF
            </h3>
            <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              {new Date(derniereBdf.date).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Grille des 8 index */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {(derniereBdf.indexes as BdfIndex[]).map((index, idx) => {
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

          {/* Résumé fonctionnel */}
          <div style={{ marginBottom: "24px" }}>
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
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #0ea5e9",
                fontSize: "0.9rem",
                color: "#0c4a6e",
                lineHeight: "1.7",
                whiteSpace: "pre-wrap",
              }}
            >
              {derniereBdf.summary}
            </div>
          </div>

          {/* Axes sollicités */}
          {derniereBdf.axes && Array.isArray(derniereBdf.axes) && derniereBdf.axes.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
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
                {derniereBdf.axes.map((axe: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      background: "#fef3c7",
                      padding: "6px 12px",
                      borderRadius: "6px",
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
        </div>
      ) : (
        <div
          style={{
            background: "#f9fafb",
            padding: "48px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "32px",
          }}
        >
          <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Aucune analyse BdF enregistrée</p>
          <p style={{ fontSize: "0.9rem" }}>Créez une première analyse pour ce patient</p>
        </div>
      )}

      {/* Actions rapides */}
      <div>
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "16px",
          }}
        >
          ⚡ Actions rapides
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <Link
            href="/bdf"
            style={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: "600",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            🧬 Nouvelle analyse BdF
          </Link>
          <button
            style={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
            }}
          >
            📋 Nouvelle consultation
          </button>
        </div>
      </div>
    </div>
  );
}