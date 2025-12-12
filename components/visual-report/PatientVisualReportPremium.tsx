/**
 * 🏆 RAPPORT VISUEL PATIENT - VERSION PREMIUM
 * 
 * Page complète de synthèse visuelle du terrain endobiogénique.
 * Intègre le BodyMapPremium avec gestion du chargement et états.
 * 
 * Caractéristiques:
 * - Chargement automatique de la synthèse IA
 * - État vide élégant si pas de synthèse
 * - Affichage premium du corps humain interactif
 * - Panneau pédagogique intégré
 */

"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Info, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BodyMapPremium from "./BodyMapPremium";
import type { UnifiedAnalysisOutput } from "@/types/clinical-engine";

// ============================================
// TYPES
// ============================================

interface PatientVisualReportPremiumProps {
  patientId: string;
  patientName: string;
  onNavigateToSynthese?: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function PatientVisualReportPremium({
  patientId,
  patientName,
  onNavigateToSynthese
}: PatientVisualReportPremiumProps) {
  const [synthesis, setSynthesis] = useState<UnifiedAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ════════════════════════════════════════════════════════════════
  // CHARGEMENT DE LA SYNTHÈSE IA
  // ════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    const loadSynthesis = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/unified-synthesis?patientId=${patientId}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            // Pas de synthèse - c'est normal, on affiche le message
            setSynthesis(null);
          } else {
            throw new Error(`Erreur ${res.status}`);
          }
        } else {
          const data = await res.json();
          if (data.synthesis?.content) {
            setSynthesis(data.synthesis.content as UnifiedAnalysisOutput);
          }
        }
      } catch (err: any) {
        console.error("Erreur chargement synthèse IA:", err);
        setError(err.message || "Impossible de charger la synthèse");
      } finally {
        setLoading(false);
      }
    };

    loadSynthesis();
  }, [patientId]);

  // ════════════════════════════════════════════════════════════════
  // ÉTATS DE L'INTERFACE
  // ════════════════════════════════════════════════════════════════

  // État de chargement
  if (loading) {
    return (
      <div className="h-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800/50">
        <div className="text-center">
          {/* Loader premium */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <Activity className="absolute inset-0 m-auto w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-slate-400 font-medium">Chargement de la synthèse IA...</p>
          <p className="text-slate-600 text-sm mt-2">Analyse du terrain endobiogénique</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="h-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-red-900/30">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Erreur de chargement</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Pas de synthèse IA disponible
  if (!synthesis) {
    return (
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800/50 p-8">
        <div className="text-center max-w-lg">
          
          {/* Animation d'icône */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 bg-indigo-500/5 rounded-full animate-pulse" />
            <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-2 border-indigo-500/30 shadow-xl shadow-indigo-500/10">
              <Sparkles className="w-12 h-12 text-indigo-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Synthèse IA Requise
          </h2>

          <p className="text-slate-400 mb-8 leading-relaxed">
            Le <span className="text-indigo-400 font-semibold">Rapport Visuel Premium</span> affiche 
            une cartographie interactive de votre terrain endobiogénique basée sur la 
            <span className="text-indigo-400 font-semibold"> Synthèse IA</span>.
          </p>

          {/* Étapes */}
          <div className="bg-slate-900/50 rounded-xl p-6 mb-8 border border-slate-800/50 text-left">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Info size={16} className="text-indigo-400" />
              Pour activer cette fonctionnalité :
            </h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-sm font-bold border border-indigo-500/30">
                  1
                </span>
                <span className="text-slate-300 pt-1">
                  Rendez-vous dans l'onglet <strong className="text-white">Synthèse</strong>
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-sm font-bold border border-indigo-500/30">
                  2
                </span>
                <span className="text-slate-300 pt-1">
                  Cliquez sur <strong className="text-white">Synthèse IA Approfondie</strong>
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-sm font-bold border border-indigo-500/30">
                  3
                </span>
                <span className="text-slate-300 pt-1">
                  Revenez ici pour explorer le rapport visuel interactif
                </span>
              </li>
            </ol>
          </div>

          {onNavigateToSynthese && (
            <Button
              onClick={onNavigateToSynthese}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105"
            >
              Aller à l'onglet Synthèse
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}

          <p className="text-xs text-slate-600 mt-8">
            💡 La visualisation garantit une cohérence parfaite avec l'analyse clinique IA
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // AFFICHAGE PRINCIPAL - SYNTHÈSE DISPONIBLE
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800/50 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Synthèse Visuelle
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[10px]">
                PREMIUM
              </Badge>
            </h2>
            <p className="text-sm text-slate-400">
              {patientName} • Corrélation anatomo-physiologique
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Indicateur de confiance */}
          {synthesis.meta?.confidenceScore && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400">Confiance IA</span>
              <span className={`text-sm font-bold ${
                synthesis.meta.confidenceScore >= 0.7 ? 'text-emerald-400' :
                synthesis.meta.confidenceScore >= 0.4 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {Math.round(synthesis.meta.confidenceScore * 100)}%
              </span>
            </div>
          )}
          
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Synthèse IA
          </Badge>
        </div>
      </div>

      {/* CONTENU PRINCIPAL - BODYMAP PREMIUM */}
      <div className="flex-1 p-4 overflow-hidden">
        <BodyMapPremium synthesis={synthesis} />
      </div>

      {/* FOOTER avec terrain résumé */}
      {synthesis.terrain && (
        <div className="px-6 py-3 border-t border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Terrain</span>
              <Badge className={`
                ${synthesis.terrain.axeDominant === 'Corticotrope' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  synthesis.terrain.axeDominant === 'Thyréotrope' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  synthesis.terrain.axeDominant === 'Gonadotrope' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                  synthesis.terrain.axeDominant === 'Somatotrope' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  'bg-purple-500/20 text-purple-400 border-purple-500/30'
                }
              `}>
                Axe {synthesis.terrain.axeDominant}
              </Badge>
              <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/30">
                {synthesis.terrain.profilSNA}
              </Badge>
            </div>
            
            <p className="text-xs text-slate-500 max-w-lg truncate">
              {synthesis.terrain.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
