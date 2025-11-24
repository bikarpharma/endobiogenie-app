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
    id: "gona_f_regles_douloureuses",
    question: "Vos règles sont-elles douloureuses (nécessitant des antalgiques) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La dysménorrhée signe souvent une congestion pelvienne ou une hyper-oestrogénie relative (prostaglandines).",
    weight: 2,
    scoreDirection: "hyper",
    tags: ["hyper_oestrogene", "congestion_pelvienne"],
    gender: "female"
  },
  {
    id: "gona_f_flux_abondant",
    question: "Vos règles sont-elles très abondantes ou avec des caillots ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'hyperplasie de l'endomètre par dominance oestrogénique (effet prolifératif).",
    weight: 3,
    scoreDirection: "hyper",
    tags: ["hyper_oestrogene"],
    gender: "female"
  },
  {
    id: "gona_f_pms_seins",
    question: "Avez-vous les seins gonflés ou douloureux avant les règles ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de rétention hydrosodée locale par excès d'aldostérone/oestrogènes ou manque de progestérone.",
    weight: 2,
    scoreDirection: "hyper",
    tags: ["hypo_progesterone", "hyper_oestrogene"],
    gender: "female"
  },
  {
    id: "gona_f_cycles_courts",
    question: "Vos cycles sont-ils courts (moins de 25 jours) ou en avance ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Indique souvent une phase lutéale raccourcie par insuffisance de progestérone.",
    weight: 2,
    scoreDirection: "hypo",
    tags: ["hypo_progesterone"],
    gender: "female"
  },
  {
    id: "gona_f_menopause_bouffees",
    question: "(Si Ménopause) Avez-vous des bouffées de chaleur ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de désadaptation neurovégétative à la chute brutale des oestrogènes.",
    weight: 3,
    scoreDirection: "hypo",
    tags: ["insuffisance_gonadique", "dysregulation_neuro"],
    gender: "female"
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
    scoreDirection: "hypo",
    tags: ["hypo_androgene"],
    gender: "male"
  },
  {
    id: "gona_h_musculaire",
    question: "Avez-vous noté une fonte musculaire ou une prise de gras abdominale ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe métabolique d'une insuffisance androgénique (déficit anabolique).",
    weight: 2,
    scoreDirection: "hypo",
    tags: ["hypo_androgene"],
    gender: "male"
  },
  {
    id: "gona_h_urinaire",
    question: "Avez-vous des difficultés à uriner (jet faible, gouttes retardataires, levers nocturnes) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe fonctionnel d'hypertrophie ou de congestion prostatique (déséquilibre hormonal local).",
    weight: 3,
    scoreDirection: "hyper",
    tags: ["congestion_pelvienne", "hyper_oestrogene_relatif"],
    gender: "male"
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
    scoreDirection: "hyper",
    tags: ["hyper_androgene"],
    gender: "both"
  }
];

export default AxeGonadoConfig;
