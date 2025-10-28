// ========================================
// RÉCUPÉRATION DU CONTEXTE ENDOBIOGÉNIE
// ========================================
// Interroge le vector store pour enrichir l'analyse BdF
// avec le savoir fonctionnel de l'endobiogénie

import { Agent, Runner, fileSearchTool } from "@openai/agents";

// ID du vector store contenant la documentation endobiogénie
const ENDO_VECTOR_STORE_ID = "vs_68e87a07ae6c81918d805c8251526bda";

/**
 * Récupère des passages contextuels du vector store d'endobiogénie
 * @param query - Requête clinique pour guider la recherche
 * @returns Tableau de passages textuels (max 3)
 */
export async function retrieveEndobiogenieContext(
  query: string
): Promise<string[]> {
  try {
    // TODO: Vérifier que la clé API OpenAI est configurée
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        "⚠️ OPENAI_API_KEY non configurée - utilisation du contexte par défaut"
      );
      return getDefaultContext();
    }

    // Configuration du file search avec le vector store endobiogénie
    const fileSearch = fileSearchTool([ENDO_VECTOR_STORE_ID]);

    // Modèle (même que celui utilisé pour le chat)
    const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    // Agent spécialisé pour la récupération de contexte endobiogénie
    const agent = new Agent({
      name: "Endo Context Retriever",
      instructions: `Tu es un assistant spécialisé dans l'extraction de contexte endobiogénique.
Réponds UNIQUEMENT à partir des extraits retrouvés via File Search.
Fournis 2-3 passages clés qui expliquent la logique fonctionnelle du terrain :
- Les axes neuroendocriniens (corticotrope, thyréotrope, gonadotrope)
- La dynamique adaptative (catabolisme vs anabolisme)
- La lecture fonctionnelle des index BdF
Sois concis et précis. Reste dans un ton descriptif et pédagogique.`,
      model: MODEL,
      tools: [fileSearch],
      modelSettings: { store: true },
    });

    // Exécution de la requête
    const runner = new Runner();
    const result = await runner.run(agent, [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: query,
          },
        ],
      },
    ]);

    // Extraction du texte de réponse
    if (!result.finalOutput || typeof result.finalOutput !== "string") {
      console.warn("⚠️ Pas de sortie du vector store - contexte par défaut");
      return getDefaultContext();
    }

    // Découpage de la réponse en passages (paragraphes)
    const passages = result.finalOutput
      .split("\n\n")
      .filter((p) => p.trim().length > 50)
      .slice(0, 3); // Max 3 passages

    return passages.length > 0 ? passages : getDefaultContext();
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération du contexte:", error);
    return getDefaultContext();
  }
}

/**
 * Contexte par défaut si le vector store n'est pas accessible
 * @returns Passages génériques sur l'endobiogénie
 */
function getDefaultContext(): string[] {
  return [
    "L'axe corticotrope (ACTH → cortisol) coordonne la réponse d'urgence et oriente le catabolisme rapide. Il mobilise les substrats énergétiques et module l'inflammation en situation de stress.",
    "L'axe thyréotrope régule la vitesse métabolique tissulaire et la capacité de réponse cellulaire. Un index thyroïdien efficace reflète un bon rendement fonctionnel des hormones thyroïdiennes en périphérie.",
    "Le système gonadotrope module l'anabolisme de fond via les androgènes et les œstrogènes, impactant le renouvellement tissulaire. L'équilibre entre empreinte androgénique et œstrogénique oriente la dynamique de construction ou de réparation.",
  ];
}
