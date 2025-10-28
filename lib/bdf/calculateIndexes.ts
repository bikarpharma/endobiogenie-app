// ========================================
// CALCUL DES INDEX - Module BdF
// ========================================
// Applique les formules de Biologie des Fonctions
// et génère les commentaires interprétatifs.

import type { LabValues, IndexResults, IndexValue } from "./types";

/**
 * Calcule les 8 index de Biologie des Fonctions
 * @param lab - Valeurs biologiques en entrée
 * @returns Les 8 index avec leurs commentaires
 */
export function calculateIndexes(lab: LabValues): IndexResults {
  // ==========================================
  // 1. INDEX GÉNITAL (GR / GB)
  // ==========================================
  const indexGenital = calculateIndexGenital(lab.GR, lab.GB);

  // ==========================================
  // 2. INDEX THYROÏDIEN (LDH / CPK)
  // ==========================================
  const indexThyroidien = calculateIndexThyroidien(lab.LDH, lab.CPK);

  // ==========================================
  // 3. INDEX GÉNITO-THYROÏDIEN (Neutrophiles / Lymphocytes)
  // ==========================================
  const gT = calculateGT(lab.neutrophiles, lab.lymphocytes);

  // ==========================================
  // 4. INDEX D'ADAPTATION (Eosinophiles / Monocytes)
  // ==========================================
  const indexAdaptation = calculateIndexAdaptation(
    lab.eosinophiles,
    lab.monocytes
  );

  // ==========================================
  // 5. INDEX ŒSTROGÉNIQUE (TSHcorr / ostéocalcine)
  // ==========================================
  const indexOestrogenique = calculateIndexOestrogenique(
    lab.TSH,
    lab.osteocalcine
  );

  // ==========================================
  // 6. INDEX DE TURN-OVER TISSULAIRE (TSHcorr * PAOi)
  // ==========================================
  const turnover = calculateTurnover(lab.TSH, lab.PAOi);

  // ==========================================
  // 7. RENDEMENT THYROÏDIEN ((LDH / CPK) / TSHcorr)
  // ==========================================
  const rendementThyroidien = calculateRendementThyroidien(
    lab.LDH,
    lab.CPK,
    lab.TSH
  );

  // ==========================================
  // 8. REMODELAGE OSSEUX ((TSHcorr * PAOi) / Ostéocalcine)
  // ==========================================
  const remodelageOsseux = calculateRemodelageOsseux(
    lab.TSH,
    lab.PAOi,
    lab.osteocalcine
  );

  return {
    indexGenital,
    indexThyroidien,
    gT,
    indexAdaptation,
    indexOestrogenique,
    turnover,
    rendementThyroidien,
    remodelageOsseux,
  };
}

// ==========================================
// FONCTIONS DE CALCUL INDIVIDUELLES
// ==========================================

/**
 * Index génital = GR / GB
 * Reflète la dominance androgénique tissulaire relative aux œstrogènes
 */
function calculateIndexGenital(
  GR?: number,
  GB?: number
): IndexValue {
  if (!GR || !GB || GB === 0) {
    return {
      value: null,
      comment: "Calcul impossible (données manquantes ou GB = 0)",
    };
  }

  const value = GR / GB;

  // Interprétation (seuil arbitraire à 600)
  if (value > 600) {
    return {
      value,
      comment: "Empreinte androgénique tissulaire marquée",
    };
  } else {
    return {
      value,
      comment:
        "Empreinte œstrogénique plus marquée / androgénie tissulaire plus faible",
    };
  }
}

/**
 * Index thyroïdien = LDH / CPK
 * Rendement fonctionnel des hormones thyroïdiennes en périphérie
 */
function calculateIndexThyroidien(
  LDH?: number,
  CPK?: number
): IndexValue {
  if (!LDH || !CPK || CPK === 0) {
    return {
      value: null,
      comment: "Calcul impossible (données manquantes ou CPK = 0)",
    };
  }

  const value = LDH / CPK;

  // Interprétation (seuil arbitraire à 2.0)
  if (value > 2.0) {
    return {
      value,
      comment: "Activité métabolique thyroïdienne efficace / accélérée",
    };
  } else {
    return {
      value,
      comment: "Rendement fonctionnel thyroïdien réduit",
    };
  }
}

/**
 * Index génito-thyroïdien (gT) = Neutrophiles / Lymphocytes
 * Capacité de la thyroïde à répondre à la stimulation œstrogénique périphérique
 */
function calculateGT(
  neutrophiles?: number,
  lymphocytes?: number
): IndexValue {
  if (!neutrophiles || !lymphocytes || lymphocytes === 0) {
    return {
      value: null,
      comment: "Calcul impossible (données manquantes ou lymphocytes = 0)",
    };
  }

  const value = neutrophiles / lymphocytes;

  // Interprétation (seuil arbitraire à 2.5)
  if (value > 2.5) {
    return {
      value,
      comment:
        "Réponse thyroïdienne jugée suffisante face à la stimulation œstrogénique",
    };
  } else {
    return {
      value,
      comment: "Demande accrue adressée à l'axe thyréotrope",
    };
  }
}

/**
 * Index d'adaptation = Eosinophiles / Monocytes
 * Stratégie d'adaptation entre ACTH/cortisol et FSH/œstrogènes
 */
function calculateIndexAdaptation(
  eosinophiles?: number,
  monocytes?: number
): IndexValue {
  if (!eosinophiles || !monocytes || monocytes === 0) {
    return {
      value: null,
      comment: "Calcul impossible (données manquantes ou monocytes = 0)",
    };
  }

  const value = eosinophiles / monocytes;

  // Interprétation (seuil arbitraire à 0.7)
  if (value > 0.7) {
    return {
      value,
      comment: "Orientation de l'adaptation vers FSH/œstrogènes",
    };
  } else {
    return {
      value,
      comment: "Orientation de l'adaptation vers ACTH/cortisol",
    };
  }
}

/**
 * Index œstrogénique = TSHcorr / ostéocalcine
 * Pression pro-croissance / anabolique centrale
 * TSHcorr = correction de TSH entre 0.5 et 5
 */
function calculateIndexOestrogenique(
  TSH?: number,
  osteocalcine?: number
): IndexValue {
  if (!TSH || !osteocalcine || osteocalcine === 0) {
    return {
      value: null,
      comment: "Calcul impossible (données manquantes ou ostéocalcine = 0)",
    };
  }

  // Correction de TSH (entre 0.5 et 5)
  const TSHcorr = correctTSH(TSH);

  const value = TSHcorr / osteocalcine;

  // Interprétation (seuil arbitraire à 0.05)
  if (value > 0.05) {
    return {
      value,
      comment: "Forte sollicitation pro-croissance/anabolique",
    };
  } else {
    return {
      value,
      comment: "Pression pro-croissance plus faible",
    };
  }
}

/**
 * Index de turn-over tissulaire = TSHcorr * PAOi
 * Vitesse de renouvellement/remodelage tissulaire global
 */
function calculateTurnover(TSH?: number, PAOi?: number): IndexValue {
  if (!TSH || !PAOi) {
    return {
      value: null,
      comment: "Calcul impossible (données manquantes)",
    };
  }

  // Correction de TSH (entre 0.5 et 5)
  const TSHcorr = correctTSH(TSH);

  const value = TSHcorr * PAOi;

  // Interprétation (seuil arbitraire à 100)
  if (value > 100) {
    return {
      value,
      comment:
        "Sur-sollicitation du renouvellement tissulaire avec risque de ralentissement d'exécution",
    };
  } else {
    return {
      value,
      comment: "Renouvellement tissulaire non surchargé",
    };
  }
}

/**
 * Rendement thyroïdien = (IndexThyroïdien) / TSHcorr
 * = (LDH / CPK) / TSHcorr
 * Évalue l'efficacité de la réponse thyroïdienne par rapport à la sollicitation centrale
 */
function calculateRendementThyroidien(
  LDH?: number,
  CPK?: number,
  TSH?: number
): IndexValue {
  if (!LDH || !CPK || !TSH || CPK === 0) {
    return {
      value: null,
      comment: "Calcul impossible (données manquantes)",
    };
  }

  // Calcul de l'index thyroïdien
  const indexThyroidien = LDH / CPK;

  // Correction de TSH (entre 0.5 et 5)
  const TSHcorr = correctTSH(TSH);

  const value = indexThyroidien / TSHcorr;

  // Interprétation (seuil arbitraire à 1.0)
  if (value > 1.0) {
    return {
      value,
      comment: "Réponse thyréotrope rapide par rapport à la sollicitation centrale",
    };
  } else {
    return {
      value,
      comment: "Réponse thyréotrope plus lente / besoin de stimulation prolongée",
    };
  }
}

/**
 * Remodelage osseux = Turnover / Ostéocalcine
 * = (TSHcorr * PAOi) / Ostéocalcine
 * Évalue la sollicitation du remodelage structurel osseux
 */
function calculateRemodelageOsseux(
  TSH?: number,
  PAOi?: number,
  osteocalcine?: number
): IndexValue {
  if (!TSH || !PAOi || !osteocalcine || osteocalcine === 0) {
    return {
      value: null,
      comment: "Calcul impossible (données manquantes)",
    };
  }

  // Correction de TSH (entre 0.5 et 5)
  const TSHcorr = correctTSH(TSH);

  // Calcul du turnover
  const turnover = TSHcorr * PAOi;

  const value = turnover / osteocalcine;

  // Interprétation (seuil arbitraire à 5.0)
  if (value > 5.0) {
    return {
      value,
      comment: "Sollicitation de remodelage structurel importante",
    };
  } else {
    return {
      value,
      comment: "Remodelage tissulaire moins sollicité",
    };
  }
}

// ==========================================
// UTILITAIRE : Correction TSH
// ==========================================

/**
 * Corrige TSH pour qu'elle soit entre 0.5 et 5
 * @param TSH - Valeur TSH mesurée
 * @returns TSH corrigée
 */
function correctTSH(TSH: number): number {
  if (TSH < 0.5) return 0.5;
  if (TSH > 5) return 5;
  return TSH;
}
