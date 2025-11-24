"use client";

import { PANELS } from "@/lib/bdf/panels/panels.config";
import { INDEXES } from "@/lib/bdf/indexes/indexes.config";
import type { BdfResult, IndexStatus } from "@/lib/bdf/calculateIndexes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  Activity,
  Zap,
  Baby,
  TrendingUp,
  Apple,
  Shield,
  AlertCircle,
  Info,
  Calendar
} from "lucide-react";

// Mapping icônes par panel
const PANEL_ICONS: Record<string, any> = {
  neurovegetal: Brain,
  adaptation: Activity,
  thyrotrope: Zap,
  gonadotrope: Baby,
  somatotrope: TrendingUp,
  metabolique: Apple,
  immunitaire: Shield,
};

// Helper pour mapper les couleurs Tailwind par panel
const COLOR_CLASSES: Record<string, {
  bg: string;
  border: string;
  text: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}> = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    badgeVariant: "default",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    text: "text-purple-700",
    badgeVariant: "secondary",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    badgeVariant: "outline",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-300",
    text: "text-rose-700",
    badgeVariant: "destructive",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    badgeVariant: "default",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    badgeVariant: "outline",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    badgeVariant: "destructive",
  },
};

// Helper pour les variants de badges de status
const getStatusBadge = (status: IndexStatus) => {
  switch (status) {
    case "low":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">BAS</Badge>;
    case "high":
      return <Badge variant="destructive">HAUT</Badge>;
    case "normal":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">OK</Badge>;
    case "error":
      return <Badge variant="secondary">ERREUR</Badge>;
    case "unknown":
      return <Badge variant="outline" className="text-muted-foreground">—</Badge>;
    default:
      return null;
  }
};

interface BdfResultsViewProps {
  result: BdfResult | null;
}

export default function BdfResultsView({ result }: BdfResultsViewProps) {
  if (!result) {
    return (
      <Card className="mt-8 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Aucun résultat disponible</CardTitle>
          <CardDescription>
            Remplissez le formulaire et cliquez sur "Calculer les index" pour voir les 7 panels endobiogéniques
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 mt-8">
        {/* EN-TÊTE GLOBAL */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              ANALYSE FONCTIONNELLE ENDOBIOGÉNIQUE
            </h2>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Les 7 axes endobiogéniques • {Object.keys(result.indexes).length} index calculés
            </p>
          </div>
          <Card className="w-fit">
            <CardContent className="p-4 text-right">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Calculé le
              </div>
              <div className="text-sm font-semibold text-foreground mt-1">
                {new Date(result.metadata.calculatedAt).toLocaleString('fr-FR')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GRILLE DES 7 PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {PANELS.map((panel) => {
            const colors = COLOR_CLASSES[panel.color] || COLOR_CLASSES.blue;
            const IconComponent = PANEL_ICONS[panel.id] || Activity;

            return (
              <Card
                key={panel.id}
                className={`overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] ${colors.border} border-2`}
              >
                {/* HEADER DU PANEL */}
                <CardHeader className={`${colors.bg} border-b-2 ${colors.border}`}>
                  <CardTitle className={`flex items-center gap-3 ${colors.text}`}>
                    <IconComponent className="h-6 w-6" />
                    <span>{panel.label.replace(/^\d+\.\s*/, '')}</span>
                  </CardTitle>
                  {panel.description && (
                    <CardDescription className="text-xs mt-1">
                      {panel.description}
                    </CardDescription>
                  )}
                </CardHeader>

                {/* LISTE DES INDEX */}
                <CardContent className="p-6 space-y-6">
                  {panel.indexes.length > 0 ? (
                    panel.indexes.map((indexId) => {
                      const indexDef = INDEXES.find((i) => i.id === indexId);
                      const calculated = result.indexes[indexId];

                      if (!indexDef) return null;

                      const hasValue = calculated?.value !== null && calculated?.value !== undefined;
                      const displayValue = hasValue
                        ? typeof calculated.value === 'number'
                          ? calculated.value.toFixed(2)
                          : calculated.value
                        : "—";

                      // Déterminer le pourcentage de progression (0-100)
                      let progressValue = 50; // Valeur par défaut (milieu)

                      if (hasValue && indexDef.referenceRange) {
                        const { low, high } = indexDef.referenceRange;
                        const range = high - low;
                        const normalizedValue = ((calculated.value || 0) - low) / range;
                        progressValue = Math.min(100, Math.max(0, normalizedValue * 100));
                      }

                      return (
                        <div key={indexId} className="space-y-3">
                          {/* LABEL + VALEUR + BADGE STATUS */}
                          <div className="flex justify-between items-start gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help">
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-semibold text-foreground">
                                    {indexDef.label}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="font-mono text-xs mb-2">{indexDef.formula}</p>
                                {indexDef.referenceRange && (
                                  <p className="text-xs">
                                    Plage normale: {indexDef.referenceRange.low} - {indexDef.referenceRange.high}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>

                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-bold tabular-nums ${hasValue ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {displayValue}
                              </span>
                              {hasValue && calculated.status && getStatusBadge(calculated.status)}
                            </div>
                          </div>

                          {/* BARRE DE PROGRESSION SHADCN */}
                          <div className="space-y-1">
                            <Progress
                              value={progressValue}
                              className="h-3"
                              // Couleur dynamique selon le status
                              style={{
                                background: calculated?.status === "low" ? "hsl(var(--chart-1))" :
                                           calculated?.status === "high" ? "hsl(var(--destructive))" :
                                           "hsl(var(--muted))"
                              }}
                            />
                            {indexDef.referenceRange && (
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{indexDef.referenceRange.low}</span>
                                <span>{indexDef.referenceRange.high}</span>
                              </div>
                            )}
                          </div>

                          {/* INTERPRÉTATION CLINIQUE AVEC TOOLTIP */}
                          {calculated?.interpretation && (
                            <Alert className="bg-muted/50 border-muted">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs italic">
                                {calculated.interpretation}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* ALERTE BIOMARQUEURS MANQUANTS */}
                          {calculated?.biomarkersMissing && calculated.biomarkersMissing.length > 0 && (
                            <Alert variant="destructive" className="bg-orange-50 border-orange-300 text-orange-800">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                Manque: {calculated.biomarkersMissing.join(", ")}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-6">
                      Aucun index configuré pour ce panel
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* LÉGENDE / AIDE */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Interprétation des Résultats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Badge variant="outline" className="mb-2">Neuro</Badge>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Index Génital:</strong> &gt; 2.5 = Sympathique | &lt; 1.5 = Parasympathique
              </p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Adaptation</Badge>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Cortisol:</strong> Élevé = Insuffisance | Bas = Blocage
              </p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Thyroïde</Badge>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Rendement:</strong> Efficacité périphérique vs TSH centrale
              </p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2">Structure</Badge>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Ratio G/T:</strong> Balance Structure (Génital) / Mouvement (Thyroïde)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
