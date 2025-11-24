// ========================================
// CALCUL DES SCORES D'AXES CLINIQUES
// ========================================
// Analyse l'interrogatoire pour calculer un score par axe (0-100)

import type { InterrogatoireEndobiogenique } from "./types";
import type { AxeType } from "./axeInterpretation";

export interface AxeScore {
  axe: AxeType;
  score: number; // 0-100
  status: "critical" | "warning" | "normal";
}

/**
 * Détermine le statut basé sur le score
 */
function getStatusFromScore(score: number): "critical" | "warning" | "normal" {
  if (score >= 70) return "critical";
  if (score >= 40) return "warning";
  return "normal";
}

/**
 * Calcule le score de l'axe neurovégétatif
 * Basé sur : sommeil, appétit, soif, transpiration, frilosité, transit, énergie
 */
function calculateNeuroScore(data: any): number {
  let score = 0;
  let maxScore = 0;

  // Problèmes de sommeil (poids fort)
  if (data?.sommeil_endormissement_difficile === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.sommeil_reveils_nocturnes === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.sommeil_reveils_fatigue === "oui") {
    score += 10;
  }
  maxScore += 10;

  // Troubles métaboliques
  if (data?.appetit_fringales === "oui") {
    score += 10;
  }
  maxScore += 10;

  if (data?.soif_importante === "oui" || data?.soif_faible === "oui") {
    score += 10;
  }
  maxScore += 10;

  // Régulation thermique
  if (data?.frilosite === "oui") {
    score += 10;
  }
  maxScore += 10;

  if (data?.intolerance_chaleur === "oui") {
    score += 10;
  }
  maxScore += 10;

  // Transit
  if (data?.transit_type === "lent" || data?.transit_type === "rapide" || data?.transit_type === "alternant") {
    score += 10;
  }
  maxScore += 10;

  // Énergie
  if (data?.energie_matin === "mauvaise") {
    score += 10;
  }
  maxScore += 10;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Calcule le score de l'axe adaptatif (stress/surrénales)
 * Basé sur : stress, irritabilité, épuisement, fatigue, tensions
 */
function calculateAdaptatifScore(data: any): number {
  let score = 0;
  let maxScore = 0;

  // Stress (poids fort)
  if (data?.stress_actuel === "oui") {
    score += 20;
  }
  maxScore += 20;

  if (data?.stress_chronique === "oui") {
    score += 20;
  }
  maxScore += 20;

  // Épuisement
  if (data?.sensation_epuisement === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.besoin_stimulants === "oui") {
    score += 10;
  }
  maxScore += 10;

  // Humeur
  if (data?.irritabilite === "souvent" || data?.irritabilite === "toujours") {
    score += 10;
  }
  maxScore += 10;

  if (data?.sautes_humeur === "souvent" || data?.sautes_humeur === "toujours") {
    score += 10;
  }
  maxScore += 10;

  // Fatigue
  if (data?.fatigue_matin === "importante") {
    score += 15;
  }
  maxScore += 15;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Calcule le score de l'axe thyroïdien
 * Basé sur : température, poids, cheveux, peau, métabolisme
 */
function calculateThyroidienScore(data: any): number {
  let score = 0;
  let maxScore = 0;

  // Sensibilité température (poids fort)
  if (data?.sensibilite_froid === "oui") {
    score += 20;
  }
  maxScore += 20;

  if (data?.sensibilite_chaleur === "oui") {
    score += 15;
  }
  maxScore += 15;

  // Poids
  if (data?.prise_poids_recent === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.perte_poids_recent === "oui") {
    score += 10;
  }
  maxScore += 10;

  // Phanères
  if (data?.chute_cheveux === "oui") {
    score += 10;
  }
  maxScore += 10;

  if (data?.peau_seche === "oui") {
    score += 10;
  }
  maxScore += 10;

  // Mental
  if (data?.lenteur_mentale === "oui") {
    score += 10;
  }
  maxScore += 10;

  if (data?.troubles_memoire === "oui") {
    score += 10;
  }
  maxScore += 10;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Calcule le score de l'axe gonadique
 * Basé sur : cycles, SPM, bouffées, libido (adapté selon sexe)
 */
function calculateGonadiqueScore(data: any, sexe: "H" | "F"): number {
  let score = 0;
  let maxScore = 0;

  if (sexe === "F") {
    // Femme : cycles, SPM, ménopause
    if (data?.cycle_regulier === "non") {
      score += 15;
    }
    maxScore += 15;

    if (data?.cycle_saignements_abondants === "oui") {
      score += 10;
    }
    maxScore += 10;

    if (data?.cycle_douleurs_importantes === "oui") {
      score += 10;
    }
    maxScore += 10;

    if (data?.spm_irritabilite === "oui") {
      score += 10;
    }
    maxScore += 10;

    if (data?.spm_douleurs_seins === "oui") {
      score += 10;
    }
    maxScore += 10;

    if (data?.bouffees_chaleur === "oui") {
      score += 15;
    }
    maxScore += 15;

    if (data?.libido_basse === "oui") {
      score += 10;
    }
    maxScore += 10;

    if (data?.secheresse_vaginale === "oui") {
      score += 10;
    }
    maxScore += 10;

    if (data?.contraception_hormonale === "oui") {
      score += 10; // Impact hormonal
    }
    maxScore += 10;
  } else {
    // Homme : libido, érections, masse musculaire
    if (data?.libido_basse === "oui") {
      score += 25;
    }
    maxScore += 25;

    if (data?.erections_matinales_diminuees === "oui") {
      score += 20;
    }
    maxScore += 20;

    if (data?.perte_muscle === "oui") {
      score += 15;
    }
    maxScore += 15;

    if (data?.prise_graisse_abdominale === "oui") {
      score += 15;
    }
    maxScore += 15;

    if (data?.troubles_urinaires === "oui") {
      score += 15;
    }
    maxScore += 15;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Calcule le score de l'axe digestif/métabolique
 * Basé sur : digestion, ballonnements, transit, hypoglycémies
 */
function calculateDigestifScore(data: any): number {
  let score = 0;
  let maxScore = 0;

  if (data?.digestion_lente === "oui" || data?.digestion_lourde === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.ballonnements === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.transit === "constipation" || data?.transit === "diarrhee" || data?.transit === "alternant") {
    score += 20;
  }
  maxScore += 20;

  if (data?.hypoglycemies === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.intolerance_alcool === "oui") {
    score += 10;
  }
  maxScore += 10;

  if (data?.prise_poids_centrale === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.intolerances_connues) {
    score += 10;
  }
  maxScore += 10;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Calcule le score de l'axe immuno-inflammatoire
 * Basé sur : douleurs, allergies, infections, dermatoses
 */
function calculateImmunoScore(data: any): number {
  let score = 0;
  let maxScore = 0;

  if (data?.douleurs_articulaires === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.douleurs_musculaires === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.allergies_saisonnieres === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.allergies_alimentaires === "oui") {
    score += 15;
  }
  maxScore += 15;

  if (data?.infections_recidivantes === "oui") {
    score += 20;
  }
  maxScore += 20;

  if (data?.eczema === "oui") {
    score += 10;
  }
  maxScore += 10;

  if (data?.psoriasis === "oui") {
    score += 10;
  }
  maxScore += 10;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * FONCTION PRINCIPALE : Calcule tous les scores d'axes depuis l'interrogatoire
 */
export function calculateAxeScores(interrogatoire: InterrogatoireEndobiogenique | null): AxeScore[] {
  if (!interrogatoire) return [];

  const scores: AxeScore[] = [];
  const sexe = interrogatoire.sexe || "F";

  // Format V2 uniquement
  if (interrogatoire.v2?.answersByAxis) {
    const { answersByAxis } = interrogatoire.v2;

    // Neurovégétatif
    if (answersByAxis.neuro) {
      const score = calculateNeuroScore(answersByAxis.neuro);
      if (score > 0) {
        scores.push({
          axe: "neurovegetatif",
          score,
          status: getStatusFromScore(score)
        });
      }
    }

    // Adaptatif
    if (answersByAxis.adaptatif) {
      const score = calculateAdaptatifScore(answersByAxis.adaptatif);
      if (score > 0) {
        scores.push({
          axe: "adaptatif",
          score,
          status: getStatusFromScore(score)
        });
      }
    }

    // Thyroïdien
    if (answersByAxis.thyro) {
      const score = calculateThyroidienScore(answersByAxis.thyro);
      if (score > 0) {
        scores.push({
          axe: "thyroidien",
          score,
          status: getStatusFromScore(score)
        });
      }
    }

    // Gonadique
    if (answersByAxis.gonado) {
      const score = calculateGonadiqueScore(answersByAxis.gonado, sexe);
      if (score > 0) {
        scores.push({
          axe: "gonadique",
          score,
          status: getStatusFromScore(score)
        });
      }
    }

    // Digestif
    if (answersByAxis.digestif) {
      const score = calculateDigestifScore(answersByAxis.digestif);
      if (score > 0) {
        scores.push({
          axe: "digestif",
          score,
          status: getStatusFromScore(score)
        });
      }
    }

    // Immuno
    if (answersByAxis.immuno) {
      const score = calculateImmunoScore(answersByAxis.immuno);
      if (score > 0) {
        scores.push({
          axe: "immuno",
          score,
          status: getStatusFromScore(score)
        });
      }
    }
  }

  // Trier par score décroissant
  return scores.sort((a, b) => b.score - a.score);
}
