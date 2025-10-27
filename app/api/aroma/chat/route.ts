// ========================================
// API AROMA CHAT - /api/aroma/chat
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, AgentInputItem, Runner } from "@openai/agents";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Vector Store Aromathérapie
const fileSearch = fileSearchTool([
  "vs_68feabf4185c8191afbadcc2cfe972a7",
]);

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const agent = new Agent({
  name: "Agent Aromathérapie",
  instructions: `Tu es un expert en aromathérapie (thérapie par les huiles essentielles).
Réponds UNIQUEMENT à partir du livre d'aromathérapie fourni via File Search.
Si l'information n'est pas dans le livre, dis-le clairement : "Cette information n'est pas détaillée dans le livre d'aromathérapie."

STRUCTURE DE RÉPONSE :
1. 🌺 **Huile essentielle** : Nom botanique et vernaculaire
2. 💊 **Propriétés** : Actions thérapeutiques principales
3. 🎯 **Indications** : Quand l'utiliser
4. 💉 **Posologie** : Dosage, voies d'administration (topique, diffusion, orale)
5. ⚠️ **Précautions** : Contre-indications, toxicités, interactions

Sois précis, pédagogique et accessible. Insiste sur la sécurité d'usage. Ne cite PAS de sources ou numéros de page.`,
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
          title: `[Aroma] ${title}`,
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

    const reply = result.finalOutput;

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
    console.error("Erreur API Aroma:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "aroma" });
}
