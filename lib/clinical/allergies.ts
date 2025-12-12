/**
 * RÉFÉRENTIEL DES ALLERGIES
 * ==========================
 *
 * Liste des allergènes courants organisée par catégorie :
 * - DRUG : Médicamenteuses
 * - FOOD : Alimentaires
 * - ENVIRONMENT : Environnement (acariens, pollens...)
 * - CONTACT : Contact (nickel, latex...)
 * - OTHER : Autres
 */

import { z } from "zod";

// ==========================================
// TYPES DE BASE
// ==========================================

export type AllergyCategory =
  | "DRUG"
  | "FOOD"
  | "ENVIRONMENT"
  | "CONTACT"
  | "OTHER";

export const ALLERGY_CATEGORY_LABELS: Record<AllergyCategory, string> = {
  DRUG: "Médicament",
  FOOD: "Aliment",
  ENVIRONMENT: "Environnement",
  CONTACT: "Contact",
  OTHER: "Autre",
};

export const ALLERGY_CATEGORY_COLORS: Record<AllergyCategory, string> = {
  DRUG: "#ef4444",      // Rouge
  FOOD: "#f59e0b",      // Amber
  ENVIRONMENT: "#10b981", // Emerald
  CONTACT: "#8b5cf6",   // Violet
  OTHER: "#6b7280",     // Gray
};

// ==========================================
// DÉFINITION D'UN ALLERGÈNE
// ==========================================

export interface AllergyDefinition {
  id: string;           // ex: "PENICILLINE"
  label: string;        // ex: "Pénicilline"
  synonyms: string[];   // pour la recherche
  category: AllergyCategory;
}

// ==========================================
// LISTE DES ALLERGÈNES
// ==========================================

export const ALLERGY_DEFINITIONS: AllergyDefinition[] = [
  // =====================
  // MÉDICAMENTEUSES
  // =====================
  {
    id: "PENICILLINE",
    label: "Pénicilline",
    synonyms: ["penicilline", "pénicilline", "beta-lactamine", "amoxicilline", "augmentin", "clamoxyl"],
    category: "DRUG",
  },
  {
    id: "CEPHALOSPORINES",
    label: "Céphalosporines",
    synonyms: ["cephalosporine", "céphalosporine", "ceftriaxone", "cefazoline", "oracefal"],
    category: "DRUG",
  },
  {
    id: "AINS",
    label: "Anti-inflammatoires non stéroïdiens (AINS)",
    synonyms: ["ains", "ibuprofène", "ibuprofene", "ketoprofene", "diclofénac", "anti inflammatoire", "advil", "nurofen", "voltarene"],
    category: "DRUG",
  },
  {
    id: "ASPIRINE",
    label: "Aspirine",
    synonyms: ["aspirine", "acide acétylsalicylique", "aspro", "aspégic"],
    category: "DRUG",
  },
  {
    id: "SULFAMIDES",
    label: "Sulfamides",
    synonyms: ["sulfamide", "cotrimoxazole", "bactrim", "sulfaméthoxazole"],
    category: "DRUG",
  },
  {
    id: "QUINOLONES",
    label: "Quinolones / Fluoroquinolones",
    synonyms: ["quinolone", "fluoroquinolone", "ciprofloxacine", "ofloxacine", "levofloxacine"],
    category: "DRUG",
  },
  {
    id: "MACROLIDES",
    label: "Macrolides",
    synonyms: ["macrolide", "azithromycine", "clarithromycine", "erythromycine", "zithromax"],
    category: "DRUG",
  },
  {
    id: "PARACETAMOL",
    label: "Paracétamol",
    synonyms: ["paracétamol", "paracetamol", "doliprane", "efferalgan", "dafalgan"],
    category: "DRUG",
  },
  {
    id: "MORPHINIQUES",
    label: "Morphiniques / Opioïdes",
    synonyms: ["morphine", "codéine", "codeine", "tramadol", "oxycodone", "opioide"],
    category: "DRUG",
  },
  {
    id: "PRODUITS_CONTRASTE",
    label: "Produits de contraste iodés",
    synonyms: ["iode", "produit de contraste", "scanner", "IRM", "contraste iodé"],
    category: "DRUG",
  },
  {
    id: "ANESTHESIQUES_LOCAUX",
    label: "Anesthésiques locaux",
    synonyms: ["lidocaïne", "lidocaine", "xylocaïne", "anesthésique local"],
    category: "DRUG",
  },
  {
    id: "CURARES",
    label: "Curares",
    synonyms: ["curare", "rocuronium", "suxaméthonium", "anesthésie générale"],
    category: "DRUG",
  },

  // =====================
  // ALIMENTAIRES
  // =====================
  {
    id: "ARACHIDES",
    label: "Arachides",
    synonyms: ["arachide", "cacahuète", "cacahuete", "peanut", "beurre de cacahuète"],
    category: "FOOD",
  },
  {
    id: "FRUITS_COQUES",
    label: "Fruits à coque",
    synonyms: ["noix", "noisette", "amande", "pistache", "noix de cajou", "noix du brésil", "noix de pécan", "macadamia"],
    category: "FOOD",
  },
  {
    id: "GLUTEN",
    label: "Gluten",
    synonyms: ["gluten", "blé", "ble", "seigle", "orge", "avoine", "céréales"],
    category: "FOOD",
  },
  {
    id: "LAIT_VACHE",
    label: "Protéines de lait de vache",
    synonyms: ["lait", "lait de vache", "PLV", "lactose", "caséine", "lactosérum"],
    category: "FOOD",
  },
  {
    id: "OEUF",
    label: "Œuf",
    synonyms: ["oeuf", "œuf", "blanc d'oeuf", "jaune d'oeuf", "ovalbumine"],
    category: "FOOD",
  },
  {
    id: "FRUITS_MER",
    label: "Fruits de mer / Crustacés",
    synonyms: ["crevette", "moule", "fruit de mer", "crustacés", "homard", "crabe", "langouste", "huître"],
    category: "FOOD",
  },
  {
    id: "POISSON",
    label: "Poisson",
    synonyms: ["poisson", "thon", "saumon", "cabillaud", "sardine"],
    category: "FOOD",
  },
  {
    id: "SOJA",
    label: "Soja",
    synonyms: ["soja", "soya", "lécithine de soja", "tofu"],
    category: "FOOD",
  },
  {
    id: "SESAME",
    label: "Sésame",
    synonyms: ["sésame", "sesame", "graines de sésame", "tahini"],
    category: "FOOD",
  },
  {
    id: "MOUTARDE",
    label: "Moutarde",
    synonyms: ["moutarde", "graine de moutarde"],
    category: "FOOD",
  },
  {
    id: "CELERI",
    label: "Céleri",
    synonyms: ["céleri", "celeri", "céleri-rave"],
    category: "FOOD",
  },
  {
    id: "LUPIN",
    label: "Lupin",
    synonyms: ["lupin", "farine de lupin"],
    category: "FOOD",
  },
  {
    id: "MOLLUSQUES",
    label: "Mollusques",
    synonyms: ["mollusque", "escargot", "calamar", "seiche", "poulpe"],
    category: "FOOD",
  },
  {
    id: "SULFITES",
    label: "Sulfites",
    synonyms: ["sulfite", "sulfites", "vin", "conservateurs"],
    category: "FOOD",
  },
  {
    id: "KIWI",
    label: "Kiwi",
    synonyms: ["kiwi"],
    category: "FOOD",
  },
  {
    id: "BANANE",
    label: "Banane",
    synonyms: ["banane"],
    category: "FOOD",
  },
  {
    id: "AVOCAT",
    label: "Avocat",
    synonyms: ["avocat"],
    category: "FOOD",
  },

  // =====================
  // ENVIRONNEMENT
  // =====================
  {
    id: "ACARIENS",
    label: "Acariens",
    synonyms: ["acariens", "poussière", "poussière de maison", "dermatophagoides"],
    category: "ENVIRONMENT",
  },
  {
    id: "POLLEN_GRAMINEES",
    label: "Pollens de graminées",
    synonyms: ["pollen", "graminées", "foin", "rhume des foins", "pollinose"],
    category: "ENVIRONMENT",
  },
  {
    id: "POLLEN_ARBRES",
    label: "Pollens d'arbres",
    synonyms: ["bouleau", "cyprès", "olivier", "platane", "chêne", "frêne"],
    category: "ENVIRONMENT",
  },
  {
    id: "POLLEN_HERBACEES",
    label: "Pollens d'herbacées",
    synonyms: ["ambroisie", "armoise", "plantain", "pariétaire"],
    category: "ENVIRONMENT",
  },
  {
    id: "MOISISSURES",
    label: "Moisissures",
    synonyms: ["moisissure", "aspergillus", "alternaria", "cladosporium", "champignon"],
    category: "ENVIRONMENT",
  },
  {
    id: "CHAT",
    label: "Poils de chat",
    synonyms: ["chat", "poils de chat", "squames de chat", "fel d1"],
    category: "ENVIRONMENT",
  },
  {
    id: "CHIEN",
    label: "Poils de chien",
    synonyms: ["chien", "poils de chien", "squames de chien"],
    category: "ENVIRONMENT",
  },
  {
    id: "CHEVAL",
    label: "Poils de cheval",
    synonyms: ["cheval", "équidés"],
    category: "ENVIRONMENT",
  },
  {
    id: "BLATTES",
    label: "Blattes / Cafards",
    synonyms: ["blatte", "cafard", "cockroach"],
    category: "ENVIRONMENT",
  },
  {
    id: "VENIN_HYMENOPTERES",
    label: "Venins d'hyménoptères",
    synonyms: ["abeille", "guêpe", "frelon", "bourdon", "piqûre", "venin"],
    category: "ENVIRONMENT",
  },

  // =====================
  // CONTACT
  // =====================
  {
    id: "LATEX",
    label: "Latex",
    synonyms: ["latex", "gants latex", "caoutchouc naturel"],
    category: "CONTACT",
  },
  {
    id: "NICKEL",
    label: "Nickel",
    synonyms: ["nickel", "bijoux fantaisie", "boutons de jean", "métal"],
    category: "CONTACT",
  },
  {
    id: "CHROME",
    label: "Chrome",
    synonyms: ["chrome", "ciment", "cuir tanné"],
    category: "CONTACT",
  },
  {
    id: "COBALT",
    label: "Cobalt",
    synonyms: ["cobalt", "pigments", "vitamine B12"],
    category: "CONTACT",
  },
  {
    id: "PARFUMS",
    label: "Parfums / Fragances",
    synonyms: ["parfum", "fragrance", "cosmétique", "déodorant"],
    category: "CONTACT",
  },
  {
    id: "COLOPHANE",
    label: "Colophane",
    synonyms: ["colophane", "résine de pin", "adhésifs", "pansements"],
    category: "CONTACT",
  },
  {
    id: "PPD",
    label: "Paraphénylènediamine (PPD)",
    synonyms: ["ppd", "teinture cheveux", "coloration capillaire", "henné noir"],
    category: "CONTACT",
  },
  {
    id: "FORMALDEHYDE",
    label: "Formaldéhyde",
    synonyms: ["formaldéhyde", "formol", "vernis à ongles", "résines"],
    category: "CONTACT",
  },
];

// ==========================================
// SCHÉMAS ZOD
// ==========================================

export const AllergySeveritySchema = z.enum(["MILD", "MODERATE", "SEVERE"]);
export type AllergySeverity = z.infer<typeof AllergySeveritySchema>;

export const ALLERGY_SEVERITY_LABELS: Record<AllergySeverity, string> = {
  MILD: "Légère",
  MODERATE: "Modérée",
  SEVERE: "Sévère",
};

export const ALLERGY_SEVERITY_COLORS: Record<AllergySeverity, string> = {
  MILD: "#22c55e",      // Vert
  MODERATE: "#f59e0b",  // Orange
  SEVERE: "#ef4444",    // Rouge
};

export const PatientAllergySchema = z.object({
  id: z.string(),
  allergyId: z.string().optional(),   // si issu du référentiel
  label: z.string().min(1),           // toujours rempli
  isFreeText: z.boolean(),
  reaction: z.string().optional(),    // ex: "Urticaire", "Anaphylaxie"
  severity: AllergySeveritySchema.optional(),
  notedAt: z.string().datetime().optional(),
});

export type PatientAllergyEntry = z.infer<typeof PatientAllergySchema>;

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

/**
 * Générer un UUID compatible navigateur
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Recherche intelligente dans les allergènes
 */
export function searchAllergies(query: string, limit: number = 10): AllergyDefinition[] {
  if (!query || query.length < 1) {
    // Retourner les plus courants par défaut
    return ALLERGY_DEFINITIONS.slice(0, limit);
  }

  const normalizedQuery = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const scored = ALLERGY_DEFINITIONS.map((allergy) => {
    let score = 0;

    const normalizedLabel = allergy.label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Label exact ou commence par
    if (normalizedLabel.startsWith(normalizedQuery)) {
      score = 150;
    } else if (normalizedLabel.includes(normalizedQuery)) {
      score = 100;
    }

    // Synonymes
    for (const syn of allergy.synonyms) {
      const normalizedSyn = syn
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (normalizedSyn.startsWith(normalizedQuery)) {
        score = Math.max(score, 120);
      } else if (normalizedSyn.includes(normalizedQuery)) {
        score = Math.max(score, 80);
      }
    }

    return { ...allergy, score };
  })
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

/**
 * Obtenir un allergène par son ID
 */
export function getAllergyById(id: string): AllergyDefinition | undefined {
  return ALLERGY_DEFINITIONS.find((a) => a.id === id);
}

/**
 * Créer une nouvelle entrée allergie depuis le référentiel
 */
export function createAllergyEntry(
  allergyId: string,
  label: string
): PatientAllergyEntry {
  return {
    id: generateUUID(),
    allergyId,
    label,
    isFreeText: false,
    notedAt: new Date().toISOString(),
  };
}

/**
 * Créer une nouvelle entrée allergie en texte libre
 */
export function createFreeTextAllergyEntry(label: string): PatientAllergyEntry {
  return {
    id: generateUUID(),
    label,
    isFreeText: true,
    notedAt: new Date().toISOString(),
  };
}

/**
 * Obtenir les allergies par catégorie
 */
export function getAllergiesByCategory(category: AllergyCategory): AllergyDefinition[] {
  return ALLERGY_DEFINITIONS.filter((a) => a.category === category);
}
