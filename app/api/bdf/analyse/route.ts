// ========================================
// API ROUTE - POST /api/bdf/analyse
// ========================================
// Endpoint pour l'analyse BdF (Biologie des Fonctions)
// Reçoit des valeurs biologiques, calcule les index,
// et renvoie une interprétation fonctionnelle.

import { NextRequest, NextResponse } from "next/server";
import type { LabValues } from "@/lib/bdf/types";
import { calculateIndexes } from "@/lib/bdf/calculateIndexes";
import { interpretResults } from "@/lib/bdf/interpretResults";

export const runtime = "nodejs";

/**
 * POST /api/bdf/analyse
 * Analyse des valeurs biologiques selon la Biologie des Fonctions
 */
export async function POST(req: NextRequest) {
  try {
    // Récupérer les valeurs biologiques du body
    const body = await req.json();
    const labValues: LabValues = body;

    // Validation : au moins une valeur doit être présente
    if (Object.keys(labValues).length === 0) {
      return NextResponse.json(
        { error: "Aucune valeur biologique fournie" },
        { status: 400 }
      );
    }

    // 1️⃣ Calculer les 6 index
    const indexes = calculateIndexes(labValues);

    // 2️⃣ Générer l'interprétation globale
    const interpretation = interpretResults(indexes);

    // 3️⃣ Renvoyer le payload complet
    return NextResponse.json(interpretation, { status: 200 });
  } catch (e: any) {
    console.error("Erreur API /bdf/analyse:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bdf/analyse
 * Healthcheck simple
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "API BdF (Biologie des Fonctions) opérationnelle",
  });
}
