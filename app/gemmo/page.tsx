// ========================================
// PAGE GEMMOTHÉRAPIE - /gemmo
// ========================================
// 📖 Explication simple :
// Page principale de la section gemmothérapie
// Contient le chatbot + accès aux monographies

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function GemmoPage() {
  // Vérifier l'authentification
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="gemmo-container">
      {/* Header */}
      <div className="gemmo-header">
        <h1>🌿 Gemmothérapie</h1>
        <p className="muted">
          Assistant expert en macérats glycérinés de bourgeons
        </p>
      </div>

      {/* Navigation interne */}
      <div className="gemmo-nav">
        <button className="gemmo-tab active">
          💬 Chatbot
        </button>
        <button className="gemmo-tab" disabled>
          📚 Monographies (bientôt)
        </button>
      </div>

      {/* Zone de chat */}
      <div className="gemmo-content">
        <div className="gemmo-chat-wrapper">
          <div className="gemmo-suggestions">
            <h3>💡 Questions suggestions</h3>
            <div className="suggestion-grid">
              <div className="suggestion-card">
                🌸 Tilleul : propriétés et indications ?
              </div>
              <div className="suggestion-card">
                🌳 Quel bourgeon pour le stress chronique ?
              </div>
              <div className="suggestion-card">
                💊 Posologie standard en gemmothérapie ?
              </div>
              <div className="suggestion-card">
                ⚠️ Contre-indications des macérats ?
              </div>
            </div>
          </div>

          <div className="gemmo-chat-interface">
            <p className="text-center muted">
              Interface de chat en cours de développement...
            </p>
            <p className="text-center">
              L'API est prête à <code>/api/gemmo/chat</code>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .gemmo-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .gemmo-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .gemmo-header h1 {
          font-size: 2.5rem;
          margin-bottom: 8px;
          color: #2d5016;
        }

        .gemmo-nav {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 2px solid #e5e7eb;
        }

        .gemmo-tab {
          padding: 12px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 500;
          color: #6b7280;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .gemmo-tab:hover:not(:disabled) {
          color: #2d5016;
        }

        .gemmo-tab.active {
          color: #2d5016;
          border-bottom-color: #2d5016;
        }

        .gemmo-tab:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gemmo-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .gemmo-suggestions {
          margin-bottom: 32px;
        }

        .gemmo-suggestions h3 {
          font-size: 1.25rem;
          margin-bottom: 16px;
          color: #2d5016;
        }

        .suggestion-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        .suggestion-card {
          padding: 16px;
          background: #f0f9e8;
          border-radius: 8px;
          border: 1px solid #d1e7c2;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-card:hover {
          background: #e3f4d7;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(45, 80, 22, 0.1);
        }

        .gemmo-chat-interface {
          padding: 40px;
          text-align: center;
          color: #6b7280;
        }

        .text-center {
          text-align: center;
        }

        .muted {
          color: #6b7280;
        }

        code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
