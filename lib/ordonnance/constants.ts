// ========================================
// CONSTANTES - Système d'Ordonnances
// ========================================

/**
 * IDs des vectorstores OpenAI
 */
export const VECTORSTORES = {
  endobiogenie: "vs_68e87a07ae6c81918d805c8251526bda", // 6 MB - Endobiogénie vol 1
  phyto: "vs_68feb856fedc81919ef239741143871e",      // 25 MB - Phytothérapie clinique
  gemmo: "vs_68fe63bee4bc8191b2ab5e6813d5bed2",     // 3 MB - Gemmothérapie
  aroma: "vs_68feabf4185c8191afbadcc2cfe972a7",     // 18 MB - Aromathérapie
} as const;

/**
 * Modèle IA optimisé pour rapidité + qualité
 */
export const AI_MODEL = "gpt-4o-mini" as const;

/**
 * Plantes endobiogéniques par axe (références rapides)
 */
export const PLANTES_PAR_AXE = {
  thyroidien: {
    hypo: ["Fucus vesiculosus", "Avena sativa"],
    hyper: ["Lithospermum officinale", "Melissa officinalis"],
  },
  corticotrope: {
    hypo: ["Glycyrrhiza glabra", "Ribes nigrum MG"],
    hyper: ["Rhodiola rosea", "Eleutherococcus senticosus"],
  },
  genital: {
    androgénique: ["Salvia officinalis", "Vitex agnus-castus"],
    oestrogénique: ["Rubus idaeus MG", "Alchemilla vulgaris"],
  },
} as const;

/**
 * Seuils d'alerte pour les index BdF
 */
export const SEUILS_BDF = {
  indexThyroidien: {
    hypo: 2.0,  // < 2.0 = hypométabolisme
    hyper: 3.5, // > 3.5 = hypermétabolisme
  },
  indexAdaptation: {
    hypo: 0.7,  // > 0.7 = orientation FSH/œstrogènes (hypoadaptatif en cortisol)
    hyper: 0.4, // < 0.4 = orientation ACTH/cortisol forte (hyperadaptatif)
  },
  indexGenital: {
    hypo: 550,  // < 550 = empreinte œstrogénique forte
    hyper: 650, // > 650 = empreinte androgénique forte
  },
  indexGenitoThyroidien: {
    hypo: 2.5,  // ≤ 2.5 = demande TSH accrue
    hyper: 3.5, // > 3.5 = réponse thyroïdienne excessive
  },
  indexOestrogenique: {
    hypo: 0.03, // < 0.03 = faible pro-croissance
    hyper: 0.08, // > 0.08 = forte pro-croissance
  },
  turnover: {
    normal: 100,  // ≤ 100 = renouvellement normal
    eleve: 150,   // > 150 = sur-sollicitation importante
  },
  rendementThyroidien: {
    hypo: 0.8,  // < 0.8 = réponse lente
    hyper: 1.5, // > 1.5 = réponse très rapide
  },
  remodelageOsseux: {
    normal: 5.0,  // ≤ 5.0 = remodelage modéré
    eleve: 10.0,  // > 10.0 = remodelage intense
  },
} as const;

/**
 * Messages système par défaut
 */
export const SYSTEM_MESSAGES = {
  chatWelcome: "Bonjour ! Je suis votre assistant endobiogénique. Posez-moi vos questions sur cette ordonnance ou demandez des modifications.",
  generationSuccess: "✅ Ordonnance générée avec succès",
  generationError: "❌ Erreur lors de la génération de l'ordonnance",
  modificationApplied: "✅ Modification appliquée",
  alerteCI: "⚠️ Contre-indication détectée",
  alerteInteraction: "⚠️ Interaction médicamenteuse détectée",
} as const;
