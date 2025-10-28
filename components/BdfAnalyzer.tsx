"use client";

import { useState } from "react";

interface BdfAnalyzerProps {
  userId: string;
}

export function BdfAnalyzer({ userId }: BdfAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [enrichedResult, setEnrichedResult] = useState<string | null>(null);
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

  // Soumettre l'analyse ENRICHIE avec RAG
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEnrichedResult(null);

    try {
      // Construire un message texte à partir des valeurs du formulaire
      const messageParts: string[] = [];
      for (const [key, value] of Object.entries(formData)) {
        if (value.trim() !== "") {
          messageParts.push(`${key} ${value}`);
        }
      }

      const message = messageParts.join(" ");

      if (message.trim() === "") {
        throw new Error("Veuillez renseigner au moins une valeur biologique");
      }

      // Appeler l'API chatbot enrichie (avec RAG)
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'analyse");
      }

      const data = await res.json();

      // Vérifier que c'est bien une analyse BdF
      if (data.mode === "BDF_ANALYSE") {
        setEnrichedResult(data.reply);
      } else {
        throw new Error("Le message n'a pas été reconnu comme une analyse BdF");
      }
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
    setEnrichedResult(null);
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
          🔬 Analyse Biologie des Fonctions (BdF) - ENRICHIE
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Globules */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Globules
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
                  placeholder="ex: 6.5"
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

          {/* Formule leucocytaire */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "12px",
                color: "#1f2937",
                fontWeight: "600",
              }}
            >
              Formule leucocytaire
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
                  placeholder="ex: 15.0"
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
                  placeholder="ex: 50"
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
              {loading ? "Analyse en cours..." : "Analyser avec RAG"}
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

      {/* Résultats ENRICHIS */}
      {enrichedResult && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.8",
              fontSize: "0.95rem",
              color: "#1f2937",
            }}
          >
            {enrichedResult}
          </div>
        </div>
      )}
    </div>
  );
}
