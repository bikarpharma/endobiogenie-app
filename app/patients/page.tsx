// ========================================
// PAGE LISTE DES PATIENTS - /patients
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PatientListClient } from "@/components/patient/PatientListClient";

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
      <PatientListClient patients={patients} />
    </div>
  );
}