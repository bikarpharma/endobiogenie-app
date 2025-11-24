"use client";

import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState, useTransition } from "react";
import { BdfPanelSelector } from "./BdfPanelSelector";
import { BdfBiomarkerGrid } from "./BdfBiomarkerGrid";
import { BdfIndexGrid } from "./BdfIndexGrid";
import {
  useBdfBiomarkers,
  useBdfStore,
  useCalculateIndexesForPanel,
} from "./bdf.hooks";
import { saveBdfForConsultation } from "./bdf.actions";

interface BdfFormProps {
  consultationId: string;
}

interface BdfFormData {
  panelId: string;
  biomarkers: Record<string, number | null>;
}

export function BdfForm({ consultationId }: BdfFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const form = useForm<BdfFormData>({
    defaultValues: {
      panelId: "",
      biomarkers: {},
    },
  });

  const { control, handleSubmit } = form;
  const panelId = useWatch({ control, name: "panelId" });
  const biomarkersValues = useWatch({ control, name: "biomarkers" });

  const { biomarkers } = useBdfBiomarkers(panelId);
  const { setBiomarker, setIndexResults, indexResults } = useBdfStore();
  const calculateIndexes = useCalculateIndexesForPanel(panelId);

  // Synchroniser RHF → Zustand et calculer les index
  useEffect(() => {
    if (!biomarkersValues || !panelId) return;

    // Mettre à jour Zustand pour chaque biomarqueur
    Object.entries(biomarkersValues).forEach(([code, value]) => {
      if (value !== undefined) {
        setBiomarker(code, value);
      }
    });

    // Calculer les index automatiquement
    const results = calculateIndexes(biomarkersValues);
    setIndexResults(results);
  }, [biomarkersValues, panelId, setBiomarker, setIndexResults, calculateIndexes]);

  const onSave = async (data: BdfFormData) => {
    setSaveStatus({ type: null, message: "" });

    startTransition(async () => {
      const result = await saveBdfForConsultation(
        consultationId,
        data.panelId,
        data.biomarkers,
        indexResults
      );

      if (result.success) {
        setSaveStatus({
          type: "success",
          message: "BdF enregistrée avec succès",
        });
      } else {
        setSaveStatus({
          type: "error",
          message: result.error || "Erreur lors de l'enregistrement",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <BdfPanelSelector control={control} />
      <BdfBiomarkerGrid biomarkers={biomarkers} control={control} />
      <BdfIndexGrid />

      {saveStatus.type && (
        <div
          className={`p-4 rounded-xl ${
            saveStatus.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending || !panelId}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
