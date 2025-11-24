"use client";

import { useBdfStore } from "./bdf.hooks";
import { INDEXES } from "@/lib/bdf/indexes/indexes.config";

interface BdfIndexGridProps {}

export function BdfIndexGrid({}: BdfIndexGridProps) {
  const { indexResults } = useBdfStore();

  const indexEntries = Object.entries(indexResults);

  if (indexEntries.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Index calculés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-xl bg-white shadow-sm">
            <p className="text-sm text-gray-500">
              Remplissez les biomarqueurs pour afficher les index
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Index calculés</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indexEntries.map(([indexId, value]) => {
          const indexDef = INDEXES.find((idx) => idx.id === indexId);
          if (!indexDef) return null;

          return (
            <div
              key={indexId}
              className="p-4 border rounded-xl bg-white shadow-sm space-y-2"
            >
              <h3 className="font-medium text-gray-800">{indexDef.label}</h3>
              <p className="text-2xl font-bold text-blue-600">
                {value !== null ? value.toFixed(3) :
                  indexDef.formula_type === "secret"
                    ? "Index secret"
                    : "Données manquantes"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {indexDef.category}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
