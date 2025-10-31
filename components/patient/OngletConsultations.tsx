"use client";

export function OngletConsultations({ patient }: { patient: any }) {
  // Couleurs par type de consultation
  const typeColors: Record<string, any> = {
    initiale: {
      bg: "#eff6ff",
      border: "#2563eb",
      text: "#1e40af",
      icon: "🆕",
    },
    suivi: {
      bg: "#f0fdf4",
      border: "#10b981",
      text: "#065f46",
      icon: "✅",
    },
    urgence: {
      bg: "#fee2e2",
      border: "#ef4444",
      text: "#991b1b",
      icon: "🚨",
    },
  };

  if (!patient.consultations || patient.consultations.length === 0) {
    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
          color: "#9ca3af",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
        <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
          Aucune consultation
        </div>
        <div style={{ fontSize: "14px" }}>
          L'historique des consultations du patient apparaîtra ici
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "24px",
        }}
      >
        📋 Historique des consultations ({patient.consultations.length})
      </h2>

      {/* Timeline verticale */}
      <div style={{ position: "relative", paddingLeft: "40px" }}>
        {/* Ligne verticale de la timeline */}
        <div
          style={{
            position: "absolute",
            left: "20px",
            top: "0",
            bottom: "0",
            width: "2px",
            background: "#e5e7eb",
          }}
        />

        {/* Cartes de consultations */}
        {patient.consultations.map((consultation: any, idx: number) => {
          const typeKey = consultation.type || "suivi";
          const color = typeColors[typeKey] || typeColors.suivi;

          return (
            <div
              key={consultation.id}
              style={{
                position: "relative",
                marginBottom: "32px",
              }}
            >
              {/* Point sur la timeline */}
              <div
                style={{
                  position: "absolute",
                  left: "-28px",
                  top: "8px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: color.border,
                  border: "3px solid white",
                  boxShadow: "0 0 0 2px " + color.border,
                }}
              />

              {/* Carte de consultation */}
              <div
                style={{
                  padding: "20px",
                  background: color.bg,
                  border: `2px solid ${color.border}`,
                  borderRadius: "12px",
                }}
              >
                {/* En-tête : Date + Type */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#6b7280",
                    }}
                  >
                    {new Date(consultation.dateConsultation).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </div>
                  <div
                    style={{
                      padding: "6px 12px",
                      background: "white",
                      color: color.text,
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "600",
                      border: `1px solid ${color.border}`,
                    }}
                  >
                    {color.icon} {consultation.type || "Suivi"}
                  </div>
                </div>

                {/* Motif de consultation */}
                {consultation.motifConsultation && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: color.text,
                        marginBottom: "4px",
                      }}
                    >
                      Motif
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        color: "#374151",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {consultation.motifConsultation}
                    </div>
                  </div>
                )}

                {/* Commentaire */}
                {consultation.commentaire && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: color.text,
                        marginBottom: "4px",
                      }}
                    >
                      Observations
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#4b5563",
                        whiteSpace: "pre-line",
                        lineHeight: "1.6",
                      }}
                    >
                      {consultation.commentaire}
                    </div>
                  </div>
                )}

                {/* Prescriptions */}
                {consultation.prescriptions && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      background: "white",
                      borderRadius: "8px",
                      border: `1px solid ${color.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: color.text,
                        marginBottom: "6px",
                      }}
                    >
                      💊 Prescriptions
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        whiteSpace: "pre-line",
                        lineHeight: "1.5",
                      }}
                    >
                      {consultation.prescriptions}
                    </div>
                  </div>
                )}

                {/* Lien vers analyse BdF si présent */}
                {consultation.bdfAnalysisId && (
                  <div style={{ marginTop: "12px" }}>
                    <button
                      onClick={() => alert("Afficher l'analyse BdF associée")}
                      style={{
                        padding: "8px 16px",
                        background: "#7c3aed",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      🧬 Voir l'analyse BdF liée
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton d'action */}
      <div style={{ marginTop: "32px", paddingLeft: "40px" }}>
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
      </div>
    </div>
  );
}
