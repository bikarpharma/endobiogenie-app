// Test script pour la synthèse unifiée
import { getPatientClinicalContext } from '../lib/clinical-data-aggregator'
import { generateClinicalSynthesis } from '../app/actions/clinical-engine'

async function testSynthesis() {
  const patientId = 'cmiftvujn0000s65g4pqt2ueo'

  console.log('=== Test Synthèse Unifiée ===\n')

  try {
    // Étape 1: Récupérer le contexte
    console.log('1. Récupération du contexte clinique...')
    const context = await getPatientClinicalContext(patientId)
    console.log('   Données disponibles:', context.dataAvailability.summary)

    // Étape 2: Générer la synthèse
    console.log('\n2. Génération de la synthèse IA (peut prendre 20-30s)...')
    const synthesis = await generateClinicalSynthesis(context)

    console.log('\n=== RÉSULTAT ===\n')
    console.log('Terrain:', synthesis.terrain?.type)
    console.log('Neuro-végétatif:', synthesis.neuroVegetative?.status)

    // Drainage
    if (synthesis.drainage) {
      console.log('\n--- DRAINAGE ---')
      console.log('Nécessité:', synthesis.drainage.necessite ? 'OUI' : 'NON')
      console.log('Priorité:', synthesis.drainage.priorite)
      console.log('Durée:', synthesis.drainage.dureeTotale)
      const surcharged = synthesis.drainage.emonctoires?.filter((e: any) => e.statut === 'Surchargé') || []
      surcharged.forEach((e: any) => {
        console.log('  - ' + e.organe + ': ' + (e.plantesRecommandees || []).join(', '))
      })
    }

    // Spasmophilie
    if (synthesis.spasmophilie) {
      console.log('\n--- SPASMOPHILIE ---')
      console.log('Score:', synthesis.spasmophilie.score, '/100')
      console.log('Sévérité:', synthesis.spasmophilie.severite)
      console.log('Signes cliniques:', (synthesis.spasmophilie.signesCliniques || []).join(', '))
      console.log('Plantes:', (synthesis.spasmophilie.plantesAntiSpasmophiliques || []).join(', '))
    }

    console.log('\n✅ Test réussi!')
    console.log('\nRésultat complet:')
    console.log(JSON.stringify(synthesis, null, 2))

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testSynthesis()
