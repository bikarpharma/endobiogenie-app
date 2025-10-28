"use client";

import { useState } from "react";
import type { InterpretationPayload } from "@/lib/bdf/types";

interface BdfAnalyzerProps {
  userId: string;
}

export function BdfAnalyzer({ userId }: BdfAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterpretationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  // État pour les valeurs du formulaire
  const [formData, setFormData] = useState({
    GR: "",
    GB: "",
    neutrophiles: "",
    lymphocytes: "",
    eosinophiles: "",
    monocytes: "",
    plaquettes: "",
    LDH: "",
    CPK: "",
    TSH: "",
    osteocalcine: "",
    PAOi: "",
  });

  // Mettre à jour une valeur du formulaire
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Soumettre l'analyse
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Convertir les valeurs non vides en nombres
      const labValues: any = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value.trim() !== "") {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            labValues[key] = num;
          }
        }
      }

      const res = await fetch("/api/bdf/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(labValues),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'analyse");
      }

      const data: InterpretationPayload = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    setFormData({
      GR: "",
      GB: "",
      neutrophiles: "",
      lymphocytes: "",
      eosinophiles: "",
      monocytes: "",
      plaquettes: "",
      LDH: "",
      CPK: "",
      TSH: "",
      osteocalcine: "",
      PAOi: "",
    });
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Formulaire de saisie */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.3rem",
            marginBottom: "20px",
            color: "#2563eb",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "12px",
          }}
        >
          📊 Valeurs biologiques
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Hémogramme */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Hémogramme
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  GR (T/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.GR}
                  onChange={(e) => handleChange("GR", e.target.value)}
                  placeholder="ex: 4.5"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  GB (G/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.GB}
                  onChange={(e) => handleChange("GB", e.target.value)}
                  placeholder="ex: 7.2"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  Neutrophiles (G/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.neutrophiles}
                  onChange={(e) => handleChange("neutrophiles", e.target.value)}
                  placeholder="ex: 4.0"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  Lymphocytes (G/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lymphocytes}
                  onChange={(e) => handleChange("lymphocytes", e.target.value)}
                  placeholder="ex: 2.5"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  Éosinophiles (G/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.eosinophiles}
                  onChange={(e) => handleChange("eosinophiles", e.target.value)}
                  placeholder="ex: 0.3"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  Monocytes (G/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monocytes}
                  onChange={(e) => handleChange("monocytes", e.target.value)}
                  placeholder="ex: 0.5"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  Plaquettes (G/L)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.plaquettes}
                  onChange={(e) => handleChange("plaquettes", e.target.value)}
                  placeholder="ex: 250"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Enzymes */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Enzymes
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  LDH (UI/L)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.LDH}
                  onChange={(e) => handleChange("LDH", e.target.value)}
                  placeholder="ex: 180"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  CPK (UI/L)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.CPK}
                  onChange={(e) => handleChange("CPK", e.target.value)}
                  placeholder="ex: 100"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hormones et marqueurs */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Hormones et marqueurs
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  TSH (mUI/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.TSH}
                  onChange={(e) => handleChange("TSH", e.target.value)}
                  placeholder="ex: 2.5"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  Ostéocalcine (ng/mL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.osteocalcine}
                  onChange={(e) => handleChange("osteocalcine", e.target.value)}
                  placeholder="ex: 25"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    color: "#4b5563",
                  }}
                >
                  PAOi (UI/L)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.PAOi}
                  onChange={(e) => handleChange("PAOi", e.target.value)}
                  placeholder="ex: 45"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 32px",
                background: loading ? "#9ca3af" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#1d4ed8";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#2563eb";
                }
              }}
            >
              {loading ? "Analyse en cours..." : "Analyser"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              style={{
                padding: "12px 32px",
                background: "transparent",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>

      {/* Erreur */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
            color: "#dc2626",
          }}
        >
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* Résultats */}
      {result && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "1.3rem",
              marginBottom: "20px",
              color: "#2563eb",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "12px",
            }}
          >
            🧬 Résultats de l'analyse BdF
          </h2>

          {/* Indexes */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "16px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Indices calculés
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {Object.entries(result.indexes).map(([key, value]) => (
                <div
                  key={key}
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
                    {key
                      .replace("index", "Index ")
                      .replace("gT", "G/T")
                      .replace("turnover", "Turnover")}
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#2563eb",
                      marginBottom: "8px",
                    }}
                  >
                    {value.value !== null ? value.value.toFixed(2) : "N/A"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#4b5563",
                      lineHeight: "1.5",
                    }}
                  >
                    {value.comment}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Synthèse
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
              {result.summary}
            </div>
          </div>

          {/* Axes dominants */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Axes dominants
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {result.axesDominants.map((axe, i) => (
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
            {result.noteTechnique}
          </div>
        </div>
      )}
    </div>
  );
}
