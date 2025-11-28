// ========================================
// API PHYTODEX - Liste & Création de plantes
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/phytodex - Liste des plantes avec recherche et filtres
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const region = searchParams.get("region") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  // Construction des filtres
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { latinName: { contains: search, mode: "insensitive" } },
      { mainVernacularName: { contains: search, mode: "insensitive" } },
      { otherVernacularNames: { contains: search, mode: "insensitive" } },
      { arabicName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (region) {
    where.region = { contains: region, mode: "insensitive" };
  }

  // Filtre par catégorie d'indication (via TraditionalUse)
  if (category) {
    where.traditionalUses = {
      some: {
        indicationCategory: { contains: category, mode: "insensitive" },
      },
    };
  }

  const [plants, total] = await Promise.all([
    prisma.phytodexPlant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { latinName: "asc" },
      include: {
        _count: {
          select: { traditionalUses: true },
        },
      },
    }),
    prisma.phytodexPlant.count({ where }),
  ]);

  return NextResponse.json({
    plants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/phytodex - Création d'une nouvelle plante
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validation minimale
    if (!body.latinName || typeof body.latinName !== "string") {
      return NextResponse.json(
        { error: "Le nom latin est obligatoire" },
        { status: 400 }
      );
    }

    const plant = await prisma.phytodexPlant.create({
      data: {
        latinName: body.latinName.trim(),
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

    return NextResponse.json(plant, { status: 201 });
  } catch (error) {
    console.error("Erreur création plante Phytodex:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
