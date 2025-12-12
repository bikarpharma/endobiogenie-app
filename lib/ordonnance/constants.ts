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
 * Modèle IA premium pour qualité maximale
 */
export const AI_MODEL = "gpt-4.1" as const;

/**
 * PLANTES ENDOBIOGÉNIQUES PAR AXE (Version complète)
 * ===================================================
 * Sources: 4 Volumes "La Théorie de l'Endobiogénie" - Lapraz & Hedayat
 *
 * TERMINOLOGIE:
 * - "insuffisance" = l'axe ne fonctionne pas assez (ancien "hypo")
 * - "sur_sollicitation" = l'axe fonctionne trop/est épuisé (ancien "hyper")
 * - "regulation" = rééquilibrage général
 *
 * Pour la base de données complète, voir: matiere-medicale-endobiogenique.ts
 */
export const PLANTES_PAR_AXE = {
  // ============================================================
  // DRAINAGE (Volume 2, p.169-200)
  // ============================================================
  drainage: {
    hepatique: {
      plantes: ["Taraxacum officinale", "Silybum marianum", "Cynara scolymus", "Chelidonium majus"],
      bourgeons: ["Juniperus communis MG", "Rosmarinus officinalis MG"],
      priorite: "TOUJOURS EN PREMIER si capacité tampon saturée"
    },
    renal: {
      plantes: ["Orthosiphon stamineus", "Solidago virgaurea", "Hieracium pilosella"],
      bourgeons: ["Betula pubescens MG"],
      priorite: "Second émonctoire après le foie"
    },
    lymphatique: {
      plantes: ["Galium aparine", "Phytolacca decandra"],
      bourgeons: ["Juglans regia MG"],
      priorite: "Si œdèmes, ganglions, stase"
    },
    intestinal: {
      plantes: ["Matricaria chamomilla", "Fumaria officinalis"],
      bourgeons: ["Vaccinium vitis-idaea MG"],
      priorite: "Si dysbiose, fermentation"
    }
  },

  // ============================================================
  // AXE CORTICOTROPE (Volume 2, p.89-130) - CHEF D'ORCHESTRE
  // ============================================================
  corticotrope: {
    insuffisance: {
      // Épuisement surrénalien, cortisol bas
      plantes: ["Glycyrrhiza glabra", "Eleutherococcus senticosus", "Rhodiola rosea"],
      bourgeons: ["Ribes nigrum MG", "Quercus pedunculata MG"],
      mecanisme: "Soutenir la fonction corticosurrénale, prolonger demi-vie cortisol"
    },
    sur_sollicitation: {
      // Stress chronique, cortisol chroniquement élevé
      plantes: ["Rhodiola rosea", "Withania somnifera", "Passiflora incarnata"],
      bourgeons: ["Tilia tomentosa MG", "Ficus carica MG"],
      mecanisme: "Moduler l'axe HPA, protéger de l'épuisement"
    },
    alpha_sympatholytiques: {
      // Pour hyperactivité α-sympathique
      plantes: ["Lavandula angustifolia", "Passiflora incarnata", "Valeriana officinalis"],
      bourgeons: ["Tilia tomentosa MG"],
      mecanisme: "Réduire tonus α-adrénergique, calmer stress aigu"
    }
  },

  // ============================================================
  // AXE THYRÉOTROPE (Volume 2, p.131-155)
  // ============================================================
  thyreotrope: {
    insuffisance: {
      // Hypothyroïdie fonctionnelle (Index Thyroïdien < 2)
      plantes: ["Fucus vesiculosus", "Avena sativa"],
      bourgeons: [],
      mecanisme: "Apport iode (Fucus), soutien métabolique (Avena)",
      precautions: ["Vérifier TSH avant Fucus", "CI si Hashimoto actif"]
    },
    sur_sollicitation: {
      // Hyperthyroïdie fonctionnelle (Index Thyroïdien > 4)
      plantes: ["Lycopus europaeus", "Melissa officinalis", "Leonurus cardiaca"],
      bourgeons: [],
      mecanisme: "Freiner TSH et conversion T4→T3, calmer tachycardie",
      precautions: ["Surveillance TSH obligatoire"]
    }
  },

  // ============================================================
  // AXE GONADOTROPE FEMME (Volume 2, p.156-195)
  // ============================================================
  gonadotrope_femme: {
    hyperoestrogenie: {
      // SPM, mastodynies, ménorragies (Index Génital < 0.6)
      plantes: ["Vitex agnus-castus", "Alchemilla vulgaris", "Achillea millefolium"],
      bourgeons: ["Rubus idaeus MG"],
      mecanisme: "↓ Prolactine, ↑ Progestérone relative, rééquilibrer cycle"
    },
    hypooestrogenie: {
      // Ménopause, sécheresse, bouffées de chaleur
      plantes: ["Salvia officinalis", "Actaea racemosa", "Trifolium pratense"],
      bourgeons: ["Vaccinium vitis-idaea MG"],
      mecanisme: "Phytoestrogènes, SERM naturels, ↓ bouffées de chaleur"
    },
    regulation_cycle: {
      // Cycles irréguliers, dysménorrhées
      plantes: ["Vitex agnus-castus", "Alchemilla vulgaris"],
      bourgeons: ["Rubus idaeus MG"],
      mecanisme: "Normaliser phase lutéale, antispasmodique utérin"
    }
  },

  // ============================================================
  // AXE GONADOTROPE HOMME (Volume 2, p.180-195)
  // ============================================================
  gonadotrope_homme: {
    hyperandrogenie_relative: {
      // HBP, conversion DHT, aromatisation
      plantes: ["Serenoa repens", "Urtica dioica (racine)", "Pygeum africanum"],
      bourgeons: ["Sequoia gigantea MG"],
      mecanisme: "Inhiber 5α-réductase, ↓ DHT, ↓ aromatisation"
    },
    hypoandrogenie: {
      // Libido basse, fatigue, érections diminuées
      plantes: ["Tribulus terrestris", "Lepidium meyenii", "Panax ginseng"],
      bourgeons: ["Quercus pedunculata MG", "Sequoia gigantea MG"],
      mecanisme: "↑ LH, ↑ testostérone libre, tonique général"
    }
  },

  // ============================================================
  // SNA - SYSTÈME NERVEUX AUTONOME (Volume 2)
  // ============================================================
  sna: {
    alpha_hyper: {
      // Spasmophilie Type 1, congestion hépato-splanchnique
      plantes: ["Lavandula angustifolia", "Passiflora incarnata", "Valeriana officinalis"],
      bourgeons: ["Tilia tomentosa MG"],
      mecanisme: "α-sympatholytiques + drainage hépatique"
    },
    beta_hyper: {
      // Spasmophilie Type 2, tachycardie, tremblements
      plantes: ["Leonurus cardiaca", "Crataegus monogyna"],
      bourgeons: [],
      mecanisme: "β-bloquants naturels + magnésium"
    },
    parasympathique_insuffisant: {
      // Déficit récupération vagale
      plantes: ["Avena sativa", "Fumaria officinalis"],
      bourgeons: ["Ficus carica MG"],
      mecanisme: "Toniques vagaux, régulateurs neuro-digestifs"
    }
  },

  // ============================================================
  // AXE SOMATOTROPE (Volume 3)
  // ============================================================
  somatotrope: {
    insuffisance: {
      // Cicatrisation lente, fonte musculaire
      plantes: ["Trigonella foenum-graecum", "Medicago sativa"],
      bourgeons: ["Abies alba MG"],
      mecanisme: "Soutien anabolique, reminéralisation"
    },
    sur_sollicitation: {
      // Hypoglycémies, turn-over élevé
      plantes: ["Galega officinalis", "Gymnema sylvestre"],
      bourgeons: [],
      mecanisme: "Régulation insuline, ↓ glycémie"
    }
  },

  // ============================================================
  // IMMUNO-INFLAMMATOIRE (Volume 2-4)
  // ============================================================
  immuno: {
    terrain_atopique: {
      // Allergies, terrain Th2
      plantes: ["Plantago lanceolata", "Desmodium adscendens"],
      bourgeons: ["Ribes nigrum MG", "Carpinus betulus MG"],
      mecanisme: "Anti-histaminique naturel, cortisol-like"
    },
    terrain_auto_immun: {
      // Auto-immunité, terrain Th1, cortisol insuffisant
      plantes: ["Harpagophytum procumbens", "Curcuma longa"],
      bourgeons: ["Ribes nigrum MG", "Vitis vinifera MG"],
      mecanisme: "Anti-inflammatoire + soutien corticotrope"
    },
    infections_recidivantes: {
      // Immunité cellulaire faible
      plantes: ["Echinacea purpurea", "Astragalus membranaceus"],
      bourgeons: ["Rosa canina MG"],
      mecanisme: "Immunostimulant, adaptogène immunitaire"
    },
    terrain_histaminique: {
      // Spasmophilie Type 8 - Terrain allergique avec hyper-réactivité
      // IMPORTANT: Ce terrain nécessite Ribes nigrum + Plantago en priorité
      plantes: ["Plantago lanceolata", "Desmodium adscendens", "Urtica dioica (feuilles)"],
      bourgeons: ["Ribes nigrum MG", "Rosa canina MG", "Cedrus libani MG"],
      mecanisme: "Antihistaminique naturel, stabilisateur mastocytes, cortisol-like"
    }
  }
} as const;

/**
 * SEUILS ENDOBIOGÉNIQUES POUR LES INDEX BdF
 * ==========================================
 * Sources: Volumes 1-4 de "La Théorie de l'Endobiogénie"
 *
 * TERMINOLOGIE CORRIGÉE:
 * - "low" = en dessous de la norme → interprétation spécifique
 * - "high" = au dessus de la norme → interprétation spécifique
 * - Pas de "hypo/hyper" générique car chaque index a sa propre signification
 */
export const SEUILS_BDF = {
  // ============================================================
  // INDEX GÉNITAL (GR/GB) - Volume 1, p.176
  // ============================================================
  indexGenital: {
    low: 0.6,   // < 0.6 = Dominance œstrogénique tissulaire
    high: 0.9,  // > 0.9 = Dominance androgénique tissulaire
    description: "Équilibre Androgènes (GR) vs Œstrogènes (GB)"
  },

  // ============================================================
  // INDEX GÉNITO-THYROÏDIEN (NEUT/LYMPH) - Volume 1, p.178
  // ============================================================
  indexGenitoThyroidien: {
    low: 1.5,   // < 1.5 = Dominance TSH/Thyroïde (terrain atopique)
    high: 2.5,  // > 2.5 = Dominance Œstrogènes/FSH (auto-immunité)
    description: "Équilibre Œstrogènes (Neut) vs TSH (Lymph)"
  },

  // ============================================================
  // INDEX D'ADAPTATION (EOS/MONO) - Volume 1, p.179
  // ============================================================
  indexAdaptation: {
    low: 0.3,   // < 0.3 = Risque auto-immun (cortisol insuffisant)
    high: 0.8,  // > 0.8 = Risque atopique (ACTH hyperactif)
    description: "Équilibre ACTH/Cortisol (Eos) vs FSH/Œstrogènes (Mono)"
  },

  // ============================================================
  // INDEX THYROÏDIEN (LDH/CPK) - Volume 1, p.181
  // ============================================================
  indexThyroidien: {
    low: 2.0,   // < 2.0 = Hypothyroïdie fonctionnelle
    high: 4.0,  // > 4.0 = Hyperthyroïdie fonctionnelle
    description: "Activité métabolique T3/T4 périphérique"
  },

  // ============================================================
  // RENDEMENT THYROÏDIEN ((LDH/CPK)/TSH) - Volume 3
  // ============================================================
  rendementThyroidien: {
    low: 0.8,   // < 0.8 = Rendement bas (risque hypertrophie)
    high: 2.0,  // > 2.0 = Rendement élevé (risque inflammation muqueuse)
    description: "Efficacité périphérique vs stimulation centrale"
  },

  // ============================================================
  // INDEX STARTER (IML/IMP) - Volume 2, p.22-25
  // ============================================================
  indexStarter: {
    low: 0.8,   // < 0.8 = Hyper α-adaptatif + β bloqué (spasmophilie)
    high: 1.2,  // > 1.2 = Sympathique général hyperactif
    description: "Équilibre sympathique α/β - INDEX CLÉ spasmophilie"
  },

  // ============================================================
  // IMP - Index Mobilisation Plaquettes - Volume 2, p.35-38
  // ============================================================
  indexMobilisationPlaquettes: {
    low: 0.8,   // < 0.8 = β-sympathique bloqué
    high: 1.2,  // > 1.2 = β-sympathique hyperactif
    description: "Mobilisation plaquettes depuis rate (β-sympathique)"
  },

  // ============================================================
  // IML - Index Mobilisation Leucocytes - Volume 2, p.29-34
  // ============================================================
  indexMobilisationLeucocytes: {
    low: 0.9,   // < 0.9 = Flux hépatique → splanchnique
    high: 1.1,  // > 1.1 = Congestion hépatique
    description: "Mobilisation leucocytes depuis lit splanchnique (α-sympathique)"
  },

  // ============================================================
  // INDEX ŒSTROGÉNIQUE (TSH/OSTEO) - Volume 1, p.183
  // ============================================================
  indexOestrogenique: {
    low: 0.03,  // < 0.03 = Faible activité pro-croissance
    high: 0.08, // > 0.08 = Forte activité pro-croissance (risque prolifératif)
    description: "Activité métabolique des œstrogènes"
  },

  // ============================================================
  // INDEX TURN-OVER (TSH × PAOi) - Volume 1, p.182
  // ============================================================
  turnover: {
    low: 50,    // < 50 = Renouvellement lent
    high: 100,  // > 100 = Turn-over accéléré
    description: "Vitesse renouvellement tissulaire global"
  },

  // ============================================================
  // INDEX REMODELAGE OSSEUX (PAOi/CA) - Volume 4
  // ============================================================
  remodelageOsseux: {
    low: 2.0,   // < 2.0 = Remodelage faible
    high: 5.0,  // > 5.0 = Os sur-sollicité
    description: "Degré renouvellement osseux adaptatif"
  },

  // ============================================================
  // RATIO CORTISOL/CORTEX SURRÉNALIEN - Volume 2, p.72-76
  // ============================================================
  ratioCortisol: {
    low: 2.0,   // < 2.0 = Androgènes surrénaliens prédominants
    optimal: 2.5, // 2-3 = Optimal
    high: 3.0,  // > 3.0 = Cortisol excessif
    description: "Efficacité cortisol vs activité cortex surrénalien"
  },

  // ============================================================
  // INDEX CAPACITÉ TAMPON HÉPATIQUE - Volume 1, p.22-23
  // ============================================================
  capaciteTampon: {
    low: 0.3,   // < 0.3 = Capacité préservée
    high: 0.8,  // > 0.8 = Saturation hépatique → DRAINAGE
    description: "Capacité tampon du foie - Indicateur de drainage"
  },

  // ============================================================
  // INDEX MINÉRALOCORTICOÏDE (NA/K) - Volume 1, p.180
  // ============================================================
  indexMineralo: {
    low: 28,    // < 28 = Hypominéralocorticisme
    high: 34,   // > 34 = Hyperminéralocorticisme
    description: "Activité aldostérone"
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

/**
 * LISTE BLANCHE DES BOURGEONS VALIDES EN GEMMOTHÉRAPIE
 * =====================================================
 * Source: RAG/gemmo/gemmotherapie-complete.json (46 bourgeons uniques)
 *
 * IMPORTANT: Seules ces plantes peuvent avoir type="gemmo" et forme="MG"
 * Toute autre plante avec forme="MG" est une ERREUR de l'IA
 *
 * Utilisé par therapeuticReasoning.ts pour valider les recommandations
 */
export const BOURGEONS_VALIDES = {
  // Liste des noms latins valides (lowercase pour matching)
  nomsLatins: [
    "betula pubescens",      // Bouleau pubescent
    "ribes nigrum",          // Cassis
    "vaccinium vitis-idaea", // Airelle
    "prunus amygdalus",      // Amandier
    "cercis siliquastrum",   // Arbre de Judée
    "hippophae rhamnoides",  // Argousier
    "crataegus",             // Aubépine (genre)
    "crataegus monogyna",    // Aubépine monogyne
    "crataegus oxyacantha",  // Aubépine épineuse
    "alnus glutinosa",       // Aulne glutineux
    "calluna vulgaris",      // Bruyère
    "cedrus",                // Cèdre (genre)
    "cedrus libani",         // Cèdre du Liban
    "carpinus betulus",      // Charme
    "quercus",               // Chêne (genre)
    "quercus robur",         // Chêne pédonculé
    "quercus pedunculata",   // Chêne pédonculé (syn.)
    "citrus limon",          // Citronnier
    "cornus sanguinea",      // Cornouiller sanguin
    "rosa canina",           // Églantier
    "acer campestre",        // Érable champêtre
    "ficus carica",          // Figuier
    "rubus idaeus",          // Framboisier
    "fraxinus excelsior",    // Frêne
    "juniperus communis",    // Genévrier
    "ginkgo biloba",         // Ginkgo
    "fagus sylvatica",       // Hêtre
    "syringa vulgaris",      // Lilas
    "zea mays",              // Maïs (radicelles)
    "aesculus hippocastanum",// Marronnier
    "vaccinium myrtillus",   // Myrtillier
    "corylus avellana",      // Noisetier
    "juglans regia",         // Noyer
    "olea europaea",         // Olivier
    "ulmus campestris",      // Orme
    "populus nigra",         // Peuplier noir
    "pinus",                 // Pin (genre)
    "pinus sylvestris",      // Pin sylvestre
    "platanus orientalis",   // Platane
    "malus communis",        // Pommier
    "malus domestica",       // Pommier (syn.)
    "rosmarinus officinalis",// Romarin
    "salvia rosmarinus",     // Romarin (nouveau nom)
    "rubus fruticosus",      // Ronce
    "abies pectinata",       // Sapin pectiné
    "abies alba",            // Sapin blanc (syn.)
    "salix alba",            // Saule blanc
    "secale cereale",        // Seigle (radicelles)
    "sequoia gigantea",      // Séquoia
    "sequoiadendron giganteum", // Séquoia (syn.)
    "sorbus domestica",      // Sorbier
    "tamarix gallica",       // Tamaris
    "tilia tomentosa",       // Tilleul argenté
    "tilia cordata",         // Tilleul à petites feuilles
    "vitis vinifera",        // Vigne
    "ampelopsis veitchii",   // Vigne vierge
    "viburnum lantana",      // Viorne
  ],

  // Noms français pour affichage et matching alternatif
  nomsFrancais: [
    "bouleau", "cassis", "airelle", "amandier", "arbre de judée",
    "argousier", "aubépine", "aulne", "bruyère", "cèdre",
    "charme", "chêne", "citronnier", "cornouiller", "églantier",
    "érable", "figuier", "framboisier", "frêne", "genévrier",
    "ginkgo", "hêtre", "lilas", "maïs", "marronnier",
    "myrtillier", "noisetier", "noyer", "olivier", "orme",
    "peuplier", "pin", "platane", "pommier", "romarin",
    "ronce", "sapin", "saule", "seigle", "séquoia",
    "sorbier", "tamaris", "tilleul", "vigne", "vigne vierge", "viorne"
  ]
};

/**
 * Vérifie si une substance est un bourgeon valide
 * @param substance - Nom latin ou français de la substance
 * @returns true si c'est un bourgeon valide, false sinon
 */
export function isValidBourgeon(substance: string): boolean {
  const normalized = substance.toLowerCase().trim();

  // Vérifier dans les noms latins
  if (BOURGEONS_VALIDES.nomsLatins.some(nom =>
    normalized.includes(nom) || nom.includes(normalized)
  )) {
    return true;
  }

  // Vérifier dans les noms français
  if (BOURGEONS_VALIDES.nomsFrancais.some(nom =>
    normalized.includes(nom) || nom.includes(normalized)
  )) {
    return true;
  }

  return false;
}

// ========================================
// FILTRAGE PAR SEXE - SÉCURITÉ MÉDICALE
// ========================================
//
// PROBLÈME: L'IA peut recommander des plantes spécifiques au sexe opposé
// Ex: Framboisier (Rubus idaeus) pour la fonction ovarienne → INTERDIT chez l'homme
//
// SOLUTION: Double couche de protection (Option A + B)
// - Option A: Blacklist ici dans constants.ts
// - Option B: Filtrage dans therapeuticReasoning.ts

/**
 * PLANTES RÉSERVÉES AUX FEMMES - INTERDITES CHEZ L'HOMME
 * ======================================================
 * Ces plantes agissent sur le système hormonal féminin:
 * - Fonction ovarienne
 * - Cycle menstruel
 * - Ménopause
 * - Progestérone-like
 */
export const PLANTES_FEMMES_ONLY = [
  // Gemmothérapie
  "rubus idaeus",           // Framboisier - fonction ovarienne, cycle menstruel
  "vaccinium vitis-idaea",  // Airelle rouge - régulation hormonale féminine

  // Phytothérapie
  "vitex agnus-castus",     // Gattilier - régulation cycle, mastodynies, SPM
  "alchemilla vulgaris",    // Alchémille - progestérone-like, ménorragies
  "cimicifuga racemosa",    // Actée à grappes noires - ménopause
  "actaea racemosa",        // Actée à grappes noires (syn.)
  "trifolium pratense",     // Trèfle rouge - phytoestrogènes
  "salvia officinalis",     // Sauge officinale - bouffées de chaleur, ménopause
  "angelica sinensis",      // Angélique chinoise (Dong Quai) - tonique utérin
  "glycine max",            // Soja (isoflavones) - phytoestrogènes
  "medicago sativa",        // Luzerne - phytoestrogènes (à forte dose)
  "achillea millefolium",   // Achillée millefeuille - troubles menstruels
  "capsella bursa-pastoris",// Bourse à pasteur - hémorragies utérines
  "artemisia vulgaris",     // Armoise commune - emménagogue
  "leonurus cardiaca",      // Agripaume - SPM (usage féminin principal)
] as const;

/**
 * PLANTES RÉSERVÉES AUX HOMMES - INTERDITES CHEZ LA FEMME
 * =======================================================
 * Ces plantes agissent sur le système hormonal masculin:
 * - Prostate
 * - Testostérone
 * - 5-alpha-réductase
 */
export const PLANTES_HOMMES_ONLY = [
  // Gemmothérapie
  "sequoia gigantea",         // Séquoia - fonction prostatique, vitalité masculine
  "sequoiadendron giganteum", // Séquoia (syn.)

  // Phytothérapie
  "serenoa repens",           // Palmier nain (Saw palmetto) - HBP, inhibiteur 5α-réductase
  "sabal serrulata",          // Palmier nain (syn.)
  "pygeum africanum",         // Prunier d'Afrique - HBP
  "prunus africana",          // Prunier d'Afrique (syn.)
  "epilobium parviflorum",    // Épilobe à petites fleurs - prostate
  "epilobium angustifolium",  // Épilobe en épi - prostate
  "urtica dioica",            // Ortie racine - HBP (racine seulement, pas feuilles)
  "cucurbita pepo",           // Courge (pépins) - prostate
  "tribulus terrestris",      // Tribule - testostérone, libido masculine
  "lepidium meyenii",         // Maca - vitalité masculine
  "eurycoma longifolia",      // Tongkat Ali - testostérone
  "turnera diffusa",          // Damiana - aphrodisiaque masculin
  "panax ginseng",            // Ginseng asiatique - vitalité masculine (CI femme enceinte)
] as const;

/**
 * Type pour le sexe du patient
 */
export type SexePatient = "M" | "F" | "H";

/**
 * Vérifie si une substance est appropriée pour le sexe du patient
 *
 * @param substance - Nom latin ou français de la substance
 * @param sexe - Sexe du patient ("M" ou "H" = Homme, "F" = Femme)
 * @returns { appropriate: boolean, reason?: string }
 *
 * IMPORTANT: Cette fonction est la PREMIÈRE LIGNE DE DÉFENSE (Option A)
 */
export function isPlanteSexeAppropriate(
  substance: string,
  sexe: SexePatient
): { appropriate: boolean; reason?: string } {
  const normalized = substance.toLowerCase().trim();
  const isHomme = sexe === "M" || sexe === "H";

  // Vérifier si c'est une plante réservée aux femmes
  for (const planteFemme of PLANTES_FEMMES_ONLY) {
    if (normalized.includes(planteFemme) || planteFemme.includes(normalized)) {
      if (isHomme) {
        return {
          appropriate: false,
          reason: `${substance} est réservé aux femmes (fonction hormonale féminine)`
        };
      }
    }
  }

  // Vérifier si c'est une plante réservée aux hommes
  for (const planteHomme of PLANTES_HOMMES_ONLY) {
    if (normalized.includes(planteHomme) || planteHomme.includes(normalized)) {
      if (!isHomme) {
        return {
          appropriate: false,
          reason: `${substance} est réservé aux hommes (fonction prostatique/testostérone)`
        };
      }
    }
  }

  return { appropriate: true };
}

/**
 * Filtre une liste de substances pour un sexe donné
 *
 * @param substances - Liste de noms de substances
 * @param sexe - Sexe du patient
 * @returns Liste filtrée avec les substances inappropriées retirées
 */
export function filterSubstancesBySexe(
  substances: string[],
  sexe: SexePatient
): { filtered: string[]; removed: Array<{ substance: string; reason: string }> } {
  const filtered: string[] = [];
  const removed: Array<{ substance: string; reason: string }> = [];

  for (const substance of substances) {
    const check = isPlanteSexeAppropriate(substance, sexe);
    if (check.appropriate) {
      filtered.push(substance);
    } else {
      removed.push({ substance, reason: check.reason || "Inapproprié pour ce sexe" });
    }
  }

  return { filtered, removed };
}
