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
    conversionsApplied: string[];
    tshCorrected?: { original: number; corrected: number; reason: string };
  };
}

// ============================================================
// CONVERSIONS BdF (selon IntegrIA_BdF_FUSION_DEFINITIVE.xlsx)
// ============================================================

interface ConversionResult {
  value: number;
  converted: boolean;
  conversionApplied?: string;
}

/**
 * Applique les conversions BdF aux biomarqueurs
 * Source: Excel "1_Biomarqueurs" colonne "conversion_bdf"
 */
function applyBdfConversion(id: string, value: number | null): ConversionResult {
  if (value === null || value === undefined || isNaN(value)) {
    return { value: 0, converted: false };
  }

  switch (id.toUpperCase()) {
    // GR: ÷10⁶ (5200000 → 5.2)
    case "GR":
      // Si la valeur est > 100, c'est probablement en /µL, on divise
      if (value > 100) {
        return { 
          value: value / 1000000, 
          converted: true, 
          conversionApplied: `GR: ${value} → ${(value / 1000000).toFixed(2)} (÷10⁶)` 
        };
      }
      return { value, converted: false };

    // GB: ÷10³ (6500 → 6.5)
    case "GB":
      // Si la valeur est > 100, c'est probablement en /µL, on divise
      if (value > 100) {
        return { 
          value: value / 1000, 
          converted: true, 
          conversionApplied: `GB: ${value} → ${(value / 1000).toFixed(2)} (÷10³)` 
        };
      }
      return { value, converted: false };

    // PLAQUETTES: ÷10³ (280000 → 280)
    case "PLT":
    case "PLAQUETTES":
      // Si la valeur est > 10000, c'est probablement en /µL, on divise
      if (value > 10000) {
        return { 
          value: value / 1000, 
          converted: true, 
          conversionApplied: `PLT: ${value} → ${(value / 1000).toFixed(0)} (÷10³)` 
        };
      }
      return { value, converted: false };

    // CA (Calcium): ÷2 (selon Excel)
    case "CA":
    case "CALCIUM":
      // Si la valeur est > 5, c'est probablement en mmol/L standard, on divise par 2
      // Note: Calcium normal = 2.2-2.6 mmol/L, donc après ÷2 = 1.1-1.3
      if (value > 5) {
        return { 
          value: value / 2, 
          converted: true, 
          conversionApplied: `CA: ${value} → ${(value / 2).toFixed(2)} (÷2)` 
        };
      }
      return { value, converted: false };

    default:
      return { value, converted: false };
  }
}

/**
 * Correction TSH selon Excel: <0.5→0.5, >5→5
 */
function correctTSH(value: number | null): { 
  value: number | null; 
  corrected: boolean; 
  original?: number;
  reason?: string;
} {
  if (value === null || value === undefined || isNaN(value)) {
    return { value: null, corrected: false };
  }

  if (value < 0.5) {
    return { 
      value: 0.5, 
      corrected: true, 
      original: value,
      reason: `TSH très basse (${value}) corrigée à 0.5 - Désynchronisation somatotrope possible`
    };
  }
  
  if (value > 5) {
    return { 
      value: 5, 
      corrected: true, 
      original: value,
      reason: `TSH élevée (${value}) corrigée à 5 - HYPOTHYROÏDIE fonctionnelle (jamais hyperthyroïdie!)`
    };
  }

  return { value, corrected: false };
}

/**
 * FONCTION PRINCIPALE : Calcule tous les index configurés
 * AVEC conversions BdF automatiques
 * 
 * @param biomarkers - Objet { "TSH": 1.2, "NEUT": 45, ... }
 */
export function calculateAllIndexes(biomarkers: Record<string, number | null>): BdfResult {
  const results: BdfResult["indexes"] = {};
  const indexCache: Record<string, number | null> = {};
  const conversionsApplied: string[] = [];
  let tshCorrectionInfo: BdfResult["metadata"]["tshCorrected"] = undefined;

  // ============================================================
  // ÉTAPE 1: APPLIQUER LES CONVERSIONS BdF
  // ============================================================
  const normalizedBiomarkers: Record<string, number | null> = {};

  for (const [key, value] of Object.entries(biomarkers)) {
    if (value === null || value === undefined) {
      normalizedBiomarkers[key] = null;
      continue;
    }

    // Cas spécial TSH: correction des extrêmes
    if (key.toUpperCase() === "TSH") {
      const tshResult = correctTSH(value);
      normalizedBiomarkers[key] = tshResult.value;
      if (tshResult.corrected) {
        tshCorrectionInfo = {
          original: tshResult.original!,
          corrected: tshResult.value!,
          reason: tshResult.reason!
        };
        conversionsApplied.push(tshResult.reason!);
        console.log(`⚠️ ${tshResult.reason}`);
      }
      continue;
    }

    // Autres conversions
    const conversion = applyBdfConversion(key, value);
    normalizedBiomarkers[key] = conversion.value;
    if (conversion.converted && conversion.conversionApplied) {
      conversionsApplied.push(conversion.conversionApplied);
      console.log(`🔄 ${conversion.conversionApplied}`);
    }
  }

  // ============================================================
  // ÉTAPE 2: CALCULER LES INDEX AVEC VALEURS NORMALISÉES
  // ============================================================
  INDEXES.forEach((def) => {
    try {
      const calc = calculateIndex(def, normalizedBiomarkers, indexCache);

      // Stocker le résultat pour les dépendances
      indexCache[def.id] = calc.value;

      results[def.id] = {
        value: calc.value,
        status: calc.status,
        biomarkersMissing: calc.missing,
        interpretation: calc.interpretation
      };
    } catch (e) {
      console.error(`❌ Erreur calcul index ${def.id}:`, e);
      results[def.id] = { value: null, status: "error", biomarkersMissing: [] };
    }
  });

  // ============================================================
  // ÉTAPE 3: AJOUTER WARNINGS SPÉCIFIQUES
  // ============================================================
  
  // Warning: TSH normale mais Index Thyroïdien bas = Hypothyroïdie LATENTE
  const tsh = normalizedBiomarkers["TSH"];
  const idxThyro = results["idx_thyroidien"]?.value;
  
  if (tsh !== null && tsh >= 0.5 && tsh <= 4 && idxThyro !== null && idxThyro < 3.5) {
    const warningMsg = `⚠️ TSH normale (${tsh}) MAIS Index Thyroïdien BAS (${idxThyro?.toFixed(2)}) → HYPOTHYROÏDIE LATENTE`;
    console.log(warningMsg);
    
    // Ajouter à l'interprétation de l'index thyroïdien
    if (results["idx_thyroidien"]) {
      results["idx_thyroidien"].interpretation = 
        (results["idx_thyroidien"].interpretation || "") + " " + warningMsg;
    }
  }

  return {
    indexes: results,
    metadata: {
      calculatedAt: new Date(),
      biomarkersCount: Object.keys(biomarkers).filter(k => biomarkers[k] !== null).length,
      conversionsApplied,
      tshCorrected: tshCorrectionInfo
    }
  };
}

// ==========================================
// COMPATIBILITÉ ANCIENNE API (Deprecated)
// ==========================================

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

  return {
    indexGenital: {
      value: result.indexes["idx_genital"]?.value ?? null,
      comment: result.indexes["idx_genital"]?.value !== null
        ? "Calculé avec formule endobiogénique (GR/GB)"
        : "Données insuffisantes"
    },
    indexThyroidien: {
      value: result.indexes["idx_thyroidien"]?.value ?? null,
      comment: result.indexes["idx_thyroidien"]?.value !== null
        ? "Activité métabolique (LDH/CPK)"
        : "Données insuffisantes"
    },
    gT: {
      value: result.indexes["idx_genito_thyroidien"]?.value ?? null,
      comment: result.indexes["idx_genito_thyroidien"]?.value !== null
        ? "Ratio Génito-Thyroïdien"
        : "Données insuffisantes"
    },
    indexAdaptation: {
      value: result.indexes["idx_adaptation"]?.value ?? null,
      comment: result.indexes["idx_adaptation"]?.value !== null
        ? "Index d'Adaptation"
        : "Données insuffisantes"
    },
    indexOestrogenique: {
      value: result.indexes["idx_oestrogenes"]?.value ?? null,
      comment: result.indexes["idx_oestrogenes"]?.value !== null
        ? "Index Œstrogénique (TSH/Ostéo)"
        : "Données insuffisantes"
    },
    turnover: {
      value: result.indexes["idx_turnover"]?.value ?? null,
      comment: result.indexes["idx_turnover"]?.value !== null
        ? "Turn-over Tissulaire"
        : "Données insuffisantes"
    },
    rendementThyroidien: {
      value: result.indexes["idx_rendement_thyroidien"]?.value ?? null,
      comment: result.indexes["idx_rendement_thyroidien"]?.value !== null
        ? "Rendement Thyroïdien"
        : "Données insuffisantes"
    },
    remodelageOsseux: {
      value: result.indexes["idx_remodelage_osseux"]?.value ?? null,
      comment: result.indexes["idx_remodelage_osseux"]?.value !== null
        ? "Remodelage Osseux"
        : "Données insuffisantes"
    }
  };
}