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
  // I. ÉNERGIE & RYTHME (Le Cortisol)
  {
    id: "cortico_fatigue_matin",
    question: "Ressentez-vous une fatigue importante dès le réveil, qui s'améliore le soir ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe pathognomonique de l'insuffisance corticotrope fonctionnelle (déficit du pic matinal).",
    weight: 3,
    scoreDirection: "hypo"
  },
  {
    id: "cortico_coup_pompe",
    question: "Avez-vous des coups de pompe brutaux vers 11h ou 17h (envie de sucre) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'hypoglycémie réactionnelle par manque de réponse glucocorticoïde.",
    weight: 2,
    scoreDirection: "hypo"
  },
  {
    id: "cortico_endurance",
    question: "Avez-vous du mal à soutenir un effort prolongé (physique ou mental) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'axe corticotrope gère l'endurance (\"le deuxième souffle\").",
    weight: 2,
    scoreDirection: "hypo"
  },

  // II. MÉTABOLISME DE L'EAU & SEL (Minéralocorticoïdes)
  {
    id: "cortico_sel",
    question: "Avez-vous des envies impérieuses de sel ou d'aliments très salés ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Recherche de compensation d'une fuite sodée (Hypo-aldostéronisme fonctionnel).",
    weight: 3,
    scoreDirection: "hypo"
  },
  {
    id: "cortico_hypotension",
    question: "Avez-vous des vertiges en passant de la position couchée à debout (Hypotension orthostatique) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Manque de tonus vasculaire par déficit surrénalien (Adrénaline/Aldostérone).",
    weight: 2,
    scoreDirection: "hypo"
  },

  // III. INFLAMMATION & IMMUNITÉ
  {
    id: "cortico_douleurs",
    question: "Souffrez-vous de douleurs inflammatoires récurrentes (tendinites, articulations) qui 'voyagent' ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le cortisol est l'anti-inflammatoire naturel. S'il est bas ou inefficace, l'inflammation flambe.",
    weight: 2,
    scoreDirection: "hypo"
  },
  {
    id: "cortico_cicatrisation",
    question: "Vos blessures cicatrisent-elles très lentement ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Paradoxalement, un EXCÈS de cortisol (catabolisme) empêche la réparation tissulaire.",
    weight: 2,
    scoreDirection: "hyper"
  },

  // IV. PSYCHISME (Adaptation)
  {
    id: "cortico_irritabilite",
    question: "Devenez-vous agressif ou très irritable quand vous avez faim ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Symptôme clé de l'hypoglycémie surrénalienne ('Hangry').",
    weight: 2,
    scoreDirection: "hypo"
  },
  {
    id: "cortico_bruit",
    question: "Ne supportez-vous plus le bruit ou la lumière forte (Hypersensibilité) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'épuisement des seuils d'adaptation neuronale.",
    weight: 2,
    scoreDirection: "hypo"
  }
];

export default AxeAdaptatifConfig;
