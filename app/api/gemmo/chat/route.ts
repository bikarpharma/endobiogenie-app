// ========================================
// API GEMMO CHAT - /api/gemmo/chat
// ========================================
// 📖 Explication simple :
// Cette API gère les conversations avec l'assistant gemmothérapie.
// Fonctionne exactement comme le chat endobiogénie, mais avec un Vector Store dédié.

import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, AgentInputItem, Runner } from "@openai/agents";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Vector Store Gemmothérapie
const fileSearch = fileSearchTool([
  "vs_68fe63bee4bc8191b2ab5e6813d5bed2",
]);

// Modèle
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const agent = new Agent({
  name: "Agent Gemmothérapie",
  instructions: `Tu es un expert en gemmothérapie (thérapie par les bourgeons et macérats glycérinés).
Réponds UNIQUEMENT à partir du livre de gemmothérapie fourni via File Search.
Si l'information n'est pas dans le livre, dis-le clairement : "Cette information n'est pas détaillée dans le livre de gemmothérapie."

STRUCTURE DE RÉPONSE :
1. 🌿 **Plante** : Nom latin et vernaculaire
2. 💊 **Propriétés** : Actions thérapeutiques principales
3. 🎯 **Indications** : Quand l'utiliser
4. 💉 **Posologie** : Dosage et mode d'emploi
5. ⚠️ **Précautions** : Contre-indications et interactions
6. 📖 **Source** : (Page X du livre)

Sois précis, pédagogique et cite toujours tes sources.`,
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
      // Première question : créer un nouveau Chat avec tag "gemmo"
      const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
      const newChat = await prisma.chat.create({
        data: {
          userId,
          title: `[Gemmo] ${title}`,
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

    // 3️⃣ Appeler l'assistant RAG Gemmothérapie
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
    console.error("Erreur API Gemmo:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Healthcheck simple
export async function GET() {
  return NextResponse.json({ ok: true, service: "gemmo" });
}
