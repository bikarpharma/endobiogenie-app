// ========================================
// PAGE ORDONNANCE INTELLIGENTE - /ordonnances/[id]
// ========================================
// Interface hybride: 60% ordonnance + 40% chat IA

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrdonnanceInterfaceClient } from "@/components/ordonnance/OrdonnanceInterfaceClient";

export default async function OrdonnanceIntelligentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: ordonnanceId } = await params;

  // Récupérer l'ordonnance avec patient et BdF
  const ordonnance = await prisma.ordonnance.findFirst({
    where: { id: ordonnanceId },
    include: {
      patient: {
        include: {
          bdfAnalyses: {
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  // Vérifier que l'ordonnance existe
  if (!ordonnance) notFound();

  // Vérifier que l'ordonnance appartient à l'utilisateur
  if (ordonnance.patient.userId !== session.user.id) redirect("/patients");

  // Sérialiser les données pour le client
  const ordonnanceData = {
    ...ordonnance,
    createdAt: ordonnance.createdAt.toISOString(),
    updatedAt: ordonnance.updatedAt.toISOString(),
    dateRevaluation: ordonnance.dateRevaluation?.toISOString() || null,
    patient: {
      ...ordonnance.patient,
      dateNaissance: ordonnance.patient.dateNaissance?.toISOString() || null,
      dateConsentement: ordonnance.patient.dateConsentement?.toISOString() || null,
      bdfAnalyses: ordonnance.patient.bdfAnalyses.map((bdf) => ({
        ...bdf,
        date: bdf.date.toISOString(),
      })),
    },
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f3f4f6" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
            🧬 Ordonnance Endobiogénique Intelligente
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            Patient: {ordonnance.patient.prenom} {ordonnance.patient.nom}
          </p>
        </div>
        <a
          href={`/patients/${ordonnance.patientId}`}
          style={{
            padding: "10px 20px",
            background: "white",
            color: "#3b82f6",
            border: "2px solid #3b82f6",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: "600",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          ← Retour au patient
        </a>
      </div>

      {/* Interface client (2 panels) */}
      <OrdonnanceInterfaceClient ordonnance={ordonnanceData} />
    </div>
  );
}
