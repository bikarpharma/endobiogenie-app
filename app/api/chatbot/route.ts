// ========================================
// API CHATBOT ORCHESTRATEUR - POST /api/chatbot
// ========================================
// Chatbot intelligent unique pour le SaaS "Agent Endobiogénie"
// - Détecte automatiquement si le message contient des valeurs biologiques
// - Analyse BdF si valeurs détectées
// - Répond aux questions générales sur l'endobiogénie sinon

import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, Runner } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { prisma } from "@/lib/prisma";
import { removeAnnotations } from "@/lib/utils/removeAnnotations";
import { respondToUser } from "@/lib/chatbot/orchestrator";


export const runtime = "nodejs";

/**
 * POST /api/chatbot
 * Endpoint principal du chatbot orchestrateur
 */
export async function POST(req: NextRequest) {
  try {
    // Récupérer le message
    const body = await req.json();
    const { message } = body;

    // Validation
    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "Message requis et non vide" },
        { status: 400 }
      );
    }

    // Appeler l'orchestrateur
    const response = await respondToUser(message);

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
    message: "Chatbot orchestrateur opérationnel - Version enrichie avec RAG",
    capabilities: [
      "Analyse automatique de valeurs biologiques (BdF)",
      "Enrichissement avec contexte endobiogénique (Vector Store)",
      "Réponses aux questions sur l'endobiogénie",
      "Classification intelligente des requêtes",
    ],
  });
}
