"use client";
// ========================================
// COMPOSANT CLIENT - Liste Phytodex avec recherche/filtres
// ========================================
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlantImage } from "./PlantImage";

interface PhytodexPlant {
  id: number;
  latinName: string;
  family: string | null;
  mainVernacularName: string | null;
  arabicName: string | null;
  otherVernacularNames: string | null;
  region: string | null;
  partUsed: string | null;
  mainActions: string | null;
  mainIndications: string | null;
  _count: {
    traditionalUses: number;
  };
}

interface Props {
  initialPlants: PhytodexPlant[];
  initialTotal: number;
  regions: string[];
  categories: string[];
}

export function PhytodexListClient({
  initialPlants,
  initialTotal,
  regions,
  categories,
}: Props) {
  const [plants, setPlants] = useState<PhytodexPlant[]>(initialPlants);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (search) params.set("search", search);
      if (selectedRegion) params.set("region", selectedRegion);
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/phytodex?${params}`);
      const data = await res.json();

      setPlants(data.plants);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Erreur chargement plantes:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedRegion, selectedCategory]);

  useEffect(() => {
    // Ne pas refetch au premier rendu si pas de filtres
    if (page === 1 && !search && !selectedRegion && !selectedCategory) {
      return;
    }
    fetchPlants();
  }, [fetchPlants, page, search, selectedRegion, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPlants();
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedRegion("");
    setSelectedCategory("");
    setPage(1);
  };

  return (
    <div>
      {/* Barre de recherche et filtres */}
      <div
        style={{
          background: "#f9fafb",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Recherche */}
          <input
            type="text"
            placeholder="Rechercher (nom latin, français ou arabe)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: "1 1 300px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "1rem",
            }}
          />

          {/* Filtre région */}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "1rem",
              minWidth: "180px",
            }}
          >
            <option value="">Toutes les régions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Filtre catégorie */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "1rem",
              minWidth: "180px",
            }}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <Button type="submit" disabled={loading}>
            {loading ? "..." : "Rechercher"}
          </Button>

          {(search || selectedRegion || selectedCategory) && (
            <Button type="button" variant="outline" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </form>
      </div>

      {/* Résultats */}
      <div style={{ marginBottom: "16px", color: "#6b7280" }}>
        {total} plante{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
      </div>

      {/* Grille de cartes */}
      {plants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
          {loading ? "Chargement..." : "Aucune plante trouvée"}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {plants.map((plant) => (
            <Link
              key={plant.id}
              href={`/phytodex/${plant.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                  <PlantImage latinName={plant.latinName} size="large" />
                  {plant.region && (
                    <Badge
                      variant="secondary"
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {plant.region}
                    </Badge>
                  )}
                </div>

                {/* Contenu */}
                <div style={{ padding: "16px" }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#059669",
                      marginBottom: "4px",
                    }}
                  >
                    <em>{plant.latinName}</em>
                  </h3>

                  {plant.mainVernacularName && (
                    <p style={{ color: "#374151", marginBottom: "4px" }}>
                      {plant.mainVernacularName}
                    </p>
                  )}

                  {plant.otherVernacularNames && (
                    <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "4px" }}>
                      {plant.otherVernacularNames}
                    </p>
                  )}

                  {plant.arabicName && (
                    <p
                      style={{
                        fontFamily: "Arial, sans-serif",
                        fontSize: "1.1rem",
                        direction: "rtl",
                        color: "#059669",
                        marginTop: "8px",
                        fontWeight: "500",
                      }}
                    >
                      {plant.arabicName}
                    </p>
                  )}

                  {plant._count.traditionalUses > 0 && (
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "8px" }}>
                      {plant._count.traditionalUses} usage{plant._count.traditionalUses > 1 ? "s" : ""} documenté{plant._count.traditionalUses > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "24px",
          }}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <span style={{ padding: "0 16px", color: "#6b7280" }}>
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
