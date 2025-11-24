// ========================================
// MOTEUR DE SCORING V2 - Compatible answersByAxis
// ========================================

import { AXES_DEFINITION } from "./config";
import type { AxisKey } from "./config";
import type { QuestionConfig } from "./types";

/**
 * Scores cliniques par axe (Format V2)
 */
export interface ClinicalScoresV2 {
  neuro?: AxeScore;
  adaptatif?: AxeScore;
  thyro?: AxeScore;
  gonado?: AxeScore;
  somato?: AxeScore;
  digestif?: AxeScore;
  immuno?: AxeScore;
  cardioMetabo?: AxeScore;
  dermato?: AxeScore;
}

export interface AxeScore {
  hypo: number; // Score d'hypofonctionnement (0-100)
  hyper: number; // Score d'hyperfonctionnement (0-100)
  orientation: "hypo" | "hyper" | "equilibre" | "mixte";
  details?: string; // Description textuelle
  confiance: number; // Niveau de confiance (0-1)
}

/**
 * Calcule le score clinique pour tous les axes remplis
 */
export function calculateClinicalScoresV2(
  answersByAxis: Record<string, Record<string, any>>,
  sexe: "H" | "F"
): ClinicalScoresV2 {
  const scores: ClinicalScoresV2 = {};

  // Pour chaque axe défini dans la configuration
  for (const axis of AXES_DEFINITION) {
    const axisKey = axis.key;
    const answers = answersByAxis[axisKey];

    // Si l'axe n'a pas de réponses ou pas de questions, skip
    if (!answers || Object.keys(answers).length === 0 || axis.questions.length === 0) {
      continue;
    }

    // Calculer le score pour cet axe
    const score = calculateAxisScore(axis.key, axis.questions, answers, sexe);
    if (score) {
      // Utiliser l'indexation dynamique avec type assertion
      (scores as any)[axisKey] = score;
    }
  }

  return scores;
}

/**
 * Calcule le score pour un axe spécifique
 */
function calculateAxisScore(
  axisKey: AxisKey,
  questions: QuestionConfig[] | any[],
  answers: Record<string, any>,
  sexe: "H" | "F"
): AxeScore | null {
  // Filtrer les questions selon le sexe si applicable (ex: axe gonado)
  const filteredQuestions = questions.filter((q: any) => {
    if (!q.gender) return true; // Pas de filtre sexe
    if (q.gender === "both") return true;
    return (q.gender === "male" && sexe === "H") || (q.gender === "female" && sexe === "F");
  });

  if (filteredQuestions.length === 0) return null;

  let hypoScore = 0;
  let hyperScore = 0;
  let totalWeight = 0;
  let answeredQuestions = 0;

  for (const question of filteredQuestions) {
    const answer = answers[question.id];
    if (answer === undefined || answer === null || answer === "") continue;

    answeredQuestions++;

    const weight = question.weight || 1;
    const scoreDirection = question.scoreDirection || "hypo";

    // Convertir la réponse en valeur numérique (0-5)
    const value = normalizeAnswer(answer, question.type);

    if (scoreDirection === "hypo") {
      hypoScore += value * weight;
    } else if (scoreDirection === "hyper") {
      hyperScore += value * weight;
    }

    totalWeight += 5 * weight; // Maximum possible (échelle 0-5)
  }

  // Si aucune question répondue, retourner null
  if (answeredQuestions === 0 || totalWeight === 0) return null;

  // Normaliser les scores sur 100
  const hypoNormalized = (hypoScore / totalWeight) * 100;
  const hyperNormalized = (hyperScore / totalWeight) * 100;

  // Déterminer l'orientation
  let orientation: AxeScore["orientation"] = "equilibre";
  const diff = Math.abs(hypoNormalized - hyperNormalized);

  if (diff >= 15) {
    orientation = hypoNormalized > hyperNormalized ? "hypo" : "hyper";
  } else if (hypoNormalized > 30 && hyperNormalized > 30) {
    orientation = "mixte";
  }

  // Confiance : basée sur le nombre de questions répondues
  const confiance = Math.min(answeredQuestions / filteredQuestions.length, 1);

  return {
    hypo: Math.round(hypoNormalized),
    hyper: Math.round(hyperNormalized),
    orientation,
    confiance: Math.round(confiance * 100) / 100,
  };
}

/**
 * Normalise une réponse en valeur numérique (0-5)
 */
function normalizeAnswer(answer: any, type: string): number {
  if (type === "boolean") {
    // true/false OU "oui"/"non"
    if (answer === true || answer === "oui" || answer === "Oui") return 5;
    if (answer === false || answer === "non" || answer === "Non") return 0;
    return 0;
  }

  if (type === "scale_1_5") {
    // Échelle 1-5 (converti en 0-5 pour normalisation)
    const num = parseInt(answer, 10);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(5, num));
  }

  if (type === "select") {
    // Pour les select, utiliser le mapping si disponible
    // Sinon, prendre l'index dans options
    if (typeof answer === "string") {
      // Mapping basique : "Non" = 0, "Oui légère" = 2, "Oui modérée" = 3, "Oui importante" = 5
      const lowerAnswer = answer.toLowerCase();
      if (lowerAnswer.includes("non")) return 0;
      if (lowerAnswer.includes("légère") || lowerAnswer.includes("legere")) return 2;
      if (lowerAnswer.includes("modérée") || lowerAnswer.includes("moderee")) return 3;
      if (lowerAnswer.includes("importante")) return 5;
      return 2; // Par défaut
    }
    return 0;
  }

  if (type === "number") {
    // Normaliser les nombres (supposons échelle 0-10 → 0-5)
    const num = parseFloat(answer);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(5, num / 2));
  }

  // Par défaut
  return 0;
}

/**
 * Génère une description textuelle pour un score d'axe
 */
export function getScoreDescription(axisKey: AxisKey, score: AxeScore): string {
  const { orientation, hypo, hyper } = score;

  if (orientation === "equilibre") {
    return "Fonctionnement équilibré sur cet axe";
  }

  if (orientation === "mixte") {
    return `Profil mixte (hypo: ${hypo}%, hyper: ${hyper}%) - Instabilité fonctionnelle`;
  }

  if (orientation === "hypo") {
    if (hypo >= 70) return "Hypofonctionnement marqué";
    if (hypo >= 50) return "Hypofonctionnement modéré";
    return "Hypofonctionnement léger";
  }

  if (orientation === "hyper") {
    if (hyper >= 70) return "Hyperfonctionnement marqué";
    if (hyper >= 50) return "Hyperfonctionnement modéré";
    return "Hyperfonctionnement léger";
  }

  return "Non évalué";
}
