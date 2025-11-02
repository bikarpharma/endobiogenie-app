// ========================================
// PAGE AROMATHÉRAPIE - /aroma
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AromaChat } from "@/components/AromaChat";

export default async function AromaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#7c3aed" }}>
          🌺 Aromathérapie
        </h1>
        <p style={{ color: "#6b7280" }}>
          Assistant expert en huiles essentielles et synergies aromatiques
        </p>
      </div>

      <AromaChat userId={session.user.id} />
    </div>
  );
}
