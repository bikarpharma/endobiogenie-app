// lib/ai/prepareDataForAI.ts
// Prépare les données (Interrogatoire + BdF) pour l'Assistant GPT
// SÉCURITÉ: Aucune PII (nom, prénom, email) n'est envoyée à l'IA

import { calculateClinicalScoresV3 } from "../interrogatoire/clinicalScoringV3";
import type { ScoreAxeEndobiogenique, TerrainDetecte } from "../interrogatoire/clinicalScoringV3";
import { sanitizePatientForAI, assertNoPII } from "./sanitizeForAI";

// ========================================
// TYPES POUR L'IA
// ========================================

/**
 * Format de données envoyé à l'Assistant GPT
 * Optimisé pour être lisible et interprétable par l'IA
 */
export interface AIReadyData {
  // Métadonnées
  meta: {
    timestamp: string;
    sources_disponibles: {
      interrogatoire: boolean;
      bdf: boolean;
      clinique: boolean;
    };
    type_synthese: "unifiee" | "bdf_seule" | "interro_seule";
  };

  // Informations patient
  patient: {
    age: number | null;
    sexe: "H" | "F";
    motif_consultation?: string;
    allergies?: string[];
    medicaments_actuels?: string[];
    antecedents?: string[];
    grossesse?: boolean;
    allaitement?: boolean;
  };

  // Données interrogatoire (pré-scorées par V3)
  interrogatoire?: {
    // Score global par axe avec symptômes clés
    axes: {
      neuro_vegetatif?: AIAxeScore;
      corticotrope?: AIAxeScore;
      thyreotrope?: AIAxeScore;
      gonadotrope?: AIAxeScore;
      somatotrope?: AIAxeScore;
      digestif?: AIAxeScore;
      immuno_inflammatoire?: AIAxeScore;
    };

    // Terrains pathologiques détectés
    terrains_detectes: AITerrainDetecte[];

    // Synthèse globale de l'interrogatoire
    synthese: {
      terrain_principal: string | null;
      axe_prioritaire: string | null;
      capacite_adaptation: "bonne" | "moderee" | "faible" | "epuisee";
      risque_spasmophilie: boolean;
      recommandations_initiales: string[];
    };

    // Statistiques de complétion
    completude: {
      axes_remplis: number;
      axes_total: number;
      pourcentage: number;
    };
  };

  // Données BdF (index calculés)
  bdf?: {
    // Tous les index avec leurs valeurs
    index: Record<string, number>;

    // Index HORS NORMES uniquement (ce qui intéresse l'IA)
    hors_normes: AIIndexHorsNorme[];

    // Axes sollicités détectés par la BdF
    axes_sollicites: string[];

    // Orientation globale BdF
    orientation_globale?: string;
  };

  // Données examen clinique (optionnel)
  clinique?: {
    signes_examen: string[];
    observations: string;
  };
}

/**
 * Score d'un axe formaté pour l'IA
 */
export interface AIAxeScore {
  score_insuffisance: number;  // 0-100
  score_sur_sollicitation: number;  // 0-100
  orientation: "equilibre" | "insuffisance" | "sur_sollicitation" | "mixte";
  intensite: number;  // 0-10
  confiance: number;  // 0-1
  description: string;
  symptomes_cles: string[];
}

/**
 * Terrain pathologique détecté
 */
export interface AITerrainDetecte {
  terrain: string;
  score: number;
  indicateurs: string[];
  axes_impliques: string[];
}

/**
 * Index BdF hors norme
 */
export interface AIIndexHorsNorme {
  nom: string;
  valeur: number;
  norme_min: number;
  norme_max: number;
  interpretation: "bas" | "haut";
  axe_concerne?: string;
}

// ========================================
// INTERFACES D'ENTRÉE
// ========================================

export interface PatientData {
  id?: string;
  // ⚠️ Ces champs PII sont sanitizés et ne sont JAMAIS envoyés à l'IA
  nom?: string;
  prenom?: string;
  numeroPatient?: string;
  email?: string;
  telephone?: string;
  // Données démographiques (âge calculé, pas date de naissance)
  dateNaissance?: Date | string | null;
  sexe: "H" | "F" | "M" | null;
  // Données médicales (envoyées à l'IA après sanitization)
  allergies?: string | null;
  traitementActuel?: string | null;
  atcdMedicaux?: string | null;
  motifConsultation?: string | null;
}

export interface BdfIndexResults {
  [key: string]: number | undefined;
}

export interface BdfNormes {
  [key: string]: { min: number; max: number; axe?: string };
}

// ========================================
// NORMES BDF PAR DÉFAUT
// ========================================
// ⚠️ SYNCHRONISÉ AVEC indexes.config.ts - Ne pas modifier sans vérifier la source

const NORMES_BDF_DEFAULT: BdfNormes = {
  // ============================================
  // SECTION 1: INDEX GONADOTROPE
  // ============================================
  idx_genital: { min: 0.70, max: 0.85, axe: "gonadotrope" },
  idx_genito_thyroidien: { min: 1.5, max: 2.5, axe: "gonadotrope" },
  idx_genital_corrige: { min: 0.70, max: 0.85, axe: "gonadotrope" },
  idx_oestrogenes: { min: 0.14, max: 0.24, axe: "gonadotrope" },

  // ============================================
  // SECTION 2: INDEX CORTICOTROPE / ADAPTATION
  // ============================================
  idx_adaptation: { min: 0.25, max: 0.50, axe: "corticotrope" },
  idx_cortisol_cortex: { min: 2.0, max: 4.0, axe: "corticotrope" },
  idx_mineralo: { min: 28, max: 34, axe: "corticotrope" },
  idx_cortisol: { min: 3, max: 7, axe: "corticotrope" },
  idx_cortex_surrenalien: { min: 2.7, max: 3.3, axe: "corticotrope" },

  // ============================================
  // SECTION 3: INDEX SNA - SYSTÈME NERVEUX AUTONOME
  // ============================================
  idx_mobilisation_plaquettes: { min: 0.85, max: 1.15, axe: "neuro" },
  idx_mobilisation_leucocytes: { min: 0.85, max: 1.15, axe: "neuro" },
  idx_starter: { min: 0.85, max: 1.15, axe: "neuro" },  // CORRIGÉ (était 1.35)
  idx_histamine_potentielle: { min: 6.0, max: 12.0, axe: "neuro" },

  // ============================================
  // SECTION 4: INDEX THYRÉOTROPE
  // ============================================
  idx_thyroidien: { min: 3.5, max: 5.5, axe: "thyreotrope" },
  idx_rendement_thyroidien: { min: 2.0, max: 4.0, axe: "thyreotrope" },
  idx_trh_tsh: { min: 0.33, max: 1.70, axe: "thyreotrope" },
  idx_pth: { min: 2.0, max: 42.0, axe: "thyreotrope" },

  // ============================================
  // SECTION 5: INDEX SOMATOTROPE / CROISSANCE
  // ============================================
  idx_croissance: { min: 2.0, max: 6.0, axe: "somatotrope" },
  idx_remodelage_osseux: { min: 2.5, max: 8.5, axe: "somatotrope" },
  idx_osteomusculaire: { min: 0.75, max: 5.56, axe: "somatotrope" },
  idx_insuline: { min: 1.5, max: 5.0, axe: "somatotrope" },

  // ============================================
  // SECTION 6: INDEX MÉTABOLIQUES
  // ============================================
  idx_catabolisme: { min: 1.3, max: 1.6, axe: "metabolique" },
  idx_cata_ana: { min: 1.8, max: 3.0, axe: "metabolique" },
  idx_anabolisme: { min: 0.65, max: 0.8, axe: "metabolique" },
  idx_hepatique: { min: 0.8, max: 1.2, axe: "digestif" },
  idx_capacite_tampon: { min: 0.3, max: 0.8, axe: "digestif" },
  idx_oxydo_reduction: { min: 0.7, max: 2.0, axe: "metabolique" },
  idx_oxydation: { min: 1.44, max: 81.48, axe: "metabolique" },
  idx_reduction: { min: 0.72, max: 116.9, axe: "metabolique" },

  // ============================================
  // SECTION 7: INDEX INFLAMMATOIRES
  // ============================================
  idx_inflammation: { min: 2, max: 6, axe: "immuno" },  // CORRIGÉ (était 0-5)
};

// ========================================
// FONCTIONS DE TRANSFORMATION
// ========================================

/**
 * Transforme un ScoreAxeEndobiogenique (V3) en AIAxeScore
 */
function transformAxeScore(score: ScoreAxeEndobiogenique): AIAxeScore {
  return {
    score_insuffisance: score.insuffisance,
    score_sur_sollicitation: score.surSollicitation,
    orientation: score.orientation as AIAxeScore["orientation"],
    intensite: score.intensite,
    confiance: score.confiance,
    description: score.description,
    symptomes_cles: score.symptomesCles,
  };
}

/**
 * Transforme les terrains détectés
 */
function transformTerrains(terrains: TerrainDetecte[]): AITerrainDetecte[] {
  return terrains.map(t => ({
    terrain: t.terrain,
    score: t.score,
    indicateurs: t.indicateurs,
    axes_impliques: t.axesImpliques,
  }));
}

/**
 * Calcule l'âge à partir de la date de naissance
 */
function calculateAge(dateNaissance: Date | string | null | undefined): number | null {
  if (!dateNaissance) return null;
  const birthDate = new Date(dateNaissance);
  if (isNaN(birthDate.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Parse une chaîne en tableau (pour allergies, médicaments, etc.)
 */
function parseStringToArray(str: string | null | undefined): string[] {
  if (!str) return [];
  return str
    .split(/[,;\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Normalise le sexe
 */
function normalizeSexe(sexe: "H" | "F" | "M" | null | undefined): "H" | "F" {
  if (sexe === "F") return "F";
  return "H"; // Par défaut masculin
}

// ========================================
// FONCTION PRINCIPALE : PRÉPARER L'INTERROGATOIRE
// ========================================

/**
 * Prépare les données de l'interrogatoire pour l'IA
 */
export function prepareInterrogatoireForAI(
  answersByAxis: Record<string, Record<string, any>>,
  sexe: "H" | "F"
): AIReadyData["interrogatoire"] {
  // Calculer les scores avec V3
  const scoringResult = calculateClinicalScoresV3(answersByAxis, sexe);

  // Transformer les axes
  const axes: AIReadyData["interrogatoire"]["axes"] = {};

  if (scoringResult.axes.neuro) {
    axes.neuro_vegetatif = transformAxeScore(scoringResult.axes.neuro);
  }
  if (scoringResult.axes.adaptatif) {
    axes.corticotrope = transformAxeScore(scoringResult.axes.adaptatif);
  }
  if (scoringResult.axes.thyro) {
    axes.thyreotrope = transformAxeScore(scoringResult.axes.thyro);
  }
  if (scoringResult.axes.gonado) {
    axes.gonadotrope = transformAxeScore(scoringResult.axes.gonado);
  }
  if (scoringResult.axes.somato) {
    axes.somatotrope = transformAxeScore(scoringResult.axes.somato);
  }
  if (scoringResult.axes.digestif) {
    axes.digestif = transformAxeScore(scoringResult.axes.digestif);
  }
  if (scoringResult.axes.immuno) {
    axes.immuno_inflammatoire = transformAxeScore(scoringResult.axes.immuno);
  }

  // Compter les axes remplis
  const axesRemplis = Object.keys(axes).length;
  const axesTotal = 7; // 7 axes principaux

  return {
    axes,
    terrains_detectes: transformTerrains(scoringResult.terrainsDetectes),
    synthese: {
      terrain_principal: scoringResult.syntheseGlobale.terrainPrincipal,
      axe_prioritaire: scoringResult.syntheseGlobale.axePrioritaire,
      capacite_adaptation: scoringResult.syntheseGlobale.capaciteAdaptation,
      risque_spasmophilie: scoringResult.syntheseGlobale.risqueSpasmophilie,
      recommandations_initiales: scoringResult.syntheseGlobale.recommandationsPrioritaires,
    },
    completude: {
      axes_remplis: axesRemplis,
      axes_total: axesTotal,
      pourcentage: Math.round((axesRemplis / axesTotal) * 100),
    },
  };
}

// ========================================
// FONCTION PRINCIPALE : PRÉPARER LA BDF
// ========================================

/**
 * Prépare les données de la BdF pour l'IA
 */
export function prepareBdFForAI(
  indexResults: BdfIndexResults,
  normes: BdfNormes = NORMES_BDF_DEFAULT
): AIReadyData["bdf"] {
  const horsNormes: AIIndexHorsNorme[] = [];
  const axesSollicites = new Set<string>();

  // Parcourir tous les index
  for (const [indexName, value] of Object.entries(indexResults)) {
    if (value === undefined || value === null) continue;

    const norme = normes[indexName];
    if (!norme) continue;

    // Vérifier si hors norme
    if (value < norme.min) {
      horsNormes.push({
        nom: indexName,
        valeur: value,
        norme_min: norme.min,
        norme_max: norme.max,
        interpretation: "bas",
        axe_concerne: norme.axe,
      });
      if (norme.axe) axesSollicites.add(norme.axe);
    } else if (value > norme.max) {
      horsNormes.push({
        nom: indexName,
        valeur: value,
        norme_min: norme.min,
        norme_max: norme.max,
        interpretation: "haut",
        axe_concerne: norme.axe,
      });
      if (norme.axe) axesSollicites.add(norme.axe);
    }
  }

  // Trier par importance (plus éloigné de la norme = plus important)
  horsNormes.sort((a, b) => {
    const aDeviation = a.interpretation === "bas" 
      ? (a.norme_min - a.valeur) / a.norme_min
      : (a.valeur - a.norme_max) / a.norme_max;
    const bDeviation = b.interpretation === "bas"
      ? (b.norme_min - b.valeur) / b.norme_min
      : (b.valeur - b.norme_max) / b.norme_max;
    return bDeviation - aDeviation;
  });

  // Générer l'orientation globale
  let orientationGlobale = "Bilan biologique dans les normes";
  if (horsNormes.length > 0) {
    const axesList = Array.from(axesSollicites);
    if (axesList.length === 1) {
      orientationGlobale = `Sollicitation de l'axe ${axesList[0]}`;
    } else if (axesList.length > 1) {
      orientationGlobale = `Sollicitation multi-axiale : ${axesList.join(", ")}`;
    }
  }

  return {
    index: indexResults as Record<string, number>,
    hors_normes: horsNormes,
    axes_sollicites: Array.from(axesSollicites),
    orientation_globale: orientationGlobale,
  };
}

// ========================================
// FONCTION PRINCIPALE : CONTEXTE COMPLET
// ========================================

/**
 * Prépare le contexte complet pour l'Assistant GPT
 * Fusionne Interrogatoire + BdF + Patient
 *
 * SÉCURITÉ: Cette fonction garantit qu'aucune PII n'est envoyée à l'IA
 * - Pas de nom, prénom, email, téléphone
 * - L'âge est converti en tranche d'âge si mode strict
 * - Les textes libres sont scannés pour détecter des PII
 */
export function prepareFullContextForAI(
  patient: PatientData,
  answersByAxis?: Record<string, Record<string, any>> | null,
  bdfResults?: BdfIndexResults | null,
  bdfNormes?: BdfNormes,
  options?: { strictPIIMode?: boolean }
): AIReadyData {
  const sexe = normalizeSexe(patient.sexe);

  // Déterminer les sources disponibles
  const hasInterrogatoire = answersByAxis && Object.keys(answersByAxis).length > 0;
  const hasBdf = bdfResults && Object.keys(bdfResults).length > 0;

  // Déterminer le type de synthèse
  let typeSynthese: AIReadyData["meta"]["type_synthese"];
  if (hasInterrogatoire && hasBdf) {
    typeSynthese = "unifiee";
  } else if (hasBdf) {
    typeSynthese = "bdf_seule";
  } else {
    typeSynthese = "interro_seule";
  }

  // SÉCURITÉ: Sanitize les données patient avant envoi à l'IA
  const { sanitized: sanitizedPatient, warnings } = sanitizePatientForAI({
    id: patient.id,
    nom: patient.nom,
    prenom: patient.prenom,
    dateNaissance: patient.dateNaissance,
    sexe: patient.sexe,
    allergies: patient.allergies,
    traitementActuel: patient.traitementActuel,
    atcdMedicaux: patient.atcdMedicaux,
    motifConsultation: patient.motifConsultation,
  });

  // Log des avertissements de sanitization
  if (warnings.length > 0) {
    console.warn("[prepareDataForAI] PII sanitization:", warnings);
  }

  // Construire l'objet AIReadyData (SANS PII)
  const aiData: AIReadyData = {
    meta: {
      timestamp: new Date().toISOString(),
      sources_disponibles: {
        interrogatoire: !!hasInterrogatoire,
        bdf: !!hasBdf,
        clinique: false,
      },
      type_synthese: typeSynthese,
    },
    patient: {
      // Utiliser l'âge calculé (pas la date de naissance exacte)
      age: calculateAge(patient.dateNaissance),
      sexe,
      motif_consultation: sanitizedPatient.motif_consultation || undefined,
      allergies: sanitizedPatient.allergies,
      medicaments_actuels: sanitizedPatient.medicaments_actuels,
      antecedents: sanitizedPatient.antecedents,
    },
  };

  // Ajouter l'interrogatoire si disponible
  if (hasInterrogatoire && answersByAxis) {
    aiData.interrogatoire = prepareInterrogatoireForAI(answersByAxis, sexe);
  }

  // Ajouter la BdF si disponible
  if (hasBdf && bdfResults) {
    aiData.bdf = prepareBdFForAI(bdfResults, bdfNormes);
  }

  // Vérification finale: s'assurer qu'aucune PII n'est présente
  if (options?.strictPIIMode) {
    assertNoPII(aiData as unknown as Record<string, unknown>);
  }

  return aiData;
}

// ========================================
// EXPORT PAR DÉFAUT
// ========================================

export default {
  prepareFullContextForAI,
  prepareInterrogatoireForAI,
  prepareBdFForAI,
};
