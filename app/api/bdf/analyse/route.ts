// ========================================
// API ROUTE - POST /api/bdf/analyse
// ========================================
// Endpoint pour l'analyse BdF (Biologie des Fonctions)
// Reçoit des valeurs biologiques, calcule les index,
// et renvoie une interprétation fonctionnelle.
//
// VERSION MISE À JOUR : Validation Zod des plages physiologiques

import { NextRequest, NextResponse } from "next/server";
import { calculateAllIndexes } from "@/lib/bdf/calculateIndexes";
import { sanitizeBiomarkers } from "@/lib/validations";

export const runtime = "nodejs";

/**
 * POST /api/bdf/analyse
 * Analyse des valeurs biologiques selon la Biologie des Fonctions
 *
 * @body Record<string, number> - Biomarqueurs { "GR": 5.2, "GB": 6.5, "TSH": 2.1, ... }
 * @returns BdfResult avec tous les index calculés
 *
 * SÉCURITÉ: Les valeurs hors plages physiologiques sont ignorées
 * pour éviter de fausser les calculs d'index.
 */
export async function POST(req: NextRequest) {
  try {
    // Récupérer les valeurs biologiques du body
    const body = await req.json();

    // VALIDATION ZOD : Sanitize les biomarqueurs avec plages physiologiques
    const { sanitized: biomarkers, warnings } = sanitizeBiomarkers(body);

    // Log des avertissements côté serveur
    if (warnings.length > 0) {
      console.warn("⚠️ Valeurs biologiques hors plages:", warnings);
    }

    // Validation : au moins une valeur doit être présente
    const validValues = Object.values(biomarkers).filter(v => v !== null);
    if (validValues.length === 0) {
      return NextResponse.json(
        { error: "Aucune valeur biologique valide fournie" },
        { status: 400 }
      );
    }

    // Calculer tous les index BdF (avec conversions automatiques)
    const result = calculateAllIndexes(biomarkers);

    // Renvoyer le résultat complet avec warnings
    return NextResponse.json({
      success: true,
      indexes: result.indexes,
      metadata: result.metadata,
      warnings: warnings.length > 0 ? warnings : undefined,
      noteTechnique: "Analyse fonctionnelle du terrain selon la Biologie des Fonctions. À corréler au contexte clinique.",
    }, { status: 200 });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    console.error("❌ Erreur API /bdf/analyse:", e);
    return NextResponse.json(
      { error: message },
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
    version: "2.0",
    features: [
      "Conversions BdF automatiques (GR, GB, PLT, CA)",
      "Correction TSH (<0.5→0.5, >5→5)",
      "Détection hypothyroïdie latente",
      "25+ index calculés"
    ]
  });
}