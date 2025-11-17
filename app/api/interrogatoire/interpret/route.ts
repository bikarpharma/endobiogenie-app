// ========================================
// API INTERPRÉTATION DES AXES CLINIQUES
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import OpenAI from "openai";
import {
  AxeType,
  InterpretationRequest,
  InterpretationResponse,
} from "@/lib/interrogatoire/axeInterpretation";
import {
  SYSTEM_PROMPT_INTERPRETATION,
  generateUserPrompt,
} from "@/lib/interrogatoire/prompts";
import { retrieveEndobiogenieContext } from "@/lib/chatbot/vectorStoreRetrieval";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Schéma de validation pour la requête
 */
const InterpretRequestSchema = z.object({
  patientId: z.string().cuid(),
  axe: z.enum([
    "neurovegetatif",
    "adaptatif",
    "thyroidien",
    "gonadique",
    "digestif",
    "immuno",
    "rythmes",
    "axesdevie",
  ]),
  reponsesAxe: z.record(z.any()),
  sexe: z.enum(["H", "F"]),
  age: z.number().optional(),
  antecedents: z.string().optional(),
  traitements: z.string().optional(),
  contreindicationsMajeures: z.array(z.string()).optional(),
});

/**
 * Schéma de validation pour la réponse de l'IA
 */
const InterpretResponseSchema = z.object({
  orientation: z.string(),
  mecanismes: z.array(z.string()),
  prudences: z.array(z.string()),
  modulateurs: z.array(z.string()),
  resumeClinique: z.string(),
  confiance: z.number().min(0).max(1),
});

/**
 * POST /api/interrogatoire/interpret
 *
 * Interprète un axe clinique avec l'IA + RAG endobiogénie
 * Stocke le résultat dans la table AxeInterpretation
 *
 * Body: InterpretationRequest
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 2. Validation du body
    const body = await req.json();
    const validatedData = InterpretRequestSchema.parse(body);

    const {
      patientId,
      axe,
      reponsesAxe,
      sexe,
      age,
      antecedents,
      traitements,
      contreindicationsMajeures,
    } = validatedData;

    // 3. Vérifier que le patient existe et appartient à l'utilisateur
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        userId: true,
        nom: true,
        prenom: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient introuvable" },
        { status: 404 }
      );
    }

    if (patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé à ce patient" },
        { status: 403 }
      );
    }

    // 4. Récupérer le contexte RAG endobiogénie
    console.log(`🔍 [Interpret ${axe}] Récupération contexte RAG...`);
    const ragQuery = `Analyse de l'axe ${axe} en endobiogénie : ${JSON.stringify(reponsesAxe).substring(0, 200)}`;
    let ragContext = "";

    try {
      const ragPassages = await retrieveEndobiogenieContext(ragQuery);
      ragContext = ragPassages.join("\n\n");
      console.log(`✅ [Interpret ${axe}] Contexte RAG récupéré (${ragPassages.length} passages)`);
    } catch (error) {
      console.warn(`⚠️ [Interpret ${axe}] RAG non disponible, continuer sans contexte`);
    }

    // 5. Construire le prompt utilisateur
    const userPrompt = generateUserPrompt(
      axe,
      reponsesAxe,
      {
        sexe,
        age,
        antecedents,
        traitements,
        contreindicationsMajeures,
      },
      ragContext
    );

    // 6. Appeler OpenAI pour l'interprétation
    console.log(`🤖 [Interpret ${axe}] Appel OpenAI GPT-4...`);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_INTERPRETATION },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) {
      throw new Error("Aucune réponse de l'IA");
    }

    // 7. Parser et valider la réponse JSON
    const parsedResponse = JSON.parse(rawResponse);
    const interpretation: InterpretationResponse =
      InterpretResponseSchema.parse(parsedResponse);

    console.log(`✅ [Interpret ${axe}] Interprétation générée avec confiance ${interpretation.confiance}`);

    // 8. Sauvegarder dans la base (upsert pour gérer les mises à jour)
    const savedInterpretation = await prisma.axeInterpretation.upsert({
      where: {
        patientId_axe: {
          patientId,
          axe,
        },
      },
      update: {
        orientation: interpretation.orientation,
        mecanismes: interpretation.mecanismes,
        prudences: interpretation.prudences,
        modulateurs: interpretation.modulateurs,
        resumeClinique: interpretation.resumeClinique,
        confiance: interpretation.confiance,
        updatedAt: new Date(),
      },
      create: {
        patientId,
        axe,
        orientation: interpretation.orientation,
        mecanismes: interpretation.mecanismes,
        prudences: interpretation.prudences,
        modulateurs: interpretation.modulateurs,
        resumeClinique: interpretation.resumeClinique,
        confiance: interpretation.confiance,
      },
    });

    console.log(`💾 [Interpret ${axe}] Sauvegardé en base : ${savedInterpretation.id}`);

    // 9. Retourner le résultat
    return NextResponse.json({
      success: true,
      interpretation: {
        id: savedInterpretation.id,
        patientId: savedInterpretation.patientId,
        axe: savedInterpretation.axe,
        orientation: savedInterpretation.orientation,
        mecanismes: savedInterpretation.mecanismes as string[],
        prudences: savedInterpretation.prudences as string[],
        modulateurs: savedInterpretation.modulateurs as string[],
        resumeClinique: savedInterpretation.resumeClinique,
        confiance: savedInterpretation.confiance,
        createdAt: savedInterpretation.createdAt.toISOString(),
        updatedAt: savedInterpretation.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ [API /interrogatoire/interpret] Erreur:", error);

    // Erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Erreur JSON parsing
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Réponse IA invalide",
          message: "L'IA n'a pas retourné un JSON valide",
        },
        { status: 500 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      {
        error: "Erreur lors de l'interprétation de l'axe",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/interrogatoire/interpret?patientId=xxx&axe=neurovegetatif
 *
 * Récupère l'interprétation stockée pour un axe d'un patient
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 2. Récupérer les paramètres
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const axe = searchParams.get("axe") as AxeType | null;

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId manquant" },
        { status: 400 }
      );
    }

    // 3. Vérifier que le patient appartient à l'utilisateur
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, userId: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient introuvable" },
        { status: 404 }
      );
    }

    if (patient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // 4. Récupérer l'interprétation (ou toutes si axe non spécifié)
    if (axe) {
      // Récupérer une interprétation spécifique
      const interpretation = await prisma.axeInterpretation.findUnique({
        where: {
          patientId_axe: {
            patientId,
            axe,
          },
        },
      });

      if (!interpretation) {
        return NextResponse.json(
          { error: "Interprétation non trouvée" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        interpretation: {
          id: interpretation.id,
          patientId: interpretation.patientId,
          axe: interpretation.axe,
          orientation: interpretation.orientation,
          mecanismes: interpretation.mecanismes as string[],
          prudences: interpretation.prudences as string[],
          modulateurs: interpretation.modulateurs as string[],
          resumeClinique: interpretation.resumeClinique,
          confiance: interpretation.confiance,
          createdAt: interpretation.createdAt.toISOString(),
          updatedAt: interpretation.updatedAt.toISOString(),
        },
      });
    } else {
      // Récupérer toutes les interprétations du patient
      const interpretations = await prisma.axeInterpretation.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        interpretations: interpretations.map((i) => ({
          id: i.id,
          patientId: i.patientId,
          axe: i.axe,
          orientation: i.orientation,
          mecanismes: i.mecanismes as string[],
          prudences: i.prudences as string[],
          modulateurs: i.modulateurs as string[],
          resumeClinique: i.resumeClinique,
          confiance: i.confiance,
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        })),
      });
    }
  } catch (error: any) {
    console.error("❌ [API GET /interrogatoire/interpret] Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de l'interprétation",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
