/**
 * Agrégateur de données cliniques - Prépare le contexte d'analyse à partir des données de la base de données
 *
 * Ce module fait le pont entre Prisma et le moteur d'IA :
 * - Récupère les données patient depuis la base de données (Prisma)
 * - Agrège les informations biologiques (BdF), anamnèse, interrogatoire
 * - Enrichit avec le contexte RAG (extraits des livres d'endobiogénie)
 * - Transforme tout en ClinicalInputContext pour le moteur d'analyse
 *
 * TOUT EST OPTIONNEL : L'IA s'adapte aux données disponibles
 */

import { prisma } from '@/lib/prisma'
import type { ClinicalInputContext } from '@/types/clinical-engine'

/**
 * Récupère et agrège toutes les données cliniques d'un patient pour l'analyse endobiogénique.
 * BdF et Interrogatoire sont OPTIONNELS - l'IA s'adapte aux données disponibles.
 *
 * @param patientId - ID du patient
 * @returns Contexte clinique formaté pour l'analyse
 */
export async function getPatientClinicalContext(patientId: string): Promise<ClinicalInputContext> {
  try {
    // Récupère les infos de base du patient (incluant l'interrogatoire qui est un champ JSON)
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        sexe: true,
        dateNaissance: true,
        allergies: true,
        atcdMedicaux: true,
        atcdChirurgicaux: true,
        traitements: true,
        notes: true,
        interrogatoire: true, // Champ JSON stocké dans Patient
        updatedAt: true,
      }
    })

    if (!patient) {
      throw new Error(`Patient ${patientId} introuvable`)
    }

    // Récupère la biologie la plus récente (OPTIONNEL)
    const latestBiology = await prisma.bdfAnalysis.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    })

    // Récupère la dernière consultation/anamnèse (OPTIONNEL)
    const latestAnamnesis = await prisma.consultation.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    })

    // L'interrogatoire est un champ JSON dans Patient, pas une table séparée
    const interrogatoire = patient.interrogatoire as Record<string, unknown> | null

    // Construction du contexte clinique
    const clinicalContext: ClinicalInputContext = {
      // Infos patient de base
      patient: {
        sexe: patient.sexe || 'Non précisé',
        age: patient.dateNaissance
          ? Math.floor((Date.now() - new Date(patient.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
        allergies: patient.allergies || null,
        antecedentsMedicaux: patient.atcdMedicaux || null,
        antecedentsChirurgicaux: patient.atcdChirurgicaux || null,
        traitements: patient.traitements || null,
      },

      // Biologie des Fonctions (OPTIONNEL)
      biology: latestBiology ? {
        disponible: true,
        inputs: latestBiology.inputs as Record<string, number | undefined>,
        indexes: latestBiology.indexes as Array<{
          key: string;
          label: string;
          value?: number;
          unit?: string;
          status: 'ok' | 'na';
          note?: string;
        }>,
        summary: latestBiology.summary,
        axes: latestBiology.axes as string[],
        dateAnalyse: latestBiology.createdAt,
      } : {
        disponible: false,
        message: "Aucune analyse BdF disponible. L'analyse sera basée uniquement sur les données cliniques."
      },

      // Anamnèse / Consultation (OPTIONNEL)
      anamnesis: latestAnamnesis ? {
        disponible: true,
        motifConsultation: latestAnamnesis.motifConsultation || '',
        type: latestAnamnesis.type || 'initiale',
        commentaire: latestAnamnesis.commentaire || '',
        dateConsultation: latestAnamnesis.dateConsultation,
      } : {
        disponible: false,
        message: "Aucune consultation enregistrée."
      },

      // Interrogatoire clinique complet (OPTIONNEL) - stocké comme JSON dans Patient
      interrogatoire: interrogatoire ? {
        disponible: true,
        data: interrogatoire,
        dateInterrogatoire: patient.updatedAt, // Utilise la date de mise à jour du patient
      } : {
        disponible: false,
        message: "Aucun interrogatoire disponible."
      },

      // Résumé des données disponibles pour l'IA
      dataAvailability: {
        hasBiology: !!latestBiology,
        hasAnamnesis: !!latestAnamnesis,
        hasInterrogatoire: !!interrogatoire,
        summary: [
          latestBiology ? '✅ BdF disponible' : '❌ BdF manquant',
          latestAnamnesis ? '✅ Consultation disponible' : '❌ Consultation manquante',
          interrogatoire ? '✅ Interrogatoire disponible' : '❌ Interrogatoire manquant',
        ].join(' | ')
      },

      // TODO: Phase 4 - Brancher le système RAG ici
      ragContext: '',
    }

    console.log(`[ClinicalDataAggregator] Contexte assemblé: ${clinicalContext.dataAvailability.summary}`)

    return clinicalContext
  } catch (error) {
    console.error(`[ClinicalDataAggregator] Erreur pour patient ${patientId}:`, error)
    throw error
  }
}
