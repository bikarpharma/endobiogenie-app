// app/api/ordonnances/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { z } from "zod";
import { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";
import { FusedAxePerturbation } from "@/lib/ordonnance/fusionClinique";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Schéma de validation
 */
const ChatRequestSchema = z.object({
  ordonnanceId: z.string().cuid(),
  message: z.string().min(1),
});

/**
 * Prompt système pour le chat ordonnancier
 */
const PROMPT_SYSTEM_CHAT = `Tu es l'assistant clinique du module Ordonnance IA Endobiogénie.

Tu disposes de :
- l'ordonnance générée (3 volets : endobiogénique, phyto élargi, compléments)
- les axes fusionnés (interrogatoire + BdF + RAG)
- l'interrogatoire complet du patient
- les valeurs BdF
- les antécédents, traitements en cours, contre-indications
- les symptômes actuels
- l'historique de conversation

Ton rôle :
Répondre comme un expert en phytothérapie / gemmothérapie / endobiogénie.
Permettre au médecin d'ajuster l'ordonnance :
- changer forme galénique (EPS, TM, MG, gélule, etc.)
- changer posologie
- vérifier interactions médicamenteuses
- proposer alternatives thérapeutiques
- expliquer le raisonnement endobiogénique
- discuter des contre-indications
- adapter selon le contexte du patient

Règles strictes :
1. Respecter TOUJOURS les contre-indications du patient
2. Vérifier les interactions avec les traitements en cours
3. Justifier par le mécanisme neuroendocrinien (axe → substance → mécanisme)
4. Rester dans le champ de l'endobiogénie
5. Ne jamais recommander de substances incompatibles avec le sexe/âge
6. Être concis et précis dans les réponses
7. Si une modification est demandée, proposer une alternative cohérente avec les axes perturbés

Format de réponse :
- Réponse claire et structurée
- Justification endobiogénique si pertinent
- Alertes CI/interactions si nécessaire
- Proposition concrète d'ajustement si demandé`;

/**
 * POST /api/ordonnances/chat
 *
 * Chat contextuel pour ajuster une ordonnance
 *
 * Body:
 * {
 *   ordonnanceId: string,
 *   message: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Validation
    const body = await req.json();
    const { ordonnanceId, message } = ChatRequestSchema.parse(body);

    // 3. Charger l'ordonnance complète avec contexte
    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        chatHistory: {
          orderBy: { createdAt: "asc" },
          take: 20, // Limiter à 20 derniers messages
        },
      },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance introuvable" },
        { status: 404 }
      );
    }

    // 4. Vérifier autorisation
    if (ordonnance.patient.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // 5. Construire le contexte complet pour l'IA
    const patient = ordonnance.patient;
    const interrogatoire = patient.interrogatoire as InterrogatoireEndobiogenique | null;

    const contextMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: PROMPT_SYSTEM_CHAT,
      },
      {
        role: "system",
        content: `CONTEXTE PATIENT:
Nom: ${patient.nom} ${patient.prenom}
Sexe: ${patient.sexe || "non renseigné"}
Âge: ${patient.dateNaissance ? Math.floor((Date.now() - new Date(patient.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : "non renseigné"} ans

CONTRE-INDICATIONS MAJEURES:
${patient.contreindicationsMajeures ? JSON.stringify(patient.contreindicationsMajeures) : "Aucune"}

TRAITEMENTS EN COURS:
${patient.traitementActuel || "Aucun"}

ATCD MÉDICAUX:
${patient.atcdMedicaux || "Aucun"}

ALLERGIES:
${patient.allergies || "Aucune"}

SYMPTÔMES ACTUELS:
${patient.symptomesActuels ? JSON.stringify(patient.symptomesActuels) : "Non renseignés"}

PATHOLOGIES ASSOCIÉES:
${patient.pathologiesAssociees ? JSON.stringify(patient.pathologiesAssociees) : "Aucune"}`,
      },
      {
        role: "system",
        content: `ORDONNANCE ACTUELLE (3 volets):

VOLET 1 - ENDOBIOGÉNIQUE:
${JSON.stringify(ordonnance.voletEndobiogenique, null, 2)}

VOLET 2 - PHYTO/GEMMO/AROMA ÉLARGI:
${JSON.stringify(ordonnance.voletPhytoElargi, null, 2)}

VOLET 3 - MICRONUTRITION:
${JSON.stringify(ordonnance.voletComplements, null, 2)}

SYNTHÈSE CLINIQUE:
${ordonnance.syntheseClinique}

CONSEILS ASSOCIÉS:
${JSON.stringify(ordonnance.conseilsAssocies, null, 2)}`,
      },
    ];

    // 6. Ajouter l'historique de conversation
    if (ordonnance.chatHistory && ordonnance.chatHistory.length > 0) {
      ordonnance.chatHistory.forEach((msg) => {
        contextMessages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.message,
        });
      });
    }

    // 7. Ajouter le message actuel
    contextMessages.push({
      role: "user",
      content: message,
    });

    // 8. Appeler OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: contextMessages,
      temperature: 0.3,
      max_tokens: 1500,
    });

    const assistantResponse = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";

    // 9. Sauvegarder l'échange dans l'historique
    await prisma.ordonnanceChat.createMany({
      data: [
        {
          ordonnanceId: ordonnance.id,
          patientId: patient.id,
          role: "user",
          message,
        },
        {
          ordonnanceId: ordonnance.id,
          patientId: patient.id,
          role: "assistant",
          message: assistantResponse,
        },
      ],
    });

    // 10. Retourner la réponse
    return NextResponse.json({
      success: true,
      response: assistantResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("❌ [API /ordonnances/chat] Erreur:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur lors du chat",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ordonnances/chat?ordonnanceId=xxx
 *
 * Récupère l'historique de chat d'une ordonnance
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Récupérer ordonnanceId
    const { searchParams } = new URL(req.url);
    const ordonnanceId = searchParams.get("ordonnanceId");

    if (!ordonnanceId) {
      return NextResponse.json(
        { error: "ordonnanceId manquant" },
        { status: 400 }
      );
    }

    // 3. Charger l'historique
    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
      include: {
        patient: {
          include: { user: true },
        },
        chatHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance introuvable" },
        { status: 404 }
      );
    }

    if (ordonnance.patient.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // 4. Retourner l'historique
    return NextResponse.json({
      ordonnanceId: ordonnance.id,
      patientNom: `${ordonnance.patient.nom} ${ordonnance.patient.prenom}`,
      chatHistory: ordonnance.chatHistory.map((msg) => ({
        id: msg.id,
        role: msg.role,
        message: msg.message,
        createdAt: msg.createdAt,
      })),
    });

  } catch (error: any) {
    console.error("❌ [API GET /ordonnances/chat] Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de l'historique",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
