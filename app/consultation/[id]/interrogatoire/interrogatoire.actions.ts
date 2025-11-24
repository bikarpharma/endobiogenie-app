"use server";

import { prisma } from "@/lib/prisma";

interface SaveInterrogatoireSummaryParams {
  consultationId: string;
  summary: any;
}

export async function saveInterrogatoireSummary({
  consultationId,
  summary,
}: SaveInterrogatoireSummaryParams): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      // TODO: Vérifier si la table InterrogatoireSummary existe dans le schema Prisma
      // Si non, ajouter au schema.prisma :
      // model InterrogatoireSummary {
      //   id             String   @id @default(cuid())
      //   consultationId String   @unique
      //   data           Json
      //   consultation   Consultation @relation(fields: [consultationId], references: [id], onDelete: Cascade)
      //   createdAt      DateTime @default(now())
      //   updatedAt      DateTime @updatedAt
      //   @@map("interrogatoire_summaries")
      // }

      // 1) Supprimer les anciennes synthèses pour cette consultation
      await tx.interrogatoireSummary.deleteMany({
        where: { consultationId },
      });

      // 2) Créer la nouvelle synthèse
      await tx.interrogatoireSummary.create({
        data: {
          consultationId,
          data: summary,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la synthèse interrogatoire:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
