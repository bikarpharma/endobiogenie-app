// components/interrogatoire/SyntheseUnifiee.tsx
// Composant pour déclencher et afficher la synthèse IA unifiée

"use client";

import { useState } from "react";
import type { DiagnosticResponse } from "@/lib/ai/assistantDiagnostic";

interface SyntheseUnifieeProps {
  patientId: string;
  patientNom: string;
  hasInterrogatoire: boolean;
  hasBdf: boolean;
  // Nouvelles props pour la complétion de l'interrogatoire
  interrogatoireCompletion?: {
    questionsRemplies: number;
    questionsTotal: number;
    axesRemplis: number;
    axesTotal: number;
  };
}

type ViewState = "idle" | "loading" | "success" | "error";

export function SyntheseUnifiee({
  patientId,
  patientNom,
  hasInterrogatoire,
  hasBdf,
  interrogatoireCompletion
}: SyntheseUnifieeProps) {
  const [viewState, setViewState] = useState<ViewState>("idle");
  const [diagnostic, setDiagnostic] = useState<DiagnosticResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // État pour inclure/exclure l'interrogatoire (coché par défaut si disponible)
  const [includeInterrogatoire, setIncludeInterrogatoire] = useState(hasInterrogatoire);

  // Déterminer le type de synthèse selon les choix
  const effectiveHasInterro = hasInterrogatoire && includeInterrogatoire;
  const canGenerate = effectiveHasInterro || hasBdf;
  const syntheseType = effectiveHasInterro && hasBdf
    ? "unifiee"
    : effectiveHasInterro
      ? "interro_seule"
      : "bdf_seule";

  // Calcul du pourcentage de complétion
  const completionPercent = interrogatoireCompletion
    ? Math.round((interrogatoireCompletion.questionsRemplies / interrogatoireCompletion.questionsTotal) * 100)
    : 0;

  // Générer la synthèse
  const handleGenerate = async () => {
    if (!canGenerate) return;

    setViewState("loading");
    setError(null);
    setShowModal(true);

    try {
      const response = await fetch("/api/patient/unified-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          includeInterrogatoire: effectiveHasInterro, // Passer le choix à l'API
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      setDiagnostic(data.diagnostic);
      setViewState("success");
    } catch (err) {
      setError((err as Error).message);
      setViewState("error");
    }
  };

  // Fermer le modal
  const handleClose = () => {
    setShowModal(false);
    // Garder les résultats pour pouvoir rouvrir
  };

  // Réessayer
  const handleRetry = () => {
    handleGenerate();
  };

  return (
    <>
      {/* Bouton de déclenchement */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🧠</span>
          <h3 className="text-lg font-bold">Synthèse IA</h3>
        </div>

        {/* Status des données avec checkbox */}
        <div className="text-sm mb-3 space-y-2">
          {/* Interrogatoire - avec checkbox si disponible */}
          <div className="flex items-center gap-2">
            {hasInterrogatoire ? (
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeInterrogatoire}
                  onChange={(e) => setIncludeInterrogatoire(e.target.checked)}
                  className="w-4 h-4 rounded border-white/50 bg-white/20 text-indigo-300 focus:ring-indigo-300 focus:ring-offset-0 cursor-pointer"
                />
                <span className={includeInterrogatoire ? "opacity-100" : "opacity-60 line-through"}>
                  Interrogatoire
                </span>
              </label>
            ) : (
              <div className="flex items-center gap-2 opacity-60">
                <span>⬜</span>
                <span>Interrogatoire</span>
              </div>
            )}
            {/* Badge de complétion */}
            {hasInterrogatoire && interrogatoireCompletion && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                completionPercent === 100
                  ? "bg-green-400/30 text-green-100"
                  : completionPercent >= 50
                    ? "bg-yellow-400/30 text-yellow-100"
                    : "bg-red-400/30 text-red-100"
              }`}>
                {interrogatoireCompletion.questionsRemplies}/{interrogatoireCompletion.questionsTotal} questions
                ({completionPercent}%)
              </span>
            )}
          </div>

          {/* BdF - toujours affiché en lecture seule */}
          <div className="flex items-center gap-2">
            <span>{hasBdf ? "✅" : "⬜"}</span>
            <span className={hasBdf ? "opacity-100" : "opacity-60"}>
              Biologie des Fonctions
            </span>
          </div>
        </div>

        {/* Info si interrogatoire décoché */}
        {hasInterrogatoire && !includeInterrogatoire && (
          <div className="text-xs bg-white/10 rounded-lg p-2 mb-3 opacity-90">
            ℹ️ L'interrogatoire ne sera pas inclus dans la synthèse
          </div>
        )}

        {/* Type de synthèse */}
        {canGenerate && (
          <div className="text-xs opacity-75 mb-3">
            {syntheseType === "unifiee" && "🎯 Synthèse unifiée (confiance maximale)"}
            {syntheseType === "interro_seule" && "📋 Synthèse interrogatoire seul"}
            {syntheseType === "bdf_seule" && "🔬 Synthèse BdF seule"}
          </div>
        )}

        {/* Bouton */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || viewState === "loading"}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
            canGenerate
              ? "bg-white text-indigo-600 hover:bg-indigo-50 active:scale-98"
              : "bg-white/30 text-white/70 cursor-not-allowed"
          }`}
        >
          {viewState === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Analyse en cours...
            </span>
          ) : diagnostic ? (
            "🔄 Régénérer la synthèse"
          ) : (
            "✨ Générer la synthèse IA"
          )}
        </button>

        {/* Voir résultats existants */}
        {diagnostic && viewState !== "loading" && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full mt-2 py-2 px-4 rounded-lg text-sm bg-white/20 hover:bg-white/30 transition-all"
          >
            👁️ Voir la synthèse
          </button>
        )}

        {!canGenerate && (
          <p className="text-xs opacity-75 mt-2">
            Remplissez au moins l'interrogatoire ou la BdF pour générer une synthèse.
          </p>
        )}
      </div>

      {/* Modal des résultats */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header - Toujours visible */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold">🧠 Synthèse IA Endobiogénique</h2>
                <p className="text-sm opacity-90">{patientNom}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  ← Fermer
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              {viewState === "loading" && <LoadingState />}
              {viewState === "error" && <ErrorState error={error} onRetry={handleRetry} />}
              {viewState === "success" && diagnostic && (
                <DiagnosticDisplay diagnostic={diagnostic} />
              )}
            </div>

            {/* Footer avec bouton Fermer */}
            {viewState === "success" && (
              <div className="border-t p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors font-semibold"
                >
                  Fermer la synthèse
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ========================================
// COMPOSANTS INTERNES
// ========================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin text-6xl mb-4">🧬</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Analyse en cours...
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        L'assistant GPT analyse les données selon la méthodologie endobiogénique 
        Duraffourd/Lapraz. Cela peut prendre jusqu'à 30 secondes.
      </p>
      <div className="mt-6 flex gap-2">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-6xl mb-4">❌</div>
      <h3 className="text-xl font-semibold text-red-600 mb-2">
        Erreur lors de l'analyse
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-4">
        {error || "Une erreur inattendue s'est produite."}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        🔄 Réessayer
      </button>
    </div>
  );
}

function DiagnosticDisplay({ diagnostic }: { diagnostic: DiagnosticResponse }) {
  return (
    <div className="space-y-6">
      {/* Confiance globale */}
      <div className="flex items-center justify-between bg-slate-100 rounded-lg p-3">
        <span className="text-sm font-medium text-slate-700">Niveau de confiance</span>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                diagnostic.confidenceScore >= 0.8 ? "bg-green-500" :
                diagnostic.confidenceScore >= 0.6 ? "bg-yellow-500" :
                "bg-red-500"
              }`}
              style={{ width: `${diagnostic.confidenceScore * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold">{Math.round(diagnostic.confidenceScore * 100)}%</span>
        </div>
      </div>

      {/* Warnings */}
      {diagnostic.warnings && diagnostic.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            ⚠️ Alertes importantes
          </h4>
          <ul className="space-y-1">
            {diagnostic.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-amber-700">• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Terrain */}
      <section className="bg-white border rounded-xl p-4">
        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          🎯 Terrain
        </h4>
        <p className="text-slate-700 leading-relaxed mb-3">
          {diagnostic.terrain.description}
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-2">
            <span className="text-slate-500">Axe dominant:</span>
            <span className="ml-2 font-semibold">{diagnostic.terrain.axeDominant}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <span className="text-slate-500">Profil SNA:</span>
            <span className="ml-2 font-semibold">{diagnostic.terrain.profilSNA}</span>
          </div>
        </div>
      </section>

      {/* Axes endocriniens */}
      {diagnostic.axesEndocriniens && diagnostic.axesEndocriniens.length > 0 && (
        <section className="bg-white border rounded-xl p-4">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            📊 Axes endocriniens (par priorité)
          </h4>
          <div className="space-y-3">
            {diagnostic.axesEndocriniens.map((axe, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border-l-4 ${
                  axe.status === "Hypo" ? "bg-blue-50 border-blue-500" :
                  axe.status === "Hyper" ? "bg-red-50 border-red-500" :
                  "bg-green-50 border-green-500"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{axe.rang}. {axe.axe}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    axe.status === "Hypo" ? "bg-blue-200 text-blue-800" :
                    axe.status === "Hyper" ? "bg-red-200 text-red-800" :
                    "bg-green-200 text-green-800"
                  }`}>
                    {axe.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{axe.mecanisme}</p>
                <p className="text-xs text-slate-500 mt-1 italic">
                  → {axe.implication_therapeutique}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Concordances */}
      {diagnostic.concordances && diagnostic.concordances.length > 0 && (
        <section className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            ✅ Concordances BdF ↔ Interrogatoire
          </h4>
          <div className="space-y-2">
            {diagnostic.concordances.map((conc, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 text-sm">
                <div className="font-semibold text-green-700 mb-1">{conc.axe}: {conc.observation}</div>
                <div className="text-slate-600">
                  <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">BdF</span> {conc.source_bdf}
                </div>
                <div className="text-slate-600">
                  <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">Interro</span> {conc.source_interro}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Confiance: {Math.round(conc.confiance * 100)}%
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Discordances */}
      {diagnostic.discordances && diagnostic.discordances.length > 0 && (
        <section className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
            ⚠️ Discordances à investiguer
          </h4>
          <div className="space-y-2">
            {diagnostic.discordances.map((disc, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 text-sm">
                <div className="font-semibold text-orange-700 mb-1">{disc.axe}</div>
                <div className="text-slate-600">
                  <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">BdF</span> {disc.source_bdf}
                </div>
                <div className="text-slate-600">
                  <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">Interro</span> {disc.source_interro}
                </div>
                <div className="text-xs text-orange-600 mt-1 italic">
                  → {disc.recommandation}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Spasmophilie */}
      {diagnostic.spasmophilie.detectee && (
        <section className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            ⚡ Spasmophilie détectée
          </h4>
          <div className="text-sm text-purple-700">
            <p className="font-semibold">{diagnostic.spasmophilie.type_probable}</p>
            <p className="text-xs mt-1">Probabilité: {Math.round((diagnostic.spasmophilie.probabilite || 0) * 100)}%</p>
            {diagnostic.spasmophilie.arguments && (
              <ul className="mt-2 space-y-1">
                {diagnostic.spasmophilie.arguments.map((arg, idx) => (
                  <li key={idx} className="text-xs">• {arg}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Drainage */}
      {diagnostic.drainage.necessaire && (
        <section className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
            🌿 Drainage recommandé
          </h4>
          <div className="text-sm">
            {/* N'afficher la priorité que si urgent ou modérée - pas besoin de mentionner "faible" */}
            {diagnostic.drainage.priorite && diagnostic.drainage.priorite !== "faible" && (
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                diagnostic.drainage.priorite === "urgent" ? "bg-red-200 text-red-800" :
                diagnostic.drainage.priorite === "modere" ? "bg-yellow-200 text-yellow-800" :
                "bg-green-200 text-green-800"
              }`}>
                {diagnostic.drainage.priorite === "urgent"
                  ? "⚠️ Drainage prioritaire"
                  : diagnostic.drainage.priorite === "modere"
                    ? "Drainage recommandé"
                    : ""}
              </span>
            )}
            {diagnostic.drainage.emonctoires_prioritaires && (
              <div className="mt-3 space-y-2">
                {diagnostic.drainage.emonctoires_prioritaires.map((em: any, idx) => {
                  // Gérer le cas où em.emonctoire est un objet ou une string
                  const emonctaireName = typeof em.emonctoire === 'string'
                    ? em.emonctoire
                    : em.emonctoire?.name || em.emonctoire?.nom || em.nom || em.name || "Émonctoire";

                  // Gérer le cas où em.justification est un objet
                  const justification = typeof em.justification === 'string'
                    ? em.justification
                    : em.justification?.text || em.raison || "";

                  // Gérer le cas où em.plantes est un tableau d'objets, de strings, ou autre
                  const formatPlantes = (plantes: any): string => {
                    if (!plantes) return "Non spécifié";
                    if (typeof plantes === 'string') return plantes;
                    if (Array.isArray(plantes)) {
                      return plantes.map(p => {
                        if (typeof p === 'string') return p;
                        if (p && typeof p === 'object') {
                          return p.name || p.nom || p.plante || p.label || JSON.stringify(p);
                        }
                        return String(p);
                      }).join(", ");
                    }
                    if (typeof plantes === 'object') {
                      return plantes.name || plantes.nom || JSON.stringify(plantes);
                    }
                    return String(plantes);
                  };

                  return (
                    <div key={idx} className="bg-white rounded-lg p-2">
                      <span className="font-semibold capitalize">{emonctaireName}</span>
                      {justification && <p className="text-xs text-slate-600">{justification}</p>}
                      <p className="text-xs text-teal-600 mt-1">
                        Plantes: {formatPlantes(em.plantes)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Synthèse pour praticien */}
      <section className="bg-slate-800 text-white rounded-xl p-4">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          📝 Synthèse pour le praticien
        </h4>
        <p className="text-sm leading-relaxed">
          {diagnostic.synthese_pour_praticien}
        </p>
      </section>

      {/* Examens complémentaires */}
      {diagnostic.examens_complementaires && diagnostic.examens_complementaires.length > 0 && (
        <section className="bg-white border rounded-xl p-4">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            🔬 Examens complémentaires suggérés
          </h4>
          <ul className="space-y-1">
            {diagnostic.examens_complementaires.map((exam, idx) => (
              <li key={idx} className="text-sm text-slate-700">• {exam}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default SyntheseUnifiee;