// ========================================
// API BDF ANALYSIS - /api/patients/[id]/bdf-analyses
// ========================================
// POST : Créer une analyse BdF pour un patient
// Enregistre inputs, indexes, summary, axes et ragText

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

type BdfAnalysisRequest = {
  inputs: Record<string, number>;
  indexes: Array<{
    name: string;
    value: number | null;
    comment: string;
  }>;
  summary: string;
  axes: string[];
  ragText: string | null;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id: patientId } = await params;
    const body: BdfAnalysisRequest = await req.json();

    // Validation
    if (!body.inputs || !body.indexes || !body.summary || !body.axes) {
      return NextResponse.json(
        { error: "Données BdF incomplètes" },
        { status: 400 }
      );
    }

    // Vérifier que le patient existe et appartient à l'utilisateur
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: session.user.id,
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    // Créer l'analyse BdF
    const bdfAnalysis = await prisma.bdfAnalysis.create({
      data: {
        patientId,
        inputs: body.inputs,
        indexes: body.indexes,
        summary: body.summary,
        axes: body.axes,
        ragText: body.ragText || null,
      },
    });

    console.log(`✅ Analyse BdF créée pour patient ${patient.nom} ${patient.prenom} (${patient.numeroPatient})`);

    return NextResponse.json({
      id: bdfAnalysis.id,
      patientId: bdfAnalysis.patientId,
      date: bdfAnalysis.date,
    });
  } catch (e: any) {
    console.error("Erreur création analyse BdF:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}
