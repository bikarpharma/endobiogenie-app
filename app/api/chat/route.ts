// ========================================
// API CHAT - /api/chat
// ========================================
// 📖 Explication simple :
// Cette API gère les conversations avec l'assistant RAG.
// Nouvelles fonctionnalités :
// - Crée automatiquement une conversation (Chat) si nécessaire
// - Sauvegarde tous les messages dans la base de données
// - Retourne le chatId pour les messages suivants

import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, Runner } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Vector Stores
const fileSearch = fileSearchTool([
  "vs_68e87a07ae6c81918d805c8251526bda",
]);

// Modèle
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const agent = new Agent({
  name: "Agent Endobiogénie",
  instructions: `Tu es EndoBot, une intelligence experte en théorie de l'endobiogénie et en phytothérapie clinique intégrative.
Réponds UNIQUEMENT à partir des extraits retrouvés via File search (Vector Stores).
Si aucune information fiable n'est disponible, dis-le clairement : "Ce point n'est pas explicitement détaillé dans les volumes consultés."
Structure: Contexte → Mécanismes → Lecture fonctionnelle → Intégration → Références (Volume/section).`,
  model: MODEL,
  tools: [fileSearch],
  modelSettings: { store: true },
});

export async function POST(req: NextRequest) {
  try {
    const { message, chatId, userId } = await req.json();

    // Validation
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    // 1️⃣ Créer ou récupérer le Chat
    let currentChatId = chatId;

    if (!currentChatId) {
      // Première question : créer un nouveau Chat
      const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
      const newChat = await prisma.chat.create({
        data: {
          userId,
          title,
        },
      });
      currentChatId = newChat.id;
    }

    // 2️⃣ Sauvegarder le message de l'utilisateur
    await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: "user",
        content: message,
      },
    });

    // 3️⃣ Appeler l'assistant RAG
    const conversation: AgentInputItem[] = [
      { role: "user", content: [{ type: "input_text", text: message }] },
    ];

    const runner = new Runner();
    const result = await runner.run(agent, conversation);

    if (!result.finalOutput) {
      return NextResponse.json({ error: "Pas de sortie" }, { status: 500 });
    }

    const reply = result.finalOutput;

    // 4️⃣ Sauvegarder la réponse de l'assistant
    await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: "assistant",
        content: reply,
      },
    });

    // 5️⃣ Mettre à jour la date du Chat
    await prisma.chat.update({
      where: { id: currentChatId },
      data: { updatedAt: new Date() },
    });

    // 6️⃣ Retourner la réponse + chatId
    return NextResponse.json({
      reply,
      chatId: currentChatId,
    });
  } catch (e: any) {
    console.error("Erreur API:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Healthcheck simple
export async function GET() {
  return NextResponse.json({ ok: true });
}
