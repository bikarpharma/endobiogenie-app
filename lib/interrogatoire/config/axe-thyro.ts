import type { QuestionConfig } from "../types";

/**
 * Axe Thyroïdien (SCORING V2)
 * -----------------------------------------------------
 * Explore la fonction thyroïdienne réelle (non biochimique),
 * la thermorégulation, les phanères, le transit et l'énergie.
 *
 * SCORING V2 :
 * - weight: 1 (mineur), 2 (modéré), 3 (majeur)
 * - tags: catégorisation clinique (hypo_global, hypo_metabolisme, etc.)
 * - scoreDirection: "hypo" | "hyper" | "neutral"
 */

export const AxeThyroConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. MÉTABOLISME (SIGNES GLOBAUX)
  // ---------------------------------------------------
  {
    id: "thyro_metabolisme_general",
    section: "Métabolisme",
    question: "Comment évaluez-vous votre métabolisme général ?",
    type: "scale_1_5",
    scaleLabels: ["Très lent", "Lent", "Normal", "Rapide", "Très rapide"],
    tooltip: "1-2 = Hypo, 3 = Équilibré, 4-5 = Hyper. Le métabolisme général reflète l'efficacité de la conversion T4→T3 périphérique.",
    weight: 3,
    tags: ["hypo_global", "hyper_global"],
    scoreDirection: "hypo" // 1-2 contribue à hypo, 4-5 contribue à hyper
  },
  {
    id: "thyro_frilosite",
    section: "Métabolisme",
    question: "Avez-vous tendance à être frileux(se) ?",
    type: "boolean",
    tooltip: "Indicateur classique d'hypofonction thyroïdienne fonctionnelle (thermorégulation centrale et périphérique).",
    weight: 2,
    tags: ["hypo_global", "hypo_thermoregulation"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_sensation_froid_extremites",
    section: "Métabolisme",
    question: "Avez-vous souvent les mains ou les pieds froids ?",
    type: "boolean",
    tooltip: "Signale un ralentissement métabolique et un défaut de vasodilatation périphérique lié à une faible activité thyroïdienne.",
    weight: 2,
    tags: ["hypo_thermoregulation", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_intolerance_chaleur",
    section: "Métabolisme",
    question: "Avez-vous du mal à supporter la chaleur ?",
    type: "boolean",
    tooltip: "L'intolérance à la chaleur évoque une hyperactivité fonctionnelle ou une instabilité thyro-adaptative.",
    weight: 2,
    tags: ["hyper_global", "hyper_thermoregulation"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_prise_poids_facile",
    section: "Métabolisme",
    question: "Prenez-vous du poids facilement (même avec peu de calories) ?",
    type: "boolean",
    tooltip: "Signe d'hypofonction thyroïdienne périphérique : conversion T4→T3 ralentie, métabolisme basal diminué.",
    weight: 2,
    tags: ["hypo_metabolisme", "hypo_global"],
    scoreDirection: "hypo"
  },

  // ---------------------------------------------------
  // 2. PSYCHISME & ÉNERGIE
  // ---------------------------------------------------
  {
    id: "thyro_energie_mentale",
    section: "Psychisme",
    question: "Comment évaluez-vous votre énergie mentale ?",
    type: "scale_1_5",
    scaleLabels: ["Très lente", "Lente", "Normale", "Vive", "Hyperactive"],
    tooltip: "La clarté mentale et la vitesse de pensée dépendent de la disponibilité en T3 cérébrale.",
    weight: 2,
    tags: ["hypo_psychisme", "hyper_psychisme"],
    scoreDirection: "hypo" // 1-2 = hypo, 4-5 = hyper
  },
  {
    id: "thyro_fatigue_matinale",
    section: "Psychisme",
    question: "Vous sentez-vous fatigué(e) le matin au réveil ?",
    type: "boolean",
    tooltip: "Peut correspondre à une baisse de l'activité thyroïdienne et une mauvaise activation métabolique matinale.",
    weight: 2,
    tags: ["hypo_global", "hypo_energie"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_ralentissement_general",
    section: "Psychisme",
    question: "Avez-vous l'impression générale de fonctionner au ralenti ?",
    type: "boolean",
    tooltip: "Signe typique d'hypoactivité thyroïdienne fonctionnelle.",
    weight: 3,
    tags: ["hypo_global", "hypo_energie"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_difficultes_concentration",
    section: "Psychisme",
    question: "Avez-vous des difficultés de concentration ou de clarté mentale ?",
    type: "boolean",
    tooltip: "La clarté mentale dépend de la disponibilité métabolique et de la fonction thyroïdienne centrale.",
    weight: 2,
    tags: ["hypo_psychisme", "hypo_energie"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_anxiete_agitation",
    section: "Psychisme",
    question: "Vous sentez-vous souvent anxieux(se) ou agité(e) ?",
    type: "boolean",
    tooltip: "L'agitation peut refléter une hypersensibilité bêta-sympathique ou une hyperactivité thyroïdienne relative.",
    weight: 2,
    tags: ["hyper_psychisme", "hyper_global"],
    scoreDirection: "hyper"
  },

  // ---------------------------------------------------
  // 3. TISSUS (PEAU, PHANÈRES)
  // ---------------------------------------------------
  {
    id: "thyro_peau_seche",
    section: "Tissus",
    question: "Avez-vous la peau plutôt sèche ?",
    type: "boolean",
    tooltip: "La peau sèche est fréquente en cas d'hypofonction thyroïdienne périphérique (réduction du métabolisme cutané).",
    weight: 1,
    tags: ["hypo_tissus", "hypo_global"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_chute_cheveux",
    section: "Tissus",
    question: "Avez-vous constaté une chute de cheveux récente ou chronique ?",
    type: "select",
    options: ["Non", "Oui légère", "Oui modérée", "Oui importante"],
    tooltip: "La chute de cheveux est un signe sensible de déséquilibre thyroïdien (souvent associé à des variations de cortisol).",
    weight: 2,
    tags: ["hypo_tissus", "hypo_global"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_ongles_fragiles",
    section: "Tissus",
    question: "Avez-vous des ongles cassants ou fragiles ?",
    type: "boolean",
    tooltip: "La fragilité des phanères est un marqueur d'insuffisance métabolique thyroïdienne.",
    weight: 1,
    tags: ["hypo_tissus", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_sourcils_externes",
    section: "Tissus",
    question: "Avez-vous constaté une perte du tiers externe des sourcils ?",
    type: "boolean",
    tooltip: "Signe classique d'hypothyroïdie (signe de Hertoghe). Spécifique mais peu sensible.",
    weight: 2,
    tags: ["hypo_tissus", "hypo_global"],
    scoreDirection: "hypo"
  },

  // ---------------------------------------------------
  // 4. DIGESTION & TRANSIT
  // ---------------------------------------------------
  {
    id: "thyro_transit_lent",
    section: "Digestion",
    question: "Avez-vous tendance au transit lent ou à la constipation ?",
    type: "boolean",
    tooltip: "Le ralentissement du transit est fortement corrélé à une hypofonction thyroïdienne périphérique.",
    weight: 2,
    tags: ["hypo_digestion", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_digestion_lente",
    section: "Digestion",
    question: "Avez-vous l'impression que votre digestion est lente ?",
    type: "boolean",
    tooltip: "La digestion lente reflète une réduction du métabolisme global et du tonus parasympathique modulé par la thyroïde.",
    weight: 1,
    tags: ["hypo_digestion", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_appetit_augmente",
    section: "Digestion",
    question: "Avez-vous un appétit augmenté sans prise de poids ?",
    type: "boolean",
    tooltip: "Signe d'hyperfonction thyroïdienne : métabolisme accéléré, catabolisme augmenté.",
    weight: 2,
    tags: ["hyper_metabolisme", "hyper_global"],
    scoreDirection: "hyper"
  },

  // ---------------------------------------------------
  // 5. CARDIO-VASCULAIRE
  // ---------------------------------------------------
  {
    id: "thyro_tachycardie_repos",
    section: "Cardio-vasculaire",
    question: "Avez-vous parfois des battements du cœur rapides au repos ?",
    type: "boolean",
    tooltip: "Une tachycardie de repos peut indiquer une hyperactivité relative thyroïdienne ou une fragilité bêta-sympathique.",
    weight: 2,
    tags: ["hyper_cardio", "hyper_global"],
    scoreDirection: "hyper"
  },
  {
    id: "thyro_froid_apres_effort",
    section: "Cardio-vasculaire",
    question: "Avez-vous du mal à vous réchauffer après un effort ou une exposition au froid ?",
    type: "boolean",
    tooltip: "Indique une difficulté d'adaptation thermogénique et un déficit thyro-sympathique.",
    weight: 2,
    tags: ["hypo_thermoregulation", "hypo_metabolisme"],
    scoreDirection: "hypo"
  },
  {
    id: "thyro_pouls_lent",
    section: "Cardio-vasculaire",
    question: "Avez-vous un pouls lent au repos (< 60 bpm) ?",
    type: "boolean",
    tooltip: "Bradycardie de repos : signe possible d'hypofonction thyroïdienne chronique.",
    weight: 1,
    tags: ["hypo_cardio", "hypo_global"],
    scoreDirection: "hypo"
  }
];

export default AxeThyroConfig;
