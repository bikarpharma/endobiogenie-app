"use client";

import { useState } from "react";

// ========================================
// TYPES
// ========================================

export interface BdfIndex {
  label: string;
  value: number | null;
  comment: string;
}

export interface BdfAnalysis {
  indexes: BdfIndex[];
  summary: string;
  axes: string[];
  noteTechnique: string;
}

export interface BdfResultDrawerProps {
  open: boolean;
  onClose: () => void;
  analysis: BdfAnalysis;
  ragText: string | null;
  loadingRag: boolean;
  onRequestRag: () => void;
}

// ========================================
// COMPOSANT DRAWER
// ========================================

export function BdfResultDrawer({
  open,
  onClose,
  analysis,
  ragText,
  loadingRag,
  onRequestRag,
}: BdfResultDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(800px, 90vw)",
          background: "white",
          boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
          overflowY: "auto",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "white",
            borderBottom: "2px solid #e5e7eb",
            padding: "24px",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#2563eb", margin: 0 }}>
              🧬 Analyse BdF
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "8px",
                lineHeight: 1,
              }}
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
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
              📋 Résumé fonctionnel
            </h3>
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde047",
                borderRadius: "8px",
                padding: "16px",
                fontSize: "0.95rem",
                lineHeight: "1.7",
                color: "#78350f",
              }}
            >
              {analysis.summary}
            </div>
          </div>

          {/* 8 Index cards */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "16px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              📊 Indices calculés
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "16px",
              }}
            >
              {analysis.indexes.map((index, i) => (
                <div
                  key={i}
                  style={{
                    background: "#f0f9ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    {index.label}
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "700",
                      color: "#2563eb",
                      marginBottom: "8px",
                    }}
                  >
                    {index.value !== null ? index.value.toFixed(2) : "N/A"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#4b5563",
                      lineHeight: "1.5",
                    }}
                  >
                    {index.comment}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Axes dominants */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              ⚙️ Axes dominants
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {analysis.axes.map((axe, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: "0.95rem",
                    color: "#4b5563",
                    marginBottom: "8px",
                    lineHeight: "1.6",
                  }}
                >
                  {axe}
                </li>
              ))}
            </ul>
          </div>

          {/* Bouton Lecture endobiogénique */}
          <div style={{ marginBottom: "32px" }}>
            <button
              onClick={onRequestRag}
              disabled={loadingRag}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: loadingRag ? "#9ca3af" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loadingRag ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (!loadingRag) {
                  e.currentTarget.style.background = "#059669";
                }
              }}
              onMouseLeave={(e) => {
                if (!loadingRag) {
                  e.currentTarget.style.background = "#10b981";
                }
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
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Analyse en cours...
                </>
              ) : (
                <>🧠 Lecture endobiogénique du terrain</>
              )}
            </button>
          </div>

          {/* Texte RAG */}
          {ragText && (
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "12px",
                  color: "#1f2937",
                  fontWeight: "600",
                }}
              >
                🧠 Lecture endobiogénique du terrain
              </h3>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "8px",
                  padding: "16px",
                  fontSize: "0.95rem",
                  lineHeight: "1.7",
                  color: "#166534",
                  whiteSpace: "pre-wrap",
                }}
              >
                {ragText}
              </div>
            </div>
          )}

          {/* Note technique */}
          <div
            style={{
              background: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "0.85rem",
              color: "#6b7280",
              fontStyle: "italic",
            }}
          >
            {analysis.noteTechnique}
          </div>
        </div>

        {/* Animations CSS */}
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </>
  );
}
