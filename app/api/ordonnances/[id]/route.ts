// ========================================
// API ORDONNANCE - /api/ordonnances/[id]
// ========================================
// GET : Récupérer une ordonnance spécifique

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/ordonnances/[id]
 * Récupérer une ordonnance complète
 */
export async function GET(
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

    const { id: ordonnanceId } = await params;

    const ordonnance = await prisma.ordonnance.findFirst({
      where: { id: ordonnanceId },
      include: {
        patient: {
          include: {
            bdfAnalyses: {
              orderBy: { date: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'ordonnance appartient à l'utilisateur
    if (ordonnance.patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ordonnance,
    });
  } catch (e: any) {
    console.error("❌ Erreur récupération ordonnance:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ordonnances/[id]
 * Mettre à jour une ordonnance (appliquer une action du chat)
 */
export async function PATCH(
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

    const { id: ordonnanceId } = await params;
    const body = await req.json();

    const ordonnance = await prisma.ordonnance.findFirst({
      where: { id: ordonnanceId },
      include: {
        patient: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance non trouvée" },
        { status: 404 }
      );
    }

    if (ordonnance.patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Mettre à jour les volets si fournis
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.voletEndobiogenique) {
      updateData.voletEndobiogenique = body.voletEndobiogenique;
    }

    if (body.voletPhytoElargi) {
      updateData.voletPhytoElargi = body.voletPhytoElargi;
    }

    if (body.voletComplements) {
      updateData.voletComplements = body.voletComplements;
    }

    if (body.statut) {
      updateData.statut = body.statut;
    }

    const updated = await prisma.ordonnance.update({
      where: { id: ordonnanceId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      ordonnance: updated,
    });
  } catch (e: any) {
    console.error("❌ Erreur mise à jour ordonnance:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}
