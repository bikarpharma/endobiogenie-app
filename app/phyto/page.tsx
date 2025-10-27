// ========================================
// PAGE PHYTOTHÉRAPIE - /phyto
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PhytoChat } from "@/components/PhytoChat";

export default async function PhytoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#ea580c" }}>
          🌿 Phytothérapie
        </h1>
        <p style={{ color: "#6b7280" }}>
          Assistant expert en plantes médicinales et protocoles thérapeutiques
        </p>
      </div>

      <PhytoChat userId={session.user.id} />
    </div>
  );
}
