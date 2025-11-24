"use client";

import { useForm } from "react-hook-form";
import { BIOMARKERS } from "@/lib/bdf/biomarkers/biomarkers.config";
import { calculateAllIndexes } from "@/lib/bdf/calculateIndexes";
import { useState } from "react";
import BdfResultsView from "./BdfResultsView";

// Mapping des catégories vers des labels français
const CATEGORY_LABELS: Record<string, string> = {
  hematology: "Hématologie (NFS)",
  ion: "Ionogramme",
  enzyme: "Enzymes",
  hormone: "Hormones",
  bone: "Métabolisme Osseux",
  tumor: "Marqueurs Tumoraux"
};

// Couleurs Tailwind par catégorie
const CATEGORY_COLORS: Record<string, string> = {
  hematology: "border-red-200 bg-red-50",
  ion: "border-blue-200 bg-blue-50",
  enzyme: "border-amber-200 bg-amber-50",
  hormone: "border-purple-200 bg-purple-50",
  bone: "border-emerald-200 bg-emerald-50",
  tumor: "border-rose-200 bg-rose-50"
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
}

export default function BdfInputForm({ patientId }: BdfInputFormProps = {}) {
  const { register, handleSubmit, reset } = useForm();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Liste des catégories à afficher (dans l'ordre souhaité)
  const categories = ["hematology", "ion", "enzyme", "hormone", "bone", "tumor"];

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

    // ✅ SAUVEGARDE AUTOMATIQUE si patientId fourni
    if (patientId) {
      setSaving(true);
      try {
        const response = await fetch('/api/bdf/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            inputs: cleanData,
            date: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde');
        }

        const result = await response.json();
        setSaveMessage({
          type: 'success',
          text: `✅ Analyse BdF sauvegardée automatiquement (${result.indexCount} index calculés, ${result.abnormalIndexCount} hors normes)`
        });
      } catch (error) {
        setSaveMessage({ type: 'error', text: '⚠️ Erreur lors de la sauvegarde automatique.' });
      } finally {
        setSaving(false);
      }
    }
  };

  const loadTestCase = (caseKey: keyof typeof TEST_CASES) => {
    reset(TEST_CASES[caseKey].data);
    setResults(null); // Réinitialiser les résultats
    setSaveMessage(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Analyse Biologique Fonctionnelle (BdF)
        </h1>
        <p className="text-slate-600">
          Saisissez les valeurs biologiques pour générer l'analyse endobiogénique
        </p>
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
          onClick={() => reset({})}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-500 rounded-lg text-sm font-medium transition-colors border border-slate-300"
        >
          Réinitialiser
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
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CALCUL EN COURS...' : saving ? 'CALCUL & SAUVEGARDE...' : 'CALCULER LES INDEX 🧬'}
          </button>
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

      {/* JSON brut (pour debug technique) - Accordéon replié */}
      {results && (
        <details className="mt-6 bg-slate-900 text-green-400 rounded-xl overflow-auto">
          <summary className="cursor-pointer p-4 text-white font-mono text-sm hover:bg-slate-800 transition">
            🔍 Voir le JSON brut (Debug technique)
          </summary>
          <pre className="p-6 text-xs overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
