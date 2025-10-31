// ========================================
// EXTRACTEUR DE VALEURS BIOLOGIQUES
// ========================================
// Extrait les valeurs biologiques d'un message texte libre
// via des patterns regex

import type { LabValues } from "@/lib/bdf/types";

/**
 * Patterns de recherche pour chaque paramètre biologique
 */
const LAB_PATTERNS: Record<keyof LabValues, RegExp> = {
  GR: /GR\s*[:=]?\s*(\d+\.?\d*)/i,
  GB: /GB\s*[:=]?\s*(\d+\.?\d*)/i,
  neutrophiles: /neutrophiles?\s*[:=]?\s*(\d+\.?\d*)/i,
  lymphocytes: /lymphocytes?\s*[:=]?\s*(\d+\.?\d*)/i,
  eosinophiles: /[ée]osinophiles?\s*[:=]?\s*(\d+\.?\d*)/i,
  monocytes: /monocytes?\s*[:=]?\s*(\d+\.?\d*)/i,
  plaquettes: /plaquettes?\s*[:=]?\s*(\d+\.?\d*)/i,
  LDH: /LDH\s*[:=]?\s*(\d+\.?\d*)/i,
  CPK: /CPK\s*[:=]?\s*(\d+\.?\d*)/i,
  TSH: /TSH\s*[:=]?\s*(\d+\.?\d*)/i,
  osteocalcine: /ost[ée]ocalcine?\s*[:=]?\s*(\d+\.?\d*)/i,
  PAOi: /PAOi\s*[:=]?\s*(\d+\.?\d*)/i,
};

/**
 * Extrait les valeurs biologiques d'un message texte
 * @param message - Message utilisateur contenant les valeurs
 * @returns Objet LabValues avec les valeurs extraites
 */
export function buildLabPayloadFromMessage(message: string): LabValues {
  const labValues: LabValues = {};

  // Normalise : remplace virgules par points pour les décimales
  const normalizedMessage = message.replace(/,/g, ".");

  // Extrait chaque valeur avec son pattern
  for (const [key, pattern] of Object.entries(LAB_PATTERNS)) {
    const match = normalizedMessage.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (!isNaN(value) && value > 0) {
        labValues[key as keyof LabValues] = value;
      }
    }
  }

  return labValues;
}

/**
 * Vérifie si le payload contient au moins une valeur
 * @param labValues - Valeurs extraites
 * @returns true si au moins une valeur est présente
 */
export function hasLabValues(labValues: LabValues): boolean {
  return Object.keys(labValues).length > 0;
}
