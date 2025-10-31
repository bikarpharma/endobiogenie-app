// ========================================
// TYPES - Chatbot Orchestrateur
// ========================================

/**
 * Type de requête détecté
 */
export type RequestMode = "BDF_ANALYSE" | "ENDO_DISCUSSION";

/**
 * Requête utilisateur
 */
export interface ChatRequest {
  message: string;
}

/**
 * Réponse du chatbot
 */
export interface ChatReply {
  mode: RequestMode;
  reply: string;
}
