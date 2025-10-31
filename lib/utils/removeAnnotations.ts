// ========================================
// UTILITAIRE - Nettoyage des citations
// ========================================
// Supprime les références de type 【X†source】 des réponses des assistants OpenAI

/**
 * Nettoie les annotations/citations des réponses d'assistants OpenAI
 * Supprime les références de type 【0†source】, 【1†source】, etc.
 *
 * @param text - Texte brut de l'assistant
 * @returns Texte nettoyé sans les annotations
 *
 * @example
 * const raw = "L'axe thyréotrope【0†source】régule le métabolisme【1†source】";
 * const clean = removeAnnotations(raw);
 * // Retourne: "L'axe thyréotrope régule le métabolisme"
 */
export function removeAnnotations(text: string): string {
  // Enlever les références de type【X†source】où X est un nombre
  return text.replace(/【\d+†[^】]+】/g, "");
}
