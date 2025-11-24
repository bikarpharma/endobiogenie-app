// ========================================
// TYPES POUR L'INTERPRÉTATION DES AXES CLINIQUES
// ========================================

/**
 * Type d'axe clinique endobiogénique
 */
export type AxeType =
  | "neurovegetatif"
  | "adaptatif"
  | "thyroidien"
  | "gonadique"
  | "somatotrope"
  | "digestif"
  | "cardiometabolique"
  | "dermato"
  | "immuno";

/**
 * Labels français pour chaque axe
 */
export const AXE_LABELS: Record<AxeType, string> = {
  neurovegetatif: "Axe Neurovégétatif",
  adaptatif: "Axe Adaptatif (Stress)",
  thyroidien: "Axe Thyroïdien",
  gonadique: "Axe Gonadique",
  somatotrope: "Axe Somatotrope",
  digestif: "Axe Digestif & Métabolique",
  cardiometabolique: "Axe Cardio-métabolique",
  dermato: "Axe Dermato & Muqueux",
  immuno: "Axe Immuno-inflammatoire",
};

/**
 * Emojis pour chaque axe
 */
export const AXE_EMOJIS: Record<AxeType, string> = {
  neurovegetatif: "🧠",
  adaptatif: "😰",
  thyroidien: "🦋",
  gonadique: "🌸",
  somatotrope: "💪",
  digestif: "🍽️",
  cardiometabolique: "❤️",
  dermato: "🧴",
  immuno: "🛡️",
};

/**
 * Résultat de l'interprétation IA d'un axe clinique
 * (correspond à la table Prisma AxeInterpretation)
 */
export interface AxeInterpretation {
  id: string;
  patientId: string;
  axe: AxeType;

  // Résultats de l'analyse
  orientation: string;         // Ex: "Profil hypersympathicotonique"
  mecanismes: string[];        // Mécanismes physiopathologiques identifiés
  prudences: string[];         // Points de vigilance clinique
  modulateurs: string[];       // Modulateurs génériques (sans nommer de plantes)
  resumeClinique: string;      // Synthèse narrative pour le praticien
  confiance: number;           // Score de confiance (0-1)

  createdAt: string;
  updatedAt: string;
}

/**
 * Format de réponse attendu de l'IA pour une interprétation d'axe
 */
export interface InterpretationResponse {
  orientation: string;
  mecanismes: string[];
  prudences: string[];
  modulateurs: string[];
  resumeClinique: string;
  confiance: number;
}

/**
 * Données envoyées à l'API pour demander une interprétation
 */
export interface InterpretationRequest {
  patientId: string;
  axe: AxeType;
  reponsesAxe: Record<string, any>;  // Réponses du questionnaire pour cet axe
  sexe: "H" | "F";
  age?: number;
  antecedents?: string;
  traitements?: string;
  contreindicationsMajeures?: string[];
}
