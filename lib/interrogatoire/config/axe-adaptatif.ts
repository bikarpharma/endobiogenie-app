import type { QuestionConfig } from "../types";

/**
 * AXE ADAPTATIF (CORTICOTROPE)
 * Évalue l'axe hypothalamo-hypophyso-surrénalien (HHS)
 * - Gestion du stress et de l'adaptation
 * - Métabolisme énergétique (cortisol)
 * - Équilibre hydro-électrolytique (aldostérone)
 * - Inflammation et immunité
 */

const AxeAdaptatifConfig: QuestionConfig[] = [
  // ==========================================
  // I. ÉNERGIE & RYTHME (Le Cortisol)
  // ==========================================
  {
    id: "cortico_fatigue_matin",
    question: "Ressentez-vous une fatigue importante dès le réveil, qui s'améliore le soir ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe majeur d'insuffisance corticotrope fonctionnelle (déficit du pic matinal de cortisol).",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    section: "Énergie & Rythme"
  },
  {
    id: "cortico_coup_pompe",
    question: "Avez-vous des coups de pompe brutaux vers 11h ou 17h (envie de sucre) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hypoglycémie réactionnelle par manque de réponse glucocorticoïde aux moments clés de la journée.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    section: "Énergie & Rythme"
  },
  {
    id: "cortico_endurance",
    question: "Avez-vous du mal à soutenir un effort prolongé (physique ou mental) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'axe corticotrope gère l'endurance et le 'deuxième souffle'.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    section: "Énergie & Rythme"
  },

  // ==========================================
  // II. MÉTABOLISME DE L'EAU & SEL (Minéralocorticoïdes)
  // ==========================================
  {
    id: "cortico_sel",
    question: "Avez-vous des envies impérieuses de sel ou d'aliments très salés ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Recherche de compensation d'une fuite sodée par hypo-aldostéronisme fonctionnel.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    section: "Eau & Sel"
  },
  {
    id: "cortico_hypotension",
    question: "Avez-vous des vertiges en passant de la position couchée à debout ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hypotension orthostatique par manque de tonus vasculaire (déficit adrénaline/aldostérone).",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    section: "Eau & Sel"
  },

  // ==========================================
  // III. INFLAMMATION & IMMUNITÉ
  // ==========================================
  {
    id: "cortico_douleurs",
    question: "Souffrez-vous de douleurs inflammatoires récurrentes (tendinites, articulations) qui 'voyagent' ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le cortisol est l'anti-inflammatoire naturel. Un déficit fait flamber l'inflammation.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    section: "Inflammation"
  },
  {
    id: "cortico_cicatrisation",
    question: "Vos blessures cicatrisent-elles très lentement ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Un EXCÈS de cortisol (catabolisme) empêche paradoxalement la réparation tissulaire.",
    weight: 2,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    section: "Inflammation"
  },
  {
    id: "cortico_infections_recidivantes",
    question: "Faites-vous des infections à répétition (ORL, urinaires, bronchites) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Terrain précritique classique: hyper-para + congestion hépatobiliaire + insuffisance surrénale.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    section: "Inflammation",
    tags: ["terrain_precritique", "deficit_immunitaire"]
  },

  // ==========================================
  // IV. PSYCHISME (Adaptation)
  // ==========================================
  {
    id: "cortico_irritabilite",
    question: "Devenez-vous agressif ou très irritable quand vous avez faim ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Symptôme clé de l'hypoglycémie surrénalienne ('Hangry').",
    weight: 2,
    priority: 3, // OPTIONNEL
    scoreDirection: "hypo",
    section: "Psychisme"
  },
  {
    id: "cortico_bruit",
    question: "Ne supportez-vous plus le bruit ou la lumière forte ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hypersensibilité par épuisement des seuils d'adaptation neuronale.",
    weight: 2,
    priority: 3, // OPTIONNEL
    scoreDirection: "hypo",
    section: "Psychisme"
  },

  // ==========================================
  // V. CHRONOBIOLOGIE & SAISONNALITÉ (NOUVELLES)
  // ==========================================
  {
    id: "cortico_aggravation_automne_hiver",
    question: "Vos symptômes s'aggravent-ils en automne ou en hiver ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'adaptation thyroïdienne insuffisante au froid et aux jours courts.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    section: "Chronobiologie",
    tags: ["adaptation_saisonniere", "thyro_cortico"]
  },
  {
    id: "cortico_aggravation_printemps",
    question: "Vos symptômes s'aggravent-ils au printemps ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Peut signaler un trauma émotionnel saisonnier ou une relance adaptative insuffisante.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    section: "Chronobiologie",
    tags: ["trauma_saisonnier", "relance_adaptative"]
  },
  {
    id: "cortico_date_anniversaire",
    question: "Avez-vous des symptômes récurrents à une date anniversaire particulière ?",
    type: "boolean",
    tooltip: "Signe de trauma ancré chronobiologiquement dans l'organisme.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hypo",
    section: "Chronobiologie",
    tags: ["trauma_ancre", "chronobiologie"]
  }
];

export default AxeAdaptatifConfig;
