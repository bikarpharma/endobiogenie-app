// ========================================
// PAGE PHYTODEX - Liste des plantes (Tunisie / Maghreb)
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PhytodexListClient } from "@/components/phytodex/PhytodexListClient";

export default async function PhytodexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Récupérer les données initiales (première page)
  const [plants, total, filters] = await Promise.all([
    prisma.phytodexPlant.findMany({
      take: 20,
      orderBy: { latinName: "asc" },
      include: {
        _count: {
          select: { traditionalUses: true },
        },
      },
    }),
    prisma.phytodexPlant.count(),
    // Récupérer les filtres
    Promise.all([
      prisma.phytodexPlant.findMany({
        where: { region: { not: null } },
        select: { region: true },
        distinct: ["region"],
        orderBy: { region: "asc" },
      }),
      prisma.traditionalUse.findMany({
        where: { indicationCategory: { not: null } },
        select: { indicationCategory: true },
        distinct: ["indicationCategory"],
        orderBy: { indicationCategory: "asc" },
      }),
    ]),
  ]);

  const regions = filters[0].map((r) => r.region).filter(Boolean) as string[];
  const categories = filters[1].map((c) => c.indicationCategory).filter(Boolean) as string[];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      {/* En-tête */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#059669" }}>
            Phytodex Tunisien
          </h1>
          <p style={{ color: "#6b7280" }}>
            Bibliothèque documentaire des plantes médicinales (Tunisie / Maghreb)
          </p>
        </div>
        <Link
          href="/phytodex/new"
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(5, 150, 105, 0.4)",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          + Ajouter une plante
        </Link>
      </div>

      {/* Statistiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            background: "#ecfdf5",
            padding: "20px",
            borderRadius: "12px",
            border: "2px solid #10b981",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#059669" }}>
            {total}
          </div>
          <div style={{ color: "#065f46", fontSize: "0.9rem" }}>
            Plante{total > 1 ? "s" : ""} documentée{total > 1 ? "s" : ""}
          </div>
        </div>
        <div
          style={{
            background: "#fef3c7",
            padding: "20px",
            borderRadius: "12px",
            border: "2px solid #fbbf24",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b" }}>
            {regions.length}
          </div>
          <div style={{ color: "#78350f", fontSize: "0.9rem" }}>
            Région{regions.length > 1 ? "s" : ""} couvertes
          </div>
        </div>
        <div
          style={{
            background: "#ede9fe",
            padding: "20px",
            borderRadius: "12px",
            border: "2px solid #8b5cf6",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#7c3aed" }}>
            {categories.length}
          </div>
          <div style={{ color: "#4c1d95", fontSize: "0.9rem" }}>
            Catégorie{categories.length > 1 ? "s" : ""} d&apos;indication
          </div>
        </div>
      </div>

      {/* Liste client-side avec recherche et filtres */}
      <PhytodexListClient
        initialPlants={plants}
        initialTotal={total}
        regions={regions}
        categories={categories}
      />
    </div>
  );
}
