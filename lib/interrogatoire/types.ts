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
  
  // === NOUVEAUX CHAMPS POUR LE SCORING ===
  priority?: 1 | 2 | 3;           // 1 = Essentiel, 2 = Important, 3 = Optionnel
  weight?: 1 | 2 | 3;             // Poids dans le calcul du score (1 = mineur, 3 = majeur)
  tags?: string[];                // Catégorisation (ex: ["hypo_global", "pack_essentiel"])
  scoreDirection?: "hypo" | "hyper" | "neutral"; // Direction du score

  // === CHAMPS ADDITIONNELS POUR LES CONFIGS ===
  conditionalDisplay?: {          // Affichage conditionnel basé sur une autre question
    dependsOn: string;
    showWhen: string | string[] | boolean;
  };
  physiopathologie?: string;      // Explication physiopathologique de la question
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
