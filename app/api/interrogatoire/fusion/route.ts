// ========================================
// API FUSION MULTI-AXES CLINIQUES
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";
import { scoreInterrogatoire, ClinicalAxeScores } from "@/lib/interrogatoire/clinicalScoring";
import { fuseClinicalBdfRag, BdfIndexes, RagContext, FusedAxePerturbation } from "@/lib/ordonnance/fusionClinique";
import type { IndexResults, LabValues } from "@/lib/bdf/types";

/**
 * Schéma de validation pour la requête
 */
const FusionRequestSchema = z.object({
  patientId: z.string().cuid(),
  bdfAnalysisId: z.string().cuid().optional(), // Optionnel : BdF spécifique
});

/**
 * POST /api/interrogatoire/fusion
 *
 * Fusionne les 4 sources (Clinique + BdF + RAG + IA) pour obtenir une synthèse
 * des axes perturbés SANS générer d'ordonnance.
 *
 * Permet de visualiser la fusion AVANT la génération thérapeutique.
 *
 * Body: { patientId: string, bdfAnalysisId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 2. Validation du body
    const body = await req.json();
    const validatedData = FusionRequestSchema.parse(body);
    const { patientId, bdfAnalysisId } = validatedData;

    // 3. Récupération du patient avec toutes les données nécessaires
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: session.user.id,
      },
      include: {
        bdfAnalyses: {
          orderBy: { date: "desc" },
          take: 1, // Plus récente par défaut
        },
        axeInterpretations: true, // Interprétations IA
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient introuvable" },
        { status: 404 }
      );
    }

    console.log(`🔀 [Fusion Multi-Axes] Patient: ${patient.nom} ${patient.prenom}`);

    // 4. Récupération de l'interrogatoire
    const interrogatoire = patient.interrogatoire as InterrogatoireEndobiogenique | null;

    let clinicalScores: ClinicalAxeScores | null = null;

    if (interrogatoire) {
      console.log("📋 Interrogatoire trouvé, calcul des scores cliniques...");
      clinicalScores = scoreInterrogatoire(interrogatoire);
    } else {
      console.log("⚠️ Aucun interrogatoire trouvé");
    }

    // 5. Récupération de la BdF
    let bdfAnalysis = null;
    let indexes: IndexResults | null = null;

    if (bdfAnalysisId) {
      // BdF spécifique fournie
      bdfAnalysis = await prisma.bdfAnalysis.findFirst({
        where: {
          id: bdfAnalysisId,
          patientId,
        },
      });
    } else if (patient.bdfAnalyses.length > 0) {
      // Prendre la plus récente
      bdfAnalysis = patient.bdfAnalyses[0];
    }

    if (bdfAnalysis) {
      console.log(`📊 Analyse BdF trouvée: ${bdfAnalysis.id}`);
      const indexesArray = bdfAnalysis.indexes as any[];
      indexes = {
        indexGenital: indexesArray.find((i: any) => i.name === "indexGenital") || { value: null, comment: "" },
        indexThyroidien: indexesArray.find((i: any) => i.name === "indexThyroidien") || { value: null, comment: "" },
        gT: indexesArray.find((i: any) => i.name === "gT") || { value: null, comment: "" },
        indexAdaptation: indexesArray.find((i: any) => i.name === "indexAdaptation") || { value: null, comment: "" },
        indexOestrogenique: indexesArray.find((i: any) => i.name === "indexOestrogenique") || { value: null, comment: "" },
        turnover: indexesArray.find((i: any) => i.name === "turnover") || { value: null, comment: "" },
        rendementThyroidien: indexesArray.find((i: any) => i.name === "rendementThyroidien") || { value: null, comment: "" },
        remodelageOsseux: indexesArray.find((i: any) => i.name === "remodelageOsseux") || { value: null, comment: "" },
      };
    } else {
      console.log("⚠️ Aucune analyse BdF trouvée");
    }

    // 6. Vérifier qu'on a au moins une source de données
    if (!interrogatoire && !bdfAnalysis) {
      return NextResponse.json(
        {
          error: "Aucune donnée disponible",
          message: "Le patient doit avoir au minimum un interrogatoire ou une analyse BdF",
        },
        { status: 400 }
      );
    }

    // 7. Construire BdfIndexes pour la fusion
    const bdfIndexes: BdfIndexes = indexes ? {
      indexThyroidien: indexes.indexThyroidien.value ?? undefined,
      indexAdaptation: indexes.indexAdaptation.value ?? undefined,
      indexGenital: indexes.indexGenital.value ?? undefined,
      indexGenitoThyroidien: indexes.gT.value ?? undefined,
      indexOestrogenique: indexes.indexOestrogenique.value ?? undefined,
      indexTurnover: indexes.turnover.value ?? undefined,
      indexRendementThyroidien: indexes.rendementThyroidien.value ?? undefined,
      indexRemodelageOsseux: indexes.remodelageOsseux.value ?? undefined,
    } : {};

    // 8. Construire RagContext
    const ragAxes = bdfAnalysis?.axes as string[] || [];
    const ragSummary = bdfAnalysis?.summary || "";
    const ragContext: RagContext = {
      axes: [], // TODO: parser ragAxes pour structure complète
      resume: ragSummary,
    };

    // 9. Charger les interprétations IA stockées
    const storedInterpretations = patient.axeInterpretations || [];
    console.log(`🤖 ${storedInterpretations.length} interprétations IA disponibles`);

    // Convertir au format attendu par la fusion
    const interpretationsMap: Record<string, any> = {};
    storedInterpretations.forEach((interp: any) => {
      interpretationsMap[interp.axe] = {
        orientation: interp.orientation,
        mecanismes: interp.mecanismes as string[],
        prudences: interp.prudences as string[],
        modulateurs: interp.modulateurs as string[],
        resumeClinique: interp.resumeClinique,
        confiance: interp.confiance,
      };
    });

    // 10. FUSION MULTI-SOURCES
    let axesFusionnes: FusedAxePerturbation[] = [];

    if (interrogatoire && clinicalScores) {
      axesFusionnes = fuseClinicalBdfRag(
        interrogatoire,
        clinicalScores,
        bdfIndexes,
        ragContext,
        interpretationsMap
      );

      console.log(`✅ Fusion complète : ${axesFusionnes.length} axes perturbés identifiés`);
    } else if (bdfAnalysis) {
      // Cas BdF seule : créer une fusion minimale à partir de la BdF
      console.log("⚠️ Fusion basée uniquement sur BdF (pas d'interrogatoire)");
      // La fusion sera gérée dans fuseClinicalBdfRag avec interrogatoire null
    }

    // 11. Générer la synthèse narrative
    const syntheseNarrative = generateSyntheseNarrative(axesFusionnes, patient.sexe as "M" | "F");

    // 12. Calculer la cohérence globale
    const coherenceGlobale = calculateCoherenceGlobale(axesFusionnes, storedInterpretations);

    // 13. Générer des recommandations générales (NON thérapeutiques)
    const recommandationsGenerales = generateRecommandationsGenerales(axesFusionnes);

    // 14. Déterminer les sources utilisées
    const sourcesUtilisees = {
      interrogatoire: !!interrogatoire,
      bdf: !!bdfAnalysis,
      interpretationsIA: storedInterpretations.length > 0,
      rag: !!ragSummary,
    };

    // 15. Retourner la fusion complète
    return NextResponse.json({
      success: true,
      patientId,
      sourcesUtilisees,
      nbAxesInterpretes: storedInterpretations.length,
      axesFusionnes: axesFusionnes.map(axe => ({
        axe: axe.axe,
        niveau: axe.niveau,
        score: axe.score,
        confiance: axe.confiance,
        sources: axe.sources,
        justification: axe.justification,
        commentaireFusion: axe.commentaireFusion,
        interpretationIA: axe.interpretationIA ? {
          orientation: axe.interpretationIA.orientation,
          mecanismes: axe.interpretationIA.mecanismes,
          prudences: axe.interpretationIA.prudences,
          modulateurs: axe.interpretationIA.modulateurs,
          resumeClinique: axe.interpretationIA.resumeClinique,
          confiance: axe.interpretationIA.confiance,
        } : null,
      })),
      syntheseNarrative,
      coherenceGlobale,
      recommandationsGenerales,
    });
  } catch (error: any) {
    console.error("❌ [API /interrogatoire/fusion] Erreur:", error);

    // Erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      {
        error: "Erreur lors de la fusion des axes",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Génère une synthèse narrative de 2-3 phrases maximum
 */
function generateSyntheseNarrative(
  axesFusionnes: FusedAxePerturbation[],
  sexe: "M" | "F"
): string {
  if (axesFusionnes.length === 0) {
    return "Aucun déséquilibre majeur identifié sur les axes endobiogéniques.";
  }

  // Trier par score décroissant
  const axesTriés = [...axesFusionnes].sort((a, b) => b.score - a.score);

  // Prendre les 2-3 axes les plus perturbés
  const axesPrincipaux = axesTriés.slice(0, 3);

  const descriptions = axesPrincipaux.map(axe => {
    const axeLabel = axe.axe === "corticotrope" ? "axe adaptatif" :
                     axe.axe === "thyroidien" ? "axe thyroïdien" :
                     axe.axe === "gonadotrope" ? "axe gonadique" :
                     axe.axe === "somatotrope" ? "sphère digestive/immunitaire" : axe.axe;

    return `${axeLabel} (${axe.niveau})`;
  });

  let synthese = `${sexe === "F" ? "La patiente" : "Le patient"} présente des déséquilibres principalement sur ${descriptions.join(", ")}.`;

  // Ajouter mention de la confiance si élevée
  const nbConfianceElevee = axesPrincipaux.filter(a => a.confiance === "elevee").length;
  if (nbConfianceElevee >= 2) {
    synthese += ` Ces orientations sont confirmées par plusieurs sources convergentes.`;
  }

  return synthese;
}

/**
 * Calcule la cohérence globale (0.0 - 1.0)
 */
function calculateCoherenceGlobale(
  axesFusionnes: FusedAxePerturbation[],
  interpretations: any[]
): number {
  if (axesFusionnes.length === 0) return 0;

  // Moyenne des confiances IA disponibles
  const confiancesIA = interpretations
    .map((i: any) => i.confiance)
    .filter((c: number) => c > 0);

  const moyenneConfianceIA = confiancesIA.length > 0
    ? confiancesIA.reduce((sum: number, c: number) => sum + c, 0) / confiancesIA.length
    : 0.5;

  // Proportion d'axes avec confiance élevée dans la fusion
  const nbConfianceElevee = axesFusionnes.filter(a => a.confiance === "elevee").length;
  const ratioConfianceElevee = nbConfianceElevee / axesFusionnes.length;

  // Cohérence = moyenne pondérée
  return Math.round((moyenneConfianceIA * 0.6 + ratioConfianceElevee * 0.4) * 100) / 100;
}

/**
 * Génère des recommandations générales NON thérapeutiques
 */
function generateRecommandationsGenerales(axesFusionnes: FusedAxePerturbation[]): string[] {
  const recommandations: string[] = [];

  axesFusionnes.forEach(axe => {
    if (axe.axe === "corticotrope" && axe.niveau === "hyper") {
      recommandations.push("Gestion du stress chronique : techniques de relaxation, cohérence cardiaque, sommeil réparateur");
    }
    if (axe.axe === "thyroidien" && axe.niveau === "hypo") {
      recommandations.push("Support thyroïdien : éviter les perturbateurs endocriniens, apport nutritionnel adapté");
    }
    if (axe.axe === "somatotrope" && axe.score >= 6) {
      recommandations.push("Santé digestive : alimentation anti-inflammatoire, hydratation, microbiote équilibré");
    }
    if (axe.confiance === "elevee" && axe.score >= 7) {
      recommandations.push(`Suivi prioritaire de l'axe ${axe.axe} (déséquilibre confirmé)`);
    }
  });

  // Limiter à 5 recommandations max
  return recommandations.slice(0, 5);
}
