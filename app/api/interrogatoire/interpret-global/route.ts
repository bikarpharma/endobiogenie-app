import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Récupérer les données
    const { patientId } = await req.json();

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId requis" },
        { status: 400 }
      );
    }

    // 3. Vérifier que le patient appartient à l'utilisateur
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        axeInterpretations: {
          orderBy: { createdAt: 'desc' },
        },
        bdfAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!patient || patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // 4. Vérifier qu'il y a au moins 1 interprétation d'axe
    if (!patient.axeInterpretations || patient.axeInterpretations.length === 0) {
      return NextResponse.json(
        { error: "Aucune interprétation d'axe disponible. Veuillez d'abord interpréter les axes individuellement." },
        { status: 400 }
      );
    }

    console.log(`🌍 [Synthèse Globale] Patient: ${patient.prenom} ${patient.nom}`);
    console.log(`📊 [Synthèse Globale] ${patient.axeInterpretations.length} interprétations d'axes disponibles`);

    // 5. Construire le contexte pour GPT-4
    const interpretationsSummary = patient.axeInterpretations.map(interp => ({
      axe: interp.axe,
      orientation: interp.orientation,
      mecanismes: interp.mecanismes,
      prudences: interp.prudences,
      modulateurs: interp.modulateurs,
      resumeClinique: interp.resumeClinique,
      confiance: interp.confiance,
    }));

    // 6. Ajouter les données BdF si disponibles
    let bdfSummary = "Aucune analyse BdF disponible.";
    if (patient.bdfAnalyses && patient.bdfAnalyses.length > 0) {
      const lastBdf = patient.bdfAnalyses[0];
      bdfSummary = lastBdf.summary || "Analyse BdF présente mais sans résumé.";
    }

    // 7. Construire le prompt pour GPT-4
    const systemPrompt = `Tu es un expert en endobiogénie.

Ton rôle est de synthétiser TOUTES les interprétations des axes endobiogéniques d'un patient pour produire une SYNTHÈSE GLOBALE holistique.

**Principes endobiogéniques à respecter :**
1. **Terrain avant symptôme** : Identifier le terrain de base (Alpha/Bêta dominance)
2. **Précritique avant critique** : Détecter les déséquilibres avant pathologie
3. **Gestion prioritaire** : Hiérarchiser les axes à traiter en premier
4. **Approche systémique** : Comprendre les interactions entre axes
5. **Individualisation** : Chaque patient est unique

**Format de réponse attendu (JSON) :**
{
  "terrainDominant": "Alpha/Bêta/Mixte avec description",
  "prioritesTherapeutiques": ["Priorité 1", "Priorité 2", "Priorité 3"],
  "axesPrincipaux": ["axe1", "axe2", "axe3"],
  "mecanismesCommuns": ["Mécanisme transversal 1", "Mécanisme 2"],
  "plantesMajeures": ["Plante 1 (raison)", "Plante 2 (raison)", "Plante 3 (raison)"],
  "hygieneDeVie": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "signesDAlarme": ["Signe à surveiller 1", "Signe 2"],
  "pronostic": "Court texte sur l'évolution attendue",
  "resumeGlobal": "Synthèse narrative en 3-4 phrases"
}

**Important :**
- Sois CONCRET et ACTIONNABLE
- Priorise selon l'endobiogénie (ex: rééquilibrer neuro avant thyroïde)
- Propose des plantes de phytothérapie spécifiques
- Considère les interactions entre axes (ex: stress → thyroïde → métabolisme)`;

    const userPrompt = `**PATIENT :** ${patient.prenom} ${patient.nom} (${patient.sexe === 'F' ? 'Femme' : 'Homme'})

**INTERPRÉTATIONS DES AXES :**
${interpretationsSummary.map((interp, i) => `
${i + 1}. **AXE ${interp.axe.toUpperCase()}**
   - Orientation : ${interp.orientation}
   - Résumé clinique : ${interp.resumeClinique}
   - Mécanismes : ${Array.isArray(interp.mecanismes) ? interp.mecanismes.join(', ') : 'N/A'}
   - Modulateurs suggérés : ${Array.isArray(interp.modulateurs) ? interp.modulateurs.join(', ') : 'N/A'}
   - Prudences : ${Array.isArray(interp.prudences) ? interp.prudences.join(', ') : 'N/A'}
   - Confiance IA : ${interp.confiance}
`).join('\n')}

**BIOLOGIE FONCTIONNELLE (BdF) :**
${bdfSummary}

**MISSION :**
Synthétise ces données pour produire une vision GLOBALE du terrain endobiogénique de ce patient et un plan thérapeutique hiérarchisé.

Réponds UNIQUEMENT avec le JSON demandé (pas de markdown, pas de \`\`\`json).`;

    // 8. Appel à GPT-4
    console.log("🤖 [Synthèse Globale] Appel OpenAI GPT-4 pour synthèse globale...");

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

    const rawResponse = completion.choices[0]?.message?.content || "{}";
    console.log("✅ [Synthèse Globale] Réponse GPT-4 reçue");

    let syntheseGlobale;
    try {
      syntheseGlobale = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON:", rawResponse);
      return NextResponse.json(
        { error: "Erreur de format dans la réponse IA" },
        { status: 500 }
      );
    }

    // 9. Sauvegarder la synthèse globale en base
    const savedSynthese = await prisma.syntheseGlobale.create({
      data: {
        patientId: patient.id,
        terrainDominant: syntheseGlobale.terrainDominant || "Non déterminé",
        prioritesTherapeutiques: syntheseGlobale.prioritesTherapeutiques || [],
        axesPrincipaux: syntheseGlobale.axesPrincipaux || [],
        mecanismesCommuns: syntheseGlobale.mecanismesCommuns || [],
        plantesMajeures: syntheseGlobale.plantesMajeures || [],
        hygieneDeVie: syntheseGlobale.hygieneDeVie || [],
        signesDAlarme: syntheseGlobale.signesDAlarme || [],
        pronostic: syntheseGlobale.pronostic || "",
        resumeGlobal: syntheseGlobale.resumeGlobal || "",
        nombreAxesAnalyses: patient.axeInterpretations.length,
        inclusBiologieFonction: patient.bdfAnalyses && patient.bdfAnalyses.length > 0,
      },
    });

    console.log(`💾 [Synthèse Globale] Sauvegardée en base : ${savedSynthese.id}`);

    return NextResponse.json({
      success: true,
      syntheseId: savedSynthese.id,
      synthese: syntheseGlobale,
    });

  } catch (error: any) {
    console.error("❌ [Synthèse Globale] Erreur:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
