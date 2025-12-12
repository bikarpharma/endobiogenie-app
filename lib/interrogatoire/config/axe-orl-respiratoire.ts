import type { QuestionConfig } from "../types";

/**
 * AXE ORL & RESPIRATOIRE - NOUVEAU MODULE
 * ========================================
 * 
 * Explore les voies respiratoires supérieures (ORL) et inférieures (broncho-pulmonaire)
 * 
 * LIENS ENDOBIOGÉNIQUES :
 * - SNA Para : Sécrétions (mucus, salive), congestion muqueuse
 * - SNA Alpha : Spasme, assèchement des muqueuses, vasoconstriction
 * - SNA Bêta : Bronchodilatation, décongestion
 * - Axe Thyréotrope : TRH/TSH = adénose (amygdales, végétations)
 * - Axe Corticotrope : Cortisol = anti-inflammatoire, anti-allergique
 * - Pancréas exocrine : Production de mucus
 * - Spasmophilie : Para↑ + Alpha↑ + Bêta bloqué = bronchospasme
 * 
 * PATHOLOGIES COUVERTES :
 * - ORL : Rhinite, sinusite, angine, otite, rhinopharyngite
 * - Respiratoire : Bronchite (sèche/productive), asthme, toux, dyspnée
 * 
 * TOTAL : 38 questions
 * - Priority 1 : 10 questions
 * - Priority 2 : 20 questions
 * - Priority 3 : 8 questions
 * 
 * Pack Essentiel : 8 questions
 */

const AxeORLRespiratoireConfig: QuestionConfig[] = [

  // ==========================================
  // SECTION 1 : VOIES AÉRIENNES SUPÉRIEURES (ORL)
  // Nez, sinus, gorge, oreilles
  // ==========================================
  {
    id: "orl_rhinite_frequence",
    question: "Avez-vous fréquemment le nez bouché ou qui coule (hors rhume) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Chronique"],
    tooltip: "La rhinite chronique indique une congestion muqueuse nasale. Elle peut être allergique (histamine, TRH élevée) ou vasomotrice (parasympathique).",
    weight: 2,
    priority: 1,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["pack_essentiel", "rhinite", "para_hyper"]
  },
  {
    id: "orl_sinusite_recurrente",
    question: "Souffrez-vous de sinusites récurrentes (douleur faciale, pression, maux de tête) ?",
    type: "select",
    options: ["Jamais", "1-2 fois/an", "3-4 fois/an", "Plus de 4 fois/an", "Chronique"],
    tooltip: "Les sinusites récurrentes indiquent une congestion des sinus avec surinfection. Lien avec pancréas exocrine (mucus) et immunité.",
    weight: 2,
    priority: 1,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["pack_essentiel", "sinusite", "infection"]
  },
  {
    id: "orl_angines_frequentes",
    question: "Faites-vous des angines à répétition ?",
    type: "select",
    options: ["Jamais", "1-2 fois/an", "3-4 fois/an", "Plus de 4 fois/an"],
    tooltip: "Les angines récurrentes indiquent une fragilité des amygdales, souvent liée à une TSH élevée (adénose) et une immunité déficiente.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["angine", "tsh_eleve", "immunite"]
  },
  {
    id: "orl_amygdales_grosses",
    question: "Avez-vous eu ou avez-vous des amygdales volumineuses (ou ablation) ?",
    type: "select",
    options: ["Non", "Volumineuses enfant", "Volumineuses adulte", "Amygdalectomie"],
    tooltip: "L'hypertrophie amygdalienne est un signe d'adénose liée à la TRH et TSH élevées. C'est un marqueur de terrain thyréotrope.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["adenose", "tsh_eleve", "trh_eleve"]
  },
  {
    id: "orl_vegetations",
    question: "Avez-vous eu des végétations adénoïdes (ou ablation) ?",
    type: "boolean",
    tooltip: "Les végétations adénoïdes sont un signe d'adénose (TRH élevée). Elles indiquent un terrain d'hyperplasie lymphoïde.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["adenose", "trh_eleve"]
  },
  {
    id: "orl_otites_frequentes",
    question: "Avez-vous des otites récurrentes (douleur d'oreille, écoulement) ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Fréquemment"],
    tooltip: "Les otites récurrentes indiquent une congestion de la trompe d'Eustache, souvent liée à une rhinopharyngite chronique et un terrain ORL fragile.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["otite", "infection"]
  },
  {
    id: "orl_rhinopharyngites",
    question: "Attrapez-vous facilement des rhumes ou rhinopharyngites ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "1-2/an", "3-4/an", "5-6/an", ">6/an"],
    tooltip: "Les rhinopharyngites fréquentes indiquent une fragilité immunitaire et une congestion ORL chronique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["rhinopharyngite", "immunite"]
  },
  {
    id: "orl_eternuements",
    question: "Avez-vous des crises d'éternuements (surtout le matin ou au contact de poussière) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Quotidien"],
    tooltip: "Les éternuements en salves indiquent une hyperréactivité nasale, souvent allergique (histamine) ou liée au parasympathique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["allergie", "histamine", "para_hyper"]
  },
  {
    id: "orl_gorge_seche",
    question: "Avez-vous souvent la gorge sèche ou irritée ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Chronique"],
    tooltip: "La sécheresse pharyngée peut indiquer un excès alpha-sympathique (assèchement) ou un reflux gastro-œsophagien.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["alpha_hyper", "secheresse"]
  },
  {
    id: "orl_voix_enrouee",
    question: "Avez-vous souvent la voix enrouée ou fatiguée ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Chronique"],
    tooltip: "L'enrouement chronique peut être dû à un reflux, une laryngite chronique ou une hypothyroïdie (infiltration des cordes vocales).",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Voies aériennes supérieures",
    tags: ["laryngite", "hypothyroidie"]
  },

  // ==========================================
  // SECTION 2 : ALLERGIES RESPIRATOIRES
  // Rhinite allergique, asthme allergique
  // ==========================================
  {
    id: "resp_allergie_respiratoire",
    question: "Souffrez-vous d'allergies respiratoires (pollens, acariens, poils d'animaux) ?",
    type: "boolean",
    tooltip: "L'allergie respiratoire traduit une hyperréactivité immunitaire avec libération d'histamine. Lien avec TRH élevée et dégranulation des mastocytes.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Allergies respiratoires",
    tags: ["pack_essentiel", "allergie", "histamine", "trh_eleve"]
  },
  {
    id: "resp_allergie_saisonniere",
    question: "Vos allergies sont-elles saisonnières (printemps surtout) ?",
    type: "boolean",
    tooltip: "L'allergie printanière (rhume des foins) traduit une relance adaptative thyréotrope au changement de saison.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Allergies respiratoires",
    tags: ["allergie", "saisonnier", "thyreotrope"]
  },
  {
    id: "resp_allergie_perannuelle",
    question: "Vos allergies sont-elles présentes toute l'année (acariens, moisissures) ?",
    type: "boolean",
    tooltip: "L'allergie perannuelle indique un terrain allergique de fond avec hyperréactivité immunitaire chronique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Allergies respiratoires",
    tags: ["allergie", "chronique"]
  },
  {
    id: "resp_conjonctivite_allergique",
    question: "Avez-vous les yeux qui piquent, pleurent ou gonflent lors d'allergies ?",
    type: "boolean",
    tooltip: "La conjonctivite allergique accompagne souvent la rhinite allergique (rhino-conjonctivite). C'est une manifestation histaminique.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Allergies respiratoires",
    tags: ["allergie", "histamine"]
  },

  // ==========================================
  // SECTION 3 : VOIES RESPIRATOIRES BASSES
  // Bronches, poumons
  // ==========================================
  {
    id: "resp_asthme",
    question: "Avez-vous de l'asthme diagnostiqué ou des épisodes de gêne respiratoire avec sifflements ?",
    type: "select",
    options: ["Non", "Dans l'enfance (guéri)", "Actif léger", "Actif modéré", "Actif sévère"],
    tooltip: "L'asthme est un bronchospasme avec inflammation. Il traduit souvent une spasmophilie (Para↑ + Alpha↑ + Bêta bloqué) et une TRH élevée.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Voies respiratoires basses",
    tags: ["pack_essentiel", "asthme", "spasmophilie"]
  },
  {
    id: "resp_asthme_effort",
    question: "Avez-vous de l'asthme déclenché par l'effort physique ?",
    type: "boolean",
    tooltip: "L'asthme d'effort traduit une difficulté d'adaptation bronchique à l'exercice. Lien avec axe corticotrope et SNA.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Voies respiratoires basses",
    tags: ["asthme", "effort", "cortico"]
  },
  {
    id: "resp_bronchites_frequentes",
    question: "Faites-vous des bronchites à répétition ?",
    type: "select",
    options: ["Jamais", "1-2 fois/an", "3-4 fois/an", "Plus de 4 fois/an"],
    tooltip: "Les bronchites récurrentes indiquent une fragilité bronchique avec terrain infectieux. Lien avec pancréas exocrine et immunité.",
    weight: 2,
    priority: 1,
    scoreDirection: "hyper",
    section: "Voies respiratoires basses",
    tags: ["pack_essentiel", "bronchite", "infection"]
  },
  {
    id: "resp_bronchite_trainante",
    question: "Vos bronchites durent-elles plus de 2-3 semaines ?",
    type: "boolean",
    tooltip: "Une bronchite traînante indique une difficulté de résolution inflammatoire, souvent liée à une insuffisance corticotrope.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Voies respiratoires basses",
    tags: ["bronchite", "cortico_insuffisant"]
  },
  {
    id: "resp_dyspnee_effort",
    question: "Êtes-vous essoufflé(e) à l'effort modéré (montée d'escaliers) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Effort intense", "Effort modéré", "Effort léger", "Au repos"],
    tooltip: "La dyspnée d'effort peut indiquer une insuffisance respiratoire, cardiaque ou un déconditionnement.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Voies respiratoires basses",
    tags: ["dyspnee", "capacite_respiratoire"]
  },
  {
    id: "resp_oppression_thoracique",
    question: "Ressentez-vous une oppression thoracique ou une difficulté à inspirer profondément ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Chronique"],
    tooltip: "L'oppression thoracique peut être liée à un bronchospasme, une spasmophilie ou une anxiété avec hyperventilation.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Voies respiratoires basses",
    tags: ["spasmophilie", "anxiete"]
  },

  // ==========================================
  // SECTION 4 : TOUX
  // Sèche vs productive
  // ==========================================
  {
    id: "resp_toux_chronique",
    question: "Avez-vous une toux chronique (plus de 3 semaines) ?",
    type: "boolean",
    tooltip: "La toux chronique nécessite une exploration (reflux, asthme, bronchite chronique, médicaments). C'est un signe d'irritation bronchique.",
    weight: 2,
    priority: 1,
    scoreDirection: "hyper",
    section: "Toux",
    tags: ["pack_essentiel", "toux", "chronique"]
  },
  {
    id: "resp_toux_type",
    question: "Votre toux est-elle plutôt sèche ou grasse (avec crachats) ?",
    type: "select",
    options: ["Pas de toux", "Sèche irritative", "Grasse productive", "Les deux selon les moments"],
    tooltip: "Toux sèche = inflammation, mucus insuffisant (hyper alpha). Toux grasse = hypersécrétion (hyper para, pancréas exocrine).",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Toux",
    tags: ["toux", "secretions"]
  },
  {
    id: "resp_toux_nocturne",
    question: "Toussez-vous surtout la nuit ou en position allongée ?",
    type: "boolean",
    tooltip: "La toux nocturne peut indiquer un reflux gastro-œsophagien, un écoulement nasal postérieur ou un asthme.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Toux",
    tags: ["toux", "nocturne", "reflux"]
  },
  {
    id: "resp_toux_matin",
    question: "Avez-vous une toux productive le matin au réveil ?",
    type: "boolean",
    tooltip: "La toux matinale productive est typique de la bronchite chronique (bronchorrhée). Elle traduit une accumulation nocturne de sécrétions.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Toux",
    tags: ["toux", "bronchite_chronique"]
  },
  {
    id: "resp_crachats_couleur",
    question: "Vos crachats sont-ils colorés (jaune, vert) lors des infections ?",
    type: "boolean",
    tooltip: "Les crachats colorés indiquent une surinfection bactérienne. Les crachats clairs sont plutôt viraux ou allergiques.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Toux",
    tags: ["infection", "bacterien"]
  },

  // ==========================================
  // SECTION 5 : MUCUS & SÉCRÉTIONS
  // Production de mucus
  // ==========================================
  {
    id: "resp_mucus_abondant",
    question: "Produisez-vous beaucoup de mucus (nez, gorge, bronches) ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Peu", "Modérément", "Beaucoup", "Excessivement"],
    tooltip: "L'hypersécrétion de mucus est liée au parasympathique et au pancréas exocrine. Elle peut être aggravée par les laitages et le gluten.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Mucus & Sécrétions",
    tags: ["mucus", "para_hyper", "pancreas_exocrine"]
  },
  {
    id: "resp_mucus_epais",
    question: "Votre mucus est-il épais et difficile à expectorer ?",
    type: "boolean",
    tooltip: "Le mucus épais indique un pancréas exocrine insuffisant ou une déshydratation. Il nécessite des mucolytiques.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Mucus & Sécrétions",
    tags: ["mucus", "pancreas_insuffisant"]
  },
  {
    id: "resp_mucus_laitages",
    question: "La production de mucus augmente-t-elle avec les laitages ?",
    type: "boolean",
    tooltip: "L'aggravation par les laitages est typique d'une sollicitation du pancréas exocrine. C'est un signe de terrain mucogène.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Mucus & Sécrétions",
    tags: ["mucus", "laitages", "pancreas_exocrine"]
  },
  {
    id: "resp_ecoulement_posterieur",
    question: "Avez-vous un écoulement nasal postérieur (sensation de mucus dans la gorge) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Permanent"],
    tooltip: "L'écoulement postérieur (post-nasal drip) provoque une toux chronique et un raclement de gorge. Il vient des sinus ou du nez.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Mucus & Sécrétions",
    tags: ["ecoulement_posterieur", "sinusite"]
  },

  // ==========================================
  // SECTION 6 : TERRAIN & ANTÉCÉDENTS
  // Historique respiratoire
  // ==========================================
  {
    id: "resp_infections_enfance",
    question: "Avez-vous eu des infections ORL/respiratoires fréquentes dans l'enfance ?",
    type: "boolean",
    tooltip: "Les infections récurrentes de l'enfance indiquent un terrain de fragilité ORL et une programmation immunitaire déficiente.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Terrain & Antécédents",
    tags: ["antecedents", "enfance", "immunite"]
  },
  {
    id: "resp_tabac",
    question: "Fumez-vous ou avez-vous fumé ?",
    type: "select",
    options: ["Jamais fumé", "Ex-fumeur >10 ans", "Ex-fumeur <10 ans", "Fumeur actif <10 cig/j", "Fumeur actif >10 cig/j"],
    tooltip: "Le tabac est le principal facteur de risque de bronchite chronique et BPCO. Il provoque inflammation et hypersécrétion.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Terrain & Antécédents",
    tags: ["pack_essentiel", "tabac", "facteur_risque"]
  },
  {
    id: "resp_terrain_atopique",
    question: "Avez-vous un terrain atopique (eczéma + asthme + rhinite allergique) ?",
    type: "boolean",
    tooltip: "La triade atopique (eczéma, asthme, rhinite) indique un terrain allergique génétique avec hyperréactivité immunitaire.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Terrain & Antécédents",
    tags: ["atopie", "allergie", "genetique"]
  },
  {
    id: "resp_antecedents_familiaux",
    question: "Avez-vous des antécédents familiaux d'asthme ou d'allergies ?",
    type: "boolean",
    tooltip: "Les antécédents familiaux d'atopie augmentent le risque d'allergies et d'asthme chez le patient.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Terrain & Antécédents",
    tags: ["antecedents", "familiaux", "genetique"]
  },
  {
    id: "resp_bpco",
    question: "Avez-vous une bronchopneumopathie chronique obstructive (BPCO) diagnostiquée ?",
    type: "boolean",
    tooltip: "La BPCO est une maladie chronique obstructive, souvent post-tabagique, avec inflammation et destruction pulmonaire progressive.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Terrain & Antécédents",
    tags: ["bpco", "chronique", "obstructif"]
  },
  {
    id: "resp_traitement_fond",
    question: "Prenez-vous un traitement de fond respiratoire (corticoïdes inhalés, bronchodilatateurs) ?",
    type: "boolean",
    tooltip: "Le traitement de fond indique un asthme ou une BPCO nécessitant une prise en charge régulière.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Terrain & Antécédents",
    tags: ["traitement", "medicaments"]
  },
  {
    id: "resp_amelioration_mer",
    question: "Votre état respiratoire s'améliore-t-il au bord de la mer ?",
    type: "boolean",
    tooltip: "L'amélioration au bord de la mer indique un terrain allergique qui bénéficie de l'air marin iodé et moins allergisant.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Terrain & Antécédents",
    tags: ["allergie", "environnement"]
  },
  {
    id: "resp_aggravation_humidite",
    question: "Votre état respiratoire s'aggrave-t-il par temps humide ou froid ?",
    type: "boolean",
    tooltip: "L'aggravation par l'humidité/froid indique une sensibilité bronchique avec terrain de bronchospasme.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Terrain & Antécédents",
    tags: ["bronchospasme", "meteo"]
  }
];

export default AxeORLRespiratoireConfig;