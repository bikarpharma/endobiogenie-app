/**
 * MAPPINGS INDEX BDF ↔ AXES INTERROGATOIRE
 * =========================================
 *
 * Ce fichier définit les correspondances entre les index de la BDF
 * et les axes de l'interrogatoire clinique pour la détection de concordance.
 *
 * IMPORTANT: Certains index impactent PLUSIEURS axes (ex: idx_genito_thyroidien)
 */

import type { IndexAxeMapping } from "./types";

// ============================================================
// LABELS DES AXES
// ============================================================

export const AXE_LABELS: Record<string, string> = {
  thyro: "Thyroïdien",
  adaptatif: "Adaptatif (Corticotrope)",
  gonado: "Gonadotrope",
  somato: "Somatotrope (GH)",
  neuro: "Neuro-végétatif (SNA)",
  immuno: "Immuno-Inflammatoire",
  digestif: "Digestif / Hépatique",
  cardioMetabo: "Cardio-Métabolique",
  dermato: "Dermatologique",
};

// ============================================================
// MAPPING INDEX → AXES
// ============================================================

/**
 * Mapping complet des index BDF vers les axes de l'interrogatoire
 *
 * orientationWhenLow: Ce que signifie un index BAS pour cet axe
 * orientationWhenHigh: Ce que signifie un index HAUT pour cet axe
 *
 * Exemple: idx_thyroidien bas = hypothyroïdie = "hypo"
 *          idx_thyroidien haut = hyperthyroïdie = "hyper"
 */
export const INDEX_TO_AXE_MAPPING: IndexAxeMapping[] = [
  // ============================================================
  // AXE THYROÏDIEN
  // ============================================================
  {
    indexId: "idx_thyroidien",
    axes: ["thyro"],
    orientationWhenLow: "hypo",   // Index bas = hypothyroïdie fonctionnelle
    orientationWhenHigh: "hyper", // Index haut = hyperthyroïdie fonctionnelle
  },
  {
    indexId: "idx_rendement_thyroidien",
    axes: ["thyro"],
    orientationWhenLow: "hypo",   // Rendement bas = thyroïde inefficace
    orientationWhenHigh: "hyper", // Rendement élevé = thyroïde suractive
  },
  {
    indexId: "idx_pth",
    axes: ["thyro"],
    orientationWhenLow: "hyper",  // PTH basse = thyroïde efficiente (paradoxal)
    orientationWhenHigh: "hypo",  // PTH élevée = thyroïde inefficiente
  },
  {
    indexId: "idx_genito_thyroidien",
    axes: ["thyro", "gonado"],    // Double impact !
    orientationWhenLow: "hyper",  // Dominance TSH/thyroïde
    orientationWhenHigh: "hypo",  // Dominance œstrogènes/FSH
  },

  // ============================================================
  // AXE ADAPTATIF (CORTICOTROPE / SURRÉNALES)
  // ============================================================
  {
    indexId: "idx_adaptation",
    axes: ["adaptatif"],
    orientationWhenLow: "hypo",   // Cortisol insuffisant, risque auto-immun
    orientationWhenHigh: "hyper", // ACTH/cortisol hyperactif, risque atopique
  },
  {
    indexId: "idx_cortisol_ratio",
    axes: ["adaptatif"],
    orientationWhenLow: "hypo",   // Androgènes surrénaliens > cortisol
    orientationWhenHigh: "hyper", // Cortisol excessif
  },
  {
    indexId: "idx_mineralo",
    axes: ["adaptatif"],
    orientationWhenLow: "hypo",   // Insuffisance aldostérone
    orientationWhenHigh: "hyper", // Rétention hydrosodée
  },

  // ============================================================
  // AXE GONADIQUE
  // ============================================================
  {
    indexId: "idx_genital",
    axes: ["gonado"],
    orientationWhenLow: "hypo",   // Dominance œstrogénique (hypoandrogénie)
    orientationWhenHigh: "hyper", // Dominance androgénique (hyperandrogénie)
  },
  {
    indexId: "idx_oestrogenes",
    axes: ["gonado"],
    orientationWhenLow: "hypo",   // Faible activité œstrogénique
    orientationWhenHigh: "hyper", // Forte activité œstrogénique
  },
  {
    indexId: "idx_genital_corrige",
    axes: ["gonado"],
    orientationWhenLow: "hypo",   // Hypoandrogénie structurelle
    orientationWhenHigh: "hyper", // Hyperandrogénie structurelle
  },

  // ============================================================
  // AXE SOMATOTROPE (GH / CROISSANCE)
  // ============================================================
  {
    indexId: "idx_starter",
    axes: ["somato", "neuro"],    // Double impact: GH + SNA
    orientationWhenLow: "hypo",   // Hyper α-adaptatif + β bloqué
    orientationWhenHigh: "hyper", // Activité sympathique générale augmentée
  },
  {
    indexId: "idx_croissance",
    axes: ["somato"],
    orientationWhenLow: "hypo",   // GH/IGF-1 insuffisant
    orientationWhenHigh: "hyper", // Hyper-sollicitation croissance
  },
  {
    indexId: "idx_turnover",
    axes: ["somato"],
    orientationWhenLow: "hypo",   // Renouvellement tissulaire lent
    orientationWhenHigh: "hyper", // Turn-over accéléré
  },
  {
    indexId: "idx_remodelage_osseux",
    axes: ["somato"],
    orientationWhenLow: "hypo",   // Remodelage osseux faible
    orientationWhenHigh: "hyper", // Os sur-sollicité
  },
  {
    indexId: "idx_insuline",
    axes: ["somato"],
    orientationWhenLow: "hyper",  // Hyperinsulinisme par insensibilité
    orientationWhenHigh: "hyper", // Hyperinsulinisme direct
  },

  // ============================================================
  // AXE NEURO-VÉGÉTATIF (SNA)
  // ============================================================
  {
    indexId: "idx_mobilisation_plaquettes",
    axes: ["neuro"],
    orientationWhenLow: "hypo",   // Bêta-sympathique bloqué (spasmophilie)
    orientationWhenHigh: "hyper", // Bêta-sympathique hyperactif
  },
  {
    indexId: "idx_mobilisation_leucocytes",
    axes: ["neuro"],
    orientationWhenLow: "hypo",   // Flux adaptatif hépatique → splanchnique
    orientationWhenHigh: "hyper", // Congestion vasculaire hépatique
  },
  // idx_starter déjà mappé (double impact somato + neuro)

  // ============================================================
  // AXE IMMUNITAIRE
  // ============================================================
  {
    indexId: "idx_histamine",
    axes: ["immuno"],
    orientationWhenLow: "hypo",   // Réponse allergique atténuée
    orientationWhenHigh: "hyper", // Terrain allergique actif
  },
  {
    indexId: "idx_inflammation",
    axes: ["immuno"],
    orientationWhenLow: "hypo",   // Pas d'inflammation
    orientationWhenHigh: "hyper", // Inflammation significative
  },

  // ============================================================
  // AXE DIGESTIF / HÉPATIQUE
  // ============================================================
  {
    indexId: "idx_hepatique",
    axes: ["digestif"],
    orientationWhenLow: "hypo",   // Souffrance extra-hépatique
    orientationWhenHigh: "hyper", // Souffrance hépatique spécifique
  },
  {
    indexId: "idx_capacite_tampon",
    axes: ["digestif"],
    orientationWhenLow: "hypo",   // Capacité tampon préservée (bon signe)
    orientationWhenHigh: "hyper", // Saturation hépatique
  },
  {
    indexId: "idx_catabolisme",
    axes: ["digestif"],
    orientationWhenLow: "hypo",   // Catabolisme insuffisant
    orientationWhenHigh: "hyper", // Hypercatabolisme
  },
  {
    indexId: "idx_rendement_metabolique",
    axes: ["digestif"],
    orientationWhenLow: "hypo",   // Hypométabolique
    orientationWhenHigh: "hyper", // Hypermétabolique
  },
];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Récupère tous les index mappés à un axe donné
 */
export function getIndexesForAxe(axe: string): IndexAxeMapping[] {
  return INDEX_TO_AXE_MAPPING.filter(mapping => mapping.axes.includes(axe));
}

/**
 * Récupère tous les axes impactés par un index donné
 */
export function getAxesForIndex(indexId: string): string[] {
  const mapping = INDEX_TO_AXE_MAPPING.find(m => m.indexId === indexId);
  return mapping?.axes || [];
}

/**
 * Récupère le mapping complet pour un index
 */
export function getIndexMapping(indexId: string): IndexAxeMapping | undefined {
  return INDEX_TO_AXE_MAPPING.find(m => m.indexId === indexId);
}

/**
 * Liste tous les axes uniques couverts par les mappings
 */
export function getAllMappedAxes(): string[] {
  const axes = new Set<string>();
  for (const mapping of INDEX_TO_AXE_MAPPING) {
    for (const axe of mapping.axes) {
      axes.add(axe);
    }
  }
  return Array.from(axes);
}

/**
 * Vérifie si un axe a au moins un index mappé
 */
export function axeHasBDFMapping(axe: string): boolean {
  return INDEX_TO_AXE_MAPPING.some(m => m.axes.includes(axe));
}

// ============================================================
// MAPPING INVERSE: QUESTIONS INTERROGATOIRE → AXE
// ============================================================

/**
 * Préfixes des IDs de questions par axe
 * Utilisé pour déterminer l'axe d'une question à partir de son ID
 */
export const QUESTION_ID_PREFIXES: Record<string, string[]> = {
  thyro: ["thyro_"],
  adaptatif: ["adapt_", "cortico_"],
  gonado: ["gonado_", "genital_"],
  somato: ["somato_", "gh_"],
  neuro: ["neuro_", "sna_"],
  immuno: ["immuno_", "allergie_", "inflammation_"],
  digestif: ["digestif_", "hepat_", "bile_"],
  cardioMetabo: ["cardio_", "metabo_", "glyc_"],
  dermato: ["dermato_", "peau_", "cheveux_"],
};

/**
 * Détermine l'axe d'une question à partir de son ID
 */
export function getAxeFromQuestionId(questionId: string): string | null {
  const lowerQId = questionId.toLowerCase();

  for (const [axe, prefixes] of Object.entries(QUESTION_ID_PREFIXES)) {
    if (prefixes.some(prefix => lowerQId.startsWith(prefix))) {
      return axe;
    }
  }

  return null;
}
