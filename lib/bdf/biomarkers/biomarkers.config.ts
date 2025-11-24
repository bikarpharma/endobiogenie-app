export interface BiomarkerDefinition {
  id: string;          // ex: "GR"
  label: string;       // ex: "Globules rouges"
  category: string;    // "hematology" | "enzyme" | ...
  unit?: string;       // optionnel
}

export const BIOMARKERS: BiomarkerDefinition[] = [
  // HÉMATOLOGIE (NF)
  { id: "GR", label: "Globules rouges", category: "hematology", unit: "T/L" },
  { id: "GB", label: "Globules blancs", category: "hematology", unit: "G/L" },
  { id: "HB", label: "Hémoglobine", category: "hematology", unit: "g/dL" },
  { id: "HCT", label: "Hématocrite", category: "hematology", unit: "%" },
  { id: "NEUT", label: "Neutrophiles", category: "hematology", unit: "G/L" },
  { id: "LYMPH", label: "Lymphocytes", category: "hematology", unit: "G/L" },
  { id: "EOS", label: "Éosinophiles", category: "hematology", unit: "G/L" },
  { id: "MONO", label: "Monocytes", category: "hematology", unit: "G/L" },
  { id: "PLAQUETTES", label: "Plaquettes", category: "hematology", unit: "G/L" },

  // ENZYMES
  { id: "LDH", label: "LDH", category: "enzyme", unit: "U/L" },
  { id: "CPK", label: "CPK", category: "enzyme", unit: "U/L" },

  // IONOGRAMME CMP
  { id: "NA", label: "Sodium", category: "ion", unit: "mmol/L" },
  { id: "K", label: "Potassium", category: "ion", unit: "mmol/L" },
  { id: "CA", label: "Calcium", category: "ion", unit: "mg/dL" },
  { id: "CL", label: "Chlore", category: "ion", unit: "mmol/L" },

  // HORMONES
  { id: "TSH", label: "TSH", category: "hormone" },
  { id: "T3L", label: "T3 Libre", category: "hormone" },
  { id: "T4L", label: "T4 Libre", category: "hormone" },

  // OS/STRUCTURE & MÉTABOLISME MINÉRAL
  { id: "OSTEO", label: "Ostéocalcine", category: "bone", unit: "ng/mL" },
  { id: "PAOI", label: "PAOi", category: "bone", unit: "U/L" },
  { id: "PAL", label: "Phosphatase Alcaline", category: "bone", unit: "U/L" },
  { id: "P", label: "Phosphore", category: "ion", unit: "mg/dL" },

  // MARQUEURS TUMEURAUX
  { id: "ACE", label: "ACE", category: "tumor" },
  { id: "CA19_9", label: "CA 19-9", category: "tumor" },
  { id: "CA15_3", label: "CA 15-3", category: "tumor" },
  { id: "CA125", label: "CA-125", category: "tumor" },
  { id: "PSA", label: "PSA", category: "tumor" },
  { id: "PAP", label: "PAP", category: "tumor" },
];
