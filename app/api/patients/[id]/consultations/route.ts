// ========================================
// API CONSULTATIONS - /api/patients/[id]/consultations
// ========================================
// GET  : Historique des consultations d'un patient
// POST : Créer une nouvelle consultation (associer une analyse BdF)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Consultation, ConsultationCreateInput } from "@/types/patient";

export const runtime = "nodejs";

/**
 * GET /api/patients/[id]/consultations
 * Récupérer l'historique des consultations d'un patient
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id: patientId } = await params;

    // Vérifier que le patient appartient au praticien
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { userId: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    if (patient.userId !== userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer les consultations
    const consultations = await prisma.consultation.findMany({
      where: { patientId },
      orderBy: { dateConsultation: "desc" },
    });

    // Formatter la réponse
    const response: Consultation[] = consultations.map((c) => ({
      id: c.id,
      patientId: c.patientId,
      dateConsultation: c.dateConsultation.toISOString(),
      type: c.type as "initiale" | "suivi" | "urgence" | null,
      motifConsultation: c.motifConsultation,
      inputs: c.inputs as any,
      indexes: c.indexes as any,
      summary: c.summary,
      axes: c.axes as string[],
      ragText: c.ragText,
      commentaire: c.commentaire,
      prescriptions: c.prescriptions,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Erreur GET /api/patients/[id]/consultations:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients/[id]/consultations
 * Créer une nouvelle consultation (associer une analyse BdF à un patient)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id: patientId } = await params;

    // Vérifier que le patient appartient au praticien
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { userId: true, isArchived: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    if (patient.userId !== userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    if (patient.isArchived) {
      return NextResponse.json(
        { error: "Impossible de créer une consultation pour un patient archivé" },
        { status: 400 }
      );
    }

    // Récupérer les données du body
    const body: ConsultationCreateInput = await req.json();

    // Validation
    if (!body.inputs || !body.indexes || !body.summary || !body.axes) {
      return NextResponse.json(
        { error: "Données BdF incomplètes" },
        { status: 400 }
      );
    }

    // Créer la consultation
    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        dateConsultation: body.dateConsultation
          ? new Date(body.dateConsultation)
          : new Date(),
        type: body.type || null,
        motifConsultation: body.motifConsultation?.trim() || null,
        inputs: body.inputs as any,
        indexes: body.indexes as any,
        summary: body.summary.trim(),
        axes: body.axes as any,
        ragText: body.ragText?.trim() || null,
        commentaire: body.commentaire?.trim() || null,
        prescriptions: body.prescriptions?.trim() || null,
      },
    });

    // Formatter la réponse
    const response: Consultation = {
      id: consultation.id,
      patientId: consultation.patientId,
      dateConsultation: consultation.dateConsultation.toISOString(),
      type: consultation.type as "initiale" | "suivi" | "urgence" | null,
      motifConsultation: consultation.motifConsultation,
      inputs: consultation.inputs as any,
      indexes: consultation.indexes as any,
      summary: consultation.summary,
      axes: consultation.axes as string[],
      ragText: consultation.ragText,
      commentaire: consultation.commentaire,
      prescriptions: consultation.prescriptions,
      createdAt: consultation.createdAt.toISOString(),
      updatedAt: consultation.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/patients/[id]/consultations:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}