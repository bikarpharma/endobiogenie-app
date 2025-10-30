// ========================================
// PAGE LISTE DES PATIENTS - /patients
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calculateAge } from "@/types/patient";

export default async function PatientsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Récupérer tous les patients de l'utilisateur (non archivés)
  const patients = await prisma.patient.findMany({
    where: {
      userId: session.user.id,
      isArchived: false,
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    include: {
      _count: {
        select: { consultations: true },
      },
    },
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      {/* En-tête */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#2563eb" }}>
            👤 Mes Patients
          </h1>
          <p style={{ color: "#6b7280" }}>
            Gestion des dossiers patients et historique des consultations
          </p>
        </div>
        <Link
          href="/patients/new"
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          + Nouveau patient
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            background: "#f0f9ff",
            padding: "20px",
            borderRadius: "12px",
            border: "2px solid #0ea5e9",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#0284c7" }}>
            {patients.length}
          </div>
          <div style={{ color: "#0c4a6e", fontSize: "0.9rem" }}>
            Patient{patients.length > 1 ? "s" : ""} actif{patients.length > 1 ? "s" : ""}
          </div>
        </div>
        <div
          style={{
            background: "#fef3c7",
            padding: "20px",
            borderRadius: "12px",
            border: "2px solid #fbbf24",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b" }}>
            {patients.reduce((sum, p) => sum + p._count.consultations, 0)}
          </div>
          <div style={{ color: "#78350f", fontSize: "0.9rem" }}>
            Consultation{patients.reduce((sum, p) => sum + p._count.consultations, 0) > 1 ? "s" : ""} totales
          </div>
        </div>
      </div>

      {/* Liste des patients */}
      {patients.length === 0 ? (
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
            Aucun patient enregistré
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            Commencez par créer votre premier dossier patient
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          {/* En-tête du tableau */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 1fr 120px 150px 100px",
              padding: "16px 24px",
              background: "#f9fafb",
              borderBottom: "2px solid #e5e7eb",
              fontWeight: "600",
              fontSize: "0.85rem",
              color: "#374151",
              textTransform: "uppercase",
            }}
          >
            <div>N° Patient</div>
            <div>Nom</div>
            <div>Prénom</div>
            <div>Âge</div>
            <div>Consultations</div>
            <div></div>
          </div>

          {/* Lignes des patients */}
          {patients.map((patient) => {
            const age = patient.dateNaissance
              ? calculateAge(patient.dateNaissance)
              : null;

            return (
              <div
                key={patient.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 1fr 120px 150px 100px",
                  padding: "16px 24px",
                  borderBottom: "1px solid #e5e7eb",
                  alignItems: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                }}
              >
                <div style={{ fontFamily: "monospace", color: "#2563eb", fontWeight: "600" }}>
                  {patient.numeroPatient}
                </div>
                <div style={{ fontWeight: "600", color: "#1f2937" }}>
                  {patient.nom}
                </div>
                <div style={{ color: "#4b5563" }}>{patient.prenom}</div>
                <div style={{ color: "#6b7280" }}>
                  {age !== null ? `${age} ans` : "-"}
                </div>
                <div style={{ color: "#6b7280" }}>
                  {patient._count.consultations} consultation{patient._count.consultations > 1 ? "s" : ""}
                </div>
                <div>
                  <Link
                    href={`/patients/${patient.id}`}
                    style={{
                      padding: "6px 12px",
                      background: "#2563eb",
                      color: "white",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    Voir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}