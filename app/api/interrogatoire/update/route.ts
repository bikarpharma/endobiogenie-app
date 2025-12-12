// app/api/interrogatoire/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";
import { z } from "zod";

/**
 * Schéma de validation Zod pour l'interrogatoire
 * Format v2 uniquement avec answersByAxis
 */
const InterrogatoireSchema = z.object({
  patientId: z.string().cuid(),
  interrogatoire: z.object({
    date_creation: z.string().optional(),
    sexe: z.enum(["H", "F"]),
    v2: z.object({
      sexe: z.enum(["H", "F"]),
      answersByAxis: z.object({
        historique: z.object({}).passthrough().optional(),
        neuro: z.object({}).passthrough().optional(),
        adaptatif: z.object({}).passthrough().optional(),
        thyro: z.object({}).passthrough().optional(),
        gonado: z.object({}).passthrough().optional(),
        somato: z.object({}).passthrough().optional(),
        digestif: z.object({}).passthrough().optional(),
        cardioMetabo: z.object({}).passthrough().optional(),
        dermato: z.object({}).passthrough().optional(),
        immuno: z.object({}).passthrough().optional(),
      }).passthrough(),
    }),
  }).passthrough(),
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

    // 4. Récupérer l'interrogatoire existant pour fusion
    const existingInterrogatoire = patient.interrogatoire as InterrogatoireEndobiogenique | null;

    // 5. Fusionner les données v2 : préserver les axes non modifiés
    let mergedV2 = interrogatoire.v2;
    if (existingInterrogatoire?.v2?.answersByAxis && interrogatoire.v2?.answersByAxis) {
      mergedV2 = {
        ...interrogatoire.v2,
        answersByAxis: {
          ...existingInterrogatoire.v2.answersByAxis, // Garder les anciennes données
          ...interrogatoire.v2.answersByAxis,         // Écraser avec les nouvelles
        },
      };
      console.log(`🔄 [API FUSION] Fusion des axes existants avec les nouveaux`);
    }

    // 6. Ajouter la date de création si absente
    const interrogatoireWithDate: InterrogatoireEndobiogenique = {
      ...interrogatoire,
      v2: mergedV2,
      date_creation: existingInterrogatoire?.date_creation || interrogatoire.date_creation || new Date().toISOString(),
    };

    console.log(`💾 [API SAVE] Sauvegarde interrogatoire avec ${Object.keys(interrogatoireWithDate.v2?.answersByAxis || {}).length} axes`);

    // 7. Sauvegarder dans la base
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        interrogatoire: interrogatoireWithDate as any, // Prisma Json type
        updatedAt: new Date(),
      },
    });

    // 8. Créer une consultation si c'est le premier interrogatoire
    if (!existingInterrogatoire) {
      await prisma.consultation.create({
        data: {
          patientId,
          dateConsultation: new Date(),
          type: "initiale",
          motifConsultation: "Interrogatoire initial",
        },
      });
      console.log(`📋 [API] Consultation initiale créée pour patient ${patientId}`);
    }

    // 9. Retourner confirmation
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
      select: {
        id: true,
        nom: true,
        prenom: true,
        sexe: true,
        interrogatoire: true,
        userId: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient introuvable" },
        { status: 404 }
      );
    }

    if (patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé à ce patient" },
        { status: 403 }
      );
    }

    // 4. Retourner l'interrogatoire (peut être null si jamais rempli)
    // Le sexe de la fiche patient est utilisé (non modifiable dans l'interrogatoire)
    return NextResponse.json({
      patientId: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      sexe: patient.sexe || "F", // Sexe de la fiche patient (fallback F)
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
