// ========================================
// PAGE PHYTODEX - Création d'une nouvelle plante
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PhytodexPlantForm } from "@/components/phytodex/PhytodexPlantForm";

export default async function PhytodexNewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      {/* Fil d'Ariane */}
      <div style={{ marginBottom: "24px" }}>
        <Link
          href="/phytodex"
          style={{ color: "#059669", textDecoration: "none", fontSize: "0.9rem" }}
        >
          ← Retour au Phytodex
        </Link>
      </div>

      {/* En-tête */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "8px", color: "#059669" }}>
          Nouvelle plante
        </h1>
        <p style={{ color: "#6b7280" }}>
          Ajouter une plante à la bibliothèque documentaire Phytodex
        </p>
      </div>

      {/* Formulaire */}
      <PhytodexPlantForm />
    </div>
  );
}
