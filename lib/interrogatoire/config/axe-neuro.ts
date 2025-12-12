import type { QuestionConfig } from "../types";

/**
 * AXE NEUROVÉGÉTATIF (SNA) - VERSION ENRICHIE
 * ===================================================
 * 
 * Discrimine les 3 branches du système nerveux autonome :
 * - PARASYMPATHIQUE (Para/πΣ) : Initiation, repos, digestion, sécrétions
 *   → Autacoïde : SÉROTONINE (prolonge l'activité para)
 * - SYMPATHIQUE ALPHA (αΣ) : Calibrage, rétention, vasoconstriction, vigilance
 *   → Autacoïde : HISTAMINE (prolonge et amplifie l'alpha)
 * - SYMPATHIQUE BÊTA (βΣ) : Action, excrétion, cardio-accélération
 *   → Pas d'autacoïde (action brève et fugace)
 * 
 * ORIGINES :
 * - Para : Nerf vague (NC X) + fibres spinales
 * - Alpha : Locus coeruleus (tronc cérébral)
 * - Bêta : Médullosurrénale (adrénaline)
 * 
 * SÉQUENÇAGE NORMAL : Para (initie) → Alpha (calibre) → Bêta (finalise)
 * 
 * ANALOGUES CENTRAUX :
 * - Para central : Sérotonine
 * - Alpha central : Dopamine
 * - Bêta central : TRH
 * 
 * SPASMOPHILIE = Para↑ + Alpha↑ + Bêta bloqué/retardé
 * 
 * Total : 42 questions (était 25)
 * - Priority 1 : 10 questions
 * - Priority 2 : 22 questions
 * - Priority 3 : 10 questions
 * 
 * Pack Essentiel : 10 questions
 */

const AxeNeuroEnrichiConfig: QuestionConfig[] = [
  // ==========================================
  // SECTION 1 : PARASYMPATHIQUE (πΣ)
  // Anabolisme, Sécrétion, Congestion, Repos
  // Neurotransmetteur : Acétylcholine
  // Autacoïde : Sérotonine
  // ==========================================
  {
    id: "neuro_para_crise_vagale",
    question: "Avez-vous déjà fait des malaises vagaux (vertige + nausées + sueurs froides + parfois évanouissement) ?",
    type: "select",
    options: ["Jamais", "1-2 fois dans ma vie", "Plusieurs fois", "Fréquemment"],
    tooltip: "La crise vagale est le signe cardinal d'hyperfonctionnement parasympathique. Le nerf vague provoque une chute de tension et bradycardie brutale.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["pack_essentiel", "para_hyper"]
  },
  {
    id: "neuro_para_salivation",
    question: "Avez-vous tendance à l'hypersalivation (bave sur l'oreiller, besoin d'avaler souvent) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le parasympathique stimule toutes les sécrétions digestives via l'acétylcholine. L'hypersalivation indique une hypertonie vagale haute.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["para_hyper", "secretions"]
  },
  {
    id: "neuro_para_nausee",
    question: "Avez-vous le mal des transports ou des nausées faciles (odeurs fortes, vue du sang) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le mal des transports indique un système parasympathique très réactif. C'est une hyper-réflexivité vagale.",
    weight: 2,
    priority: 1,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["pack_essentiel", "para_hyper"]
  },
  {
    id: "neuro_para_nez_bouche",
    question: "Avez-vous souvent le nez bouché après les repas ou le soir, sans être enrhumé ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La congestion nasale post-prandiale est due à la vasodilatation muqueuse sous l'effet du tonus vagal digestif.",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["para_hyper", "congestion"]
  },
  {
    id: "neuro_para_ballonnement",
    question: "Souffrez-vous de ballonnements abdominaux ou d'aérophagie (rots fréquents) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le parasympathique stimule la motilité intestinale et les sécrétions gastriques. Un excès vagal provoque hypersécrétion et gaz.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["para_hyper", "digestif"]
  },
  {
    id: "neuro_para_sueurs_nuit",
    question: "Transpirez-vous abondamment en première partie de nuit (avant minuit) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les sueurs de première partie de nuit sont caractéristiques d'une prédominance parasympathique. À différencier des sueurs de fin de nuit (corticotropes).",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["para_hyper", "chronobiologie"]
  },
  {
    id: "neuro_para_diarrhee",
    question: "Avez-vous tendance aux selles molles ou à la diarrhée (hors infection) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le parasympathique accélère le transit intestinal et augmente les sécrétions. Une tendance diarrhéique chronique indique une hyperactivité vagale.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["para_hyper", "transit"]
  },
  {
    id: "neuro_para_memoire",
    question: "Avez-vous une excellente mémoire des faits anciens mais tendance à ruminer le passé ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le parasympathique favorise l'intériorisation et la mémorisation à long terme. Les personnes vagotoniques ont une mémoire autobiographique développée.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["para_hyper", "psychisme"]
  },
  {
    id: "neuro_para_bradycardie",
    question: "Avez-vous un pouls naturellement lent (< 60 bpm) au repos ?",
    type: "boolean",
    tooltip: "La bradycardie de repos est un signe de dominance parasympathique. Le nerf vague ralentit le rythme cardiaque via l'acétylcholine.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["para_hyper", "cardio"]
  },
  {
    id: "neuro_para_larmoiement",
    question: "Avez-vous les yeux qui pleurent facilement (vent, émotion, lumière) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le larmoiement facile indique une hyperactivité parasympathique sur les glandes lacrymales (innervation NC VII).",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Parasympathique",
    tags: ["para_hyper", "secretions"]
  },

  // ==========================================
  // SECTION 2 : SYMPATHIQUE ALPHA (αΣ)
  // Vasoconstriction, Rétention, Vigilance
  // Neurotransmetteur : Noradrénaline
  // Autacoïde : Histamine (prolonge l'alpha)
  // Origine : Locus coeruleus
  // ==========================================
  {
    id: "neuro_alpha_froid",
    question: "Avez-vous souvent les mains et les pieds glacés (alors que le reste du corps est normal) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe cardinal de l'hyperactivité alpha-sympathique. La noradrénaline provoque une vasoconstriction périphérique excessive.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Sympathique Alpha",
    tags: ["pack_essentiel", "alpha_hyper", "vasoconstriction"]
  },
  {
    id: "neuro_alpha_peau_seche",
    question: "Votre peau est-elle sèche, ou vos yeux secs, malgré une bonne hydratation ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'alpha-sympathique ferme les capillaires cutanés et inhibe les sécrétions glandulaires. C'est l'opposé de l'effet parasympathique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Alpha",
    tags: ["alpha_hyper", "secheresse"]
  },
  {
    id: "neuro_alpha_constipation",
    question: "Êtes-vous constipé avec des selles dures et sèches (type 'crottes de bique') ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La constipation spasmodique avec selles sèches est caractéristique de l'hyperactivité alpha (spasme tonique des sphincters, réabsorption d'eau).",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Alpha",
    tags: ["alpha_hyper", "transit"]
  },
  {
    id: "neuro_alpha_mydriase",
    question: "Avez-vous les pupilles naturellement dilatées ou une sensibilité à la lumière vive ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La mydriase (dilatation pupillaire) est un signe d'hyperactivité alpha-sympathique sur le muscle dilatateur de l'iris.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Alpha",
    tags: ["alpha_hyper", "oculaire"]
  },
  {
    id: "neuro_alpha_vigilance",
    question: "Êtes-vous naturellement hyper-vigilant, toujours en alerte, difficile à surprendre ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'alpha-sympathique central (dopamine/locus coeruleus) régule la vigilance. L'hyper-vigilance chronique indique un alpha central élevé.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Alpha",
    tags: ["alpha_hyper", "psychisme"]
  },
  {
    id: "neuro_alpha_tension",
    question: "Avez-vous tendance à l'hypertension artérielle ?",
    type: "boolean",
    tooltip: "L'hypertension peut être liée à une hyperactivité alpha-sympathique avec vasoconstriction chronique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Alpha",
    tags: ["alpha_hyper", "cardio"]
  },
  {
    id: "neuro_alpha_bruxisme",
    question: "Serrez-vous les dents ou grincez-vous des dents la nuit (bruxisme) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le bruxisme traduit une tension musculaire alpha-sympathique chronique avec impossibilité de relâchement nocturne.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Alpha",
    tags: ["alpha_hyper", "tension_musculaire"]
  },
  {
    id: "neuro_alpha_douleur",
    question: "Êtes-vous particulièrement sensible à la douleur (hyperalgésie) ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Peu", "Moyennement", "Très", "Extrêmement"],
    tooltip: "L'alpha-sympathique augmente l'intensité de la sensation douloureuse. Une hyperalgésie peut indiquer un excès alpha.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Sympathique Alpha",
    tags: ["alpha_hyper", "sensibilite"]
  },
  {
    id: "neuro_alpha_raynaud",
    question: "Avez-vous un syndrome de Raynaud (doigts blancs puis bleus au froid) ?",
    type: "boolean",
    tooltip: "Le syndrome de Raynaud est une vasoconstriction excessive alpha-sympathique des artérioles digitales au froid.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Alpha",
    tags: ["alpha_hyper", "vasoconstriction"]
  },

  // ==========================================
  // SECTION 3 : SYMPATHIQUE BÊTA (βΣ)
  // Action, Cardio-accélération, Émotion aiguë
  // Neurohormone : Adrénaline
  // Origine : Médullosurrénale
  // Pas d'autacoïde (action brève et fugace)
  // ==========================================
  {
    id: "neuro_beta_palpitations",
    question: "Avez-vous des palpitations (cœur qui bat fort ou vite) au repos ou au moindre stress ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe cardinal de l'hyperactivité bêta-sympathique. L'adrénaline stimule les récepteurs bêta-1 cardiaques (tachycardie, force de contraction).",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Sympathique Bêta",
    tags: ["pack_essentiel", "beta_hyper", "cardio"]
  },
  {
    id: "neuro_beta_bouffees_chaleur",
    question: "Avez-vous des bouffées de chaleur soudaines (hors ménopause) avec rougeur du visage ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les bouffées de chaleur non ménopausiques sont dues à une décharge bêta-sympathique avec vasodilatation de surface.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Bêta",
    tags: ["beta_hyper", "vasomoteur"]
  },
  {
    id: "neuro_beta_emotivite",
    question: "Êtes-vous hyper-émotif (rougissement facile, larmes faciles, gorge qui se serre) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'hyper-émotivité avec manifestations physiques traduit une réactivité bêta-sympathique excessive.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Bêta",
    tags: ["beta_hyper", "emotivite"]
  },
  {
    id: "neuro_beta_tremblements",
    question: "Avez-vous des tremblements fins des mains quand vous êtes stressé ou à jeun ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les tremblements fins sont dus à l'excitation neuromusculaire par l'adrénaline (récepteurs bêta-2 musculaires).",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Sympathique Bêta",
    tags: ["beta_hyper", "neuromusculaire"]
  },
  {
    id: "neuro_beta_spasmes",
    question: "Avez-vous des spasmes douloureux (ventre, règles) soulagés par la chaleur ou le repos ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le bêta-sympathique provoque des spasmes cinétiques (contractions désordonnées). Ces spasmes sont douloureux et soulagés par la chaleur.",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Sympathique Bêta",
    tags: ["beta_hyper", "spasme"]
  },
  {
    id: "neuro_beta_libido_basse",
    question: "Ressentez-vous une absence de désir ou une libido très basse ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'absence de libido peut indiquer un bêta-sympathique insuffisant ou bloqué. Le désir nécessite une capacité d'élan (bêta).",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Sympathique Bêta",
    tags: ["beta_hypo", "libido"]
  },
  {
    id: "neuro_beta_fatigue_initiative",
    question: "Manquez-vous d'élan, d'initiative ? Le moindre effort vous paraît-il insurmontable ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le manque d'élan traduit un bêta-sympathique insuffisant ou bloqué. C'est une fatigue mentale qui paralyse les initiatives.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Sympathique Bêta",
    tags: ["beta_hypo", "asthenie"]
  },
  {
    id: "neuro_beta_bronchospasme",
    question: "Avez-vous une tendance aux bronchospasmes ou à l'asthme ?",
    type: "boolean",
    tooltip: "Le bronchospasme traduit un déséquilibre entre alpha (bronchoconstricteur) et bêta (bronchodilatateur). Un bêta insuffisant favorise l'asthme.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Sympathique Bêta",
    tags: ["beta_hypo", "respiratoire"]
  },
  {
    id: "neuro_beta_hypoglycemie",
    question: "Ressentez-vous des malaises hypoglycémiques (sueurs, tremblements, faim impérieuse) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les malaises hypoglycémiques avec signes adrénergiques (sueurs, tremblements) indiquent une réactivité bêta aux variations glycémiques.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Sympathique Bêta",
    tags: ["beta_hyper", "metabolisme"]
  },

  // ==========================================
  // SECTION 4 : ÉQUILIBRE & SOMMEIL
  // Synthèse du fonctionnement SNA
  // ==========================================
  {
    id: "neuro_sommeil_endormissement",
    question: "Mettez-vous plus de 30 minutes à vous endormir le soir ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La difficulté d'endormissement indique une dominance sympathique au coucher. Le passage au sommeil nécessite une bascule vers le parasympathique.",
    weight: 2,
    priority: 1,
    scoreDirection: "hyper",
    section: "Équilibre & Sommeil",
    tags: ["pack_essentiel", "alpha_hyper", "sommeil"]
  },
  {
    id: "neuro_reveil_nocturne",
    question: "Vous réveillez-vous vers 3h-5h du matin avec anxiété, cœur qui bat ou transpiration ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le réveil de fin de nuit avec manifestations adrénergiques indique une décharge de cortisol et d'adrénaline précoce.",
    weight: 2,
    priority: 1,
    scoreDirection: "hyper",
    section: "Équilibre & Sommeil",
    tags: ["pack_essentiel", "beta_hyper", "cortico"]
  },
  {
    id: "neuro_reveil_1h_3h",
    question: "Vous réveillez-vous régulièrement entre 1h et 3h du matin ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "En chronobiologie, 1h-3h correspond à l'heure du foie. Un réveil systématique suggère une congestion hépatobiliaire nocturne.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Équilibre & Sommeil",
    tags: ["congestion_hepatique", "chronobiologie"]
  },
  {
    id: "neuro_reves",
    question: "Avez-vous des rêves très vifs, en couleur, ou des cauchemars fréquents ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les rêves très vifs indiquent une hyperactivité de la TRH (bêta central) pendant le sommeil paradoxal.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Équilibre & Sommeil",
    tags: ["trh_eleve", "sommeil_rem"]
  },
  {
    id: "neuro_somnolence_postprandiale",
    question: "Avez-vous une somnolence marquée après les repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La somnolence post-prandiale indique une bascule importante vers le parasympathique digestif avec prédominance vagale.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Équilibre & Sommeil",
    tags: ["para_hyper", "digestif"]
  },

  // ==========================================
  // SECTION 5 : SPASMOPHILIE & DYSAUTONOMIE
  // Syndrome mixte : Para↑ + Alpha↑ + Bêta bloqué
  // ==========================================
  {
    id: "neuro_spasmophilie",
    question: "Avez-vous déjà eu des crises de tétanie ou de spasmophilie (mains crispées, fourmillements, sensation d'étouffer) ?",
    type: "select",
    options: ["Jamais", "1-2 fois dans ma vie", "Plusieurs fois", "Régulièrement"],
    tooltip: "La spasmophilie = Para↑ + Alpha↑ + Bêta bloqué. Elle associe spasmes, fourmillements, oppression thoracique et angoisse.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["pack_essentiel", "spasmophilie", "diagnostic_cle"]
  },
  {
    id: "neuro_fourmillements",
    question: "Avez-vous des fourmillements ou engourdissements des extrémités (paresthésies) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les paresthésies sont un signe de spasmophilie avec hyperexcitabilité neuromusculaire. Elles peuvent toucher mains, pieds, lèvres.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["spasmophilie", "neuromusculaire"]
  },
  {
    id: "neuro_oppression_thoracique",
    question: "Ressentez-vous une oppression thoracique ou une difficulté à prendre une grande inspiration ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'oppression thoracique traduit un spasme des muscles intercostaux et du diaphragme, typique de la spasmophilie.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["spasmophilie", "respiratoire"]
  },
  {
    id: "neuro_crampes_nocturnes",
    question: "Avez-vous des crampes musculaires nocturnes (mollets, pieds) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les crampes nocturnes indiquent une hyperexcitabilité neuromusculaire, souvent liée à un déficit en magnésium et à une spasmophilie.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["spasmophilie", "neuromusculaire"]
  },
  {
    id: "neuro_anxiete_anticipation",
    question: "Avez-vous une anxiété d'anticipation (stress avant un événement, peur d'avoir peur) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'anxiété d'anticipation est très fréquente chez les spasmophiles. Elle peut déclencher des diarrhées à transit rapide.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["spasmophilie", "psychisme"]
  },

  // ==========================================
  // SECTION 6 : AUTACOÏDES (SÉROTONINE/HISTAMINE)
  // Modulateurs du SNA
  // ==========================================
  {
    id: "neuro_histamine_allergies",
    question: "Avez-vous des allergies (rhinite, urticaire, eczéma) ou des réactions histaminiques ?",
    type: "boolean",
    tooltip: "L'histamine est l'autacoïde de l'alpha-sympathique. Les réactions allergiques prolongent et amplifient l'activité alpha.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Autacoïdes",
    tags: ["histamine", "alpha_hyper"]
  },
  {
    id: "neuro_histamine_prurit",
    question: "Avez-vous des démangeaisons (prurit) fréquentes sans cause dermatologique évidente ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le prurit peut indiquer une libération d'histamine chronique qui prolonge l'activité alpha-sympathique.",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Autacoïdes",
    tags: ["histamine", "alpha_hyper"]
  },
  {
    id: "neuro_serotonine_humeur",
    question: "Avez-vous des variations d'humeur importantes ou une tendance dépressive ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La sérotonine est l'autacoïde du parasympathique et un neurotransmetteur central clé. Son déficit favorise dépression et troubles de l'humeur.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Autacoïdes",
    tags: ["serotonine", "para_hypo", "psychisme"]
  },
  {
    id: "neuro_serotonine_impulsivite",
    question: "Avez-vous des troubles du comportement alimentaire ou une impulsivité ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les troubles du comportement alimentaire et l'impulsivité sont liés à une dysrégulation sérotoninergique centrale.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Autacoïdes",
    tags: ["serotonine", "psychisme"]
  }
];

export default AxeNeuroEnrichiConfig;