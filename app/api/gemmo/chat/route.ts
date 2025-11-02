// ========================================
// API GEMMO CHAT - /api/gemmo/chat
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, Runner } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { prisma } from "@/lib/prisma";
import { removeAnnotations } from "@/lib/utils/removeAnnotations";

export const runtime = "nodejs";

// Vector Store Gemmothérapie
const fileSearch = fileSearchTool([
  "vs_68fe63bee4bc8191b2ab5e6813d5bed2",
]);

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const agent = new Agent({
  name: "Agent Gemmothérapie",
  instructions: `Tu es un expert en gemmothérapie (thérapie par les bourgeons et macérats glycérinés).

RÈGLES STRICTES :
1. Réponds UNIQUEMENT à partir des informations retrouvées via File Search.
2. Si une information n'est pas disponible, dis simplement : "Je n'ai pas d'information spécifique à ce sujet."
3. NE MENTIONNE JAMAIS les sources, livres, volumes, pages, sections ou chapitres.
4. NE DIS JAMAIS des phrases comme "Cette information est détaillée dans le livre" ou "Pas de détail dans le livre".
5. Réponds de manière naturelle et fluide, comme si tu expliquais directement à partir de tes connaissances.

STRUCTURE DE RÉPONSE :
1. 🌿 **Plante** : Nom latin et vernaculaire
2. 💊 **Propriétés** : Actions thérapeutiques principales
3. 🎯 **Indications** : Quand l'utiliser
4. 💉 **Posologie** : Dosage et mode d'emploi
5. ⚠️ **Précautions** : Contre-indications et interactions

Sois précis, pédagogique et accessible. Ta réponse doit être autonome et complète, sans aucune référence bibliographique.`,
  model: MODEL,
  tools: [fileSearch],
  modelSettings: { store: true },
});

export async function POST(req: NextRequest) {
  try {
    const { message, chatId, userId } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    let currentChatId = chatId;

    if (!currentChatId) {
      const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
      const newChat = await prisma.chat.create({
        data: {
          userId,
          title: `[Gemmo] ${title}`,
        },
      });
      currentChatId = newChat.id;
    }

    await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: "user",
        content: message,
      },
    });

    const conversation: AgentInputItem[] = [
      { role: "user", content: [{ type: "input_text", text: message }] },
    ];

    const runner = new Runner();
    const result = await runner.run(agent, conversation);

    if (!result.finalOutput) {
      return NextResponse.json({ error: "Pas de sortie" }, { status: 500 });
    }

    // Nettoyer les annotations/citations【X†source】
    const reply = removeAnnotations(result.finalOutput);

    await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: "assistant",
        content: reply,
      },
    });

    await prisma.chat.update({
      where: { id: currentChatId },
      data: { updatedAt: new Date() },
    });

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

export async function GET() {
  return NextResponse.json({ ok: true, service: "gemmo" });
}
