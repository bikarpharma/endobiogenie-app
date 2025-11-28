// ========================================
// API PHYTODEX - Détail, Mise à jour, Suppression
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/phytodex/[id] - Détail d'une plante
export async function GET(
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

  const plant = await prisma.phytodexPlant.findUnique({
    where: { id: plantId },
    include: {
      traditionalUses: {
        include: {
          source: true,
        },
        orderBy: { indicationCategory: "asc" },
      },
    },
  });

  if (!plant) {
    return NextResponse.json({ error: "Plante non trouvée" }, { status: 404 });
  }

  return NextResponse.json(plant);
}

// PUT /api/phytodex/[id] - Mise à jour d'une plante
export async function PUT(
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
    const existing = await prisma.phytodexPlant.findUnique({
      where: { id: plantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Plante non trouvée" }, { status: 404 });
    }

    const plant = await prisma.phytodexPlant.update({
      where: { id: plantId },
      data: {
        latinName: body.latinName?.trim() || existing.latinName,
        family: body.family?.trim() || null,
        mainVernacularName: body.mainVernacularName?.trim() || null,
        arabicName: body.arabicName?.trim() || null,
        otherVernacularNames: body.otherVernacularNames?.trim() || null,
        region: body.region?.trim() || null,
        partUsed: body.partUsed?.trim() || null,
        mainActions: body.mainActions?.trim() || null,
        mainIndications: body.mainIndications?.trim() || null,
        usualForms: body.usualForms?.trim() || null,
        officinalAvailability: body.officinalAvailability?.trim() || null,
        safetyNotes: body.safetyNotes?.trim() || null,
      },
    });

    return NextResponse.json(plant);
  } catch (error) {
    console.error("Erreur mise à jour plante Phytodex:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/phytodex/[id] - Suppression d'une plante
export async function DELETE(
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
    await prisma.phytodexPlant.delete({
      where: { id: plantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression plante Phytodex:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
