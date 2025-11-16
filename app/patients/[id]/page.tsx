// ========================================
// PAGE FICHE PATIENT ENRICHIE - /patients/[id]
// ========================================
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PatientDetailClient } from "@/components/patient/PatientDetailClient";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  // Récupérer le patient avec toutes ses données
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
      ordonnances: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  // Vérifier que le patient existe et appartient à l'utilisateur
  if (!patient) notFound();
  if (patient.userId !== session.user.id) redirect("/patients");

  // Sérialiser les données pour le client
  const patientData = {
    ...patient,
    dateNaissance: patient.dateNaissance?.toISOString() || null,
    dateConsentement: patient.dateConsentement?.toISOString() || null,
    archivedAt: patient.archivedAt?.toISOString() || null,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
    bdfAnalyses: patient.bdfAnalyses.map((a) => ({
      ...a,
      date: a.date.toISOString(),
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    consultations: patient.consultations.map((c) => ({
      ...c,
      dateConsultation: c.dateConsultation.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    anthropometries: patient.anthropometries.map((a) => ({
      ...a,
      date: a.date.toISOString(),
      createdAt: a.createdAt.toISOString(),
    })),
    ordonnances: patient.ordonnances.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      dateRevaluation: o.dateRevaluation?.toISOString() || null,
    })),
  };

  return <PatientDetailClient patient={patientData} />;
}