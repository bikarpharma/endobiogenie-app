// ========================================
// API PHYTODEX - Liste des sources bibliographiques
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/phytodex/sources - Liste des sources pour autocomplete
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const sources = await prisma.sourceReference.findMany({
    orderBy: { citation: "asc" },
    include: {
      _count: {
        select: { uses: true },
      },
    },
  });

  return NextResponse.json(sources);
}
