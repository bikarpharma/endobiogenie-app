import type { QuestionConfig } from "../types";

/**
 * AXE SOMATOTROPE - VERSION ENRICHIE
 * Évalue l'axe de la croissance, du métabolisme et de la nutrition cellulaire
 * 
 * HORMONES CLÉS :
 * - GH (Hormone de Croissance) : distribution des nutriments, croissance verticale
 * - Prolactine (PL) : rythme les boucles, angiogenèse, adaptation, croissance horizontale
 * - IGF-1 : croissance cellulaire, adhésion, mitogenèse
 * - Insuline : entrée du glucose, stockage, anabolisme final
 * - Glucagon : libération glucose, adaptation énergétique
 * - Somatostatine : frein de l'anabolisme
 * 
 * 
 * AUDIT : Décembre 2024
 * TOTAL : 45 questions (+15 par rapport à version initiale)
 * - Priority 1 (ESSENTIEL) : 12 questions
 * - Priority 2 (IMPORTANT) : 22 questions
 * - Priority 3 (OPTIONNEL) : 11 questions
 * 
 * PACK ESSENTIEL (Mode Rapide) : 10 questions
 * somato_croissance_rapide, somato_cicatrices_cheloides, somato_hypoglycemie,
 * somato_polypes_kystes, somato_fatigue_generale, somato_envies_sucre,
 * somato_amygdales_hypertrophiees, somato_adiposite_proximale,
 * somato_furoncles, somato_sensation_froid
 */

const AxeSomatotropeConfig: QuestionConfig[] = [
  // ==========================================
  // I. CROISSANCE & DÉVELOPPEMENT (GH & Prolactine)
  // ==========================================
  {
    id: "somato_croissance_rapide",
    question: "Avez-vous connu une croissance rapide pendant l'enfance ou l'adolescence ?",
    type: "boolean",
    tooltip: "Signe d'activité GH prépondérante. L'hormone de croissance gère la distribution des nutriments pour la croissance. Une croissance rapide indique une GH forte avec un score de croissance élevé..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Croissance & Développement",
    tags: ["gh_forte", "croissance", "pack_essentiel"]
  },
  {
    id: "somato_grande_taille",
    question: "Êtes-vous plus grand(e) que la moyenne de votre famille ?",
    type: "boolean",
    tooltip: "La longueur des os est influencée par la GH et l'IGF-1. Une grande taille relative suggère une prédominance de la GH sur la prolactine dans la structuration osseuse..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Croissance & Développement",
    tags: ["gh_preponderante", "os_longs"]
  },
  {
    id: "somato_ossature_large",
    question: "Avez-vous une ossature large (poignets, chevilles épais) ?",
    type: "boolean",
    tooltip: "La largeur des os est sous l'influence de la prolactine. Une ossature large indique une prolactine prépondérante en structure..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Croissance & Développement",
    tags: ["prolactine_preponderante", "structure_osseuse"]
  },
  {
    id: "somato_pieds_plats",
    question: "Avez-vous les pieds plats (voûte plantaire affaissée) ?",
    type: "boolean",
    tooltip: "La voûte plate est un signe de prolactine prédominante, sûrement excessive. C'est un marqueur constitutionnel de l'axe somatotrope..",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Croissance & Développement",
    tags: ["prolactine_excessive", "constitutionnel"]
  },
  {
    id: "somato_hallux_valgus",
    question: "Avez-vous un hallux valgus (oignon au pied) ?",
    type: "boolean",
    tooltip: "L'hallux valgus est un signe de GH excessive. C'est une déformation liée à une croissance osseuse excessive au niveau du premier métatarse..",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Croissance & Développement",
    tags: ["gh_excessive", "deformation_osseuse"]
  },
  // NOUVEAU - 
  {
    id: "somato_sternum_convexe",
    question: "Avez-vous un thorax proéminent ou bombé (sternum convexe) ?",
    type: "boolean",
    tooltip: "Le sternum convexe (pectus carinatum) est un signe de GH hyperfonctionnante. C'est un marqueur de croissance cartilagineuse excessive durant le développement..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Croissance & Développement",
    tags: ["gh_hyperfonctionnement", "thorax"]
  },

  // ==========================================
  // II. SIGNES TÊTE & PHANÈRES (GH)
  // NOUVEAU - Questions ajoutées
  // ==========================================
  {
    id: "somato_cheveux_poussent_vite",
    question: "Vos cheveux poussent-ils rapidement et facilement ?",
    type: "boolean",
    tooltip: "Une chevelure avec une capacité à beaucoup grandir est un signe de GH forte. La vitesse de croissance des cheveux reflète l'activité de l'hormone de croissance..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Tête & Phanères",
    tags: ["gh_forte", "cheveux"]
  },
  {
    id: "somato_sourcils_proeminents",
    question: "Avez-vous des sourcils proéminents (arcade sourcilière marquée) ?",
    type: "boolean",
    tooltip: "Les sourcils proéminents sont un signe de GH prépondérante. L'arcade sourcilière développée traduit une activité de l'hormone de croissance sur la structure osseuse faciale..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Tête & Phanères",
    tags: ["gh_preponderante", "structure_faciale"]
  },
  {
    id: "somato_cils_epais",
    question: "Avez-vous des cils naturellement épais et denses ?",
    type: "boolean",
    tooltip: "Des cils épais et chevauchants sont un signe de GH prépondérante. La densité des cils reflète l'activité de l'hormone de croissance sur les phanères..",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Signes Tête & Phanères",
    tags: ["gh_preponderante", "phaneres"]
  },

  // ==========================================
  // III. CICATRISATION & TISSU CONJONCTIF
  // ==========================================
  {
    id: "somato_cicatrices_cheloides",
    question: "Vos cicatrices ont-elles tendance à être épaisses, boursouflées (chéloïdes) ?",
    type: "boolean",
    tooltip: "Signe majeur de GH hyperfonctionnante. Les chéloïdes traduisent une production excessive de collagène par hyperactivité de l'axe somatotrope. C'est un terrain prolifératif..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Cicatrisation",
    tags: ["gh_hyperfonctionnement", "terrain_proliferatif", "pack_essentiel"]
  },
  {
    id: "somato_cicatrices_prurigineuses",
    question: "Vos cicatrices vous démangent-elles souvent ?",
    type: "boolean",
    tooltip: "Les cicatrices prurigineuses sont un signe de GH hyperfonctionnante. L'activité excessive de la GH stimule la production de tissu conjonctif et l'inflammation locale..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Cicatrisation",
    tags: ["gh_hyperfonctionnement", "inflammation"]
  },
  {
    id: "somato_retard_cicatrisation",
    question: "Vos blessures mettent-elles longtemps à cicatriser ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Un retard de cicatrisation peut indiquer soit un excès de GH (catabolisme du collagène), soit une insuffisance (manque de facteurs de croissance). À corréler avec le terrain global..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Cicatrisation",
    tags: ["cicatrisation_alteree", "igf1_insuffisant"]
  },

  // ==========================================
  // IV. MÉTABOLISME DU GLUCOSE & INSULINE
  // ==========================================
  {
    id: "somato_hypoglycemie",
    question: "Ressentez-vous des malaises si vous sautez un repas (tremblements, sueurs, faiblesse) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'hypoglycémie réactionnelle. Le glucagon et l'adrénaline libèrent le glucose des réserves. Une hypoglycémie fréquente traduit un déséquilibre GH-insuline avec résistance à l'insuline insuffisante..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Métabolisme Glucose",
    tags: ["hypoglycemie", "glucagon", "pack_essentiel"]
  },
  {
    id: "somato_envies_sucre",
    question: "Avez-vous des envies impérieuses de sucre, surtout après les repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'hyperinsulinisme réactif. L'insuline est l'unique hormone hypoglycémiante. Des envies de sucre post-prandiales traduisent une réponse insulinique excessive avec hypoglycémie secondaire..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Métabolisme Glucose",
    tags: ["hyperinsulinisme", "resistance_insuline", "pack_essentiel"]
  },
  {
    id: "somato_somnolence_postprandiale",
    question: "Avez-vous une somnolence importante après les repas riches en glucides ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'hyperinsulinisme. L'entrée massive de glucose dans les cellules provoque une hypoglycémie cérébrale transitoire. La TRH stimule l'insuline (axe thyreo-somatotrope)..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Métabolisme Glucose",
    tags: ["hyperinsulinisme", "metabolisme_central"]
  },
  {
    id: "somato_adiposite_proximale",
    question: "Avez-vous une prise de poids localisée au niveau du tronc (ventre, hanches) avec membres fins ?",
    type: "boolean",
    tooltip: "Signe d'insuline excessive et typiquement réactive avec hyperfonctionnement. L'adiposité proximale traduit une distribution lipidique sous contrôle de l'insuline..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Métabolisme Glucose",
    tags: ["insuline_excessive", "adiposite", "pack_essentiel"]
  },
  {
    id: "somato_prise_poids_facile",
    question: "Prenez-vous du poids facilement, même avec une alimentation normale ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de fonction insuline diminuée ou résistance à l'insuline. L'insuline gère le stockage des nutriments. Une prise de poids facile traduit un déséquilibre somatotrope..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Métabolisme Glucose",
    tags: ["insuline", "metabolisme"]
  },

  // ==========================================
  // V. PANCRÉAS & DIGESTION
  // ==========================================
  {
    id: "somato_amygdales_hypertrophiees",
    question: "Avez-vous ou avez-vous eu des amygdales volumineuses (hypertrophiées) ?",
    type: "boolean",
    tooltip: "Signe majeur de pancréas exocrine congestionné et sur-sollicité. L'hypertrophie des amygdales traduit une sollicitation excessive de l'axe thyreo-somatotrope (TSH → Pancréas exocrine)..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Pancréas & Digestion",
    tags: ["pancreas_congestionne", "tsh_elevee", "pack_essentiel"]
  },
  {
    id: "somato_sinusites_recurrentes",
    question: "Faites-vous des sinusites ou rhinites à répétition ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de pancréas exocrine sur-sollicité. Les infections ORL récurrentes (sinus, amygdales) traduisent une congestion du pancréas exocrine avec production excessive de mucus..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Pancréas & Digestion",
    tags: ["pancreas_sursollicite", "orl_recurrent"]
  },
  {
    id: "somato_levres_epaisses",
    question: "Avez-vous les lèvres naturellement pleines et épaisses ?",
    type: "boolean",
    tooltip: "Signe de pancréas congestionné. Les lèvres pleines et épaisses sont un marqueur constitutionnel de l'activité du pancréas exocrine..",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Pancréas & Digestion",
    tags: ["pancreas_congestionne", "constitutionnel"]
  },
  {
    id: "somato_langue_empreinte_dents",
    question: "Votre langue porte-t-elle l'empreinte de vos dents sur les bords ?",
    type: "boolean",
    tooltip: "Signe de GH excessive. Une langue grande, épaisse, avec empreinte des dents traduit une hormone de croissance excessive. C'est un marqueur de terrain prolifératif..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Pancréas & Digestion",
    tags: ["gh_excessive", "terrain_proliferatif"]
  },
  {
    id: "somato_aphtes_frequents",
    question: "Faites-vous souvent des aphtes buccaux ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les ulcères aphteux sont un signe de GH hyperfonctionnante. Ils traduisent une activité excessive de l'axe somatotrope avec inflammation des muqueuses..",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Pancréas & Digestion",
    tags: ["gh_hyperfonctionnement", "muqueuses"]
  },
  // NOUVEAU - 
  {
    id: "somato_dents_espacees",
    question: "Vos dents sont-elles naturellement largement espacées ?",
    type: "boolean",
    tooltip: "Des dents largement espacées sont un signe de GH forte. L'espacement dentaire traduit une activité de l'hormone de croissance sur la structure maxillaire..",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Pancréas & Digestion",
    tags: ["gh_forte", "structure_dentaire"]
  },
  // NOUVEAU - 
  {
    id: "somato_langue_fissuree",
    question: "Votre langue présente-t-elle des fissures (langue géographique) ?",
    type: "boolean",
    tooltip: "Une langue fissurée est un signe de GH hyperfonctionnante. Les fissures linguales traduisent une activité excessive de l'hormone de croissance sur les tissus épithéliaux..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Pancréas & Digestion",
    tags: ["gh_hyperfonctionnement", "langue"]
  },
  // NOUVEAU - 
  {
    id: "somato_sensibilite_pancreas",
    question: "Ressentez-vous une sensibilité ou douleur à la palpation au-dessus du nombril ?",
    type: "boolean",
    tooltip: "Une douleur à mi-distance entre l'ombilic et l'appendice xyphoïde indique une congestion du pancréas. C'est un signe de sollicitation excessive du pancréas exocrine et/ou endocrine..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Pancréas & Digestion",
    tags: ["pancreas_congestionne", "examen_clinique"]
  },

  // ==========================================
  // VI. TERRAIN PROLIFÉRATIF (Adénose)
  // ==========================================
  {
    id: "somato_polypes_kystes",
    question: "Avez-vous ou avez-vous eu des polypes, kystes ou fibromes ?",
    type: "boolean",
    tooltip: "Signe majeur de terrain prolifératif somatotrope. Les polypes (adénose), kystes et fibromes traduisent un hyperfonctionnement du couplage gonado-thyreo-somatotrope avec prééminence de la prolactine (kystes) ou de la GH (adénomes)..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Terrain Prolifératif",
    tags: ["adenose", "terrain_proliferatif", "pack_essentiel"]
  },
  {
    id: "somato_lipomes",
    question: "Avez-vous des lipomes (boules de graisse sous la peau) ?",
    type: "boolean",
    tooltip: "Les lipomes sont un signe d'adaptation structurelle somatotrope. Ils traduisent une tendance à l'accumulation lipidique par hyperfonctionnement de l'axe..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Terrain Prolifératif",
    tags: ["adaptation_structurelle", "lipome"]
  },
  {
    id: "somato_antecedents_cancer",
    question: "Y a-t-il des antécédents de cancer dans votre famille proche ?",
    type: "boolean",
    tooltip: "Terrain à surveiller. La prolactine favorise la néo-angiogenèse et la croissance tumorale. Un terrain familial oncologique indique une vigilance sur l'axe somatotrope..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Terrain Prolifératif",
    tags: ["terrain_oncologique", "hereditaire"]
  },
  // NOUVEAU - 
  {
    id: "somato_hyperplasie",
    question: "Avez-vous des tendances à l'hypertrophie tissulaire (végétations, ganglions, thyroïde) ?",
    type: "boolean",
    tooltip: "L'hyperplasie et l'hypertrophie tissulaire sont des signes de terrain prolifératif somatotrope. Cela inclut l'hypertrophie des amygdales, des végétations adénoïdes, et des nodules thyroïdiens..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Terrain Prolifératif",
    tags: ["hyperplasie", "terrain_proliferatif"]
  },

  // ==========================================
  // VII. SIGNES CUTANÉS & PHANÈRES
  // ==========================================
  {
    id: "somato_taches_rousseur",
    question: "Avez-vous beaucoup de taches de rousseur ?",
    type: "boolean",
    tooltip: "Signe de prolactine importante. Les taches de rousseur sont un marqueur constitutionnel d'une activité élevée de la prolactine..",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["prolactine_importante", "constitutionnel"]
  },
  {
    id: "somato_peau_pale_laiteuse",
    question: "Avez-vous naturellement une peau très pâle, laiteuse ?",
    type: "boolean",
    tooltip: "Signe de prolactine importante et hyperfonctionnante. La couleur pâle, laiteuse de la peau est caractéristique d'une prédominance de l'axe somatotrope via la prolactine..",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["prolactine_hyperfonctionnante", "constitutionnel"]
  },
  {
    id: "somato_ongles_epais",
    question: "Avez-vous des ongles naturellement épais et résistants ?",
    type: "boolean",
    tooltip: "Signe de GH prédominante. Des ongles épais et résistants traduisent une bonne activité de l'hormone de croissance sur les phanères..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["gh_predominante", "phaneres"]
  },
  {
    id: "somato_acne_pustuleuse",
    question: "Avez-vous ou avez-vous eu de l'acné avec du pus (pustules) ?",
    type: "boolean",
    tooltip: "Signe de prolactine hyperfonctionnante. L'acné purulente (pustuleuse) est spécifiquement liée à l'hyperactivité de la prolactine, contrairement à l'acné inflammatoire simple..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["prolactine_hyperfonctionnement", "acne"]
  },
  // NOUVEAU -  (Question critique manquante)
  {
    id: "somato_furoncles",
    question: "Faites-vous des furoncles à répétition ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les furoncles récidivants sont un signe de prolactine excessive. Ils traduisent une hyperactivité de la prolactine avec inflammation suppurative. C'est un marqueur important du terrain somatotrope..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["prolactine_excessive", "infection_cutanee", "pack_essentiel"]
  },
  // NOUVEAU - 
  {
    id: "somato_keratose_pilaire",
    question: "Avez-vous des petits boutons rugueux sur les bras ou les cuisses (kératose pilaire) ?",
    type: "boolean",
    tooltip: "La kératose pilaire est un signe de GH hyperfonctionnante. Elle traduit une production excessive de kératine par hyperactivité de l'axe somatotrope..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["gh_hyperfonctionnement", "keratose"]
  },
  // NOUVEAU - 
  {
    id: "somato_tissu_sous_cutane_dense",
    question: "Votre tissu sous-cutané est-il particulièrement dense ou infiltré ?",
    type: "boolean",
    tooltip: "Un tissu sous-cutané infiltré, dense ou ligneux est un signe de prolactine importante. C'est un marqueur de l'activité de la prolactine sur les tissus conjonctifs..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["prolactine_importante", "tissu_conjonctif"]
  },
  // NOUVEAU - 
  {
    id: "somato_ongles_ponctues",
    question: "Vos ongles présentent-ils des dépressions ponctuées (ongles en dé à coudre) ?",
    type: "boolean",
    tooltip: "Les ongles ponctués sont un signe de GH hyperfonctionnante. Ces dépressions traduisent une activité excessive de l'hormone de croissance sur la matrice unguéale..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["gh_hyperfonctionnante", "phaneres"]
  },

  // ==========================================
  // VIII. SIGNES THORAX & SEINS
  // NOUVEAU - Section ajoutée
  // ==========================================
  {
    id: "somato_seins_sous_developpes",
    question: "(Femmes) Vos seins sont-ils naturellement petits ou sous-développés ?",
    type: "boolean",
    tooltip: "Des seins sous-développés en structure sont un signe de prolactine diminuée. La prolactine est essentielle au développement mammaire..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Signes Thorax & Seins",
    tags: ["prolactine_diminuee", "sein", "femme"]
  },
  {
    id: "somato_seins_volumineux",
    question: "(Femmes) Vos seins sont-ils naturellement volumineux ?",
    type: "boolean",
    tooltip: "Des seins volumineux sont un signe de prolactine importante. La prolactine stimule le développement et la densité du tissu mammaire..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Thorax & Seins",
    tags: ["prolactine_importante", "sein", "femme"]
  },

  // ==========================================
  // IX. SIGNES EXTRÉMITÉS & DOS
  // NOUVEAU - Section ajoutée
  // ==========================================
  {
    id: "somato_mains_oedeme",
    question: "Avez-vous souvent les mains ou les doigts gonflés (œdémateux) ?",
    type: "boolean",
    tooltip: "Les mains ou le dos des mains œdémateux sont un signe de prolactine hyperfonctionnante. L'œdème distal traduit une activité excessive de la prolactine sur la perméabilité vasculaire..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Extrémités",
    tags: ["prolactine_hyperfonctionnement", "oedeme"]
  },
  {
    id: "somato_genou_droit_empate",
    question: "Avez-vous le genou droit épaissi ou empâté par rapport au gauche ?",
    type: "boolean",
    tooltip: "Un genou droit empâté est un signe de surfonctionnement FSH-TSH-GH. C'est un marqueur de l'hyperactivité du couplage gonado-thyreo-somatotrope..",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Signes Extrémités",
    tags: ["couplage_gonado_thyreo_somato", "examen_clinique"]
  },
  {
    id: "somato_douleur_epaule_gauche",
    question: "Avez-vous une sensibilité ou douleur chronique au niveau de l'épaule gauche (T7-T8) ?",
    type: "boolean",
    tooltip: "Une douleur à l'épaule gauche (infero-médian, T7-T8) à la palpation est un signe de TSH et prolactine sur-sollicitées. C'est un point de projection de l'axe somatotrope..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Extrémités",
    tags: ["tsh_sursollicitee", "prolactine_sursollicitee", "projection_dorsale"]
  },

  // ==========================================
  // X. TEMPÉRAMENT & MÉTABOLISME GÉNÉRAL
  // NOUVEAU - Section ajoutée
  // ==========================================
  {
    id: "somato_fatigue_generale",
    question: "Ressentez-vous une fatigue générale persistante ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Une fatigue générale peut indiquer une prolactine insuffisante ou excessive. La prolactine rythme les boucles endocrines et assure l'adaptabilité énergétique..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Tempérament & Métabolisme",
    tags: ["prolactine", "fatigue", "pack_essentiel"]
  },
  {
    id: "somato_sensation_froid",
    question: "Avez-vous souvent une sensation générale de froid, même quand il fait bon ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Une sensation générale de froid est un signe de prolactine excessive et prédominante. La prolactine influence la thermorégulation via son effet sur le métabolisme basal..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Tempérament & Métabolisme",
    tags: ["prolactine_excessive", "thermoregulation", "pack_essentiel"]
  },
  // NOUVEAU -  (Cycles féminins)
  {
    id: "somato_cycles_irreguliers_prl",
    question: "(Femmes) Avez-vous des cycles menstruels irréguliers ?",
    type: "boolean",
    tooltip: "Des cycles menstruels irréguliers peuvent indiquer une prolactine insuffisante. La prolactine rythme les boucles gonadotropes et influence la régularité du cycle..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Tempérament & Métabolisme",
    tags: ["prolactine_insuffisante", "cycle_menstruel", "femme"]
  },

  // ==========================================
  // XI. DÉSYNCHRONISATION SOMATOTROPE
  // ==========================================
  {
    id: "somato_fibromyalgie",
    question: "Souffrez-vous de fibromyalgie ou de douleurs musculaires diffuses chroniques ?",
    type: "boolean",
    tooltip: "La fibromyalgie peut être liée à une désynchronisation somatotrope : retard de l'activité GH avec faible résistance à l'insuline. On observe un score faible de GH, une activité insuline élevée et des radicaux libres nocifs. Traitement : réduire l'alpha et relancer la GH (Lamium album)..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Désynchronisation",
    tags: ["desynchronisation_somatotrope", "fibromyalgie"]
  },
  {
    id: "somato_maladies_autoimmunes",
    question: "Avez-vous une maladie auto-immune diagnostiquée (Crohn, SEP, polyarthrite...) ?",
    type: "boolean",
    tooltip: "Les maladies auto-immunes peuvent impliquer une désynchronisation somatotrope avec retard de l'activité GH. La maladie de Crohn, la sclérose en plaques et la polyarthrite sont citées. Traitement : réduire l'alpha, inhiber la TSH, relancer la GH avec Lamium album..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Désynchronisation",
    tags: ["desynchronisation_somatotrope", "autoimmunite"]
  },
  // NOUVEAU -  
  {
    id: "somato_osteoporose",
    question: "Avez-vous ou avez-vous eu de l'ostéoporose ou une fragilité osseuse ?",
    type: "boolean",
    tooltip: "L'ostéoporose est un signe de prolactine excessive. La prolactine en excès favorise la résorption osseuse et diminue la densité minérale. C'est un marqueur de déséquilibre somatotrope..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Désynchronisation",
    tags: ["prolactine_excessive", "os"]
  }
];

export default AxeSomatotropeConfig;