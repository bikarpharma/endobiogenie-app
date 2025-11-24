"use client";

import { useController } from "react-hook-form";
import type { Control } from "react-hook-form";
import { PANELS } from "@/lib/bdf/panels/panels.config";

interface BdfPanelSelectorProps {
  control: Control<any>;
}

export function BdfPanelSelector({ control }: BdfPanelSelectorProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name: "panelId",
    control,
    rules: { required: "Veuillez sélectionner un panel" },
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Sélectionner un panel</label>
      <select
        {...field}
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- Choisir un panel --</option>
        {PANELS.map((panel) => (
          <option key={panel.id} value={panel.id}>
            {panel.label}
            {panel.description && ` - ${panel.description}`}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
