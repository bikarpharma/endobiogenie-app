import type { QuestionConfig } from "../types";

/**
 * AXE ADAPTATIF (CORTICOTROPE) - VERSION ENRICHIE
 * Évalue l'axe hypothalamo-hypophyso-surrénalien (HHS)
 * 
 * CONCEPTS CLÉS :
 * - Première boucle : CRH → ACTH → Cortisol + DHEA (catabolisme + mobilisation)
 * - Deuxième boucle : Vasopressine → Aldostérone (hydroélectrolytique)
 * - Permissivité du cortisol : potentialise l'activité des autres hormones
 * - Syndromes d'adaptation de Selye : aigu, chronique, général
 * 
 * TOTAL : 38 questions (était 25)
 * - Priority 1 (ESSENTIEL) : 12 questions
 * - Priority 2 (IMPORTANT) : 18 questions
 * - Priority 3 (OPTIONNEL) : 8 questions
 * 
 * PACK ESSENTIEL (Mode Rapide) : 10 questions
 * cortico_fatigue_matin, cortico_reveil_precoce, cortico_sel,
 * cortico_anhedonie, cortico_prise_poids_abdominale, cortico_infections_recidivantes,
 * cortico_oedemes, cortico_faiblesse_musculaire, cortico_stress_chronique,
 * cortico_memoire_concentration
 */

const AxeAdaptatifEnrichiConfig: QuestionConfig[] = [
  // ==========================================
  // I. ÉNERGIE & RYTHME (Cortisol)
  // ==========================================
  {
    id: "cortico_fatigue_matin",
    question: "Ressentez-vous une fatigue importante dès le réveil, qui s'améliore le soir ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe majeur d'insuffisance corticotrope. Le cortisol devrait atteindre son pic maximal le matin pour nous donner l'énergie de démarrer la journée.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Énergie & Rythme",
    tags: ["cortisol_insuffisant", "rythme_circadien", "pack_essentiel"]
  },
  {
    id: "cortico_coup_pompe",
    question: "Avez-vous des coups de pompe brutaux vers 11h ou 17h (envie de sucre) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hypoglycémie réactionnelle par manque de réponse glucocorticoïde. Le cortisol maintient la glycémie entre les repas.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Énergie & Rythme",
    tags: ["hypoglycemie", "acth_insuffisant"]
  },
  {
    id: "cortico_endurance",
    question: "Avez-vous du mal à soutenir un effort prolongé (physique ou mental) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'axe corticotrope gère l'endurance et le 'deuxième souffle'. Le cortisol mobilise les réserves énergétiques pour maintenir l'effort.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Énergie & Rythme",
    tags: ["endurance", "cortisol_insuffisant"]
  },
  {
    id: "cortico_reveil_precoce",
    question: "Vous réveillez-vous souvent vers 3-5h du matin sans pouvoir vous rendormir ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe majeur d'ACTH élevée. Le pic précoce d'ACTH survient trop tôt, provoquant un réveil anticipé.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Énergie & Rythme",
    tags: ["sommeil", "acth_eleve", "hypercorticisme", "pack_essentiel"]
  },
  {
    id: "cortico_fatigue_chronique",
    question: "Souffrez-vous d'une fatigue chronique qui ne s'améliore pas avec le repos ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La fatigue chronique traduit un épuisement de l'axe corticotrope. Le cortisol peut être élevé ou insuffisant selon le stade.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Énergie & Rythme",
    tags: ["fatigue_chronique", "epuisement", "pack_essentiel"]
  },

  // ==========================================
  // II. MÉTABOLISME DE L'EAU & SEL (Aldostérone/Vasopressine)
  // ==========================================
  {
    id: "cortico_sel",
    question: "Avez-vous des envies impérieuses de sel ou d'aliments très salés ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Recherche de compensation d'une fuite sodée par hypo-aldostéronisme. L'aldostérone régule le sodium.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Eau & Sel",
    tags: ["aldosterone", "hypo_mineralocorticoide", "pack_essentiel"]
  },
  {
    id: "cortico_hypotension",
    question: "Avez-vous des vertiges en passant de la position couchée à debout ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hypotension orthostatique par manque de tonus vasculaire. L'aldostérone et l'adrénaline maintiennent la pression artérielle.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Eau & Sel",
    tags: ["hypotension", "aldosterone", "acth_insuffisant"]
  },
  {
    id: "cortico_oedemes",
    question: "Avez-vous des œdèmes (chevilles gonflées, doigts boudinés, visage bouffi le matin) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les œdèmes traduisent une rétention hydrosodée par excès d'aldostérone ou de vasopressine.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Eau & Sel",
    tags: ["aldosterone_elevee", "oedemes", "pack_essentiel", "retention"]
  },
  {
    id: "cortico_soif_excessive",
    question: "Avez-vous une soif excessive ou au contraire jamais soif ?",
    type: "select",
    options: ["Soif normale", "Jamais soif", "Souvent soif", "Soif excessive permanente"],
    tooltip: "La soif est régulée par la vasopressine et l'aldostérone. Jamais soif = hyper-vasopressine. Soif excessive = hypo-vasopressine ou diabète.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Eau & Sel",
    tags: ["vasopressine", "hydratation"]
  },
  {
    id: "cortico_tension_arterielle",
    question: "Avez-vous une tension artérielle anormale ?",
    type: "select",
    options: ["Normale", "Basse (hypotension)", "Limite haute", "Haute (hypertension traitée)", "Haute non contrôlée"],
    tooltip: "L'angiotensine II et l'aldostérone régulent la tension. L'hypertension peut traduire un excès d'aldostérone, l'hypotension une insuffisance.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Eau & Sel",
    tags: ["angiotensine", "aldosterone", "tension"]
  },

  // ==========================================
  // III. INFLAMMATION & IMMUNITÉ
  // ==========================================
  {
    id: "cortico_douleurs",
    question: "Souffrez-vous de douleurs inflammatoires récurrentes (tendinites, articulations) qui 'voyagent' ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le cortisol est l'anti-inflammatoire naturel. Un déficit laisse l'inflammation s'exprimer de façon récurrente.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Inflammation",
    tags: ["inflammation", "cortisol_insuffisant"]
  },
  {
    id: "cortico_cicatrisation",
    question: "Vos blessures cicatrisent-elles très lentement ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Un excès de cortisol (catabolisme) empêche la réparation tissulaire. Le cortisol dégrade les protéines nécessaires à la cicatrisation.",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Inflammation",
    tags: ["cicatrisation", "cortisol_excessif", "catabolisme"]
  },
  {
    id: "cortico_ecchymoses",
    question: "Faites-vous facilement des bleus (ecchymoses) même pour des chocs minimes ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de cortisol élevé. L'excès de cortisol fragilise les parois capillaires et le tissu conjonctif.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Inflammation",
    tags: ["cortisol_eleve", "fragilite_capillaire"]
  },
  {
    id: "cortico_infections_recidivantes",
    question: "Faites-vous des infections à répétition (ORL, urinaires, bronchites) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Terrain précritique classique. Le cortisol module l'immunité ; son insuffisance ou excès compromet les défenses immunitaires.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Inflammation",
    tags: ["terrain_precritique", "deficit_immunitaire", "pack_essentiel"]
  },
  {
    id: "cortico_herpes_recidivant",
    question: "Avez-vous des poussées récurrentes d'herpès (labial ou génital) ?",
    type: "select",
    options: ["Jamais", "Rarement (<1/an)", "Parfois (1-3/an)", "Souvent (>3/an)", "Très souvent"],
    tooltip: "L'herpès récidivant traduit un cortisol excessif qui immunosupprime. Le stress réactive le virus latent.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Inflammation",
    tags: ["herpes", "cortisol_excessif", "immunosuppression"]
  },
  {
    id: "cortico_allergies",
    question: "Avez-vous des allergies qui s'aggravent avec le stress ?",
    type: "boolean",
    tooltip: "Le cortisol est anti-allergique. Son insuffisance laisse l'histamine s'exprimer. L'ACTH augmente les récepteurs à l'histamine.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Inflammation",
    tags: ["allergies", "histamine", "cortisol_insuffisant"]
  },

  // ==========================================
  // IV. SIGNES CUTANÉS
  // ==========================================
  {
    id: "cortico_stries_violacees",
    question: "Avez-vous des stries violacées sur la peau (ventre, cuisses, seins) ?",
    type: "boolean",
    tooltip: "Signe caractéristique d'un excès de cortisol chronique. Les stries violacées traduisent une fragilisation du tissu conjonctif.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["cortisol_excessif", "stries", "hypercorticisme"]
  },
  {
    id: "cortico_acne_dos",
    question: "Avez-vous ou avez-vous eu de l'acné dans le dos ?",
    type: "boolean",
    tooltip: "L'acné du dos est spécifiquement liée à une ACTH élevée, contrairement à l'acné du visage (androgènes).",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["acth_eleve", "acne", "signes_cutanes"]
  },
  {
    id: "cortico_eczema_plis",
    question: "Avez-vous de l'eczéma aux plis de flexion (coudes, genoux) ?",
    type: "boolean",
    tooltip: "L'eczéma des plis de flexion est un marqueur d'ACTH élevée avec insuffisance relative du cortisol.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["acth_eleve", "eczema", "atopie"]
  },
  {
    id: "cortico_peau_fine",
    question: "Votre peau est-elle devenue fine et fragile avec l'âge ?",
    type: "boolean",
    tooltip: "La peau fine traduit un catabolisme cutané par excès de cortisol chronique qui dégrade le collagène.",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Signes Cutanés",
    tags: ["cortisol_excessif", "peau", "catabolisme"]
  },

  // ==========================================
  // V. MORPHOLOGIE & MÉTABOLISME
  // ==========================================
  {
    id: "cortico_visage_lunaire",
    question: "Votre visage a-t-il tendance à être rond ou bouffi ?",
    type: "boolean",
    tooltip: "Le visage 'en pleine lune' est un signe classique d'excès de cortisol avec adiposité faciale.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Morphologie",
    tags: ["cortisol_excessif", "adiposite_faciale", "cushing"]
  },
  {
    id: "cortico_prise_poids_abdominale",
    question: "Avez-vous une prise de poids localisée principalement au niveau du ventre ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Légèrement", "Modérément", "Nettement", "Très nettement"],
    tooltip: "Signe majeur de cortisol élevé. L'adiposité abdominale est caractéristique de l'hypercorticisme.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Morphologie",
    tags: ["cortisol_eleve", "adiposite_abdominale", "syndrome_metabolique", "pack_essentiel"]
  },
  {
    id: "cortico_faiblesse_musculaire",
    question: "Ressentez-vous une faiblesse musculaire, surtout au niveau des cuisses et des bras ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le cortisol élevé est catabolique et dégrade les protéines musculaires. La myopathie proximale est caractéristique.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Morphologie",
    tags: ["cortisol_excessif", "myopathie", "catabolisme", "pack_essentiel"]
  },
  {
    id: "cortico_cheveux_fonces_naissance",
    question: "Aviez-vous les cheveux foncés à la naissance ?",
    type: "boolean",
    tooltip: "Les cheveux foncés à la naissance indiquent une activité élevée des androgènes surrénaliens in utero.",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Morphologie",
    tags: ["androgenes_surrenaliens", "constitutionnel"]
  },

  // ==========================================
  // VI. DHEA & ANDROGÈNES SURRÉNALIENS
  // ==========================================
  {
    id: "cortico_libido",
    question: "Avez-vous une baisse de libido ou d'intérêt sexuel ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Légèrement", "Modérément", "Nettement", "Très nettement"],
    tooltip: "La DHEA est le réservoir des hormones sexuelles. Une baisse de DHEA entraîne une baisse de libido.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "DHEA & Androgènes",
    tags: ["dhea", "libido", "androgenes_surrenaliens"]
  },
  {
    id: "cortico_pilosite",
    question: "[Femmes] Avez-vous une pilosité excessive (visage, menton, poitrine) ?",
    type: "select",
    options: ["Non concerné (homme)", "Non", "Légère", "Modérée", "Importante"],
    tooltip: "La pilosité excessive traduit un excès d'androgènes surrénaliens (DHEA). La DHEA stimule les poils pubiens et du sacrum.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "DHEA & Androgènes",
    tags: ["dhea", "pilosite", "androgenes_surrenaliens"]
  },
  {
    id: "cortico_irritabilite_agressivite",
    question: "Êtes-vous facilement irritable ou agressif verbalement ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'irritabilité et l'agressivité peuvent traduire un excès de DHEA convertie en testostérone.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "DHEA & Androgènes",
    tags: ["dhea", "irritabilite", "testosterone"]
  },

  // ==========================================
  // VII. PSYCHISME & COGNITION
  // ==========================================
  {
    id: "cortico_irritabilite_faim",
    question: "Devenez-vous agressif ou très irritable quand vous avez faim ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Symptôme clé de l'hypoglycémie surrénalienne ('Hangry'). Le cerveau privé de glucose déclenche l'irritabilité.",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Psychisme",
    tags: ["hypoglycemie", "irritabilite"]
  },
  {
    id: "cortico_bruit",
    question: "Ne supportez-vous plus le bruit ou la lumière forte ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hypersensibilité par épuisement des seuils d'adaptation neuronale. L'axe corticotrope épuisé ne filtre plus les stimuli.",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Psychisme",
    tags: ["epuisement", "hypersensibilite"]
  },
  {
    id: "cortico_anhedonie",
    question: "Ressentez-vous un manque de plaisir ou d'intérêt, même pour ce que vous aimiez avant ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'insuffisance corticotrope. L'anhédonie traduit un épuisement de l'axe adaptatif.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Psychisme",
    tags: ["cortisol_insuffisant", "depression", "epuisement", "pack_essentiel"]
  },
  {
    id: "cortico_memoire_concentration",
    question: "Avez-vous des troubles de la mémoire ou de la concentration ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le cortisol et la vasopressine affectent la cognition. Un excès de cortisol endommage l'hippocampe (mémoire).",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Psychisme",
    tags: ["memoire", "cognition", "vasopressine", "pack_essentiel"]
  },
  {
    id: "cortico_difficulte_adaptation",
    question: "Avez-vous du mal à vous adapter aux changements (nouveaux environnements, situations imprévues) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'ACTH insuffisant. L'axe corticotrope gère la capacité d'adaptation de l'organisme.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Psychisme",
    tags: ["acth_insuffisant", "adaptation"]
  },

  // ==========================================
  // VIII. STRESS & ADAPTATION
  // ==========================================
  {
    id: "cortico_stress_chronique",
    question: "Êtes-vous soumis à un stress chronique (travail, famille, finances) ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Légèrement", "Modérément", "Beaucoup", "Énormément"],
    tooltip: "Le stress chronique sollicite en permanence l'axe corticotrope et peut mener à l'épuisement surrénalien.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Stress & Adaptation",
    tags: ["stress_chronique", "epuisement", "pack_essentiel"]
  },
  {
    id: "cortico_stress_aigu",
    question: "Avez-vous vécu un stress aigu récent (accident, décès, séparation) ?",
    type: "boolean",
    tooltip: "Le stress aigu déclenche une réponse corticotrope intense. L'adaptation dépend de la capacité de l'axe.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Stress & Adaptation",
    tags: ["stress_aigu", "trauma"]
  },
  {
    id: "cortico_recuperation_stress",
    question: "Après un stress, récupérez-vous difficilement ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La récupération lente traduit un épuisement de l'axe corticotrope ou une DHEA insuffisante pour l'anabolisme.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Stress & Adaptation",
    tags: ["recuperation", "dhea", "epuisement"]
  },

  // ==========================================
  // IX. SIGNES DIGESTIFS
  // ==========================================
  {
    id: "cortico_douleur_fosse_iliaque",
    question: "Avez-vous des douleurs ou ballonnements fréquents dans la région du bas-ventre droit ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'ACTH élevée. La congestion de la jonction iléo-caecale traduit une hyperactivité corticotrope.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Digestif",
    tags: ["acth_eleve", "jonction_ileocaecale", "congestion_digestive"]
  },

  // ==========================================
  // X. CHRONOBIOLOGIE & SAISONNALITÉ
  // ==========================================
  {
    id: "cortico_aggravation_automne_hiver",
    question: "Vos symptômes s'aggravent-ils en automne ou en hiver ?",
    type: "boolean",
    tooltip: "Signe d'adaptation thyroïdienne insuffisante au froid. L'axe cortico-thyréotrope doit s'adapter aux saisons.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Chronobiologie",
    tags: ["adaptation_saisonniere", "thyro_cortico"]
  },
  {
    id: "cortico_aggravation_printemps",
    question: "Vos symptômes s'aggravent-ils au printemps ?",
    type: "boolean",
    tooltip: "Peut signaler un trauma émotionnel saisonnier ou une relance adaptative insuffisante.",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Chronobiologie",
    tags: ["trauma_saisonnier", "relance_adaptative"]
  },
  {
    id: "cortico_date_anniversaire",
    question: "Avez-vous des symptômes récurrents à une date anniversaire particulière ?",
    type: "boolean",
    tooltip: "Signe de trauma ancré chronobiologiquement. Le corps 'se souvient' des événements traumatiques.",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Chronobiologie",
    tags: ["trauma_ancre", "chronobiologie"]
  }
];

export default AxeAdaptatifEnrichiConfig;