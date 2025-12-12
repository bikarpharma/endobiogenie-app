/**
 * SMART LAB IMPORT - Configuration des Synonymes
 * ================================================
 * Mapping des noms de biomarqueurs tels qu'ils apparaissent
 * sur les PDF de laboratoires tunisiens/français vers les codes
 * standardisés du système IntegrIA.
 *
 * IMPORTANT: Ce fichier est extensible. Ajouter de nouveaux synonymes
 * au fur et à mesure que de nouveaux formats de labos sont rencontrés.
 */

/**
 * Mapping: Nom labo (lowercase, normalisé) → Code système IntegrIA
 *
 * Règles de matching:
 * 1. Le texte extrait est normalisé (lowercase, accents supprimés)
 * 2. On cherche une correspondance dans ce dictionnaire
 * 3. Si trouvé → on retourne le code système
 */
export const LAB_SYNONYMS: Record<string, string> = {
  // ==========================================
  // HÉMATOLOGIE - NFS
  // ==========================================

  // Globules rouges / Hématies
  "hematies": "GR",
  "hématies": "GR",
  "globules rouges": "GR",
  "gr": "GR",
  "rbc": "GR",
  "erythrocytes": "GR",
  "érythrocytes": "GR",

  // Hémoglobine
  "hemoglobine": "HB",
  "hémoglobine": "HB",
  "hb": "HB",
  "hgb": "HB",

  // Hématocrite
  "hematocrite": "HCT",
  "hématocrite": "HCT",
  "hct": "HCT",
  "ht": "HCT",

  // Globules blancs / Leucocytes
  "leucocytes": "GB",
  "globules blancs": "GB",
  "gb": "GB",
  "wbc": "GB",

  // Neutrophiles
  "polynucleaires neutrophiles": "NEUT",
  "polynucléaires neutrophiles": "NEUT",
  "neutrophiles": "NEUT",
  "pnn": "NEUT",
  "neut": "NEUT",
  "granulocytes neutrophiles": "NEUT",

  // Lymphocytes
  "lymphocytes": "LYMPH",
  "lympho": "LYMPH",
  "lym": "LYMPH",

  // Éosinophiles
  "polynucleaires eosinophiles": "EOS",
  "polynucléaires éosinophiles": "EOS",
  "eosinophiles": "EOS",
  "éosinophiles": "EOS",
  "pne": "EOS",
  "eo": "EOS",

  // Basophiles
  "polynucleaires basophiles": "BASO",
  "polynucléaires basophiles": "BASO",
  "basophiles": "BASO",
  "pnb": "BASO",
  "baso": "BASO",

  // Monocytes
  "monocytes": "MONO",
  "mono": "MONO",

  // Plaquettes
  "plaquettes": "PLAQUETTES",
  "numeration des plaquettes": "PLAQUETTES",
  "numération des plaquettes": "PLAQUETTES",
  "plt": "PLAQUETTES",
  "thrombocytes": "PLAQUETTES",

  // VS
  "vitesse de sedimentation": "VS",
  "vitesse de sédimentation": "VS",
  "vs": "VS",
  "1ere heure": "VS",
  "1ère heure": "VS",

  // ==========================================
  // ENZYMES
  // ==========================================

  // LDH
  "ldh": "LDH",
  "lactate deshydrogenase": "LDH",
  "lactate déshydrogénase": "LDH",

  // CPK
  "cpk": "CPK",
  "ck": "CPK",
  "creatine kinase": "CPK",
  "créatine kinase": "CPK",
  "creatine phosphokinase": "CPK",

  // ==========================================
  // HORMONES THYROÏDIENNES
  // ==========================================

  // TSH
  "tsh": "TSH",
  "thyreostimuline": "TSH",
  "thyréostimuline": "TSH",
  "hormone thyreotrope": "TSH",
  "hormone thyréotrope": "TSH",
  "tsh ultra": "TSH",
  "tsh us": "TSH",
  "tsh ultrasensible": "TSH",

  // T3 Libre
  "t3 libre": "T3L",
  "t3l": "T3L",
  "ft3": "T3L",
  "free t3": "T3L",
  "triiodothyronine libre": "T3L",

  // T4 Libre
  "t4 libre": "T4L",
  "t4l": "T4L",
  "ft4": "T4L",
  "free t4": "T4L",
  "thyroxine libre": "T4L",

  // ==========================================
  // IONOGRAMME
  // ==========================================

  // Sodium
  "sodium": "NA",
  "na": "NA",
  "na+": "NA",
  "natremie": "NA",
  "natrémie": "NA",

  // Potassium
  "potassium": "K",
  "k": "K",
  "k+": "K",
  "kaliemie": "K",
  "kaliémie": "K",

  // Chlore
  "chlorures": "CL",
  "chlore": "CL",
  "cl": "CL",
  "cl-": "CL",
  "chloremie": "CL",
  "chlorémie": "CL",

  // Calcium
  "calcium": "CA",
  "ca": "CA",
  "ca2+": "CA",
  "calcemie": "CA",
  "calcémie": "CA",
  "calcium total": "CA",

  // Phosphore
  "phosphore": "P",
  "phosphoremie": "P",
  "phosphorémie": "P",
  "phosphates": "P",

  // Magnésium
  "magnesium": "MG",
  "magnésium": "MG",
  "mg": "MG",
  "mg2+": "MG",
  "magnesemie": "MG",
  "magnésémie": "MG",

  // ==========================================
  // BILAN HÉPATIQUE
  // ==========================================

  // ALAT
  "alat": "ALAT",
  "sgpt": "ALAT",
  "alat (sgpt)": "ALAT",
  "gpt": "ALAT",
  "alanine aminotransferase": "ALAT",

  // ASAT
  "asat": "ASAT",
  "sgot": "ASAT",
  "asat (sgot)": "ASAT",
  "got": "ASAT",
  "aspartate aminotransferase": "ASAT",

  // GGT
  "ggt": "GGT",
  "gamma gt": "GGT",
  "gamma-gt": "GGT",
  "gamma glutamyl transferase": "GGT",
  "γ-gt": "GGT",

  // Bilirubine
  "bilirubine totale": "BILI",
  "bilirubine": "BILI",
  "bili totale": "BILI",

  // PAL
  "phosphatases alcalines": "PAL",
  "pal": "PAL",
  "phosphatase alcaline": "PAL",
  "alkaline phosphatase": "PAL",

  // ==========================================
  // BILAN RÉNAL
  // ==========================================

  // Créatinine
  "creatinine": "CREAT",
  "créatinine": "CREAT",
  "creat": "CREAT",

  // Urée
  "uree": "UREE",
  "urée": "UREE",
  "azote ureique": "UREE",
  "bun": "UREE",

  // Acide urique
  "acide urique": "URIC",
  "uricemie": "URIC",
  "uricémie": "URIC",

  // ==========================================
  // BILAN LIPIDIQUE
  // ==========================================

  // Cholestérol
  "cholesterol total": "CHOL",
  "cholestérol total": "CHOL",
  "cholesterol": "CHOL",
  "cholestérol": "CHOL",
  "ct": "CHOL",

  // Triglycérides
  "triglycerides": "TG",
  "triglycérides": "TG",
  "tg": "TG",

  // HDL
  "hdl cholesterol": "HDL",
  "hdl-cholesterol": "HDL",
  "hdl": "HDL",
  "bon cholesterol": "HDL",

  // LDL
  "ldl cholesterol": "LDL",
  "ldl-cholesterol": "LDL",
  "ldl": "LDL",
  "mauvais cholesterol": "LDL",

  // ==========================================
  // BILAN MÉTABOLIQUE
  // ==========================================

  // Glycémie
  "glycemie a jeun": "GLY",
  "glycémie à jeun": "GLY",
  "glycemie": "GLY",
  "glycémie": "GLY",
  "glucose": "GLY",
  "glycemie capillaire": "GLY",

  // HbA1c
  "hemoglobine glyquee": "HBA1C",
  "hémoglobine glyquée": "HBA1C",
  "hba1c": "HBA1C",
  "hb a1c": "HBA1C",
  "a1c": "HBA1C",

  // ==========================================
  // MARQUEURS INFLAMMATOIRES
  // ==========================================

  // CRP
  "proteine c reactive": "CRP",
  "protéine c réactive": "CRP",
  "crp": "CRP",
  "crp us": "CRP",
  "crp ultrasensible": "CRP",

  // Ferritine
  "ferritine": "FERRITINE",
  "ferritinemie": "FERRITINE",
  "ferritinémie": "FERRITINE",

  // ==========================================
  // MARQUEURS OSSEUX
  // ==========================================

  // Ostéocalcine
  "osteocalcine": "OSTEO",
  "ostéocalcine": "OSTEO",

  // PAO (Phosphatase Alcaline Osseuse)
  "phosphatase alcaline osseuse": "PAOI",
  "pao": "PAOI",
  "paoi": "PAOI",

  // ==========================================
  // MARQUEURS TUMORAUX
  // ==========================================

  "ace": "ACE",
  "antigene carcino embryonnaire": "ACE",
  "ca 19-9": "CA19_9",
  "ca19-9": "CA19_9",
  "ca 15-3": "CA15_3",
  "ca15-3": "CA15_3",
  "ca-125": "CA125",
  "ca125": "CA125",
  "psa": "PSA",
  "psa total": "PSA",
};

/**
 * Normalise un nom de biomarqueur pour le matching
 * - Lowercase
 * - Supprime les accents
 * - Supprime les caractères spéciaux inutiles
 * - Normalise les espaces
 */
export function normalizeLabName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/\([^)]*\)/g, "") // Supprime contenu entre parenthèses
    .replace(/[()]/g, "") // Supprime parenthèses restantes
    .replace(/\s+/g, " ") // Normalise espaces
    .replace(/[.:,;]/g, "") // Supprime ponctuation
    .trim();
}

/**
 * Trouve le code système IntegrIA correspondant à un nom de labo
 * @param labName Nom tel qu'il apparaît sur le PDF labo
 * @returns Code système (ex: "TSH") ou null si non trouvé
 */
export function findBiomarkerCode(labName: string): string | null {
  const normalized = normalizeLabName(labName);

  // Recherche exacte
  if (LAB_SYNONYMS[normalized]) {
    return LAB_SYNONYMS[normalized];
  }

  // Recherche partielle (le nom labo contient un de nos synonymes)
  for (const [synonym, code] of Object.entries(LAB_SYNONYMS)) {
    if (normalized.includes(synonym) || synonym.includes(normalized)) {
      return code;
    }
  }

  return null;
}

/**
 * Retourne tous les synonymes connus pour un code biomarqueur
 * Utile pour l'UI de réconciliation
 */
export function getSynonymsForCode(code: string): string[] {
  return Object.entries(LAB_SYNONYMS)
    .filter(([_, c]) => c === code)
    .map(([synonym]) => synonym);
}
