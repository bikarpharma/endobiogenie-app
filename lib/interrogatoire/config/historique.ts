import type { QuestionConfig } from "../types";

/**
 * AXE HISTORIQUE & ANTÉCÉDENTS - VERSION ENRICHIE
 * Évalue la trajectoire de développement et les facteurs prédisposants du terrain
 * 
 * CONCEPTS CLÉS :
 * - ETE (Événements Traumatiques de l'Enfance) : 10 facteurs de Felitti
 * - Trajectoires de développement : impact sur le terrain neuroendocrinien
 * - Autopathogénicité : axe génétiquement le plus susceptible
 * - 7 phases de la vie : embryogenèse → gonadopause
 * - Physio-psychologie : lien fonction neuroendocrine ↔ personnalité
 * - Épigénétique : interaction gène-environnement
 * 
 * 
 * AUDIT : Décembre 2024
 * TOTAL : 48 questions (+13 par rapport à version initiale)
 * - Priority 1 (ESSENTIEL) : 14 questions
 * - Priority 2 (IMPORTANT) : 22 questions
 * - Priority 3 (OPTIONNEL) : 12 questions
 * 
 * PACK ESSENTIEL (Mode Rapide) : 12 questions
 * hist_traumatisme_enfance, hist_maladies_recurrentes_enfance, hist_chirurgies_majeures,
 * hist_antecedents_cancer_famille, hist_maladies_autoimmunes_famille, hist_cardiovasculaire_famille,
 * hist_naissance_prematuree, hist_antibiotiques_enfance, hist_stress_chronique_vie,
 * hist_traitements_hormonaux, hist_menopause_andropause, hist_diabete_famille
 */

const AxeHistoriqueConfig: QuestionConfig[] = [
  // ==========================================
  // I. ÉVÉNEMENTS TRAUMATIQUES DE L'ENFANCE (ETE)
  // Impact: Corrélés aux problèmes de santé mentale et physique à long terme
  // ==========================================
  {
    id: "hist_traumatisme_enfance",
    question: "Avez-vous vécu des événements difficiles ou traumatisants pendant l'enfance ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun", "Légers", "Modérés", "Importants", "Très graves"],
    tooltip: "Les ETE (Événements Traumatiques de l'Enfance) sont fortement corrélés aux problèmes de santé mentale et physique à long terme. Ils modifient la trajectoire du terrain neuroendocrinien et peuvent créer un état d'hyper ou hypo-adaptation chronique..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Événements Traumatiques (ETE)",
    tags: ["ete", "trajectoire", "pack_essentiel", "terrain_precritique"]
  },
  {
    id: "hist_maltraitance",
    question: "Avez-vous été victime de maltraitance physique ou émotionnelle durant l'enfance ?",
    type: "boolean",
    tooltip: "La maltraitance est le facteur ETE ayant le plus fort impact sur la santé selon les travaux de Felitti. Elle affecte profondément l'axe corticotrope et peut entraîner obésité, troubles cardiovasculaires, pulmonaires et auto-immuns à long terme..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Événements Traumatiques (ETE)",
    tags: ["ete", "maltraitance", "corticotrope"]
  },
  {
    id: "hist_alcoolisme_parents",
    question: "L'un de vos parents souffrait-il d'alcoolisme ou de dépendance ?",
    type: "boolean",
    tooltip: "L'alcoolisme parental est le 2ème facteur ETE le plus impactant. Il crée un environnement de stress chronique qui modifie la trajectoire de développement du terrain de l'enfant..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Événements Traumatiques (ETE)",
    tags: ["ete", "famille", "stress_chronique"]
  },
  {
    id: "hist_deces_parent_enfance",
    question: "Avez-vous perdu un parent durant l'enfance ou l'adolescence ?",
    type: "boolean",
    tooltip: "Le décès d'un parent est le 4ème facteur ETE. Il impacte la trajectoire de développement et peut créer un terrain d'hypo-adaptation durable..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Événements Traumatiques (ETE)",
    tags: ["ete", "deuil", "trajectoire"]
  },
  {
    id: "hist_abandon_negligence",
    question: "Avez-vous vécu un abandon ou une négligence émotionnelle importante ?",
    type: "boolean",
    tooltip: "L'abandon et la négligence émotionnelle affectent l'attachement et modifient durablement le terrain neuroendocrinien. Ils sont corrélés à la fibromyalgie, la fatigue chronique et les troubles de l'adaptation..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Événements Traumatiques (ETE)",
    tags: ["ete", "attachement", "adaptation"]
  },
  {
    id: "hist_divorce_parents",
    question: "Vos parents ont-ils divorcé pendant votre enfance ?",
    type: "boolean",
    tooltip: "Le divorce des parents est un facteur ETE qui peut fragmenter l'environnement de développement. L'impact dépend des circonstances et du soutien disponible..",
    weight: 1,
    priority: 3,
    scoreDirection: "neutral",
    section: "Événements Traumatiques (ETE)",
    tags: ["ete", "famille"]
  },

  // ==========================================
  // II. ANTÉCÉDENTS MÉDICAUX DE L'ENFANCE
  // ==========================================
  {
    id: "hist_maladies_recurrentes_enfance",
    question: "Avez-vous eu des maladies récurrentes dans l'enfance (otites, angines, bronchites) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Très fréquent"],
    tooltip: "Les infections récurrentes de l'enfance indiquent un terrain précritique précoce avec insuffisance du cortex surrénalien et/ou du thymus. Les otites récidivantes sont classiquement liées à la vagotonie et à la congestion hépatobiliaire..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Antécédents Enfance",
    tags: ["enfance", "infections", "pack_essentiel", "terrain_precritique"]
  },
  {
    id: "hist_amygdalectomie_vegetations",
    question: "Avez-vous subi une ablation des amygdales ou des végétations dans l'enfance ?",
    type: "boolean",
    tooltip: "L'amygdalectomie et l'ablation des végétations sont les chirurgies pédiatriques les plus fréquentes. Elles indiquent un terrain de sur-sollicitation du pancréas exocrine et du thymus avec hypertrophie lymphoïde..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Antécédents Enfance",
    tags: ["enfance", "chirurgie", "pancreas_exocrine", "thymus"]
  },
  {
    id: "hist_eczema_asthme_enfance",
    question: "Avez-vous eu de l'eczéma, de l'asthme ou des allergies dans l'enfance ?",
    type: "boolean",
    tooltip: "La triade atopique (eczéma, asthme, rhinite allergique) indique un terrain allergique précoce avec déséquilibre immunitaire Th1/Th2. Ce terrain persiste souvent à l'âge adulte sous différentes formes..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Antécédents Enfance",
    tags: ["enfance", "atopie", "allergie", "immunite"]
  },
  {
    id: "hist_convulsions_febriles",
    question: "Avez-vous eu des convulsions fébriles ou des épisodes neurologiques dans l'enfance ?",
    type: "boolean",
    tooltip: "Les convulsions fébriles indiquent un axe thyréotrope prédominant avec une réactivité neurologique élevée. Elles sont liées à la phase thyroïdienne de l'enfance (2-7 ans)..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Antécédents Enfance",
    tags: ["enfance", "neurologique", "thyreotrope"]
  },
  {
    id: "hist_croissance_precoce_tardive",
    question: "Votre croissance a-t-elle été particulièrement précoce ou tardive ?",
    type: "select",
    options: ["Normale", "Croissance précoce", "Croissance tardive", "Puberté précoce", "Puberté tardive", "Ne sait pas"],
    tooltip: "Le timing de la croissance et de la puberté reflète l'équilibre des axes endocriniens. Une croissance précoce indique une GH forte, une puberté précoce un axe gonadotrope prématuré. Une croissance tardive peut indiquer un retard thyroïdien..",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Antécédents Enfance",
    tags: ["enfance", "croissance", "developpement"]
  },
  // NOUVEAU - Maladies infectieuses de l'enfance
  {
    id: "hist_maladies_infantiles",
    question: "Avez-vous eu des maladies infantiles marquantes (varicelle, rougeole, oreillons, coqueluche) ?",
    type: "boolean",
    tooltip: "Les maladies infantiles laissent une empreinte sur le système immunitaire (mémoire immunitaire). Leur absence peut indiquer une hypo-réactivité immunitaire. Leur gravité exceptionnelle indique un terrain précritique précoce..",
    weight: 1,
    priority: 3,
    scoreDirection: "neutral",
    section: "Antécédents Enfance",
    tags: ["enfance", "infections", "immunite"]
  },
  // NOUVEAU - Développement psychomoteur
  {
    id: "hist_developpement_psychomoteur",
    question: "Avez-vous eu des retards de développement (langage, marche, motricité) ?",
    type: "boolean",
    tooltip: "Les jalons du développement (langage, motricité globale, motricité fine, interactions sociales) reflètent l'intégration neuroendocrinienne. Un retard peut indiquer un terrain thyréotrope ou neurologique particulier..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Antécédents Enfance",
    tags: ["enfance", "developpement", "neurologique"]
  },
  // NOUVEAU - Tempérament enfance
  {
    id: "hist_temperament_enfance",
    question: "Quel était votre tempérament dominant dans l'enfance ?",
    type: "select",
    options: ["Calme et posé", "Anxieux ou craintif", "Colérique ou agité", "Introverti et réservé", "Extraverti et sociable", "Variable/Ne sait pas"],
    tooltip: "Le tempérament de l'enfance reflète le terrain neuroendocrinien constitutionnel. Un enfant anxieux indique une prédominance alpha-sympathique, un enfant colérique une réactivité corticotrope. Le tempérament se finalise à la puberté..",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Antécédents Enfance",
    tags: ["enfance", "temperament", "physio_psychologie"]
  },
  // NOUVEAU - Mode alimentaire enfance
  {
    id: "hist_alimentation_enfance",
    question: "Aviez-vous des particularités alimentaires dans l'enfance (envies, refus, pica) ?",
    type: "boolean",
    tooltip: "Les envies et comportements alimentaires de l'enfance indiquent des demandes du terrain endobiogénique ou des carences. Un enfant qui ne mange que des féculents indique un appel au pancréas, des envies de sucré un déséquilibre insulinique..",
    weight: 1,
    priority: 3,
    scoreDirection: "neutral",
    section: "Antécédents Enfance",
    tags: ["enfance", "alimentation", "terrain"]
  },

  // ==========================================
  // III. ANTÉCÉDENTS FAMILIAUX - ENRICHIS
  // ==========================================
  {
    id: "hist_antecedents_cancer_famille",
    question: "Y a-t-il des antécédents de cancer dans votre famille proche ?",
    type: "boolean",
    tooltip: "Les antécédents familiaux de cancer indiquent un terrain oncologique héréditaire avec prédisposition à l'hyperfonctionnement somatotrope (prolactine, néo-angiogenèse). Terrain prolifératif à surveiller..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Antécédents Familiaux",
    tags: ["famille", "cancer", "pack_essentiel", "terrain_proliferatif"]
  },
  {
    id: "hist_maladies_autoimmunes_famille",
    question: "Y a-t-il des maladies auto-immunes dans votre famille ?",
    type: "boolean",
    tooltip: "Les maladies auto-immunes familiales indiquent un terrain de perte de distinction soi/non-soi par le thymus. Terrain transgénérationnel incluant : Hashimoto, Basedow, polyarthrite, lupus, SEP, Crohn, etc..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Antécédents Familiaux",
    tags: ["famille", "autoimmunite", "pack_essentiel", "thymus"]
  },
  // NOUVEAU - Cardiovasculaire famille
  {
    id: "hist_cardiovasculaire_famille",
    question: "Y a-t-il des antécédents cardiovasculaires dans votre famille (infarctus, AVC, HTA précoce) ?",
    type: "boolean",
    tooltip: "Les antécédents cardiovasculaires familiaux indiquent un terrain corticotrope et métabolique à risque. Ils orientent vers un déséquilibre sympathique chronique et un terrain d'adaptation excessive..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Antécédents Familiaux",
    tags: ["famille", "cardiovasculaire", "pack_essentiel", "corticotrope"]
  },
  // NOUVEAU - Diabète famille
  {
    id: "hist_diabete_famille",
    question: "Y a-t-il des antécédents de diabète dans votre famille ?",
    type: "boolean",
    tooltip: "Le diabète familial indique un terrain somatotrope avec déséquilibre insuline-glucagon. Le diabète de type 2 traduit une résistance à l'insuline héréditaire. Terrain de désynchronisation somatotrope à surveiller..",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Antécédents Familiaux",
    tags: ["famille", "diabete", "pack_essentiel", "somatotrope"]
  },
  // NOUVEAU - Psychiatrique famille
  {
    id: "hist_psychiatrique_famille",
    question: "Y a-t-il des antécédents psychiatriques dans votre famille (dépression, anxiété, troubles bipolaires) ?",
    type: "boolean",
    tooltip: "Les antécédents psychiatriques familiaux indiquent un terrain neuro-végétatif particulier avec déséquilibre des neurotransmetteurs (sérotonine, dopamine). Lien avec le cortisol et la TRH qui affectent les zones cérébrales limbiques..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Antécédents Familiaux",
    tags: ["famille", "psychiatrique", "neuro_vegetatif"]
  },
  // NOUVEAU - Thyroïde famille
  {
    id: "hist_thyroide_famille",
    question: "Y a-t-il des problèmes de thyroïde dans votre famille ?",
    type: "boolean",
    tooltip: "Les antécédents thyroïdiens familiaux (hypo/hyperthyroïdie, nodules, goitre) indiquent un terrain thyréotrope héréditaire. L'axe thyréotrope joue un rôle fondamental dans l'immunité, le métabolisme et le développement neuronal..",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Antécédents Familiaux",
    tags: ["famille", "thyroide", "thyreotrope"]
  },
  // NOUVEAU - Neurologique famille
  {
    id: "hist_neurologique_famille",
    question: "Y a-t-il des maladies neurologiques dans votre famille (Alzheimer, Parkinson, SEP) ?",
    type: "boolean",
    tooltip: "Les maladies neurologiques familiales peuvent indiquer une désynchronisation somatotrope héréditaire. La maladie d'Alzheimer est liée à un terrain œstro-thyroïdien et somatotrope particulier avec accumulation de protéines amyloïdes..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Antécédents Familiaux",
    tags: ["famille", "neurologique", "somatotrope"]
  },

  // ==========================================
  // IV. ANTÉCÉDENTS MÉDICAUX ADULTES
  // ==========================================
  {
    id: "hist_chirurgies_majeures",
    question: "Avez-vous subi des interventions chirurgicales majeures ?",
    type: "scale_1_5",
    scaleLabels: ["Aucune", "1 mineure", "1 majeure", "2-3", "Plus de 3"],
    tooltip: "Les chirurgies sont des stress majeurs qui sollicitent le syndrome général d'adaptation. Leur nombre et leur nature orientent vers le ou les axes autopathogènes. L'histoire chirurgicale complète l'histoire médicale..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Antécédents Adulte",
    tags: ["chirurgie", "adulte", "pack_essentiel", "adaptation"]
  },
  {
    id: "hist_hospitalisations",
    question: "Avez-vous été hospitalisé(e) de façon prolongée (>1 semaine) ?",
    type: "boolean",
    tooltip: "Les hospitalisations prolongées sont des agressions majeures qui épuisent le syndrome général d'adaptation. Elles peuvent modifier durablement le terrain..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Antécédents Adulte",
    tags: ["hospitalisation", "adulte", "epuisement"]
  },
  {
    id: "hist_maladies_chroniques",
    question: "Avez-vous des maladies chroniques diagnostiquées ?",
    type: "boolean",
    tooltip: "Les maladies chroniques traduisent un terrain critique installé. Elles orientent vers l'axe autopathogène et guident le traitement de terrain à long terme..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Antécédents Adulte",
    tags: ["chronique", "adulte", "terrain_critique"]
  },

  // ==========================================
  // V. GROSSESSE & NAISSANCE
  // ==========================================
  {
    id: "hist_naissance_prematuree",
    question: "Êtes-vous né(e) prématuré(e) ou avec un petit poids de naissance ?",
    type: "select",
    options: ["Naissance normale à terme", "Légère prématurité (35-37 semaines)", "Prématurité modérée (32-34 semaines)", "Grande prématurité (<32 semaines)", "Petit poids de naissance (<2.5kg)", "Ne sait pas"],
    tooltip: "La prématurité affecte les phases cruciales du développement endocrinien (fœtogenèse). Elle est associée à un risque accru d'asthme et de troubles immunitaires. L'exposition aux antibiotiques in utero est également un facteur aggravant..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Grossesse & Naissance",
    tags: ["naissance", "prematurite", "pack_essentiel", "developpement"]
  },
  {
    id: "hist_grossesse_mere_difficile",
    question: "La grossesse de votre mère a-t-elle été difficile (stress majeur, maladie, médications) ?",
    type: "boolean",
    tooltip: "La dyade materno-fœtale transmet le stress. Le terrain et le tempérament de la mère pendant la grossesse affectent l'activité endocrinienne de l'enfant. C'est la 'contagion émotionnelle' décrite par les auteurs..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Grossesse & Naissance",
    tags: ["naissance", "stress_prenatal", "contagion_emotionnelle"]
  },
  {
    id: "hist_accouchement_difficile",
    question: "Votre accouchement a-t-il été difficile (forceps, césarienne d'urgence, souffrance fœtale) ?",
    type: "boolean",
    tooltip: "Un accouchement difficile représente un stress majeur pour le nouveau-né. Il peut impacter le développement neurologique et la trajectoire adaptative précoce. La prolactine atteint son pic pendant l'accouchement..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Grossesse & Naissance",
    tags: ["naissance", "traumatisme_naissance"]
  },
  {
    id: "hist_allaitement",
    question: "Avez-vous été allaité(e) au sein et pendant combien de temps ?",
    type: "select",
    options: ["Jamais allaité", "Moins de 3 mois", "3-6 mois", "6-12 mois", "Plus de 12 mois", "Ne sait pas"],
    tooltip: "L'allaitement maternel est un facteur protecteur majeur contre l'asthme et les allergies. Il favorise le développement du microbiote et la maturation immunitaire. L'absence d'allaitement est un facteur aggravant pour l'atopie..",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Grossesse & Naissance",
    tags: ["naissance", "allaitement", "immunite", "microbiote"]
  },

  // ==========================================
  // VI. TRAITEMENTS ET EXPOSITIONS
  // ==========================================
  {
    id: "hist_antibiotiques_enfance",
    question: "Avez-vous reçu beaucoup d'antibiotiques durant l'enfance ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun/rare", "Occasionnel", "Fréquent", "Très fréquent", "Quasi-permanent"],
    tooltip: "L'exposition aux antibiotiques dans la petite enfance est un facteur aggravant majeur pour l'asthme et les dysbioses durables. Elle perturbe la colonisation du microbiote et le développement immunitaire. L'utilisation prénatale d'antibiotiques par la mère augmente aussi le risque..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Traitements & Expositions",
    tags: ["traitements", "antibiotiques", "pack_essentiel", "dysbiose"]
  },
  {
    id: "hist_vaccinations_reactions",
    question: "Avez-vous eu des réactions importantes aux vaccinations ?",
    type: "boolean",
    tooltip: "Les réactions vaccinales marquées indiquent une réactivité immunitaire particulière et peuvent orienter vers un terrain allergique ou auto-immun..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Traitements & Expositions",
    tags: ["traitements", "vaccins", "immunite"]
  },
  {
    id: "hist_traitements_hormonaux",
    question: "Avez-vous pris des traitements hormonaux prolongés (contraception, THS, corticoïdes) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "<1 an", "1-5 ans", "5-10 ans", ">10 ans"],
    tooltip: "Les traitements hormonaux modifient durablement le terrain endocrinien. La contraception orale affecte l'axe gonadotrope, les corticoïdes l'axe corticotrope. Ces modifications peuvent persister après l'arrêt..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Traitements & Expositions",
    tags: ["traitements", "hormones", "pack_essentiel", "iatrogene"]
  },
  {
    id: "hist_psychotropes",
    question: "Avez-vous pris des traitements psychotropes (antidépresseurs, anxiolytiques, neuroleptiques) ?",
    type: "boolean",
    tooltip: "Les psychotropes affectent le système nerveux et les neurotransmetteurs. Leur utilisation prolongée peut modifier la réactivité adaptative et le terrain neurologique..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Traitements & Expositions",
    tags: ["traitements", "psychotropes", "neurologique"]
  },
  // NOUVEAU - Expositions toxiques
  {
    id: "hist_expositions_toxiques",
    question: "Avez-vous été exposé(e) à des toxiques (pesticides, solvants, métaux lourds, tabac passif) ?",
    type: "boolean",
    tooltip: "Les expositions toxiques modifient l'épigénétique et le terrain endocrinien. Les perturbateurs endocriniens affectent particulièrement les axes thyréotrope et gonadotrope. L'environnement est un des 6 facteurs d'évaluation des antécédents..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Traitements & Expositions",
    tags: ["toxiques", "environnement", "epigenetique"]
  },

  // ==========================================
  // VII. STRESS ET ÉVÉNEMENTS DE VIE ADULTE
  // ==========================================
  {
    id: "hist_stress_chronique_vie",
    question: "Avez-vous vécu des périodes de stress chronique intense dans votre vie adulte ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Quasi-permanent"],
    tooltip: "Le stress chronique adulte sollicite l'axe corticotrope et peut créer un terrain d'épuisement adaptatif. Un homme de 29 ans présentant douleur chronique et fatigue avait vécu pertes d'amis, travail et rupture la même année..",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Stress & Événements Vie",
    tags: ["stress", "adulte", "pack_essentiel", "corticotrope", "adaptation"]
  },
  {
    id: "hist_deuil_majeur",
    question: "Avez-vous vécu des deuils majeurs difficiles à surmonter ?",
    type: "boolean",
    tooltip: "Les deuils non résolus maintiennent un état de stress chronique qui affecte le terrain. Ils peuvent être des facteurs déclencheurs de maladies, notamment lors des pauses génitales..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Stress & Événements Vie",
    tags: ["stress", "deuil", "trajectoire"]
  },
  {
    id: "hist_accidents_graves",
    question: "Avez-vous eu des accidents graves ou des hospitalisations longues ?",
    type: "boolean",
    tooltip: "Les accidents et hospitalisations sont des agressions majeures qui sollicitent le syndrome général d'adaptation et peuvent modifier durablement le terrain..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Stress & Événements Vie",
    tags: ["stress", "traumatisme", "adaptation"]
  },
  {
    id: "hist_rupture_relation_majeure",
    question: "Avez-vous vécu des ruptures relationnelles majeures (divorce, séparation) ?",
    type: "boolean",
    tooltip: "Les ruptures relationnelles sont des stress majeurs qui peuvent déclencher des maladies, surtout lors des pauses génitales (28-32 ans, 47+ ans). Une femme de 31 ans a développé des douleurs pelviennes non expliquées après une rupture..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Stress & Événements Vie",
    tags: ["stress", "rupture", "pause_genitale"]
  },
  {
    id: "hist_pause_genitale_symptomes",
    question: "Avez-vous remarqué l'apparition de symptômes autour des âges 28-32, 35, 42 ou 49 ans ?",
    type: "boolean",
    tooltip: "Les pauses génitales surviennent environ tous les 7 ans et permettent à l'organisme de restructurer la fonction gonadotrope. Elles peuvent déclencher kystes, fibromes, thyroïdite. La maladie apparaît souvent dans les 2-5 ans après la pause..",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Stress & Événements Vie",
    tags: ["pause_genitale", "chronobiologie", "gonadotrope"]
  },
  // NOUVEAU - Ménopause/Andropause détaillée
  {
    id: "hist_menopause_andropause",
    question: "(50+ ans) Avez-vous ressenti des changements importants à la ménopause/andropause ?",
    type: "scale_1_5",
    scaleLabels: ["Pas concerné(e)", "Transition douce", "Symptômes légers", "Symptômes modérés", "Symptômes sévères"],
    tooltip: "La gonadopause (Phase 7) marque la fin de la fertilité chez la femme et son déclin chez l'homme. Restructurer la fonction génitale peut modifier la structure, la fonction et la personnalité plus que les autres pauses génitales. La prédominance des androgènes post-ménopause permet une exploration de soi..",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Stress & Événements Vie",
    tags: ["menopause", "andropause", "pack_essentiel", "gonadopause"]
  },
  // NOUVEAU - Changement de personnalité
  {
    id: "hist_changement_personnalite",
    question: "Avez-vous remarqué des changements de personnalité après certaines périodes de vie ?",
    type: "boolean",
    tooltip: "La personnalité n'est pas fixée comme le tempérament mais tend à être durable. Le lien entre la fonction neuroendocrine et la personnalité (physio-psychologie) peut se modifier lors des pauses génitales ou des stress majeurs..",
    weight: 2,
    priority: 3,
    scoreDirection: "neutral",
    section: "Stress & Événements Vie",
    tags: ["personnalite", "physio_psychologie", "trajectoire"]
  },

  // ==========================================
  // VIII. TRAJECTOIRE D'ADAPTATION
  // NOUVEAU - Section ajoutée
  // ==========================================
  {
    id: "hist_periode_hyperfonctionnement",
    question: "Avez-vous connu des périodes où vous fonctionniez 'à 200%' (énergie excessive, peu de sommeil nécessaire) ?",
    type: "boolean",
    tooltip: "Les périodes d'hyperfonctionnement peuvent précéder un épuisement (burnout). Elles traduisent un état d'hyper-adaptation qui sollicite excessivement les réserves. La trajectoire beige (Figure 2-1) montre un patient hyper-adapté qui entre ensuite en épuisement..",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Trajectoire d'Adaptation",
    tags: ["trajectoire", "hyperadaptation", "epuisement"]
  },
  {
    id: "hist_periode_hypofonctionnement",
    question: "Avez-vous connu des périodes prolongées de fatigue ou de sous-fonctionnement ?",
    type: "boolean",
    tooltip: "Les périodes d'hypofonctionnement traduisent un état de désadaptation ou d'épuisement des réserves. La trajectoire verte (Figure 2-1) montre un patient avec ETE entrant dans un hypofonctionnement précoce..",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Trajectoire d'Adaptation",
    tags: ["trajectoire", "hypoadaptation", "fatigue"]
  },
  {
    id: "hist_resilience",
    question: "Comment évaluez-vous votre capacité à rebondir après les difficultés ?",
    type: "scale_1_5",
    scaleLabels: ["Très faible", "Faible", "Moyenne", "Bonne", "Excellente"],
    tooltip: "La résilience reflète la capacité adaptative du terrain. Elle dépend de l'intégrité des axes endocriniens et de l'histoire des ETE. La trajectoire optimale (ligne noire, Figure 2-1) montre une capacité à retrouver le fonctionnement optimal après un stress..",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Trajectoire d'Adaptation",
    tags: ["trajectoire", "resilience", "adaptation"]
  }
];

export default AxeHistoriqueConfig;