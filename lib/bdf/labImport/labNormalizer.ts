/**
 * SMART LAB IMPORT - Normaliseur de Résultats
 * =============================================
 * Transforme les valeurs brutes extraites du PDF en valeurs
 * normalisées compatibles avec le système IntegrIA/BdF.
 *
 * Étapes:
 * 1. Mapping des noms → codes biomarqueurs
 * 2. Conversion des unités → unités cibles
 * 3. Génération du feedback pédagogique
 */

import { RawLabValue } from "./labExtractor";
import { findBiomarkerCode, normalizeLabName } from "./labSynonyms.config";
import { convertToTargetUnit, getTargetUnit } from "./labUnits.config";
import { BIOMARKERS } from "../biomarkers/biomarkers.config";

// ==========================================
// TYPES
// ==========================================

/**
 * Statut de confiance pour l'UI
 */
export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

/**
 * Valeur normalisée prête pour IntegrIA
 */
export interface NormalizedLabValue {
  /** Code biomarqueur IntegrIA (ex: "TSH") */
  code: string;
  /** Label français du biomarqueur */
  label: string;
  /** Valeur normalisée (dans l'unité cible) */
  value: number;
  /** Unité cible IntegrIA */
  unit: string;
  /** Niveau de confiance global */
  confidence: ConfidenceLevel;
  /** Score numérique de confiance (0-1) */
  confidenceScore: number;

  // === TRAÇABILITÉ (pour UI pédagogique) ===

  /** Nom original sur le PDF */
  originalName: string;
  /** Valeur originale (avant conversion) */
  originalValue: number;
  /** Unité originale sur le PDF */
  originalUnit: string;
  /** Conversion d'unité effectuée ? */
  wasConverted: boolean;
  /** Note explicative de la conversion */
  conversionNote?: string;
  /** Valeurs de référence du labo */
  labReference?: { min?: number; max?: number };
}

/**
 * Valeur non reconnue (pour revue manuelle)
 */
export interface UnmatchedLabValue {
  originalName: string;
  value: number;
  unit: string;
  reason: "unknown_biomarker" | "conversion_failed" | "low_confidence";
}

/**
 * Résultat de la normalisation
 */
export interface NormalizationResult {
  /** Valeurs normalisées avec succès */
  normalized: NormalizedLabValue[];
  /** Valeurs non reconnues */
  unmatched: UnmatchedLabValue[];
  /** Statistiques */
  stats: {
    totalExtracted: number;
    successfullyNormalized: number;
    conversionsApplied: number;
    unmatchedCount: number;
  };
}

// ==========================================
// FONCTIONS DE NORMALISATION
// ==========================================

/**
 * Calcule le niveau de confiance basé sur le score
 */
function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.85) return "high";
  if (score >= 0.6) return "medium";
  if (score >= 0.3) return "low";
  return "unknown";
}

/**
 * Normalise une liste de valeurs brutes extraites
 *
 * @param rawValues Valeurs brutes de l'extracteur
 * @returns Résultat de normalisation
 */
export function normalizeLabValues(
  rawValues: RawLabValue[]
): NormalizationResult {
  const normalized: NormalizedLabValue[] = [];
  const unmatched: UnmatchedLabValue[] = [];
  let conversionsApplied = 0;

  // Pré-calculer le total GB pour les conversions de formule leucocytaire
  const gbValue = rawValues.find((v) => {
    const code = findBiomarkerCode(v.originalName);
    return code === "GB";
  });
  const totalGB = gbValue?.value;

  for (const raw of rawValues) {
    // Étape 1: Trouver le code biomarqueur
    const code = findBiomarkerCode(raw.originalName);

    if (!code) {
      unmatched.push({
        originalName: raw.originalName,
        value: raw.value,
        unit: raw.unit,
        reason: "unknown_biomarker",
      });
      continue;
    }

    // Étape 2: Trouver le biomarqueur dans la config
    const biomarker = BIOMARKERS.find((b) => b.id === code);
    if (!biomarker) {
      unmatched.push({
        originalName: raw.originalName,
        value: raw.value,
        unit: raw.unit,
        reason: "unknown_biomarker",
      });
      continue;
    }

    // Étape 3: Conversion d'unité si nécessaire
    const targetUnit = getTargetUnit(code);
    let finalValue = raw.value;
    let finalUnit = raw.unit;
    let wasConverted = false;
    let conversionNote: string | undefined;

    if (targetUnit) {
      const conversion = convertToTargetUnit(
        code,
        raw.value,
        raw.unit,
        totalGB
      );

      if (conversion) {
        finalValue = conversion.value;
        finalUnit = conversion.unit;
        wasConverted = conversion.converted;
        conversionNote = conversion.note;

        if (wasConverted) {
          conversionsApplied++;
        }
      } else {
        // Conversion impossible mais on garde la valeur
        // L'utilisateur devra valider manuellement
        // On baisse la confiance
      }
    }

    // Étape 4: Calculer la confiance finale
    let confidenceScore = raw.confidence;

    // Pénalités de confiance
    if (wasConverted) {
      confidenceScore *= 0.95; // Légère pénalité pour conversion
    }

    // Créer la valeur normalisée
    const normalizedValue: NormalizedLabValue = {
      code,
      label: biomarker.label,
      value: finalValue,
      unit: finalUnit,
      confidence: getConfidenceLevel(confidenceScore),
      confidenceScore,
      originalName: raw.originalName,
      originalValue: raw.value,
      originalUnit: raw.unit,
      wasConverted,
      conversionNote,
      labReference: raw.referenceRange,
    };

    normalized.push(normalizedValue);
  }

  // Dédupliquer: si plusieurs valeurs pour le même code, garder la plus confiante
  const deduped = deduplicateValues(normalized);

  return {
    normalized: deduped,
    unmatched,
    stats: {
      totalExtracted: rawValues.length,
      successfullyNormalized: deduped.length,
      conversionsApplied,
      unmatchedCount: unmatched.length,
    },
  };
}

/**
 * Déduplique les valeurs: garde la plus confiante pour chaque code
 */
function deduplicateValues(
  values: NormalizedLabValue[]
): NormalizedLabValue[] {
  const byCode = new Map<string, NormalizedLabValue>();

  for (const value of values) {
    const existing = byCode.get(value.code);
    if (!existing || value.confidenceScore > existing.confidenceScore) {
      byCode.set(value.code, value);
    }
  }

  return Array.from(byCode.values());
}

/**
 * Convertit les valeurs normalisées en objet BdfInputs
 * pour injection dans le formulaire
 */
export function toBdfInputs(
  normalized: NormalizedLabValue[]
): Record<string, number> {
  const inputs: Record<string, number> = {};

  for (const value of normalized) {
    inputs[value.code] = value.value;
  }

  return inputs;
}

/**
 * Génère un résumé textuel de la normalisation
 * pour affichage à l'utilisateur
 */
export function generateNormalizationSummary(
  result: NormalizationResult
): string {
  const { stats, normalized, unmatched } = result;

  let summary = `📊 Extraction: ${stats.totalExtracted} valeurs détectées\n`;
  summary += `✅ Normalisées: ${stats.successfullyNormalized}\n`;

  if (stats.conversionsApplied > 0) {
    summary += `🔄 Conversions d'unités: ${stats.conversionsApplied}\n`;
  }

  if (stats.unmatchedCount > 0) {
    summary += `⚠️ Non reconnues: ${stats.unmatchedCount}\n`;
    summary += `   → ${unmatched.map((u) => u.originalName).join(", ")}\n`;
  }

  // Valeurs avec conversion
  const converted = normalized.filter((n) => n.wasConverted);
  if (converted.length > 0) {
    summary += `\n📐 Conversions appliquées:\n`;
    for (const c of converted) {
      summary += `   • ${c.label}: ${c.originalValue} ${c.originalUnit} → ${c.value} ${c.unit}\n`;
    }
  }

  return summary;
}

/**
 * Vérifie si des valeurs critiques manquent
 * pour le calcul des index BdF principaux
 */
export function checkMissingCriticalValues(
  normalized: NormalizedLabValue[]
): string[] {
  const criticalCodes = [
    "GR",
    "GB",
    "HB",
    "NEUT",
    "LYMPH",
    "LDH",
    "CPK",
    "TSH",
  ];
  const presentCodes = new Set(normalized.map((n) => n.code));

  return criticalCodes.filter((code) => !presentCodes.has(code));
}

// ==========================================
// EXPORT
// ==========================================

export default {
  normalizeLabValues,
  toBdfInputs,
  generateNormalizationSummary,
  checkMissingCriticalValues,
};
