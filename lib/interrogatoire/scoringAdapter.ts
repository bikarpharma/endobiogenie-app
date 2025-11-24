// ========================================
// ADAPTATEUR DE COMPATIBILITÉ V1 ← V2
// ========================================
// Convertit les scores V2 (nouveau format) vers le format V1
// pour maintenir la compatibilité avec le système d'ordonnances

import type { ClinicalScoresV2, AxeScore } from "./clinicalScoringV2";
import type { ClinicalAxeScores } from "./clinicalScoring";

/**
 * Convertit un AxeScore V2 en score simple (0-10)
 */
function axeScoreToSimple(score: AxeScore | undefined): number {
  if (!score) return 0;
  // Convertir le score 0-100 en 0-10
  const dominant = Math.max(score.hypo, score.hyper);
  return Math.round(dominant / 10);
}

/**
 * Adaptateur : ClinicalScoresV2 → ClinicalAxeScores (ancien format)
 * Permet au système d'ordonnances de continuer à fonctionner
 * avec le nouveau format d'interrogatoire
 */
export function adaptScoresV2ToV1(scoresV2: ClinicalScoresV2): ClinicalAxeScores {
  // Neurovégétatif
  const neuroSymp = scoresV2.neuro?.hyper ? Math.round(scoresV2.neuro.hyper / 20) : 0;
  const neuroPara = scoresV2.neuro?.hypo ? Math.round(scoresV2.neuro.hypo / 20) : 0;
  let neuroOrientation: ClinicalAxeScores["neuroVegetatif"]["orientation"] = "equilibre";
  if (scoresV2.neuro?.orientation === "hyper") neuroOrientation = "sympathicotonique";
  if (scoresV2.neuro?.orientation === "hypo") neuroOrientation = "parasympathicotonique";

  // Adaptatif
  const adaptHyper = scoresV2.adaptatif?.hyper ? Math.round(scoresV2.adaptatif.hyper / 20) : 0;
  const adaptHypo = scoresV2.adaptatif?.hypo ? Math.round(scoresV2.adaptatif.hypo / 20) : 0;
  let adaptOrientation: ClinicalAxeScores["adaptatif"]["orientation"] = "equilibre";
  if (scoresV2.adaptatif?.orientation === "hyper") adaptOrientation = "hyperadaptatif";
  if (scoresV2.adaptatif?.orientation === "hypo") adaptOrientation = "hypoadaptatif";

  // Thyroïdien
  const thyHypo = scoresV2.thyro?.hypo ? Math.round(scoresV2.thyro.hypo / 20) : 0;
  const thyHyper = scoresV2.thyro?.hyper ? Math.round(scoresV2.thyro.hyper / 20) : 0;
  let thyOrientation: ClinicalAxeScores["thyroidien"]["orientation"] = "normal";
  if (scoresV2.thyro?.orientation === "hypo") thyOrientation = "hypometabolisme";
  if (scoresV2.thyro?.orientation === "hyper") thyOrientation = "hypermetabolisme";

  // Gonadique
  const gonHypo = scoresV2.gonado?.hypo ? Math.round(scoresV2.gonado.hypo / 20) : 0;
  const gonHyper = scoresV2.gonado?.hyper ? Math.round(scoresV2.gonado.hyper / 20) : 0;
  let gonOrientation: ClinicalAxeScores["gonadique"]["orientation"] = "normal";
  if (scoresV2.gonado?.orientation === "hypo") gonOrientation = "hypogonadisme";
  if (scoresV2.gonado?.orientation === "hyper") gonOrientation = "hypergonadisme";
  if (scoresV2.gonado?.orientation === "mixte") gonOrientation = "dysregulation";

  // Digestif (mapping approximatif)
  const digestDysbiose = scoresV2.digestif?.hyper ? Math.round(scoresV2.digestif.hyper / 20) : 0;
  const digestLenteur = scoresV2.digestif?.hypo ? Math.round(scoresV2.digestif.hypo / 20) : 0;
  const digestInflamm = scoresV2.digestif?.hyper ? Math.round(scoresV2.digestif.hyper / 30) : 0;

  // Immuno
  const immunoHyper = scoresV2.immuno?.hyper ? Math.round(scoresV2.immuno.hyper / 20) : 0;
  const immunoHypo = scoresV2.immuno?.hypo ? Math.round(scoresV2.immuno.hypo / 20) : 0;

  // Rythmes et Axes de Vie (valeurs par défaut car non présents en V2)
  const rythmeDesynch = 0;
  const stressChronique = 0;
  const traumatismes = 0;
  const sommeil = 0;

  return {
    neuroVegetatif: {
      sympathetic: neuroSymp,
      parasympathetic: neuroPara,
      orientation: neuroOrientation,
    },
    adaptatif: {
      hyper: adaptHyper,
      hypo: adaptHypo,
      orientation: adaptOrientation,
    },
    thyroidien: {
      hypo: thyHypo,
      hyper: thyHyper,
      orientation: thyOrientation,
    },
    gonadique: {
      hypo: gonHypo,
      hyper: gonHyper,
      orientation: gonOrientation,
    },
    digestif: {
      dysbiose: digestDysbiose,
      lenteur: digestLenteur,
      inflammation: digestInflamm,
    },
    immunoInflammatoire: {
      hyper: immunoHyper,
      hypo: immunoHypo,
    },
    rythmes: {
      desynchronisation: rythmeDesynch,
    },
    axesVie: {
      stressChronique,
      traumatismes,
      sommeil,
    },
  };
}
