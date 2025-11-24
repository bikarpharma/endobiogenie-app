"use server";

import { prisma } from "@/lib/prisma";

export async function loadInterrogatoireSummary(consultationId: string) {
  try {
    // TODO: Vérifier que la table InterrogatoireSummary existe dans le schema Prisma
    const summary = await prisma.interrogatoireSummary.findUnique({
      where: { consultationId },
    });

    if (!summary) {
      return null;
    }

    return summary.data;
  } catch (error) {
    console.error("Erreur lors du chargement de la synthèse interrogatoire:", error);
    return null;
  }
}
