import type { QuestionConfig } from "../types";

/**
 * AXE URORÉNAL - NOUVEAU MODULE
 * Évalue la fonction urinaire, rénale et prostatique
 * 
 * TOTAL : 32 questions
 * - Priority 1 (ESSENTIEL) : 10 questions
 * - Priority 2 (IMPORTANT) : 14 questions
 * - Priority 3 (OPTIONNEL) : 8 questions
 */

const AxeUrorenalConfig: QuestionConfig[] = [
  // ==========================================
  // I. MICTION & FONCTION VÉSICALE
  // ==========================================
  {
    id: "uro_miction_frequence",
    question: "Combien de fois urinez-vous par jour ?",
    type: "select",
    options: ["3-5 fois (normal)", "6-8 fois", "9-12 fois", "Plus de 12 fois"],
    tooltip: "La pollakiurie (mictions fréquentes) peut indiquer une hyperexcitabilité vésicale, une infection, un diabète ou une hypertrophie prostatique.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Miction & Fonction Vésicale",
    tags: ["miction", "frequence", "pack_essentiel"]
  },
  {
    id: "uro_miction_nocturne",
    question: "Vous levez-vous la nuit pour uriner ?",
    type: "select",
    options: ["Jamais", "1 fois (occasionnel)", "1-2 fois (régulier)", "3 fois ou plus"],
    tooltip: "La nycturie (mictions nocturnes) traduit une fonction émonctorielle nocturne accrue ou un problème prostatique chez l'homme.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Miction & Fonction Vésicale",
    tags: ["nycturie", "nuit", "pack_essentiel"]
  },
  {
    id: "uro_urgence_mictionnelle",
    question: "Avez-vous des envies urgentes d'uriner difficiles à retenir ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "L'impériosité mictionnelle traduit une vessie hyperexcitable ou une irritation vésicale.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Miction & Fonction Vésicale",
    tags: ["urgence", "vessie"]
  },
  {
    id: "uro_jet_urinaire",
    question: "Comment est la force de votre jet urinaire ?",
    type: "select",
    options: ["Fort et régulier", "Légèrement diminué", "Faible", "Très faible, en goutte-à-goutte"],
    tooltip: "Un jet faible indique une vessie trop distendue ou une obstruction (hypertrophie prostatique chez l'homme).",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Miction & Fonction Vésicale",
    tags: ["jet", "prostate", "pack_essentiel"]
  },
  {
    id: "uro_miction_incomplete",
    question: "Avez-vous la sensation de ne pas vider complètement votre vessie ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La sensation de miction incomplète traduit une obstruction ou une faiblesse du détrusor. Elle favorise la stagnation et les infections.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Miction & Fonction Vésicale",
    tags: ["incomplete", "residuel"]
  },
  {
    id: "uro_dysurie",
    question: "Ressentez-vous des douleurs ou brûlures en urinant ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "À chaque miction"],
    tooltip: "La dysurie (douleur mictionnelle) indique une inflammation urétrale ou vésicale : infection, calculs, prostatite.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Miction & Fonction Vésicale",
    tags: ["dysurie", "douleur", "infection"]
  },
  {
    id: "uro_incontinence",
    question: "Avez-vous des fuites urinaires ?",
    type: "select",
    options: ["Jamais", "À l'effort (toux, rire)", "Par impériosité", "Mixte (effort + urgence)", "Permanentes"],
    tooltip: "L'incontinence peut être d'effort (faiblesse du plancher pelvien) ou par impériosité (vessie hyperactive).",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Miction & Fonction Vésicale",
    tags: ["incontinence", "plancher_pelvien"]
  },

  // ==========================================
  // II. INFECTIONS URINAIRES
  // ==========================================
  {
    id: "uro_infections_recidivantes",
    question: "Faites-vous des infections urinaires à répétition ?",
    type: "select",
    options: ["Jamais", "Rarement (<1/an)", "Occasionnel (1-2/an)", "Fréquent (3-4/an)", "Très fréquent (>4/an)"],
    tooltip: "Les cystites récidivantes traduisent un terrain infectieux avec une immunité muqueuse déficiente. L'Airelle régénère les muqueuses.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Infections Urinaires",
    tags: ["infection", "cystite", "pack_essentiel"]
  },
  {
    id: "uro_pyurie",
    question: "Vos urines sont-elles parfois troubles ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les urines troubles peuvent indiquer une infection (pyurie) ou la présence de cristaux (lithiase).",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Infections Urinaires",
    tags: ["urines", "troubles", "infection"]
  },
  {
    id: "uro_hematurie",
    question: "Avez-vous déjà remarqué du sang dans vos urines ?",
    type: "select",
    options: ["Jamais", "Une fois", "Occasionnellement", "Régulièrement"],
    tooltip: "La présence de sang dans les urines nécessite une investigation : infection, calculs, tumeur, glomérulonéphrite.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Infections Urinaires",
    tags: ["hematurie", "sang", "alerte"]
  },
  {
    id: "uro_antibiotiques_frequents",
    question: "Prenez-vous souvent des antibiotiques pour des infections urinaires ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "L'usage fréquent d'antibiotiques traduit un terrain récidivant et favorise la dysbiose intestinale.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Infections Urinaires",
    tags: ["antibiotiques", "dysbiose"]
  },

  // ==========================================
  // III. LITHIASE & TERRAIN ACIDE
  // ==========================================
  {
    id: "uro_calculs",
    question: "Avez-vous déjà eu des calculs rénaux ou vésicaux ?",
    type: "select",
    options: ["Jamais", "Une fois", "Plusieurs fois", "Actuellement"],
    tooltip: "La lithiase traduit une élimination rénale insuffisante et un terrain acide. Les calculs peuvent être d'oxalate, d'urate ou de phosphate.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Lithiase & Terrain Acide",
    tags: ["calculs", "lithiase", "pack_essentiel"]
  },
  {
    id: "uro_coliques_nephretiques",
    question: "Avez-vous déjà eu une colique néphrétique ?",
    type: "boolean",
    tooltip: "La colique néphrétique traduit la migration d'un calcul. Attention aux plantes antilithiasiques qui peuvent mobiliser les calculs.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Lithiase & Terrain Acide",
    tags: ["colique", "nephretique"]
  },
  {
    id: "uro_uricemie",
    question: "Avez-vous un taux d'acide urique élevé ?",
    type: "select",
    options: ["Non", "Limite haute", "Élevé", "Très élevé (goutte)"],
    tooltip: "L'hyperuricémie traduit une élimination insuffisante de l'acide urique. Elle favorise la goutte et les calculs d'urate.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Lithiase & Terrain Acide",
    tags: ["uricemie", "goutte"]
  },
  {
    id: "uro_terrain_acide",
    question: "Présentez-vous des signes de terrain acide (crampes, fatigue, douleurs articulaires) ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun", "Légers", "Modérés", "Importants", "Très importants"],
    tooltip: "Le terrain acide surcharge le rein comme émonctoire principal et favorise la lithiase urique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Lithiase & Terrain Acide",
    tags: ["acidose", "terrain"]
  },

  // ==========================================
  // IV. FONCTION RÉNALE & DRAINAGE
  // ==========================================
  {
    id: "uro_oedemes",
    question: "Avez-vous des œdèmes (chevilles, jambes, visage) ?",
    type: "select",
    options: ["Jamais", "Occasionnellement", "Régulièrement le soir", "Permanents", "Importants"],
    tooltip: "Les œdèmes traduisent une rétention hydrosodée. L'aldostérone régule la réabsorption du sodium et de l'eau au niveau rénal.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Fonction Rénale & Drainage",
    tags: ["oedemes", "retention", "pack_essentiel"]
  },
  {
    id: "uro_diurese",
    question: "Quelle est votre production d'urine quotidienne estimée ?",
    type: "select",
    options: ["Très faible (<0.5L)", "Faible (0.5-1L)", "Normale (1-2L)", "Importante (2-3L)", "Très importante (>3L)"],
    tooltip: "La diurèse normale est de 1-2L/jour. Une oligurie indique une déshydratation ou insuffisance rénale. Une polyurie peut indiquer un diabète.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Fonction Rénale & Drainage",
    tags: ["diurese", "volume"]
  },
  {
    id: "uro_couleur_urines",
    question: "Quelle est la couleur habituelle de vos urines ?",
    type: "select",
    options: ["Claire à jaune pâle", "Jaune normale", "Jaune foncée", "Orangée", "Rougeâtre ou brune"],
    tooltip: "La couleur des urines reflète l'hydratation et la fonction rénale. Des urines foncées indiquent une déshydratation.",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Fonction Rénale & Drainage",
    tags: ["urines", "couleur", "pack_essentiel"]
  },
  {
    id: "uro_soif_excessive",
    question: "Avez-vous une soif excessive ?",
    type: "select",
    options: ["Non", "Légèrement augmentée", "Souvent soif", "Soif intense", "Soif permanente"],
    tooltip: "La polydipsie (soif excessive) peut indiquer un diabète, une déshydratation chronique ou une dysrégulation de l'angiotensine II.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Fonction Rénale & Drainage",
    tags: ["soif", "polydipsie", "pack_essentiel"]
  },
  {
    id: "uro_insuffisance_renale",
    question: "Avez-vous une insuffisance rénale diagnostiquée ?",
    type: "select",
    options: ["Non", "Légère (stade 1-2)", "Modérée (stade 3)", "Sévère (stade 4-5)"],
    tooltip: "L'insuffisance rénale compromet la fonction émonctorielle. Les draineurs doux comme le Bouleau pubescent sont préférés.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Fonction Rénale & Drainage",
    tags: ["insuffisance_renale", "emonctoire"]
  },

  // ==========================================
  // V. PROSTATE (HOMMES)
  // ==========================================
  {
    id: "uro_prostate_antecedent",
    question: "[Hommes] Avez-vous des antécédents prostatiques ?",
    type: "select",
    options: ["Non concerné (femme)", "Non", "Adénome/Hypertrophie", "Prostatite", "Cancer traité"],
    tooltip: "L'adénome prostatique traduit un terrain hyper-androgénique avec congestion pelvienne. Le Séquoia est un décongestionnant prostatique.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Prostate (Hommes)",
    tags: ["prostate", "adenome", "pack_essentiel"]
  },
  {
    id: "uro_lourdeur_pelvienne",
    question: "[Hommes] Ressentez-vous une lourdeur ou gêne pelvienne ?",
    type: "select",
    options: ["Non concerné (femme)", "Jamais", "Rarement", "Parfois", "Souvent"],
    tooltip: "La lourdeur pelvienne traduit une congestion prostatique, aggravée par la sédentarité et la position assise prolongée.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Prostate (Hommes)",
    tags: ["pelvis", "congestion"]
  },
  {
    id: "uro_psa",
    question: "[Hommes] Quel est votre taux de PSA ?",
    type: "select",
    options: ["Non concerné (femme)", "Non connu", "Normal (<4)", "Limite (4-10)", "Élevé (>10)"],
    tooltip: "Le PSA est un marqueur de l'activité prostatique. Un taux élevé nécessite une investigation (hypertrophie vs cancer).",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Prostate (Hommes)",
    tags: ["psa", "prostate"]
  },

  // ==========================================
  // VI. DOULEURS & SIGNES RÉNAUX
  // ==========================================
  {
    id: "uro_douleur_lombaire",
    question: "Avez-vous des douleurs dans les fosses lombaires (bas du dos, côtés) ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Chroniquement"],
    tooltip: "Les douleurs des fosses lombaires peuvent indiquer une pyélonéphrite, un calcul ou une distension capsulaire rénale.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Douleurs & Signes Rénaux",
    tags: ["douleur", "lombaire", "pack_essentiel"]
  },
  {
    id: "uro_douleur_pelvienne",
    question: "Avez-vous des douleurs pelviennes chroniques ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Chroniquement"],
    tooltip: "Les douleurs pelviennes chroniques peuvent indiquer une prostatite chez l'homme, une cystite interstitielle ou une endométriose chez la femme.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Douleurs & Signes Rénaux",
    tags: ["douleur", "pelvis"]
  },
  {
    id: "uro_hypertension",
    question: "Avez-vous une hypertension artérielle ?",
    type: "select",
    options: ["Non", "Limite", "Oui, contrôlée", "Oui, mal contrôlée"],
    tooltip: "L'HTA peut avoir une origine rénale via le système rénine-angiotensine-aldostérone. L'angiotensine II provoque une vasoconstriction.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Douleurs & Signes Rénaux",
    tags: ["hta", "renine"]
  },

  // ==========================================
  // VII. FACTEURS AGGRAVANTS
  // ==========================================
  {
    id: "uro_constipation",
    question: "Êtes-vous constipé(e) ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Chroniquement"],
    tooltip: "La constipation favorise la congestion pelvienne et la translocation bactérienne vers les voies urinaires.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Facteurs Aggravants",
    tags: ["constipation", "congestion"]
  },
  {
    id: "uro_position_assise",
    question: "Passez-vous de longues heures en position assise ?",
    type: "select",
    options: ["Non", "2-4h/jour", "4-6h/jour", "Plus de 6h/jour"],
    tooltip: "La position assise prolongée favorise la congestion pelvienne et la stagnation veineuse/lymphatique.",
    weight: 1,
    priority: 3,
    scoreDirection: "hypo",
    section: "Facteurs Aggravants",
    tags: ["sedentarite", "congestion"]
  },
  {
    id: "uro_alimentation_acidifiante",
    question: "Consommez-vous beaucoup d'aliments acidifiants (viandes, sucres, alcool) ?",
    type: "select",
    options: ["Peu", "Modérément", "Beaucoup", "Très beaucoup"],
    tooltip: "L'alimentation acidifiante surcharge le rein comme émonctoire et favorise la lithiase urique.",
    weight: 1,
    priority: 3,
    scoreDirection: "hypo",
    section: "Facteurs Aggravants",
    tags: ["alimentation", "acidose"]
  },
  {
    id: "uro_medicaments_nephrotoxiques",
    question: "Prenez-vous régulièrement des médicaments potentiellement néphrotoxiques (AINS, aminosides) ?",
    type: "boolean",
    tooltip: "Certains médicaments sont néphrotoxiques : AINS, aminosides, produits de contraste. Ils doivent être surveillés.",
    weight: 1,
    priority: 3,
    scoreDirection: "hypo",
    section: "Facteurs Aggravants",
    tags: ["medicaments", "nephrotoxique"]
  },
  {
    id: "uro_diabete",
    question: "Êtes-vous diabétique ?",
    type: "select",
    options: ["Non", "Prédiabète", "Diabète type 2", "Diabète type 1"],
    tooltip: "Le diabète est une cause majeure de néphropathie. L'hyperglycémie chronique endommage les glomérules rénaux.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Facteurs Aggravants",
    tags: ["diabete", "nephropathie"]
  }
];

export default AxeUrorenalConfig;