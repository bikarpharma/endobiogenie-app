import type { QuestionConfig } from "../types";

/**
 * AXE IMMUNO-INFLAMMATOIRE - VERSION ENRICHIE
 * Évalue le terrain immunitaire et la capacité d'adaptation face aux agressions
 * 
 * CONCEPTS CLÉS :
 * - Thymus : carrefour identité/immunité (αΣ, ACTH, TSH)
 * - Lymphocytes : NK (innée), T (cellulaire), B (anticorps)
 * - Éosinophiles : sauvegarde corticotrope
 * - Basophiles : réponse allergènes/parasites
 * - Axe thyrotrope : régulation immunitaire (TRH→histamine, TSH→lymphocytes)
 * - Cortisol : permissif ou suppresseur selon niveau
 * - Vitamine D3 : stimule innée, inhibe adaptative
 * 
 * 
 * AUDIT : Décembre 2024
 * TOTAL : 48 questions (+13 par rapport à version initiale)
 * - Priority 1 (ESSENTIEL) : 14 questions
 * - Priority 2 (IMPORTANT) : 22 questions
 * - Priority 3 (OPTIONNEL) : 12 questions
 * 
 * PACK ESSENTIEL (Mode Rapide) : 12 questions
 * immuno_infections_recidivantes, immuno_fatigue_infection, immuno_ganglions,
 * immuno_cicatrisation_lente, immuno_allergies, immuno_autoimmune,
 * immuno_angines_repetition, immuno_bronchites_recurrentes,
 * immuno_guerison_lente, immuno_fievre_rare, immuno_herpes, immuno_mycoses
 */

const AxeImmunoInflammatoireConfig: QuestionConfig[] = [
  // ==========================================
  // I. INFECTIONS RÉCIDIVANTES
  // ==========================================
  {
    id: "immuno_infections_recidivantes",
    question: "Faites-vous des infections à répétition (ORL, urinaires, bronchites, cutanées) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe majeur de terrain précritique. Les infections récidivantes traduisent une incompétence cortico-immunitaire : insuffisance du cortex surrénalien, thymus congestif, et/ou thyroïde périphérique insuffisante. Les trois facteurs critiques sont : agresseur + terrain + réponse inadaptée..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["terrain_precritique", "cortisol_insuffisant", "pack_essentiel"]
  },
  {
    id: "immuno_angines_repetition",
    question: "Faites-vous des angines ou pharyngites à répétition ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Terrain ORL récurrent impliquant le pancréas exocrine sur-sollicité et la congestion hépatobiliaire. Les amygdales hypertrophiées sont un signe de pancréas congestionné et d'appel à la TSH. Traitement : Plantago major + Rubus fruticosus + Avena sativa..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["pancreas_sursollicite", "orl_recurrent", "pack_essentiel"]
  },
  {
    id: "immuno_otites_repetition",
    question: "Avez-vous fait des otites à répétition (surtout enfant) ?",
    type: "boolean",
    tooltip: "L'otite récurrente traduit un terrain précritique avec spasmophilie locale (para-alpha, bêta retardé) et congestion hépatobiliaire. Le drainage prolongé de l'unité hépatobiliaire est fortement indiqué..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["spasmophilie_locale", "hepatobiliaire"]
  },
  {
    id: "immuno_sinusites_recurrentes",
    question: "Faites-vous des sinusites récurrentes ou chroniques ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Terrain sinusal : spasmophilie locale (alpha > para, bêta retardé) favorisant la stagnation des fluides sériques. La réponse alpha-sympathique clôt les voies sinusales avec soutien cortico-immunitaire insuffisant..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["alpha_eleve", "spasmophilie"]
  },
  {
    id: "immuno_bronchites_recurrentes",
    question: "Faites-vous des bronchites récurrentes, surtout en hiver ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Terrain bronchitique : spasmophilie respiratoire (para-alpha, bêta retardé) avec insuffisance cortico-thyroïdienne. L'axe pancréas exocrine-poumon doit être drainé. L'émonctoire pulmonaire (axe thyréotrope) est sollicité..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["poumon_emonctoire", "thyro_insuffisant", "pack_essentiel"]
  },
  {
    id: "immuno_cystites_recurrentes",
    question: "Faites-vous des cystites ou infections urinaires à répétition ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Terrain urinaire récurrent impliquant l'émonctoire rénal (axe corticotrope) et l'immunité locale (IgA sécrétoires). Traitement : Peuplier + Aulne + Airelle en gemmothérapie..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["rein_emonctoire", "immunite_muqueuse"]
  },
  // NOUVEAU - Infections virales latentes
  {
    id: "immuno_herpes",
    question: "Faites-vous des poussées d'herpès labial (boutons de fièvre) récurrentes ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La réactivation de l'herpès traduit un terrain précritique avec incompétence de l'immunité cellulaire (lymphocytes T, cellules NK). Le stress, la fatigue ou l'exposition au soleil déclenchent la réactivation. Traitement : soutien cortico-thyroïdien + antiviraux naturels..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["immunite_cellulaire", "virus_latent", "pack_essentiel"]
  },
  // NOUVEAU - Zona
  {
    id: "immuno_zona",
    question: "Avez-vous déjà fait un zona ?",
    type: "boolean",
    tooltip: "Le zona est une réactivation du virus varicelle-zona (VZV) suite à un effondrement de l'immunité cellulaire. Il traduit un terrain précritique sévère avec épuisement cortico-surrénalien et stress prolongé. Risque de névralgie post-zostérienne..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["immunite_cellulaire", "epuisement_cortico"]
  },
  // NOUVEAU - Mycoses
  {
    id: "immuno_mycoses",
    question: "Faites-vous des mycoses à répétition (cutanées, vaginales, buccales) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les mycoses récurrentes traduisent une immunité muqueuse déficiente avec déséquilibre du microbiote. Terrain favorisant : hyperinsulinisme, antibiotiques répétés, cortisol insuffisant. La candidose indique un terrain métabolique et immunitaire altéré..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["immunite_muqueuse", "dysbiose", "pack_essentiel"]
  },
  // NOUVEAU - Verrues
  {
    id: "immuno_verrues",
    question: "Avez-vous ou avez-vous eu des verrues récidivantes ?",
    type: "boolean",
    tooltip: "Les verrues sont causées par le papillomavirus humain (HPV). Leur récurrence traduit une insuffisance de l'immunité cellulaire (lymphocytes T, cellules NK). Le terrain précritique favorise la persistance virale..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Infections Récidivantes",
    tags: ["immunite_cellulaire", "cellules_nk"]
  },

  // ==========================================
  // II. RÉPONSE IMMUNITAIRE
  // ==========================================
  {
    id: "immuno_fatigue_infection",
    question: "Êtes-vous très fatigué(e) pendant ou après une infection, même banale ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'insuffisance cortico-surrénalienne. Le cortisol mobilise les éléments sanguins et gère l'adaptation. Son insuffisance provoque un épuisement disproportionné lors des infections. À niveaux permissifs, le cortisol complète l'action de l'ACTH et des régulateurs immunitaires..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Réponse Immunitaire",
    tags: ["cortisol_insuffisant", "epuisement", "pack_essentiel"]
  },
  {
    id: "immuno_guerison_lente",
    question: "Mettez-vous longtemps à guérir d'une infection (>10-14 jours pour un rhume) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Terrain précritique avec insuffisance de la réponse adaptative. La capacité de faire disparaître l'agresseur est compromise. Le cortisol à niveaux permissifs complète l'action de l'ACTH et des régulateurs immunitaires..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Réponse Immunitaire",
    tags: ["terrain_precritique", "adaptation_insuffisante", "pack_essentiel"]
  },
  {
    id: "immuno_fievre_rare",
    question: "Faites-vous rarement de la fièvre, même lors d'infections ?",
    type: "boolean",
    tooltip: "Signe paradoxal d'insuffisance immunitaire. La fièvre est une réponse adaptative normale. Son absence traduit une hypo-réactivité du système immunitaire avec insuffisance de la réponse inflammatoire. L'axe thyréotrope stimule les lymphocytes et la réponse fébrile..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Réponse Immunitaire",
    tags: ["hyporeactivite_immune", "pack_essentiel"]
  },
  {
    id: "immuno_fievre_elevee",
    question: "Faites-vous facilement de la fièvre élevée (>39°C) pour des infections mineures ?",
    type: "boolean",
    tooltip: "Signe d'hyper-réactivité immunitaire. Une fièvre disproportionnée traduit une hyperactivité de la réponse inflammatoire avec possiblement un excès d'ACTH et insuffisance de modulation par le cortisol..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Réponse Immunitaire",
    tags: ["hyperreactivite_immune", "acth_eleve"]
  },
  {
    id: "immuno_cicatrisation_lente",
    question: "Vos plaies s'infectent-elles facilement ou cicatrisent-elles mal ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'immunité cutanée déficiente et/ou de cortisol insuffisant. La cicatrisation implique l'axe somatotrope (GH, IGF-1) et l'immunité locale. Une mauvaise cicatrisation peut aussi indiquer un diabète latent..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Réponse Immunitaire",
    tags: ["immunite_cutanee", "cortisol_insuffisant", "pack_essentiel"]
  },
  // NOUVEAU - Lymphocytes et TSH
  {
    id: "immuno_lymphocytes_bas",
    question: "Avez-vous déjà eu des lymphocytes bas dans vos analyses de sang ?",
    type: "boolean",
    tooltip: "Les lymphocytes sont inversement liés au cortisol et aux œstrogènes. Des lymphocytes bas peuvent indiquer : cortisol élevé (stress chronique), œstrogènes élevés, ou TSH efficace. Inversement, des lymphocytes élevés = appel à la TSH pour réguler la thyroïde..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Réponse Immunitaire",
    tags: ["lymphocytes", "cortisol", "tsh"]
  },

  // ==========================================
  // III. GANGLIONS & SYSTÈME LYMPHATIQUE
  // ==========================================
  {
    id: "immuno_ganglions",
    question: "Avez-vous souvent des ganglions palpables ou douloureux ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de sollicitation du système lymphatique. Les ganglions réactionnels traduisent une activité immunitaire en cours. Des ganglions chroniquement augmentés peuvent indiquer un terrain précritique avec stimulation TSH excessive..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Système Lymphatique",
    tags: ["ganglions", "tsh_elevee", "pack_essentiel"]
  },
  {
    id: "immuno_amygdales_grosses",
    question: "Avez-vous ou avez-vous eu des amygdales volumineuses ?",
    type: "boolean",
    tooltip: "L'hypertrophie des amygdales est un signe de pancréas exocrine congestionné et sur-sollicité. C'est aussi un marqueur de l'appel à la TSH avec sur-fonctionnement du tissu lymphoïde. 80% du tissu lymphoïde est dans les intestins..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Système Lymphatique",
    tags: ["pancreas_congestionne", "tissu_lymphoide"]
  },
  {
    id: "immuno_rate_grosse",
    question: "A-t-on déjà constaté une rate augmentée de volume chez vous ?",
    type: "boolean",
    tooltip: "La splénomégalie traduit une sollicitation excessive du système immunitaire. La rate stocke les lymphocytes et filtre le sang. Son augmentation peut indiquer des infections chroniques ou des maladies hématologiques..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Système Lymphatique",
    tags: ["rate", "systeme_lymphatique"]
  },
  {
    id: "immuno_vegetations",
    question: "Avez-vous eu des végétations adénoïdes (enfant) ou fait une adénoïdectomie ?",
    type: "boolean",
    tooltip: "Les végétations adénoïdes hypertrophiées traduisent un terrain ORL précritique avec sollicitation excessive du tissu lymphoïde nasopharyngé. C'est un marqueur de l'hyperfonctionnement para + FSH avec congestion pancréatique..",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Système Lymphatique",
    tags: ["vegetations", "orl_recurrent"]
  },

  // ==========================================
  // IV. ALLERGIES & ATOPIE
  // ==========================================
  {
    id: "immuno_allergies",
    question: "Avez-vous des allergies (respiratoires, alimentaires, cutanées, médicamenteuses) ?",
    type: "boolean",
    tooltip: "Terrain allergique : hyper-réactivité immunitaire avec production excessive d'IgE. TRH en périphérie stimule les lymphocytes T → cellules B → IgE → allergies. Le terrain allergique implique une incompétence cortico-thyroïdienne avec réponse hyper-immune..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Allergies & Atopie",
    tags: ["allergie", "ige", "pack_essentiel"]
  },
  {
    id: "immuno_eczema",
    question: "Avez-vous ou avez-vous eu de l'eczéma (atopique ou de contact) ?",
    type: "boolean",
    tooltip: "L'eczéma traduit un terrain hyper-immun avec incompétence de la régulation. Terrain précritique : (1) sur-sollicitation hépatique, (2) insuffisance cortisol, (3) spasmophilie (alpha-para, bêta retardé). La peau est l'émonctoire de relais du foie congestionné..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Allergies & Atopie",
    tags: ["eczema", "terrain_atopique"]
  },
  {
    id: "immuno_asthme",
    question: "Avez-vous de l'asthme ou avez-vous eu des crises d'asthme ?",
    type: "boolean",
    tooltip: "Terrain asthmatique : spasmophilie bronchique (para-alpha avec bêta retardé/bloqué) + composante allergique (IgE) ou intrinsèque. L'axe thyréotrope régule l'histamine (TRH) et les lymphocytes (TSH)..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Allergies & Atopie",
    tags: ["asthme", "spasmophilie"]
  },
  {
    id: "immuno_urticaire",
    question: "Faites-vous des urticaires ou des réactions cutanées allergiques ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'urticaire traduit une libération excessive d'histamine. Les médiateurs de l'histamine sont : alpha-sympathique, ACTH, TRH (augmentent demande, récepteurs, libération) et cortisol (diminue l'activité)..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Allergies & Atopie",
    tags: ["urticaire", "histamine"]
  },
  // NOUVEAU - Terrain atopique familial
  {
    id: "immuno_atopie_familiale",
    question: "Y a-t-il des allergies, eczéma ou asthme dans votre famille proche ?",
    type: "boolean",
    tooltip: "Le terrain atopique est héréditaire. Il traduit une prédisposition à l'hyper-réactivité immunitaire avec production excessive d'IgE. Le terrain précritique familial inclut : eczéma, asthme, rhinite allergique, allergies alimentaires..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Allergies & Atopie",
    tags: ["atopie_familiale", "hereditaire"]
  },
  // NOUVEAU - Intolérances alimentaires
  {
    id: "immuno_intolerances",
    question: "Avez-vous des intolérances alimentaires identifiées (lactose, gluten, histamine) ?",
    type: "boolean",
    tooltip: "Les intolérances alimentaires traduisent une perméabilité intestinale augmentée et/ou une insuffisance enzymatique (pancréas exocrine). Elles favorisent la dysbiose et l'inflammation chronique bas grade. À distinguer des vraies allergies (IgE)..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Allergies & Atopie",
    tags: ["intolerance", "permeabilite_intestinale"]
  },

  // ==========================================
  // V. AUTO-IMMUNITÉ
  // ==========================================
  {
    id: "immuno_autoimmune",
    question: "Avez-vous une maladie auto-immune diagnostiquée ?",
    type: "boolean",
    tooltip: "Les maladies auto-immunes traduisent une perte de la distinction soi/non-soi par le thymus. Le thymus est le carrefour de l'identité et de l'immunité. L'auto-immunité implique : hyperœstrogénie + hyperstimulation thyroïdienne..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Auto-immunité",
    tags: ["autoimmunite", "thymus", "pack_essentiel"]
  },
  {
    id: "immuno_autoimmune_familiale",
    question: "Y a-t-il des maladies auto-immunes dans votre famille ?",
    type: "boolean",
    tooltip: "Prédisposition génétique à l'auto-immunité. Le terrain précritique auto-immun peut rester latent jusqu'à un facteur déclenchant (infection virale, stress, grossesse). Le virus d'Epstein-Barr (EBV) est souvent un agent déclencheur..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Auto-immunité",
    tags: ["autoimmunite_familiale", "hereditaire"]
  },
  {
    id: "immuno_thyroidite",
    question: "Avez-vous une thyroïdite auto-immune (Hashimoto, Basedow) ?",
    type: "boolean",
    tooltip: "La thyroïdite auto-immune traduit une attaque des lymphocytes contre la thyroïde. L'EBV n'est pas la cause mais peut être l'agent déclencheur chez un terrain précritique. Hashimoto = hypo-thyroïdie, Basedow = hyper-thyroïdie..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Auto-immunité",
    tags: ["thyroidite", "autoimmunite"]
  },
  {
    id: "immuno_declenchement_peripartum",
    question: "(Femmes) Avez-vous développé une maladie auto-immune après un accouchement ?",
    type: "boolean",
    tooltip: "Risque accru de maladie auto-immune en péri-partum lorsqu'il existe un terrain d'hyperœstrogénie et d'hyperstimulation thyroïdienne. Les œstrogènes augmentent l'infiltration des lymphocytes dans les tissus et suppriment leur prolifération pendant la grossesse pour protéger le fœtus..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Auto-immunité",
    tags: ["peripartum", "oestrogenes"]
  },

  // ==========================================
  // VI. INFLAMMATION CHRONIQUE
  // ==========================================
  {
    id: "immuno_douleurs_articulaires",
    question: "Avez-vous des douleurs articulaires ou musculaires chroniques ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'inflammation chronique bas grade. L'inflammation est un aspect majeur de la façon dont les éléments immunitaires passent des espaces humoraux vers les tissus. Traitement : Cassis + Frêne + Vigne vierge..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Inflammation Chronique",
    tags: ["inflammation_chronique", "cortisol_insuffisant"]
  },
  {
    id: "immuno_raideur_matinale",
    question: "Avez-vous une raideur articulaire importante au réveil (>30 minutes) ?",
    type: "boolean",
    tooltip: "Signe d'alerte auto-immun (Priority 1). Une raideur matinale >30 minutes qui s'améliore avec le mouvement est caractéristique des atteintes inflammatoires auto-immunes (polyarthrite rhumatoïde)..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Inflammation Chronique",
    tags: ["autoimmunite", "inflammation"]
  },
  {
    id: "immuno_crp_elevee",
    question: "Avez-vous déjà eu une CRP (protéine C-réactive) élevée dans vos analyses ?",
    type: "boolean",
    tooltip: "Marqueur d'inflammation systémique. La CRP élevée traduit une activation de la réponse inflammatoire. Elle peut être liée à un excès d'ACTH avec insuffisance relative du cortisol..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Inflammation Chronique",
    tags: ["inflammation_systemique", "acth"]
  },
  // NOUVEAU - VS élevée
  {
    id: "immuno_vs_elevee",
    question: "Avez-vous déjà eu une VS (vitesse de sédimentation) élevée ?",
    type: "boolean",
    tooltip: "La VS élevée est un marqueur d'inflammation chronique. Elle reflète l'activité des protéines de phase aiguë. Une VS chroniquement élevée oriente vers une inflammation de bas grade ou une maladie inflammatoire..",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Inflammation Chronique",
    tags: ["inflammation_chronique", "biomarqueur"]
  },

  // ==========================================
  // VII. SIGNES CLINIQUES IMMUNITAIRES
  // ==========================================
  {
    id: "immuno_creux_suprasternal",
    question: "Ressentez-vous une sensibilité ou gêne au niveau du creux à la base du cou ?",
    type: "boolean",
    tooltip: "Signe de thymus congestif (↓ IL-1). L'encoche suprasternale sensible à la palpation traduit une congestion thymique avec insuffisance de l'interleukine-1. Le thymus est le carrefour identité/immunité..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Signes Cliniques",
    tags: ["thymus_congestif", "il1_bas"]
  },
  {
    id: "immuno_spasmophilie",
    question: "Avez-vous des crampes, fourmillements ou spasmes musculaires fréquents ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de spasmophilie (Chvostek). La spasmophilie traduit un déséquilibre neuro-végétatif (hyper-para-alpha) qui favorise les infections récidivantes par congestion des muqueuses..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Cliniques",
    tags: ["spasmophilie", "iml_imbalance"]
  },
  {
    id: "immuno_transpiration_facile",
    question: "Transpirez-vous facilement, même sans effort ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de vagotonie (hyper-para). Le terrain vagal avec transpiration facile est associé au terrain atopique (eczéma) et aux infections récidivantes par congestion des muqueuses..",
    weight: 1,
    priority: 3,
    scoreDirection: "hyper",
    section: "Signes Cliniques",
    tags: ["vagotonie", "atopie"]
  },
  // NOUVEAU - Dermographisme
  {
    id: "immuno_dermographisme",
    question: "Votre peau marque-t-elle facilement au frottement (dermographisme) ?",
    type: "boolean",
    tooltip: "Le dermographisme traduit une libération excessive d'histamine cutanée. C'est un signe de terrain allergique/histaminique avec hyper-réactivité vasculaire locale. Évaluer : survenue, durée, intensité du blanchiment vs hyperhémie..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Cliniques",
    tags: ["dermographisme", "histamine", "allergie"]
  },

  // ==========================================
  // VIII. FACTEURS DE TERRAIN
  // ==========================================
  {
    id: "immuno_saison_aggravation",
    question: "Y a-t-il une saison où vous êtes plus souvent malade ?",
    type: "select",
    options: ["Non", "Automne", "Hiver", "Printemps", "Été"],
    tooltip: "La signification chronobiologique de la saison de survenue est importante. Hiver = insuffisance cortico-thyroïdienne pour l'adaptation au froid. Printemps = relance adaptative thyroïdienne (allergies). Été = nadir du cortex surrénalien..",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Facteurs de Terrain",
    tags: ["chronobiologie", "adaptation_saisonniere"]
  },
  {
    id: "immuno_stress_declencheur",
    question: "Les périodes de stress déclenchent-elles souvent des infections chez vous ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le stress sollicite l'axe corticotrope. Si la réponse adaptative est insuffisante, l'immunité est compromise et les infections surviennent. C'est un signe classique de terrain précritique avec épuisement de la capacité surrénalienne..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Facteurs de Terrain",
    tags: ["stress", "terrain_precritique"]
  },
  {
    id: "immuno_alimentation_aggravation",
    question: "Certains aliments aggravent-ils vos problèmes immunitaires (laitages, gluten) ?",
    type: "boolean",
    tooltip: "La production de mucus avec laitages/gluten traduit un pancréas exocrine sur-sollicité. C'est un facteur aggravant des infections ORL récidivantes. Régime d'épargne pancréatique indiqué..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Facteurs de Terrain",
    tags: ["pancreas_exocrine", "mucus"]
  },
  {
    id: "immuno_antibiotiques_frequents",
    question: "Prenez-vous des antibiotiques plus de 2 fois par an ?",
    type: "boolean",
    tooltip: "L'utilisation fréquente d'antibiotiques sans traitement du terrain maintient le cycle des infections. L'antibiotique tue les bactéries mais ne modifie pas le terrain précritique. Risque de dysbiose et de mycoses..",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Facteurs de Terrain",
    tags: ["terrain_precritique", "dysbiose"]
  },
  {
    id: "immuno_convalescence_longue",
    question: "Avez-vous besoin d'une longue convalescence après une infection ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'insuffisance de la capacité de restauration. La convalescence prolongée traduit un épuisement de l'axe corticotrope et une difficulté à restaurer l'homéostasie. Conseil : en cas de doute, drainer et restaurer..",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Facteurs de Terrain",
    tags: ["epuisement_adaptatif", "convalescence"]
  },
  {
    id: "immuno_mucus_excessif",
    question: "Avez-vous une production excessive de mucus (nez, gorge, bronches) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de pancréas exocrine sur-sollicité et de congestion passive (hyper-para + histamine + hyperinsulinisme). Le mucus excessif favorise la stagnation et les infections. Traitement : Plantago major, Agrimonia eupatoria..",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Facteurs de Terrain",
    tags: ["pancreas_exocrine", "congestion"]
  },
  // NOUVEAU - Vitamine D
  {
    id: "immuno_vitamine_d_basse",
    question: "Avez-vous une carence en vitamine D connue ou suspectée ?",
    type: "boolean",
    tooltip: "La vitamine D3 stimule les lymphocytes, les monocytes et l'immunité innée. Elle facilite les effets de l'axe thyréotrope sur l'immunité. Une carence en D3 compromet la défense immunitaire innée. La D3 inhibe l'immunité adaptative (protection contre l'auto-immunité)..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Facteurs de Terrain",
    tags: ["vitamine_d", "immunite_innee"]
  },
  // NOUVEAU - Sommeil et immunité
  {
    id: "immuno_sommeil_mauvais",
    question: "Avez-vous un sommeil de mauvaise qualité (réveils, non réparateur) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le sommeil est essentiel à la restauration immunitaire. La GHRH favorise le sommeil non-REM et l'anabolisme nocturne. Un mauvais sommeil compromet la fonction du thymus et la production de lymphocytes..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Facteurs de Terrain",
    tags: ["sommeil", "anabolisme_nocturne"]
  }
];

export default AxeImmunoInflammatoireConfig;