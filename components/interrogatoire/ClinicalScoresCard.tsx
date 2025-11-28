"use client";

import { useMemo } from "react";
import { calculateClinicalScoresV3 } from "@/lib/interrogatoire/clinicalScoringV3";
import type { ScoringResultV3, ScoreAxeEndobiogenique, OrientationEndobiogenique } from "@/lib/interrogatoire/clinicalScoringV3";

interface ClinicalScoresCardProps {
  answersByAxis: Record<string, Record<string, any>>;
  sexe: "F" | "H";
}

// Type pour l'affichage legacy
interface LegacyAxeScore {
  hypo: number;
  hyper: number;
  orientation: "hypo" | "hyper" | "equilibre" | "mixte";
  details?: string;
  confiance: number;
}

// Convertir le format V3 vers le format legacy pour l'affichage
function convertToLegacy(score: ScoreAxeEndobiogenique): LegacyAxeScore {
  let legacyOrientation: LegacyAxeScore["orientation"] = "equilibre";

  switch (score.orientation) {
    case "insuffisance":
      legacyOrientation = "hypo";
      break;
    case "sur_sollicitation":
      legacyOrientation = "hyper";
      break;
    case "instabilite":
    case "mal_adaptation":
      legacyOrientation = "mixte";
      break;
    default:
      legacyOrientation = "equilibre";
  }

  return {
    hypo: score.insuffisance,
    hyper: score.surSollicitation,
    orientation: legacyOrientation,
    details: score.description,
    confiance: score.confiance
  };
}

export function ClinicalScoresCard({ answersByAxis, sexe }: ClinicalScoresCardProps) {
  // Calculer les scores cliniques avec le moteur V3 (utilise les vrais IDs)
  const scoringResult = useMemo(() => {
    return calculateClinicalScoresV3(answersByAxis, sexe);
  }, [answersByAxis, sexe]);

  // Mapping des clés d'axe vers leurs labels
  const axeLabels: Record<string, string> = {
    neuro: "Neuro-végétatif",
    adaptatif: "Adaptatif (Corticotrope)",
    thyro: "Thyroïdien",
    gonado: "Gonadotrope",
    somato: "Somatotrope (GH)",
    digestif: "Digestif",
    immuno: "Immuno-Inflammatoire",
    cardioMetabo: "Cardio-Métabolique",
    dermato: "Dermatologique"
  };

  // Fonction pour déterminer la couleur selon l'orientation
  const getColorClass = (orientation: LegacyAxeScore["orientation"]) => {
    switch (orientation) {
      case "hypo":
        return "bg-blue-100 border-blue-300";
      case "hyper":
        return "bg-red-100 border-red-300";
      case "mixte":
        return "bg-yellow-100 border-yellow-300";
      case "equilibre":
      default:
        return "bg-green-100 border-green-300";
    }
  };

  // Fonction pour obtenir l'emoji selon l'axe
  const getAxisEmoji = (axisKey: string) => {
    const emojiMap: Record<string, string> = {
      neuro: "🧠",
      adaptatif: "⚡",
      thyro: "🦋",
      gonado: "🌸",
      somato: "💪",
      digestif: "🍽️",
      immuno: "🛡️",
      cardioMetabo: "❤️",
      dermato: "✨"
    };
    return emojiMap[axisKey] || "📊";
  };

  // Convertir les scores V3 en tableau pour l'affichage dynamique par axe
  const scoreEntries = useMemo(() => {
    if (!scoringResult?.axes) return [];

    return Object.entries(scoringResult.axes)
      .filter(([_, axeScore]) => axeScore !== undefined)
      .map(([axisKey, axeScore]) => {
        const legacyScore = convertToLegacy(axeScore as ScoreAxeEndobiogenique);
        return {
          key: axisKey,
          label: axeLabels[axisKey] || axisKey,
          score: legacyScore,
          originalScore: axeScore as ScoreAxeEndobiogenique,
          emoji: getAxisEmoji(axisKey)
        };
      });
  }, [scoringResult]);

  // Si aucun score n'est disponible
  if (scoreEntries.length === 0) {
    return (
      <div className="clinical-scores-card bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📊</span>
          <h3 className="font-semibold text-gray-900">Scores Cliniques en Temps Réel</h3>
        </div>
        <p className="text-sm text-gray-500 italic">
          Remplissez l'interrogatoire pour voir les scores cliniques apparaître automatiquement.
        </p>
      </div>
    );
  }

  return (
    <div className="clinical-scores-card bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📊</span>
        <h3 className="text-xl font-bold text-slate-900">Scores Cliniques en Temps Réel</h3>
      </div>

      <div className="space-y-4">
        {scoreEntries.map(({ key, label, score, originalScore, emoji }) => (
          <div
            key={key}
            className={`p-4 border-2 rounded-xl ${getColorClass(score.orientation)} transition-all hover:shadow-md`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{emoji}</span>
              <div className="text-base font-bold text-gray-800">
                {label}
              </div>
            </div>

            <div className="space-y-3">
              {/* Orientation principale */}
              <div className="text-base font-bold text-gray-900">
                {score.orientation === "hypo" && "⬇️ Insuffisance"}
                {score.orientation === "hyper" && "⬆️ Sur-sollicitation"}
                {score.orientation === "mixte" && "⚠️ Instabilité"}
                {score.orientation === "equilibre" && "✅ Équilibré"}
              </div>

              {/* Scores détaillés */}
              <div className="flex gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Insuffisance:</span>
                  <span className={`font-bold text-lg ${score.hypo > 50 ? "text-blue-600" : ""}`}>
                    {score.hypo}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Sur-sollicitation:</span>
                  <span className={`font-bold text-lg ${score.hyper > 50 ? "text-red-600" : ""}`}>
                    {score.hyper}%
                  </span>
                </div>
              </div>

              {/* Niveau de confiance */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span className="font-semibold">Confiance</span>
                  <span className="text-base font-bold">
                    {Math.round(score.confiance * 100)}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      score.confiance >= 0.7 ? "bg-green-500" :
                      score.confiance >= 0.4 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${score.confiance * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Description textuelle */}
              {score.details && (
                <div className="text-xs text-gray-600 italic mt-1">
                  {score.details}
                </div>
              )}

              {/* Symptômes clés détectés */}
              {originalScore.symptomesCles && originalScore.symptomesCles.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  <span className="font-semibold">Signes:</span>{" "}
                  {originalScore.symptomesCles.slice(0, 3).join(" • ")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Terrains détectés */}
      {scoringResult?.terrainsDetectes && scoringResult.terrainsDetectes.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <h4 className="font-bold text-amber-800 mb-2">🎯 Terrains Pathologiques Détectés</h4>
          <div className="space-y-2">
            {scoringResult.terrainsDetectes.map((terrain, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-semibold text-amber-900 capitalize">{terrain.terrain.replace(/_/g, ' ')}</span>
                <span className="text-amber-700"> (score: {terrain.score})</span>
                {terrain.indicateurs && terrain.indicateurs.length > 0 && (
                  <ul className="ml-4 text-xs text-amber-600 list-disc">
                    {terrain.indicateurs.slice(0, 3).map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synthèse globale */}
      {scoringResult?.syntheseGlobale && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="font-bold text-slate-700 mb-2">📋 Synthèse</h4>
          <div className="text-sm text-slate-600 space-y-1">
            {scoringResult.syntheseGlobale.axePrioritaire && (
              <div>
                <span className="font-semibold">Axe prioritaire:</span>{" "}
                <span className="capitalize">{scoringResult.syntheseGlobale.axePrioritaire}</span>
              </div>
            )}
            <div>
              <span className="font-semibold">Capacité d'adaptation:</span>{" "}
              <span className={
                scoringResult.syntheseGlobale.capaciteAdaptation === "epuisee" ? "text-red-600 font-bold" :
                scoringResult.syntheseGlobale.capaciteAdaptation === "faible" ? "text-orange-600" :
                scoringResult.syntheseGlobale.capaciteAdaptation === "moderee" ? "text-yellow-600" :
                "text-green-600"
              }>
                {scoringResult.syntheseGlobale.capaciteAdaptation}
              </span>
            </div>
            {scoringResult.syntheseGlobale.risqueSpasmophilie && (
              <div className="text-orange-600 font-semibold">
                ⚠️ Risque de terrain spasmophile
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 italic">
        Scores calculés dynamiquement avec le moteur V3. La confiance augmente avec le nombre de questions répondues.
      </div>
    </div>
  );
}
