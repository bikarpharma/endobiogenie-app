import type { QuestionConfig } from "../types";

/**
 * Axe Dermatologique & Muqueux
 * -----------------------------------------------------
 * Explore la peau, le sébum, la sécheresse, les cheveux,
 * les ongles, les muqueuses et les manifestations cutanées
 * inflammatoires ou allergiques.
 *
 * Axe transversal lié au thyroïdien, gonadique, immunitaire,
 * digestif et adaptatif. Indispensable pour l'ordonnance.
 */

export const AxeDermatoConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. PEAU : SÉCHERESSE / HYDRATATION
  // ---------------------------------------------------
  {
    id: "dermato_peau_seche",
    section: "Peau sèche",
    question: "Avez-vous la peau sèche de façon générale ?",
    type: "boolean",
    tooltip:
      "Signe lié à la thyroïde, à l'hydratation systémique et à l'équilibre des muqueuses."
  },
  {
    id: "dermato_peau_tiraillements",
    section: "Peau sèche",
    question: "Votre peau tiraille-t-elle facilement après la douche ?",
    type: "boolean",
    tooltip:
      "Indique une altération du film hydrolipidique ou un déséquilibre thyro-immun."
  },

  // ---------------------------------------------------
  // 2. PEAU : SÉBUM / ACNÉ / GRASSE
  // ---------------------------------------------------
  {
    id: "dermato_peau_grasse",
    section: "Peau grasse & Acné",
    question: "Votre peau est-elle grasse ou brillante ?",
    type: "boolean",
    tooltip:
      "Associé à une dominance androgénique ou à une fermentation digestive."
  },
  {
    id: "dermato_acne_adulte",
    section: "Peau grasse & Acné",
    question: "Avez-vous de l'acné (même adulte) ?",
    type: "boolean",
    tooltip:
      "L'acné est le reflet du terrain gonadique, immunitaire et digestif."
  },

  // ---------------------------------------------------
  // 3. CHEVEUX
  // ---------------------------------------------------
  {
    id: "dermato_chute_cheveux",
    section: "Cheveux",
    question: "Avez-vous une chute de cheveux récente ou chronique ?",
    type: "select",
    options: ["Non", "Légère", "Modérée", "Importante"],
    tooltip:
      "Indicateur clé du terrain thyroïdien, du stress adaptatif et de la balance hormonale."
  },
  {
    id: "dermato_cheveux_secs",
    section: "Cheveux",
    question: "Vos cheveux sont-ils secs ou cassants ?",
    type: "boolean",
    tooltip:
      "Souvent lié à l'hypothyroïdie fonctionnelle ou à une sécheresse mucocutanée."
  },

  // ---------------------------------------------------
  // 4. ONGLES
  // ---------------------------------------------------
  {
    id: "dermato_ongles_fragiles",
    section: "Ongles",
    question: "Avez-vous les ongles fragiles ou cassants ?",
    type: "boolean",
    tooltip:
      "Les ongles reflètent la microcirculation et la fonction thyro-somato."
  },
  {
    id: "dermato_ongles_stries",
    section: "Ongles",
    question: "Vos ongles présentent-ils des stries ou irrégularités ?",
    type: "boolean",
    tooltip:
      "Indique des variations métaboliques ou un terrain inflammatoire discret."
  },

  // ---------------------------------------------------
  // 5. MANIFESTATIONS CUTANÉES INFLAMMATOIRES
  // ---------------------------------------------------
  {
    id: "dermato_dermite",
    section: "Inflammations cutanées",
    question: "Avez-vous des dermites, rougeurs ou irritations de la peau ?",
    type: "boolean",
    tooltip:
      "Signe d'inflammation cutanée liée au terrain immunitaire et digestif."
  },
  {
    id: "dermato_psoriasis",
    section: "Inflammations cutanées",
    question: "Avez-vous du psoriasis ou des plaques épaissies ?",
    type: "boolean",
    tooltip:
      "Lien direct avec le terrain inflammatoire systémique (Vol.4)."
  },
  {
    id: "dermato_urticaire",
    section: "Inflammations cutanées",
    question: "Avez-vous déjà fait de l'urticaire ?",
    type: "boolean",
    tooltip:
      "Manifestation d'hypersensibilité immunologique (mastocytes)."
  },

  // ---------------------------------------------------
  // 6. MUQUEUSES
  // ---------------------------------------------------
  {
    id: "dermato_secheresse_muqueuses",
    section: "Muqueuses",
    question: "Avez-vous une sécheresse des muqueuses (yeux, bouche, nez) ?",
    type: "boolean",
    tooltip:
      "Indique une faiblesse hydrique ou thyro-gonadique, ou un terrain inflammatoire."
  },
  {
    id: "dermato_aphtes_recurrents",
    section: "Muqueuses",
    question: "Faites-vous des aphtes de manière répétée ?",
    type: "boolean",
    tooltip:
      "Les aphtes récurrents sont liés à l'immunité muqueuse et parfois à des carences."
  },
  {
    id: "dermato_mycoses",
    section: "Muqueuses",
    question: "Avez-vous des mycoses cutanées ou muqueuses fréquentes ?",
    type: "boolean",
    tooltip:
      "Indique une fragilité immunitaire locale ou un déséquilibre du microbiote."
  },

  // ---------------------------------------------------
  // 7. HYPERSENSIBILITÉS CUTANÉES
  // ---------------------------------------------------
  {
    id: "dermato_prurit",
    section: "Hypersensibilités",
    question: "Avez-vous des démangeaisons (prurit) sans cause apparente ?",
    type: "boolean",
    tooltip:
      "Peut refléter une inflammation bas grade, un terrain allergique ou une sécheresse thyroïdienne."
  },
  {
    id: "dermato_reaction_peau_produits",
    section: "Hypersensibilités",
    question: "Votre peau réagit-elle facilement aux produits cosmétiques ?",
    type: "boolean",
    tooltip:
      "Évalue la sensibilité cutanée, liée à l'histamine et au terrain immunitaire."
  }
];

export default AxeDermatoConfig;
