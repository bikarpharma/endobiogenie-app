// ========================================
// API CHAT - VERSION ASSISTANTS OPENAI
// ========================================
// 📖 Architecture :
// - 2 Assistants OpenAI spécialisés (Diagnostic + Ordonnance)
// - Chaque assistant a ses propres VectorStores attachés
// - Réponse combinée pour conseil complet
// - Support Vision pour images cliniques

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { removeAnnotations } from "@/lib/utils/removeAnnotations";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// 🔧 FLAG TEMPORAIRE - Désactiver la DB pour tester l'interface
const SKIP_DB = true; // Mettre à false pour réactiver la persistance

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IDs des Assistants OpenAI
const ASSISTANT_DIAGNOSTIC_ID = process.env.OPENAI_ASSISTANT_DIAGNOSTIC_ID!;
const ASSISTANT_ORDONNANCE_ID = process.env.OPENAI_ASSISTANT_ORDONNANCE_ID!;

// Modèle Vision pour images
const VISION_MODEL = "gpt-4o";

// ============================================================
// TYPES
// ============================================================
interface ChatRequestBody {
  message: string;
  chatId?: string;
  image?: string;
  imageType?: string;
}

// ============================================================
// FONCTION: Appeler un Assistant OpenAI
// ============================================================
async function callAssistant(
  assistantId: string,
  message: string,
  context?: string
): Promise<string> {
  try {
    // 1. Créer un thread avec le message initial
    const fullMessage = context
      ? `${context}\n\n---\n\nQuestion: ${message}`
      : message;

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: fullMessage,
        },
      ],
    });

    const threadId = thread.id;

    // Vérification que le thread a bien été créé
    if (!threadId) {
      console.error(`[Assistant ${assistantId}] Thread créé sans ID:`, thread);
      throw new Error("Thread créé sans ID valide");
    }

    console.log(`[Assistant ${assistantId}] Thread créé: ${threadId}`);

    // 2. Lancer l'assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    const runId = run.id;

    // Vérification que le run a bien été créé
    if (!runId) {
      console.error(`[Assistant ${assistantId}] Run créé sans ID:`, run);
      throw new Error("Run créé sans ID valide");
    }

    console.log(`[Assistant ${assistantId}] Run lancé: ${runId} (thread: ${threadId})`);

    // 3. Attendre la fin (polling) - intervalle 3s pour réduire les coûts API
    // OpenAI SDK v6+: runs.retrieve(runId, { thread_id })
    const POLLING_INTERVAL_MS = 3000; // 3 secondes au lieu de 1
    const MAX_ATTEMPTS = 40; // 40 × 3s = 2 minutes max

    let runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
    let attempts = 0;

    while (runStatus.status !== "completed" && attempts < MAX_ATTEMPTS) {
      if (runStatus.status === "failed" || runStatus.status === "cancelled") {
        console.error(`[Assistant ${assistantId}] Run ${runStatus.status}:`, runStatus.last_error);
        throw new Error(`Assistant run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
      }
      if (runStatus.status === "requires_action") {
        // Si l'assistant nécessite une action (function calling), on skip
        console.log(`[Assistant ${assistantId}] Run requires_action - skipping`);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
      // OpenAI SDK v6+: runs.retrieve(runId, { thread_id })
      runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
      attempts++;

      // Log périodique pour monitoring
      if (attempts % 5 === 0) {
        console.log(`[Assistant ${assistantId}] Polling: ${attempts} attempts, status: ${runStatus.status}`);
      }
    }

    if (runStatus.status !== "completed") {
      console.error(`[Assistant ${assistantId}] Timeout ou status non complété: ${runStatus.status}`);
      throw new Error(`Assistant timeout (status: ${runStatus.status})`);
    }

    // 4. Récupérer la réponse
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantMessage = messages.data.find((m) => m.role === "assistant");

    if (!assistantMessage || !assistantMessage.content[0]) {
      throw new Error("Pas de réponse de l'assistant");
    }

    const content = assistantMessage.content[0];
    if (content.type === "text") {
      console.log(`[Assistant ${assistantId}] Réponse reçue (${content.text.value.length} chars)`);
      return content.text.value;
    }

    return "";
  } catch (error) {
    console.error(`Erreur assistant ${assistantId}:`, error);
    throw error;
  }
}

// ============================================================
// FONCTION: Extraire les blocs JSON valides d'un texte
// ============================================================
function extractJsonBlocks(text: string): { json: any; start: number; end: number }[] {
  const results: { json: any; start: number; end: number }[] = [];
  let i = 0;

  while (i < text.length) {
    // Chercher le début d'un objet JSON
    if (text[i] === '{') {
      let braceCount = 1;
      let j = i + 1;
      let inString = false;
      let escape = false;

      // Parcourir pour trouver la fin de l'objet JSON
      while (j < text.length && braceCount > 0) {
        const char = text[j];

        if (escape) {
          escape = false;
        } else if (char === '\\' && inString) {
          escape = true;
        } else if (char === '"' && !escape) {
          inString = !inString;
        } else if (!inString) {
          if (char === '{') braceCount++;
          else if (char === '}') braceCount--;
        }
        j++;
      }

      if (braceCount === 0) {
        const jsonStr = text.substring(i, j);
        try {
          const json = JSON.parse(jsonStr);
          // Vérifier que c'est un JSON médical (pas un petit objet aléatoire)
          if (json.meta || json.terrain || json.prescription || json.patient_resume) {
            results.push({ json, start: i, end: j });
            i = j;
            continue;
          }
        } catch {
          // Pas du JSON valide
        }
      }
    }
    i++;
  }

  return results;
}

// ============================================================
// FONCTION: Formater une réponse JSON en Markdown lisible
// ============================================================
function formatJsonToMarkdown(text: string): string {
  if (!text) return "";

  const jsonBlocks = extractJsonBlocks(text);

  if (jsonBlocks.length === 0) {
    return text; // Pas de JSON trouvé
  }

  // Reconstruire le texte en remplaçant les blocs JSON
  let result = "";
  let lastIndex = 0;

  for (const block of jsonBlocks) {
    // Ajouter le texte avant le JSON
    result += text.substring(lastIndex, block.start);

    // Formater le JSON
    let formatted = "";
    if (block.json.terrain && block.json.axesEndocriniens) {
      formatted = formatDiagnosticResponse(block.json);
    } else if (block.json.prescription || block.json.calendrier_prise) {
      formatted = formatOrdonnanceResponse(block.json);
    }

    result += formatted || JSON.stringify(block.json, null, 2);
    lastIndex = block.end;
  }

  // Ajouter le texte restant après le dernier JSON
  result += text.substring(lastIndex);

  return result;
}

function formatDiagnosticResponse(json: any): string {
  let md = "";

  // Patient résumé
  if (json.patient_resume) {
    const p = json.patient_resume;
    md += `### 👤 Patient\n`;
    md += `- **Âge** : ${p.age || "N/A"} ans\n`;
    md += `- **Motif** : ${p.motif_consultation || "N/A"}\n\n`;
  }

  // Terrain
  if (json.terrain) {
    const t = json.terrain;
    md += `### 🎯 Terrain Endobiogénique\n`;
    md += `${t.description || ""}\n\n`;
    md += `- **Axe dominant** : ${t.axeDominant || "N/A"}\n`;
    md += `- **Profil SNA** : ${t.profilSNA || "N/A"}\n`;
    if (t.terrainsPrincipaux?.length) {
      md += `- **Terrains** : ${t.terrainsPrincipaux.join(", ")}\n`;
    }
    md += "\n";
  }

  // Axes endocriniens
  if (json.axesEndocriniens?.length) {
    md += `### 📊 Axes Endocriniens Perturbés\n\n`;
    for (const axe of json.axesEndocriniens) {
      md += `#### ${axe.rang}. ${axe.axe} (${axe.status})\n`;
      md += `- **Perturbation** : ${axe.score_perturbation}/10\n`;
      md += `- **Mécanisme** : ${axe.mecanisme || ""}\n`;

      if (axe.plantes_terrain_recommandees?.length) {
        md += `- **Plantes recommandées** :\n`;
        for (const pl of axe.plantes_terrain_recommandees) {
          md += `  - **${pl.plante}** (${pl.forme_recommandee}) : ${pl.mecanisme_terrain}\n`;
        }
      }
      md += "\n";
    }
  }

  // Drainage
  if (json.drainage?.necessaire) {
    const d = json.drainage;
    md += `### 🚿 Drainage\n`;
    md += `- **Priorité** : ${d.priorite}\n`;
    md += `- **Justification** : ${d.justification}\n`;
    md += `- **Durée** : ${d.duree_recommandee}\n`;
    if (d.emonctoires_prioritaires?.length) {
      for (const em of d.emonctoires_prioritaires) {
        md += `- **${em.emonctoire.toUpperCase()}** : ${em.justification}\n`;
        if (em.plantes?.length) {
          for (const pl of em.plantes) {
            md += `  - ${pl.plante} : ${pl.action}\n`;
          }
        }
      }
    }
    md += "\n";
  }

  // Stratégie
  if (json.strategie_therapeutique) {
    md += `### 🗺️ Stratégie Thérapeutique\n`;
    md += `${json.strategie_therapeutique.resume || ""}\n\n`;
  }

  // Synthèse praticien
  if (json.synthese_pour_praticien) {
    md += `### 📋 Synthèse Praticien\n`;
    md += `${json.synthese_pour_praticien}\n\n`;
  }

  // Warnings
  if (json.warnings?.length) {
    md += `### ⚠️ Points d'attention\n`;
    for (const w of json.warnings) {
      md += `- ${w}\n`;
    }
  }

  return md;
}

function formatOrdonnanceResponse(json: any): string {
  let md = "";

  // Contexte
  if (json.patient_contexte) {
    md += `### 👤 Contexte Patient\n`;
    md += `${json.patient_contexte.motif_consultation || ""}\n\n`;
  }

  // Stratégie globale
  if (json.global_strategy_summary) {
    md += `### 🎯 Stratégie Globale\n`;
    md += `${json.global_strategy_summary}\n\n`;
  }

  // Prescription
  if (json.prescription) {
    const p = json.prescription;

    // Symptomatic
    if (p.symptomatic?.length) {
      md += `### 💊 Traitement Symptomatique\n\n`;
      for (const item of p.symptomatic) {
        md += `**${item.name_fr}** (*${item.name_latin}*) - ${item.form}\n`;
        md += `- Posologie : ${item.dosage}\n`;
        md += `- Durée : ${item.duree}\n`;
        md += `- ${item.justification_classique || item.justification_terrain || ""}\n\n`;
      }
    }

    // Neuro-endocrine
    if (p.neuro_endocrine?.length) {
      md += `### 🧠 Régulation Neuro-Endocrinienne\n\n`;
      for (const item of p.neuro_endocrine) {
        md += `**${item.name_fr}** (*${item.name_latin}*) - ${item.form}\n`;
        md += `- Posologie : ${item.dosage}\n`;
        md += `- Durée : ${item.duree}\n`;
        md += `- Axe : ${item.axe_cible || "N/A"}\n`;
        md += `- ${item.justification_terrain || ""}\n\n`;
      }
    }

    // SNA
    if (p.ans?.length) {
      md += `### 🌿 Régulation SNA\n\n`;
      for (const item of p.ans) {
        md += `**${item.name_fr}** (*${item.name_latin}*) - ${item.form}\n`;
        md += `- Posologie : ${item.dosage}\n`;
        md += `- Durée : ${item.duree}\n`;
        md += `- ${item.justification_terrain || ""}\n\n`;
      }
    }

    // Drainage
    if (p.drainage?.length) {
      md += `### 🚿 Drainage\n\n`;
      for (const item of p.drainage) {
        md += `**${item.name_fr}** (*${item.name_latin}*) - ${item.form}\n`;
        md += `- Posologie : ${item.dosage}\n`;
        md += `- Durée : ${item.duree}\n`;
        md += `- Émonctoire : ${item.emonctoire_cible || "N/A"}\n\n`;
      }
    }

    // Oligos
    if (p.oligos?.length) {
      md += `### 💎 Micronutrition\n\n`;
      for (const item of p.oligos) {
        md += `**${item.substance}**\n`;
        md += `- Posologie : ${item.posologie}\n`;
        md += `- Durée : ${item.duree}\n`;
        md += `- ${item.justification || ""}\n\n`;
      }
    }
  }

  // Calendrier
  if (json.calendrier_prise) {
    md += `### 📅 Calendrier des Prises\n\n`;
    const cal = json.calendrier_prise;

    if (cal.phase_drainage) {
      md += `**Phase Drainage (${cal.phase_drainage.duree})**\n`;
      if (cal.phase_drainage.matin_jeun?.length) md += `- Matin à jeun : ${cal.phase_drainage.matin_jeun.join(", ")}\n`;
      if (cal.phase_drainage.matin_petit_dejeuner?.length) md += `- Petit-déjeuner : ${cal.phase_drainage.matin_petit_dejeuner.join(", ")}\n`;
      if (cal.phase_drainage.midi_avant_repas?.length) md += `- Midi : ${cal.phase_drainage.midi_avant_repas.join(", ")}\n`;
      if (cal.phase_drainage.soir_apres_diner?.length) md += `- Soir : ${cal.phase_drainage.soir_apres_diner.join(", ")}\n`;
      if (cal.phase_drainage.soir_coucher?.length) md += `- Coucher : ${cal.phase_drainage.soir_coucher.join(", ")}\n`;
      md += "\n";
    }

    if (cal.phase_entretien) {
      md += `**Phase Entretien (${cal.phase_entretien.duree})**\n`;
      if (cal.phase_entretien.matin_jeun?.length) md += `- Matin à jeun : ${cal.phase_entretien.matin_jeun.join(", ")}\n`;
      if (cal.phase_entretien.matin_petit_dejeuner?.length) md += `- Petit-déjeuner : ${cal.phase_entretien.matin_petit_dejeuner.join(", ")}\n`;
      if (cal.phase_entretien.soir_apres_diner?.length) md += `- Soir : ${cal.phase_entretien.soir_apres_diner.join(", ")}\n`;
      if (cal.phase_entretien.soir_coucher?.length) md += `- Coucher : ${cal.phase_entretien.soir_coucher.join(", ")}\n`;
      md += "\n";
    }
  }

  // Conseils
  if (json.conseils_hygiene_vie?.length) {
    md += `### 🏃 Conseils Hygiène de Vie\n`;
    for (const c of json.conseils_hygiene_vie) {
      md += `- ${c}\n`;
    }
    md += "\n";
  }

  // Coût
  if (json.cout_estime) {
    md += `### 💰 Coût Estimé\n`;
    md += `**${json.cout_estime.mensuel}**/mois\n\n`;
  }

  // Suivi
  if (json.suivi) {
    md += `### 📆 Suivi\n`;
    md += `- Prochaine consultation : ${json.suivi.prochaine_consultation || "N/A"}\n`;
    if (json.suivi.parametres_surveiller?.length) {
      md += `- À surveiller : ${json.suivi.parametres_surveiller.join(", ")}\n`;
    }
  }

  return md;
}

// ============================================================
// FONCTION: Analyser une image avec GPT-4 Vision
// ============================================================
async function analyzeImageWithVision(
  message: string,
  imageBase64: string,
  imageType: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "system",
        content: `Tu es un expert en sémiologie clinique endobiogénique. Analyse l'image fournie du point de vue:
- Signes cutanés et leur lien avec les axes endocriniens
- Indications sur le terrain (corticotrope, thyréotrope, gonadotrope, somatotrope)
- Observations pertinentes pour un diagnostic endobiogénique
Sois précis et clinique dans ton analyse.`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: message },
          {
            type: "image_url",
            image_url: {
              url: `data:${imageType};base64,${imageBase64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  return response.choices[0]?.message?.content || "";
}

// ============================================================
// FONCTION PRINCIPALE POST
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body: ChatRequestBody = await req.json();
    const { message, chatId, image, imageType } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    const hasImage = !!image && !!imageType;

    // 1️⃣ Créer ou récupérer le Chat (SKIP si SKIP_DB)
    let currentChatId = chatId as string | null;
    let chatRecord: { id: string; title: string; userId: string } | null = null;
    let isNewChat = false;
    let historyContext: string | undefined;

    if (SKIP_DB) {
      // Mode sans DB - générer un ID local
      currentChatId = currentChatId || `local_${Date.now()}`;
      chatRecord = { id: currentChatId, title: message.slice(0, 30), userId: session.user.id || "local" };
      isNewChat = !chatId;
      historyContext = undefined;
    } else {
      if (currentChatId) {
        const existingChat = await prisma.chat.findUnique({
          where: { id: currentChatId },
          select: { id: true, userId: true, title: true },
        });

        if (!existingChat || existingChat.userId !== session.user.id) {
          return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
        }
        chatRecord = existingChat;
      } else {
        const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
        const newChat = await prisma.chat.create({
          data: { userId: session.user.id, title },
          select: { id: true, title: true, userId: true },
        });
        currentChatId = newChat.id;
        chatRecord = newChat;
        isNewChat = true;
      }

      // 2️⃣ Sauvegarder le message utilisateur
      await prisma.message.create({
        data: { chatId: currentChatId, role: "user", content: message },
      });

      // 3️⃣ Récupérer l'historique récent (pour contexte)
      const history = await prisma.message.findMany({
        where: { chatId: currentChatId },
        orderBy: { createdAt: "asc" },
        take: 10,
      });

      // Construire le contexte historique
      historyContext = history.length > 1
        ? "Historique récent:\n" + history.slice(0, -1).map(m =>
            `${m.role === 'user' ? 'Patient' : 'Médecin'}: ${m.content.slice(0, 200)}...`
          ).join("\n")
        : undefined;
    }

    // 4️⃣ Analyser l'image si présente
    let imageAnalysis = "";
    if (hasImage) {
      console.log("🖼️ Analyse de l'image avec GPT-4 Vision...");
      imageAnalysis = await analyzeImageWithVision(message, image, imageType);
      console.log("✅ Image analysée");
    }

    // 5️⃣ Appeler les 2 Assistants en parallèle
    console.log("🔬 Appel des assistants Diagnostic + Ordonnance...");

    const questionWithImage = imageAnalysis
      ? `${message}\n\n[Analyse de l'image jointe]\n${imageAnalysis}`
      : message;

    const [diagnosticResponse, ordonnanceResponse] = await Promise.all([
      callAssistant(
        ASSISTANT_DIAGNOSTIC_ID,
        questionWithImage,
        historyContext
      ),
      callAssistant(
        ASSISTANT_ORDONNANCE_ID,
        questionWithImage,
        historyContext
      ),
    ]);

    console.log("✅ Assistants ont répondu");

    // 6️⃣ Formater les réponses JSON en Markdown lisible
    const formattedDiagnostic = formatJsonToMarkdown(diagnosticResponse);
    const formattedOrdonnance = formatJsonToMarkdown(ordonnanceResponse);

    // 7️⃣ Combiner les réponses de manière intelligente
    let combinedReply = "";

    // Vérifier si les réponses sont substantielles
    const hasDiagnostic = formattedDiagnostic && formattedDiagnostic.length > 50;
    const hasOrdonnance = formattedOrdonnance && formattedOrdonnance.length > 50;

    if (hasDiagnostic && hasOrdonnance) {
      // Les deux assistants ont répondu - combiner
      combinedReply = `## 🔬 Analyse Diagnostique\n\n${formattedDiagnostic}\n\n---\n\n## 💊 Recommandations Thérapeutiques\n\n${formattedOrdonnance}`;
    } else if (hasDiagnostic) {
      combinedReply = `## 🔬 Analyse Diagnostique\n\n${formattedDiagnostic}`;
    } else if (hasOrdonnance) {
      combinedReply = `## 💊 Recommandations Thérapeutiques\n\n${formattedOrdonnance}`;
    } else {
      // Fallback si les deux sont vides
      combinedReply = "Je n'ai pas pu générer une réponse complète. Pouvez-vous reformuler votre question ?";
    }

    // 8️⃣ Nettoyer les annotations
    combinedReply = removeAnnotations(combinedReply);

    // 9️⃣ Sauvegarder la réponse (SKIP si SKIP_DB)
    if (!SKIP_DB) {
      await prisma.message.create({
        data: { chatId: currentChatId, role: "assistant", content: combinedReply },
      });

      await prisma.chat.update({
        where: { id: currentChatId },
        data: { updatedAt: new Date() },
      });
    }

    // 🔟 Retourner
    return NextResponse.json({
      reply: combinedReply,
      chatId: currentChatId,
      chatTitle: chatRecord?.title,
      created: isNewChat,
      sources: {
        diagnostic: hasDiagnostic,
        ordonnance: hasOrdonnance,
        vision: hasImage,
      },
    });

  } catch (e: any) {
    console.error("❌ Erreur API Chat:", e);
    return NextResponse.json({ error: e?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

// ============================================================
// GET - Historique & conversations
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Mode sans DB - retourner des données vides
    if (SKIP_DB) {
      return NextResponse.json({
        chats: [],
        activeChatId: null,
        activeChatTitle: null,
        messages: [],
        skipDb: true,
      });
    }

    const { searchParams } = new URL(req.url);
    const requestedChatId = searchParams.get("chatId");

    if (requestedChatId) {
      const chat = await prisma.chat.findUnique({
        where: { id: requestedChatId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      });

      if (!chat || chat.userId !== session.user.id) {
        return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
      }

      return NextResponse.json({
        chat: {
          id: chat.id,
          title: chat.title,
          updatedAt: chat.updatedAt.toISOString(),
        },
        messages: chat.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        })),
      });
    }

    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true },
    });

    const activeChat = chats[0];
    let messagesData: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }> = [];

    if (activeChat) {
      const historyMessages = await prisma.message.findMany({
        where: { chatId: activeChat.id },
        orderBy: { createdAt: "asc" },
      });

      messagesData = historyMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      }));
    }

    return NextResponse.json({
      chats: chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        updatedAt: chat.updatedAt.toISOString(),
      })),
      activeChatId: activeChat?.id ?? null,
      activeChatTitle: activeChat?.title ?? null,
      messages: messagesData,
    });
  } catch (e: any) {
    console.error("Erreur récupération historique:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
