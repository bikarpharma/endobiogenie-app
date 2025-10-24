// ========================================
// PAGE CHAT - /chat
// ========================================
// 📖 Explication simple :
// Cette page permet de discuter avec l'assistant RAG.
// - Protégée : seuls les utilisateurs connectés peuvent y accéder
// - Sauvegarde automatiquement l'historique dans la base de données
// - Crée une nouvelle conversation à la première question

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/ChatInterface";

export default async function ChatPage() {
  // Vérifier que l'utilisateur est connecté
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div style={{ paddingTop: "20px" }}>
      <ChatInterface userId={session.user.id} />
    </div>
  );
}
