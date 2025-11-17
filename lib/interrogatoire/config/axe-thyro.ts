import type { QuestionConfig } from "../types";

/**
 * Axe Thyroïdien
 * -----------------------------------------------------
 * Explore la fonction thyroïdienne réelle (non biochimique),
 * la thermorégulation, les phanères, le transit et l'énergie.
 * Cohérent avec la clinique fonctionnelle décrite dans les Vol.1, 2 et 4.
 */

export const AxeThyroConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. THERMORÉGULATION
  // ---------------------------------------------------
  {
    id: "thyro_frilosite",
    section: "Thermorégulation",
    question: "Avez-vous tendance à être frileux(se) ?",
    type: "boolean",
    tooltip:
      "Indicateur classique d'hypofonction thyroïdienne fonctionnelle (thermorégulation centrale et périphérique)."
  },
  {
    id: "thyro_sensation_froid_extremites",
    section: "Thermorégulation",
    question: "Avez-vous souvent les mains ou les pieds froids ?",
    type: "boolean",
    tooltip:
      "Signale un ralentissement métabolique et un défaut de vasodilatation périphérique lié à une faible activité thyroïdienne."
  },
  {
    id: "thyro_intolerance_chaleur",
    section: "Thermorégulation",
    question: "Avez-vous du mal à supporter la chaleur ?",
    type: "boolean",
    tooltip:
      "L'intolérance à la chaleur évoque une hyperactivité fonctionnelle ou une instabilité thyro-adaptative."
  },

  // ---------------------------------------------------
  // 2. PEAU / PHANÈRES
  // ---------------------------------------------------
  {
    id: "thyro_peau_seche",
    section: "Peau & Phanères",
    question: "Avez-vous la peau plutôt sèche ?",
    type: "boolean",
    tooltip:
      "La peau sèche est fréquente en cas d'hypofonction thyroïdienne périphérique."
  },
  {
    id: "thyro_chute_cheveux",
    section: "Peau & Phanères",
    question: "Avez-vous constaté une chute de cheveux récente ou chronique ?",
    type: "select",
    options: ["Non", "Oui légère", "Oui modérée", "Oui importante"],
    tooltip:
      "La chute de cheveux est un signe sensible de déséquilibre thyroïdien (souvent associé à des variations de cortisol)."
  },
  {
    id: "thyro_oncles_fragiles",
    section: "Peau & Phanères",
    question: "Avez-vous des ongles cassants ou fragiles ?",
    type: "boolean",
    tooltip:
      "La fragilité des phanères est un marqueur d'insuffisance métabolique thyroïdienne."
  },

  // ---------------------------------------------------
  // 3. TRANSIT LIÉ À LA THYROÏDE
  // (Spécifique, non redondant avec axe digestif)
  // ---------------------------------------------------
  {
    id: "thyro_transit_lent",
    section: "Transit & Digestion",
    question: "Avez-vous tendance au transit lent ou à la constipation ?",
    type: "boolean",
    tooltip:
      "Le ralentissement du transit est fortement corrélé à une hypofonction thyroïdienne périphérique."
  },
  {
    id: "thyro_digestion_lente",
    section: "Transit & Digestion",
    question: "Avez-vous l'impression que votre digestion est lente ?",
    type: "boolean",
    tooltip:
      "La digestion lente reflète une réduction du métabolisme global et du tonus parasympathique modulé par la thyroïde."
  },

  // ---------------------------------------------------
  // 4. ÉNERGIE & RYTHME
  // ---------------------------------------------------
  {
    id: "thyro_fatigue_matinale",
    section: "Énergie & Métabolisme",
    question: "Vous sentez-vous fatigué(e) le matin au réveil ?",
    type: "boolean",
    tooltip:
      "Peut correspondre à une baisse de l'activité thyroïdienne et une mauvaise activation métabolique matinale."
  },
  {
    id: "thyro_ralentissement_general",
    section: "Énergie & Métabolisme",
    question: "Avez-vous l'impression générale de fonctionner au ralenti ?",
    type: "boolean",
    tooltip:
      "Signe typique d'hypoactivité thyroïdienne fonctionnelle (vol. 2)."
  },
  {
    id: "thyro_difficultes_concentration",
    section: "Énergie & Métabolisme",
    question: "Avez-vous des difficultés de concentration ou de clarté mentale ?",
    type: "boolean",
    tooltip:
      "La clarté mentale dépend de la disponibilité métabolique et de la fonction thyroïdienne centrale."
  },

  // ---------------------------------------------------
  // 5. CARDIO FONCTIONNEL
  // ---------------------------------------------------
  {
    id: "thyro_tachycardie_repos",
    section: "Cardio-vasculaire",
    question: "Avez-vous parfois des battements du cœur rapides au repos ?",
    type: "boolean",
    tooltip:
      "Une tachycardie de repos peut indiquer une hyperactivité relative thyroïdienne ou une fragilité bêta-sympathique."
  },
  {
    id: "thyro_froid_apres_effort",
    section: "Cardio-vasculaire",
    question: "Avez-vous du mal à vous réchauffer après un effort ou une exposition au froid ?",
    type: "boolean",
    tooltip:
      "Indique une difficulté d'adaptation thermogénique et un déficit thyro-sympathique."
  }
];

export default AxeThyroConfig;
