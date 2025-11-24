"use client";

import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState, useTransition } from "react";
import { BdfPanelSelector } from "../consultation/[id]/bdf/BdfPanelSelector";
import { BdfBiomarkerGrid } from "../consultation/[id]/bdf/BdfBiomarkerGrid";
import { BdfIndexGrid } from "../consultation/[id]/bdf/BdfIndexGrid";
import {
  useBdfBiomarkers,
  useBdfStore,
  useCalculateIndexesForPanel,
} from "../consultation/[id]/bdf/bdf.hooks";

interface BdfFormStandaloneProps {
  userId?: string;
  patientId?: string;
}

interface BdfFormData {
  panelId: string;
  biomarkers: Record<string, number | null>;
}

export function BdfFormStandalone({ userId, patientId }: BdfFormStandaloneProps) {
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
      // Pour la version standalone, on affiche juste un message de succès
      // car il n'y a pas de consultation associée
      setSaveStatus({
        type: "success",
        message: "Analyse BdF effectuée avec succès. Les résultats sont affichés ci-dessous.",
      });
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

      <div className="flex gap-4 flex-wrap">
        <button
          type="submit"
          disabled={isPending || !panelId}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Analyse en cours..." : "Analyser"}
        </button>

        {panelId && Object.keys(biomarkersValues || {}).length > 0 && (
          <button
            type="button"
            onClick={() => {
              // Afficher synthèse BDF inline
              const synthese = document.getElementById('bdf-synthese-inline');
              if (synthese) {
                synthese.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            📊 Voir la Synthèse BDF Complète
          </button>
        )}
      </div>

      {/* Synthèse BDF Inline */}
      {panelId && indexResults && Object.keys(indexResults).length > 0 && (
        <div id="bdf-synthese-inline" className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
          <h2 className="text-xl font-bold text-purple-900 mb-4">📊 Synthèse BdF Complète</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(indexResults).map(([indexId, value]) => {
              if (value === null) return null;

              return (
                <div key={indexId} className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                  <div className="text-sm font-semibold text-gray-700 mb-1">
                    {indexId.replace(/idx_|_/g, ' ').toUpperCase()}
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {value.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Interprétation</h3>
            <p className="text-sm text-gray-700">
              Les index sont calculés automatiquement à partir des biomarqueurs saisis.
              Consultez votre praticien pour une interprétation personnalisée.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
