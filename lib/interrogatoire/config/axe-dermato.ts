import type { QuestionConfig } from "../types";

/**
 * AXE DERMATOLOGIQUE (MIROIR MÉTABOLIQUE) - NIVEAU EXPERT
 * -------------------------------------------------
 * La peau comme révélateur des déséquilibres internes :
 * - Texture & Hydratation (Thyroïde & Estrogènes)
 * - Sébum & Acné (Androgènes & Foie)
 * - Cheveux & Ongles (Phanères)
 * - Vascularisation & Cicatrisation (Cortisol)
 *
 * SPÉCIFICITÉ : Chaque signe cutané renvoie à un axe hormonal ou métabolique précis
 */

const AxeDermatoConfig: QuestionConfig[] = [
  // ==========================================
  // 1. TEXTURE & HYDRATATION (Thyroïde & Estrogènes)
  // ==========================================
  {
    id: "derm_peau_seche_corps",
    question: "Avez-vous la peau du corps très sèche, voire squameuse (peau de lézard) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe majeur d'hypothyroïdie tissulaire (baisse de l'activité des glandes sébacées).",
    weight: 3,
    scoreDirection: "hypo",
    section: "Texture & Hydratation"
  },
  {
    id: "derm_talons_fendilles",
    question: "Avez-vous les talons fendillés ou la peau des coudes très épaisse ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hyperkératose par ralentissement métabolique (Thyroïde) ou carence en Vitamine A.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Texture & Hydratation"
  },
  {
    id: "derm_secheresse_muqueuses",
    question: "Avez-vous les yeux secs ou la bouche sèche (besoin de boire pour parler) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Sécheresse des muqueuses : Signe de Sympathique Alpha (inhibition) ou Syndrome sec (auto-immun).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Texture & Hydratation"
  },

  // ==========================================
  // 2. SÉBUM & ACNÉ (Androgènes & Foie)
  // ==========================================
  {
    id: "derm_acne_visage",
    question: "Avez-vous de l'acné sur le bas du visage (mâchoires/menton) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Zone de projection hormonale gonadique (souvent liée au cycle ou Ovaires Polykystiques).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Sébum & Acné"
  },
  {
    id: "derm_acne_dos",
    question: "Avez-vous de l'acné dans le dos ou sur le thorax ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'une forte imprégnation androgénique ou d'une surcharge hépatique d'élimination.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Sébum & Acné"
  },
  {
    id: "derm_cheveux_gras",
    question: "Vos cheveux graissent-ils très vite (besoin de laver tous les jours) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'hyperséborrhée est un marqueur de sensibilité aux androgènes ou de résistance à l'insuline.",
    weight: 1,
    scoreDirection: "hyper",
    section: "Sébum & Acné"
  },

  // ==========================================
  // 3. CHEVEUX & ONGLES (Phanères)
  // ==========================================
  {
    id: "derm_chute_diffuse",
    question: "Perdez-vous vos cheveux par poignées (partout sur la tête) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Effluvium télogène : Souvent lié à un stress récent, une hypothyroïdie ou une carence en fer.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Cheveux & Ongles"
  },
  {
    id: "derm_chute_androgenique",
    question: "Votre chevelure s'affine-t-elle sur le dessus ou les golfes (tempes) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Alopécie androgénétique : Sensibilité excessive des follicules à la DHT (Testostérone).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Cheveux & Ongles"
  },
  {
    id: "derm_ongles_taches",
    question: "Avez-vous des taches blanches sur les ongles ?",
    type: "boolean",
    tooltip: "Leuconychie : Carence en Zinc relative (souvent liée à la croissance ou immunité).",
    weight: 1,
    scoreDirection: "hypo",
    section: "Cheveux & Ongles"
  },
  {
    id: "derm_ongles_stries",
    question: "Vos ongles sont-ils striés dans la longueur ou cassants ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Stries longitudinales = Épuisement surrénalien ou vieillissement métabolique.",
    weight: 1,
    scoreDirection: "hypo",
    section: "Cheveux & Ongles"
  },

  // ==========================================
  // 4. VASCULARISATION & CICATRISATION (Cortisol)
  // ==========================================
  {
    id: "derm_bleus_faciles",
    question: "Faites-vous des 'bleus' (ecchymoses) pour un moindre choc ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Fragilité capillaire. Signe d'excès de cortisol (peau fine) ou manque de Vitamine C.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_cicatrisation_lente",
    question: "Une petite plaie met-elle très longtemps à cicatriser ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le cortisol en excès bloque la synthèse de collagène et ralentit la réparation.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Vascularisation & Cicatrisation"
  },
  {
    id: "derm_demangeaisons",
    question: "Avez-vous des démangeaisons (prurit) ou la peau qui marque quand on la gratte ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Dermographisme : Terrain histaminique (allergique) ou surcharge hépatique.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Vascularisation & Cicatrisation"
  }
];

export default AxeDermatoConfig;
