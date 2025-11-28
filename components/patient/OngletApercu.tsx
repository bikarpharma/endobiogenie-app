"use client";

import Link from "next/link";

export function OngletApercu({ patient }: { patient: any }) {
  const derniereBdf = patient.bdfAnalyses[0];
  const hasAllergies = patient.allergies && patient.allergies.trim() !== "";
  const hasTraitements = patient.traitements && patient.traitements.trim() !== "";
  const hasInterrogatoire = patient.interrogatoire && Object.keys(patient.interrogatoire).length > 0;

  return (
    <div>
      {/* Badges alertes */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
        {hasAllergies && (
          <div
            style={{
              padding: "8px 16px",
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              border: "1px solid #dc2626",
            }}
          >
            🔴 Allergies
          </div>
        )}
        {hasTraitements && (
          <div
            style={{
              padding: "8px 16px",
              background: "#dbeafe",
              color: "#2563eb",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              border: "1px solid #2563eb",
            }}
          >
            💊 Traitements en cours
          </div>
        )}
        {patient.tags && Array.isArray(patient.tags) && patient.tags.length > 0 && (
          <>
            {patient.tags.map((tag: string, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: "8px 16px",
                  background: "#fef3c7",
                  color: "#92400e",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  border: "1px solid #fbbf24",
                }}
              >
                🏷️ {tag}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bref aperçu dernière BdF */}
      {derniereBdf ? (
        <Link
          href={`/patients/${patient.id}?tab=analyses`}
          style={{
            display: "block",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "32px",
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.5rem" }}>📊</span>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1f2937", margin: 0 }}>
                  Dernière analyse BdF
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                  {Object.keys(derniereBdf.inputs as Record<string, any>).length} biomarqueurs • {Object.keys(derniereBdf.indexes as Record<string, any>).length} index calculés
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                {new Date(derniereBdf.date).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#3b82f6", fontWeight: "500", marginTop: "4px" }}>
                Voir les détails →
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div
          style={{
            background: "#f9fafb",
            padding: "32px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "32px",
          }}
        >
          <p style={{ fontSize: "1rem", marginBottom: "4px" }}>Aucune analyse BdF enregistrée</p>
          <p style={{ fontSize: "0.85rem", margin: 0 }}>Créez une première analyse pour ce patient</p>
        </div>
      )}

      {/* Actions rapides */}
      <div>
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "16px",
          }}
        >
          ⚡ Actions rapides
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          {/* Nouvelle analyse BdF - toujours visible */}
          <Link
            href={`/bdf?patientId=${patient.id}`}
            style={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: "600",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            🧬 Nouvelle analyse BdF
          </Link>

          {/* Interrogatoire - toujours visible */}
          <Link
            href={`/patients/${patient.id}/interrogatoire`}
            style={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "white",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: "600",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
            }}
          >
            📝 {hasInterrogatoire ? "Modifier l'interrogatoire" : "Nouvel interrogatoire"}
          </Link>

          {/* Nouvelle consultation - visible uniquement si interrogatoire existe */}
          {hasInterrogatoire && (
            <button
              style={{
                padding: "16px 24px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
              }}
            >
              📋 Nouvelle consultation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}