// ========================================
// PAGE NOUVEAU PATIENT - /patients/new
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewPatientForm } from "@/components/patient/NewPatientForm";

export default async function NewPatientPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      {/* En-tête */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#2563eb" }}>
          ➕ Nouveau Patient
        </h1>
        <p style={{ color: "#6b7280" }}>
          Créer un nouveau dossier patient
        </p>
      </div>

      {/* Formulaire */}
      <NewPatientForm userId={session.user.id} />
    </div>
  );
}
