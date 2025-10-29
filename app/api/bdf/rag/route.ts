// ========================================
// API BdF RAG - /api/bdf/rag
// ========================================
// Endpoint dédié pour la lecture endobiogénique du terrain
// Utilise le vector store endobiogénie sans citer de références

import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, AgentInputItem, Runner } from "@openai/agents";

export const runtime = "nodejs";

// Vector Store Endobiogénie uniquement
const fileSearch = fileSearchTool([
  "vs_68e87a07ae6c81918d805c8251526bda",
]);

// Modèle
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

// Agent spécialisé pour la lecture endobiogénique du terrain BdF
const bdfRagAgent = new Agent({
  name: "EndoBot BdF Terrain",
  instructions: `Tu es un expert en endobiogénie spécialisé dans l'analyse fonctionnelle du terrain biologique.

CONTEXTE :
L'utilisateur te fournit un profil BdF (Biologie des Fonctions) avec des index calculés et des axes dominants. Ta mission est de produire une lecture endobiogénique du terrain en français.

INSTRUCTIONS STRICTES :

1. UTILISE UNIQUEMENT les concepts retrouvés dans les volumes via File Search
2. NE CITE JAMAIS de références, volumes, sections ou pages
3. Rédige un texte fluide et professionnel en français
4. Utilise le vocabulaire endobiogénique approprié :
   - "profil fonctionnel" / "terrain"
   - "axe sollicité" / "axe mobilisé"
   - "dynamique adaptative"
   - "pression pro-croissance/anabolique"
   - "rendement thyréotrope périphérique"
   - "orientation corticotrope vs gonadotrope"
   - "remodelage tissulaire"

5. STRUCTURE DE LA RÉPONSE (sans titres apparents) :
   a) Synthèse du profil global (2-3 phrases)
   b) Analyse de l'axe corticotrope (ACTH → cortisol) et son rôle adaptatif
   c) Analyse de l'axe thyréotrope (métabolisme, vitesse de réponse cellulaire)
   d) Analyse de la balance androgènes/œstrogènes (pression pro-croissance)
   e) Équilibre catabolisme/anabolisme
   f) Dynamique du remodelage et renouvellement tissulaire
   g) Conclusion intégrative du terrain (2 phrases)

6. TON ET STYLE :
   - Professionnel, neutre, factuel
   - PAS de diagnostic médical
   - PAS de recommandations thérapeutiques
   - Reste dans l'analyse fonctionnelle du terrain
   - Explique les mécanismes sans jugement clinique

7. FORMAT :
   - Texte continu en paragraphes
   - Pas de bullet points
   - Pas de sections numérotées visibles
   - Fluide et lisible

IMPORTANT : Si un concept n'est pas retrouvé dans les volumes, utilise les principes généraux de l'endobiogénie sans inventer. Ne dis JAMAIS "selon le volume X" ou "d'après la source Y". Intègre directement les connaissances dans ton analyse.`,
  model: MODEL,
  tools: [fileSearch],
  modelSettings: { store: true },
});

export async function POST(req: NextRequest) {
  try {
    const { profileSummary, axes, indexes } = await req.json();

    // Validation
    if (!profileSummary || !axes || !indexes) {
      return NextResponse.json(
        { error: "Données BdF incomplètes (profileSummary, axes, indexes requis)" },
        { status: 400 }
      );
    }

    // Construire le prompt contextuel pour l'agent
    const prompt = `
Voici un profil biologique fonctionnel (BdF) à analyser :

PROFIL FONCTIONNEL :
${profileSummary}

AXES DOMINANTS :
${axes.join(", ")}

INDEX CALCULÉS :
${indexes.map((idx: any) =>
  `${idx.label}: ${idx.value !== null ? idx.value.toFixed(2) : "N/A"} → ${idx.comment}`
).join("\n")}

Produis une lecture endobiogénique complète du terrain en expliquant la dynamique adaptative des axes neuroendocriniens, l'équilibre métabolique, et le remodelage tissulaire. Utilise les concepts endobiogéniques retrouvés dans les volumes pour enrichir ton analyse. Texte fluide en français, sans références citées.
`;

    // Appeler l'agent RAG BdF
    const conversation: AgentInputItem[] = [
      { role: "user", content: [{ type: "input_text", text: prompt }] },
    ];

    const runner = new Runner();
    const result = await runner.run(bdfRagAgent, conversation);

    if (!result.finalOutput) {
      return NextResponse.json(
        { error: "Pas de sortie de l'agent RAG" },
        { status: 500 }
      );
    }

    const interpretation = result.finalOutput;

    return NextResponse.json({
      interpretation,
      success: true,
    });
  } catch (e: any) {
    console.error("Erreur API /bdf/rag:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur lors de la génération RAG" },
      { status: 500 }
    );
  }
}

// Healthcheck
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "API BdF RAG opérationnelle",
    vectorStore: "vs_68e87a07ae6c81918d805c8251526bda",
  });
}
