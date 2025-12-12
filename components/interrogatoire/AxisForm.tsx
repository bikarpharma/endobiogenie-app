"use client";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import type { AxisDefinition } from "@/lib/interrogatoire/config";
import type { GonadoQuestion } from "@/lib/interrogatoire/config/axe-gonado";
import { QuestionField } from "./QuestionField";
import { SectionCard } from "./SectionCard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Zap, List } from "lucide-react";

interface AxisFormProps {
  axis: AxisDefinition;
  gender: "male" | "female";
  onPartialSave?: (values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export function AxisForm({
  axis,
  gender,
  onPartialSave,
  initialValues
}: AxisFormProps) {
  // État pour le mode rapide
  const [modeRapide, setModeRapide] = useState(false);

  const form = useForm({
    defaultValues: initialValues ?? {}
  });
  const { handleSubmit, control, reset } = form;

  // Référence pour tracker le dernier axe chargé
  const lastAxisRef = useRef<string | null>(null);
  const lastInitialValuesRef = useRef<string>('');

  // IMPORTANT : Recharger le formulaire quand l'axe change ou quand initialValues change
  useEffect(() => {
    const currentInitialValuesKey = JSON.stringify(initialValues ?? {});
    const axisChanged = lastAxisRef.current !== axis.key;
    const valuesChanged = lastInitialValuesRef.current !== currentInitialValuesKey;

    if (axisChanged || valuesChanged) {
      const hasData = initialValues && Object.keys(initialValues).length > 0;

      if (hasData) {
        console.log(`📝 [AxisForm ${axis.key}] Chargement de ${Object.keys(initialValues!).length} réponses`);
        reset(initialValues);
      } else if (axisChanged) {
        // Seulement reset à vide si on change d'axe et qu'il n'y a pas de données
        console.log(`📝 [AxisForm ${axis.key}] Nouveau formulaire vide`);
        reset({});
      }

      lastAxisRef.current = axis.key;
      lastInitialValuesRef.current = currentInitialValuesKey;
    }
  }, [axis.key, initialValues, reset]);

  // Filtrer les questions selon le genre (pour l'axe gonadique)
  const allQuestions = axis.key === "gonado"
    ? (axis.questions as GonadoQuestion[]).filter((q) =>
        q.gender === "both" || q.gender === (gender === "male" ? "male" : "female")
      )
    : axis.questions;

  // Filtrer les questions selon le mode (rapide = priority 1 seulement)
  const questions = modeRapide
    ? allQuestions.filter((q) => (q as any).priority === 1)
    : allQuestions;

  // Compter les questions par priorité
  const totalQuestions = allQuestions.length;
  const essentialQuestions = allQuestions.filter((q) => (q as any).priority === 1).length;
  const importantQuestions = allQuestions.filter((q) => (q as any).priority === 2).length;
  const optionalQuestions = allQuestions.filter((q) => (q as any).priority === 3).length;

  // Group questions by section
  const grouped = questions.reduce((acc, q) => {
    const section = q.section ?? "Divers";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(q);
    return acc;
  }, {} as Record<string, typeof questions>);

  const onSubmit = (values: Record<string, any>) => {
    onPartialSave?.(values);
  };

  return (
    <TooltipProvider delayDuration={200}>
      {/* Toggle Mode Rapide / Mode Complet */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Mode d'interrogatoire :</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bouton Mode Rapide */}
            <button
              type="button"
              onClick={() => setModeRapide(true)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${modeRapide
                  ? "bg-amber-500 text-white shadow-md scale-105"
                  : "bg-white text-slate-600 border border-slate-300 hover:border-amber-400 hover:bg-amber-50"
                }
              `}
            >
              <Zap className="w-4 h-4" />
              <span>Rapide</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${modeRapide ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-700"}
              `}>
                {essentialQuestions}
              </span>
            </button>

            {/* Bouton Mode Complet */}
            <button
              type="button"
              onClick={() => setModeRapide(false)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${!modeRapide
                  ? "bg-blue-500 text-white shadow-md scale-105"
                  : "bg-white text-slate-600 border border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                }
              `}
            >
              <List className="w-4 h-4" />
              <span>Complet</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${!modeRapide ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}
              `}>
                {totalQuestions}
              </span>
            </button>
          </div>
        </div>

        {/* Message d'explication */}
        <p className="text-xs text-slate-500 mt-3">
          {modeRapide ? (
            <>
              <span className="text-amber-600 font-semibold">⚡ Mode Rapide :</span> Seulement les {essentialQuestions} questions essentielles pour un diagnostic rapide.
            </>
          ) : (
            <>
              <span className="text-blue-600 font-semibold">📋 Mode Complet :</span> Toutes les {totalQuestions} questions pour une évaluation approfondie.
            </>
          )}
        </p>

        {/* Légende des priorités (visible seulement en mode complet) */}
        {!modeRapide && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Légende :</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="text-xs text-slate-600">Essentiel ({essentialQuestions})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-400"></span>
              <span className="text-xs text-slate-600">Important ({importantQuestions})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span className="text-xs text-slate-600">Optionnel ({optionalQuestions})</span>
            </div>
          </div>
        )}
      </div>

      {/* Formulaire des questions */}
      <form
        onBlur={handleSubmit(onSubmit)}
        onChange={() => {
          // onPartialSave sera déclenché au blur; pas besoin ici
        }}
        className="space-y-6"
      >
        {Object.entries(grouped).map(([section, qs]) => (
          <SectionCard key={section} title={section}>
            {qs.map((q) => (
              <QuestionField 
                key={q.id} 
                question={q as any} 
                control={control}
                showPriorityBadge={!modeRapide}
              />
            ))}
          </SectionCard>
        ))}

        {/* Message si aucune question dans une section après filtrage */}
        {Object.keys(grouped).length === 0 && modeRapide && (
          <div className="text-center py-8 text-slate-500">
            <p>Aucune question prioritaire définie pour cet axe.</p>
            <button
              type="button"
              onClick={() => setModeRapide(false)}
              className="mt-2 text-blue-500 hover:underline"
            >
              Passer en mode complet
            </button>
          </div>
        )}
      </form>
    </TooltipProvider>
  );
}