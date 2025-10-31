"use client";

export function OngletApercu({ patient }: { patient: any }) {
  const derniereBdf = patient.bdfAnalyses[0];
  const derniereConsultation = patient.consultations[0];
  const derniereAnthro = patient.anthropometries[0];

  // Vérifier si le patient a des allergies, traitements, tags
  const hasAllergies = patient.allergies && patient.allergies.trim() !== "";
  const hasTraitements = patient.traitements && patient.traitements.trim() !== "";
  const hasTags = patient.tags && Array.isArray(patient.tags) && patient.tags.length > 0;

  // Fonction pour obtenir les couleurs d'un index BdF
  const getIndexColor = (value: number) => {
    if (value < 0.8)
      return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" }; // Jaune (hypo)
    if (value > 1.2)
      return { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" }; // Rouge (hyper)
    return { bg: "#d1fae5", border: "#10b981", text: "#065f46" }; // Vert (normal)
  };

  return (
    <div>
      {/* Badges d'alerte en haut */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {hasAllergies && (
          <div
            style={{
              padding: "8px 16px",
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              border: "2px solid #dc2626",
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
              fontSize: "14px",
              fontWeight: "600",
              border: "2px solid #2563eb",
            }}
          >
            💊 Traitements en cours
          </div>
        )}
        {hasTags && patient.tags.map((tag: string, idx: number) => (
          <div
            key={idx}
            style={{
              padding: "8px 16px",
              background: "#f3f4f6",
              color: "#374151",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #d1d5db",
            }}
          >
            🏷️ {tag}
          </div>
        ))}
      </div>

      {/* Dernière analyse BdF */}
      {derniereBdf ? (
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            📊 Dernière analyse BdF
          </h2>
          <div
            style={{
              fontSize: "14px",
              color: "#6b7280",
              marginBottom: "12px",
            }}
          >
            {new Date(derniereBdf.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          {/* Grille des 8 cartes d'index */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {derniereBdf.indexes.map((index: any, idx: number) => {
              const color = getIndexColor(index.value);
              return (
                <div
                  key={idx}
                  style={{
                    padding: "16px",
                    background: color.bg,
                    border: `2px solid ${color.border}`,
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: color.text,
                      marginBottom: "8px",
                    }}
                  >
                    {index.name}
                  </div>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "700",
                      color: color.text,
                      marginBottom: "8px",
                    }}
                  >
                    {index.value.toFixed(2)}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: color.text,
                      opacity: 0.8,
                    }}
                  >
                    {index.comment}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Résumé et axes dominants */}
          <div
            style={{
              padding: "20px",
              background: "#f9fafb",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "12px",
              }}
            >
              📝 Résumé
            </div>
            <div style={{ fontSize: "14px", color: "#4b5563", whiteSpace: "pre-line" }}>
              {derniereBdf.summary}
            </div>
          </div>

          {derniereBdf.axes && Array.isArray(derniereBdf.axes) && derniereBdf.axes.length > 0 && (
            <div
              style={{
                padding: "20px",
                background: "#eff6ff",
                borderRadius: "12px",
                border: "1px solid #93c5fd",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1e40af",
                  marginBottom: "12px",
                }}
              >
                🎯 Axes dominants
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {derniereBdf.axes.map((axe: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "8px 16px",
                      background: "white",
                      color: "#1e40af",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      border: "1px solid #93c5fd",
                    }}
                  >
                    {axe}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "16px",
            marginBottom: "32px",
          }}
        >
          Aucune analyse BdF disponible
        </div>
      )}

      {/* Dernière consultation */}
      {derniereConsultation && (
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            📋 Dernière consultation
          </h2>
          <div
            style={{
              padding: "20px",
              background: "#f9fafb",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
              {new Date(derniereConsultation.dateConsultation).toLocaleDateString(
                "fr-FR",
                { day: "numeric", month: "long", year: "numeric" }
              )}
            </div>
            {derniereConsultation.motifConsultation && (
              <div style={{ fontSize: "15px", color: "#374151", marginBottom: "12px" }}>
                <strong>Motif :</strong> {derniereConsultation.motifConsultation}
              </div>
            )}
            {derniereConsultation.commentaire && (
              <div style={{ fontSize: "14px", color: "#4b5563", whiteSpace: "pre-line" }}>
                {derniereConsultation.commentaire}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dernière anthropométrie */}
      {derniereAnthro && (
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            📏 Dernières mesures
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "16px",
            }}
          >
            {derniereAnthro.poids && (
              <div
                style={{
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  Poids
                </div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                  {derniereAnthro.poids} kg
                </div>
              </div>
            )}
            {derniereAnthro.taille && (
              <div
                style={{
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  Taille
                </div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                  {derniereAnthro.taille} cm
                </div>
              </div>
            )}
            {derniereAnthro.imc && (
              <div
                style={{
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  IMC
                </div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                  {derniereAnthro.imc.toFixed(1)}
                </div>
              </div>
            )}
            {derniereAnthro.paSys && derniereAnthro.paDia && (
              <div
                style={{
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  Pression artérielle
                </div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                  {derniereAnthro.paSys}/{derniereAnthro.paDia}
                </div>
              </div>
            )}
            {derniereAnthro.pouls && (
              <div
                style={{
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  Pouls
                </div>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                  {derniereAnthro.pouls} bpm
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
        <button
          onClick={() => alert("Fonction à implémenter : Nouvelle consultation")}
          style={{
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ➕ Nouvelle consultation
        </button>
        <button
          onClick={() => alert("Fonction à implémenter : Nouvelle analyse BdF")}
          style={{
            padding: "12px 24px",
            background: "#059669",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🧬 Nouvelle analyse BdF
        </button>
        <button
          onClick={() => alert("Fonction à implémenter : Ajouter mesures")}
          style={{
            padding: "12px 24px",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          📏 Ajouter mesures
        </button>
      </div>
    </div>
  );
}
