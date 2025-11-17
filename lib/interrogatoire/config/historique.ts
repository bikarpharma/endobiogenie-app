import type { QuestionConfig } from "../types";

/**
 * Module Historique du Patient
 * -----------------------------------------------------
 * Ce module est transversal et non axial.
 * Il sert à contextualiser la lecture fonctionnelle
 * et à réduire les risques d'hallucination IA.
 *
 * Sections :
 * - Périnatal
 * - Petite enfance
 * - Enfance / adolescence
 * - Vie hormonale (homme / femme)
 * - Antécédents médicaux
 * - Antécédents psychiques
 * - Mode de vie actuel
 * - Expositions environnementales
 */

export const HistoriquePatientConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. PÉRINATAL / NAISSANCE
  // ---------------------------------------------------
  {
    id: "perinatal_grossesse_mere",
    section: "Périnatal",
    question: "La grossesse de votre mère a-t-elle été compliquée ?",
    type: "select",
    options: ["Non", "Oui légère", "Oui importante", "Inconnu"],
    tooltip: "Les complications périnatales influencent la structure initiale et la vulnérabilité endocrine."
  },
  {
    id: "perinatal_accouchement",
    section: "Périnatal",
    question: "Quel type d'accouchement avez-vous eu ?",
    type: "select",
    options: ["Voie basse", "Césarienne", "Instrumental", "Inconnu"],
    tooltip: "Évalue les facteurs précoces pouvant influencer la régulation ultérieure du système nerveux autonome."
  },
  {
    id: "perinatal_prematurite",
    section: "Périnatal",
    question: "Êtes-vous né(e) prématuré(e) ?",
    type: "select",
    options: ["Non", "Oui", "Inconnu"],
    tooltip: "La prématurité est associée à une fragilité endocrine et immunitaire au long cours."
  },
  {
    id: "perinatal_allaitement",
    section: "Périnatal",
    question: "Avez-vous été allaité(e) ?",
    type: "select",
    options: ["Non", "Oui", "Partiellement", "Inconnu"],
    tooltip: "L'allaitement influence le développement immunitaire et le terrain digestif."
  },

  // ---------------------------------------------------
  // 2. PETITE ENFANCE
  // ---------------------------------------------------
  {
    id: "enfance_infections_repetitions",
    section: "Petite enfance",
    question: "Avez-vous eu des infections répétées durant l'enfance ?",
    type: "select",
    options: ["Non", "Oui ORL", "Oui pulmonaires", "Oui digestives", "Oui variées"],
    tooltip: "Indicateur du terrain immunitaire initial et du couplage gonado-immun."
  },
  {
    id: "enfance_allergies",
    section: "Petite enfance",
    question: "Avez-vous présenté un terrain allergique (eczéma, asthme, rhinite) ?",
    type: "select",
    options: ["Non", "Oui", "Inconnu"],
    tooltip: "Important pour comprendre l'activité alpha-sympathique et les dérégulations inflammatoires."
  },
  {
    id: "enfance_developpement",
    section: "Petite enfance",
    question: "Le développement psychomoteur a-t-il été normal ?",
    type: "select",
    options: ["Normal", "Léger retard", "Retard significatif", "Inconnu"],
    tooltip: "Pertinent pour l'évaluation de la maturité somatotrope et du terrain neurologique."
  },

  // ---------------------------------------------------
  // 3. ENFANCE / ADOLESCENCE
  // ---------------------------------------------------
  {
    id: "ado_croissance",
    section: "Enfance / Adolescence",
    question: "Comment s'est déroulée votre croissance ?",
    type: "select",
    options: ["Normale", "Accélérée", "Lente", "Inégale"],
    tooltip: "La croissance dépend de l'axe somatotrope et permet d'estimer les équilibres GH/IGF-1."
  },
  {
    id: "ado_puberte",
    section: "Enfance / Adolescence",
    question: "Votre puberté a-t-elle été dans les temps ?",
    type: "select",
    options: ["Précoce", "Normale", "Retardée"],
    tooltip: "Indicateur majeur de l'axe gonadotrope et de sa maturité."
  },
  {
    id: "ado_troubles_humeur",
    section: "Enfance / Adolescence",
    question: "Avez-vous eu des troubles émotionnels marqués durant l'adolescence ?",
    type: "select",
    options: ["Non", "Oui", "Léger", "Important"],
    tooltip: "Permet de comprendre la structuration neurovégétative et corticotrope."
  },

  // ---------------------------------------------------
  // 4. VIE HORMONALE
  // ---------------------------------------------------

  // Femmes
  {
    id: "femme_cycles",
    section: "Vie hormonale",
    question: "[Femme] Vos cycles ont-ils été réguliers ?",
    type: "select",
    options: ["Réguliers", "Irréguliers", "Douloureux", "Abondants", "Aménorrhée"],
    tooltip: "Évalue la stabilité gonadotrope, l'équilibre estro-progestatif et le terrain muqueux."
  },
  {
    id: "femme_grossesses",
    section: "Vie hormonale",
    question: "[Femme] Avez-vous eu des grossesses ?",
    type: "select",
    options: ["Aucune", "1", "2+", "Complications"],
    tooltip: "La grossesse modifie durablement les axes gonadotrope, thyroïdien et corticotrope."
  },
  {
    id: "femme_menopause",
    section: "Vie hormonale",
    question: "[Femme] Êtes-vous ménopausée ?",
    type: "select",
    options: ["Non", "Oui récente", "Oui installée"],
    tooltip: "La ménopause modifie profondément la physiologie œstrogénique et corticotrope."

  },

  // Hommes
  {
    id: "homme_fonction_sexuelle",
    section: "Vie hormonale",
    question: "[Homme] Avez-vous constaté des variations de libido ou de performance sexuelle ?",
    type: "select",
    options: ["Non", "Oui légère", "Oui importante"],
    tooltip: "Indicateur clé de l'axe gonadotrope et de son interaction avec le cortisol."
  },

  // ---------------------------------------------------
  // 5. ANTÉCÉDENTS MÉDICAUX
  // ---------------------------------------------------
  {
    id: "antecedents_medicaux",
    section: "Antécédents médicaux",
    question: "Avez-vous des antécédents médicaux notables ?",
    type: "text",
    tooltip: "Contribue à comprendre les fragilités structurelles ou organiques."
  },
  {
    id: "antecedents_chirurgicaux",
    section: "Antécédents médicaux",
    question: "Avez-vous eu des interventions chirurgicales ?",
    type: "text",
    tooltip: "Les chirurgies modifient souvent la physiologie locale et les capacités adaptatives."
  },
  {
    id: "traitements_longs",
    section: "Antécédents médicaux",
    question: "Avez-vous pris des traitements prolongés ?",
    type: "text",
    tooltip: "Pertinent pour comprendre les impacts hormonaux, digestifs ou immunitaires."
  },

  // ---------------------------------------------------
  // 6. HISTORIQUE PSYCHOLOGIQUE
  // ---------------------------------------------------
  {
    id: "psyclin_traumas",
    section: "Antécédents psychiques",
    question: "Avez-vous vécu des traumas psychologiques importants ?",
    type: "select",
    options: ["Non", "Oui", "Oui avec séquelles"],
    tooltip: "Impact majeur sur l'axe corticotrope et le SNA central."
  },
  {
    id: "psyclin_stress_majeur",
    section: "Antécédents psychiques",
    question: "Avez-vous vécu des périodes prolongées de stress ou surcharge émotionnelle ?",
    type: "select",
    options: ["Non", "Oui", "Oui chronique"],
    tooltip: "Permet d'estimer la charge corticotrope historique."
  },

  // ---------------------------------------------------
  // 7. MODE DE VIE ACTUEL
  // ---------------------------------------------------
  {
    id: "vie_sommeil",
    section: "Mode de vie",
    question: "Comment décririez-vous votre sommeil actuellement ?",
    type: "select",
    options: ["Bon", "Moyen", "Mauvais"],
    tooltip: "Base de la chronobiologie et de la régulation neuroendocrinienne."
  },
  {
    id: "vie_alimentation",
    section: "Mode de vie",
    question: "Avez-vous un mode alimentaire particulier ?",
    type: "text",
    tooltip: "Impact direct sur l'axe somatotrope, corticotrope et digestif."
  },
  {
    id: "vie_sport",
    section: "Mode de vie",
    question: "Pratiquez-vous une activité physique régulière ?",
    type: "select",
    options: ["Non", "Oui légère", "Oui modérée", "Oui intensive"],
    tooltip: "Indicateur du tonus somatotrope et de la résilience adaptative."
  },

  // ---------------------------------------------------
  // 8. EXPOSITIONS / TOXIQUES
  // ---------------------------------------------------
  {
    id: "toxique_tabac",
    section: "Expositions toxiques",
    question: "Fumez-vous ou avez-vous fumé ?",
    type: "select",
    options: ["Non", "Oui", "Ancien fumeur"],
    tooltip: "Influence le terrain inflammatoire et la capacité oxydative."
  },
  {
    id: "toxique_alcool",
    section: "Expositions toxiques",
    question: "Consommation d'alcool ?",
    type: "select",
    options: ["Faible", "Modérée", "Élevée"],
    tooltip: "Pertinent pour comprendre la charge hépatique et les couplages digestifs."
  },
  {
    id: "toxique_expositions",
    section: "Expositions toxiques",
    question: "Avez-vous une exposition connue à des toxiques (métaux lourds, solvants, pesticides) ?",
    type: "text",
    tooltip: "Impact direct sur les émonctoires et les boucles immuno-inflammatoires."
  }
];

export default HistoriquePatientConfig;
