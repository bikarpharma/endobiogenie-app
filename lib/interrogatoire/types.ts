// lib/interrogatoire/types.ts

// ---------------------------------------------------------------------------
// CONFIGURATION DES QUESTIONS
// ---------------------------------------------------------------------------

export interface QuestionConfig {
  id: string;
  question: string;
  type: "boolean" | "text" | "select" | "number" | "multiselect" | "date" | "scale_1_5";
  tooltip?: string;
  section?: string;
  axis?: string;
  options?: string[];
  mapping?: Record<string, number>;
  scaleLabels?: string[]; // Labels pour les échelles (scale_1_5)

  // ===== SCORING V2 =====
  weight?: number; // Poids de la question (1-3) pour le calcul du score
  tags?: string[]; // Tags pour catégoriser (ex: ["hypo_global", "hypo_metabolisme"])
  scoreDirection?: "hypo" | "hyper" | "neutral"; // Direction du score
}

// ---------------------------------------------------------------------------
// STRUCTURE GLOBALE D'INTERROGATOIRE (V2 UNIQUEMENT)
// ---------------------------------------------------------------------------

export interface InterrogatoireEndobiogenique {
  date_creation?: string; // ISO string
  sexe: "H" | "F";

  // Format V2 (actuel)
  v2?: {
    sexe: "H" | "F";
    answersByAxis: {
      historique?: Record<string, any>;
      modeVie?: Record<string, any>;
      neuro?: Record<string, any>;
      adaptatif?: Record<string, any>;
      thyro?: Record<string, any>;
      gonado?: Record<string, any>;
      somato?: Record<string, any>;
      digestif?: Record<string, any>;
      cardioMetabo?: Record<string, any>;
      dermato?: Record<string, any>;
      immuno?: Record<string, any>;
    };
  };
}
