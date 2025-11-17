"use client";

import { useState } from "react";
import { GenerateOrdonnanceButton } from "./GenerateOrdonnanceButton";

type OrdonnanceItem = {
  id: string;
  createdAt: string;
  statut: string;
  voletEndobiogenique: any[];
  voletPhytoElargi: any[];
  voletComplements: any[];
  syntheseClinique: string;
};

type OngletOrdonnancesIntelligentProps = {
  patient: any;
};

export function OngletOrdonnancesIntelligent({ patient }: OngletOrdonnancesIntelligentProps) {
  const ordonnances: OrdonnanceItem[] = patient.ordonnances || [];
  const hasOrdonnances = ordonnances.length > 0;
  const hasBdfAnalysis = patient.bdfAnalyses && patient.bdfAnalyses.length > 0;
  const hasInterrogatoire = patient.interrogatoire !== null && patient.interrogatoire !== undefined;

  // Afficher le statut avec une couleur
  const getStatutBadge = (statut: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      brouillon: { bg: "#fef3c7", text: "#92400e" },
      validee: { bg: "#d1fae5", text: "#065f46" },
      archivee: { bg: "#e5e7eb", text: "#374151" },
    };

    const color = colors[statut] || colors.brouillon;

    return (
      <span
        style={{
          padding: "4px 12px",
          background: color.bg,
          color: color.text,
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: "600",
          textTransform: "uppercase",
        }}
      >
        {statut}
      </span>
    );
  };

  return (
    <div>
      {/* En-tête avec bouton génération */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
            🧬 Ordonnances Intelligentes
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            {hasOrdonnances
              ? `${ordonnances.length} ordonnance${ordonnances.length > 1 ? "s" : ""} générée${ordonnances.length > 1 ? "s" : ""}`
              : "Aucune ordonnance générée"}
          </p>
        </div>

        <GenerateOrdonnanceButton
          patientId={patient.id}
          hasBdfAnalysis={hasBdfAnalysis}
          hasInterrogatoire={hasInterrogatoire}
        />
      </div>

      {/* Alerte si aucune source de données */}
      {!hasBdfAnalysis && !hasInterrogatoire && (
        <div
          style={{
            background: "#fee2e2",
            border: "2px solid #ef4444",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.5rem" }}>🚫</span>
            <div>
              <div style={{ fontWeight: "600", color: "#991b1b", marginBottom: "4px" }}>
                Aucune donnée clinique disponible
              </div>
              <div style={{ fontSize: "0.9rem", color: "#991b1b" }}>
                Remplissez au minimum un interrogatoire ou une analyse BdF pour générer une ordonnance.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info système intelligent */}
      <div
        style={{
          background: "#dbeafe",
          border: "2px solid #3b82f6",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>💡</span>
          <div>
            <div style={{ fontWeight: "600", color: "#1e40af", marginBottom: "8px" }}>
              Système d'ordonnances intelligent
            </div>
            <div style={{ fontSize: "0.85rem", color: "#1e40af", lineHeight: "1.6" }}>
              <strong>Architecture à 2 niveaux:</strong>
              <br />
              1️⃣ Analyse clinique du terrain (interrogatoire endobiogénique par axes)
              <br />
              2️⃣ Analyse biologique fonctionnelle (index BdF, si disponibles)
              <br />
              3️⃣ Fusion multi-sources (Clinique + BdF + RAG + IA)
              <br />
              4️⃣ Proposition phyto/gemmo/aroma + micro-nutrition avec contrôles de sécurité
            </div>
          </div>
        </div>
      </div>

      {/* Liste des ordonnances */}
      {hasOrdonnances ? (
        <div style={{ display: "grid", gap: "16px" }}>
          {ordonnances.map((ordonnance) => (
            <OrdonnanceCard key={ordonnance.id} ordonnance={ordonnance} />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "#f9fafb",
            padding: "48px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🧬</div>
          <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Aucune ordonnance générée</p>
          <p style={{ fontSize: "0.9rem" }}>
            Cliquez sur "Générer ordonnance intelligente" pour créer une prescription personnalisée
          </p>
        </div>
      )}
    </div>
  );
}

// ========================================
// Composant Carte Ordonnance
// ========================================
type OrdonnanceCardProps = {
  ordonnance: OrdonnanceItem;
};

function OrdonnanceCard({ ordonnance }: OrdonnanceCardProps) {
  const totalRecs =
    (ordonnance.voletEndobiogenique?.length || 0) +
    (ordonnance.voletPhytoElargi?.length || 0) +
    (ordonnance.voletComplements?.length || 0);

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
    <a
      href={`/ordonnances/${ordonnance.id}`}
      style={{
        display: "block",
        background: "white",
        border: "2px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        textDecoration: "none",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#3b82f6";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
        <div>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
            🧬 Ordonnance Endobiogénique
          </h4>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            {new Date(ordonnance.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          style={{
            padding: "4px 12px",
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
            color: "#4b5563",
            marginBottom: "16px",
            lineHeight: "1.5",
          }}
        >
          {ordonnance.syntheseClinique.substring(0, 150)}
          {ordonnance.syntheseClinique.length > 150 ? "..." : ""}
        </p>
      )}

      {/* Statistiques des volets */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
        {ordonnance.voletEndobiogenique && ordonnance.voletEndobiogenique.length > 0 && (
          <span
            style={{
              padding: "6px 12px",
              background: "#d1fae5",
              color: "#065f46",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>🌿</span>
            <span>Endobiogénie: {ordonnance.voletEndobiogenique.length}</span>
          </span>
        )}
        {ordonnance.voletPhytoElargi && ordonnance.voletPhytoElargi.length > 0 && (
          <span
            style={{
              padding: "6px 12px",
              background: "#dbeafe",
              color: "#1e40af",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>🌱</span>
            <span>Phyto élargi: {ordonnance.voletPhytoElargi.length}</span>
          </span>
        )}
        {ordonnance.voletComplements && ordonnance.voletComplements.length > 0 && (
          <span
            style={{
              padding: "6px 12px",
              background: "#e0e7ff",
              color: "#4338ca",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>💊</span>
            <span>Compléments: {ordonnance.voletComplements.length}</span>
          </span>
        )}
      </div>

      {/* Total recommandations */}
      <div
        style={{
          padding: "12px",
          background: "#f9fafb",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>
          Total: {totalRecs} recommandation{totalRecs > 1 ? "s" : ""}
        </span>
        <span style={{ fontSize: "0.9rem", color: "#3b82f6", fontWeight: "600" }}>
          Ouvrir →
        </span>
      </div>
    </a>
  );
}
