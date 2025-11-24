"use client";

import React from "react";
import type { BdfResult } from "@/lib/bdf/calculateIndexes";
import type { AxeInterpretation, AxeType } from "@/lib/interrogatoire/axeInterpretation";
import { AXE_LABELS, AXE_EMOJIS } from "@/lib/interrogatoire/axeInterpretation";
import { INDEXES } from "@/lib/bdf/indexes/indexes.config";
import { PANELS } from "@/lib/bdf/panels/panels.config";

interface ClinicalSynthesisViewProps {
  // Données de l'interrogatoire avec scores calculés
  axeScores?: Array<{
    axe: AxeType;
    score: number;
    status: "critical" | "warning" | "normal";
  }>;

  // Interprétations IA des axes (si déjà générées)
  axeInterpretations?: AxeInterpretation[];

  // Données BdF
  bdfData?: BdfResult | null;

  // Callbacks
  onGenerateSynthesis?: () => void;
}

// Helper pour déterminer la couleur du badge de score
const getScoreColor = (status: "critical" | "warning" | "normal") => {
  switch (status) {
    case "critical":
      return "bg-red-100 text-red-700 border-red-300";
    case "warning":
      return "bg-orange-100 text-orange-700 border-orange-300";
    case "normal":
      return "bg-green-100 text-green-700 border-green-300";
  }
};

// Helper pour déterminer le statut basé sur le score
const getStatusFromScore = (score: number): "critical" | "warning" | "normal" => {
  if (score >= 70) return "critical";
  if (score >= 40) return "warning";
  return "normal";
};

// Helper pour les badges de status BdF
const getBdfStatusBadge = (status: string) => {
  switch (status) {
    case "low":
      return <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-bold">BAS</span>;
    case "high":
      return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-bold">HAUT</span>;
    case "normal":
      return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">OK</span>;
    default:
      return null;
  }
};

export default function ClinicalSynthesisView({
  axeScores = [],
  axeInterpretations = [],
  bdfData = null,
  onGenerateSynthesis
}: ClinicalSynthesisViewProps) {

  // Trier les axes par score décroissant et prendre les 3 premiers
  const topAxes = [...axeScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Extraire les index BdF hors normes
  const abnormalIndexes = bdfData?.indexes
    ? Object.entries(bdfData.indexes)
        .filter(([_, val]: any) => val.status !== "normal" && val.status !== "unknown")
        .map(([key, val]: any) => ({
          id: key,
          label: INDEXES.find(i => i.id === key)?.label || key,
          value: val.value,
          status: val.status,
          interpretation: val.interpretation
        }))
    : [];

  // Vérifier si on a des données
  const hasInterrogatoireData = topAxes.length > 0;
  const hasBdfData = bdfData !== null;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* EN-TÊTE PRINCIPAL */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-slate-800 flex items-center justify-center gap-3">
          ⚖️ SYNTHÈSE CLINIQUE & DÉCISION
        </h1>
        <p className="text-slate-600 text-lg">
          Vue croisée : Symptômes (Subjectif) × Biologie (Objectif) = Décision Thérapeutique
        </p>
      </div>

      {/* GRILLE 3 COLONNES : CLINIQUE + BIOLOGIE + IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ==================== COLONNE 1 : SYMPTÔMES (Subjectif) ==================== */}
        <div className="border-2 border-orange-300 rounded-xl shadow-lg overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              🔍 CLINIQUE (Symptômes)
            </h2>
            <p className="text-orange-100 text-sm mt-2">
              Analyse de l'interrogatoire endobiogénique
            </p>
          </div>

          <div className="p-6 space-y-6">
            {hasInterrogatoireData ? (
              <>
                <div>
                  <h3 className="font-bold text-slate-700 mb-4 text-lg">
                    📊 Top 3 des Axes Prioritaires :
                  </h3>
                  <div className="space-y-3">
                    {topAxes.map((axe, i) => (
                      <div
                        key={axe.axe}
                        className="flex justify-between items-center p-4 bg-slate-50 border-2 border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{AXE_EMOJIS[axe.axe]}</span>
                          <div>
                            <div className="font-semibold text-slate-800">
                              #{i + 1} {AXE_LABELS[axe.axe]}
                            </div>
                            {axeInterpretations.find(int => int.axe === axe.axe)?.orientation && (
                              <div className="text-xs text-slate-600 italic mt-1">
                                {axeInterpretations.find(int => int.axe === axe.axe)?.orientation}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getScoreColor(axe.status)}`}>
                            {axe.score}%
                          </span>
                          {axe.status === "critical" && (
                            <span className="text-xs text-red-600 font-semibold">CRITIQUE</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags critiques détectés */}
                {axeInterpretations.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-700 mb-3 text-sm">
                      🏷️ Tags Cliniques Détectés :
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {axeInterpretations
                        .slice(0, 3)
                        .flatMap(int => int.mecanismes.slice(0, 2))
                        .map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold border border-orange-300"
                          >
                            {tag}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-20">📋</div>
                <p className="text-slate-400 font-medium">
                  Aucune donnée d'interrogatoire disponible
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Remplissez le questionnaire clinique pour voir les axes prioritaires
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ==================== COLONNE 2 : BIOLOGIE (Objectif) ==================== */}
        <div className="border-2 border-blue-300 rounded-xl shadow-lg overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              💉 BIOLOGIE (Preuves)
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              Analyse fonctionnelle des biomarqueurs (BdF)
            </p>
          </div>

          <div className="p-6 space-y-6">
            {hasBdfData ? (
              <>
                <div>
                  <h3 className="font-bold text-slate-700 mb-4 text-lg">
                    🚨 Index Hors Normes :
                  </h3>
                  {abnormalIndexes.length > 0 ? (
                    <div className="space-y-3">
                      {abnormalIndexes.map((idx) => (
                        <div
                          key={idx.id}
                          className="flex justify-between items-center p-3 bg-slate-50 border-2 border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-slate-700 text-sm">
                              {idx.label}
                            </div>
                            {idx.interpretation && (
                              <div className="text-xs text-slate-500 italic mt-1">
                                → {idx.interpretation}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              {idx.value !== null ? idx.value.toFixed(2) : "—"}
                            </span>
                            {getBdfStatusBadge(idx.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-green-700 font-semibold">
                        Tous les index sont dans les normes
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Aucune anomalie biologique majeure détectée
                      </p>
                    </div>
                  )}
                </div>

                {/* Mini aperçu des 7 panels */}
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 text-sm">
                    📊 Aperçu des 7 Panels :
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PANELS.slice(0, 7).map((panel) => {
                      const panelIndexes = panel.indexes
                        .map(id => bdfData.indexes[id])
                        .filter(Boolean);

                      const hasAbnormal = panelIndexes.some((idx: any) =>
                        idx.status !== "normal" && idx.status !== "unknown"
                      );

                      return (
                        <div
                          key={panel.id}
                          className={`p-2 rounded border text-xs ${
                            hasAbnormal
                              ? 'bg-red-50 border-red-300 text-red-700 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          {panel.label.replace(/^\d+\.\s*/, '')}
                          {hasAbnormal && <span className="ml-1">⚠️</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-20">🧪</div>
                <p className="text-slate-400 font-medium">
                  Aucune donnée biologique disponible
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Saisissez les biomarqueurs dans le formulaire BdF
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ==================== COLONNE 3 : INTELLIGENCE IA ==================== */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl shadow-lg relative overflow-hidden">
        {/* Effet de fond décoratif */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            🤖 INTELLIGENCE IA
          </h2>
          <p className="text-slate-300 text-sm mt-2">
            Analyse croisée et ordonnance
          </p>
        </div>

        <div className="relative z-10 p-6">
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            L'IA va comparer les <strong className="text-orange-300">plaintes du patient</strong> (interrogatoire)
            avec sa <strong className="text-blue-300">biologie fonctionnelle</strong> (BdF) pour :
          </p>

          <ul className="text-slate-300 space-y-1 mb-6 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>Concordance clinico-biologique</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>Stratégie thérapeutique</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>Ordonnance endobiogénique</span>
            </li>
          </ul>

          <div className="space-y-3">
            <button
              onClick={onGenerateSynthesis}
              disabled={!hasInterrogatoireData && !hasBdfData}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✨ GÉNÉRER SYNTHÈSE
            </button>

            {!hasInterrogatoireData && !hasBdfData && (
              <div className="text-yellow-300 text-xs flex items-center gap-2 bg-yellow-900/30 px-3 py-2 rounded-lg">
                <span>⚠️</span>
                <span>Données manquantes</span>
              </div>
            )}
          </div>

          {/* Statistiques rapides */}
          <div className="mt-6 grid grid-cols-1 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-2xl font-bold text-orange-300">
                {topAxes.length}
              </div>
              <div className="text-xs text-slate-400">
                Axes Cliniques
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-2xl font-bold text-blue-300">
                {abnormalIndexes.length}
              </div>
              <div className="text-xs text-slate-400">
                Index Hors Normes
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-2xl font-bold text-purple-300">
                {bdfData?.metadata.biomarkersCount || 0}
              </div>
              <div className="text-xs text-slate-400">
                Biomarqueurs
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Note d'aide */}
      <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-6">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span>💡</span>
          Guide d'utilisation
        </h3>
        <div className="text-sm text-slate-600 space-y-2">
          <p>
            <strong>1.</strong> Complétez l'interrogatoire endobiogénique pour obtenir les scores des axes cliniques
          </p>
          <p>
            <strong>2.</strong> Saisissez les biomarqueurs dans le formulaire BdF pour calculer les index fonctionnels
          </p>
          <p>
            <strong>3.</strong> Cliquez sur "Générer la synthèse" pour obtenir l'analyse croisée par l'IA
          </p>
          <p>
            <strong>4.</strong> L'IA générera une proposition d'ordonnance basée sur l'endobiogénie
          </p>
        </div>
      </div>
    </div>
  );
}
