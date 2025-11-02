"use client";

export function OngletConsultations({ patient }: { patient: any }) {
  if (patient.consultations.length === 0) {
    return (
      <div
        style={{
          background: "#f9fafb",
          padding: "48px",
          borderRadius: "12px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <p style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
          Aucune consultation enregistrée
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Les consultations apparaîtront ici une fois créées
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3
        style={{
          fontSize: "1.2rem",
          fontWeight: "600",
          color: "#1f2937",
          marginBottom: "24px",
        }}
      >
        📋 Historique des consultations
      </h3>

      {/* Timeline verticale */}
      <div style={{ position: "relative" }}>
        {/* Ligne verticale */}
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

        {/* Consultations */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {patient.consultations.map((consultation: any, idx: number) => {
            const typeColors: Record<
              string,
              { bg: string; border: string; text: string; icon: string }
            > = {
              initiale: { bg: "#dbeafe", border: "#2563eb", text: "#1e40af", icon: "🆕" },
              suivi: { bg: "#d1fae5", border: "#10b981", text: "#065f46", icon: "🔄" },
              urgence: { bg: "#fee2e2", border: "#dc2626", text: "#991b1b", icon: "🚨" },
            };

            const color = consultation.type
              ? typeColors[consultation.type] || typeColors.suivi
              : typeColors.suivi;

            return (
              <div
                key={consultation.id}
                style={{
                  position: "relative",
                  paddingLeft: "56px",
                }}
              >
                {/* Point sur la timeline */}
                <div
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "8px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: color.border,
                    border: "3px solid white",
                    boxShadow: "0 0 0 2px " + color.border,
                  }}
                />

                {/* Carte consultation */}
                <div
                  style={{
                    background: "white",
                    border: `2px solid ${color.border}`,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  {/* En-tête */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "16px",
                      paddingBottom: "16px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#1f2937",
                          marginBottom: "4px",
                        }}
                      >
                        {new Date(consultation.dateConsultation).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      {consultation.type && (
                        <div
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            background: color.bg,
                            color: color.text,
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                          }}
                        >
                          {color.icon} {consultation.type.charAt(0).toUpperCase() + consultation.type.slice(1)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Motif */}
                  {consultation.motifConsultation && (
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "#6b7280",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                        }}
                      >
                        Motif
                      </div>
                      <div style={{ color: "#1f2937", lineHeight: "1.6" }}>
                        {consultation.motifConsultation}
                      </div>
                    </div>
                  )}

                  {/* Commentaire */}
                  {consultation.commentaire && (
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "#6b7280",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                        }}
                      >
                        Notes praticien
                      </div>
                      <div
                        style={{
                          background: "#fef3c7",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #fbbf24",
                          color: "#78350f",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {consultation.commentaire}
                      </div>
                    </div>
                  )}

                  {/* Prescriptions */}
                  {consultation.prescriptions && (
                    <div style={{ marginBottom: "0" }}>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "#6b7280",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                        }}
                      >
                        Prescriptions
                      </div>
                      <div
                        style={{
                          background: "#f0fdf4",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #10b981",
                          color: "#065f46",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {consultation.prescriptions}
                      </div>
                    </div>
                  )}

                  {/* Lien BdF si existe */}
                  {consultation.bdfAnalysisId && (
                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                        🧬 Analyse BdF associée
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}