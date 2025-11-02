// ========================================
// INTERPRÉTATION GLOBALE - Module BdF
// ========================================
// Génère un résumé fonctionnel et identifie les axes dominants
// à partir des index calculés.

import type { IndexResults, InterpretationPayload } from "./types";

/**
 * Génère l'interprétation globale du profil fonctionnel
 * @param results - Les 6 index calculés
 * @returns Payload avec summary, axes dominants et note technique
 */
export function interpretResults(
  results: IndexResults
): InterpretationPayload {
  const axesDominants: string[] = [];
  const summaryParts: string[] = [];

  // ==========================================
  // ANALYSE DE L'INDEX THYROÏDIEN
  // ==========================================
  if (results.indexThyroidien.value !== null) {
    if (results.indexThyroidien.value > 2.0) {
      axesDominants.push("Axe thyréotrope mobilisé efficacement");
      summaryParts.push(
        "Le rendement fonctionnel thyroïdien apparaît efficace"
      );
    } else {
      axesDominants.push("Rendement thyroïdien périphérique réduit");
      summaryParts.push(
        "Le rendement fonctionnel thyroïdien semble limité"
      );
    }
  }

  // ==========================================
  // ANALYSE DE L'INDEX GÉNITO-THYROÏDIEN (gT)
  // ==========================================
  if (results.gT.value !== null) {
    if (results.gT.value < 2.5) {
      axesDominants.push("Demande accrue sur l'axe thyréotrope");
      summaryParts.push(
        "avec une sollicitation marquée de la thyroïde face à la pression œstrogénique"
      );
    }
  }

  // ==========================================
  // ANALYSE DE L'INDEX D'ADAPTATION
  // ==========================================
  if (results.indexAdaptation.value !== null) {
    if (results.indexAdaptation.value < 0.7) {
      axesDominants.push("Adaptation orientée ACTH/cortisol");
      summaryParts.push(
        "L'adaptation semble davantage orientée vers l'axe cortico-surrénalien"
      );
    } else {
      axesDominants.push("Adaptation orientée FSH/œstrogènes");
      summaryParts.push(
        "L'adaptation privilégie l'axe gonadotrope (FSH/œstrogènes)"
      );
    }
  }

  // ==========================================
  // ANALYSE DE L'INDEX ŒSTROGÉNIQUE
  // ==========================================
  if (results.indexOestrogenique.value !== null) {
    if (results.indexOestrogenique.value > 0.05) {
      axesDominants.push("Pression pro-croissance/anabolique élevée");
      summaryParts.push(
        "avec une sollicitation pro-croissance/anabolique marquée"
      );
    }
  }

  // ==========================================
  // ANALYSE DU TURN-OVER TISSULAIRE
  // ==========================================
  if (results.turnover.value !== null) {
    if (results.turnover.value > 100) {
      axesDominants.push("Renouvellement tissulaire sur-sollicité");
      summaryParts.push(
        "Le turn-over tissulaire est fortement mobilisé avec risque de saturation"
      );
    }
  }

  // ==========================================
  // ANALYSE DE L'INDEX GÉNITAL
  // ==========================================
  if (results.indexGenital.value !== null) {
    if (results.indexGenital.value > 600) {
      axesDominants.push("Empreinte androgénique tissulaire dominante");
    } else {
      axesDominants.push("Empreinte œstrogénique relative plus marquée");
    }
  }

  // ==========================================
  // CONSTRUCTION DU SUMMARY
  // ==========================================
  let summary: string;

  if (summaryParts.length === 0) {
    summary =
      "Profil fonctionnel partiel (données insuffisantes pour une interprétation complète).";
  } else if (summaryParts.length === 1) {
    summary = `Profil fonctionnel : ${summaryParts[0]}.`;
  } else {
    // Joindre les parties avec des virgules et un point final
    summary = `Profil fonctionnel : ${summaryParts.join(", ")}.`;
  }

  // ==========================================
  // NOTE TECHNIQUE (CONSTANTE)
  // ==========================================
  const noteTechnique =
    "Analyse fonctionnelle du terrain selon la Biologie des Fonctions. À corréler au contexte clinique.";

  return {
    indexes: results,
    summary,
    axesDominants,
    noteTechnique,
  };
}
