// ========================================
// API PHYTODEX - Valeurs pour les filtres
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/phytodex/filters - Récupérer les valeurs uniques pour les filtres
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Récupérer les régions uniques
  const regions = await prisma.phytodexPlant.findMany({
    where: { region: { not: null } },
    select: { region: true },
    distinct: ["region"],
    orderBy: { region: "asc" },
  });

  // Récupérer les catégories d'indication uniques
  const categories = await prisma.traditionalUse.findMany({
    where: { indicationCategory: { not: null } },
    select: { indicationCategory: true },
    distinct: ["indicationCategory"],
    orderBy: { indicationCategory: "asc" },
  });

  return NextResponse.json({
    regions: regions.map((r) => r.region).filter(Boolean),
    categories: categories.map((c) => c.indicationCategory).filter(Boolean),
  });
}
