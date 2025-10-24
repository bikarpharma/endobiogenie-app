// ========================================
// PAGE HISTORIQUE CONVERSATION - /dashboard/chats/[id]
// ========================================
// 📖 Explication simple :
// Cette page affiche l'historique complet d'une conversation.
// - Récupère tous les messages depuis la base de données
// - Permet de continuer la conversation
// - Vérifie que l'utilisateur est bien le propriétaire du chat

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChatHistory } from "@/components/ChatHistory";

export default async function ChatHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Récupérer la session
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Attendre la résolution des params (Next.js 15)
  const { id } = await params;

  // Récupérer le chat avec tous ses messages
  const chat = await prisma.chat.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Vérifications de sécurité
  if (!chat) {
    notFound(); // 404 si le chat n'existe pas
  }

  if (chat.userId !== session.user.id) {
    // L'utilisateur n'est pas le propriétaire
    return (
      <div className="dashboard-container">
        <div className="panel">
          <h1>❌ Accès refusé</h1>
          <p>Cette conversation ne vous appartient pas.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "20px" }}>
      <ChatHistory
        chatId={chat.id}
        chatTitle={chat.title}
        initialMessages={chat.messages}
        userId={session.user.id}
      />
    </div>
  );
}
