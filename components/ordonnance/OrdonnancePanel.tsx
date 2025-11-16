"use client";

import { useState } from "react";
import type { OrdonnanceStructuree, RecommandationTherapeutique, TherapeuticScope } from "@/lib/ordonnance/types";

type OrdonnancePanelProps = {
  ordonnance: OrdonnanceStructuree | null;
  loading?: boolean;
};

// Helper pour générer le titre dynamique du volet 2
function getVolet2Title(scope?: TherapeuticScope): { title: string; description: string; emoji: string } {
  if (!scope) {
    return {
      title: "VOLET 2 - PHYTOTHÉRAPIE ÉLARGIE",
      description: "Phytothérapie clinique, Gemmothérapie, Aromathérapie",
      emoji: "🌱",
    };
  }

  const scopes = [];
  if (scope.planteMedicinale) scopes.push("Phytothérapie");
  if (scope.gemmotherapie) scopes.push("Gemmothérapie");
  if (scope.aromatherapie) scopes.push("Aromathérapie");

  // Si un seul scope sélectionné, titre spécifique
  if (scopes.length === 1) {
    if (scope.gemmotherapie) {
      return {
        title: "VOLET 2 - GEMMOTHÉRAPIE",
        description: "Macérats de bourgeons",
        emoji: "🌿",
      };
    }
    if (scope.aromatherapie) {
      return {
        title: "VOLET 2 - AROMATHÉRAPIE",
        description: "Huiles essentielles",
        emoji: "💧",
      };
    }
    if (scope.planteMedicinale) {
      return {
        title: "VOLET 2 - PHYTOTHÉRAPIE",
        description: "Plantes médicinales",
        emoji: "🌱",
      };
    }
  }

  // Si plusieurs scopes, titre global
  return {
    title: "VOLET 2 - PHYTOTHÉRAPIE ÉLARGIE",
    description: scopes.join(", "),
    emoji: "🌱",
  };
}

export function OrdonnancePanel({ ordonnance, loading }: OrdonnancePanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    volet1: true,
    volet2: true,
    volet3: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          borderRadius: "12px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "16px",
              animation: "pulse 2s infinite",
            }}
          >
            ⏳
          </div>
          <p style={{ fontSize: "1.1rem", color: "#6b7280" }}>
            Génération de l'ordonnance en cours...
          </p>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginTop: "8px" }}>
            Analyse du terrain + Recherche vectorstores
          </p>
        </div>
      </div>
    );
  }

  if (!ordonnance) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          borderRadius: "12px",
        }}
      >
        <div style={{ textAlign: "center", padding: "48px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>💊</div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
            Aucune ordonnance sélectionnée
          </h3>
          <p style={{ fontSize: "0.95rem", color: "#6b7280" }}>
            Générez une ordonnance pour commencer
          </p>
        </div>
      </div>
    );
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      brouillon: { bg: "#fef3c7", text: "#92400e" },
      validee: { bg: "#d1fae5", text: "#065f46" },
      archivee: { bg: "#e5e7eb", text: "#374151" },
    };
    return colors[statut] || colors.brouillon;
  };

  const statutColor = getStatutColor(ordonnance.statut);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* En-tête ordonnance */}
      <div
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "4px" }}>
              💊 Ordonnance Endobiogénique
            </h2>
            <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              {new Date(ordonnance.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            style={{
              padding: "6px 12px",
              background: statutColor.bg,
              color: statutColor.text,
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            {ordonnance.statut}
          </span>
        </div>

        {ordonnance.syntheseClinique && (
          <p
            style={{
              fontSize: "0.9rem",
              lineHeight: "1.5",
              opacity: 0.95,
              background: "rgba(255, 255, 255, 0.1)",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            {ordonnance.syntheseClinique}
          </p>
        )}
      </div>

      {/* Contenu */}
      <div
        style={{
          padding: "24px",
        }}
      >
        {/* VOLET 1 - ENDOBIOGÉNIE (Canon) */}
        <VoletSection
          title="VOLET 1 - ENDOBIOGÉNIE (Canon Lapraz/Hedayat)"
          emoji="🌿"
          color="#10b981"
          recommendations={ordonnance.voletEndobiogenique}
          expanded={expandedSections.volet1}
          onToggle={() => toggleSection("volet1")}
          description="Recommandations issues du vectorstore canon Endobiogénie"
          badge="Niveau 1"
        />

        {/* VOLET 2 - PHYTO ÉLARGI (titre dynamique selon scope) */}
        {(() => {
          const volet2Info = getVolet2Title(ordonnance.scope);
          return (
            <VoletSection
              title={volet2Info.title}
              emoji={volet2Info.emoji}
              color="#3b82f6"
              recommendations={ordonnance.voletPhytoElargi}
              expanded={expandedSections.volet2}
              onToggle={() => toggleSection("volet2")}
              description={volet2Info.description}
              badge="Niveau 2"
            />
          );
        })()}

        {/* VOLET 3 - COMPLÉMENTS */}
        <VoletSection
          title="VOLET 3 - MICRO-NUTRITION"
          emoji="💊"
          color="#8b5cf6"
          recommendations={ordonnance.voletComplements}
          expanded={expandedSections.volet3}
          onToggle={() => toggleSection("volet3")}
          description="Compléments nutritionnels ciblés sur les axes perturbés"
          badge="Niveau 3"
        />

        {/* Conseils associés */}
        {ordonnance.conseilsAssocies && ordonnance.conseilsAssocies.length > 0 && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: "#fef3c7",
              border: "2px solid #f59e0b",
              borderRadius: "12px",
            }}
          >
            <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#92400e", marginBottom: "12px" }}>
              💡 Conseils hygiéno-diététiques
            </h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#92400e" }}>
              {ordonnance.conseilsAssocies.map((conseil, idx) => (
                <li key={idx} style={{ marginBottom: "8px", fontSize: "0.9rem", lineHeight: "1.5" }}>
                  {conseil}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Surveillance biologique */}
        {ordonnance.surveillanceBiologique && ordonnance.surveillanceBiologique.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              background: "#dbeafe",
              border: "2px solid #3b82f6",
              borderRadius: "12px",
            }}
          >
            <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#1e40af", marginBottom: "12px" }}>
              🔬 Surveillance biologique recommandée
            </h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#1e40af" }}>
              {ordonnance.surveillanceBiologique.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "8px", fontSize: "0.9rem", lineHeight: "1.5" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer avec actions */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f9fafb",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
          {ordonnance.voletEndobiogenique.length + ordonnance.voletPhytoElargi.length + ordonnance.voletComplements.length}{" "}
          recommandation(s)
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            style={{
              padding: "10px 20px",
              background: "white",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📋 Copier
          </button>
          <button
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            }}
          >
            🖨️ Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Composant Volet Section
// ========================================
type VoletSectionProps = {
  title: string;
  emoji: string;
  color: string;
  recommendations: RecommandationTherapeutique[];
  expanded: boolean;
  onToggle: () => void;
  description?: string;
  badge?: string;
};

function VoletSection({ title, emoji, color, recommendations, expanded, onToggle, description, badge }: VoletSectionProps) {
  const isEmpty = recommendations.length === 0;

  return (
    <div
      style={{
        marginBottom: "24px",
        border: `2px solid ${isEmpty ? "#e5e7eb" : color}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* En-tête du volet */}
      <div
        onClick={onToggle}
        style={{
          padding: "16px 20px",
          background: isEmpty ? "#f9fafb" : color,
          color: isEmpty ? "#6b7280" : "white",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>{emoji}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>{title}</h3>
              {badge && (
                <span
                  style={{
                    padding: "2px 8px",
                    background: isEmpty ? "#e5e7eb" : "rgba(255, 255, 255, 0.3)",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: "600",
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p style={{ fontSize: "0.8rem", margin: "4px 0 0 0", opacity: 0.9 }}>
                {description}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              padding: "4px 10px",
              background: isEmpty ? "#d1d5db" : "rgba(255, 255, 255, 0.3)",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            {recommendations.length}
          </span>
          <span style={{ fontSize: "1.2rem" }}>{expanded ? "▼" : "▶"}</span>
        </div>
      </div>

      {/* Contenu du volet */}
      {expanded && (
        <div style={{ padding: isEmpty ? "24px" : "0" }}>
          {isEmpty ? (
            <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.9rem" }}>
              Aucune recommandation dans ce volet
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1px", background: "#e5e7eb" }}>
              {recommendations.map((rec, idx) => (
                <RecommandationCard key={rec.id} recommendation={rec} index={idx} color={color} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========================================
// Composant Carte Recommandation
// ========================================
type RecommandationCardProps = {
  recommendation: RecommandationTherapeutique;
  index: number;
  color: string;
};

function RecommandationCard({ recommendation, index, color }: RecommandationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div style={{ background: "white", padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div style={{ flex: 1 }}>
          {/* Titre */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                background: color,
                color: "white",
                borderRadius: "50%",
                fontSize: "0.75rem",
                fontWeight: "600",
              }}
            >
              {index + 1}
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: "600", color: "#1f2937", margin: 0 }}>
              {recommendation.substance}
            </h4>
            <span
              style={{
                padding: "2px 8px",
                background: "#f3f4f6",
                color: "#6b7280",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "600",
              }}
            >
              {recommendation.forme}
            </span>
          </div>

          {/* Posologie + Durée */}
          <div style={{ display: "grid", gap: "6px", marginBottom: "8px" }}>
            <div style={{ fontSize: "0.9rem", color: "#4b5563" }}>
              <strong>Posologie:</strong> {recommendation.posologie}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#4b5563" }}>
              <strong>Durée:</strong> {recommendation.duree}
            </div>
          </div>

          {/* Détails expandable */}
          {showDetails && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#6b7280",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#374151" }}>Axe cible:</strong> {recommendation.axeCible}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#374151" }}>Mécanisme:</strong> {recommendation.mecanisme}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#374151" }}>Source:</strong> {recommendation.sourceVectorstore} (niveau {recommendation.niveauPreuve})
              </div>
              {recommendation.CI && recommendation.CI.length > 0 && (
                <div style={{ marginTop: "8px", color: "#ef4444" }}>
                  <strong>⚠️ CI:</strong> {recommendation.CI.join(", ")}
                </div>
              )}
            </div>
          )}

          {/* Bouton détails */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              marginTop: "8px",
              padding: "4px 12px",
              background: "#f3f4f6",
              color: "#6b7280",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {showDetails ? "▲ Masquer" : "▼ Détails"}
          </button>
        </div>

        {/* Priorité */}
        <div
          style={{
            padding: "4px 8px",
            background: recommendation.priorite === 1 ? "#fee2e2" : recommendation.priorite === 2 ? "#fef3c7" : "#e0e7ff",
            color: recommendation.priorite === 1 ? "#dc2626" : recommendation.priorite === 2 ? "#f59e0b" : "#6366f1",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: "600",
          }}
        >
          P{recommendation.priorite}
        </div>
      </div>
    </div>
  );
}
