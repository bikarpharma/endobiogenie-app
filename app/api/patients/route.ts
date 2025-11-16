// ========================================
// API PATIENTS - /api/patients
// ========================================
// GET  : Liste des patients du praticien (userId)
// POST : Créer un nouveau patient

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNextNumeroPatient } from "@/types/patient";
import type { PatientCreateInput, PatientListItem } from "@/types/patient";

export const runtime = "nodejs";

/**
 * GET /api/patients
 * Liste les patients du praticien connecté
 * Query params:
 * - archived=true : inclure les patients archivés
 */
export async function GET(req: NextRequest) {
  try {
    // Récupérer userId depuis les headers (auth)
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Paramètres de requête
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("archived") === "true";

    // Récupérer les patients
    const patients = await prisma.patient.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      include: {
        _count: {
          select: { consultations: true },
        },
        consultations: {
          orderBy: { dateConsultation: "desc" },
          take: 1,
          select: { dateConsultation: true },
        },
      },
      orderBy: [
        { nom: "asc" },
        { prenom: "asc" },
      ],
    });

    // Formatter la réponse
    const response: PatientListItem[] = patients.map((p) => ({
      id: p.id,
      userId: p.userId,
      numeroPatient: p.numeroPatient,
      nom: p.nom,
      prenom: p.prenom,
      dateNaissance: p.dateNaissance?.toISOString() || null,
      sexe: p.sexe as "H" | "F" | "Autre" | null,
      telephone: p.telephone,
      email: p.email,
      notes: p.notes,
      consentementRGPD: p.consentementRGPD,
      dateConsentement: p.dateConsentement?.toISOString() || null,
      isArchived: p.isArchived,
      archivedAt: p.archivedAt?.toISOString() || null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      _count: p._count,
      lastConsultation:
        p.consultations[0]?.dateConsultation.toISOString() || undefined,
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Erreur GET /api/patients:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients
 * Créer un nouveau patient (avec association BdF optionnelle)
 */
export async function POST(req: NextRequest) {
  try {
    // Récupérer userId depuis les headers (auth)
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer les données du body
    const body: any = await req.json();

    // Validation
    if (!body.nom || !body.prenom) {
      return NextResponse.json(
        { error: "Nom et prénom requis" },
        { status: 400 }
      );
    }

    // Générer le numéro patient (PAT-XXX) - récupérer TOUS les numéros existants
    const existingPatients = await prisma.patient.findMany({
      where: { userId },
      select: { numeroPatient: true },
    });

    const existingNumeros = existingPatients.map((p) => p.numeroPatient);
    const numeroPatient = generateNextNumeroPatient(existingNumeros);

    // Préparer les données du patient
    const patientData: any = {
      userId,
      numeroPatient,
      nom: body.nom.trim(),
      prenom: body.prenom.trim(),
      dateNaissance: body.dateNaissance ? new Date(body.dateNaissance) : null,
      sexe: body.sexe || null,
      telephone: body.telephone?.trim() || null,
      email: body.email?.trim() || null,
      allergies: body.allergies?.trim() || null,
      atcdMedicaux: body.atcdMedicaux?.trim() || null,
      atcdChirurgicaux: body.atcdChirurgicaux?.trim() || null,
      traitements: body.traitements?.trim() || null,
      notes: body.notes?.trim() || null,
      consentementRGPD: body.consentementRGPD || false,
      dateConsentement: body.consentementRGPD ? new Date() : null,
      // Nouveaux champs pour contexte enrichi ordonnance
      pathologiesAssociees: body.pathologiesAssociees || [],
      symptomesActuels: body.symptomesActuels || [],
      autresBilans: body.autresBilans || {},
    };

    // Si une analyse BdF est fournie, l'ajouter
    if (body.bdfAnalysis) {
      patientData.bdfAnalyses = {
        create: {
          date: new Date(),
          inputs: body.bdfAnalysis.inputs,
          indexes: body.bdfAnalysis.indexes,
          summary: body.bdfAnalysis.summary,
          axes: body.bdfAnalysis.axes,
          ragText: body.bdfAnalysis.ragText || null,
        },
      };
    }

    // Créer le patient (avec BdF si fournie)
    const patient = await prisma.patient.create({
      data: patientData,
      include: {
        bdfAnalyses: true,
      },
    });

    console.log("✅ Patient créé:", patient.id);
    if (body.bdfAnalysis) {
      console.log("✅ Analyse BdF associée");
    }

    // Formatter la réponse
    const response = {
      patient: {
        id: patient.id,
        userId: patient.userId,
        numeroPatient: patient.numeroPatient,
        nom: patient.nom,
        prenom: patient.prenom,
        dateNaissance: patient.dateNaissance?.toISOString() || null,
        sexe: patient.sexe,
        telephone: patient.telephone,
        email: patient.email,
        allergies: patient.allergies,
        atcdMedicaux: patient.atcdMedicaux,
        atcdChirurgicaux: patient.atcdChirurgicaux,
        traitements: patient.traitements,
        notes: patient.notes,
        consentementRGPD: patient.consentementRGPD,
        dateConsentement: patient.dateConsentement?.toISOString() || null,
        isArchived: patient.isArchived,
        archivedAt: patient.archivedAt?.toISOString() || null,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
        _count: { consultations: 0 },
      },
      bdfAssociated: !!body.bdfAnalysis,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/patients:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}