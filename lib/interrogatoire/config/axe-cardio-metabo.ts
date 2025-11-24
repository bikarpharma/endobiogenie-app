import type { QuestionConfig } from "../types";

/**
 * AXE CARDIO-MÉTABOLIQUE - NIVEAU EXPERT
 * -------------------------------------------------
 * Évalue les 3 composantes du système cardiovasculaire et métabolique :
 * - Tension & Artères (La Pompe)
 * - Retour Veineux (La Stase)
 * - Métabolisme (Le Syndrome X)
 *
 * SPÉCIFICITÉ : Combine évaluation fonctionnelle et risque métabolique à long terme
 */

const AxeCardioMetaboConfig: QuestionConfig[] = [
  // ==========================================
  // 1. TENSION & ARTERES (La Pompe)
  // ==========================================
  {
    id: "cardio_hta",
    question: "Avez-vous une tension artérielle élevée (traitée ou non) ?",
    type: "boolean",
    tooltip: "L'hypertension reflète souvent une rigidité artérielle ou une hyper-sollicitation rénale/surrénalienne.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Tension & Artères"
  },
  {
    id: "cardio_hypotension_ortho",
    question: "Avez-vous des vertiges ou 'voiles noirs' en vous levant brusquement ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hypotension orthostatique : Signe majeur de faiblesse surrénalienne (déficit d'adaptation vasculaire).",
    weight: 2,
    scoreDirection: "hypo",
    section: "Tension & Artères"
  },
  {
    id: "cardio_essoufflement_effort",
    question: "Êtes-vous essoufflé anormalement vite à l'effort (monter 2 étages) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Indique une réserve cardiaque faible ou une mauvaise oxygénation tissulaire.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Tension & Artères"
  },

  // ==========================================
  // 2. RETOUR VEINEUX (La Stase)
  // ==========================================
  {
    id: "cardio_jambes_lourdes",
    question: "Avez-vous les jambes lourdes, surtout le soir ou par temps chaud ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Insuffisance veineuse fonctionnelle. Aggravée par les oestrogènes et la chaleur.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Retour Veineux"
  },
  {
    id: "cardio_oedemes",
    question: "Vos chevilles sont-elles gonflées le soir (marque de la chaussette) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Stase lymphatique et veineuse. Si présent le matin = cause rénale/coeur. Si soir = veineux.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Retour Veineux"
  },
  {
    id: "cardio_hemorroides",
    question: "Êtes-vous sujet aux crises hémorroïdaires ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de congestion du système porte (foie surchargé) qui se répercute sur le retour veineux.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Retour Veineux"
  },
  {
    id: "cardio_extremites_violacees",
    question: "Vos mains/pieds deviennent-ils bleus ou violets au froid (Raynaud) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Spasme de la micro-circulation (capillaires). Terrain spasmophile ou auto-immun.",
    weight: 1,
    scoreDirection: "hyper",
    section: "Retour Veineux"
  },

  // ==========================================
  // 3. MÉTABOLISME (Le Syndrome X)
  // ==========================================
  {
    id: "metabo_gras_abdominal",
    question: "Avez-vous pris du ventre (graisse abdominale) ces dernières années ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Marqueur clinique n°1 de l'insulino-résistance et du syndrome métabolique.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Métabolisme"
  },
  {
    id: "metabo_cholesterol",
    question: "Avez-vous un cholestérol élevé ou des triglycérides (bilan sanguin) ?",
    type: "boolean",
    tooltip: "Souvent lié à une hypothyroïdie fonctionnelle (mauvais recyclage) ou une surcharge hépatique.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Métabolisme"
  },
  {
    id: "metabo_couperose",
    question: "Avez-vous de la couperose ou des rougeurs sur le visage ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de fragilité capillaire et souvent de surcharge métabolique 'pléthorique'.",
    weight: 1,
    scoreDirection: "hyper",
    section: "Métabolisme"
  }
];

export default AxeCardioMetaboConfig;
