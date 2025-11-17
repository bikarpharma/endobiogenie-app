"use client";

import type { QuestionConfig } from "@/lib/interrogatoire/types";
import type { GonadoQuestion } from "@/lib/interrogatoire/config/axe-gonado";
import { Controller, Control } from "react-hook-form";
import { TooltipInfo } from "./TooltipInfo";

type AnyQuestion = QuestionConfig | GonadoQuestion;

interface QuestionFieldProps {
  question: AnyQuestion;
  control: Control<any>;
}

export function QuestionField({ question, control }: QuestionFieldProps) {
  const { id, question: label, type, options, tooltip } = question;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="font-medium text-sm text-gray-700 flex items-center gap-1">
        {label}
        {tooltip && <TooltipInfo text={tooltip} />}
      </label>

      <Controller
        name={id}
        control={control}
        render={({ field }) => {
          switch (type) {
            case "boolean":
              return (
                <select
                  id={id}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={field.value === undefined ? "" : field.value ? "oui" : "non"}
                  onChange={(e) => field.onChange(e.target.value === "oui")}
                >
                  <option value="">Sélectionner…</option>
                  <option value="oui">Oui</option>
                  <option value="non">Non</option>
                </select>
              );
            case "select":
              return (
                <select
                  id={id}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="">Sélectionner…</option>
                  {(options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              );
            case "number":
              return (
                <input
                  id={id}
                  type="number"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                  }
                />
              );
            case "multiselect":
              return (
                <select
                  id={id}
                  multiple
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                  value={field.value ?? []}
                  onChange={(e) =>
                    field.onChange(
                      Array.from(e.target.selectedOptions).map((o) => o.value)
                    )
                  }
                >
                  {(options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              );
            case "date":
              return (
                <input
                  id={id}
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              );
            case "text":
            default:
              return (
                <textarea
                  id={id}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              );
          }
        }}
      />
    </div>
  );
}
