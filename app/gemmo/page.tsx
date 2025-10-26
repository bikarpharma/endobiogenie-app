// ========================================
// PAGE GEMMOTHÉRAPIE - /gemmo
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function GemmoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#2d5016" }}>
          🌿 Gemmothérapie
        </h1>
        <p style={{ color: "#6b7280" }}>
          Assistant expert en macérats glycérinés de bourgeons
        </p>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginBottom: "16px", color: "#2d5016" }}>💡 Questions suggestions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px", marginBottom: "32px" }}>
          <div style={{ padding: "16px", background: "#f0f9e8", borderRadius: "8px", border: "1px solid #d1e7c2" }}>
            🌸 Tilleul : propriétés et indications ?
          </div>
          <div style={{ padding: "16px", background: "#f0f9e8", borderRadius: "8px", border: "1px solid #d1e7c2" }}>
            🌳 Quel bourgeon pour le stress chronique ?
          </div>
          <div style={{ padding: "16px", background: "#f0f9e8", borderRadius: "8px", border: "1px solid #d1e7c2" }}>
            💊 Posologie standard en gemmothérapie ?
          </div>
          <div style={{ padding: "16px", background: "#f0f9e8", borderRadius: "8px", border: "1px solid #d1e7c2" }}>
            ⚠️ Contre-indications des macérats ?
          </div>
        </div>

        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          <p>Interface de chat en cours de développement...</p>
          <p>L'API est prête à <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>/api/gemmo/chat</code></p>
        </div>
      </div>
    </div>
  );
}
