import type { QuestionConfig } from "../types";

/**
 * MODE DE VIE - BLOC TERRAIN
 * -------------------------------------------------
 * Évalue les facteurs environnementaux et comportementaux
 * qui influencent le terrain endobiogénique :
 * - Alimentation & Hydratation
 * - Sommeil & Repos
 * - Activité Physique
 * - Toxiques (Alcool, Tabac, Stimulants)
 * - Environnement & Stress quotidien
 *
 * SPÉCIFICITÉ : Ces données ne scorent pas directement les axes,
 * mais MODULENT l'interprétation (ex: café → hyper-sympathique acquis)
 */

export type ModeVieQuestion = QuestionConfig & {
  tags?: string[];
};

const ModeVieConfig: ModeVieQuestion[] = [
  // ==========================================
  // 1. ALIMENTATION & HYDRATATION
  // ==========================================
  {
    id: "mv_qualite_alimentation",
    question: "Comment qualifiez-vous votre alimentation actuelle ?",
    type: "scale_1_5",
    scaleLabels: ["Très déséquilibrée", "Plutôt déséquilibrée", "Correcte", "Équilibrée", "Très équilibrée"],
    tooltip: "Une alimentation déséquilibrée impacte directement les axes métaboliques (thyroïdien, somatotrope).",
    weight: 3,
    tags: ["qualite_nutrition"],
    section: "Alimentation"
  },
  {
    id: "mv_repas_reguliers",
    question: "Prenez-vous des repas à heures régulières ?",
    type: "boolean",
    tooltip: "La régularité des repas stabilise la glycémie et l'axe corticotrope.",
    weight: 2,
    tags: ["regularite_repas"],
    section: "Alimentation"
  },
  {
    id: "mv_petit_dejeuner",
    question: "Prenez-vous un petit-déjeuner tous les jours ?",
    type: "boolean",
    tooltip: "Le petit-déjeuner relance le métabolisme thyroïdien et stabilise le cortisol matinal.",
    weight: 2,
    tags: ["petit_dejeuner"],
    section: "Alimentation"
  },
  {
    id: "mv_grignottage",
    question: "À quelle fréquence grignotez-vous entre les repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "Le grignotage perturbe l'insuline et l'axe somatotrope (GH).",
    weight: 2,
    tags: ["dysregulation_insuline"],
    section: "Alimentation"
  },
  {
    id: "mv_hydratation",
    question: "Combien de verres d'eau buvez-vous par jour (hors café, thé, sodas) ?",
    type: "scale_1_5",
    scaleLabels: ["< 3 verres", "3-5 verres", "6-8 verres", "9-10 verres", "> 10 verres"],
    tooltip: "Une bonne hydratation facilite l'élimination rénale et la détoxification hépatique.",
    weight: 2,
    tags: ["hydratation"],
    section: "Alimentation"
  },

  // ==========================================
  // 2. TOXIQUES & STIMULANTS
  // ==========================================
  {
    id: "mv_cafe_quantite",
    question: "Combien de cafés (ou équivalents) consommez-vous par jour ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun", "1-2", "3-4", "5-6", "> 6"],
    tooltip: "Le café stimule les catécholamines (hyper-sympathique) et peut épuiser les surrénales.",
    weight: 3,
    tags: ["hyper_sympathique_acquis", "epuisement_surrenalien"],
    section: "Toxiques & Stimulants"
  },
  {
    id: "mv_tabac",
    question: "Fumez-vous actuellement ?",
    type: "scale_1_5",
    scaleLabels: ["Non", "Occasionnel", "< 10/j", "10-20/j", "> 20/j"],
    tooltip: "Le tabac active chroniquement l'axe sympathique et inflammatoire.",
    weight: 4,
    tags: ["hyper_sympathique", "stress_oxydatif", "inflammation_chronique"],
    section: "Toxiques & Stimulants"
  },
  {
    id: "mv_alcool",
    question: "Quelle est votre consommation d'alcool ?",
    type: "scale_1_5",
    scaleLabels: ["Aucune", "Occasionnelle", "1-2 verres/j", "3-4 verres/j", "> 4 verres/j"],
    tooltip: "L'alcool surcharge le foie, perturbe la glycémie et l'axe gonadotrope.",
    weight: 4,
    tags: ["surcharge_hepatique", "dysregulation_glycemique"],
    section: "Toxiques & Stimulants"
  },
  {
    id: "mv_sucre_ajoute",
    question: "Consommez-vous régulièrement des produits sucrés (sodas, desserts, confiseries) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "Le sucre raffiné favorise l'inflammation, la résistance à l'insuline et la candidose.",
    weight: 3,
    tags: ["inflammation", "resistance_insuline", "terrain_candidose"],
    section: "Toxiques & Stimulants"
  },

  // ==========================================
  // 3. SOMMEIL & REPOS
  // ==========================================
  {
    id: "mv_heures_sommeil",
    question: "Combien d'heures dormez-vous en moyenne par nuit ?",
    type: "scale_1_5",
    scaleLabels: ["< 5h", "5-6h", "7-8h", "8-9h", "> 9h"],
    tooltip: "Le sommeil régénère l'axe somatotrope (GH) et récupère le cortisol.",
    weight: 4,
    tags: ["recuperation_somatotrope"],
    section: "Sommeil"
  },
  {
    id: "mv_qualite_sommeil",
    question: "Comment évaluez-vous la qualité de votre sommeil ?",
    type: "scale_1_5",
    scaleLabels: ["Très mauvaise", "Mauvaise", "Moyenne", "Bonne", "Excellente"],
    tooltip: "Un sommeil non réparateur épuise les surrénales et perturbe les rythmes circadiens.",
    weight: 4,
    tags: ["qualite_sommeil"],
    section: "Sommeil"
  },
  {
    id: "mv_endormissement",
    question: "Avez-vous des difficultés à vous endormir ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les troubles d'endormissement signent souvent un hyper-sympathique vespéral.",
    weight: 3,
    tags: ["hyper_sympathique_nocturne"],
    section: "Sommeil"
  },
  {
    id: "mv_reveils_nocturnes",
    question: "Vous réveillez-vous pendant la nuit ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "1-2 fois", "3-4 fois", "> 4 fois"],
    tooltip: "Les réveils nocturnes (surtout 3-5h) peuvent indiquer une hypoglycémie ou un déficit en cortisol.",
    weight: 3,
    tags: ["hypoglycemie_nocturne", "cortisol_insuffisant"],
    section: "Sommeil"
  },
  {
    id: "mv_sieste",
    question: "Faites-vous des siestes ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Tous les jours"],
    tooltip: "Le besoin fréquent de sieste peut refléter un épuisement thyroïdien ou surrénalien.",
    weight: 2,
    tags: ["fatigue_chronique"],
    section: "Sommeil"
  },

  // ==========================================
  // 4. ACTIVITÉ PHYSIQUE
  // ==========================================
  {
    id: "mv_activite_physique",
    question: "Quelle est votre pratique d'activité physique ?",
    type: "scale_1_5",
    scaleLabels: ["Sédentaire", "Occasionnelle", "1-2x/sem", "3-4x/sem", "> 4x/sem"],
    tooltip: "L'activité physique régule l'insuline, stimule le somatotrope et améliore la circulation.",
    weight: 3,
    tags: ["activite_physique"],
    section: "Activité Physique"
  },
  {
    id: "mv_type_activite",
    question: "Quel type d'activité pratiquez-vous majoritairement ?",
    type: "text",
    tooltip: "Le type d'activité renseigne sur la sollicitation métabolique (cardio vs force vs souplesse).",
    weight: 1,
    tags: ["type_activite"],
    section: "Activité Physique"
  },
  {
    id: "mv_fatigue_effort",
    question: "Vous sentez-vous épuisé après un effort physique modéré ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Une fatigue excessive à l'effort peut indiquer un déficit en cortisol ou thyroïde.",
    weight: 3,
    tags: ["epuisement_effort", "hypo_cortico", "hypo_thyro"],
    section: "Activité Physique"
  },

  // ==========================================
  // 5. ENVIRONNEMENT & STRESS QUOTIDIEN
  // ==========================================
  {
    id: "mv_exposition_soleil",
    question: "Vous exposez-vous régulièrement à la lumière naturelle/soleil ?",
    type: "boolean",
    tooltip: "L'exposition solaire régule la mélatonine, la vitamine D et les rythmes circadiens.",
    weight: 2,
    tags: ["regulation_circadienne"],
    section: "Environnement"
  },
  {
    id: "mv_ecrans_soir",
    question: "Utilisez-vous des écrans le soir (< 2h avant coucher) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La lumière bleue des écrans perturbe la mélatonine et retarde l'endormissement.",
    weight: 2,
    tags: ["perturbation_melatonine"],
    section: "Environnement"
  },
  {
    id: "mv_niveau_stress_percu",
    question: "Comment évaluez-vous votre niveau de stress quotidien ?",
    type: "scale_1_5",
    scaleLabels: ["Très faible", "Faible", "Modéré", "Élevé", "Très élevé"],
    tooltip: "Le stress chronique épuise l'axe corticotrope (ACTH/cortisol).",
    weight: 4,
    tags: ["stress_chronique", "epuisement_cortico"],
    section: "Environnement"
  },
  {
    id: "mv_temps_repos",
    question: "Vous accordez-vous régulièrement du temps de repos/relaxation ?",
    type: "boolean",
    tooltip: "Le repos permet la récupération parasympathique et somatotrope.",
    weight: 2,
    tags: ["recuperation_parasympathique"],
    section: "Environnement"
  },
  {
    id: "mv_exposition_pollutants",
    question: "Êtes-vous régulièrement exposé à des polluants (professionnels ou domestiques) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Constamment"],
    tooltip: "Les polluants surchargent le foie et perturbent l'équilibre hormonal (perturbateurs endocriniens).",
    weight: 3,
    tags: ["surcharge_hepatique", "perturbateurs_endocriniens"],
    section: "Environnement"
  }
];

export default ModeVieConfig;
