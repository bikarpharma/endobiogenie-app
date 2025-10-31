import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatientDetailClient } from "@/components/patient/PatientDetailClient";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Vérifier l'authentification
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Récupérer l'ID du patient
  const { id } = await params;

  // Charger le patient avec toutes ses données
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      bdfAnalyses: {
        orderBy: { date: "desc" },
        take: 10,
      },
      consultations: {
        orderBy: { dateConsultation: "desc" },
        take: 20,
      },
      anthropometries: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  // Vérifier que le patient existe
  if (!patient) {
    notFound();
  }

  // Vérifier que le patient appartient bien à l'utilisateur connecté
  if (patient.userId !== session.user.id) {
    redirect("/patients");
  }

  // Sérialiser les dates pour le client component
  const patientData = {
    id: patient.id,
    numeroPatient: patient.numeroPatient,
    nom: patient.nom,
    prenom: patient.prenom,
    dateNaissance: patient.dateNaissance?.toISOString() || null,
    sexe: patient.sexe,
    telephone: patient.telephone,
    email: patient.email,
    notes: patient.notes,
    allergies: patient.allergies,
    atcdMedicaux: patient.atcdMedicaux,
    atcdChirurgicaux: patient.atcdChirurgicaux,
    traitements: patient.traitements,
    tags: patient.tags,
    isArchived: patient.isArchived,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),

    // Sérialiser les analyses BdF
    bdfAnalyses: patient.bdfAnalyses.map((analysis) => ({
      id: analysis.id,
      patientId: analysis.patientId,
      date: analysis.date.toISOString(),
      inputs: analysis.inputs,
      indexes: analysis.indexes,
      summary: analysis.summary,
      axes: analysis.axes,
      ragText: analysis.ragText,
    })),

    // Sérialiser les consultations
    consultations: patient.consultations.map((consultation) => ({
      id: consultation.id,
      patientId: consultation.patientId,
      dateConsultation: consultation.dateConsultation.toISOString(),
      type: consultation.type,
      motifConsultation: consultation.motifConsultation,
      commentaire: consultation.commentaire,
      prescriptions: consultation.prescriptions,
    })),

    // Sérialiser les anthropométries
    anthropometries: patient.anthropometries.map((anthro) => ({
      id: anthro.id,
      patientId: anthro.patientId,
      date: anthro.date.toISOString(),
      poids: anthro.poids,
      taille: anthro.taille,
      imc: anthro.imc,
      paSys: anthro.paSys,
      paDia: anthro.paDia,
      pouls: anthro.pouls,
    })),
  };

  return <PatientDetailClient patient={patientData} />;
}
