"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AXES_DEFINITION, BLOCS_DEFINITION } from "@/lib/interrogatoire/config";
import type { AxisKey } from "@/lib/interrogatoire/config";
import { AxisNavigation } from "@/components/interrogatoire/AxisNavigation";
import { AxisForm } from "@/components/interrogatoire/AxisForm";
import { AxisSummary } from "@/components/interrogatoire/AxisSummary";
import { BoutonInterpretrerAxe } from "@/components/interrogatoire/BoutonInterpretrerAxe";
import { ClinicalScoresCard } from "@/components/interrogatoire/ClinicalScoresCard";
import SyntheseGlobaleCard from "@/components/interrogatoire/SyntheseGlobaleCard";
import type { AxeType, AxeInterpretation } from "@/lib/interrogatoire/axeInterpretation";
import { TooltipProvider } from "@/components/ui/tooltip";
import CorticotropeTrigger from "@/components/learning/CorticotropeTrigger";

type Sexe = "F" | "H";

export type AnswersByAxis = Record<AxisKey, Record<string, any>>;

// Mapping entre clés d'axes UI et types d'axes API
const AXIS_KEY_TO_TYPE: Partial<Record<AxisKey, AxeType>> = {
  neuro: "neurovegetatif",
  adaptatif: "adaptatif",
  thyro: "thyroidien",
  gonado: "gonadique",
  somato: "somatotrope",
  digestif: "digestif",
  cardioMetabo: "cardiometabolique",
  dermato: "dermato",
  immuno: "immuno",
};

interface LoadedInterrogatoireV2 {
  sexe: Sexe;
  answersByAxis: AnswersByAxis;
}

export default function InterrogatoirePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [patient, setPatient] = useState<{ nom?: string; prenom?: string } | null>(
    null
  );

  const [sexe, setSexe] = useState<Sexe>("F");
  const [activeAxis, setActiveAxis] = useState<AxisKey>("historique");
  const [answersByAxis, setAnswersByAxis] = useState<AnswersByAxis>({} as AnswersByAxis);
  const [interpretations, setInterpretations] = useState<Record<string, AxeInterpretation>>({});
  const [syntheseGlobale, setSyntheseGlobale] = useState<any>(null);
  const [syntheseLoading, setSyntheseLoading] = useState(false);

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/interrogatoire/update?patientId=${patientId}`);
        const data = await res.json();

        console.log("🔵 [DEBUG CHARGEMENT] Données reçues de l'API:", data);

        // Infos patient
        setPatient({ nom: data.nom, prenom: data.prenom });

        const interro = data.interrogatoire;

        if (interro?.v2?.answersByAxis) {
          // Données V2 déjà présentes
          console.log("✅ [DEBUG CHARGEMENT] Données V2 trouvées:", interro.v2.answersByAxis);
          setSexe((interro.v2.sexe as Sexe) || "F");
          setAnswersByAxis(interro.v2.answersByAxis as AnswersByAxis);
        } else {
          // Pas encore de V2 : initialisation vide
          console.warn("⚠️ [DEBUG CHARGEMENT] Pas de données V2, initialisation vide");
          setSexe((interro?.sexe as Sexe) || "F");
          const empty: AnswersByAxis = {} as AnswersByAxis;
          AXES_DEFINITION.forEach((axis) => {
            empty[axis.key] = {};
          });
          setAnswersByAxis(empty);
        }

        // Charger les interprétations existantes
        try {
          const interpRes = await fetch(`/api/interrogatoire/interpret?patientId=${patientId}`);
          if (interpRes.ok) {
            const interpData = await interpRes.json();
            const interpMap: Record<string, AxeInterpretation> = {};
            interpData.interpretations?.forEach((interp: AxeInterpretation) => {
              interpMap[interp.axe] = interp;
            });
            setInterpretations(interpMap);
          }
        } catch (interpError) {
          console.warn("Erreur chargement interprétations:", interpError);
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

  // Fonction de sauvegarde automatique (sans redirection)
  const autoSave = async (dataToSave: AnswersByAxis) => {
    try {
      setAutoSaving(true);

      // Nettoyer answersByAxis : ne garder que les axes qui ont des données
      const cleanedAnswersByAxis: Partial<AnswersByAxis> = {};
      Object.entries(dataToSave).forEach(([key, value]) => {
        // Ne sauvegarder que les axes qui ont au moins une réponse
        if (value && Object.keys(value).length > 0) {
          cleanedAnswersByAxis[key as AxisKey] = value;
        }
      });

      console.log("💾 [AUTO-SAVE] Sauvegarde automatique...", cleanedAnswersByAxis);

      // Si aucune donnée, pas de sauvegarde
      if (Object.keys(cleanedAnswersByAxis).length === 0) {
        console.log("⏭️ [AUTO-SAVE] Pas de données à sauvegarder");
        setAutoSaving(false);
        return;
      }

      const payload: LoadedInterrogatoireV2 = {
        sexe,
        answersByAxis: cleanedAnswersByAxis as AnswersByAxis,
      };

      const res = await fetch("/api/interrogatoire/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          interrogatoire: {
            sexe,
            v2: payload,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("❌ [AUTO-SAVE] Échec:", data);
      } else {
        console.log("✅ [AUTO-SAVE] Succès");
      }
    } catch (e) {
      console.error("❌ [AUTO-SAVE] Erreur:", e);
    } finally {
      setAutoSaving(false);
    }
  };

  // Auto-save déclenché au changement d'axe
  useEffect(() => {
    if (loading) return;

    const timeoutId = setTimeout(() => {
      autoSave(answersByAxis);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [activeAxis]); // Déclenché uniquement au changement d'axe

  // Sauvegarde manuelle avec redirection
  const handleSave = async () => {
    try {
      setSaving(true);

      // Nettoyer answersByAxis : ne garder que les axes qui ont des données
      const cleanedAnswersByAxis: Partial<AnswersByAxis> = {};
      Object.entries(answersByAxis).forEach(([key, value]) => {
        if (value && Object.keys(value).length > 0) {
          cleanedAnswersByAxis[key as AxisKey] = value;
        }
      });

      console.log("💾 [SAUVEGARDE] answersByAxis nettoyé:", cleanedAnswersByAxis);

      // Vérifier qu'il y a au moins un axe rempli
      if (Object.keys(cleanedAnswersByAxis).length === 0) {
        alert("⚠️ Aucune donnée à sauvegarder. Veuillez remplir au moins un axe avant de sauvegarder.");
        setSaving(false);
        return;
      }

      const payload: LoadedInterrogatoireV2 = {
        sexe,
        answersByAxis: cleanedAnswersByAxis as AnswersByAxis,
      };

      const res = await fetch("/api/interrogatoire/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          interrogatoire: {
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

  const currentAxisIndex = AXES_DEFINITION.findIndex((a) => a.key === activeAxis);
  const currentAxis = AXES_DEFINITION[currentAxisIndex];
  const currentBloc = BLOCS_DEFINITION.find((b) => b.axes.includes(activeAxis));

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

  // Si l'axe n'a pas de questions (comme modeVie pour l'instant), afficher un message
  const hasQuestions = currentAxis?.questions && currentAxis.questions.length > 0;

  // Fonction pour obtenir la couleur du badge selon le bloc
  const getBlocBadgeColor = (blocKey: string | undefined) => {
    switch (blocKey) {
      case "terrain":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "gestionnaires":
        return "bg-indigo-100 text-indigo-700 border-indigo-300";
      case "emonctoires":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Fonction pour interpréter TOUS les axes en une seule fois
  const handleInterpretAll = async () => {
    const axesToInterpret = Object.keys(AXIS_KEY_TO_TYPE) as AxisKey[];
    const filledAxes = axesToInterpret.filter(
      (axisKey) => answersByAxis[axisKey] && Object.keys(answersByAxis[axisKey]).length > 0
    );

    if (filledAxes.length === 0) {
      alert("⚠️ Aucun axe rempli. Veuillez remplir au moins un axe avant de demander une interprétation.");
      return;
    }

    const confirmMsg = `Voulez-vous interpréter ${filledAxes.length} axe(s) rempli(s) avec l'IA ?\n\n${filledAxes.map(k => AXES_DEFINITION.find(a => a.key === k)?.label).join('\n')}`;

    if (!confirm(confirmMsg)) return;

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const axisKey of filledAxes) {
      const axeType = AXIS_KEY_TO_TYPE[axisKey];
      if (!axeType) continue;

      try {
        const res = await fetch("/api/interrogatoire/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            axe: axeType,
            reponsesAxe: answersByAxis[axisKey],
            sexe,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setInterpretations(prev => ({
            ...prev,
            [axeType]: data.interpretation,
          }));
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Erreur interprétation ${axeType}:`, error);
        errorCount++;
      }
    }

    setSaving(false);
    alert(`✅ Interprétation terminée:\n${successCount} succès, ${errorCount} erreurs`);
  };

  // Fonction pour générer la synthèse globale
  const handleGenerateSyntheseGlobale = async () => {
    const interpCount = Object.keys(interpretations).length;

    if (interpCount === 0) {
      alert("⚠️ Aucune interprétation d'axe disponible.\n\nVeuillez d'abord interpréter au moins un axe avec le bouton \"✨ INTERPRÉTER TOUS LES AXES\".");
      return;
    }

    const confirmMsg = `Générer une SYNTHÈSE GLOBALE du terrain endobiogénique ?\n\n✓ ${interpCount} interprétation(s) d'axe seront analysées\n✓ Les données de biologie fonctionnelle seront incluses si disponibles\n\nCette synthèse donnera une vision holistique du patient.`;

    if (!confirm(confirmMsg)) return;

    try {
      setSyntheseLoading(true);

      const res = await fetch("/api/interrogatoire/interpret-global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la génération de la synthèse");
      }

      const data = await res.json();
      setSyntheseGlobale(data.synthese);

      // Scroll vers la synthèse
      setTimeout(() => {
        document.getElementById('synthese-globale-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

      alert("✅ Synthèse globale générée avec succès !");
    } catch (error) {
      console.error("Erreur génération synthèse globale:", error);
      alert(`❌ Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    } finally {
      setSyntheseLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
        {/* Sidebar de navigation fixe */}
        <AxisNavigation activeKey={activeAxis} onChange={setActiveAxis} />

      {/* Contenu principal avec marge gauche pour la sidebar */}
      <div className="ml-64">
        {/* Header sticky en haut */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.push(`/patients/${patientId}`)}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-slate-900">
                      {patient?.prenom} {patient?.nom}
                    </h1>
                    {currentBloc && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getBlocBadgeColor(currentBloc.key)}`}>
                        {currentBloc.icon} {currentBloc.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Interrogatoire Endobiogénique • Axe {currentAxisIndex + 1}/{AXES_DEFINITION.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {autoSaving && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    Sauvegarde...
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {saving ? "Sauvegarde..." : "💾 Sauvegarder"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu avec layout 2 colonnes */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Colonne gauche : Sexe + Formulaire (8 colonnes) */}
            <div className="col-span-8 space-y-6">
              {/* Sexe du patient */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-slate-700">
                    Sexe du patient
                  </div>
                  <div className="flex gap-4 text-sm">
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
              </div>

              {/* Formulaire de l'axe actif */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                {/* En-tête de l'axe */}
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{currentAxis.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900">
                          {currentAxis.label}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                          {currentAxis.description}
                        </p>
                      </div>
                      {/* Bouton d'exploration physiologique pour l'axe Adaptatif (Corticotrope) */}
                      {currentAxis.key === "adaptatif" && (
                        <CorticotropeTrigger />
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenu de l'axe */}
                {hasQuestions ? (
                  <>
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
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
                    <div className="text-5xl mb-4">🚧</div>
                    <h3 className="text-lg font-bold text-amber-900 mb-2">
                      Section en construction
                    </h3>
                    <p className="text-sm text-amber-700">
                      Les questions pour cette section seront ajoutées prochainement.
                    </p>
                  </div>
                )}

                {/* Bouton interprétation IA */}
                {AXIS_KEY_TO_TYPE[currentAxis.key] && (
                  <BoutonInterpretrerAxe
                    patientId={patientId}
                    axe={AXIS_KEY_TO_TYPE[currentAxis.key]!}
                    reponsesAxe={answersByAxis[currentAxis.key] || {}}
                    sexe={sexe}
                    existingInterpretation={interpretations[AXIS_KEY_TO_TYPE[currentAxis.key]!] || null}
                    onInterpretationComplete={(interpretation) => {
                      setInterpretations(prev => ({
                        ...prev,
                        [interpretation.axe]: interpretation,
                      }));
                    }}
                  />
                )}

                {/* Navigation précédent/suivant */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={goPrevAxis}
                    disabled={currentAxisIndex === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentAxisIndex === 0
                        ? "border border-slate-200 text-slate-300 cursor-not-allowed"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Axe précédent
                  </button>
                  <button
                    type="button"
                    onClick={goNextAxis}
                    disabled={currentAxisIndex === AXES_DEFINITION.length - 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentAxisIndex === AXES_DEFINITION.length - 1
                        ? "border border-slate-200 text-slate-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md"
                    }`}
                  >
                    Axe suivant
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Colonne droite : Scores Cliniques STICKY (4 colonnes) */}
            <div className="col-span-4">
              <div className="sticky top-24">
                <ClinicalScoresCard answersByAxis={answersByAxis} sexe={sexe} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION SYNTHÈSE GLOBALE */}
        {(syntheseGlobale || syntheseLoading) && (
          <div id="synthese-globale-section" className="max-w-7xl mx-auto px-6 py-6">
            <SyntheseGlobaleCard synthese={syntheseGlobale} loading={syntheseLoading} />
          </div>
        )}

        {/* BARRE FIXE EN BAS - BOUTONS CRITIQUES */}
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t-2 border-slate-300 shadow-2xl z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Indicateur de sauvegarde auto */}
              <div className="flex items-center gap-3 text-sm text-slate-600">
                {autoSaving ? (
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <span className="inline-block w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
                    Sauvegarde automatique en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Sauvegardé automatiquement
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-3">
                {/* BOUTON 1 : SAUVEGARDER TOUT */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {saving ? "SAUVEGARDE..." : "💾 SAUVEGARDER TOUT"}
                </button>

                {/* BOUTON 2 : INTERPRÉTER TOUS LES AXES */}
                <button
                  type="button"
                  onClick={handleInterpretAll}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {saving ? "INTERPRÉTATION..." : "✨ INTERPRÉTER TOUS LES AXES"}
                </button>

                {/* BOUTON 3 : SYNTHÈSE GLOBALE */}
                <button
                  type="button"
                  onClick={handleGenerateSyntheseGlobale}
                  disabled={syntheseLoading || Object.keys(interpretations).length === 0}
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {syntheseLoading ? "GÉNÉRATION..." : "🧠 SYNTHÈSE GLOBALE"}
                </button>
              </div>
            </div>

            {/* Compteur d'axes remplis */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {Object.keys(answersByAxis).filter(k => Object.keys(answersByAxis[k as AxisKey] || {}).length > 0).length} / {AXES_DEFINITION.length} axes remplis
                </span>
                <span className="font-medium text-slate-700">
                  {Object.keys(interpretations).length} interprétation(s) IA disponible(s)
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
