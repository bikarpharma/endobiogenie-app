import type { QuestionConfig } from "../types";

/**
 * AXE DIGESTIF (REFONTE EXPERTE)
 * -------------------------------------------------
 * Évalue l'ensemble du tractus digestif avec précision clinique :
 * - Estomac : Hypo (atonie) vs Hyper (reflux/irritation)
 * - Foie/Pancréas : Insuffisance biliaire vs pancréatique
 * - Microbiote : Fermentation haute (SIBO) vs putréfaction basse
 * - Transit : Constipation vs diarrhée
 * - Perméabilité intestinale
 *
 * SPÉCIFICITÉ : Toutes les questions utilisent scale_1_5 pour précision diagnostique
 */

const AxeDigestifConfig: QuestionConfig[] = [
  // ==========================================
  // 1. ESTOMAC (Le "Mixeur")
  // ==========================================
  {
    id: "dig_estomac_lourdeur",
    question: "Ressentez-vous une lourdeur d'estomac durable après les repas (impression de 'pierre') ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'hypochlorhydrie ou de manque de tonus gastrique (Hypo-alpha).",
    weight: 2,
    scoreDirection: "hypo",
    section: "Estomac"
  },
  {
    id: "dig_estomac_reflux",
    question: "Avez-vous des brûlures, renvois acides ou RGO (surtout couché) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'irritation muqueuse ou de béance du cardia (souvent lié au stress).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Estomac"
  },
  {
    id: "dig_estomac_eructations",
    question: "Avez-vous beaucoup d'éructations (rots) pendant ou juste après le repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Aérophagie par manger trop vite (Sympathique) ou fermentation gastrique immédiate.",
    weight: 1,
    scoreDirection: "hyper",
    section: "Estomac"
  },

  // ==========================================
  // 2. PANCÉAS & FOIE (Les "Sucs")
  // ==========================================
  {
    id: "dig_foie_graisses",
    question: "Êtes-vous écœuré par les graisses ou les digérez-vous mal (selles grasses, nausées) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Indique une insuffisance de sécrétion biliaire ou une stase vésiculaire.",
    weight: 3,
    scoreDirection: "hypo",
    section: "Foie & Pancréas"
  },
  {
    id: "dig_pancreas_somnolence",
    question: "Avez-vous un 'coup de barre' irrésistible (envie de dormir) 1h après le repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe majeur de fatigue du pancréas exocrine (et insulino-résistance).",
    weight: 3,
    scoreDirection: "hypo",
    section: "Foie & Pancréas"
  },
  {
    id: "dig_foie_reveil_nocturne",
    question: "Vous réveillez-vous souvent entre 1h et 3h du matin ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'heure du foie en chronobiologie. Signe de surcharge hépatique nocturne.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Foie & Pancréas"
  },
  {
    id: "dig_foie_bouche_amere",
    question: "Avez-vous la bouche pâteuse ou amère le matin au réveil ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Reflux de bile ou surcharge toxémique.",
    weight: 1,
    scoreDirection: "hyper",
    section: "Foie & Pancréas"
  },

  // ==========================================
  // 3. INTESTIN GRÊLE & MICROBIOTE
  // ==========================================
  {
    id: "dig_grele_ballonnement_immediat",
    question: "Votre ventre gonfle-t-il TOUT DE SUITE après le repas (bide de femme enceinte) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de fermentation haute (SIBO) ou de déficit enzymatique.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Intestin & Microbiote"
  },
  {
    id: "dig_colon_ballonnement_tardif",
    question: "Les ballonnements arrivent-ils plus tard (fin de journée) avec des gaz odorants ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de putréfaction colique (dysbiose basse).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Intestin & Microbiote"
  },
  {
    id: "dig_douleurs_spasmes",
    question: "Avez-vous des douleurs type 'coups de poignard' ou spasmes qui se déplacent ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Côlon spasmodique, lié à une dystonie neurovégétative (Stress).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Intestin & Microbiote"
  },

  // ==========================================
  // 4. TRANSIT & ÉLIMINATION
  // ==========================================
  {
    id: "dig_transit_constipation",
    question: "Êtes-vous constipé (selles dures, moins d'une fois par jour) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Ralentissement du péristaltisme (Thyroïde ?) ou manque d'hydratation.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Transit"
  },
  {
    id: "dig_transit_diarrhee",
    question: "Avez-vous tendance aux selles molles, mal formées ou explosives ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Accélération du transit (Stress, Hyperthyroïdie) ou malabsorption.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Transit"
  },
  {
    id: "dig_intolerances",
    question: "Pensez-vous avoir des intolérances alimentaires (Gluten, Lait, FODMAPs) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Indice de porosité intestinale (Leaky Gut) et d'inflammation de bas grade.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Transit"
  }
];

export default AxeDigestifConfig;
