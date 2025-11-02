// ========================================
// ROUTE API INSCRIPTION - /api/auth/register
// ========================================
// 📖 Explication simple :
// Cette route permet de créer un nouveau compte utilisateur.
// Étapes :
// 1. Vérifier que l'email n'existe pas déjà
// 2. Crypter le mot de passe avec bcrypt
// 3. Créer l'utilisateur dans la base de données

import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

// Validation des données d'inscription
const registerSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
});

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Récupérer les données envoyées par le formulaire
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    // Si les données sont invalides
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // 2️⃣ Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // 3️⃣ Crypter le mot de passe (bcrypt avec 12 rounds)
    const hashedPassword = await hash(password, 12);

    // 4️⃣ Créer l'utilisateur dans la base de données
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Le rôle par défaut est USER (défini dans le schema)
      },
      select: {
        id: true,
        name: true,
        email: true,
        // Ne jamais renvoyer le mot de passe !
      },
    });

    // 5️⃣ Répondre avec succès
    return NextResponse.json(
      { message: "Compte créé avec succès", user },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
