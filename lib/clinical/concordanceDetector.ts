/**
 * DÉTECTEUR DE CONCORDANCE BDF vs INTERROGATOIRE
 * ===============================================
 *
 * Ce module analyse la concordance entre les index de la BDF (biologie)
 * et les réponses de l'interrogatoire clinique.
 *
 * Principe de triangulation: Un diagnostic fiable nécessite la concordance
 * entre données biologiques ET symptômes cliniques déclarés.
 */

import { INDEXES } from "@/lib/bdf/indexes/indexes.config";
import {
  INDEX_TO_AXE_MAPPING,
  AXE_LABELS,
  getIndexesForAxe,
  getAllMappedAxes,
} from "./mappings";
import type {
  ZoneBDF,
  OrientationInterrogatoire,
  NiveauConcordance,
  SeveriteDiscordance,
  StatutConcordanceGlobal,
  CouleurUI,
  AnalyseBDF,
  AnalyseInterrogatoire,
  ConcordanceAxe,
  Discordance,
  ConcordanceWarning,
  ClinicalConcordance,
  ConcordanceSummary,
  ConcordanceDetectorConfig,
} from "./types";

// ============================================================
// CONFIGURATION PAR DÉFAUT
// ============================================================

const DEFAULT_CONFIG: ConcordanceDetectorConfig = {
  zoneMultipliers: {
    tresBas: 0.5,  // value < low - range * 0.5
    tresHaut: 0.5, // value > high + range * 0.5
  },
  minCompletenessThreshold: 0.3,  // 30% minimum pour considérer un axe
  orientationDominanceRatio: 0.6, // 60% pour déterminer orientation dominante
};

// ============================================================
// FONCTIONS D'ANALYSE BDF
// ============================================================

/**
 * Détermine la zone d'un index BDF par rapport à ses seuils de référence
 */
function getZoneBDF(
  indexId: string,
  value: number,
  config: ConcordanceDetectorConfig = DEFAULT_CONFIG
): ZoneBDF {
  const indexDef = INDEXES.find(idx => idx.id === indexId);
  if (!indexDef || !indexDef.referenceRange) {
    return "absent";
  }

  const { low, high } = indexDef.referenceRange;
  const range = high - low;

  if (value < low - range * config.zoneMultipliers.tresBas) return "tres_bas";
  if (value < low) return "bas";
  if (value <= high) return "normal";
  if (value <= high + range * config.zoneMultipliers.tresHaut) return "haut";
  return "tres_haut";
}

/**
 * Récupère l'interprétation textuelle d'un index selon sa zone
 */
function getInterpretation(indexId: string, zone: ZoneBDF): string {
  const indexDef = INDEXES.find(idx => idx.id === indexId);
  if (!indexDef?.referenceRange?.interpretation) {
    return "";
  }

  const { interpretation } = indexDef.referenceRange;

  switch (zone) {
    case "tres_bas":
    case "bas":
      return interpretation.low || "";
    case "normal":
      return interpretation.normal || "";
    case "haut":
    case "tres_haut":
      return interpretation.high || "";
    default:
      return "";
  }
}

/**
 * Analyse un index BDF et retourne son analyse complète
 */
function analyzeBDFIndex(indexId: string, value: number): AnalyseBDF | null {
  const indexDef = INDEXES.find(idx => idx.id === indexId);
  if (!indexDef || !indexDef.referenceRange) {
    return null;
  }

  const zone = getZoneBDF(indexId, value);
  const interpretation = getInterpretation(indexId, zone);

  return {
    indexId,
    indexLabel: indexDef.label,
    value,
    zone,
    interpretation,
    referenceRange: {
      low: indexDef.referenceRange.low,
      high: indexDef.referenceRange.high,
    },
  };
}

/**
 * Détermine l'orientation BDF (hypo/hyper/normal) pour un axe donné
 */
function getBDFOrientationForAxe(
  axe: string,
  bdfIndexes: Record<string, number>
): { orientation: "hypo" | "hyper" | "normal" | "absent"; analyses: AnalyseBDF[] } {
  const indexMappings = getIndexesForAxe(axe);
  const analyses: AnalyseBDF[] = [];

  let hypoCount = 0;
  let hyperCount = 0;
  let totalRelevant = 0;

  for (const mapping of indexMappings) {
    const value = bdfIndexes[mapping.indexId];
    if (value === undefined || value === null) continue;

    const analysis = analyzeBDFIndex(mapping.indexId, value);
    if (!analysis) continue;

    analyses.push(analysis);

    // Déterminer si cet index pointe vers hypo ou hyper
    if (analysis.zone === "tres_bas" || analysis.zone === "bas") {
      // Index bas → utiliser orientationWhenLow
      if (mapping.orientationWhenLow === "hypo") hypoCount++;
      else hyperCount++;
      totalRelevant++;
    } else if (analysis.zone === "haut" || analysis.zone === "tres_haut") {
      // Index haut → utiliser orientationWhenHigh
      if (mapping.orientationWhenHigh === "hypo") hypoCount++;
      else hyperCount++;
      totalRelevant++;
    }
    // Zone "normal" ne compte pas
  }

  if (analyses.length === 0) {
    return { orientation: "absent", analyses: [] };
  }

  if (totalRelevant === 0) {
    return { orientation: "normal", analyses };
  }

  // Déterminer orientation dominante
  const hypoRatio = hypoCount / totalRelevant;
  if (hypoRatio >= 0.6) return { orientation: "hypo", analyses };
  if (hypoRatio <= 0.4) return { orientation: "hyper", analyses };
  return { orientation: "normal", analyses }; // Équilibré ou mixte
}

// ============================================================
// FONCTIONS D'ANALYSE INTERROGATOIRE
// ============================================================

/**
 * Analyse les réponses de l'interrogatoire pour un axe donné
 */
function analyzeInterrogatoireForAxe(
  axe: string,
  answersByAxis: Record<string, Record<string, any>>,
  questionsConfig?: Record<string, { scoreDirection: "hypo" | "hyper"; weight: number }>
): AnalyseInterrogatoire {
  const axeAnswers = answersByAxis[axe] || {};

  let totalQuestions = 0;
  let questionsRepondues = 0;
  let scoreHypo = 0;
  let scoreHyper = 0;
  const symptomesDetectes: string[] = [];

  for (const [questionId, value] of Object.entries(axeAnswers)) {
    totalQuestions++;

    // Vérifier si la question a été répondue
    if (value === null || value === undefined || value === "") continue;
    questionsRepondues++;

    // Vérifier si la réponse est "positive" (symptôme présent)
    const isPositive = value === true ||
                       value === "oui" ||
                       value === "Oui" ||
                       value === "Oui modérément" ||
                       value === "Oui fortement" ||
                       value === "Oui chronique" ||
                       value === "Oui abondamment" ||
                       value === "Mauvaise" ||
                       value === "Élevée";

    if (!isPositive) continue;

    symptomesDetectes.push(questionId);

    // Récupérer le poids et la direction depuis la config si disponible
    const questionConfig = questionsConfig?.[questionId];
    const weight = questionConfig?.weight || 1;
    const direction = questionConfig?.scoreDirection;

    if (direction === "hypo") {
      scoreHypo += weight;
    } else if (direction === "hyper") {
      scoreHyper += weight;
    } else {
      // Si pas de direction définie, on assume 50/50
      scoreHypo += weight * 0.5;
      scoreHyper += weight * 0.5;
    }
  }

  // Calculer complétude
  const completeness = totalQuestions > 0
    ? Math.round((questionsRepondues / totalQuestions) * 100)
    : 0;

  // Déterminer orientation
  let orientation: OrientationInterrogatoire = "insuffisant";

  if (completeness < 30) {
    orientation = "insuffisant";
  } else {
    const totalScore = scoreHypo + scoreHyper;
    if (totalScore === 0) {
      orientation = "equilibre";
    } else {
      const hypoRatio = scoreHypo / totalScore;
      if (hypoRatio >= 0.6) orientation = "hypo";
      else if (hypoRatio <= 0.4) orientation = "hyper";
      else orientation = "equilibre";
    }
  }

  return {
    axe,
    totalQuestions,
    questionsRepondues,
    completeness,
    scoreHypo,
    scoreHyper,
    orientation,
    symptomesDetectes,
  };
}

// ============================================================
// DÉTECTION DE CONCORDANCE
// ============================================================

/**
 * Détermine le niveau de concordance entre BDF et Interrogatoire
 */
function determineNiveauConcordance(
  bdfOrientation: "hypo" | "hyper" | "normal" | "absent",
  interrogatoireOrientation: OrientationInterrogatoire,
  interrogatoireCompleteness: number
): { niveau: NiveauConcordance; details: string } {
  // Cas: données insuffisantes
  if (bdfOrientation === "absent" && interrogatoireOrientation === "insuffisant") {
    return { niveau: "indetermine", details: "Données insuffisantes des deux côtés" };
  }

  if (bdfOrientation === "absent") {
    return {
      niveau: "indetermine",
      details: `Pas d'index BDF - orientation interrogatoire: ${interrogatoireOrientation}`
    };
  }

  if (interrogatoireOrientation === "insuffisant") {
    return {
      niveau: "indetermine",
      details: `Interrogatoire incomplet (${interrogatoireCompleteness}%) - BDF: ${bdfOrientation}`
    };
  }

  // Cas: BDF normal
  if (bdfOrientation === "normal") {
    if (interrogatoireOrientation === "equilibre") {
      return { niveau: "forte", details: "BDF normale et interrogatoire équilibré" };
    }
    return {
      niveau: "faible",
      details: `BDF normale mais interrogatoire ${interrogatoireOrientation}`
    };
  }

  // Cas: Concordance directe
  if (bdfOrientation === interrogatoireOrientation) {
    return {
      niveau: "forte",
      details: `Concordance BDF et interrogatoire: ${bdfOrientation}`
    };
  }

  // Cas: BDF anormale vs interrogatoire équilibré
  if (interrogatoireOrientation === "equilibre") {
    return {
      niveau: "moderee",
      details: `BDF ${bdfOrientation} mais interrogatoire équilibré`
    };
  }

  // Cas: Discordance
  return {
    niveau: "discordance",
    details: `BDF ${bdfOrientation} vs Interrogatoire ${interrogatoireOrientation}`
  };
}

/**
 * Génère une discordance avec hypothèses explicatives
 */
function createDiscordance(
  axe: string,
  bdfOrientation: "hypo" | "hyper" | "normal",
  interrogatoireOrientation: OrientationInterrogatoire,
  bdfInterpretation: string
): Discordance {
  const hypotheses: string[] = [];

  // Générer des hypothèses selon le pattern de discordance
  if (bdfOrientation === "hypo" && interrogatoireOrientation === "hyper") {
    hypotheses.push("Possible compensation fonctionnelle masquant le déficit biologique");
    hypotheses.push("Début de décompensation - symptômes précèdent les anomalies biologiques");
    hypotheses.push("Erreur de saisie ou incohérence des réponses interrogatoire");
  } else if (bdfOrientation === "hyper" && interrogatoireOrientation === "hypo") {
    hypotheses.push("Adaptation réussie - la biologie compense les symptômes");
    hypotheses.push("Traitement en cours masquant les symptômes");
    hypotheses.push("Hyper-sollicitation asymptomatique (phase de résistance)");
  }

  return {
    axe,
    axeLabel: AXE_LABELS[axe] || axe,
    severite: determineSeveriteDiscordance(bdfOrientation, interrogatoireOrientation),
    description: `Discordance ${AXE_LABELS[axe] || axe}: BDF ${bdfOrientation} vs Interrogatoire ${interrogatoireOrientation}`,
    bdfIndication: bdfInterpretation || `Index ${bdfOrientation}`,
    interrogatoireIndication: `Symptômes majoritairement ${interrogatoireOrientation}`,
    hypothesesExplicatives: hypotheses,
  };
}

/**
 * Détermine la sévérité d'une discordance
 */
function determineSeveriteDiscordance(
  bdfOrientation: "hypo" | "hyper" | "normal",
  interrogatoireOrientation: OrientationInterrogatoire
): SeveriteDiscordance {
  // Hypo vs Hyper = critique
  if (
    (bdfOrientation === "hypo" && interrogatoireOrientation === "hyper") ||
    (bdfOrientation === "hyper" && interrogatoireOrientation === "hypo")
  ) {
    return "critique";
  }

  // Normal vs orienté = significative
  if (bdfOrientation === "normal" && interrogatoireOrientation !== "equilibre") {
    return "significative";
  }

  return "mineure";
}

// ============================================================
// WARNINGS
// ============================================================

/**
 * Génère les warnings pour données manquantes
 */
function generateWarnings(
  bdfIndexes: Record<string, number>,
  answersByAxis: Record<string, Record<string, any>>,
  concordancesAxes: ConcordanceAxe[]
): ConcordanceWarning[] {
  const warnings: ConcordanceWarning[] = [];

  // Vérifier si BDF globalement absente
  const bdfCount = Object.keys(bdfIndexes).length;
  if (bdfCount === 0) {
    warnings.push({
      type: "missing_bdf",
      severity: "high",
      message: "Aucune donnée BDF disponible. Analyse basée uniquement sur l'interrogatoire.",
      axes: getAllMappedAxes(),
      recommendation: "Effectuer un bilan biologique pour triangulation",
    });
  }

  // Vérifier chaque axe
  for (const concordance of concordancesAxes) {
    // BDF anormale sans données interrogatoire
    if (
      concordance.bdfOrientation !== "normal" &&
      concordance.bdfOrientation !== "absent" &&
      concordance.interrogatoireCompleteness < 30
    ) {
      warnings.push({
        type: "bdf_without_clinical",
        severity: "high",
        message: `Index ${concordance.axeLabel} anormal (${concordance.bdfOrientation}) mais interrogatoire peu renseigné (${concordance.interrogatoireCompleteness}%)`,
        axes: [concordance.axe],
        recommendation: `Compléter l'interrogatoire de l'axe ${concordance.axeLabel}`,
      });
    }

    // Interrogatoire avec symptômes mais pas de BDF
    if (
      concordance.bdfOrientation === "absent" &&
      concordance.interrogatoireOrientation !== "insuffisant" &&
      concordance.interrogatoireOrientation !== "equilibre"
    ) {
      warnings.push({
        type: "missing_bdf",
        severity: "medium",
        message: `Symptômes ${concordance.interrogatoireOrientation} déclarés pour ${concordance.axeLabel} sans index BDF correspondant`,
        axes: [concordance.axe],
        recommendation: `Vérifier les biomarqueurs pour l'axe ${concordance.axeLabel}`,
      });
    }

    // Complétude faible
    if (
      concordance.interrogatoireCompleteness > 0 &&
      concordance.interrogatoireCompleteness < 50
    ) {
      warnings.push({
        type: "low_completeness",
        severity: "low",
        message: `Axe ${concordance.axeLabel} partiellement renseigné (${concordance.interrogatoireCompleteness}%)`,
        axes: [concordance.axe],
      });
    }
  }

  return warnings;
}

// ============================================================
// SCORE GLOBAL
// ============================================================

/**
 * Calcule le score global de concordance
 */
function calculateScoreGlobal(
  concordancesAxes: ConcordanceAxe[],
  discordances: Discordance[]
): { value: number; interpretation: string; fiabilite: number } {
  if (concordancesAxes.length === 0) {
    return { value: 0, interpretation: "Discordant", fiabilite: 0 };
  }

  let totalScore = 0;
  let totalWeight = 0;
  let totalCompleteness = 0;

  for (const concordance of concordancesAxes) {
    const weight = concordance.bdfOrientation !== "absent" ? 2 : 1;

    let axeScore = 0;
    switch (concordance.concordance) {
      case "forte": axeScore = 100; break;
      case "moderee": axeScore = 70; break;
      case "faible": axeScore = 40; break;
      case "discordance": axeScore = 10; break;
      case "indetermine": axeScore = 50; break;
    }

    totalScore += axeScore * weight;
    totalWeight += weight;
    totalCompleteness += concordance.interrogatoireCompleteness;
  }

  // Pénalité pour discordances critiques
  const criticalDiscordances = discordances.filter(d => d.severite === "critique").length;
  const penaltyFactor = Math.max(0.5, 1 - criticalDiscordances * 0.15);

  const rawScore = totalWeight > 0 ? (totalScore / totalWeight) * penaltyFactor : 0;
  const score = Math.round(rawScore);

  const fiabilite = concordancesAxes.length > 0
    ? Math.min(1, (totalCompleteness / concordancesAxes.length) / 100 * 1.2)
    : 0;

  let interpretation: string;
  if (score >= 85) interpretation = "Excellent";
  else if (score >= 70) interpretation = "Bon";
  else if (score >= 50) interpretation = "Modéré";
  else if (score >= 30) interpretation = "Faible";
  else interpretation = "Discordant";

  return { value: score, interpretation, fiabilite: Math.round(fiabilite * 100) / 100 };
}

// ============================================================
// FONCTION PRINCIPALE
// ============================================================

/**
 * Détecte la concordance entre BDF et Interrogatoire
 *
 * @param bdfIndexes - Valeurs des index BDF calculés
 * @param answersByAxis - Réponses de l'interrogatoire par axe
 * @param sexe - Sexe du patient (pour certains axes spécifiques)
 * @param questionsConfig - Configuration optionnelle des questions (scoreDirection, weight)
 * @returns Analyse complète de concordance
 */
export function detectConcordance(
  bdfIndexes: Record<string, number>,
  answersByAxis: Record<string, Record<string, any>>,
  sexe: "F" | "H" = "F",
  questionsConfig?: Record<string, Record<string, { scoreDirection: "hypo" | "hyper"; weight: number }>>
): ClinicalConcordance {
  const concordancesAxes: ConcordanceAxe[] = [];
  const discordances: Discordance[] = [];

  // Analyser chaque axe
  const allAxes = getAllMappedAxes();

  for (const axe of allAxes) {
    // Analyser BDF pour cet axe
    const bdfResult = getBDFOrientationForAxe(axe, bdfIndexes);

    // Analyser Interrogatoire pour cet axe
    const interrogatoireResult = analyzeInterrogatoireForAxe(
      axe,
      answersByAxis,
      questionsConfig?.[axe]
    );

    // Déterminer concordance
    const { niveau, details } = determineNiveauConcordance(
      bdfResult.orientation,
      interrogatoireResult.orientation,
      interrogatoireResult.completeness
    );

    // Créer l'entrée de concordance
    const concordanceAxe: ConcordanceAxe = {
      axe,
      axeLabel: AXE_LABELS[axe] || axe,
      bdfOrientation: bdfResult.orientation,
      bdfValue: bdfResult.analyses.length > 0 ? bdfResult.analyses[0].value : undefined,
      bdfZone: bdfResult.analyses.length > 0 ? bdfResult.analyses[0].zone : undefined,
      bdfInterpretation: bdfResult.analyses.length > 0 ? bdfResult.analyses[0].interpretation : undefined,
      bdfIndexes: bdfResult.analyses,
      interrogatoireOrientation: interrogatoireResult.orientation,
      interrogatoireScore: {
        hypo: interrogatoireResult.scoreHypo,
        hyper: interrogatoireResult.scoreHyper,
      },
      interrogatoireCompleteness: interrogatoireResult.completeness,
      interrogatoireSymptomes: interrogatoireResult.symptomesDetectes,
      concordance: niveau,
      details,
    };

    concordancesAxes.push(concordanceAxe);

    // Créer discordance si nécessaire
    if (niveau === "discordance") {
      const discordance = createDiscordance(
        axe,
        bdfResult.orientation as "hypo" | "hyper" | "normal",
        interrogatoireResult.orientation,
        bdfResult.analyses[0]?.interpretation || ""
      );
      discordances.push(discordance);
    }
  }

  // Générer warnings
  const warnings = generateWarnings(bdfIndexes, answersByAxis, concordancesAxes);

  // Calculer score global
  const scoreGlobal = calculateScoreGlobal(concordancesAxes, discordances);

  // Calculer métadonnées
  const bdfIndexesAnalyzed = Object.keys(bdfIndexes).length;
  const interrogatoireAxesAnalyzed = Object.keys(answersByAxis).filter(
    axe => Object.keys(answersByAxis[axe] || {}).length > 0
  ).length;
  const dataCompleteness = concordancesAxes.length > 0
    ? Math.round(concordancesAxes.reduce((sum, c) => sum + c.interrogatoireCompleteness, 0) / concordancesAxes.length)
    : 0;

  return {
    concordancesAxes,
    discordances,
    scoreGlobal: {
      value: scoreGlobal.value,
      interpretation: scoreGlobal.interpretation as any,
      fiabilite: scoreGlobal.fiabilite,
    },
    warnings,
    hypotheses: [], // Sera rempli par le pipeline si nécessaire
    metadata: {
      timestamp: new Date().toISOString(),
      bdfIndexesAnalyzed,
      interrogatoireAxesAnalyzed,
      dataCompleteness,
    },
  };
}

// ============================================================
// FONCTION DE RÉSUMÉ POUR L'UI
// ============================================================

/**
 * Génère un résumé simplifié pour l'affichage UI
 */
export function getConcordanceSummary(concordance: ClinicalConcordance): ConcordanceSummary {
  const { scoreGlobal, discordances, warnings } = concordance;

  // Déterminer statut
  let status: StatutConcordanceGlobal;
  if (scoreGlobal.value >= 70 && discordances.length === 0) {
    status = "concordant";
  } else if (discordances.filter(d => d.severite === "critique").length > 0) {
    status = "discordant";
  } else if (scoreGlobal.fiabilite < 0.3) {
    status = "insuffisant";
  } else {
    status = "partiel";
  }

  // Déterminer couleur
  let couleur: CouleurUI;
  switch (status) {
    case "concordant": couleur = "green"; break;
    case "discordant": couleur = "red"; break;
    case "partiel": couleur = "orange"; break;
    case "insuffisant": couleur = "gray"; break;
  }

  // Générer message court
  let messageCourt: string;
  if (discordances.length > 0) {
    const axesConcernes = [...new Set(discordances.map(d => d.axeLabel))];
    messageCourt = `${discordances.length} discordance(s) sur ${axesConcernes.join(", ")}`;
  } else if (status === "insuffisant") {
    messageCourt = "Données insuffisantes pour évaluation";
  } else if (status === "concordant") {
    messageCourt = "Bonne concordance BDF / Interrogatoire";
  } else {
    messageCourt = "Concordance partielle - quelques écarts";
  }

  return {
    status,
    scoreGlobal: scoreGlobal.value,
    alertesCount: discordances.filter(d => d.severite === "critique").length +
                  warnings.filter(w => w.severity === "high").length,
    messageCourt,
    couleur,
  };
}
