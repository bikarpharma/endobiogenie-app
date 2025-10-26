// ========================================
// PAGE GEMMOTHÉRAPIE - /gemmo
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GemmoChat } from "@/components/GemmoChat";

export default async function GemmoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#2d5016" }}>
          🌿 Gemmothérapie
        </h1>
        <p style={{ color: "#6b7280" }}>
          Assistant expert en macérats glycérinés de bourgeons
        </p>
      </div>

      <GemmoChat userId={session.user.id} />
    </div>
  );
}
