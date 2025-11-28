// ========================================
// PAGE PHYTODEX - Détail d'une plante
// ========================================
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PhytodexDetailClient } from "@/components/phytodex/PhytodexDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PhytodexDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const plantId = parseInt(id);

  if (isNaN(plantId)) {
    notFound();
  }

  const plant = await prisma.phytodexPlant.findUnique({
    where: { id: plantId },
    include: {
      traditionalUses: {
        include: {
          source: true,
        },
        orderBy: { indicationCategory: "asc" },
      },
    },
  });

  if (!plant) {
    notFound();
  }

  // Récupérer les sources existantes pour le formulaire d'ajout d'usage
  const sources = await prisma.sourceReference.findMany({
    orderBy: { citation: "asc" },
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
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
          <em>{plant.latinName}</em>
          {plant.mainVernacularName && (
            <span style={{ color: "#6b7280", fontStyle: "normal", marginLeft: "12px" }}>
              ({plant.mainVernacularName})
            </span>
          )}
        </h1>
        {plant.family && (
          <p style={{ color: "#9ca3af", fontSize: "1rem" }}>Famille : {plant.family}</p>
        )}
      </div>

      {/* Composant client pour l'interactivité */}
      <PhytodexDetailClient plant={plant} sources={sources} />
    </div>
  );
}
