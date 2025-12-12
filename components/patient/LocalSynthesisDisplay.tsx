"use client";

/**
 * COMPOSANT SYNTHÈSE LOCALE (GRATUIT - SANS IA)
 * =============================================
 * Affiche les conclusions locales basées sur :
 * - BdF : 100 index calculés localement
 * - Interrogatoire : Scoring V3 (14 axes, 566 questions)
 *
 * Pas d'appel API OpenAI = GRATUIT et INSTANTANÉ
 */

import { useMemo } from "react";
import type { BdfResult } from "@/lib/bdf/calculateIndexes";
import type { ScoringResultV3 } from "@/lib/interrogatoire/clinicalScoringV3";

interface LocalSynthesisDisplayProps {
  bdfResult?: BdfResult | null;
  scoringResult?: ScoringResultV3 | null;
  patientSexe: "H" | "F";
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

function getOrientationLabel(orientation: string): string {
  const labels: Record<string, string> = {
    insuffisance: "Insuffisance",
    sur_sollicitation: "Sur-sollicitation",
    mal_adaptation: "Mal-adaptation",
    equilibre: "Équilibre",
    instabilite: "Instabilité",
  };
  return labels[orientation] || orientation;
}

function getOrientationColor(orientation: string): { bg: string; text: string; border: string } {
  switch (orientation) {
    case "insuffisance":
      return { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" };
    case "sur_sollicitation":
      return { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" };
    case "mal_adaptation":
      return { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" };
    case "equilibre":
      return { bg: "#dcfce7", text: "#166534", border: "#22c55e" };
    case "instabilite":
      return { bg: "#fae8ff", text: "#86198f", border: "#d946ef" };
    default:
      return { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" };
  }
}

function getAxeLabel(axeKey: string): string {
  const labels: Record<string, string> = {
    neuro: "Neuro-végétatif",
    adaptatif: "Adaptatif (Cortico)",
    thyro: "Thyréotrope",
    gonado: "Gonadotrope",
    somato: "Somatotrope",
    digestif: "Digestif",
    immuno: "Immuno-inflammatoire",
    cardioMetabo: "Cardio-métabolique",
    dermato: "Dermatologique",
    orlRespiratoire: "ORL-Respiratoire",
    uroRenal: "Uro-rénal",
  };
  return labels[axeKey] || axeKey;
}

function getAxeIcon(axeKey: string): string {
  const icons: Record<string, string> = {
    neuro: "🧠",
    adaptatif: "⚡",
    thyro: "🦋",
    gonado: "♀♂",
    somato: "💪",
    digestif: "🌀",
    immuno: "🛡️",
    cardioMetabo: "❤️",
    dermato: "🧴",
    orlRespiratoire: "🌬️",
    uroRenal: "💧",
  };
  return icons[axeKey] || "📊";
}

function getCapaciteAdaptationColor(capacite: string): { bg: string; text: string } {
  switch (capacite) {
    case "bonne":
      return { bg: "#dcfce7", text: "#166534" };
    case "moderee":
      return { bg: "#fef3c7", text: "#92400e" };
    case "faible":
      return { bg: "#fed7aa", text: "#9a3412" };
    case "epuisee":
      return { bg: "#fee2e2", text: "#991b1b" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export function LocalSynthesisDisplay({
  bdfResult,
  scoringResult,
  patientSexe,
}: LocalSynthesisDisplayProps) {
  const hasBdf = bdfResult && Object.keys(bdfResult.indexes || {}).length > 0;
  const hasInterro = scoringResult && Object.keys(scoringResult.axes || {}).length > 0;

  // Extraire les index hors normes de la BdF
  const indexHorsNormes = useMemo(() => {
    if (!bdfResult?.indexes) return [];
    return Object.entries(bdfResult.indexes)
      .filter(([_, data]: [string, any]) => {
        if (!data || data.value === undefined || data.value === null) return false;
        const { value, min, max } = data;
        return value < min || value > max;
      })
      .map(([key, data]: [string, any]) => ({
        key,
        label: data.label || key,
        value: data.value,
        min: data.min,
        max: data.max,
        status: data.value < data.min ? "bas" : "haut",
      }))
      .slice(0, 10); // Top 10
  }, [bdfResult]);

  // Trier les axes par intensité
  const sortedAxes = useMemo(() => {
    if (!scoringResult?.axes) return [];
    return Object.entries(scoringResult.axes)
      .filter(([_, score]) => score !== undefined)
      .map(([key, score]) => ({ key, ...score! }))
      .sort((a, b) => b.intensite - a.intensite);
  }, [scoringResult]);

  if (!hasBdf && !hasInterro) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        background: "#f9fafb",
        borderRadius: "16px",
        border: "2px dashed #d1d5db",
      }}>
        <span style={{ fontSize: "3rem", marginBottom: "16px", display: "block" }}>📋</span>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
          Aucune donnée disponible
        </h3>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          Remplissez l'interrogatoire ou saisissez une BdF pour voir la synthèse locale.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        borderRadius: "16px",
        border: "2px solid #22c55e",
        padding: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>📊</span>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#166534", margin: 0 }}>
            Synthèse Locale (gratuit)
          </h2>
          <span style={{
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "600",
            background: "#dcfce7",
            color: "#166534",
          }}>
            Calcul instantané
          </span>
        </div>
        <p style={{ fontSize: "0.9rem", color: "#047857", margin: 0 }}>
          Basé sur {hasBdf ? "BdF (100 index)" : ""}{hasBdf && hasInterro ? " + " : ""}{hasInterro ? "Interrogatoire (14 axes)" : ""}
        </p>
      </div>

      {/* SYNTHÈSE GLOBALE (si interrogatoire disponible) */}
      {hasInterro && scoringResult?.syntheseGlobale && (
        <div style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          borderRadius: "16px",
          border: "2px solid #3b82f6",
          padding: "20px",
        }}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "700",
            color: "#1e40af",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            🎯 Vue d'ensemble
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {/* Terrain principal */}
            {scoringResult.syntheseGlobale.terrainPrincipal && (
              <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #bfdbfe",
              }}>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                  Terrain principal
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e40af" }}>
                  {scoringResult.syntheseGlobale.terrainPrincipal}
                </div>
              </div>
            )}

            {/* Axe prioritaire */}
            {scoringResult.syntheseGlobale.axePrioritaire && (
              <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #bfdbfe",
              }}>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                  Axe prioritaire
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e40af" }}>
                  {getAxeLabel(scoringResult.syntheseGlobale.axePrioritaire)}
                </div>
              </div>
            )}

            {/* Capacité d'adaptation */}
            <div style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid #bfdbfe",
            }}>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                Capacité d'adaptation
              </div>
              <span style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600",
                ...getCapaciteAdaptationColor(scoringResult.syntheseGlobale.capaciteAdaptation),
              }}>
                {scoringResult.syntheseGlobale.capaciteAdaptation.toUpperCase()}
              </span>
            </div>

            {/* Risque spasmophilie */}
            <div style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              border: scoringResult.syntheseGlobale.risqueSpasmophilie
                ? "2px solid #f59e0b"
                : "1px solid #bfdbfe",
            }}>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                Risque spasmophilie
              </div>
              <span style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600",
                background: scoringResult.syntheseGlobale.risqueSpasmophilie ? "#fef3c7" : "#dcfce7",
                color: scoringResult.syntheseGlobale.risqueSpasmophilie ? "#92400e" : "#166534",
              }}>
                {scoringResult.syntheseGlobale.risqueSpasmophilie ? "⚠️ OUI" : "✓ NON"}
              </span>
            </div>
          </div>

          {/* Recommandations prioritaires */}
          {scoringResult.syntheseGlobale.recommandationsPrioritaires?.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#1e40af", marginBottom: "8px" }}>
                Recommandations prioritaires :
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {scoringResult.syntheseGlobale.recommandationsPrioritaires.map((rec, idx) => (
                  <span key={idx} style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    background: "white",
                    color: "#1e40af",
                    border: "1px solid #bfdbfe",
                  }}>
                    {rec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AXES INTERROGATOIRE */}
      {hasInterro && sortedAxes.length > 0 && (
        <div style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          padding: "20px",
        }}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "700",
            color: "#374151",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            📋 Scores par axe (Interrogatoire)
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {sortedAxes.map((axe) => {
              const colors = getOrientationColor(axe.orientation);
              return (
                <div key={axe.key} style={{
                  background: colors.bg,
                  borderRadius: "12px",
                  padding: "14px",
                  border: `2px solid ${colors.border}`,
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.2rem" }}>{getAxeIcon(axe.key)}</span>
                      <span style={{ fontWeight: "600", color: colors.text }}>
                        {getAxeLabel(axe.key)}
                      </span>
                    </div>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "16px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      background: "white",
                      color: colors.text,
                    }}>
                      {getOrientationLabel(axe.orientation)}
                    </span>
                  </div>

                  {/* Barre de progression */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#6b7280" }}>
                        <span>Insuffisance</span>
                        <span>{Math.round(axe.insuffisance)}%</span>
                      </div>
                      <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{
                          width: `${axe.insuffisance}%`,
                          height: "100%",
                          background: "#3b82f6",
                          borderRadius: "3px",
                        }} />
                      </div>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#6b7280" }}>
                        <span>Sur-sollicitation</span>
                        <span>{Math.round(axe.surSollicitation)}%</span>
                      </div>
                      <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{
                          width: `${axe.surSollicitation}%`,
                          height: "100%",
                          background: "#ef4444",
                          borderRadius: "3px",
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Symptômes clés */}
                  {axe.symptomesCles?.length > 0 && (
                    <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {axe.symptomesCles.slice(0, 3).map((symptome, idx) => (
                        <span key={idx} style={{
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "0.7rem",
                          background: "rgba(255,255,255,0.7)",
                          color: colors.text,
                        }}>
                          {symptome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TERRAINS DÉTECTÉS */}
      {hasInterro && scoringResult?.terrainsDetectes?.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          borderRadius: "16px",
          border: "2px solid #f59e0b",
          padding: "20px",
        }}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "700",
            color: "#92400e",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            🎭 Terrains pathologiques détectés
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {scoringResult.terrainsDetectes.map((terrain, idx) => (
              <div key={idx} style={{
                background: "white",
                borderRadius: "12px",
                padding: "14px",
                border: "1px solid #fde68a",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "700", color: "#92400e", fontSize: "1rem" }}>
                    {terrain.terrain}
                  </span>
                  {/* CACHÉ: Score numérique non basé sur méthodologie Lapraz officielle */}
                </div>
                {terrain.indicateurs?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {terrain.indicateurs.map((ind, i) => (
                      <span key={i} style={{
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        background: "#fef3c7",
                        color: "#78350f",
                      }}>
                        {ind}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INDEX BDF HORS NORMES */}
      {hasBdf && indexHorsNormes.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
          borderRadius: "16px",
          border: "2px solid #ef4444",
          padding: "20px",
        }}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "700",
            color: "#991b1b",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            ⚠️ Index BdF hors normes ({indexHorsNormes.length})
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {indexHorsNormes.map((idx) => (
              <div key={idx.key} style={{
                background: "white",
                borderRadius: "10px",
                padding: "12px",
                border: "1px solid #fca5a5",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "600", color: "#374151", fontSize: "0.9rem" }}>
                    {idx.label}
                  </span>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    background: idx.status === "bas" ? "#dbeafe" : "#fee2e2",
                    color: idx.status === "bas" ? "#1e40af" : "#991b1b",
                  }}>
                    {idx.status === "bas" ? "↓ BAS" : "↑ HAUT"}
                  </span>
                </div>
                <div style={{ marginTop: "6px", display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: "700", color: idx.status === "bas" ? "#1e40af" : "#991b1b" }}>
                    {typeof idx.value === "number" ? idx.value.toFixed(2) : idx.value}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    (norme: {idx.min?.toFixed(2)} - {idx.max?.toFixed(2)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER INFO */}
      <div style={{
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "16px",
        border: "1px solid #e5e7eb",
      }}>
        <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0, textAlign: "center" }}>
          💡 Cette synthèse est calculée localement (gratuit).
          Pour une analyse approfondie avec recommandations thérapeutiques, utilisez la <strong>Synthèse IA</strong>.
        </p>
      </div>
    </div>
  );
}
