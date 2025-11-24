"use server";

import { prisma } from "@/lib/prisma";

interface BiomarkerResult {
  code: string;
  name: string;
  value: number;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
  category: string;
}

interface IndexResult {
  code: string;
  name: string;
  value: number | null;
  category: string;
  subCategory?: string;
  description?: string;
  formulaType?: string;
}

interface BdfData {
  panel: {
    code: string;
    name: string;
  } | null;
  biomarkers: BiomarkerResult[];
  indexes: IndexResult[];
}

export async function loadBdfForConsultation(
  consultationId: string
): Promise<BdfData> {
  const [bdfResults, bdfIndexResults, biomarkers, indexDefinitions] =
    await Promise.all([
      prisma.bdfResult.findMany({
        where: { consultationId },
        orderBy: { biomarkerCode: "asc" },
      }),
      prisma.bdfIndexResult.findMany({
        where: { consultationId },
        orderBy: { indexCode: "asc" },
      }),
      prisma.biomarker.findMany(),
      prisma.bdfIndexDefinition.findMany(),
    ]);

  const biomarkerMap = new Map(biomarkers.map((b) => [b.code, b]));
  const indexDefMap = new Map(indexDefinitions.map((i) => [i.code, i]));

  const biomarkerResults: BiomarkerResult[] = bdfResults.map((result) => {
    const biomarker = biomarkerMap.get(result.biomarkerCode);
    return {
      code: result.biomarkerCode,
      name: biomarker?.name || result.biomarkerCode,
      value: Number(result.value),
      unit: result.unit || biomarker?.unit || undefined,
      referenceMin: result.referenceMin
        ? Number(result.referenceMin)
        : biomarker?.referenceMin
        ? Number(biomarker.referenceMin)
        : undefined,
      referenceMax: result.referenceMax
        ? Number(result.referenceMax)
        : biomarker?.referenceMax
        ? Number(biomarker.referenceMax)
        : undefined,
      category: biomarker?.category || "unknown",
    };
  });

  const indexResults: IndexResult[] = bdfIndexResults.map((result) => {
    const indexDef = indexDefMap.get(result.indexCode);
    return {
      code: result.indexCode,
      name: indexDef?.name || result.indexCode,
      value: result.value ? Number(result.value) : null,
      category: result.category || indexDef?.category || "unknown",
      subCategory: result.subCategory || indexDef?.subCategory || undefined,
      description: indexDef?.description || undefined,
      formulaType: indexDef?.type || undefined,
    };
  });

  return {
    panel: null,
    biomarkers: biomarkerResults,
    indexes: indexResults,
  };
}
