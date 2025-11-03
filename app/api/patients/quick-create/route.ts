// ========================================
// API QUICK CREATE PATIENT - /api/patients/quick-create
// ========================================
// POST : Créer rapidement un patient (Nom + Prénom seulement)
// Retourne l'ID du patient créé

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateNumeroPatient } from "@/types/patient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { nom, prenom } = await req.json();

    // Validation
    if (!nom ||!prenom || typeof nom !== "string" || typeof prenom !== "string") {
      return NextResponse.json(
        { error: "Nom et prénom requis" },
        { status: 400 }
      );
    }

    // Trim
    const nomClean = nom.trim();
    const prenomClean = prenom.trim();

    if (nomClean.length === 0 || prenomClean.length === 0) {
      return NextResponse.json(
        { error: "Nom et prénom ne peuvent pas être vides" },
        { status: 400 }
      );
    }

    // Générer le numéro patient avec gestion des collisions
    let numeroPatient: string;
    let patient;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        // Récupérer le dernier numéro patient pour cet utilisateur
        const lastPatient = await prisma.patient.findFirst({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          select: { numeroPatient: true },
        });

        // Générer le numéro (avec offset pour éviter les collisions)
        const baseNumber = lastPatient?.numeroPatient || "PAT-000";
        numeroPatient = generateNumeroPatient(baseNumber);

        // Si ce n'est pas la première tentative, ajouter un suffix
        if (attempts > 0) {
          const parts = numeroPatient.split("-");
          const num = parseInt(parts[1]) + attempts;
          numeroPatient = `PAT-${num.toString().padStart(3, "0")}`;
        }

        // Créer le patient
        patient = await prisma.patient.create({
          data: {
            userId: session.user.id,
            numeroPatient,
            nom: nomClean,
            prenom: prenomClean,
            dateNaissance: null,
            sexe: null,
            telephone: null,
            email: null,
            notes: null,
            consentementRGPD: false,
            dateConsentement: null,
            isArchived: false,
            archivedAt: null,
          },
        });

        // Succès - sortir de la boucle
        break;
      } catch (e: any) {
        // Si c'est une erreur de contrainte unique, réessayer
        if (e.code === "P2002" && attempts < maxAttempts - 1) {
          attempts++;
          console.log(`Collision numéro patient, tentative ${attempts + 1}/${maxAttempts}`);
          continue;
        }
        // Sinon, propager l'erreur
        throw e;
      }
    }

    if (!patient) {
      throw new Error("Impossible de créer le patient après plusieurs tentatives");
    }

    return NextResponse.json({
      id: patient.id,
      numeroPatient: patient.numeroPatient,
      nom: patient.nom,
      prenom: patient.prenom,
    });
  } catch (e: any) {
    console.error("Erreur création patient rapide:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}
