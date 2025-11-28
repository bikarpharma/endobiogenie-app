/**
 * BIOMARQUEURS ENDOBIOGÉNIQUES
 * ========================================
 * Basé sur "La Théorie de l'Endobiogénie" - Lapraz & Hedayat
 * Volume 1 (p.166-172) : Les 17 biomarqueurs fondamentaux
 *
 * IMPORTANT: Ces biomarqueurs sont utilisés pour calculer les index BdF
 */

export interface BiomarkerDefinition {
  id: string;          // ex: "GR"
  label: string;       // ex: "Globules rouges"
  category: string;    // "hematology" | "enzyme" | ...
  unit?: string;       // optionnel
  description?: string; // Description endobiogénique
}

export const BIOMARKERS: BiomarkerDefinition[] = [
  // ==========================================
  // HÉMATOLOGIE - MOELLE OSSEUSE (Volume 1, p.166)
  // Les 8 biomarqueurs issus de la moelle osseuse
  // ==========================================
  {
    id: "GR",
    label: "Globules rouges",
    category: "hematology",
    unit: "T/L",
    description: "Reflet de l'imprégnation androgénique tissulaire (érythropoïèse)"
  },
  {
    id: "GB",
    label: "Globules blancs",
    category: "hematology",
    unit: "G/L",
    description: "Reflet de l'imprégnation œstrogénique tissulaire (leucopoïèse)"
  },
  {
    id: "HB",
    label: "Hémoglobine",
    category: "hematology",
    unit: "g/dL",
    description: "Transport oxygène, marqueur androgénique"
  },
  {
    id: "HCT",
    label: "Hématocrite",
    category: "hematology",
    unit: "%",
    description: "Volume globulaire, marqueur androgénique"
  },
  {
    id: "NEUT",
    label: "Neutrophiles",
    category: "hematology",
    unit: "%",
    description: "Défense immunitaire innée, marqueur œstrogénique (FSH)"
  },
  {
    id: "LYMPH",
    label: "Lymphocytes",
    category: "hematology",
    unit: "%",
    description: "Immunité adaptative, marqueur thyréotrope (TSH)"
  },
  {
    id: "EOS",
    label: "Éosinophiles",
    category: "hematology",
    unit: "%",
    description: "Allergie/parasitose, marqueur ACTH (adaptation)"
  },
  {
    id: "MONO",
    label: "Monocytes",
    category: "hematology",
    unit: "%",
    description: "Nettoyage tissulaire, marqueur FSH/œstrogènes"
  },
  {
    id: "BASO",
    label: "Basophiles",
    category: "hematology",
    unit: "%",
    description: "Réservoir histamine, marqueur alpha-sympathique"
  },
  {
    id: "PLAQUETTES",
    label: "Plaquettes",
    category: "hematology",
    unit: "G/L",
    description: "Coagulation, marqueur bêta-sympathique (mobilisation splénique)"
  },

  // ==========================================
  // INTERACTION MOELLE-SÉRUM (Volume 1, p.167)
  // ==========================================
  {
    id: "VS",
    label: "Vitesse de Sédimentation",
    category: "inflammation",
    unit: "mm/h",
    description: "Marqueur inflammatoire, interaction moelle-sérum"
  },

  // ==========================================
  // ENZYMES (Volume 1, p.168)
  // ==========================================
  {
    id: "LDH",
    label: "LDH",
    category: "enzyme",
    unit: "U/L",
    description: "Lactate déshydrogénase - Catabolisme cellulaire (glycolyse anaérobie)"
  },
  {
    id: "CPK",
    label: "CPK",
    category: "enzyme",
    unit: "U/L",
    description: "Créatine Phosphokinase - Anabolisme musculaire"
  },

  // ==========================================
  // HORMONES (Volume 1, p.168-169)
  // ==========================================
  {
    id: "TSH",
    label: "TSH",
    category: "hormone",
    unit: "mUI/L",
    description: "Thyréostimuline - Axe thyréotrope central"
  },
  {
    id: "T3L",
    label: "T3 Libre",
    category: "hormone",
    unit: "pmol/L",
    description: "Hormone thyroïdienne active périphérique"
  },
  {
    id: "T4L",
    label: "T4 Libre",
    category: "hormone",
    unit: "pmol/L",
    description: "Hormone thyroïdienne de réserve"
  },

  // ==========================================
  // OS/STRUCTURE - STROMA OSSEUX (Volume 1, p.167)
  // ==========================================
  {
    id: "OSTEO",
    label: "Ostéocalcine",
    category: "bone",
    unit: "ng/mL",
    description: "Marqueur formation osseuse, activité ostéoblastique"
  },
  {
    id: "PAOI",
    label: "PAOi (Phosphatase Alcaline Osseuse)",
    category: "bone",
    unit: "U/L",
    description: "Marqueur remodelage osseux, activité GH/IGF-1"
  },
  {
    id: "PAL",
    label: "Phosphatase Alcaline Totale",
    category: "bone",
    unit: "U/L",
    description: "Phosphatase alcaline totale (os + foie + intestin)"
  },

  // ==========================================
  // IONOGRAMME (Volume 1, p.169)
  // ==========================================
  {
    id: "K",
    label: "Potassium",
    category: "ion",
    unit: "mmol/L",
    description: "Électrolyte intracellulaire, marqueur corticotrope"
  },
  {
    id: "CA",
    label: "Calcium",
    category: "ion",
    unit: "mg/dL",
    description: "Calcium total, régulation neuromusculaire et osseuse"
  },
  {
    id: "NA",
    label: "Sodium",
    category: "ion",
    unit: "mmol/L",
    description: "Électrolyte extracellulaire, marqueur aldostérone"
  },
  {
    id: "CL",
    label: "Chlore",
    category: "ion",
    unit: "mmol/L",
    description: "Équilibre acido-basique"
  },
  {
    id: "P",
    label: "Phosphore",
    category: "ion",
    unit: "mg/dL",
    description: "Métabolisme énergétique (ATP), équilibre PTH"
  },
  {
    id: "MG",
    label: "Magnésium",
    category: "ion",
    unit: "mmol/L",
    description: "Cofacteur enzymatique, régulation neuromusculaire (spasmophilie)"
  },

  // ==========================================
  // MARQUEURS HÉPATIQUES (Drainage)
  // ==========================================
  {
    id: "ALAT",
    label: "ALAT (GPT)",
    category: "liver",
    unit: "U/L",
    description: "Transaminase hépatique, cytolyse hépatocytaire"
  },
  {
    id: "ASAT",
    label: "ASAT (GOT)",
    category: "liver",
    unit: "U/L",
    description: "Transaminase hépatique + musculaire"
  },
  {
    id: "GGT",
    label: "Gamma-GT",
    category: "liver",
    unit: "U/L",
    description: "Marqueur cholestase et induction enzymatique"
  },
  {
    id: "BILI",
    label: "Bilirubine Totale",
    category: "liver",
    unit: "mg/dL",
    description: "Métabolisme hème, fonction hépatique"
  },

  // ==========================================
  // MARQUEURS LIPIDIQUES (Métabolisme)
  // ==========================================
  {
    id: "CHOL",
    label: "Cholestérol Total",
    category: "lipid",
    unit: "g/L",
    description: "Précurseur hormones stéroïdiennes"
  },
  {
    id: "TG",
    label: "Triglycérides",
    category: "lipid",
    unit: "g/L",
    description: "Réserve énergétique, marqueur insulinique"
  },

  // ==========================================
  // MARQUEURS RÉNAUX (Émonctoire)
  // ==========================================
  {
    id: "CREAT",
    label: "Créatinine",
    category: "renal",
    unit: "mg/dL",
    description: "Fonction rénale, catabolisme musculaire"
  },
  {
    id: "UREE",
    label: "Urée",
    category: "renal",
    unit: "g/L",
    description: "Catabolisme protéique, fonction rénale"
  },

  // ==========================================
  // MARQUEURS GLYCÉMIQUES (Somatotrope)
  // ==========================================
  {
    id: "GLY",
    label: "Glycémie à jeun",
    category: "metabolic",
    unit: "g/L",
    description: "Équilibre insuline/glucagon"
  },
  {
    id: "HBA1C",
    label: "Hémoglobine Glyquée",
    category: "metabolic",
    unit: "%",
    description: "Équilibre glycémique sur 3 mois"
  },

  // ==========================================
  // MARQUEURS INFLAMMATOIRES
  // ==========================================
  {
    id: "CRP",
    label: "CRP",
    category: "inflammation",
    unit: "mg/L",
    description: "Protéine C-réactive, inflammation aiguë"
  },
  {
    id: "FERRITINE",
    label: "Ferritine",
    category: "inflammation",
    unit: "ng/mL",
    description: "Réserves en fer, marqueur inflammatoire"
  },

  // ==========================================
  // MARQUEURS TUMEURAUX (optionnels)
  // ==========================================
  { id: "ACE", label: "ACE", category: "tumor", unit: "ng/mL" },
  { id: "CA19_9", label: "CA 19-9", category: "tumor", unit: "U/mL" },
  { id: "CA15_3", label: "CA 15-3", category: "tumor", unit: "U/mL" },
  { id: "CA125", label: "CA-125", category: "tumor", unit: "U/mL" },
  { id: "PSA", label: "PSA", category: "tumor", unit: "ng/mL" },
];
