"use client";

import { useMemo } from "react";
import { calculateClinicalScoresV2 } from "@/lib/interrogatoire/clinicalScoringV2";
import type { AxeScore } from "@/lib/interrogatoire/clinicalScoringV2";

interface ClinicalScoresCardProps {
  answersByAxis: Record<string, Record<string, any>>;
  sexe: "F" | "H";
}

export function ClinicalScoresCard({ answersByAxis, sexe }: ClinicalScoresCardProps) {
  // Calculer les scores cliniques avec le moteur V2
  const scores = useMemo(() => {
    return calculateClinicalScoresV2(answersByAxis, sexe);
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
  const getColorClass = (orientation: AxeScore["orientation"]) => {
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

  // Convertir les scores en tableau pour l'affichage
  // Filtrer uniquement les axes fonctionnels (exclure historique et modeVie)
  const scoreEntries = Object.entries(scores)
    .filter(([axisKey]) => axisKey !== "historique" && axisKey !== "modeVie")
    .map(([axisKey, score]) => ({
      key: axisKey,
      label: axeLabels[axisKey] || axisKey,
      score,
      emoji: getAxisEmoji(axisKey)
    }));

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
        <h3 className="text-xl font-bold text-slate-900">Scores Cliniques</h3>
      </div>

      <div className="space-y-4">
        {scoreEntries.map(({ key, label, score, emoji }) => (
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
                {score.orientation === "hypo" && "⬇️ Hypofonctionnement"}
                {score.orientation === "hyper" && "⬆️ Hyperfonctionnement"}
                {score.orientation === "mixte" && "⚠️ Profil Mixte"}
                {score.orientation === "equilibre" && "✅ Équilibré"}
              </div>

              {/* Scores détaillés */}
              <div className="flex gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Hypo:</span>
                  <span className={`font-bold text-lg ${score.hypo > 50 ? "text-blue-600" : ""}`}>
                    {score.hypo}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Hyper:</span>
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

              {/* Description textuelle (optionnel) */}
              {score.details && (
                <div className="text-xs text-gray-600 italic mt-1">
                  {score.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 italic">
        Scores calculés automatiquement avec le moteur V2 (scoring pondéré).
        La confiance augmente avec le nombre de questions répondues.
      </div>
    </div>
  );
}
