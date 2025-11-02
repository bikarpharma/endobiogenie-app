"use client";

import type { BdfIndex } from "@/types/bdf";

interface BdfIndexGridProps {
  indexes: BdfIndex[];
}

// Couleurs pour chaque index (dans l'ordre des 8 index)
const INDEX_COLORS = [
  {
    // Index génital
    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    border: "#fbbf24",
    titleColor: "#92400e",
    valueColor: "#78350f",
    noteColor: "#92400e",
  },
  {
    // Index thyroïdien
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    border: "#3b82f6",
    titleColor: "#1e3a8a",
    valueColor: "#1e40af",
    noteColor: "#1e3a8a",
  },
  {
    // g/T
    background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
    border: "#ec4899",
    titleColor: "#831843",
    valueColor: "#9f1239",
    noteColor: "#831843",
  },
  {
    // Index adaptation
    background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    border: "#10b981",
    titleColor: "#064e3b",
    valueColor: "#065f46",
    noteColor: "#064e3b",
  },
  {
    // Index œstrogénique
    background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
    border: "#6366f1",
    titleColor: "#312e81",
    valueColor: "#3730a3",
    noteColor: "#312e81",
  },
  {
    // Turnover
    background: "linear-gradient(135deg, #fef3c7 0%, #fde047 100%)",
    border: "#eab308",
    titleColor: "#713f12",
    valueColor: "#854d0e",
    noteColor: "#713f12",
  },
  {
    // Rendement thyroïdien
    background: "linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)",
    border: "#14b8a6",
    titleColor: "#134e4a",
    valueColor: "#115e59",
    noteColor: "#134e4a",
  },
  {
    // Remodelage osseux
    background: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
    border: "#f97316",
    titleColor: "#7c2d12",
    valueColor: "#9a3412",
    noteColor: "#7c2d12",
  },
];

export function BdfIndexGrid({ indexes }: BdfIndexGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
      }}
    >
      {indexes.map((index, i) => {
        const colors = INDEX_COLORS[i] || INDEX_COLORS[0];

        return (
          <div
            key={index.key}
            style={{
              background: colors.background,
              padding: "20px",
              borderRadius: "12px",
              border: `2px solid ${colors.border}`,
            }}
          >
            {/* Titre */}
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                fontWeight: "700",
                color: colors.titleColor,
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              {index.label}
            </div>

            {/* Valeur */}
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "700",
                color: colors.valueColor,
                marginBottom: "8px",
              }}
            >
              {index.status === "ok" && index.value !== undefined
                ? index.value.toFixed(2)
                : "N/A"}
              {index.unit && index.status === "ok" && (
                <span style={{ fontSize: "1rem", marginLeft: "4px" }}>
                  {index.unit}
                </span>
              )}
            </div>

            {/* Note interprétative */}
            <div
              style={{
                fontSize: "0.85rem",
                color: colors.noteColor,
                lineHeight: "1.4",
              }}
            >
              {index.note || "Aucune interprétation"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
