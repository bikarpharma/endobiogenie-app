// ========================================
// API GÉNÉRATION ORDONNANCE IA - /api/patients/[id]/ordonnances/generate
// ========================================
// POST : Générer une nouvelle ordonnance phyto avec l'IA

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { queryVectorStore } from "@/lib/chatbot/ragClient";

export const runtime = "nodejs";
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * POST /api/patients/[id]/ordonnances/generate
 * Générer une ordonnance phyto personnalisée basée sur l'analyse BdF
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Récupérer userId depuis les headers (auth)
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: patientId } = await params;
    const body = await req.json();
    const { customPrompt } = body;

    // Récupérer le patient avec ses analyses BdF
    const patient = await prisma.patient.findUnique({
      where: { id: patientId, userId },
      include: {
        bdfAnalyses: {
          orderBy: { date: "desc" },
          take: 1, // Dernière analyse
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    if (patient.bdfAnalyses.length === 0) {
      return NextResponse.json(
        { error: "Aucune analyse BdF disponible pour ce patient" },
        { status: 400 }
      );
    }

    const derniereBdf = patient.bdfAnalyses[0];

    console.log("🤖 Génération ordonnance IA pour patient:", patient.nom, patient.prenom);
    console.log("📊 Dernière BdF:", derniereBdf.id);

    // Si customPrompt, interroger le vectorstore
    let vectorStoreResponse = "";
    if (customPrompt && customPrompt.trim()) {
      console.log("🔍 Question personnalisée détectée, interrogation du vectorstore...");
      try {
        const ragChunks = await queryVectorStore(customPrompt, 3);
        if (ragChunks.length > 0) {
          vectorStoreResponse = ragChunks.map((chunk) => chunk.text).join("\n\n");
          console.log("✅ Réponse du vectorstore récupérée (", vectorStoreResponse.length, "caractères)");
        }
      } catch (ragError: any) {
        console.error("⚠️ Erreur vectorstore (non bloquant):", ragError.message);
        // Continuer sans vectorstore si erreur
      }
    }

    // Construire le prompt pour l'IA
    const systemPrompt = `Tu es un expert en Endobiogénie et en phytothérapie. Ta tâche est de générer une ordonnance personnalisée basée sur la Biologie des Fonctions (BdF) du patient.

**Contexte Endobiogénie :**
L'Endobiogénie est une approche médicale qui analyse le terrain biologique du patient à travers des index calculés depuis des analyses biologiques. Ces index reflètent l'activité des différents axes neuro-endocriniens (sympathique, parasympathique, thyroïdien, cortico-surrénalien, génital, etc.).

**Principes de prescription :**
- **Terrain HypoAlpha** (index Alpha bas) : Supporter la trophicité, plantes adaptogènes
- **Terrain HyperBêta** (index Bêta élevé) : Moduler le sympathique, plantes calmantes
- **Terrain HyperGamma** (index Gamma élevé) : Tempérer le parasympathique
- **Déséquilibre thyroïdien** : Adapter selon hypo/hyperthyroïdie
- **Fatigue surrénale** : Bourgeons de Cassis, Rhodiola
- **Carence vitaminique** : Compléments nutritionnels ciblés

**Format de réponse attendu (JSON strict) :**
{
  "titre": "Traitement terrain [type de terrain détecté]",
  "interpretation": "Lecture endobiogénique détaillée du terrain basée sur les index BdF (2-3 phrases)",
  "recommandations": [
    {
      "plante": "Nom de la plante/remède",
      "posologie": "Posologie précise (ex: 15 gouttes 3x/jour)",
      "duree": "Durée du traitement (ex: 3 mois)",
      "remarques": "Remarques optionnelles"
    }
  ],
  "conseils": "Conseils hygiéno-diététiques adaptés au terrain"
}

**Important :**
- Réponds UNIQUEMENT en JSON valide
- Pas de texte avant ou après le JSON
- Base tes recommandations sur les index BdF fournis
- Sois précis et professionnel`;

    const userPrompt = `**Patient :** ${patient.prenom} ${patient.nom}
${patient.sexe ? `**Sexe :** ${patient.sexe}` : ""}
${patient.dateNaissance ? `**Âge :** ${calculateAge(new Date(patient.dateNaissance))} ans` : ""}

**Analyse BdF :**
Date : ${new Date(derniereBdf.date).toLocaleDateString("fr-FR")}

**Index calculés :**
${JSON.stringify(derniereBdf.indexes, null, 2)}

**Résumé :** ${derniereBdf.summary}

**Axes sollicités :** ${Array.isArray(derniereBdf.axes) ? derniereBdf.axes.join(", ") : "Non spécifié"}

${derniereBdf.ragText ? `**Lecture endobiogénique :** ${derniereBdf.ragText}` : ""}

${patient.allergies ? `⚠️ **Allergies :** ${patient.allergies}` : ""}
${patient.traitements ? `💊 **Traitements en cours :** ${patient.traitements}` : ""}

${customPrompt ? `\n**Question spécifique du praticien :** ${customPrompt}` : ""}

${vectorStoreResponse ? `\n**Informations Endobiogénie issues du vectorstore :**\n${vectorStoreResponse}` : ""}

Génère une ordonnance phytothérapie personnalisée au format JSON en tenant compte des informations du vectorstore si disponibles.`;

    console.log("📝 Appel OpenAI...");

    // Appeler OpenAI pour générer l'ordonnance
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
      throw new Error("Réponse IA vide");
    }

    console.log("✅ Réponse IA reçue");

    // Parser la réponse JSON
    const ordonnanceData = JSON.parse(aiResponse);

    // Valider le format
    if (
      !ordonnanceData.titre ||
      !ordonnanceData.interpretation ||
      !Array.isArray(ordonnanceData.recommandations)
    ) {
      throw new Error("Format de réponse IA invalide");
    }

    console.log("💾 Sauvegarde en base de données...");

    // Créer l'ordonnance dans la base
    const ordonnance = await prisma.ordonnance.create({
      data: {
        patientId: patient.id,
        bdfAnalysisId: derniereBdf.id,
        titre: ordonnanceData.titre,
        interpretation: ordonnanceData.interpretation,
        recommandations: ordonnanceData.recommandations,
        conseils: ordonnanceData.conseils || null,
        statut: "brouillon",
      },
    });

    console.log("✅ Ordonnance créée:", ordonnance.id);

    return NextResponse.json(
      {
        ordonnance: {
          id: ordonnance.id,
          titre: ordonnance.titre,
          interpretation: ordonnance.interpretation,
          recommandations: ordonnance.recommandations,
          conseils: ordonnance.conseils,
          statut: ordonnance.statut,
          dateOrdonnance: ordonnance.dateOrdonnance.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Erreur génération ordonnance:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Fonction helper pour calculer l'âge
function calculateAge(dateNaissance: Date): number {
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
