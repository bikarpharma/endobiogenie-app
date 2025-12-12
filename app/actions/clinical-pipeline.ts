'use server'

// ========================================
// ORCHESTRATEUR PIPELINE CLINIQUE UNIFIÉ V2
// ========================================
// ARCHITECTURE 100% ASSISTANTS:
// 1. Préparer les données patient (prepareFullContextForAI)
// 2. Appeler l'Assistant Diagnostic (callDiagnosticAssistant)
// 3. Convertir la réponse en UnifiedAnalysisOutput
//
// AVANTAGES:
// - 1 seul appel IA au lieu de 4 VectorStores
// - Cohérence garantie (même cerveau = même diagnostic)
// - Moins cher (~$0.05 vs ~$0.20)
// - Plus rapide (~15-20s vs ~30-45s)

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { UnifiedAnalysisOutput } from '@/types/clinical-engine'
import { detectConcordance, getConcordanceSummary } from '@/lib/clinical/concordanceDetector'
import type { ClinicalConcordance } from '@/lib/clinical/types'

// Nouveaux imports pour l'architecture Assistant
import { callDiagnosticAssistant, type DiagnosticResponse } from '@/lib/ai/assistantDiagnostic'
import { prepareFullContextForAI, type AIReadyData } from '@/lib/ai/prepareDataForAI'

/**
 * Exécute le pipeline complet d'analyse clinique unifiée pour un patient
 * VERSION 2: Utilise l'Assistant OpenAI au lieu des VectorStores
 */
export async function runUnifiedAnalysis(patientId: string) {
  const startTime = Date.now()

  console.log(`[ClinicalPipeline] ═══════════════════════════════════════`)
  console.log(`[ClinicalPipeline] 🧠 VERSION 2: Assistant Diagnostic OpenAI`)
  console.log(`[ClinicalPipeline] ═══════════════════════════════════════`)

  // ==========================================
  // ÉTAPE 1: RÉCUPÉRER LE PATIENT ET SES DONNÉES
  // ==========================================
  console.log(`[ClinicalPipeline] Étape 1: Récupération du patient ${patientId}`)

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      bdfAnalyses: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  })

  if (!patient) {
    throw new Error(`Patient ${patientId} non trouvé`)
  }

  console.log(`[ClinicalPipeline] Patient: ${patient.prenom} ${patient.nom}`)

  // ==========================================
  // ÉTAPE 2: EXTRAIRE LES DONNÉES
  // ==========================================
  const derniereBdf = patient.bdfAnalyses?.[0]
  const patientData = patient as any

  // Récupérer les index BdF et extraire les valeurs numériques
  // ⚠️ Les index sont stockés comme {value: number, status: string}, pas comme des nombres simples
  const rawIndexes = (derniereBdf?.indexes as Record<string, any>) || {}
  const indexes: Record<string, number> = {}

  for (const [key, value] of Object.entries(rawIndexes)) {
    if (typeof value === 'number') {
      indexes[key] = value
    } else if (value && typeof value === 'object' && 'value' in value && typeof value.value === 'number') {
      indexes[key] = value.value
    } else if (value && typeof value === 'object' && 'valeur' in value && typeof value.valeur === 'number') {
      indexes[key] = value.valeur
    }
  }

  // Debug: afficher idx_thyroidien pour vérifier
  if (indexes['idx_thyroidien']) {
    console.log(`[ClinicalPipeline] 📊 idx_thyroidien extrait = ${indexes['idx_thyroidien']}`)
  }

  // Extraire answersByAxis de l'interrogatoire
  const answersByAxis = patientData.interrogatoire?.v2?.answersByAxis || {}

  // Calculer l'âge
  const patientAge = patient.dateNaissance
    ? Math.floor((Date.now() - new Date(patient.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  // Normaliser le sexe
  const sexe = patient.sexe === 'F' ? 'F' : 'M'

  console.log(`[ClinicalPipeline] Contexte: ${patientAge || '?'} ans, ${sexe}`)
  console.log(`[ClinicalPipeline] BdF: ${Object.keys(indexes).length} index`)
  console.log(`[ClinicalPipeline] Interrogatoire: ${Object.keys(answersByAxis).length} axes`)

  // ==========================================
  // ÉTAPE 3: PRÉPARER LES DONNÉES POUR L'ASSISTANT
  // ==========================================
  console.log(`[ClinicalPipeline] Étape 3: Préparation des données pour l'Assistant`)

  const aiReadyData: AIReadyData = prepareFullContextForAI(
    {
      id: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      dateNaissance: patient.dateNaissance,
      sexe: sexe as 'H' | 'F',
      allergies: patientData.allergies || null,
      traitementActuel: patientData.traitements 
        ? (Array.isArray(patientData.traitements) 
            ? patientData.traitements.join(', ') 
            : patientData.traitements)
        : null,
      atcdMedicaux: patientData.antecedents || null,
      motifConsultation: patientData.motifConsultation || null,
    },
    Object.keys(answersByAxis).length > 0 ? answersByAxis : null,
    Object.keys(indexes).length > 0 ? indexes : null
  )

  console.log(`[ClinicalPipeline] Type de synthèse: ${aiReadyData.meta.type_synthese}`)

  // ==========================================
  // ÉTAPE 4: APPELER L'ASSISTANT DIAGNOSTIC
  // ==========================================
  console.log(`[ClinicalPipeline] Étape 4: Appel de l'Assistant Diagnostic OpenAI`)

  let diagnosticResponse: DiagnosticResponse

  try {
    diagnosticResponse = await callDiagnosticAssistant(aiReadyData, {
      maxRetries: 3,
      timeoutMs: 120000, // 2 minutes max
    })
    console.log(`[ClinicalPipeline] ✅ Assistant a répondu (confiance: ${diagnosticResponse.confidenceScore})`)
  } catch (error) {
    console.error(`[ClinicalPipeline] ❌ Erreur Assistant:`, error)
    throw new Error(`Erreur lors de l'appel à l'Assistant Diagnostic: ${(error as Error).message}`)
  }

  // ==========================================
  // ÉTAPE 5: DÉTECTION DE CONCORDANCE (optionnel, local)
  // ==========================================
  // On garde la détection locale car c'est rapide et gratuit
  console.log(`[ClinicalPipeline] Étape 5: Détection de concordance locale`)

  let concordanceResult: ClinicalConcordance | undefined

  try {
    concordanceResult = detectConcordance(
      indexes,
      answersByAxis,
      sexe === 'M' ? 'H' : 'F'
    )
    const concordanceSummary = getConcordanceSummary(concordanceResult)
    console.log(`[ClinicalPipeline] Concordance: ${concordanceSummary.status} (score: ${concordanceSummary.scoreGlobal}%)`)
  } catch (error) {
    console.warn(`[ClinicalPipeline] ⚠️ Erreur concordance (ignorée):`, error)
    // Continuer sans concordance
  }

  // ==========================================
  // ÉTAPE 6: CONVERTIR VERS UnifiedAnalysisOutput
  // ==========================================
  console.log(`[ClinicalPipeline] Étape 6: Conversion en UnifiedAnalysisOutput`)

  const processingTime = Date.now() - startTime

  const unifiedOutput: UnifiedAnalysisOutput = convertDiagnosticToUnifiedOutput(
    diagnosticResponse,
    {
      age: patientAge || 40,
      sexe: sexe as 'M' | 'F',
      CI: aiReadyData.patient.allergies || [],
    },
    !!derniereBdf,
    Object.keys(answersByAxis).length > 0,
    processingTime,
    concordanceResult
  )

  // ==========================================
  // ÉTAPE 7: SAUVEGARDER EN BASE
  // ==========================================
  console.log(`[ClinicalPipeline] Étape 7: Sauvegarde en base de données`)

  // Marquer les anciennes synthèses comme non-latest
  await prisma.unifiedSynthesis.updateMany({
    where: { patientId, isLatest: true },
    data: { isLatest: false },
  })

  const savedSynthesis = await prisma.unifiedSynthesis.create({
    data: {
      patientId,
      content: JSON.parse(JSON.stringify(unifiedOutput)),
      modelUsed: 'Assistant-Diagnostic-v1',
      version: 2,
      isLatest: true,
    },
  })

  revalidatePath(`/${patientId}/synthese`)

  console.log(`[ClinicalPipeline] ✅ Synthèse sauvegardée: ${savedSynthesis.id}`)
  console.log(`[ClinicalPipeline] Durée totale: ${processingTime}ms`)

  return savedSynthesis
}

// ========================================
// CONVERSION: DiagnosticResponse → UnifiedAnalysisOutput
// ========================================

/**
 * Convertit la réponse de l'Assistant Diagnostic vers le format UI
 */
function convertDiagnosticToUnifiedOutput(
  diagnostic: DiagnosticResponse,
  context: { age: number; sexe: 'M' | 'F'; CI: string[] },
  hasBiology: boolean,
  hasInterrogatoire: boolean,
  processingTime: number,
  concordanceResult?: ClinicalConcordance
): UnifiedAnalysisOutput {

  return {
    // ========================================
    // META
    // ========================================
    meta: {
      modelUsed: 'Assistant-Diagnostic-v1',
      confidenceScore: diagnostic.confidenceScore,
      processingTime,
      dataUsed: {
        biology: hasBiology,
        anamnesis: false,
        interrogatoire: hasInterrogatoire,
      },
    },

    // ========================================
    // TERRAIN (depuis diagnostic.terrain)
    // ========================================
    terrain: {
      description: diagnostic.terrain.description,
      axeDominant: diagnostic.terrain.axeDominant,
      profilSNA: diagnostic.terrain.profilSNA,
      justification: diagnostic.terrain.justification,
      mecanismesCles: diagnostic.terrain.terrainsPrincipaux || [],
      facteursPredisposants: [],
      pedagogicalHint: `Terrains principaux: ${(diagnostic.terrain.terrainsPrincipaux || []).slice(0, 2).join(', ')}`,
    },

    // ========================================
    // NEURO-VÉGÉTATIF (extrait depuis terrain.profilSNA)
    // ========================================
    neuroVegetative: {
      status: mapSNAStatus(diagnostic.terrain.profilSNA),
      dominance: diagnostic.terrain.profilSNA,
      explanation: diagnostic.terrain.justification,
      signesCliniques: [],
      mecanismePhysiopath: '',
    },

    // ========================================
    // AXES ENDOCRINIENS (depuis diagnostic.axesEndocriniens)
    // ========================================
    endocrineAxes: (diagnostic.axesEndocriniens || []).map(axe => ({
      axis: axe.axe,
      status: axe.status,
      score: axe.score_perturbation,
      biomarkers: axe.sources?.bdf ? [axe.sources.bdf.index] : [],
      mechanism: axe.mecanisme,
      clinicalSigns: axe.sources?.interrogatoire?.symptomes || [],
      therapeuticImplication: axe.implication_therapeutique,
      pedagogicalHint: axe.implication_therapeutique,
    })),

    // ========================================
    // DRAINAGE (depuis diagnostic.drainage)
    // ========================================
    drainage: {
      necessite: diagnostic.drainage.necessaire,
      priorite: mapDrainagePriorite(diagnostic.drainage.priorite),
      capaciteTampon: diagnostic.drainage.necessaire ? 'Faible' : 'Normal',
      emonctoires: (diagnostic.drainage.emonctoires_prioritaires || []).map(e => ({
        organe: mapEmonctoireOrgane(e.emonctoire),
        statut: 'Sollicité' as const,
        score: 60,
        indicateurs: [e.justification],
        strategieDrainage: e.plantes.join(', '),
      })),
      strategieDrainage: diagnostic.drainage.emonctoires_prioritaires
        ?.map(e => `${e.emonctoire}: ${e.plantes.join(', ')}`)
        .join(' | ') || '',
      justification: diagnostic.drainage.emonctoires_prioritaires
        ?.map(e => e.justification)
        .join('. ') || '',
      dureeTotale: diagnostic.drainage.duree_recommandee || '2-3 semaines',
      precautions: [],
      pedagogicalHint: diagnostic.drainage.necessaire 
        ? 'Drainage recommandé avant traitement de fond'
        : 'Capacité de drainage suffisante',
    },

    // ========================================
    // SPASMOPHILIE (depuis diagnostic.spasmophilie)
    // ========================================
    spasmophilie: diagnostic.spasmophilie?.detectee ? {
      score: (diagnostic.spasmophilie.probabilite || 50),
      type: extractSpasmophilieType(diagnostic.spasmophilie.type_probable),
      nom: diagnostic.spasmophilie.type_probable || 'Spasmophilie',
      severite: 'Modéré' as const,
      description: diagnostic.spasmophilie.arguments?.join('. ') || '',
      mecanisme: diagnostic.spasmophilie.type_probable || '',
      signesBiologiques: diagnostic.spasmophilie.arguments || [],
      signesCliniques: diagnostic.spasmophilie.arguments || [],
      indexCles: [],
      strategieTherapeutique: diagnostic.spasmophilie.recommendations?.join('. ') || '',
      facteursAggravants: [],
      terrainAssocié: '',
      supplementation: {},
      plantesAntiSpasmophiliques: [],
      conseilsSpecifiques: diagnostic.spasmophilie.recommendations || [],
      pedagogicalHint: diagnostic.spasmophilie.type_probable || '',
    } : undefined,

    // ========================================
    // CONCORDANCE CLINIQUE (merge Assistant + local)
    // ========================================
    clinicalConcordance: {
      // Concordances depuis l'Assistant
      coherences: (diagnostic.concordances || []).map(c => 
        `${c.axe}: ${c.observation}`
      ),
      // Discordances depuis l'Assistant
      incoherences: (diagnostic.discordances || []).map(d => 
        `${d.axe}: ${d.interpretation}`
      ),
      // Hypothèses depuis stratégie thérapeutique
      hypotheses: diagnostic.strategie_therapeutique?.phases
        ?.map(p => p.objectif) || [],
      // Score global (local si disponible, sinon estimé)
      scoreGlobal: concordanceResult?.scoreGlobal.value ?? estimateConcordanceScore(diagnostic),
      fiabilite: concordanceResult?.scoreGlobal.fiabilite ?? 'moderee',
      interpretation: concordanceResult?.scoreGlobal.interpretation ?? 'Analyse basée sur Assistant',
      discordancesDetails: concordanceResult?.discordances || [],
      warnings: concordanceResult?.warnings || diagnostic.warnings || [],
      axesAnalyses: concordanceResult?.concordancesAxes || [],
    } as any,

    // ========================================
    // SYNTHÈSE CLINIQUE
    // ========================================
    clinicalSynthesis: {
      summary: diagnostic.synthese_pour_praticien,
      concordanceScore: concordanceResult?.scoreGlobal.value ?? 70,
      discordances: (diagnostic.discordances || []).map(d => ({
        axe: d.axe,
        severite: 'moderee',
        description: d.interpretation,
        hypotheses: [d.recommandation],
      })) as any,
      mecanismesPhysiopathologiques: diagnostic.terrain.terrainsPrincipaux || [],
      correlationBdfInterrogatoire: diagnostic.concordances
        ? `${diagnostic.concordances.length} concordance(s), ${diagnostic.discordances?.length || 0} discordance(s)`
        : 'Analyse unifiée',
      pronosticFonctionnel: diagnostic.strategie_therapeutique?.hierarchie_respectee
        ? 'Favorable avec traitement adapté'
        : 'À évaluer selon évolution',
    },

    // ========================================
    // STRATÉGIE THÉRAPEUTIQUE
    // ========================================
    therapeuticStrategy: {
      priorites: diagnostic.strategie_therapeutique?.phases
        ?.map(p => `Phase ${p.phase}: ${p.nom}`) || [],
      objectifsCourtTerme: diagnostic.strategie_therapeutique?.phases
        ?.filter(p => p.phase === 1)
        .map(p => p.objectif) || [],
      objectifsMoyenTerme: diagnostic.strategie_therapeutique?.phases
        ?.filter(p => p.phase > 1)
        .map(p => p.objectif) || [],
      hierarchieTraitement: diagnostic.strategie_therapeutique?.hierarchie_respectee
        ? 'Hiérarchie Lapraz respectée'
        : 'Adaptation selon terrain',
      precautions: [
        ...context.CI,
        ...(diagnostic.contre_indications_detectees?.map(ci => ci.raison) || [])
      ],
      surveillanceSuggeree: diagnostic.examens_complementaires || [],
      pedagogicalHint: diagnostic.strategie_therapeutique?.phases?.[0]?.objectif || '',
    },

    // ========================================
    // PRESCRIPTIONS: Désactivé - dans onglet Ordonnance
    // ========================================
    suggestedPrescription: undefined,

    // ========================================
    // WARNINGS
    // ========================================
    warnings: diagnostic.warnings || [],
  }
}

// ========================================
// FONCTIONS UTILITAIRES DE MAPPING
// ========================================

/**
 * Mappe le profil SNA vers un status
 */
function mapSNAStatus(profilSNA: string): 'Normal' | 'Perturbé' {
  if (profilSNA === 'Amphotonique') return 'Normal'
  return 'Perturbé'
}

/**
 * Mappe la priorité de drainage
 */
function mapDrainagePriorite(priorite: string): 'Urgente' | 'Haute' | 'Moyenne' | 'Basse' {
  switch (priorite) {
    case 'urgent': return 'Urgente'
    case 'modere': return 'Haute'
    case 'faible': return 'Moyenne'
    default: return 'Basse'
  }
}

/**
 * Mappe le nom de l'émonctoire vers le format UI
 */
function mapEmonctoireOrgane(emonctoire: string): string {
  const mapping: Record<string, string> = {
    foie: 'Foie',
    reins: 'Reins',
    intestins: 'Intestins',
    poumons: 'Poumons',
    peau: 'Peau',
  }
  return mapping[emonctoire] || emonctoire
}

/**
 * Extrait le numéro de type de spasmophilie
 */
function extractSpasmophilieType(typeStr?: string): number {
  if (!typeStr) return 0
  const match = typeStr.match(/type\s*(\d)/i)
  return match ? parseInt(match[1]) : 0
}

/**
 * Estime le score de concordance depuis la réponse Assistant
 */
function estimateConcordanceScore(diagnostic: DiagnosticResponse): number {
  const concordances = diagnostic.concordances?.length || 0
  const discordances = diagnostic.discordances?.length || 0
  const total = concordances + discordances
  
  if (total === 0) return 70 // Score par défaut
  
  return Math.round((concordances / total) * 100)
}

// ========================================
// EXPORTS POUR COMPATIBILITÉ
// ========================================
