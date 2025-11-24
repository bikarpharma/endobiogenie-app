// ========================================
// API SYNTHÈSE ENDOBIOGÉNIQUE - CERVEAU IA
// ========================================
// Endpoint qui fusionne Interrogatoire × BdF → Ordonnance

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { queryVectorStore } from "@/lib/chatbot/ragClient";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schéma de réponse attendu (Structure JSON stricte)
const RESPONSE_STRUCTURE = `
{
  "analyse_concordance": "Texte analysant si les plaintes du patient correspondent à sa biologie (ex: 'Le patient se plaint de fatigue intense, confirmée par un Index d'Adaptation élevé (18.0) traduisant une insuffisance surrénalienne fonctionnelle. La frilosité rapportée est cohérente avec le Rendement Thyroïdien bas (0.35), confirmant une hypothyroïdie périphérique.').",

  "mecanismes": "Explication physiopathologique détaillée (ex: 'L'épuisement surrénalien chronique (axe corticotrope) entraîne une diminution de la conversion périphérique T4→T3, d'où l'hypothyroïdie type 2. Le terrain sympathicotonique (Index Génital 3.6) aggrave la vasoconstriction et la frilosité. Cercle vicieux : stress → cortisol ↑ → blocage thyroïde → fatigue → stress.').",

  "strategie_therapeutique": {
    "priorites": [
      "Restaurer l'axe corticotrope (surrénales) en priorité",
      "Soutenir la conversion thyroïdienne périphérique",
      "Réguler le système nerveux sympathique"
    ],
    "objectifs": [
      "Augmenter la production de cortisol endogène sans stimulants artificiels",
      "Améliorer la conversion T4→T3 au niveau hépatique et périphérique",
      "Réduire l'hyperactivité sympathique et restaurer l'équilibre vagal",
      "Optimiser la vitalité et réduire la fatigue à 6-8 semaines"
    ],
    "precautions": [
      "Surveiller la tension artérielle en cas de traitement surrénalien",
      "Contre-indiqué en cas d'hyperthyroïdie confirmée",
      "Adapter les dosages selon la réponse clinique"
    ]
  },

  "ordonnance": {
    "phytotherapie": [
      {
        "plante": "Avena sativa TM",
        "forme": "Teinture-Mère",
        "posologie": "50 gouttes matin et midi dans un verre d'eau",
        "justification": "Tonique nerveux et surrénalien, soutient l'axe adaptatif en cas d'épuisement chronique (burnout)."
      },
      {
        "plante": "Rosmarinus officinalis TM",
        "forme": "Teinture-Mère",
        "posologie": "40 gouttes le matin",
        "justification": "Stimule la thyroïde et le foie, améliore la conversion T4→T3, draineur hépato-biliaire."
      }
    ],
    "gemmotherapie": [
      {
        "plante": "Ribes nigrum (Cassis) - Macérat Glycériné",
        "forme": "Macérat de bourgeons 1D",
        "posologie": "50 gouttes le matin à jeun",
        "justification": "Adaptogène majeur, cortisone-like naturel, soutient les surrénales en cas d'insuffisance fonctionnelle."
      },
      {
        "plante": "Quercus robur (Chêne) - Macérat Glycériné",
        "forme": "Macérat de bourgeons 1D",
        "posologie": "50 gouttes le matin",
        "justification": "Tonique surrénalien puissant, indiqué dans les épuisements profonds avec baisse de la vitalité."
      }
    ],
    "aromatherapie": [
      {
        "plante": "Pinus sylvestris (Pin sylvestre) HE",
        "usage": "Cutané (dilué 20% dans HV)",
        "posologie": "5 gouttes sur les surrénales (zone lombaire) matin et midi",
        "justification": "Stimulant cortical surrénalien, tonique général en cas de fatigue profonde."
      }
    ],
    "conseils_hygiene": [
      "Éviter les excitants (café, thé noir) qui épuisent davantage les surrénales",
      "Favoriser les protéines au petit-déjeuner (œufs, fromage blanc) pour soutenir la production hormonale",
      "Pratiquer une activité physique douce (marche, yoga) sans épuisement",
      "Coucher avant 23h pour respecter le pic de cortisol matinal",
      "Gérer le stress : cohérence cardiaque 3×5 min/jour"
    ]
  },

  "surveillance": [
    "Contrôle TSH, T4L, T3L dans 2 mois",
    "Réévaluation clinique (fatigue, frilosité) à 1 mois",
    "Adapter les doses selon l'évolution des symptômes"
  ],

  "duree_traitement": "3 mois minimum, puis réévaluation"
}
`;

/**
 * POST /api/synthese/generate
 *
 * Body: {
 *   interrogatoire: AxeScore[] | InterrogatoireRaw,
 *   bdf: BdfResult,
 *   patientContext?: { age, sexe, atcd, traitements, CI }
 * }
 *
 * Returns: JSON structuré (analyse + ordonnance)
 */
export async function POST(req: Request) {
  try {
    // 1. Vérifier l'authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Parser les données
    const { interrogatoire, bdf, patientContext } = await req.json();

    if (!interrogatoire && !bdf) {
      return NextResponse.json(
        { error: "Données insuffisantes : interrogatoire ou BdF requis" },
        { status: 400 }
      );
    }

    // 3. Interroger le vectorstore endobiogénie pour enrichir l'analyse
    console.log("🔍 Interrogation du vectorstore endobiogénie...");

    // Construire une query basée sur les axes les plus perturbés
    let vectorQuery = "Stratégie thérapeutique endobiogénique : ";

    if (interrogatoire && patientContext?.axeScores?.length > 0) {
      const topAxes = patientContext.axeScores
        .slice(0, 3)
        .map((axe: any) => axe.axe)
        .join(", ");
      vectorQuery += `Axes perturbés : ${topAxes}. `;
    }

    if (bdf?.indexes) {
      const abnormalIndexes = Object.entries(bdf.indexes)
        .filter(([_, val]: any) => val.status !== "normal" && val.status !== "unknown")
        .slice(0, 3)
        .map(([key, _]: any) => key)
        .join(", ");
      if (abnormalIndexes) {
        vectorQuery += `Index BdF anormaux : ${abnormalIndexes}. `;
      }
    }

    vectorQuery += "Quelles sont les priorités thérapeutiques, objectifs et précautions selon l'endobiogénie ?";

    let ragContext = "";
    try {
      const ragChunks = await queryVectorStore(vectorQuery, 3);
      if (ragChunks.length > 0) {
        ragContext = "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        ragContext += "CONNAISSANCES ENDOBIOGÉNIE (Vector Store) :\n";
        ragContext += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        ragChunks.forEach((chunk, idx) => {
          ragContext += `${idx + 1}. ${chunk.text}\n\n`;
        });
        ragContext += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        console.log("✅ Vectorstore OK:", ragChunks.length, "chunks récupérés");
      }
    } catch (error) {
      console.warn("⚠️ Erreur vectorstore (non bloquant):", error);
      // Continue sans RAG si erreur
    }

    // 4. Construction du Prompt Expert Endobiogénie
    const systemPrompt = `
Tu es un Expert Senior en Médecine Endobiogénique.
Ta mission est d'analyser un cas clinique en croisant les données symptomatiques (Interrogatoire) avec les preuves biologiques (BdF), puis de proposer une ordonnance de phytothérapie personnalisée.

═══════════════════════════════════════════════════════════════════════
RÈGLES DE RAISONNEMENT PHYSIOLOGIQUE (MÉDECINE INTÉGRATIVE)
═══════════════════════════════════════════════════════════════════════

1. **CONCORDANCE CLINICO-BIOLOGIQUE** (Confirmer ou Infirmer)

   ✓ CONCORDANCE POSITIVE (Symptôme + Bio cohérents) :
     - Ex: Plainte de "Fatigue intense" + Index d'Adaptation ÉLEVÉ (>15) = Insuffisance surrénalienne CONFIRMÉE
     - Ex: Plainte de "Frilosité" + Rendement Thyroïdien BAS (<0.5) = Hypothyroïdie périphérique CONFIRMÉE
     - → Action : Traiter selon la concordance

   ✗ DISCORDANCE (Symptôme ≠ Bio) :
     - Ex: Plainte de "Froid" + Rendement Thyroïdien NORMAL + Index Génital ÉLEVÉ = FAUSSE hypothyroïdie (vasoconstriction sympathique)
     - Ex: Plainte de "Fatigue" + Index Adaptation NORMAL + Index Génital BAS = Parasympathicotonie (ralentissement vagal, pas surrénales)
     - → Action : Traiter la vraie cause (ici le système nerveux, pas la thyroïde)

2. **HIÉRARCHIE THÉRAPEUTIQUE** (Traiter le Général avant le Soldat)

   Ordre de priorité OBLIGATOIRE :

   1️⃣ **Axe Corticotrope (Adaptation/Surrénales)** - Le Chef d'Orchestre
      - Si épuisé (Index Adaptation >15) : TRAITER EN PRIORITÉ
      - Tant que les surrénales sont effondrées, rien d'autre ne fonctionnera
      - Plantes : Ribes nigrum, Quercus robur, Avena sativa

   2️⃣ **Drainage/Détox (Foie, Rein, Lymphe)**
      - Si Index hépatiques perturbés ou surcharge visible
      - Préparer le terrain avant de stimuler
      - Plantes : Rosmarinus, Cynara, Silybum

   3️⃣ **Axe Thyréotrope (Métabolisme)**
      - Seulement si les surrénales sont soutenues
      - Hypothyroïdie vraie : Laminaria, Avena, Rosmarinus
      - Blocage périphérique (conversion T4→T3) : Rosmarinus, Fucus

   4️⃣ **Neurovégétatif (Sympathique/Parasympathique)**
      - Sympathicotonie (Index Génital >2.5) : Crataegus, Tilia, Passiflora
      - Parasympathicotonie (Index Génital <1.5) : Rosmarinus, Thymus

   5️⃣ **Autres axes** (Gonadique, Somatotrope, etc.)
      - Seulement si les axes fondamentaux sont stabilisés

3. **MATIÈRE MÉDICALE ENDOBIOGÉNIQUE** (Plantes par Axe)

   🌿 **SURRÉNALES (Axe Corticotrope)** :

   Insuffisance/Épuisement (Burnout, Index Adaptation >15) :
     - Ribes nigrum (Cassis) MG : Cortisone-like, adaptogène majeur
     - Quercus robur (Chêne) MG : Tonique surrénalien puissant
     - Avena sativa TM : Tonique nerveux et surrénalien
     - Pinus sylvestris HE : Stimulant cortical (usage cutané)

   Hyperfonctionnement/Stress aigu (Index Adaptation <5) :
     - Ficus carica (Figuier) MG : Régulateur de l'axe hypothalamo-hypophysaire
     - Tilia tomentosa (Tilleul) MG : Anxiolytique, frein surrénalien

   🦋 **THYROÏDE (Axe Thyréotrope)** :

   Hypothyroïdie vraie (TSH élevée, T4 basse) :
     - Laminaria (Algue) : Apport iode naturel
     - Fucus vesiculosus : Stimulant thyroïdien doux

   Hypothyroïdie type 2 (périphérique, conversion T4→T3 bloquée) :
     - Rosmarinus officinalis TM : Stimule conversion + drainage foie
     - Avena sativa TM : Soutient métabolisme global

   Hyperthyroïdie/Dysrégulation :
     - Lycopus europaeus TM : Frein thyroïdien
     - Cornus sanguinea (Cornouiller) MG : Régulateur thyroïdien

   🧠 **NEUROVÉGÉTATIF** :

   Sympathicotonie (Index Génital >2.5, spasmes, HTA, insomnie) :
     - Crataegus oxyacantha (Aubépine) TM : Régulateur cardiaque, antispasmodique
     - Olea europaea (Olivier) MG : Hypotenseur, calmant sympathique
     - Tilia tomentosa (Tilleul) MG : Anxiolytique, sédatif doux
     - Passiflora incarnata TM : Anxiolytique puissant

   Parasympathicotonie (Index Génital <1.5, congestion, lenteur) :
     - Juglans regia (Noyer) MG : Draineur pancréas et parasympathique
     - Alnus glutinosa (Aulne) MG : Fluidifiant, anti-stase
     - Rosmarinus officinalis TM : Stimulant global

   🫀 **FOIE/DRAINAGE** :
     - Cynara scolymus (Artichaut) TM : Cholérétique, hépato-protecteur
     - Silybum marianum (Chardon-Marie) : Régénérant hépatique
     - Rosmarinus officinalis TM : Drainage hépatobiliaire
     - Taraxacum (Pissenlit) TM : Diurétique, draineur rénal

4. **CONTRE-INDICATIONS À RESPECTER** :

   ⚠️ Grossesse : Éviter HE (sauf Lavande), éviter plantes emménagogues
   ⚠️ HTA : Éviter Réglisse (Glycyrrhiza), limiter stimulants surrénaliens
   ⚠️ Hyperthyroïdie : Contre-indication absolue aux algues iodées
   ⚠️ Insuffisance rénale : Adapter drainage, éviter diurétiques puissants
   ⚠️ Traitements anticoagulants : Prudence avec Ginkgo, Ail

═══════════════════════════════════════════════════════════════════════
FORMAT DE SORTIE OBLIGATOIRE (JSON STRICT)
═══════════════════════════════════════════════════════════════════════

Tu dois répondre UNIQUEMENT avec un objet JSON valide respectant cette structure :

${RESPONSE_STRUCTURE}

IMPORTANT :
- Analyse TOUJOURS la concordance clinico-biologique
- Respecte la hiérarchie thérapeutique (Surrénales → Drainage → Thyroïde → Neuro)
- Justifie CHAQUE plante choisie
- Adapte selon le contexte patient (âge, sexe, CI)
- Reste RIGOUREUX médicalement (pas de promesses irréalistes)
`;

    const userPrompt = `
╔═══════════════════════════════════════════════════════════════════════╗
║                      ANALYSE CE PATIENT                               ║
╚═══════════════════════════════════════════════════════════════════════╝

${patientContext ? `
--- CONTEXTE PATIENT ---
Âge : ${patientContext.age || 'Non renseigné'}
Sexe : ${patientContext.sexe || 'Non renseigné'}
Antécédents : ${patientContext.atcd || 'Aucun'}
Traitements en cours : ${patientContext.traitements || 'Aucun'}
Contre-indications : ${patientContext.CI?.join(', ') || 'Aucune'}
` : ''}

--- DONNÉES INTERROGATOIRE (Symptômes Cliniques) ---
${interrogatoire ? JSON.stringify(interrogatoire, null, 2) : 'Non disponible'}

--- DONNÉES BIOLOGIQUES (BdF - Index Fonctionnels) ---
${bdf ? JSON.stringify(bdf, null, 2) : 'Non disponible'}
${ragContext}

═══════════════════════════════════════════════════════════════════════

CONSIGNES D'ANALYSE :

1. **Identifie les CONCORDANCES** :
   - Quels symptômes sont CONFIRMÉS par la biologie ?
   - Quels symptômes sont CONTREDITS (discordance) ?

2. **Explique les MÉCANISMES** :
   - Quelle est la physiopathologie sous-jacente ?
   - Y a-t-il un cercle vicieux (ex: stress → cortisol → blocage thyroïde) ?

3. **Propose une STRATÉGIE** :
   - Respecte la hiérarchie (Surrénales → Drainage → Thyroïde → Neuro)
   - Choisis 3-5 plantes maximum (pas de "salade thérapeutique")
   - Justifie chaque choix selon l'axe perturbé

4. **Rédige l'ORDONNANCE** :
   - Phytothérapie (TM), Gemmothérapie (MG), Aromathérapie (HE)
   - Posologies précises et réalistes
   - Conseils hygiéno-diététiques adaptés

GÉNÈRE MAINTENANT LA SYNTHÈSE JSON :
`;

    // 4. Appel à GPT-4
    console.log("🤖 Génération synthèse IA en cours...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Ou "gpt-4o" si disponible
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" }, // Force JSON
      temperature: 0.4, // Assez bas pour rester rigoureux médicalement
      max_tokens: 4000, // Suffisant pour une ordonnance complète
    });

    const rawContent = completion.choices[0].message.content || "{}";

    // 5. Parser et valider la réponse
    let result;
    try {
      result = JSON.parse(rawContent);
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON GPT-4:", parseError);
      return NextResponse.json(
        { error: "Format de réponse invalide de l'IA" },
        { status: 500 }
      );
    }

    // 6. Ajouter des métadonnées
    const enrichedResult = {
      ...result,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: completion.model,
        tokens: completion.usage?.total_tokens || 0,
        userId: session.user.id,
        axeScores: patientContext?.axeScores || [],
        includeBdf: !!bdf,
      }
    };

    console.log("✅ Synthèse générée avec succès");

    // 7. Sauvegarder automatiquement la synthèse en base de données
    if (patientContext?.id) {
      try {
        console.log("💾 Sauvegarde automatique de la synthèse...");

        // Préparer les données pour la base
        const { analyse_concordance, mecanismes, strategie_therapeutique, ordonnance, metadata } = enrichedResult;

        // Convertir analyse_concordance en arrays si c'est une string
        let coherences: string[] = [];
        let incoherences: string[] = [];
        let hypotheses: string[] = [];

        if (typeof analyse_concordance === 'string') {
          coherences = [analyse_concordance];
        } else if (analyse_concordance) {
          coherences = analyse_concordance.coherences || [];
          incoherences = analyse_concordance.incoherences || [];
          hypotheses = analyse_concordance.hypotheses || [];
        }

        // Préparer le résumé global
        const resumeGlobal = [
          coherences.length > 0 ? `Cohérences: ${coherences.slice(0, 2).join(' ')}` : '',
          incoherences.length > 0 ? `Incohérences: ${incoherences.slice(0, 2).join(' ')}` : '',
          hypotheses.length > 0 ? `Hypothèses: ${hypotheses.slice(0, 2).join(' ')}` : '',
        ]
          .filter(Boolean)
          .join('\n\n')
          .slice(0, 500); // Limiter à 500 caractères

        // Préparer les plantes majeures avec justifications
        const plantesMajeures: string[] = [];

        if (ordonnance?.phytotherapie) {
          ordonnance.phytotherapie.forEach((item: any) => {
            plantesMajeures.push(`${item.plante} - ${item.justification}`);
          });
        }
        if (ordonnance?.gemmotherapie) {
          ordonnance.gemmotherapie.forEach((item: any) => {
            plantesMajeures.push(`${item.plante} - ${item.justification}`);
          });
        }

        // Import Prisma
        const { prisma } = await import("@/lib/prisma");

        // Créer la synthèse globale en base
        const syntheseGlobale = await prisma.syntheseGlobale.create({
          data: {
            patientId: patientContext.id,
            terrainDominant: resumeGlobal,
            prioritesTherapeutiques: strategie_therapeutique?.priorites || [],
            axesPrincipaux: metadata?.axeScores?.map((a: any) => a.axe) || [],
            mecanismesCommuns: Array.isArray(mecanismes) ? mecanismes : [mecanismes].filter(Boolean),
            plantesMajeures,
            hygieneDeVie: ordonnance?.conseils_hygiene || [],
            signesDAlarme: strategie_therapeutique?.precautions || [],
            pronostic: strategie_therapeutique?.objectifs?.join(' ') || '',
            resumeGlobal,
            nombreAxesAnalyses: metadata?.axeScores?.length || 0,
            inclusBiologieFonction: metadata?.includeBdf || false,
            confiance: 0.8,
          },
        });

        console.log("✅ Synthèse sauvegardée en base:", syntheseGlobale.id);

        // Ajouter l'ID de la synthèse sauvegardée dans la réponse
        enrichedResult.metadata.syntheseId = syntheseGlobale.id;
      } catch (saveError) {
        console.error("⚠️ Erreur lors de la sauvegarde (non bloquant):", saveError);
        // Ne pas bloquer la génération si la sauvegarde échoue
      }
    }

    return NextResponse.json(enrichedResult);

  } catch (error: any) {
    console.error("❌ Erreur API Synthèse:", error);

    // Erreur OpenAI spécifique
    if (error?.response?.status === 401) {
      return NextResponse.json(
        { error: "Clé API OpenAI invalide ou manquante" },
        { status: 500 }
      );
    }

    if (error?.response?.status === 429) {
      return NextResponse.json(
        { error: "Quota OpenAI dépassé, réessayez plus tard" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur lors de la génération de la synthèse",
        details: error?.message || "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
