"use client";

import { useState, useEffect, useRef } from "react";
import type { AxeType, AxeInterpretation } from "@/lib/interrogatoire/axeInterpretation";
import { AxeInterpretationCard } from "./AxeInterpretationCard";

// Helper pour calculer un hash simple des réponses
function hashResponses(responses: Record<string, any>): string {
  return JSON.stringify(responses, Object.keys(responses).sort());
}

interface BoutonInterpretrerAxeProps {
  patientId: string;
  axe: AxeType;
  reponsesAxe: Record<string, any>;
  sexe: "H" | "F";
  age?: number;
  antecedents?: string;
  traitements?: string;
  contreindicationsMajeures?: string[];
  existingInterpretation?: AxeInterpretation | null;
  onInterpretationComplete?: (interpretation: AxeInterpretation) => void;
}

/**
 * Bouton pour déclencher l'interprétation IA d'un axe clinique
 * Affiche le résultat dans une carte en dessous
 * Détecte si les réponses ont changé depuis l'interprétation
 */
export function BoutonInterpretrerAxe({
  patientId,
  axe,
  reponsesAxe,
  sexe,
  age,
  antecedents,
  traitements,
  contreindicationsMajeures,
  existingInterpretation,
  onInterpretationComplete,
}: BoutonInterpretrerAxeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<AxeInterpretation | null>(
    existingInterpretation || null
  );
  const [responsesChanged, setResponsesChanged] = useState(false);
  const lastInterpretedHashRef = useRef<string | null>(null);

  // Synchroniser l'interprétation avec la prop (quand on change d'axe)
  useEffect(() => {
    setInterpretation(existingInterpretation || null);
    // Réinitialiser le hash quand on change d'axe
    if (existingInterpretation) {
      lastInterpretedHashRef.current = hashResponses(reponsesAxe);
      setResponsesChanged(false);
    } else {
      lastInterpretedHashRef.current = null;
      setResponsesChanged(false);
    }
  }, [existingInterpretation, reponsesAxe]);

  // Détecter les changements de réponses
  useEffect(() => {
    const currentHash = hashResponses(reponsesAxe);

    // Si on a une interprétation existante, sauvegarder son hash au premier montage
    if (interpretation && !lastInterpretedHashRef.current) {
      lastInterpretedHashRef.current = currentHash;
    }

    // Vérifier si les réponses ont changé depuis la dernière interprétation
    if (interpretation && lastInterpretedHashRef.current) {
      const hasChanged = currentHash !== lastInterpretedHashRef.current;
      setResponsesChanged(hasChanged);
    }
  }, [reponsesAxe, interpretation]);

  const handleInterpret = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/interrogatoire/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          axe,
          reponsesAxe,
          sexe,
          age,
          antecedents,
          traitements,
          contreindicationsMajeures,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'interprétation");
      }

      const data = await response.json();
      setInterpretation(data.interpretation);

      // Sauvegarder le hash des réponses interprétées
      lastInterpretedHashRef.current = hashResponses(reponsesAxe);
      setResponsesChanged(false);

      // Callback optionnel pour notifier le parent
      if (onInterpretationComplete) {
        onInterpretationComplete(data.interpretation);
      }
    } catch (err: any) {
      console.error("Erreur interprétation:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'axe a des réponses
  const hasResponses = Object.keys(reponsesAxe).length > 0;

  return (
    <div>
      {/* Avertissement si réponses modifiées */}
      {responsesChanged && interpretation && (
        <div
          style={{
            marginBottom: "8px",
            padding: "8px 12px",
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: "6px",
            fontSize: "0.85rem",
            color: "#92400e",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⚠️</span>
          <span>
            Les réponses ont été modifiées depuis l'interprétation.{" "}
            <strong>Ré-interprétez cet axe</strong> pour mettre à jour l'analyse.
          </span>
        </div>
      )}

      {/* Bouton d'interprétation */}
      <button
        onClick={handleInterpret}
        disabled={loading || !hasResponses}
        style={{
          background: responsesChanged && interpretation ? "#f59e0b" : (interpretation ? "#10b981" : "#2563eb"),
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "10px 20px",
          fontSize: "0.9rem",
          fontWeight: "600",
          cursor: hasResponses ? (loading ? "wait" : "pointer") : "not-allowed",
          opacity: hasResponses ? 1 : 0.5,
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          if (hasResponses && !loading) {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                border: "2px solid white",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Analyse en cours...
          </>
        ) : responsesChanged && interpretation ? (
          <>
            ⚠️ Ré-interpréter (données modifiées)
          </>
        ) : interpretation ? (
          <>
            🔄 Ré-interpréter cet axe
          </>
        ) : (
          <>
            🤖 Interpréter cet axe avec l'IA
          </>
        )}
      </button>

      {/* Message si pas de réponses */}
      {!hasResponses && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "0.85rem",
            color: "#6b7280",
            fontStyle: "italic",
          }}
        >
          Aucune donnée à interpréter pour cet axe
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px 16px",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "0.9rem",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Carte d'interprétation */}
      {interpretation && <AxeInterpretationCard interpretation={interpretation} />}

      {/* Animation de spin */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
