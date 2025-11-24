// ========================================
// API SAUVEGARDE SYNTHÈSE ENDOBIOGÉNIQUE
// ========================================
// Endpoint pour sauvegarder la synthèse générée en base de données

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/synthese/save
 *
 * Body: {
 *   patientId: string,
 *   synthesisData: SynthesisResult
 * }
 *
 * Returns: { success: boolean, syntheseId: string }
 */
export async function POST(req: Request) {
  try {
    // 1. Vérifier l'authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Parser les données
    const { patientId, synthesisData } = await req.json();

    if (!patientId || !synthesisData) {
      return NextResponse.json(
        { error: "patientId et synthesisData requis" },
        { status: 400 }
      );
    }

    // 3. Vérifier que le patient appartient à l'utilisateur
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: session.user.id,
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé ou accès refusé" },
        { status: 404 }
      );
    }

    // 4. Extraire les données de la synthèse
    const {
      analyse_concordance,
      mecanismes,
      strategie_therapeutique,
      ordonnance,
      metadata,
    } = synthesisData;

    // 5. Préparer les données pour la base
    // Convertir analyse_concordance en arrays si c'est une string
    let coherences: string[] = [];
    let incoherences: string[] = [];
    let hypotheses: string[] = [];

    if (typeof analyse_concordance === 'string') {
      coherences = [analyse_concordance];
    } else if (analyse_concordance) {
      coherences = analyse_concordance.coherences || [];
      incoherences = analyse_concordance.incoherences || [];
      hypotheses = analyse_concordance.hypotheses || [];
    }

    // Préparer le résumé global
    const resumeGlobal = [
      coherences.length > 0 ? `Cohérences: ${coherences.join(' ')}` : '',
      incoherences.length > 0 ? `Incohérences: ${incoherences.join(' ')}` : '',
      hypotheses.length > 0 ? `Hypothèses: ${hypotheses.join(' ')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 500); // Limiter à 500 caractères pour le résumé

    // Préparer les plantes majeures avec justifications
    const plantesMajeures: string[] = [];

    if (ordonnance?.phytotherapie) {
      ordonnance.phytotherapie.forEach((item: any) => {
        plantesMajeures.push(`${item.plante} - ${item.justification}`);
      });
    }
    if (ordonnance?.gemmotherapie) {
      ordonnance.gemmotherapie.forEach((item: any) => {
        plantesMajeures.push(`${item.plante} - ${item.justification}`);
      });
    }

    // 6. Créer la synthèse globale en base
    const syntheseGlobale = await prisma.syntheseGlobale.create({
      data: {
        patientId,
        terrainDominant: resumeGlobal,
        prioritesTherapeutiques: strategie_therapeutique?.priorites || [],
        axesPrincipaux: metadata?.axeScores?.map((a: any) => a.axe) || [],
        mecanismesCommuns: Array.isArray(mecanismes) ? mecanismes : [mecanismes].filter(Boolean),
        plantesMajeures,
        hygieneDeVie: ordonnance?.conseils_hygiene || [],
        signesDAlarme: strategie_therapeutique?.precautions || [],
        pronostic: strategie_therapeutique?.objectifs?.join(' ') || '',
        resumeGlobal,
        nombreAxesAnalyses: metadata?.axeScores?.length || 0,
        inclusBiologieFonction: metadata?.includeBdf || false,
        confiance: 0.8,
      },
    });

    console.log("✅ Synthèse sauvegardée avec succès:", syntheseGlobale.id);

    return NextResponse.json({
      success: true,
      syntheseId: syntheseGlobale.id,
    });

  } catch (error: any) {
    console.error("❌ Erreur sauvegarde synthèse:", error);

    return NextResponse.json(
      {
        error: "Erreur lors de la sauvegarde de la synthèse",
        details: error?.message || "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
