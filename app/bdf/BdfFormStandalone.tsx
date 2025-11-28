"use client";

import BdfInputForm from "@/components/bdf/BdfInputForm";

interface BdfFormStandaloneProps {
  userId?: string;
  patientId?: string;
}

export function BdfFormStandalone({ userId, patientId }: BdfFormStandaloneProps) {
  return <BdfInputForm patientId={patientId} />;
}
