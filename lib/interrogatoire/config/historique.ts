import type { QuestionConfig } from "../types";

/**
 * HISTORIQUE & LIGNE DE VIE - BLOC TERRAIN
 * -------------------------------------------------
 * Ce module est transversal et non axial.
 * Il contextualise la lecture fonctionnelle et permet à l'IA
 * de distinguer un terrain constitutionnel (génétique)
 * d'un terrain acquis (chocs, mode de vie).
 *
 * SPÉCIFICITÉ : Ces données ne scorent pas, mais ORIENTENT l'interprétation
 * des autres axes via les TAGS.
 *
 * Sections :
 * - Périnatal (Le Terrain Constitutionnel)
 * - Enfance & Puberté (La Construction)
 * - Chocs & Traumas (Les Fractures)
 * - Antécédents Familiaux (La Génétique)
 * - Ligne de Vie (L'Axe Autopathogène)
 */

export type HistoriqueQuestion = QuestionConfig & {
  tags?: string[];
};

const HistoriqueConfig: HistoriqueQuestion[] = [
  // ==========================================
  // 1. PÉRINATAL (Le Terrain Constitutionnel)
  // ==========================================
  {
    id: "histo_naissance",
    question: "Votre naissance a-t-elle été difficile (Césarienne, Forceps, Prématurité) ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Assez", "Très difficile"],
    tooltip: "Un stress à la naissance marque l'axe corticotrope (hyper-réactivité) à vie.",
    weight: 3,
    priority: 1, // ESSENTIEL
    tags: ["stress_perinatal", "hyper_cortico_constitutionnel"],
    section: "Périnatal"
  },
  {
    id: "histo_allaitement",
    question: "Avez-vous été allaité maternellement ?",
    type: "boolean",
    tooltip: "L'allaitement protège le microbiote et l'immunité muqueuse (IgA).",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["protection_immunitaire_initiale"],
    section: "Périnatal"
  },
  {
    id: "histo_grossesse_mere",
    question: "Votre mère a-t-elle eu une grossesse difficile (stress, maladie, complications) ?",
    type: "scale_1_5",
    scaleLabels: ["Non", "Légère", "Modérée", "Difficile", "Très difficile"],
    tooltip: "L'interaction materno-fœtale influence la programmation neuroendocrine de l'enfant.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["stress_prenatal", "programmation_foetale"],
    section: "Périnatal"
  },

  // ==========================================
  // 2. ENFANCE & PUBERTÉ (La Construction)
  // ==========================================
  {
    id: "histo_croissance",
    question: "Avez-vous eu une croissance très rapide (poussées) ou des douleurs de croissance ?",
    type: "boolean",
    tooltip: "Signe d'une activité somatotrope/thyroïdienne intense et parfois déséquilibrée.",
    weight: 2,
    priority: 3, // OPTIONNEL
    tags: ["hyper_somato_constitutionnel"],
    section: "Enfance & Puberté"
  },
  {
    id: "histo_puberte_difficile",
    question: "Votre puberté a-t-elle été difficile (Acné sévère, cycles anarchiques, retard) ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Assez", "Très difficile"],
    tooltip: "Révèle la fragilité de l'axe gonadotrope lors de son activation.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["fragilite_gonadique"],
    section: "Enfance & Puberté"
  },
  {
    id: "histo_infections_enfance",
    question: "Enfant, étiez-vous tout le temps malade (ORL, Bronchites) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'un déficit immunitaire Th1 constitutionnel ou d'une immaturité adaptative.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["deficit_immunitaire_constitutionnel"],
    section: "Enfance & Puberté"
  },
  {
    id: "histo_age_premier_symptome",
    question: "À quel âge avez-vous eu votre premier problème de santé significatif ?",
    type: "select",
    options: ["0-3 ans", "4-7 ans", "8-11 ans", "12-21 ans", "22-31 ans", "32-46 ans", "47+ ans"],
    tooltip: "L'âge du premier symptôme majeur aide à déterminer l'axe autopathogène (le plus fragile).",
    weight: 3,
    priority: 1, // ESSENTIEL
    tags: ["axe_autopathogene"],
    section: "Enfance & Puberté"
  },

  // ==========================================
  // 3. CHOCS & TRAUMAS (Les Fractures)
  // ==========================================
  {
    id: "histo_choc_emotionnel",
    question: "Avez-vous vécu un choc émotionnel majeur qui a marqué un 'avant/après' dans votre santé ?",
    type: "boolean",
    tooltip: "Le 'facteur déclencheur' en endobiogénie. Il décompense le terrain.",
    weight: 3,
    priority: 1, // ESSENTIEL
    tags: ["facteur_declencheur", "rupture_adaptation"],
    section: "Chocs & Traumas"
  },
  {
    id: "histo_choc_annee",
    question: "Si oui, en quelle année approximativement ?",
    type: "number",
    tooltip: "Permet de corréler le choc avec l'évolution des symptômes.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["chronologie_trauma"],
    section: "Chocs & Traumas"
  },
  {
    id: "histo_surmenage",
    question: "Avez-vous vécu une période d'épuisement (Burn-out) ou de surmenage intense ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Actuellement"],
    tooltip: "Effondrement de la réserve surrénalienne. Le patient ne revient jamais à 100% sans aide.",
    weight: 3,
    priority: 1, // ESSENTIEL
    tags: ["epuisement_surrenalien_historique"],
    section: "Chocs & Traumas"
  },
  {
    id: "histo_ace",
    question: "Avez-vous vécu des événements traumatiques dans l'enfance (séparation, violence, négligence) ?",
    type: "scale_1_5",
    scaleLabels: ["Non", "Légèrement", "Modérément", "Sévèrement", "Très sévèrement"],
    tooltip: "Les ACE (Adverse Childhood Events) impactent durablement le terrain neuroendocrine.",
    weight: 3,
    priority: 1, // ESSENTIEL
    tags: ["ace", "trauma_enfance", "physiopsychologie"],
    section: "Chocs & Traumas"
  },

  // ==========================================
  // 4. ANTÉCÉDENTS FAMILIAUX (La Génétique)
  // ==========================================
  {
    id: "histo_atcd_thyroide",
    question: "Y a-t-il des problèmes de thyroïde dans votre famille ?",
    type: "boolean",
    tooltip: "Prédisposition génétique à la fragilité thyréotrope.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["atcd_familial", "fragilite_thyro"],
    section: "Antécédents Familiaux"
  },
  {
    id: "histo_atcd_diabete",
    question: "Y a-t-il du diabète dans votre famille ?",
    type: "boolean",
    tooltip: "Prédisposition à la résistance à l'insuline et au déséquilibre somatotrope.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["atcd_familial", "fragilite_somato"],
    section: "Antécédents Familiaux"
  },
  {
    id: "histo_atcd_autoimmun",
    question: "Y a-t-il des maladies auto-immunes dans votre famille ?",
    type: "boolean",
    tooltip: "Prédisposition au dérèglement de la tolérance immunitaire.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["atcd_familial", "fragilite_immuno"],
    section: "Antécédents Familiaux"
  },
  {
    id: "histo_atcd_cancer",
    question: "Y a-t-il des cancers dans votre famille (précisez le type si possible) ?",
    type: "text",
    tooltip: "Permet d'identifier les terrains génétiques de prolifération.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["atcd_familial", "terrain_proliferatif"],
    section: "Antécédents Familiaux"
  },
  {
    id: "histo_atcd_cardio",
    question: "Y a-t-il des maladies cardiovasculaires dans votre famille ?",
    type: "boolean",
    tooltip: "Prédisposition vasculaire et métabolique.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["atcd_familial", "fragilite_cardio"],
    section: "Antécédents Familiaux"
  },

  // ==========================================
  // 5. MODE DE VIE ACTUEL (rapide)
  // ==========================================
  {
    id: "histo_sport",
    question: "Faites-vous du sport de manière intensive (> 3x/semaine) ?",
    type: "boolean",
    tooltip: "Le sport intensif augmente le besoin en cortisol et GH. Attention à l'épuisement.",
    weight: 2,
    priority: 3, // OPTIONNEL
    tags: ["hyper_sollicitation_somato"],
    section: "Mode de Vie"
  },
  {
    id: "histo_toxiques",
    question: "Fumez-vous ou êtes-vous exposé à des toxiques réguliers ?",
    type: "boolean",
    tooltip: "Bloque les cytochromes hépatiques et augmente le stress oxydatif.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["surcharge_hepatique_toxique"],
    section: "Mode de Vie"
  },
  {
    id: "histo_sommeil_decale",
    question: "Travaillez-vous en horaires décalés (nuit, 3x8) ?",
    type: "boolean",
    tooltip: "Le pire perturbateur endocrinien. Dérègle le couple cortisol/mélatonine.",
    weight: 3,
    priority: 1, // ESSENTIEL
    tags: ["dysregulation_chronobio_majeure"],
    section: "Mode de Vie"
  },

  // ==========================================
  // 6. PHASE DE VIE ACTUELLE (NOUVEAU)
  // ==========================================
  {
    id: "histo_pause_genitale",
    question: "Avez-vous remarqué des changements de santé autour de 28-31 ans ou 39-43 ans ?",
    type: "boolean",
    tooltip: "Ces âges correspondent aux 'pauses génitales' où l'organisme restructure l'axe gonadotrope.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["pause_genitale", "restructuration_gonado"],
    section: "Phase de Vie"
  },
  {
    id: "histo_evenement_recent",
    question: "Y a-t-il eu un événement majeur récent (< 2 ans) qui a modifié votre santé ?",
    type: "boolean",
    tooltip: "L'expression liminale de la maladie apparaît souvent 2-5 ans après un stress majeur.",
    weight: 2,
    priority: 1, // ESSENTIEL
    tags: ["facteur_declencheur_recent"],
    section: "Phase de Vie"
  }
];

export default HistoriqueConfig;
