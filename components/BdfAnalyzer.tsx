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

  // État pour le contexte RAG enrichi (chargé séparément)
  const [loadingRag, setLoadingRag] = useState(false);
  const [ragContext, setRagContext] = useState<string | null>(null);
  const [ragError, setRagError] = useState<string | null>(null);

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

  // Soumettre l'analyse BdF (rapide)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setRagContext(null); // Reset RAG context
    setRagError(null);

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

      // Appeler l'API BdF standard (rapide)
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

  // Charger le contexte RAG endobiogénie (sur demande)
  const handleLoadRagContext = async () => {
    if (!result) return;

    setLoadingRag(true);
    setRagError(null);

    try {
      // Construire un message texte à partir des valeurs du formulaire
      const messageParts: string[] = [];
      for (const [key, value] of Object.entries(formData)) {
        if (value.trim() !== "") {
          messageParts.push(`${key} ${value}`);
        }
      }

      const message = messageParts.join(" ");
      console.log("🔍 Appel API chatbot avec message:", message);

      // Appeler l'API chatbot enrichie (avec RAG) avec un timeout de 40 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000);

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMessage = `Erreur HTTP ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Impossible de parser l'erreur JSON
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log("✅ Réponse API chatbot:", data);

      if (data.mode === "BDF_ANALYSE") {
        // Extraire seulement la section "Lecture endobiogénique"
        const reply = data.reply;
        const ragSection = extractRagSection(reply);
        console.log("✅ Section RAG extraite (longueur):", ragSection.length);
        setRagContext(ragSection);
      } else {
        throw new Error(`Mode inattendu: ${data.mode}`);
      }
    } catch (err: any) {
      console.error("❌ Erreur RAG complète:", err);

      if (err.name === 'AbortError') {
        setRagError("Timeout: Le chargement du contexte prend trop de temps. Veuillez réessayer.");
      } else {
        setRagError(err.message || "Erreur inconnue lors du chargement du contexte");
      }
    } finally {
      setLoadingRag(false);
    }
  };

  // Extraire la section "Lecture endobiogénique" de la réponse complète
  const extractRagSection = (fullReply: string): string => {
    const ragMarker = "🧠 Lecture endobiogénique du terrain";
    const noteMarker = "🧾 Note technique";

    const ragStart = fullReply.indexOf(ragMarker);
    const noteStart = fullReply.indexOf(noteMarker, ragStart);

    if (ragStart === -1) {
      return "Contexte endobiogénique non disponible.";
    }

    if (noteStart === -1) {
      return fullReply.substring(ragStart);
    }

    return fullReply.substring(ragStart, noteStart).trim();
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
    setRagContext(null);
    setRagError(null);
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
          🔬 Analyse Biologie des Fonctions (BdF)
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

      {/* Résultats BdF standards */}
      {result && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            marginBottom: "24px",
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
              📊 Lecture des index
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
              🔬 Résumé fonctionnel
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
              ⚙️ Axes sollicités
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

          {/* Bouton pour charger le contexte RAG */}
          {!ragContext && (
            <div style={{ marginBottom: "24px" }}>
              <button
                onClick={handleLoadRagContext}
                disabled={loadingRag}
                style={{
                  padding: "14px 28px",
                  background: loadingRag
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: loadingRag ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                  boxShadow: loadingRag
                    ? "none"
                    : "0 4px 15px rgba(102, 126, 234, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
                onMouseEnter={(e) => {
                  if (!loadingRag) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(102, 126, 234, 0.6)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingRag) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 15px rgba(102, 126, 234, 0.4)";
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
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                    Chargement du contexte endobiogénique...
                  </>
                ) : (
                  <>
                    🧠 Obtenir la lecture endobiogénique du terrain
                  </>
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
                }}
              >
                💡 Cliquez pour approfondir l'analyse avec le contexte
                endobiogénique depuis notre base de connaissances
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
              }}
            >
              <div style={{ color: "#dc2626", fontSize: "1rem", fontWeight: "700", marginBottom: "8px" }}>
                ⚠️ Erreur lors du chargement du contexte RAG
              </div>
              <div style={{ color: "#7f1d1d", fontSize: "0.9rem", marginBottom: "12px" }}>
                {ragError}
              </div>
              <div style={{ color: "#991b1b", fontSize: "0.85rem", lineHeight: "1.6" }}>
                <strong>Suggestions:</strong>
                <ul style={{ marginTop: "8px", marginBottom: "0", paddingLeft: "20px" }}>
                  <li>Vérifiez que votre clé OPENAI_API_KEY est configurée dans .env.local</li>
                  <li>Vérifiez que vous avez des crédits disponibles sur votre compte OpenAI</li>
                  <li>Vérifiez votre connexion internet</li>
                  <li>Consultez les logs du serveur dans le terminal pour plus de détails</li>
                  <li>Réessayez dans quelques secondes</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setRagError(null);
                  handleLoadRagContext();
                }}
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Contexte RAG (affiché après le clic) */}
          {ragContext && (
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                  border: "2px solid #667eea",
                  borderRadius: "12px",
                  padding: "20px",
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
                  {ragContext}
                </div>
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
            🧾 {result.noteTechnique}
          </div>
        </div>
      )}
    </div>
  );
}
