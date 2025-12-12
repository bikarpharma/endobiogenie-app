import type { QuestionConfig } from "../types";

/**
 * AXE CARDIO-MÉTABOLIQUE
 * ======================
 * 
 * AUDITÉ LE 03/12/2024 - Conforme à la méthodologie endobiogénique
 * 
 * Évalue les 4 composantes du système cardiovasculaire et métabolique :
 * - CŒUR & ARTÈRES : La pompe, la tension, l'oxygénation
 * - RETOUR VEINEUX : La stase, la congestion, les varices
 * - FOIE & SPLANCHNIQUE : Le carrefour métabolique
 * - MÉTABOLISME : Glucose, insuline, lipides (Syndrome X)
 * 
 * SPÉCIFICITÉ : Combine évaluation fonctionnelle et risque métabolique
 * 
 * Total : 24 questions (11 originales + 13 ajoutées)
 */

const AxeCardioMetaboConfig: QuestionConfig[] = [
  // ==========================================
  // SECTION 1 : CŒUR & ARTÈRES
  // ==========================================
  {
    id: "cardio_hta",
    question: "Avez-vous une tension artérielle élevée (diagnostiquée ou traitée) ?",
    type: "select",
    options: ["Non", "Limite haute (13-14/8-9)", "Modérée (14-16/9-10)", "Élevée (>16/10)", "Sous traitement"],
    tooltip: "L'hypertension reflète souvent une rigidité artérielle (athérosclérose), une hyperactivité du système rénine-angiotensine-aldostérone, ou une hyper-sollicitation surrénalienne. Elle peut aussi être d'origine rénale ou thyroïdienne.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "hta"],
    section: "Cœur & Artères"
  },
  {
    id: "cardio_hypotension_ortho",
    question: "Avez-vous des vertiges ou 'voiles noirs' en vous levant brusquement ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'hypotension orthostatique est un signe majeur de faiblesse surrénalienne (déficit d'adaptation vasculaire par manque de cortisol et d'aldostérone). Elle peut aussi indiquer une déshydratation ou un traitement antihypertenseur excessif.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "hypotension", "surrenale"],
    section: "Cœur & Artères"
  },
  {
    id: "cardio_palpitations",
    question: "Ressentez-vous des palpitations (cœur qui bat fort, vite ou irrégulièrement) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les palpitations peuvent être d'origine neurovégétative (stress, café, alcool), thyroïdienne (hyperthyroïdie), ou cardiaque vraie (arythmie, extrasystoles). Elles sont fréquentes dans la spasmophilie et l'anxiété.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "arythmie", "sna"],
    section: "Cœur & Artères"
  },
  {
    id: "cardio_essoufflement_effort",
    question: "Êtes-vous essoufflé anormalement vite à l'effort (monter 2 étages) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'essoufflement à l'effort peut indiquer une réserve cardiaque faible, une mauvaise oxygénation tissulaire (anémie), un déconditionnement physique, ou une pathologie pulmonaire. À différencier de l'essoufflement au repos (plus grave).",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hypo",
    tags: ["pack_essentiel", "cardio", "oxygenation"],
    section: "Cœur & Artères"
  },
  {
    id: "cardio_douleur_thoracique",
    question: "Ressentez-vous des douleurs ou oppressions thoraciques à l'effort ou au stress ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les douleurs thoraciques à l'effort peuvent être d'origine coronarienne (angor), œsophagienne (reflux), musculo-squelettique, ou anxieuse (spasmophilie). Toute douleur thoracique récente à l'effort doit être explorée.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "angor", "urgence"],
    section: "Cœur & Artères"
  },
  {
    id: "cardio_pouls_repos",
    question: "Connaissez-vous votre fréquence cardiaque au repos ?",
    type: "select",
    options: ["< 50 bpm (bradycardie)", "50-60 bpm (sportif)", "60-80 bpm (normal)", "80-100 bpm (élevé)", "> 100 bpm (tachycardie)", "Je ne sais pas"],
    tooltip: "La fréquence cardiaque de repos est un marqueur de santé cardiovasculaire. Une FC basse (<60) peut indiquer une bonne forme physique ou une hypothyroïdie. Une FC élevée (>80) au repos peut indiquer un stress chronique, une hyperthyroïdie ou un déconditionnement.",
    weight: 2,
    priority: 2, // IMPORTANT
    tags: ["frequence_cardiaque", "sna"],
    section: "Cœur & Artères"
  },

  // ==========================================
  // SECTION 2 : RETOUR VEINEUX
  // ==========================================
  {
    id: "cardio_jambes_lourdes",
    question: "Avez-vous les jambes lourdes, surtout le soir ou par temps chaud ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'insuffisance veineuse fonctionnelle se manifeste par des jambes lourdes, aggravées par la chaleur et la station debout prolongée. Elle est souvent liée à une prédominance œstrogénique ou à une congestion pelvienne.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["insuffisance_veineuse", "congestion"],
    section: "Retour Veineux"
  },
  {
    id: "cardio_oedemes",
    question: "Vos chevilles sont-elles gonflées le soir (marque de la chaussette) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'œdème vespéral des chevilles indique une stase veineuse et lymphatique. Si présent le matin au réveil, il oriente vers une cause rénale ou cardiaque. L'œdème du soir uniquement est plutôt veineux.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["oedeme", "insuffisance_veineuse"],
    section: "Retour Veineux"
  },
  {
    id: "cardio_varices",
    question: "Avez-vous des varices visibles sur les jambes ?",
    type: "select",
    options: ["Non", "Petites varicosités (télangiectasies)", "Varices modérées", "Varices importantes", "Varices traitées/opérées"],
    tooltip: "Les varices sont le signe d'une insuffisance valvulaire veineuse. Elles sont favorisées par la station debout, les grossesses, l'hérédité, et un terrain de congestion pelvienne. Elles traduisent un excès de pression veineuse parasympathique.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["varices", "para_eleve"],
    section: "Retour Veineux"
  },
  {
    id: "cardio_hemorroides",
    question: "Êtes-vous sujet aux crises hémorroïdaires ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les hémorroïdes sont le signe d'une congestion du système porte (foie surchargé) qui se répercute sur le retour veineux rectal. Elles sont aggravées par la constipation, la station assise prolongée et la grossesse.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["hemorroides", "congestion_hepatique"],
    section: "Retour Veineux"
  },
  {
    id: "cardio_raynaud",
    question: "Vos doigts/orteils deviennent-ils blancs puis bleus au froid (phénomène de Raynaud) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le phénomène de Raynaud est un spasme de la microcirculation périphérique (capillaires). Il traduit un terrain spasmophile, une hyperréactivité alpha-sympathique, ou parfois une maladie auto-immune (sclérodermie).",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["raynaud", "spasmophilie", "alpha_hyper"],
    section: "Retour Veineux"
  },

  // ==========================================
  // SECTION 3 : FOIE & CIRCULATION SPLANCHNIQUE
  // ==========================================
  {
    id: "cardio_digestion_graisses",
    question: "Digérez-vous mal les repas gras (lourdeur, nausées, dégoût) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'intolérance aux graisses indique une insuffisance biliaire (cholérèse diminuée) ou une congestion hépatique. Le foie ne produit pas assez de bile ou la vésicule ne l'excrète pas correctement.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["foie", "vesicule", "congestion_hepatique"],
    section: "Foie & Splanchnique"
  },
  {
    id: "cardio_langue_chargee",
    question: "Avez-vous la langue chargée (enduit blanc/jaune) le matin ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La langue chargée au réveil est un signe de stase digestive et de congestion hépatobiliaire. Un enduit blanc oriente vers une congestion de type parasympathique, un enduit jaune vers une surcharge biliaire.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["foie", "congestion_digestive"],
    section: "Foie & Splanchnique"
  },
  {
    id: "cardio_haleine_matin",
    question: "Avez-vous mauvaise haleine au réveil ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'halitose matinale peut indiquer une stase gastrique nocturne, une dysbiose buccale ou intestinale, ou une congestion hépatique. Elle est souvent associée à une langue chargée.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["foie", "dysbiose"],
    section: "Foie & Splanchnique"
  },

  // ==========================================
  // SECTION 4 : MÉTABOLISME (Syndrome X)
  // ==========================================
  {
    id: "metabo_tour_taille",
    question: "Quel est votre tour de taille approximatif ?",
    type: "select",
    options: ["Homme <94cm / Femme <80cm (normal)", "Homme 94-102cm / Femme 80-88cm (limite)", "Homme >102cm / Femme >88cm (élevé)", "Je ne sais pas"],
    tooltip: "Le tour de taille est le marqueur clinique n°1 du syndrome métabolique et de l'insulino-résistance. L'adiposité abdominale (viscérale) est métaboliquement active et libère des cytokines inflammatoires.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "syndrome_metabolique", "insulino_resistance"],
    section: "Métabolisme"
  },
  {
    id: "metabo_gras_abdominal",
    question: "Avez-vous pris du ventre ces dernières années ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Beaucoup", "Considérablement"],
    tooltip: "La prise de graisse abdominale est un signe d'insulino-résistance progressive. Elle est favorisée par le stress chronique (cortisol), la sédentarité, et une alimentation riche en sucres rapides et graisses saturées.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "insulino_resistance"],
    section: "Métabolisme"
  },
  {
    id: "metabo_hypoglycemie",
    question: "Avez-vous des coups de fatigue ou malaises si vous sautez un repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les hypoglycémies réactionnelles (malaise, tremblements, sueurs, irritabilité entre les repas) indiquent un déséquilibre glucagon/insuline. Le pancréas sécrète trop d'insuline en réponse aux sucres rapides.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "hypoglycemie", "insuline"],
    section: "Métabolisme"
  },
  {
    id: "metabo_fringales",
    question: "Avez-vous des fringales sucrées, surtout en fin de journée ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les fringales sucrées témoignent d'une dysrégulation glycémique : le corps réclame du sucre pour compenser les chutes de glycémie. C'est un cercle vicieux qui aggrave l'insulino-résistance.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["fringales", "addiction_sucre"],
    section: "Métabolisme"
  },
  {
    id: "metabo_soif",
    question: "Avez-vous souvent soif ou besoin d'uriner fréquemment ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La polydipsie (soif excessive) et la polyurie (urines fréquentes) sont des signes cardinaux du diabète. L'excès de glucose sanguin provoque une diurèse osmotique et une déshydratation.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["diabete", "polyurie"],
    section: "Métabolisme"
  },
  {
    id: "metabo_cholesterol",
    question: "Avez-vous un cholestérol élevé ou des triglycérides (bilan sanguin) ?",
    type: "select",
    options: ["Non / Normal", "Limite haute", "Cholestérol élevé seul", "Triglycérides élevés seuls", "Les deux élevés", "Sous traitement", "Je ne sais pas"],
    tooltip: "Le cholestérol élevé peut être lié à une hypothyroïdie fonctionnelle (mauvais recyclage du LDL), une surcharge hépatique, ou une alimentation déséquilibrée. Les triglycérides élevés orientent vers un excès de sucres/alcool.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["cholesterol", "triglycerides", "thyroide"],
    section: "Métabolisme"
  },
  {
    id: "metabo_glycemie",
    question: "Avez-vous une glycémie à jeun élevée ou un prédiabète/diabète ?",
    type: "select",
    options: ["Non / Normale (<1g/L)", "Limite (1-1.10 g/L)", "Prédiabète (1.10-1.26 g/L)", "Diabète (>1.26 g/L)", "Diabète traité", "Je ne sais pas"],
    tooltip: "La glycémie à jeun reflète la capacité du foie à réguler le glucose nocturne et la sensibilité à l'insuline. Une glycémie limite haute indique déjà une insulino-résistance débutante.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    tags: ["pack_essentiel", "diabete", "glycemie"],
    section: "Métabolisme"
  },
  {
    id: "metabo_couperose",
    question: "Avez-vous de la couperose ou des rougeurs persistantes sur le visage ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Légèrement", "Modérément", "Marqué", "Très marqué"],
    tooltip: "La couperose (rosacée, télangiectasies faciales) est un signe de fragilité capillaire et souvent de surcharge métabolique 'pléthorique'. Elle est aggravée par l'alcool, les épices, et les variations de température.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    tags: ["couperose", "fragilite_capillaire"],
    section: "Métabolisme"
  },
  {
    id: "metabo_acanthosis",
    question: "Avez-vous des zones de peau épaissie et foncée (cou, aisselles, plis) ?",
    type: "boolean",
    tooltip: "L'acanthosis nigricans (peau épaissie, veloutée, hyperpigmentée dans les plis) est un signe d'insulino-résistance sévère. Elle témoigne d'un excès chronique d'insuline qui stimule la prolifération cutanée.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    tags: ["acanthosis", "insulino_resistance_severe"],
    section: "Métabolisme"
  }
];

export default AxeCardioMetaboConfig;