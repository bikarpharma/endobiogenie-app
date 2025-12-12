/**
 * ============================================================================
 * INTEGRIA - PRESCRIPTION CARD (Atome)
 * ============================================================================
 * Version 2.0 : Double Justification (Terrain + Classique Scientifique)
 * + Why Card Expandable + Design moderne
 *
 * PLACEMENT: /components/prescription/PrescriptionCard.tsx
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Leaf,
  Lightbulb,
  AlertCircle,
  Brain,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types (importés de tunisianAdapter)
import type { PlantOutput } from "@/lib/utils/tunisianAdapter";

interface PrescriptionCardProps {
  plant: PlantOutput;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ plant }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Style visuel selon le niveau d'alerte
  const getStatusStyle = () => {
    switch (plant.alert_level) {
      case 'CRITICAL': return "border-l-red-500 bg-red-50/50";
      case 'WARNING': return "border-l-amber-500 bg-amber-50/50";
      case 'INFO': return "border-l-blue-500 bg-blue-50/50";
      default: return "border-l-emerald-500 bg-white hover:bg-slate-50";
    }
  };

  // Détection de conversion
  const hasConversion = plant.adapted_form && plant.original_form !== plant.adapted_form;

  // Détermine les justifications à afficher
  const hasTerrainJustification = plant.justification_terrain || (plant.endo_covered && plant.justification);
  const hasClassicJustification = plant.justification_classique || (!plant.endo_covered && plant.justification);

  return (
    <Card className={cn(
      "mb-3 border-l-4 shadow-sm transition-all",
      getStatusStyle(),
      isExpanded ? "shadow-lg" : "hover:shadow-md"
    )}>
      <CardContent className="p-4">

        {/* === HEADER: Nom + Badges + Toggle === */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">

            {/* Ligne 1: Nom + Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Leaf className="w-4 h-4 text-slate-400 flex-shrink-0" />

              {/* Nom français + latin */}
              <h4 className="font-bold text-lg text-slate-800">
                {plant.name_fr || plant.name_latin}
              </h4>
              {plant.name_fr && (
                <span className="text-sm text-slate-500 italic">
                  ({plant.name_latin})
                </span>
              )}

              {/* Badge Disponibilité */}
              {plant.is_available_tunisia ? (
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] h-5">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Dispo 🇹🇳
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[10px] h-5">
                  <AlertCircle className="w-3 h-3 mr-1" /> Non Dispo
                </Badge>
              )}

              {/* Badge Adaptation */}
              {hasConversion && plant.is_available_tunisia && (
                <Badge variant="secondary" className="text-amber-700 bg-amber-100 border-amber-200 text-[10px] h-5">
                  <ArrowRightLeft className="w-3 h-3 mr-1" /> Adapté
                </Badge>
              )}

              {/* Badge Endo/Classique */}
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] h-5",
                  plant.endo_covered
                    ? "text-indigo-700 bg-indigo-50 border-indigo-200"
                    : "text-slate-500 bg-slate-50 border-slate-200"
                )}
              >
                {plant.endo_covered ? "🧬 Terrain" : "📚 Classique"}
              </Badge>

              {/* 🆕 Badge Voie Aromathérapie (si HE) */}
              {plant.voie_badge && (
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 font-bold"
                  style={{
                    backgroundColor: plant.voie_couleur ? `${plant.voie_couleur}20` : undefined,
                    borderColor: plant.voie_couleur || undefined,
                    color: plant.voie_couleur || undefined,
                  }}
                >
                  {plant.voie_badge === 'FOND' && '💧'}
                  {plant.voie_badge === 'AIGU' && '🔥'}
                  {plant.voie_badge === 'LOCAL' && '🎯'}
                  {plant.voie_badge === 'ORL' && '💨'}
                  {' '}{plant.voie_badge}
                </Badge>
              )}
            </div>

            {/* Ligne 2: Forme + Posologie */}
            <div className="pl-6 flex flex-col gap-2">
              {plant.is_available_tunisia ? (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100">
                      {plant.adapted_form || plant.form}
                    </span>
                    <span className="text-slate-700 font-medium">
                      {plant.adapted_dosage || plant.dosage}
                    </span>
                    {plant.duree && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {plant.duree}
                      </span>
                    )}
                  </div>

                  {/* Zone de Traçabilité (Si conversion) */}
                  {hasConversion && (
                    <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-100 w-fit px-2 py-1 rounded border border-slate-200">
                      <span className="line-through decoration-slate-400 opacity-70">
                        🇫🇷 {plant.original_form} ({plant.original_dosage})
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-600 font-medium">
                        🇹🇳 Adapté
                      </span>
                    </div>
                  )}

                  {/* Note de conversion si WARNING */}
                  {plant.conversion_note && plant.alert_level === 'WARNING' && (
                    <div className="text-xs text-amber-600 font-medium flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-200 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      {plant.conversion_note}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-600 text-sm font-medium italic">
                    ⛔ Aucun équivalent dans le catalogue tunisien
                  </p>

                  {/* Alternatives suggérées */}
                  {plant.alternatives && plant.alternatives.length > 0 && (
                    <div className="text-xs bg-amber-50 px-2 py-1.5 rounded border border-amber-200">
                      <span className="text-amber-700 font-medium">💡 Alternatives : </span>
                      <span className="text-amber-600">
                        {plant.alternatives.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bouton Expand/Collapse "Why Card" */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center gap-1 text-sm font-medium",
              isExpanded
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            )}
          >
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Pourquoi ?</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* === WHY CARD EXPANDABLE === */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-200">

            {/* Axe cible si disponible */}
            {plant.axe_cible && (
              <div className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-indigo-500" />
                <span className="font-medium text-indigo-700">Axe cible :</span>
                <span className="text-slate-700">{plant.axe_cible}</span>
              </div>
            )}

            {/* DOUBLE JUSTIFICATION */}
            <div className="grid md:grid-cols-2 gap-4">

              {/* Justification TERRAIN (Endobiogénie) */}
              {hasTerrainJustification && (
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    <h5 className="font-bold text-sm text-indigo-800 uppercase tracking-wide">
                      Logique Terrain
                    </h5>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    {plant.justification_terrain || plant.justification}
                  </p>
                </div>
              )}

              {/* Justification CLASSIQUE (Scientifique) */}
              {hasClassicJustification && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <h5 className="font-bold text-sm text-emerald-800 uppercase tracking-wide">
                      Base Scientifique
                    </h5>
                  </div>
                  <p className="text-sm text-emerald-900 leading-relaxed">
                    {plant.justification_classique || plant.justification}
                  </p>
                </div>
              )}
            </div>

            {/* Explication Patient (si disponible) */}
            {plant.explication_patient && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <h5 className="font-bold text-sm text-amber-800 uppercase tracking-wide">
                    Pour le patient
                  </h5>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed italic">
                  "{plant.explication_patient}"
                </p>
              </div>
            )}

            {/* Mécanisme d'action (si disponible) */}
            {plant.mecanisme && (
              <div className="text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded">
                <span className="font-medium">Mécanisme : </span>
                {plant.mecanisme}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrescriptionCard;
