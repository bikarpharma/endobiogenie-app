import type { QuestionConfig } from "../types";

/**
 * AXE MODE DE VIE - NOUVEAU MODULE
 * Évalue les facteurs de mode de vie impactant le terrain neuroendocrinien
 * 
 * TOTAL : 35 questions
 * - Priority 1 (ESSENTIEL) : 10 questions
 * - Priority 2 (IMPORTANT) : 15 questions
 * - Priority 3 (OPTIONNEL) : 10 questions
 */

const AxeModeDeVieConfig: QuestionConfig[] = [
  // ==========================================
  // I. ARCHITECTURE DU SOMMEIL
  // ==========================================
  {
    id: "vie_sommeil_qualite",
    question: "Comment évaluez-vous la qualité générale de votre sommeil ?",
    type: "scale_1_5",
    scaleLabels: ["Très mauvaise", "Mauvaise", "Moyenne", "Bonne", "Excellente"],
    tooltip: "La qualité du sommeil reflète l'intégration neuroendocrinienne et chronobiologique. Un sommeil non réparateur traduit un déséquilibre du SNA et/ou une insuffisance de la restauration somatotrope.",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Architecture du Sommeil",
    tags: ["sommeil", "neuroendocrinien", "pack_essentiel"]
  },
  {
    id: "vie_sommeil_heure_coucher",
    question: "À quelle heure vous couchez-vous habituellement ?",
    type: "select",
    options: ["Avant 22h", "22h-23h", "23h-minuit", "Après minuit", "Variable/irrégulier"],
    tooltip: "L'endormissement avant minuit est essentiel à l'intégration circadienne. Rester éveillé au-delà de minuit perturbe le cycle anabolique nocturne.",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Architecture du Sommeil",
    tags: ["sommeil", "circadien", "pack_essentiel"]
  },
  {
    id: "vie_sommeil_duree",
    question: "Combien d'heures dormez-vous en moyenne par nuit ?",
    type: "select",
    options: ["Moins de 5h", "5-6h", "6-7h", "7-8h", "Plus de 8h"],
    tooltip: "La durée optimale est de 6,5-8h par nuit. Un sommeil trop court compromet la restauration anabolique. Un sommeil excessif peut indiquer une insuffisance thyroïdienne.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Architecture du Sommeil",
    tags: ["sommeil", "duree"]
  },
  {
    id: "vie_sommeil_endormissement",
    question: "Avez-vous des difficultés à vous endormir ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les difficultés d'endormissement traduisent un excès alpha-sympathique empêchant la transition vers le para-sympathique nécessaire au sommeil.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Architecture du Sommeil",
    tags: ["sommeil", "endormissement", "alpha"]
  },
  {
    id: "vie_sommeil_reveils",
    question: "Vous réveillez-vous fréquemment pendant la nuit ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les réveils nocturnes traduisent une instabilité du SNA ou une fonction émonctorielle. Les réveils vers 3-4h indiquent un pic prématuré de cortisol.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Architecture du Sommeil",
    tags: ["sommeil", "reveils", "emonctoire"]
  },
  {
    id: "vie_sommeil_reves",
    question: "Comment sont vos rêves ?",
    type: "select",
    options: ["Pas de souvenirs", "Rêves calmes occasionnels", "Rêves fréquents et calmes", "Rêves vifs et agités", "Cauchemars fréquents"],
    tooltip: "Les rêves vifs indiquent une TRH élevée. Les cauchemars traduisent un hyper-alpha ou un stress non résolu.",
    weight: 1,
    priority: 3,
    scoreDirection: "neutral",
    section: "Architecture du Sommeil",
    tags: ["sommeil", "reves", "trh"]
  },
  {
    id: "vie_sommeil_reveil_fatigue",
    question: "Vous réveillez-vous fatigué(e) même après une nuit complète ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Un réveil fatigué traduit un sommeil non réparateur. La GHRH et la GH régulent la restauration des tissus et le sommeil non-REM réparateur.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Architecture du Sommeil",
    tags: ["sommeil", "fatigue", "somatotrope"]
  },

  // ==========================================
  // II. ALIMENTATION
  // ==========================================
  {
    id: "vie_alimentation_equilibre",
    question: "Comment évaluez-vous l'équilibre général de votre alimentation ?",
    type: "scale_1_5",
    scaleLabels: ["Très déséquilibrée", "Déséquilibrée", "Moyenne", "Équilibrée", "Très équilibrée"],
    tooltip: "L'alimentation est la meilleure source de nutriments pour la santé. Les nutriments en groupes complémentaires optimisent leur absorption et distribution.",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Alimentation",
    tags: ["alimentation", "equilibre", "pack_essentiel"]
  },
  {
    id: "vie_alimentation_repas",
    question: "Combien de repas principaux prenez-vous par jour ?",
    type: "select",
    options: ["1 repas", "2 repas", "3 repas", "Plus de 3 repas", "Grignotage fréquent"],
    tooltip: "Le nombre et volume des repas affectent l'optimisation de la digestion. Le grignotage maintient l'insuline élevée et empêche le catabolisme physiologique.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Alimentation",
    tags: ["alimentation", "repas", "insuline"]
  },
  {
    id: "vie_envies_sucre",
    question: "Avez-vous des envies fréquentes de sucré ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les fringales de sucre indiquent une susceptibilité à l'hypoglycémie et une résistance à l'insuline. Les envies traduisent des demandes du terrain ou des carences.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Alimentation",
    tags: ["alimentation", "sucre", "pack_essentiel", "insuline"]
  },
  {
    id: "vie_alimentation_laitages",
    question: "Consommez-vous beaucoup de produits laitiers ?",
    type: "select",
    options: ["Jamais", "Rarement", "Modérément", "Souvent", "Quotidiennement"],
    tooltip: "Les laitages favorisent la production de mucus via le pancréas exocrine. Ils peuvent aggraver les infections ORL récidivantes, l'asthme et les problèmes digestifs.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Alimentation",
    tags: ["alimentation", "laitages", "mucus"]
  },
  {
    id: "vie_alimentation_gluten",
    question: "Consommez-vous beaucoup de gluten (pain, pâtes, blé) ?",
    type: "select",
    options: ["Jamais", "Rarement", "Modérément", "Souvent", "Quotidiennement"],
    tooltip: "Le gluten peut favoriser la production de mucus et solliciter le pancréas exocrine. En cas de perméabilité intestinale, il peut aggraver l'inflammation chronique.",
    weight: 2,
    priority: 3,
    scoreDirection: "neutral",
    section: "Alimentation",
    tags: ["alimentation", "gluten", "pancreas"]
  },
  {
    id: "vie_alimentation_fibres",
    question: "Consommez-vous suffisamment de fibres (légumes, fruits, céréales complètes) ?",
    type: "select",
    options: ["Très peu", "Peu", "Modérément", "Assez", "Beaucoup"],
    tooltip: "Les aliments riches en fibres favorisent un transit régulier et nourrissent le microbiote. Ils sont essentiels au traitement de la constipation chronique.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Alimentation",
    tags: ["alimentation", "fibres", "transit"]
  },
  {
    id: "vie_hydratation",
    question: "Buvez-vous suffisamment d'eau (1,5-2L/jour) ?",
    type: "select",
    options: ["Très peu (<0.5L)", "Peu (0.5-1L)", "Modérément (1-1.5L)", "Suffisamment (1.5-2L)", "Beaucoup (>2L)"],
    tooltip: "L'hydratation est essentielle au drainage rénal et à la fonction émonctorielle. Une hydratation insuffisante favorise la constipation et la congestion des émonctoires.",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Alimentation",
    tags: ["hydratation", "rein", "pack_essentiel"]
  },

  // ==========================================
  // III. EXERCICE PHYSIQUE
  // ==========================================
  {
    id: "vie_exercice_frequence",
    question: "À quelle fréquence pratiquez-vous une activité physique ?",
    type: "select",
    options: ["Jamais", "Rarement (<1x/semaine)", "1-2x/semaine", "3-4x/semaine", "Quotidiennement"],
    tooltip: "L'exercice favorise le drainage cardio-lymphatique et l'équilibrage neuroendocrinien. Les activités insuffisantes nécessitent de l'exercice, les activités en excès une réduction.",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Exercice Physique",
    tags: ["exercice", "drainage", "pack_essentiel"]
  },
  {
    id: "vie_exercice_type",
    question: "Quel type d'exercice pratiquez-vous principalement ?",
    type: "select",
    options: ["Aucun", "Marche légère", "Cardio (jogging, natation)", "Musculation", "Yoga/Tai Chi/Qi Gong", "Mixte"],
    tooltip: "Exercice aérobique : endurance, drainage cardio-lymphatique. Isotonique : développement musculaire. Méditatif : intégration dynamique esprit-corps.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Exercice Physique",
    tags: ["exercice", "type"]
  },
  {
    id: "vie_exercice_exces",
    question: "Pratiquez-vous un exercice intense au-delà de vos capacités ?",
    type: "select",
    options: ["Non", "Rarement", "Parfois", "Souvent", "Régulièrement"],
    tooltip: "Faire du sport au-dessus de ses capacités sollicite excessivement l'axe corticotrope et peut épuiser le terrain.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Exercice Physique",
    tags: ["exercice", "exces", "corticotrope"]
  },
  {
    id: "vie_sedentarite",
    question: "Passez-vous plus de 6h assis par jour (travail, écrans) ?",
    type: "select",
    options: ["Non", "Parfois", "Souvent", "Quotidiennement"],
    tooltip: "La sédentarité favorise la congestion pelvienne, la stagnation lymphatique et le déséquilibre métabolique. Elle aggrave la constipation et les problèmes prostatiques.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Exercice Physique",
    tags: ["sedentarite", "congestion"]
  },

  // ==========================================
  // IV. TOXIQUES ET SUBSTANCES
  // ==========================================
  {
    id: "vie_tabac",
    question: "Fumez-vous ou avez-vous fumé ?",
    type: "select",
    options: ["Jamais fumé", "Ex-fumeur (>5 ans)", "Ex-fumeur (<5 ans)", "Fumeur occasionnel", "Fumeur quotidien"],
    tooltip: "Le tabac sollicite l'alpha-sympathique, congestionne les émonctoires pulmonaires et favorise l'inflammation chronique.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Toxiques & Substances",
    tags: ["tabac", "toxique", "pack_essentiel"]
  },
  {
    id: "vie_alcool",
    question: "Quelle est votre consommation d'alcool ?",
    type: "select",
    options: ["Jamais", "Occasionnel (social)", "1-2 verres/jour", "3-4 verres/jour", "Plus de 4 verres/jour"],
    tooltip: "L'alcool sollicite le foie comme émonctoire. Une consommation excessive surcharge le système de détoxification hépatique et favorise la dysbiose.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Toxiques & Substances",
    tags: ["alcool", "toxique", "pack_essentiel", "foie"]
  },
  {
    id: "vie_cafe",
    question: "Combien de cafés consommez-vous par jour ?",
    type: "select",
    options: ["Aucun", "1-2 cafés", "3-4 cafés", "Plus de 4 cafés"],
    tooltip: "Le café stimule l'alpha-sympathique et le cortisol. Une consommation excessive peut aggraver l'anxiété et les troubles du sommeil.",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Toxiques & Substances",
    tags: ["cafe", "alpha", "cortisol"]
  },
  {
    id: "vie_ecrans_soir",
    question: "Utilisez-vous des écrans le soir avant le coucher ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La lumière bleue des écrans inhibe la mélatonine et maintient l'alpha-sympathique élevé, perturbant l'endormissement.",
    weight: 2,
    priority: 1,
    scoreDirection: "hyper",
    section: "Toxiques & Substances",
    tags: ["ecrans", "sommeil", "pack_essentiel", "alpha"]
  },

  // ==========================================
  // V. STRESS ET ÉQUILIBRE PSYCHO-ÉMOTIONNEL
  // ==========================================
  {
    id: "vie_stress_chronique",
    question: "Vivez-vous actuellement un stress chronique ?",
    type: "select",
    options: ["Aucun", "Léger", "Modéré", "Important", "Très important"],
    tooltip: "Le stress chronique sollicite l'axe corticotrope et peut créer un terrain d'épuisement adaptatif. Il favorise les infections récidivantes et les troubles digestifs.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Stress & Équilibre",
    tags: ["stress", "corticotrope", "pack_essentiel"]
  },
  {
    id: "vie_colere",
    question: "Vous mettez-vous facilement en colère ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "La colère facile traduit un excès alpha-sympathique ou une irritabilité liée au stress.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Stress & Équilibre",
    tags: ["colere", "alpha", "stress"]
  },
  {
    id: "vie_anxiete",
    question: "Ressentez-vous de l'anxiété au quotidien ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Constamment"],
    tooltip: "L'anxiété chronique traduit un déséquilibre alpha-sympathique avec activation excessive du système d'adaptation.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Stress & Équilibre",
    tags: ["anxiete", "alpha", "sna"]
  },
  {
    id: "vie_relaxation",
    question: "Pratiquez-vous des techniques de relaxation ?",
    type: "select",
    options: ["Jamais", "Rarement", "Occasionnellement", "Régulièrement", "Quotidiennement"],
    tooltip: "Les techniques méditatives (Yoga, Tai Chi, Qi Gong) favorisent l'intégration esprit-corps et la cohérence neuroendocrinienne.",
    weight: 2,
    priority: 3,
    scoreDirection: "neutral",
    section: "Stress & Équilibre",
    tags: ["relaxation", "meditation", "sna"]
  },
  {
    id: "vie_satisfaction_professionnelle",
    question: "Êtes-vous satisfait(e) de votre vie professionnelle ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Peu", "Moyennement", "Assez", "Très satisfait"],
    tooltip: "L'insatisfaction professionnelle chronique peut maintenir un état de stress et solliciter l'axe corticotrope.",
    weight: 1,
    priority: 3,
    scoreDirection: "neutral",
    section: "Stress & Équilibre",
    tags: ["professionnel", "stress", "adulte"]
  },

  // ==========================================
  // VI. RYTHME CIRCADIEN ET CHRONOBIOLOGIE
  // ==========================================
  {
    id: "vie_horaires_reguliers",
    question: "Avez-vous des horaires de vie réguliers (repas, coucher, lever) ?",
    type: "select",
    options: ["Très irréguliers", "Irréguliers", "Variables", "Assez réguliers", "Très réguliers"],
    tooltip: "La régularité des horaires favorise l'intégration circadienne et chronobiologique. Les changements de rythme épuisent la fonction surrénalienne.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Rythme Circadien",
    tags: ["circadien", "regularite"]
  },
  {
    id: "vie_sieste",
    question: "Faites-vous des siestes régulièrement ?",
    type: "select",
    options: ["Jamais", "Rarement", "Occasionnellement", "Régulièrement (courtes)", "Régulièrement (longues >1h)"],
    tooltip: "Les siestes courtes (20-30 min) aident à l'intégration circadienne. Des siestes longues et fréquentes peuvent indiquer une insuffisance thyroïdienne.",
    weight: 1,
    priority: 3,
    scoreDirection: "neutral",
    section: "Rythme Circadien",
    tags: ["sieste", "circadien"]
  },
  {
    id: "vie_saison_sensible",
    question: "Êtes-vous particulièrement sensible aux changements de saison ?",
    type: "select",
    options: ["Pas du tout", "Peu", "Modérément", "Assez", "Très sensible"],
    tooltip: "La sensibilité saisonnière traduit une adaptation chronobiologique difficile. Printemps = relance thyréotrope. Automne = préparation hivernale.",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Rythme Circadien",
    tags: ["saison", "chronobiologie", "adaptation"]
  },
  {
    id: "vie_jet_lag",
    question: "Voyagez-vous fréquemment avec décalage horaire ?",
    type: "select",
    options: ["Non", "Rarement (1-2x/an)", "Occasionnellement (3-5x/an)", "Fréquemment (>5x/an)"],
    tooltip: "Les changements de fuseau horaire épuisent la fonction surrénalienne et peuvent déclencher des infections.",
    weight: 1,
    priority: 3,
    scoreDirection: "hypo",
    section: "Rythme Circadien",
    tags: ["voyage", "jet_lag", "surrenale"]
  }
];

export default AxeModeDeVieConfig;