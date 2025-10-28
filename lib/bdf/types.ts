// ========================================
// TYPES - Module BdF (Biologie des Fonctions)
// ========================================
// Interfaces TypeScript pour les valeurs biologiques,
// les index calculés et l'interprétation finale.

/**
 * Valeurs de laboratoire en entrée (toutes optionnelles)
 */
export interface LabValues {
  GR?: number; // Globules rouges
  GB?: number; // Globules blancs
  neutrophiles?: number;
  lymphocytes?: number;
  eosinophiles?: number;
  monocytes?: number;
  plaquettes?: number;
  LDH?: number;
  CPK?: number;
  TSH?: number;
  osteocalcine?: number;
  PAOi?: number; // Isoenzyme osseuse phosphatase alcaline
}

/**
 * Un index calculé avec sa valeur et son commentaire interprétatif
 */
export interface IndexValue {
  value: number | null; // null si calcul impossible (données manquantes)
  comment: string; // Interprétation fonctionnelle
}

/**
 * Ensemble des 6 index calculés
 */
export interface IndexResults {
  indexGenital: IndexValue;
  indexThyroidien: IndexValue;
  gT: IndexValue; // génito-thyroïdien
  indexAdaptation: IndexValue;
  indexOestrogenique: IndexValue;
  turnover: IndexValue;
}

/**
 * Payload final renvoyé par l'API
 */
export interface InterpretationPayload {
  indexes: IndexResults;
  summary: string; // Résumé fonctionnel global (1-2 phrases)
  axesDominants: string[]; // Axes biologiques identifiés
  noteTechnique: string; // Note de prudence clinique
}
