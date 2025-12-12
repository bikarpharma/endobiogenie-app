/**
 * ============================================================================
 * CONTEXTUALISEUR D'ÂGE/PHASE DE VIE POUR LES INDEX BdF
 * ============================================================================
 *
 * Ce module ajoute une couche d'interprétation contextuelle aux index BdF
 * en fonction de l'âge et du sexe du patient, SANS modifier les formules
 * de base qui restent conformes à la méthodologie Lapraz/Hedayat.
 *
 * Les normes BdF sont universelles, mais l'INTERPRÉTATION clinique doit
 * tenir compte de la phase de vie du patient.
 *
 * Référence: "La Théorie de l'Endobiogénie" - Volume 1, Chapitre Phases de Vie
 * ============================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export type LifePhase =
  | "enfant"        // 0-12 ans
  | "adolescent"    // 13-18 ans
  | "adulte_jeune"  // 19-35 ans
  | "adulte_mature" // 36-50 ans
  | "perimenopause" // 45-55 ans (femmes)
  | "menopause"     // 50+ ans (femmes)
  | "andropause"    // 50+ ans (hommes)
  | "senior";       // 65+ ans

export interface AgeContext {
  age: number;
  sexe: "H" | "F";
  phase: LifePhase;
  phaseLabel: string;
  physiologicalNotes: string[];
}

export interface ContextualizedInterpretation {
  baseInterpretation: string;  // Interprétation standard BdF
  ageContext: string;           // Commentaire lié à l'âge
  clinicalRelevance: "normal_for_age" | "abnormal" | "to_watch";
  recommendations?: string[];
}

// ============================================================================
// DÉTERMINATION DE LA PHASE DE VIE
// ============================================================================

/**
 * Détermine la phase de vie du patient selon son âge et son sexe
 */
export function determineLifePhase(age: number, sexe: "H" | "F"): AgeContext {
  let phase: LifePhase;
  let phaseLabel: string;
  const physiologicalNotes: string[] = [];

  if (age < 13) {
    phase = "enfant";
    phaseLabel = "Enfance";
    physiologicalNotes.push(
      "Axe somatotrope dominant (croissance)",
      "Thyroïde très active",
      "Index génital non interprétable (puberté non commencée)"
    );
  } else if (age < 19) {
    phase = "adolescent";
    phaseLabel = "Adolescence";
    physiologicalNotes.push(
      "Axe gonadotrope en développement",
      "Fluctuations hormonales normales",
      "Index d'adaptation variable (stress scolaire/émotionnel)"
    );
  } else if (age < 36) {
    phase = "adulte_jeune";
    phaseLabel = "Adulte jeune";
    physiologicalNotes.push(
      "Période de stabilité hormonale optimale",
      "Capacité d'adaptation maximale",
      "Référence pour les normes BdF"
    );
  } else if (age < 51) {
    if (sexe === "F" && age >= 45) {
      phase = "perimenopause";
      phaseLabel = "Périménopause";
      physiologicalNotes.push(
        "Déclin progressif des œstrogènes",
        "Index génital en transition",
        "Axe thyréotrope sollicité (compensation)",
        "Risque de terrain spasmophile accru"
      );
    } else {
      phase = "adulte_mature";
      phaseLabel = "Adulte mature";
      physiologicalNotes.push(
        "Début du déclin DHEA",
        "Surveillance de l'axe corticotrope",
        "Index thyroïdien à surveiller"
      );
    }
  } else if (age < 65) {
    if (sexe === "F") {
      phase = "menopause";
      phaseLabel = "Ménopause";
      physiologicalNotes.push(
        "Chute des œstrogènes → Index génital BAS normal",
        "Axe corticotrope sollicité (compensation)",
        "Risque ostéoporose → surveiller remodelage osseux",
        "TSH peut être physiologiquement plus élevée"
      );
    } else {
      phase = "andropause";
      phaseLabel = "Andropause";
      physiologicalNotes.push(
        "Déclin progressif de la testostérone",
        "Index génital peut baisser légèrement",
        "Axe somatotrope ralentit",
        "Surveillance prostatique recommandée"
      );
    }
  } else {
    phase = "senior";
    phaseLabel = "Senior";
    physiologicalNotes.push(
      "Ralentissement global des axes",
      "Capacité d'adaptation réduite (normal)",
      "Index thyroïdien souvent bas (physiologique)",
      "Interpréter les index avec prudence"
    );
  }

  return {
    age,
    sexe,
    phase,
    phaseLabel,
    physiologicalNotes,
  };
}

// ============================================================================
// INTERPRÉTATIONS CONTEXTUELLES PAR INDEX
// ============================================================================

/**
 * Ajoute un contexte d'âge à l'interprétation d'un index
 */
export function contextualizeInterpretation(
  indexId: string,
  value: number,
  baseInterpretation: string,
  ageContext: AgeContext
): ContextualizedInterpretation {
  const result: ContextualizedInterpretation = {
    baseInterpretation,
    ageContext: "",
    clinicalRelevance: "abnormal",
  };

  // Contextualisations spécifiques par index
  switch (indexId) {
    // ========== INDEX GÉNITAL ==========
    case "idx_genital":
    case "idx_genital_corrige":
      if (ageContext.phase === "menopause") {
        if (value < 0.70) {
          result.ageContext = "Valeur basse attendue en post-ménopause (déclin œstrogénique physiologique)";
          result.clinicalRelevance = "normal_for_age";
        }
      } else if (ageContext.phase === "perimenopause") {
        result.ageContext = "Période de transition - fluctuations normales";
        result.clinicalRelevance = "to_watch";
      } else if (ageContext.phase === "enfant") {
        result.ageContext = "Index non interprétable avant la puberté";
        result.clinicalRelevance = "normal_for_age";
      }
      break;

    // ========== INDEX THYROÏDIEN ==========
    case "idx_thyroidien":
    case "idx_rendement_thyroidien":
      if (ageContext.phase === "senior") {
        if (value < 3.5) {
          result.ageContext = "Un ralentissement thyroïdien est physiologique après 65 ans";
          result.clinicalRelevance = value < 2.5 ? "abnormal" : "normal_for_age";
          result.recommendations = [
            "Vérifier TSH et T4L si symptômes",
            "Ne pas traiter systématiquement les hypothyroïdies subcliniques du sujet âgé"
          ];
        }
      } else if (ageContext.phase === "enfant" || ageContext.phase === "adolescent") {
        result.ageContext = "Métabolisme thyroïdien élevé normal en période de croissance";
        result.clinicalRelevance = value > 5.5 ? "normal_for_age" : "abnormal";
      }
      break;

    // ========== INDEX D'ADAPTATION ==========
    case "idx_adaptation":
      if (ageContext.phase === "senior") {
        if (value < 0.25) {
          result.ageContext = "La capacité d'adaptation diminue physiologiquement avec l'âge";
          result.clinicalRelevance = "to_watch";
          result.recommendations = [
            "Éviter les stress aigus",
            "Adapter les traitements à la capacité d'adaptation réduite"
          ];
        }
      } else if (ageContext.phase === "adolescent") {
        result.ageContext = "Variabilité importante de l'adaptation en adolescence (stress émotionnel)";
        result.clinicalRelevance = "to_watch";
      }
      break;

    // ========== INDEX CORTISOL ==========
    case "idx_cortisol":
      if (ageContext.phase === "menopause" || ageContext.phase === "andropause") {
        result.ageContext = "Axe corticotrope plus sollicité après 50 ans (compensation des déclins hormonaux)";
        if (value > 7) {
          result.clinicalRelevance = "to_watch";
          result.recommendations = [
            "Surveiller le sommeil et le stress",
            "Envisager un soutien adaptatif (rhodiola, éleuthérocoque)"
          ];
        }
      }
      break;

    // ========== INDEX SOMATOTROPE ==========
    case "idx_croissance":
    case "idx_remodelage_osseux":
      if (ageContext.phase === "enfant" || ageContext.phase === "adolescent") {
        result.ageContext = "Axe somatotrope dominant en période de croissance - valeurs élevées normales";
        result.clinicalRelevance = value > 6 ? "normal_for_age" : "abnormal";
      } else if (ageContext.phase === "senior") {
        result.ageContext = "Le remodelage osseux ralentit avec l'âge";
        if (value < 2.5) {
          result.clinicalRelevance = "to_watch";
          result.recommendations = [
            "Surveiller la densité osseuse",
            "Supplémenter en vitamine D si besoin"
          ];
        }
      } else if (ageContext.phase === "menopause") {
        result.ageContext = "Risque ostéoporotique accru - surveiller le remodelage osseux";
        result.clinicalRelevance = "to_watch";
        result.recommendations = [
          "Ostéodensitométrie recommandée",
          "Envisager gemmothérapie (séquoia, pin)"
        ];
      }
      break;

    // ========== INDEX SNA ==========
    case "idx_mobilisation_plaquettes":
    case "idx_mobilisation_leucocytes":
    case "idx_starter":
      if (ageContext.phase === "adolescent") {
        result.ageContext = "Le SNA est instable en adolescence - fluctuations normales";
        result.clinicalRelevance = "to_watch";
      } else if (ageContext.phase === "perimenopause") {
        result.ageContext = "Dysautonomie fréquente en périménopause (bouffées, palpitations)";
        result.clinicalRelevance = "to_watch";
      }
      break;

    // ========== INDEX ŒSTROGÈNES ==========
    case "idx_oestrogenes":
      if (ageContext.phase === "menopause") {
        result.ageContext = "Hypo-œstrogénie attendue en ménopause";
        result.clinicalRelevance = value < 0.14 ? "normal_for_age" : "abnormal";
      } else if (ageContext.phase === "adolescent" && ageContext.sexe === "F") {
        result.ageContext = "Œstrogènes en augmentation progressive";
        result.clinicalRelevance = "to_watch";
      }
      break;

    default:
      // Pas de contextualisation spécifique
      result.ageContext = `Patient en phase ${ageContext.phaseLabel}`;
      break;
  }

  // Si pas de contexte spécifique trouvé, utiliser un message générique
  if (!result.ageContext) {
    result.ageContext = `Patient ${ageContext.sexe === "F" ? "femme" : "homme"} de ${ageContext.age} ans (${ageContext.phaseLabel})`;
  }

  return result;
}

// ============================================================================
// FONCTION PRINCIPALE D'ENRICHISSEMENT
// ============================================================================

export interface IndexWithContext {
  indexId: string;
  value: number;
  interpretation: ContextualizedInterpretation;
  physiologicalNotes: string[];
}

/**
 * Enrichit un ensemble d'index avec le contexte d'âge
 */
export function enrichIndexesWithAgeContext(
  indexes: Record<string, { value: number; interpretation: string }>,
  age: number | null,
  sexe: "H" | "F"
): {
  ageContext: AgeContext;
  enrichedIndexes: IndexWithContext[];
  globalNotes: string[];
} {
  // Utiliser 40 ans comme âge par défaut si non renseigné
  const effectiveAge = age ?? 40;
  const ageContext = determineLifePhase(effectiveAge, sexe);

  const enrichedIndexes: IndexWithContext[] = [];

  for (const [indexId, { value, interpretation }] of Object.entries(indexes)) {
    if (value === null || value === undefined) continue;

    const contextualizedInterp = contextualizeInterpretation(
      indexId,
      value,
      interpretation,
      ageContext
    );

    enrichedIndexes.push({
      indexId,
      value,
      interpretation: contextualizedInterp,
      physiologicalNotes: ageContext.physiologicalNotes,
    });
  }

  // Notes globales selon la phase de vie
  const globalNotes: string[] = [
    `Phase de vie: ${ageContext.phaseLabel}`,
    ...ageContext.physiologicalNotes,
  ];

  if (age === null) {
    globalNotes.unshift("⚠️ Âge non renseigné - interprétations basées sur adulte 40 ans");
  }

  return {
    ageContext,
    enrichedIndexes,
    globalNotes,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  determineLifePhase,
  contextualizeInterpretation,
  enrichIndexesWithAgeContext,
};
