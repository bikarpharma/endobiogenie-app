// ========================================
// CLIENT RAG - Interrogation Vector Store OpenAI
// ========================================
// Nécessite OPENAI_API_KEY dans les variables d'environnement
// Le vector store utilisé est vs_68e87a07ae6c81918d805c8251526bda

import OpenAI from "openai";

// ID du vector store endobiogénie hébergé chez OpenAI
const VECTOR_STORE_ID = "vs_68e87a07ae6c81918d805c8251526bda";

/**
 * Chunk de texte retourné par le vector store
 */
export interface RAGChunk {
  text: string;
  score?: number;
}

/**
 * Client OpenAI singleton
 */
let openaiClient: OpenAI | null = null;

/**
 * Récupère ou crée le client OpenAI
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY non configurée dans les variables d'environnement"
      );
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Assistant ID (créé à la volée ou réutilisé)
 * Pour éviter de créer un assistant à chaque requête, on pourrait
 * le créer une fois et stocker son ID. Pour l'instant, on le crée à la volée.
 */
let cachedAssistantId: string | null = null;

/**
 * Crée ou récupère un assistant configuré avec file_search
 */
async function getOrCreateAssistant(client: OpenAI): Promise<string> {
  if (cachedAssistantId) {
    return cachedAssistantId;
  }

  try {
    // Créer un assistant avec file_search et notre vector store
    const assistant = await client.beta.assistants.create({
      name: "Endobiogenie RAG Assistant",
      instructions:
        "Tu es un assistant spécialisé en endobiogénie. " +
        "Réponds uniquement à partir des documents du vector store. " +
        "Fournis des passages clairs et précis sur la logique fonctionnelle du terrain, " +
        "les axes neuroendocriniens et l'interprétation des index BdF.",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [VECTOR_STORE_ID],
        },
      },
    });

    cachedAssistantId = assistant.id;
    return assistant.id;
  } catch (error: any) {
    console.error("❌ Erreur création assistant:", error);
    throw new Error(`Impossible de créer l'assistant: ${error.message}`);
  }
}

/**
 * Interroge le vector store OpenAI avec une query
 * @param userQuery - Requête textuelle de l'utilisateur
 * @param topK - Nombre de chunks à retourner (par défaut 3)
 * @returns Tableau de chunks pertinents
 */
export async function queryVectorStore(
  userQuery: string,
  topK: number = 3
): Promise<RAGChunk[]> {
  try {
    const client = getOpenAIClient();

    // 1. Récupérer ou créer l'assistant
    const assistantId = await getOrCreateAssistant(client);

    // 2. Créer un thread
    const thread = await client.beta.threads.create();

    // 3. Ajouter le message utilisateur
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userQuery,
    });

    // 4. Lancer le run avec file_search
    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
    });

    // 5. Vérifier le statut du run
    if (run.status !== "completed") {
      console.error("❌ Run non complété:", run.status);
      return [];
    }

    // 6. Récupérer les messages de l'assistant
    const messages = await client.beta.threads.messages.list(thread.id);

    // 7. Extraire les réponses textuelles
    const chunks: RAGChunk[] = [];

    for (const message of messages.data) {
      if (message.role === "assistant") {
        for (const content of message.content) {
          if (content.type === "text") {
            const text = content.text.value;

            // Nettoyer les annotations/citations si présentes
            let cleanedText = text;

            // Enlever les références de type【X†source】
            cleanedText = cleanedText.replace(/【\d+†[^】]+】/g, "");

            // Découper en paragraphes significatifs
            const paragraphs = cleanedText
              .split("\n\n")
              .map((p) => p.trim())
              .filter((p) => p.length > 50); // Min 50 caractères

            // Prendre les premiers paragraphes jusqu'à topK
            for (let i = 0; i < Math.min(paragraphs.length, topK); i++) {
              chunks.push({
                text: paragraphs[i],
                score: 1.0 - i * 0.1, // Score décroissant arbitraire
              });
            }

            break; // On ne garde que le premier message assistant
          }
        }
        break;
      }
    }

    // 8. Nettoyer le thread (optionnel, économise les tokens)
    try {
      await client.beta.threads.del(thread.id);
    } catch (e) {
      // Ignorer les erreurs de suppression
    }

    return chunks.slice(0, topK);
  } catch (error: any) {
    console.error("❌ Erreur lors de la requête vector store:", error);

    // En cas d'erreur, retourner des chunks par défaut
    return getDefaultChunks();
  }
}

/**
 * Chunks par défaut en cas d'erreur d'accès au vector store
 */
function getDefaultChunks(): RAGChunk[] {
  return [
    {
      text:
        "L'axe corticotrope (ACTH → cortisol) coordonne la réponse d'urgence et oriente le catabolisme rapide. " +
        "Il mobilise les substrats énergétiques et module l'inflammation en situation de stress.",
      score: 1.0,
    },
    {
      text:
        "L'axe thyréotrope régule la vitesse métabolique tissulaire et la capacité de réponse cellulaire. " +
        "Un index thyroïdien efficace reflète un bon rendement fonctionnel des hormones thyroïdiennes en périphérie.",
      score: 0.9,
    },
    {
      text:
        "Le système gonadotrope module l'anabolisme de fond via les androgènes et les œstrogènes, " +
        "impactant le renouvellement tissulaire et la pression pro-croissance.",
      score: 0.8,
    },
  ];
}
