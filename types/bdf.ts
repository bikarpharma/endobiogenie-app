// ========================================
// TYPES PARTAGÉS - Module BdF
// ========================================
// Types utilisés par la page BdF et le Chat pour l'analyse BdF

/**
 * Valeurs biologiques en entrée (toutes optionnelles)
 */
export type BdfInputs = {
  [key: string]: number | undefined;
  GR?: number; // Globules rouges (T/L)
  GB?: number; // Globules blancs (G/L)
  hemoglobine?: number; // Hémoglobine (g/dL)
  neutrophiles?: number; // Neutrophiles (G/L)
  lymphocytes?: number; // Lymphocytes (G/L)
  eosinophiles?: number; // Éosinophiles (G/L)
  monocytes?: number; // Monocytes (G/L)
  plaquettes?: number; // Plaquettes (G/L)
  LDH?: number; // LDH (UI/L)
  CPK?: number; // CPK (UI/L)
  PAOi?: number; // Phosphatase alcaline osseuse (UI/L)
  osteocalcine?: number; // Ostéocalcine (ng/mL)
  TSH?: number; // TSH (mUI/L)
  VS?: number; // Vitesse de sédimentation (mm/h)
  calcium?: number; // Calcium total (Ca²⁺)
  potassium?: number; // Potassium (K⁺)
};

/**
 * Un index calculé avec son statut
 */
export type BdfIndex = {
  key: string; // Clé unique de l'index (ex: "indexGenital")
  label: string; // Nom affiché (ex: "Index génital")
  value?: number; // Valeur calculée
  unit?: string; // Unité optionnelle
  status: "ok" | "na"; // "ok" si calculé, "na" si données manquantes
  note?: string; // Texte interprétatif court
};

/**
 * Résultat complet d'une analyse BdF
 */
export type BdfAnalysis = {
  inputs: BdfInputs; // Valeurs biologiques utilisées
  indexes: BdfIndex[]; // 8 index calculés
  summary: string; // Résumé fonctionnel global
  axes: string[]; // Axes neuroendocriniens sollicités
};

/**
 * Props du Drawer de résultats BdF
 */
export type BdfResultDrawerProps = {
  analysis: BdfAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestRag?: (analysis: BdfAnalysis) => void;
};
