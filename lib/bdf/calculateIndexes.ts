import { INDEXES } from "./indexes/indexes.config";
import { calculateIndex } from "./indexes/calculateIndex";
import type { IndexDefinition } from "./indexes/index-types";

// Type de retour unifié pour l'API
export type IndexStatus = "low" | "normal" | "high" | "error" | "unknown";

export interface BdfResult {
  indexes: Record<string, {
    value: number | null;
    status: IndexStatus;
    biomarkersMissing: string[];
    interpretation?: string;
  }>;
  metadata: {
    calculatedAt: Date;
    biomarkersCount: number;
  };
}

/**
 * FONCTION PRINCIPALE : Calcule tous les index configurés
 * @param biomarkers - Objet { "TSH": 1.2, "NEUT": 45, ... }
 */
export function calculateAllIndexes(biomarkers: Record<string, number | null>): BdfResult {
  const results: BdfResult["indexes"] = {};
  const indexCache: Record<string, number | null> = {};

  // 1. On parcourt tous les index définis dans la config
  INDEXES.forEach((def) => {
    try {
      const calc = calculateIndex(def, biomarkers, indexCache);

      // On stocke le résultat brut pour les dépendances futures
      indexCache[def.id] = calc.value;

      // Le status et l'interprétation sont déjà calculés dans calculateIndex()
      results[def.id] = {
        value: calc.value,
        status: calc.status,
        biomarkersMissing: calc.missing,
        interpretation: calc.interpretation
      };
    } catch (e) {
      console.error(`Erreur calcul index ${def.id}:`, e);
      results[def.id] = { value: null, status: "error", biomarkersMissing: [] };
    }
  });

  return {
    indexes: results,
    metadata: {
      calculatedAt: new Date(),
      biomarkersCount: Object.keys(biomarkers).length
    }
  };
}

// ==========================================
// COMPATIBILITÉ ANCIENNE API (Deprecated)
// ==========================================
// Ces types et fonctions sont conservés pour compatibilité rétroactive
// avec le code existant qui utilise l'ancien format

/**
 * @deprecated Utilisez calculateAllIndexes() avec le nouveau format
 */
export interface LabValues {
  GR?: number;
  GB?: number;
  hemoglobine?: number;
  neutrophiles?: number;
  lymphocytes?: number;
  eosinophiles?: number;
  monocytes?: number;
  plaquettes?: number;
  LDH?: number;
  CPK?: number;
  PAOi?: number;
  osteocalcine?: number;
  TSH?: number;
  VS?: number;
  calcium?: number;
  potassium?: number;
}

/**
 * @deprecated Utilisez calculateAllIndexes() avec le nouveau format
 */
export interface IndexValue {
  value: number | null;
  comment: string;
}

/**
 * @deprecated Utilisez calculateAllIndexes() avec le nouveau format
 */
export interface IndexResults {
  indexGenital: IndexValue;
  indexThyroidien: IndexValue;
  gT: IndexValue;
  indexAdaptation: IndexValue;
  indexOestrogenique: IndexValue;
  turnover: IndexValue;
  rendementThyroidien: IndexValue;
  remodelageOsseux: IndexValue;
}

/**
 * FONCTION DE COMPATIBILITÉ : Convertit l'ancien format vers le nouveau
 * @deprecated Cette fonction sera supprimée dans la v2.0
 */
export function calculateIndexes(lab: LabValues): IndexResults {
  console.warn("⚠️ calculateIndexes() est deprecated. Utilisez calculateAllIndexes()");

  // Mapping ancien → nouveau format biomarqueurs
  const biomarkers: Record<string, number | null> = {
    GR: lab.GR ?? null,
    GB: lab.GB ?? null,
    HB: lab.hemoglobine ?? null,
    NEUT: lab.neutrophiles ?? null,
    LYMPH: lab.lymphocytes ?? null,
    EOS: lab.eosinophiles ?? null,
    MONO: lab.monocytes ?? null,
    PLAQUETTES: lab.plaquettes ?? null,
    LDH: lab.LDH ?? null,
    CPK: lab.CPK ?? null,
    PAOI: lab.PAOi ?? null,
    OSTEO: lab.osteocalcine ?? null,
    TSH: lab.TSH ?? null,
    CA: lab.calcium ?? null,
    K: lab.potassium ?? null
  };

  const result = calculateAllIndexes(biomarkers);

  // Retourne le format ancien avec valeurs null par défaut
  return {
    indexGenital: {
      value: result.indexes["idx_genital"]?.value ?? null,
      comment: result.indexes["idx_genital"]?.value !== null
        ? "Calculé avec formule endobiogénique (GR/GB)"
        : "Données insuffisantes"
    },
    indexThyroidien: {
      value: result.indexes["idx_metabolic_activity"]?.value ?? null,
      comment: result.indexes["idx_metabolic_activity"]?.value !== null
        ? "Activité métabolique (LDH/CPK)"
        : "Données insuffisantes"
    },
    gT: {
      value: result.indexes["idx_genito_thyroid"]?.value ?? null,
      comment: result.indexes["idx_genito_thyroid"]?.value !== null
        ? "Ratio Génito-Thyroïdien"
        : "Données insuffisantes"
    },
    indexAdaptation: {
      value: result.indexes["idx_adaptation"]?.value ?? null,
      comment: result.indexes["idx_adaptation"]?.value !== null
        ? "Index d'Adaptation (Selye)"
        : "Données insuffisantes"
    },
    indexOestrogenique: {
      value: null,
      comment: "Non implémenté dans nouvelle version"
    },
    turnover: {
      value: null,
      comment: "Non implémenté dans nouvelle version"
    },
    rendementThyroidien: {
      value: result.indexes["idx_thyroid_yield"]?.value ?? null,
      comment: result.indexes["idx_thyroid_yield"]?.value !== null
        ? "Rendement Thyroïdien ((LDH/CPK)/TSH)"
        : "Données insuffisantes"
    },
    remodelageOsseux: {
      value: null,
      comment: "Non implémenté dans nouvelle version"
    }
  };
}
