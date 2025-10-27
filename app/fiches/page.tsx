// ========================================
// PAGE FICHES MALADIES - /fiches
// ========================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { fichesMaladies } from "@/lib/data/fiches-maladies";

const CATEGORIES = [
  { value: "all", label: "Toutes les catégories" },
  { value: "infectieux", label: "Infectieux" },
  { value: "nerveux", label: "Nerveux" },
  { value: "cardiovasculaire", label: "Cardiovasculaire" },
  { value: "digestif", label: "Digestif" },
  { value: "immunitaire", label: "Immunitaire" },
  { value: "urinaire", label: "Urinaire" },
];

const CATEGORY_COLORS: Record<string, string> = {
  infectieux: "#dc2626",
  nerveux: "#7c3aed",
  cardiovasculaire: "#db2777",
  digestif: "#ea580c",
  immunitaire: "#16a34a",
  urinaire: "#0284c7",
};

const CATEGORY_ICONS: Record<string, string> = {
  infectieux: "🦠",
  nerveux: "🧠",
  cardiovasculaire: "❤️",
  digestif: "🫃",
  immunitaire: "🛡️",
  urinaire: "💧",
};

export default function FichesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFiches = fichesMaladies.filter((fiche) => {
    const matchesSearch = fiche.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fiche.symptomes.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || fiche.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "12px", color: "#1f2937" }}>
          📚 Fiches Maladies
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
          Approches multi-thérapeutiques : Endobiogénie • Gemmothérapie • Aromathérapie • Phytothérapie
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "32px" }}>
        {/* Search */}
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="🔍 Rechercher par pathologie ou symptôme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 20px",
              fontSize: "1rem",
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
              outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                padding: "8px 16px",
                border: "2px solid",
                borderColor: selectedCategory === cat.value ? "#3b82f6" : "#e5e7eb",
                borderRadius: "20px",
                background: selectedCategory === cat.value ? "#eff6ff" : "white",
                color: selectedCategory === cat.value ? "#3b82f6" : "#6b7280",
                fontSize: "0.9rem",
                fontWeight: selectedCategory === cat.value ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat.value) {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat.value) {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: "16px", color: "#6b7280", fontSize: "0.95rem" }}>
        {filteredFiches.length} {filteredFiches.length > 1 ? "fiches" : "fiche"} trouvée{filteredFiches.length > 1 ? "s" : ""}
      </div>

      {/* Fiches grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {filteredFiches.map((fiche) => (
          <Link
            key={fiche.id}
            href={`/fiches/${fiche.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                border: "2px solid #f3f4f6",
                transition: "all 0.3s",
                cursor: "pointer",
                height: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = CATEGORY_COLORS[fiche.categorie] || "#3b82f6";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f3f4f6";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Category badge */}
              <div style={{ marginBottom: "12px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    background: `${CATEGORY_COLORS[fiche.categorie]}15`,
                    color: CATEGORY_COLORS[fiche.categorie],
                  }}
                >
                  {CATEGORY_ICONS[fiche.categorie]} {fiche.categorie.charAt(0).toUpperCase() + fiche.categorie.slice(1)}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: "1.3rem", marginBottom: "12px", color: "#1f2937", fontWeight: "700" }}>
                {fiche.titre}
              </h3>

              {/* Symptoms preview */}
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "6px", fontWeight: "600" }}>
                  SYMPTÔMES PRINCIPAUX :
                </p>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#6b7280", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  {fiche.symptomes.slice(0, 3).map((symptome, i) => (
                    <li key={i}>{symptome}</li>
                  ))}
                  {fiche.symptomes.length > 3 && (
                    <li style={{ color: "#9ca3af", fontStyle: "italic" }}>
                      +{fiche.symptomes.length - 3} autre{fiche.symptomes.length - 3 > 1 ? "s" : ""}...
                    </li>
                  )}
                </ul>
              </div>

              {/* Approaches badges */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {fiche.endobiogenie && (
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    background: "#dbeafe",
                    color: "#1e40af",
                  }}>
                    🌿 Endo
                  </span>
                )}
                {fiche.gemmotherapie && (
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    background: "#dcfce7",
                    color: "#166534",
                  }}>
                    🌿 Gemmo
                  </span>
                )}
                {fiche.aromatherapie && (
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    background: "#f3e8ff",
                    color: "#6b21a8",
                  }}>
                    🌺 Aroma
                  </span>
                )}
                {fiche.phytotherapie && (
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    background: "#fff7ed",
                    color: "#9a3412",
                  }}>
                    🌿 Phyto
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {filteredFiches.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
          <p style={{ fontSize: "1.1rem" }}>Aucune fiche trouvée pour cette recherche.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
