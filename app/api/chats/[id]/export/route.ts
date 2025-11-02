// ========================================
// API EXPORT PDF - /api/chats/[id]/export
// ========================================
// 📖 Explication simple :
// Cette route génère un PDF de la conversation et le télécharge.
// - Vérifie que l'utilisateur est connecté et propriétaire
// - Récupère tous les messages de la conversation
// - Génère un PDF avec @react-pdf/renderer
// - Retourne le PDF en téléchargement

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ChatPDFDocument } from "@/lib/pdf/ChatPDFDocument";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1️⃣ Vérifier l'authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2️⃣ Récupérer le chatId
    const { id: chatId } = await params;

    // 3️⃣ Récupérer le chat avec tous ses messages
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // 4️⃣ Vérifications de sécurité
    if (!chat) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    if (chat.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // 5️⃣ Générer le PDF
    const exportDate = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const pdfBuffer = await renderToBuffer(
      ChatPDFDocument({
        chatTitle: chat.title,
        messages: chat.messages,
        exportDate,
      })
    );

    // 6️⃣ Générer un nom de fichier propre
    const sanitizedTitle = chat.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()
      .slice(0, 50);
    const filename = `conversation_${sanitizedTitle}_${Date.now()}.pdf`;

    // 7️⃣ Retourner le PDF en téléchargement
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: any) {
    console.error("Erreur export PDF:", e);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
