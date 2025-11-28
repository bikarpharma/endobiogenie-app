// ========================================
// MOTEUR DE SCORING ENDOBIOGÉNIQUE V2
// ========================================
//
// PRINCIPES ENDOBIOGÉNIQUES:
// 1. Le terrain n'est PAS hypo/hyper simple
// 2. Il faut évaluer:
//    - L'INSUFFISANCE d'adaptation (l'organisme ne s'adapte pas assez)
//    - La SUR-ADAPTATION (l'organisme s'adapte trop/mal)
//    - La MAL-ADAPTATION (l'organisme s'adapte de travers)
// 3. Les COUPLAGES d'axes sont fondamentaux
// 4. Détecter les TERRAINS pathologiques (atopique, auto-immun, spasmophile)

import { AXES_DEFINITION } from "./config";
import type { AxisKey } from "./config";
import type { QuestionConfig } from "./types";

// ========================================
// TYPES ENDOBIOGÉNIQUES
// ========================================

/**
 * Orientation fonctionnelle d'un axe (terminologie endobiogénique)
 */
export type OrientationEndobiogenique =
  | "insuffisance"      // L'axe ne fonctionne pas assez
  | "sur_sollicitation" // L'axe fonctionne trop / est épuisé
  | "mal_adaptation"    // L'axe fonctionne de travers
  | "equilibre"         // Fonctionnement normal
  | "instabilite";      // Alternance insuffisance/sur-sollicitation

/**
 * Terrains pathologiques détectables
 */
export type TerrainPathologique =
  | "atopique"          // Allergie, terrain Th2, ACTH/cortisol hyperactif
  | "auto_immun"        // Auto-immunité, terrain Th1, cortisol insuffisant
  | "spasmophile"       // Dysfonction SNA (8 types)
  | "congestif"         // Congestion hépato-splanchnique
  | "inflammatoire"     // Inflammation chronique
  | "metabolique"       // Syndrome métabolique, insulino-résistance
  | "proliferatif"      // Tendance hyperplasique
  | "degeneratif";      // Vieillissement accéléré

/**
 * Couplage entre axes
 */
export type CouplageAxe =
  | "cortico_gonadotrope"  // Stress + Hormones sexuelles
  | "gonado_thyreotrope"   // Œstrogènes/TSH
  | "cortico_thyreotrope"  // Cortisol/Thyroïde
  | "sna_corticotrope"     // Sympathique + Surrénales
  | "somato_gonadotrope"   // Croissance + Reproduction
  | "immuno_corticotrope"; // Immunité + Stress

/**
 * Score d'axe endobiogénique (remplace hypo/hyper)
 */
export interface ScoreAxeEndobiogenique {
  // Scores bruts (0-100)
  insuffisance: number;      // Signes d'hypofonctionnement
  surSollicitation: number;  // Signes de sur-stimulation/épuisement

  // Orientation déterminée
  orientation: OrientationEndobiogenique;

  // Intensité (0-10)
  intensite: number;

  // Description clinique
  description: string;

  // Confiance (0-1)
  confiance: number;

  // Symptômes clés détectés
  symptomesCles: string[];
}

/**
 * Analyse complète d'un axe
 */
export interface AnalyseAxeComplete {
  axe: AxisKey;
  score: ScoreAxeEndobiogenique;
  terrainsAssocies: TerrainPathologique[];
  couplagesActifs: CouplageAxe[];
  prioriteTherapeutique: number; // 1-5 (1 = prioritaire)
}

/**
 * Résultat global du scoring
 */
export interface ScoringEndobiogeniqueComplet {
  axes: Record<AxisKey, ScoreAxeEndobiogenique>;
  analysesCompletes: AnalyseAxeComplete[];
  terrainsDetectes: TerrainDetecte[];
  couplagesActifs: CouplageDetecte[];
  syntheseGlobale: SyntheseGlobale;
}

export interface TerrainDetecte {
  terrain: TerrainPathologique;
  score: number; // 0-100
  indicateurs: string[];
  axesImpliques: AxisKey[];
}

export interface CouplageDetecte {
  couplage: CouplageAxe;
  score: number;
  description: string;
}

export interface SyntheseGlobale {
  terrainPrincipal: TerrainPathologique | null;
  axePrioritaire: AxisKey | null;
  capaciteAdaptation: "bonne" | "moderee" | "faible" | "epuisee";
  risqueSpasmophilie: boolean;
  typeSpasmophilie?: number; // 1-8
  recommandationsPrioritaires: string[];
}

// ========================================
// FONCTIONS DE SCORING PAR AXE
// ========================================

/**
 * Calcule le score endobiogénique pour l'axe neurovégétatif (SNA)
 */
function scorerAxeNeuro(answers: Record<string, any>): ScoreAxeEndobiogenique {
  let insuffisance = 0;
  let surSollicitation = 0;
  let maxInsuffisance = 0;
  let maxSurSollicitation = 0;
  const symptomesCles: string[] = [];

  // === INSUFFISANCE PARASYMPATHIQUE (hypoactivité vagale) ===
  if (answers?.sommeil_reveils_fatigue === "oui") {
    insuffisance += 15;
    symptomesCles.push("Réveil fatigué (déficit récupération vagale)");
  }
  maxInsuffisance += 15;

  if (answers?.energie_matin === "mauvaise") {
    insuffisance += 15;
    symptomesCles.push("Énergie matinale basse (tonus vagal insuffisant)");
  }
  maxInsuffisance += 15;

  if (answers?.digestion_lente === "oui") {
    insuffisance += 10;
    symptomesCles.push("Digestion lente (hypovagotonie digestive)");
  }
  maxInsuffisance += 10;

  // === SUR-SOLLICITATION SYMPATHIQUE (hyperactivité α ou β) ===
  if (answers?.sommeil_endormissement_difficile === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Difficulté d'endormissement (α-sympathique hyperactif)");
  }
  maxSurSollicitation += 15;

  if (answers?.sommeil_reveils_nocturnes === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Réveils nocturnes (décharge sympathique)");
  }
  maxSurSollicitation += 15;

  if (answers?.palpitations === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Palpitations (β-sympathique hyperactif)");
  }
  maxSurSollicitation += 15;

  if (answers?.transpiration_excessive === "oui") {
    surSollicitation += 10;
    symptomesCles.push("Transpiration excessive (α-sympathique)");
  }
  maxSurSollicitation += 10;

  if (answers?.frilosite === "oui" && answers?.intolerance_chaleur === "oui") {
    surSollicitation += 10;
    symptomesCles.push("Instabilité thermique (dysautonomie)");
  }
  maxSurSollicitation += 10;

  // Normaliser
  const insNorm = maxInsuffisance > 0 ? (insuffisance / maxInsuffisance) * 100 : 0;
  const surNorm = maxSurSollicitation > 0 ? (surSollicitation / maxSurSollicitation) * 100 : 0;

  return {
    insuffisance: Math.round(insNorm),
    surSollicitation: Math.round(surNorm),
    orientation: determinerOrientation(insNorm, surNorm),
    intensite: Math.round(Math.max(insNorm, surNorm) / 10),
    description: genererDescriptionNeuro(insNorm, surNorm),
    confiance: calculerConfiance(answers, 8),
    symptomesCles
  };
}

/**
 * Calcule le score endobiogénique pour l'axe adaptatif (Corticotrope)
 * L'axe corticotrope est le "chef d'orchestre" de l'organisme
 */
function scorerAxeAdaptatif(answers: Record<string, any>): ScoreAxeEndobiogenique {
  let insuffisance = 0;
  let surSollicitation = 0;
  let maxInsuffisance = 0;
  let maxSurSollicitation = 0;
  const symptomesCles: string[] = [];

  // === INSUFFISANCE CORTICOTROPE (cortisol bas, épuisement) ===
  if (answers?.sensation_epuisement === "oui") {
    insuffisance += 20;
    symptomesCles.push("Épuisement profond (insuffisance corticotrope)");
  }
  maxInsuffisance += 20;

  if (answers?.fatigue_matin === "importante") {
    insuffisance += 15;
    symptomesCles.push("Fatigue matinale intense (pic cortisol absent)");
  }
  maxInsuffisance += 15;

  if (answers?.besoin_stimulants === "oui") {
    insuffisance += 15;
    symptomesCles.push("Besoin de stimulants (compensation corticotrope)");
  }
  maxInsuffisance += 15;

  if (answers?.hypotension_orthostatique === "oui") {
    insuffisance += 15;
    symptomesCles.push("Hypotension orthostatique (aldostérone insuffisante)");
  }
  maxInsuffisance += 15;

  // === SUR-SOLLICITATION CORTICOTROPE (cortisol chroniquement élevé) ===
  if (answers?.stress_chronique === "oui") {
    surSollicitation += 20;
    symptomesCles.push("Stress chronique (ACTH/cortisol hyperactifs)");
  }
  maxSurSollicitation += 20;

  if (answers?.stress_actuel === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Stress actuel significatif");
  }
  maxSurSollicitation += 15;

  if (answers?.irritabilite === "souvent" || answers?.irritabilite === "toujours") {
    surSollicitation += 15;
    symptomesCles.push("Irritabilité fréquente (cortisol élevé)");
  }
  maxSurSollicitation += 15;

  if (answers?.anxiete === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Anxiété (hypercorticisme fonctionnel)");
  }
  maxSurSollicitation += 15;

  if (answers?.troubles_sommeil_stress === "oui") {
    surSollicitation += 10;
    symptomesCles.push("Sommeil perturbé par le stress");
  }
  maxSurSollicitation += 10;

  const insNorm = maxInsuffisance > 0 ? (insuffisance / maxInsuffisance) * 100 : 0;
  const surNorm = maxSurSollicitation > 0 ? (surSollicitation / maxSurSollicitation) * 100 : 0;

  return {
    insuffisance: Math.round(insNorm),
    surSollicitation: Math.round(surNorm),
    orientation: determinerOrientation(insNorm, surNorm),
    intensite: Math.round(Math.max(insNorm, surNorm) / 10),
    description: genererDescriptionAdaptatif(insNorm, surNorm),
    confiance: calculerConfiance(answers, 9),
    symptomesCles
  };
}

/**
 * Calcule le score endobiogénique pour l'axe thyréotrope
 */
function scorerAxeThyro(answers: Record<string, any>): ScoreAxeEndobiogenique {
  let insuffisance = 0;
  let surSollicitation = 0;
  let maxInsuffisance = 0;
  let maxSurSollicitation = 0;
  const symptomesCles: string[] = [];

  // === INSUFFISANCE THYRÉOTROPE (hypothyroïdie fonctionnelle) ===
  if (answers?.sensibilite_froid === "oui") {
    insuffisance += 20;
    symptomesCles.push("Frilosité marquée (hypométabolisme)");
  }
  maxInsuffisance += 20;

  if (answers?.prise_poids_recent === "oui") {
    insuffisance += 15;
    symptomesCles.push("Prise de poids récente (métabolisme ralenti)");
  }
  maxInsuffisance += 15;

  if (answers?.constipation === "oui") {
    insuffisance += 10;
    symptomesCles.push("Constipation (ralentissement digestif thyroïdien)");
  }
  maxInsuffisance += 10;

  if (answers?.chute_cheveux === "oui") {
    insuffisance += 10;
    symptomesCles.push("Chute de cheveux (dystrophie phanères)");
  }
  maxInsuffisance += 10;

  if (answers?.peau_seche === "oui") {
    insuffisance += 10;
    symptomesCles.push("Peau sèche (hypométabolisme cutané)");
  }
  maxInsuffisance += 10;

  if (answers?.lenteur_mentale === "oui") {
    insuffisance += 15;
    symptomesCles.push("Lenteur mentale (brain fog thyroïdien)");
  }
  maxInsuffisance += 15;

  // === SUR-SOLLICITATION THYRÉOTROPE (hyperthyroïdie fonctionnelle) ===
  if (answers?.sensibilite_chaleur === "oui") {
    surSollicitation += 20;
    symptomesCles.push("Intolérance à la chaleur (hypermétabolisme)");
  }
  maxSurSollicitation += 20;

  if (answers?.perte_poids_recent === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Perte de poids récente (catabolisme accéléré)");
  }
  maxSurSollicitation += 15;

  if (answers?.diarrhee === "oui") {
    surSollicitation += 10;
    symptomesCles.push("Diarrhée (accélération transit thyroïdien)");
  }
  maxSurSollicitation += 10;

  if (answers?.nervosité === "oui") {
    surSollicitation += 10;
    symptomesCles.push("Nervosité (T3 élevée)");
  }
  maxSurSollicitation += 10;

  if (answers?.tremblements === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Tremblements fins (hyperthyroïdie fonctionnelle)");
  }
  maxSurSollicitation += 15;

  const insNorm = maxInsuffisance > 0 ? (insuffisance / maxInsuffisance) * 100 : 0;
  const surNorm = maxSurSollicitation > 0 ? (surSollicitation / maxSurSollicitation) * 100 : 0;

  return {
    insuffisance: Math.round(insNorm),
    surSollicitation: Math.round(surNorm),
    orientation: determinerOrientation(insNorm, surNorm),
    intensite: Math.round(Math.max(insNorm, surNorm) / 10),
    description: genererDescriptionThyro(insNorm, surNorm),
    confiance: calculerConfiance(answers, 10),
    symptomesCles
  };
}

/**
 * Calcule le score endobiogénique pour l'axe gonadotrope
 */
function scorerAxeGonado(answers: Record<string, any>, sexe: "H" | "F"): ScoreAxeEndobiogenique {
  let insuffisance = 0;
  let surSollicitation = 0;
  let maxInsuffisance = 0;
  let maxSurSollicitation = 0;
  const symptomesCles: string[] = [];

  if (sexe === "F") {
    // === FEMME ===

    // Insuffisance œstrogénique
    if (answers?.secheresse_vaginale === "oui") {
      insuffisance += 20;
      symptomesCles.push("Sécheresse vaginale (hypo-œstrogénie)");
    }
    maxInsuffisance += 20;

    if (answers?.bouffees_chaleur === "oui") {
      insuffisance += 15;
      symptomesCles.push("Bouffées de chaleur (chute œstrogènes)");
    }
    maxInsuffisance += 15;

    if (answers?.libido_basse === "oui") {
      insuffisance += 15;
      symptomesCles.push("Libido basse (insuffisance gonadotrope)");
    }
    maxInsuffisance += 15;

    // Sur-sollicitation œstrogénique (hyperoestrogénie relative)
    if (answers?.spm_irritabilite === "oui") {
      surSollicitation += 15;
      symptomesCles.push("SPM irritabilité (hyperoestrogénie relative)");
    }
    maxSurSollicitation += 15;

    if (answers?.spm_douleurs_seins === "oui") {
      surSollicitation += 15;
      symptomesCles.push("Mastodynies prémenstruelles (œstrogènes élevés)");
    }
    maxSurSollicitation += 15;

    if (answers?.cycle_saignements_abondants === "oui") {
      surSollicitation += 15;
      symptomesCles.push("Ménorragies (hyperoestrogénie)");
    }
    maxSurSollicitation += 15;

    if (answers?.cycle_douleurs_importantes === "oui") {
      surSollicitation += 10;
      symptomesCles.push("Dysménorrhées (prostaglandines/œstrogènes)");
    }
    maxSurSollicitation += 10;

    if (answers?.cycle_regulier === "non") {
      surSollicitation += 10;
      symptomesCles.push("Cycles irréguliers (dysfonction gonado-thyréotrope)");
    }
    maxSurSollicitation += 10;

  } else {
    // === HOMME ===

    // Insuffisance androgénique
    if (answers?.libido_basse === "oui") {
      insuffisance += 25;
      symptomesCles.push("Libido basse (hypoandrogénie)");
    }
    maxInsuffisance += 25;

    if (answers?.erections_matinales_diminuees === "oui") {
      insuffisance += 25;
      symptomesCles.push("Érections matinales diminuées (testostérone basse)");
    }
    maxInsuffisance += 25;

    if (answers?.perte_muscle === "oui") {
      insuffisance += 15;
      symptomesCles.push("Perte masse musculaire (catabolisme)");
    }
    maxInsuffisance += 15;

    // Sur-sollicitation (conversion œstrogènes, DHT)
    if (answers?.prise_graisse_abdominale === "oui") {
      surSollicitation += 20;
      symptomesCles.push("Adiposité abdominale (aromatisation → œstrogènes)");
    }
    maxSurSollicitation += 20;

    if (answers?.troubles_urinaires === "oui") {
      surSollicitation += 15;
      symptomesCles.push("Troubles urinaires (hyperplasie prostatique → DHT)");
    }
    maxSurSollicitation += 15;

    if (answers?.gynecomastie === "oui") {
      surSollicitation += 20;
      symptomesCles.push("Gynécomastie (excès relatif œstrogènes)");
    }
    maxSurSollicitation += 20;
  }

  const insNorm = maxInsuffisance > 0 ? (insuffisance / maxInsuffisance) * 100 : 0;
  const surNorm = maxSurSollicitation > 0 ? (surSollicitation / maxSurSollicitation) * 100 : 0;

  return {
    insuffisance: Math.round(insNorm),
    surSollicitation: Math.round(surNorm),
    orientation: determinerOrientation(insNorm, surNorm),
    intensite: Math.round(Math.max(insNorm, surNorm) / 10),
    description: genererDescriptionGonado(insNorm, surNorm, sexe),
    confiance: calculerConfiance(answers, 8),
    symptomesCles
  };
}

/**
 * Calcule le score endobiogénique pour l'axe somatotrope
 */
function scorerAxeSomato(answers: Record<string, any>): ScoreAxeEndobiogenique {
  let insuffisance = 0;
  let surSollicitation = 0;
  let maxInsuffisance = 0;
  let maxSurSollicitation = 0;
  const symptomesCles: string[] = [];

  // === INSUFFISANCE SOMATOTROPE (GH/IGF-1 bas) ===
  if (answers?.cicatrisation_lente === "oui") {
    insuffisance += 20;
    symptomesCles.push("Cicatrisation lente (GH/IGF-1 insuffisants)");
  }
  maxInsuffisance += 20;

  if (answers?.perte_muscle === "oui") {
    insuffisance += 15;
    symptomesCles.push("Fonte musculaire (anabolisme insuffisant)");
  }
  maxInsuffisance += 15;

  if (answers?.fatigue_physique === "importante") {
    insuffisance += 15;
    symptomesCles.push("Fatigue physique majeure (déficit récupération)");
  }
  maxInsuffisance += 15;

  if (answers?.peau_fine === "oui") {
    insuffisance += 10;
    symptomesCles.push("Peau amincie (déficit collagène/élastine)");
  }
  maxInsuffisance += 10;

  // === SUR-SOLLICITATION SOMATOTROPE (croissance excessive) ===
  if (answers?.acromegalie_signes === "oui") {
    surSollicitation += 25;
    symptomesCles.push("Signes acromégaliques (GH élevée)");
  }
  maxSurSollicitation += 25;

  if (answers?.douleurs_croissance === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Douleurs de croissance (turn-over osseux élevé)");
  }
  maxSurSollicitation += 15;

  if (answers?.syndrome_canal_carpien === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Canal carpien (prolifération tissulaire)");
  }
  maxSurSollicitation += 15;

  if (answers?.hypoglycemies === "oui") {
    surSollicitation += 10;
    symptomesCles.push("Hypoglycémies réactionnelles (hyperinsulinisme)");
  }
  maxSurSollicitation += 10;

  const insNorm = maxInsuffisance > 0 ? (insuffisance / maxInsuffisance) * 100 : 0;
  const surNorm = maxSurSollicitation > 0 ? (surSollicitation / maxSurSollicitation) * 100 : 0;

  return {
    insuffisance: Math.round(insNorm),
    surSollicitation: Math.round(surNorm),
    orientation: determinerOrientation(insNorm, surNorm),
    intensite: Math.round(Math.max(insNorm, surNorm) / 10),
    description: genererDescriptionSomato(insNorm, surNorm),
    confiance: calculerConfiance(answers, 6),
    symptomesCles
  };
}

/**
 * Calcule le score pour l'axe digestif/métabolique
 */
function scorerAxeDigestif(answers: Record<string, any>): ScoreAxeEndobiogenique {
  let insuffisance = 0;
  let surSollicitation = 0;
  let maxInsuffisance = 0;
  let maxSurSollicitation = 0;
  const symptomesCles: string[] = [];

  // === INSUFFISANCE DIGESTIVE (hypochlorhydrie, insuffisance pancréatique) ===
  if (answers?.digestion_lente === "oui") {
    insuffisance += 20;
    symptomesCles.push("Digestion lente (insuffisance enzymatique)");
  }
  maxInsuffisance += 20;

  if (answers?.ballonnements === "oui") {
    insuffisance += 15;
    symptomesCles.push("Ballonnements (fermentation/dysbiose)");
  }
  maxInsuffisance += 15;

  if (answers?.constipation === "oui") {
    insuffisance += 15;
    symptomesCles.push("Constipation (hypotonie intestinale)");
  }
  maxInsuffisance += 15;

  // === SUR-SOLLICITATION DIGESTIVE (hypersécrétion, irritation) ===
  if (answers?.reflux === "oui") {
    surSollicitation += 20;
    symptomesCles.push("Reflux gastrique (hypersécrétion acide)");
  }
  maxSurSollicitation += 20;

  if (answers?.diarrhee === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Diarrhée (hyperactivité intestinale)");
  }
  maxSurSollicitation += 15;

  if (answers?.douleurs_abdominales === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Douleurs abdominales (irritation digestive)");
  }
  maxSurSollicitation += 15;

  if (answers?.transit === "alternant") {
    surSollicitation += 10;
    symptomesCles.push("Transit alternant (instabilité digestive)");
  }
  maxSurSollicitation += 10;

  const insNorm = maxInsuffisance > 0 ? (insuffisance / maxInsuffisance) * 100 : 0;
  const surNorm = maxSurSollicitation > 0 ? (surSollicitation / maxSurSollicitation) * 100 : 0;

  return {
    insuffisance: Math.round(insNorm),
    surSollicitation: Math.round(surNorm),
    orientation: determinerOrientation(insNorm, surNorm),
    intensite: Math.round(Math.max(insNorm, surNorm) / 10),
    description: "Évaluation de la fonction digestive et métabolique",
    confiance: calculerConfiance(answers, 7),
    symptomesCles
  };
}

/**
 * Calcule le score pour l'axe immuno-inflammatoire
 */
function scorerAxeImmuno(answers: Record<string, any>): ScoreAxeEndobiogenique {
  let insuffisance = 0;
  let surSollicitation = 0;
  let maxInsuffisance = 0;
  let maxSurSollicitation = 0;
  const symptomesCles: string[] = [];

  // === INSUFFISANCE IMMUNITAIRE ===
  if (answers?.infections_recidivantes === "oui") {
    insuffisance += 25;
    symptomesCles.push("Infections récidivantes (immunité cellulaire faible)");
  }
  maxInsuffisance += 25;

  if (answers?.cicatrisation_lente === "oui") {
    insuffisance += 15;
    symptomesCles.push("Cicatrisation lente (réponse inflammatoire insuffisante)");
  }
  maxInsuffisance += 15;

  // === SUR-SOLLICITATION IMMUNITAIRE (inflammation, allergie, auto-immunité) ===
  if (answers?.allergies_saisonnieres === "oui") {
    surSollicitation += 20;
    symptomesCles.push("Allergies saisonnières (terrain atopique Th2)");
  }
  maxSurSollicitation += 20;

  if (answers?.allergies_alimentaires === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Allergies alimentaires (perméabilité intestinale)");
  }
  maxSurSollicitation += 15;

  if (answers?.douleurs_articulaires === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Douleurs articulaires (inflammation systémique)");
  }
  maxSurSollicitation += 15;

  if (answers?.douleurs_musculaires === "oui") {
    surSollicitation += 10;
    symptomesCles.push("Douleurs musculaires (inflammation diffuse)");
  }
  maxSurSollicitation += 10;

  if (answers?.eczema === "oui" || answers?.psoriasis === "oui") {
    surSollicitation += 15;
    symptomesCles.push("Dermatose inflammatoire (terrain atopique/auto-immun)");
  }
  maxSurSollicitation += 15;

  if (answers?.maladie_auto_immune === "oui") {
    surSollicitation += 25;
    symptomesCles.push("Maladie auto-immune diagnostiquée (terrain Th1)");
  }
  maxSurSollicitation += 25;

  const insNorm = maxInsuffisance > 0 ? (insuffisance / maxInsuffisance) * 100 : 0;
  const surNorm = maxSurSollicitation > 0 ? (surSollicitation / maxSurSollicitation) * 100 : 0;

  return {
    insuffisance: Math.round(insNorm),
    surSollicitation: Math.round(surNorm),
    orientation: determinerOrientation(insNorm, surNorm),
    intensite: Math.round(Math.max(insNorm, surNorm) / 10),
    description: genererDescriptionImmuno(insNorm, surNorm),
    confiance: calculerConfiance(answers, 7),
    symptomesCles
  };
}

// ========================================
// DÉTECTION DES TERRAINS PATHOLOGIQUES
// ========================================

/**
 * Détecte les terrains pathologiques à partir des scores d'axes
 */
function detecterTerrains(
  scores: Record<AxisKey, ScoreAxeEndobiogenique>,
  answers: Record<string, Record<string, any>>
): TerrainDetecte[] {
  const terrains: TerrainDetecte[] = [];

  // === TERRAIN ATOPIQUE ===
  // Index Adaptation élevé, allergies, terrain Th2
  const adaptatifSur = scores.adaptatif?.surSollicitation || 0;
  const immunoSur = scores.immuno?.surSollicitation || 0;
  const allergies = answers.immuno?.allergies_saisonnieres === "oui" ||
                    answers.immuno?.allergies_alimentaires === "oui";

  if ((adaptatifSur > 50 && allergies) || immunoSur > 60) {
    terrains.push({
      terrain: "atopique",
      score: Math.round((adaptatifSur + immunoSur) / 2),
      indicateurs: [
        "ACTH/cortisol hyperactifs",
        "Terrain allergique Th2",
        "Risque asthme, eczéma, rhinite"
      ],
      axesImpliques: ["adaptatif", "immuno"]
    });
  }

  // === TERRAIN AUTO-IMMUN ===
  // Cortisol insuffisant, inflammation chronique, terrain Th1
  const adaptatifIns = scores.adaptatif?.insuffisance || 0;
  const autoImmun = answers.immuno?.maladie_auto_immune === "oui";

  if (adaptatifIns > 50 || autoImmun) {
    terrains.push({
      terrain: "auto_immun",
      score: Math.round(adaptatifIns + (autoImmun ? 30 : 0)),
      indicateurs: [
        "Cortisol insuffisant",
        "Terrain Th1 prédominant",
        "Risque pathologies auto-immunes"
      ],
      axesImpliques: ["adaptatif", "immuno"]
    });
  }

  // === TERRAIN SPASMOPHILE ===
  const neuroSur = scores.neuro?.surSollicitation || 0;
  const neuroIns = scores.neuro?.insuffisance || 0;

  if (neuroSur > 40 || (neuroSur > 30 && adaptatifSur > 30)) {
    terrains.push({
      terrain: "spasmophile",
      score: Math.round((neuroSur + adaptatifSur) / 2),
      indicateurs: [
        "Dysfonction sympathique",
        "Instabilité neuromusculaire",
        "Déficit magnésium probable"
      ],
      axesImpliques: ["neuro", "adaptatif"]
    });
  }

  // === TERRAIN CONGESTIF ===
  const digestifIns = scores.digestif?.insuffisance || 0;
  if (digestifIns > 40 && neuroSur > 30) {
    terrains.push({
      terrain: "congestif",
      score: Math.round((digestifIns + neuroSur) / 2),
      indicateurs: [
        "Congestion hépato-splanchnique",
        "IML probablement élevé",
        "Drainage hépatique indiqué"
      ],
      axesImpliques: ["digestif", "neuro"]
    });
  }

  // === TERRAIN MÉTABOLIQUE ===
  const somatoSur = scores.somato?.surSollicitation || 0;
  const hypoglycemies = answers.somato?.hypoglycemies === "oui" ||
                        answers.digestif?.hypoglycemies === "oui";
  const surpoids = answers.digestif?.prise_poids_centrale === "oui";

  if (somatoSur > 40 || (hypoglycemies && surpoids)) {
    terrains.push({
      terrain: "metabolique",
      score: Math.round(somatoSur + (hypoglycemies ? 20 : 0) + (surpoids ? 20 : 0)),
      indicateurs: [
        "Risque insulino-résistance",
        "Hyperinsulinisme probable",
        "Syndrome métabolique à surveiller"
      ],
      axesImpliques: ["somato", "digestif"]
    });
  }

  return terrains.sort((a, b) => b.score - a.score);
}

// ========================================
// DÉTECTION DES COUPLAGES D'AXES
// ========================================

function detecterCouplages(
  scores: Record<AxisKey, ScoreAxeEndobiogenique>
): CouplageDetecte[] {
  const couplages: CouplageDetecte[] = [];

  // Cortico-Gonadotrope
  const adaptatifIntense = (scores.adaptatif?.intensite || 0) >= 5;
  const gonadoIntense = (scores.gonado?.intensite || 0) >= 5;

  if (adaptatifIntense && gonadoIntense) {
    couplages.push({
      couplage: "cortico_gonadotrope",
      score: Math.round(((scores.adaptatif?.intensite || 0) + (scores.gonado?.intensite || 0)) * 10),
      description: "Interaction stress-hormones sexuelles active. Le cortisol impacte la production gonadique."
    });
  }

  // Gonado-Thyréotrope
  const thyroIntense = (scores.thyro?.intensite || 0) >= 5;

  if (gonadoIntense && thyroIntense) {
    couplages.push({
      couplage: "gonado_thyreotrope",
      score: Math.round(((scores.gonado?.intensite || 0) + (scores.thyro?.intensite || 0)) * 10),
      description: "Couplage œstrogènes-TSH actif. Influence mutuelle sur le métabolisme et la reproduction."
    });
  }

  // SNA-Corticotrope
  const neuroIntense = (scores.neuro?.intensite || 0) >= 5;

  if (neuroIntense && adaptatifIntense) {
    couplages.push({
      couplage: "sna_corticotrope",
      score: Math.round(((scores.neuro?.intensite || 0) + (scores.adaptatif?.intensite || 0)) * 10),
      description: "Couplage sympathique-surrénalien actif. Risque d'emballement adaptatif."
    });
  }

  return couplages;
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

function determinerOrientation(insuffisance: number, surSollicitation: number): OrientationEndobiogenique {
  const diff = Math.abs(insuffisance - surSollicitation);

  if (insuffisance < 20 && surSollicitation < 20) {
    return "equilibre";
  }

  if (insuffisance > 30 && surSollicitation > 30 && diff < 20) {
    return "instabilite";
  }

  if (diff < 15) {
    return "mal_adaptation";
  }

  return insuffisance > surSollicitation ? "insuffisance" : "sur_sollicitation";
}

function calculerConfiance(answers: Record<string, any>, totalQuestions: number): number {
  const answered = Object.values(answers).filter(v => v !== undefined && v !== null && v !== "").length;
  return Math.min(answered / totalQuestions, 1);
}

// === Générateurs de descriptions ===

function genererDescriptionNeuro(ins: number, sur: number): string {
  if (ins < 20 && sur < 20) return "Équilibre neurovégétatif préservé";
  if (sur > ins + 20) return "Hyperactivité sympathique (α et/ou β) - Terrain spasmophile probable";
  if (ins > sur + 20) return "Hypotonie parasympathique - Déficit de récupération vagale";
  return "Instabilité neurovégétative - Alternance sympathique/parasympathique";
}

function genererDescriptionAdaptatif(ins: number, sur: number): string {
  if (ins < 20 && sur < 20) return "Capacité d'adaptation préservée";
  if (sur > ins + 20) return "Sur-sollicitation corticotrope (stress chronique) - Risque épuisement";
  if (ins > sur + 20) return "Insuffisance corticotrope - Épuisement surrénalien probable";
  return "Mal-adaptation corticotrope - Phase de transition";
}

function genererDescriptionThyro(ins: number, sur: number): string {
  if (ins < 20 && sur < 20) return "Fonction thyroïdienne équilibrée";
  if (sur > ins + 20) return "Sur-sollicitation thyréotrope - Hypermétabolisme fonctionnel";
  if (ins > sur + 20) return "Insuffisance thyréotrope - Hypométabolisme fonctionnel";
  return "Instabilité thyroïdienne fonctionnelle";
}

function genererDescriptionGonado(ins: number, sur: number, sexe: "H" | "F"): string {
  if (ins < 20 && sur < 20) return "Équilibre gonadotrope préservé";

  if (sexe === "F") {
    if (sur > ins + 20) return "Hyperoestrogénie relative - Dominance œstrogènes/progestérone";
    if (ins > sur + 20) return "Hypo-œstrogénie - Insuffisance gonadotrope";
    return "Déséquilibre œstrogènes/progestérone - Instabilité cyclique";
  } else {
    if (sur > ins + 20) return "Conversion œstrogénique augmentée - Aromatisation active";
    if (ins > sur + 20) return "Insuffisance androgénique - Hypogonadisme fonctionnel";
    return "Déséquilibre androgènes/œstrogènes";
  }
}

function genererDescriptionSomato(ins: number, sur: number): string {
  if (ins < 20 && sur < 20) return "Axe somatotrope équilibré";
  if (sur > ins + 20) return "Sur-sollicitation somatotrope - Turn-over tissulaire accéléré";
  if (ins > sur + 20) return "Insuffisance somatotrope - Déficit anabolique";
  return "Instabilité de l'axe de croissance";
}

function genererDescriptionImmuno(ins: number, sur: number): string {
  if (ins < 20 && sur < 20) return "Immunité équilibrée";
  if (sur > ins + 20) return "Hyperréactivité immunitaire - Terrain atopique ou auto-immun";
  if (ins > sur + 20) return "Déficit immunitaire relatif - Infections récidivantes";
  return "Instabilité immunitaire";
}

// ========================================
// FONCTION PRINCIPALE
// ========================================

/**
 * Calcule le scoring endobiogénique complet
 */
export function calculateClinicalScoresV2(
  answersByAxis: Record<string, Record<string, any>>,
  sexe: "H" | "F"
): ScoringEndobiogeniqueComplet {
  const axes: Record<string, ScoreAxeEndobiogenique> = {};

  // Scorer chaque axe
  if (answersByAxis.neuro && Object.keys(answersByAxis.neuro).length > 0) {
    axes.neuro = scorerAxeNeuro(answersByAxis.neuro);
  }

  if (answersByAxis.adaptatif && Object.keys(answersByAxis.adaptatif).length > 0) {
    axes.adaptatif = scorerAxeAdaptatif(answersByAxis.adaptatif);
  }

  if (answersByAxis.thyro && Object.keys(answersByAxis.thyro).length > 0) {
    axes.thyro = scorerAxeThyro(answersByAxis.thyro);
  }

  if (answersByAxis.gonado && Object.keys(answersByAxis.gonado).length > 0) {
    axes.gonado = scorerAxeGonado(answersByAxis.gonado, sexe);
  }

  if (answersByAxis.somato && Object.keys(answersByAxis.somato).length > 0) {
    axes.somato = scorerAxeSomato(answersByAxis.somato);
  }

  if (answersByAxis.digestif && Object.keys(answersByAxis.digestif).length > 0) {
    axes.digestif = scorerAxeDigestif(answersByAxis.digestif);
  }

  if (answersByAxis.immuno && Object.keys(answersByAxis.immuno).length > 0) {
    axes.immuno = scorerAxeImmuno(answersByAxis.immuno);
  }

  // Détecter terrains et couplages
  const terrainsDetectes = detecterTerrains(axes as any, answersByAxis);
  const couplagesActifs = detecterCouplages(axes as any);

  // Générer analyses complètes avec priorité thérapeutique
  const analysesCompletes = genererAnalysesCompletes(axes, terrainsDetectes, couplagesActifs);

  // Synthèse globale
  const syntheseGlobale = genererSyntheseGlobale(axes, terrainsDetectes, couplagesActifs);

  return {
    axes: axes as any,
    analysesCompletes,
    terrainsDetectes,
    couplagesActifs,
    syntheseGlobale
  };
}

function genererAnalysesCompletes(
  axes: Record<string, ScoreAxeEndobiogenique>,
  terrains: TerrainDetecte[],
  couplages: CouplageDetecte[]
): AnalyseAxeComplete[] {
  const analyses: AnalyseAxeComplete[] = [];

  // Hiérarchie endobiogénique pour la priorité
  const hierarchie: AxisKey[] = ["adaptatif", "neuro", "thyro", "gonado", "somato", "digestif", "immuno"];

  for (const axeKey of hierarchie) {
    const score = axes[axeKey];
    if (!score) continue;

    const terrainsAssocies = terrains
      .filter(t => t.axesImpliques.includes(axeKey))
      .map(t => t.terrain);

    const couplagesActifs = couplages
      .filter(c => c.couplage.includes(axeKey.slice(0, 5)))
      .map(c => c.couplage);

    analyses.push({
      axe: axeKey,
      score,
      terrainsAssocies,
      couplagesActifs,
      prioriteTherapeutique: hierarchie.indexOf(axeKey) + 1
    });
  }

  // Trier par intensité puis par priorité hiérarchique
  return analyses.sort((a, b) => {
    if (b.score.intensite !== a.score.intensite) {
      return b.score.intensite - a.score.intensite;
    }
    return a.prioriteTherapeutique - b.prioriteTherapeutique;
  });
}

function genererSyntheseGlobale(
  axes: Record<string, ScoreAxeEndobiogenique>,
  terrains: TerrainDetecte[],
  couplages: CouplageDetecte[]
): SyntheseGlobale {
  // Terrain principal
  const terrainPrincipal = terrains.length > 0 ? terrains[0].terrain : null;

  // Axe prioritaire (selon hiérarchie endobiogénique)
  const hierarchie: AxisKey[] = ["adaptatif", "neuro", "thyro", "gonado", "somato", "digestif", "immuno"];
  let axePrioritaire: AxisKey | null = null;
  let maxIntensiteAxePrio = 0;

  for (const axe of hierarchie) {
    const score = axes[axe];
    if (score && score.intensite >= 5 && score.intensite > maxIntensiteAxePrio) {
      axePrioritaire = axe;
      maxIntensiteAxePrio = score.intensite;
      break; // Prendre le premier dans la hiérarchie qui est perturbé
    }
  }

  // Capacité d'adaptation
  const adaptatif = axes.adaptatif;
  let capaciteAdaptation: SyntheseGlobale["capaciteAdaptation"] = "bonne";

  if (adaptatif) {
    if (adaptatif.insuffisance > 60 || (adaptatif.insuffisance > 40 && adaptatif.surSollicitation > 40)) {
      capaciteAdaptation = "epuisee";
    } else if (adaptatif.insuffisance > 40 || adaptatif.surSollicitation > 50) {
      capaciteAdaptation = "faible";
    } else if (adaptatif.insuffisance > 20 || adaptatif.surSollicitation > 30) {
      capaciteAdaptation = "moderee";
    }
  }

  // Risque spasmophilie
  const risqueSpasmophilie = terrains.some(t => t.terrain === "spasmophile");

  // Recommandations prioritaires
  const recommandationsPrioritaires: string[] = [];

  if (capaciteAdaptation === "epuisee") {
    recommandationsPrioritaires.push("Soutien corticotrope urgent (adaptogènes)");
  }

  if (risqueSpasmophilie) {
    recommandationsPrioritaires.push("Magnésium + régulation SNA");
  }

  if (terrainPrincipal === "atopique") {
    recommandationsPrioritaires.push("Ribes nigrum MG + drainage");
  }

  if (terrainPrincipal === "auto_immun") {
    recommandationsPrioritaires.push("Modulateurs Th1/Th2 + cortisol");
  }

  if (terrainPrincipal === "congestif") {
    recommandationsPrioritaires.push("Drainage hépatique PRIORITAIRE");
  }

  return {
    terrainPrincipal,
    axePrioritaire,
    capaciteAdaptation,
    risqueSpasmophilie,
    recommandationsPrioritaires
  };
}

// ========================================
// FONCTION DE COMPATIBILITÉ (ancienne interface)
// ========================================

export interface AxeScore {
  hypo: number;
  hyper: number;
  orientation: "hypo" | "hyper" | "equilibre" | "mixte";
  details?: string;
  confiance: number;
}

/**
 * Convertit le nouveau format vers l'ancien pour compatibilité
 */
export function convertToLegacyFormat(score: ScoreAxeEndobiogenique): AxeScore {
  let legacyOrientation: AxeScore["orientation"] = "equilibre";

  switch (score.orientation) {
    case "insuffisance":
      legacyOrientation = "hypo";
      break;
    case "sur_sollicitation":
      legacyOrientation = "hyper";
      break;
    case "instabilite":
    case "mal_adaptation":
      legacyOrientation = "mixte";
      break;
    default:
      legacyOrientation = "equilibre";
  }

  return {
    hypo: score.insuffisance,
    hyper: score.surSollicitation,
    orientation: legacyOrientation,
    details: score.description,
    confiance: score.confiance
  };
}

export function getScoreDescription(axisKey: AxisKey, score: AxeScore): string {
  const { orientation, hypo, hyper } = score;

  if (orientation === "equilibre") {
    return "Fonctionnement équilibré sur cet axe";
  }

  if (orientation === "mixte") {
    return `Profil instable (insuffisance: ${hypo}%, sur-sollicitation: ${hyper}%) - Mal-adaptation fonctionnelle`;
  }

  if (orientation === "hypo") {
    if (hypo >= 70) return "Insuffisance fonctionnelle marquée";
    if (hypo >= 50) return "Insuffisance fonctionnelle modérée";
    return "Insuffisance fonctionnelle légère";
  }

  if (orientation === "hyper") {
    if (hyper >= 70) return "Sur-sollicitation fonctionnelle marquée";
    if (hyper >= 50) return "Sur-sollicitation fonctionnelle modérée";
    return "Sur-sollicitation fonctionnelle légère";
  }

  return "Non évalué";
}
