// ========================================
// EXPORTS - Module Chatbot Orchestrateur
// ========================================

export { respondToUser } from "./orchestrator";
export { classifyUserRequest } from "./classifier";
export { buildLabPayloadFromMessage } from "./labExtractor";
export { analyseBiologie } from "./analyseBiologie";
export { answerEndobiogenie } from "./answerEndobiogenie";
export { retrieveEndobiogenieContext } from "./vectorStoreRetrieval";
export type { ChatRequest, ChatReply, RequestMode } from "./types";
