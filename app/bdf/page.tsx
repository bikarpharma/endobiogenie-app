// ========================================
// PAGE BIOLOGIE DES FONCTIONS - /bdf
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BdfAnalyzer } from "@/components/BdfAnalyzer";

export default async function BdfPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#2563eb" }}>
          🧬 Biologie des Fonctions (BdF)
        </h1>
        <p style={{ color: "#6b7280" }}>
          Analyse fonctionnelle du terrain biologique
        </p>
      </div>

      <BdfAnalyzer userId={session.user.id} />
    </div>
  );
}
