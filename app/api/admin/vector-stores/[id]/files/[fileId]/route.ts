// ========================================
// API ADMIN - Supprimer un fichier
// ========================================
// 📖 Explication simple :
// DELETE : Supprime un fichier d'un Vector Store

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Supprimer un fichier d'un Vector Store
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id: vectorStoreId, fileId } = await params;

    // Supprimer le fichier du Vector Store
    await openai.beta.vectorStores.files.del(vectorStoreId, fileId);

    return NextResponse.json({
      message: "Fichier supprimé avec succès",
    });
  } catch (e: any) {
    console.error("Erreur suppression fichier:", e);
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
