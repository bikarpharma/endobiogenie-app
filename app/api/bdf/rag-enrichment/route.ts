// ========================================
// API BdF RAG ENRICHMENT - /api/bdf/rag-enrichment
// ========================================
// POST : Enrichir les résultats BdF avec le RAG endobiogénie
// Génère : résumé fonctionnel, axes sollicités, lecture endobiogénique
// VERSION OPTIMISÉE : 1 seul appel IA + cache + gpt-4o-mini

import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, Runner } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vector Store Endobiogénie (prioritaire)
const fileSearch = fileSearchTool([
  "vs_68e87a07ae6c81918d805c8251526bda",
]);

// Modèle optimisé pour rapidité + qualité
const MODEL = "gpt-4o-mini";

const agent = new Agent({
  name: "Agent Enrichissement BdF",
  instructions: `Tu es un expert en endobiogénie spécialisé dans l'interprétation des index biologiques fonctionnels.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT à partir des informations retrouvées via File Search.
2. Si une information n'est pas disponible, dis simplement : "Information non disponible dans mes sources."
3. NE MENTIONNE JAMAIS les sources, volumes, pages ou chapitres.
4. Sois précis, pédagogique et appliqué.
5. Évite tout diagnostic médical - reste sur une lecture fonctionnelle du terrain.
6. Réponds TOUJOURS en format JSON strict.`,
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

// Cache en mémoire (Map simple)
const cache = new Map<string, EnrichmentResponse>();

/**
 * Générer une clé de cache basée sur les index
 */
function generateCacheKey(indexes: BdfIndex[]): string {
  return indexes
    .filter(idx => idx.value !== null)
    .map(idx => `${idx.label}:${idx.value?.toFixed(1)}`)
    .sort()
    .join('|');
}

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

    // Vérifier le cache
    const cacheKey = generateCacheKey(indexes);
    if (cache.has(cacheKey)) {
      console.log("✅ Cache hit - Réponse instantanée");
      return NextResponse.json(cache.get(cacheKey));
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
    // PROMPT UNIFIÉ (1 seul appel IA)
    // ========================================
    const promptUnifie = `
Analyse endobiogénique basée sur les index calculés suivants :

${indexesSummary}

Valeurs biologiques de départ : ${inputsSummary}

**Instructions** : Produis une analyse complète en format JSON avec cette structure EXACTE :

{
  "resumeFonctionnel": "Résumé fonctionnel global en 3-4 phrases maximum. Décris la dynamique adaptative et les tendances fonctionnelles principales révélées par ces index.",
  "axesSollicites": ["Axe 1", "Axe 2", "Axe 3"],
  "lectureEndobiogenique": "Lecture approfondie en 5-6 phrases. Explique la dynamique adaptative, les axes neuroendocriniens en jeu, la cohérence fonctionnelle globale et les tendances métaboliques observées."
}

RÈGLES STRICTES :
- Réponds UNIQUEMENT à partir des documents retrouvés via File Search
- Liste 2-3 axes neuroendocriniens maximum (exemples : axe génital, axe thyroïdien, axe corticotrope, axe somatotrope)
- Reste factuel, pédagogique et accessible
- Pas de diagnostic médical
- Pas de mention de sources
- Format JSON strict (pas de markdown, juste le JSON brut)
    `.trim();

    // UN SEUL appel IA
    const runner = new Runner();
    const result = await runner.run(agent, [
      {
        role: "user",
        content: [{ type: "input_text", text: promptUnifie }],
      },
    ] as AgentInputItem[]);

    const rawOutput = result.finalOutput?.trim() || "{}";

    // Parser le JSON (avec gestion d'erreur)
    let response: EnrichmentResponse;
    try {
      // Nettoyer le markdown si présent (```json ... ```)
      const cleanedOutput = rawOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      response = JSON.parse(cleanedOutput);
    } catch (parseError) {
      console.error("Erreur parsing JSON:", parseError);
      console.error("Output brut:", rawOutput);

      // Fallback en cas d'erreur de parsing
      response = {
        resumeFonctionnel: "Erreur de parsing - veuillez réessayer",
        axesSollicites: [],
        lectureEndobiogenique: rawOutput,
      };
    }

    // Validation de la structure
    if (!response.resumeFonctionnel || !response.axesSollicites || !response.lectureEndobiogenique) {
      throw new Error("Structure JSON invalide retournée par l'IA");
    }

    // Mettre en cache (max 100 entrées pour éviter memory leak)
    if (cache.size >= 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
    cache.set(cacheKey, response);

    console.log(`✅ Enrichissement RAG réussi - ${indexes.filter(i => i.value !== null).length} index analysés`);

    return NextResponse.json(response);
  } catch (e: any) {
    console.error("Erreur enrichissement RAG:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}
