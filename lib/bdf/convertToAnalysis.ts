// ========================================
// CONVERSION - InterpretationPayload vers BdfAnalysis
// ========================================
// Convertit le format de l'API BdF existante vers le format partagé

import type { InterpretationPayload, LabValues } from "./types";
import type { BdfAnalysis, BdfIndex, BdfInputs } from "@/types/bdf";

/**
 * Convertit InterpretationPayload (API) vers BdfAnalysis (format partagé)
 */
export function convertToBdfAnalysis(
  payload: InterpretationPayload,
  inputs: LabValues
): BdfAnalysis {
  // Conversion des inputs
  const bdfInputs: BdfInputs = {
    GR: inputs.GR,
    GB: inputs.GB,
    hemoglobine: inputs.hemoglobine,
    neutrophiles: inputs.neutrophiles,
    lymphocytes: inputs.lymphocytes,
    eosinophiles: inputs.eosinophiles,
    monocytes: inputs.monocytes,
    plaquettes: inputs.plaquettes,
    LDH: inputs.LDH,
    CPK: inputs.CPK,
    PAOi: inputs.PAOi,
    osteocalcine: inputs.osteocalcine,
    TSH: inputs.TSH,
    VS: inputs.VS,
    calcium: inputs.calcium,
    potassium: inputs.potassium,
  };

  // Conversion des 8 index
  const indexes: BdfIndex[] = [
    {
      key: "indexGenital",
      label: "Index génital",
      value: payload.indexes.indexGenital.value ?? undefined,
      status: payload.indexes.indexGenital.value !== null ? "ok" : "na",
      note: payload.indexes.indexGenital.comment,
    },
    {
      key: "indexThyroidien",
      label: "Index thyroïdien",
      value: payload.indexes.indexThyroidien.value ?? undefined,
      status: payload.indexes.indexThyroidien.value !== null ? "ok" : "na",
      note: payload.indexes.indexThyroidien.comment,
    },
    {
      key: "gT",
      label: "g/T (génito-thyroïdien)",
      value: payload.indexes.gT.value ?? undefined,
      status: payload.indexes.gT.value !== null ? "ok" : "na",
      note: payload.indexes.gT.comment,
    },
    {
      key: "indexAdaptation",
      label: "Index adaptation",
      value: payload.indexes.indexAdaptation.value ?? undefined,
      status: payload.indexes.indexAdaptation.value !== null ? "ok" : "na",
      note: payload.indexes.indexAdaptation.comment,
    },
    {
      key: "indexOestrogenique",
      label: "Index œstrogénique",
      value: payload.indexes.indexOestrogenique.value ?? undefined,
      status: payload.indexes.indexOestrogenique.value !== null ? "ok" : "na",
      note: payload.indexes.indexOestrogenique.comment,
    },
    {
      key: "turnover",
      label: "Turnover tissulaire",
      value: payload.indexes.turnover.value ?? undefined,
      status: payload.indexes.turnover.value !== null ? "ok" : "na",
      note: payload.indexes.turnover.comment,
    },
    {
      key: "rendementThyroidien",
      label: "Rendement thyroïdien",
      value: payload.indexes.rendementThyroidien.value ?? undefined,
      status: payload.indexes.rendementThyroidien.value !== null ? "ok" : "na",
      note: payload.indexes.rendementThyroidien.comment,
    },
    {
      key: "remodelageOsseux",
      label: "Remodelage osseux",
      value: payload.indexes.remodelageOsseux.value ?? undefined,
      status: payload.indexes.remodelageOsseux.value !== null ? "ok" : "na",
      note: payload.indexes.remodelageOsseux.comment,
    },
  ];

  return {
    inputs: bdfInputs,
    indexes,
    summary: payload.summary,
    axes: payload.axesDominants,
  };
}
