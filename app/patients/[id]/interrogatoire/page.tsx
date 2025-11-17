"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AXES_DEFINITION,
  AxisKey,
} from "@/lib/interrogatoire/config";
import { AxisNavigation } from "@/components/interrogatoire/AxisNavigation";
import { AxisForm } from "@/components/interrogatoire/AxisForm";
import { AxisSummary } from "@/components/interrogatoire/AxisSummary";

type Sexe = "F" | "H";

type AnswersByAxis = Record<AxisKey, Record<string, any>>;

interface LoadedInterrogatoireV2 {
  sexe: Sexe;
  answersByAxis: AnswersByAxis;
}

export default function InterrogatoirePage() {
  const { id: patientId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<{ nom?: string; prenom?: string } | null>(
    null
  );

  const [sexe, setSexe] = useState<Sexe>("F");
  const [activeAxis, setActiveAxis] = useState<AxisKey>("historique");
  const [answersByAxis, setAnswersByAxis] = useState<AnswersByAxis>({} as AnswersByAxis);

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/interrogatoire/update?patientId=${patientId}`);
        const data = await res.json();

        // Infos patient
        setPatient({ nom: data.nom, prenom: data.prenom });

        const interro = data.interrogatoire;

        if (interro?.v2?.answersByAxis) {
          // Données V2 déjà présentes
          setSexe((interro.sexe as Sexe) || "F");
          setAnswersByAxis(interro.v2.answersByAxis as AnswersByAxis);
        } else {
          // Pas encore de V2 : initialisation vide
          setSexe((interro?.sexe as Sexe) || "F");
          const empty: AnswersByAxis = {} as AnswersByAxis;
          AXES_DEFINITION.forEach((axis) => {
            empty[axis.key] = {};
          });
          setAnswersByAxis(empty);
        }
      } catch (e) {
        console.error("Erreur de chargement interrogatoire :", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handlePartialSaveAxis = (axisKey: AxisKey, values: Record<string, any>) => {
    setAnswersByAxis((prev) => ({
      ...prev,
      [axisKey]: {
        ...(prev[axisKey] ?? {}),
        ...values,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload: LoadedInterrogatoireV2 = {
        sexe,
        answersByAxis,
      };

      const res = await fetch("/api/interrogatoire/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          interrogatoire: {
            // On garde compatibilité ascendante :
            sexe,
            v2: payload,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Erreur sauvegarde interrogatoire :", data);
        alert("❌ Erreur lors de la sauvegarde de l'interrogatoire.");
        return;
      }

      alert("✅ Interrogatoire sauvegardé avec succès.");
      router.push(`/patients/${patientId}`);
    } catch (e) {
      console.error("Erreur de sauvegarde interrogatoire :", e);
      alert("❌ Erreur lors de la sauvegarde. Voir console.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'interrogatoire...</p>
        </div>
      </div>
    );
  }

  const currentAxisIndex = AXES_DEFINITION.findIndex((a) => a.key === activeAxis);
  const currentAxis = AXES_DEFINITION[currentAxisIndex];

  const goPrevAxis = () => {
    if (currentAxisIndex > 0) {
      setActiveAxis(AXES_DEFINITION[currentAxisIndex - 1].key);
    }
  };

  const goNextAxis = () => {
    if (currentAxisIndex < AXES_DEFINITION.length - 1) {
      setActiveAxis(AXES_DEFINITION[currentAxisIndex + 1].key);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              📋 Interrogatoire endobiogénique
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Patient : {patient?.nom} {patient?.prenom}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/patients/${patientId}`)}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Retour fiche patient
          </button>
        </div>

        {/* Sexe + Navigation */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-4">
            {/* Sexe */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Sexe du patient
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    className="w-4 h-4 text-blue-600"
                    checked={sexe === "F"}
                    onChange={() => setSexe("F")}
                  />
                  <span>Femme</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    className="w-4 h-4 text-blue-600"
                    checked={sexe === "H"}
                    onChange={() => setSexe("H")}
                  />
                  <span>Homme</span>
                </label>
              </div>
            </div>

            {/* Navigation axes */}
            <div className="bg-white rounded-xl shadow-sm border p-3">
              <AxisNavigation activeKey={activeAxis} onChange={setActiveAxis} />
            </div>
          </div>

          {/* Contenu axe */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentAxis.label}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {currentAxis.description}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  Axe {currentAxisIndex + 1} / {AXES_DEFINITION.length}
                </div>
              </div>

              <AxisForm
                axis={currentAxis}
                gender={sexe === "H" ? "male" : "female"}
                initialValues={answersByAxis[currentAxis.key]}
                onPartialSave={(vals) => handlePartialSaveAxis(currentAxis.key, vals)}
              />

              <AxisSummary
                axisKey={currentAxis.key}
                values={answersByAxis[currentAxis.key] || {}}
              />

              <div className="flex items-center justify-between pt-4 border-t mt-2">
                <button
                  type="button"
                  onClick={goPrevAxis}
                  disabled={currentAxisIndex === 0}
                  className={`px-3 py-1.5 rounded-md text-sm border ${
                    currentAxisIndex === 0
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  ← Axe précédent
                </button>
                {currentAxisIndex < AXES_DEFINITION.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNextAxis}
                    className="px-3 py-1.5 rounded-md text-sm border border-blue-500 text-blue-700 hover:bg-blue-50"
                  >
                    Axe suivant →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-1.5 rounded-md text-sm border border-green-600 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? "Sauvegarde..." : "💾 Sauvegarder l'interrogatoire"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
