// ========================================
// API BdF RAG ENRICHMENT - /api/bdf/rag-enrichment
// ========================================
// POST : Enrichir les résultats BdF avec le RAG endobiogénie
// Génère : résumé fonctionnel, axes sollicités, lecture endobiogénique

import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, Runner } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vector Store Endobiogénie (prioritaire)
const fileSearch = fileSearchTool([
  "vs_68e87a07ae6c81918d805c8251526bda",
]);

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const agent = new Agent({
  name: "Agent Enrichissement BdF",
  instructions: `Tu es un expert en endobiogénie spécialisé dans l'interprétation des index biologiques fonctionnels.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT à partir des informations retrouvées via File Search.
2. Si une information n'est pas disponible, dis simplement : "Information non disponible dans mes sources."
3. NE MENTIONNE JAMAIS les sources, volumes, pages ou chapitres.
4. Sois précis, pédagogique et appliqué.
5. Évite tout diagnostic médical - reste sur une lecture fonctionnelle du terrain.`,
  model: MODEL,
  tools: [fileSearch],
  modelSettings: { store: true },
});

type BdfIndex = {
  label: string;
  value: number | null;
  comment: string;
};

type BdfInputs = {
  [key: string]: number | undefined;
};

type EnrichmentRequest = {
  indexes: BdfIndex[];
  inputs: BdfInputs;
};

type EnrichmentResponse = {
  resumeFonctionnel: string;
  axesSollicites: string[];
  lectureEndobiogenique: string;
};

export async function POST(req: NextRequest) {
  try {
    const { indexes, inputs }: EnrichmentRequest = await req.json();

    // Validation
    if (!indexes || !Array.isArray(indexes)) {
      return NextResponse.json(
        { error: "Index BdF requis" },
        { status: 400 }
      );
    }

    // Construire le contexte BdF
    const indexesSummary = indexes
      .filter(idx => idx.value !== null)
      .map(idx => `${idx.label}: ${idx.value?.toFixed(2)} (${idx.comment})`)
      .join("\n");

    const inputsSummary = Object.entries(inputs)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    // ========================================
    // 1️⃣ RÉSUMÉ FONCTIONNEL
    // ========================================
    const resumePrompt = `
Analyse endobiogénique basée sur les index calculés suivants :

${indexesSummary}

Valeurs biologiques de départ : ${inputsSummary}

**Question** : Produis un résumé fonctionnel global de ce terrain biologique en 3-4 phrases maximum. Décris la dynamique adaptative et les tendances fonctionnelles principales révélées par ces index.

Reste factuel, pédagogique et accessible. Pas de diagnostic médical.
    `.trim();

    const resumeRunner = new Runner();
    const resumeResult = await resumeRunner.run(agent, [
      {
        role: "user",
        content: [{ type: "input_text", text: resumePrompt }],
      },
    ] as AgentInputItem[]);

    const resumeFonctionnel = resumeResult.finalOutput?.trim() || "Résumé non disponible.";

    // ========================================
    // 2️⃣ AXES SOLLICITÉS
    // ========================================
    const axesPrompt = `
Analyse endobiogénique basée sur les index calculés suivants :

${indexesSummary}

**Question** : Identifie les 2-3 axes neuroendocriniens principaux sollicités par ce terrain (exemples : axe génital, axe thyroïdien, axe corticotrope, axe somatotrope, etc.).

Réponds par une liste courte de 2-3 axes maximum, sans explication détaillée. Format : ["Axe 1", "Axe 2", "Axe 3"]
    `.trim();

    const axesRunner = new Runner();
    const axesResult = await axesRunner.run(agent, [
      {
        role: "user",
        content: [{ type: "input_text", text: axesPrompt }],
      },
    ] as AgentInputItem[]);

    const axesRaw = axesResult.finalOutput?.trim() || "[]";

    // Extraire les axes (parser simple)
    let axesSollicites: string[] = [];
    try {
      // Tenter de parser comme JSON
      axesSollicites = JSON.parse(axesRaw);
    } catch {
      // Si échec, extraire les axes manuellement (phrases séparées par virgule ou saut de ligne)
      axesSollicites = axesRaw
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('[') && !s.startsWith('{'))
        .slice(0, 3);
    }

    // ========================================
    // 3️⃣ LECTURE ENDOBIOGÉNIQUE DU TERRAIN
    // ========================================
    const lecturePrompt = `
Analyse endobiogénique basée sur les index calculés suivants :

${indexesSummary}

Résumé fonctionnel : ${resumeFonctionnel}

Axes sollicités : ${axesSollicites.join(", ")}

**Question** : Produis une lecture endobiogénique approfondie du terrain biologique en 5-6 phrases. Explique :
1. La dynamique adaptative révélée par ces index
2. Les axes neuroendocriniens en jeu
3. La cohérence fonctionnelle globale du terrain
4. Les tendances métaboliques observées

Sois pédagogique, précis et accessible. Pas de diagnostic médical.
    `.trim();

    const lectureRunner = new Runner();
    const lectureResult = await lectureRunner.run(agent, [
      {
        role: "user",
        content: [{ type: "input_text", text: lecturePrompt }],
      },
    ] as AgentInputItem[]);

    const lectureEndobiogenique = lectureResult.finalOutput?.trim() || "Lecture non disponible.";

    // ========================================
    // RETOUR RÉSULTAT
    // ========================================
    const response: EnrichmentResponse = {
      resumeFonctionnel,
      axesSollicites,
      lectureEndobiogenique,
    };

    return NextResponse.json(response);
  } catch (e: any) {
    console.error("Erreur enrichissement RAG:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}
