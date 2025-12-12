// ========================================
// API PATIENT [ID] - /api/patients/[id]
// ========================================
// GET    : Détail d'un patient + historique consultations
// PUT    : Modifier un patient (header auth)
// PATCH  : Modifier un patient (session auth)
// DELETE : Archiver un patient (soft delete)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
 * PATCH /api/patients/[id]
 * Modifier un patient (avec authentification session)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // 2. Vérifier que le patient existe et appartient au praticien
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

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // 3. Mettre à jour le patient
    const updateData: any = {};

    if (body.nom !== undefined) updateData.nom = body.nom.trim();
    if (body.prenom !== undefined) updateData.prenom = body.prenom.trim();
    if (body.dateNaissance !== undefined) {
      updateData.dateNaissance = body.dateNaissance ? new Date(body.dateNaissance) : null;
    }
    if (body.sexe !== undefined) updateData.sexe = body.sexe;
    if (body.telephone !== undefined) updateData.telephone = body.telephone?.trim() || null;
    if (body.email !== undefined) updateData.email = body.email?.trim() || null;
    if (body.allergies !== undefined) updateData.allergiesStructured = body.allergies; // PatientAllergyEntry[]
    if (body.allergiesNotes !== undefined) updateData.allergiesNotes = body.allergiesNotes?.trim() || null;
    if (body.atcdMedicaux !== undefined) updateData.atcdMedicaux = body.atcdMedicaux?.trim() || null;
    if (body.atcdChirurgicaux !== undefined) updateData.atcdChirurgicaux = body.atcdChirurgicaux?.trim() || null;
    if (body.traitements !== undefined) updateData.traitements = body.traitements?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    // Contexte enrichi ordonnance
    if (body.pathologiesAssociees !== undefined) updateData.pathologiesAssociees = body.pathologiesAssociees;
    if (body.symptomesActuels !== undefined) updateData.symptomesActuels = body.symptomesActuels;
    if (body.autresBilans !== undefined) updateData.autresBilans = body.autresBilans;
    // Terrain chronique (APCI & maladies chroniques)
    if (body.chronicProfile !== undefined) updateData.chronicProfile = body.chronicProfile;

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    console.log(`✅ Patient mis à jour : ${patient.nom} ${patient.prenom} (ID: ${id})`);

    // 4. Formatter la réponse
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
    console.error("Erreur PATCH /api/patients/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patients/[id]
 * Supprimer définitivement un patient ou l'archiver (soft delete)
 * Query param: ?permanent=true pour suppression définitive
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentification via session (next-auth)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const isPermanent = searchParams.get("permanent") === "true";

    // Vérifier que le patient existe et appartient au praticien
    const existing = await prisma.patient.findUnique({
      where: { id },
      select: { userId: true, isArchived: true, nom: true, prenom: true },
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

    // Suppression définitive (DANGER : toutes les données associées seront supprimées)
    if (isPermanent) {
      await prisma.patient.delete({
        where: { id },
      });

      console.log(`🗑️ Patient supprimé définitivement : ${existing.nom} ${existing.prenom} (ID: ${id})`);

      return NextResponse.json({
        message: "Patient supprimé définitivement",
        id,
        permanent: true,
      });
    }

    // Archiver (soft delete - recommandé)
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    console.log(`📦 Patient archivé : ${existing.nom} ${existing.prenom} (ID: ${id})`);

    return NextResponse.json({
      message: "Patient archivé avec succès",
      id: patient.id,
      permanent: false,
    });
  } catch (error: any) {
    console.error("Erreur DELETE /api/patients/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}