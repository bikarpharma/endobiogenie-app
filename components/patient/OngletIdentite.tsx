"use client";

export function OngletIdentite({ patient }: { patient: any }) {
  return (
    <div>
      {/* Informations personnelles */}
      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "16px",
          }}
        >
          👤 Informations personnelles
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
            padding: "20px",
            background: "#f9fafb",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
              Nom complet
            </div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
              {patient.prenom} {patient.nom}
            </div>
          </div>
          {patient.dateNaissance && (
            <div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                Date de naissance
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                {new Date(patient.dateNaissance).toLocaleDateString("fr-FR")}
                {" ("}
                {Math.floor(
                  (new Date().getTime() - new Date(patient.dateNaissance).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                )}
                {" ans)"}
              </div>
            </div>
          )}
          {patient.sexe && (
            <div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                Sexe
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                {patient.sexe === "M" || patient.sexe === "H" ? "Masculin" : "Féminin"}
              </div>
            </div>
          )}
          {patient.telephone && (
            <div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                Téléphone
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                {patient.telephone}
              </div>
            </div>
          )}
          {patient.email && (
            <div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                Email
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                {patient.email}
              </div>
            </div>
          )}
        </div>
        {patient.notes && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              background: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
              Notes
            </div>
            <div style={{ fontSize: "16px", color: "#1f2937", whiteSpace: "pre-line" }}>
              {patient.notes}
            </div>
          </div>
        )}
      </div>

      {/* Allergies - EN ROUGE */}
      {patient.allergies && patient.allergies.trim() !== "" && (
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#dc2626",
              marginBottom: "16px",
            }}
          >
            🔴 Allergies
          </h2>
          <div
            style={{
              padding: "20px",
              background: "#fee2e2",
              borderRadius: "12px",
              border: "2px solid #dc2626",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                color: "#991b1b",
                whiteSpace: "pre-line",
                fontWeight: "500",
              }}
            >
              {patient.allergies}
            </div>
          </div>
        </div>
      )}

      {/* ATCD Médicaux */}
      {patient.atcdMedicaux && patient.atcdMedicaux.trim() !== "" && (
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            📋 Antécédents médicaux
          </h2>
          <div
            style={{
              padding: "20px",
              background: "#f9fafb",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "15px", color: "#374151", whiteSpace: "pre-line" }}>
              {patient.atcdMedicaux}
            </div>
          </div>
        </div>
      )}

      {/* ATCD Chirurgicaux */}
      {patient.atcdChirurgicaux && patient.atcdChirurgicaux.trim() !== "" && (
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            ✂️ Antécédents chirurgicaux
          </h2>
          <div
            style={{
              padding: "20px",
              background: "#f9fafb",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "15px", color: "#374151", whiteSpace: "pre-line" }}>
              {patient.atcdChirurgicaux}
            </div>
          </div>
        </div>
      )}

      {/* Traitements en cours - EN BLEU */}
      {patient.traitements && patient.traitements.trim() !== "" && (
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#2563eb",
              marginBottom: "16px",
            }}
          >
            💊 Traitements en cours
          </h2>
          <div
            style={{
              padding: "20px",
              background: "#dbeafe",
              borderRadius: "12px",
              border: "2px solid #2563eb",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                color: "#1e40af",
                whiteSpace: "pre-line",
                fontWeight: "500",
              }}
            >
              {patient.traitements}
            </div>
          </div>
        </div>
      )}

      {/* Tableau anthropométrie */}
      {patient.anthropometries && patient.anthropometries.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            📏 Mesures anthropométriques
          </h2>
          <div
            style={{
              overflowX: "auto",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    Poids (kg)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    Taille (cm)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    IMC
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    PA (mmHg)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    Pouls (bpm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {patient.anthropometries.map((anthro: any, idx: number) => (
                  <tr
                    key={anthro.id}
                    style={{
                      background: idx % 2 === 0 ? "white" : "#fafafa",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#374151",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {new Date(anthro.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#374151",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {anthro.poids || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#374151",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {anthro.taille || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#374151",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {anthro.imc ? anthro.imc.toFixed(1) : "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#374151",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {anthro.paSys && anthro.paDia
                        ? `${anthro.paSys}/${anthro.paDia}`
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#374151",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {anthro.pouls || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
