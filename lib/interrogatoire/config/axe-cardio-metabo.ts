import type { QuestionConfig } from "../types";

/**
 * Axe Cardio-Métabolique
 * -----------------------------------------------------
 * Explore la tension artérielle, la circulation veineuse
 * et lymphatique, les palpitations non neurovégetatives,
 * la perfusion périphérique et le métabolisme lipidique/glucidique.
 */

export const AxeCardioMetaboConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. TENSION ARTÉRIELLE
  // ---------------------------------------------------
  {
    id: "cardio_tension_basse",
    section: "Tension artérielle",
    question: "Avez-vous tendance à avoir une tension basse (hypotension) ?",
    type: "boolean",
    tooltip:
      "Indique une régulation faible du tonus vasculaire ou un terrain parasympathique dominant."
  },
  {
    id: "cardio_tension_haute",
    section: "Tension artérielle",
    question: "Avez-vous déjà eu une tension artérielle élevée (hypertension) ?",
    type: "boolean",
    tooltip:
      "Permet d'évaluer l'hypertonie vasculaire, couplée au stress chronique ou au terrain métabolique."
  },
  {
    id: "cardio_vertiges_lever",
    section: "Tension artérielle",
    question: "Avez-vous des vertiges en vous levant rapidement ?",
    type: "boolean",
    tooltip:
      "Indique une hypotension orthostatique et une mauvaise réactivité vasculaire."
  },

  // ---------------------------------------------------
  // 2. PALPITATIONS NON NEUROVÉGÉTATIVES
  // ---------------------------------------------------
  {
    id: "cardio_palpitations_effort",
    section: "Capacité à l'effort",
    question: "Avez-vous des palpitations uniquement à l'effort ?",
    type: "boolean",
    tooltip:
      "Contrairement aux palpitations neurovégétatives au repos, celles-ci orientent vers une fatigabilité cardiaque."
  },
  {
    id: "cardio_souffle_essoufflement",
    section: "Capacité à l'effort",
    question: "Avez-vous un essoufflement anormal à l'effort ?",
    type: "boolean",
    tooltip:
      "Indique une faiblesse cardio-respiratoire ou un déficit métabolique."
  },

  // ---------------------------------------------------
  // 3. CIRCULATION VEINEUSE & LYMPHATIQUE
  // ---------------------------------------------------
  {
    id: "cardio_jambes_lourdes",
    section: "Circulation veineuse",
    question: "Avez-vous les jambes lourdes ou douloureuses à la fin de la journée ?",
    type: "boolean",
    tooltip:
      "Indique une stagnation veineuse ou lymphatique, aggravée par les estrogènes et la chaleur."
  },
  {
    id: "cardio_varices",
    section: "Circulation veineuse",
    question: "Avez-vous des varices ou signes de fragilité veineuse ?",
    type: "boolean",
    tooltip:
      "Marqueur de faiblesse veineuse constitutionnelle ou hormonale (gonado-thyro)."
  },
  {
    id: "cardio_oeudemes",
    section: "Circulation veineuse",
    question: "Avez-vous des œdèmes (gonflements) des chevilles ou jambes ?",
    type: "boolean",
    tooltip:
      "Signe d'insuffisance veineuse/lymphatique ou d'hyperœstrogénie relative."
  },

  // ---------------------------------------------------
  // 4. PERFUSION & EXTRÉMITÉS
  // ---------------------------------------------------
  {
    id: "cardio_extremites_froides",
    section: "Perfusion périphérique",
    question: "Avez-vous souvent les mains ou les pieds froids ?",
    type: "boolean",
    tooltip:
      "Indique une vasoconstriction périphérique, souvent liée au terrain thyroïdien ou neurovégétatif."
  },
  {
    id: "cardio_fourmillements",
    section: "Perfusion périphérique",
    question: "Avez-vous des fourmillements dans les mains ou pieds (hors compression) ?",
    type: "boolean",
    tooltip:
      "Peut refléter une perfusion périphérique insuffisante ou un déficit métabolique."
  },

  // ---------------------------------------------------
  // 5. MÉTABOLISME LIPIDIQUE
  // ---------------------------------------------------
  {
    id: "cardio_cholesterol_haut",
    section: "Métabolisme lipidique",
    question: "Avez-vous déjà eu un cholestérol élevé ?",
    type: "boolean",
    tooltip:
      "Le cholestérol augmente en terrain inflammatoire, stress chronique ou hypothyroïdie fonctionnelle."
  },
  {
    id: "cardio_tolerance_graisses",
    section: "Métabolisme lipidique",
    question: "Tolérez-vous bien les repas riches en graisses ?",
    type: "boolean",
    tooltip:
      "Lien direct avec le métabolisme lipidique hépatobiliaire (couplage digestif ↔ cardio-métabolique)."
  },

  // ---------------------------------------------------
  // 6. MÉTABOLISME GLUCIDIQUE MÉTABOLIQUE
  // ---------------------------------------------------
  {
    id: "cardio_poids_variation",
    section: "Métabolisme glucidique",
    question: "Avez-vous pris ou perdu du poids récemment sans cause évidente ?",
    type: "boolean",
    tooltip:
      "Indique un déséquilibre thyro-somato-métabolique."
  },
  {
    id: "cardio_appetit_sucre_metabo",
    section: "Métabolisme glucidique",
    question: "Avez-vous une attirance régulière pour le sucre ?",
    type: "boolean",
    tooltip:
      "Signe d'un déséquilibre métabolique glucidique (résistance à l'insuline débutante)."
  }
];

export default AxeCardioMetaboConfig;
