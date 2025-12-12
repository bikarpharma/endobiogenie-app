import type { QuestionConfig } from "../types";

/**
 * AXE THYRÉOTROPE (THYROÏDIEN) - VERSION ENRICHIE
 * -----------------------------------------------------
 * Explore la fonction thyroïdienne réelle (non biochimique),
 * la thermorégulation, les phanères, le transit et l'énergie.
 * 
 * NIVEAUX D'ÉVALUATION :
 * - TRH (central) : gestion des potentialités mentales/émotionnelles
 * - TSH (hypophysaire) : croissance tissulaire, sensibilité œstrogènes
 * - T4 (périphérique 1re boucle) : catabolisme, énergie structurelle
 * - T3 (périphérique 2e boucle) : métabolisme oxydatif cellulaire
 * - Calcitonine/PTH : métabolisme calcique
 * 
 * TOTAL : 52 questions (était 41)
 * - Priority 1 (ESSENTIEL) : 12 questions
 * - Priority 2 (IMPORTANT) : 28 questions
 * - Priority 3 (OPTIONNEL) : 12 questions
 * 
 * PACK ESSENTIEL (Mode Rapide) : 10 questions
 * thyro_metabolisme_general, thyro_frilosite, thyro_intolerance_chaleur,
 * thyro_ralentissement_general, thyro_reveil_nocturne, thyro_perte_poids_appetit,
 * thyro_sourcils_externes, thyro_antecedents_familiaux, thyro_goitre,
 * thyro_fatigue_chronique
 */

export const AxeThyroEnrichiConfig: QuestionConfig[] = [

  // ═══════════════════════════════════════════════════
  // 1. MÉTABOLISME (SIGNES GLOBAUX)
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_metabolisme_general",
    section: "Métabolisme",
    question: "Comment évaluez-vous votre métabolisme général ?",
    type: "scale_1_5",
    scaleLabels: ["Très lent", "Lent", "Normal", "Rapide", "Très rapide"],
    tooltip: "Le métabolisme général reflète l'efficacité de la conversion T4→T3 périphérique. Lent = hypofonction, rapide = hyperfonction.",
    weight: 3,
    priority: 1,
    tags: ["hypo_global", "hyper_global", "pack_essentiel"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_frilosite",
    section: "Métabolisme",
    question: "Avez-vous tendance à être frileux(se) ?",
    type: "boolean",
    tooltip: "Indicateur classique d'hypofonction thyroïdienne. La frilosité traduit une réponse déficiente à la demande de thermogenèse.",
    weight: 2,
    priority: 1,
    tags: ["hypo_global", "hypo_thermoregulation", "pack_essentiel"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_sensation_froid_extremites",
    section: "Métabolisme",
    question: "Avez-vous souvent les mains ou les pieds froids ?",
    type: "boolean",
    tooltip: "Signale un ralentissement métabolique et un défaut de vasodilatation périphérique. La T3 régule la thermogenèse.",
    weight: 2,
    priority: 2,
    tags: ["hypo_thermoregulation", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_intolerance_chaleur",
    section: "Métabolisme",
    question: "Avez-vous du mal à supporter la chaleur ?",
    type: "boolean",
    tooltip: "L'intolérance à la chaleur évoque un hyperfonctionnement de la T4. Le métabolisme accéléré produit un excès de chaleur.",
    weight: 2,
    priority: 1,
    tags: ["hyper_global", "hyper_thermoregulation", "pack_essentiel"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_prise_poids_facile",
    section: "Métabolisme",
    question: "Prenez-vous du poids facilement (même avec peu de calories) ?",
    type: "boolean",
    tooltip: "Signe d'hypofonction thyroïdienne : conversion T4→T3 ralentie, métabolisme basal diminué.",
    weight: 2,
    priority: 2,
    tags: ["hypo_metabolisme", "hypo_global"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_hypoglycemie",
    section: "Métabolisme",
    question: "Souffrez-vous d'hypoglycémies (malaises, tremblements quand vous ne mangez pas) ?",
    type: "boolean",
    tooltip: "L'hypoglycémie est liée à une TSH basse. La T3 augmente l'entrée du glucose dans les cellules et le nombre de récepteurs à l'insuline.",
    weight: 2,
    priority: 2,
    tags: ["tsh_basse", "hypoglycemie"],
    scoreDirection: "hypo"
  },

  // ═══════════════════════════════════════════════════
  // 2. PSYCHISME & ÉNERGIE
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_energie_mentale",
    section: "Psychisme",
    question: "Comment évaluez-vous votre énergie mentale ?",
    type: "scale_1_5",
    scaleLabels: ["Très lente", "Lente", "Normale", "Vive", "Hyperactive"],
    tooltip: "La clarté mentale dépend de la T3 cérébrale. Pensée lente = hypofonction, hyperactive = hyperfonction.",
    weight: 2,
    priority: 2,
    tags: ["hypo_psychisme", "hyper_psychisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_ralentissement_general",
    section: "Psychisme",
    question: "Avez-vous l'impression générale de fonctionner au ralenti (physiquement et mentalement) ?",
    type: "boolean",
    tooltip: "Signe typique d'hypoactivité thyroïdienne. Le ralentissement global traduit un déficit énergétique cellulaire.",
    weight: 3,
    priority: 1,
    tags: ["hypo_global", "hypo_energie", "pack_essentiel"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_difficultes_concentration",
    section: "Psychisme",
    question: "Avez-vous des difficultés de concentration ou de clarté mentale (brouillard cérébral) ?",
    type: "boolean",
    tooltip: "Le brouillard cérébral est associé à une TSH basse ou une insuffisance de conversion T4→T3.",
    weight: 2,
    priority: 2,
    tags: ["hypo_psychisme", "hypo_energie", "tsh_basse"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_fatigue_chronique",
    section: "Psychisme",
    question: "Souffrez-vous de fatigue chronique qui ne s'améliore pas avec le repos ?",
    type: "boolean",
    tooltip: "La fatigue chronique est liée à une TSH basse avec faible résistance à l'insuline et oxydation excessive.",
    weight: 3,
    priority: 1,
    tags: ["tsh_basse", "fatigue_chronique", "pack_essentiel"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_fibromyalgie",
    section: "Psychisme",
    question: "Avez-vous été diagnostiqué(e) avec une fibromyalgie ?",
    type: "boolean",
    tooltip: "La fibromyalgie est associée à une TSH sérique basse avec inflammation chronique et radicaux libres nocifs.",
    weight: 2,
    priority: 2,
    tags: ["tsh_basse", "fibromyalgie"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_anxiete_agitation",
    section: "Psychisme",
    question: "Vous sentez-vous souvent anxieux(se) ou agité(e) ?",
    type: "boolean",
    tooltip: "Signe de TRH hyper-fonctionnante. L'anxiété traduit une hyperactivité centrale thyréotrope.",
    weight: 2,
    priority: 2,
    tags: ["hyper_psychisme", "hyper_global", "trh_eleve"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_reves_intenses",
    section: "Psychisme",
    question: "Avez-vous des rêves particulièrement intenses ou vifs ?",
    type: "boolean",
    tooltip: "Signe majeur de TRH prédominante. La TRH module l'intensité onirique - rêves vifs = hyperactivité TRH.",
    weight: 2,
    priority: 2,
    tags: ["hyper_psychisme", "trh_eleve"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_cauchemars",
    section: "Psychisme",
    question: "Souffrez-vous de cauchemars fréquents ou de terreurs nocturnes ?",
    type: "boolean",
    tooltip: "Signe de sur-stimulation TRH. L'hypervigilance diurne se poursuit la nuit.",
    weight: 2,
    priority: 2,
    tags: ["hyper_psychisme", "trh_eleve", "sommeil"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_rumination",
    section: "Psychisme",
    question: "Avez-vous tendance à ruminer les mêmes pensées en boucle ?",
    type: "boolean",
    tooltip: "Signe de TRH élevée. La rumination traduit une consommation de la capacité tampon limbique.",
    weight: 2,
    priority: 2,
    tags: ["hyper_psychisme", "trh_eleve"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_sursaut",
    section: "Psychisme",
    question: "Sursautez-vous facilement au moindre bruit ou contact ?",
    type: "boolean",
    tooltip: "Signe de TRH réactive. L'hyperréactivité indique une sur-stimulation du système d'alerte.",
    weight: 2,
    priority: 2,
    tags: ["hyper_psychisme", "trh_reactive"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_craintif",
    section: "Psychisme",
    question: "Vous sentez-vous souvent craintif(ve) ou peureux(se) sans raison apparente ?",
    type: "boolean",
    tooltip: "Signe de thyroïde insuffisante. La crainte traduit un déficit d'adaptation thyréotrope.",
    weight: 2,
    priority: 2,
    tags: ["hypo_psychisme", "thyroide_insuffisante"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_depression_saisonniere",
    section: "Psychisme",
    question: "Avez-vous une tendance dépressive qui s'aggrave en automne/hiver ?",
    type: "boolean",
    tooltip: "Signe d'axe thyréotrope dysfonctionnel. La dépression saisonnière est liée à la désadaptation circadienne TRH.",
    weight: 2,
    priority: 2,
    tags: ["hypo_psychisme", "trh_insuffisante", "saisonnier"],
    scoreDirection: "hypo"
  },

  // ═══════════════════════════════════════════════════
  // 3. SOMMEIL
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_reveil_nocturne",
    section: "Sommeil",
    question: "Vous réveillez-vous fréquemment la nuit ?",
    type: "boolean",
    tooltip: "Signe de TRH élevée. L'hypervigilance centrale perturbe l'architecture du sommeil.",
    weight: 2,
    priority: 1,
    tags: ["hyper_psychisme", "trh_eleve", "pack_essentiel"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_insomnie",
    section: "Sommeil",
    question: "Souffrez-vous d'insomnie (difficulté d'endormissement ou réveils précoces) ?",
    type: "boolean",
    tooltip: "L'insomnie est liée à la TRH et non à la T3. C'est un signe de sur-stimulation centrale.",
    weight: 2,
    priority: 2,
    tags: ["hyper_psychisme", "trh_eleve"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_hypersomnie",
    section: "Sommeil",
    question: "Dormez-vous excessivement (plus de 10h) et vous réveillez-vous fatigué(e) ?",
    type: "boolean",
    tooltip: "L'hypersomnie traduit une hypofonction thyroïdienne avec métabolisme ralenti.",
    weight: 2,
    priority: 2,
    tags: ["hypo_psychisme", "hypo_global"],
    scoreDirection: "hypo"
  },

  // ═══════════════════════════════════════════════════
  // 4. TISSUS & PHANÈRES
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_chute_cheveux",
    section: "Tissus",
    question: "Perdez-vous vos cheveux de manière importante ?",
    type: "boolean",
    tooltip: "La chute de cheveux peut être liée à une hypo- ou hyperfonction thyroïdienne. En hyper T4, c'est un signe d'inflammation.",
    weight: 2,
    priority: 2,
    tags: ["hypo_tissus", "hyper_tissus"],
    scoreDirection: "neutral"
  },
  {
    id: "thyro_cheveux_secs",
    section: "Tissus",
    question: "Vos cheveux sont-ils secs, cassants ou ternes ?",
    type: "boolean",
    tooltip: "Signe d'hypofonction thyroïdienne périphérique. Le métabolisme ralenti affecte la qualité des phanères.",
    weight: 2,
    priority: 2,
    tags: ["hypo_tissus", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_sourcils_externes",
    section: "Tissus",
    question: "Avez-vous une perte de la queue des sourcils (tiers externe) ?",
    type: "boolean",
    tooltip: "Signe classique d'hypothyroïdie périphérique. La perte de la queue des sourcils est un marqueur clinique majeur.",
    weight: 3,
    priority: 1,
    tags: ["hypo_tissus", "hypo_global", "pack_essentiel"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_ongles_cassants",
    section: "Tissus",
    question: "Vos ongles sont-ils cassants, striés ou se dédoublent-ils ?",
    type: "boolean",
    tooltip: "Les ongles fragiles traduisent un déficit thyroïdien périphérique affectant la kératinisation.",
    weight: 1,
    priority: 3,
    tags: ["hypo_tissus", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_peau_seche",
    section: "Tissus",
    question: "Votre peau est-elle sèche, rugueuse ou squameuse ?",
    type: "boolean",
    tooltip: "La sécheresse cutanée est un signe d'hypofonction thyroïdienne avec diminution des sécrétions sébacées.",
    weight: 2,
    priority: 2,
    tags: ["hypo_tissus", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_myxoedeme",
    section: "Tissus",
    question: "Avez-vous un gonflement du visage, des paupières ou des extrémités (ne prenant pas le godet) ?",
    type: "boolean",
    tooltip: "Le myxœdème est un signe d'hypothyroïdie avancée avec infiltration des tissus par des mucopolysaccharides.",
    weight: 3,
    priority: 1,
    tags: ["hypo_tissus", "myxoedeme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_oedeme_chevilles",
    section: "Tissus",
    question: "Avez-vous un gonflement ou un coussinet adipeux au niveau des chevilles ?",
    type: "boolean",
    tooltip: "Signe de TSH élevée (réactive). L'œdème des chevilles traduit une congestion lymphatique.",
    weight: 2,
    priority: 2,
    tags: ["hypo_tissus", "tsh_eleve"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_cheveux_boucles",
    section: "Tissus",
    question: "Avez-vous les cheveux naturellement bouclés ou ondulés ?",
    type: "boolean",
    tooltip: "Les cheveux bouclés sont un signe constitutionnel de TRH prédominante.",
    weight: 1,
    priority: 3,
    tags: ["constitutionnel", "trh_predominante"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_paume_rouge",
    section: "Tissus",
    question: "Avez-vous les paumes des mains rouges (érythème palmaire) ?",
    type: "boolean",
    tooltip: "Signe de thyroïde forte. L'érythème palmaire traduit une vasodilatation périphérique.",
    weight: 2,
    priority: 2,
    tags: ["hyper_tissus", "thyroide_forte"],
    scoreDirection: "hyper"
  },

  // ═══════════════════════════════════════════════════
  // 5. DIGESTION & TRANSIT
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_transit_lent",
    section: "Digestion",
    question: "Avez-vous tendance au transit lent ou à la constipation ?",
    type: "boolean",
    tooltip: "Le ralentissement du transit est corrélé à une hypofonction thyroïdienne périphérique.",
    weight: 2,
    priority: 2,
    tags: ["hypo_digestion", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_digestion_lente",
    section: "Digestion",
    question: "Avez-vous l'impression que votre digestion est lente ?",
    type: "boolean",
    tooltip: "La digestion lente reflète une réduction du métabolisme global.",
    weight: 1,
    priority: 3,
    tags: ["hypo_digestion", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_appetit_augmente",
    section: "Digestion",
    question: "Avez-vous un appétit augmenté sans prise de poids ?",
    type: "boolean",
    tooltip: "Signe d'hyperfonction thyroïdienne. Le métabolisme accéléré brûle les calories rapidement.",
    weight: 2,
    priority: 2,
    tags: ["hyper_metabolisme", "hyper_global"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_perte_poids_appetit",
    section: "Digestion",
    question: "Perdez-vous du poids malgré un bon appétit ?",
    type: "boolean",
    tooltip: "Signe majeur de thyroïde excessive. L'hypercatabolisme brûle les réserves plus vite qu'elles ne sont reconstituées.",
    weight: 3,
    priority: 1,
    tags: ["hyper_metabolisme", "thyroide_excessive", "pack_essentiel"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_diarrhee",
    section: "Digestion",
    question: "Avez-vous des diarrhées fréquentes ou un transit accéléré ?",
    type: "boolean",
    tooltip: "Le transit accéléré est un signe d'hyperfonction thyroïdienne avec augmentation de la motricité digestive.",
    weight: 2,
    priority: 2,
    tags: ["hyper_digestion", "hyper_metabolisme"],
    scoreDirection: "hyper"
  },

  // ═══════════════════════════════════════════════════
  // 6. CARDIO-VASCULAIRE
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_tachycardie_repos",
    section: "Cardio-vasculaire",
    question: "Avez-vous parfois des battements du cœur rapides au repos ?",
    type: "boolean",
    tooltip: "Une tachycardie de repos indique une hyperactivité thyroïdienne. La thyroïde sensibilise le cœur aux catécholamines.",
    weight: 2,
    priority: 2,
    tags: ["hyper_cardio", "hyper_global"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_palpitations",
    section: "Cardio-vasculaire",
    question: "Avez-vous des palpitations ou des extrasystoles ?",
    type: "boolean",
    tooltip: "Les palpitations sont liées à la TRH (dromotropie). La TRH accélère la vitesse de transmission des impulsions cardiaques.",
    weight: 2,
    priority: 2,
    tags: ["hyper_cardio", "trh_eleve"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_froid_apres_effort",
    section: "Cardio-vasculaire",
    question: "Avez-vous du mal à vous réchauffer après un effort ou une exposition au froid ?",
    type: "boolean",
    tooltip: "Indique une difficulté d'adaptation thermogénique. La T3 devrait relancer la production de chaleur.",
    weight: 2,
    priority: 2,
    tags: ["hypo_thermoregulation", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_pouls_lent",
    section: "Cardio-vasculaire",
    question: "Avez-vous un pouls lent au repos (< 60 bpm) ?",
    type: "boolean",
    tooltip: "Bradycardie de repos : signe d'hypofonction thyroïdienne chronique.",
    weight: 1,
    priority: 3,
    tags: ["hypo_cardio", "hypo_global"],
    scoreDirection: "hypo"
  },

  // ═══════════════════════════════════════════════════
  // 7. MUSCULO-SQUELETTIQUE & CALCIUM
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_crampes",
    section: "Musculo-squelettique",
    question: "Avez-vous des crampes musculaires fréquentes ?",
    type: "boolean",
    tooltip: "Les crampes peuvent traduire un déséquilibre calcique lié à la calcitonine/PTH de l'axe thyréotrope.",
    weight: 2,
    priority: 2,
    tags: ["calcium", "musculaire"],
    scoreDirection: "neutral"
  },
  {
    id: "thyro_tremblements",
    section: "Musculo-squelettique",
    question: "Avez-vous des tremblements fins des mains ?",
    type: "boolean",
    tooltip: "Les tremblements sont liés à la TRH et non à la T3. C'est un signe d'hyperactivité centrale.",
    weight: 2,
    priority: 2,
    tags: ["hyper_musculaire", "trh_eleve"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_faiblesse_musculaire",
    section: "Musculo-squelettique",
    question: "Ressentez-vous une faiblesse musculaire ou une fonte musculaire ?",
    type: "boolean",
    tooltip: "La TRH stimule la myolyse. Une hyperactivité TRH prolongée entraîne une fonte musculaire.",
    weight: 2,
    priority: 2,
    tags: ["hyper_musculaire", "trh_eleve", "catabolisme"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_osteoporose",
    section: "Musculo-squelettique",
    question: "Avez-vous une ostéoporose ou une fragilité osseuse ?",
    type: "boolean",
    tooltip: "La T4 stimule l'ostéoclastie (libération de calcium). Un excès chronique déminéralise l'os.",
    weight: 2,
    priority: 2,
    tags: ["hyper_osseux", "t4_eleve", "calcium"],
    scoreDirection: "hyper"
  },

  // ═══════════════════════════════════════════════════
  // 8. SIGNES GYNÉCOLOGIQUES
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_regles_abondantes",
    section: "Gynécologique",
    question: "Avez-vous des règles abondantes ou prolongées ?",
    type: "boolean",
    tooltip: "Signe de thyroïde insuffisante. Les ménorragies sont liées à l'hyperœstrogénie relative.",
    weight: 2,
    priority: 2,
    tags: ["hypo_gyneco", "thyroide_insuffisante"],
    scoreDirection: "hypo",
    conditionalDisplay: { field: "sexe", value: "F" }
  },
  {
    id: "thyro_regles_courtes",
    section: "Gynécologique",
    question: "Vos règles sont-elles courtes ou peu abondantes ?",
    type: "boolean",
    tooltip: "Signe de thyroïde excessive qui accélère le catabolisme des œstrogènes.",
    weight: 2,
    priority: 2,
    tags: ["hyper_gyneco", "thyroide_excessive"],
    scoreDirection: "hyper",
    conditionalDisplay: { field: "sexe", value: "F" }
  },
  {
    id: "thyro_spm_irritabilite",
    section: "Gynécologique",
    question: "Souffrez-vous de syndrome prémenstruel avec irritabilité majeure ?",
    type: "boolean",
    tooltip: "Signe de thyroïde augmentée. Le SPM avec irritabilité traduit un déséquilibre thyro-gonadique.",
    weight: 2,
    priority: 2,
    tags: ["hyper_gyneco", "thyroide_augmentee"],
    scoreDirection: "hyper",
    conditionalDisplay: { field: "sexe", value: "F" }
  },

  // ═══════════════════════════════════════════════════
  // 9. ORL & MORPHOLOGIE
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_goitre",
    section: "ORL",
    question: "Avez-vous un goitre (augmentation visible du volume de la thyroïde) ?",
    type: "boolean",
    tooltip: "Le goitre traduit une hyperplasie thyroïdienne par stimulation TSH excessive ou carence en iode.",
    weight: 3,
    priority: 1,
    tags: ["goitre", "tsh_eleve", "pack_essentiel"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_amygdales_hypertrophie",
    section: "ORL",
    question: "Avez-vous eu ou avez-vous des amygdales volumineuses ?",
    type: "boolean",
    tooltip: "Signe de thyroïde insuffisante avec TSH compensatoire élevée. L'adénose est liée à la TRH.",
    weight: 2,
    priority: 2,
    tags: ["hypo_orl", "tsh_eleve", "adenose"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_voix_rauque",
    section: "ORL",
    question: "Votre voix est-elle devenue rauque ou grave ?",
    type: "boolean",
    tooltip: "La voix rauque est un signe d'hypothyroïdie avec infiltration des cordes vocales.",
    weight: 2,
    priority: 2,
    tags: ["hypo_orl", "myxoedeme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_yeux_grands",
    section: "ORL",
    question: "A-t-on déjà remarqué que vous avez de grands yeux ?",
    type: "boolean",
    tooltip: "Les grands yeux sont un signe constitutionnel de TRH et alpha central forts.",
    weight: 1,
    priority: 3,
    tags: ["constitutionnel", "trh_forte", "alpha_central"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_exophtalmie",
    section: "ORL",
    question: "Vos yeux semblent-ils sortir des orbites (exophtalmie) ?",
    type: "boolean",
    tooltip: "L'exophtalmie est un signe de maladie de Basedow (hyperthyroïdie auto-immune).",
    weight: 3,
    priority: 1,
    tags: ["hyper_orl", "basedow", "auto_immun"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_traits_fins",
    section: "ORL",
    question: "Avez-vous des traits du visage plutôt fins et délicats ?",
    type: "boolean",
    tooltip: "Les traits fins sont un signe de TSH prédominante en structure.",
    weight: 1,
    priority: 3,
    tags: ["constitutionnel", "tsh_predominante"],
    scoreDirection: "hypo"
  },

  // ═══════════════════════════════════════════════════
  // 10. ANTÉCÉDENTS & AUTO-IMMUNITÉ
  // ═══════════════════════════════════════════════════
  {
    id: "thyro_antecedents_familiaux",
    section: "Antécédents",
    question: "Avez-vous des antécédents familiaux de maladie thyroïdienne ?",
    type: "boolean",
    tooltip: "Les maladies thyroïdiennes ont une composante génétique importante, surtout les formes auto-immunes.",
    weight: 3,
    priority: 1,
    tags: ["antecedents", "familial", "pack_essentiel"],
    scoreDirection: "neutral"
  },
  {
    id: "thyro_hashimoto",
    section: "Antécédents",
    question: "Avez-vous une thyroïdite de Hashimoto (anticorps anti-TPO positifs) ?",
    type: "boolean",
    tooltip: "La thyroïdite de Hashimoto est une auto-immunité thyroïdienne menant à l'hypothyroïdie.",
    weight: 3,
    priority: 1,
    tags: ["auto_immun", "hashimoto", "hypo_global"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_basedow",
    section: "Antécédents",
    question: "Avez-vous une maladie de Basedow (ou Graves) ?",
    type: "boolean",
    tooltip: "La maladie de Basedow est une auto-immunité thyroïdienne menant à l'hyperthyroïdie.",
    weight: 3,
    priority: 1,
    tags: ["auto_immun", "basedow", "hyper_global"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_traitement",
    section: "Antécédents",
    question: "Prenez-vous un traitement thyroïdien (Lévothyrox, antithyroïdiens) ?",
    type: "select",
    options: ["Non", "Lévothyrox ou équivalent", "Antithyroïdiens", "Autre traitement thyroïdien"],
    tooltip: "Le traitement thyroïdien modifie l'évaluation fonctionnelle de l'axe.",
    weight: 2,
    priority: 2,
    tags: ["traitement", "medicaments"],
    scoreDirection: "neutral"
  }
];

export default AxeThyroEnrichiConfig;