import type { QuestionConfig } from "../types";

/**
 * AXE IMMUNO-INFLAMMATOIRE (TH1/TH2) - NIVEAU EXPERT
 * -------------------------------------------------
 * Discrimine les 3 terrains immunitaires :
 * - SUSCEPTIBILITÉ INFECTIEUSE (Déficit Th1 / Cortisol)
 * - ATOPIE & ALLERGIES (Excès Th2 / Histamine)
 * - INFLAMMATION & AUTO-IMMUNITÉ (Dérèglement)
 * - ORL & BARRIÈRES (Le Terrain Muqueux)
 *
 * SPÉCIFICITÉ : L'immunité n'est pas binaire (Malade/Pas malade)
 * mais se décline en terrains (Anergique vs Atopique vs Inflammatoire)
 */

const AxeImmunoConfig: QuestionConfig[] = [
  // ==========================================
  // 1. SUSCEPTIBILITÉ INFECTIEUSE (Déficit Th1 / Cortisol)
  // ==========================================
  {
    id: "immu_infections_hiver",
    question: "Attrapez-vous systématiquement tout ce qui traîne (rhumes, grippes) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de faiblesse immunitaire muqueuse (IgA) ou de déficit corticotrope d'adaptation au froid.",
    weight: 3,
    scoreDirection: "hypo",
    section: "Susceptibilité Infectieuse"
  },
  {
    id: "immu_convalescence",
    question: "Mettez-vous beaucoup de temps à vous remettre d'une infection simple ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Indique une mauvaise réponse inflammatoire aiguë (manque de fièvre efficace) ou une fatigue surrénalienne.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Susceptibilité Infectieuse"
  },
  {
    id: "immu_viral_latent",
    question: "Faites-vous des poussées d'Herpès (bouton de fièvre) ou Zona en cas de stress ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Marqueur clé : Le stress (Cortisol) effondre l'immunité cellulaire (Th1) et réveille les virus latents.",
    weight: 3,
    scoreDirection: "hypo",
    section: "Susceptibilité Infectieuse"
  },

  // ==========================================
  // 2. ATOPIE & ALLERGIES (Excès Th2 / Histamine)
  // ==========================================
  {
    id: "immu_rhinite_saison",
    question: "Souffrez-vous de rhinite allergique saisonnière (foins) ou perannuelle (acariens) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hyper-réactivité Th2. Souvent liée à une congestion hépatique (mauvaise dégradation histamine).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Atopie & Allergies"
  },
  {
    id: "immu_eczema_atopique",
    question: "Avez-vous de l'eczéma, de l'urticaire ou des démangeaisons cutanées sans cause claire ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Terrain atopique classique : Peau = miroir de l'équilibre immuno-hépatique.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Atopie & Allergies"
  },
  {
    id: "immu_intolerance_alim",
    question: "Avez-vous des intolérances alimentaires multiples (laitages, gluten, œufs, etc.) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Indice de porosité intestinale (Leaky Gut) et d'hyper-réactivité immune à des antigènes alimentaires.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Atopie & Allergies"
  },

  // ==========================================
  // 3. INFLAMMATION & AUTO-IMMUNITÉ (Dérèglement)
  // ==========================================
  {
    id: "immu_douleurs_articulaires",
    question: "Avez-vous des douleurs articulaires migratrices ou inflammatoires (raideur matinale) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Marqueur d'inflammation de bas grade. Si raideur matinale > 30 min : penser à l'auto-immunité.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Inflammation & Auto-immunité"
  },
  {
    id: "immu_fatigue_chronique",
    question: "Souffrez-vous d'une fatigue inexpliquée, qui ne passe pas avec le repos ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Peut traduire une inflammation systémique silencieuse (cytokines pro-inflammatoires).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Inflammation & Auto-immunité"
  },
  {
    id: "immu_maladie_auto_immune",
    question: "Avez-vous une maladie auto-immune diagnostiquée (Hashimoto, Crohn, Lupus, etc.) ?",
    type: "boolean",
    tooltip: "Confirme un dérèglement structurel de la tolérance immunitaire. Important pour contextualiser le reste.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Inflammation & Auto-immunité"
  },

  // ==========================================
  // 4. ORL & BARRIÈRES (Le Terrain Muqueux)
  // ==========================================
  {
    id: "immu_sinusites",
    question: "Faites-vous régulièrement des sinusites ou rhinopharyngites ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Indicateur de faiblesse des barrières muqueuses et d'un terrain congestif (stase veineuse ORL).",
    weight: 2,
    scoreDirection: "hypo",
    section: "ORL & Barrières"
  },
  {
    id: "immu_angines",
    question: "Êtes-vous sujet aux angines à répétition ou aux ganglions gonflés ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Réactivité lymphatique et vulnérabilité des muqueuses pharyngées (déficit IgA sécrétoires).",
    weight: 2,
    scoreDirection: "hypo",
    section: "ORL & Barrières"
  },
  {
    id: "immu_vaccins_reactions",
    question: "Avez-vous des réactions fortes ou prolongées après vaccination ?",
    type: "boolean",
    tooltip: "Peut indiquer une hyper-réactivité immune (Th2 dominant) ou une fragilité corticotrope.",
    weight: 1,
    scoreDirection: "hyper",
    section: "ORL & Barrières"
  }
];

export default AxeImmunoConfig;
