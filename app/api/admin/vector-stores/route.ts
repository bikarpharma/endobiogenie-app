// ========================================
// API ADMIN - Vector Stores
// ========================================
// 📖 Explication simple :
// - GET : Liste tous les Vector Stores
// - POST : Crée un nouveau Vector Store

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Lister tous les Vector Stores
export async function GET() {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Récupérer la liste des Vector Stores
    const vectorStores = await openai.beta.vectorStores.list();

    return NextResponse.json({
      vectorStores: vectorStores.data,
    });
  } catch (e: any) {
    console.error("Erreur liste Vector Stores:", e);
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Créer un nouveau Vector Store
export async function POST(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nom requis" },
        { status: 400 }
      );
    }

    // Créer le Vector Store
    const vectorStore = await openai.beta.vectorStores.create({
      name,
    });

    return NextResponse.json({
      vectorStore,
      message: "Vector Store créé avec succès",
    });
  } catch (e: any) {
    console.error("Erreur création Vector Store:", e);
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
