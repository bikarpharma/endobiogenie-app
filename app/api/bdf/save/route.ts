import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAllIndexes } from "@/lib/bdf/calculateIndexes";

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

    // 2. Parser le body
    const body = await req.json();
    const { patientId, inputs, date } = body;

    if (!patientId || !inputs) {
      return NextResponse.json(
        { error: "Données manquantes (patientId, inputs requis)" },
        { status: 400 }
      );
    }

    // 3. Vérifier que le patient appartient à l'utilisateur
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { userId: true }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    if (patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // 4. Calculer les index fonctionnels
    const bdfResult = calculateAllIndexes(inputs);

    // 5. Convertir l'objet indexes en tableau pour manipulation
    const indexesArray = Object.entries(bdfResult.indexes).map(([name, data]) => ({
      name,
      value: data.value,
      status: data.status,
      interpretation: data.interpretation,
    }));

    // 6. Extraire les axes sollicités (index hors normes)
    const indexesAnormaux = indexesArray.filter(
      idx => idx.status === "high" || idx.status === "low"
    );

    const axesSollicites = indexesAnormaux.map(idx => idx.name);

    // 7. Générer un résumé textuel
    const summary = indexesAnormaux.length > 0
      ? `Analyse BdF : ${indexesAnormaux.length} index hors normes détectés. ` +
        `Axes sollicités : ${axesSollicites.join(", ") || "Aucun"}.`
      : "Analyse BdF : Tous les index dans les normes.";

    // 8. Créer l'analyse BdF en base
    const bdfAnalysis = await prisma.bdfAnalysis.create({
      data: {
        patientId,
        date: date ? new Date(date) : new Date(),
        inputs: inputs,
        indexes: bdfResult.indexes,
        summary: summary,
        axes: axesSollicites,
      }
    });

    // 9. Retourner le résultat
    return NextResponse.json({
      success: true,
      analysisId: bdfAnalysis.id,
      message: "Analyse BdF sauvegardée avec succès",
      summary: summary,
      indexCount: indexesArray.length,
      abnormalIndexCount: indexesAnormaux.length
    });

  } catch (error: any) {
    console.error("Erreur sauvegarde BdF:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
