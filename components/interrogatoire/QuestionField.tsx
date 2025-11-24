"use client";

import type { QuestionConfig } from "@/lib/interrogatoire/types";
import type { GonadoQuestion } from "@/lib/interrogatoire/config/axe-gonado";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type AnyQuestion = QuestionConfig | GonadoQuestion;

interface QuestionFieldProps {
  question: AnyQuestion;
  control: Control<any>;
}

export function QuestionField({ question, control }: QuestionFieldProps) {
  const { id, question: label, type, options, tooltip } = question;
  const scaleLabels = "scaleLabels" in question ? question.scaleLabels : undefined;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2 mb-3">
        <label htmlFor={id} className="font-medium text-lg text-slate-800 flex-1">
          {label}
        </label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors cursor-help flex-shrink-0"
                onClick={(e) => e.preventDefault()}
              >
                <Info className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="leading-relaxed">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <Controller
        name={id}
        control={control}
        render={({ field }) => {
          switch (type) {
            case "boolean":
              return (
                <select
                  id={id}
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base font-medium w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-blue-400 transition-colors"
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
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 text-base font-medium w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-blue-400 transition-colors"
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
            case "scale_1_5":
              return (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`
                          flex-1 px-5 py-4 text-base font-semibold rounded-lg border-2 transition-all
                          ${
                            field.value === value
                              ? "bg-blue-500 text-white border-blue-600 shadow-lg scale-105"
                              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-102"
                          }
                        `}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  {scaleLabels && scaleLabels.length === 5 && (
                    <div className="flex gap-3 text-sm text-gray-600 font-medium">
                      {scaleLabels.map((label, idx) => (
                        <div key={idx} className="flex-1 text-center">
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
