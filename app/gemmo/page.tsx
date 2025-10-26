// PAGE GEMMOTHÉRAPIE
import { GemmoChat } from "./GemmoChat";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function GemmoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const suggestions = [
    "🌸 Tilleul : propriétés et indications ?",
    "🌳 Quel bourgeon pour le stress chronique ?",
    "💊 Posologie standard en gemmothérapie ?",
    "⚠️ Contre-indications des macérats ?",
  ];

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

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          display: "grid",
          gap: "32px",
        }}
      >
        <div style={{ display: "grid", gap: "12px" }}>
          <h3 style={{ marginBottom: "4px", color: "#2d5016" }}>💡 Questions suggestions</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "12px",
            }}
          >
            {suggestions.map((suggestion) => (
              <div
                key={suggestion}
                style={{
                  padding: "16px",
                  background: "#f0f9e8",
                  borderRadius: "8px",
                  border: "1px solid #d1e7c2",
                  color: "#2d5016",
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        <GemmoChat />
      </div>
    </div>
  );
}
