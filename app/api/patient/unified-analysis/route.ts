// app/api/patient/unified-analysis/route.ts
// API pour générer une synthèse unifiée (BdF + Interrogatoire) via l'Assistant GPT

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepareFullContextForAI } from "@/lib/ai/prepareDataForAI";
import { callDiagnosticAssistant, AssistantError } from "@/lib/ai/assistantDiagnostic";
import type { DiagnosticResponse } from "@/lib/ai/assistantDiagnostic";

// ========================================
// TYPES
// ========================================

interface UnifiedAnalysisRequest {
  patientId: string;
  forceRefresh?: boolean; // Si true, recalcule même si une synthèse existe
  includeInterrogatoire?: boolean; // Si false, ignore l'interrogatoire même s'il existe
}

interface UnifiedAnalysisResponse {
  success: boolean;
  patientId: string;
  type_analyse: "unifiee" | "bdf_seule" | "interro_seule";
  diagnostic: DiagnosticResponse;
  cached: boolean;
  generatedAt: string;
}

// ========================================
// POST : Générer une synthèse unifiée
// ========================================

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 2. Valider la requête
    const body = await req.json();
    const { patientId, forceRefresh = false, includeInterrogatoire = true } = body as UnifiedAnalysisRequest;

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId requis", code: "MISSING_PATIENT_ID" },
        { status: 400 }
      );
    }

    // 3. Charger le patient avec toutes ses données
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        bdfAnalyses: {
          orderBy: { createdAt: "desc" },
          take: 1, // Dernière BdF
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient introuvable", code: "PATIENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 4. Vérifier l'autorisation (le patient appartient à l'utilisateur)
    if (!patient.user || patient.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 5. Vérifier qu'on a au moins une source de données
    const interrogatoire = patient.interrogatoire as any;
    const hasBdf = patient.bdfAnalyses && patient.bdfAnalyses.length > 0;

    // Vérifier si au moins un axe a des réponses
    const interroExists = interrogatoire?.v2?.answersByAxis &&
                       Object.values(interrogatoire.v2.answersByAxis).some(
                         (axis: any) => axis && Object.keys(axis).length > 0
                       );

    // Utiliser l'interrogatoire seulement si demandé ET disponible
    const hasInterro = interroExists && includeInterrogatoire;

    console.log(`[UnifiedAnalysis] Debug - interrogatoire présent:`, !!interrogatoire);
    console.log(`[UnifiedAnalysis] Debug - v2 présent:`, !!interrogatoire?.v2);
    console.log(`[UnifiedAnalysis] Debug - answersByAxis présent:`, !!interrogatoire?.v2?.answersByAxis);
    console.log(`[UnifiedAnalysis] Debug - interroExists:`, interroExists);
    console.log(`[UnifiedAnalysis] Debug - includeInterrogatoire:`, includeInterrogatoire);
    console.log(`[UnifiedAnalysis] Debug - hasInterro (final):`, hasInterro);

    if (!hasBdf && !hasInterro) {
      return NextResponse.json(
        { 
          error: "Aucune donnée disponible. Veuillez remplir l'interrogatoire ou la BdF.",
          code: "NO_DATA"
        },
        { status: 400 }
      );
    }

    // 6. Vérifier le cache (synthèse existante récente)
    // Si forceRefresh = false, vérifier si une synthèse récente existe
    if (!forceRefresh) {
      const lastSynthesis = await prisma.unifiedSynthesis.findFirst({
        where: { patientId, isLatest: true },
        orderBy: { createdAt: "desc" },
      });

      if (lastSynthesis) {
        // Vérifier si les données ont changé depuis la dernière synthèse
        const lastBdfUpdate = hasBdf ? patient.bdfAnalyses[0].updatedAt : null;
        const dataNotChanged = !lastBdfUpdate || new Date(lastBdfUpdate) <= new Date(lastSynthesis.createdAt);

        // Si les données n'ont pas changé et la synthèse a moins de 24h, retourner le cache
        const synthesisAge = Date.now() - new Date(lastSynthesis.createdAt).getTime();
        const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 heures

        if (dataNotChanged && synthesisAge < MAX_CACHE_AGE) {
          console.log(`[UnifiedAnalysis] 📦 Cache valide trouvé (${Math.round(synthesisAge / 60000)} min)`);

          return NextResponse.json({
            success: true,
            patientId,
            type_analyse: (lastSynthesis.content as any)?.meta?.type_analyse || "unifiee",
            diagnostic: lastSynthesis.content,
            cached: true,
            generatedAt: lastSynthesis.createdAt.toISOString(),
          });
        }
      }
    }

    console.log(`[UnifiedAnalysis] Patient ${patientId} - BdF: ${hasBdf}, Interro: ${hasInterro}`);

    // 7. Préparer les données patient
    const patientData = {
      id: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      dateNaissance: patient.dateNaissance,
      sexe: (patient.sexe as "H" | "F" | "M") || interrogatoire?.sexe || "F",
      allergies: patient.allergies,
      traitementActuel: patient.traitementActuel,
      atcdMedicaux: patient.atcdMedicaux,
      motifConsultation: patient.notes || "", // Utiliser notes comme motif
    };

    // 8. Préparer les données BdF (si disponibles)
    // ⚠️ IMPORTANT: Les index sont stockés comme des objets {value: number, status: string}
    // Il faut extraire les valeurs numériques AVANT de les passer à prepareFullContextForAI
    let bdfIndexValues: Record<string, number> | null = null;

    if (hasBdf) {
      const lastBdf = patient.bdfAnalyses[0];
      const rawIndexes = lastBdf.indexes as Record<string, any> || {};
      const bdfAxes = lastBdf.axes as string[] || [];

      // Extraire les valeurs numériques des index
      bdfIndexValues = {};
      for (const [key, value] of Object.entries(rawIndexes)) {
        if (typeof value === "number") {
          bdfIndexValues[key] = value;
        } else if (value && typeof value === "object" && "value" in value && typeof value.value === "number") {
          bdfIndexValues[key] = value.value;
        } else if (value && typeof value === "object" && "valeur" in value && typeof value.valeur === "number") {
          bdfIndexValues[key] = value.valeur;
        }
      }

      console.log(`[UnifiedAnalysis] 📊 ${Object.keys(bdfIndexValues).length} index extraits de la BdF`);
      // Log pour debug de l'index thyroïdien
      if (bdfIndexValues["idx_thyroidien"]) {
        console.log(`[UnifiedAnalysis] 📊 idx_thyroidien = ${bdfIndexValues["idx_thyroidien"]}`);
      }
    }

    // 9. Préparer les données Interrogatoire (si disponibles)
    let interroData = undefined;
    if (hasInterro) {
      const answersByAxis = interrogatoire.v2.answersByAxis;
      const sexePatient = (patientData.sexe === "F" ? "F" : "H") as "H" | "F";
      
      // Utiliser prepareInterrogatoireForAI pour formater
      const { prepareInterrogatoireForAI } = await import("@/lib/ai/prepareDataForAI");
      interroData = prepareInterrogatoireForAI(answersByAxis, sexePatient);
    }

    // 10. Construire le contexte complet pour l'IA
    // ⚠️ On passe bdfIndexValues (valeurs numériques extraites) au lieu des objets bruts
    const aiReadyData = prepareFullContextForAI(
      patientData,
      hasInterro ? interrogatoire.v2.answersByAxis : null,
      bdfIndexValues // Valeurs numériques extraites, pas les objets bruts
    );

    console.log(`[UnifiedAnalysis] Type synthèse: ${aiReadyData.meta.type_synthese}`);

    // 11. Appeler l'Assistant GPT
    const startTime = Date.now();
    const diagnostic = await callDiagnosticAssistant(aiReadyData);
    const duration = Date.now() - startTime;

    console.log(`[UnifiedAnalysis] ✅ Diagnostic généré en ${duration}ms (confiance: ${diagnostic.confidenceScore})`);

    // 12. Sauvegarder le DiagnosticResponse en BDD (pour le flux séquentiel Diagnostic → Ordonnance)
    // Marquer les anciennes synthèses comme non-latest
    await prisma.unifiedSynthesis.updateMany({
      where: { patientId, isLatest: true },
      data: { isLatest: false },
    });

    // Créer la nouvelle synthèse
    const savedSynthesis = await prisma.unifiedSynthesis.create({
      data: {
        patientId,
        content: diagnostic as any, // DiagnosticResponse stocké en JSON
        modelUsed: "Assistant-Diagnostic-v1",
        version: 2,
        isLatest: true,
      },
    });

    console.log(`[UnifiedAnalysis] 💾 Synthèse sauvegardée: ${savedSynthesis.id}`);

    // 13. Retourner la réponse
    const response: UnifiedAnalysisResponse = {
      success: true,
      patientId,
      type_analyse: aiReadyData.meta.type_synthese,
      diagnostic,
      cached: false,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("[UnifiedAnalysis] ❌ Erreur:", error);

    // Gérer les erreurs spécifiques de l'Assistant
    if (error instanceof AssistantError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      {
        error: "Erreur lors de la génération de la synthèse",
        code: "INTERNAL_ERROR",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET : Récupérer la dernière synthèse (si cachée)
// ========================================

export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Récupérer patientId
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId requis" },
        { status: 400 }
      );
    }

    // 3. Charger le patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient introuvable" },
        { status: 404 }
      );
    }

    if (!patient.user || patient.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // 4. Vérifier les données disponibles
    const interrogatoire = patient.interrogatoire as any;
    const hasInterro = interrogatoire?.v2?.answersByAxis && 
                       Object.keys(interrogatoire.v2.answersByAxis).length > 0;

    // Pour l'instant, on retourne juste le status des données
    // En production, on pourrait récupérer une synthèse cachée
    return NextResponse.json({
      patientId,
      patientNom: `${patient.nom} ${patient.prenom}`,
      dataAvailable: {
        interrogatoire: hasInterro,
        bdf: false, // À implémenter selon ta structure
      },
      lastSynthesis: null, // À implémenter avec cache
    });

  } catch (error) {
    console.error("[UnifiedAnalysis GET] ❌ Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}