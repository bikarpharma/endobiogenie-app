// ========================================
// ORCHESTRATEUR PRINCIPAL DU CHATBOT
// ========================================
// Fonction unique qui unifie la logique :
// 1. Classification du message
// 2. Routing vers analyse BdF ou discussion endobiogénie
// 3. Retour de la réponse formatée

import { classifyUserRequest } from "./classifier";
import { analyseBiologie } from "./analyseBiologie";
import { answerEndobiogenie } from "./answerEndobiogenie";
import type { ChatReply } from "./types";

/**
 * Fonction principale du chatbot orchestrateur
 * Analyse le message, détermine le mode, et retourne la réponse appropriée
 * @param message - Message utilisateur
 * @returns Réponse avec mode et contenu
 */
export async function respondToUser(message: string): Promise<ChatReply> {
  try {
    // 1️⃣ Classifier le message
    const mode = classifyUserRequest(message);

    // 2️⃣ Router vers la bonne fonction
    let reply: string;

    if (mode === "BDF_ANALYSE") {
      // Message contient des valeurs biologiques → Analyse BdF
      reply = await analyseBiologie(message);
    } else {
      // Discussion générale sur l'endobiogénie
      reply = await answerEndobiogenie(message);
    }

    // 3️⃣ Retourner la réponse avec le mode
    return {
      mode,
      reply,
    };
  } catch (error: any) {
    console.error("Erreur dans l'orchestrateur:", error);
    return {
      mode: "ENDO_DISCUSSION",
      reply:
        "Une erreur s'est produite lors du traitement de votre message. Veuillez réessayer.",
    };
  }
}
