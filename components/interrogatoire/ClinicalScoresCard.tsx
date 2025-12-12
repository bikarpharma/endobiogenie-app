"use client";

import { useMemo } from "react";

interface ClinicalScoresCardProps {
  answersByAxis: Record<string, Record<string, any>>;
  sexe: "F" | "H";
  currentAxis: string;
}

// ========================================
// NOMBRE RÉEL DE QUESTIONS PAR AXE
// ========================================
const QUESTIONS_PAR_AXE: Record<string, number> = {
  // Terrain & Histoire
  historique: 48,
  modeDeVie: 35,
  terrainsPatho: 42,

  // Gestionnaires
  neuro: 42,
  adaptatif: 38,
  thyro: 52,
  gonado: 32,
  somato: 45,

  // Émonctoires & Organes
  digestif: 52,
  immuno: 48,
  orlRespiratoire: 38,
  cardioMetabo: 24,
  urorenal: 32,
  dermato: 38,
};

// Labels pour l'affichage
const AXE_LABELS: Record<string, string> = {
  historique: "Historique & Antécédents",
  modeDeVie: "Mode de Vie",
  terrainsPatho: "Terrains Pathologiques",
  neuro: "Neurovégétatif (SNA)",
  adaptatif: "Adaptatif (Corticotrope)",
  thyro: "Thyréotrope",
  gonado: "Gonadotrope",
  somato: "Somatotrope",
  digestif: "Digestif",
  immuno: "Immuno-Inflammatoire",
  orlRespiratoire: "ORL & Respiratoire",
  cardioMetabo: "Cardio-Métabolique",
  urorenal: "Urorénal",
  dermato: "Dermatologique",
};

// Emojis par axe
const AXE_EMOJIS: Record<string, string> = {
  historique: "📜",
  modeDeVie: "🏃",
  terrainsPatho: "🎯",
  neuro: "🧠",
  adaptatif: "⚡",
  thyro: "🦋",
  gonado: "🌸",
  somato: "💪",
  digestif: "🍽️",
  immuno: "🛡️",
  orlRespiratoire: "🫁",
  cardioMetabo: "❤️",
  urorenal: "💧",
  dermato: "✨",
};

/**
 * Compte le nombre de réponses dans un axe
 */
function countAxisAnswers(axisAnswers: Record<string, any> | undefined): number {
  if (!axisAnswers || typeof axisAnswers !== 'object') return 0;

  return Object.entries(axisAnswers).filter(([key, value]) => {
    // Ignorer les clés spéciales
    if (key.startsWith('_') || key === 'metadata') return false;
    // Vérifier si la valeur est définie
    if (value === null || value === undefined || value === '') return false;
    return true;
  }).length;
}

export function ClinicalScoresCard({ answersByAxis, sexe, currentAxis }: ClinicalScoresCardProps) {
  // Calculer la complétude de l'axe actuel UNIQUEMENT
  const axisStats = useMemo(() => {
    const axisAnswers = answersByAxis[currentAxis] || {};
    const answeredCount = countAxisAnswers(axisAnswers);
    const totalQuestions = QUESTIONS_PAR_AXE[currentAxis] || 40;
    const realCompletude = Math.min(answeredCount / totalQuestions, 1);

    return {
      answeredCount,
      totalQuestions,
      realCompletude
    };
  }, [answersByAxis, currentAxis]);

  // Extraire les réponses significatives (symptômes cochés)
  const symptomesDetectes = useMemo(() => {
    const axisAnswers = answersByAxis[currentAxis] || {};
    const symptomes: string[] = [];

    Object.entries(axisAnswers).forEach(([key, value]) => {
      // Ignorer les clés spéciales et valeurs vides
      if (key.startsWith('_') || key === 'metadata') return;
      if (value === null || value === undefined || value === '' || value === 'non' || value === false) return;

      // Pour les valeurs significatives (oui, true, ou valeurs numériques élevées)
      if (value === 'oui' || value === true || (typeof value === 'number' && value >= 3)) {
        // Convertir la clé en label lisible
        const label = key
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .toLowerCase()
          .trim();
        symptomes.push(label);
      }
    });

    return symptomes.slice(0, 5); // Maximum 5 symptômes affichés
  }, [answersByAxis, currentAxis]);

  const emoji = AXE_EMOJIS[currentAxis] || "📊";
  const label = AXE_LABELS[currentAxis] || currentAxis;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
      </div>

      {/* Barre de complétion */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Complétion</span>
          <span className="font-semibold">
            {axisStats.answeredCount}/{axisStats.totalQuestions}
            <span className="text-gray-400 ml-1">
              ({Math.round(axisStats.realCompletude * 100)}%)
            </span>
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              axisStats.realCompletude >= 0.7 ? "bg-green-500" :
              axisStats.realCompletude >= 0.4 ? "bg-yellow-500" :
              "bg-gray-400"
            }`}
            style={{ width: `${axisStats.realCompletude * 100}%` }}
          />
        </div>
      </div>

      {/* Symptômes détectés (si au moins 10% complété) */}
      {axisStats.realCompletude >= 0.1 && symptomesDetectes.length > 0 && (
        <div className="pt-2 border-t">
          <div className="text-xs font-medium text-gray-600 mb-1">
            Points relevés :
          </div>
          <ul className="text-xs text-gray-500 space-y-0.5">
            {symptomesDetectes.map((symptome, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-gray-400">•</span>
                <span className="capitalize">{symptome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Message si complétion insuffisante */}
      {axisStats.realCompletude < 0.1 && (
        <p className="text-xs text-gray-400 italic text-center pt-2">
          Répondez aux questions pour voir les points relevés
        </p>
      )}
    </div>
  );
}
