// ========================================
// API RÉCUPÉRATION SYNTHÈSE ENDOBIOGÉNIQUE
// ========================================
// Endpoint pour récupérer la dernière synthèse sauvegardée d'un patient

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/synthese?patientId=xxx
 *
 * Récupère la dernière synthèse globale sauvegardée pour un patient
 *
 * Returns: SyntheseGlobale | null
 */
export async function GET(req: Request) {
  try {
    // 1. Vérifier l'authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Récupérer le patientId depuis l'URL
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId requis" },
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

    // 4. Récupérer la dernière synthèse globale (la plus récente)
    const syntheseGlobale = await prisma.syntheseGlobale.findFirst({
      where: {
        patientId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!syntheseGlobale) {
      return NextResponse.json({
        synthese: null,
        message: "Aucune synthèse sauvegardée pour ce patient",
      });
    }

    console.log("✅ Synthèse récupérée:", syntheseGlobale.id);

    // 5. Convertir les données au format attendu par le composant
    const synthesisResult = {
      analyse_concordance: {
        coherences: extractConcordanceSection(syntheseGlobale.terrainDominant, 'Cohérences'),
        incoherences: extractConcordanceSection(syntheseGlobale.terrainDominant, 'Incohérences'),
        hypotheses: extractConcordanceSection(syntheseGlobale.terrainDominant, 'Hypothèses'),
      },
      mecanismes: syntheseGlobale.mecanismesCommuns,
      strategie_therapeutique: {
        priorites: syntheseGlobale.prioritesTherapeutiques,
        objectifs: [syntheseGlobale.pronostic],
        precautions: syntheseGlobale.signesDAlarme,
      },
      ordonnance: {
        phytotherapie: parseplantesMajeures(syntheseGlobale.plantesMajeures, 'TM'),
        gemmotherapie: parseplantesMajeures(syntheseGlobale.plantesMajeures, 'MG'),
        aromatherapie: [],
        conseils_hygiene: syntheseGlobale.hygieneDeVie,
      },
      metadata: {
        generatedAt: syntheseGlobale.createdAt.toISOString(),
        model: "saved-from-db",
        tokens: 0,
        userId: session.user.id,
        syntheseId: syntheseGlobale.id,
        nombreAxesAnalyses: syntheseGlobale.nombreAxesAnalyses,
        inclusBiologieFonction: syntheseGlobale.inclusBiologieFonction,
        confiance: syntheseGlobale.confiance,
      },
    };

    return NextResponse.json({
      synthese: synthesisResult,
      syntheseGlobale, // Données brutes pour debug
    });

  } catch (error: any) {
    console.error("❌ Erreur récupération synthèse:", error);

    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de la synthèse",
        details: error?.message || "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Extrait une section du texte resumeGlobal
 * Ex: "Cohérences: texte..." -> ["texte..."]
 */
function extractConcordanceSection(text: string, section: string): string[] {
  if (!text) return [];

  const regex = new RegExp(`${section}:\\s*([^\\n]+)`, 'i');
  const match = text.match(regex);

  if (match && match[1]) {
    return [match[1].trim()];
  }

  return [];
}

/**
 * Parse les plantes majeures et extrait celles correspondant au type
 * Ex: "Avena sativa TM - Tonique" -> { plante: "Avena sativa TM", justification: "Tonique" }
 */
function parseplantesMajeures(plantes: any, type: 'TM' | 'MG'): any[] {
  if (!Array.isArray(plantes)) return [];

  return plantes
    .filter((plante: string) => plante.includes(type))
    .map((plante: string) => {
      const parts = plante.split(' - ');
      const nom = parts[0] || plante;
      const justification = parts[1] || '';

      return {
        plante: nom,
        forme: type === 'TM' ? 'Teinture-Mère' : 'Macérat Glycériné',
        posologie: 'Selon prescription',
        duree: '3 mois',
        justification,
      };
    });
}
