"use client";

import { useState, useEffect } from "react";
import ClinicalSynthesisView from "@/components/synthese/ClinicalSynthesisView";
import { calculateAllIndexes } from "@/lib/bdf/calculateIndexes";
import { calculateAxeScores } from "@/lib/interrogatoire/calculateAxeScores";
import type { BdfResult } from "@/lib/bdf/calculateIndexes";
import type { AxeType } from "@/lib/interrogatoire/axeInterpretation";
import type { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";

type PatientData = {
  id: string;
  numeroPatient: string;
  nom: string;
  prenom: string;
  sexe: string | null;
  bdfAnalyses?: any[];
  interrogatoire?: any;
};

interface SynthesisResult {
  analyse_concordance: {
    coherences: string[];
    incoherences: string[];
    hypotheses: string[];
  };
  mecanismes: string[];
  strategie_therapeutique: {
    priorites: string[];
    objectifs: string[];
    precautions: string[];
  };
  ordonnance: {
    phytotherapie: Array<{
      plante: string;
      forme: string;
      posologie: string;
      duree: string;
      justification: string;
    }>;
    gemmotherapie?: Array<{
      bourgeon: string;
      posologie: string;
      duree: string;
      justification: string;
    }>;
    aromatherapie?: Array<{
      huile: string;
      mode: string;
      posologie: string;
      duree: string;
      justification: string;
    }>;
    conseils_hygiene: string[];
  };
  metadata?: {
    generatedAt: string;
    model: string;
    tokens: number;
    userId: string;
  };
}

export function OngletSynthese({ patient }: { patient: PatientData }) {
  const [interrogatoireData, setInterrogatoireData] = useState<any>(null);
  const [bdfData, setBdfData] = useState<BdfResult | null>(null);
  const [axeScores, setAxeScores] = useState<Array<{ axe: AxeType; score: number; status: "critical" | "warning" | "normal" }>>([]);
  const [axeInterpretations, setAxeInterpretations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // États pour la génération de synthèse
  const [isGenerating, setIsGenerating] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<SynthesisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useInterrogatoire, setUseInterrogatoire] = useState(true);
  const [useBdf, setUseBdf] = useState(true);

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
          console.log("📊 [OngletSynthese] Structure interrogatoire:", {
            hasV2: !!interrogatoire.v2,
            hasAnswersByAxis: !!interrogatoire.v2?.answersByAxis,
            axes: interrogatoire.v2?.answersByAxis ? Object.keys(interrogatoire.v2.answersByAxis) : [],
            fullData: interrogatoire
          });
          setInterrogatoireData(interrogatoire);

          // Calculer les scores des axes
          const scores = calculateAxeScores(interrogatoire);
          console.log("📊 [OngletSynthese] Scores calculés:", scores);
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

        // Charger les interprétations IA (si disponibles)
        const interpsRes = await fetch(`/api/interrogatoire/interpretations?patientId=${patient.id}`);
        if (interpsRes.ok) {
          const interpsData = await interpsRes.json();
          if (interpsData.interpretations) {
            setAxeInterpretations(interpsData.interpretations);
          }
        }

        // Charger la dernière synthèse sauvegardée (si disponible)
        try {
          const syntheseRes = await fetch(`/api/synthese?patientId=${patient.id}`);
          if (syntheseRes.ok) {
            const syntheseData = await syntheseRes.json();
            if (syntheseData.synthese) {
              console.log("📋 [OngletSynthese] Synthèse sauvegardée trouvée:", syntheseData.synthese.metadata);
              setSynthesisResult(syntheseData.synthese);
            }
          }
        } catch (error) {
          console.error("Erreur chargement synthèse:", error);
          // Ne pas bloquer le chargement si la synthèse n'existe pas
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

  const handleGenerateSynthesis = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/synthese/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interrogatoire: useInterrogatoire ? interrogatoireData : null,
          bdf: useBdf ? bdfData : null,
          patientContext: {
            id: patient.id,
            axeScores: useInterrogatoire ? axeScores : [],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Synthèse générée et sauvegardée:", result.metadata?.syntheseId);
      setSynthesisResult(result);
    } catch (err: any) {
      console.error("Erreur génération synthèse:", err);
      setError(err.message || "Une erreur est survenue lors de la génération de la synthèse");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: "0" }}>
      {/* GUIDE D'UTILISATION */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          📘 Guide d'utilisation
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>1.</strong> Assurez-vous d'avoir complété <strong>l'interrogatoire clinique</strong> et saisi les <strong>biomarqueurs BdF</strong> du patient.
          </p>
          <p>
            <strong>2.</strong> Consultez les <strong>données cliniques et biologiques</strong> ci-dessous pour identifier les axes prioritaires.
          </p>
          <p>
            <strong>3.</strong> Configurez les sources à utiliser (interrogatoire seul, BdF seule, ou les deux pour une analyse croisée).
          </p>
          <p>
            <strong>4.</strong> Cliquez sur <strong>"Générer synthèse"</strong> pour obtenir l'analyse complète et les recommandations thérapeutiques.
          </p>
        </div>
      </div>

      {/* Affichage des données cliniques et biologiques */}
      {loadingData ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-slate-600">Chargement des données...</p>
        </div>
      ) : (
        <ClinicalSynthesisView
          axeScores={axeScores}
          axeInterpretations={axeInterpretations}
          bdfData={bdfData}
          onGenerateSynthesis={handleGenerateSynthesis}
        />
      )}

      {/* CONFIGURATION DE LA SYNTHÈSE */}
      <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-xl border-2 border-amber-200 p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
          ⚙️ Configuration de la synthèse IA
        </h3>
        <p className="text-sm text-amber-800 mb-4">
          Sélectionnez les sources de données à utiliser pour générer la synthèse :
        </p>

        <div className="space-y-3">
          {/* Checkbox Interrogatoire */}
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            useInterrogatoire && hasInterrogatoire
              ? 'bg-orange-100 border-orange-400'
              : 'bg-white border-slate-200'
          } ${!hasInterrogatoire ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="checkbox"
              checked={useInterrogatoire}
              onChange={(e) => setUseInterrogatoire(e.target.checked)}
              disabled={!hasInterrogatoire}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">
                  📋 Interrogatoire clinique
                </span>
                {hasInterrogatoire ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                    Disponible
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full font-semibold">
                    Non rempli
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Symptômes, plaintes, axes cliniques analysés
              </p>
            </div>
          </label>

          {/* Checkbox BdF */}
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            useBdf && hasBdf
              ? 'bg-blue-100 border-blue-400'
              : 'bg-white border-slate-200'
          } ${!hasBdf ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="checkbox"
              checked={useBdf}
              onChange={(e) => setUseBdf(e.target.checked)}
              disabled={!hasBdf}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">
                  🧬 Biologie des Fonctions (BdF)
                </span>
                {hasBdf ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                    Disponible
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full font-semibold">
                    Non saisie
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Biomarqueurs, index fonctionnels
              </p>
            </div>
          </label>
        </div>

        {/* Message d'avertissement si aucune source sélectionnée */}
        {!useInterrogatoire && !useBdf && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Vous devez sélectionner au moins une source de données pour générer une synthèse.
            </p>
          </div>
        )}

        {/* Indicateur de ce qui sera utilisé */}
        {(useInterrogatoire || useBdf) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Synthèse basée sur :</strong>{' '}
              {useInterrogatoire && hasInterrogatoire && useBdf && hasBdf && 'Interrogatoire + BdF (analyse croisée complète)'}
              {useInterrogatoire && hasInterrogatoire && (!useBdf || !hasBdf) && 'Interrogatoire uniquement (approche symptomatique)'}
              {useBdf && hasBdf && (!useInterrogatoire || !hasInterrogatoire) && 'BdF uniquement (approche biologique)'}
            </p>
          </div>
        )}

        {/* BOUTON DE GÉNÉRATION */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleGenerateSynthesis}
            disabled={!hasAnyData || (!useInterrogatoire && !useBdf) || isGenerating}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-lg transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            <span className="text-2xl">✨</span>
            <span>{isGenerating ? "Génération en cours..." : "GÉNÉRER SYNTHÈSE"}</span>
          </button>
        </div>
      </div>

      {/* Affichage du résultat de la synthèse IA */}
      {isGenerating && (
        <div className="mt-8 bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-8">
          <div className="flex items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-lg font-semibold text-slate-700">
              Génération de la synthèse en cours...
            </p>
          </div>
          <p className="text-sm text-slate-500 text-center mt-2">
            L'IA analyse les données cliniques et biologiques (GPT-4)
          </p>
        </div>
      )}

      {error && (
        <div className="mt-8 bg-red-50 border-2 border-red-300 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-red-800 mb-2">Erreur de génération</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {synthesisResult && !isGenerating && (
        <div className="mt-8 space-y-6">
          {/* Badge indiquant si synthèse sauvegardée ou nouvelle */}
          {synthesisResult.metadata?.syntheseId && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">💾</span>
              <div className="flex-1">
                <h3 className="font-bold text-green-800">Synthèse sauvegardée</h3>
                <p className="text-sm text-green-700">
                  Cette synthèse a été générée le{' '}
                  {new Date(synthesisResult.metadata.generatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' '}et persiste entre les onglets.
                </p>
              </div>
            </div>
          )}

          {/* Analyse de Concordance */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-3">
              🔍 Analyse de Concordance Clinico-Biologique
            </h2>

            {typeof synthesisResult.analyse_concordance === 'string' ? (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{synthesisResult.analyse_concordance}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cohérences */}
                {synthesisResult.analyse_concordance?.coherences?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                      <span>✓</span> Cohérences (Clinique ↔ Biologie)
                    </h3>
                    <ul className="space-y-2">
                      {synthesisResult.analyse_concordance.coherences.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-green-500 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Incohérences */}
                {synthesisResult.analyse_concordance?.incoherences?.length > 0 && (
                <div>
                  <h3 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                    <span>⚠</span> Incohérences à explorer
                  </h3>
                  <ul className="space-y-2">
                    {synthesisResult.analyse_concordance.incoherences.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-orange-500 font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

                {/* Hypothèses */}
                {synthesisResult.analyse_concordance?.hypotheses?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                      <span>💡</span> Hypothèses diagnostiques
                    </h3>
                    <ul className="space-y-2">
                      {synthesisResult.analyse_concordance.hypotheses.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-blue-500 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mécanismes Physiopathologiques */}
          {synthesisResult.mecanismes && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                ⚙️ Mécanismes Physiopathologiques
              </h2>
              {Array.isArray(synthesisResult.mecanismes) ? (
                <ul className="space-y-3">
                  {synthesisResult.mecanismes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-blue-600 font-bold">{idx + 1}.</span>
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{synthesisResult.mecanismes}</p>
                </div>
              )}
            </div>
          )}

          {/* Stratégie Thérapeutique */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200 p-8">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-3">
              🎯 Stratégie Thérapeutique
            </h2>

            <div className="space-y-6">
              {/* Priorités */}
              <div>
                <h3 className="font-bold text-emerald-700 mb-3">Priorités de traitement</h3>
                <ol className="space-y-2">
                  {synthesisResult.strategie_therapeutique?.priorites?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-emerald-600 font-bold">{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Objectifs */}
              <div>
                <h3 className="font-bold text-emerald-700 mb-3">Objectifs thérapeutiques</h3>
                <ul className="space-y-2">
                  {synthesisResult.strategie_therapeutique?.objectifs?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-emerald-500 font-bold mt-0.5">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Précautions */}
              {synthesisResult.strategie_therapeutique?.precautions?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-800 mb-2">⚠️ Précautions</h3>
                  <ul className="space-y-1">
                    {synthesisResult.strategie_therapeutique.precautions.map((item, idx) => (
                      <li key={idx} className="text-sm text-yellow-800">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
