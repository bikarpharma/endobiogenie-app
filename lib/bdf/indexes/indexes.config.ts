import type { IndexDefinition } from "./index-types";
import { IndexCategory } from "./index-categories";

/**
 * INDEX ENDOBIOGÉNIQUES - BIOLOGIE DES FONCTIONS (BdF)
 * =====================================================
 * Basé sur "La Théorie de l'Endobiogénie" - Lapraz & Hedayat
 *
 * SOURCES:
 * - Volume 1 (p.175-194): Index directs et indirects fondamentaux
 * - Volume 2 (p.19-110): Index Starter, IML, IMP, interprétations cliniques
 * - Volume 3 (p.29-106): Index avancés par axe (Tables 3.12-6.18)
 * - Volume 4 (p.52-206): Applications cliniques pratiques
 *
 * HIÉRARCHIE DES INDEX:
 * 1. INDEX DIRECTS (17 biomarqueurs → formules simples)
 * 2. INDEX INDIRECTS (combinaisons d'index directs)
 * 3. INDEX COMPLEXES (analyses multi-axes)
 */

export const INDEXES: IndexDefinition[] = [
  // ============================================================
  // SECTION 1: INDEX GONADOTROPE (Volume 1, p.176-179)
  // Évalue l'équilibre Androgènes vs Œstrogènes
  // ============================================================
  {
    id: "idx_genital",
    label: "Index Génital",
    category: IndexCategory.GONADAL,
    formula: "GR / GB",
    formula_type: "ratio",
    required_biomarkers: ["GR", "GB"],
    description: "Rapport Globules Rouges / Globules Blancs. Reflète l'équilibre tissulaire Androgènes (GR) vs Œstrogènes (GB). INDEX FONDAMENTAL en endobiogénie.",
    referenceRange: {
      low: 0.6,
      high: 0.9,
      interpretation: {
        low: "Dominance œstrogénique tissulaire (GB > GR relatif)",
        normal: "Équilibre androgènes/œstrogènes",
        high: "Dominance androgénique tissulaire (GR > GB relatif)"
      }
    }
  },
  {
    id: "idx_genito_thyroidien",
    label: "Index Génito-Thyroïdien",
    category: IndexCategory.COMPLEX,
    formula: "NEUT / LYMPH",
    formula_type: "ratio",
    required_biomarkers: ["NEUT", "LYMPH"],
    description: "Rapport Neutrophiles / Lymphocytes. Évalue l'équilibre Œstrogènes (Neut, via FSH) vs TSH (Lymph). Volume 1, p.178.",
    referenceRange: {
      low: 1.5,
      high: 2.5,
      interpretation: {
        low: "Dominance TSH/thyroïde - Favorise hyperimmunité, terrain atopique",
        normal: "Équilibre génito-thyroïdien",
        high: "Dominance œstrogènes/FSH - Favorise inflammation, auto-immunité"
      }
    }
  },

  // ============================================================
  // SECTION 2: INDEX CORTICOTROPE / ADAPTATION (Volume 1, p.179)
  // Évalue l'axe HPA (ACTH/Cortisol vs FSH/Œstrogènes)
  // ============================================================
  {
    id: "idx_adaptation",
    label: "Index d'Adaptation",
    category: IndexCategory.ADAPTATION,
    formula: "EOS / (MONO + 0.1)",
    formula_type: "composite",
    required_biomarkers: ["EOS", "MONO"],
    description: "Rapport Éosinophiles / Monocytes. Évalue l'activité adaptative ACTH/Cortisol (Eos) vs FSH/Œstrogènes (Mono). Volume 1, p.179.",
    referenceRange: {
      low: 0.3,
      high: 0.8,
      interpretation: {
        low: "Risque auto-immun - FSH/œstrogènes dominant, cortisol insuffisant",
        normal: "Capacité adaptative équilibrée",
        high: "Risque atopique/allergique - ACTH/cortisol hyperactif"
      }
    }
  },
  {
    id: "idx_cortisol_ratio",
    label: "Ratio Cortisol/Cortex Surrénalien",
    category: IndexCategory.ADAPTATION,
    formula: "idx_adaptation / idx_genital",
    formula_type: "composite",
    requires_indexes: ["idx_adaptation", "idx_genital"],
    required_biomarkers: [],
    description: "Évalue l'efficacité du cortisol par rapport à l'activité globale du cortex surrénalien. Optimal: 2-3. Volume 2, p.72-76.",
    referenceRange: {
      low: 2.0,
      high: 3.0,
      interpretation: {
        low: "Androgènes surrénaliens prédominants - Adaptogènes indiqués",
        normal: "Ratio cortisol/cortex surrénalien optimal",
        high: "Cortisol excessif aux dépens androgènes - α-sympatholytiques indiqués"
      }
    }
  },

  // ============================================================
  // SECTION 3: INDEX SNA - SYSTÈME NERVEUX AUTONOME (Volume 2)
  // Mobilisation leucocytaire et plaquettaire
  // ============================================================
  {
    id: "idx_mobilisation_plaquettes",
    label: "IMP - Index Mobilisation Plaquettes",
    category: IndexCategory.AUTONOMIC,
    formula: "PLAQUETTES / (60 * GR)",
    formula_type: "composite",
    required_biomarkers: ["PLAQUETTES", "GR"],
    description: "Capacité de mobilisation des plaquettes depuis l'espace splénique. Marqueur Bêta-sympathique. Volume 1, p.180 & Volume 2, p.35-38.",
    referenceRange: {
      low: 0.8,
      high: 1.2,
      interpretation: {
        low: "Bêta-sympathique bloqué ou retardé - Favorise spasmophilie",
        normal: "Mobilisation plaquettaire normale",
        high: "Bêta-sympathique hyperactif - Mobilisation splanchnique → splénique"
      }
    }
  },
  {
    id: "idx_mobilisation_leucocytes",
    label: "IML - Index Mobilisation Leucocytes",
    category: IndexCategory.AUTONOMIC,
    formula: "GB / (NEUT + LYMPH + MONO + EOS + BASO + 0.1)",
    formula_type: "composite",
    required_biomarkers: ["GB", "NEUT", "LYMPH", "MONO", "EOS", "BASO"],
    description: "Capacité de mobilisation des leucocytes depuis le lit splanchnique. Marqueur Alpha-sympathique adaptatif. Volume 2, p.29-34.",
    referenceRange: {
      low: 0.9,
      high: 1.1,
      interpretation: {
        low: "Flux adaptatif hépatique → splanchnique",
        normal: "Mobilisation leucocytaire équilibrée",
        high: "Congestion vasculaire hépatique - Sollicitation lit splanchnique"
      }
    }
  },
  {
    id: "idx_starter",
    label: "Index Starter",
    category: IndexCategory.AUTONOMIC,
    formula: "idx_mobilisation_leucocytes / idx_mobilisation_plaquettes",
    formula_type: "composite",
    requires_indexes: ["idx_mobilisation_leucocytes", "idx_mobilisation_plaquettes"],
    required_biomarkers: [],
    description: "IML / IMP. Index FONDAMENTAL pour évaluer la spasmophilie et la dysfonction sympathique. Volume 2, p.22-25.",
    referenceRange: {
      low: 0.8,
      high: 1.2,
      interpretation: {
        low: "Hyper α-adaptatif + β bloqué - Congestion hépato-splénique",
        normal: "Équilibre sympathique α/β",
        high: "Augmentation activité sympathique générale sur lit splanchnique"
      }
    }
  },
  {
    id: "idx_histamine",
    label: "Index Histamine Évoquée",
    category: IndexCategory.AUTONOMIC,
    formula: "BASO * (NEUT / LYMPH)",
    formula_type: "composite",
    required_biomarkers: ["BASO", "NEUT", "LYMPH"],
    description: "Activité histaminique circulante active. Basophiles × Index Génito-Thyroïdien. Volume 4, Table 8.10.",
    referenceRange: {
      low: 0.5,
      high: 2.0,
      interpretation: {
        low: "Histamine faible - Réponse allergique atténuée",
        normal: "Activité histaminique normale",
        high: "Histamine élevée - Terrain allergique actif, améliorer cortisol"
      }
    }
  },

  // ============================================================
  // SECTION 4: INDEX THYRÉOTROPE (Volume 1, p.181-183)
  // Évalue le métabolisme thyroïdien périphérique
  // ============================================================
  {
    id: "idx_thyroidien",
    label: "Index Thyroïdien",
    category: IndexCategory.THYROID,
    formula: "LDH / CPK",
    formula_type: "ratio",
    required_biomarkers: ["LDH", "CPK"],
    description: "Rapport LDH/CPK. Activité métabolique cellulaire effective T4/T3. Indépendant des niveaux sériques TSH, T4, T3. Volume 1, p.181.",
    referenceRange: {
      low: 2.0,
      high: 4.0,
      interpretation: {
        low: "Hypothyroïdie fonctionnelle - Dominance anabolique, métabolisme ralenti",
        normal: "Équilibre catabolisme/anabolisme thyroïdien",
        high: "Hyperthyroïdie fonctionnelle - Dominance catabolique, hypermétabolisme"
      }
    }
  },
  {
    id: "idx_rendement_thyroidien",
    label: "Rendement Thyroïdien",
    category: IndexCategory.THYROID,
    formula: "(LDH / CPK) / TSH",
    formula_type: "composite",
    required_biomarkers: ["LDH", "CPK", "TSH"],
    description: "Index Thyroïdien / TSH. Efficacité périphérique de la thyroïde par rapport à la stimulation centrale. Volume 3, Table 10.14.",
    referenceRange: {
      low: 0.8,
      high: 2.0,
      interpretation: {
        low: "Rendement thyroïdien bas - Risque hypertrophie tissulaire",
        normal: "Rendement thyroïdien optimal",
        high: "Rendement thyroïdien élevé - Risque inflammation muqueuse"
      }
    }
  },
  {
    id: "idx_pth",
    label: "Index PTH (Parathyroïde)",
    category: IndexCategory.THYROID,
    formula: "CA / P",
    formula_type: "ratio",
    required_biomarkers: ["CA", "P"],
    description: "Rapport Calcium/Phosphore. Activité endocrinométabolique parathyroïdienne. Volume 4, Table 10.15.",
    referenceRange: {
      low: 2.0,
      high: 2.5,
      interpretation: {
        low: "PTH basse - Thyroïde efficiente",
        normal: "Équilibre PTH/Thyroïde",
        high: "PTH élevée - Thyroïde inefficiente, PTH libère calcium osseux"
      }
    }
  },

  // ============================================================
  // SECTION 5: INDEX SOMATOTROPE (Volume 3, Tables 6.15-6.18)
  // Évalue l'axe GH/IGF-1, Insuline, Croissance
  // ============================================================
  {
    id: "idx_croissance",
    label: "Index de Croissance",
    category: IndexCategory.GROWTH,
    formula: "PAOI / OSTEO",
    formula_type: "ratio",
    required_biomarkers: ["PAOI", "OSTEO"],
    description: "PAOi / Ostéocalcine. Activité des facteurs de croissance intracellulaires (IGF-1). Volume 1, p.184.",
    referenceRange: {
      low: 0.5,
      high: 1.5,
      interpretation: {
        low: "Activité GH/IGF-1 insuffisante",
        normal: "Croissance tissulaire équilibrée",
        high: "Hyper-sollicitation croissance - Risque adénoïdien"
      }
    }
  },
  {
    id: "idx_oestrogenes",
    label: "Index Œstrogénique",
    category: IndexCategory.GONADAL,
    formula: "TSH / OSTEO",
    formula_type: "ratio",
    required_biomarkers: ["TSH", "OSTEO"],
    description: "TSH / Ostéocalcine. Activité métabolique des œstrogènes. TSH comme facteur pro-anabolique. Volume 1, p.183.",
    referenceRange: {
      low: 0.03,
      high: 0.08,
      interpretation: {
        low: "Faible activité pro-croissance œstrogénique",
        normal: "Activité œstrogénique normale",
        high: "Forte activité pro-croissance - Risque prolifératif"
      }
    }
  },
  {
    id: "idx_turnover",
    label: "Index Turn-over Tissulaire",
    category: IndexCategory.GROWTH,
    formula: "TSH * PAOI",
    formula_type: "composite",
    required_biomarkers: ["TSH", "PAOI"],
    description: "TSH × PAOi. Vitesse de renouvellement tissulaire global. Volume 1, p.182.",
    referenceRange: {
      low: 50,
      high: 100,
      interpretation: {
        low: "Renouvellement tissulaire lent",
        normal: "Turn-over tissulaire normal",
        high: "Turn-over accéléré - Os/tissus sur-sollicités"
      }
    }
  },
  {
    id: "idx_remodelage_osseux",
    label: "Index Remodelage Osseux",
    category: IndexCategory.GROWTH,
    formula: "PAOI / CA",
    formula_type: "ratio",
    required_biomarkers: ["PAOI", "CA"],
    description: "PAOi / Calcium. Degré de renouvellement osseux pour l'adaptation. Volume 4, Table 10.15.",
    referenceRange: {
      low: 2.0,
      high: 5.0,
      interpretation: {
        low: "Remodelage osseux faible",
        normal: "Remodelage osseux normal",
        high: "Os sur-sollicité - Adaptation corticotrope ou gonado-thyrotrope nécessaire"
      }
    }
  },

  // ============================================================
  // SECTION 6: INDEX GÉNITAL CORRIGÉ ET COMPLEXES (Volume 2)
  // Index de second niveau nécessitant d'autres index
  // ============================================================
  {
    id: "idx_genital_corrige",
    label: "Index Génital Corrigé",
    category: IndexCategory.GONADAL,
    formula: "idx_genital * idx_starter",
    formula_type: "composite",
    requires_indexes: ["idx_genital", "idx_starter"],
    required_biomarkers: [],
    description: "Index Génital × Index Starter. Évalue les troubles STRUCTURELS (vs fonctionnels). Volume 2, p.83-84.",
    referenceRange: {
      low: 0.5,
      high: 1.0,
      interpretation: {
        low: "Hypoandrogénie structurelle",
        normal: "Équilibre structural androgènes/œstrogènes",
        high: "Hyperandrogénie structurelle"
      }
    }
  },

  // ============================================================
  // SECTION 7: INDEX MÉTABOLIQUES (Catabolisme/Anabolisme)
  // ============================================================
  {
    id: "idx_catabolisme",
    label: "Index Catabolisme",
    category: IndexCategory.METABOLIC,
    formula: "LDH / (CPK + 1)",
    formula_type: "composite",
    required_biomarkers: ["LDH", "CPK"],
    description: "Niveau d'activité catabolique. Le catabolisme nourrit l'anabolisme. Volume 3, Table 6.17.",
    referenceRange: {
      low: 1.5,
      high: 3.5,
      interpretation: {
        low: "Catabolisme insuffisant",
        normal: "Activité catabolique normale",
        high: "Hypercatabolisme"
      }
    }
  },
  {
    id: "idx_rendement_metabolique",
    label: "Rendement Métabolique",
    category: IndexCategory.METABOLIC,
    formula: "(LDH + CPK) / (LDH - CPK + 100)",
    formula_type: "composite",
    required_biomarkers: ["LDH", "CPK"],
    description: "Taux de métabolisme global effectif. Efficacité générale production/répartition. Volume 3, Table 6.17.",
    referenceRange: {
      low: 1.0,
      high: 2.5,
      interpretation: {
        low: "Hypométabolique - Brain fog, fatigue",
        normal: "Rendement métabolique normal",
        high: "Hypermétabolique"
      }
    }
  },

  // ============================================================
  // SECTION 8: INDEX MINÉRALOCORTICOÏDE
  // ============================================================
  {
    id: "idx_mineralo",
    label: "Index Minéralocorticoïde (Aldostérone)",
    category: IndexCategory.ADAPTATION,
    formula: "NA / K",
    formula_type: "ratio",
    required_biomarkers: ["NA", "K"],
    description: "Sodium / Potassium. Reflet de l'activité aldostérone (rétention hydrosodée). Volume 1, p.180.",
    referenceRange: {
      low: 28,
      high: 34,
      interpretation: {
        low: "Hypominéralocorticisme - Insuffisance aldostérone",
        normal: "Activité aldostérone normale",
        high: "Hyperminéralocorticisme - Rétention hydrosodée"
      }
    }
  },

  // ============================================================
  // SECTION 9: INDEX HÉPATIQUES (Capacité Tampon)
  // ============================================================
  {
    id: "idx_hepatique",
    label: "Index Hépatique",
    category: IndexCategory.METABOLIC,
    formula: "ALAT / ASAT",
    formula_type: "ratio",
    required_biomarkers: ["ALAT", "ASAT"],
    description: "Ratio transaminases. Évalue la souffrance hépatique spécifique vs générale.",
    referenceRange: {
      low: 0.8,
      high: 1.2,
      interpretation: {
        low: "Souffrance extra-hépatique (musculaire, cardiaque)",
        normal: "Fonction hépatique normale",
        high: "Souffrance hépatique spécifique"
      }
    }
  },
  {
    id: "idx_capacite_tampon",
    label: "Index Capacité Tampon Hépatique",
    category: IndexCategory.METABOLIC,
    formula: "GGT / (ALAT + ASAT + 1)",
    formula_type: "composite",
    required_biomarkers: ["GGT", "ALAT", "ASAT"],
    description: "Évalue la capacité tampon du foie (organe clé en endobiogénie). Volume 1, p.22-23.",
    referenceRange: {
      low: 0.3,
      high: 0.8,
      interpretation: {
        low: "Capacité tampon préservée",
        normal: "Capacité tampon normale",
        high: "Saturation hépatique - Drainage prioritaire"
      }
    }
  },

  // ============================================================
  // SECTION 10: INDEX INFLAMMATOIRES
  // ============================================================
  {
    id: "idx_inflammation",
    label: "Index Inflammatoire Global",
    category: IndexCategory.METABOLIC,
    formula: "CRP * VS / 10",
    formula_type: "composite",
    required_biomarkers: ["CRP", "VS"],
    description: "CRP × VS. Évalue l'inflammation systémique globale.",
    referenceRange: {
      low: 0,
      high: 5,
      interpretation: {
        low: "Pas d'inflammation détectée",
        normal: "Inflammation mineure",
        high: "Inflammation significative - Investigations nécessaires"
      }
    }
  },

  // ============================================================
  // SECTION 11: INDEX INSULINIQUE / GLYCÉMIQUE (Volume 3)
  // ============================================================
  {
    id: "idx_insuline",
    label: "Index Insuline (Sensibilité)",
    category: IndexCategory.GROWTH,
    formula: "TG / GLY",
    formula_type: "ratio",
    required_biomarkers: ["TG", "GLY"],
    description: "Triglycérides / Glycémie. Évalue la sensibilité à l'insuline sur la membrane cellulaire. Volume 3, Table 6.16.",
    referenceRange: {
      low: 0.5,
      high: 1.5,
      interpretation: {
        low: "Hyperinsulinisme par sensibilité membranaire insuffisante",
        normal: "Sensibilité insulinique normale",
        high: "Hyperinsulinisme - Risque désynchronisation somatotrope"
      }
    }
  },
];
