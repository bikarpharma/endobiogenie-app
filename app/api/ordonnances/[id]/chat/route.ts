// ========================================
// API CHAT ORDONNANCE - /api/ordonnances/[id]/chat
// ========================================
// POST : Chat contextuel avec l'ordonnance via OpenAI Assistants API
// Permet au praticien de poser des questions, demander des modifications
// Utilise l'Assistant configuré avec le VectorStore complet (26MB)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { openai, ASSISTANT_ORDONNANCE_ID, ASSISTANT_DIAGNOSTIC_ID } from "@/lib/openai";
import type {
  ChatMessage,
  RecommandationTherapeutique,
  FormeGalenique,
} from "@/lib/ordonnance/types";
import { v4 as uuidv4 } from "uuid";
import { getTunisianProductsContext } from "@/lib/utils/tunisianAdapter";

// ==========================================
// DÉTECTION DU TYPE DE QUESTION
// ==========================================

type QuestionType = "diagnostic" | "ordonnance" | "mixte";

/**
 * Détecte si la question concerne le diagnostic (terrain, axes, BdF)
 * ou l'ordonnance (plantes, posologies, modifications)
 */
function detectQuestionType(message: string): QuestionType {
  const msgLower = message.toLowerCase();

  // Mots-clés pour le diagnostic/terrain
  const diagnosticKeywords = [
    "terrain", "diagnostic", "bdf", "biologie des fonctions",
    "axe", "corticotrope", "thyréotrope", "gonadotrope", "somatotrope",
    "sna", "sympathique", "parasympathique", "vagal",
    "index", "indice", "score", "perturbation",
    "pourquoi ce terrain", "expliquer le terrain",
    "comprendre", "analyser", "interpréter",
    "déséquilibre", "mécanisme", "physiopathologie",
    "spasmophilie", "hypercortisolisme", "hypothyroïdie",
    "quel est le problème", "que montre", "signifie",
  ];

  // Mots-clés pour l'ordonnance/prescription
  const ordonnanceKeywords = [
    "plante", "ajouter", "retirer", "remplacer", "modifier",
    "posologie", "dosage", "dose", "combien",
    "eps", "mg", "he", "huile essentielle", "teinture",
    "microsphère", "gélule", "gouttes",
    "ordonnance", "prescription", "traitement",
    "passiflore", "valériane", "cassis", "ribes", "tilleul",
    "drainage", "émonctoire", "foie", "rein",
    "alternative", "remplacer par", "à la place",
    "contre-indication", "interaction", "allergie",
    "durée", "combien de temps", "renouveler",
  ];

  // Compter les correspondances
  let diagnosticScore = 0;
  let ordonnanceScore = 0;

  for (const kw of diagnosticKeywords) {
    if (msgLower.includes(kw)) diagnosticScore++;
  }

  for (const kw of ordonnanceKeywords) {
    if (msgLower.includes(kw)) ordonnanceScore++;
  }

  // Déterminer le type
  if (diagnosticScore > ordonnanceScore && diagnosticScore >= 2) {
    return "diagnostic";
  } else if (ordonnanceScore > diagnosticScore && ordonnanceScore >= 1) {
    return "ordonnance";
  } else if (diagnosticScore > 0 && ordonnanceScore > 0) {
    return "mixte";
  }

  // Par défaut: ordonnance (car c'est le contexte principal du chat)
  return "ordonnance";
}

/**
 * Sélectionne l'Assistant approprié selon le type de question
 */
function selectAssistant(questionType: QuestionType): { id: string; name: string } {
  switch (questionType) {
    case "diagnostic":
      return { id: ASSISTANT_DIAGNOSTIC_ID, name: "Expert Diagnostic" };
    case "ordonnance":
      return { id: ASSISTANT_ORDONNANCE_ID, name: "Expert Ordonnance" };
    case "mixte":
      // Pour les questions mixtes, on utilise le dual-Assistant (voir callDualAssistants)
      return { id: ASSISTANT_ORDONNANCE_ID, name: "Expert Ordonnance" };
    default:
      return { id: ASSISTANT_ORDONNANCE_ID, name: "Expert Ordonnance" };
  }
}

// ==========================================
// DUAL-ASSISTANT POUR QUESTIONS MIXTES
// ==========================================

interface AssistantResponse {
  text: string;
  assistantName: string;
}

/**
 * Nettoie la réponse de l'Assistant en supprimant le JSON parasite au début/fin
 * et en formatant correctement le texte
 */
function cleanAssistantResponse(response: string): string {
  let cleaned = response;

  // Supprimer les blocs JSON au début (```json ... ```)
  cleaned = cleaned.replace(/^```json\s*\n?[\s\S]*?```\s*\n?/i, '');

  // Supprimer les blocs JSON bruts au début { "reponse": ... }
  cleaned = cleaned.replace(/^\s*\{\s*"reponse"\s*:\s*\{[\s\S]*?\}\s*\}\s*/i, '');

  // Supprimer tout JSON orphelin au début
  cleaned = cleaned.replace(/^\s*\{\s*"[^"]+"\s*:\s*[\s\S]*?\}\s*\n*/i, '');

  // Supprimer les marqueurs de code résiduels
  cleaned = cleaned.replace(/^```\w*\s*\n?/gm, '');
  cleaned = cleaned.replace(/\n?```\s*$/gm, '');

  // Nettoyer les espaces multiples et lignes vides excédentaires
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Exécute un Run sur un Assistant et attend la réponse
 */
async function runAssistantAndWait(
  threadId: string,
  assistantId: string,
  assistantName: string,
  maxAttempts: number = 45
): Promise<AssistantResponse> {
  // Créer le Run
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  // Polling pour attendre la complétion - intervalle 3s pour réduire les coûts API
  const POLLING_INTERVAL_MS = 3000;
  let runStatus = run;
  let attempts = 0;

  while (runStatus.status !== "completed" && runStatus.status !== "failed" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
    runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    attempts++;
  }

  if (runStatus.status === "failed") {
    throw new Error(`${assistantName} failed: ${runStatus.last_error?.message || "Unknown error"}`);
  }

  if (runStatus.status !== "completed") {
    throw new Error(`${assistantName} timeout after ${maxAttempts}s`);
  }

  // Récupérer le dernier message
  const messages = await openai.beta.threads.messages.list(threadId, {
    order: "desc",
    limit: 1,
  });

  const assistantMsg = messages.data[0];
  let responseText = "";

  if (assistantMsg && assistantMsg.role === "assistant") {
    const textContent = assistantMsg.content.find((c) => c.type === "text");
    if (textContent && textContent.type === "text") {
      responseText = textContent.text.value;
    }
  }

  return { text: responseText, assistantName };
}

/**
 * Appelle les deux Assistants en parallèle pour les questions mixtes
 * et fusionne leurs réponses avec contexte tunisien
 */
async function callDualAssistants(
  contextPrompt: string,
  userMessage: string
): Promise<{ fusedResponse: string; diagnosticResponse: string; ordonnanceResponse: string }> {
  console.log("🔀 Mode DUAL-ASSISTANT activé (question mixte)");

  // Récupérer le contexte des produits tunisiens pour l'Expert Ordonnance
  const tunisianContext = getTunisianProductsContext();

  // Créer deux threads séparés (un pour chaque Assistant)
  // Car on ne peut pas avoir deux Runs simultanés sur le même thread
  const [threadDiagnostic, threadOrdonnance] = await Promise.all([
    openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `${contextPrompt}

[INSTRUCTIONS]
- Explique le MÉCANISME TERRAIN et la PHYSIOPATHOLOGIE endobiogénique
- Connecte les axes (Corticotrope, Thyréotrope, Gonadotrope, Somatotrope, SNA)
- Sois pédagogique mais concis (max 150 mots)
- NE PAS générer de JSON, réponds en texte naturel`,
        },
      ],
    }),
    openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `${contextPrompt}

${tunisianContext}

[INSTRUCTIONS]
- Propose les MODIFICATIONS PRATIQUES de l'ordonnance
- Utilise UNIQUEMENT les formes disponibles en Tunisie (voir liste ci-dessus)
- Indique posologie tunisienne (Microsphères: 2-3 gél/jour, Macérat: 15 gttes/jour 5j/7)
- Sois concis (max 150 mots)
- NE PAS générer de JSON, réponds en texte naturel`,
        },
      ],
    }),
  ]);

  console.log(`📝 Threads créés: Diagnostic=${threadDiagnostic.id.slice(0, 10)}... | Ordonnance=${threadOrdonnance.id.slice(0, 10)}...`);

  // Appeler les deux Assistants en parallèle
  const [diagnosticResult, ordonnanceResult] = await Promise.all([
    runAssistantAndWait(threadDiagnostic.id, ASSISTANT_DIAGNOSTIC_ID, "Expert Diagnostic"),
    runAssistantAndWait(threadOrdonnance.id, ASSISTANT_ORDONNANCE_ID, "Expert Ordonnance"),
  ]);

  // Nettoyer les réponses (supprimer JSON parasite)
  const cleanedDiagnostic = cleanAssistantResponse(diagnosticResult.text);
  const cleanedOrdonnance = cleanAssistantResponse(ordonnanceResult.text);

  console.log(`✅ Expert Diagnostic: ${cleanedDiagnostic.length} caractères (nettoyé)`);
  console.log(`✅ Expert Ordonnance: ${cleanedOrdonnance.length} caractères (nettoyé)`);

  // Fusionner les réponses avec une mise en page claire
  const fusedResponse = `### 🧬 Analyse du Terrain

${cleanedDiagnostic}

---

### 💊 Recommandation Thérapeutique

${cleanedOrdonnance}

---
*Réponse générée par IntegrIA (Dual-Expert Mode)*`;

  return {
    fusedResponse,
    diagnosticResponse: cleanedDiagnostic,
    ordonnanceResponse: cleanedOrdonnance,
  };
}

/**
 * Appelle un seul Assistant (mode standard pour questions non-mixtes)
 * Gère la persistance du thread pour maintenir le contexte conversationnel
 */
async function callSingleAssistant(
  ordonnance: any,
  ordonnanceId: string,
  contextPrompt: string,
  assistant: { id: string; name: string }
): Promise<string> {
  // Récupérer ou créer le thread pour cette ordonnance
  let threadId = ordonnance.threadId as string | null;

  if (!threadId) {
    // Créer un nouveau thread avec le contexte initial
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `[CONTEXTE INITIAL - NE PAS RÉPONDRE]\n${contextPrompt}`,
        },
      ],
    });
    threadId = thread.id;

    // Sauvegarder le threadId pour réutilisation
    await prisma.ordonnance.update({
      where: { id: ordonnanceId },
      data: { threadId },
    });

    console.log(`📝 Nouveau thread créé: ${threadId}`);
  } else {
    // Thread existant - ajouter le message utilisateur
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: contextPrompt,
    });
    console.log(`📝 Message ajouté au thread existant: ${threadId}`);
  }

  // Créer et exécuter le Run avec l'Assistant sélectionné
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistant.id,
  });

  console.log(`🚀 Run créé: ${run.id}`);

  // Attendre la complétion du Run - intervalle 3s pour réduire les coûts API
  const currentThreadId = threadId as string;
  const POLLING_INTERVAL_MS = 3000;
  let runStatus = run;
  let attempts = 0;
  const maxAttempts = 40; // 40 × 3s = 2 minutes max

  while (runStatus.status !== "completed" && runStatus.status !== "failed" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
    runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: currentThreadId });
    attempts++;

    if (attempts % 5 === 0) {
      console.log(`⏳ Run en cours... (${attempts * 3}s) - Status: ${runStatus.status}`);
    }
  }

  if (runStatus.status === "failed") {
    console.error("❌ Run failed:", runStatus.last_error);
    throw new Error(`Assistant run failed: ${runStatus.last_error?.message || "Unknown error"}`);
  }

  if (runStatus.status !== "completed") {
    throw new Error(`Run timeout after ${maxAttempts} seconds`);
  }

  // Récupérer les messages de réponse
  const messages = await openai.beta.threads.messages.list(currentThreadId, {
    order: "desc",
    limit: 1,
  });

  const openaiAssistantMsg = messages.data[0];
  let aiResponse = "Désolé, je n'ai pas pu générer de réponse.";

  if (openaiAssistantMsg && openaiAssistantMsg.role === "assistant") {
    const textContent = openaiAssistantMsg.content.find((c) => c.type === "text");
    if (textContent && textContent.type === "text") {
      aiResponse = textContent.text.value;
    }
  }

  return aiResponse;
}

export const runtime = "nodejs";
export const maxDuration = 90; // Augmenté pour dual-assistant

type ChatRequest = {
  message: string;
};

/**
 * GET /api/ordonnances/[id]/chat
 * Récupérer l'historique du chat
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id: ordonnanceId } = await params;

    const ordonnance = await prisma.ordonnance.findFirst({
      where: { id: ordonnanceId },
      include: {
        patient: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance non trouvée" },
        { status: 404 }
      );
    }

    if (ordonnance.patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      messages: ordonnance.chatMessagesJson || [],
    });
  } catch (e: any) {
    console.error("❌ Erreur récupération chat:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ordonnances/[id]/chat
 * Appliquer les modifications proposées par le chatbot
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id: ordonnanceId } = await params;
    const body = await req.json();
    const { modifications } = body;

    if (!modifications || !Array.isArray(modifications)) {
      return NextResponse.json(
        { error: "Modifications invalides" },
        { status: 400 }
      );
    }

    // Récupérer l'ordonnance
    const ordonnance = await prisma.ordonnance.findFirst({
      where: { id: ordonnanceId },
      include: {
        patient: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance non trouvée" },
        { status: 404 }
      );
    }

    if (ordonnance.patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Appliquer les modifications
    let voletEndobiogenique = ordonnance.voletEndobiogenique as any as RecommandationTherapeutique[];
    let voletPhytoElargi = ordonnance.voletPhytoElargi as any as RecommandationTherapeutique[];
    let voletComplements = ordonnance.voletComplements as any as RecommandationTherapeutique[];

    for (const mod of modifications) {
      const { op, path, value } = mod;

      // Parser le path (ex: "/voletEndobiogenique/0")
      const pathParts = path.split("/").filter((p: string) => p);
      const voletName = pathParts[0];
      const index = parseInt(pathParts[1]);

      let targetVolet: RecommandationTherapeutique[];
      if (voletName === "voletEndobiogenique") targetVolet = voletEndobiogenique;
      else if (voletName === "voletPhytoElargi") targetVolet = voletPhytoElargi;
      else if (voletName === "voletComplements") targetVolet = voletComplements;
      else continue;

      // Appliquer l'opération
      if (op === "add") {
        // Ajouter ID si manquant
        if (value && !value.id) {
          value.id = uuidv4();
        }
        targetVolet.push(value);
      } else if (op === "replace" && !isNaN(index)) {
        if (value && !value.id) {
          value.id = uuidv4();
        }
        targetVolet[index] = value;
      } else if (op === "remove" && !isNaN(index)) {
        targetVolet.splice(index, 1);
      }

      // Mettre à jour la référence
      if (voletName === "voletEndobiogenique") voletEndobiogenique = targetVolet;
      else if (voletName === "voletPhytoElargi") voletPhytoElargi = targetVolet;
      else if (voletName === "voletComplements") voletComplements = targetVolet;
    }

    // Sauvegarder l'ordonnance modifiée
    const updated = await prisma.ordonnance.update({
      where: { id: ordonnanceId },
      data: {
        voletEndobiogenique: voletEndobiogenique as any,
        voletPhytoElargi: voletPhytoElargi as any,
        voletComplements: voletComplements as any,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Modifications appliquées à l'ordonnance ${ordonnanceId.slice(0, 8)}`);

    return NextResponse.json({
      success: true,
      ordonnance: {
        voletEndobiogenique,
        voletPhytoElargi,
        voletComplements,
      },
    });
  } catch (e: any) {
    console.error("❌ Erreur application modifications:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ordonnances/[id]/chat
 * Chat contextuel avec l'ordonnance
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ==========================================
    // AUTHENTIFICATION
    // ==========================================
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id: ordonnanceId } = await params;
    const body: ChatRequest = await req.json();

    if (!body.message || body.message.trim() === "") {
      return NextResponse.json(
        { error: "Message vide" },
        { status: 400 }
      );
    }

    // ==========================================
    // RÉCUPÉRATION ORDONNANCE + PATIENT
    // ==========================================
    const ordonnance = await prisma.ordonnance.findFirst({
      where: {
        id: ordonnanceId,
      },
      include: {
        patient: {
          include: {
            bdfAnalyses: {
              orderBy: { date: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'ordonnance appartient à l'utilisateur
    if (ordonnance.patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // ==========================================
    // CONSTRUIRE LE CONTEXTE COMPLET
    // ==========================================
    const patient = ordonnance.patient;
    const bdfAnalysis = patient.bdfAnalyses[0] || null;

    const contextPrompt = buildContextPrompt(
      ordonnance,
      patient,
      bdfAnalysis,
      body.message
    );

    console.log(`💬 Chat ordonnance ${ordonnanceId.slice(0, 8)} - Patient: ${patient.nom} ${patient.prenom}`);

    // ==========================================
    // DÉTECTION TYPE DE QUESTION
    // ==========================================
    const questionType = detectQuestionType(body.message);

    console.log(`🔍 Type de question détecté: ${questionType}`);

    let aiResponse = "Désolé, je n'ai pas pu générer de réponse.";

    // ==========================================
    // DUAL-ASSISTANT POUR QUESTIONS MIXTES
    // ==========================================
    if (questionType === "mixte") {
      console.log("🔀 Question MIXTE détectée → Appel des DEUX Assistants en parallèle");

      try {
        const dualResult = await callDualAssistants(contextPrompt, body.message);
        aiResponse = dualResult.fusedResponse;
        console.log(`✅ Réponse fusionnée générée (${aiResponse.length} caractères)`);
      } catch (error: any) {
        console.error("❌ Erreur dual-assistant:", error);
        // Fallback: utiliser un seul Assistant
        console.log("⚠️ Fallback vers Assistant unique (Ordonnance)");
        const selectedAssistant = selectAssistant("ordonnance");
        aiResponse = await callSingleAssistant(ordonnance, ordonnanceId, contextPrompt, selectedAssistant);
      }
    } else {
      // ==========================================
      // SINGLE ASSISTANT (diagnostic ou ordonnance)
      // ==========================================
      const selectedAssistant = selectAssistant(questionType);
      console.log(`🤖 Assistant sélectionné: ${selectedAssistant.name} (${selectedAssistant.id.slice(0, 15)}...)`);

      // Ajouter contexte tunisien pour les questions d'ordonnance
      let enrichedContextPrompt = contextPrompt;
      if (questionType === "ordonnance") {
        const tunisianContext = getTunisianProductsContext();
        enrichedContextPrompt = `${contextPrompt}\n\n${tunisianContext}\n\n[INSTRUCTIONS]\n- Utilise UNIQUEMENT les formes disponibles en Tunisie\n- NE PAS générer de JSON, réponds en texte naturel`;
      }

      aiResponse = await callSingleAssistant(ordonnance, ordonnanceId, enrichedContextPrompt, selectedAssistant);
      console.log(`✅ Réponse ${selectedAssistant.name} générée (${aiResponse.length} caractères)`);
    }

    // ==========================================
    // NETTOYAGE & PARSING
    // ==========================================
    // D'abord nettoyer le JSON parasite au début
    const cleanedResponse = cleanAssistantResponse(aiResponse);

    // Puis parser les actions éventuelles (conserve le JSON PATCH pour les modifications)
    const { responseText, actions } = parseAIResponse(cleanedResponse);

    // ==========================================
    // CRÉER MESSAGE CHAT
    // ==========================================
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: body.message,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
      actions: actions.map((a) => ({
        id: uuidv4(),
        type: a.type,
        from: undefined,
        to: a.substance
          ? {
              id: uuidv4(),
              substance: a.substance,
              type: (a.forme?.includes("MG") ? "gemmo" : a.forme?.includes("HE") ? "HE" : "plante") as "plante" | "gemmo" | "HE",
              forme: (a.forme || "EPS") as FormeGalenique,
              posologie: a.posologie || "À définir",
              duree: a.duree || "21 jours",
              axeCible: a.axeCible || "",
              mecanisme: a.mecanisme || "",
              sourceVectorstore: "code" as const,
              niveauPreuve: 2 as 1 | 2 | 3,
              CI: [],
              interactions: [],
              priorite: 2,
              // 🆕 v3.1: Justification structurée obligatoire
              justification: {
                symptome_cible: a.justification?.split(' - ')?.[0] || "Non spécifié",
                axe_endobiogenique: a.axeCible || "À déterminer",
                mecanisme_action: a.mecanisme || "Action non documentée",
                synergies: [],
                justification_terrain: a.justification || "Voir terrain global",
                justification_classique: a.justification || "Base traditionnelle",
                explication_patient: "Cette plante soutient votre organisme",
              },
            }
          : undefined,
        justification: a.justification || "",
        applied: false,
      })),
    };

    // ==========================================
    // SAUVEGARDER HISTORIQUE CHAT
    // ==========================================
    const existingMessages = (ordonnance.chatMessagesJson as any as ChatMessage[]) || [];
    const updatedMessages = [...existingMessages, userMessage, assistantMessage];

    await prisma.ordonnance.update({
      where: { id: ordonnanceId },
      data: {
        chatMessagesJson: updatedMessages as any,
        updatedAt: new Date(),
      },
    });

    // ==========================================
    // RÉPONSE
    // ==========================================
    return NextResponse.json({
      message: assistantMessage,
      suggestedActions: (assistantMessage as any).actions || [],
    });
  } catch (e: any) {
    console.error("❌ Erreur chat ordonnance:", e);
    return NextResponse.json(
      {
        error: e?.message ?? "Erreur serveur",
        details: process.env.NODE_ENV === "development" ? e?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Construire le prompt avec contexte complet
 */
function buildContextPrompt(
  ordonnance: any,
  patient: any,
  bdfAnalysis: any,
  userMessage: string
): string {
  let prompt = `=== CONTEXTE PATIENT ===\n`;
  prompt += `Patient: ${patient.nom} ${patient.prenom}, ${patient.sexe}, ${calculateAge(patient.dateNaissance)} ans\n`;

  if (patient.contreindicationsMajeures && Array.isArray(patient.contreindicationsMajeures)) {
    prompt += `CI: ${(patient.contreindicationsMajeures as string[]).join(", ")}\n`;
  }

  if (patient.traitementActuel) {
    prompt += `Traitements actuels: ${patient.traitementActuel}\n`;
  }

  prompt += `\n=== TERRAIN BDF (si disponible) ===\n`;
  if (bdfAnalysis) {
    prompt += `Résumé: ${bdfAnalysis.summary}\n`;
    prompt += `Axes sollicités: ${(bdfAnalysis.axes as string[]).join(", ")}\n`;
  } else {
    prompt += `Aucune analyse BdF disponible\n`;
  }

  prompt += `\n=== ORDONNANCE ACTUELLE ===\n`;
  prompt += `Statut: ${ordonnance.statut}\n\n`;

  prompt += `VOLET 1 - ENDOBIOGÉNIE (canon):\n`;
  const volet1 = ordonnance.voletEndobiogenique as RecommandationTherapeutique[];
  if (volet1.length > 0) {
    for (const rec of volet1) {
      prompt += `- ${rec.substance} (${rec.forme}): ${rec.posologie}, ${rec.duree}\n`;
      prompt += `  Axe: ${rec.axeCible} | Mécanisme: ${rec.mecanisme}\n`;
    }
  } else {
    prompt += `(Aucune recommandation)\n`;
  }

  prompt += `\nVOLET 2 - PHYTO ÉLARGI:\n`;
  const volet2 = ordonnance.voletPhytoElargi as RecommandationTherapeutique[];
  if (volet2.length > 0) {
    for (const rec of volet2) {
      prompt += `- ${rec.substance} (${rec.forme}): ${rec.posologie}, ${rec.duree}\n`;
    }
  } else {
    prompt += `(Aucune recommandation)\n`;
  }

  prompt += `\nVOLET 3 - COMPLÉMENTS:\n`;
  const volet3 = ordonnance.voletComplements as RecommandationTherapeutique[];
  if (volet3.length > 0) {
    for (const rec of volet3) {
      prompt += `- ${rec.substance} (${rec.forme}): ${rec.posologie}, ${rec.duree}\n`;
    }
  } else {
    prompt += `(Aucune recommandation)\n`;
  }

  prompt += `\n=== QUESTION DU PRATICIEN ===\n`;
  prompt += userMessage;

  return prompt;
}

/**
 * Parser la réponse IA (texte + JSON PATCH optionnel)
 */
function parseAIResponse(response: string): {
  responseText: string;
  actions: Array<{
    type: "replace" | "add" | "remove";
    substance?: string;
    forme?: FormeGalenique;
    posologie?: string;
    duree?: string;
    axeCible?: string;
    mecanisme?: string;
    justification?: string;
  }>;
} {
  try {
    // Chercher JSON PATCH (nouveau format)
    const patchMatch = response.match(/\{[\s\S]*"modifications"[\s\S]*\}/);

    if (patchMatch) {
      const json = JSON.parse(patchMatch[0]);
      const cleanText = response.replace(patchMatch[0], "").trim();

      // Convertir JSON PATCH en actions
      const actions = (json.modifications || []).map((mod: any) => ({
        type: mod.op as "replace" | "add" | "remove",
        substance: mod.value?.substance,
        forme: mod.value?.forme as FormeGalenique,
        posologie: mod.value?.posologie,
        duree: mod.value?.duree,
        axeCible: mod.value?.axeCible,
        mecanisme: mod.value?.mecanisme,
        justification: json.justification || "",
      }));

      return {
        responseText: cleanText,
        actions,
      };
    }

    // Chercher ancien format (rétrocompatibilité)
    const jsonMatch = response.match(/\{[\s\S]*"actions"[\s\S]*\}/);

    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[0]);
      const cleanText = response.replace(jsonMatch[0], "").trim();

      return {
        responseText: cleanText,
        actions: json.actions || [],
      };
    }

    return {
      responseText: response,
      actions: [],
    };
  } catch (error) {
    console.warn("⚠️ Erreur parsing JSON:", error);
    return {
      responseText: response,
      actions: [],
    };
  }
}

/**
 * Calculer âge
 */
function calculateAge(dateNaissance: Date | null): number {
  if (!dateNaissance) return 0;
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
