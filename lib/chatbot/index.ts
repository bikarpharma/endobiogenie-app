// ========================================
// EXPORTS - Module Chatbot Orchestrateur
// ========================================

export { respondToUser } from "./orchestrator";
export { classifyUserRequest } from "./classifier";
export { buildLabPayloadFromMessage } from "./labExtractor";
export { analyseBiologie } from "./analyseBiologie";
export { answerEndobiogenie } from "./answerEndobiogenie";
export type { ChatRequest, ChatReply, RequestMode } from "./types";

// RAG unifié - utiliser lib/ordonnance/ragSearch.ts
// Les anciens exports ragClient et vectorStoreRetrieval ont été supprimés
// Utiliser searchForAxisInterpretation, searchAllVectorstores depuis @/lib/ordonnance/ragSearch
