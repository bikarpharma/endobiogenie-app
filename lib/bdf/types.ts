// ========================================
// TYPES - Module BdF (Biologie des Fonctions)
// ========================================
// Version nettoyée - RagEnrichment et InterpretationPayload supprimés
// Ces types étaient utilisés par le RAG obsolète (maintenant remplacé par Assistant)

/**
 * Valeurs de laboratoire en entrée (toutes optionnelles)
 * @deprecated Préférez Record<string, number | null> avec calculateAllIndexes()
 */
export interface LabValues {
  // Globules
  GR?: number;
  GB?: number;
  hemoglobine?: number;

  // Formule leucocytaire
  neutrophiles?: number;
  lymphocytes?: number;
  eosinophiles?: number;
  monocytes?: number;
  plaquettes?: number;

  // Enzymes / Remodelage tissulaire
  LDH?: number;
  CPK?: number;
  PAOi?: number;
  osteocalcine?: number;

  // Axe endocrinien central
  TSH?: number;

  // Paramètres avancés du terrain
  VS?: number;
  calcium?: number;
  potassium?: number;
}

/**
 * Un index calculé avec sa valeur et son commentaire interprétatif
 */
export interface IndexValue {
  value: number | null;
  comment: string;
}

/**
 * Ensemble des 8 index calculés (ancien format)
 * @deprecated Utilisez BdfResult de calculateIndexes.ts pour le nouveau format
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
 * Réponse de l'API /api/bdf/analyse
 */
export interface AnalyseResponse {
  indexes: IndexResults;
  noteTechnique: string;
}

// ============================================================
// TYPES SUPPRIMÉS (RAG obsolète - remplacé par Assistant OpenAI)
// ============================================================
//
// ❌ InterpretationPayload - Était utilisé par interpretResults.ts (supprimé)
// ❌ RagEnrichment - Était utilisé par rag-enrichment/route.ts (supprimé)
//
// Ces types ne sont plus nécessaires car:
// 1. L'interprétation est maintenant faite par calculateIndex.ts (status + interpretation)
// 2. L'enrichissement est maintenant fait par l'Assistant OpenAI (synthesis/route.ts)
// ============================================================