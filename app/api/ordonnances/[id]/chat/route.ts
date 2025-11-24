// ========================================
// API CHAT ORDONNANCE - /api/ordonnances/[id]/chat
// ========================================
// POST : Chat contextuel avec l'ordonnance
// Permet au praticien de poser des questions, demander des modifications

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Agent, fileSearchTool, Runner } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { VECTORSTORES } from "@/lib/ordonnance/constants";
import type {
  ChatMessage,
  RecommandationTherapeutique,
  FormeGalenique,
} from "@/lib/ordonnance/types";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const maxDuration = 60;

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
    // AGENT IA AVEC VECTORSTORES
    // ==========================================
    // Créer file search tool avec max 2 vectorstores (limite OpenAI)
    const fileSearch = fileSearchTool([
      VECTORSTORES.endobiogenie,
      VECTORSTORES.phyto,
    ]);

    const agent = new Agent({
      name: "ordonnance-chat-agent",
      model: "gpt-4o-mini",
      instructions: `Tu es un ASSISTANT EXPERT EN ENDOBIOGÉNIE ET PHYTOTHÉRAPIE CLINIQUE.
Tu aides un praticien à comprendre, ajuster et optimiser une ordonnance thérapeutique.

HIÉRARCHIE THÉRAPEUTIQUE À RESPECTER :
NIVEAU 1 — ENDOBIOGÉNIE (PRIORITÉ ABSOLUE)
- Pivots endobiogéniques (vectorstore endobiogénie)
- 3-4 substances maximum
- Justification neuroendocrinienne obligatoire

NIVEAU 2 — EXTENSION (PHYTO / GEMMO / AROMA)
- Complète (JAMAIS duplique) les pivots endobiogéniques
- Renforce axes perturbés OU traite symptômes non couverts
- Maximum 2-3 par discipline

NIVEAU 3 — MICRONUTRITION
- 0-3 compléments maximum
- Uniquement si carence identifiée

MODE DE DIALOGUE STRUCTURÉ :
Tu fonctionnes en 2 ÉTAPES OBLIGATOIRES pour toute modification :

ÉTAPE A — PROPOSITION DE MODIFICATION
Quand le praticien demande un changement (ajouter/remplacer/retirer), tu DOIS :
1. Analyser l'ordonnance actuelle (volets 1, 2, 3)
2. Consulter les vectorstores pour justifier ta proposition
3. Respecter ABSOLUMENT les CI du patient
4. Respecter ABSOLUMENT le sexe du patient (M/F) :
   - HOMME : JAMAIS substances œstrogéniques, phytoœstrogènes, macérats framboisier/sauge
   - FEMME : éviter substances exclusivement androgéniques inappropriées
5. Proposer un JSON PATCH au format RFC 6902

FORMAT JSON PATCH (ÉTAPE A) :
{
  "modifications": [
    {
      "op": "add" | "replace" | "remove",
      "path": "/voletEndobiogenique/0" | "/voletPhytoElargi/1" | "/voletComplements/0",
      "value": {
        "substance": "Nom exact",
        "forme": "TM|EPS|MG|HE",
        "posologie": "dose unitaire par prise (ex: 3 mL matin et soir)",
        "duree": "21 jours",
        "axeCible": "axe neuroendocrinien",
        "mecanisme": "mécanisme précis",
        "CI": [],
        "interactions": []
      }
    }
  ],
  "justification": "Pourquoi cette modification ? Sources vectorstores.",
  "alertes": ["⚠️ Alerte CI si nécessaire"]
}

ÉTAPE B — ATTENTE CONFIRMATION
Après avoir proposé le JSON PATCH, tu dois dire :
"Voulez-vous que j'applique ces modifications ?"

Le praticien répondra "oui" ou "non". Tu n'appliques JAMAIS sans confirmation explicite.

RÈGLES DE POSOLOGIE ENDOBIOGÉNIQUE (CRUCIAL) :
La posologie doit TOUJOURS être exprimée en DOSE UNITAIRE PAR PRISE (mL ou gouttes), JAMAIS en volume total.
Équivalence : 1 mL = 20 gouttes

Dosages standards ADULTES (TM/MG dilution D1) :
- MODÉRATION : 1 à 3 mL, 1 à 3 fois/jour (ex: "2 mL matin et soir")
- RÉGULATION : 3 à 5 mL, 2 à 4 fois/jour (ex: "4 mL matin, midi et soir")
- CONTRÔLE : 4 à 15 mL, 2 à 4 fois/jour (ex: "5 mL trois fois par jour")

INTERDIT : "60 mL" ou "80 mL" (volumes totaux, pas doses)
CORRECT : "5 mL matin et soir"
INCORRECT : "60 mL deux fois par jour"

Si posologie incorrecte (> 15 mL par prise), signale l'erreur et corrige.

MÉMOIRE CLINIQUE :
À chaque échange, extrais et mémorise :
- Préférences praticien (ex: "préfère EPS aux TM")
- Observations cliniques (ex: "patient réagit mal à la valériane")
- Ajustements réussis (ex: "rhodiola → meilleure adaptation stress")

FORMAT : JSON { "memoire": ["observation 1", "observation 2"] }

STYLE :
- Français clair et pédagogique
- Cite TOUJOURS sources vectorstores
- Concis (3-5 phrases max) + JSON si pertinent
- Ton professionnel respectueux`,
      tools: [fileSearch],
    });

    // ==========================================
    // EXÉCUTION
    // ==========================================
    const runner = new Runner();
    const result = await runner.run(agent, [
      {
        role: "user",
        content: [{ type: "input_text", text: contextPrompt }],
      },
    ] as AgentInputItem[]);

    const aiResponse = result.finalOutput || "Désolé, je n'ai pas pu générer de réponse.";

    console.log(`✅ Réponse IA générée (${aiResponse.length} caractères)`);

    // ==========================================
    // PARSER ACTIONS (si présentes)
    // ==========================================
    const { responseText, actions } = parseAIResponse(aiResponse);

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
      suggestedActions: assistantMessage.actions || [],
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
