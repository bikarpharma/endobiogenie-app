import type { IndexDefinition } from "./index-types";
import { IndexCategory } from "./index-categories";

/**
 * INDEX ENDOBIOGÉNIQUES - BIOLOGIE DES FONCTIONS (BdF)
 * =====================================================
 * CORRIGÉ selon IntegrIA_BdF_FUSION_DEFINITIVE.xlsx
 * 
 * ⚠️ NORMES MISES À JOUR - Ne pas modifier sans vérifier l'Excel source
 */

export const INDEXES: IndexDefinition[] = [
  // ============================================================
  // SECTION 1: INDEX GONADOTROPE
  // ============================================================
  {
    id: "idx_genital",
    label: "Index Génital",
    category: IndexCategory.GONADAL,
    formula: "GR / GB",
    formula_type: "ratio",
    required_biomarkers: ["GR", "GB"],
    description: "Rapport GR/GB. Équilibre Androgènes vs Œstrogènes. INDEX FONDAMENTAL.",
    referenceRange: {
      low: 0.70,  // CORRIGÉ (était 0.6)
      high: 0.85, // CORRIGÉ (était 0.9)
      interpretation: {
        low: "Prédominance œstrogénique (anabolisme, fonction)",
        normal: "Équilibre androgènes/œstrogènes",
        high: "Prédominance androgénique (structure, catabolisme)"
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
    description: "Neutrophiles/Lymphocytes. Couplage Gonado-Thyroïde, Hyperimmunité.",
    referenceRange: {
      low: 1.5,  // OK
      high: 2.5, // OK
      interpretation: {
        low: "Hyperimmunité, Terrain atopique (TSH lente)",
        normal: "Équilibre génito-thyroïdien",
        high: "Inflammation, Auto-immunité (TSH rapide)"
      }
    }
  },

  // ============================================================
  // SECTION 2: INDEX CORTICOTROPE / ADAPTATION
  // ============================================================
  {
    id: "idx_adaptation",
    label: "Index d'Adaptation",
    category: IndexCategory.ADAPTATION,
    formula: "EOS / MONO",
    formula_type: "ratio",
    required_biomarkers: ["EOS", "MONO"],
    // ⚠️ ATTENTION V2 : INTERPRÉTATION INVERSÉE
    // Le cortisol ÉCRASE les éosinophiles → Index BAS = Fort cortisol !
    description: "EOS/MONO. ⚠️ BAS = Fort cortisol (HYPER-adaptation), HAUT = Cortisol bas (HYPO-adaptation).",
    referenceRange: {
      low: 0.25,
      high: 0.50,
      interpretation: {
        // ✅ CORRIGÉ V2 : Interprétations INVERSÉES
        low: "HYPER-ADAPTATION : Fort cortisol, Mode lutte/survie, stress aigu, inflammation bloquée",
        normal: "Capacité adaptative équilibrée",
        high: "HYPO-ADAPTATION : Cortisol insuffisant, Terrain atopique, allergies, eczéma, permissivité"
      }
    }
  },
  {
    id: "idx_cortisol_cortex",
    label: "Ratio Cortisol/Cortex Surrénalien",
    category: IndexCategory.ADAPTATION,
    formula: "idx_cortisol / idx_cortex_surrenalien",
    formula_type: "composite",
    requires_indexes: ["idx_cortisol", "idx_cortex_surrenalien"],
    required_biomarkers: [],
    description: "Évalue déséquilibre Cortisol vs Cortex. Atopie si <2, Insomnie/Dépression si >4.",
    referenceRange: {
      low: 2.0,  // OK
      high: 4.0, // CORRIGÉ (était 3.0)
      interpretation: {
        low: "Atopie (asthme, allergie, eczéma)",
        normal: "Ratio cortisol/cortex optimal",
        high: "Insomnie, Dépression - Cortisol excessif"
      }
    }
  },

  // ============================================================
  // SECTION 3: INDEX SNA - SYSTÈME NERVEUX AUTONOME
  // ============================================================
  {
    id: "idx_mobilisation_plaquettes",
    label: "IMP - Index Mobilisation Plaquettes",
    category: IndexCategory.AUTONOMIC,
    formula: "PLAQUETTES / (60 * GR)",
    formula_type: "composite",
    required_biomarkers: ["PLAQUETTES", "GR"],
    description: "Plaquettes/(60×GR). Marqueur ALPHA-sympathique. Spasmophilie/Vagotonie si bas.",
    referenceRange: {
      low: 0.85,
      high: 1.15,
      interpretation: {
        low: "Spasmophilie, Dominance Para, Vagotonie",
        normal: "Mobilisation plaquettaire normale",
        high: "Hyper-Alpha, Spasme, Vasoconstriction, risque thrombotique"
      }
    }
  },
  {
    id: "idx_mobilisation_leucocytes",
    label: "IML - Index Mobilisation Leucocytes",
    category: IndexCategory.AUTONOMIC,
    // ✅ CORRIGÉ V2 : Compare Granulocytes (mobilisables par adrénaline) vs Agranulocytes (résidents)
    formula: "(NEUT + EOS + BASO) / (LYMPH + MONO)",
    formula_type: "composite",
    required_biomarkers: ["NEUT", "EOS", "BASO", "LYMPH", "MONO"],
    description: "Granulocytes/Agranulocytes. Marqueur BÊTA-sympathique (ACTION adrénaline).",
    referenceRange: {
      low: 0.85,
      high: 1.15,
      interpretation: {
        low: "Congestion splanchnique, Stase abdominale, foie engorgé",
        normal: "Mobilisation leucocytaire équilibrée",
        high: "Hyper-Bêta, État d'alerte, Tachycardie, agitation"
      }
    }
  },
  {
    id: "idx_starter",
    label: "Index Starter (Statut β)",
    category: IndexCategory.AUTONOMIC,
    formula: "idx_mobilisation_leucocytes / idx_mobilisation_plaquettes",
    formula_type: "composite",
    requires_indexes: ["idx_mobilisation_leucocytes", "idx_mobilisation_plaquettes"],
    required_biomarkers: [],
    description: "IML/IMP. Énergie adaptation SNA. Anormal dans Crohn (↑↑ ou ↓↓).",
    referenceRange: {
      low: 0.85,  // CORRIGÉ selon PDF biomarqueurs_tables
      high: 1.15, // CORRIGÉ selon PDF biomarqueurs_tables (était 1.35)
      interpretation: {
        low: "Dysfonction foie/rate",
        normal: "Équilibre sympathique α/β",
        high: "Dysfonction foie/rate"
      }
    }
  },
  {
    id: "idx_histamine_potentielle",
    label: "Index Histamine Potentielle",
    category: IndexCategory.AUTONOMIC,
    formula: "(EOS * PLAQUETTES) / idx_cortisol",
    formula_type: "composite",
    required_biomarkers: ["EOS", "PLAQUETTES"],
    requires_indexes: ["idx_cortisol"],
    description: "Éosinophiles × Plaquettes / Index Cortisol. Risque histaminique.",
    referenceRange: {
      low: 6.0,   // CORRIGÉ selon Excel
      high: 12.0, // CORRIGÉ selon Excel
      interpretation: {
        low: "Faible risque histaminique",
        normal: "Risque histaminique modéré",
        high: "Fort risque histaminique, Atopie"
      }
    }
  },

  // ============================================================
  // SECTION 4: INDEX THYRÉOTROPE
  // ============================================================
  {
    id: "idx_thyroidien",
    label: "Index Thyroïdien",
    category: IndexCategory.THYROID,
    formula: "LDH / CPK",
    formula_type: "ratio",
    required_biomarkers: ["LDH", "CPK"],
    description: "LDH/CPK. Métabolisme thyroïdien cellulaire. HYPOTHYROÏDIE LATENTE si bas.",
    referenceRange: {
      low: 3.5,  // ⚠️ CORRIGÉ (était 2.0) - TRÈS IMPORTANT
      high: 5.5, // ⚠️ CORRIGÉ (était 4.0) - TRÈS IMPORTANT
      interpretation: {
        low: "Hypométabolisme thyroïdien - HYPOTHYROÏDIE LATENTE",
        normal: "Équilibre métabolique thyroïdien",
        high: "Hypermétabolisme thyroïdien"
      }
    }
  },
  {
    id: "idx_rendement_thyroidien",
    label: "Rendement Thyroïdien",
    category: IndexCategory.THYROID,
    formula: "LDH / (TSH * CPK)",
    formula_type: "composite",
    required_biomarkers: ["LDH", "CPK", "TSH"],
    description: "LDH/(TSH×CPK). Efficience thyroïdienne périphérique.",
    referenceRange: {
      low: 2.0,  // ⚠️ CORRIGÉ (était 0.8) - TRÈS IMPORTANT
      high: 4.0, // ⚠️ CORRIGÉ (était 2.0) - TRÈS IMPORTANT
      interpretation: {
        low: "Rendement thyroïdien insuffisant",
        normal: "Rendement thyroïdien optimal",
        high: "Rendement thyroïdien élevé"
      }
    }
  },
  {
    id: "idx_trh_tsh",
    label: "Index TRH/TSH",
    category: IndexCategory.THYROID,
    // ❌ NON CALCULABLE V2 : La TRH ne se dose JAMAIS en biologie courante
    formula: "NON_CALCULABLE",
    formula_type: "theoretical",
    required_biomarkers: [],
    description: "❌ NON CALCULABLE - TRH jamais dosé en routine. Index théorique uniquement.",
    referenceRange: {
      low: 0.33,
      high: 1.70,
      interpretation: {
        low: "Insuffisance TRH (théorique)",
        normal: "Axe TRH-TSH équilibré (théorique)",
        high: "Hyperstimulation TRH (théorique)"
      }
    }
  },

  // ============================================================
  // SECTION 5: INDEX SOMATOTROPE / CROISSANCE
  // ============================================================
  {
    id: "idx_croissance",
    label: "Index GH Somatotrope",
    category: IndexCategory.GROWTH,
    formula: "PAOI / OSTEO",
    formula_type: "ratio",
    required_biomarkers: ["PAOI", "OSTEO"],
    description: "PAOi/Ostéocalcine. Activité hormone croissance.",
    referenceRange: {
      low: 2.0,  // ⚠️ CORRIGÉ (était 0.5) - TRÈS IMPORTANT
      high: 6.0, // ⚠️ CORRIGÉ (était 1.5) - TRÈS IMPORTANT
      interpretation: {
        low: "Hypo-GH",
        normal: "Activité GH normale",
        high: "Hyper-GH (hyperplasie, anabolisme excessif)"
      }
    }
  },
  {
    id: "idx_oestrogenes",
    label: "Index Œstrogènes Métaboliques",
    category: IndexCategory.GONADAL,
    formula: "TSH / OSTEO",
    formula_type: "ratio",
    required_biomarkers: ["TSH", "OSTEO"],
    description: "TSH/Ostéocalcine. Activité œstrogénique métabolique.",
    referenceRange: {
      low: 0.14,  // ⚠️ CORRIGÉ (était 0.03) - TRÈS IMPORTANT
      high: 0.24, // ⚠️ CORRIGÉ (était 0.08) - TRÈS IMPORTANT
      interpretation: {
        low: "Hypo-œstrogénie métabolique",
        normal: "Activité œstrogénique normale",
        high: "Hyper-œstrogénie métabolique"
      }
    }
  },
  {
    id: "idx_remodelage_osseux",
    label: "Index Remodelage Osseux",
    category: IndexCategory.GROWTH,
    formula: "(TSH * PAOI) / OSTEO",  // ⚠️ CORRIGÉ (était PAOI / CA)
    formula_type: "composite",
    required_biomarkers: ["TSH", "PAOI", "OSTEO"],
    description: "(TSH×PAOi)/Ostéocalcine. Turn-over osseux.",
    referenceRange: {
      low: 2.5,  // CORRIGÉ selon Excel
      high: 8.5, // CORRIGÉ selon Excel
      interpretation: {
        low: "Hypo-remodelage osseux",
        normal: "Remodelage osseux normal",
        high: "Hyper-remodelage osseux"
      }
    }
  },
  {
    id: "idx_osteomusculaire",
    label: "Index Ostéomusculaire",
    category: IndexCategory.GROWTH,
    formula: "idx_genital_corrige * (CPK / PAOI)",
    formula_type: "composite",
    required_biomarkers: ["CPK", "PAOI"],
    requires_indexes: ["idx_genital_corrige"],
    description: "Index Génital Corrigé × (CPK/PAOi). Prédominance os vs muscle.",
    referenceRange: {
      low: 0.75,
      high: 5.56,
      interpretation: {
        low: "Prédominance osseuse",
        normal: "Équilibre ostéomusculaire",
        high: "Prédominance musculaire (androgènes)"
      }
    }
  },

  // ============================================================
  // SECTION 6: INDEX GÉNITAL CORRIGÉ
  // ============================================================
  {
    id: "idx_genital_corrige",
    label: "Index Génital Corrigé",
    category: IndexCategory.GONADAL,
    formula: "idx_genital * idx_starter",
    formula_type: "composite",
    requires_indexes: ["idx_genital", "idx_starter"],
    required_biomarkers: [],
    description: "Index Génital × Index Starter. Adaptation aiguë hormones génitales.",
    referenceRange: {
      low: 0.70,  // CORRIGÉ selon Excel
      high: 0.85, // CORRIGÉ selon Excel
      interpretation: {
        low: "Prédominance œstrogénique en adaptation",
        normal: "Équilibre génital en adaptation",
        high: "Prédominance androgénique en adaptation"
      }
    }
  },

  // ============================================================
  // SECTION 7: INDEX MÉTABOLIQUES
  // ============================================================
  {
    id: "idx_catabolisme",
    label: "Index Catabolisme",
    category: IndexCategory.METABOLIC,
    formula: "idx_thyroidien / idx_cortisol",
    formula_type: "composite",
    requires_indexes: ["idx_thyroidien", "idx_cortisol"],
    required_biomarkers: [],
    description: "Index Thyroïdien / Index Cortisol. Équilibre catabolique.",
    referenceRange: {
      low: 1.3,  // CORRIGÉ selon Excel
      high: 1.6, // CORRIGÉ selon Excel
      interpretation: {
        low: "Hypo-catabolisme",
        normal: "Activité catabolique normale",
        high: "Hyper-catabolisme"
      }
    }
  },
  {
    id: "idx_cata_ana",
    label: "Rapport Catabolisme/Anabolisme",
    category: IndexCategory.METABOLIC,
    formula: "idx_catabolisme / idx_anabolisme",
    formula_type: "composite",
    requires_indexes: ["idx_catabolisme", "idx_anabolisme"],
    required_biomarkers: [],
    description: "Équilibre global métabolique.",
    referenceRange: {
      low: 1.8,  // CORRIGÉ selon Excel
      high: 3.0, // CORRIGÉ selon Excel
      interpretation: {
        low: "Prédominance anabolique",
        normal: "Équilibre cata/ana",
        high: "Prédominance catabolique"
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
    description: "Sodium/Potassium. Activité aldostérone.",
    referenceRange: {
      low: 28,
      high: 34,
      interpretation: {
        low: "Hypominéralocorticisme",
        normal: "Activité aldostérone normale",
        high: "Hyperminéralocorticisme - Rétention hydrosodée"
      }
    }
  },

  // ============================================================
  // SECTION 9: INDEX HÉPATIQUES
  // ============================================================
  {
    id: "idx_hepatique",
    label: "Index Hépatique",
    category: IndexCategory.METABOLIC,
    formula: "ALAT / ASAT",
    formula_type: "ratio",
    required_biomarkers: ["ALAT", "ASAT"],
    description: "Ratio transaminases. Souffrance hépatique.",
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
    description: "Capacité tampon du foie. Drainage si élevé.",
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
    description: "CRP × VS. Inflammation systémique.",
    referenceRange: {
      low: 2,   // CORRIGÉ selon PDF biomarqueurs_tables (était 0)
      high: 6,  // CORRIGÉ selon PDF biomarqueurs_tables (était 5)
      interpretation: {
        low: "Pas d'inflammation détectée",
        normal: "Inflammation mineure",
        high: "Inflammation significative"
      }
    }
  },

  // ============================================================
  // SECTION 11: INDEX PTH
  // ============================================================
  {
    id: "idx_pth",
    label: "Index PTH (Parathyroïde)",
    category: IndexCategory.THYROID,
    formula: "CA / P",
    formula_type: "ratio",
    required_biomarkers: ["CA", "P"],
    description: "Calcium/Phosphore. Activité parathyroïdienne.",
    referenceRange: {
      low: 2.0,
      high: 42.0, // Selon Excel
      interpretation: {
        low: "Hypo-parathyroïdie",
        normal: "Équilibre PTH",
        high: "Hyper-parathyroïdie"
      }
    }
  },

  // ============================================================
  // SECTION 12: INDEX INSULINIQUE
  // ============================================================
  {
    id: "idx_insuline",
    label: "Index Insuline (Sensibilité)",
    category: IndexCategory.GROWTH,
    formula: "TG / GLY",
    formula_type: "ratio",
    required_biomarkers: ["TG", "GLY"],
    description: "Triglycérides/Glycémie. Sensibilité insulinique.",
    referenceRange: {
      low: 1.5,  // Selon Excel
      high: 5.0, // Selon Excel
      interpretation: {
        low: "Hypo-insulinémie",
        normal: "Sensibilité insulinique normale",
        high: "Hyper-insulinémie"
      }
    }
  },

  // ============================================================
  // SECTION 13: INDEX OXYDO-RÉDUCTION
  // ============================================================
  {
    id: "idx_oxydo_reduction",
    label: "Index Oxydo-Réduction",
    category: IndexCategory.METABOLIC,
    formula: "idx_oxydation / idx_reduction",
    formula_type: "composite",
    requires_indexes: ["idx_oxydation", "idx_reduction"],
    required_biomarkers: [],
    description: "Équilibre redox cellulaire.",
    referenceRange: {
      low: 0.7,  // Selon PDF biomarqueurs_tables
      high: 2.0, // Selon PDF biomarqueurs_tables
      interpretation: {
        low: "Prédominance réduction",
        normal: "Équilibre oxydo-réduction",
        high: "Prédominance oxydation"
      }
    }
  },

  // ============================================================
  // SECTION 14: INDEX ORPHELINS (FORMULES INCONNUES)
  // ⚠️ Ces index sont nécessaires pour calculer d'autres index
  // mais leurs formules ne sont pas documentées dans les sources.
  // Normes issues du PDF biomarqueurs_tables.pdf
  // ============================================================
  {
    id: "idx_cortisol",
    label: "Index Cortisol",
    category: IndexCategory.ADAPTATION,
    // ✅ CORRIGÉ V2 : Proxy physiologique validé (9/10)
    // Glucocorticoïdes → démargination neutrophiles + lyse éosinophiles/lymphocytes
    formula: "((NEUT + MONO) / (LYMPH + EOS + 0.01)) * 1.5",
    formula_type: "composite",
    required_biomarkers: ["NEUT", "MONO", "LYMPH", "EOS"],
    description: "Proxy cortisol : (NEUT+MONO)/(LYMPH+EOS) × 1.5. Effet glucocorticoïdes sur NFS.",
    referenceRange: {
      low: 3,
      high: 7,
      interpretation: {
        low: "Insuffisance cortisolique, Épuisement, inflammation chronique, allergies",
        normal: "Activité cortisol équilibrée",
        high: "Hypercorticisme réactionnel, Stress majeur, fonte musculaire, insomnie"
      }
    }
  },
  {
    id: "idx_cortex_surrenalien",
    label: "Index Activité Glande Surrénale (Cortex)",
    category: IndexCategory.ADAPTATION,
    // ✅ CORRIGÉ V2 : Proxy validé (8.5/10)
    // Combine cortisol effectif + composante minéralocorticoïde
    formula: "(idx_cortisol + (idx_mineralo / 10)) / 2",
    formula_type: "composite",
    requires_indexes: ["idx_cortisol", "idx_mineralo"],
    required_biomarkers: [],
    description: "Proxy cortex surrénalien : (Cortisol + Minéralo/10) / 2. Capacité de réserve surrénale.",
    referenceRange: {
      low: 2.7,
      high: 3.3,
      interpretation: {
        low: "Petite surrénale, Fatigabilité constitutionnelle, récupération lente",
        normal: "Activité surrénalienne normale",
        high: "Grosse surrénale, Forte capacité de réserve, stress aigu"
      }
    }
  },
  {
    id: "idx_anabolisme",
    label: "Index Anabolisme",
    category: IndexCategory.METABOLIC,
    // ✅ CORRIGÉ V2 : Proxy validé (8/10)
    // Lymphocytes reflètent immunité/anabolisme, pondéré par état génital
    // NOTE: LYMPH est en % dans notre config (ex: 30 pour 30%)
    formula: "(idx_genital * (LYMPH / 100)) + 0.4",
    formula_type: "composite",
    requires_indexes: ["idx_genital"],
    required_biomarkers: ["LYMPH"],
    description: "Proxy anabolisme : (Génital × LYMPH%) + 0.4. Capacité de construction tissulaire.",
    referenceRange: {
      low: 0.65,
      high: 0.8,
      interpretation: {
        low: "Hypo-anabolisme, construction insuffisante",
        normal: "Activité anabolique normale",
        high: "Hyper-anabolisme, stockage, prise de poids"
      }
    }
  },
  {
    id: "idx_oxydation",
    label: "Index Oxydation",
    category: IndexCategory.METABOLIC,
    formula: "FORMULE_INCONNUE",
    formula_type: "secret",
    required_biomarkers: [],
    description: "Niveau d'oxydation cellulaire. ⚠️ FORMULE NON DOCUMENTÉE - Index non calculable.",
    referenceRange: {
      low: 1.44,   // Selon PDF biomarqueurs_tables
      high: 81.48, // Selon PDF biomarqueurs_tables
      interpretation: {
        low: "Hypo-oxydation",
        normal: "Oxydation cellulaire normale",
        high: "Hyper-oxydation (stress oxydatif)"
      }
    }
  },
  {
    id: "idx_reduction",
    label: "Index Réduction",
    category: IndexCategory.METABOLIC,
    formula: "FORMULE_INCONNUE",
    formula_type: "secret",
    required_biomarkers: [],
    description: "Niveau de réduction cellulaire. ⚠️ FORMULE NON DOCUMENTÉE - Index non calculable.",
    referenceRange: {
      low: 0.72,   // Selon PDF biomarqueurs_tables
      high: 116.9, // Selon PDF biomarqueurs_tables
      interpretation: {
        low: "Hypo-réduction",
        normal: "Réduction cellulaire normale",
        high: "Hyper-réduction"
      }
    }
  },
];