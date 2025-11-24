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
import { fileSearchTool, Agent, type AgentInputItem, Runner } from "@openai/agents";import type { AgentInputItem } from "@openai/agents";
import { prisma } from "@/lib/prisma";
import { removeAnnotations } from "@/lib/utils/removeAnnotations";
import { auth } from "@/lib/auth";

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

RÈGLES STRICTES :
1. Réponds UNIQUEMENT à partir des informations retrouvées via File Search.
2. Si une information n'est pas disponible, dis simplement : "Je n'ai pas d'information spécifique à ce sujet."
3. NE MENTIONNE JAMAIS les sources, livres, volumes, pages, sections ou chapitres.
4. NE DIS JAMAIS des phrases comme "Ce point est détaillé dans les volumes" ou "Pas de détail dans les volumes".
5. Réponds de manière naturelle et fluide, comme si tu expliquais directement à partir de tes connaissances.

STRUCTURE DE RÉPONSE :
- Contexte physiopathologique
- Mécanismes endobiogéniques impliqués
- Lecture fonctionnelle du terrain
- Intégration thérapeutique (phytothérapie si pertinent)

Sois précis, pédagogique et appliqué. Ta réponse doit être autonome et complète, sans aucune référence bibliographique.`,
  model: MODEL,
  tools: [fileSearch],
  modelSettings: { store: true },
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { message, chatId } = await req.json();

    // Validation
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    // 1️⃣ Créer ou récupérer le Chat
    let currentChatId = chatId as string | null;
    let chatRecord:
      | { id: string; title: string; userId: string }
      | null = null;
    let isNewChat = false;

    if (currentChatId) {
      const existingChat = await prisma.chat.findUnique({
        where: { id: currentChatId },
        select: { id: true, userId: true, title: true },
      });

      if (!existingChat || existingChat.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Conversation introuvable" },
          { status: 404 }
        );
      }

      chatRecord = existingChat;
    } else {
      // Première question : créer un nouveau Chat
      const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
      const newChat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          title,
        },
        select: { id: true, title: true, userId: true },
      });
      currentChatId = newChat.id;
      chatRecord = newChat;
      isNewChat = true;
    }

    // 2️⃣ Sauvegarder le message de l'utilisateur
    await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: "user",
        content: message,
      },
    });

    // 3️⃣ Récupérer l'historique de la conversation pour le contexte
    const history = await prisma.message.findMany({
      where: { chatId: currentChatId },
      orderBy: { createdAt: "asc" },
    });

    const conversation = history.map((msg) => ({
      role:
        msg.role === "assistant" || msg.role === "user"
          ? (msg.role as "assistant" | "user")
          : "system",
      content: [
        {
          type: msg.role === "assistant" ? "output_text" : "input_text",
          text: msg.content,
        },
      ],
    }));

    const runner = new Runner();
    const result = await runner.run(agent, conversation as AgentInputItem[]);

    if (!result.finalOutput) {
      return NextResponse.json({ error: "Pas de sortie" }, { status: 500 });
    }

    // Nettoyer les annotations/citations【X†source】
    const reply = removeAnnotations(result.finalOutput);

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
      chatTitle: chatRecord?.title,
      created: isNewChat,
    });
  } catch (e: any) {
    console.error("Erreur API:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Historique & conversations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedChatId = searchParams.get("chatId");

    if (requestedChatId) {
      const chat = await prisma.chat.findUnique({
        where: { id: requestedChatId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!chat || chat.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Conversation introuvable" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        chat: {
          id: chat.id,
          title: chat.title,
          updatedAt: chat.updatedAt.toISOString(),
        },
        messages: chat.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        })),
      });
    }

    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    const activeChat = chats[0];
    let messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }> = [];

    if (activeChat) {
      const history = await prisma.message.findMany({
        where: { chatId: activeChat.id },
        orderBy: { createdAt: "asc" },
      });

      messages = history.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      }));
    }

    return NextResponse.json({
      chats: chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        updatedAt: chat.updatedAt.toISOString(),
      })),
      activeChatId: activeChat?.id ?? null,
      activeChatTitle: activeChat?.title ?? null,
      messages,
    });
  } catch (e: any) {
    console.error("Erreur récupération historique:", e);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
