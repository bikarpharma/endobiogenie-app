// app/api/interrogatoire/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";
import { z } from "zod";

/**
 * Schéma de validation Zod pour l'interrogatoire
 * (simplifié - vous pouvez le détailler davantage)
 */
const InterrogatoireSchema = z.object({
  patientId: z.string().cuid(),
  interrogatoire: z.object({
    date_creation: z.string().optional(),
    sexe: z.enum(["H", "F"]),
    axeNeuroVegetatif: z.object({}).passthrough(),
    axeAdaptatif: z.object({}).passthrough(),
    axeThyroidien: z.object({}).passthrough(),
    axeGonadiqueFemme: z.object({}).passthrough().optional(),
    axeGonadiqueHomme: z.object({}).passthrough().optional(),
    axeDigestifMetabolique: z.object({}).passthrough(),
    axeImmunoInflammatoire: z.object({}).passthrough(),
    rythmes: z.object({}).passthrough(),
    axesDeVie: z.object({}).passthrough(),
  }),
});

/**
 * POST /api/interrogatoire/update
 *
 * Sauvegarde l'interrogatoire endobiogénique d'un patient
 *
 * Body:
 * {
 *   patientId: string,
 *   interrogatoire: InterrogatoireEndobiogenique
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Parser et valider le body
    const body = await req.json();
    const validatedData = InterrogatoireSchema.parse(body);

    const { patientId, interrogatoire } = validatedData;

    // 3. Vérifier que le patient existe et appartient à l'utilisateur
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

    if (patient.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé à ce patient" },
        { status: 403 }
      );
    }

    // 4. Ajouter la date de création si absente
    const interrogatoireWithDate: InterrogatoireEndobiogenique = {
      ...interrogatoire,
      date_creation: interrogatoire.date_creation || new Date().toISOString(),
    };

    // 5. Sauvegarder dans la base
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        interrogatoire: interrogatoireWithDate as any, // Prisma Json type
        updatedAt: new Date(),
      },
    });

    // 6. Retourner confirmation
    return NextResponse.json({
      success: true,
      message: "Interrogatoire enregistré avec succès",
      patientId: updatedPatient.id,
      dateEnregistrement: interrogatoireWithDate.date_creation,
    });

  } catch (error: any) {
    console.error("❌ [API /interrogatoire/update] Erreur:", error);

    // Erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.errors.map(e => ({
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
        error: "Erreur lors de l'enregistrement de l'interrogatoire",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/interrogatoire/update?patientId=xxx
 *
 * Récupère l'interrogatoire d'un patient
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Récupérer le patientId depuis les query params
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId manquant" },
        { status: 400 }
      );
    }

    // 3. Vérifier que le patient existe et appartient à l'utilisateur
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
      select: {
        id: true,
        nom: true,
        prenom: true,
        interrogatoire: true,
        user: {
          select: { email: true },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient introuvable" },
        { status: 404 }
      );
    }

    if (patient.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé à ce patient" },
        { status: 403 }
      );
    }

    // 4. Retourner l'interrogatoire (peut être null si jamais rempli)
    return NextResponse.json({
      patientId: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      interrogatoire: patient.interrogatoire as InterrogatoireEndobiogenique | null,
    });

  } catch (error: any) {
    console.error("❌ [API GET /interrogatoire/update] Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de l'interrogatoire",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
