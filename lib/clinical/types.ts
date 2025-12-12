/**
 * TYPES POUR LA DÉTECTION DE CONCORDANCE BDF vs INTERROGATOIRE
 * =============================================================
 *
 * Ces types définissent la structure des données pour la triangulation
 * entre les index BDF (biologie) et les réponses de l'interrogatoire clinique.
 */

// ============================================================
// TYPES DE BASE
// ============================================================

/** Zone de valeur d'un index BDF */
export type ZoneBDF = "tres_bas" | "bas" | "normal" | "haut" | "tres_haut" | "absent";

/** Orientation détectée dans l'interrogatoire */
export type OrientationInterrogatoire = "hypo" | "hyper" | "equilibre" | "insuffisant";

/** Niveau de concordance entre BDF et Interrogatoire */
export type NiveauConcordance = "forte" | "moderee" | "faible" | "discordance" | "indetermine";

/** Sévérité d'une discordance */
export type SeveriteDiscordance = "critique" | "significative" | "mineure";

/** Statut global de concordance */
export type StatutConcordanceGlobal = "concordant" | "discordant" | "partiel" | "insuffisant";

/** Couleur pour l'UI */
export type CouleurUI = "green" | "orange" | "red" | "gray";

// ============================================================
// DONNÉES D'ENTRÉE
// ============================================================

/** Valeur d'un index BDF avec ses métadonnées */
export interface IndexBDFValue {
  id: string;
  value: number;
  label: string;
  referenceRange: {
    low: number;
    high: number;
  };
  interpretation?: {
    low: string;
    normal: string;
    high: string;
  };
}

/** Question de l'interrogatoire avec sa direction de score */
export interface QuestionInterrogatoire {
  id: string;
  scoreDirection: "hypo" | "hyper";
  weight: number;
  tags?: string[];
}

/** Réponse à une question de l'interrogatoire */
export interface ReponseInterrogatoire {
  questionId: string;
  value: any;  // boolean, string, ou autre selon la question
  isPositive: boolean;  // true si la réponse indique un symptôme présent
}

// ============================================================
// RÉSULTATS D'ANALYSE PAR AXE
// ============================================================

/** Analyse d'un index BDF */
export interface AnalyseBDF {
  indexId: string;
  indexLabel: string;
  value: number;
  zone: ZoneBDF;
  interpretation: string;
  referenceRange: {
    low: number;
    high: number;
  };
}

/** Analyse des réponses interrogatoire pour un axe */
export interface AnalyseInterrogatoire {
  axe: string;
  totalQuestions: number;
  questionsRepondues: number;
  completeness: number;  // 0-100
  scoreHypo: number;     // Score pondéré des symptômes hypo
  scoreHyper: number;    // Score pondéré des symptômes hyper
  orientation: OrientationInterrogatoire;
  symptomesDetectes: string[];  // IDs des questions positives
}

/** Concordance pour un axe spécifique */
export interface ConcordanceAxe {
  axe: string;
  axeLabel: string;

  // Données BDF
  bdfOrientation: "hypo" | "hyper" | "normal" | "absent";
  bdfValue?: number;
  bdfZone?: ZoneBDF;
  bdfInterpretation?: string;
  bdfIndexes: AnalyseBDF[];  // Peut avoir plusieurs index par axe

  // Données Interrogatoire
  interrogatoireOrientation: OrientationInterrogatoire;
  interrogatoireScore: {
    hypo: number;
    hyper: number;
  };
  interrogatoireCompleteness: number;  // 0-100
  interrogatoireSymptomes: string[];

  // Résultat de la comparaison
  concordance: NiveauConcordance;
  details: string;
}

// ============================================================
// DISCORDANCES ET ALERTES
// ============================================================

/** Discordance significative détectée */
export interface Discordance {
  axe: string;
  axeLabel: string;
  severite: SeveriteDiscordance;
  description: string;
  bdfIndication: string;      // Ce que dit la BDF
  interrogatoireIndication: string;  // Ce que dit l'interrogatoire
  hypothesesExplicatives: string[];  // Explications possibles
}

/** Warning sur données manquantes ou incomplètes */
export interface ConcordanceWarning {
  type: "missing_bdf" | "missing_interrogatoire" | "bdf_without_clinical" | "low_completeness";
  severity: "high" | "medium" | "low";
  message: string;
  axes: string[];
  recommendation?: string;
}

// ============================================================
// RÉSULTAT GLOBAL
// ============================================================

/** Score global de concordance */
export interface ScoreGlobalConcordance {
  value: number;  // 0-100
  interpretation: "Excellent" | "Bon" | "Modéré" | "Faible" | "Discordant";
  fiabilite: number;  // 0-1, basé sur complétude des données
}

/** Résultat complet de l'analyse de concordance */
export interface ClinicalConcordance {
  // Vue par axe (niveau 1)
  concordancesAxes: ConcordanceAxe[];

  // Discordances significatives (alertes)
  discordances: Discordance[];

  // Score global de concordance
  scoreGlobal: ScoreGlobalConcordance;

  // Warnings sur données manquantes
  warnings: ConcordanceWarning[];

  // Hypothèses régulatrices (existant, gardé pour compatibilité)
  hypotheses: string[];

  // Métadonnées
  metadata: {
    timestamp: string;
    bdfIndexesAnalyzed: number;
    interrogatoireAxesAnalyzed: number;
    dataCompleteness: number;  // 0-100
  };
}

/** Résumé simplifié pour l'UI */
export interface ConcordanceSummary {
  status: StatutConcordanceGlobal;
  scoreGlobal: number;  // 0-100
  alertesCount: number;
  messageCourt: string;  // Ex: "2 discordances sur axe thyroïdien"
  couleur: CouleurUI;
}

// ============================================================
// CONFIGURATION
// ============================================================

/** Mapping d'un index vers ses axes */
export interface IndexAxeMapping {
  indexId: string;
  axes: string[];
  orientationWhenLow: "hypo" | "hyper";  // Que signifie un index bas ?
  orientationWhenHigh: "hypo" | "hyper"; // Que signifie un index haut ?
}

/** Configuration complète du détecteur */
export interface ConcordanceDetectorConfig {
  // Seuils pour déterminer les zones (multiplicateurs du range)
  zoneMultipliers: {
    tresBas: number;   // Ex: 0.5 → value < low - range * 0.5
    tresHaut: number;  // Ex: 0.5 → value > high + range * 0.5
  };

  // Seuil de complétude minimum pour considérer un axe
  minCompletenessThreshold: number;  // Ex: 0.3 (30%)

  // Seuil pour déterminer orientation dominante
  orientationDominanceRatio: number;  // Ex: 0.6 (60%)
}
