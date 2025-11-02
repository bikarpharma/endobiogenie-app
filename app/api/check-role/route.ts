// API pour forcer le rafraîchissement du rôle
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  // Récupérer le rôle actuel depuis la base
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    email: user.email,
    roleInDatabase: user.role,
    roleInSession: session.user.role,
    match: user.role === session.user.role,
  });
}
