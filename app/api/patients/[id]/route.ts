// ========================================
// API PATIENT [ID] - /api/patients/[id]
// ========================================
// GET    : Détail d'un patient + historique consultations
// PUT    : Modifier un patient
// DELETE : Archiver un patient (soft delete)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Patient, PatientUpdateInput } from "@/types/patient";

export const runtime = "nodejs";

/**
 * GET /api/patients/[id]
 * Récupérer les détails d'un patient
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

const { id } = await params;

    // Récupérer le patient avec ses consultations
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { dateConsultation: "desc" },
          select: {
            id: true,
            dateConsultation: true,
            type: true,
            motifConsultation: true,
            summary: true,
            axes: true,
            commentaire: true,
            createdAt: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le patient appartient bien au praticien
    if (patient.userId !== userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Formatter la réponse
    const response: Patient = {
      id: patient.id,
      userId: patient.userId,
      numeroPatient: patient.numeroPatient,
      nom: patient.nom,
      prenom: patient.prenom,
      dateNaissance: patient.dateNaissance?.toISOString() || null,
      sexe: patient.sexe as "H" | "F" | "Autre" | null,
      telephone: patient.telephone,
      email: patient.email,
      notes: patient.notes,
      consentementRGPD: patient.consentementRGPD,
      dateConsentement: patient.dateConsentement?.toISOString() || null,
      isArchived: patient.isArchived,
      archivedAt: patient.archivedAt?.toISOString() || null,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
      consultations: patient.consultations.map((c) => ({
        id: c.id,
        patientId: patient.id,
        dateConsultation: c.dateConsultation.toISOString(),
        type: c.type as "initiale" | "suivi" | "urgence" | null,
        motifConsultation: c.motifConsultation,
        inputs: {},
        indexes: [],
        summary: c.summary,
        axes: c.axes as string[],
        ragText: null,
        commentaire: c.commentaire,
        prescriptions: null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Erreur GET /api/patients/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/patients/[id]
 * Modifier un patient
 */
export async function PUT(
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

const { id } = await params;
    const body: PatientUpdateInput = await req.json();

    // Vérifier que le patient existe et appartient au praticien
    const existing = await prisma.patient.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Mettre à jour le patient
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...(body.nom && { nom: body.nom.trim() }),
        ...(body.prenom && { prenom: body.prenom.trim() }),
        ...(body.dateNaissance !== undefined && {
          dateNaissance: body.dateNaissance
            ? new Date(body.dateNaissance)
            : null,
        }),
        ...(body.sexe !== undefined && { sexe: body.sexe }),
        ...(body.telephone !== undefined && {
          telephone: body.telephone?.trim() || null,
        }),
        ...(body.email !== undefined && {
          email: body.email?.trim() || null,
        }),
        ...(body.notes !== undefined && {
          notes: body.notes?.trim() || null,
        }),
        ...(body.consentementRGPD !== undefined && {
          consentementRGPD: body.consentementRGPD,
          dateConsentement:
            body.consentementRGPD ? new Date() : null,
        }),
      },
    });

    // Formatter la réponse
    const response: Patient = {
      id: patient.id,
      userId: patient.userId,
      numeroPatient: patient.numeroPatient,
      nom: patient.nom,
      prenom: patient.prenom,
      dateNaissance: patient.dateNaissance?.toISOString() || null,
      sexe: patient.sexe as "H" | "F" | "Autre" | null,
      telephone: patient.telephone,
      email: patient.email,
      notes: patient.notes,
      consentementRGPD: patient.consentementRGPD,
      dateConsentement: patient.dateConsentement?.toISOString() || null,
      isArchived: patient.isArchived,
      archivedAt: patient.archivedAt?.toISOString() || null,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Erreur PUT /api/patients/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patients/[id]
 * Archiver un patient (soft delete - pas de suppression réelle)
 */
export async function DELETE(
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

const { id } = await params;

    // Vérifier que le patient existe et appartient au praticien
    const existing = await prisma.patient.findUnique({
      where: { id },
      select: { userId: true, isArchived: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Archiver (soft delete)
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Patient archivé avec succès",
      id: patient.id,
    });
  } catch (error: any) {
    console.error("Erreur DELETE /api/patients/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}