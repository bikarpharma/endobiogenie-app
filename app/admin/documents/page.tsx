// ========================================
// PAGE ADMIN - Gestion des documents
// ========================================
// 📖 Explication simple :
// Interface d'administration pour gérer les Vector Stores et fichiers.
// Accessible uniquement aux utilisateurs avec le rôle ADMIN.

import { requireAdmin } from "@/lib/admin";
import { VectorStoreManager } from "@/components/admin/VectorStoreManager";

export default async function AdminDocumentsPage() {
  // Vérifier que l'utilisateur est admin (redirige sinon)
  await requireAdmin();

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🔐 Administration - Gestion des Documents RAG</h1>
        <p className="muted">
          Gérez les Vector Stores et les documents utilisés par l'assistant.
        </p>
      </div>

      <VectorStoreManager />
    </div>
  );
}
