"use client";

import { useForm } from "react-hook-form";
import type { AxisDefinition } from "@/lib/interrogatoire/config";
import type { GonadoQuestion } from "@/lib/interrogatoire/config/axe-gonado";
import { QuestionField } from "./QuestionField";
import { SectionCard } from "./SectionCard";

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
  const form = useForm({
    defaultValues: initialValues ?? {}
  });

  const { handleSubmit, control } = form;

  const questions = axis.key === "gonado"
    ? (axis.questions as GonadoQuestion[]).filter((q) =>
        q.gender === "both" || q.gender === (gender === "male" ? "male" : "female")
      )
    : axis.questions;

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
            <QuestionField key={q.id} question={q as any} control={control} />
          ))}
        </SectionCard>
      ))}
    </form>
  );
}
