// ========================================
// PAGE DÉTAIL PATIENT - /patients/[id]
// ========================================
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calculateAge } from "@/types/patient";
import type { BdfIndex } from "@/types/patient";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  // Récupérer le patient avec toutes ses consultations
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      consultations: {
        orderBy: { dateConsultation: "desc" },
      },
    },
  });

  // Vérifier que le patient existe et appartient à l'utilisateur
  if (!patient) notFound();
  if (patient.userId !== session.user.id) redirect("/patients");

  const age = patient.dateNaissance ? calculateAge(patient.dateNaissance) : null;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "24px" }}>
        <Link
          href="/patients"
          style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.9rem" }}
        >
          ← Retour à la liste des patients
        </Link>
      </div>

      {/* En-tête patient */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "24px",
          }}
        >
          <div>
            <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>
              {patient.numeroPatient}
            </div>
            <h1 style={{ fontSize: "2rem", marginBottom: "8px", color: "#1f2937" }}>
              {patient.nom} {patient.prenom}
            </h1>
            <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
              {age !== null && `${age} ans`}
              {patient.sexe && age !== null && " • "}
              {patient.sexe && patient.sexe}
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={{
                padding: "10px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ✏️ Modifier
            </button>
            <button
              style={{
                padding: "10px 20px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🗄️ Archiver
            </button>
          </div>
        </div>

        {/* Informations patient */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {patient.dateNaissance && (
            <div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                Date de naissance
              </div>
              <div style={{ fontWeight: "600", color: "#1f2937" }}>
                {new Date(patient.dateNaissance).toLocaleDateString("fr-FR")}
              </div>
            </div>
          )}
          {patient.telephone && (
            <div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                Téléphone
              </div>
              <div style={{ fontWeight: "600", color: "#1f2937" }}>
                {patient.telephone}
              </div>
            </div>
          )}
          {patient.email && (
            <div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                Email
              </div>
              <div style={{ fontWeight: "600", color: "#1f2937" }}>
                {patient.email}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
              Consentement RGPD
            </div>
            <div style={{ fontWeight: "600", color: patient.consentementRGPD ? "#059669" : "#dc2626" }}>
              {patient.consentementRGPD ? "✓ Donné" : "✗ Non donné"}
            </div>
          </div>
        </div>

        {patient.notes && (
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "8px" }}>
              Notes
            </div>
            <div
              style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                color: "#4b5563",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {patient.notes}
            </div>
          </div>
        )}
      </div>

      {/* Historique des consultations */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", color: "#1f2937" }}>
            📋 Historique des consultations ({patient.consultations.length})
          </h2>
        </div>

        {patient.consultations.length === 0 ? (
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
              Les analyses BdF peuvent être associées à ce patient
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {patient.consultations.map((consultation) => {
              const indexes = consultation.indexes as BdfIndex[];
              const axes = consultation.axes as string[];
              const inputs = consultation.inputs as Record<string, number>;

              return (
                <div
                  key={consultation.id}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    padding: "24px",
                  }}
                >
                  {/* En-tête consultation */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "20px",
                      paddingBottom: "20px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                        {new Date(consultation.dateConsultation).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      {consultation.type && (
                        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          Type: {consultation.type}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Motif consultation */}
                  {consultation.motifConsultation && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                        Motif de consultation
                      </div>
                      <div style={{ color: "#4b5563", lineHeight: "1.6" }}>
                        {consultation.motifConsultation}
                      </div>
                    </div>
                  )}

                  {/* Valeurs biologiques */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                      📋 Valeurs biologiques
                    </div>
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        color: "#4b5563",
                      }}
                    >
                      {Object.entries(inputs)
                        .filter(([_, value]) => value !== undefined && value !== null)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </div>
                  </div>

                  {/* Index BdF */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                      📊 Index BdF ({indexes.length})
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: "8px",
                      }}
                    >
                      {indexes.map((index, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#f0f9ff",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #0ea5e9",
                            fontSize: "0.8rem",
                          }}
                        >
                          <div style={{ fontWeight: "600", color: "#0284c7" }}>
                            {index.name}
                          </div>
                          <div style={{ color: "#0c4a6e", fontSize: "0.75rem" }}>
                            {index.value.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Résumé fonctionnel */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                      🔬 Résumé fonctionnel
                    </div>
                    <div
                      style={{
                        background: "#f0f9ff",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid #0ea5e9",
                        fontSize: "0.9rem",
                        color: "#0c4a6e",
                        lineHeight: "1.7",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {consultation.summary}
                    </div>
                  </div>

                  {/* Axes sollicités */}
                  {axes.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                        ⚙️ Axes sollicités
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {axes.map((axe, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "#fef3c7",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "1px solid #fbbf24",
                              fontSize: "0.85rem",
                              color: "#78350f",
                            }}
                          >
                            {axe}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lecture endobiogénique */}
                  {consultation.ragText && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                        🧠 Lecture endobiogénique du terrain
                      </div>
                      <div
                        style={{
                          background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                          border: "1px solid #667eea",
                          borderRadius: "8px",
                          padding: "16px",
                          fontSize: "0.9rem",
                          color: "#1f2937",
                          lineHeight: "1.7",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {consultation.ragText}
                      </div>
                    </div>
                  )}

                  {/* Commentaire praticien */}
                  {consultation.commentaire && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                        💬 Commentaire praticien
                      </div>
                      <div
                        style={{
                          background: "#fef3c7",
                          padding: "16px",
                          borderRadius: "8px",
                          border: "1px solid #fbbf24",
                          fontSize: "0.9rem",
                          color: "#78350f",
                          lineHeight: "1.7",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {consultation.commentaire}
                      </div>
                    </div>
                  )}

                  {/* Prescriptions */}
                  {consultation.prescriptions && (
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                        💊 Prescriptions
                      </div>
                      <div
                        style={{
                          background: "#f0fdf4",
                          padding: "16px",
                          borderRadius: "8px",
                          border: "1px solid #10b981",
                          fontSize: "0.9rem",
                          color: "#065f46",
                          lineHeight: "1.7",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {consultation.prescriptions}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}