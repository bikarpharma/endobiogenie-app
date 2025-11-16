"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TherapeuticScope } from "@/lib/ordonnance/types";

type GenerateOrdonnanceButtonProps = {
  patientId: string;
  hasBdfAnalysis: boolean;
};

export function GenerateOrdonnanceButton({ patientId, hasBdfAnalysis }: GenerateOrdonnanceButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scope, setScope] = useState<TherapeuticScope>({
    planteMedicinale: true,
    gemmotherapie: true,
    aromatherapie: false,
    micronutrition: true,
  });

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const response = await fetch("/api/ordonnances/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          scope,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la génération");
      }

      const data = await response.json();
      console.log("✅ Ordonnance générée:", data.ordonnance.id);

      // Rediriger vers l'interface intelligente
      router.push(`/ordonnances/${data.ordonnance.id}`);
    } catch (error: any) {
      console.error("❌ Erreur génération:", error);
      alert(error.message);
    } finally {
      setGenerating(false);
      setShowModal(false);
    }
  };

  if (!hasBdfAnalysis) {
    return (
      <button
        disabled
        style={{
          padding: "12px 20px",
          background: "#d1d5db",
          color: "#6b7280",
          border: "none",
          borderRadius: "8px",
          fontSize: "0.9rem",
          fontWeight: "600",
          cursor: "not-allowed",
        }}
      >
        🚫 Nécessite une analyse BdF
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={generating}
        style={{
          padding: "12px 20px",
          background: generating
            ? "#9ca3af"
            : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "0.9rem",
          fontWeight: "600",
          cursor: generating ? "not-allowed" : "pointer",
          boxShadow: generating ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
        }}
      >
        {generating ? "⏳ Génération en cours..." : "🧬 Générer ordonnance intelligente"}
      </button>

      {/* Modal Configuration Scope */}
      {showModal && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowModal(false)}
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
              maxHeight: "90vh",
              overflow: "auto",
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              zIndex: 9999,
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
              🧬 Générer une ordonnance intelligente
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "24px" }}>
              Configurez le scope thérapeutique pour personnaliser les recommandations
            </p>

            <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
              {/* Plantes médicinales */}
              <ScopeOption
                icon="🌿"
                label="Plantes médicinales (Phytothérapie)"
                description="Vectorstore: Phytothérapie clinique (25 MB)"
                checked={scope.planteMedicinale}
                onChange={(checked) => setScope({ ...scope, planteMedicinale: checked })}
                recommended
              />

              {/* Gemmothérapie */}
              <ScopeOption
                icon="🌱"
                label="Gemmothérapie (Macérats de bourgeons)"
                description="Vectorstore: Gemmothérapie (3 MB)"
                checked={scope.gemmotherapie}
                onChange={(checked) => setScope({ ...scope, gemmotherapie: checked })}
                recommended
              />

              {/* Aromathérapie */}
              <ScopeOption
                icon="💧"
                label="Aromathérapie (Huiles essentielles)"
                description="Vectorstore: Aromathérapie (18 MB)"
                checked={scope.aromatherapie}
                onChange={(checked) => setScope({ ...scope, aromatherapie: checked })}
              />

              {/* Micronutrition */}
              <ScopeOption
                icon="💊"
                label="Micro-nutrition (Compléments)"
                description="Recommandations ciblées par axe BdF"
                checked={scope.micronutrition}
                onChange={(checked) => setScope({ ...scope, micronutrition: checked })}
                recommended
              />
            </div>

            {/* Info */}
            <div
              style={{
                padding: "12px 16px",
                background: "#dbeafe",
                border: "2px solid #3b82f6",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#1e40af",
                marginBottom: "24px",
              }}
            >
              💡 Le système exécutera un raisonnement en 4 étapes:
              <br />
              1️⃣ Analyse du terrain BdF
              <br />
              2️⃣ Recherche Endobiogénie (Canon Lapraz/Hedayat)
              <br />
              3️⃣ Extension thérapeutique selon scope
              <br />
              4️⃣ Micro-nutrition ciblée
            </div>

            {/* Boutons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
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
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  padding: "12px 24px",
                  background: generating
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: generating ? "not-allowed" : "pointer",
                  boxShadow: generating ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                {generating ? "⏳ Génération..." : "🚀 Générer"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ========================================
// Composant Scope Option
// ========================================
type ScopeOptionProps = {
  icon: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  recommended?: boolean;
};

function ScopeOption({ icon, label, description, checked, onChange, recommended }: ScopeOptionProps) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        padding: "16px",
        background: checked ? "#f0fdf4" : "#f9fafb",
        border: checked ? "2px solid #10b981" : "2px solid #e5e7eb",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            marginTop: "4px",
            width: "18px",
            height: "18px",
            cursor: "pointer",
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "1.3rem" }}>{icon}</span>
            <strong style={{ fontSize: "1rem", color: "#1f2937" }}>{label}</strong>
            {recommended && (
              <span
                style={{
                  padding: "2px 8px",
                  background: "#fef3c7",
                  color: "#92400e",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                }}
              >
                RECOMMANDÉ
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
