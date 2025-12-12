import type { QuestionConfig } from "../types";

/**
 * AXE DERMATOLOGIQUE - MIROIR DU TERRAIN ENDOBIOGÉNIQUE
 * ======================================================
 * 
 * AUDITÉ LE 03/12/2024 - Conforme à la méthodologie endobiogénique
 * 
 * La peau est le MIROIR de tous les axes endocriniens :
 * - TEXTURE & HYDRATATION → Thyroïde, Œstrogènes, SNA
 * - SÉBUM & ACNÉ → Androgènes, LH, Foie, Pancréas
 * - CHEVEUX & PHANÈRES → Thyroïde, Cortico, Gonado, GH
 * - VASCULARISATION → Cortisol, Capillaires, SNA
 * - PATHOLOGIES → Terrain allergique, Auto-immun, Métabolique
 * 
 * PRINCIPE CLÉ : Chaque signe cutané = projection d'un déséquilibre interne
 * 
 * Sources :  (SNA), /IV (Cortico), /V (Gonado),
 * 
 * Total : 38 questions (14 originales + 24 ajoutées)
 */

const AxeDermatoConfig: QuestionConfig[] = [
  // ==========================================
  // SECTION 1 : TEXTURE & HYDRATATION
  // (Thyroïde, Œstrogènes, SNA Alpha)
  // ==========================================
  {
    id: "derm_peau_seche_corps",
    question: "Avez-vous la peau du corps très sèche, voire squameuse ('peau de lézard') ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La peau sèche et squameuse est un signe majeur d'hypothyroïdie tissulaire (baisse de l'activité des glandes sébacées) ou d'insuffisance œstrogénique. La thyroïde régule l'hydratation cutanée via le métabolisme des lipides de surface.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "thyroide_hypo", "oestrogenes_hypo"],
    section: "Texture & Hydratation"
  },
  {
    id: "derm_peau_grasse",
    question: "Avez-vous la peau grasse, surtout sur la zone T (front, nez, menton) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La peau grasse traduit une hyperséborrhée liée à une sensibilité aux androgènes (DHEA, testostérone) ou à une prédominance œstrogénique. Elle est souvent associée à l'insulino-résistance qui amplifie l'activité des récepteurs aux androgènes.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["androgenes_hyper", "oestrogenes_hyper"],
    section: "Texture & Hydratation"
  },
  {
    id: "derm_talons_fendilles",
    question: "Avez-vous les talons fendillés ou la peau des coudes très épaisse (kératose) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'hyperkératose (épaississement de la couche cornée) indique un ralentissement métabolique thyroïdien ou un hyperfonctionnement de l'hormone de croissance (GH). Peut aussi révéler une carence en vitamine A ou en acides gras essentiels.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["thyroide_hypo", "gh_hyper", "keratose"],
    section: "Texture & Hydratation"
  },
  {
    id: "derm_keratose_pilaire",
    question: "Avez-vous de petits boutons rugueux sur les bras ou les cuisses (kératose pilaire) ?",
    type: "boolean",
    tooltip: "La kératose pilaire ('peau de poulet') est un signe d'hyperfonctionnement de l'hormone de croissance (GH) ou de carence en vitamine A. Elle traduit un trouble de la kératinisation des follicules pileux.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["gh_hyper", "keratose"],
    section: "Texture & Hydratation"
  },
  {
    id: "derm_temperature_peau",
    question: "Vos mains et pieds sont-ils habituellement froids ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les extrémités froides traduisent une vasoconstriction périphérique par hyperactivité alpha-sympathique ou une hypothyroïdie. C'est un signe de terrain spasmophile ou d'adaptation insuffisante.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "alpha_hyper", "thyroide_hypo", "spasmophilie"],
    section: "Texture & Hydratation"
  },
  {
    id: "derm_secheresse_muqueuses",
    question: "Avez-vous les yeux secs, la bouche sèche ou besoin de boire pour parler ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La sécheresse des muqueuses indique une inhibition des sécrétions par l'alpha-sympathique (stress) ou un syndrome sec auto-immun (Gougerot-Sjögren). Elle peut aussi refléter une insuffisance œstrogénique chez la femme.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["alpha_hyper", "auto_immun", "oestrogenes_hypo"],
    section: "Texture & Hydratation"
  },
  {
    id: "derm_transpiration",
    question: "Transpirez-vous facilement ou de façon excessive ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'hyperhidrose (transpiration excessive) peut être liée à une hyperactivité parasympathique, une hyperthyroïdie, ou un déséquilibre hormonal (bouffées de chaleur). Les sueurs froides orientent vers l'alpha-sympathique.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["para_hyper", "thyroide_hyper", "sna"],
    section: "Texture & Hydratation"
  },
  {
    id: "derm_sueurs_nocturnes",
    question: "Avez-vous des sueurs nocturnes (première partie de nuit surtout) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les sueurs de la première partie de nuit sont un signe d'hyperactivité parasympathique nocturne. Les sueurs de la deuxième partie orientent vers un problème thyroïdien ou hormonal (ménopause).",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["para_hyper", "sna"],
    section: "Texture & Hydratation"
  },

  // ==========================================
  // SECTION 2 : SÉBUM & ACNÉ
  // (Androgènes, LH, Foie, Pancréas)
  // ==========================================
  {
    id: "derm_acne_visage",
    question: "Avez-vous de l'acné sur le bas du visage (mâchoires, menton) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'acné du bas du visage (menton, mâchoires) est une zone de projection gonadique, souvent liée au cycle menstruel ou à un hyperandrogénisme (SOPK). Elle traduit une sur-sollicitation des androgènes gonadiques.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "androgenes_hyper", "sopk"],
    section: "Sébum & Acné"
  },
  {
    id: "derm_acne_joues",
    question: "Avez-vous de l'acné sur les joues ou les côtés du visage ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'acné des joues et côtés du visage traduit une sur-sollicitation des androgènes surrénaliens (DHEA). Elle est souvent liée au stress et à l'adaptation corticotrope.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["dhea_hyper", "stress"],
    section: "Sébum & Acné"
  },
  {
    id: "derm_acne_front",
    question: "Avez-vous de l'acné sur le front ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'acné du front est liée à une ACTH élevée (stress adaptatif) et souvent à une congestion digestive. La zone frontale est une zone de projection corticotrope.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["acth_hyper", "congestion_digestive"],
    section: "Sébum & Acné"
  },
  {
    id: "derm_acne_dos",
    question: "Avez-vous de l'acné dans le dos ou sur le thorax ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'acné du dos et du thorax indique une forte imprégnation androgénique globale ou une surcharge hépatique d'élimination. La peau joue alors le rôle d'émonctoire de compensation.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["androgenes_hyper", "foie_surcharge"],
    section: "Sébum & Acné"
  },
  {
    id: "derm_acne_purulente",
    question: "Votre acné est-elle plutôt purulente (pustules avec pus) ?",
    type: "boolean",
    tooltip: "L'acné purulente (pustuleuse) est un signe d'hyperfonctionnement de la prolactine (PRL). Elle traduit une composante infectieuse et inflammatoire importante, souvent liée à une sur-sollicitation du pancréas.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["prolactine_hyper", "infection"],
    section: "Sébum & Acné"
  },
  {
    id: "derm_acne_premenstruelle",
    question: "Votre acné s'aggrave-t-elle avant les règles ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'acné prémenstruelle traduit un déséquilibre œstrogènes/progestérone en fin de cycle, avec souvent une insuffisance lutéale. C'est un marqueur du terrain gonadotrope.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["progesterone_hypo", "cyclique"],
    conditionalDisplay: { gender: "female" },
    section: "Sébum & Acné"
  },
  {
    id: "derm_furoncles",
    question: "Avez-vous tendance à faire des furoncles ou des abcès cutanés ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les furoncles récidivants sont un signe de prolactine excessive et d'un terrain d'hyper-anabolisme somatotrope. Ils indiquent une surcharge protéique et une congestion des émonctoires.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["prolactine_hyper", "infection", "somato_hyper"],
    section: "Sébum & Acné"
  },
  {
    id: "derm_cheveux_gras",
    question: "Vos cheveux graissent-ils très vite (besoin de laver tous les jours) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'hyperséborrhée du cuir chevelu est un marqueur de sensibilité aux androgènes ou d'insulino-résistance. Elle peut aussi indiquer une congestion hépatique qui force la peau à éliminer.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["androgenes_hyper", "insulino_resistance"],
    section: "Sébum & Acné"
  },

  // ==========================================
  // SECTION 3 : CHEVEUX & PHANÈRES
  // (Thyroïde, Cortico, Gonado, GH)
  // ==========================================
  {
    id: "derm_chute_diffuse",
    question: "Perdez-vous vos cheveux de façon diffuse (partout sur la tête) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'effluvium télogène (chute diffuse) est souvent lié à un stress récent (3 mois avant), une hypothyroïdie, une carence en fer/ferritine, ou un post-partum. Les cheveux tombent par poignées.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "thyroide_hypo", "carence_fer", "stress"],
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_chute_androgenique",
    question: "Votre chevelure s'affine-t-elle sur le dessus ou les golfes temporaux ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'alopécie androgénétique (vertex, golfes) traduit une sensibilité excessive des follicules à la DHT (dihydrotestostérone). Elle est favorisée par l'insulino-résistance qui amplifie les récepteurs aux androgènes.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "androgenes_hyper", "dht"],
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_cheveux_secs",
    question: "Vos cheveux sont-ils secs, cassants ou fourchus ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les cheveux secs et cassants indiquent une hypothyroïdie tissulaire (métabolisme lipidique ralenti), une carence en fer, ou une déshydratation. C'est un signe d'insuffisance métabolique globale.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["thyroide_hypo", "carence"],
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_cheveux_fins",
    question: "Vos cheveux sont-ils devenus plus fins avec le temps ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Beaucoup", "Considérablement"],
    tooltip: "L'affinement progressif des cheveux traduit un déclin thyroïdien ou une diminution des androgènes de qualité. C'est un signe de vieillissement métabolique ou d'insuffisance hormonale.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["thyroide_hypo", "androgenes_hypo"],
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_sourcils_queue",
    question: "La partie externe de vos sourcils (queue) est-elle clairsemée ?",
    type: "boolean",
    tooltip: "Le 'signe de la queue du sourcil' est un signe PATHOGNOMONIQUE d'hypothyroïdie périphérique (T3 insuffisante). C'est l'un des signes les plus fiables de l'examen clinique endobiogénique.",
    weight: 3,
    priority: 1, // ESSENTIEL - SIGNE PATHOGNOMONIQUE
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "thyroide_hypo", "t3_hypo", "pathognomonique"],
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_sourcils_epais",
    question: "Vos sourcils sont-ils particulièrement épais ou broussailleux ?",
    type: "boolean",
    tooltip: "Les sourcils épais et broussailleux sont un signe d'ACTH élevée (terrain adaptatif sollicité). S'ils sont également foncés, cela indique aussi une DHEA forte.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["acth_hyper", "dhea_hyper"],
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_pilosite_femme",
    question: "Avez-vous une pilosité excessive (visage, thorax, ligne blanche) ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Légèrement", "Modérément", "Marqué", "Très marqué"],
    tooltip: "L'hirsutisme féminin (pilosité de type masculine) indique un excès d'androgènes surrénaliens (DHEA) ou gonadiques (testostérone). Il oriente vers un SOPK ou un hyperandrogénisme.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "androgenes_hyper", "sopk"],
    conditionalDisplay: { gender: "female" },
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_ongles_cassants",
    question: "Vos ongles sont-ils fins, cassants ou se dédoublent-ils ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les ongles fins et cassants sont un signe d'hypothyroïdie tissulaire ou de carence en fer/silicium. Ils reflètent un métabolisme de construction insuffisant.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["thyroide_hypo", "carence"],
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_ongles_stries",
    question: "Vos ongles sont-ils striés dans la longueur ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Légèrement", "Modérément", "Marqué", "Très marqué"],
    tooltip: "Les stries longitudinales des ongles indiquent un épuisement surrénalien chronique ou un vieillissement métabolique. C'est un signe de sollicitation adaptative prolongée.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hypo",
    tags: ["surrenale_hypo", "vieillissement"],
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_ongles_taches",
    question: "Avez-vous des taches blanches sur les ongles (leuconychie) ?",
    type: "boolean",
    tooltip: "Les taches blanches sur les ongles indiquent une carence relative en zinc, souvent liée à une inflammation intestinale ou une croissance rapide. Le zinc est essentiel à l'immunité et à la cicatrisation.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hypo",
    tags: ["carence_zinc", "intestin"],
    section: "Cheveux & Phanères"
  },
  {
    id: "derm_ongles_lunules",
    question: "Vos lunules (demi-lunes blanches à la base des ongles) sont-elles absentes ou très petites ?",
    type: "boolean",
    tooltip: "L'absence de lunules indique une mauvaise circulation périphérique ou une hypothyroïdie. Les lunules très grandes peuvent indiquer une hyperthyroïdie. C'est un reflet de l'activité métabolique basale.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hypo",
    tags: ["circulation", "thyroide_hypo"],
    section: "Cheveux & Phanères"
  },

  // ==========================================
  // SECTION 4 : VASCULARISATION & CICATRISATION
  // (Cortisol, Capillaires, SNA)
  // ==========================================
  {
    id: "derm_bleus_faciles",
    question: "Faites-vous des 'bleus' (ecchymoses) facilement, pour un moindre choc ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La fragilité capillaire avec ecchymoses faciles est un signe d'excès de cortisol (peau fine, collagène dégradé) ou d'une carence en vitamine C. Elle peut aussi indiquer une fragilité vasculaire constitutionnelle.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "cortisol_hyper", "fragilite_capillaire"],
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_vergetures",
    question: "Avez-vous des vergetures (stries blanches ou violacées) ?",
    type: "select",
    options: ["Non", "Quelques-unes (grossesse/croissance)", "Nombreuses", "Vergetures violacées récentes", "Vergetures larges (>1cm)"],
    tooltip: "Les vergetures traduisent une rupture du collagène par étirement rapide (grossesse, prise de poids) ou par excès de cortisol. Les vergetures violacées larges sont un signe d'hypercortisolisme (syndrome de Cushing).",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["cortisol_hyper", "collagene"],
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_cicatrisation_lente",
    question: "Une petite plaie met-elle très longtemps à cicatriser ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le retard de cicatrisation est un signe d'excès de cortisol (inhibe la synthèse de collagène), de diabète (microangiopathie), ou de carence en zinc/vitamine C. Il indique un terrain catabolique.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "cortisol_hyper", "diabete", "carence_zinc"],
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_cicatrices_cheloide",
    question: "Vos cicatrices ont-elles tendance à être épaisses, en relief ou prurigineuses ?",
    type: "boolean",
    tooltip: "Les cicatrices chéloïdes ou hypertrophiques sont un signe d'hyperfonctionnement de l'hormone de croissance (GH) et d'un terrain d'hyper-anabolisme. Elles indiquent une réparation tissulaire excessive.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["gh_hyper", "anabolisme"],
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_dermographisme",
    question: "Votre peau marque-t-elle longtemps quand vous vous grattez ou frottez ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Marqué (reste >5min)", "Très marqué (gonfle)"],
    tooltip: "Le dermographisme (peau qui 'écrit') est un signe de terrain histaminique et allergique. Il traduit une réactivité excessive des mastocytes cutanés. S'il gonfle (urticaire factice), le terrain allergique est majeur.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "histamine", "allergie", "atopie"],
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_demangeaisons",
    question: "Avez-vous des démangeaisons (prurit) sans cause apparente ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le prurit sine materia (sans lésion visible) peut indiquer une surcharge hépatique, une hyperthyroïdie, un diabète, ou un terrain allergique. C'est un signe d'élimination cutanée ou de dysrégulation immunitaire.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["foie_surcharge", "thyroide_hyper", "allergie"],
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_couperose",
    question: "Avez-vous de la couperose ou des rougeurs persistantes sur le visage ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Légèrement", "Modérément", "Marqué", "Très marqué"],
    tooltip: "La couperose (rosacée, télangiectasies) indique une fragilité capillaire et souvent une congestion hépatique 'pléthorique'. Elle est aggravée par l'alcool, les épices, le stress et les variations thermiques.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["fragilite_capillaire", "foie_surcharge"],
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_teint_pale",
    question: "Avez-vous le teint pâle, cireux ou 'laiteux' ?",
    type: "boolean",
    tooltip: "Le teint pâle et laiteux est un signe de prolactine importante et hyperfonctionnante. Il peut aussi indiquer une anémie ou une insuffisance thyroïdienne. C'est un signe d'hypo-vascularisation cutanée.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hypo",
    tags: ["prolactine_hyper", "anemie", "thyroide_hypo"],
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_erytheme_palmaire",
    question: "Avez-vous les paumes des mains rouges de façon permanente ?",
    type: "boolean",
    tooltip: "L'érythème palmaire est un signe classique d'excès d'œstrogènes (grossesse, cirrhose, pilule). Il traduit une vasodilatation chronique liée à l'effet vasculaire des œstrogènes.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["oestrogenes_hyper", "foie"],
    section: "Vascularisation & Cicatrisation"
  },

  // ==========================================
  // SECTION 5 : PATHOLOGIES CUTANÉES
  // (Terrain allergique, Auto-immun, Métabolique)
  // ==========================================
  {
    id: "derm_eczema",
    question: "Souffrez-vous ou avez-vous souffert d'eczéma ?",
    type: "select",
    options: ["Jamais", "Dans l'enfance seulement", "Occasionnellement", "Régulièrement", "Chronique/sévère"],
    tooltip: "L'eczéma est un signe de terrain atopique avec hyper-immunité, sur-sollicitation hépato-pancréatique, et défaut de régulation corticotrope. La localisation des lésions indique le terrain neuroendocrinien précis.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "atopie", "foie", "pancreas", "cortisol_hypo"],
    section: "Pathologies Cutanées"
  },
  {
    id: "derm_eczema_localisation",
    question: "Où se situe principalement votre eczéma ?",
    type: "select",
    options: ["Non applicable", "Plis de flexion (coudes, genoux)", "Visage/cuir chevelu", "Mains", "Corps diffus", "Multiple"],
    tooltip: "La localisation de l'eczéma reflète le terrain : plis de flexion = ACTH élevée, visage = alpha-sympathique, mains = contact + stress, diffus = terrain allergique sévère.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["eczema_localisation"],
    conditionalDisplay: { derm_eczema: ["Occasionnellement", "Régulièrement", "Chronique/sévère"] },
    section: "Pathologies Cutanées"
  },
  {
    id: "derm_psoriasis",
    question: "Souffrez-vous de psoriasis (plaques rouges avec squames blanches) ?",
    type: "select",
    options: ["Non", "Léger (coudes/genoux)", "Modéré", "Étendu", "Avec atteinte articulaire"],
    tooltip: "Le psoriasis est un signe de T4 élevée (hyperactivité thyroïdienne périphérique) et d'un terrain auto-immun. Il indique une accélération du renouvellement cellulaire épidermique avec composante parasympathique.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["t4_hyper", "auto_immun", "para_hyper"],
    section: "Pathologies Cutanées"
  },
  {
    id: "derm_urticaire",
    question: "Faites-vous des crises d'urticaire (plaques rouges qui démangent) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Chronique"],
    tooltip: "L'urticaire est une 'indigestion cutanée' liée à une libération massive d'histamine. Elle traduit une surcharge digestive/hépatique et un terrain allergique avec défaut de régulation immunitaire.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["histamine", "foie_surcharge", "allergie"],
    section: "Pathologies Cutanées"
  },
  {
    id: "derm_infections_recidivantes",
    question: "Avez-vous des infections cutanées récidivantes (mycoses, impétigo, herpès) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "Les infections cutanées récidivantes indiquent un déficit immunitaire relatif (cortisol bas, thymus insuffisant), un diabète, ou une sur-sollicitation du pancréas. Elles traduisent un terrain d'hypo-adaptabilité.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["immunite_hypo", "diabete", "pancreas"],
    section: "Pathologies Cutanées"
  },
  {
    id: "derm_taches_brunes",
    question: "Avez-vous des taches brunes sur le visage (mélasma, masque de grossesse) ?",
    type: "boolean",
    tooltip: "Le mélasma (chloasma) est un signe d'hyperactivité de la FSH et de stimulation mélanocytaire par les œstrogènes. Il apparaît souvent pendant la grossesse, sous pilule, ou lors de déséquilibres hormonaux.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["fsh_hyper", "oestrogenes_hyper"],
    section: "Pathologies Cutanées"
  },
  {
    id: "derm_cellulite",
    question: "Avez-vous de la cellulite (peau d'orange) sur les cuisses ou fesses ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Légèrement", "Modérément", "Marqué", "Très marqué"],
    tooltip: "La cellulite traduit une congestion lymphatique et veineuse avec infiltration œdémateuse du tissu adipeux. Elle est favorisée par les œstrogènes, la sédentarité, et la stase circulatoire pelvienne.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["oestrogenes_hyper", "congestion", "lymphe"],
    section: "Pathologies Cutanées"
  }
];

export default AxeDermatoConfig;