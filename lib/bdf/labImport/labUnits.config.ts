/**
 * SMART LAB IMPORT - Configuration des Conversions d'Unités
 * ==========================================================
 * Gère les conversions entre les unités utilisées par les labos
 * et les unités attendues par le système IntegrIA/Endobiogénie.
 *
 * CRITIQUE: Une erreur de conversion peut fausser tout le calcul des index !
 * Chaque conversion doit être vérifiée avec les sources médicales.
 */

import { BIOMARKERS } from "../biomarkers/biomarkers.config";

/**
 * Définition d'une règle de conversion d'unité
 */
export interface UnitConversion {
  /** Unité source (celle du labo) */
  fromUnit: string;
  /** Unité cible (celle attendue par IntegrIA) */
  toUnit: string;
  /** Facteur multiplicatif: valeur_cible = valeur_source * factor */
  factor: number;
  /** Note explicative pour l'UI pédagogique */
  note?: string;
}

/**
 * Configuration des conversions par biomarqueur
 * Clé = code biomarqueur IntegrIA
 * Valeur = liste des conversions possibles
 */
export const UNIT_CONVERSIONS: Record<string, UnitConversion[]> = {
  // ==========================================
  // HÉMATOLOGIE
  // ==========================================

  GR: [
    // Globules rouges: T/L (tera/litre) = 10^12/L
    // Les labos tunisiens utilisent souvent 10⁶/µL ou 10⁶/mm³
    // 1 T/L = 1 × 10^12/L = 1 × 10^6/µL (équivalent)
    {
      fromUnit: "10^6/µl",
      toUnit: "T/L",
      factor: 1, // Équivalent numérique
      note: "10⁶/µL est numériquement équivalent à T/L",
    },
    {
      fromUnit: "10^6/mm3",
      toUnit: "T/L",
      factor: 1,
      note: "10⁶/mm³ = 10⁶/µL = T/L",
    },
    {
      fromUnit: "millions/mm3",
      toUnit: "T/L",
      factor: 1,
    },
  ],

  GB: [
    // Globules blancs: G/L (giga/litre) = 10^9/L
    // Labos: souvent en /mm³ ou /µL
    // 1 G/L = 1000 /mm³
    {
      fromUnit: "/mm3",
      toUnit: "G/L",
      factor: 0.001, // 9100/mm³ = 9.1 G/L
      note: "Division par 1000: /mm³ vers G/L",
    },
    {
      fromUnit: "/µl",
      toUnit: "G/L",
      factor: 0.001,
    },
    {
      fromUnit: "10^3/mm3",
      toUnit: "G/L",
      factor: 1,
    },
  ],

  HB: [
    // Hémoglobine: g/dL est standard
    // Parfois en g/L
    {
      fromUnit: "g/l",
      toUnit: "g/dL",
      factor: 0.1, // 140 g/L = 14 g/dL
      note: "Division par 10: g/L vers g/dL",
    },
  ],

  HCT: [
    // Hématocrite: % est standard
    // Parfois exprimé en fraction (0.42 au lieu de 42%)
    {
      fromUnit: "ratio",
      toUnit: "%",
      factor: 100,
      note: "Multiplication par 100: ratio vers %",
    },
    {
      fromUnit: "l/l",
      toUnit: "%",
      factor: 100,
    },
  ],

  // Formule leucocytaire - % vs valeurs absolues
  // IMPORTANT: Les labos tunisiens donnent souvent les deux
  // On préfère les % pour les calculs d'index
  NEUT: [
    {
      fromUnit: "/mm3",
      toUnit: "%",
      factor: 0, // Spécial: nécessite le total GB pour convertir
      note: "⚠️ Conversion nécessite le total leucocytes",
    },
  ],

  LYMPH: [
    {
      fromUnit: "/mm3",
      toUnit: "%",
      factor: 0,
      note: "⚠️ Conversion nécessite le total leucocytes",
    },
  ],

  EOS: [
    {
      fromUnit: "/mm3",
      toUnit: "%",
      factor: 0,
      note: "⚠️ Conversion nécessite le total leucocytes",
    },
  ],

  MONO: [
    {
      fromUnit: "/mm3",
      toUnit: "%",
      factor: 0,
      note: "⚠️ Conversion nécessite le total leucocytes",
    },
  ],

  BASO: [
    {
      fromUnit: "/mm3",
      toUnit: "%",
      factor: 0,
      note: "⚠️ Conversion nécessite le total leucocytes",
    },
  ],

  PLAQUETTES: [
    // Plaquettes: G/L = 10^9/L
    // Labos: 10³/mm³ ou /mm³
    {
      fromUnit: "10^3/mm3",
      toUnit: "G/L",
      factor: 1, // 153 × 10³/mm³ = 153 G/L
      note: "10³/mm³ est équivalent à G/L",
    },
    {
      fromUnit: "/mm3",
      toUnit: "G/L",
      factor: 0.001,
    },
  ],

  // ==========================================
  // BIOCHIMIE - BILAN RÉNAL
  // ==========================================

  CREAT: [
    // Créatinine: mg/dL (système américain) vs µmol/L (SI)
    // Facteur: 1 mg/dL = 88.4 µmol/L
    {
      fromUnit: "µmol/l",
      toUnit: "mg/dL",
      factor: 0.0113, // 1/88.4 ≈ 0.0113
      note: "µmol/L ÷ 88.4 = mg/dL",
    },
    {
      fromUnit: "umol/l",
      toUnit: "mg/dL",
      factor: 0.0113,
    },
    {
      fromUnit: "mg/l",
      toUnit: "mg/dL",
      factor: 0.1,
      note: "mg/L ÷ 10 = mg/dL",
    },
  ],

  UREE: [
    // Urée: g/L vs mmol/L
    // 1 g/L = 16.65 mmol/L (masse molaire urée = 60.06 g/mol)
    {
      fromUnit: "mmol/l",
      toUnit: "g/L",
      factor: 0.06, // 1/16.65 ≈ 0.06
      note: "mmol/L × 0.06 = g/L",
    },
    {
      fromUnit: "mg/dl",
      toUnit: "g/L",
      factor: 0.01,
    },
  ],

  // ==========================================
  // BILAN GLYCÉMIQUE
  // ==========================================

  GLY: [
    // Glycémie: g/L vs mmol/L
    // 1 g/L = 5.55 mmol/L (masse molaire glucose = 180 g/mol)
    {
      fromUnit: "mmol/l",
      toUnit: "g/L",
      factor: 0.18, // 1/5.55 ≈ 0.18
      note: "mmol/L × 0.18 = g/L",
    },
    {
      fromUnit: "mg/dl",
      toUnit: "g/L",
      factor: 0.01,
    },
  ],

  // ==========================================
  // BILAN LIPIDIQUE
  // ==========================================

  CHOL: [
    // Cholestérol: g/L vs mmol/L
    // 1 g/L = 2.58 mmol/L
    {
      fromUnit: "mmol/l",
      toUnit: "g/L",
      factor: 0.387, // 1/2.58 ≈ 0.387
      note: "mmol/L × 0.387 = g/L",
    },
    {
      fromUnit: "mg/dl",
      toUnit: "g/L",
      factor: 0.01,
    },
  ],

  TG: [
    // Triglycérides: g/L vs mmol/L
    // 1 g/L = 1.13 mmol/L (moyenne, car TG hétérogènes)
    {
      fromUnit: "mmol/l",
      toUnit: "g/L",
      factor: 0.885, // 1/1.13 ≈ 0.885
      note: "mmol/L × 0.885 = g/L",
    },
    {
      fromUnit: "mg/dl",
      toUnit: "g/L",
      factor: 0.01,
    },
  ],

  // ==========================================
  // BILAN HÉPATIQUE
  // ==========================================

  BILI: [
    // Bilirubine: mg/dL vs µmol/L
    // 1 mg/dL = 17.1 µmol/L
    {
      fromUnit: "µmol/l",
      toUnit: "mg/dL",
      factor: 0.0585, // 1/17.1 ≈ 0.0585
      note: "µmol/L ÷ 17.1 = mg/dL",
    },
    {
      fromUnit: "mg/l",
      toUnit: "mg/dL",
      factor: 0.1,
    },
  ],

  // ==========================================
  // IONOGRAMME
  // ==========================================

  CA: [
    // Calcium: mg/dL vs mmol/L
    // 1 mmol/L = 4 mg/dL
    {
      fromUnit: "mmol/l",
      toUnit: "mg/dL",
      factor: 4,
      note: "mmol/L × 4 = mg/dL",
    },
  ],

  P: [
    // Phosphore: mg/dL vs mmol/L
    // 1 mmol/L = 3.1 mg/dL
    {
      fromUnit: "mmol/l",
      toUnit: "mg/dL",
      factor: 3.1,
      note: "mmol/L × 3.1 = mg/dL",
    },
  ],

  // Na, K, Cl, Mg: généralement en mmol/L (standard)
  // Pas de conversion nécessaire

  // ==========================================
  // HORMONES THYROÏDIENNES
  // ==========================================

  TSH: [
    // TSH: mUI/L = µUI/mL (équivalent)
    {
      fromUnit: "µui/ml",
      toUnit: "mUI/L",
      factor: 1,
      note: "µUI/mL = mUI/L (équivalent)",
    },
    {
      fromUnit: "uui/ml",
      toUnit: "mUI/L",
      factor: 1,
    },
  ],

  // ==========================================
  // INFLAMMATION
  // ==========================================

  CRP: [
    // CRP: mg/L est standard
    // Parfois en mg/dL
    {
      fromUnit: "mg/dl",
      toUnit: "mg/L",
      factor: 10,
      note: "mg/dL × 10 = mg/L",
    },
  ],
};

/**
 * Normalise une chaîne d'unité pour le matching
 */
export function normalizeUnit(unit: string): string {
  return unit
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/³/g, "3")
    .replace(/²/g, "2")
    .replace(/⁶/g, "^6")
    .replace(/μ/g, "µ") // Normalise le micro
    .replace(/\//g, "/")
    .trim();
}

/**
 * Trouve la conversion appropriée pour un biomarqueur
 * @param code Code biomarqueur IntegrIA
 * @param sourceUnit Unité détectée sur le PDF
 * @returns Règle de conversion ou null
 */
export function findConversion(
  code: string,
  sourceUnit: string
): UnitConversion | null {
  const conversions = UNIT_CONVERSIONS[code];
  if (!conversions) return null;

  const normalizedSource = normalizeUnit(sourceUnit);

  for (const conv of conversions) {
    if (normalizeUnit(conv.fromUnit) === normalizedSource) {
      return conv;
    }
  }

  return null;
}

/**
 * Obtient l'unité cible attendue par IntegrIA pour un biomarqueur
 */
export function getTargetUnit(code: string): string | null {
  const biomarker = BIOMARKERS.find((b) => b.id === code);
  return biomarker?.unit || null;
}

/**
 * Convertit une valeur vers l'unité cible IntegrIA
 * @param code Code biomarqueur
 * @param value Valeur source
 * @param sourceUnit Unité source
 * @param totalGB Total leucocytes (pour conversion formule leuco)
 * @returns { value, unit, converted, note } ou null si impossible
 */
export function convertToTargetUnit(
  code: string,
  value: number,
  sourceUnit: string,
  totalGB?: number
): {
  value: number;
  unit: string;
  converted: boolean;
  note?: string;
} | null {
  const targetUnit = getTargetUnit(code);
  if (!targetUnit) return null;

  const normalizedSource = normalizeUnit(sourceUnit);
  const normalizedTarget = normalizeUnit(targetUnit);

  // Déjà dans la bonne unité ?
  if (normalizedSource === normalizedTarget) {
    return { value, unit: targetUnit, converted: false };
  }

  // Cas spécial: conversion % <-> valeur absolue pour formule leuco
  if (["NEUT", "LYMPH", "EOS", "MONO", "BASO"].includes(code)) {
    if (normalizedSource.includes("mm3") || normalizedSource.includes("µl")) {
      if (totalGB && totalGB > 0) {
        // Conversion valeur absolue → %
        // % = (valeur absolue / total GB) * 100
        // Attention: si GB en G/L, valeur absolue en /mm³
        // 1 G/L = 1000 /mm³
        const gbInMm3 = totalGB < 100 ? totalGB * 1000 : totalGB;
        const percentage = (value / gbInMm3) * 100;
        return {
          value: Math.round(percentage * 10) / 10, // 1 décimale
          unit: "%",
          converted: true,
          note: `Calculé: ${value}/mm³ ÷ ${gbInMm3}/mm³ × 100 = ${percentage.toFixed(1)}%`,
        };
      } else {
        // Impossible sans le total GB
        return null;
      }
    }
  }

  // Recherche conversion standard
  const conversion = findConversion(code, sourceUnit);
  if (conversion && conversion.factor > 0) {
    const convertedValue = value * conversion.factor;
    return {
      value: Math.round(convertedValue * 1000) / 1000, // 3 décimales max
      unit: conversion.toUnit,
      converted: true,
      note: conversion.note,
    };
  }

  // Pas de conversion trouvée
  return null;
}

/**
 * Types d'unités pour validation et UI
 */
export const UNIT_CATEGORIES = {
  VOLUME: ["l", "dl", "ml", "µl", "mm3"],
  MASS: ["g", "mg", "µg", "ng"],
  MOLAR: ["mol", "mmol", "µmol", "nmol"],
  COUNT: ["/l", "/ml", "/µl", "/mm3", "g/l", "t/l"],
  PERCENTAGE: ["%"],
  ENZYME: ["u/l", "ui/l", "iu/l"],
  TIME: ["mm", "mm/h", "s"],
};
