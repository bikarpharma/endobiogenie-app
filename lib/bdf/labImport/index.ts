/**
 * SMART LAB IMPORT - Module Principal
 * ====================================
 * Point d'entrée pour l'import intelligent de résultats de laboratoire.
 *
 * Usage:
 * ```typescript
 * import { importLabFromImage } from "@/lib/bdf/labImport";
 *
 * const result = await importLabFromImage(base64Image);
 * if (result.success) {
 *   // Utiliser result.normalized pour pré-remplir le formulaire
 *   const bdfInputs = toBdfInputs(result.normalized);
 * }
 * ```
 */

// Re-exports
export * from "./labExtractor";
export * from "./labNormalizer";
export * from "./labSynonyms.config";
export * from "./labUnits.config";

import {
  extractLabValuesFromImage,
  extractLabValuesFromPDF,
  validateExtractedValues,
  type LabExtractionResult,
} from "./labExtractor";

import {
  normalizeLabValues,
  toBdfInputs,
  generateNormalizationSummary,
  checkMissingCriticalValues,
  type NormalizedLabValue,
  type NormalizationResult,
} from "./labNormalizer";

// ==========================================
// TYPES COMBINÉS
// ==========================================

/**
 * Résultat complet de l'import
 */
export interface LabImportResult {
  /** Succès global de l'import */
  success: boolean;
  /** Valeurs normalisées prêtes pour BdfInputForm */
  normalized: NormalizedLabValue[];
  /** Objet BdfInputs pour injection directe */
  bdfInputs: Record<string, number>;
  /** Résumé textuel pour l'utilisateur */
  summary: string;
  /** Valeurs critiques manquantes */
  missingCritical: string[];
  /** Résultat détaillé de la normalisation */
  normalizationResult: NormalizationResult;
  /** Résultat brut de l'extraction */
  extractionResult: LabExtractionResult;
  /** Erreur si échec */
  error?: string;
}

// ==========================================
// FONCTION PRINCIPALE
// ==========================================

/**
 * Import complet d'un résultat de laboratoire depuis une image
 *
 * Pipeline:
 * 1. Extraction via GPT-4 Vision
 * 2. Validation des valeurs extraites
 * 3. Normalisation (mapping + conversion unités)
 * 4. Génération du résumé
 *
 * @param imageBase64 Image en base64
 * @param mimeType Type MIME (image/jpeg, image/png, application/pdf)
 * @returns Résultat complet de l'import
 */
export async function importLabFromImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<LabImportResult> {
  // Étape 1: Extraction
  const extractionResult = await extractLabValuesFromImage(imageBase64, mimeType);

  if (!extractionResult.success || extractionResult.values.length === 0) {
    return {
      success: false,
      normalized: [],
      bdfInputs: {},
      summary: "Aucune valeur détectée dans le document.",
      missingCritical: [],
      normalizationResult: {
        normalized: [],
        unmatched: [],
        stats: {
          totalExtracted: 0,
          successfullyNormalized: 0,
          conversionsApplied: 0,
          unmatchedCount: 0,
        },
      },
      extractionResult,
      error: extractionResult.error || "Extraction échouée",
    };
  }

  // Étape 2: Validation
  const validatedValues = validateExtractedValues(extractionResult.values);

  // Étape 3: Normalisation
  const normalizationResult = normalizeLabValues(validatedValues);

  // Étape 4: Conversion pour BdfInputs
  const bdfInputs = toBdfInputs(normalizationResult.normalized);

  // Étape 5: Résumé et valeurs manquantes
  const summary = generateNormalizationSummary(normalizationResult);
  const missingCritical = checkMissingCriticalValues(normalizationResult.normalized);

  return {
    success: normalizationResult.normalized.length > 0,
    normalized: normalizationResult.normalized,
    bdfInputs,
    summary,
    missingCritical,
    normalizationResult,
    extractionResult,
  };
}

/**
 * Import depuis un PDF (multi-pages)
 * Utilise l'API Assistants avec file_search pour les PDF
 */
export async function importLabFromPDF(
  pdfBase64: string
): Promise<LabImportResult> {
  // Étape 1: Extraction via API Assistants (spécifique PDF)
  const extractionResult = await extractLabValuesFromPDF(pdfBase64);

  if (!extractionResult.success || extractionResult.values.length === 0) {
    return {
      success: false,
      normalized: [],
      bdfInputs: {},
      summary: "Aucune valeur détectée dans le document PDF.",
      missingCritical: [],
      normalizationResult: {
        normalized: [],
        unmatched: [],
        stats: {
          totalExtracted: 0,
          successfullyNormalized: 0,
          conversionsApplied: 0,
          unmatchedCount: 0,
        },
      },
      extractionResult,
      error: extractionResult.error || "Extraction PDF échouée",
    };
  }

  // Étape 2: Validation
  const validatedValues = validateExtractedValues(extractionResult.values);

  // Étape 3: Normalisation
  const normalizationResult = normalizeLabValues(validatedValues);

  // Étape 4: Conversion pour BdfInputs
  const bdfInputs = toBdfInputs(normalizationResult.normalized);

  // Étape 5: Résumé et valeurs manquantes
  const summary = generateNormalizationSummary(normalizationResult);
  const missingCritical = checkMissingCriticalValues(normalizationResult.normalized);

  return {
    success: normalizationResult.normalized.length > 0,
    normalized: normalizationResult.normalized,
    bdfInputs,
    summary,
    missingCritical,
    normalizationResult,
    extractionResult,
  };
}

// ==========================================
// UTILITAIRES EXPORT
// ==========================================

export {
  toBdfInputs,
  generateNormalizationSummary,
  checkMissingCriticalValues,
};
