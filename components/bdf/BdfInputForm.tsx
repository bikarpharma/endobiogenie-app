"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { BIOMARKERS } from "@/lib/bdf/biomarkers/biomarkers.config";
import { calculateAllIndexes } from "@/lib/bdf/calculateIndexes";
import { useState } from "react";
import BdfResultsView from "./BdfResultsView";
import LabImportModal from "./LabImportModal";

// Mapping des catégories vers des labels français
const CATEGORY_LABELS: Record<string, string> = {
  hematology: "Hématologie (NFS)",
  ion: "Ionogramme",
  enzyme: "Enzymes",
  hormone: "Hormones",
  bone: "Métabolisme Osseux",
  tumor: "Marqueurs Tumoraux",
  // NOUVELLES CATÉGORIES
  liver: "Bilan Hépatique",
  lipid: "Bilan Lipidique",
  renal: "Bilan Rénal",
  metabolic: "Bilan Métabolique",
  inflammation: "Marqueurs Inflammatoires"
};

// Couleurs Tailwind par catégorie
const CATEGORY_COLORS: Record<string, string> = {
  hematology: "border-red-200 bg-red-50",
  ion: "border-blue-200 bg-blue-50",
  enzyme: "border-amber-200 bg-amber-50",
  hormone: "border-purple-200 bg-purple-50",
  bone: "border-emerald-200 bg-emerald-50",
  tumor: "border-rose-200 bg-rose-50",
  // NOUVELLES COULEURS
  liver: "border-orange-200 bg-orange-50",
  lipid: "border-yellow-200 bg-yellow-50",
  renal: "border-cyan-200 bg-cyan-50",
  metabolic: "border-pink-200 bg-pink-50",
  inflammation: "border-red-300 bg-red-100"
};

// Données de test pré-configurées
const TEST_CASES = {
  hypothyroid: {
    label: "Hypothyroïdie + Stress",
    data: {
      NEUT: 3.5, LYMPH: 2.8, EOS: 0.15, HB: 12.5, HCT: 38,
      NA: 138, K: 4.2,
      LDH: 180, CPK: 220,
      TSH: 4.5
    }
  },
  sympathetic: {
    label: "Sympathique + Inflammation",
    data: {
      NEUT: 6.5, LYMPH: 1.8, EOS: 0.08, HB: 15.2, HCT: 45,
      NA: 142, K: 3.8,
      LDH: 240, CPK: 150,
      TSH: 1.2
    }
  },
  balanced: {
    label: "Profil Équilibré",
    data: {
      NEUT: 4.0, LYMPH: 2.5, EOS: 0.12, HB: 14.0, HCT: 42,
      NA: 140, K: 4.0,
      LDH: 200, CPK: 180,
      TSH: 2.0,
      PAL: 70, P: 3.5
    }
  }
};

interface BdfInputFormProps {
  patientId?: string;
  initialValues?: Record<string, number | null>;
  editMode?: boolean;
  analysisId?: string;
}

export default function BdfInputForm({ patientId, initialValues, editMode = false, analysisId }: BdfInputFormProps = {}) {
  const router = useRouter();
  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: initialValues || {},
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // Liste des catégories à afficher (dans l'ordre souhaité)
  // AJOUT des 5 catégories manquantes: liver, lipid, renal, metabolic, inflammation
  const categories = [
    "hematology", "ion", "enzyme", "hormone", "bone",
    "liver", "lipid", "renal", "metabolic", "inflammation",
    "tumor"
  ];

  const onSubmit = async (data: any) => {
    setLoading(true);
    setSaveMessage(null);

    // Conversion des strings en numbers (React Hook Form retourne des strings pour les inputs number)
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v ? Number(v) : null])
    );

    // Appel du moteur de calcul
    const res = calculateAllIndexes(cleanData);

    // Ajouter les inputs bruts au résultat pour l'affichage
    setResults({ ...res, inputs: cleanData });
    setLoading(false);
  };

  const loadTestCase = (caseKey: keyof typeof TEST_CASES) => {
    reset(TEST_CASES[caseKey].data);
    setResults(null); // Réinitialiser les résultats
    setSaveMessage(null);
    setImportedCount(0);
  };

  // Handler pour l'import de valeurs depuis le PDF
  const handleLabImport = (values: Record<string, number>) => {
    // Fusionner avec les valeurs existantes (les nouvelles écrasent les anciennes)
    const currentValues = getValues();
    const mergedValues = { ...currentValues, ...values };
    reset(mergedValues);
    setResults(null);
    setSaveMessage(null);
    setImportedCount(Object.keys(values).length);
  };

  // Sauvegarde manuelle
  const handleSave = async () => {
    if (!patientId || !results) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/bdf/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          inputs: results.inputs,
          date: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      setSaveMessage({
        type: 'success',
        text: `Analyse BdF sauvegardee (${result.indexCount} index calcules, ${result.abnormalIndexCount} hors normes)`
      });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setSaving(false);
    }
  };

  // Retour vers la fiche patient
  const handleBack = () => {
    if (patientId) {
      router.push(`/patients/${patientId}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Bouton Retour */}
      <button
        type="button"
        onClick={handleBack}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
      >
        <span>&larr;</span> Retour
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Analyse Biologique Fonctionnelle (BdF)
        </h1>
        <p className="text-slate-600">
          Saisissez les valeurs biologiques pour générer l'analyse endobiogenique
        </p>
      </div>

      {/* BOUTON IMPORT PDF - MISE EN AVANT */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Importer un PDF de Laboratoire
        </button>
        {importedCount > 0 && (
          <div className="mt-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {importedCount} valeur(s) importee(s) depuis le PDF
          </div>
        )}
      </div>

      {/* BOUTONS DE PRÉ-REMPLISSAGE */}
      <div className="mb-6 flex flex-wrap gap-3">
        <span className="text-sm font-medium text-slate-600 self-center">Cas de test:</span>
        {Object.entries(TEST_CASES).map(([key, testCase]) => (
          <button
            key={key}
            type="button"
            onClick={() => loadTestCase(key as keyof typeof TEST_CASES)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-300"
          >
            {testCase.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => { reset({}); setImportedCount(0); }}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-500 rounded-lg text-sm font-medium transition-colors border border-slate-300"
        >
          Reinitialiser
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* GRILLE DES CATÉGORIES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map(cat => {
            const biomarkersInCategory = BIOMARKERS.filter(b => b.category === cat);

            // Ne pas afficher les catégories vides
            if (biomarkersInCategory.length === 0) return null;

            return (
              <div
                key={cat}
                className={`p-6 rounded-xl shadow-sm border-2 ${CATEGORY_COLORS[cat] || 'border-slate-200 bg-white'}`}
              >
                <h3 className="text-lg font-bold mb-4 text-slate-800">
                  {CATEGORY_LABELS[cat] || cat}
                </h3>
                <div className="space-y-3">
                  {biomarkersInCategory.map(bio => (
                    <div key={bio.id} className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium text-slate-700 flex-1">
                        {bio.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          {...register(bio.id)}
                          type="number"
                          step="any"
                          placeholder="—"
                          className="w-28 p-2 border border-slate-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <span className="text-xs text-slate-500 w-12 text-left font-mono">
                          {bio.unit || ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="flex gap-4 flex-wrap">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CALCUL EN COURS...' : 'CALCULER LES INDEX'}
          </button>

          {/* Bouton Sauvegarder - visible uniquement si patientId et résultats */}
          {patientId && results && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="min-w-[200px] bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'SAUVEGARDE...' : 'SAUVEGARDER'}
            </button>
          )}
        </div>

        {/* Message de sauvegarde */}
        {saveMessage && (
          <div className={`p-4 rounded-xl font-medium ${
            saveMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border-2 border-green-200'
              : 'bg-red-50 text-red-800 border-2 border-red-200'
          }`}>
            {saveMessage.text}
          </div>
        )}
      </form>

      {/* AFFICHAGE DES RÉSULTATS AVEC LES 7 PANELS */}
      <BdfResultsView result={results} />

      {/* MODAL D'IMPORT PDF */}
      <LabImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleLabImport}
      />
    </div>
  );
}
