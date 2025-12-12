"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { calculateAllIndexes } from "@/lib/bdf/calculateIndexes";
import { calculateAxeScores } from "@/lib/interrogatoire/calculateAxeScores";
import type { BdfResult } from "@/lib/bdf/calculateIndexes";
import type { AxeType } from "@/lib/interrogatoire/axeInterpretation";
import type { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";
import type { UnifiedAnalysisOutput } from "@/types/clinical-engine";
import { runUnifiedAnalysis } from "@/app/actions/clinical-pipeline";
import type { BdfSynthesisResponse } from "@/app/api/bdf/synthesis/route";
import { LocalSynthesisDisplay } from "./LocalSynthesisDisplay";
import { calculateClinicalScoresV3, type ScoringResultV3 } from "@/lib/interrogatoire/clinicalScoringV3";

// Temps estimé pour la génération avec 4 VectorStores IA (en secondes)
// Endobiogénie + Phytothérapie + Aromathérapie + Gemmothérapie
const ESTIMATED_GENERATION_TIME = 35;

type PatientData = {
  id: string;
  numeroPatient: string;
  nom: string;
  prenom: string;
  sexe: string | null;
  bdfAnalyses?: any[];
  interrogatoire?: any;
};

// Configuration des panneaux fonctionnels pour la vue Biologie
const BDF_PANELS = [
  { id: "neurovegetatif", title: "NEUROVÉGÉTATIF", icon: "🧠", color: "#6366f1" },
  { id: "adaptation", title: "ADAPTATION", icon: "⚡", color: "#10b981" },
  { id: "thyreotrope", title: "THYRÉOTROPE", icon: "🦋", color: "#0ea5e9" },
  { id: "gonadotrope", title: "GONADOTROPE", icon: "⚤", color: "#ec4899" },
  { id: "somatotrope", title: "SOMATOTROPE", icon: "💪", color: "#f97316" },
  { id: "metabolique", title: "MÉTABOLIQUE", icon: "🔥", color: "#f59e0b" },
];

export function OngletSynthese({ patient }: { patient: PatientData }) {
  const [isPending, startTransition] = useTransition();
  const [interrogatoireData, setInterrogatoireData] = useState<any>(null);
  const [bdfData, setBdfData] = useState<BdfResult | null>(null);
  const [axeScores, setAxeScores] = useState<Array<{ axe: AxeType; score: number; status: "critical" | "warning" | "normal" }>>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [synthesis, setSynthesis] = useState<UnifiedAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [bdfSynthesis, setBdfSynthesis] = useState<BdfSynthesisResponse | null>(null);
  const [showBdfSynthesis, setShowBdfSynthesis] = useState(false);
  const [scoringV3, setScoringV3] = useState<ScoringResultV3 | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        // Charger l'interrogatoire
        const interroRes = await fetch(`/api/interrogatoire/update?patientId=${patient.id}`);
        const interroData = await interroRes.json();
        if (interroData.interrogatoire) {
          const interrogatoire = interroData.interrogatoire as InterrogatoireEndobiogenique;
          setInterrogatoireData(interrogatoire);
          const scores = calculateAxeScores(interrogatoire);
          setAxeScores(scores);

          // Calcul ScoringV3 pour la synthèse locale
          if (interrogatoire?.v2?.answersByAxis) {
            try {
              const patientSexe = (patient.sexe === "F" ? "F" : "H") as "H" | "F";
              const scoringResult = calculateClinicalScoresV3(
                interrogatoire.v2.answersByAxis,
                patientSexe
              );
              setScoringV3(scoringResult);
              console.log("[OngletSynthese] ScoringV3 calculé:", Object.keys(scoringResult.axes || {}));
            } catch (err) {
              console.error("[OngletSynthese] Erreur ScoringV3:", err);
            }
          }
        }

        // Charger les données BdF et calculer les indexes
        if (patient.bdfAnalyses && patient.bdfAnalyses.length > 0) {
          const lastBdfAnalysis = patient.bdfAnalyses[0];
          if (lastBdfAnalysis.inputs) {
            try {
              const biomarkers = lastBdfAnalysis.inputs as Record<string, number | null>;
              const result = calculateAllIndexes(biomarkers);
              setBdfData(result);
            } catch (error) {
              console.error("Erreur calcul BdF:", error);
            }
          }

          // Vérifier si une synthèse BdF existe déjà
          if (lastBdfAnalysis.summary) {
            try {
              const parsed = JSON.parse(lastBdfAnalysis.summary);
              if (parsed.synthesisVS) {
                setBdfSynthesis(parsed.synthesisVS);
                console.log("[OngletSynthese] Synthèse BdF existante trouvée");
              }
            } catch {
              // summary n'est pas au format synthèse VS
            }
          }
        }

        // Charger la dernière synthèse unifiée sauvegardée
        try {
          const syntheseRes = await fetch(`/api/unified-synthesis?patientId=${patient.id}`);
          if (syntheseRes.ok) {
            const syntheseData = await syntheseRes.json();
            if (syntheseData.synthesis?.content) {
              setSynthesis(syntheseData.synthesis.content as UnifiedAnalysisOutput);
            }
          }
        } catch (error) {
          console.error("Erreur chargement synthèse unifiée:", error);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [patient.id, patient.bdfAnalyses]);

  const hasInterrogatoire = interrogatoireData !== null;
  const hasBdf = bdfData !== null;
  const hasAnyData = hasInterrogatoire || hasBdf;

  // Calculer la complétude des données (basé sur les axes remplis et BdF)
  const calculateCompletude = (): number => {
    let score = 0;
    let total = 0;

    // BdF compte pour 40%
    total += 40;
    if (hasBdf) score += 40;

    // Interrogatoire compte pour 60% (basé sur les axes remplis)
    total += 60;
    if (hasInterrogatoire && interrogatoireData?.v2?.answersByAxis) {
      const allAxes = ["neuro", "adaptatif", "thyro", "gonado", "somato", "digestif", "cardioMetabo", "dermato", "immuno"];
      const filledAxes = Object.entries(interrogatoireData.v2.answersByAxis)
        .filter(([_, answers]) => answers && Object.keys(answers as object).length > 0)
        .length;
      score += Math.round((filledAxes / allAxes.length) * 60);
    }

    return Math.round((score / total) * 100);
  };

  const completudeScore = calculateCompletude();

  // Générer la synthèse avec le nouveau pipeline unifié
  const handleGenerateSynthesis = () => {
    setError(null);

    // Démarrer le countdown
    setCountdown(ESTIMATED_GENERATION_TIME);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Ne pas arrêter l'intervalle ici, on continue à 0 jusqu'à la fin réelle
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    startTransition(async () => {
      try {
        const result = await runUnifiedAnalysis(patient.id);
        setSynthesis(result.content as unknown as UnifiedAnalysisOutput);
      } catch (err: any) {
        console.error("Erreur génération synthèse:", err);
        setError(err.message || "Une erreur est survenue lors de la génération");
      } finally {
        // Arrêter le countdown
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        setCountdown(0);
      }
    });
  };

  // Cleanup du countdown au démontage
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Fonctions utilitaires pour les couleurs basées sur l'axe dominant
  const getTerrainColor = (axeDominant: string) => {
    switch (axeDominant) {
      case 'Corticotrope': return { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' };
      case 'Thyréotrope': return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' };
      case 'Gonadotrope': return { bg: '#fdf2f8', border: '#ec4899', text: '#9d174d' };
      case 'Somatotrope': return { bg: '#fff7ed', border: '#f97316', text: '#9a3412' };
      case 'Mixte': return { bg: '#faf5ff', border: '#a855f7', text: '#6b21a8' };
      default: return { bg: '#f9fafb', border: '#9ca3af', text: '#374151' };
    }
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('hyper')) return { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' };
    if (status.toLowerCase().includes('hypo')) return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' };
    if (status.toLowerCase().includes('normo')) return { bg: '#f0fdf4', border: '#22c55e', text: '#166534' };
    return { bg: '#f9fafb', border: '#9ca3af', text: '#374151' };
  };

  const getAxisIcon = (axis: string) => {
    switch (axis) {
      case 'Corticotrope': return '⚡';
      case 'Thyréotrope': return '🦋';
      case 'Gonadotrope': return '♀';
      case 'Somatotrope': return '💪';
      default: return '🔬';
    }
  };

  return (
    <div style={{ padding: "0" }}>
      {/* Chargement */}
      {loadingData && (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <div style={{
            display: "inline-block",
            width: "48px",
            height: "48px",
            border: "4px solid #e5e7eb",
            borderTopColor: "#8b5cf6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ color: "#6b7280", marginTop: "16px" }}>Chargement des données...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loadingData && (
        <>
          {/* ===== SECTION DONNÉES : 2 COLONNES ===== */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "32px",
          }}>
            {/* COLONNE GAUCHE : CLINIQUE */}
            <div style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              borderRadius: "16px",
              border: "2px solid #f59e0b",
              padding: "24px",
            }}>
              <h3 style={{
                fontSize: "1.2rem",
                fontWeight: "700",
                color: "#92400e",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                📋 DONNÉES CLINIQUES
              </h3>

              {hasInterrogatoire ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {axeScores.length > 0 ? (
                    axeScores.map((score, idx) => (
                      <div key={idx} style={{
                        background: "white",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        border: `2px solid ${score.status === 'critical' ? '#ef4444' : score.status === 'warning' ? '#f59e0b' : '#22c55e'}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "600", color: "#374151" }}>{score.axe}</span>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            background: score.status === 'critical' ? '#fee2e2' : score.status === 'warning' ? '#fef3c7' : '#dcfce7',
                            color: score.status === 'critical' ? '#991b1b' : score.status === 'warning' ? '#92400e' : '#166534',
                          }}>
                            {score.score}%
                          </span>
                        </div>
                        <div style={{
                          marginTop: "8px",
                          height: "6px",
                          background: "#e5e7eb",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}>
                          <div style={{
                            width: `${score.score}%`,
                            height: "100%",
                            borderRadius: "3px",
                            background: score.status === 'critical' ? '#ef4444' : score.status === 'warning' ? '#f59e0b' : '#22c55e',
                          }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    // Interrogatoire existe mais pas de scores calculés - afficher les axes remplis
                    <div style={{
                      background: "white",
                      borderRadius: "10px",
                      padding: "16px",
                      border: "2px solid #22c55e",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "1.2rem" }}>✅</span>
                        <span style={{ fontWeight: "600", color: "#166534" }}>Interrogatoire disponible</span>
                      </div>
                      {interrogatoireData?.v2?.answersByAxis && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {Object.entries(interrogatoireData.v2.answersByAxis)
                            .filter(([_, answers]) => answers && Object.keys(answers as object).length > 0)
                            .map(([axe, _]) => (
                              <span key={axe} style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "0.8rem",
                                background: "#dcfce7",
                                color: "#166534",
                                fontWeight: "500",
                              }}>
                                {axe}
                              </span>
                            ))}
                        </div>
                      )}
                      <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "12px" }}>
                        Les scores par axe seront calculés lors de la synthese
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                }}>
                  <span style={{ fontSize: "2rem", marginBottom: "8px", display: "block" }}>📝</span>
                  <p>Aucun interrogatoire rempli</p>
                </div>
              )}
            </div>

            {/* COLONNE DROITE : BIOLOGIE */}
            <div style={{
              background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
              borderRadius: "16px",
              border: "2px solid #3b82f6",
              padding: "24px",
            }}>
              <h3 style={{
                fontSize: "1.2rem",
                fontWeight: "700",
                color: "#1e40af",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                🧬 DONNÉES BIOLOGIQUES (BdF)
              </h3>

              {hasBdf && bdfData ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {Object.entries(bdfData.indexes || {})
                    .filter(([_, data]: [string, any]) => data?.value != null && !isNaN(data.value))
                    .map(([key, data]: [string, any], idx) => (
                    <div key={idx} style={{
                      background: "white",
                      borderRadius: "10px",
                      padding: "12px",
                      border: "1px solid #bfdbfe",
                    }}>
                      <div style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        fontWeight: "600",
                        color: "#3b82f6",
                        marginBottom: "4px",
                      }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div style={{
                        fontSize: "1.3rem",
                        fontWeight: "700",
                        color: "#1e40af",
                      }}>
                        {data.value.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {Object.entries(bdfData.indexes || {})
                    .filter(([_, data]: [string, any]) => data?.value != null && !isNaN(data.value))
                    .length === 0 && (
                    <div style={{
                      gridColumn: "1 / -1",
                      background: "white",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                      color: "#6b7280",
                    }}>
                      <p>Index non calculables (données insuffisantes)</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                }}>
                  <span style={{ fontSize: "2rem", marginBottom: "8px", display: "block" }}>🔬</span>
                  <p>Aucune analyse BdF saisie</p>
                </div>
              )}
            </div>
          </div>

          {/* ===== SYNTHÈSE BdF EXISTANTE (si générée depuis Analyses) ===== */}
          {bdfSynthesis && (
            <div style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              borderRadius: "16px",
              border: "2px solid #10b981",
              padding: "20px",
              marginBottom: "24px",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: showBdfSynthesis ? "16px" : "0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "1.5rem" }}>✅</span>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#065f46", margin: 0 }}>
                      Synthèse BdF disponible
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "#047857", margin: "4px 0 0 0" }}>
                      Générée depuis l'onglet Analyses - Prête pour la synthèse unifiée
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBdfSynthesis(!showBdfSynthesis)}
                  style={{
                    padding: "10px 20px",
                    background: showBdfSynthesis ? "#6b7280" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {showBdfSynthesis ? "Masquer" : "👁️ Voir Synthèse BdF"}
                </button>
              </div>

              {/* Contenu de la synthèse BdF (dépliable) */}
              {showBdfSynthesis && (
                <div style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid #a7f3d0",
                }}>
                  {/* Terrain - Détection des anciennes synthèses invalides */}
                  <div style={{ marginBottom: "16px" }}>
                    {/* Avertissement si ancienne synthèse avec type Alpha/Beta/Gamma/Delta */}
                    {(bdfSynthesis.terrain as any).type && !bdfSynthesis.terrain.axeDominant && (
                      <div style={{
                        background: "#fef2f2",
                        border: "2px solid #ef4444",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "12px",
                      }}>
                        <strong style={{ color: "#dc2626" }}>⚠️ Ancienne synthèse invalide détectée</strong>
                        <p style={{ fontSize: "0.85rem", color: "#b91c1c", margin: "8px 0 0 0" }}>
                          Cette synthèse utilise la classification "{(bdfSynthesis.terrain as any).type}" qui n'existe pas en endobiogénie.
                          Veuillez régénérer la synthèse BdF depuis l'onglet Analyses.
                        </p>
                      </div>
                    )}
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#065f46", marginBottom: "8px" }}>
                      🌿 Terrain: {bdfSynthesis.terrain.axeDominant
                        ? `Axe ${bdfSynthesis.terrain.axeDominant} - ${bdfSynthesis.terrain.profilSNA || ""}`
                        : (bdfSynthesis.terrain as any).type
                          ? `⚠️ "${(bdfSynthesis.terrain as any).type}" (invalide - régénérer)`
                          : "Non déterminé"}
                    </h4>
                    <p style={{ fontSize: "0.9rem", color: "#047857" }}>
                      {bdfSynthesis.terrain.description || bdfSynthesis.terrain.justification}
                    </p>
                  </div>

                  {/* Axes Endocriniens */}
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#92400e", marginBottom: "8px" }}>
                      ⚙️ Axes Endocriniens
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                      {bdfSynthesis.axesEndocriniens.map((axe, idx) => (
                        <div key={idx} style={{
                          padding: "10px",
                          background: "#fef3c7",
                          borderRadius: "8px",
                          border: "1px solid #fbbf24",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ color: "#92400e" }}>{axe.axis}</strong>
                            <span style={{
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              background: axe.status === "Hyper" ? "#fee2e2" : axe.status === "Hypo" ? "#e0e7ff" : "#d1fae5",
                              color: axe.status === "Hyper" ? "#dc2626" : axe.status === "Hypo" ? "#4338ca" : "#059669",
                            }}>
                              {axe.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Neuro-végétatif */}
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#5b21b6", marginBottom: "8px" }}>
                      🧠 Neuro-végétatif: {bdfSynthesis.neuroVegetatifBio.status}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "#6d28d9" }}>
                      Dominance: {bdfSynthesis.neuroVegetatifBio.dominance}
                    </p>
                  </div>

                  {/* Drainage */}
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0e7490", marginBottom: "8px" }}>
                      💧 Drainage - Priorité: {bdfSynthesis.drainage.priorite}
                    </h4>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{
                        padding: "4px 12px",
                        background: bdfSynthesis.drainage.necessite ? "#fee2e2" : "#d1fae5",
                        color: bdfSynthesis.drainage.necessite ? "#dc2626" : "#059669",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}>
                        {bdfSynthesis.drainage.necessite ? "Drainage nécessaire" : "Drainage non nécessaire"}
                      </span>
                      <span style={{
                        padding: "4px 12px",
                        background: "#e0e7ff",
                        color: "#4338ca",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                      }}>
                        Capacité tampon: {bdfSynthesis.drainage.capaciteTampon}%
                      </span>
                    </div>
                  </div>

                  {/* Spasmophilie */}
                  {bdfSynthesis.spasmophilie?.detectee && (
                    <div style={{
                      padding: "12px",
                      background: "#fef2f2",
                      borderRadius: "8px",
                      border: "1px solid #fca5a5",
                    }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#b91c1c", marginBottom: "4px" }}>
                        ⚡ Spasmophilie Type {bdfSynthesis.spasmophilie.type}: {bdfSynthesis.spasmophilie.nom}
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "#dc2626", margin: 0 }}>
                        {bdfSynthesis.spasmophilie.description}
                      </p>
                    </div>
                  )}

                  {/* Message d'info */}
                  <div style={{
                    marginTop: "16px",
                    padding: "12px",
                    background: "#eff6ff",
                    borderRadius: "8px",
                    border: "1px solid #bfdbfe",
                  }}>
                    <p style={{ fontSize: "0.85rem", color: "#1e40af", margin: 0 }}>
                      💡 Cette synthèse BdF sera automatiquement intégrée dans la synthèse unifiée pour économiser des tokens API.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== SYNTHÈSE LOCALE (GRATUIT) ===== */}
          {hasAnyData && !synthesis && (
            <div style={{ marginBottom: "24px" }}>
              <LocalSynthesisDisplay
                bdfResult={bdfData}
                scoringResult={scoringV3}
                patientSexe={(patient.sexe === "F" ? "F" : "H") as "H" | "F"}
              />
            </div>
          )}

          {/* ===== BOUTON GÉNÉRATION IA (OPTIONNEL) ===== */}
          <div style={{
            background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
            borderRadius: "16px",
            border: "2px solid #8b5cf6",
            padding: "24px",
            marginBottom: "32px",
            textAlign: "center",
          }}>
            <button
              onClick={handleGenerateSynthesis}
              disabled={!hasAnyData || isPending}
              style={{
                padding: "16px 48px",
                background: !hasAnyData || isPending
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: !hasAnyData || isPending ? "not-allowed" : "pointer",
                boxShadow: !hasAnyData || isPending ? "none" : "0 4px 15px rgba(139, 92, 246, 0.4)",
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {isPending ? (
                <>
                  <span style={{
                    display: "inline-block",
                    width: "20px",
                    height: "20px",
                    border: "3px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }} />
                  Analyse IA en cours...
                </>
              ) : (
                <>
                  <span style={{ fontSize: "1.3rem" }}>🧠</span>
                  SYNTHÈSE IA APPROFONDIE
                  <span style={{
                    fontSize: "0.7rem",
                    background: "rgba(255,255,255,0.2)",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    marginLeft: "8px"
                  }}>
                    Optionnel
                  </span>
                </>
              )}
            </button>

            {/* Indicateur de countdown pendant la génération */}
            {isPending && (
              <div style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}>
                {/* Barre de progression */}
                <div style={{
                  width: "300px",
                  height: "8px",
                  background: "#e5e7eb",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${Math.max(0, (1 - countdown / ESTIMATED_GENERATION_TIME) * 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)",
                    borderRadius: "4px",
                    transition: "width 1s linear",
                  }} />
                </div>

                {/* Temps restant avec sablier */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "rgba(139, 92, 246, 0.1)",
                  borderRadius: "20px",
                }}>
                  <span style={{ fontSize: "1.2rem", animation: "pulse 1s ease-in-out infinite" }}>
                    ⏳
                  </span>
                  <span style={{ color: "#6366f1", fontWeight: "600" }}>
                    {countdown > 0 ? `~${countdown}s restantes` : "Finalisation..."}
                  </span>
                </div>

                {/* Message informatif */}
                <p style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  textAlign: "center",
                  maxWidth: "400px",
                }}>
                  Analyse par 4 bases documentaires IA : Endobiogénie, Phytothérapie, Gemmothérapie, Aromathérapie
                </p>
              </div>
            )}

            <style>{`
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
            `}</style>
            {!hasAnyData && (
              <p style={{ color: "#6b7280", marginTop: "12px", fontSize: "0.9rem" }}>
                Remplissez l'interrogatoire ou saisissez une BdF pour générer la synthèse
              </p>
            )}
            {hasAnyData && !isPending && (
              <p style={{ color: "#6b7280", marginTop: "12px", fontSize: "0.85rem", maxWidth: "500px", margin: "12px auto 0" }}>
                La synthèse locale (ci-dessus) est gratuite et instantanée.
                L'IA approfondit l'analyse avec des recommandations thérapeutiques personnalisées.
              </p>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div style={{
              background: "#fef2f2",
              border: "2px solid #ef4444",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                <div>
                  <h4 style={{ fontWeight: "700", color: "#991b1b", marginBottom: "4px" }}>Erreur de génération</h4>
                  <p style={{ color: "#b91c1c", fontSize: "0.9rem" }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== RÉSULTAT SYNTHÈSE IA ===== */}
          {synthesis && !isPending && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* TERRAIN ENDOBIOGÉNIQUE */}
              <div style={{
                background: `linear-gradient(135deg, ${getTerrainColor(synthesis.terrain?.axeDominant || '').bg} 0%, white 100%)`,
                borderRadius: "16px",
                border: `3px solid ${getTerrainColor(synthesis.terrain?.axeDominant || '').border}`,
                padding: "24px",
              }}>
                <h3 style={{
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: getTerrainColor(synthesis.terrain?.axeDominant || '').text,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  🏔️ Terrain Endobiogénique
                </h3>
                <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      background: getTerrainColor(synthesis.terrain?.axeDominant || '').border,
                      color: "white",
                      textAlign: "center",
                    }}>
                      Axe {synthesis.terrain?.axeDominant || 'N/A'}
                    </span>
                    <span style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      background: "#f3f4f6",
                      color: "#374151",
                      textAlign: "center",
                    }}>
                      {synthesis.terrain?.profilSNA || 'N/A'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#374151", lineHeight: "1.6", marginBottom: "8px" }}>
                      {synthesis.terrain?.description || synthesis.terrain?.justification}
                    </p>
                    {synthesis.terrain?.justification && synthesis.terrain?.description && (
                      <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: "1.5" }}>
                        {synthesis.terrain.justification}
                      </p>
                    )}
                    {synthesis.terrain?.pedagogicalHint && (
                      <p style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#f3f4f6",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        color: "#6b7280",
                      }}>
                        💡 {synthesis.terrain.pedagogicalHint}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ÉQUILIBRE NEURO-VÉGÉTATIF */}
              {synthesis.neuroVegetative && (
                <div style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  borderRadius: "16px",
                  border: "2px solid #22c55e",
                  padding: "24px",
                }}>
                  <h3 style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#166534",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    ⚡ Équilibre Neuro-Végétatif
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                    <span style={{
                      padding: "8px 20px",
                      borderRadius: "20px",
                      fontWeight: "700",
                      background: synthesis.neuroVegetative.status === 'Sympathicotonia' ? '#fee2e2' :
                        synthesis.neuroVegetative.status === 'Parasympathicotonia' ? '#dbeafe' :
                          synthesis.neuroVegetative.status === 'Eutonia' ? '#dcfce7' : '#fef3c7',
                      color: synthesis.neuroVegetative.status === 'Sympathicotonia' ? '#991b1b' :
                        synthesis.neuroVegetative.status === 'Parasympathicotonia' ? '#1e40af' :
                          synthesis.neuroVegetative.status === 'Eutonia' ? '#166534' : '#92400e',
                    }}>
                      {synthesis.neuroVegetative.status}
                    </span>
                    <span style={{
                      padding: "6px 14px",
                      borderRadius: "16px",
                      fontSize: "0.85rem",
                      background: "#f3f4f6",
                      color: "#6b7280",
                    }}>
                      {synthesis.neuroVegetative.dominance}
                    </span>
                  </div>
                  <p style={{ color: "#374151", lineHeight: "1.6" }}>
                    {synthesis.neuroVegetative.explanation}
                  </p>
                </div>
              )}

              {/* AXES ENDOCRINIENS */}
              {synthesis.endocrineAxes && synthesis.endocrineAxes.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                  borderRadius: "16px",
                  border: "2px solid #6366f1",
                  padding: "24px",
                }}>
                  <h3 style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#3730a3",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    🧬 Axes Endocriniens
                  </h3>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                  }}>
                    {synthesis.endocrineAxes.map((axe, idx) => {
                      const colors = getStatusColor(axe.status);
                      return (
                        <div key={idx} style={{
                          background: "white",
                          borderRadius: "12px",
                          padding: "16px",
                          border: `2px solid ${colors.border}`,
                        }}>
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "1.3rem" }}>{getAxisIcon(axe.axis)}</span>
                              <span style={{ fontWeight: "700", color: "#374151" }}>{axe.axis}</span>
                            </div>
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              background: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                            }}>
                              {axe.status}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: "1.5" }}>
                            {axe.mechanism}
                          </p>
                          {axe.biomarkers && axe.biomarkers.length > 0 && (
                            <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {axe.biomarkers.map((bio, i) => (
                                <span key={i} style={{
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontSize: "0.75rem",
                                  background: "#f3f4f6",
                                  color: "#6b7280",
                                }}>
                                  {bio}
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

              {/* DRAINAGE (ÉMONCTOIRES) */}
              {synthesis.drainage && (
                <div style={{
                  background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                  borderRadius: "16px",
                  border: "2px solid #059669",
                  padding: "24px",
                }}>
                  <h3 style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#047857",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    🚿 Analyse du Drainage
                    {(() => {
                      // Normaliser la priorité (peut être string ou objet)
                      const prioriteRaw = synthesis.drainage.priorite;
                      const priorite = typeof prioriteRaw === 'string' ? prioriteRaw.toLowerCase() : 'basse';
                      const isUrgent = priorite.includes('urgent') || priorite.includes('haute') || priorite.includes('high');
                      const isMoyenne = priorite.includes('moyen') || priorite.includes('moder') || priorite.includes('medium');

                      return (
                        <span style={{
                          marginLeft: "auto",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          background: !synthesis.drainage.necessite ? '#f0fdf4'
                            : isUrgent ? '#fef2f2'
                            : isMoyenne ? '#fef3c7'
                            : '#ecfdf5',
                          color: !synthesis.drainage.necessite ? '#16a34a'
                            : isUrgent ? '#dc2626'
                            : isMoyenne ? '#d97706'
                            : '#059669',
                          border: `1px solid ${!synthesis.drainage.necessite ? '#86efac'
                            : isUrgent ? '#fca5a5'
                            : isMoyenne ? '#fcd34d'
                            : '#6ee7b7'}`,
                        }}>
                          {!synthesis.drainage.necessite
                            ? 'Non nécessaire'
                            : isUrgent
                              ? '⚠️ Priorité Haute'
                              : isMoyenne
                                ? 'Priorité Moyenne'
                                : 'Recommandé'}
                        </span>
                      );
                    })()}
                  </h3>

                  {synthesis.drainage.necessite && (
                    <>
                      {/* Stratégie de drainage */}
                      <div style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "16px",
                        border: "1px solid #a7f3d0",
                      }}>
                        {/* Formater strategieDrainage qui peut être string ou objet - nettoyer [object Object] */}
                        {synthesis.drainage.strategieDrainage && (
                          <p style={{ color: "#374151", lineHeight: "1.6", marginBottom: "8px" }}>
                            {(() => {
                              const raw = synthesis.drainage.strategieDrainage;
                              if (typeof raw === 'string') {
                                // Nettoyer toute trace de [object Object]
                                const cleaned = raw.replace(/\[object Object\]/g, '').replace(/,\s*,/g, ',').replace(/:\s*,/g, ': ').trim();
                                return cleaned || "Drainage hépatique et rénal recommandé";
                              }
                              return (raw as any)?.description || (raw as any)?.text || "Drainage hépatique et rénal recommandé";
                            })()}
                          </p>
                        )}
                        {synthesis.drainage.dureeTotale && (
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.85rem", color: "#059669", fontWeight: "600" }}>
                              Durée: {typeof synthesis.drainage.dureeTotale === 'string'
                                ? synthesis.drainage.dureeTotale
                                : "2-3 semaines"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Émonctoires */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" }}>
                        {synthesis.drainage.emonctoires
                          .filter((e: any) => e.statut === 'sature' || e.statut === 'sollicite' || e.statut === 'Surchargé')
                          .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                          .map((emonctoire: any, idx: number) => {
                            // Normaliser le nom de l'organe (peut être en minuscules ou majuscules)
                            const organeRaw = emonctoire.organe || emonctoire.nom || emonctoire.name || "Émonctoire";
                            const organeName = typeof organeRaw === 'string' ? organeRaw : String(organeRaw);
                            const organeNormalized = organeName.toLowerCase();

                            // Obtenir les indicateurs (peuvent être dans différents champs)
                            const indicateurs = emonctoire.indicateurs || emonctoire.signesCliniques || emonctoire.signes || [];
                            const indicateursArray = Array.isArray(indicateurs) ? indicateurs : [];

                            // Obtenir les plantes (peuvent être dans différents champs)
                            const plantes = emonctoire.plantesRecommandees || emonctoire.plantes || [];
                            const plantesArray = Array.isArray(plantes) ? plantes : [];

                            return (
                              <div key={idx} style={{
                                background: "white",
                                borderRadius: "10px",
                                padding: "14px",
                                border: "2px solid #fca5a5",
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                  <span style={{ fontWeight: "700", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}>
                                    {organeNormalized.includes('foie') && '🫀'}
                                    {organeNormalized.includes('rein') && '💧'}
                                    {organeNormalized.includes('intestin') && '🌀'}
                                    {organeNormalized.includes('peau') && '🧴'}
                                    {organeNormalized.includes('poumon') && '🌬️'}
                                    {organeNormalized.includes('lymphe') && '💜'}
                                    <span className="capitalize">{organeName}</span>
                                  </span>
                                  {(emonctoire.score || emonctoire.prioriteDrainage) && (
                                    <span style={{
                                      padding: "2px 8px",
                                      borderRadius: "12px",
                                      fontSize: "0.7rem",
                                      fontWeight: "600",
                                      background: "#fee2e2",
                                      color: "#991b1b",
                                    }}>
                                      {emonctoire.score ? `Score ${emonctoire.score}` : `Priorité ${emonctoire.prioriteDrainage}`}
                                    </span>
                                  )}
                                </div>
                                {indicateursArray.length > 0 && (
                                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "8px" }}>
                                    {indicateursArray.map((ind: any) => typeof ind === 'string' ? ind : ind?.label || ind?.nom || String(ind)).join(', ')}
                                  </p>
                                )}
                                {plantesArray.length > 0 && (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                    {plantesArray.map((plante: any, i: number) => (
                                      <span key={i} style={{
                                        padding: "2px 8px",
                                        borderRadius: "10px",
                                        fontSize: "0.75rem",
                                        background: "#d1fae5",
                                        color: "#047857",
                                      }}>
                                        {typeof plante === 'string' ? plante : plante?.nom || plante?.name || String(plante)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {emonctoire.strategieDrainage && (
                                  <p style={{ fontSize: "0.75rem", color: "#059669", marginTop: "8px", fontStyle: "italic" }}>
                                    {typeof emonctoire.strategieDrainage === 'string'
                                      ? emonctoire.strategieDrainage.replace(/\[object Object\]/g, '').trim()
                                      : (emonctoire.strategieDrainage as any)?.description
                                        || (emonctoire.strategieDrainage as any)?.text
                                        || ""}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                      </div>

                      {/* Précautions */}
                      {synthesis.drainage.precautions && synthesis.drainage.precautions.length > 0 && (
                        <div style={{
                          background: "#fef3c7",
                          borderRadius: "8px",
                          padding: "12px",
                          border: "1px solid #fde68a",
                        }}>
                          <span style={{ fontSize: "0.85rem", color: "#92400e" }}>
                            ⚠️ {synthesis.drainage.precautions.join(' • ')}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {synthesis.drainage.pedagogicalHint && (
                    <p style={{
                      marginTop: "12px",
                      padding: "12px",
                      background: "#f0fdf4",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      color: "#166534",
                      fontStyle: "italic",
                    }}>
                      💡 {synthesis.drainage.pedagogicalHint}
                    </p>
                  )}
                </div>
              )}

              {/* SPASMOPHILIE */}
              {synthesis.spasmophilie && (
                <div style={{
                  background: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)",
                  borderRadius: "16px",
                  border: "2px solid #a855f7",
                  padding: "24px",
                }}>
                  <h3 style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#7e22ce",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    ⚡ Terrain Spasmophile
                    <span style={{
                      marginLeft: "auto",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      background: synthesis.spasmophilie.severite === 'Sévère' ? '#fef2f2' :
                        synthesis.spasmophilie.severite === 'Modéré' ? '#fef3c7' :
                          synthesis.spasmophilie.severite === 'Léger' ? '#eff6ff' : '#f0fdf4',
                      color: synthesis.spasmophilie.severite === 'Sévère' ? '#dc2626' :
                        synthesis.spasmophilie.severite === 'Modéré' ? '#d97706' :
                          synthesis.spasmophilie.severite === 'Léger' ? '#2563eb' : '#16a34a',
                    }}>
                      Score: {synthesis.spasmophilie.score}/100 - {synthesis.spasmophilie.severite}
                    </span>
                  </h3>

                  {synthesis.spasmophilie.severite !== 'Absent' && (
                    <>
                      {/* Signes cliniques */}
                      {synthesis.spasmophilie.signesCliniques && synthesis.spasmophilie.signesCliniques.length > 0 && (
                        <div style={{
                          background: "white",
                          borderRadius: "12px",
                          padding: "14px",
                          marginBottom: "16px",
                          border: "1px solid #e9d5ff",
                        }}>
                          <h4 style={{ fontWeight: "600", color: "#7e22ce", marginBottom: "8px", fontSize: "0.9rem" }}>
                            Signes cliniques:
                          </h4>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {synthesis.spasmophilie.signesCliniques.map((signe, idx) => (
                              <span key={idx} style={{
                                padding: "4px 12px",
                                borderRadius: "16px",
                                fontSize: "0.8rem",
                                background: "#fae8ff",
                                color: "#7e22ce",
                              }}>
                                {signe}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Signes biologiques */}
                      {synthesis.spasmophilie.signesBiologiques && synthesis.spasmophilie.signesBiologiques.length > 0 && (
                        <div style={{
                          background: "white",
                          borderRadius: "12px",
                          padding: "14px",
                          marginBottom: "16px",
                          border: "1px solid #e9d5ff",
                        }}>
                          <h4 style={{ fontWeight: "600", color: "#7e22ce", marginBottom: "8px", fontSize: "0.9rem" }}>
                            Marqueurs biologiques:
                          </h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                            {synthesis.spasmophilie.signesBiologiques.map((bio, idx) => (
                              <div key={idx} style={{
                                padding: "10px",
                                borderRadius: "8px",
                                background: "#f5f3ff",
                                textAlign: "center",
                              }}>
                                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{bio.parametre}</div>
                                <div style={{ fontSize: "1rem", fontWeight: "700", color: "#7e22ce" }}>{bio.valeur}</div>
                                <div style={{ fontSize: "0.7rem", color: "#a855f7" }}>{bio.interpretation}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Supplémentation recommandée */}
                      {synthesis.spasmophilie.supplementation && (
                        <div style={{
                          background: "white",
                          borderRadius: "12px",
                          padding: "14px",
                          marginBottom: "16px",
                          border: "1px solid #e9d5ff",
                        }}>
                          <h4 style={{ fontWeight: "600", color: "#7e22ce", marginBottom: "12px", fontSize: "0.9rem" }}>
                            💊 Supplémentation recommandée:
                          </h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                            {synthesis.spasmophilie.supplementation.magnesium && (
                              <div style={{ padding: "10px", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #86efac" }}>
                                <div style={{ fontWeight: "600", color: "#166534", fontSize: "0.85rem" }}>Magnésium</div>
                                <div style={{ fontSize: "0.8rem", color: "#374151" }}>
                                  {synthesis.spasmophilie.supplementation.magnesium.forme} - {synthesis.spasmophilie.supplementation.magnesium.posologie}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                  Durée: {synthesis.spasmophilie.supplementation.magnesium.duree}
                                </div>
                              </div>
                            )}
                            {synthesis.spasmophilie.supplementation.vitamineD && (
                              <div style={{ padding: "10px", borderRadius: "8px", background: "#fef3c7", border: "1px solid #fde68a" }}>
                                <div style={{ fontWeight: "600", color: "#92400e", fontSize: "0.85rem" }}>Vitamine D</div>
                                <div style={{ fontSize: "0.8rem", color: "#374151" }}>
                                  {synthesis.spasmophilie.supplementation.vitamineD.forme} - {synthesis.spasmophilie.supplementation.vitamineD.posologie}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                  Durée: {synthesis.spasmophilie.supplementation.vitamineD.duree}
                                </div>
                              </div>
                            )}
                            {synthesis.spasmophilie.supplementation.calcium && (
                              <div style={{ padding: "10px", borderRadius: "8px", background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                                <div style={{ fontWeight: "600", color: "#0369a1", fontSize: "0.85rem" }}>Calcium</div>
                                <div style={{ fontSize: "0.8rem", color: "#374151" }}>
                                  {synthesis.spasmophilie.supplementation.calcium.forme} - {synthesis.spasmophilie.supplementation.calcium.posologie}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                  Durée: {synthesis.spasmophilie.supplementation.calcium.duree}
                                </div>
                              </div>
                            )}
                            {synthesis.spasmophilie.supplementation.vitamineB6 && (
                              <div style={{ padding: "10px", borderRadius: "8px", background: "#fdf2f8", border: "1px solid #fbcfe8" }}>
                                <div style={{ fontWeight: "600", color: "#be185d", fontSize: "0.85rem" }}>Vitamine B6</div>
                                <div style={{ fontSize: "0.8rem", color: "#374151" }}>
                                  {synthesis.spasmophilie.supplementation.vitamineB6.posologie}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                  Durée: {synthesis.spasmophilie.supplementation.vitamineB6.duree}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Plantes anti-spasmophiliques */}
                      {synthesis.spasmophilie.plantesAntiSpasmophiliques && synthesis.spasmophilie.plantesAntiSpasmophiliques.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                          <h4 style={{ fontWeight: "600", color: "#7e22ce", marginBottom: "8px", fontSize: "0.9rem" }}>
                            🌿 Plantes anti-spasmophiliques:
                          </h4>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {synthesis.spasmophilie.plantesAntiSpasmophiliques.map((plante, idx) => (
                              <span key={idx} style={{
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "0.85rem",
                                fontWeight: "500",
                                background: "#d1fae5",
                                color: "#047857",
                              }}>
                                {plante}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conseils spécifiques */}
                      {synthesis.spasmophilie.conseilsSpecifiques && synthesis.spasmophilie.conseilsSpecifiques.length > 0 && (
                        <div style={{
                          background: "#fffbeb",
                          borderRadius: "8px",
                          padding: "12px",
                          border: "1px solid #fde68a",
                        }}>
                          <h5 style={{ fontWeight: "600", color: "#92400e", marginBottom: "6px", fontSize: "0.85rem" }}>
                            Conseils:
                          </h5>
                          <ul style={{ margin: 0, paddingLeft: "16px" }}>
                            {synthesis.spasmophilie.conseilsSpecifiques.map((conseil, idx) => (
                              <li key={idx} style={{ fontSize: "0.8rem", color: "#78350f", marginBottom: "2px" }}>
                                {conseil}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {synthesis.spasmophilie.pedagogicalHint && (
                    <p style={{
                      marginTop: "12px",
                      padding: "12px",
                      background: "#fdf4ff",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      color: "#7e22ce",
                      fontStyle: "italic",
                    }}>
                      💡 {synthesis.spasmophilie.pedagogicalHint}
                    </p>
                  )}
                </div>
              )}

              {/* SYNTHÈSE CLINIQUE */}
              {synthesis.clinicalSynthesis && (
                <div style={{
                  background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                  borderRadius: "16px",
                  border: "2px solid #f59e0b",
                  padding: "24px",
                }}>
                  <h3 style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#92400e",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    📋 Synthèse Clinique
                  </h3>

                  {/* Résumé */}
                  <div style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "16px",
                    border: "1px solid #fde68a",
                  }}>
                    <p style={{ color: "#374151", lineHeight: "1.7" }}>
                      {synthesis.clinicalSynthesis.summary}
                    </p>
                  </div>

                  {/* Score concordance */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "16px",
                  }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#6b7280" }}>
                      Concordance Bio-Clinique:
                    </span>
                    <div style={{
                      flex: 1,
                      height: "12px",
                      background: "#e5e7eb",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${synthesis.clinicalSynthesis.concordanceScore}%`,
                        height: "100%",
                        borderRadius: "6px",
                        background: synthesis.clinicalSynthesis.concordanceScore >= 70 ? '#22c55e' :
                          synthesis.clinicalSynthesis.concordanceScore >= 40 ? '#f59e0b' : '#ef4444',
                      }} />
                    </div>
                    <span style={{
                      fontSize: "1.2rem",
                      fontWeight: "800",
                      color: synthesis.clinicalSynthesis.concordanceScore >= 70 ? '#166534' :
                        synthesis.clinicalSynthesis.concordanceScore >= 40 ? '#92400e' : '#991b1b',
                    }}>
                      {synthesis.clinicalSynthesis.concordanceScore}%
                    </span>
                  </div>

                  {/* Mécanismes */}
                  {synthesis.clinicalSynthesis.mecanismesPhysiopathologiques &&
                    synthesis.clinicalSynthesis.mecanismesPhysiopathologiques.length > 0 && (
                      <div style={{
                        background: "#f9fafb",
                        borderRadius: "10px",
                        padding: "14px",
                        border: "1px solid #e5e7eb",
                      }}>
                        <h4 style={{ fontWeight: "600", color: "#374151", marginBottom: "8px", fontSize: "0.95rem" }}>
                          Mécanismes physiopathologiques:
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                          {synthesis.clinicalSynthesis.mecanismesPhysiopathologiques.map((meca, idx) => (
                            <li key={idx} style={{ color: "#4b5563", fontSize: "0.9rem", marginBottom: "4px" }}>
                              {meca}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              {/* STRATÉGIE THÉRAPEUTIQUE */}
              {synthesis.therapeuticStrategy && (
                <div style={{
                  background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
                  borderRadius: "16px",
                  border: "2px solid #14b8a6",
                  padding: "24px",
                }}>
                  <h3 style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#115e59",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    🎯 Stratégie Thérapeutique
                  </h3>

                  {/* Priorités */}
                  {synthesis.therapeuticStrategy.priorites && synthesis.therapeuticStrategy.priorites.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{ fontWeight: "600", color: "#115e59", marginBottom: "12px" }}>Priorités:</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {synthesis.therapeuticStrategy.priorites.map((priorite, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "start",
                            gap: "12px",
                            padding: "12px",
                            background: "white",
                            borderRadius: "10px",
                            border: "1px solid #99f6e4",
                          }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "#14b8a6",
                              color: "white",
                              fontWeight: "700",
                              fontSize: "0.9rem",
                              flexShrink: 0,
                            }}>
                              {idx + 1}
                            </span>
                            <span style={{ color: "#134e4a", fontSize: "0.95rem" }}>{priorite}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Objectifs */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}>
                    {synthesis.therapeuticStrategy.objectifsCourtTerme && synthesis.therapeuticStrategy.objectifsCourtTerme.length > 0 && (
                      <div style={{
                        background: "white",
                        borderRadius: "10px",
                        padding: "14px",
                        border: "1px solid #99f6e4",
                      }}>
                        <h5 style={{ fontWeight: "600", color: "#0d9488", marginBottom: "8px", fontSize: "0.9rem" }}>
                          Court terme (1-2 mois)
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: "16px" }}>
                          {synthesis.therapeuticStrategy.objectifsCourtTerme.map((obj, idx) => (
                            <li key={idx} style={{ color: "#374151", fontSize: "0.85rem", marginBottom: "4px" }}>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {synthesis.therapeuticStrategy.objectifsMoyenTerme && synthesis.therapeuticStrategy.objectifsMoyenTerme.length > 0 && (
                      <div style={{
                        background: "white",
                        borderRadius: "10px",
                        padding: "14px",
                        border: "1px solid #99f6e4",
                      }}>
                        <h5 style={{ fontWeight: "600", color: "#0d9488", marginBottom: "8px", fontSize: "0.9rem" }}>
                          Moyen terme (3-6 mois)
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: "16px" }}>
                          {synthesis.therapeuticStrategy.objectifsMoyenTerme.map((obj, idx) => (
                            <li key={idx} style={{ color: "#374151", fontSize: "0.85rem", marginBottom: "4px" }}>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRESCRIPTION SUGGÉRÉE */}
              {synthesis.suggestedPrescription && (
                <div style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  borderRadius: "16px",
                  border: "2px solid #22c55e",
                  padding: "24px",
                }}>
                  <h3 style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#166534",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    🌿 Prescription Suggérée
                  </h3>

                  {/* Phytothérapie */}
                  {synthesis.suggestedPrescription.phytotherapie && synthesis.suggestedPrescription.phytotherapie.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{
                        fontWeight: "600",
                        color: "#15803d",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                        🌱 Phytothérapie
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {synthesis.suggestedPrescription.phytotherapie.map((plante, idx) => (
                          <div key={idx} style={{
                            background: "white",
                            borderRadius: "10px",
                            padding: "14px",
                            border: "1px solid #bbf7d0",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                              <div>
                                <span style={{ fontWeight: "700", color: "#166534" }}>{plante.nom}</span>
                                {plante.nomLatin && (
                                  <span style={{ fontSize: "0.85rem", color: "#6b7280", fontStyle: "italic", marginLeft: "8px" }}>
                                    ({plante.nomLatin})
                                  </span>
                                )}
                                <span style={{
                                  marginLeft: "8px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontSize: "0.75rem",
                                  background: "#dcfce7",
                                  color: "#166534",
                                }}>
                                  {plante.forme}
                                </span>
                              </div>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "0.8rem",
                                background: "#f3f4f6",
                                color: "#4b5563",
                              }}>
                                {plante.duree}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.9rem", color: "#374151", marginBottom: "4px" }}>
                              {plante.posologie}
                            </p>
                            <p style={{ fontSize: "0.85rem", color: "#15803d" }}>
                              {plante.indication}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gemmothérapie */}
                  {synthesis.suggestedPrescription.gemmotherapie && synthesis.suggestedPrescription.gemmotherapie.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{
                        fontWeight: "600",
                        color: "#65a30d",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                        💧 Gemmothérapie
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {synthesis.suggestedPrescription.gemmotherapie.map((bourgeon, idx) => (
                          <div key={idx} style={{
                            background: "white",
                            borderRadius: "10px",
                            padding: "14px",
                            border: "1px solid #d9f99d",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                              <div>
                                <span style={{ fontWeight: "700", color: "#4d7c0f" }}>{bourgeon.nom}</span>
                                {bourgeon.nomLatin && (
                                  <span style={{ fontSize: "0.85rem", color: "#6b7280", fontStyle: "italic", marginLeft: "8px" }}>
                                    ({bourgeon.nomLatin})
                                  </span>
                                )}
                              </div>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "0.8rem",
                                background: "#f3f4f6",
                                color: "#4b5563",
                              }}>
                                {bourgeon.duree}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.9rem", color: "#374151", marginBottom: "4px" }}>
                              {bourgeon.posologie}
                            </p>
                            <p style={{ fontSize: "0.85rem", color: "#65a30d" }}>
                              {bourgeon.indication}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aromathérapie */}
                  {synthesis.suggestedPrescription.aromatherapie && synthesis.suggestedPrescription.aromatherapie.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{
                        fontWeight: "600",
                        color: "#7c3aed",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                        🌸 Aromathérapie
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {synthesis.suggestedPrescription.aromatherapie.map((huile, idx) => (
                          <div key={idx} style={{
                            background: "white",
                            borderRadius: "10px",
                            padding: "14px",
                            border: "1px solid #ddd6fe",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                              <div>
                                <span style={{ fontWeight: "700", color: "#5b21b6" }}>{huile.huile}</span>
                                {huile.nomLatin && (
                                  <span style={{ fontSize: "0.85rem", color: "#6b7280", fontStyle: "italic", marginLeft: "8px" }}>
                                    ({huile.nomLatin})
                                  </span>
                                )}
                                <span style={{
                                  marginLeft: "8px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontSize: "0.75rem",
                                  background: "#ede9fe",
                                  color: "#5b21b6",
                                }}>
                                  {huile.voie}
                                </span>
                              </div>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "0.8rem",
                                background: "#f3f4f6",
                                color: "#4b5563",
                              }}>
                                {huile.duree}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.9rem", color: "#374141", marginBottom: "4px" }}>
                              {huile.posologie}
                            </p>
                            <p style={{ fontSize: "0.85rem", color: "#7c3aed" }}>
                              {huile.indication}
                            </p>
                            {huile.precautions && (
                              <p style={{
                                marginTop: "8px",
                                fontSize: "0.8rem",
                                color: "#dc2626",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}>
                                ⚠️ {huile.precautions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conseils */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}>
                    {synthesis.suggestedPrescription.conseilsHygiene && synthesis.suggestedPrescription.conseilsHygiene.length > 0 && (
                      <div style={{
                        background: "#f0f9ff",
                        borderRadius: "10px",
                        padding: "14px",
                        border: "1px solid #bae6fd",
                      }}>
                        <h5 style={{ fontWeight: "600", color: "#0369a1", marginBottom: "8px", fontSize: "0.9rem" }}>
                          🏃 Conseils d'hygiène de vie
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: "16px" }}>
                          {synthesis.suggestedPrescription.conseilsHygiene.map((conseil, idx) => (
                            <li key={idx} style={{ color: "#0c4a6e", fontSize: "0.85rem", marginBottom: "4px" }}>
                              {conseil}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {synthesis.suggestedPrescription.conseilsAlimentaires && synthesis.suggestedPrescription.conseilsAlimentaires.length > 0 && (
                      <div style={{
                        background: "#fffbeb",
                        borderRadius: "10px",
                        padding: "14px",
                        border: "1px solid #fde68a",
                      }}>
                        <h5 style={{ fontWeight: "600", color: "#b45309", marginBottom: "8px", fontSize: "0.9rem" }}>
                          🍽️ Conseils alimentaires
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: "16px" }}>
                          {synthesis.suggestedPrescription.conseilsAlimentaires.map((conseil, idx) => (
                            <li key={idx} style={{ color: "#92400e", fontSize: "0.85rem", marginBottom: "4px" }}>
                              {conseil}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WARNINGS */}
              {synthesis.warnings && synthesis.warnings.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                  borderRadius: "16px",
                  border: "2px solid #ef4444",
                  padding: "24px",
                }}>
                  <h3 style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#991b1b",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    ⚠️ Alertes pour le praticien
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {synthesis.warnings.map((warning, idx) => (
                      <li key={idx} style={{
                        color: "#b91c1c",
                        fontSize: "0.95rem",
                        marginBottom: "8px",
                        lineHeight: "1.5",
                      }}>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* MÉTADONNÉES */}
              {synthesis.meta && (
                <div style={{
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "16px",
                  marginTop: "16px",
                }}>
                  {/* Ligne 1: Métriques de confiance */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "16px" }}>
                      {/* Complétude des données (taux de remplissage) */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        background: "#dbeafe",
                        borderRadius: "8px",
                      }}>
                        <span style={{ fontSize: "0.8rem", color: "#1e40af", fontWeight: "500" }}>Complétude données</span>
                        <span style={{
                          padding: "2px 8px",
                          background: completudeScore >= 70 ? "#22c55e" : completudeScore >= 40 ? "#3b82f6" : "#f59e0b",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                        }}>
                          {completudeScore}%
                        </span>
                      </div>
                      {/* Confiance IA */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        background: (synthesis.meta.confidenceScore || 0) >= 0.7 ? "#dcfce7" :
                                   (synthesis.meta.confidenceScore || 0) >= 0.4 ? "#fef3c7" : "#fee2e2",
                        borderRadius: "8px",
                      }}>
                        <span style={{
                          fontSize: "0.8rem",
                          color: (synthesis.meta.confidenceScore || 0) >= 0.7 ? "#166534" :
                                 (synthesis.meta.confidenceScore || 0) >= 0.4 ? "#92400e" : "#991b1b",
                          fontWeight: "500"
                        }}>Confiance IA</span>
                        <span style={{
                          padding: "2px 8px",
                          background: (synthesis.meta.confidenceScore || 0) >= 0.7 ? "#22c55e" :
                                      (synthesis.meta.confidenceScore || 0) >= 0.4 ? "#f59e0b" : "#ef4444",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                        }}>
                          {Math.round((synthesis.meta.confidenceScore || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {synthesis.meta.modelUsed} • {synthesis.meta.processingTime}ms
                    </div>
                  </div>

                  {/* Ligne 2: Données utilisées */}
                  <div style={{ display: "flex", justifyContent: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      background: synthesis.meta.dataUsed?.biology ? '#dcfce7' : '#f3f4f6',
                      color: synthesis.meta.dataUsed?.biology ? '#166534' : '#6b7280',
                      border: synthesis.meta.dataUsed?.biology ? '1px solid #86efac' : '1px solid #e5e7eb',
                    }}>
                      {synthesis.meta.dataUsed?.biology ? '✓' : '✗'} BdF
                    </span>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      background: synthesis.meta.dataUsed?.anamnesis ? '#dcfce7' : '#f3f4f6',
                      color: synthesis.meta.dataUsed?.anamnesis ? '#166534' : '#6b7280',
                      border: synthesis.meta.dataUsed?.anamnesis ? '1px solid #86efac' : '1px solid #e5e7eb',
                    }}>
                      {synthesis.meta.dataUsed?.anamnesis ? '✓' : '✗'} Anamnèse
                    </span>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      background: synthesis.meta.dataUsed?.interrogatoire ? '#dcfce7' : '#f3f4f6',
                      color: synthesis.meta.dataUsed?.interrogatoire ? '#166534' : '#6b7280',
                      border: synthesis.meta.dataUsed?.interrogatoire ? '1px solid #86efac' : '1px solid #e5e7eb',
                    }}>
                      {synthesis.meta.dataUsed?.interrogatoire ? '✓' : '✗'} Interrogatoire
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
