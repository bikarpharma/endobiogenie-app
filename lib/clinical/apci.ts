/**
 * RÉFÉRENTIEL APCI (Affections Prises en Charge Intégralement)
 * ============================================================
 *
 * Liste officielle des 24 APCI CNAM Tunisie utilisée UNIQUEMENT comme
 * vocabulaire clinique et repère pour les médecins.
 *
 * ⚠️ AUCUNE logique CNAM administrative :
 * - Pas de durée de validité
 * - Pas de numéro de décision
 * - Pas de statut remboursement
 *
 * Usage : Terrain endobiogénique et analytics IA
 */

import { z } from "zod";

// ==========================================
// TYPES DE BASE
// ==========================================

export type MedicalCategory =
  | "ENDO"      // Endocrinologie
  | "CARDIO"    // Cardiologie
  | "PNEUMO"    // Pneumologie
  | "NEURO"     // Neurologie
  | "RHUMATO"   // Rhumatologie
  | "GASTRO"    // Gastro-entérologie
  | "NEPHRO"    // Néphrologie
  | "OPHTALMO"  // Ophtalmologie
  | "PSY"       // Psychiatrie
  | "HEMATO"    // Hématologie / Oncologie
  | "INFECTIO"  // Infectiologie
  | "AUTRE";    // Autres

export const MEDICAL_CATEGORY_LABELS: Record<MedicalCategory, string> = {
  ENDO: "Endocrinologie",
  CARDIO: "Cardiologie",
  PNEUMO: "Pneumologie",
  NEURO: "Neurologie",
  RHUMATO: "Rhumatologie",
  GASTRO: "Gastro-entérologie",
  NEPHRO: "Néphrologie",
  OPHTALMO: "Ophtalmologie",
  PSY: "Psychiatrie",
  HEMATO: "Hématologie / Oncologie",
  INFECTIO: "Infectiologie",
  AUTRE: "Autres",
};

export const MEDICAL_CATEGORY_COLORS: Record<MedicalCategory, string> = {
  ENDO: "#8b5cf6",     // Violet
  CARDIO: "#ef4444",   // Rouge
  PNEUMO: "#06b6d4",   // Cyan
  NEURO: "#6366f1",    // Indigo
  RHUMATO: "#84cc16",  // Lime
  GASTRO: "#f59e0b",   // Amber
  NEPHRO: "#14b8a6",   // Teal
  OPHTALMO: "#0ea5e9", // Sky
  PSY: "#a855f7",      // Purple
  HEMATO: "#dc2626",   // Red dark
  INFECTIO: "#eab308", // Yellow
  AUTRE: "#6b7280",    // Gray
};

// ==========================================
// DÉFINITION D'UN SOUS-TYPE APCI
// ==========================================

export interface ApciSubtypeDefinition {
  code: string;   // ex: "01-T2"
  label: string;  // ex: "Type 2 (Non insulino-dépendant)"
  shortLabel: string; // ex: "Type 2"
}

// ==========================================
// DÉFINITION D'UNE APCI
// ==========================================

export interface ApciDefinition {
  code: string;              // Code officiel APCI : "01" à "24"
  label: string;             // Libellé officiel complet (NE PAS MODIFIER)
  shortLabel: string;        // Libellé court pour l'UI
  category: MedicalCategory; // ENDO, CARDIO, etc.
  keywords: string[];        // Mots-clés pour la recherche

  // Pilote l'UX (ordre d'affichage, "Top fréquents")
  uiPriority: number;        // 1 = très fréquent / important, 100 = standard

  // Pilote la finesse clinique
  requiresSubtype: boolean;  // ex. true pour le diabète
  isSeverePattern?: boolean; // true si terrain généralement sévère (IC, IR grave…)

  // Sous-types éventuels (ex: diabète T1/T2/Gest.)
  subtypes?: ApciSubtypeDefinition[];

  // Description clinique courte pour tooltip
  clinicalHint?: string;
}

// ==========================================
// LISTE OFFICIELLE DES 24 APCI
// ==========================================

export const APCI_DEFINITIONS: ApciDefinition[] = [
  // =====================
  // ENDOCRINOLOGIE (01-04)
  // =====================
  {
    code: "01",
    label: "Diabète insulinodépendant ou non insulinodépendant ne pouvant être équilibré par le seul régime",
    shortLabel: "Diabète",
    category: "ENDO",
    keywords: ["diabète", "diabete", "DT1", "DT2", "insuline", "glycémie", "HbA1c", "sucre", "glucose"],
    uiPriority: 1, // Très fréquent
    requiresSubtype: true,
    isSeverePattern: false,
    subtypes: [
      { code: "01-T1", label: "Type 1 (Insulino-dépendant)", shortLabel: "Type 1" },
      { code: "01-T2", label: "Type 2 (Non insulino-dépendant)", shortLabel: "Type 2" },
      { code: "01-GEST", label: "Diabète gestationnel", shortLabel: "Gestationnel" },
      { code: "01-AUTRE", label: "Autre type / Non précisé", shortLabel: "Autre" },
    ],
    clinicalHint: "Terrain métabolique majeur. Impact sur tous les axes endobiogéniques.",
  },
  {
    code: "02",
    label: "Dysthyroïdies",
    shortLabel: "Dysthyroïdies",
    category: "ENDO",
    keywords: ["thyroïde", "thyroide", "hypothyroïdie", "hyperthyroïdie", "TSH", "T3", "T4", "hashimoto", "basedow", "goitre"],
    uiPriority: 2, // Très fréquent
    requiresSubtype: true,
    isSeverePattern: false,
    subtypes: [
      { code: "02-HYPO", label: "Hypothyroïdie", shortLabel: "Hypothyroïdie" },
      { code: "02-HYPER", label: "Hyperthyroïdie", shortLabel: "Hyperthyroïdie" },
      { code: "02-NODULE", label: "Nodule thyroïdien", shortLabel: "Nodule" },
      { code: "02-AUTRE", label: "Autre dysthyroïdie", shortLabel: "Autre" },
    ],
    clinicalHint: "Axe thyréotrope central. Impact métabolique et neuro-végétatif majeur.",
  },
  {
    code: "03",
    label: "Affections hypophysaires",
    shortLabel: "Affections hypophysaires",
    category: "ENDO",
    keywords: ["hypophyse", "adénome", "prolactine", "GH", "ACTH", "FSH", "LH", "panhypopituitarisme"],
    uiPriority: 60,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Chef d'orchestre endocrinien. Terrain complexe multi-axial.",
  },
  {
    code: "04",
    label: "Affections surrénaliennes",
    shortLabel: "Affections surrénaliennes",
    category: "ENDO",
    keywords: ["surrénale", "surrenale", "cortisol", "aldostérone", "addison", "cushing", "phéochromocytome"],
    uiPriority: 50,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Axe corticotrope. Impact majeur sur l'adaptation au stress.",
  },

  // =====================
  // CARDIOLOGIE (05-09)
  // =====================
  {
    code: "05",
    label: "HTA sévère",
    shortLabel: "HTA sévère",
    category: "CARDIO",
    keywords: ["HTA", "hypertension", "tension", "pression artérielle", "PA élevée"],
    uiPriority: 3, // Très fréquent
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Terrain sympathicotonique. Surveillance rénale et cardiaque.",
  },
  {
    code: "06",
    label: "Cardiopathies congénitales et valvulopathies",
    shortLabel: "Cardiopathies congénitales / Valvulopathies",
    category: "CARDIO",
    keywords: ["cardiopathie", "valvulopathie", "valve", "congénital", "souffle cardiaque", "RM", "IM", "RA", "IA"],
    uiPriority: 40,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Terrain cardiaque structurel. Attention aux interactions médicamenteuses.",
  },
  {
    code: "07",
    label: "Insuffisance cardiaque et troubles du rythme",
    shortLabel: "Insuffisance cardiaque / Troubles du rythme",
    category: "CARDIO",
    keywords: ["insuffisance cardiaque", "IC", "arythmie", "FA", "fibrillation", "flutter", "tachycardie", "bradycardie"],
    uiPriority: 8,
    requiresSubtype: true,
    isSeverePattern: true,
    subtypes: [
      { code: "07-IC", label: "Insuffisance cardiaque", shortLabel: "IC" },
      { code: "07-FA", label: "Fibrillation auriculaire", shortLabel: "FA" },
      { code: "07-AUTRE", label: "Autre trouble du rythme", shortLabel: "Autre arythmie" },
    ],
    clinicalHint: "Terrain cardio-vasculaire sévère. Drainage prudent.",
  },
  {
    code: "08",
    label: "Affections coronariennes et leurs complications",
    shortLabel: "Coronaropathie",
    category: "CARDIO",
    keywords: ["coronarien", "infarctus", "IDM", "angor", "angine de poitrine", "stent", "pontage", "SCA"],
    uiPriority: 6, // Fréquent
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Terrain ischémique. Attention aux plantes vasoconstrictrices.",
  },
  {
    code: "09",
    label: "Phlébites",
    shortLabel: "Phlébites / Thromboses veineuses",
    category: "CARDIO",
    keywords: ["phlébite", "TVP", "thrombose", "embolie", "EP", "anticoagulant"],
    uiPriority: 35,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Terrain thrombotique. Attention aux interactions avec anticoagulants.",
  },

  // =====================
  // PNEUMOLOGIE (10-11)
  // =====================
  {
    code: "10",
    label: "Tuberculose active",
    shortLabel: "Tuberculose active",
    category: "PNEUMO",
    keywords: ["tuberculose", "TB", "BK", "bacille de Koch"],
    uiPriority: 45,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Infection chronique. Traitement spécifique prioritaire.",
  },
  {
    code: "11",
    label: "Insuffisance respiratoire chronique",
    shortLabel: "Insuffisance respiratoire chronique",
    category: "PNEUMO",
    keywords: ["insuffisance respiratoire", "IRC", "BPCO", "emphysème", "oxygénothérapie", "dyspnée"],
    uiPriority: 10,
    requiresSubtype: true,
    isSeverePattern: true,
    subtypes: [
      { code: "11-BPCO", label: "BPCO", shortLabel: "BPCO" },
      { code: "11-EMPHYSEME", label: "Emphysème", shortLabel: "Emphysème" },
      { code: "11-FIBROSE", label: "Fibrose pulmonaire", shortLabel: "Fibrose" },
      { code: "11-AUTRE", label: "Autre IRC", shortLabel: "Autre" },
    ],
    clinicalHint: "Terrain d'hypoxie chronique. Prudence avec les sédatifs.",
  },

  // =====================
  // NEUROLOGIE (12-14)
  // =====================
  {
    code: "12",
    label: "Sclérose en plaques",
    shortLabel: "Sclérose en plaques (SEP)",
    category: "NEURO",
    keywords: ["sclérose en plaques", "SEP", "MS", "démyélinisation"],
    uiPriority: 55,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Maladie auto-immune neurologique. Accompagnement du terrain inflammatoire.",
  },
  {
    code: "13",
    label: "Épilepsie",
    shortLabel: "Épilepsie",
    category: "NEURO",
    keywords: ["épilepsie", "epilepsie", "convulsion", "crise comitiale", "antiépileptique"],
    uiPriority: 25,
    requiresSubtype: false,
    isSeverePattern: false,
    clinicalHint: "Terrain neurologique. Attention aux interactions avec antiépileptiques.",
  },
  {
    code: "14",
    label: "Maladie de Parkinson",
    shortLabel: "Parkinson",
    category: "NEURO",
    keywords: ["parkinson", "tremblement", "rigidité", "dopamine", "L-DOPA"],
    uiPriority: 30,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Maladie neurodégénérative. Axe dopaminergique central.",
  },

  // =====================
  // PSYCHIATRIE (15)
  // =====================
  {
    code: "15",
    label: "Psychoses et névroses",
    shortLabel: "Psychoses / Névroses",
    category: "PSY",
    keywords: ["psychose", "névrose", "schizophrénie", "trouble bipolaire", "dépression sévère", "anxiété généralisée"],
    uiPriority: 20,
    requiresSubtype: true,
    isSeverePattern: false,
    subtypes: [
      { code: "15-PSY", label: "Psychose (schizophrénie, bipolaire…)", shortLabel: "Psychose" },
      { code: "15-DEP", label: "Dépression sévère récurrente", shortLabel: "Dépression sévère" },
      { code: "15-ANX", label: "Trouble anxieux sévère", shortLabel: "Anxiété sévère" },
      { code: "15-AUTRE", label: "Autre trouble psychiatrique", shortLabel: "Autre" },
    ],
    clinicalHint: "Terrain neuro-psychique. Accompagnement de l'axe corticotrope et neuro-végétatif.",
  },

  // =====================
  // NÉPHROLOGIE (16)
  // =====================
  {
    code: "16",
    label: "Insuffisance rénale chronique",
    shortLabel: "Insuffisance rénale chronique",
    category: "NEPHRO",
    keywords: ["insuffisance rénale", "IRC", "dialyse", "créatinine", "DFG", "néphropathie"],
    uiPriority: 7, // Fréquent
    requiresSubtype: true,
    isSeverePattern: true,
    subtypes: [
      { code: "16-MOD", label: "IRC modérée (stade 3)", shortLabel: "Stade 3" },
      { code: "16-SEV", label: "IRC sévère (stade 4)", shortLabel: "Stade 4" },
      { code: "16-TERM", label: "IRC terminale / Dialyse (stade 5)", shortLabel: "Dialyse" },
      { code: "16-GREFFE", label: "Greffe rénale", shortLabel: "Greffe" },
    ],
    clinicalHint: "Émonctoire majeur compromis. Adaptation posologique indispensable.",
  },

  // =====================
  // RHUMATOLOGIE (17-18)
  // =====================
  {
    code: "17",
    label: "Rhumatismes inflammatoires chroniques",
    shortLabel: "Rhumatismes inflammatoires",
    category: "RHUMATO",
    keywords: ["polyarthrite", "PR", "spondylarthrite", "SPA", "arthrite", "rhumatisme"],
    uiPriority: 15,
    requiresSubtype: true,
    isSeverePattern: false,
    subtypes: [
      { code: "17-PR", label: "Polyarthrite rhumatoïde", shortLabel: "PR" },
      { code: "17-SPA", label: "Spondylarthrite ankylosante", shortLabel: "SPA" },
      { code: "17-AUTRE", label: "Autre rhumatisme inflammatoire", shortLabel: "Autre" },
    ],
    clinicalHint: "Terrain inflammatoire chronique. Accompagnement anti-inflammatoire naturel.",
  },
  {
    code: "18",
    label: "Maladies auto-immunes",
    shortLabel: "Maladies auto-immunes",
    category: "RHUMATO",
    keywords: ["auto-immune", "lupus", "LED", "sjögren", "sclérodermie", "vascularite", "connectivite"],
    uiPriority: 22,
    requiresSubtype: true,
    isSeverePattern: true,
    subtypes: [
      { code: "18-LUPUS", label: "Lupus érythémateux systémique", shortLabel: "Lupus" },
      { code: "18-SJOGREN", label: "Syndrome de Sjögren", shortLabel: "Sjögren" },
      { code: "18-SCLERO", label: "Sclérodermie", shortLabel: "Sclérodermie" },
      { code: "18-AUTRE", label: "Autre maladie auto-immune", shortLabel: "Autre" },
    ],
    clinicalHint: "Dérèglement immunitaire profond. Modulation du terrain.",
  },

  // =====================
  // HÉMATOLOGIE / ONCOLOGIE (19)
  // =====================
  {
    code: "19",
    label: "Tumeurs et hémopathies malignes",
    shortLabel: "Cancers / Hémopathies malignes",
    category: "HEMATO",
    keywords: ["cancer", "tumeur", "leucémie", "lymphome", "myélome", "chimiothérapie", "oncologie"],
    uiPriority: 12,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Terrain oncologique. Accompagnement de soutien, pas de substitution.",
  },

  // =====================
  // GASTRO-ENTÉROLOGIE (20-22)
  // =====================
  {
    code: "20",
    label: "Maladies inflammatoires chroniques de l'intestin",
    shortLabel: "MICI (Crohn / RCH)",
    category: "GASTRO",
    keywords: ["MICI", "crohn", "RCH", "rectocolite", "colite", "iléite"],
    uiPriority: 18,
    requiresSubtype: true,
    isSeverePattern: false,
    subtypes: [
      { code: "20-CROHN", label: "Maladie de Crohn", shortLabel: "Crohn" },
      { code: "20-RCH", label: "Rectocolite hémorragique", shortLabel: "RCH" },
    ],
    clinicalHint: "Terrain digestif inflammatoire. Axe intestin-cerveau perturbé.",
  },
  {
    code: "21",
    label: "Hépatites chroniques actives",
    shortLabel: "Hépatites chroniques",
    category: "GASTRO",
    keywords: ["hépatite", "hepatite", "VHB", "VHC", "hépatite B", "hépatite C", "transaminases"],
    uiPriority: 28,
    requiresSubtype: true,
    isSeverePattern: false,
    subtypes: [
      { code: "21-VHB", label: "Hépatite B chronique", shortLabel: "VHB" },
      { code: "21-VHC", label: "Hépatite C chronique", shortLabel: "VHC" },
      { code: "21-AUTRE", label: "Autre hépatite chronique", shortLabel: "Autre" },
    ],
    clinicalHint: "Émonctoire hépatique compromis. Prudence avec les plantes hépatotoxiques.",
  },
  {
    code: "22",
    label: "Cirrhoses et insuffisance hépatique",
    shortLabel: "Cirrhose / Insuffisance hépatique",
    category: "GASTRO",
    keywords: ["cirrhose", "insuffisance hépatique", "foie", "ascite", "encéphalopathie"],
    uiPriority: 32,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Émonctoire hépatique sévèrement atteint. Drainage contre-indiqué.",
  },

  // =====================
  // OPHTALMOLOGIE (23)
  // =====================
  {
    code: "23",
    label: "Glaucome",
    shortLabel: "Glaucome",
    category: "OPHTALMO",
    keywords: ["glaucome", "tension oculaire", "nerf optique", "champ visuel"],
    uiPriority: 38,
    requiresSubtype: false,
    isSeverePattern: false,
    clinicalHint: "Attention aux plantes anticholinergiques.",
  },

  // =====================
  // AUTRES (24)
  // =====================
  {
    code: "24",
    label: "Mucoviscidose",
    shortLabel: "Mucoviscidose",
    category: "PNEUMO",
    keywords: ["mucoviscidose", "fibrose kystique", "CF"],
    uiPriority: 70,
    requiresSubtype: false,
    isSeverePattern: true,
    clinicalHint: "Maladie génétique multi-organes. Prise en charge spécialisée.",
  },
];

// ==========================================
// SCHÉMAS ZOD - ENTRÉES PATIENT
// ==========================================

/**
 * Statut clinique d'une affection
 */
export const ClinicalStatusSchema = z.enum([
  "ACTIVE",      // Affection active, nécessite suivi
  "STABLE",      // Sous contrôle, traitement stable
  "REMISSION",   // En rémission (cancers, MAI...)
  "HISTORICAL",  // Historique, plus d'impact actuel
]);

export type ClinicalStatus = z.infer<typeof ClinicalStatusSchema>;

export const CLINICAL_STATUS_LABELS: Record<ClinicalStatus, string> = {
  ACTIVE: "Active",
  STABLE: "Stable / Contrôlée",
  REMISSION: "En rémission",
  HISTORICAL: "Historique",
};

export const CLINICAL_STATUS_COLORS: Record<ClinicalStatus, string> = {
  ACTIVE: "#ef4444",      // Rouge
  STABLE: "#22c55e",      // Vert
  REMISSION: "#8b5cf6",   // Violet
  HISTORICAL: "#6b7280",  // Gris
};

/**
 * Entrée APCI pour un patient
 */
export const PatientApciSchema = z
  .object({
    id: z.string().uuid(),
    apciCode: z.string().min(2).max(2),  // "01", "05"…
    subtypeCode: z.string().optional(),  // "01-T2" si applicable

    diagnosedAt: z.string().datetime().optional(), // date du diagnostic si connue
    notedAt: z.string().datetime(),                // date de saisie dans IntegrIA

    status: ClinicalStatusSchema.default("ACTIVE"),

    comment: z.string().max(500).optional(),
  })
  .refine((data) => {
    // Validation : si requiresSubtype = true, subtypeCode obligatoire
    const def = APCI_DEFINITIONS.find((a) => a.code === data.apciCode);
    if (!def?.requiresSubtype) return true;
    return !!data.subtypeCode;
  }, {
    message: "Le sous-type est obligatoire pour cette affection.",
    path: ["subtypeCode"],
  });

export type PatientApciEntry = z.infer<typeof PatientApciSchema>;

/**
 * Maladie chronique hors APCI
 */
export const ChronicDiseaseSchema = z.object({
  id: z.string().uuid(),
  diseaseId: z.string().optional(),        // id référentiel interne (pathologies.ts)
  label: z.string().min(1).max(200),       // toujours rempli
  isFreeText: z.boolean(),                 // true si saisie libre

  status: ClinicalStatusSchema.default("ACTIVE"),

  diagnosedAt: z.string().datetime().optional(),
  notedAt: z.string().datetime(),

  comment: z.string().max(500).optional(),

  // Pour suggestion IA future
  suggestedApciCode: z.string().optional(),
});

export type PatientChronicDiseaseEntry = z.infer<typeof ChronicDiseaseSchema>;

/**
 * Profil chronique complet du patient
 */
export const PatientChronicProfileSchema = z.object({
  apcis: z.array(PatientApciSchema).default([]),
  otherDiseases: z.array(ChronicDiseaseSchema).default([]),
});

export type PatientChronicProfile = z.infer<typeof PatientChronicProfileSchema>;

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

/**
 * Recherche une APCI par code
 */
export function getApciByCode(code: string): ApciDefinition | undefined {
  return APCI_DEFINITIONS.find((a) => a.code === code);
}

/**
 * Recherche un sous-type par son code complet
 */
export function getApciSubtype(
  apciCode: string,
  subtypeCode: string
): ApciSubtypeDefinition | undefined {
  const apci = getApciByCode(apciCode);
  return apci?.subtypes?.find((s) => s.code === subtypeCode);
}

/**
 * Recherche intelligente dans les APCI
 */
export function searchApci(query: string, limit: number = 10): ApciDefinition[] {
  if (!query || query.length < 1) {
    // Retourner les plus fréquentes par défaut
    return [...APCI_DEFINITIONS]
      .sort((a, b) => a.uiPriority - b.uiPriority)
      .slice(0, limit);
  }

  const normalizedQuery = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const scored = APCI_DEFINITIONS.map((apci) => {
    let score = 0;

    // Recherche par code exact
    if (apci.code === query || apci.code === query.padStart(2, "0")) {
      score = 200;
    }

    const normalizedLabel = apci.label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const normalizedShort = apci.shortLabel
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Label exact ou commence par
    if (normalizedShort.startsWith(normalizedQuery)) {
      score = Math.max(score, 150);
    } else if (normalizedLabel.startsWith(normalizedQuery)) {
      score = Math.max(score, 140);
    } else if (normalizedShort.includes(normalizedQuery)) {
      score = Math.max(score, 100);
    } else if (normalizedLabel.includes(normalizedQuery)) {
      score = Math.max(score, 90);
    }

    // Keywords
    for (const kw of apci.keywords) {
      const normalizedKw = kw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (normalizedKw.startsWith(normalizedQuery)) {
        score = Math.max(score, 120);
      } else if (normalizedKw.includes(normalizedQuery)) {
        score = Math.max(score, 80);
      }
    }

    // Bonus de priorité UI
    if (score > 0) {
      score += Math.max(0, 20 - apci.uiPriority);
    }

    return { ...apci, score };
  })
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

/**
 * Obtenir les APCI les plus fréquentes (pour affichage initial)
 */
export function getFrequentApcis(limit: number = 8): ApciDefinition[] {
  return [...APCI_DEFINITIONS]
    .sort((a, b) => a.uiPriority - b.uiPriority)
    .slice(0, limit);
}

/**
 * Formater le label complet d'une entrée APCI patient
 */
export function formatApciEntryLabel(entry: PatientApciEntry): string {
  const apci = getApciByCode(entry.apciCode);
  if (!apci) return `APCI ${entry.apciCode}`;

  let label = apci.shortLabel;

  if (entry.subtypeCode) {
    const subtype = getApciSubtype(entry.apciCode, entry.subtypeCode);
    if (subtype) {
      label += ` - ${subtype.shortLabel}`;
    }
  }

  return label;
}

/**
 * Générer un UUID compatible navigateur
 */
function generateUUID(): string {
  // Utiliser crypto.randomUUID si disponible (navigateurs modernes)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback pour les navigateurs plus anciens
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Créer une nouvelle entrée APCI vide
 */
export function createApciEntry(
  apciCode: string,
  subtypeCode?: string
): PatientApciEntry {
  return {
    id: generateUUID(),
    apciCode,
    subtypeCode,
    notedAt: new Date().toISOString(),
    status: "ACTIVE",
  };
}

/**
 * Créer une nouvelle entrée maladie chronique
 */
export function createChronicDiseaseEntry(
  label: string,
  diseaseId?: string
): PatientChronicDiseaseEntry {
  return {
    id: generateUUID(),
    diseaseId,
    label,
    isFreeText: !diseaseId,
    notedAt: new Date().toISOString(),
    status: "ACTIVE",
  };
}

/**
 * Profil chronique vide
 */
export function createEmptyChronicProfile(): PatientChronicProfile {
  return {
    apcis: [],
    otherDiseases: [],
  };
}
