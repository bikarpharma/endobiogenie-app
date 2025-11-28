"use client";

import { useState, useEffect, useTransition } from "react";
import { calculateAllIndexes } from "@/lib/bdf/calculateIndexes";
import { calculateAxeScores } from "@/lib/interrogatoire/calculateAxeScores";
import type { BdfResult } from "@/lib/bdf/calculateIndexes";
import type { AxeType } from "@/lib/interrogatoire/axeInterpretation";
import type { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";
import type { UnifiedAnalysisOutput } from "@/types/clinical-engine";
import { runUnifiedAnalysis } from "@/app/actions/clinical-pipeline";

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

  // Générer la synthèse avec le nouveau pipeline unifié
  const handleGenerateSynthesis = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await runUnifiedAnalysis(patient.id);
        setSynthesis(result.content as unknown as UnifiedAnalysisOutput);
      } catch (err: any) {
        console.error("Erreur génération synthèse:", err);
        setError(err.message || "Une erreur est survenue lors de la génération");
      }
    });
  };

  // Fonctions utilitaires pour les couleurs
  const getTerrainColor = (type: string) => {
    switch (type) {
      case 'Alpha': return { bg: '#fff7ed', border: '#f97316', text: '#9a3412' };
      case 'Beta': return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' };
      case 'Gamma': return { bg: '#faf5ff', border: '#a855f7', text: '#6b21a8' };
      case 'Delta': return { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' };
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
                  {axeScores.map((score, idx) => (
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
                  ))}
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
                  {Object.entries(bdfData.indexes || {}).slice(0, 6).map(([key, data]: [string, any], idx) => (
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
                        {data?.value?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                  ))}
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

          {/* ===== BOUTON GÉNÉRATION ===== */}
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
                  GÉNÉRER SYNTHÈSE UNIFIÉE
                </>
              )}
            </button>
            {!hasAnyData && (
              <p style={{ color: "#6b7280", marginTop: "12px", fontSize: "0.9rem" }}>
                Remplissez l'interrogatoire ou saisissez une BdF pour générer la synthèse
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
                background: `linear-gradient(135deg, ${getTerrainColor(synthesis.terrain?.type || '').bg} 0%, white 100%)`,
                borderRadius: "16px",
                border: `3px solid ${getTerrainColor(synthesis.terrain?.type || '').border}`,
                padding: "24px",
              }}>
                <h3 style={{
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: getTerrainColor(synthesis.terrain?.type || '').text,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  🏔️ Terrain Endobiogénique
                </h3>
                <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
                  <span style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    background: getTerrainColor(synthesis.terrain?.type || '').border,
                    color: "white",
                  }}>
                    {synthesis.terrain?.type || 'N/A'}
                  </span>
                  <div>
                    <p style={{ color: "#374151", lineHeight: "1.6" }}>
                      {synthesis.terrain?.justification}
                    </p>
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
                    <span style={{
                      marginLeft: "auto",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      background: synthesis.drainage.necessite ? '#fef2f2' : '#f0fdf4',
                      color: synthesis.drainage.necessite ? '#dc2626' : '#16a34a',
                      border: `1px solid ${synthesis.drainage.necessite ? '#fca5a5' : '#86efac'}`,
                    }}>
                      {synthesis.drainage.necessite ? `Priorité ${synthesis.drainage.priorite}` : 'Non nécessaire'}
                    </span>
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
                        <p style={{ color: "#374151", lineHeight: "1.6", marginBottom: "8px" }}>
                          {synthesis.drainage.strategieDrainage}
                        </p>
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.85rem", color: "#059669", fontWeight: "600" }}>
                            Durée totale: {synthesis.drainage.dureeTotale}
                          </span>
                        </div>
                      </div>

                      {/* Émonctoires */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" }}>
                        {synthesis.drainage.emonctoires
                          .filter(e => e.statut === 'Surchargé')
                          .sort((a, b) => a.prioriteDrainage - b.prioriteDrainage)
                          .map((emonctoire, idx) => (
                            <div key={idx} style={{
                              background: "white",
                              borderRadius: "10px",
                              padding: "14px",
                              border: "2px solid #fca5a5",
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <span style={{ fontWeight: "700", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}>
                                  {emonctoire.organe === 'Foie' && '🫀'}
                                  {emonctoire.organe === 'Reins' && '💧'}
                                  {emonctoire.organe === 'Intestins' && '🌀'}
                                  {emonctoire.organe === 'Peau' && '🧴'}
                                  {emonctoire.organe === 'Poumons' && '🌬️'}
                                  {emonctoire.organe}
                                </span>
                                <span style={{
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontSize: "0.7rem",
                                  fontWeight: "600",
                                  background: "#fee2e2",
                                  color: "#991b1b",
                                }}>
                                  Priorité {emonctoire.prioriteDrainage}
                                </span>
                              </div>
                              {emonctoire.signesCliniques.length > 0 && (
                                <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "8px" }}>
                                  {emonctoire.signesCliniques.join(', ')}
                                </p>
                              )}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {emonctoire.plantesRecommandees.map((plante, i) => (
                                  <span key={i} style={{
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    fontSize: "0.75rem",
                                    background: "#d1fae5",
                                    color: "#047857",
                                  }}>
                                    {plante}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
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
                  textAlign: "right",
                  color: "#9ca3af",
                  fontSize: "0.8rem",
                  padding: "8px",
                }}>
                  Généré par {synthesis.meta.modelUsed} en {synthesis.meta.processingTime}ms
                  • Confiance: {Math.round((synthesis.meta.confidenceScore || 0) * 100)}%
                  <div style={{ marginTop: "4px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: synthesis.meta.dataUsed?.biology ? '#dcfce7' : '#f3f4f6',
                      color: synthesis.meta.dataUsed?.biology ? '#166534' : '#6b7280',
                    }}>
                      BdF {synthesis.meta.dataUsed?.biology ? '✓' : '✗'}
                    </span>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: synthesis.meta.dataUsed?.anamnesis ? '#dcfce7' : '#f3f4f6',
                      color: synthesis.meta.dataUsed?.anamnesis ? '#166534' : '#6b7280',
                    }}>
                      Anamnèse {synthesis.meta.dataUsed?.anamnesis ? '✓' : '✗'}
                    </span>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: synthesis.meta.dataUsed?.interrogatoire ? '#dcfce7' : '#f3f4f6',
                      color: synthesis.meta.dataUsed?.interrogatoire ? '#166534' : '#6b7280',
                    }}>
                      Interrogatoire {synthesis.meta.dataUsed?.interrogatoire ? '✓' : '✗'}
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
