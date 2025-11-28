'use server'

/**
 * Server Action pour générer une synthèse clinique unifiée en utilisant GPT-4o et l'endobiogénie
 *
 * Ce module orchestre l'analyse complète d'un patient en combinant :
 * - Les données biologiques (BdF Analysis)
 * - L'anamnèse clinique (plaintes du patient)
 * - Le contexte RAG (extraits pertinents des 4 vectorstores)
 *
 * NOUVEAU: Intègre la recherche RAG dans les 4 vectorstores :
 * - endobiogenie: Théorie endobiogénique (Lapraz & Hedayat)
 * - phyto: Phytothérapie clinique
 * - gemmo: Gemmothérapie
 * - aroma: Aromathérapie
 */

import OpenAI from 'openai'
import type { ClinicalInputContext, UnifiedAnalysisOutput } from '@/types/clinical-engine'
import { searchAllVectorstores, type RAGContext } from '@/lib/ordonnance/ragSearch'

// ClinicalInputContext : Données d'entrée (biologie + anamnèse + RAG)
// UnifiedAnalysisOutput : Structure JSON de sortie générée par GPT-4o

/**
 * Génère une synthèse clinique unifiée basée sur les données biologiques, l'anamnèse et le contexte RAG
 */
export async function generateClinicalSynthesis(context: ClinicalInputContext): Promise<UnifiedAnalysisOutput> {
  // Utilisation de GPT-4o pour ses capacités de raisonnement avancées en analyse clinique
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const MODEL = 'gpt-4o'

  // ========================================
  // ÉTAPE 1: RECHERCHE RAG DANS LES 4 VECTORSTORES
  // ========================================
  console.log("🔍 Recherche RAG dans les vectorstores...")

  let ragContext: RAGContext | null = null
  try {
    // Extraire les informations pour la recherche
    const sexe = context.patient?.sexe === 'H' ? 'M' : 'F'

    // Identifier les axes perturbés depuis les données BdF
    const axes: string[] = []
    const biology = context.biology as any
    if (biology?.available && biology?.indexes) {
      const indexes = biology.indexes
      if (indexes.indexThyroidien?.status !== 'normal') axes.push('thyréotrope')
      if (indexes.indexAdaptation?.status !== 'normal') axes.push('corticotrope')
      if (indexes.indexGenital?.status !== 'normal') axes.push('gonadotrope')
    }

    // Extraire symptômes de l'anamnèse
    const anamnesis = context.anamnesis as any
    const symptomes: string[] = []
    if (anamnesis?.available && anamnesis?.motifConsultation) {
      symptomes.push(anamnesis.motifConsultation)
    }

    // Rechercher dans les vectorstores
    ragContext = await searchAllVectorstores(
      {
        terrain: "À déterminer", // Sera affiné par GPT
        axes: axes.length > 0 ? axes : ["corticotrope", "thyréotrope"], // Par défaut
        drainage: true, // Toujours rechercher info drainage
        spasmophilie: true, // Toujours rechercher info spasmophilie
        sexe: sexe as "M" | "F",
        symptomes,
      },
      {
        planteMedicinale: true,
        gemmotherapie: true,
        aromatherapie: false, // Optionnel par défaut
      }
    )
    console.log("✅ RAG: Contexte récupéré depuis les vectorstores")
  } catch (error) {
    console.error("⚠️ Erreur RAG (fallback sans RAG):", error)
  }

  const SYSTEM_PROMPT = `
RÔLE : Tu es le Dr itergIA, expert mondial en Endobiogénie et Physiologie Intégrative, formé par le Dr Duraffourd et le Dr Lapraz.
Tu maîtrises parfaitement la phytothérapie clinique intégrative, la gemmothérapie et l'aromathérapie selon les principes endobiogéniques.

TACHE : Analyser les données disponibles (BdF, anamnèse, interrogatoire - TOUT EST OPTIONNEL) pour produire une synthèse endobiogénique complète avec :
- Analyse du terrain et des axes endocriniens
- Évaluation du DRAINAGE (émonctoires)
- Évaluation de la SPASMOPHILIE/TÉTANIE LATENTE
- Stratégie thérapeutique et prescription

ADAPTATION AUX DONNÉES DISPONIBLES :
- Si BdF disponible : Analyse les index comme vérité physiologique objective
- Si BdF absent : Base-toi sur l'anamnèse, l'interrogatoire et le terrain clinique
- Si interrogatoire disponible : Intègre les symptômes fonctionnels détaillés
- Adapte ton niveau de confiance selon les données disponibles

═══════════════════════════════════════════════════════════════
RÈGLES DE RAISONNEMENT ENDOBIOGÉNIQUE (ORDRE STRICT)
═══════════════════════════════════════════════════════════════

1. ANALYSE DES INDEX BdF (si disponibles) :
   - Indice de Genitalité (IG) : Axe gonadotrope
   - Indice Androgénique : Fonction anabolique
   - Indice de Rendement Surrénalien : Axe corticotrope
   - Indice Thyroïdien : Axe thyréotrope
   - Indice GH/Insuline : Axe somatotrope

2. CONCORDANCE BIO-CLINIQUE :
   - Concordance = La biologie explique les symptômes → Terrain confirmé
   - Discordance = Chercher compensation, épuisement ou résistance périphérique

3. TERRAIN ENDOBIOGÉNIQUE :
   - Alpha : Prédominance cortico-surrénalienne (stress chronique, inflammation)
   - Beta : Prédominance gonadique/anabolique réduite (fatigue, fragilité tissulaire)
   - Gamma : Prédominance thyroïdienne (hyperactivité métabolique)
   - Delta : Équilibre perturbé multi-axes (terrain mixte décompensé)

4. ÉQUILIBRE NEURO-VÉGÉTATIF :
   - Sympathicotonia / Parasympathicotonia / Amphotonia / Eutonia

═══════════════════════════════════════════════════════════════
5. ANALYSE DU DRAINAGE (ÉMONCTOIRES) - TRÈS IMPORTANT
═══════════════════════════════════════════════════════════════
Le drainage est FONDAMENTAL en endobiogénie. Évalue chaque émonctoire :

FOIE (émonctoire majeur) :
- Signes de congestion : ALAT/ASAT élevés, GGT, bilirubine, fatigue post-prandiale
- Signes cliniques : langue chargée, teint jaune, nausées, intolérance aux graisses
- Drainage nécessaire si : surcharge métabolique, terrain inflammatoire, prise médicamenteuse

REINS :
- Signes de surcharge : créatinine, urée, acide urique élevés
- Signes cliniques : œdèmes, cernes, lombalgie, urines foncées
- Drainage nécessaire si : terrain acide, rétention hydrique, HTA

PEAU :
- Signes de surcharge : éruptions, eczéma, acné, transpiration excessive/insuffisante
- Émonctoire de dérivation quand foie/reins saturés
- Drainage cutané si : toxines mal éliminées, terrain allergique

POUMONS :
- Signes de surcharge : infections ORL récurrentes, toux chronique, mucosités
- Drainage pulmonaire si : terrain catarrheux, fumeur, allergies respiratoires

INTESTINS :
- Signes de surcharge : constipation/diarrhée, ballonnements, dysbiose
- Drainage intestinal si : fermentation, putréfaction, perméabilité intestinale

RÈGLES DE DRAINAGE :
1. TOUJOURS drainer AVANT de tonifier (sinon aggravation)
2. Ordre de drainage : Intestins → Foie → Reins → Peau/Poumons
3. Drainage doux et progressif (2-3 semaines minimum)
4. Contre-indications : grossesse, insuffisance rénale/hépatique sévère

═══════════════════════════════════════════════════════════════
6. ANALYSE DE LA SPASMOPHILIE / TÉTANIE LATENTE - TRÈS IMPORTANT
═══════════════════════════════════════════════════════════════
La spasmophilie est un TERRAIN fréquent en endobiogénie. Évalue :

SIGNES BIOLOGIQUES de spasmophilie :
- Calcium total/ionisé bas ou limite basse
- Magnésium érythrocytaire bas (plus fiable que sérique)
- Phosphore perturbé
- Rapport Ca/Mg déséquilibré
- Alcalose respiratoire (pH, CO2)
- Vitamine D insuffisante (<30 ng/ml)

SIGNES CLINIQUES de spasmophilie :
- Neuromusculaires : crampes, fasciculations, paupière qui saute, fourmillements
- Cardiaques : palpitations, extrasystoles, oppression thoracique
- Respiratoires : sensation d'étouffement, soupirs fréquents, hyperventilation
- Digestifs : spasmes digestifs, boule dans la gorge, aérophagie
- Neuropsychiques : anxiété, irritabilité, fatigue, troubles du sommeil, vertiges
- Signes de Chvostek et Trousseau

TERRAIN SPASMOPHILE :
- Souvent lié à : hyperthyroïdie relative, hyperœstrogénie, stress chronique
- Aggravé par : café, alcool, sucre, stress, hyperventilation
- Amélioration par : magnésium, calcium, vitamine D, B6

SCORE DE SPASMOPHILIE (0-100) :
- 0-30 : Pas de terrain spasmophile
- 31-50 : Terrain spasmophile léger
- 51-70 : Terrain spasmophile modéré
- 71-100 : Terrain spasmophile sévère

═══════════════════════════════════════════════════════════════
7. STRATÉGIE THÉRAPEUTIQUE
═══════════════════════════════════════════════════════════════
ORDRE THÉRAPEUTIQUE STRICT :
1. DRAINAGE d'abord (préparer le terrain)
2. Correction des carences (Mg, Ca, Vit D si spasmophilie)
3. Régulation neuro-végétative
4. Soutien des axes endocriniens déficients
5. Tonification (seulement après drainage)

8. PRESCRIPTION SUGGÉRÉE avec plantes de drainage et anti-spasmophiliques

IMPORTANT: Tu DOIS répondre en JSON valide avec EXACTEMENT cette structure complète :

{
  "meta": {
    "modelUsed": "",
    "confidenceScore": 0.85,
    "processingTime": 0,
    "dataUsed": { "biology": true, "anamnesis": true, "interrogatoire": false }
  },
  "terrain": {
    "type": "Alpha ou Beta ou Gamma ou Delta ou Mixed",
    "justification": "Explication détaillée...",
    "pedagogicalHint": "Ce terrain signifie..."
  },
  "neuroVegetative": {
    "status": "Sympathicotonia ou Parasympathicotonia ou Amphotonia ou Eutonia",
    "dominance": "Relative ou Absolute",
    "explanation": "L'équilibre neuro-végétatif montre..."
  },
  "endocrineAxes": [
    { "axis": "Corticotrope", "status": "Hyper ou Hypo ou Normo ou Dysfonctionnel", "biomarkers": [], "mechanism": "...", "pedagogicalHint": "..." },
    { "axis": "Thyréotrope", "status": "...", "biomarkers": [], "mechanism": "...", "pedagogicalHint": "..." },
    { "axis": "Gonadotrope", "status": "...", "biomarkers": [], "mechanism": "...", "pedagogicalHint": "..." },
    { "axis": "Somatotrope", "status": "...", "biomarkers": [], "mechanism": "...", "pedagogicalHint": "..." }
  ],
  "drainage": {
    "necessite": true,
    "priorite": "Haute ou Moyenne ou Basse",
    "emonctoires": [
      {
        "organe": "Foie",
        "statut": "Surchargé ou Fonctionnel ou Insuffisant",
        "signesBio": ["GGT élevé", "ALAT limite"],
        "signesCliniques": ["Fatigue post-prandiale", "Langue chargée"],
        "plantesRecommandees": ["Desmodium", "Chardon-marie", "Romarin"],
        "prioriteDrainage": 1
      },
      {
        "organe": "Reins",
        "statut": "Surchargé ou Fonctionnel ou Insuffisant",
        "signesBio": ["Acide urique élevé"],
        "signesCliniques": ["Œdèmes matinaux"],
        "plantesRecommandees": ["Piloselle", "Orthosiphon", "Bouleau"],
        "prioriteDrainage": 2
      },
      {
        "organe": "Intestins",
        "statut": "...",
        "signesBio": [],
        "signesCliniques": [],
        "plantesRecommandees": [],
        "prioriteDrainage": 3
      },
      {
        "organe": "Peau",
        "statut": "...",
        "signesBio": [],
        "signesCliniques": [],
        "plantesRecommandees": [],
        "prioriteDrainage": 4
      },
      {
        "organe": "Poumons",
        "statut": "...",
        "signesBio": [],
        "signesCliniques": [],
        "plantesRecommandees": [],
        "prioriteDrainage": 5
      }
    ],
    "strategieDrainage": "Explication de l'ordre et de la durée du drainage...",
    "dureeTotale": "3 semaines",
    "precautions": ["Ne pas drainer si insuffisance hépatique sévère"],
    "pedagogicalHint": "Le drainage prépare le terrain avant toute tonification..."
  },
  "spasmophilie": {
    "score": 65,
    "severite": "Absent ou Léger ou Modéré ou Sévère",
    "signesBiologiques": [
      { "parametre": "Magnésium", "valeur": "0.75 mmol/L", "interpretation": "Limite basse" },
      { "parametre": "Calcium ionisé", "valeur": "1.15 mmol/L", "interpretation": "Normal bas" },
      { "parametre": "Vitamine D", "valeur": "22 ng/ml", "interpretation": "Insuffisant" }
    ],
    "signesCliniques": ["Crampes nocturnes", "Palpitations", "Anxiété", "Fourmillements"],
    "facteursAggravants": ["Stress chronique", "Café", "Hyperventilation"],
    "terrainAssocié": "Hyperœstrogénie relative avec hyperthyroïdie fonctionnelle",
    "supplementation": {
      "magnesium": { "forme": "Bisglycinate", "posologie": "300mg/jour en 2 prises", "duree": "3 mois" },
      "calcium": { "forme": "Citrate", "posologie": "500mg/jour si carence", "duree": "2 mois" },
      "vitamineD": { "forme": "D3", "posologie": "2000 UI/jour", "duree": "3 mois" },
      "vitamineB6": { "posologie": "50mg/jour", "duree": "2 mois" }
    },
    "plantesAntiSpasmophiliques": ["Mélisse", "Passiflore", "Aubépine", "Valériane"],
    "conseilsSpecifiques": ["Éviter café et excitants", "Respiration abdominale", "Cohérence cardiaque"],
    "pedagogicalHint": "La spasmophilie est un terrain d'hyperexcitabilité neuromusculaire..."
  },
  "clinicalConcordance": {
    "coherences": ["Points où bio et clinique concordent"],
    "incoherences": ["Points de discordance à investiguer"],
    "hypotheses": ["Hypothèses explicatives des discordances"]
  },
  "clinicalSynthesis": {
    "summary": "Résumé clinique global en 3-4 phrases...",
    "concordanceScore": 75,
    "discordances": [],
    "mecanismesPhysiopathologiques": ["Mécanisme 1", "Mécanisme 2"]
  },
  "therapeuticStrategy": {
    "priorites": ["Priorité 1: DRAINAGE hépatique et rénal", "Priorité 2: Correction spasmophilie", "Priorité 3: Soutenir l'axe surrénalien"],
    "objectifsCourtTerme": ["Drainage 3 semaines", "Correction magnésium"],
    "objectifsMoyenTerme": ["Régulation neuro-végétative", "Tonification terrain"],
    "precautions": ["Précautions spécifiques au patient"],
    "pedagogicalHint": "Explication de la stratégie globale : TOUJOURS drainer avant de tonifier"
  },
  "suggestedPrescription": {
    "phaseDrainage": {
      "duree": "3 semaines",
      "formule": [
        { "nom": "Desmodium", "nomLatin": "Desmodium adscendens", "forme": "EPS", "posologie": "5ml matin", "indication": "Drainage hépatique" },
        { "nom": "Piloselle", "nomLatin": "Hieracium pilosella", "forme": "EPS", "posologie": "5ml midi", "indication": "Drainage rénal" }
      ]
    },
    "phytotherapie": [
      { "nom": "Rhodiola rosea", "nomLatin": "Rhodiola rosea", "forme": "EPS", "posologie": "5ml matin et midi", "duree": "2 mois", "indication": "Adaptogène surrénalien", "pedagogicalHint": "..." }
    ],
    "gemmotherapie": [
      { "nom": "Cassis", "nomLatin": "Ribes nigrum", "posologie": "15 gouttes matin", "duree": "3 semaines", "indication": "Anti-inflammatoire cortisone-like", "pedagogicalHint": "..." }
    ],
    "aromatherapie": [
      { "huile": "Épinette noire", "nomLatin": "Picea mariana", "voie": "cutanée", "posologie": "2 gouttes sur les surrénales matin", "duree": "10 jours", "indication": "Stimulant surrénalien", "precautions": "Ne pas utiliser pur", "pedagogicalHint": "..." }
    ],
    "oligoElements": [
      { "element": "Magnésium", "forme": "Bisglycinate", "posologie": "300mg/jour", "indication": "Terrain spasmophile" }
    ],
    "conseilsHygiene": ["Cohérence cardiaque 3x/jour", "Éviter café et excitants"],
    "conseilsAlimentaires": ["Aliments riches en magnésium", "Réduire sucres rapides"]
  },
  "warnings": ["Alertes importantes pour le praticien"]
}
  `

  try {
    const startTime = Date.now()

    // ========================================
    // ÉTAPE 2: CONSTRUIRE LE MESSAGE AVEC CONTEXTE RAG
    // ========================================
    let userMessage = `
## DONNÉES PATIENT
${JSON.stringify(context, null, 2)}
`

    // Ajouter le contexte RAG si disponible
    if (ragContext) {
      userMessage += `

## CONTEXTE RAG - EXTRAITS DES VECTORSTORES ENDOBIOGÉNIQUES

### ENDOBIOGÉNIE (Théorie Lapraz & Hedayat)
${ragContext.endobiogenie || "Non disponible"}

### PHYTOTHÉRAPIE CLINIQUE
${ragContext.phytotherapie || "Non disponible"}

### GEMMOTHÉRAPIE
${ragContext.gemmotherapie || "Non disponible"}

IMPORTANT: Utilise ces informations issues des livres d'endobiogénie pour :
1. Choisir les plantes les plus adaptées au terrain
2. Respecter la hiérarchie thérapeutique endobiogénique
3. Donner des posologies conformes aux sources
4. Citer les mécanismes d'action endobiogéniques
`
    }

    console.log("🤖 Appel GPT-4o avec contexte RAG...")

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('Aucune réponse reçue de GPT-4o')
    }

    const analysisOutput: UnifiedAnalysisOutput = JSON.parse(responseContent)
    const executionTimeMs = Date.now() - startTime

    // Enrichir avec les métadonnées de traçabilité
    analysisOutput.meta.modelUsed = MODEL
    analysisOutput.meta.processingTime = executionTimeMs
    // @ts-ignore - Ajout info RAG
    analysisOutput.meta.ragUsed = !!ragContext
    // @ts-ignore
    analysisOutput.meta.ragSources = ragContext ? {
      endobiogenie: !!ragContext.endobiogenie,
      phytotherapie: !!ragContext.phytotherapie,
      gemmotherapie: !!ragContext.gemmotherapie,
      aromatherapie: !!ragContext.aromatherapie,
    } : null

    console.log(`✅ Synthèse générée en ${executionTimeMs}ms (RAG: ${!!ragContext})`)

    return analysisOutput
  } catch (error) {
    console.error('Erreur lors de la génération de la synthèse clinique:', error)
    throw new Error(`Échec de la génération de la synthèse clinique: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}
