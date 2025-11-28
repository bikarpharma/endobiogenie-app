/**
 * API Route - Récupération image Wikimedia pour une plante
 * GET /api/phytodex/[id]/image
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchWikimediaImage, getPlaceholderImage } from "@/lib/wikimedia";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plantId = parseInt(id);

    if (isNaN(plantId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Récupérer la plante
    const plant = await prisma.phytodexPlant.findUnique({
      where: { id: plantId },
      select: { latinName: true, imageUrl: true },
    });

    if (!plant) {
      return NextResponse.json({ error: "Plante non trouvée" }, { status: 404 });
    }

    // Si on a déjà une URL en cache dans la base
    if (plant.imageUrl) {
      return NextResponse.json({
        url: plant.imageUrl,
        thumbUrl: plant.imageUrl,
        cached: true,
      });
    }

    // Chercher sur Wikimedia
    const image = await searchWikimediaImage(plant.latinName);

    if (image) {
      // Sauvegarder en cache dans la base de données
      await prisma.phytodexPlant.update({
        where: { id: plantId },
        data: { imageUrl: image.thumbUrl },
      });

      return NextResponse.json({
        ...image,
        cached: false,
      });
    }

    // Retourner un placeholder
    return NextResponse.json({
      url: getPlaceholderImage(plant.latinName),
      thumbUrl: getPlaceholderImage(plant.latinName),
      isPlaceholder: true,
    });
  } catch (error) {
    console.error("Erreur récupération image:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
