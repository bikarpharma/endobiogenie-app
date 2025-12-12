import type { QuestionConfig } from "../types";

/**
 * AXE TERRAINS PATHOLOGIQUES - NOUVEAU MODULE
 * Évalue les prédispositions et terrains favorisant les pathologies
 * 
 * TOTAL : 42 questions
 * - Priority 1 (ESSENTIEL) : 12 questions
 * - Priority 2 (IMPORTANT) : 18 questions
 * - Priority 3 (OPTIONNEL) : 12 questions
 */

const AxeTerrainsPathologiquesConfig: QuestionConfig[] = [
  // ==========================================
  // I. TEMPÉRAMENT CONSTITUTIONNEL (SNA)
  // ==========================================
  {
    id: "terr_temperament_global",
    question: "Comment décririez-vous votre tempérament général ?",
    type: "select",
    options: [
      "Calme, posé, introverti (Vagotonique)",
      "Anxieux, sensible, émotif (Alpha)",
      "Énergique, actif, extraverti (Bêta)",
      "Irritable, variable, difficile à calmer (Spasmophile)",
      "Variable selon les périodes"
    ],
    tooltip: "Le tempérament est déterminé génétiquement et reflète la prédominance du système nerveux autonome.",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Tempérament Constitutionnel",
    tags: ["temperament", "sna", "pack_essentiel", "constitutionnel"]
  },
  {
    id: "terr_sommeil_enfance",
    question: "Comment dormiez-vous dans l'enfance ?",
    type: "select",
    options: [
      "Très bien, longtemps (Vagotonique)",
      "Difficulté à se calmer, réveils fréquents (Alpha)",
      "Agité, enlevait les couvertures (Bêta)",
      "Habitudes irrégulières (Spasmophile)",
      "Ne sait pas"
    ],
    tooltip: "L'architecture du sommeil de l'enfance reflète le tempérament génétique du système nerveux autonome.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Tempérament Constitutionnel",
    tags: ["sommeil", "enfance", "temperament"]
  },
  {
    id: "terr_comportement_intestinal",
    question: "Quel était votre comportement intestinal dans l'enfance ?",
    type: "select",
    options: [
      "Selles fréquentes et molles (Vagotonique)",
      "Constipé, selles dures (Alpha)",
      "Défécation fréquente ou rapide (Bêta)",
      "Coliques, consistance/fréquence irrégulière (Spasmophile)",
      "Ne sait pas"
    ],
    tooltip: "Le comportement intestinal de l'enfance traduit la tendance autonome constitutionnelle.",
    weight: 2,
    priority: 3,
    scoreDirection: "neutral",
    section: "Tempérament Constitutionnel",
    tags: ["intestin", "enfance", "temperament"]
  },
  {
    id: "terr_vagotonie",
    question: "Présentez-vous des signes vagotoniques (salivation excessive, sueurs, larmoiement facile) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "La vagotonie (hyper-para-sympathique) favorise les veines variqueuses, la gastrite, les diarrhées, l'aérophagie.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Tempérament Constitutionnel",
    tags: ["vagotonie", "para", "sna"]
  },
  {
    id: "terr_sympathicotonie",
    question: "Présentez-vous des signes sympathicotoniques (anxiété, émotivité, constipation spasmodique) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "La sympathicotonie (hyper-alpha) favorise l'anxiété, l'ulcère gastrique, la constipation, l'herpès, le psoriasis.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Tempérament Constitutionnel",
    tags: ["sympathicotonie", "alpha", "sna"]
  },

  // ==========================================
  // II. SPASMOPHILIE
  // ==========================================
  {
    id: "terr_spasmophilie",
    question: "Présentez-vous des signes de spasmophilie (crampes, spasmes, paresthésies) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "La spasmophilie = dysfonction SNA + mauvaise gestion du calcium. C'est le terrain précritique de nombreux troubles.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["spasmophilie", "crampes", "pack_essentiel"]
  },
  {
    id: "terr_attaques_panique",
    question: "Avez-vous des attaques de panique ou une anxiété intense soudaine ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Fréquemment"],
    tooltip: "Les attaques de panique sont une manifestation psychiatrique de la spasmophilie avec bêta bloqué ou retardé.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["panique", "anxiete", "pack_essentiel", "spasmophilie"]
  },
  {
    id: "terr_lipothymie",
    question: "Avez-vous des sensations de malaise (déréalisation, impression de perte de conscience imminente) ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Fréquemment"],
    tooltip: "La lipothymie (pré-syncope) est un signe de spasmophilie psycho-neurologique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["lipothymie", "malaise", "spasmophilie"]
  },
  {
    id: "terr_paresthesies",
    question: "Avez-vous des paresthésies (fourmillements, engourdissements des extrémités) ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Fréquemment"],
    tooltip: "Les paresthésies résultent de la mauvaise gestion du calcium libre malgré une calcémie normale.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["paresthesies", "calcium", "spasmophilie"]
  },
  {
    id: "terr_spasmes_digestifs",
    question: "Avez-vous des spasmes digestifs (coliques, aérophagie, dyskinésie biliaire) ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Fréquemment"],
    tooltip: "Les spasmes digestifs sont une manifestation gastro-intestinale de la spasmophilie.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Spasmophilie",
    tags: ["spasmes", "digestif", "spasmophilie"]
  },

  // ==========================================
  // III. TERRAIN PRÉCRITIQUE
  // ==========================================
  {
    id: "terr_infections_recidivantes",
    question: "Avez-vous des infections récidivantes (ORL, urinaires, pulmonaires) ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Chroniquement"],
    tooltip: "Les infections récidivantes traduisent un terrain précritique infectieux avec incompétence endocrino-immunitaire.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Terrain Précritique",
    tags: ["infections", "recidivantes", "pack_essentiel", "precritique"]
  },
  {
    id: "terr_inflammation_chronique",
    question: "Présentez-vous des signes d'inflammation chronique bas grade (douleurs diffuses, fatigue, CRP élevée) ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun", "Légers", "Modérés", "Importants", "Très importants"],
    tooltip: "L'inflammation chronique bas grade est un terrain précritique pour les maladies cardiovasculaires, auto-immunes et dégénératives.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Terrain Précritique",
    tags: ["inflammation", "chronique", "pack_essentiel", "precritique"]
  },
  {
    id: "terr_congestion_hepatique",
    question: "Présentez-vous des signes de congestion hépatique (nausées matinales, intolérance aux graisses, haleine chargée) ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun", "Légers", "Modérés", "Importants", "Très importants"],
    tooltip: "La congestion hépatique appelle la peau en relais (eczéma, acné). En cas de doute, il faut drainer.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Terrain Précritique",
    tags: ["foie", "congestion", "pack_essentiel", "emonctoire"]
  },
  {
    id: "terr_congestion_pelvienne",
    question: "Présentez-vous des signes de congestion pelvienne (hémorroïdes, varices, lourdeur pelvienne) ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun", "Légers", "Modérés", "Importants", "Très importants"],
    tooltip: "La congestion pelvienne favorise la prostatite, la cystite et les hémorroïdes. Le drainage pelvien est essentiel.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Terrain Précritique",
    tags: ["pelvis", "congestion", "pack_essentiel", "stagnation"]
  },
  {
    id: "terr_dysbiose",
    question: "Présentez-vous des signes de dysbiose (ballonnements, flatulences, intolérances alimentaires multiples) ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun", "Légers", "Modérés", "Importants", "Très importants"],
    tooltip: "La dysbiose est un terrain précritique pour les allergies, maladies auto-immunes et inflammation chronique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Terrain Précritique",
    tags: ["dysbiose", "intestin", "permeabilite"]
  },

  // ==========================================
  // IV. TERRAIN CRITIQUE ET AUTO-IMMUN
  // ==========================================
  {
    id: "terr_auto_immun",
    question: "Avez-vous une maladie auto-immune diagnostiquée ?",
    type: "select",
    options: [
      "Non",
      "Thyroïdite (Hashimoto, Basedow)",
      "Polyarthrite rhumatoïde",
      "MICI (Crohn, RCH)",
      "Sclérose en plaques",
      "Autre maladie auto-immune"
    ],
    tooltip: "Les maladies auto-immunes = terrain critique avec hyper-fonctionnement immunitaire et incapacité de cicatrisation.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Terrain Critique & Auto-Immun",
    tags: ["auto_immun", "pack_essentiel", "critique"]
  },
  {
    id: "terr_allergies_multiples",
    question: "Avez-vous des allergies multiples (alimentaires, respiratoires, cutanées) ?",
    type: "select",
    options: ["Aucune", "1-2 allergies", "3-5 allergies", "Nombreuses", "Très nombreuses"],
    tooltip: "Les allergies multiples traduisent un terrain hyper-immun avec demande d'histamine augmentée.",
    weight: 3,
    priority: 1,
    scoreDirection: "hyper",
    section: "Terrain Critique & Auto-Immun",
    tags: ["allergies", "histamine", "pack_essentiel", "hyper_immun"]
  },
  {
    id: "terr_eczema_psoriasis",
    question: "Avez-vous de l'eczéma ou du psoriasis ?",
    type: "select",
    options: ["Non", "Eczéma", "Psoriasis", "Les deux", "Antécédent guéri"],
    tooltip: "Eczéma = terrain hyper-immun + congestion foie. Psoriasis = hyper-para + hyper-alpha.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Terrain Critique & Auto-Immun",
    tags: ["eczema", "psoriasis", "peau", "emonctoire"]
  },
  {
    id: "terr_asthme",
    question: "Avez-vous de l'asthme ?",
    type: "select",
    options: ["Non", "Asthme allergique (extrinsèque)", "Asthme non allergique (intrinsèque)", "Les deux", "Antécédent guéri"],
    tooltip: "L'asthme traduit une spasmophilie des voies aériennes avec para↑, alpha↑, bêta bloqué ou retardé.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Terrain Critique & Auto-Immun",
    tags: ["asthme", "spasmophilie", "respiratoire"]
  },

  // ==========================================
  // V. TERRAIN PROLIFÉRATIF ET TUMORAL
  // ==========================================
  {
    id: "terr_tumeurs_benignes",
    question: "Avez-vous des tumeurs bénignes (fibromes, kystes, polypes, adénomes) ?",
    type: "select",
    options: [
      "Non",
      "Fibromes utérins",
      "Kystes (ovariens, mammaires, autres)",
      "Polypes (intestinaux, nasaux)",
      "Adénome prostatique",
      "Plusieurs types"
    ],
    tooltip: "Les tumeurs bénignes = terrain prolifératif avec croissance anarchique. La vigne limite ces développements.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Terrain Prolifératif",
    tags: ["tumeur", "benigne", "pack_essentiel", "proliferatif"]
  },
  {
    id: "terr_cancer_personnel",
    question: "Avez-vous un antécédent personnel de cancer ?",
    type: "boolean",
    tooltip: "Un antécédent de cancer indique un terrain critique ayant abouti à la prolifération maligne.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Terrain Prolifératif",
    tags: ["cancer", "antecedent", "critique"]
  },
  {
    id: "terr_cancer_familial",
    question: "Y a-t-il des cancers dans votre famille proche (parents, fratrie) ?",
    type: "select",
    options: [
      "Non",
      "1 cas",
      "2-3 cas",
      "Plus de 3 cas",
      "Syndrome familial connu"
    ],
    tooltip: "Les antécédents familiaux de cancer indiquent un terrain prolifératif héréditaire.",
    weight: 2,
    priority: 1,
    scoreDirection: "hypo",
    section: "Terrain Prolifératif",
    tags: ["cancer", "famille", "pack_essentiel", "hereditaire"]
  },
  {
    id: "terr_verrues_molluscum",
    question: "Avez-vous des verrues ou molluscum récidivants ?",
    type: "boolean",
    tooltip: "Les verrues récidivantes indiquent un terrain immunitaire déficient face aux virus.",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Terrain Prolifératif",
    tags: ["verrues", "virus", "immunite"]
  },

  // ==========================================
  // VI. TERRAIN DÉGÉNÉRATIF
  // ==========================================
  {
    id: "terr_degeneratif",
    question: "Présentez-vous des signes de terrain dégénératif (arthrose précoce, cataracte, vieillissement accéléré) ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun", "Légers", "Modérés", "Importants", "Très importants"],
    tooltip: "Le terrain dégénératif résulte de la consommation chronique de la capacité tampon par la spasmophilie latente.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Terrain Dégénératif",
    tags: ["degeneratif", "vieillissement", "capacite_tampon"]
  },
  {
    id: "terr_calcifications",
    question: "Avez-vous des calcifications anormales (tendons, artères, articulations) ?",
    type: "boolean",
    tooltip: "Les calcifications des tissus mous résultent d'une hypercalcémie fonctionnelle (mauvaise gestion du calcium).",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Terrain Dégénératif",
    tags: ["calcification", "calcium", "degeneratif"]
  },
  {
    id: "terr_sclerose",
    question: "Avez-vous une tendance à la sclérose tissulaire (fibrose, cicatrisation excessive) ?",
    type: "boolean",
    tooltip: "La sclérose/fibrose traduit une cicatrisation excessive. La ronce lutte contre la fibrose et le durcissement tissulaire.",
    weight: 2,
    priority: 3,
    scoreDirection: "hypo",
    section: "Terrain Dégénératif",
    tags: ["sclerose", "fibrose", "ronce"]
  },

  // ==========================================
  // VII. TERRAIN ADAPTATIF ET ÉPUISEMENT
  // ==========================================
  {
    id: "terr_fatigue_adaptative",
    question: "Présentez-vous une fatigue chronique inexpliquée ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Constamment"],
    tooltip: "La fatigue chronique traduit un épuisement de la capacité adaptative et de la réponse corticotrope.",
    weight: 3,
    priority: 1,
    scoreDirection: "hypo",
    section: "Terrain Adaptatif",
    tags: ["fatigue", "adaptation", "pack_essentiel", "epuisement"]
  },
  {
    id: "terr_sensibilite_stress",
    question: "Êtes-vous particulièrement sensible au stress ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Peu", "Modérément", "Beaucoup", "Extrêmement"],
    tooltip: "La sensibilité au stress traduit une capacité tampon réduite. Le même stresseur induit des troubles différents selon le terrain.",
    weight: 2,
    priority: 2,
    scoreDirection: "hyper",
    section: "Terrain Adaptatif",
    tags: ["stress", "sensibilite", "capacite_tampon"]
  },
  {
    id: "terr_recuperation_lente",
    question: "Récupérez-vous lentement après une maladie ou un effort ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Une récupération lente indique une capacité adaptative insuffisante (axe somatotrope).",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Terrain Adaptatif",
    tags: ["recuperation", "somatotrope", "restauration"]
  },
  {
    id: "terr_aggravation_saisonniere",
    question: "Vos symptômes s'aggravent-ils à certaines saisons ?",
    type: "select",
    options: [
      "Non",
      "Printemps (allergies, relance thyréotrope)",
      "Automne (bronchites, préparation hivernale)",
      "Hiver (dépression, fatigue)",
      "Été",
      "Transitions saisonnières"
    ],
    tooltip: "L'aggravation saisonnière traduit une désadaptation chronobiologique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Terrain Adaptatif",
    tags: ["saison", "chronobiologie", "adaptation"]
  },

  // ==========================================
  // VIII. TERRAIN HÉRÉDITAIRE ET FAMILIAL
  // ==========================================
  {
    id: "terr_terrain_familial",
    question: "Quel est le terrain pathologique dominant dans votre famille ?",
    type: "select",
    options: [
      "Pas de terrain particulier",
      "Cardiovasculaire (HTA, infarctus, AVC)",
      "Métabolique (diabète, obésité)",
      "Auto-immun (thyroïdite, PR, MICI)",
      "Allergique/Atopique (asthme, eczéma)",
      "Psychiatrique (dépression, anxiété)",
      "Tumoral (cancers multiples)"
    ],
    tooltip: "Le terrain familial traduit une prédisposition génétique et épigénétique.",
    weight: 3,
    priority: 1,
    scoreDirection: "neutral",
    section: "Terrain Héréditaire",
    tags: ["famille", "hereditaire", "pack_essentiel", "genetique"]
  },
  {
    id: "terr_maladies_meme_famille",
    question: "Plusieurs membres de votre famille ont-ils les mêmes maladies ?",
    type: "boolean",
    tooltip: "La répétition des mêmes maladies dans une famille confirme un terrain héréditaire.",
    weight: 2,
    priority: 2,
    scoreDirection: "neutral",
    section: "Terrain Héréditaire",
    tags: ["famille", "repetition", "terrain"]
  },
  {
    id: "terr_endometriose_famille",
    question: "[Femmes] Y a-t-il de l'endométriose ou des fibromes dans votre famille ?",
    type: "select",
    options: ["Non concerné", "Non", "Oui (1 cas)", "Oui (plusieurs cas)"],
    tooltip: "L'endométriose et les fibromes ont une composante héréditaire avec terrain prolifératif.",
    weight: 2,
    priority: 3,
    scoreDirection: "neutral",
    section: "Terrain Héréditaire",
    tags: ["endometriose", "fibrome", "femme", "hereditaire"]
  },

  // ==========================================
  // IX. TERRAIN MÉTABOLIQUE
  // ==========================================
  {
    id: "terr_resistance_insuline",
    question: "Présentez-vous des signes de résistance à l'insuline (tour de taille élevé, glycémie limite, fatigue post-prandiale) ?",
    type: "scale_1_5",
    scaleLabels: ["Aucun", "Légers", "Modérés", "Importants", "Très importants"],
    tooltip: "La résistance à l'insuline = terrain précritique du diabète et syndrome métabolique.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Terrain Métabolique",
    tags: ["insuline", "resistance", "metabolique"]
  },
  {
    id: "terr_syndrome_metabolique",
    question: "Avez-vous un syndrome métabolique (obésité abdominale + HTA + dyslipidémie + hyperglycémie) ?",
    type: "boolean",
    tooltip: "Le syndrome métabolique = terrain corticotrope et somatotrope déséquilibré.",
    weight: 2,
    priority: 2,
    scoreDirection: "hypo",
    section: "Terrain Métabolique",
    tags: ["syndrome_metabolique", "corticotrope", "somatotrope"]
  },
  {
    id: "terr_hypoglycemie_reactive",
    question: "Avez-vous des hypoglycémies réactionnelles (malaise, sueurs, tremblements après les repas) ?",
    type: "select",
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Fréquemment"],
    tooltip: "L'hypoglycémie réactionnelle traduit une susceptibilité à l'hypoglycémie avec insuline élevée.",
    weight: 2,
    priority: 3,
    scoreDirection: "hyper",
    section: "Terrain Métabolique",
    tags: ["hypoglycemie", "insuline", "reactive"]
  }
];

export default AxeTerrainsPathologiquesConfig;