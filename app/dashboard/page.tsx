// ========================================
// PAGE DASHBOARD - /dashboard
// ========================================
// 📖 Explication simple :
// Cette page est protégée (seuls les utilisateurs connectés peuvent y accéder).
// Elle affiche :
// 1. Un message de bienvenue
// 2. Les 10 dernières conversations de l'utilisateur
// 3. Des statistiques basiques
//
// ⚠️ Cette page est "Server Component" (s'exécute côté serveur)
// Elle récupère les données AVANT d'envoyer le HTML au navigateur.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  // Récupérer la session (qui est connecté ?)
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Récupérer les conversations de l'utilisateur depuis la base de données
  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" }, // Les plus récentes d'abord
    take: 10, // Limiter à 10 résultats
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  // Calculer le nombre total de messages
  const totalMessages = chats.reduce((acc, chat) => {
    return acc + chat._count.messages;
  }, 0);

  return (
    <div className="dashboard-container">
      {/* En-tête */}
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <p>Bienvenue, {session.user.name || session.user.email} !</p>
      </div>

      {/* Grille : 2 colonnes */}
      <div className="dashboard-grid">
        {/* Colonne 1 : Conversations */}
        <div className="panel">
          <h2>Conversations récentes</h2>
          {chats.length === 0 ? (
            <p className="muted">Aucune conversation pour le moment.</p>
          ) : (
            <ul className="chat-list">
              {chats.map((chat) => (
                <li key={chat.id} className="chat-item">
                  <Link href={`/dashboard/chats/${chat.id}`}>
                    <strong>{chat.title}</strong>
                    <small>
                      {new Date(chat.updatedAt).toLocaleDateString("fr-FR")}
                    </small>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/chat" className="btn btn-primary" style={{ marginTop: 16 }}>
            + Nouvelle conversation
          </Link>
        </div>

        {/* Colonne 2 : Statistiques */}
        <div className="panel">
          <h2>Statistiques</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{chats.length}</span>
              <span className="stat-label">Conversations</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{totalMessages}</span>
              <span className="stat-label">Messages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
