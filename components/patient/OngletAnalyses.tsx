"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BdfResultsView from "@/components/bdf/BdfResultsView";
import { SyntheseUnifiee } from "@/components/interrogatoire/SyntheseUnifiee";
import type { BdfResult } from "@/lib/bdf/calculateIndexes";

export function OngletAnalyses({ patient }: { patient: any }) {
  const router = useRouter();
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Vérifier si la BdF a été modifiée après la dernière synthèse IA
  const lastSynthesis = patient.unifiedSyntheses?.[0];
  const lastBdf = patient.bdfAnalyses?.[0];
  const bdfModifiedAfterSynthesis = lastSynthesis && lastBdf &&
    new Date(lastBdf.updatedAt || lastBdf.createdAt) > new Date(lastSynthesis.createdAt);

  // Sélectionner une analyse
  const handleSelectAnalysis = (analysis: any) => {
    setSelectedAnalysis(analysis);
  };

  if (patient.bdfAnalyses.length === 0) {
    return (
      <div
        style={{
          background: "#f9fafb",
          padding: "48px",
          borderRadius: "12px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <p style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
          Aucune analyse BdF enregistrée
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Les analyses BdF apparaîtront ici une fois créées
        </p>
      </div>
    );
  }

  return (
    <div>
      {!selectedAnalysis ? (
        <>
          {/* Table des analyses */}
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            📊 Historique des analyses BdF
          </h3>

          <div
            style={{
              background: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            {/* En-tête tableau */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr 200px",
                padding: "12px 16px",
                background: "#f9fafb",
                borderBottom: "2px solid #e5e7eb",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
              }}
            >
              <div>Date</div>
              <div>Résumé</div>
              <div>Actions</div>
            </div>

            {/* Lignes */}
            {patient.bdfAnalyses.map((analysis: any) => {
              const firstLine = analysis.summary?.split("\n")[0] || "Analyse BdF";

              return (
                <div
                  key={analysis.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr 200px",
                    padding: "16px",
                    borderBottom: "1px solid #e5e7eb",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#1f2937" }}>
                    {new Date(analysis.date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#4b5563",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {firstLine.substring(0, 100)}
                    {firstLine.length > 100 ? "..." : ""}
                  </div>
                  <div>
                    <button
                      onClick={() => handleSelectAnalysis(analysis)}
                      style={{
                        padding: "8px 16px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Voir le détail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Détail d'une analyse */}
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <button
              onClick={() => setSelectedAnalysis(null)}
              style={{
                padding: "8px 16px",
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Retour à la liste
            </button>

            {/* Bouton Modifier BdF */}
            <button
              onClick={() => router.push(`/bdf?patientId=${patient.id}&edit=${selectedAnalysis.id}`)}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
              }}
            >
              ✏️ Modifier cette BdF
            </button>
          </div>

          {/* Alerte si BdF modifiée après synthèse */}
          {bdfModifiedAfterSynthesis && selectedAnalysis.id === lastBdf?.id && (
            <div style={{
              background: "#fef3c7",
              border: "2px solid #f59e0b",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <span style={{ fontSize: "1.5rem" }}>⚠️</span>
              <div>
                <strong style={{ color: "#92400e" }}>Données modifiées depuis la dernière synthèse IA</strong>
                <p style={{ fontSize: "0.85rem", color: "#b45309", margin: "4px 0 0 0" }}>
                  Cette analyse BdF a été modifiée après la génération de la synthèse.
                  Veuillez régénérer la synthèse IA pour prendre en compte les changements.
                </p>
              </div>
            </div>
          )}

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "8px",
            }}
          >
            Analyse du{" "}
            {new Date(selectedAnalysis.date).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {/* Valeurs biologiques */}
          <div style={{ marginBottom: "32px" }}>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "12px",
              }}
            >
              📋 Valeurs biologiques saisies
            </h4>
            <div
              style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#4b5563",
              }}
            >
              {Object.entries(selectedAnalysis.inputs as Record<string, number>)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}
            </div>
          </div>

          {/* Affichage des 7 panels endobiogéniques avec BdfResultsView */}
          <BdfResultsView
            result={{
              indexes: selectedAnalysis.indexes,
              metadata: {
                calculatedAt: new Date(selectedAnalysis.createdAt),
                biomarkersCount: Object.keys(selectedAnalysis.inputs as Record<string, any>).length,
              },
            } as BdfResult}
          />

          {/* ════════════════════════════════════════════════════════════
              SECTIONS LEGACY SUPPRIMÉES :
              - "Résumé fonctionnel" (affichait du JSON brut illisible)
              - "Axes sollicités" (redondant avec la nouvelle synthèse)
              - "Lecture endobiogénique" (remplacé par SyntheseUnifiee)

              Ces informations sont maintenant générées dynamiquement
              par le composant SyntheseUnifiee ci-dessous.
          ════════════════════════════════════════════════════════════ */}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SYNTHÈSE IA UNIFIÉE - Toujours visible */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div style={{ marginBottom: "24px" }}>
            <SyntheseUnifiee
              patientId={patient.id}
              patientNom={`${patient.prenom} ${patient.nom}`}
              hasInterrogatoire={!!patient.interrogatoire?.v2?.answersByAxis}
              hasBdf={true}
              interrogatoireCompletion={(() => {
                // Calculer la complétion de l'interrogatoire
                const answersByAxis = patient.interrogatoire?.v2?.answersByAxis || {};
                const axesRemplis = Object.keys(answersByAxis).filter(
                  (k) => answersByAxis[k] && Object.keys(answersByAxis[k]).length > 0
                ).length;
                const axesTotal = 10; // Nombre total d'axes dans l'interrogatoire

                // Compter les questions remplies
                let questionsRemplies = 0;
                let questionsTotal = 0;
                Object.values(answersByAxis).forEach((axeAnswers: any) => {
                  if (axeAnswers) {
                    Object.values(axeAnswers).forEach((val: any) => {
                      questionsTotal++;
                      if (val !== null && val !== undefined && val !== "") {
                        questionsRemplies++;
                      }
                    });
                  }
                });

                // Estimer le total de questions si aucune n'est remplie
                if (questionsTotal === 0) {
                  questionsTotal = 150; // Estimation du nombre total de questions
                }

                return {
                  questionsRemplies,
                  questionsTotal,
                  axesRemplis,
                  axesTotal,
                };
              })()}
            />
          </div>

        </>
      )}
    </div>
  );
}
