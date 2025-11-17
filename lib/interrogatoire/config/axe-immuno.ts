import type { QuestionConfig } from "../types";

/**
 * Axe Immuno-Inflammatoire
 * -----------------------------------------------------
 * Explore le terrain inflammatoire, les allergies,
 * les infections récidivantes, les réactions cutanées
 * et les hypersensibilités alimentaires.
 */

export const AxeImmunoConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. TERRAIN INFLAMMATOIRE DE BAS GRADE
  // ---------------------------------------------------
  {
    id: "immuno_fatigue_inflammatoire",
    section: "Terrain inflammatoire",
    question: "Avez-vous une fatigue persistante associée à un état inflammatoire léger (courbatures, lourdeur) ?",
    type: "boolean",
    tooltip:
      "Indique une inflammation de bas grade liée au terrain immunitaire ou au déséquilibre alpha-sympathique."
  },
  {
    id: "immuno_sensibilite_froid",
    section: "Terrain inflammatoire",
    question: "Avez-vous tendance à 'tomber malade' plus facilement en période froide ?",
    type: "boolean",
    tooltip:
      "Signe d'un terrain immunitaire fragile ou d'une stimulation cortico-immunitaire insuffisante."
  },

  // ---------------------------------------------------
  // 2. ALLERGIES & ATOPIE
  // ---------------------------------------------------
  {
    id: "immuno_rhinite_allergique",
    section: "Allergies & Atopie",
    question: "Souffrez-vous de rhinite allergique (saisonnière ou permanente) ?",
    type: "boolean",
    tooltip:
      "La rhinite allergique reflète l'hyperréactivité IgE et l'activité alpha-sympathique muqueuse."
  },
  {
    id: "immuno_asthme",
    section: "Allergies & Atopie",
    question: "Avez-vous un asthme ou une tendance à l'hyperréactivité bronchique ?",
    type: "boolean",
    tooltip:
      "L'asthme est un indicateur d'hypersensibilité inflammatoire et de dérégulation parasympathique."
  },
  {
    id: "immuno_eczema_atopique",
    section: "Allergies & Atopie",
    question: "Avez-vous ou avez-vous eu de l'eczéma atopique ?",
    type: "boolean",
    tooltip:
      "Signe d'un terrain atopique global, fortement utile pour la compréhension du terrain immunitaire."
  },

  // ---------------------------------------------------
  // 3. INFECTIONS RÉCIDIVANTES
  // ---------------------------------------------------
  {
    id: "immuno_infections_orl",
    section: "Infections récidivantes",
    question: "Avez-vous des infections ORL répétées ?",
    type: "boolean",
    tooltip:
      "Les infections ORL récurrentes traduisent un terrain immunitaire fragile au niveau muqueux."
  },
  {
    id: "immuno_infections_respiratoires",
    section: "Infections récidivantes",
    question: "Avez-vous des bronchites fréquentes ou récidivantes ?",
    type: "boolean",
    tooltip:
      "Permet d'évaluer la fonction immunitaire respiratoire et le tonus adaptatif local."
  },
  {
    id: "immuno_cystites_repetition",
    section: "Infections récidivantes",
    question: "Avez-vous des cystites à répétition ?",
    type: "boolean",
    tooltip:
      "Utile pour déterminer l'état inflammatoire muqueux uro-génital et la fragilité immunitaire."
  },

  // ---------------------------------------------------
  // 4. MANIFESTATIONS CUTANÉES
  // ---------------------------------------------------
  {
    id: "immuno_urticaire",
    section: "Manifestations cutanées",
    question: "Avez-vous déjà fait de l'urticaire, même épisodique ?",
    type: "boolean",
    tooltip:
      "L'urticaire reflète une activation mastocytaire et une hypersensibilité immunitaire."
  },
  {
    id: "immuno_psoriasis_dermites",
    section: "Manifestations cutanées",
    question: "Avez-vous des dermites ou psoriasis ?",
    type: "boolean",
    tooltip:
      "Les maladies cutanées inflammatoires renseignent sur l'activité immunitaire systémique."
  },

  // ---------------------------------------------------
  // 5. DOULEURS INFLAMMATOIRES
  // ---------------------------------------------------
  {
    id: "immuno_douleurs_articulaires",
    section: "Douleurs inflammatoires",
    question: "Avez-vous des douleurs articulaires inflammatoires (raideur, chaleur, épisodes) ?",
    type: "boolean",
    tooltip:
      "Indique un terrain inflammatoire systémique ou une dérégulation de l'immunité périphérique."
  },
  {
    id: "immuno_douleurs_musculaires",
    section: "Douleurs inflammatoires",
    question: "Avez-vous des douleurs musculaires diffuses sans cause mécanique évidente ?",
    type: "boolean",
    tooltip:
      "Les myalgies sont souvent liées à l'inflammation de bas grade ou à la dysrégulation immuno-adaptative."
  },

  // ---------------------------------------------------
  // 6. HYPERSENSIBILITÉS ALIMENTAIRES & IMMUNITÉ
  // ---------------------------------------------------
  {
    id: "immuno_reactions_aliments",
    section: "Hypersensibilités alimentaires",
    question: "Avez-vous des réactions immunitaires possibles à certains aliments (rougeur, démangeaisons, fatigue) ?",
    type: "boolean",
    tooltip:
      "Les réactions systémiques après repas évoquent une hypersensibilité immunitaire."
  },
  {
    id: "immuno_intolerances_notables",
    section: "Hypersensibilités alimentaires",
    question: "Avez-vous identifié des intolérances alimentaires notables (hors digestif simple) ?",
    type: "text",
    tooltip:
      "Utile pour comprendre la perméabilité intestinale et la surcharge immunitaire chronique."
  }
];

export default AxeImmunoConfig;
