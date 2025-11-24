"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Target,
  Leaf,
  Heart,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Lightbulb,
} from "lucide-react";

interface SyntheseGlobale {
  id: string;
  terrainDominant: string;
  prioritesTherapeutiques: string[];
  axesPrincipaux: string[];
  mecanismesCommuns: string[];
  plantesMajeures: string[];
  hygieneDeVie: string[];
  signesDAlarme: string[];
  pronostic: string;
  resumeGlobal: string;
  nombreAxesAnalyses: number;
  inclusBiologieFonction: boolean;
  confiance: number;
  createdAt: string;
}

interface SyntheseGlobaleCardProps {
  synthese: SyntheseGlobale | null;
  loading?: boolean;
}

export default function SyntheseGlobaleCard({ synthese, loading }: SyntheseGlobaleCardProps) {
  if (loading) {
    return (
      <Card className="border-2 border-purple-300 bg-purple-50/30">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">Génération de la synthèse globale...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!synthese) {
    return (
      <Card className="border-2 border-dashed border-purple-300 bg-purple-50/10">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-16 w-16 text-purple-400 mb-4" />
          <CardTitle className="mb-2 text-purple-900">Synthèse Globale non disponible</CardTitle>
          <CardDescription className="max-w-md">
            Cliquez sur "🧠 SYNTHÈSE GLOBALE" pour générer une interprétation holistique du terrain endobiogénique
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
      {/* EN-TÊTE */}
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl">SYNTHÈSE ENDOBIOGÉNIQUE GLOBALE</CardTitle>
              <CardDescription className="text-purple-100 mt-1">
                Analyse transversale de {synthese.nombreAxesAnalyses} axes cliniques
                {synthese.inclusBiologieFonction && " + Biologie Fonctionnelle"}
              </CardDescription>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="flex items-center gap-1 text-purple-100">
              <Calendar className="h-3 w-3" />
              {new Date(synthese.createdAt).toLocaleDateString('fr-FR')}
            </div>
            <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
              Confiance: {(synthese.confiance * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* RÉSUMÉ GLOBAL */}
        <Alert className="bg-purple-100 border-purple-400">
          <Lightbulb className="h-5 w-5 text-purple-700" />
          <AlertDescription className="text-base font-medium text-purple-900">
            {synthese.resumeGlobal}
          </AlertDescription>
        </Alert>

        {/* TERRAIN DOMINANT */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-bold text-purple-900">Terrain Dominant</h3>
          </div>
          <p className="text-foreground bg-white p-4 rounded-lg border border-purple-200">
            {synthese.terrainDominant}
          </p>
        </div>

        <Separator />

        {/* AXES PRINCIPAUX */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-bold text-purple-900">Axes Principaux Perturbés</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {synthese.axesPrincipaux.map((axe, idx) => (
              <Badge key={idx} variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                {axe}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* PRIORITÉS THÉRAPEUTIQUES */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-rose-600" />
            <h3 className="text-lg font-bold text-rose-900">Priorités Thérapeutiques</h3>
          </div>
          <div className="space-y-2">
            {synthese.prioritesTherapeutiques.map((priorite, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-rose-200">
                <Badge className="bg-rose-600 shrink-0">{idx + 1}</Badge>
                <p className="text-sm text-foreground">{priorite}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* MÉCANISMES COMMUNS */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-pink-600" />
            <h3 className="text-lg font-bold text-pink-900">Mécanismes Transversaux</h3>
          </div>
          <ul className="space-y-2">
            {synthese.mecanismesCommuns.map((mecanisme, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm bg-pink-50 p-2 rounded border border-pink-200">
                <span className="text-pink-600 font-bold shrink-0">•</span>
                <span className="text-foreground">{mecanisme}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* PLANTES MAJEURES */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-emerald-900">Plantes Majeures Recommandées</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {synthese.plantesMajeures.map((plante, idx) => (
              <div key={idx} className="bg-emerald-50 p-3 rounded-lg border border-emerald-300">
                <p className="text-sm font-medium text-emerald-900">{plante}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* HYGIÈNE DE VIE */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Conseils Hygiéno-Diététiques</h3>
          </div>
          <ul className="space-y-2">
            {synthese.hygieneDeVie.map((conseil, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                <span className="text-blue-600 font-bold shrink-0">✓</span>
                <span className="text-foreground">{conseil}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* SIGNES D'ALARME */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-bold text-orange-900">Signes d'Alarme à Surveiller</h3>
          </div>
          <Alert variant="destructive" className="bg-orange-50 border-orange-400">
            <AlertTriangle className="h-4 w-4 text-orange-700" />
            <AlertDescription>
              <ul className="space-y-1 mt-2">
                {synthese.signesDAlarme.map((signe, idx) => (
                  <li key={idx} className="text-sm text-orange-900">
                    • {signe}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        {/* PRONOSTIC */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-indigo-900">Pronostic & Évolution</h3>
          </div>
          <p className="text-foreground bg-indigo-50 p-4 rounded-lg border border-indigo-300">
            {synthese.pronostic}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
