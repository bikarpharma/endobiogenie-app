// ========================================
// PAGE BIOLOGIE DES FONCTIONS - PATIENT RÉEL
// ========================================
// Saisie et analyse BdF pour un patient spécifique

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BdfInputForm from "@/components/bdf/BdfInputForm";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatientBdfPage({ params }: PageProps) {
  // 1. Vérifier l'authentification
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // 2. Récupérer l'ID du patient
  const { id } = await params;

  // 3. Fetch patient pour vérifier ownership
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      numeroPatient: true,
      nom: true,
      prenom: true,
      sexe: true,
      userId: true,
      // Dernière analyse BdF pour pré-remplissage
      bdfAnalyses: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          date: true,
          inputs: true,
          createdAt: true
        }
      }
    }
  });

  // 4. Vérifier que le patient existe et appartient à l'utilisateur
  if (!patient) {
    redirect("/patients");
  }

  if (patient.userId !== session.user.id) {
    redirect("/patients");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête avec navigation */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/patients/${id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-2"
              >
                ← Retour au dossier
              </Link>
              <h1 className="text-2xl font-bold text-slate-800">
                🧬 Biologie des Fonctions
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {patient.prenom} {patient.nom} • {patient.numeroPatient}
              </p>
            </div>

            {/* Info dernière analyse */}
            {patient.bdfAnalyses.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">
                  Dernière analyse
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {new Date(patient.bdfAnalyses[0].createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>

          {/* Note méthodologique */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Méthodologie Lapraz :</strong> Saisissez les biomarqueurs d'une numération
              sanguine standard (NFS) + biochimie. Le système calculera automatiquement les
              9 index fonctionnels avec interprétation clinique.
            </p>
          </div>
        </div>

        {/* Formulaire BdF */}
        <BdfInputForm patientId={patient.id} />
      </div>
    </div>
  );
}
