"use client";

import { useState } from "react";
import type { InterpretationPayload, RagEnrichment } from "@/lib/bdf/types";

interface BdfAnalyzerProps {
  userId: string;
}

export function BdfAnalyzer({ userId }: BdfAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterpretationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  // État pour l'enrichissement RAG (résumé, axes, lecture endobiogénique)
  const [loadingRag, setLoadingRag] = useState(false);
  const [ragEnrichment, setRagEnrichment] = useState<RagEnrichment | null>(null);
  const [ragError, setRagError] = useState<string | null>(null);

  // État pour l'accordéon "Paramètres avancés"
  const [showAdvanced, setShowAdvanced] = useState(false);

  // État pour les valeurs du formulaire
  const [formData, setFormData] = useState({
    // Globules
    GR: "",
    GB: "",
    hemoglobine: "",

    // Formule leucocytaire
    neutrophiles: "",
    lymphocytes: "",
    eosinophiles: "",
    monocytes: "",
    plaquettes: "",

    // Enzymes / Remodelage tissulaire
    LDH: "",
    CPK: "",
    PAOi: "",
    osteocalcine: "",

    // Axe endocrinien central
    TSH: "",

    // Paramètres avancés du terrain
    VS: "",
    calcium: "",
    potassium: "",
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
    setRagEnrichment(null);
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

      // Appeler l'API BdF standard (rapide - calcul des index)
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

      // Lancer l'enrichissement RAG en arrière-plan (sans bloquer l'affichage)
      loadRagEnrichment(data, labValues);
    } catch (err: any) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'enrichissement RAG (résumé, axes, lecture endobiogénique)
  const loadRagEnrichment = async (
    interpretationResult: InterpretationPayload,
    inputs: any
  ) => {
    setLoadingRag(true);
    setRagError(null);

    try {
      // Convertir les index en format tableau pour l'API
      const indexesArray = [
        { label: "Index génital", value: interpretationResult.indexes.indexGenital.value, comment: interpretationResult.indexes.indexGenital.comment },
        { label: "Index thyroïdien", value: interpretationResult.indexes.indexThyroidien.value, comment: interpretationResult.indexes.indexThyroidien.comment },
        { label: "Index génito-thyroïdien (gT)", value: interpretationResult.indexes.gT.value, comment: interpretationResult.indexes.gT.comment },
        { label: "Index d'adaptation", value: interpretationResult.indexes.indexAdaptation.value, comment: interpretationResult.indexes.indexAdaptation.comment },
        { label: "Index œstrogénique", value: interpretationResult.indexes.indexOestrogenique.value, comment: interpretationResult.indexes.indexOestrogenique.comment },
        { label: "Turnover", value: interpretationResult.indexes.turnover.value, comment: interpretationResult.indexes.turnover.comment },
        { label: "Rendement thyroïdien", value: interpretationResult.indexes.rendementThyroidien.value, comment: interpretationResult.indexes.rendementThyroidien.comment },
        { label: "Remodelage osseux", value: interpretationResult.indexes.remodelageOsseux.value, comment: interpretationResult.indexes.remodelageOsseux.comment },
      ];

      const ragRes = await fetch("/api/bdf/rag-enrichment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indexes: indexesArray,
          inputs,
        }),
      });

      if (!ragRes.ok) {
        throw new Error("Erreur lors de l'enrichissement RAG");
      }

      const ragData: RagEnrichment = await ragRes.json();
      setRagEnrichment(ragData);
    } catch (err: any) {
      console.error("Erreur RAG:", err);
      setRagError("Impossible de charger l'enrichissement endobiogénique. " + err.message);
    } finally {
      setLoadingRag(false);
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
      // Globules
      GR: "",
      GB: "",
      hemoglobine: "",

      // Formule leucocytaire
      neutrophiles: "",
      lymphocytes: "",
      eosinophiles: "",
      monocytes: "",
      plaquettes: "",

      // Enzymes / Remodelage tissulaire
      LDH: "",
      CPK: "",
      PAOi: "",
      osteocalcine: "",

      // Axe endocrinien central
      TSH: "",

      // Paramètres avancés du terrain
      VS: "",
      calcium: "",
      potassium: "",
    });
    setResult(null);
    setError(null);
    setRagContext(null);
    setRagError(null);
    setShowAdvanced(false);
  };

  // Styles communs
  const sectionStyle = { marginBottom: "32px" };
  const sectionTitleStyle = {
    fontSize: "1.05rem",
    marginBottom: "8px",
    color: "#1f2937",
    fontWeight: "600",
  };
  const sectionSubtitleStyle = {
    fontSize: "0.85rem",
    color: "#6b7280",
    marginBottom: "16px",
    fontStyle: "italic",
    lineHeight: "1.4",
  };
  const inputGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  };
  const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    marginBottom: "6px",
    color: "#4b5563",
    fontWeight: "500",
  };
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Formulaire de saisie */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "24px",
            color: "#2563eb",
            borderBottom: "3px solid #e5e7eb",
            paddingBottom: "12px",
            fontWeight: "700",
          }}
        >
          🔬 Analyse Biologie des Fonctions (BdF)
        </h2>

        <form onSubmit={handleSubmit}>
          {/* SECTION 1 - GLOBULES */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>1. Globules</h3>
            <p style={sectionSubtitleStyle}>
              Paramètres globaux d'oxygénation et de densité cellulaire du sang.
            </p>
            <div style={inputGridStyle}>
              <div>
                <label style={labelStyle}>GR (T/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.GR}
                  onChange={(e) => handleChange("GR", e.target.value)}
                  placeholder="ex: 4.5"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>GB (G/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.GB}
                  onChange={(e) => handleChange("GB", e.target.value)}
                  placeholder="ex: 6.2"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Hémoglobine (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hemoglobine}
                  onChange={(e) => handleChange("hemoglobine", e.target.value)}
                  placeholder="ex: 14.5"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2 - FORMULE LEUCOCYTAIRE */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>2. Formule leucocytaire</h3>
            <p style={sectionSubtitleStyle}>
              Profil de réponse immunitaire et d'adaptation aiguë / chronique.
            </p>
            <div style={inputGridStyle}>
              <div>
                <label style={labelStyle}>Neutrophiles (G/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.neutrophiles}
                  onChange={(e) => handleChange("neutrophiles", e.target.value)}
                  placeholder="ex: 3.5"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Lymphocytes (G/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lymphocytes}
                  onChange={(e) => handleChange("lymphocytes", e.target.value)}
                  placeholder="ex: 2.0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Éosinophiles (G/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.eosinophiles}
                  onChange={(e) => handleChange("eosinophiles", e.target.value)}
                  placeholder="ex: 0.2"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Monocytes (G/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monocytes}
                  onChange={(e) => handleChange("monocytes", e.target.value)}
                  placeholder="ex: 0.5"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Plaquettes (G/L)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.plaquettes}
                  onChange={(e) => handleChange("plaquettes", e.target.value)}
                  placeholder="ex: 250"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 - ENZYMES / REMODELAGE TISSULAIRE */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>3. Enzymes / Remodelage tissulaire</h3>
            <p style={sectionSubtitleStyle}>
              Vitesse métabolique cellulaire, renouvellement musculaire et remodelage ostéo-tissulaire.
            </p>
            <div style={inputGridStyle}>
              <div>
                <label style={labelStyle}>LDH (UI/L)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.LDH}
                  onChange={(e) => handleChange("LDH", e.target.value)}
                  placeholder="ex: 180"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>CPK (UI/L)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.CPK}
                  onChange={(e) => handleChange("CPK", e.target.value)}
                  placeholder="ex: 90"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>PAOi (UI/L)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.PAOi}
                  onChange={(e) => handleChange("PAOi", e.target.value)}
                  placeholder="ex: 45"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Ostéocalcine (ng/mL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.osteocalcine}
                  onChange={(e) => handleChange("osteocalcine", e.target.value)}
                  placeholder="ex: 15.5"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4 - AXE ENDOCRINIEN CENTRAL */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>4. Axe endocrinien central</h3>
            <p style={sectionSubtitleStyle}>
              Niveau de sollicitation centrale adressée aux tissus périphériques.
            </p>
            <div style={inputGridStyle}>
              <div>
                <label style={labelStyle}>TSH (mUI/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.TSH}
                  onChange={(e) => handleChange("TSH", e.target.value)}
                  placeholder="ex: 2.1"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* SECTION 5 - PARAMÈTRES AVANCÉS (ACCORDÉON) */}
          <div style={sectionStyle}>
            <div
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f9fafb";
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>
                {showAdvanced ? "▼" : "▶"}
              </span>
              <h3 style={{ fontSize: "1.05rem", margin: 0, color: "#1f2937", fontWeight: "600" }}>
                5. Paramètres avancés du terrain
              </h3>
            </div>

            {showAdvanced && (
              <div style={{ marginTop: "16px" }}>
                <p style={sectionSubtitleStyle}>
                  Affinent la lecture du tonus métabolique, minéral et conjonctif. Facultatif.
                </p>
                <div style={inputGridStyle}>
                  <div>
                    <label style={labelStyle}>VS (mm/h)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.VS}
                      onChange={(e) => handleChange("VS", e.target.value)}
                      placeholder="ex: 10"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Calcium total (Ca²⁺)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.calcium}
                      onChange={(e) => handleChange("calcium", e.target.value)}
                      placeholder="ex: 2.35"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Potassium (K⁺)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.potassium}
                      onChange={(e) => handleChange("potassium", e.target.value)}
                      placeholder="ex: 4.2"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 32px",
                background: loading ? "#9ca3af" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 12px rgba(37, 99, 235, 0.3)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(37, 99, 235, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
                }
              }}
            >
              {loading ? "⏳ Analyse en cours..." : "Analyser"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "14px 24px",
                background: "white",
                color: "#6b7280",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.color = "#6b7280";
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
            border: "2px solid #dc2626",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            color: "#dc2626",
            fontSize: "0.95rem",
          }}
        >
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {/* Résultats de l'analyse */}
      {result && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "24px",
              color: "#2563eb",
              borderBottom: "3px solid #e5e7eb",
              paddingBottom: "12px",
              fontWeight: "700",
            }}
          >
            🔬 Résultats de l'analyse BdF
          </h2>

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
              {Object.entries(formData)
                .filter(([_, value]) => value.trim() !== "")
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}
            </div>
          </div>

          {/* Lecture des index - GRILLE 2x4 */}
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

            {/* Ligne 1: Index génital, Index thyroïdien, g/T, Index adaptation */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              {/* Index génital */}
              <div
                style={{
                  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #fbbf24",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: "#92400e",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Index génital
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#78350f",
                    marginBottom: "8px",
                  }}
                >
                  {result.indexes.indexGenital.value !== null
                    ? result.indexes.indexGenital.value.toFixed(2)
                    : "N/A"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#92400e", lineHeight: "1.4" }}>
                  {result.indexes.indexGenital.comment}
                </div>
              </div>

              {/* Index thyroïdien */}
              <div
                style={{
                  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #3b82f6",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: "#1e3a8a",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Index thyroïdien
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#1e40af",
                    marginBottom: "8px",
                  }}
                >
                  {result.indexes.indexThyroidien.value !== null
                    ? result.indexes.indexThyroidien.value.toFixed(2)
                    : "N/A"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#1e3a8a", lineHeight: "1.4" }}>
                  {result.indexes.indexThyroidien.comment}
                </div>
              </div>

              {/* g/T (génito-thyroïdien) */}
              <div
                style={{
                  background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #ec4899",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: "#831843",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  g/T (génito-thyroïdien)
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#9f1239",
                    marginBottom: "8px",
                  }}
                >
                  {result.indexes.gT.value !== null
                    ? result.indexes.gT.value.toFixed(2)
                    : "N/A"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#831843", lineHeight: "1.4" }}>
                  {result.indexes.gT.comment}
                </div>
              </div>

              {/* Index adaptation */}
              <div
                style={{
                  background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #10b981",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: "#064e3b",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Index adaptation
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#065f46",
                    marginBottom: "8px",
                  }}
                >
                  {result.indexes.indexAdaptation.value !== null
                    ? result.indexes.indexAdaptation.value.toFixed(2)
                    : "N/A"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#064e3b", lineHeight: "1.4" }}>
                  {result.indexes.indexAdaptation.comment}
                </div>
              </div>
            </div>

            {/* Ligne 2: Index œstrogénique, Turnover, Rendement thyroïdien, Remodelage osseux */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
              }}
            >
              {/* Index œstrogénique */}
              <div
                style={{
                  background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #6366f1",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: "#312e81",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Index œstrogénique
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#3730a3",
                    marginBottom: "8px",
                  }}
                >
                  {result.indexes.indexOestrogenique.value !== null
                    ? result.indexes.indexOestrogenique.value.toFixed(2)
                    : "N/A"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#312e81", lineHeight: "1.4" }}>
                  {result.indexes.indexOestrogenique.comment}
                </div>
              </div>

              {/* Turnover */}
              <div
                style={{
                  background: "linear-gradient(135deg, #fef3c7 0%, #fde047 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #eab308",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: "#713f12",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Turnover tissulaire
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#854d0e",
                    marginBottom: "8px",
                  }}
                >
                  {result.indexes.turnover.value !== null
                    ? result.indexes.turnover.value.toFixed(2)
                    : "N/A"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#713f12", lineHeight: "1.4" }}>
                  {result.indexes.turnover.comment}
                </div>
              </div>

              {/* Rendement thyroïdien */}
              <div
                style={{
                  background: "linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #14b8a6",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: "#134e4a",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Rendement thyroïdien
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#115e59",
                    marginBottom: "8px",
                  }}
                >
                  {result.indexes.rendementThyroidien.value !== null
                    ? result.indexes.rendementThyroidien.value.toFixed(2)
                    : "N/A"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#134e4a", lineHeight: "1.4" }}>
                  {result.indexes.rendementThyroidien.comment}
                </div>
              </div>

              {/* Remodelage osseux */}
              <div
                style={{
                  background: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "2px solid #f97316",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    color: "#7c2d12",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Remodelage osseux
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#9a3412",
                    marginBottom: "8px",
                  }}
                >
                  {result.indexes.remodelageOsseux.value !== null
                    ? result.indexes.remodelageOsseux.value.toFixed(2)
                    : "N/A"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#7c2d12", lineHeight: "1.4" }}>
                  {result.indexes.remodelageOsseux.comment}
                </div>
              </div>
            </div>
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
              {result.summary}
            </div>
          </div>

          {/* Axes sollicités */}
          {result.axesDominants.length > 0 && (
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
                }}
              >
                {result.axesDominants.map((axe, idx) => (
                  <li key={idx}>{axe}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ========================================
              ENRICHISSEMENT RAG ENDOBIOGÉNIE
              ======================================== */}

          {/* Résumé fonctionnel (RAG) */}
          {ragEnrichment && (
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "12px",
                  color: "#1f2937",
                  fontWeight: "600",
                }}
              >
                🔬 Résumé fonctionnel (via RAG Endobiogénie)
              </h3>
              <div
                style={{
                  background: "#f0fdf4",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "2px solid #22c55e",
                  fontSize: "0.95rem",
                  color: "#14532d",
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                }}
              >
                {ragEnrichment.resumeFonctionnel}
              </div>
            </div>
          )}

          {/* Axes sollicités (RAG) */}
          {ragEnrichment && ragEnrichment.axesSollicites.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "12px",
                  color: "#1f2937",
                  fontWeight: "600",
                }}
              >
                ⚙️ Axes sollicités (via RAG Endobiogénie)
              </h3>
              <ul
                style={{
                  background: "#fef3c7",
                  padding: "20px 20px 20px 48px",
                  borderRadius: "10px",
                  border: "2px solid #f59e0b",
                  fontSize: "0.95rem",
                  color: "#78350f",
                  lineHeight: "2",
                  listStyle: "disc",
                }}
              >
                {ragEnrichment.axesSollicites.map((axe, idx) => (
                  <li key={idx}>{axe}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lecture endobiogénique du terrain (RAG) */}
          {ragEnrichment && (
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "12px",
                  color: "#1f2937",
                  fontWeight: "600",
                }}
              >
                🌿 Lecture endobiogénique du terrain
              </h3>
              <div
                style={{
                  background: "#faf5ff",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "2px solid #a855f7",
                  fontSize: "0.95rem",
                  color: "#581c87",
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                }}
              >
                {ragEnrichment.lectureEndobiogenique}
              </div>
            </div>
          )}

          {/* Indicateur de chargement RAG */}
          {loadingRag && (
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <div style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: "8px" }}>
                ⏳ Enrichissement endobiogénique en cours...
              </div>
            </div>
          )}

          {/* Erreur RAG */}
          {ragError && (
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  background: "#fef2f2",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "2px solid #ef4444",
                  fontSize: "0.9rem",
                  color: "#991b1b",
                }}
              >
                ⚠️ {ragError}
              </div>
            </div>
          )}

  {/* Bouton Associer à un patient */}
          <div style={{ marginBottom: "24px" }}>
            <button
              onClick={() => {
                // Convertir les données du formulaire en inputs
                const inputs: Record<string, number> = {};
                for (const [key, value] of Object.entries(formData)) {
                  if (value.trim() !== "") {
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                      inputs[key] = num;
                    }
                  }
                }

                // Créer un objet d'analyse compatible
                const analysisData = {
                  inputs,
                  indexes: [
                    { name: "Index génital", value: result.indexes.indexGenital.value, comment: result.indexes.indexGenital.comment },
                    { name: "Index thyroïdien", value: result.indexes.indexThyroidien.value, comment: result.indexes.indexThyroidien.comment },
                    { name: "g/T", value: result.indexes.gT.value, comment: result.indexes.gT.comment },
                    { name: "Index adaptation", value: result.indexes.indexAdaptation.value, comment: result.indexes.indexAdaptation.comment },
                    { name: "Index œstrogénique", value: result.indexes.indexOestrogenique.value, comment: result.indexes.indexOestrogenique.comment },
                    { name: "Turnover", value: result.indexes.turnover.value, comment: result.indexes.turnover.comment },
                    { name: "Rendement thyroïdien", value: result.indexes.rendementThyroidien.value, comment: result.indexes.rendementThyroidien.comment },
                    { name: "Remodelage osseux", value: result.indexes.remodelageOsseux.value, comment: result.indexes.remodelageOsseux.comment },
                  ],
                  summary: result.summary,
                  axes: result.axesDominants,
                  ragText: ragContext || undefined,
                };

                // Stocker dans sessionStorage
                sessionStorage.setItem("pendingBdfAnalysis", JSON.stringify(analysisData));

                // Rediriger vers la page patients
                window.location.href = "/patients";
              }}
              style={{
                width: "100%",
                padding: "14px 28px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.4)";
              }}
            >
              📁 Associer à un dossier patient
            </button>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6b7280",
                marginTop: "8px",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              💡 Enregistrer cette analyse dans l'historique d'un patient
            </p>
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
                  {ragContext}
                </div>
              </div>
            </div>
          )}

          {/* Note technique */}
          <div style={{ marginTop: "32px" }}>
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
              <strong style={{ color: "#374151" }}>🧾 Note technique:</strong>{" "}
              {result.noteTechnique}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
