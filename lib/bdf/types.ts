// ========================================
// TYPES - Module BdF (Biologie des Fonctions)
// ========================================
// Interfaces TypeScript pour les valeurs biologiques,
// les index calculés et l'interprétation finale.

/**
 * Valeurs de laboratoire en entrée (toutes optionnelles)
 */
export interface LabValues {
  // Globules
  GR?: number; // Globules rouges (T/L)
  GB?: number; // Globules blancs (G/L)
  hemoglobine?: number; // Hémoglobine (g/dL) - nouveau

  // Formule leucocytaire
  neutrophiles?: number; // (G/L)
  lymphocytes?: number; // (G/L)
  eosinophiles?: number; // (G/L)
  monocytes?: number; // (G/L)
  plaquettes?: number; // (G/L)

  // Enzymes / Remodelage tissulaire
  LDH?: number; // (UI/L)
  CPK?: number; // (UI/L)
  PAOi?: number; // Phosphatase alcaline osseuse (UI/L)
  osteocalcine?: number; // Ostéocalcine (ng/mL)

  // Axe endocrinien central
  TSH?: number; // (mUI/L)

  // Paramètres avancés du terrain
  VS?: number; // Vitesse de sédimentation (mm/h)
  calcium?: number; // Calcium total (Ca2+)
  potassium?: number; // Potassium (K+)
}

/**
 * Un index calculé avec sa valeur et son commentaire interprétatif
 */
export interface IndexValue {
  value: number | null; // null si calcul impossible (données manquantes)
  comment: string; // Interprétation fonctionnelle
}

/**
 * Ensemble des 8 index calculés
 */
export interface IndexResults {
  indexGenital: IndexValue;
  indexThyroidien: IndexValue;
  gT: IndexValue; // génito-thyroïdien
  indexAdaptation: IndexValue;
  indexOestrogenique: IndexValue;
  turnover: IndexValue;
  rendementThyroidien: IndexValue; // Nouveau : Rendement thyroïdien
  remodelageOsseux: IndexValue; // Nouveau : Remodelage osseux
}

/**
 * Payload final renvoyé par l'API
 * @deprecated Utilisé uniquement pour la compatibilité. L'API retourne maintenant AnalyseResponse
 */
export interface InterpretationPayload {
  indexes: IndexResults;
  summary: string; // Résumé fonctionnel global (1-2 phrases)
  axesDominants: string[]; // Axes biologiques identifiés
  noteTechnique: string; // Note de prudence clinique
}

/**
 * Réponse de l'API /api/bdf/analyse (version optimisée)
 * Retourne uniquement les index calculés (pas de résumé rapide)
 */
export interface AnalyseResponse {
  indexes: IndexResults;
  noteTechnique: string;
}

/**
 * Enrichissement RAG endobiogénie
 */
export interface RagEnrichment {
  resumeFonctionnel: string; // Résumé fonctionnel approfondi via RAG
  axesSollicites: string[]; // Axes neuroendocriniens sollicités via RAG
  lectureEndobiogenique: string; // Lecture endobiogénique complète du terrain
}
