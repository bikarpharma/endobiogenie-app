"use client";

import { useState } from "react";

type Ordonnance = {
  id: string;
  dateOrdonnance: string;
  titre: string;
  interpretation: string;
  recommandations: Array<{
    plante: string;
    posologie: string;
    duree: string;
    remarques?: string;
  }>;
  conseils: string | null;
  statut: string;
  isModified: boolean;
  notesPraticien: string | null;
  bdfAnalysisId: string | null;
};

export function OngletOrdonnances({ patient }: { patient: any }) {
  const [generating, setGenerating] = useState(false);
  const [selectedOrdonnance, setSelectedOrdonnance] = useState<Ordonnance | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const ordonnances: Ordonnance[] = patient.ordonnances || [];
  const hasOrdonnances = ordonnances.length > 0;

  // Générer une nouvelle ordonnance avec l'IA
  const handleGenerate = async (withPrompt: boolean = false) => {
    setGenerating(true);

    try {
      const response = await fetch(`/api/patients/${patient.id}/ordonnances/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customPrompt: withPrompt ? customPrompt : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la génération");
      }

      const data = await response.json();
      console.log("✅ Ordonnance générée:", data.ordonnance);

      // Recharger la page pour afficher la nouvelle ordonnance
      window.location.reload();
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      alert(error.message);
    } finally {
      setGenerating(false);
      setShowPromptModal(false);
      setCustomPrompt("");
    }
  };

  // Afficher le statut avec une couleur
  const getStatutBadge = (statut: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      brouillon: { bg: "#fef3c7", text: "#92400e" },
      validee: { bg: "#d1fae5", text: "#065f46" },
      imprimee: { bg: "#dbeafe", text: "#1e40af" },
    };

    const color = colors[statut] || colors.brouillon;

    return (
      <span
        style={{
          padding: "4px 12px",
          background: color.bg,
          color: color.text,
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: "600",
          textTransform: "uppercase",
        }}
      >
        {statut}
      </span>
    );
  };

  return (
    <div>
      {/* En-tête avec bouton génération */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
            💊 Ordonnances Phytothérapie
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            {hasOrdonnances
              ? `${ordonnances.length} ordonnance${ordonnances.length > 1 ? "s" : ""}`
              : "Aucune ordonnance générée"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {/* Bouton génération simple */}
          <button
            onClick={() => handleGenerate(false)}
            disabled={generating || !patient.bdfAnalyses || patient.bdfAnalyses.length === 0}
            style={{
              padding: "12px 20px",
              background: generating
                ? "#9ca3af"
                : patient.bdfAnalyses && patient.bdfAnalyses.length > 0
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "#d1d5db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: generating || !patient.bdfAnalyses || patient.bdfAnalyses.length === 0 ? "not-allowed" : "pointer",
              boxShadow: generating ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            {generating ? "⏳ Génération..." : "🤖 Générer avec IA"}
          </button>

          {/* Bouton génération avec prompt personnalisé */}
          <button
            onClick={() => setShowPromptModal(true)}
            disabled={generating || !patient.bdfAnalyses || patient.bdfAnalyses.length === 0}
            style={{
              padding: "12px 20px",
              background: "white",
              color: "#2563eb",
              border: "2px solid #2563eb",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: generating || !patient.bdfAnalyses || patient.bdfAnalyses.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            💬 Avec question
          </button>
        </div>
      </div>

      {/* Alerte si pas de BdF */}
      {(!patient.bdfAnalyses || patient.bdfAnalyses.length === 0) && (
        <div
          style={{
            background: "#fef3c7",
            border: "2px solid #f59e0b",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
            <div>
              <div style={{ fontWeight: "600", color: "#92400e", marginBottom: "4px" }}>
                Aucune analyse BdF disponible
              </div>
              <div style={{ fontSize: "0.9rem", color: "#92400e" }}>
                Une analyse BdF est nécessaire pour générer une ordonnance personnalisée.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des ordonnances */}
      {hasOrdonnances ? (
        <div style={{ display: "grid", gap: "16px" }}>
          {ordonnances.map((ordonnance) => (
            <div
              key={ordonnance.id}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => setSelectedOrdonnance(ordonnance)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                    {ordonnance.titre}
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                    {new Date(ordonnance.dateOrdonnance).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {getStatutBadge(ordonnance.statut)}
              </div>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#4b5563",
                  marginBottom: "12px",
                  lineHeight: "1.5",
                }}
              >
                {ordonnance.interpretation.substring(0, 150)}
                {ordonnance.interpretation.length > 150 ? "..." : ""}
              </p>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {ordonnance.recommandations.slice(0, 3).map((reco, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "4px 10px",
                      background: "#f3f4f6",
                      color: "#374151",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                    }}
                  >
                    🌿 {reco.plante}
                  </span>
                ))}
                {ordonnance.recommandations.length > 3 && (
                  <span
                    style={{
                      padding: "4px 10px",
                      background: "#f3f4f6",
                      color: "#6b7280",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                    }}
                  >
                    +{ordonnance.recommandations.length - 3} autres
                  </span>
                )}
              </div>

              {ordonnance.isModified && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "8px 12px",
                    background: "#dbeafe",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    color: "#1e40af",
                  }}
                >
                  ✏️ Modifiée par le praticien
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "#f9fafb",
            padding: "48px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>💊</div>
          <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Aucune ordonnance générée</p>
          <p style={{ fontSize: "0.9rem" }}>
            Cliquez sur "Générer avec IA" pour créer une ordonnance personnalisée
          </p>
        </div>
      )}

      {/* Modal Détail Ordonnance */}
      {selectedOrdonnance && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setSelectedOrdonnance(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 9998,
            }}
          />

          {/* Modal */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(90vw, 800px)",
              maxHeight: "90vh",
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              zIndex: 9999,
              overflow: "auto",
            }}
          >
            {/* En-tête */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                    {selectedOrdonnance.titre}
                  </h2>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                    {new Date(selectedOrdonnance.dateOrdonnance).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrdonnance(null)}
                  style={{
                    padding: "8px 16px",
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Interprétation */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
                📋 Lecture endobiogénique du terrain
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: "1.6" }}>
                {selectedOrdonnance.interpretation}
              </p>
            </div>

            {/* Recommandations */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
                🌿 Prescription phytothérapie
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {selectedOrdonnance.recommandations.map((reco, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "16px",
                    }}
                  >
                    <div style={{ fontSize: "1rem", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                      {idx + 1}. {reco.plante}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#4b5563", marginBottom: "4px" }}>
                      <strong>Posologie :</strong> {reco.posologie}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#4b5563", marginBottom: reco.remarques ? "4px" : "0" }}>
                      <strong>Durée :</strong> {reco.duree}
                    </div>
                    {reco.remarques && (
                      <div style={{ fontSize: "0.85rem", color: "#6b7280", fontStyle: "italic" }}>
                        💡 {reco.remarques}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Conseils */}
            {selectedOrdonnance.conseils && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
                  💡 Conseils hygiéno-diététiques
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: "1.6" }}>
                  {selectedOrdonnance.conseils}
                </p>
              </div>
            )}

            {/* Boutons d'action */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                style={{
                  padding: "12px 24px",
                  background: "white",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedOrdonnance(null)}
              >
                Fermer
              </button>
              <button
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                }}
              >
                🖨️ Imprimer
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Prompt Personnalisé */}
      {showPromptModal && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowPromptModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 9998,
            }}
          />

          {/* Modal */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(90vw, 600px)",
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              zIndex: 9999,
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1f2937", marginBottom: "16px" }}>
              💬 Question personnalisée
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "24px" }}>
              Posez une question spécifique pour affiner la génération de l'ordonnance. L'IA interrogera le vectorstore
              Endobiogénie.
            </p>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: Quels remèdes pour un terrain hypoA avec fatigue surrénalienne ?"
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                fontFamily: "inherit",
                marginBottom: "24px",
              }}
            />

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowPromptModal(false)}
                disabled={generating}
                style={{
                  padding: "12px 24px",
                  background: "white",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: generating ? "not-allowed" : "pointer",
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleGenerate(true)}
                disabled={generating || !customPrompt.trim()}
                style={{
                  padding: "12px 24px",
                  background:
                    generating || !customPrompt.trim()
                      ? "#9ca3af"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: generating || !customPrompt.trim() ? "not-allowed" : "pointer",
                  boxShadow: generating || !customPrompt.trim() ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                {generating ? "⏳ Génération..." : "🤖 Générer"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
