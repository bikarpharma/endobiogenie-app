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
  showPriorityBadge?: boolean;
}

export function QuestionField({ question, control, showPriorityBadge = true }: QuestionFieldProps) {
  const { id, question: label, type, options, tooltip } = question;
  const scaleLabels = "scaleLabels" in question ? question.scaleLabels : undefined;
  const priority = "priority" in question ? (question as any).priority : undefined;

  // Déterminer le style selon la priorité
  const getPriorityStyles = () => {
    switch (priority) {
      case 1: // Essentiel
        return {
          dot: "bg-amber-400",
          border: "border-amber-300 bg-amber-50/30",
          label: "text-amber-900"
        };
      case 2: // Important
        return {
          dot: "bg-blue-400",
          border: "border-blue-200 bg-blue-50/20",
          label: "text-slate-800"
        };
      case 3: // Optionnel
      default:
        return {
          dot: "bg-slate-300",
          border: "border-slate-200",
          label: "text-slate-700"
        };
    }
  };

  const styles = getPriorityStyles();

  return (
    <div className={`
      bg-white rounded-xl shadow-sm border p-6 mb-4 hover:shadow-md transition-shadow
      ${styles.border}
    `}>
      <div className="flex items-start gap-3 mb-3">
        {/* Point coloré de priorité */}
        {showPriorityBadge && priority && (
          <span className={`
            w-3 h-3 rounded-full flex-shrink-0 mt-1.5
            ${styles.dot}
          `} />
        )}

        {/* Label de la question */}
        <label htmlFor={id} className={`
          font-medium text-lg flex-1
          ${styles.label}
        `}>
          {label}
        </label>

        {/* Tooltip info */}
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
                  className={`
                    border-2 rounded-lg px-4 py-3 text-base font-medium w-full 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white transition-colors
                    ${priority === 1 
                      ? "border-amber-300 hover:border-amber-400" 
                      : priority === 2
                        ? "border-blue-200 hover:border-blue-400"
                        : "border-gray-300 hover:border-gray-400"
                    }
                  `}
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
                  className={`
                    border-2 rounded-lg px-4 py-3 text-base font-medium w-full 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white transition-colors
                    ${priority === 1 
                      ? "border-amber-300 hover:border-amber-400" 
                      : priority === 2
                        ? "border-blue-200 hover:border-blue-400"
                        : "border-gray-300 hover:border-gray-400"
                    }
                  `}
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
                  className={`
                    border rounded-lg px-3 py-2 text-sm w-full 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${priority === 1 ? "border-amber-300" : priority === 2 ? "border-blue-200" : "border-gray-300"}
                  `}
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
                  className={`
                    border rounded-lg px-3 py-2 text-sm w-full min-h-[100px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${priority === 1 ? "border-amber-300" : priority === 2 ? "border-blue-200" : "border-gray-300"}
                  `}
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
                  className={`
                    border rounded-lg px-3 py-2 text-sm w-full 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${priority === 1 ? "border-amber-300" : priority === 2 ? "border-blue-200" : "border-gray-300"}
                  `}
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
                              ? priority === 1
                                ? "bg-amber-500 text-white border-amber-600 shadow-lg scale-105"
                                : priority === 2
                                  ? "bg-blue-500 text-white border-blue-600 shadow-lg scale-105"
                                  : "bg-slate-500 text-white border-slate-600 shadow-lg scale-105"
                              : priority === 1
                                ? "bg-white text-gray-700 border-amber-300 hover:border-amber-400 hover:bg-amber-50 hover:scale-102"
                                : priority === 2
                                  ? "bg-white text-gray-700 border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-102"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:scale-102"
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
                  className={`
                    border rounded-lg px-3 py-2 text-sm w-full min-h-[80px] resize-y
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${priority === 1 ? "border-amber-300" : priority === 2 ? "border-blue-200" : "border-gray-300"}
                  `}
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