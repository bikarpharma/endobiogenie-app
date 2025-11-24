"use client";

import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

interface BiomarkerDefinition {
  code: string;
  name: string;
  unit?: string;
  category: string;
  referenceMin?: number;
  referenceMax?: number;
}

interface BdfBiomarkerGridProps {
  biomarkers: BiomarkerDefinition[];
  control: Control<any>;
}

export function BdfBiomarkerGrid({ biomarkers, control }: BdfBiomarkerGridProps) {
  if (biomarkers.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Biomarqueurs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-xl">
            <p className="text-sm text-gray-500">
              Sélectionnez un panel pour afficher les biomarqueurs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Biomarqueurs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {biomarkers.map((biomarker) => (
          <div key={biomarker.code} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {biomarker.name}
              {biomarker.unit && (
                <span className="ml-1 text-xs text-gray-500">({biomarker.unit})</span>
              )}
            </label>
            <Controller
              name={`biomarkers.${biomarker.code}`}
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valeur"
                  className="w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? null : parseFloat(val));
                  }}
                />
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
