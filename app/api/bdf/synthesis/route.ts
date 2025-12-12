// ========================================
// app/api/bdf/synthesis/route.ts
// ========================================
// VERSION CONSOLIDÉE - Utilise callDiagnosticAssistant (même pipeline que unified-analysis)
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { callDiagnosticAssistant, type DiagnosticResponse } from "@/lib/ai/assistantDiagnostic";
import { prepareFullContextForAI } from "@/lib/ai/prepareDataForAI";

export const runtime = "nodejs";
export const maxDuration = 120;

// ========================================
// TYPE EXPORTÉ (utilisé par OngletAnalyses.tsx)
// ========================================

export interface BdfSynthesisResponse {
  terrain: {
    axeDominant?: string;
    profilSNA?: string;
    description?: string;
    justification?: string;
    mecanismesCles?: string[];
    type?: string; // Pour détection ancien format invalide
  };
  axesEndocriniens: Array<{
    axis: string;
    status: string;
    mechanism: string;
    biomarkers: string[];
    therapeuticImplication?: string;
  }>;
  neuroVegetatifBio: {
    status: string;
    dominance: string;
    mecanisme: string;
    indexCles: string[];
  };
  drainage: {
    priorite: string;
    capaciteTampon: number | null;
    necessite: boolean;
    dureeSuggeree?: string;
    justification: string;
    emonctoires: Array<{
      organe: string;
      statut: string;
    }>;
  };
  spasmophilie: {
    detectee: boolean;
    type?: string;
    nom?: string;
    description?: string;
    mecanisme?: string;
    indexCles: string[];
    strategieTherapeutique?: string;
  };
  hypothesesBiologiques: string[];
  warnings: string[];
  confidenceScore: number;
}

// ========================================
// GARDE-FOUS (règles critiques)
// ========================================

interface Guardrails {
  warnings: string[];
  constraints: string[];
  tshInterpretation?: string;
}

function calculateGuardrails(
  indexes: Record<string, any>,
  inputs: Record<string, number>
): Guardrails {
  const warnings: string[] = [];
  const constraints: string[] = [];

  // 1. TERRAINS INTERDITS (toujours)
  constraints.push("INTERDIT: Terrain Alpha/Beta/Gamma/Delta (n'existent pas en endobiogénie)");

  // 2. TSH
  const tsh = inputs.TSH ?? inputs.tsh;
  let tshInterpretation: string | undefined;

  if (tsh !== undefined) {
    if (tsh > 4) {
      tshInterpretation = "HYPOTHYROÏDIE fonctionnelle";
      warnings.push(`⚠️ TSH=${tsh} (élevée) → ${tshInterpretation} - JAMAIS hyperthyroïdie!`);
      constraints.push(`TSH=${tsh} élevée = HYPOTHYROÏDIE (pas hyper!)`);
    } else if (tsh < 0.5) {
      tshInterpretation = "Désynchronisation somatotrope possible";
      warnings.push(`⚠️ TSH=${tsh} (très basse) → ${tshInterpretation}`);
    }
  }

  // 3. Index Thyroïdien bas + TSH normale = Hypo LATENTE
  const idxThyro = findIndexValue(indexes, "thyro", "thyroïdien", "metabolique");
  if (idxThyro !== null && tsh !== undefined && tsh >= 0.5 && tsh <= 4) {
    if (idxThyro < 3.5) {
      warnings.push(`⚠️ TSH normale (${tsh}) MAIS Index Thyroïdien BAS (${idxThyro}) → Hypothyroïdie LATENTE`);
      constraints.push("Index Thyroïdien bas + TSH normale = Hypothyroïdie LATENTE périphérique");
    }
  }

  // 4. IMP bas = Spasmophilie
  const imp = findIndexValue(indexes, "mobilisation_plaq", "imp", "plaquettes");
  if (imp !== null && imp < 0.85) {
    warnings.push(`⚠️ IMP=${imp.toFixed(2)} (bas) → Spasmophilie probable`);
  }

  // 5. Index Adaptation bas = Atopie
  const idxAdapt = findIndexValue(indexes, "adaptation");
  if (idxAdapt !== null && idxAdapt < 0.25) {
    warnings.push(`⚠️ Index Adaptation=${idxAdapt.toFixed(2)} (bas) → Terrain atopique`);
  }

  // 6. Données manquantes
  if (tsh === undefined) {
    warnings.push("⚠️ TSH non fournie → Interprétation thyréotrope limitée");
  }

  return { warnings, constraints, tshInterpretation };
}

function findIndexValue(indexes: Record<string, any>, ...keywords: string[]): number | null {
  for (const [key, value] of Object.entries(indexes)) {
    const keyLower = key.toLowerCase();
    if (keywords.some(k => keyLower.includes(k.toLowerCase()))) {
      if (value && typeof value === "object" && "value" in value) {
        return typeof value.value === "number" ? value.value : null;
      }
      if (typeof value === "number") {
        return value;
      }
    }
  }
  return null;
}

// ========================================
// VALIDATION ET CORRECTION DU JSON (gardé pour compatibilité legacy)
// ========================================

function validateAndFixSynthesis(raw: any): BdfSynthesisResponse {
  // Valeurs par défaut
  const defaultNeuroVegetatif = {
    status: "Non évalué",
    dominance: "Non déterminé",
    mecanisme: "Données insuffisantes pour évaluer l'équilibre neuro-végétatif",
    indexCles: []
  };

  const defaultDrainage = {
    necessite: false,
    priorite: "donnees_insuffisantes",
    capaciteTampon: null,
    dureeSuggeree: undefined,
    justification: "Données insuffisantes pour évaluer le drainage",
    emonctoires: [
      { organe: "foie", statut: "non_evaluable" },
      { organe: "reins", statut: "non_evaluable" },
      { organe: "intestins", statut: "non_evaluable" },
      { organe: "peau", statut: "non_evaluable" },
      { organe: "poumons", statut: "non_evaluable" }
    ]
  };

  const defaultSpasmophilie = {
    detectee: false,
    type: undefined,
    nom: undefined,
    description: undefined,
    mecanisme: undefined,
    indexCles: [],
    strategieTherapeutique: undefined
  };

  // Construire l'objet validé
  const synthesis: BdfSynthesisResponse = {
    terrain: {
      axeDominant: raw.terrain?.axeDominant || "Mixte",
      profilSNA: raw.terrain?.profilSNA || "Non déterminé",
      description: raw.terrain?.description || "",
      justification: raw.terrain?.justification || "",
      mecanismesCles: Array.isArray(raw.terrain?.mecanismesCles) ? raw.terrain.mecanismesCles : [],
    },
    axesEndocriniens: Array.isArray(raw.axesEndocriniens) 
      ? raw.axesEndocriniens.map((axe: any) => ({
          axis: axe.axis || "Inconnu",
          status: axe.status || "Données insuffisantes",
          mechanism: axe.mechanism || "",
          biomarkers: Array.isArray(axe.biomarkers) ? axe.biomarkers : [],
          therapeuticImplication: axe.therapeuticImplication,
        }))
      : [],
    neuroVegetatifBio: {
      status: raw.neuroVegetatifBio?.status || defaultNeuroVegetatif.status,
      dominance: raw.neuroVegetatifBio?.dominance || defaultNeuroVegetatif.dominance,
      mecanisme: raw.neuroVegetatifBio?.mecanisme || defaultNeuroVegetatif.mecanisme,
      indexCles: Array.isArray(raw.neuroVegetatifBio?.indexCles) 
        ? raw.neuroVegetatifBio.indexCles 
        : defaultNeuroVegetatif.indexCles,
    },
    drainage: {
      necessite: raw.drainage?.necessite ?? defaultDrainage.necessite,
      priorite: raw.drainage?.priorite || defaultDrainage.priorite,
      capaciteTampon: typeof raw.drainage?.capaciteTampon === "number" 
        ? raw.drainage.capaciteTampon 
        : defaultDrainage.capaciteTampon,
      dureeSuggeree: raw.drainage?.dureeSuggeree,
      justification: raw.drainage?.justification || defaultDrainage.justification,
      emonctoires: Array.isArray(raw.drainage?.emonctoires) && raw.drainage.emonctoires.length > 0
        ? raw.drainage.emonctoires.map((em: any) => ({
            organe: em.organe || "inconnu",
            statut: em.statut || "non_evaluable",
          }))
        : defaultDrainage.emonctoires,
    },
    spasmophilie: {
      detectee: raw.spasmophilie?.detectee ?? false,
      type: raw.spasmophilie?.type,
      nom: raw.spasmophilie?.nom,
      description: raw.spasmophilie?.description,
      mecanisme: raw.spasmophilie?.mecanisme,
      indexCles: Array.isArray(raw.spasmophilie?.indexCles) 
        ? raw.spasmophilie.indexCles 
        : [],
      strategieTherapeutique: raw.spasmophilie?.strategieTherapeutique,
    },
    hypothesesBiologiques: Array.isArray(raw.hypothesesBiologiques) 
      ? raw.hypothesesBiologiques 
      : [],
    warnings: Array.isArray(raw.warnings) ? raw.warnings : [],
    confidenceScore: typeof raw.confidenceScore === "number" 
      ? raw.confidenceScore 
      : 0.7,
  };

  return synthesis;
}

// ========================================
// CONVERSION DiagnosticResponse → BdfSynthesisResponse
// ========================================

function convertDiagnosticToBdfSynthesis(
  diagnostic: DiagnosticResponse,
  guardrails: Guardrails
): BdfSynthesisResponse {
  // Convertir les axes endocriniens
  const axesEndocriniens = (diagnostic.axesEndocriniens || []).map((axe) => ({
    axis: axe.axe,
    status: axe.status,
    mechanism: axe.mecanisme || "",
    biomarkers: axe.sources?.bdf?.index ? [axe.sources.bdf.index] : [],
    therapeuticImplication: axe.implication_therapeutique,
  }));

  // Déterminer le profil neuro-végétatif
  const neuroVegetatifBio = {
    status: diagnostic.terrain.profilSNA || "Non évalué",
    dominance: diagnostic.terrain.profilSNA === "Sympathicotonique"
      ? "Sympathique"
      : diagnostic.terrain.profilSNA === "Vagotonique"
        ? "Parasympathique"
        : "Mixte",
    mecanisme: diagnostic.terrain.justification || "",
    indexCles: [] as string[],
  };

  // Convertir le drainage
  const drainage = {
    priorite: diagnostic.drainage.priorite || "faible",
    capaciteTampon: null as number | null,
    necessite: diagnostic.drainage.necessaire,
    dureeSuggeree: diagnostic.drainage.duree_recommandee,
    justification: diagnostic.drainage.emonctoires_prioritaires?.[0]?.justification || "",
    emonctoires: (diagnostic.drainage.emonctoires_prioritaires || []).map((em) => ({
      organe: em.emonctoire,
      statut: em.justification ? "sollicité" : "normal",
    })),
  };

  // Convertir la spasmophilie
  const spasmophilie = {
    detectee: diagnostic.spasmophilie.detectee,
    type: diagnostic.spasmophilie.type_probable,
    description: diagnostic.spasmophilie.arguments?.join(". "),
    indexCles: [] as string[],
    strategieTherapeutique: diagnostic.spasmophilie.recommendations?.join(". "),
  };

  return {
    terrain: {
      axeDominant: diagnostic.terrain.axeDominant,
      profilSNA: diagnostic.terrain.profilSNA,
      description: diagnostic.terrain.description,
      justification: diagnostic.terrain.justification,
      mecanismesCles: diagnostic.terrain.terrainsPrincipaux,
    },
    axesEndocriniens,
    neuroVegetatifBio,
    drainage,
    spasmophilie,
    hypothesesBiologiques: diagnostic.examens_complementaires || [],
    warnings: [...(diagnostic.warnings || []), ...guardrails.warnings],
    confidenceScore: diagnostic.confidenceScore || 0.7,
  };
}

// ========================================
// ROUTE HANDLER
// ========================================

export async function POST(req: NextRequest) {
  try {
    // Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { bdfAnalysisId } = body;

    if (!bdfAnalysisId) {
      return NextResponse.json({ error: "bdfAnalysisId requis" }, { status: 400 });
    }

    // Récupérer l'analyse BdF existante
    const bdfAnalysis = await prisma.bdfAnalysis.findFirst({
      where: {
        id: bdfAnalysisId,
        patient: { userId: session.user.id },
      },
      include: { patient: true },
    });

    if (!bdfAnalysis) {
      return NextResponse.json({ error: "Analyse BdF non trouvée" }, { status: 404 });
    }

    console.log("═".repeat(60));
    console.log("🧬 SYNTHÈSE BdF HYBRIDE V2");
    console.log("═".repeat(60));
    console.log(`Patient: ${bdfAnalysis.patient.prenom} ${bdfAnalysis.patient.nom}`);

    // Récupérer les données
    const inputs = (bdfAnalysis.inputs as Record<string, number>) || {};
    const indexes = (bdfAnalysis.indexes as Record<string, any>) || {};

    // ========================================
    // ÉTAPE 1: GARDE-FOUS
    // ========================================
    
    const guardrails = calculateGuardrails(indexes, inputs);
    
    console.log("⚠️ Warnings:", guardrails.warnings);
    console.log("🚫 Constraints:", guardrails.constraints);

    // ========================================
    // ÉTAPE 2: PRÉPARER LES DONNÉES POUR L'ASSISTANT
    // ========================================

    const patientAge = bdfAnalysis.patient.dateNaissance
      ? Math.floor((Date.now() - new Date(bdfAnalysis.patient.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 40;
    const patientSexe = (bdfAnalysis.patient.sexe === "F" ? "F" : "H") as "H" | "F";

    // Préparer les données patient pour l'IA
    const patientData = {
      id: bdfAnalysis.patient.id,
      nom: bdfAnalysis.patient.nom,
      prenom: bdfAnalysis.patient.prenom,
      dateNaissance: bdfAnalysis.patient.dateNaissance,
      sexe: patientSexe,
      allergies: bdfAnalysis.patient.allergies,
      traitementActuel: bdfAnalysis.patient.traitementActuel,
      atcdMedicaux: bdfAnalysis.patient.atcdMedicaux,
      motifConsultation: bdfAnalysis.patient.notes || "",
    };

    // Extraire les valeurs numériques des index (peuvent être des objets {value: number, status: string})
    const indexValues: Record<string, number> = {};
    for (const [key, value] of Object.entries(indexes)) {
      if (typeof value === "number") {
        indexValues[key] = value;
      } else if (value && typeof value === "object" && "value" in value) {
        indexValues[key] = value.value;
      } else if (value && typeof value === "object" && "valeur" in value) {
        indexValues[key] = value.valeur;
      }
    }

    console.log(`📊 [BdF Synthesis] ${Object.keys(indexValues).length} index extraits`);

    // Construire le contexte complet pour l'IA (BdF seule, sans interrogatoire)
    const aiReadyData = prepareFullContextForAI(
      patientData,
      null, // Pas d'interrogatoire (BdF seule)
      indexValues
    );

    console.log(`🧬 [BdF Synthesis] Type: ${aiReadyData.meta.type_synthese}`);

    // ========================================
    // ÉTAPE 3: APPELER L'ASSISTANT UNIFIÉ
    // ========================================

    console.log("🤖 Appel callDiagnosticAssistant (même pipeline que unified-analysis)");
    const startTime = Date.now();
    const diagnosticResponse = await callDiagnosticAssistant(aiReadyData);
    const duration = Date.now() - startTime;

    console.log(`✅ [BdF Synthesis] Diagnostic généré en ${duration}ms (confiance: ${diagnosticResponse.confidenceScore})`);

    // ========================================
    // ÉTAPE 4: CONVERTIR EN FORMAT BdfSynthesisResponse
    // ========================================

    const synthesis = convertDiagnosticToBdfSynthesis(diagnosticResponse, guardrails);

    console.log("✅ Synthèse convertie avec terrain:", synthesis.terrain.axeDominant);

    // ========================================
    // ÉTAPE 5: SAUVEGARDER
    // ========================================

    await prisma.bdfAnalysis.update({
      where: { id: bdfAnalysisId },
      data: {
        summary: JSON.stringify({
          synthesisVS: synthesis,
          diagnosticResponse: diagnosticResponse, // Garder aussi la réponse originale pour debug
          generatedAt: new Date().toISOString(),
          version: "CONSOLIDATED_V3", // Nouvelle version consolidée
          guardrails: guardrails,
        }),
      },
    });

    console.log("✅ Synthèse consolidée V3 sauvegardée (même pipeline que unified-analysis)");

    return NextResponse.json({
      success: true,
      synthesis: synthesis,
      guardrails: guardrails,
      bdfAnalysisId: bdfAnalysisId,
    });

  } catch (e: any) {
    console.error("❌ Erreur synthèse BdF:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ========================================
// HEALTHCHECK
// ========================================

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "CONSOLIDATED_V3",
    pipeline: "callDiagnosticAssistant (unifié)",
    features: [
      "Même pipeline que unified-analysis",
      "DiagnosticResponse converti en BdfSynthesisResponse",
      "Garde-fous conservés",
      "Cohérence garantie entre BdF et Synthèse unifiée"
    ]
  });
}
