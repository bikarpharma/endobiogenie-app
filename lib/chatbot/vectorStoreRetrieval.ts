// ========================================
// RÉCUPÉRATION DU CONTEXTE ENDOBIOGÉNIE
// ========================================
// Interroge le vector store OpenAI pour enrichir l'analyse BdF
// avec le savoir fonctionnel de l'endobiogénie

import { queryVectorStore, type RAGChunk } from "./ragClient";

/**
 * Récupère des passages contextuels du vector store d'endobiogénie
 * @param query - Requête clinique pour guider la recherche
 * @returns Tableau de passages textuels (max 3)
 */
export async function retrieveEndobiogenieContext(
  query: string
): Promise<string[]> {
  try {
    // Appeler le client RAG pour interroger le vector store OpenAI
    const chunks: RAGChunk[] = await queryVectorStore(query, 3);

    // Extraire les textes
    const passages = chunks.map((chunk) => chunk.text);

    // Vérifier qu'on a au moins un passage
    if (passages.length === 0) {
      console.warn("⚠️ Aucun passage retourné par le vector store");
      return getDefaultContext();
    }

    return passages;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération du contexte endobiogénie:",
      error
    );
    return getDefaultContext();
  }
}

/**
 * Contexte par défaut si le vector store n'est pas accessible
 * @returns Passages génériques sur l'endobiogénie
 */
function getDefaultContext(): string[] {
  return [
    "L'axe corticotrope (ACTH → cortisol) coordonne la réponse d'urgence et oriente le catabolisme rapide. " +
      "Il mobilise les substrats énergétiques et module l'inflammation en situation de stress.",
    "L'axe thyréotrope régule la vitesse métabolique tissulaire et la capacité de réponse cellulaire. " +
      "Un index thyroïdien efficace reflète un bon rendement fonctionnel des hormones thyroïdiennes en périphérie.",
    "Le système gonadotrope module l'anabolisme de fond via les androgènes et les œstrogènes, " +
      "impactant le renouvellement tissulaire et la pression pro-croissance.",
  ];
}
