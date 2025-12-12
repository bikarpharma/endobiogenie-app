/**
 * ============================================================================
 * INTEGRIA - VALIDATIONS ZOD
 * ============================================================================
 *
 * Ce fichier définit les schémas de validation pour :
 * 1. Les réponses de l'IA (prescriptions)
 * 2. Les entrées biologiques (BdF) - avec plages physiologiques
 *
 * Zod agit comme un "pare-feu" médical : valeurs aberrantes détectées
 * AVANT de fausser les calculs d'index.
 *
 * PLACEMENT: /lib/validations.ts
 *
 * INSTALLATION: npm install zod
 * ============================================================================
 */

import { z } from "zod";

// =============================================================================
// VALIDATION BIOMARQUEURS - PLAGES PHYSIOLOGIQUES
// =============================================================================
// Référence: "La Théorie de l'Endobiogénie" - Lapraz & Hedayat, Volume 1

/**
 * Crée un validateur numérique avec plage physiologique
 */
const biomarker = (min: number, max: number, unit: string) =>
  z.number()
    .min(min, `Valeur trop basse (min: ${min} ${unit})`)
    .max(max, `Valeur trop haute (max: ${max} ${unit})`)
    .nullable()
    .optional();

/**
 * Schéma de validation pour les biomarqueurs BdF
 * Toutes les valeurs sont optionnelles mais si présentes,
 * elles doivent être dans les plages physiologiques acceptables.
 */
export const BiomarkersInputSchema = z.object({
  // ==========================================
  // HÉMATOLOGIE
  // ==========================================
  GR: biomarker(2.0, 8.0, "T/L"),           // Globules rouges (normal: 4.5-5.5)
  GB: biomarker(2.0, 20.0, "G/L"),          // Globules blancs (normal: 4-10)
  HB: biomarker(5.0, 20.0, "g/dL"),         // Hémoglobine (normal: 12-16)
  HCT: biomarker(20, 60, "%"),              // Hématocrite (normal: 37-47)

  // Formule leucocytaire (%)
  NEUT: biomarker(0, 100, "%"),             // Neutrophiles (normal: 45-70%)
  LYMPH: biomarker(0, 100, "%"),            // Lymphocytes (normal: 20-40%)
  EOS: biomarker(0, 30, "%"),               // Éosinophiles (normal: 0-5%)
  MONO: biomarker(0, 20, "%"),              // Monocytes (normal: 2-8%)
  BASO: biomarker(0, 5, "%"),               // Basophiles (normal: 0-1%)

  PLAQUETTES: biomarker(50, 700, "G/L"),    // Plaquettes (normal: 150-400)

  // ==========================================
  // INFLAMMATION
  // ==========================================
  VS: biomarker(0, 150, "mm/h"),            // Vitesse sédimentation
  CRP: biomarker(0, 500, "mg/L"),           // C-réactive protéine

  // ==========================================
  // ENZYMES
  // ==========================================
  LDH: biomarker(50, 1000, "U/L"),          // Lactate déshydrogénase
  CPK: biomarker(10, 5000, "U/L"),          // Créatine phosphokinase

  // ==========================================
  // HORMONES THYROÏDIENNES
  // ==========================================
  TSH: biomarker(0.001, 100, "mUI/L"),      // TSH (normal: 0.4-4)
  T3L: biomarker(0.5, 20, "pmol/L"),        // T3 libre
  T4L: biomarker(2, 50, "pmol/L"),          // T4 libre

  // ==========================================
  // OS / STRUCTURE
  // ==========================================
  OSTEO: biomarker(0, 200, "ng/mL"),        // Ostéocalcine
  PAOI: biomarker(0, 500, "U/L"),           // PAO osseuse
  PAL: biomarker(20, 500, "U/L"),           // Phosphatase alcaline totale

  // ==========================================
  // IONOGRAMME
  // ==========================================
  K: biomarker(2.0, 7.0, "mmol/L"),         // Potassium
  CA: biomarker(5.0, 15.0, "mg/dL"),        // Calcium
  NA: biomarker(120, 160, "mmol/L"),        // Sodium
  CL: biomarker(80, 120, "mmol/L"),         // Chlore
  P: biomarker(1.0, 8.0, "mg/dL"),          // Phosphore
  MG: biomarker(0.5, 3.0, "mmol/L"),        // Magnésium

  // ==========================================
  // HÉPATIQUE
  // ==========================================
  ALAT: biomarker(0, 500, "U/L"),           // GPT
  ASAT: biomarker(0, 500, "U/L"),           // GOT
  GGT: biomarker(0, 500, "U/L"),            // Gamma-GT
  BILI: biomarker(0, 30, "mg/dL"),          // Bilirubine

  // ==========================================
  // LIPIDES
  // ==========================================
  CHOL: biomarker(0.5, 5.0, "g/L"),         // Cholestérol total
  TG: biomarker(0, 10, "g/L"),              // Triglycérides

  // ==========================================
  // RÉNAL
  // ==========================================
  CREAT: biomarker(0.1, 20, "mg/dL"),       // Créatinine
  UREE: biomarker(0, 3, "g/L"),             // Urée

  // ==========================================
  // GLYCÉMIE
  // ==========================================
  GLY: biomarker(0.3, 5.0, "g/L"),          // Glycémie à jeun
  HBA1C: biomarker(3, 20, "%"),             // Hémoglobine glyquée

  // ==========================================
  // FER
  // ==========================================
  FERRITINE: biomarker(0, 2000, "ng/mL"),   // Ferritine
}).passthrough(); // Permet des champs supplémentaires non validés

export type BiomarkersInput = z.infer<typeof BiomarkersInputSchema>;

/**
 * Valide les entrées biologiques et retourne les erreurs éventuelles
 */
export function validateBiomarkers(data: unknown): {
  success: boolean;
  data?: BiomarkersInput;
  errors?: string[];
} {
  const result = BiomarkersInputSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map(err =>
      `${err.path.join('.')}: ${err.message}`
    );
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

/**
 * Filtre les biomarqueurs valides (dans les plages) et log les avertissements
 */
export function sanitizeBiomarkers(data: Record<string, unknown>): {
  sanitized: Record<string, number | null>;
  warnings: string[];
} {
  const sanitized: Record<string, number | null> = {};
  const warnings: string[] = [];

  const validation = BiomarkersInputSchema.safeParse(data);

  if (validation.success) {
    // Tout est valide
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined || value === "") {
        sanitized[key] = null;
      } else {
        const num = Number(value);
        sanitized[key] = isNaN(num) ? null : num;
      }
    }
  } else {
    // Certaines valeurs sont hors plage - on les exclut avec warning
    const errorPaths = new Set(
      validation.error.errors.map(e => e.path[0]?.toString())
    );

    for (const [key, value] of Object.entries(data)) {
      if (errorPaths.has(key)) {
        warnings.push(`⚠️ ${key}: valeur ${value} hors plage physiologique - ignorée`);
        sanitized[key] = null;
      } else if (value === null || value === undefined || value === "") {
        sanitized[key] = null;
      } else {
        const num = Number(value);
        sanitized[key] = isNaN(num) ? null : num;
      }
    }
  }

  return { sanitized, warnings };
}

// =============================================================================
// SCHÉMAS DE BASE
// =============================================================================

/**
 * Formes galéniques autorisées (France - Input IA)
 */
export const FormeGaleniqueSchema = z.enum([
  "TM",        // Teinture Mère
  "MG 1DH",    // Macérat Glycériné 1DH
  "EPS",       // Extrait de Plante Standardisé
  "HE",        // Huile Essentielle
  "Gélules",   // Gélules classiques
  "Ampoules",  // Pour oligoéléments
  "Tisane",    // Infusion
]);

/**
 * Axes endocriniens possibles
 */
export const AxeEndocrinienSchema = z.enum([
  "Corticotrope",
  "Gonadotrope",
  "Thyréotrope",
  "Somatotrope",
  "SNA",
]);

// =============================================================================
// SCHÉMA D'UNE PLANTE (PlantItem)
// =============================================================================

export const PlantItemSchema = z.object({
  // Identifiant unique (crucial pour le middleware)
  plant_id: z.string()
    .min(1, "plant_id ne peut pas être vide")
    .regex(/^[a-z_]+$/, "plant_id doit être en snake_case minuscules"),
  
  // Nom latin (requis)
  name_latin: z.string().min(1, "name_latin requis"),
  
  // Nom français (optionnel mais recommandé)
  name_fr: z.string().optional(),
  
  // Forme galénique
  form: FormeGaleniqueSchema,
  
  // Posologie
  dosage: z.string().min(1, "dosage requis"),
  
  // Justification pédagogique
  justification: z.string().min(10, "justification trop courte"),
  
  // Flag profil endobiogénique
  endo_covered: z.boolean(),
});

// Type TypeScript généré automatiquement
export type PlantItem = z.infer<typeof PlantItemSchema>;

// =============================================================================
// SCHÉMA D'UN OLIGOÉLÉMENT (OligoItem)
// =============================================================================

export const OligoItemSchema = z.object({
  oligo_id: z.string()
    .min(1, "oligo_id requis")
    .regex(/^[a-z_]+$/, "oligo_id doit être en snake_case"),
  
  name: z.string().min(1, "name requis"),
  
  form: z.literal("Ampoules"),
  
  dosage: z.string().min(1, "dosage requis"),
  
  justification: z.string().min(5, "justification requise"),
});

export type OligoItem = z.infer<typeof OligoItemSchema>;

// =============================================================================
// SCHÉMA DE LA PRESCRIPTION (5 dimensions)
// =============================================================================

export const PrescriptionDimensionsSchema = z.object({
  symptomatic: z.array(PlantItemSchema),
  neuro_endocrine: z.array(PlantItemSchema),
  ans: z.array(PlantItemSchema),
  drainage: z.array(PlantItemSchema),
  oligos: z.array(OligoItemSchema),
});

// =============================================================================
// SCHÉMA GLOBAL DE LA RÉPONSE IA
// =============================================================================

export const PrescriptionAIResponseSchema = z.object({
  // Résumé stratégique
  global_strategy_summary: z.string()
    .min(20, "Résumé stratégique trop court")
    .max(500, "Résumé stratégique trop long"),
  
  // Axe prioritaire
  priority_axis: AxeEndocrinienSchema,
  
  // Les 5 dimensions de prescription
  prescription: PrescriptionDimensionsSchema,
});

export type PrescriptionAIResponse = z.infer<typeof PrescriptionAIResponseSchema>;

// =============================================================================
// SCHÉMA DU DIAGNOSTIC (Input vers l'IA)
// =============================================================================

export const DiagnosticInputSchema = z.object({
  // Motif de consultation
  motif: z.string().min(5, "Motif de consultation requis"),
  
  // Terrain endobiogénique
  terrain: z.object({
    axes_desequilibres: z.array(z.string()).optional(),
    index_bdf: z.record(z.string(), z.number()).optional(),
    emonctoires: z.array(z.string()).optional(),
  }).optional(),
  
  // Patient (optionnel)
  patient: z.object({
    age: z.number().optional(),
    sexe: z.enum(["M", "F"]).optional(),
    antecedents: z.array(z.string()).optional(),
  }).optional(),
});

export type DiagnosticInput = z.infer<typeof DiagnosticInputSchema>;

// =============================================================================
// FONCTIONS UTILITAIRES DE VALIDATION
// =============================================================================

/**
 * Valide une réponse IA et retourne le résultat typé
 * @throws Error si la validation échoue
 */
export function validateAIResponse(data: unknown): PrescriptionAIResponse {
  const result = PrescriptionAIResponseSchema.safeParse(data);
  
  if (!result.success) {
    // Formater les erreurs pour le debug
    const errorMessages = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join('\n');
    
    console.error("❌ Validation IA échouée:", errorMessages);
    throw new Error(`Format IA invalide:\n${errorMessages}`);
  }
  
  return result.data;
}

/**
 * Valide partiellement (mode permissif) - Pour le développement
 */
export function validateAIResponsePartial(data: unknown): Partial<PrescriptionAIResponse> | null {
  try {
    // Tenter une validation complète d'abord
    return validateAIResponse(data);
  } catch {
    // En cas d'échec, tenter une validation partielle
    const partial = PrescriptionAIResponseSchema.partial().safeParse(data);
    if (partial.success) {
      console.warn("⚠️ Validation partielle - Données incomplètes");
      return partial.data;
    }
    return null;
  }
}

/**
 * Vérifie si un objet ressemble à une réponse IA valide
 */
export function isValidAIResponse(data: unknown): data is PrescriptionAIResponse {
  return PrescriptionAIResponseSchema.safeParse(data).success;
}
