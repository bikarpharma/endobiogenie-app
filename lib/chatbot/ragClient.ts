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
 * Vérifie que le vector store existe et est accessible
 */
async function checkVectorStore(client: OpenAI): Promise<boolean> {
  try {
    console.log("🔍 Vérification du vector store:", VECTOR_STORE_ID);
    const vectorStore = await client.beta.vectorStores.retrieve(VECTOR_STORE_ID);
    console.log("✅ Vector store trouvé:", vectorStore.name, "| Status:", vectorStore.status);
    console.log("✅ Fichiers dans le vector store:", vectorStore.file_counts.completed);

    if (vectorStore.status !== "completed") {
      console.warn("⚠️ Vector store pas encore complété:", vectorStore.status);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("❌ Vector store inaccessible:", error.message);
    return false;
  }
}

/**
 * Crée ou récupère un assistant configuré avec file_search
 */
async function getOrCreateAssistant(client: OpenAI): Promise<string> {
  if (cachedAssistantId) {
    return cachedAssistantId;
  }

  try {
    // Vérifier le vector store avant de créer l'assistant
    const vsOk = await checkVectorStore(client);
    if (!vsOk) {
      throw new Error("Vector store indisponible ou non complété");
    }

    // Créer un assistant avec file_search et notre vector store
const assistant = await client.beta.assistants.create({
  name: "Endobiogenie RAG Assistant",
  instructions:
    "Tu es un assistant spécialisé en endobiogénie. " +
    "\n\nRÈGLES STRICTES :\n" +
    "1. Réponds UNIQUEMENT à partir des informations retrouvées dans les documents du vector store.\n" +
    "2. Si une information n'est pas disponible, dis simplement : \"Je n'ai pas d'information spécifique à ce sujet.\"\n" +
    "3. NE MENTIONNE JAMAIS les sources, livres, volumes, pages, sections ou chapitres.\n" +
    "4. NE DIS JAMAIS des phrases comme \"Ce point est détaillé dans les volumes\" ou \"Pas de détail dans les volumes\".\n" +
    "5. Réponds de manière naturelle et fluide, comme si tu expliquais directement à partir de tes connaissances.\n" +
    "\n" +
    "Fournis des passages clairs et précis sur la logique fonctionnelle du terrain, " +
    "les axes neuroendocriniens et l'interprétation des index BdF. " +
    "Sois pédagogique et accessible. Ta réponse doit être autonome et complète, sans aucune référence bibliographique.",
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
    console.log("🔍 Création/récupération de l'assistant...");
    const assistantId = await getOrCreateAssistant(client);
    console.log("✅ Assistant ID:", assistantId);

    // 2. Créer un thread
    console.log("🔍 Création du thread...");
    const thread = await client.beta.threads.create();
    console.log("✅ Thread ID:", thread.id);

    // 3. Ajouter le message utilisateur
    console.log("🔍 Ajout du message utilisateur...");
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userQuery,
    });

    // 4. Lancer le run avec file_search (avec timeout de 90 secondes)
    console.log("🔍 Lancement du run avec file_search...");
    const startTime = Date.now();
    const run = await Promise.race([
      client.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistantId,
        // Augmenter le poll_interval pour réduire la fréquence de vérification
        poll_interval_ms: 2000, // Vérifier toutes les 2 secondes au lieu de 1
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout: le vector store met trop de temps à répondre (>90s)")), 90000)
      )
    ]) as OpenAI.Beta.Threads.Runs.Run;

    const duration = Date.now() - startTime;
    console.log(`✅ Run complété en ${duration}ms`);

    console.log("✅ Run status:", run.status);

    // 5. Vérifier le statut du run
    if (run.status !== "completed") {
      console.error("❌ Run non complété:", run.status);

      if (run.last_error) {
        console.error("❌ Erreur détaillée:", run.last_error);
        console.error("❌ Code erreur:", run.last_error.code);
        console.error("❌ Message erreur:", run.last_error.message);
      }

      // Log des étapes du run pour debug
      if (run.required_action) {
        console.log("🔍 Action requise:", run.required_action);
      }

      console.log("⚠️ Utilisation des chunks par défaut suite à run non complété");
      return getDefaultChunks();
    }

    // 6. Récupérer les messages de l'assistant
    console.log("🔍 Récupération des messages...");
    const messages = await client.beta.threads.messages.list(thread.id);
    console.log("✅ Nombre de messages:", messages.data.length);

    // 7. Extraire les réponses textuelles
    const chunks: RAGChunk[] = [];

    for (const message of messages.data) {
      if (message.role === "assistant") {
        for (const content of message.content) {
          if (content.type === "text") {
            const text = content.text.value;
            console.log("✅ Texte reçu de l'assistant (longueur):", text.length);

            // Nettoyer les annotations/citations si présentes
            let cleanedText = text;

            // Enlever les références de type【X†source】
            cleanedText = cleanedText.replace(/【\d+†[^】]+】/g, "");

            // Découper en paragraphes significatifs
            const paragraphs = cleanedText
              .split("\n\n")
              .map((p) => p.trim())
              .filter((p) => p.length > 50); // Min 50 caractères

            console.log("✅ Paragraphes extraits:", paragraphs.length);

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

    console.log("✅ Nombre total de chunks:", chunks.length);

    // 8. Nettoyer le thread (optionnel, économise les tokens)
    try {
      await client.beta.threads.del(thread.id);
      console.log("✅ Thread supprimé");
    } catch (e) {
      console.warn("⚠️ Impossible de supprimer le thread:", e);
    }

    return chunks.slice(0, topK);
  } catch (error: any) {
    console.error("❌ Erreur lors de la requête vector store:", error);
    console.error("❌ Message d'erreur:", error.message);
    console.error("❌ Stack:", error.stack);

    // En cas d'erreur, retourner des chunks par défaut
    console.log("⚠️ Utilisation des chunks par défaut");
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
