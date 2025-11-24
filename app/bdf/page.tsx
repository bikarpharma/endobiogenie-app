// ========================================
// PAGE BIOLOGIE DES FONCTIONS - /bdf
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BdfFormStandalone } from "./BdfFormStandalone";

type PageProps = {
  searchParams: Promise<{ patientId?: string }>;
};

export default async function BdfPage({ searchParams }: PageProps) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.warn("Auth not available, running in demo mode");
    session = null;
  }

  if (!session?.user) {
    // En mode démo, créer une session factice
    session = {
      user: {
        id: "demo-user",
        email: "demo@endobiogenie.com",
        name: "Utilisateur Démo"
      }
    };
  }

  // Récupérer les informations du patient si patientId est fourni
  let patient = null;
  const params = await searchParams;
  const patientId = params?.patientId;

  if (patientId) {
    try {
      patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          nom: true,
          prenom: true,
          userId: true,
        },
      });

      // Vérifier que le patient appartient à l'utilisateur connecté
      if (patient && patient.userId !== session.user.id) {
        patient = null;
      }
    } catch (error) {
      // Base de données non disponible - mode démo
      console.warn("Database not available, running in demo mode");
      patient = null;
    }
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#2563eb" }}>
          🧬 Biologie des Fonctions (BdF)
        </h1>
        <p style={{ color: "#6b7280" }}>
          Analyse fonctionnelle du terrain biologique
        </p>
        {patient && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "12px",
              fontSize: "1.25rem",
              fontWeight: "600",
              display: "inline-block",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            👤 Patient : {patient.prenom} {patient.nom}
          </div>
        )}
      </div>

      <BdfFormStandalone userId={session.user.id} patientId={patientId} />
    </div>
  );
}
