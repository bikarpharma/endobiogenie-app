'use server'

// Orchestrateur principal - Pipeline complet d'analyse clinique unifiée

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getPatientClinicalContext } from '@/lib/clinical-data-aggregator'
import { generateClinicalSynthesis } from '@/app/actions/clinical-engine'

/**
 * Exécute le pipeline complet d'analyse clinique unifiée pour un patient
 */
export async function runUnifiedAnalysis(patientId: string) {
  // Étape 1: Récupérer le contexte clinique du patient
  console.log(`[ClinicalPipeline] Étape 1: Récupération du contexte pour patient ${patientId}`)
  let context
  try {
    context = await getPatientClinicalContext(patientId)
    console.log(`[ClinicalPipeline] Contexte récupéré:`, JSON.stringify(context, null, 2).slice(0, 500))
  } catch (error) {
    console.error(`[ClinicalPipeline] ERREUR Étape 1 - Contexte:`, error)
    throw new Error(`Données cliniques manquantes: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }

  // Étape 2: Générer la synthèse avec l'IA
  console.log(`[ClinicalPipeline] Étape 2: Génération de la synthèse IA`)
  let aiResult
  try {
    aiResult = await generateClinicalSynthesis(context)
    console.log(`[ClinicalPipeline] Synthèse générée avec succès`)
  } catch (error) {
    console.error(`[ClinicalPipeline] ERREUR Étape 2 - IA:`, error)
    throw new Error(`Erreur génération IA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }

  // Étape 3: Sauvegarder dans la base de données
  console.log(`[ClinicalPipeline] Étape 3: Sauvegarde en base de données`)
  try {
    const savedSynthesis = await prisma.unifiedSynthesis.create({
      data: {
        patientId: patientId,
        content: JSON.parse(JSON.stringify(aiResult)), // Convertir en JSON compatible Prisma
        modelUsed: aiResult.meta.modelUsed,
        version: 1,
        isLatest: true
      }
    })

    // Invalider le cache
    revalidatePath(`/${patientId}/synthese`)

    console.log(`[ClinicalPipeline] Synthèse sauvegardée avec ID: ${savedSynthesis.id}`)
    return savedSynthesis
  } catch (error) {
    console.error(`[ClinicalPipeline] ERREUR Étape 3 - Sauvegarde:`, error)
    throw new Error(`Erreur sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}
