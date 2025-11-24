"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function loadPanel(panelId: string) {
  // TODO: Load panel from database with biomarkers
  return null;
}

export async function calculateIndexes(
  biomarkers: Record<string, number | null>
) {
  // TODO: Use lib/bdf/indexes/calculateIndex to compute all indexes
  return [];
}

export async function saveBdfResults(
  consultationId: string,
  results: Array<{
    biomarkerCode: string;
    value: number;
    unit?: string;
    referenceMin?: number;
    referenceMax?: number;
  }>
) {
  // TODO: Save BdfResult records to database
  return { success: true };
}

export async function saveBdfIndexResults(
  consultationId: string,
  indexResults: Array<{
    indexCode: string;
    value: number | null;
    category?: string;
    subCategory?: string;
    details?: Record<string, any>;
  }>
) {
  // TODO: Save BdfIndexResult records to database
  return { success: true };
}

export async function saveBdfForConsultation(
  consultationId: string,
  panelCode: string,
  biomarkers: Record<string, number | null>,
  indexResults: Record<string, number | null>
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      // 1) Supprimer les anciens résultats pour cette consultation
      await tx.bdfResult.deleteMany({
        where: { consultationId },
      });

      await tx.bdfIndexResult.deleteMany({
        where: { consultationId },
      });

      // 2) Insérer les nouveaux biomarqueurs (filtrer les valeurs non nulles)
      const biomarkerEntries = Object.entries(biomarkers).filter(
        ([_, value]) => value !== null
      ) as Array<[string, number]>;

      if (biomarkerEntries.length > 0) {
        await tx.bdfResult.createMany({
          data: biomarkerEntries.map(([code, value]) => ({
            consultationId,
            biomarkerCode: code,
            value: new Prisma.Decimal(value),
          })),
        });
      }

      // 3) Insérer les index calculés (garder même les valeurs null pour traçabilité)
      const indexEntries = Object.entries(indexResults);

      if (indexEntries.length > 0) {
        await tx.bdfIndexResult.createMany({
          data: indexEntries.map(([code, value]) => ({
            consultationId,
            indexCode: code,
            value: value !== null ? new Prisma.Decimal(value) : null,
          })),
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde BdF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
