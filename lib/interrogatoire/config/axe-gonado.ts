import type { QuestionConfig } from "../types";

/**
 * AXE GONADOTROPE (HHG - Hypothalamo-Hypophyso-Gonadique)
 * ========================================================
 * 
 * AUDITÉ LE 03/12/2024 - Conforme à la méthodologie endobiogénique
 * 
 * Évalue l'axe gonadotrope avec ses 3 hormones périphériques :
 * - ŒSTROGÈNES (FSH → 1ère boucle) : Initiation métabolisme, prolifération
 * - PROGESTÉRONE (LH → 2ème boucle) : Régulation, maturation, implantation
 * - ANDROGÈNES (LH → 2ème boucle) : Achèvement métabolisme, anabolisme
 * 
 * SPÉCIFICITÉ : Questions filtrées par sexe via la propriété "gender"
 * 
 * Total : 32 questions (19 originales + 13 ajoutées)
 * - Femme : 16 questions
 * - Homme : 9 questions  
 * - Commun : 7 questions
 */

export type GonadoQuestion = QuestionConfig & {
  gender: "female" | "male" | "both";
  tags?: string[];
};

const AxeGonadoConfig: GonadoQuestion[] = [
  // ==========================================
  // 👩 FEMME - SECTION CYCLES
  // ==========================================
  {
    id: "gona_f_regularite_cycle",
    question: "Vos cycles sont-ils réguliers (toujours la même durée à 2-3 jours près) ?",
    type: "scale_1_5",
    scaleLabels: ["Très irréguliers", "Plutôt irréguliers", "Assez réguliers", "Réguliers", "Très réguliers"],
    tooltip: "La régularité du cycle reflète l'équilibre entre les axes gonadotrope, corticotrope et thyréotrope. Des cycles irréguliers peuvent indiquer une insuffisance en androgènes ou un déséquilibre FSH/LH.",
    weight: 3,
    priority: 1, // ESSENTIEL
    tags: ["pack_essentiel", "equilibre_hormonal"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_duree_cycle",
    question: "Quelle est la durée habituelle de vos cycles (du 1er jour des règles au 1er jour des règles suivantes) ?",
    type: "select",
    options: ["< 21 jours", "21-24 jours", "25-28 jours", "29-35 jours", "> 35 jours"],
    tooltip: "Cycles courts (<25j) = phase lutéale courte, insuffisance en progestérone. Cycles longs (>35j) = ovulation tardive ou absente, insuffisance FSH. Le cycle idéal dure 28 jours avec une phase folliculaire et lutéale de 14 jours chacune.",
    weight: 2,
    priority: 1, // ESSENTIEL
    tags: ["pack_essentiel", "duree_cycle"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_duree_regles",
    question: "Combien de jours durent vos règles ?",
    type: "select",
    options: ["1-2 jours", "3-4 jours", "5-6 jours", "7-8 jours", "> 8 jours"],
    tooltip: "Durée normale : 4-5 jours. Règles courtes (<3j) = œstrogènes insuffisants ou progestérone excessive. Règles longues (>7j) = œstrogènes excessifs avec hyperplasie endométriale ou progestérone insuffisante.",
    weight: 2,
    priority: 1, // ESSENTIEL
    tags: ["pack_essentiel", "duree_regles"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_regles_douloureuses",
    question: "Vos règles sont-elles douloureuses (nécessitant des antalgiques) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La dysménorrhée signe souvent une congestion pelvienne ou une hyper-œstrogénie relative avec production excessive de prostaglandines. Elle peut aussi indiquer une endométriose ou une adénomyose.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "hyper_oestrogene", "congestion_pelvienne"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_flux_abondant",
    question: "Vos règles sont-elles très abondantes (changement de protection toutes les 2h ou moins) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les ménorragies sont le signe d'une hyperplasie de l'endomètre par dominance œstrogénique. Les œstrogènes ont un effet prolifératif sur l'endomètre, et leur excès provoque un saignement abondant.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "hyper_oestrogene"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_caillots_timing",
    question: "Si vous avez des caillots pendant les règles, à quel moment apparaissent-ils ?",
    type: "select",
    options: ["Pas de caillots", "1er jour surtout", "2ème-3ème jour", "Tout au long des règles", "Fin des règles"],
    tooltip: "Le timing des caillots est diagnostique : Caillots J1 = œstrogènes insuffisants (endomètre mal préparé). Caillots J2-J3 = progestérone prédominante/excessive. Caillots prolongés en fin de règles = progestérone excessive avec stase veineuse.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["diagnostic_differentiel", "caillots"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_spotting",
    question: "Avez-vous des saignements entre les règles (spotting) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le spotting inter-menstruel peut indiquer : en milieu de cycle (ovulation) = pic d'œstrogènes normal. En phase lutéale = insuffisance en progestérone. Aléatoire = déséquilibre FSH/œstrogènes ou pathologie utérine.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["spotting", "hypo_progesterone"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_herpes_post_regles",
    question: "Avez-vous des poussées d'herpès (labial ou génital) après vos règles ?",
    type: "boolean",
    tooltip: "La crise d'herpès post-menstruelle est caractéristique d'une progestérone insuffisante avec aldostérone hyper-compensatrice pour relancer la LH. C'est un signe indirect de déséquilibre lutéal.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["hypo_progesterone", "aldosterone"],
    gender: "female",
    section: "Cycles"
  },

  // ==========================================
  // 👩 FEMME - SECTION SPM
  // ==========================================
  {
    id: "gona_f_pms_seins",
    question: "Avez-vous les seins gonflés, tendus ou douloureux avant les règles ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La mastodynie prémenstruelle est due à la rétention hydrosodée par excès d'œstrogènes ou manque de progestérone. La prolactine peut aussi être impliquée (prolifération des récepteurs aux œstrogènes).",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "hypo_progesterone", "hyper_oestrogene"],
    gender: "female",
    section: "SPM"
  },
  {
    id: "gona_f_seins_fibrokystiques",
    question: "Avez-vous des nodules ou une texture granuleuse dans les seins (mastose fibrokystique) ?",
    type: "boolean",
    tooltip: "La mastose fibrokystique est liée à une hyperactivité de la FSH et des œstrogènes avec prolifération du tissu mammaire. C'est un terrain à surveiller car il peut évoluer vers des pathologies plus sérieuses.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["fsh_excessive", "hyper_oestrogene"],
    gender: "female",
    section: "SPM"
  },
  {
    id: "gona_f_pms_emotionnel",
    question: "Êtes-vous irritable, triste, anxieuse ou émotionnellement instable avant les règles ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le SPM émotionnel traduit une insuffisance relative en progestérone en phase lutéale. La progestérone a un effet anxiolytique naturel (action sur les récepteurs GABA). Son déficit expose au stress et à l'irritabilité.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hypo_progesterone", "spm"],
    gender: "female",
    section: "SPM"
  },
  {
    id: "gona_f_pms_retention",
    question: "Prenez-vous du poids ou avez-vous les jambes gonflées avant les règles ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La rétention d'eau prémenstruelle est due à l'excès relatif d'œstrogènes (rétention sodée) ou au déficit en progestérone (qui est diurétique). L'aldostérone peut aussi être impliquée.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hyper_oestrogene", "retention_eau"],
    gender: "female",
    section: "SPM"
  },

  // ==========================================
  // 👩 FEMME - SECTION MÉNOPAUSE
  // ==========================================
  {
    id: "gona_f_menopause_bouffees",
    question: "(Si périménopause/ménopause) Avez-vous des bouffées de chaleur ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les bouffées de chaleur sont dues à la désadaptation neurovégétative à la chute des œstrogènes. Le système sympathique réagit de façon excessive à la perte de l'effet modulateur œstrogénique sur la thermorégulation.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "insuffisance_gonadique", "menopause"],
    gender: "female",
    section: "Ménopause",
    conditionalDisplay: { field: "age", condition: ">", value: 40 }
  },
  {
    id: "gona_f_menopause_secheresse",
    question: "(Si périménopause/ménopause) Avez-vous une sécheresse vaginale ou des douleurs aux rapports ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'atrophie vaginale est due à la carence œstrogénique tissulaire. Les œstrogènes maintiennent la trophicité et la lubrification des muqueuses génitales. Leur chute provoque sécheresse, fragilité et dyspareunie.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["carence_oestrogene", "menopause"],
    gender: "female",
    section: "Ménopause",
    conditionalDisplay: { field: "age", condition: ">", value: 40 }
  },

  // ==========================================
  // 👩 FEMME - SECTION LIBIDO
  // ==========================================
  {
    id: "gona_f_libido_globale",
    question: "Comment qualifieriez-vous votre libido globale ?",
    type: "scale_1_5",
    scaleLabels: ["Absente", "Très faible", "Modérée", "Bonne", "Très forte"],
    tooltip: "Une libido faible peut indiquer des œstrogènes insuffisants ou une progestérone diminuée. Une libido très forte oriente vers des œstrogènes ou une progestérone prononcés. La libido est maximale à l'ovulation (pic hormonal).",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["libido"],
    gender: "female",
    section: "Libido"
  },

  // ==========================================
  // 👨 HOMME - SECTION ANDROGÈNES
  // ==========================================
  {
    id: "gona_h_libido",
    question: "Ressentez-vous une baisse de votre élan vital, de votre motivation ou de votre libido ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La testostérone soutient le dynamisme psychique, la motivation et la libido. Sa baisse entraîne passivité, fatigue, perte d'initiative et diminution du désir sexuel.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "hypo_androgene"],
    gender: "male",
    section: "Androgènes"
  },
  {
    id: "gona_h_erection_matinale",
    question: "Avez-vous des érections matinales spontanées ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Très rarement", "Parfois", "Souvent", "Tous les jours"],
    tooltip: "L'érection matinale est un marqueur fiable de la testostérone biodisponible. Son absence ou sa rareté est un signe d'hypo-androgénie. Elle survient pendant le sommeil paradoxal et témoigne de l'intégrité neuro-vasculaire.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "hypo_androgene", "testosterone_biodisponible"],
    gender: "male",
    section: "Androgènes"
  },
  {
    id: "gona_h_qualite_erection",
    question: "La qualité de vos érections a-t-elle diminué (rigidité, durée) ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Beaucoup", "Considérablement"],
    tooltip: "La qualité de l'érection dépend de la testostérone mais aussi de la FSH (qui régule les récepteurs). Une diminution peut indiquer une insuffisance androgénique ou une FSH insuffisante.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "hypo_androgene", "fsh_insuffisante"],
    gender: "male",
    section: "Androgènes"
  },
  {
    id: "gona_h_ejaculation",
    question: "Avez-vous noté une diminution du volume ou de la force de l'éjaculation ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Beaucoup", "Considérablement"],
    tooltip: "Une éjaculation faible (volume réduit, force diminuée) est un signe d'androgènes déficients. La testostérone et la DHT régulent la production de liquide séminal par les vésicules séminales et la prostate.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["hypo_androgene", "androgenes_deficients"],
    gender: "male",
    section: "Androgènes"
  },
  {
    id: "gona_h_musculaire",
    question: "Avez-vous noté une fonte musculaire ou une prise de graisse abdominale ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Beaucoup", "Considérablement"],
    tooltip: "La fonte musculaire avec redistribution graisseuse abdominale est un signe métabolique d'insuffisance androgénique. Les androgènes ont un effet anabolisant sur les muscles et lipolytique sur le tissu adipeux.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["hypo_androgene", "metabolisme"],
    gender: "male",
    section: "Androgènes"
  },
  {
    id: "gona_h_voix",
    question: "Votre voix est-elle devenue plus faible ou plus aiguë avec l'âge ?",
    type: "boolean",
    tooltip: "Une tonalité vocale faible ou qui s'aiguise peut indiquer des androgènes diminués ou bloqués. La testostérone maintient l'épaisseur des cordes vocales.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hypo",
    tags: ["hypo_androgene"],
    gender: "male",
    section: "Androgènes"
  },
  {
    id: "gona_h_gynecomastie",
    question: "Avez-vous remarqué un développement de la poitrine (gynécomastie) ?",
    type: "boolean",
    tooltip: "La gynécomastie est le signe d'un excès relatif d'œstrogènes par rapport aux androgènes. Elle peut être due à une aromatisation excessive de la testostérone en œstradiol (surpoids, alcool, médicaments).",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hyper_oestrogene_relatif", "desequilibre_andro_oestro"],
    gender: "male",
    section: "Androgènes"
  },

  // ==========================================
  // 👨 HOMME - SECTION PROSTATE
  // ==========================================
  {
    id: "gona_h_urinaire",
    question: "Avez-vous des troubles urinaires (jet faible, gouttes retardataires, levers nocturnes fréquents) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les symptômes du bas appareil urinaire évoquent une hypertrophie ou une congestion prostatique. Cela traduit un déséquilibre hormonal local avec souvent un excès relatif d'œstrogènes ou une hyperactivité de la LH et des androgènes.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "congestion_pelvienne", "prostate"],
    gender: "male",
    section: "Prostate"
  },

  // ==========================================
  // 🚻 COMMUN - EXPRESSION TISSULAIRE
  // ==========================================
  {
    id: "gona_acne",
    question: "Avez-vous de l'acné (visage, dos, poitrine) ou une peau très grasse ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'acné est un marqueur d'hyperactivité androgénique périphérique (ou hypersensibilité des récepteurs). Chez la femme, l'acné du menton oriente vers un hyperandrogénisme lutéal (LH élevée). L'acné du dos oriente vers l'ACTH et les androgènes surrénaliens.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hyper_androgene"],
    gender: "both",
    section: "Expression Tissulaire"
  },
  {
    id: "gona_pilosite",
    question: "Avez-vous remarqué une augmentation de la pilosité (visage, corps) ou au contraire une diminution ?",
    type: "select",
    options: ["Diminution nette", "Légère diminution", "Stable", "Légère augmentation", "Augmentation nette"],
    tooltip: "L'hirsutisme (augmentation de la pilosité) est un signe d'hyperandrogénie (surrénale ou gonadique). La diminution de la pilosité corporelle oriente vers des androgènes insuffisants.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["androgenes", "pilosite"],
    gender: "both",
    section: "Expression Tissulaire"
  },
  {
    id: "gona_chute_cheveux",
    question: "Souffrez-vous d'une chute de cheveux ?",
    type: "select",
    options: ["Non", "Légère diffuse", "Modérée diffuse", "Golfes temporaux", "Vertex (sommet)", "Diffuse importante"],
    tooltip: "L'alopécie androgénique touche les golfes et le vertex (DHT-dépendante). L'alopécie diffuse oriente plutôt vers la thyroïde, une carence en fer, ou un stress. Chez la femme, une alopécie peut aussi indiquer un excès d'androgènes ou un déficit en œstrogènes.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["alopecie", "androgenes"],
    gender: "both",
    section: "Expression Tissulaire"
  },
  {
    id: "gona_varices",
    question: "Avez-vous des varices ou des jambes lourdes ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Légèrement", "Modérément", "Souvent", "Très marqué"],
    tooltip: "Les varices et la sensation de jambes lourdes indiquent une congestion veineuse, souvent liée à une congestion pelvienne. Chez la femme, cela peut être aggravé par les œstrogènes (qui dilatent les veines) ou la progestérone insuffisante.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["congestion_pelvienne", "congestion_veineuse"],
    gender: "both",
    section: "Expression Tissulaire"
  },
  {
    id: "gona_retention_eau",
    question: "Avez-vous tendance à la rétention d'eau (visage bouffi le matin, bagues serrées, chevilles gonflées) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La rétention d'eau peut être liée aux œstrogènes (rétention sodée), à une insuffisance en progestérone (qui est diurétique), ou à l'aldostérone. Chez la femme, elle est souvent cyclique et prémenstruelle.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hyper_oestrogene", "retention_eau"],
    gender: "both",
    section: "Expression Tissulaire"
  },
  {
    id: "gona_lateralite",
    question: "Vos symptômes touchent-ils davantage un côté du corps ?",
    type: "select",
    options: ["Non, symétriques", "Plutôt côté gauche", "Plutôt côté droit", "Variable"],
    tooltip: "La latéralité a une signification endocrinienne en endobiogénie. La latéralité gauche oriente vers l'axe FSH (folliculaire, œstrogénique). La latéralité droite oriente vers l'axe LH (lutéal, progestéronique/androgénique).",
    weight: 1,
    priority: 3, // OPTIONNEL
    tags: ["lateralite", "topographie_endocrine"],
    gender: "both",
    section: "Expression Tissulaire"
  },
  {
    id: "gona_fatigue_cyclique",
    question: "Ressentez-vous une fatigue qui varie selon les moments du mois ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Une fatigabilité cyclique peut indiquer des androgènes déficients ou un déséquilibre hormonal gonadotrope. Chez la femme, elle peut être liée au cycle menstruel (chute de progestérone prémenstruelle).",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["androgenes_deficients", "fatigue"],
    gender: "both",
    section: "Expression Tissulaire"
  }
];

export default AxeGonadoConfig;