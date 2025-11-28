import type { QuestionConfig } from "../types";

/**
 * AXE GONADOTROPE (FILTRAGE SEXUÉ)
 * -------------------------------------------------
 * Évalue l'axe hypothalamo-hypophyso-gonadique (HHG)
 * - Équilibre oestro-progestatif (femme)
 * - Androgènes et prostate (homme)
 * - Expression tissulaire (commun)
 *
 * SPÉCIFICITÉ : Questions filtrées par sexe via la propriété "gender"
 */

export type GonadoQuestion = QuestionConfig & {
  gender: "female" | "male" | "both";
  tags?: string[];
};

const AxeGonadoConfig: GonadoQuestion[] = [
  // ==========================================
  // 👩 FEMME : CYCLES & ÉQUILIBRE OESTRO-PROGESTATIF
  // ==========================================
  {
    id: "gona_f_regularite_cycle",
    question: "Vos cycles sont-ils réguliers (toujours la même durée) ?",
    type: "scale_1_5",
    scaleLabels: ["Très irréguliers", "Plutôt irréguliers", "Assez réguliers", "Réguliers", "Très réguliers"],
    tooltip: "La régularité du cycle reflète l'équilibre neuroendocrine global.",
    weight: 3,
    priority: 1, // ESSENTIEL
    tags: ["equilibre_hormonal"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_duree_cycle",
    question: "Quelle est la durée habituelle de vos cycles ?",
    type: "select",
    options: ["< 21 jours", "21-24 jours", "25-28 jours", "29-35 jours", "> 35 jours"],
    tooltip: "Cycles courts (<25j) = insuffisance progestérone. Cycles longs (>35j) = insuffisance FSH/ovulation.",
    weight: 2,
    priority: 1, // ESSENTIEL
    tags: ["duree_cycle"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_regles_douloureuses",
    question: "Vos règles sont-elles douloureuses (nécessitant des antalgiques) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La dysménorrhée signe souvent une congestion pelvienne ou une hyper-oestrogénie relative.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["hyper_oestrogene", "congestion_pelvienne"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_flux_abondant",
    question: "Vos règles sont-elles très abondantes ou avec des caillots ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'hyperplasie de l'endomètre par dominance oestrogénique (effet prolifératif).",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["hyper_oestrogene"],
    gender: "female",
    section: "Cycles"
  },
  {
    id: "gona_f_pms_seins",
    question: "Avez-vous les seins gonflés ou douloureux avant les règles ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de rétention hydrosodée par excès d'aldostérone/oestrogènes ou manque de progestérone.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hypo_progesterone", "hyper_oestrogene"],
    gender: "female",
    section: "SPM"
  },
  {
    id: "gona_f_pms_emotionnel",
    question: "Êtes-vous irritable, triste ou anxieuse avant les règles ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "SPM émotionnel: insuffisance de progestérone (qui est anxiolytique) en phase lutéale.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hypo_progesterone", "spm"],
    gender: "female",
    section: "SPM"
  },
  {
    id: "gona_f_libido_cycle",
    question: "Votre libido varie-t-elle selon votre cycle ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Assez", "Beaucoup"],
    tooltip: "La libido est maximale à l'ovulation (pic d'oestrogènes et testostérone).",
    weight: 1,
    priority: 3, // OPTIONNEL
    tags: ["libido_cyclique"],
    gender: "female",
    section: "Libido"
  },
  {
    id: "gona_f_menopause_bouffees",
    question: "(Si Ménopause) Avez-vous des bouffées de chaleur ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de désadaptation neurovégétative à la chute brutale des oestrogènes.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["insuffisance_gonadique", "dysregulation_neuro"],
    gender: "female",
    section: "Ménopause"
  },
  {
    id: "gona_f_menopause_secheresse",
    question: "(Si Ménopause) Avez-vous une sécheresse vaginale ou des douleurs aux rapports ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Atrophie vaginale par carence oestrogénique tissulaire.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["carence_oestrogene"],
    gender: "female",
    section: "Ménopause"
  },

  // ==========================================
  // 👨 HOMME : ANDROGÈNES & PROSTATE
  // ==========================================
  {
    id: "gona_h_libido",
    question: "Ressentez-vous une baisse globale de votre élan vital et de votre libido ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La testostérone soutient le dynamisme psychique. Sa baisse entraîne passivité et fatigue.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["hypo_androgene"],
    gender: "male",
    section: "Androgènes"
  },
  {
    id: "gona_h_erection_matinale",
    question: "Avez-vous des érections matinales spontanées ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Tous les jours"],
    tooltip: "Marqueur fiable de la testostérone biodisponible. L'absence est un signe d'hypo-androgénie.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["hypo_androgene", "testosterone_biodisponible"],
    gender: "male",
    section: "Androgènes"
  },
  {
    id: "gona_h_musculaire",
    question: "Avez-vous noté une fonte musculaire ou une prise de gras abdominale ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe métabolique d'une insuffisance androgénique (déficit anabolique).",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    tags: ["hypo_androgene"],
    gender: "male",
    section: "Androgènes"
  },
  {
    id: "gona_h_urinaire",
    question: "Avez-vous des difficultés à uriner (jet faible, gouttes retardataires, levers nocturnes) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe fonctionnel d'hypertrophie ou de congestion prostatique (déséquilibre hormonal local).",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["congestion_pelvienne", "hyper_oestrogene_relatif"],
    gender: "male",
    section: "Prostate"
  },
  {
    id: "gona_h_gynecomastie",
    question: "Avez-vous remarqué un développement de la poitrine (gynécomastie) ?",
    type: "boolean",
    tooltip: "Signe d'excès relatif d'oestrogènes par rapport aux androgènes.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hyper_oestrogene_relatif", "desequilibre_andro_oestro"],
    gender: "male",
    section: "Androgènes"
  },

  // ==========================================
  // 🚻 COMMUN : EXPRESSION TISSULAIRE
  // ==========================================
  {
    id: "gona_acne",
    question: "Avez-vous de l'acné (visage, dos) ou une peau très grasse ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Marqueur d'une activité androgénique périphérique élevée (ou sensibilité des récepteurs).",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hyper_androgene"],
    gender: "both",
    section: "Expression Tissulaire"
  },
  {
    id: "gona_pilosite",
    question: "Avez-vous remarqué une augmentation de la pilosité (visage, corps) ?",
    type: "scale_1_5",
    scaleLabels: ["Non", "Légère", "Modérée", "Importante", "Très importante"],
    tooltip: "Hirsutisme: signe d'hyperandrogénie (surrénale ou gonadique).",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hyper_androgene", "hirsutisme"],
    gender: "both",
    section: "Expression Tissulaire"
  },
  {
    id: "gona_chute_cheveux",
    question: "Souffrez-vous d'une chute de cheveux diffuse ou localisée ?",
    type: "scale_1_5",
    scaleLabels: ["Non", "Légère", "Modérée", "Importante", "Très importante"],
    tooltip: "Peut être androgénique (golfes, vertex) ou thyroïdienne (diffuse).",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["alopecie"],
    gender: "both",
    section: "Expression Tissulaire"
  },
  {
    id: "gona_lateralite",
    question: "Avez-vous des symptômes qui touchent davantage le côté gauche du corps ?",
    type: "boolean",
    tooltip: "La latéralité gauche oriente vers l'axe FSH (folliculaire). Droite vers LH (lutéale).",
    weight: 1,
    priority: 3, // OPTIONNEL
    tags: ["lateralite", "topographie_endocrine"],
    gender: "both",
    section: "Expression Tissulaire"
  }
];

export default AxeGonadoConfig;
