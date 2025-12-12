/**
 * API Route: POST /api/bdf/import-lab
 * =====================================
 * Import intelligent de résultats de laboratoire via GPT-4 Vision.
 *
 * Payload:
 * {
 *   "image": "base64...", // Image ou PDF en base64
 *   "mimeType": "image/jpeg" | "image/png" | "application/pdf"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "normalized": [...], // Valeurs normalisées
 *   "bdfInputs": {...},  // Objet prêt pour BdfInputForm
 *   "summary": "...",    // Résumé textuel
 *   ...
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { importLabFromImage, importLabFromPDF } from "@/lib/bdf/labImport";

// ==========================================
// CONFIG
// ==========================================

// Taille max: 20MB (PDF multi-pages)
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

// Types MIME acceptés
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// ==========================================
// HANDLER
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier la clé API OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration serveur manquante (OPENAI_API_KEY)",
        },
        { status: 500 }
      );
    }

    // 2. Parser le body
    const body = await request.json();
    const { image, mimeType = "image/jpeg" } = body;

    // 3. Validation de l'image
    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "Image manquante dans la requête",
        },
        { status: 400 }
      );
    }

    // 4. Vérifier le type MIME
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Type de fichier non supporté: ${mimeType}. Types acceptés: ${ALLOWED_MIME_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 5. Vérifier la taille (approximation base64)
    const estimatedSize = (image.length * 3) / 4;
    if (estimatedSize > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Fichier trop volumineux. Taille max: ${MAX_SIZE_BYTES / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // 6. Import selon le type
    console.log(`[import-lab] Traitement d'un fichier ${mimeType}...`);

    let result;
    if (mimeType === "application/pdf") {
      result = await importLabFromPDF(image);
    } else {
      result = await importLabFromImage(image, mimeType);
    }

    // 7. Log du résultat
    console.log(
      `[import-lab] Résultat: ${result.normalized.length} valeurs normalisées, ${result.normalizationResult.unmatched.length} non reconnues`
    );

    // 8. Retourner le résultat
    return NextResponse.json({
      success: result.success,
      normalized: result.normalized,
      bdfInputs: result.bdfInputs,
      summary: result.summary,
      missingCritical: result.missingCritical,
      stats: result.normalizationResult.stats,
      unmatched: result.normalizationResult.unmatched,
      metadata: result.extractionResult.metadata,
      tokensUsed: result.extractionResult.tokensUsed,
      error: result.error,
    });
  } catch (error) {
    console.error("[import-lab] Erreur:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// OPTIONS (CORS)
// ==========================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
