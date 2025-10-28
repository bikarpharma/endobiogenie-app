// ========================================
// API CHATBOT ORCHESTRATEUR - POST /api/chatbot
// ========================================
// Chatbot intelligent unique pour le SaaS "Agent Endobiogénie"
// - Détecte automatiquement si le message contient des valeurs biologiques
// - Analyse BdF si valeurs détectées
// - Répond aux questions générales sur l'endobiogénie sinon

import { NextRequest, NextResponse } from "next/server";
import { respondToUser } from "@/lib/chatbot/orchestrator";
import type { ChatRequest, ChatReply } from "@/lib/chatbot/types";

export const runtime = "nodejs";

/**
 * POST /api/chatbot
 * Endpoint principal du chatbot orchestrateur
 */
export async function POST(req: NextRequest) {
  try {
    // Récupérer le message
    const body: ChatRequest = await req.json();
    const { message } = body;

    // Validation
    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "Message requis et non vide" },
        { status: 400 }
      );
    }

    // Appeler l'orchestrateur
    const response: ChatReply = await respondToUser(message);

    // Retourner la réponse
    return NextResponse.json(response, { status: 200 });
  } catch (e: any) {
    console.error("Erreur API /chatbot:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chatbot
 * Healthcheck
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Chatbot orchestrateur opérationnel",
    capabilities: [
      "Analyse automatique de valeurs biologiques (BdF)",
      "Réponses aux questions sur l'endobiogénie",
      "Classification intelligente des requêtes",
    ],
  });
}
