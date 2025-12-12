"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GenerateOrdonnanceButtonProps = {
  patientId: string;
  hasBdfAnalysis: boolean;
  hasInterrogatoire: boolean;
};

export function GenerateOrdonnanceButton({ patientId, hasBdfAnalysis, hasInterrogatoire }: GenerateOrdonnanceButtonProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  // VERSION 3.0 - SANS SCOPE
  // L'IA choisit automatiquement la meilleure forme galénique selon l'indication
  // Plus de modal de sélection = génération directe

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const response = await fetch("/api/ordonnances/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          // PAS DE SCOPE - L'IA choisit la meilleure forme selon l'indication
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
    }
  };

  // Déterminer si la génération est possible
  const canGenerate = hasBdfAnalysis || hasInterrogatoire;

  // Déterminer le message d'avertissement
  let warningBadge: string | null = null;
  if (!canGenerate) {
    warningBadge = null; // Bouton désactivé
  } else if (!hasBdfAnalysis && hasInterrogatoire) {
    warningBadge = "⚠️ Sans données BdF";
  } else if (hasBdfAnalysis && !hasInterrogatoire) {
    warningBadge = "⚠️ Sans interprétation clinique";
  }

  if (!canGenerate) {
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
        🚫 Nécessite au minimum un interrogatoire ou une analyse BdF
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
      <button
        onClick={handleGenerate}
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

      {/* Info V3 */}
      <div
        style={{
          padding: "6px 12px",
          background: "#dbeafe",
          color: "#1e40af",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: "500",
          border: "1px solid #93c5fd",
        }}
      >
        💡 L'IA choisit automatiquement la meilleure forme galénique
      </div>

      {warningBadge && (
        <div
          style={{
            padding: "6px 12px",
            background: "#fef3c7",
            color: "#92400e",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: "600",
            border: "1px solid #fbbf24",
          }}
        >
          {warningBadge}
        </div>
      )}
    </div>
  );
}
