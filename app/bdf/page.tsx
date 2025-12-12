// ========================================
// PAGE BIOLOGIE DES FONCTIONS - /bdf
// ========================================
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BdfFormStandalone } from "./BdfFormStandalone";

type PageProps = {
  searchParams: Promise<{ patientId?: string; edit?: string }>;
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
  const editAnalysisId = params?.edit;

  // Variables pour le mode édition
  let existingAnalysis = null;
  let initialValues: Record<string, number | null> = {};
  let editMode = false;

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

      // Mode édition: charger l'analyse existante
      if (editAnalysisId && patient) {
        existingAnalysis = await prisma.bdfAnalysis.findUnique({
          where: { id: editAnalysisId },
          select: {
            id: true,
            inputs: true,
            patientId: true,
          },
        });

        // Vérifier que l'analyse appartient au patient
        if (existingAnalysis && existingAnalysis.patientId === patientId) {
          editMode = true;
          // Les inputs sont stockés en JSON - les extraire
          initialValues = (existingAnalysis.inputs as Record<string, number | null>) || {};
        }
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
          {editMode ? "✏️ Modifier l'Analyse BdF" : "🧬 Biologie des Fonctions (BdF)"}
        </h1>
        <p style={{ color: "#6b7280" }}>
          {editMode
            ? "Modifiez les valeurs puis recalculez les index"
            : "Analyse fonctionnelle du terrain biologique"
          }
        </p>
        {patient && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 24px",
              background: editMode
                ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "12px",
              fontSize: "1.25rem",
              fontWeight: "600",
              display: "inline-block",
              boxShadow: editMode
                ? "0 4px 15px rgba(245, 158, 11, 0.4)"
                : "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            👤 Patient : {patient.prenom} {patient.nom}
          </div>
        )}
        {editMode && (
          <div style={{
            marginTop: "12px",
            padding: "8px 16px",
            background: "#fef3c7",
            color: "#92400e",
            borderRadius: "8px",
            fontSize: "0.9rem",
            display: "inline-block",
          }}>
            Mode édition - Les valeurs existantes sont pré-remplies
          </div>
        )}
      </div>

      <BdfFormStandalone
        userId={session.user.id}
        patientId={patientId}
        initialValues={editMode ? initialValues : undefined}
        editMode={editMode}
        analysisId={editMode ? editAnalysisId : undefined}
      />
    </div>
  );
}
