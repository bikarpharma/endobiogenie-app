// ========================================
// MATIÈRE MÉDICALE ENDOBIOGÉNIQUE COMPLÈTE
// ========================================
// Sources: 4 Volumes "La Théorie de l'Endobiogénie" - Lapraz & Hedayat
//
// Volume 2: Phytothérapie par axe neuroendocrinien
// Volume 3: Applications cliniques et tables de référence
// Volume 4: Cas cliniques et protocoles
//
// STRUCTURE:
// 1. DRAINAGE (émonctoires)
// 2. AXE CORTICOTROPE (adaptogènes, surrénales)
// 3. AXE THYRÉOTROPE (métabolisme)
// 4. AXE GONADOTROPE (hormones sexuelles)
// 5. SNA (système nerveux autonome)
// 6. AXE SOMATOTROPE (croissance)
// 7. GEMMOTHÉRAPIE (bourgeons)
// 8. AROMATHÉRAPIE (huiles essentielles)

// ========================================
// TYPES
// ========================================

export interface PlanteEndobiogenique {
  id: string;
  nomLatin: string;
  nomFrancais: string;
  famille: string;

  // Actions neuroendocriniennes (Volume 2, Tables 5.1-5.22)
  actionsNeuroendocrines: ActionNeuroendocrine[];

  // Indications par axe
  axesCibles: AxeCible[];

  // Formes galéniques disponibles
  formes: FormeGalenique[];

  // Sécurité
  contreIndications: string[];
  interactions: string[];
  precautions: string[];

  // Métadonnées
  sourceVolume: string;
  pageReference?: string;
}

export interface ActionNeuroendocrine {
  action: string;
  mecanisme: string;
  intensite: 1 | 2 | 3; // 1 = léger, 2 = modéré, 3 = fort
}

export interface AxeCible {
  axe: AxeEndobiogenique;
  indication: "insuffisance" | "sur_sollicitation" | "regulation" | "drainage";
  priorite: 1 | 2 | 3; // 1 = premier choix
}

export type AxeEndobiogenique =
  | "corticotrope"
  | "thyreotrope"
  | "gonadotrope_F"
  | "gonadotrope_H"
  | "sna_alpha"
  | "sna_beta"
  | "sna_parasympathique"
  | "somatotrope"
  | "drainage_hepatique"
  | "drainage_renal"
  | "drainage_lymphatique"
  | "drainage_intestinal"
  | "immuno_inflammation";

export interface FormeGalenique {
  forme: "TM" | "EPS" | "SIPF" | "Infusion" | "Décoction" | "Poudre" | "Gélule";
  posologie: string;
  duree: string;
}

export interface BourgeonsGemmotherapie {
  id: string;
  nomLatin: string;
  nomFrancais: string;
  macerat: string; // Ex: "MG D1"

  // Actions spécifiques gemmothérapie
  tropisme: string[]; // Organes/systèmes cibles
  actionsEndocrines: string[];

  // Indications
  axesCibles: AxeCible[];

  posologie: {
    adulte: string;
    enfant?: string;
  };

  contreIndications: string[];
  sourceVolume: string;
}

// ========================================
// 1. PLANTES DE DRAINAGE (Volume 2, p.169-200)
// ========================================

export const PLANTES_DRAINAGE: PlanteEndobiogenique[] = [
  // --- DRAINAGE HÉPATIQUE ---
  {
    id: "taraxacum",
    nomLatin: "Taraxacum officinale",
    nomFrancais: "Pissenlit",
    famille: "Asteraceae",
    actionsNeuroendocrines: [
      { action: "Cholérétique", mecanisme: "Stimule sécrétion biliaire", intensite: 3 },
      { action: "Cholagogue", mecanisme: "Favorise évacuation bile", intensite: 3 },
      { action: "Diurétique", mecanisme: "Élimine déchets azotés", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "drainage", priorite: 1 },
      { axe: "drainage_renal", indication: "drainage", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin à jeun", duree: "21 jours" },
      { forme: "TM", posologie: "50 gouttes 2x/jour", duree: "21 jours" },
      { forme: "Infusion", posologie: "1 c.s. racine/tasse, 2-3 tasses/jour", duree: "14-21 jours" }
    ],
    contreIndications: ["Obstruction biliaire", "Calculs biliaires symptomatiques"],
    interactions: ["Lithium (diurétique)", "Antibiotiques quinolones"],
    precautions: ["Allergie aux Astéracées"],
    sourceVolume: "Volume 2",
    pageReference: "p.174-176"
  },
  {
    id: "carduus_marianus",
    nomLatin: "Silybum marianum",
    nomFrancais: "Chardon-Marie",
    famille: "Asteraceae",
    actionsNeuroendocrines: [
      { action: "Hépatoprotecteur", mecanisme: "Silymarine régénère hépatocytes", intensite: 3 },
      { action: "Antioxydant hépatique", mecanisme: "Piège radicaux libres", intensite: 3 },
      { action: "Anti-fibrotique", mecanisme: "Réduit fibrose hépatique", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "insuffisance", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin et soir", duree: "30-60 jours" },
      { forme: "Gélule", posologie: "200-400 mg silymarine/jour", duree: "2-3 mois" }
    ],
    contreIndications: [],
    interactions: ["Substrats CYP3A4 (possible)"],
    precautions: ["Allergie aux Astéracées"],
    sourceVolume: "Volume 2",
    pageReference: "p.177-179"
  },
  {
    id: "cynara",
    nomLatin: "Cynara scolymus",
    nomFrancais: "Artichaut",
    famille: "Asteraceae",
    actionsNeuroendocrines: [
      { action: "Cholérétique majeur", mecanisme: "Cynarine stimule bile", intensite: 3 },
      { action: "Hypocholestérolémiant", mecanisme: "Inhibe HMG-CoA réductase", intensite: 2 },
      { action: "Hépatoprotecteur", mecanisme: "Protège membrane hépatocyte", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "drainage", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL avant repas midi et soir", duree: "21-30 jours" },
      { forme: "TM", posologie: "30-50 gouttes avant repas", duree: "21 jours" }
    ],
    contreIndications: ["Obstruction biliaire", "Allergie Astéracées"],
    interactions: [],
    precautions: ["Allaitement (réduit lactation)"],
    sourceVolume: "Volume 2",
    pageReference: "p.180-181"
  },
  {
    id: "chelidonium",
    nomLatin: "Chelidonium majus",
    nomFrancais: "Chélidoine",
    famille: "Papaveraceae",
    actionsNeuroendocrines: [
      { action: "Spasmolytique biliaire", mecanisme: "Relaxe sphincter d'Oddi", intensite: 3 },
      { action: "Cholérétique doux", mecanisme: "Stimule flux biliaire", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "sur_sollicitation", priorite: 2 }
    ],
    formes: [
      { forme: "TM", posologie: "15-30 gouttes 3x/jour", duree: "14-21 jours" }
    ],
    contreIndications: ["Grossesse", "Allaitement", "Obstruction biliaire"],
    interactions: [],
    precautions: ["Hépatotoxicité si surdosage", "Usage court"],
    sourceVolume: "Volume 2",
    pageReference: "p.182"
  },

  // --- DRAINAGE RÉNAL ---
  {
    id: "orthosiphon",
    nomLatin: "Orthosiphon stamineus",
    nomFrancais: "Thé de Java",
    famille: "Lamiaceae",
    actionsNeuroendocrines: [
      { action: "Diurétique aquarétique", mecanisme: "Augmente diurèse sans perte K+", intensite: 3 },
      { action: "Uricosurique", mecanisme: "Élimine acide urique", intensite: 2 },
      { action: "Hypotenseur léger", mecanisme: "Diminue volémie", intensite: 1 }
    ],
    axesCibles: [
      { axe: "drainage_renal", indication: "drainage", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin et midi", duree: "21 jours" },
      { forme: "Infusion", posologie: "2-3 g/tasse, 3 tasses/jour", duree: "21 jours" }
    ],
    contreIndications: ["Insuffisance rénale sévère", "Œdème cardiaque"],
    interactions: ["Diurétiques (potentialisation)"],
    precautions: ["Boire beaucoup d'eau"],
    sourceVolume: "Volume 2",
    pageReference: "p.186-187"
  },
  {
    id: "solidago",
    nomLatin: "Solidago virgaurea",
    nomFrancais: "Verge d'or",
    famille: "Asteraceae",
    actionsNeuroendocrines: [
      { action: "Diurétique anti-inflammatoire", mecanisme: "Draine + calme inflammation urinaire", intensite: 3 },
      { action: "Antiseptique urinaire", mecanisme: "Antibactérien voies urinaires", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_renal", indication: "drainage", priorite: 1 },
      { axe: "immuno_inflammation", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "21 jours" },
      { forme: "TM", posologie: "50 gouttes 3x/jour", duree: "21 jours" }
    ],
    contreIndications: ["Insuffisance rénale sévère"],
    interactions: [],
    precautions: ["Allergie Astéracées"],
    sourceVolume: "Volume 2",
    pageReference: "p.188-189"
  },
  {
    id: "pilosella",
    nomLatin: "Hieracium pilosella",
    nomFrancais: "Piloselle",
    famille: "Asteraceae",
    actionsNeuroendocrines: [
      { action: "Diurétique puissant", mecanisme: "Double volume urinaire", intensite: 3 },
      { action: "Déchlorurant", mecanisme: "Élimine chlorures", intensite: 2 },
      { action: "Antibactérien", mecanisme: "Actif sur Brucella", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_renal", indication: "drainage", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2-3x/jour", duree: "14-21 jours" },
      { forme: "TM", posologie: "50 gouttes 3x/jour", duree: "14 jours" }
    ],
    contreIndications: ["Insuffisance rénale"],
    interactions: ["Diurétiques de l'anse"],
    precautions: ["Compenser pertes hydriques"],
    sourceVolume: "Volume 2",
    pageReference: "p.190"
  },

  // --- DRAINAGE LYMPHATIQUE ---
  {
    id: "galium",
    nomLatin: "Galium aparine",
    nomFrancais: "Gaillet gratteron",
    famille: "Rubiaceae",
    actionsNeuroendocrines: [
      { action: "Lymphatique majeur", mecanisme: "Stimule circulation lymphe", intensite: 3 },
      { action: "Diurétique", mecanisme: "Favorise élimination", intensite: 2 },
      { action: "Anti-tumoral", mecanisme: "Draineur tissus conjonctifs", intensite: 1 }
    ],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "drainage", priorite: 1 }
    ],
    formes: [
      { forme: "TM", posologie: "30-50 gouttes 3x/jour", duree: "21-30 jours" },
      { forme: "Infusion", posologie: "2-4 g/tasse, 3 tasses/jour", duree: "21 jours" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: [],
    sourceVolume: "Volume 2",
    pageReference: "p.192-193"
  },
  {
    id: "phytolacca",
    nomLatin: "Phytolacca decandra",
    nomFrancais: "Raisin d'Amérique",
    famille: "Phytolaccaceae",
    actionsNeuroendocrines: [
      { action: "Lymphokinétique", mecanisme: "Active circulation lymphatique", intensite: 3 },
      { action: "Anti-inflammatoire", mecanisme: "Réduit congestion ganglions", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "sur_sollicitation", priorite: 1 }
    ],
    formes: [
      { forme: "TM", posologie: "10-15 gouttes 2-3x/jour MAX", duree: "14 jours max" }
    ],
    contreIndications: ["Grossesse", "Allaitement", "Enfants"],
    interactions: [],
    precautions: ["TOXIQUE à forte dose", "Usage court uniquement"],
    sourceVolume: "Volume 2",
    pageReference: "p.194"
  }
];

// ========================================
// 2. PLANTES AXE CORTICOTROPE (Volume 2, p.89-130)
// ========================================

export const PLANTES_CORTICOTROPE: PlanteEndobiogenique[] = [
  // --- ADAPTOGÈNES (soutien surrénalien) ---
  {
    id: "eleutherococcus",
    nomLatin: "Eleutherococcus senticosus",
    nomFrancais: "Éleuthérocoque",
    famille: "Araliaceae",
    actionsNeuroendocrines: [
      { action: "Adaptogène majeur", mecanisme: "Module axe HPA, normalise cortisol", intensite: 3 },
      { action: "Tonique surrénalien", mecanisme: "Soutient fonction corticosurrénale", intensite: 3 },
      { action: "Immunomodulateur", mecanisme: "Régule réponse immunitaire", intensite: 2 }
    ],
    axesCibles: [
      { axe: "corticotrope", indication: "insuffisance", priorite: 1 },
      { axe: "corticotrope", indication: "regulation", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin", duree: "6-8 semaines" },
      { forme: "TM", posologie: "50 gouttes matin et midi", duree: "6-8 semaines" }
    ],
    contreIndications: ["HTA non contrôlée", "Insomnie sévère"],
    interactions: ["Digoxine", "Anticoagulants"],
    precautions: ["Éviter le soir", "Pause après 8 semaines"],
    sourceVolume: "Volume 2",
    pageReference: "p.95-98"
  },
  {
    id: "rhodiola",
    nomLatin: "Rhodiola rosea",
    nomFrancais: "Rhodiole",
    famille: "Crassulaceae",
    actionsNeuroendocrines: [
      { action: "Adaptogène", mecanisme: "Normalise cortisol, ↑ sérotonine/dopamine", intensite: 3 },
      { action: "Anti-fatigue", mecanisme: "Améliore performances physiques/mentales", intensite: 3 },
      { action: "Neuroprotecteur", mecanisme: "Protège neurones du stress oxydatif", intensite: 2 }
    ],
    axesCibles: [
      { axe: "corticotrope", indication: "sur_sollicitation", priorite: 1 },
      { axe: "corticotrope", indication: "insuffisance", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin (et midi si besoin)", duree: "4-6 semaines" },
      { forme: "Gélule", posologie: "200-400 mg rosavines/jour", duree: "6-8 semaines" }
    ],
    contreIndications: ["Trouble bipolaire", "Grossesse/allaitement"],
    interactions: ["IMAO", "Antidépresseurs"],
    precautions: ["Éviter le soir (stimulant)", "Commencer dose faible"],
    sourceVolume: "Volume 2",
    pageReference: "p.99-102"
  },
  {
    id: "glycyrrhiza",
    nomLatin: "Glycyrrhiza glabra",
    nomFrancais: "Réglisse",
    famille: "Fabaceae",
    actionsNeuroendocrines: [
      { action: "↑ Demi-vie cortisol", mecanisme: "Inhibe 11β-HSD → cortisol reste actif plus longtemps", intensite: 3 },
      { action: "Anti-inflammatoire", mecanisme: "Glycyrrhizine cortisol-like", intensite: 3 },
      { action: "↑ Aldostérone", mecanisme: "Rétention Na+, perte K+", intensite: 2 }
    ],
    axesCibles: [
      { axe: "corticotrope", indication: "insuffisance", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "2.5-5 mL matin", duree: "3-4 semaines max" },
      { forme: "Décoction", posologie: "2-4 g racine/jour", duree: "3 semaines max" }
    ],
    contreIndications: ["HTA", "Insuffisance cardiaque", "Hypokaliémie", "Grossesse"],
    interactions: ["Diurétiques", "Digitaliques", "Corticoïdes"],
    precautions: ["Surveiller tension", "Cures courtes", "Supplémenter K+ si besoin"],
    sourceVolume: "Volume 2",
    pageReference: "p.103-106"
  },
  {
    id: "withania",
    nomLatin: "Withania somnifera",
    nomFrancais: "Ashwagandha",
    famille: "Solanaceae",
    actionsNeuroendocrines: [
      { action: "Adaptogène calmant", mecanisme: "↓ Cortisol chroniquement élevé", intensite: 3 },
      { action: "Anxiolytique", mecanisme: "Effet GABA-ergique", intensite: 2 },
      { action: "Thyroïdien", mecanisme: "↑ T4 modérément", intensite: 2 }
    ],
    axesCibles: [
      { axe: "corticotrope", indication: "sur_sollicitation", priorite: 1 },
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL le soir", duree: "6-8 semaines" },
      { forme: "Gélule", posologie: "300-600 mg/jour", duree: "8 semaines" }
    ],
    contreIndications: ["Hyperthyroïdie", "Grossesse"],
    interactions: ["Sédatifs", "Hormones thyroïdiennes"],
    precautions: ["Solanacée - attention auto-immun"],
    sourceVolume: "Volume 2",
    pageReference: "p.107-110"
  },

  // --- α-SYMPATHOLYTIQUES (calme stress aigu) ---
  {
    id: "lavandula",
    nomLatin: "Lavandula angustifolia",
    nomFrancais: "Lavande vraie",
    famille: "Lamiaceae",
    actionsNeuroendocrines: [
      { action: "α-sympatholytique", mecanisme: "Réduit tonus α-adrénergique", intensite: 3 },
      { action: "Spasmolytique", mecanisme: "Relaxe muscles lisses", intensite: 2 },
      { action: "Anxiolytique", mecanisme: "Action centrale GABAergique", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 1 },
      { axe: "corticotrope", indication: "sur_sollicitation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL le soir", duree: "21-30 jours" },
      { forme: "TM", posologie: "50 gouttes 2-3x/jour", duree: "21 jours" },
      { forme: "Infusion", posologie: "1-2 c.c. fleurs/tasse, 2-3 tasses/jour", duree: "21 jours" }
    ],
    contreIndications: [],
    interactions: ["Sédatifs (potentialisation)"],
    precautions: [],
    sourceVolume: "Volume 2",
    pageReference: "p.112-114"
  },
  {
    id: "passiflora",
    nomLatin: "Passiflora incarnata",
    nomFrancais: "Passiflore",
    famille: "Passifloraceae",
    actionsNeuroendocrines: [
      { action: "α-sympatholytique", mecanisme: "↓ Tonus sympathique", intensite: 3 },
      { action: "Anxiolytique", mecanisme: "Fixation récepteurs GABA-A", intensite: 3 },
      { action: "Sédatif léger", mecanisme: "Facilite endormissement", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 1 },
      { axe: "corticotrope", indication: "sur_sollicitation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL le soir (ou 2.5 mL matin + soir)", duree: "21-30 jours" },
      { forme: "TM", posologie: "50 gouttes 2-3x/jour", duree: "21 jours" }
    ],
    contreIndications: [],
    interactions: ["Benzodiazépines", "Barbituriques"],
    precautions: ["Peut potentialiser sédatifs"],
    sourceVolume: "Volume 2",
    pageReference: "p.115-117"
  },
  {
    id: "valeriana",
    nomLatin: "Valeriana officinalis",
    nomFrancais: "Valériane",
    famille: "Caprifoliaceae",
    actionsNeuroendocrines: [
      { action: "Sédatif", mecanisme: "Agoniste GABA-A", intensite: 3 },
      { action: "Spasmolytique", mecanisme: "Relaxe muscles lisses", intensite: 2 },
      { action: "Hypnotique", mecanisme: "Améliore qualité sommeil", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL le soir", duree: "21-30 jours" },
      { forme: "TM", posologie: "50-100 gouttes au coucher", duree: "21 jours" }
    ],
    contreIndications: ["Insuffisance hépatique sévère"],
    interactions: ["Sédatifs", "Alcool"],
    precautions: ["Odeur forte", "Effet paradoxal possible chez certains"],
    sourceVolume: "Volume 2",
    pageReference: "p.118-120"
  }
];

// ========================================
// 3. PLANTES AXE THYRÉOTROPE (Volume 2, p.131-155)
// ========================================

export const PLANTES_THYREOTROPE: PlanteEndobiogenique[] = [
  // --- SOUTIEN THYROÏDIEN (hypothyroïdie fonctionnelle) ---
  {
    id: "fucus",
    nomLatin: "Fucus vesiculosus",
    nomFrancais: "Fucus",
    famille: "Fucaceae",
    actionsNeuroendocrines: [
      { action: "Apport iode", mecanisme: "Substrat synthèse T3/T4", intensite: 3 },
      { action: "Stimulant thyroïdien", mecanisme: "↑ Métabolisme basal", intensite: 2 },
      { action: "Coupe-faim", mecanisme: "Mucilages → satiété", intensite: 1 }
    ],
    axesCibles: [
      { axe: "thyreotrope", indication: "insuffisance", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin", duree: "Cure 21 jours, pause, reprendre" },
      { forme: "Gélule", posologie: "200-600 mg/jour", duree: "21 jours" }
    ],
    contreIndications: ["Hyperthyroïdie", "Hashimoto actif", "Allergie iode"],
    interactions: ["Hormones thyroïdiennes", "Lithium"],
    precautions: ["Doser TSH avant/pendant", "Éviter si nodules thyroïdiens"],
    sourceVolume: "Volume 2",
    pageReference: "p.136-138"
  },
  {
    id: "avena",
    nomLatin: "Avena sativa",
    nomFrancais: "Avoine",
    famille: "Poaceae",
    actionsNeuroendocrines: [
      { action: "Tonique nerveux", mecanisme: "Soutient système nerveux", intensite: 2 },
      { action: "Soutien thyroïdien indirect", mecanisme: "Améliore métabolisme via SNC", intensite: 2 },
      { action: "Nutritif", mecanisme: "Apport minéraux (Si, Mg, Fe)", intensite: 2 }
    ],
    axesCibles: [
      { axe: "thyreotrope", indication: "insuffisance", priorite: 2 },
      { axe: "sna_parasympathique", indication: "insuffisance", priorite: 1 }
    ],
    formes: [
      { forme: "TM", posologie: "50 gouttes matin et midi", duree: "30-60 jours" },
      { forme: "EPS", posologie: "5 mL matin", duree: "30 jours" }
    ],
    contreIndications: ["Maladie cœliaque (si non certifié sans gluten)"],
    interactions: [],
    precautions: [],
    sourceVolume: "Volume 2",
    pageReference: "p.139-140"
  },

  // --- FREINATEURS THYROÏDIENS (hyperthyroïdie fonctionnelle) ---
  {
    id: "lycopus",
    nomLatin: "Lycopus europaeus",
    nomFrancais: "Lycope",
    famille: "Lamiaceae",
    actionsNeuroendocrines: [
      { action: "Antithyroïdien", mecanisme: "↓ TSH et conversion T4→T3 périphérique", intensite: 3 },
      { action: "↓ Prolactine", mecanisme: "Freine hyperprolactinémie", intensite: 2 },
      { action: "Sédatif cardiaque", mecanisme: "Calme tachycardie thyroïdienne", intensite: 2 }
    ],
    axesCibles: [
      { axe: "thyreotrope", indication: "sur_sollicitation", priorite: 1 }
    ],
    formes: [
      { forme: "TM", posologie: "30-50 gouttes 3x/jour", duree: "Variable selon clinique" },
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "Surveillance thyroïdienne" }
    ],
    contreIndications: ["Hypothyroïdie", "Grossesse", "Allaitement"],
    interactions: ["Hormones thyroïdiennes"],
    precautions: ["Surveillance TSH obligatoire", "Ne pas arrêter brutalement"],
    sourceVolume: "Volume 2",
    pageReference: "p.142-144"
  },
  {
    id: "melissa",
    nomLatin: "Melissa officinalis",
    nomFrancais: "Mélisse",
    famille: "Lamiaceae",
    actionsNeuroendocrines: [
      { action: "Antithyroïdien doux", mecanisme: "Inhibe liaison TSH à récepteur", intensite: 2 },
      { action: "Anxiolytique", mecanisme: "GABAergique", intensite: 2 },
      { action: "Spasmolytique digestif", mecanisme: "Relaxe muscles lisses GI", intensite: 2 }
    ],
    axesCibles: [
      { axe: "thyreotrope", indication: "sur_sollicitation", priorite: 2 },
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2-3x/jour", duree: "21-30 jours" },
      { forme: "Infusion", posologie: "2-3 g feuilles/tasse, 3 tasses/jour", duree: "21 jours" }
    ],
    contreIndications: ["Hypothyroïdie"],
    interactions: ["Barbituriques (potentialisation)"],
    precautions: ["Surveiller fonction thyroïdienne si usage prolongé"],
    sourceVolume: "Volume 2",
    pageReference: "p.145-147"
  },
  {
    id: "leonurus",
    nomLatin: "Leonurus cardiaca",
    nomFrancais: "Agripaume",
    famille: "Lamiaceae",
    actionsNeuroendocrines: [
      { action: "Antithyroïdien", mecanisme: "↓ Activité thyroïdienne périphérique", intensite: 2 },
      { action: "β-bloquant naturel", mecanisme: "Calme tachycardie, tremblements", intensite: 3 },
      { action: "Sédatif cardiaque", mecanisme: "Régule rythme cardiaque", intensite: 3 }
    ],
    axesCibles: [
      { axe: "thyreotrope", indication: "sur_sollicitation", priorite: 1 },
      { axe: "sna_beta", indication: "sur_sollicitation", priorite: 1 }
    ],
    formes: [
      { forme: "TM", posologie: "30-50 gouttes 3x/jour", duree: "21-30 jours" },
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "21 jours" }
    ],
    contreIndications: ["Grossesse (utérotonique)", "Bradycardie"],
    interactions: ["β-bloquants", "Digoxine"],
    precautions: ["Emménagogue - attention cycles"],
    sourceVolume: "Volume 2",
    pageReference: "p.148-150"
  }
];

// ========================================
// 4. PLANTES AXE GONADOTROPE (Volume 2, p.156-195)
// ========================================

export const PLANTES_GONADOTROPE_FEMME: PlanteEndobiogenique[] = [
  // --- RÉGULATION CYCLE / SPM ---
  {
    id: "vitex",
    nomLatin: "Vitex agnus-castus",
    nomFrancais: "Gattilier",
    famille: "Lamiaceae",
    actionsNeuroendocrines: [
      { action: "↓ Prolactine", mecanisme: "Agoniste dopaminergique D2", intensite: 3 },
      { action: "↑ Progestérone relative", mecanisme: "Rééquilibre œstrogènes/progestérone", intensite: 3 },
      { action: "Régulateur cycle", mecanisme: "Normalise phase lutéale", intensite: 3 }
    ],
    axesCibles: [
      { axe: "gonadotrope_F", indication: "sur_sollicitation", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin à jeun", duree: "3-6 cycles" },
      { forme: "TM", posologie: "40-60 gouttes matin", duree: "3-6 mois" }
    ],
    contreIndications: ["Grossesse", "Allaitement", "Cancer hormonodépendant", "FIV/PMA"],
    interactions: ["Dopaminergiques", "Contraceptifs hormonaux"],
    precautions: ["Début en phase folliculaire", "Patience (effet en 2-3 cycles)"],
    sourceVolume: "Volume 2",
    pageReference: "p.160-163"
  },
  {
    id: "alchemilla",
    nomLatin: "Alchemilla vulgaris",
    nomFrancais: "Alchémille",
    famille: "Rosaceae",
    actionsNeuroendocrines: [
      { action: "Progestérone-like", mecanisme: "Mime action progestérone", intensite: 2 },
      { action: "Astringent utérin", mecanisme: "↓ Saignements excessifs", intensite: 3 },
      { action: "Anti-inflammatoire pelvien", mecanisme: "Calme congestion pelvienne", intensite: 2 }
    ],
    axesCibles: [
      { axe: "gonadotrope_F", indication: "regulation", priorite: 1 }
    ],
    formes: [
      { forme: "TM", posologie: "50 gouttes 2-3x/jour, phase lutéale", duree: "3 cycles" },
      { forme: "EPS", posologie: "5 mL/jour en phase lutéale", duree: "3 cycles" },
      { forme: "Infusion", posologie: "2-3 g/tasse, 2-3 tasses/jour", duree: "Phase lutéale" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: ["Usage préférentiel en 2ème partie de cycle"],
    sourceVolume: "Volume 2",
    pageReference: "p.164-166"
  },
  {
    id: "achillea",
    nomLatin: "Achillea millefolium",
    nomFrancais: "Achillée millefeuille",
    famille: "Asteraceae",
    actionsNeuroendocrines: [
      { action: "Emménagogue", mecanisme: "Régule flux menstruel", intensite: 2 },
      { action: "Antispasmodique utérin", mecanisme: "Calme dysménorrhées", intensite: 3 },
      { action: "Hémostatique", mecanisme: "↓ Ménorragies", intensite: 2 }
    ],
    axesCibles: [
      { axe: "gonadotrope_F", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "TM", posologie: "30-50 gouttes 3x/jour", duree: "Période menstruelle + 7 jours" },
      { forme: "Infusion", posologie: "2-3 g sommités/tasse, 2-3 tasses/jour", duree: "Selon besoin" }
    ],
    contreIndications: ["Grossesse", "Allergie Astéracées"],
    interactions: ["Anticoagulants (théorique)"],
    precautions: [],
    sourceVolume: "Volume 2",
    pageReference: "p.167-168"
  },

  // --- MÉNOPAUSE ---
  {
    id: "salvia_officinalis",
    nomLatin: "Salvia officinalis",
    nomFrancais: "Sauge officinale",
    famille: "Lamiaceae",
    actionsNeuroendocrines: [
      { action: "Œstrogène-like", mecanisme: "Phytoestrogènes fixent récepteurs ER", intensite: 3 },
      { action: "Anti-sudorifique", mecanisme: "↓ Bouffées de chaleur", intensite: 3 },
      { action: "Antiseptique", mecanisme: "Action antimicrobienne", intensite: 2 }
    ],
    axesCibles: [
      { axe: "gonadotrope_F", indication: "insuffisance", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin", duree: "21 jours, pause 7 jours, reprendre" },
      { forme: "Infusion", posologie: "1-2 g feuilles/tasse, 2-3 tasses/jour", duree: "21 jours" }
    ],
    contreIndications: ["Cancer sein/utérus/ovaire", "Grossesse", "Allaitement", "Épilepsie"],
    interactions: ["Anticonvulsivants"],
    precautions: ["Thuyone neurotoxique si surdosage HE"],
    sourceVolume: "Volume 2",
    pageReference: "p.170-172"
  },
  {
    id: "cimicifuga",
    nomLatin: "Actaea racemosa",
    nomFrancais: "Actée à grappes",
    famille: "Ranunculaceae",
    actionsNeuroendocrines: [
      { action: "SERM naturel", mecanisme: "Modulateur sélectif récepteurs œstrogènes", intensite: 3 },
      { action: "Anti-bouffées chaleur", mecanisme: "Action centrale hypothalamique", intensite: 3 },
      { action: "↓ LH", mecanisme: "Régule pics LH ménopause", intensite: 2 }
    ],
    axesCibles: [
      { axe: "gonadotrope_F", indication: "insuffisance", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin", duree: "3-6 mois" },
      { forme: "Gélule", posologie: "40-80 mg extrait/jour", duree: "3-6 mois" }
    ],
    contreIndications: ["Cancer hormonodépendant (précaution)", "Insuffisance hépatique"],
    interactions: ["Tamoxifène", "Statines"],
    precautions: ["Surveillance hépatique si usage prolongé"],
    sourceVolume: "Volume 2",
    pageReference: "p.173-175"
  }
];

export const PLANTES_GONADOTROPE_HOMME: PlanteEndobiogenique[] = [
  {
    id: "serenoa",
    nomLatin: "Serenoa repens",
    nomFrancais: "Palmier nain",
    famille: "Arecaceae",
    actionsNeuroendocrines: [
      { action: "Inhibiteur 5α-réductase", mecanisme: "↓ Conversion testostérone → DHT", intensite: 3 },
      { action: "Anti-œstrogénique", mecanisme: "↓ Aromatisation", intensite: 2 },
      { action: "Anti-inflammatoire prostatique", mecanisme: "↓ Congestion prostate", intensite: 3 }
    ],
    axesCibles: [
      { axe: "gonadotrope_H", indication: "sur_sollicitation", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin et soir", duree: "3-6 mois minimum" },
      { forme: "Gélule", posologie: "320 mg extrait lipidostérolique/jour", duree: "3-6 mois" }
    ],
    contreIndications: [],
    interactions: ["Finastéride (même cible)", "Anticoagulants (léger)"],
    precautions: ["PSA peut baisser (masquer cancer)", "Bilan prostate avant"],
    sourceVolume: "Volume 2",
    pageReference: "p.180-183"
  },
  {
    id: "urtica_radix",
    nomLatin: "Urtica dioica (racine)",
    nomFrancais: "Ortie racine",
    famille: "Urticaceae",
    actionsNeuroendocrines: [
      { action: "↓ SHBG", mecanisme: "Libère testostérone liée", intensite: 2 },
      { action: "Inhibiteur aromatase", mecanisme: "↓ Conversion testostérone → œstrogènes", intensite: 2 },
      { action: "Anti-HBP", mecanisme: "↓ Hyperplasie bénigne prostate", intensite: 2 }
    ],
    axesCibles: [
      { axe: "gonadotrope_H", indication: "regulation", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin et soir", duree: "3 mois" },
      { forme: "Gélule", posologie: "300-600 mg extrait racine/jour", duree: "3 mois" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: ["Utiliser la RACINE (pas feuilles pour cette indication)"],
    sourceVolume: "Volume 2",
    pageReference: "p.184-186"
  },
  {
    id: "tribulus",
    nomLatin: "Tribulus terrestris",
    nomFrancais: "Tribule terrestre",
    famille: "Zygophyllaceae",
    actionsNeuroendocrines: [
      { action: "↑ LH", mecanisme: "Stimule sécrétion LH hypophysaire", intensite: 2 },
      { action: "↑ Testostérone libre", mecanisme: "Augmente via LH", intensite: 2 },
      { action: "Pro-érectile", mecanisme: "↑ NO endothélial", intensite: 2 }
    ],
    axesCibles: [
      { axe: "gonadotrope_H", indication: "insuffisance", priorite: 1 }
    ],
    formes: [
      { forme: "Gélule", posologie: "250-750 mg extrait/jour", duree: "8-12 semaines" },
      { forme: "EPS", posologie: "5 mL matin", duree: "8 semaines" }
    ],
    contreIndications: ["Cancer prostate", "Cardiopathie sévère"],
    interactions: ["Antihypertenseurs", "Antidiabétiques"],
    precautions: ["Effet modeste, pas de miracle"],
    sourceVolume: "Volume 2",
    pageReference: "p.187-189"
  }
];

// ========================================
// 5. PLANTES SNA - SYSTÈME NERVEUX AUTONOME
// ========================================

export const PLANTES_SNA: PlanteEndobiogenique[] = [
  // --- β-BLOQUANTS NATURELS ---
  {
    id: "crataegus",
    nomLatin: "Crataegus monogyna/laevigata",
    nomFrancais: "Aubépine",
    famille: "Rosaceae",
    actionsNeuroendocrines: [
      { action: "β-bloquant naturel", mecanisme: "↓ Fréquence cardiaque", intensite: 2 },
      { action: "Inotrope positif", mecanisme: "↑ Force contraction (sans ↑ FC)", intensite: 2 },
      { action: "Anxiolytique cardiaque", mecanisme: "Calme cœur nerveux", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_beta", indication: "sur_sollicitation", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin et soir", duree: "30-60 jours" },
      { forme: "TM", posologie: "50 gouttes 3x/jour", duree: "30-60 jours" }
    ],
    contreIndications: [],
    interactions: ["β-bloquants", "Digoxine (prudence)"],
    precautions: ["Action lente, effet en 2-4 semaines"],
    sourceVolume: "Volume 2",
    pageReference: "p.122-125"
  },

  // --- TONIQUES PARASYMPATHIQUES ---
  {
    id: "fumaria",
    nomLatin: "Fumaria officinalis",
    nomFrancais: "Fumeterre",
    famille: "Papaveraceae",
    actionsNeuroendocrines: [
      { action: "Amphotère biliaire", mecanisme: "Régule flux biliaire (↑ si insuffisant, ↓ si excessif)", intensite: 3 },
      { action: "Parasympathomimétique", mecanisme: "↑ Tonus vagal digestif", intensite: 2 },
      { action: "Dépuratif", mecanisme: "Détoxifie peau et foie", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_parasympathique", indication: "regulation", priorite: 1 },
      { axe: "drainage_hepatique", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL avant repas", duree: "21 jours" },
      { forme: "TM", posologie: "30-50 gouttes avant repas", duree: "21 jours" }
    ],
    contreIndications: ["Glaucome à angle fermé (théorique)"],
    interactions: [],
    precautions: ["Cures courtes (alcaloïdes)"],
    sourceVolume: "Volume 2",
    pageReference: "p.126-128"
  },

  // --- SPASMOLYTIQUES ---
  {
    id: "matricaria",
    nomLatin: "Matricaria chamomilla",
    nomFrancais: "Camomille matricaire",
    famille: "Asteraceae",
    actionsNeuroendocrines: [
      { action: "Spasmolytique", mecanisme: "Relaxe muscles lisses GI", intensite: 3 },
      { action: "Anti-inflammatoire", mecanisme: "Chamazulène, bisabolol", intensite: 2 },
      { action: "Anxiolytique doux", mecanisme: "Apigénine fixe GABA-A", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 2 },
      { axe: "drainage_intestinal", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2-3x/jour", duree: "21 jours" },
      { forme: "Infusion", posologie: "2-3 g capitules/tasse, 3 tasses/jour", duree: "21 jours" }
    ],
    contreIndications: ["Allergie Astéracées"],
    interactions: ["Anticoagulants (léger)"],
    precautions: [],
    sourceVolume: "Volume 2",
    pageReference: "p.129-130"
  }
];

// ========================================
// 6. GEMMOTHÉRAPIE COMPLÈTE (25 bourgeons)
// Sources: Volume 2 + "Le grand livre de la gemmothérapie" - Laurine Pineau
// ========================================

export const BOURGEONS_GEMMOTHERAPIE: BourgeonsGemmotherapie[] = [
  // ============================================================
  // DRAINAGE
  // ============================================================
  {
    id: "betula_pubescens_mg",
    nomLatin: "Betula pubescens",
    nomFrancais: "Bouleau pubescent",
    macerat: "MG D1",
    tropisme: ["Rein", "Foie", "Articulations", "Peau", "Os"],
    actionsEndocrines: ["Drainage hépato-rénal", "↓ Acide urique", "Anti-inflammatoire", "Reminéralisant"],
    axesCibles: [
      { axe: "drainage_renal", indication: "drainage", priorite: 1 },
      { axe: "drainage_hepatique", indication: "drainage", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin", enfant: "1 goutte/10 kg" },
    contreIndications: ["Allergie bouleau/aspirine"],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  },
  {
    id: "juniperus_communis_mg",
    nomLatin: "Juniperus communis",
    nomFrancais: "Genévrier",
    macerat: "MG D1",
    tropisme: ["Foie", "Rein"],
    actionsEndocrines: ["Drainage foie-rein", "Détoxifiant hépatique majeur", "Régénérateur hépatocyte", "Hypoglycémiant"],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "drainage", priorite: 1 },
      { axe: "drainage_renal", indication: "drainage", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin à jeun", enfant: "1 goutte/10 kg" },
    contreIndications: ["Insuffisance rénale sévère", "Grossesse"],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  },
  {
    id: "juglans_regia_mg",
    nomLatin: "Juglans regia",
    nomFrancais: "Noyer",
    macerat: "MG D1",
    tropisme: ["Intestin", "Pancréas", "Peau", "Lymphe"],
    actionsEndocrines: ["Drainage lymphatique", "Régulateur flore intestinale", "Anti-infectieux", "Antifongique"],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "drainage", priorite: 1 },
      { axe: "drainage_intestinal", indication: "drainage", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  },
  {
    id: "rosmarinus_officinalis_mg",
    nomLatin: "Rosmarinus officinalis",
    nomFrancais: "Romarin",
    macerat: "MG D1",
    tropisme: ["Foie", "Vésicule biliaire"],
    actionsEndocrines: ["Draineur hépatobiliaire", "Régénérant hépatocytes", "Antioxydant hépatique"],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "drainage", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "ulmus_campestris_mg",
    nomLatin: "Ulmus campestris",
    nomFrancais: "Orme champêtre",
    macerat: "MG D1",
    tropisme: ["Peau", "Articulations"],
    actionsEndocrines: ["Drainant dermatologique", "Dépuratif cutané"],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "drainage", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin (prendre séparément)" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "castanea_vesca_mg",
    nomLatin: "Castanea vesca",
    nomFrancais: "Châtaignier",
    macerat: "MG D1",
    tropisme: ["Lymphe", "Veines", "Jambes"],
    actionsEndocrines: ["Tonique veineux", "Draineur lymphatique majeur"],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "drainage", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "fraxinus_excelsior_mg",
    nomLatin: "Fraxinus excelsior",
    nomFrancais: "Frêne",
    macerat: "MG D1",
    tropisme: ["Reins", "Articulations"],
    actionsEndocrines: ["Draineur acide urique", "Diurétique", "Anti-inflammatoire articulaire"],
    axesCibles: [
      { axe: "drainage_renal", indication: "drainage", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },

  // ============================================================
  // AXE CORTICOTROPE
  // ============================================================
  {
    id: "ribes_nigrum_mg",
    nomLatin: "Ribes nigrum",
    nomFrancais: "Cassis",
    macerat: "MG D1",
    tropisme: ["Surrénales", "Articulations", "Système immunitaire"],
    actionsEndocrines: ["Cortisol-like MAJEUR", "Anti-inflammatoire puissant", "Antiallergique", "Adaptogène", "Stimulant surrénalien"],
    axesCibles: [
      { axe: "corticotrope", indication: "insuffisance", priorite: 1 },
      { axe: "immuno_inflammation", indication: "sur_sollicitation", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin/midi (tonifiant)", enfant: "1 goutte/10 kg" },
    contreIndications: ["HTA sévère non contrôlée"],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  },
  {
    id: "quercus_pedunculata_mg",
    nomLatin: "Quercus robur",
    nomFrancais: "Chêne pédonculé",
    macerat: "MG D1",
    tropisme: ["Surrénales", "Gonades", "Rate", "Chaîne endocrinienne"],
    actionsEndocrines: ["Tonique surrénalien", "↑ Testostérone", "Anti-fatigue profonde", "Régulateur endocrinien global"],
    axesCibles: [
      { axe: "corticotrope", indication: "insuffisance", priorite: 1 },
      { axe: "gonadotrope_H", indication: "insuffisance", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  },

  // ============================================================
  // AXE GONADOTROPE FEMME
  // ============================================================
  {
    id: "rubus_idaeus_mg",
    nomLatin: "Rubus idaeus",
    nomFrancais: "Framboisier",
    macerat: "MG D1",
    tropisme: ["Utérus", "Ovaires", "Hypophyse"],
    actionsEndocrines: ["Régulateur hormonal féminin MAJEUR", "↑ Progestérone relative", "Antispasmodique utérin"],
    axesCibles: [
      { axe: "gonadotrope_F", indication: "regulation", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: ["Cancer hormonodépendant (précaution)"],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  },
  {
    id: "vaccinium_vitis_idaea_mg",
    nomLatin: "Vaccinium vitis-idaea",
    nomFrancais: "Airelle rouge",
    macerat: "MG D1",
    tropisme: ["Ovaires", "Vessie", "Os", "Intestin"],
    actionsEndocrines: ["Œstrogène-like", "Antivieillissement ovarien", "Anti-infectieux urinaire", "Régulateur intestinal"],
    axesCibles: [
      { axe: "gonadotrope_F", indication: "insuffisance", priorite: 1 },
      { axe: "drainage_intestinal", indication: "drainage", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: ["Grossesse", "Cancer hormonodépendant"],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  },

  // ============================================================
  // AXE GONADOTROPE HOMME
  // ============================================================
  {
    id: "sequoia_gigantea_mg",
    nomLatin: "Sequoia gigantea",
    nomFrancais: "Séquoia géant",
    macerat: "MG D1",
    tropisme: ["Testicules", "Os", "Prostate"],
    actionsEndocrines: ["Tonique sexuel masculin", "↑ Testostérone", "Reminéralisant osseux"],
    axesCibles: [
      { axe: "gonadotrope_H", indication: "insuffisance", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: ["Cancer prostate"],
    sourceVolume: "Gemmothérapie Pineau"
  },

  // ============================================================
  // SNA - SYSTÈME NERVEUX AUTONOME
  // ============================================================
  {
    id: "tilia_tomentosa_mg",
    nomLatin: "Tilia tomentosa",
    nomFrancais: "Tilleul argenté",
    macerat: "MG D1",
    tropisme: ["Système nerveux", "Cœur", "Rate"],
    actionsEndocrines: ["Sédatif MAJEUR", "Anxiolytique", "↓ Stress oxydatif neuronal", "Antispasmodique"],
    axesCibles: [
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 1 },
      { axe: "corticotrope", indication: "sur_sollicitation", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes le soir", enfant: "1 goutte/10 kg" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  },
  {
    id: "ficus_carica_mg",
    nomLatin: "Ficus carica",
    nomFrancais: "Figuier",
    macerat: "MG D1",
    tropisme: ["Estomac", "Système nerveux", "Axe cortico-hypothalamique", "Hypophyse"],
    actionsEndocrines: ["Régulateur axe cortico-limbique", "↓ Somatisations digestives", "Anxiolytique", "Régulateur neurotransmetteurs"],
    axesCibles: [
      { axe: "sna_parasympathique", indication: "regulation", priorite: 1 },
      { axe: "corticotrope", indication: "regulation", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin ou soir" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  },
  {
    id: "crataegus_oxyacantha_mg",
    nomLatin: "Crataegus oxyacantha",
    nomFrancais: "Aubépine",
    macerat: "MG D1",
    tropisme: ["Cœur", "Système nerveux"],
    actionsEndocrines: ["Cardiotonique", "Régulateur rythme cardiaque", "Sédatif cardiaque", "↓ Palpitations"],
    axesCibles: [
      { axe: "sna_beta", indication: "sur_sollicitation", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin et soir" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },

  // ============================================================
  // OSTÉO-ARTICULAIRE
  // ============================================================
  {
    id: "pinus_sylvestris_mg",
    nomLatin: "Pinus sylvestris",
    nomFrancais: "Pin sylvestre",
    macerat: "MG D1",
    tropisme: ["Os", "Cartilage"],
    actionsEndocrines: ["Stimulant ostéoblastes", "Régénérant cartilage", "Construction osseuse"],
    axesCibles: [
      { axe: "somatotrope", indication: "insuffisance", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "abies_pectinata_mg",
    nomLatin: "Abies pectinata",
    nomFrancais: "Sapin pectiné",
    macerat: "MG D1",
    tropisme: ["Os", "Calcium", "Croissance"],
    actionsEndocrines: ["Stimule ostéoblastes", "Fixation calcium", "Croissance enfant"],
    axesCibles: [
      { axe: "somatotrope", indication: "insuffisance", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin", enfant: "1 goutte/10 kg" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "rubus_fructicosus_mg",
    nomLatin: "Rubus fructicosus",
    nomFrancais: "Ronce",
    macerat: "MG D1",
    tropisme: ["Os", "Terrain"],
    actionsEndocrines: ["Reminéralisant profond", "Reconstruction terrain"],
    axesCibles: [
      { axe: "somatotrope", indication: "insuffisance", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "vitis_vinifera_mg",
    nomLatin: "Vitis vinifera",
    nomFrancais: "Vigne",
    macerat: "MG D1",
    tropisme: ["Articulations", "Intestins"],
    actionsEndocrines: ["Anti-inflammatoire articulaire", "Modulateur auto-immunité"],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "regulation", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "ampelopsis_weitchii_mg",
    nomLatin: "Ampelopsis weitchii",
    nomFrancais: "Vigne vierge",
    macerat: "MG D1",
    tropisme: ["Petites articulations", "Tendons"],
    actionsEndocrines: ["Anti-déformation articulaire", "Assouplissant tendons"],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "regulation", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },

  // ============================================================
  // IMMUNITÉ
  // ============================================================
  {
    id: "rosa_canina_mg",
    nomLatin: "Rosa canina",
    nomFrancais: "Églantier",
    macerat: "MG D1",
    tropisme: ["Système immunitaire", "ORL", "Os (enfant)"],
    actionsEndocrines: ["Stimulant immunitaire doux", "Anti-inflammatoire ORL", "Croissance enfant"],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "insuffisance", priorite: 1 }
    ],
    posologie: { adulte: "5-15 gouttes matin", enfant: "1 goutte/10 kg" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },

  // ============================================================
  // CARDIOVASCULAIRE
  // ============================================================
  {
    id: "cornus_sanguinea_mg",
    nomLatin: "Cornus sanguinea",
    nomFrancais: "Cornouiller sanguin",
    macerat: "MG D1",
    tropisme: ["Cœur", "Artères"],
    actionsEndocrines: ["Protection cardiaque", "Régénérateur vasculaire", "Anti-thrombotique"],
    axesCibles: [
      { axe: "sna_beta", indication: "regulation", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "olea_europaea_mg",
    nomLatin: "Olea europaea",
    nomFrancais: "Olivier",
    macerat: "MG D1",
    tropisme: ["Foie", "Vaisseaux", "Cerveau"],
    actionsEndocrines: ["Hypocholestérolémiant", "Hypotenseur", "Neuroprotecteur"],
    axesCibles: [
      { axe: "sna_beta", indication: "sur_sollicitation", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "aesculus_hippocastanum_mg",
    nomLatin: "Aesculus hippocastanum",
    nomFrancais: "Marronnier d'Inde",
    macerat: "MG D1",
    tropisme: ["Veines"],
    actionsEndocrines: ["Tonique veineux puissant", "Anti-hémorroïdaire"],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "regulation", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau"
  },
  {
    id: "ginkgo_biloba_mg",
    nomLatin: "Ginkgo biloba",
    nomFrancais: "Ginkgo",
    macerat: "MG D1",
    tropisme: ["Cerveau", "Microcirculation"],
    actionsEndocrines: ["Vasodilatateur cérébral", "Antioxydant", "Neuroprotecteur"],
    axesCibles: [
      { axe: "sna_parasympathique", indication: "insuffisance", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: ["Anticoagulants"],
    sourceVolume: "Gemmothérapie Pineau"
  },

  // ============================================================
  // AUTRES
  // ============================================================
  {
    id: "corylus_avellana_mg",
    nomLatin: "Corylus avellana",
    nomFrancais: "Noisetier",
    macerat: "MG D1",
    tropisme: ["Poumon", "Foie", "Circulation"],
    actionsEndocrines: ["Anti-sclérosant pulmonaire", "Drainage hépatique doux"],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "drainage", priorite: 2 }
    ],
    posologie: { adulte: "5-15 gouttes matin" },
    contreIndications: [],
    sourceVolume: "Gemmothérapie Pineau + Volume 2"
  }
];

// ========================================
// 7. AROMATHÉRAPIE - HUILES ESSENTIELLES
// Sources: "Base clinique des huiles essentielles" + Volume 2
// Classification selon profil neuro-végétatif (SNA)
// ========================================

export type ProfilSNA =
  | "sympathomimetique"      // Stimule le sympathique (tonifiant)
  | "sympatholytique"        // Inhibe le sympathique (calmant)
  | "parasympathomimetique"  // Stimule le parasympathique
  | "parasympatholytique"    // Inhibe le parasympathique
  | "equilibrant"            // Régule les deux systèmes
  | "modulateur";            // Adaptation selon terrain

export interface HuileEssentielle {
  id: string;
  nomLatin: string;
  nomFrancais: string;
  famille: string;
  chemotype?: string;

  // Classification endobiogénique
  profilSNA: ProfilSNA;
  familleBiochimique: string;

  // Actions
  proprietes: string[];
  indications: string[];

  // Sécurité
  voiesAdministration: ("cutanee" | "orale" | "diffusion" | "inhalation")[];
  contreIndications: string[];
  precautions: string[];

  // Posologie
  posologie: {
    cutanee?: string;
    orale?: string;
    diffusion?: string;
  };

  sourceVolume: string;
}

export const HUILES_ESSENTIELLES: HuileEssentielle[] = [
  // ============================================================
  // SYMPATHOLYTIQUES (Calmantes - α-sympathique)
  // ============================================================
  {
    id: "lavandula_angustifolia_he",
    nomLatin: "Lavandula angustifolia",
    nomFrancais: "Lavande vraie",
    famille: "Lamiaceae",
    profilSNA: "sympatholytique",
    familleBiochimique: "Esters (linalyle acétate) + Monoterpénols (linalol)",
    proprietes: ["Antispasmodique", "Sédative", "Cicatrisante", "Antalgique", "α-sympatholytique"],
    indications: ["Stress", "Insomnie", "Brûlures", "Douleurs", "Spasmophilie type 1"],
    voiesAdministration: ["cutanee", "diffusion", "orale"],
    contreIndications: [],
    precautions: ["Très sûre - HE de référence"],
    posologie: {
      cutanee: "2-3 gouttes pures ou diluées",
      orale: "2 gouttes sur support, 2-3x/jour",
      diffusion: "15-30 min"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "chamaemelum_nobile_he",
    nomLatin: "Chamaemelum nobile",
    nomFrancais: "Camomille romaine",
    famille: "Asteraceae",
    profilSNA: "sympatholytique",
    familleBiochimique: "Esters (angélate d'isobutyle)",
    proprietes: ["Antispasmodique puissant", "Calmante majeure", "Anxiolytique"],
    indications: ["Chocs nerveux", "Insomnie", "Névralgies", "Spasmophilie"],
    voiesAdministration: ["cutanee", "orale", "diffusion"],
    contreIndications: [],
    precautions: ["Très sûre"],
    posologie: {
      cutanee: "2-3 gouttes diluées à 20%",
      orale: "1-2 gouttes sur support"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "cananga_odorata_he",
    nomLatin: "Cananga odorata",
    nomFrancais: "Ylang-ylang",
    famille: "Annonaceae",
    profilSNA: "sympatholytique",
    familleBiochimique: "Sesquiterpènes + Esters",
    proprietes: ["Hypotenseur", "Sédatif cardiaque", "Aphrodisiaque", "β-sympatholytique"],
    indications: ["Tachycardie", "Hypertension", "Stress", "Spasmophilie type 2"],
    voiesAdministration: ["cutanee", "diffusion"],
    contreIndications: ["Hypotension"],
    precautions: ["Peut être entêtante en diffusion"],
    posologie: {
      cutanee: "2-3 gouttes diluées à 20% sur plexus",
      diffusion: "10-15 min max"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "origanum_majorana_he",
    nomLatin: "Origanum majorana",
    nomFrancais: "Marjolaine à coquilles",
    famille: "Lamiaceae",
    profilSNA: "sympatholytique",
    familleBiochimique: "Monoterpénols (terpinène-4-ol)",
    proprietes: ["Parasympathicotonique", "Rééquilibrant nerveux", "Hypotenseur"],
    indications: ["Dystonie neurovégétative", "Insomnie", "Anxiété"],
    voiesAdministration: ["cutanee", "orale", "diffusion"],
    contreIndications: [],
    precautions: ["Sûre"],
    posologie: {
      cutanee: "3-4 gouttes diluées à 20%",
      orale: "2 gouttes sur support, 2x/jour"
    },
    sourceVolume: "Aromathérapie clinique"
  },

  // ============================================================
  // SYMPATHOMIMÉTIQUES (Tonifiantes)
  // ============================================================
  {
    id: "origanum_compactum_he",
    nomLatin: "Origanum compactum",
    nomFrancais: "Origan compact",
    famille: "Lamiaceae",
    chemotype: "Carvacrol",
    profilSNA: "sympathomimetique",
    familleBiochimique: "Phénols (carvacrol, thymol)",
    proprietes: ["Anti-infectieux MAJEUR", "Immunostimulant puissant", "Tonique général"],
    indications: ["Infections sévères", "Immunodépression", "Fatigue profonde"],
    voiesAdministration: ["orale", "cutanee"],
    contreIndications: ["Grossesse", "Allaitement", "Enfants < 15 ans", "Insuffisance hépatique"],
    precautions: ["DERMOCAUSTIQUE - toujours diluer à 10% max", "Hépatotoxique - cures courtes (7-10 jours)", "Protéger le foie"],
    posologie: {
      orale: "1-2 gouttes en capsule, 3x/jour MAX 7 jours",
      cutanee: "Diluer à 10% dans huile végétale"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "cinnamomum_verum_he",
    nomLatin: "Cinnamomum verum (écorce)",
    nomFrancais: "Cannelle de Ceylan",
    famille: "Lauraceae",
    profilSNA: "sympathomimetique",
    familleBiochimique: "Aldéhydes aromatiques (cinnamaldéhyde)",
    proprietes: ["Anti-infectieux puissant", "Tonique", "Hypoglycémiant"],
    indications: ["Infections", "Fatigue", "Diabète adjuvant"],
    voiesAdministration: ["orale"],
    contreIndications: ["Grossesse", "Allaitement", "Anticoagulants"],
    precautions: ["DERMOCAUSTIQUE - JAMAIS pure sur peau", "Cures courtes"],
    posologie: {
      orale: "1 goutte en capsule avec HV, 2x/jour MAX 7 jours"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "satureja_montana_he",
    nomLatin: "Satureja montana",
    nomFrancais: "Sarriette des montagnes",
    famille: "Lamiaceae",
    profilSNA: "sympathomimetique",
    familleBiochimique: "Phénols (carvacrol)",
    proprietes: ["Anti-infectieux majeur", "Tonique général", "Immunostimulant"],
    indications: ["Infections ORL/bronchiques sévères", "Fatigue intense"],
    voiesAdministration: ["orale", "cutanee"],
    contreIndications: ["Grossesse", "Enfants < 15 ans"],
    precautions: ["DERMOCAUSTIQUE", "Hépatotoxique"],
    posologie: {
      orale: "1 goutte en capsule, 3x/jour MAX 5 jours"
    },
    sourceVolume: "Aromathérapie clinique"
  },

  // ============================================================
  // ÉQUILIBRANTS / MODULATEURS
  // ============================================================
  {
    id: "cinnamomum_camphora_ct_cineole_he",
    nomLatin: "Cinnamomum camphora",
    nomFrancais: "Ravintsara",
    famille: "Lauraceae",
    chemotype: "1,8-cinéole",
    profilSNA: "modulateur",
    familleBiochimique: "Oxydes (1,8-cinéole)",
    proprietes: ["Antiviral MAJEUR", "Expectorant", "Immunostimulant", "Neurotonique"],
    indications: ["Grippe", "Bronchite", "Fatigue nerveuse", "Immunité"],
    voiesAdministration: ["cutanee", "orale", "diffusion", "inhalation"],
    contreIndications: [],
    precautions: ["Très sûre - HE de référence antivirale"],
    posologie: {
      cutanee: "3-5 gouttes pures sur thorax/dos",
      orale: "2 gouttes sur support, 3x/jour",
      diffusion: "15-30 min"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "melaleuca_alternifolia_he",
    nomLatin: "Melaleuca alternifolia",
    nomFrancais: "Tea tree (Arbre à thé)",
    famille: "Myrtaceae",
    profilSNA: "equilibrant",
    familleBiochimique: "Monoterpénols (terpinène-4-ol) + Monoterpènes",
    proprietes: ["Antibactérien large spectre", "Antifongique", "Immunostimulant", "Radioprotecteur"],
    indications: ["Infections ORL", "Mycoses", "Acné", "Soins bucco-dentaires"],
    voiesAdministration: ["cutanee", "orale", "diffusion"],
    contreIndications: [],
    precautions: ["Très sûre"],
    posologie: {
      cutanee: "1-2 gouttes pures localement",
      orale: "2 gouttes sur support, 2-3x/jour"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "eucalyptus_radiata_he",
    nomLatin: "Eucalyptus radiata",
    nomFrancais: "Eucalyptus radié",
    famille: "Myrtaceae",
    profilSNA: "equilibrant",
    familleBiochimique: "Oxydes (1,8-cinéole) + Monoterpénols",
    proprietes: ["Expectorant", "Antiviral", "Immunostimulant", "Énergisant"],
    indications: ["Bronchite", "Sinusite", "Rhinopharyngite", "Fatigue"],
    voiesAdministration: ["cutanee", "inhalation", "diffusion"],
    contreIndications: ["Asthme (prudence)"],
    precautions: ["Sûre mais attention asthmatiques"],
    posologie: {
      cutanee: "3-5 gouttes sur thorax",
      inhalation: "5 gouttes dans bol eau chaude"
    },
    sourceVolume: "Aromathérapie clinique"
  },

  // ============================================================
  // PARASYMPATHOLYTIQUES
  // ============================================================
  {
    id: "mentha_piperita_he",
    nomLatin: "Mentha x piperita",
    nomFrancais: "Menthe poivrée",
    famille: "Lamiaceae",
    profilSNA: "parasympatholytique",
    familleBiochimique: "Monoterpénols (menthol) + Cétones (menthone)",
    proprietes: ["Antalgique puissant", "Digestive", "Tonique", "Décongestionnant"],
    indications: ["Migraines", "Nausées", "Digestion lente", "Fatigue"],
    voiesAdministration: ["cutanee", "orale"],
    contreIndications: ["Enfants < 6 ans", "Grossesse", "Épilepsie", "HTA"],
    precautions: ["Neurotoxique à forte dose (cétones)", "Effet froid intense"],
    posologie: {
      cutanee: "1 goutte pure sur tempes (migraine)",
      orale: "1-2 gouttes après repas"
    },
    sourceVolume: "Aromathérapie clinique"
  },

  // ============================================================
  // SPÉCIFIQUES
  // ============================================================
  {
    id: "helichrysum_italicum_he",
    nomLatin: "Helichrysum italicum",
    nomFrancais: "Hélichryse italienne (Immortelle)",
    famille: "Asteraceae",
    profilSNA: "equilibrant",
    familleBiochimique: "Cétones (italidiones) + Esters",
    proprietes: ["Antihématome EXCEPTIONNEL", "Cicatrisant", "Anticoagulant", "Anti-inflammatoire"],
    indications: ["Hématomes", "Cicatrices", "Phlébites", "Couperose"],
    voiesAdministration: ["cutanee"],
    contreIndications: ["Anticoagulants"],
    precautions: ["Coûteuse mais irremplaçable"],
    posologie: {
      cutanee: "2-3 gouttes pures sur hématome, 3-5x/jour"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "gaultheria_procumbens_he",
    nomLatin: "Gaultheria procumbens",
    nomFrancais: "Gaulthérie couchée",
    famille: "Ericaceae",
    profilSNA: "equilibrant",
    familleBiochimique: "Esters (salicylate de méthyle 99%)",
    proprietes: ["Anti-inflammatoire puissant", "Antalgique musculaire", "Antispasmodique"],
    indications: ["Douleurs musculaires", "Tendinites", "Arthrose", "Crampes"],
    voiesAdministration: ["cutanee"],
    contreIndications: ["Allergie aspirine", "Anticoagulants", "Enfants < 6 ans"],
    precautions: ["JAMAIS en voie orale", "Diluer à 10-20%"],
    posologie: {
      cutanee: "3-5 gouttes diluées à 20% en massage"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "cupressus_sempervirens_he",
    nomLatin: "Cupressus sempervirens",
    nomFrancais: "Cyprès toujours vert",
    famille: "Cupressaceae",
    profilSNA: "equilibrant",
    familleBiochimique: "Monoterpènes (α-pinène)",
    proprietes: ["Décongestionnant veineux", "Antitussif", "Prostatique"],
    indications: ["Varices", "Hémorroïdes", "Toux sèche", "HBP adjuvant"],
    voiesAdministration: ["cutanee", "orale"],
    contreIndications: ["Cancers hormonodépendants", "Mastoses"],
    precautions: ["Œstrogène-like"],
    posologie: {
      cutanee: "3-5 gouttes diluées sur jambes",
      orale: "2 gouttes sur support, 2x/jour"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "rosmarinus_officinalis_ct_verbenone_he",
    nomLatin: "Rosmarinus officinalis",
    nomFrancais: "Romarin à verbénone",
    famille: "Lamiaceae",
    chemotype: "Verbénone",
    profilSNA: "equilibrant",
    familleBiochimique: "Cétones (verbénone) + Monoterpènes",
    proprietes: ["Mucolytique", "Hépatoprotecteur", "Lipolytique", "Régulateur endocrinien"],
    indications: ["Bronchite chronique", "Insuffisance hépatique", "Cellulite", "Troubles hormonaux"],
    voiesAdministration: ["cutanee", "orale"],
    contreIndications: ["Grossesse", "Allaitement", "Enfants < 6 ans", "Épilepsie"],
    precautions: ["Cétones neurotoxiques - doses modérées"],
    posologie: {
      cutanee: "3-4 gouttes diluées à 20%",
      orale: "1-2 gouttes sur support, 2x/jour"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "laurus_nobilis_he",
    nomLatin: "Laurus nobilis",
    nomFrancais: "Laurier noble",
    famille: "Lauraceae",
    profilSNA: "equilibrant",
    familleBiochimique: "Oxydes (1,8-cinéole) + Monoterpénols",
    proprietes: ["Anti-infectieux complet", "Antiviral", "Antifongique", "Neurotonique"],
    indications: ["Grippe", "Infections buccales", "Mycoses", "Manque de confiance"],
    voiesAdministration: ["cutanee", "orale", "diffusion"],
    contreIndications: [],
    precautions: ["Possible allergie cutanée - tester"],
    posologie: {
      cutanee: "2-3 gouttes sur ganglions",
      orale: "2 gouttes sur support, 3x/jour"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "ocimum_basilicum_he",
    nomLatin: "Ocimum basilicum",
    nomFrancais: "Basilic tropical",
    famille: "Lamiaceae",
    chemotype: "Méthyl-chavicol",
    profilSNA: "parasympathomimetique",
    familleBiochimique: "Phénols méthyl-éthers (méthyl-chavicol)",
    proprietes: ["Antispasmodique MAJEUR", "Tonique digestif", "Anti-inflammatoire intestinal"],
    indications: ["Spasmes digestifs", "Aérophagie", "Dysménorrhées", "Stress digestif"],
    voiesAdministration: ["cutanee", "orale"],
    contreIndications: [],
    precautions: ["Possible irritation cutanée - diluer"],
    posologie: {
      cutanee: "3-4 gouttes diluées sur abdomen",
      orale: "1-2 gouttes après repas"
    },
    sourceVolume: "Aromathérapie clinique"
  },
  {
    id: "pistacia_lentiscus_he",
    nomLatin: "Pistacia lentiscus",
    nomFrancais: "Lentisque pistachier",
    famille: "Anacardiaceae",
    profilSNA: "equilibrant",
    familleBiochimique: "Monoterpènes",
    proprietes: ["Décongestionnant veineux et lymphatique", "Anti-inflammatoire prostatique"],
    indications: ["Varices", "Hémorroïdes", "Jambes lourdes", "Prostatite"],
    voiesAdministration: ["cutanee"],
    contreIndications: [],
    precautions: ["Sûre"],
    posologie: {
      cutanee: "5-10 gouttes diluées à 20% en massage ascendant"
    },
    sourceVolume: "Aromathérapie clinique"
  }
];

// ========================================
// 8. PLANTES PHYTOTHÉRAPIE COMPLÉMENTAIRES
// Source: Dictionnaire des 90 plantes médicinales
// ========================================

export const PLANTES_COMPLEMENTAIRES: PlanteEndobiogenique[] = [
  // ============================================================
  // SYSTÈME DIGESTIF
  // ============================================================
  {
    id: "gentiana_lutea",
    nomLatin: "Gentiana lutea",
    nomFrancais: "Gentiane jaune",
    famille: "Gentianaceae",
    actionsNeuroendocrines: [
      { action: "Tonique amer", mecanisme: "Stimule sécrétions digestives", intensite: 3 },
      { action: "Apéritif", mecanisme: "↑ Appétit", intensite: 3 }
    ],
    axesCibles: [
      { axe: "sna_parasympathique", indication: "insuffisance", priorite: 2 }
    ],
    formes: [
      { forme: "TM", posologie: "20-30 gouttes avant repas", duree: "21 jours" },
      { forme: "EPS", posologie: "2.5-5 mL avant repas", duree: "21 jours" }
    ],
    contreIndications: ["Ulcère gastrique", "Grossesse"],
    interactions: [],
    precautions: ["Très amer"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "zingiber_officinale",
    nomLatin: "Zingiber officinale",
    nomFrancais: "Gingembre",
    famille: "Zingiberaceae",
    actionsNeuroendocrines: [
      { action: "Antiémétique", mecanisme: "Antagoniste 5-HT3", intensite: 3 },
      { action: "Prokinétique", mecanisme: "Accélère vidange gastrique", intensite: 2 },
      { action: "Anti-inflammatoire", mecanisme: "Inhibe COX-2", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_parasympathique", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "30 jours" },
      { forme: "Gélule", posologie: "500-1000 mg/jour", duree: "30 jours" }
    ],
    contreIndications: ["Calculs biliaires"],
    interactions: ["Anticoagulants (potentialisation)"],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "foeniculum_vulgare",
    nomLatin: "Foeniculum vulgare",
    nomFrancais: "Fenouil",
    famille: "Apiaceae",
    actionsNeuroendocrines: [
      { action: "Carminatif", mecanisme: "↓ Gaz intestinaux", intensite: 3 },
      { action: "Antispasmodique", mecanisme: "Relaxe muscles lisses GI", intensite: 2 },
      { action: "Œstrogène-like léger", mecanisme: "Anéthole", intensite: 1 }
    ],
    axesCibles: [
      { axe: "drainage_intestinal", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "Infusion", posologie: "1 c.c. graines/tasse après repas", duree: "21 jours" },
      { forme: "EPS", posologie: "5 mL après repas", duree: "21 jours" }
    ],
    contreIndications: ["Cancer hormonodépendant"],
    interactions: [],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "peumus_boldus",
    nomLatin: "Peumus boldus",
    nomFrancais: "Boldo",
    famille: "Monimiaceae",
    actionsNeuroendocrines: [
      { action: "Cholérétique", mecanisme: "↑ Sécrétion biliaire", intensite: 3 },
      { action: "Cholagogue", mecanisme: "↑ Évacuation bile", intensite: 2 },
      { action: "Hépatoprotecteur", mecanisme: "Protège hépatocytes", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "drainage", priorite: 2 }
    ],
    formes: [
      { forme: "TM", posologie: "30-50 gouttes avant repas", duree: "21 jours" },
      { forme: "Infusion", posologie: "1-2 g/tasse, 2x/jour", duree: "21 jours" }
    ],
    contreIndications: ["Obstruction biliaire", "Grossesse", "Allaitement"],
    interactions: ["Anticoagulants"],
    precautions: ["Cures courtes (alcaloïdes)"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "raphanus_sativus_niger",
    nomLatin: "Raphanus sativus var. niger",
    nomFrancais: "Radis noir",
    famille: "Brassicaceae",
    actionsNeuroendocrines: [
      { action: "Cholérétique", mecanisme: "↑ Flux biliaire", intensite: 3 },
      { action: "Détoxifiant hépatique", mecanisme: "Glucosinolates", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "drainage", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5-10 mL matin à jeun", duree: "21 jours" }
    ],
    contreIndications: ["Calculs biliaires", "Hypothyroïdie"],
    interactions: [],
    precautions: ["Peut provoquer brûlures épigastriques"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },

  // ============================================================
  // SYSTÈME NERVEUX
  // ============================================================
  {
    id: "eschscholzia_californica",
    nomLatin: "Eschscholzia californica",
    nomFrancais: "Pavot de Californie",
    famille: "Papaveraceae",
    actionsNeuroendocrines: [
      { action: "Sédatif", mecanisme: "Action GABAergique", intensite: 3 },
      { action: "Anxiolytique", mecanisme: "Sans accoutumance", intensite: 2 },
      { action: "Hypnotique léger", mecanisme: "Facilite endormissement", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL le soir", duree: "30 jours" },
      { forme: "TM", posologie: "50-100 gouttes le soir", duree: "30 jours" }
    ],
    contreIndications: ["Grossesse", "Glaucome"],
    interactions: ["Sédatifs (potentialisation)"],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "hypericum_perforatum",
    nomLatin: "Hypericum perforatum",
    nomFrancais: "Millepertuis",
    famille: "Hypericaceae",
    actionsNeuroendocrines: [
      { action: "Antidépresseur", mecanisme: "IMAO + ISRS (hypéricine/hyperforine)", intensite: 3 },
      { action: "Anxiolytique", mecanisme: "Régule neurotransmetteurs", intensite: 2 }
    ],
    axesCibles: [
      { axe: "corticotrope", indication: "sur_sollicitation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin et midi", duree: "6-8 semaines" },
      { forme: "Gélule", posologie: "300 mg extrait 3x/jour", duree: "6-8 semaines" }
    ],
    contreIndications: ["Grossesse", "Allaitement", "Trouble bipolaire"],
    interactions: ["NOMBREUSES: Contraceptifs, anticoagulants, immunosuppresseurs, antirétroviraux, ISRS"],
    precautions: ["Inducteur CYP450 - ATTENTION INTERACTIONS", "Photosensibilisant"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "griffonia_simplicifolia",
    nomLatin: "Griffonia simplicifolia",
    nomFrancais: "Griffonia",
    famille: "Fabaceae",
    actionsNeuroendocrines: [
      { action: "Précurseur sérotonine", mecanisme: "5-HTP converti en sérotonine", intensite: 3 },
      { action: "Antidépresseur naturel", mecanisme: "↑ Sérotonine", intensite: 2 },
      { action: "Régulateur appétit", mecanisme: "Satiété via sérotonine", intensite: 2 }
    ],
    axesCibles: [
      { axe: "corticotrope", indication: "sur_sollicitation", priorite: 2 }
    ],
    formes: [
      { forme: "Gélule", posologie: "100-300 mg 5-HTP/jour", duree: "4-8 semaines" }
    ],
    contreIndications: ["Grossesse", "Trisomie 21"],
    interactions: ["ISRS", "IMAO", "Tramadol"],
    precautions: ["Ne pas associer aux antidépresseurs (syndrome sérotoninergique)"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "bacopa_monnieri",
    nomLatin: "Bacopa monnieri",
    nomFrancais: "Bacopa",
    famille: "Plantaginaceae",
    actionsNeuroendocrines: [
      { action: "Nootrope", mecanisme: "Améliore mémoire et cognition", intensite: 3 },
      { action: "Anxiolytique", mecanisme: "Effet adaptogène", intensite: 2 },
      { action: "Neuroprotecteur", mecanisme: "Antioxydant cérébral", intensite: 2 }
    ],
    axesCibles: [
      { axe: "corticotrope", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "Gélule", posologie: "300-450 mg extrait/jour", duree: "8-12 semaines" }
    ],
    contreIndications: ["Grossesse", "Allaitement"],
    interactions: ["Sédatifs", "Anticholinergiques"],
    precautions: ["Effet en 4-6 semaines"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "humulus_lupulus",
    nomLatin: "Humulus lupulus",
    nomFrancais: "Houblon",
    famille: "Cannabaceae",
    actionsNeuroendocrines: [
      { action: "Sédatif", mecanisme: "Action GABAergique", intensite: 2 },
      { action: "Œstrogène-like", mecanisme: "Phytoestrogènes (8-prénylnaringénine)", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 2 },
      { axe: "gonadotrope_F", indication: "insuffisance", priorite: 3 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL le soir", duree: "21-30 jours" },
      { forme: "Infusion", posologie: "1-2 g/tasse le soir", duree: "21 jours" }
    ],
    contreIndications: ["Cancer hormonodépendant", "Dépression"],
    interactions: ["Sédatifs"],
    precautions: ["Effet dépresseur possible chez certains"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "ballota_nigra",
    nomLatin: "Ballota nigra",
    nomFrancais: "Ballote noire",
    famille: "Lamiaceae",
    actionsNeuroendocrines: [
      { action: "Anxiolytique", mecanisme: "Action centrale", intensite: 2 },
      { action: "Antispasmodique", mecanisme: "Relaxe muscles lisses", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_alpha", indication: "sur_sollicitation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2-3x/jour", duree: "21-30 jours" },
      { forme: "TM", posologie: "50 gouttes 2-3x/jour", duree: "21 jours" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },

  // ============================================================
  // CARDIOVASCULAIRE
  // ============================================================
  {
    id: "allium_sativum",
    nomLatin: "Allium sativum",
    nomFrancais: "Ail",
    famille: "Liliaceae",
    actionsNeuroendocrines: [
      { action: "Hypolipémiant", mecanisme: "↓ Cholestérol et TG", intensite: 2 },
      { action: "Hypotenseur", mecanisme: "Vasodilatateur", intensite: 2 },
      { action: "Antiagrégant plaquettaire", mecanisme: "Inhibe agrégation", intensite: 2 },
      { action: "Hypoglycémiant", mecanisme: "Sensibilité insuline", intensite: 1 }
    ],
    axesCibles: [
      { axe: "sna_beta", indication: "regulation", priorite: 3 }
    ],
    formes: [
      { forme: "Gélule", posologie: "600-900 mg extrait/jour", duree: "3 mois" }
    ],
    contreIndications: [],
    interactions: ["Anticoagulants", "Antiagrégants"],
    precautions: ["Odeur corporelle", "Arrêter avant chirurgie"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "ruscus_aculeatus",
    nomLatin: "Ruscus aculeatus",
    nomFrancais: "Fragon (Petit houx)",
    famille: "Asparagaceae",
    actionsNeuroendocrines: [
      { action: "Vasoconstricteur veineux", mecanisme: "α-adrénergique", intensite: 3 },
      { action: "Anti-inflammatoire veineux", mecanisme: "↓ Perméabilité", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "30-60 jours" },
      { forme: "Gélule", posologie: "150-300 mg extrait/jour", duree: "2-3 mois" }
    ],
    contreIndications: ["HTA non contrôlée"],
    interactions: ["IMAO"],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "aesculus_hippocastanum",
    nomLatin: "Aesculus hippocastanum",
    nomFrancais: "Marronnier d'Inde",
    famille: "Sapindaceae",
    actionsNeuroendocrines: [
      { action: "Veinotonique majeur", mecanisme: "Aescine ↑ tonus veineux", intensite: 3 },
      { action: "Anti-œdème", mecanisme: "↓ Perméabilité capillaire", intensite: 3 }
    ],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "regulation", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "30-60 jours" },
      { forme: "Gélule", posologie: "50-100 mg aescine/jour", duree: "3 mois" }
    ],
    contreIndications: ["Insuffisance rénale"],
    interactions: ["Anticoagulants (théorique)"],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "hamamelis_virginiana",
    nomLatin: "Hamamelis virginiana",
    nomFrancais: "Hamamélis",
    famille: "Hamamelidaceae",
    actionsNeuroendocrines: [
      { action: "Veinotonique", mecanisme: "Tanins astringents", intensite: 2 },
      { action: "Astringent", mecanisme: "Resserre tissus", intensite: 3 }
    ],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "TM", posologie: "30-50 gouttes 3x/jour", duree: "21-30 jours" },
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "30 jours" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "melilotus_officinalis",
    nomLatin: "Melilotus officinalis",
    nomFrancais: "Mélilot",
    famille: "Fabaceae",
    actionsNeuroendocrines: [
      { action: "Lymphotrope", mecanisme: "↑ Circulation lymphatique", intensite: 3 },
      { action: "Anti-œdème", mecanisme: "↓ Œdèmes lymphatiques", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "drainage", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "21-30 jours" },
      { forme: "Gélule", posologie: "500-1000 mg/jour", duree: "30 jours" }
    ],
    contreIndications: ["Anticoagulants"],
    interactions: ["Anticoagulants (coumarines)"],
    precautions: ["Contient coumarines"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "ginkgo_biloba",
    nomLatin: "Ginkgo biloba",
    nomFrancais: "Ginkgo",
    famille: "Ginkgoaceae",
    actionsNeuroendocrines: [
      { action: "Vasodilatateur cérébral", mecanisme: "↑ Flux sanguin cérébral", intensite: 3 },
      { action: "Neuroprotecteur", mecanisme: "Antioxydant puissant", intensite: 3 },
      { action: "Antiagrégant plaquettaire", mecanisme: "Inhibiteur PAF", intensite: 2 }
    ],
    axesCibles: [
      { axe: "sna_parasympathique", indication: "insuffisance", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5-10 mL/jour", duree: "3 mois minimum" },
      { forme: "Gélule", posologie: "120-240 mg extrait EGb761/jour", duree: "3-6 mois" }
    ],
    contreIndications: [],
    interactions: ["Anticoagulants", "AINS", "ISRS"],
    precautions: ["Arrêter 2 semaines avant chirurgie"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },

  // ============================================================
  // OSTÉO-ARTICULAIRE
  // ============================================================
  {
    id: "harpagophytum_procumbens",
    nomLatin: "Harpagophytum procumbens",
    nomFrancais: "Griffe du diable",
    famille: "Pedaliaceae",
    actionsNeuroendocrines: [
      { action: "Anti-inflammatoire", mecanisme: "Inhibition COX-2 et cytokines", intensite: 3 },
      { action: "Antalgique", mecanisme: "↓ Douleur articulaire", intensite: 3 }
    ],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "sur_sollicitation", priorite: 1 }
    ],
    formes: [
      { forme: "EPS", posologie: "5-10 mL 2x/jour", duree: "4-8 semaines" },
      { forme: "Gélule", posologie: "2-4 g racine/jour", duree: "2-3 mois" }
    ],
    contreIndications: ["Ulcère gastrique", "Calculs biliaires", "Grossesse"],
    interactions: ["Anticoagulants", "Antidiabétiques"],
    precautions: ["Prendre pendant repas"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "boswellia_serrata",
    nomLatin: "Boswellia serrata",
    nomFrancais: "Encens indien",
    famille: "Burseraceae",
    actionsNeuroendocrines: [
      { action: "Anti-inflammatoire", mecanisme: "Inhibition 5-LOX (leucotriènes)", intensite: 3 },
      { action: "Chondroprotecteur", mecanisme: "Protège cartilage", intensite: 2 }
    ],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "sur_sollicitation", priorite: 1 }
    ],
    formes: [
      { forme: "Gélule", posologie: "300-500 mg extrait 3x/jour", duree: "8-12 semaines" }
    ],
    contreIndications: ["Grossesse"],
    interactions: [],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "curcuma_longa",
    nomLatin: "Curcuma longa",
    nomFrancais: "Curcuma",
    famille: "Zingiberaceae",
    actionsNeuroendocrines: [
      { action: "Anti-inflammatoire", mecanisme: "Inhibe NF-κB, COX-2", intensite: 3 },
      { action: "Antioxydant", mecanisme: "Piège radicaux libres", intensite: 3 },
      { action: "Hépatoprotecteur", mecanisme: "↑ Sécrétion biliaire", intensite: 2 }
    ],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "sur_sollicitation", priorite: 1 },
      { axe: "drainage_hepatique", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "Gélule", posologie: "500-1000 mg curcumine/jour avec pipérine", duree: "2-3 mois" },
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "30-60 jours" }
    ],
    contreIndications: ["Obstruction biliaire", "Calculs biliaires"],
    interactions: ["Anticoagulants", "Antiplaquettaires"],
    precautions: ["Prendre avec poivre noir ou lipides pour absorption"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "filipendula_ulmaria",
    nomLatin: "Filipendula ulmaria",
    nomFrancais: "Reine des prés",
    famille: "Rosaceae",
    actionsNeuroendocrines: [
      { action: "Anti-inflammatoire", mecanisme: "Salicylés naturels", intensite: 2 },
      { action: "Diurétique", mecanisme: "Favorise élimination", intensite: 2 }
    ],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "regulation", priorite: 2 },
      { axe: "drainage_renal", indication: "drainage", priorite: 2 }
    ],
    formes: [
      { forme: "Infusion", posologie: "2-3 g/tasse, 3 tasses/jour", duree: "21 jours" },
      { forme: "EPS", posologie: "5 mL 2-3x/jour", duree: "21 jours" }
    ],
    contreIndications: ["Allergie aspirine"],
    interactions: ["Anticoagulants"],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "equisetum_arvense",
    nomLatin: "Equisetum arvense",
    nomFrancais: "Prêle des champs",
    famille: "Equisetaceae",
    actionsNeuroendocrines: [
      { action: "Reminéralisant", mecanisme: "Silicium biodisponible", intensite: 3 },
      { action: "Diurétique", mecanisme: "↑ Diurèse", intensite: 2 }
    ],
    axesCibles: [
      { axe: "somatotrope", indication: "insuffisance", priorite: 2 },
      { axe: "drainage_renal", indication: "drainage", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL matin", duree: "30-60 jours" },
      { forme: "Gélule", posologie: "300-600 mg/jour", duree: "2-3 mois" }
    ],
    contreIndications: ["Insuffisance rénale", "Insuffisance cardiaque"],
    interactions: ["Diurétiques"],
    precautions: ["Ne pas confondre avec prêle des marais (toxique)"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },

  // ============================================================
  // SYSTÈME URINAIRE
  // ============================================================
  {
    id: "vaccinium_macrocarpon",
    nomLatin: "Vaccinium macrocarpon",
    nomFrancais: "Canneberge (Cranberry)",
    famille: "Ericaceae",
    actionsNeuroendocrines: [
      { action: "Anti-adhésion E.coli", mecanisme: "Proanthocyanidines A", intensite: 3 }
    ],
    axesCibles: [
      { axe: "drainage_renal", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "Gélule", posologie: "36 mg PAC-A/jour", duree: "Prévention: 3-6 mois" }
    ],
    contreIndications: ["Calculs rénaux oxaliques"],
    interactions: ["Warfarine (théorique)"],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "arctostaphylos_uva_ursi",
    nomLatin: "Arctostaphylos uva-ursi",
    nomFrancais: "Busserole",
    famille: "Ericaceae",
    actionsNeuroendocrines: [
      { action: "Antiseptique urinaire", mecanisme: "Arbutine → hydroquinone", intensite: 3 }
    ],
    axesCibles: [
      { axe: "drainage_renal", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 3x/jour", duree: "7-10 jours MAX" },
      { forme: "Infusion", posologie: "3-4 g/tasse, 3-4x/jour", duree: "7 jours" }
    ],
    contreIndications: ["Grossesse", "Allaitement", "Insuffisance rénale"],
    interactions: [],
    precautions: ["Cures courtes (max 1 semaine)", "Alcaliniser urines (fruits)"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "prunus_africana",
    nomLatin: "Prunus africana",
    nomFrancais: "Prunier d'Afrique (Pygeum)",
    famille: "Rosaceae",
    actionsNeuroendocrines: [
      { action: "Anti-œdème prostatique", mecanisme: "↓ Congestion prostate", intensite: 3 },
      { action: "Anti-inflammatoire", mecanisme: "↓ Inflammation prostate", intensite: 2 }
    ],
    axesCibles: [
      { axe: "gonadotrope_H", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "Gélule", posologie: "100-200 mg extrait/jour", duree: "6-8 semaines" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },

  // ============================================================
  // SYSTÈME RESPIRATOIRE
  // ============================================================
  {
    id: "thymus_vulgaris",
    nomLatin: "Thymus vulgaris",
    nomFrancais: "Thym",
    famille: "Lamiaceae",
    actionsNeuroendocrines: [
      { action: "Antiseptique respiratoire", mecanisme: "Thymol antibactérien", intensite: 3 },
      { action: "Expectorant", mecanisme: "Fluidifie mucus", intensite: 2 },
      { action: "Antispasmodique bronchique", mecanisme: "Relaxe bronches", intensite: 2 }
    ],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "Infusion", posologie: "1-2 g/tasse, 3-4x/jour", duree: "7-14 jours" },
      { forme: "EPS", posologie: "5 mL 2-3x/jour", duree: "10-14 jours" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "hedera_helix",
    nomLatin: "Hedera helix",
    nomFrancais: "Lierre grimpant",
    famille: "Araliaceae",
    actionsNeuroendocrines: [
      { action: "Expectorant", mecanisme: "Saponines fluidifiantes", intensite: 3 },
      { action: "Bronchodilatateur", mecanisme: "Relaxe bronches", intensite: 2 }
    ],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2-3x/jour", duree: "7-14 jours" },
      { forme: "Sirop", posologie: "Selon notice", duree: "7-14 jours" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "plantago_lanceolata",
    nomLatin: "Plantago lanceolata",
    nomFrancais: "Plantain lancéolé",
    famille: "Plantaginaceae",
    actionsNeuroendocrines: [
      { action: "Émollient respiratoire", mecanisme: "Mucilages apaisants", intensite: 3 },
      { action: "Anti-inflammatoire", mecanisme: "Iridoïdes", intensite: 2 },
      { action: "Antihistaminique", mecanisme: "↓ Histamine", intensite: 2 }
    ],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "regulation", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2-3x/jour", duree: "21 jours" },
      { forme: "Infusion", posologie: "2-3 g/tasse, 3x/jour", duree: "21 jours" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "sambucus_nigra",
    nomLatin: "Sambucus nigra",
    nomFrancais: "Sureau noir",
    famille: "Adoxaceae",
    actionsNeuroendocrines: [
      { action: "Antiviral", mecanisme: "Inhibe neuraminidase virale", intensite: 3 },
      { action: "Immunostimulant", mecanisme: "↑ Cytokines", intensite: 2 },
      { action: "Diaphorétique", mecanisme: "↑ Sudation", intensite: 2 }
    ],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "insuffisance", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 3x/jour dès symptômes", duree: "5-7 jours" },
      { forme: "Infusion", posologie: "3-5 g fleurs/tasse, 3x/jour", duree: "5-7 jours" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: ["Fruits crus toxiques - cuire"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "astragalus_membranaceus",
    nomLatin: "Astragalus membranaceus",
    nomFrancais: "Astragale",
    famille: "Fabaceae",
    actionsNeuroendocrines: [
      { action: "Immunomodulateur", mecanisme: "↑ NK cells, ↑ IFN", intensite: 3 },
      { action: "Adaptogène", mecanisme: "Soutient réponse au stress", intensite: 2 },
      { action: "Cardioprotecteur", mecanisme: "Antioxydant cardiaque", intensite: 2 }
    ],
    axesCibles: [
      { axe: "corticotrope", indication: "insuffisance", priorite: 2 },
      { axe: "immuno_inflammation", indication: "insuffisance", priorite: 1 }
    ],
    formes: [
      { forme: "Gélule", posologie: "500-1000 mg extrait/jour", duree: "2-3 mois" },
      { forme: "Décoction", posologie: "10-30 g racine/jour", duree: "2-3 mois" }
    ],
    contreIndications: ["Maladies auto-immunes (précaution)"],
    interactions: ["Immunosuppresseurs"],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },

  // ============================================================
  // MÉTABOLISME
  // ============================================================
  {
    id: "camellia_sinensis",
    nomLatin: "Camellia sinensis",
    nomFrancais: "Thé vert",
    famille: "Theaceae",
    actionsNeuroendocrines: [
      { action: "Thermogène", mecanisme: "↑ Métabolisme basal", intensite: 2 },
      { action: "Antioxydant", mecanisme: "EGCG puissant", intensite: 3 },
      { action: "Hypolipémiant", mecanisme: "↓ Cholestérol LDL", intensite: 2 }
    ],
    axesCibles: [
      { axe: "thyreotrope", indication: "regulation", priorite: 3 }
    ],
    formes: [
      { forme: "Infusion", posologie: "3-5 tasses/jour", duree: "Usage régulier" },
      { forme: "Gélule", posologie: "300-400 mg EGCG/jour", duree: "2-3 mois" }
    ],
    contreIndications: ["Anémie ferriprive (inhibe absorption fer)"],
    interactions: ["Fer (prendre à distance)"],
    precautions: ["Caféine - éviter le soir"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "ilex_paraguariensis",
    nomLatin: "Ilex paraguariensis",
    nomFrancais: "Maté",
    famille: "Aquifoliaceae",
    actionsNeuroendocrines: [
      { action: "Thermogène", mecanisme: "↑ Oxydation graisses", intensite: 3 },
      { action: "Stimulant", mecanisme: "Caféine + théobromine", intensite: 2 },
      { action: "Diurétique", mecanisme: "↑ Élimination", intensite: 2 }
    ],
    axesCibles: [
      { axe: "thyreotrope", indication: "insuffisance", priorite: 3 },
      { axe: "corticotrope", indication: "insuffisance", priorite: 3 }
    ],
    formes: [
      { forme: "Infusion", posologie: "3-4 tasses/jour", duree: "Cure 4-6 semaines" },
      { forme: "Gélule", posologie: "300-500 mg extrait/jour", duree: "4-6 semaines" }
    ],
    contreIndications: ["Insomnie", "Anxiété", "HTA non contrôlée"],
    interactions: ["Stimulants"],
    precautions: ["Caféine - éviter le soir"],
    sourceVolume: "Dictionnaire Phytothérapie"
  },

  // ============================================================
  // CUTANÉ
  // ============================================================
  {
    id: "arctium_lappa",
    nomLatin: "Arctium lappa",
    nomFrancais: "Bardane",
    famille: "Asteraceae",
    actionsNeuroendocrines: [
      { action: "Dépuratif cutané", mecanisme: "Drainage hépatique → peau nette", intensite: 3 },
      { action: "Antibactérien", mecanisme: "Actif sur P. acnes", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_hepatique", indication: "drainage", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "21-30 jours" },
      { forme: "Décoction", posologie: "10-20 g racine/L, 2-3 tasses/jour", duree: "21 jours" }
    ],
    contreIndications: ["Allergie Astéracées"],
    interactions: ["Antidiabétiques (hypoglycémiant)"],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "viola_tricolor",
    nomLatin: "Viola tricolor",
    nomFrancais: "Pensée sauvage",
    famille: "Violaceae",
    actionsNeuroendocrines: [
      { action: "Dépuratif cutané", mecanisme: "Drainage peau", intensite: 3 },
      { action: "Anti-eczéma", mecanisme: "Apaise inflammations cutanées", intensite: 2 }
    ],
    axesCibles: [
      { axe: "drainage_lymphatique", indication: "drainage", priorite: 2 }
    ],
    formes: [
      { forme: "EPS", posologie: "5 mL 2x/jour", duree: "21-30 jours" },
      { forme: "Infusion", posologie: "2-3 g/tasse, 3x/jour", duree: "21 jours" }
    ],
    contreIndications: [],
    interactions: [],
    precautions: [],
    sourceVolume: "Dictionnaire Phytothérapie"
  },
  {
    id: "calendula_officinalis",
    nomLatin: "Calendula officinalis",
    nomFrancais: "Souci officinal",
    famille: "Asteraceae",
    actionsNeuroendocrines: [
      { action: "Cicatrisant", mecanisme: "Stimule granulation", intensite: 3 },
      { action: "Anti-inflammatoire cutané", mecanisme: "Flavonoïdes, caroténoïdes", intensite: 2 },
      { action: "Antibactérien local", mecanisme: "Actif sur plaies", intensite: 2 }
    ],
    axesCibles: [
      { axe: "immuno_inflammation", indication: "regulation", priorite: 3 }
    ],
    formes: [
      { forme: "TM", posologie: "Usage externe: diluer dans eau pour compresses", duree: "Selon besoin" },
      { forme: "Infusion", posologie: "Usage externe: compresses", duree: "Selon besoin" }
    ],
    contreIndications: ["Allergie Astéracées"],
    interactions: [],
    precautions: ["Principalement usage externe"],
    sourceVolume: "Dictionnaire Phytothérapie"
  }
];

// ========================================
// 9. FONCTIONS UTILITAIRES
// ========================================

/**
 * Recherche les plantes par axe et indication (inclut plantes complémentaires)
 */
export function rechercherPlantesParAxe(
  axe: AxeEndobiogenique,
  indication: "insuffisance" | "sur_sollicitation" | "regulation" | "drainage"
): PlanteEndobiogenique[] {
  const toutesPlantes = [
    ...PLANTES_DRAINAGE,
    ...PLANTES_CORTICOTROPE,
    ...PLANTES_THYREOTROPE,
    ...PLANTES_GONADOTROPE_FEMME,
    ...PLANTES_GONADOTROPE_HOMME,
    ...PLANTES_SNA,
    ...PLANTES_COMPLEMENTAIRES
  ];

  return toutesPlantes.filter(plante =>
    plante.axesCibles.some(ac => ac.axe === axe && ac.indication === indication)
  ).sort((a, b) => {
    const prioA = a.axesCibles.find(ac => ac.axe === axe)?.priorite || 3;
    const prioB = b.axesCibles.find(ac => ac.axe === axe)?.priorite || 3;
    return prioA - prioB;
  });
}

/**
 * Recherche les bourgeons par axe
 */
export function rechercherBourgeonsParAxe(
  axe: AxeEndobiogenique,
  indication: "insuffisance" | "sur_sollicitation" | "regulation" | "drainage"
): BourgeonsGemmotherapie[] {
  return BOURGEONS_GEMMOTHERAPIE.filter(bourgeon =>
    bourgeon.axesCibles.some(ac => ac.axe === axe && ac.indication === indication)
  ).sort((a, b) => {
    const prioA = a.axesCibles.find(ac => ac.axe === axe)?.priorite || 3;
    const prioB = b.axesCibles.find(ac => ac.axe === axe)?.priorite || 3;
    return prioA - prioB;
  });
}

/**
 * Vérifie les contre-indications d'une plante
 */
export function verifierContreIndications(
  plante: PlanteEndobiogenique | BourgeonsGemmotherapie,
  patientCI: string[]
): string[] {
  const ciTrouvees: string[] = [];

  for (const ci of plante.contreIndications) {
    for (const patientCi of patientCI) {
      if (ci.toLowerCase().includes(patientCi.toLowerCase()) ||
          patientCi.toLowerCase().includes(ci.toLowerCase())) {
        ciTrouvees.push(ci);
      }
    }
  }

  return ciTrouvees;
}

/**
 * Génère un protocole de drainage selon les émonctoires
 */
export function genererProtocoleDrainage(
  emonctoiresPrioritaires: ("foie" | "rein" | "lymphe" | "intestin")[]
): { plantes: PlanteEndobiogenique[]; bourgeons: BourgeonsGemmotherapie[] } {
  const plantes: PlanteEndobiogenique[] = [];
  const bourgeons: BourgeonsGemmotherapie[] = [];

  for (const emonctoire of emonctoiresPrioritaires) {
    const axe = `drainage_${emonctoire === "lymphe" ? "lymphatique" : emonctoire}` as AxeEndobiogenique;

    const plantesEmonctoire = rechercherPlantesParAxe(axe, "drainage");
    if (plantesEmonctoire.length > 0) {
      plantes.push(plantesEmonctoire[0]); // Premier choix
    }

    const bourgeonsEmonctoire = rechercherBourgeonsParAxe(axe, "drainage");
    if (bourgeonsEmonctoire.length > 0) {
      bourgeons.push(bourgeonsEmonctoire[0]); // Premier choix
    }
  }

  return { plantes, bourgeons };
}

/**
 * Recherche les huiles essentielles par profil SNA
 */
export function rechercherHEParProfilSNA(
  profil: ProfilSNA
): HuileEssentielle[] {
  return HUILES_ESSENTIELLES.filter(he => he.profilSNA === profil);
}

/**
 * Recherche les huiles essentielles par indication
 */
export function rechercherHEParIndication(
  indication: string
): HuileEssentielle[] {
  return HUILES_ESSENTIELLES.filter(he =>
    he.indications.some(ind => ind.toLowerCase().includes(indication.toLowerCase()))
  );
}

/**
 * Obtient toutes les plantes (y compris complémentaires)
 */
export function getToutesLesPlantes(): PlanteEndobiogenique[] {
  return [
    ...PLANTES_DRAINAGE,
    ...PLANTES_CORTICOTROPE,
    ...PLANTES_THYREOTROPE,
    ...PLANTES_GONADOTROPE_FEMME,
    ...PLANTES_GONADOTROPE_HOMME,
    ...PLANTES_SNA,
    ...PLANTES_COMPLEMENTAIRES
  ];
}

/**
 * Statistiques de la base de données
 */
export function getStatistiquesMatiereMedicale(): {
  totalPlantes: number;
  totalBourgeons: number;
  totalHE: number;
  parCategorie: Record<string, number>;
} {
  return {
    totalPlantes: getToutesLesPlantes().length,
    totalBourgeons: BOURGEONS_GEMMOTHERAPIE.length,
    totalHE: HUILES_ESSENTIELLES.length,
    parCategorie: {
      drainage: PLANTES_DRAINAGE.length,
      corticotrope: PLANTES_CORTICOTROPE.length,
      thyreotrope: PLANTES_THYREOTROPE.length,
      gonadotropeFemme: PLANTES_GONADOTROPE_FEMME.length,
      gonadotropeHomme: PLANTES_GONADOTROPE_HOMME.length,
      sna: PLANTES_SNA.length,
      complementaires: PLANTES_COMPLEMENTAIRES.length,
      gemmotherapie: BOURGEONS_GEMMOTHERAPIE.length,
      aromatherapie: HUILES_ESSENTIELLES.length
    }
  };
}

// ========================================
// EXPORT GROUPÉ
// ========================================

export const MATIERE_MEDICALE = {
  // Plantes par axe endobiogénique
  drainage: PLANTES_DRAINAGE,
  corticotrope: PLANTES_CORTICOTROPE,
  thyreotrope: PLANTES_THYREOTROPE,
  gonadotropeFemme: PLANTES_GONADOTROPE_FEMME,
  gonadotropeHomme: PLANTES_GONADOTROPE_HOMME,
  sna: PLANTES_SNA,

  // Plantes complémentaires (dictionnaire 90 plantes)
  complementaires: PLANTES_COMPLEMENTAIRES,

  // Gemmothérapie (25 bourgeons)
  gemmotherapie: BOURGEONS_GEMMOTHERAPIE,

  // Aromathérapie (HE avec profils SNA)
  aromatherapie: HUILES_ESSENTIELLES
};

// Export des types pour utilisation externe
export type {
  PlanteEndobiogenique,
  BourgeonsGemmotherapie,
  HuileEssentielle,
  AxeEndobiogenique,
  ProfilSNA,
  ActionNeuroendocrine,
  AxeCible,
  FormeGalenique
};
