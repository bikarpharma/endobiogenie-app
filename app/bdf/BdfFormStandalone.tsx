"use client";

import BdfInputForm from "@/components/bdf/BdfInputForm";

interface BdfFormStandaloneProps {
  userId?: string;
  patientId?: string;
  initialValues?: Record<string, number | null>;
  editMode?: boolean;
  analysisId?: string;
}

export function BdfFormStandalone({
  userId,
  patientId,
  initialValues,
  editMode,
  analysisId,
}: BdfFormStandaloneProps) {
  return (
    <BdfInputForm
      patientId={patientId}
      initialValues={initialValues}
      editMode={editMode}
      analysisId={analysisId}
    />
  );
}
