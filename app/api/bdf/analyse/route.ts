// ========================================
// API ROUTE - POST /api/bdf/analyse
// ========================================
// Endpoint pour l'analyse BdF (Biologie des Fonctions)
// Reçoit des valeurs biologiques, calcule les index,
// et renvoie une interprétation fonctionnelle.

import { NextRequest, NextResponse } from "next/server";
import type { LabValues } from "@/lib/bdf/types";
import { calculateIndexes } from "@/lib/bdf/calculateIndexes";

export const runtime = "nodejs";

/**
 * POST /api/bdf/analyse
 * Analyse des valeurs biologiques selon la Biologie des Fonctions
 * Retourne UNIQUEMENT les 8 index calculés (pas de résumé rapide)
 * Le résumé/axes/lecture seront générés par la route RAG si demandé
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

    // Calculer les 8 index BdF
    const indexes = calculateIndexes(labValues);

    // Renvoyer les index avec une note technique
    return NextResponse.json({
      indexes,
      noteTechnique: "Analyse fonctionnelle du terrain selon la Biologie des Fonctions. À corréler au contexte clinique.",
    }, { status: 200 });
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
