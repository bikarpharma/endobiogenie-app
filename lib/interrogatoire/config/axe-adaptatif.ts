import type { QuestionConfig } from "../types";

/**
 * Axe Adaptatif (Corticotrope)
 * -----------------------------------------------------
 * Explore la réponse au stress aigu/chronique,
 * la stabilité glucidique dépendante du cortisol,
 * la charge émotionnelle et les signes d'hypercatabolisme.
 */

export const AxeAdaptatifConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. RÉACTIVITÉ AU STRESS (stress aigu)
  // ---------------------------------------------------
  {
    id: "adapt_stress_aigu",
    section: "Réactivité au stress",
    question: "Vous sentez-vous facilement stressé(e) par les situations du quotidien ?",
    type: "select",
    options: ["Non", "Oui légèrement", "Oui modérément", "Oui fortement"],
    tooltip:
      "Indicateur de réactivité corticosympathique et de mobilisation aiguë du cortisol."
  },
  {
    id: "adapt_stress_ponctuel",
    section: "Réactivité au stress",
    question: "Les événements soudains ou imprévus vous perturbent-ils beaucoup ?",
    type: "boolean",
    tooltip:
      "Évalue la capacité d'adaptation immédiate et la stabilité SNA–cortisol."
  },

  // ---------------------------------------------------
  // 2. ADAPTATION CHRONIQUE & SURCHARGE (stress chronique)
  // ---------------------------------------------------
  {
    id: "adapt_charge_mentale",
    section: "Stress chronique",
    question: "Vous sentez-vous en surcharge mentale de façon prolongée ?",
    type: "select",
    options: ["Non", "Oui", "Oui chronique"],
    tooltip:
      "Indique une activitation prolongée de l'axe corticotrope, typique de l'hyperadaptation."
  },
  {
    id: "adapt_tension_musculaire",
    section: "Stress chronique",
    question: "Ressentez-vous souvent une tension musculaire persistante (épaules, nuque) ?",
    type: "boolean",
    tooltip:
      "Manifestation classique de surcharge adaptative ou d'hyperactivité corticosympathique."
  },
  {
    id: "adapt_irritabilite",
    section: "Stress chronique",
    question: "Avez-vous tendance à devenir irritable facilement ?",
    type: "boolean",
    tooltip:
      "L'irritabilité est liée à la fatigue corticotrope et à la surcharge émotionnelle chronique."
  },

  // ---------------------------------------------------
  // 3. RÉGULATION GLUCIDIQUE (cortisol ↔ GH ↔ insuline)
  // ---------------------------------------------------
  {
    id: "adapt_hypo_sensation",
    section: "Régulation glucidique",
    question: "Avez-vous des sensations d'hypoglycémie (tremblements, faim urgente, vertiges) ?",
    type: "boolean",
    tooltip:
      "Indicateur clé de l'équilibre cortisol–insuline–GH et de la capacité adaptative énergétique."
  },
  {
    id: "adapt_saut_repas",
    section: "Régulation glucidique",
    question: "Tolérez-vous bien de sauter un repas ?",
    type: "select",
    options: ["Oui", "Non", "Parfois"],
    tooltip:
      "Mesure la capacité à maintenir l'homéostasie glucidique sans mobilisation excessive du cortisol."
  },
  {
    id: "adapt_fatigue_apres_repas",
    section: "Régulation glucidique",
    question: "Ressentez-vous de la fatigue après les repas ?",
    type: "boolean",
    tooltip:
      "Signe de dérégulation insulinique ou d'épuisement adaptatif lié au métabolisme post-prandial."
  },

  // ---------------------------------------------------
  // 4. MANIFESTATIONS PHYSIQUES DU STRESS
  // ---------------------------------------------------
  {
    id: "adapt_douleurs_musculaires",
    section: "Manifestations physiques",
    question: "Avez-vous des douleurs musculaires fréquentes sans cause mécanique ?",
    type: "boolean",
    tooltip:
      "Les douleurs diffuses témoignent souvent d'un hypercatabolisme lié à la dérégulation corticotrope."
  },
  {
    id: "adapt_raideurs_matinales",
    section: "Manifestations physiques",
    question: "Avez-vous des raideurs musculaires le matin au réveil ?",
    type: "boolean",
    tooltip:
      "Indique une surcharge nocturne de cortisol ou une fatigue adaptative musculaire."
  },
  {
    id: "adapt_troubles_digestifs_stress",
    section: "Manifestations physiques",
    question: "Votre digestion est-elle perturbée en période de stress ?",
    type: "boolean",
    tooltip:
      "Indicateur du couplage stress ↔ motricité digestive (axe cortico–vagal)."
  },

  // ---------------------------------------------------
  // 5. RÉVEILS CORTISOLIQUES & CHRONOBIOLOGIE
  // ---------------------------------------------------
  {
    id: "adapt_reveils_precoces",
    section: "Chronobiologie",
    question: "Vous arrive-t-il de vous réveiller trop tôt (4–6h du matin) ?",
    type: "boolean",
    tooltip:
      "Signale un pic matinal de cortisol ou une instabilité du rythme corticotrope."
  },
  {
    id: "adapt_reveil_angoisse",
    section: "Chronobiologie",
    question: "Vous réveillez-vous parfois avec une sensation d'angoisse ou de tension ?",
    type: "boolean",
    tooltip:
      "Indicateur de décharge corticosympathique nocturne."
  },
  {
    id: "adapt_energie_fin_journee",
    section: "Chronobiologie",
    question: "Comment est votre énergie en fin de journée ?",
    type: "select",
    options: ["Bonne", "Moyenne", "Mauvaise"],
    tooltip:
      "Permet de comprendre la courbe cortisolique et la fatigue adaptative."
  }
];

export default AxeAdaptatifConfig;
