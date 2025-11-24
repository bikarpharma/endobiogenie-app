"use client";

import { useState, useEffect, useCallback } from "react";
import { create } from "zustand";
import { INDEXES } from "@/lib/bdf/indexes/indexes.config";
import { PANELS } from "@/lib/bdf/panels/panels.config";
import { calculateIndex } from "@/lib/bdf/indexes/calculateIndex";

interface BiomarkerDefinition {
  code: string;
  name: string;
  unit?: string;
  category: string;
  referenceMin?: number;
  referenceMax?: number;
}

interface BdfStore {
  biomarkers: Record<string, number | null>;
  indexResults: Record<string, number | null>;
  setBiomarker: (code: string, value: number | null) => void;
  setIndexResults: (results: Record<string, number | null>) => void;
}

export const useBdfStore = create<BdfStore>((set) => ({
  biomarkers: {},
  indexResults: {},
  setBiomarker: (code, value) =>
    set((state) => ({
      biomarkers: { ...state.biomarkers, [code]: value },
    })),
  setIndexResults: (results) => set({ indexResults: results }),
}));

export function useBdfPanel(panelId: string) {
  const [panel, setPanel] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!panelId) return;

    // TODO: Fetch panel data
    setLoading(true);
    // loadPanel(panelId).then(setPanel).finally(() => setLoading(false));
  }, [panelId]);

  return { panel, loading };
}

export function useBdfBiomarkers(panelId: string) {
  const [biomarkers, setBiomarkers] = useState<BiomarkerDefinition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!panelId) {
      setBiomarkers([]);
      return;
    }

    setLoading(true);

    // Trouver le panel
    const panel = PANELS.find((p) => p.id === panelId);
    if (!panel) {
      setBiomarkers([]);
      setLoading(false);
      return;
    }

    // Récupérer les biomarqueurs nécessaires pour les index du panel
    Promise.all([
      import("@/lib/bdf/biomarkers/biomarkers.config"),
      import("@/lib/bdf/indexes/indexes.config")
    ]).then(([biomarkersModule, indexesModule]) => {
      const allBiomarkers = biomarkersModule.BIOMARKERS;
      const allIndexes = indexesModule.INDEXES;

      // Trouver tous les biomarqueurs requis par les index du panel
      const requiredBiomarkerIds = new Set<string>();

      panel.indexes.forEach((indexId) => {
        const indexDef = allIndexes.find((idx) => idx.id === indexId);
        if (indexDef) {
          indexDef.required_biomarkers.forEach((bioId) => {
            requiredBiomarkerIds.add(bioId);
          });

          // Si l'index a des dépendances d'index, on doit aussi récupérer leurs biomarqueurs
          if (indexDef.requires_indexes) {
            indexDef.requires_indexes.forEach((depIndexId) => {
              const depIndex = allIndexes.find((idx) => idx.id === depIndexId);
              if (depIndex) {
                depIndex.required_biomarkers.forEach((bioId) => {
                  requiredBiomarkerIds.add(bioId);
                });
              }
            });
          }
        }
      });

      // Convertir les IDs en définitions complètes
      const panelBiomarkers = allBiomarkers
        .filter((b: any) => requiredBiomarkerIds.has(b.id))
        .map((b: any) => ({
          code: b.id,
          name: b.label,
          unit: b.unit,
          category: b.category,
        }));

      setBiomarkers(panelBiomarkers);
      setLoading(false);
    });
  }, [panelId]);

  return { biomarkers, loading };
}

export function useUpdateBiomarkerValue(code: string, value: number | null) {
  // Placeholder pour mise à jour dans Zustand
  console.log(`Update biomarker ${code}:`, value);
}

export function useCalculateIndexesForPanel(panelId: string) {
  return useCallback(
    (biomarkers: Record<string, number | null>) => {
      if (!panelId || !biomarkers) {
        return {};
      }

      // 1) Trouver le panel
      const panel = PANELS.find((p) => p.id === panelId);
      if (!panel) {
        return {};
      }

      // 2) Déterminer les index à calculer (ceux listés dans panel.indexes)
      const indexesToCalculate = INDEXES.filter((idx) =>
        panel.indexes.includes(idx.id)
      );

      // 3) Calculer chaque index
      const indexCache: Record<string, number | null> = {};
      const results: Record<string, number | null> = {};

      for (const indexDef of indexesToCalculate) {
        const calculated = calculateIndex(indexDef, biomarkers, indexCache);
        results[indexDef.id] = calculated.value;
        indexCache[indexDef.id] = calculated.value;
      }

      return results;
    },
    [panelId]
  );
}

export function useBdfCalculation() {
  const [indexes, setIndexes] = useState<any[]>([]);
  const [calculating, setCalculating] = useState(false);

  const calculate = async (biomarkers: Record<string, number | null>) => {
    setCalculating(true);
    try {
      // TODO: Call calculateIndexes action
      // const results = await calculateIndexes(biomarkers);
      // setIndexes(results);
    } finally {
      setCalculating(false);
    }
  };

  return { indexes, calculating, calculate };
}
