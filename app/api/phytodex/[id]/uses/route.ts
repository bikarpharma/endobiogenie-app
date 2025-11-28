// ========================================
// API PHYTODEX - Gestion des usages traditionnels
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EvidenceLevel, SourceType } from "@prisma/client";

// POST /api/phytodex/[id]/uses - Ajouter un usage traditionnel
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const plantId = parseInt(id);

  if (isNaN(plantId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const body = await req.json();

    // Vérifier que la plante existe
    const plant = await prisma.phytodexPlant.findUnique({
      where: { id: plantId },
    });

    if (!plant) {
      return NextResponse.json({ error: "Plante non trouvée" }, { status: 404 });
    }

    // Validation
    if (!body.indicationDetail) {
      return NextResponse.json(
        { error: "Le détail de l'indication est obligatoire" },
        { status: 400 }
      );
    }

    if (!body.evidenceLevel || !Object.values(EvidenceLevel).includes(body.evidenceLevel)) {
      return NextResponse.json(
        { error: "Le niveau de preuve est obligatoire et doit être valide" },
        { status: 400 }
      );
    }

    // Créer ou récupérer la source
    let sourceId: number;

    if (body.sourceId) {
      // Source existante
      sourceId = body.sourceId;
    } else if (body.sourceCitation && body.sourceType) {
      // Nouvelle source
      if (!Object.values(SourceType).includes(body.sourceType)) {
        return NextResponse.json(
          { error: "Type de source invalide" },
          { status: 400 }
        );
      }

      const source = await prisma.sourceReference.create({
        data: {
          type: body.sourceType,
          citation: body.sourceCitation.trim(),
        },
      });
      sourceId = source.id;
    } else {
      return NextResponse.json(
        { error: "Une source est obligatoire (sourceId ou sourceCitation + sourceType)" },
        { status: 400 }
      );
    }

    // Créer l'usage traditionnel
    const traditionalUse = await prisma.traditionalUse.create({
      data: {
        plantId,
        indicationCategory: body.indicationCategory?.trim() || null,
        indicationDetail: body.indicationDetail.trim(),
        partUsed: body.partUsed?.trim() || null,
        preparation: body.preparation?.trim() || null,
        dosageNotes: body.dosageNotes?.trim() || null,
        sourceId,
        evidenceLevel: body.evidenceLevel,
      },
      include: {
        source: true,
      },
    });

    return NextResponse.json(traditionalUse, { status: 201 });
  } catch (error) {
    console.error("Erreur création usage traditionnel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

// DELETE /api/phytodex/[id]/uses?useId=X - Supprimer un usage
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const useId = parseInt(searchParams.get("useId") || "");

  if (isNaN(useId)) {
    return NextResponse.json({ error: "useId invalide" }, { status: 400 });
  }

  try {
    await prisma.traditionalUse.delete({
      where: { id: useId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression usage traditionnel:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
