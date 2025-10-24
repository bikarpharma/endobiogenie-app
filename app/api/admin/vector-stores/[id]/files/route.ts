// ========================================
// API ADMIN - Fichiers d'un Vector Store
// ========================================
// 📖 Explication simple :
// - GET : Liste tous les fichiers d'un Vector Store
// - POST : Upload un fichier dans un Vector Store

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Lister tous les fichiers d'un Vector Store
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    // Récupérer la liste des fichiers
    const files = await openai.beta.vectorStores.files.list(id);

    return NextResponse.json({
      files: files.data,
    });
  } catch (e: any) {
    console.error("Erreur liste fichiers:", e);
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Upload un fichier dans un Vector Store
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id: vectorStoreId } = await params;

    // Récupérer le fichier depuis le FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Fichier requis" },
        { status: 400 }
      );
    }

    // 1️⃣ Uploader le fichier sur OpenAI
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: "assistants",
    });

    // 2️⃣ Ajouter le fichier au Vector Store
    await openai.beta.vectorStores.files.create(vectorStoreId, {
      file_id: uploadedFile.id,
    });

    return NextResponse.json({
      file: uploadedFile,
      message: "Fichier uploadé avec succès",
    });
  } catch (e: any) {
    console.error("Erreur upload fichier:", e);
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
