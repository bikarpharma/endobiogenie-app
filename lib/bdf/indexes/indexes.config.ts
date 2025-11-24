import type { IndexDefinition } from "./index-types";
import { IndexCategory } from "./index-categories";

/**
 * INDEXES ENDOBIOGÉNIQUES
 * -------------------------------------------------
 * Configuration complète des index biologiques fonctionnels.
 *
 * MIGRATION PHASE 3 : Ajout des seuils de référence (Normes Endobiogéniques)
 */

export const INDEXES: IndexDefinition[] = [
  // ==========================================
  // 1. PANEL NEUROVÉGÉTATIF (SNA)
  // ==========================================
  {
    id: "idx_genital",
    label: "Index Génital (Sympathique)",
    category: IndexCategory.AUTONOMIC,
    formula: "NEUT / LYMPH",
    formula_type: "ratio",
    required_biomarkers: ["NEUT", "LYMPH"],
    description: "Reflète la dominance Sympathique (si > 2.5) ou Parasympathique (si < 1.5). Rapport Neutrophiles/Lymphocytes.",
    referenceRange: {
      low: 1.5,
      high: 2.5,
      interpretation: {
        low: "Parasympathique dominant",
        normal: "Équilibre neurovégétatif",
        high: "Sympathique dominant"
      }
    }
  },
  {
    id: "idx_parasympa",
    label: "Index Parasympathique",
    category: IndexCategory.AUTONOMIC,
    formula: "LYMPH + EOS",
    formula_type: "composite",
    required_biomarkers: ["LYMPH", "EOS"],
    description: "Somme des éléments parasympathiques (Frein vagal). LYMPH + EOS.",
    referenceRange: {
      low: 25,
      high: 40,
      interpretation: {
        low: "Hypotonie parasympathique",
        normal: "Tonus parasympathique normal",
        high: "Hypertonie parasympathique"
      }
    }
  },

  // ==========================================
  // 2. PANEL ADAPTATION (Corticotrope)
  // ==========================================
  {
    id: "idx_adaptation",
    label: "Index d'Adaptation (Selye)",
    category: IndexCategory.ADAPTATION,
    formula: "LYMPH / (EOS + 0.1)",
    formula_type: "composite",
    required_biomarkers: ["LYMPH", "EOS"],
    description: "Capacité de résistance au stress selon Hans Selye. Haut = Insuffisance surrénalienne, Bas = Blocage adaptatif.",
    referenceRange: {
      low: 5,
      high: 15,
      interpretation: {
        low: "Blocage adaptatif (hypercorticisme)",
        normal: "Capacité adaptative normale",
        high: "Insuffisance surrénalienne"
      }
    }
  },
  {
    id: "idx_mineralo",
    label: "Index Minéralocorticoïde",
    category: IndexCategory.ADAPTATION,
    formula: "NA / K",
    formula_type: "ratio",
    required_biomarkers: ["NA", "K"],
    description: "Reflet de l'activité aldostérone (rétention hydrosodée). Sodium/Potassium.",
    referenceRange: {
      low: 28,
      high: 32,
      interpretation: {
        low: "Hypominéralocorticisme",
        normal: "Activité aldostérone normale",
        high: "Hyperminéralocorticisme"
      }
    }
  },

  // ==========================================
  // 3. PANEL THYRÉOTROPE
  // ==========================================
  {
    id: "idx_thyroid_yield",
    label: "Rendement Thyroïdien",
    category: IndexCategory.THYROID,
    formula: "(LDH / CPK) / TSH",
    formula_type: "composite",
    required_biomarkers: ["LDH", "CPK", "TSH"],
    description: "Efficacité périphérique de la thyroïde par rapport à la stimulation centrale. (LDH/CPK)/TSH.",
    referenceRange: {
      low: 0.5,
      high: 1.5,
      interpretation: {
        low: "Hypothyroïdie périphérique",
        normal: "Rendement thyroïdien optimal",
        high: "Hyperthyroïdie périphérique"
      }
    }
  },
  {
    id: "idx_metabolic_activity",
    label: "Activité Métabolique",
    category: IndexCategory.METABOLIC,
    formula: "LDH / CPK",
    formula_type: "ratio",
    required_biomarkers: ["LDH", "CPK"],
    description: "Catabolisme vs Anabolisme musculaire. LDH/CPK.",
    referenceRange: {
      low: 2,
      high: 5,
      interpretation: {
        low: "Dominance anabolique",
        normal: "Équilibre métabolique",
        high: "Dominance catabolique"
      }
    }
  },

  // ==========================================
  // 4. PANEL GONADOTROPE & SOMATOTROPE
  // ==========================================
  {
    id: "idx_androgenic",
    label: "Index Androgénique",
    category: IndexCategory.GONADAL,
    formula: "HB + HCT",
    formula_type: "composite",
    required_biomarkers: ["HB", "HCT"],
    description: "Imprégnation androgénique tissulaire (érythropoïèse). Hémoglobine + Hématocrite.",
    referenceRange: {
      low: 45,
      high: 60,
      interpretation: {
        low: "Hypo-androgénie",
        normal: "Imprégnation androgénique normale",
        high: "Hyper-androgénie"
      }
    }
  },
  {
    id: "idx_growth",
    label: "Index Somatotrope (GH)",
    category: IndexCategory.GROWTH,
    formula: "PAL + P",
    formula_type: "composite",
    required_biomarkers: ["PAL", "P"],
    description: "Activité de construction osseuse et tissulaire. Phosphatases Alcalines + Phosphore.",
    referenceRange: {
      low: 70,
      high: 150,
      interpretation: {
        low: "Hyposomatotropie",
        normal: "Activité somatotrope normale",
        high: "Hypersomatotropie"
      }
    }
  },

  // ==========================================
  // 5. INDEX COMPLEXES (Ratios d'Axes)
  // ==========================================
  {
    id: "idx_genito_thyroid",
    label: "Ratio Génito-Thyroïdien (G/T)",
    category: IndexCategory.COMPLEX,
    formula: "idx_genital / idx_metabolic_activity",
    formula_type: "composite",
    requires_indexes: ["idx_genital", "idx_metabolic_activity"],
    required_biomarkers: [],
    description: "Balance Structure (Génital) / Mouvement (Thyroïde). Ratio de deux index fondamentaux.",
    referenceRange: {
      low: 0.8,
      high: 1.5,
      interpretation: {
        low: "Dominance thyroïdienne (Mouvement > Structure)",
        normal: "Équilibre Structure/Mouvement",
        high: "Dominance génitale (Structure > Mouvement)"
      }
    }
  }
];
