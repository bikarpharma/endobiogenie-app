"use client";

import React, { useMemo } from "react";
import { PANELS } from "@/lib/bdf/panels/panels.config";
import { INDEXES } from "@/lib/bdf/indexes/indexes.config";
import type { BdfResult } from "@/lib/bdf/calculateIndexes";
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

// Mapping icônes par panel (utilise l'ID du panel)
const PANEL_ICONS: Record<string, any> = {
  panel_sna: Brain,           // SNA - Système Nerveux Autonome
  panel_adaptation: Activity, // Corticotrope
  panel_thyroid: Zap,         // Thyréotrope
  panel_gonado: Baby,         // Gonadotrope
  panel_somato: TrendingUp,   // Somatotrope
  panel_metabo: Apple,        // Métabolique
  panel_immuno: Shield,       // Immunitaire
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
const getStatusBadge = (status: string | undefined) => {
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
  // Normaliser les indexes : gérer le format tableau (legacy) et objet (nouveau)
  const normalizedIndexes = React.useMemo(() => {
    if (!result?.indexes) return {};

    const rawIndexes = result.indexes;

    // Si c'est un tableau (format legacy), le convertir en objet par id
    if (Array.isArray(rawIndexes)) {
      console.log('[BdfResultsView] Format legacy détecté (tableau), conversion en objet');
      const obj: Record<string, any> = {};
      rawIndexes.forEach((idx: any) => {
        if (idx && idx.id) {
          obj[idx.id] = {
            value: idx.value ?? idx.valeur ?? null,
            status: idx.status || 'unknown',
            biomarkersMissing: idx.biomarkersMissing || [],
            interpretation: idx.interpretation
          };
        }
      });
      return obj;
    }

    // Si c'est un objet avec des clés numériques (0, 1, 2...), c'est aussi le format legacy
    const keys = Object.keys(rawIndexes);
    if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
      console.log('[BdfResultsView] Format legacy détecté (objet avec clés numériques), conversion');
      const obj: Record<string, any> = {};
      Object.values(rawIndexes).forEach((idx: any) => {
        if (idx && idx.id) {
          obj[idx.id] = {
            value: idx.value ?? idx.valeur ?? null,
            status: idx.status || 'unknown',
            biomarkersMissing: idx.biomarkersMissing || [],
            interpretation: idx.interpretation
          };
        }
      });
      return obj;
    }

    // Format normal (objet avec clés = id des index)
    return rawIndexes;
  }, [result?.indexes]);

  // Mémoïser le résultat normalisé pour éviter les re-renders inutiles
  const normalizedResult = useMemo(() => {
    return result ? { ...result, indexes: normalizedIndexes } : null;
  }, [result, normalizedIndexes]);

  // Mémoïser le mapping des définitions d'index par ID pour un accès rapide
  const indexDefMap = useMemo(() => {
    const map: Record<string, typeof INDEXES[0]> = {};
    INDEXES.forEach(idx => { map[idx.id] = idx; });
    return map;
  }, []);

  if (!normalizedResult) {
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

  // Vérifier si les index sont vides ou mal formés
  if (!normalizedResult.indexes || Object.keys(normalizedResult.indexes).length === 0) {
    return (
      <Card className="mt-8 border-dashed border-orange-300 bg-orange-50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-16 w-16 text-orange-500 mb-4" />
          <CardTitle className="mb-2 text-orange-700">Données d'index manquantes</CardTitle>
          <CardDescription className="text-orange-600">
            Les index calculés ne sont pas disponibles. Veuillez recalculer l'analyse BdF.
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
              Les 7 axes endobiogéniques • {Object.keys(normalizedResult.indexes).length} index calculés
            </p>
          </div>
          <Card className="w-fit">
            <CardContent className="p-4 text-right">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Calculé le
              </div>
              <div className="text-sm font-semibold text-foreground mt-1">
                {new Date(normalizedResult.metadata.calculatedAt).toLocaleString('fr-FR')}
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
                      // Utiliser le map mémoïsé au lieu de find() O(n)
                      const indexDef = indexDefMap[indexId];
                      const rawCalculated = normalizedResult.indexes[indexId];

                      if (!indexDef) return null;

                      // Normaliser la structure - gérer les cas où la valeur est stockée différemment
                      // Format attendu: {value, status, biomarkersMissing, interpretation}
                      // Format possible depuis DB: {value, status} ou juste un nombre
                      let calculated: {
                        value: number | null;
                        status?: string;
                        biomarkersMissing?: string[];
                        interpretation?: string;
                      } | null = null;

                      if (rawCalculated !== null && rawCalculated !== undefined) {
                        if (typeof rawCalculated === 'number') {
                          // Si c'est juste un nombre, créer l'objet
                          calculated = { value: rawCalculated };
                        } else if (typeof rawCalculated === 'object') {
                          // C'est un objet - extraire la valeur
                          const rawValue = (rawCalculated as any).value ?? (rawCalculated as any).valeur;
                          calculated = {
                            value: typeof rawValue === 'number' ? rawValue : null,
                            status: (rawCalculated as any).status,
                            biomarkersMissing: (rawCalculated as any).biomarkersMissing || [],
                            interpretation: (rawCalculated as any).interpretation
                          };
                        }
                      }

                      const hasValue = calculated?.value !== null && calculated?.value !== undefined;

                      // Si on a une valeur mais pas de status, le calculer à partir des normes
                      if (hasValue && calculated && !calculated.status && indexDef.referenceRange) {
                        const val = calculated.value as number;
                        const { low, high } = indexDef.referenceRange;
                        if (val < low) {
                          calculated.status = 'low';
                        } else if (val > high) {
                          calculated.status = 'high';
                        } else {
                          calculated.status = 'normal';
                        }
                      }
                      const displayValue = hasValue
                        ? typeof calculated!.value === 'number'
                          ? calculated!.value.toFixed(2)
                          : String(calculated!.value)
                        : "—";

                      // Déterminer le pourcentage de progression (0-100)
                      let progressValue = 50; // Valeur par défaut (milieu)

                      if (hasValue && indexDef.referenceRange) {
                        const { low, high } = indexDef.referenceRange;
                        const range = high - low;
                        const normalizedValue = ((calculated.value || 0) - low) / range;
                        progressValue = Math.min(100, Math.max(0, normalizedValue * 100));
                      }

                      // Générer une interprétation brève selon l'index et son statut
                      const getShortInterpretation = (): string | null => {
                        if (!hasValue) return null;
                        if (calculated.interpretation) return calculated.interpretation;

                        const val = calculated.value as number;
                        const ref = indexDef.referenceRange;
                        if (!ref) return null;

                        if (val < ref.low) {
                          switch (indexId) {
                            case 'idx_thyroidien': return 'Hypothyroïdie périphérique latente';
                            case 'idx_adaptation': return 'Épuisement corticotrope';
                            case 'idx_genital': return 'Insuffisance gonadotrope';
                            case 'idx_mobilisation_plaquettes': return 'Spasmophilie probable';
                            case 'idx_mobilisation_leucocytes': return 'Tonus sympathique bas';
                            case 'idx_starter': return 'Démarrage métabolique lent';
                            case 'idx_croissance': return 'Axe somatotrope ralenti';
                            case 'idx_rendement_thyroidien': return 'Rendement périphérique faible';
                            case 'idx_capacite_tampon': return 'Capacité tampon épuisée - Drainage urgent';
                            case 'idx_cortisol_cortex': return 'Insuffisance cortico-surrénalienne';
                            case 'idx_mineralo': return 'Hypoaldostéronisme fonctionnel';
                            case 'idx_oestrogenes': return 'Hypo-oestrogénie relative';
                            case 'idx_genito_thyroidien': return 'Dominance thyroïdienne';
                            case 'idx_histamine_potentielle': return 'Histamine basse';
                            case 'idx_remodelage_osseux': return 'Turn-over osseux ralenti';
                            case 'idx_insuline': return 'Sensibilité insulinique altérée';
                            default: return 'Valeur basse - Axe en insuffisance';
                          }
                        } else if (val > ref.high) {
                          switch (indexId) {
                            case 'idx_thyroidien': return 'Hypermétabolisme relatif';
                            case 'idx_adaptation': return 'Sur-sollicitation corticotrope';
                            case 'idx_genital': return 'Hyperoestrogénie relative';
                            case 'idx_inflammation': return 'Terrain inflammatoire actif';
                            case 'idx_histamine_potentielle': return 'Terrain histaminique - Allergies';
                            case 'idx_catabolisme': return 'Catabolisme accéléré';
                            case 'idx_cortisol_cortex': return 'Hypercorticisme fonctionnel';
                            case 'idx_mineralo': return 'Hyperaldostéronisme';
                            case 'idx_oestrogenes': return 'Hyperoestrogénie';
                            case 'idx_genito_thyroidien': return 'Dominance gonadique';
                            case 'idx_starter': return 'Hypersympathicotonie au démarrage';
                            case 'idx_mobilisation_plaquettes': return 'Mobilisation plaquettaire élevée';
                            case 'idx_mobilisation_leucocytes': return 'Hypersympathicotonie';
                            case 'idx_remodelage_osseux': return 'Turn-over osseux accéléré';
                            case 'idx_cata_ana': return 'Déséquilibre catabolique';
                            default: return 'Valeur haute - Axe en sur-sollicitation';
                          }
                        }
                        return 'Dans les normes';
                      };

                      const shortInterp = getShortInterpretation();

                      return (
                        <div key={indexId} className="space-y-2 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
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
                              <TooltipContent className="max-w-xs p-3">
                                <p className="font-bold mb-1">{indexDef.label}</p>
                                <p className="font-mono text-xs mb-2 bg-slate-800 p-1 rounded">{indexDef.formula}</p>
                                {indexDef.referenceRange && (
                                  <p className="text-xs">
                                    📊 Plage normale: <strong>{indexDef.referenceRange.low} - {indexDef.referenceRange.high}</strong>
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>

                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-bold tabular-nums ${
                                !hasValue ? 'text-muted-foreground' :
                                calculated.status === 'low' ? 'text-blue-600' :
                                calculated.status === 'high' ? 'text-red-600' :
                                'text-green-600'
                              }`}>
                                {displayValue}
                              </span>
                              {hasValue && calculated.status && getStatusBadge(calculated.status)}
                            </div>
                          </div>

                          {/* INTERPRÉTATION BRÈVE TOUJOURS VISIBLE */}
                          {hasValue && shortInterp && (
                            <p className={`text-xs italic pl-6 ${
                              calculated.status === 'low' ? 'text-blue-600' :
                              calculated.status === 'high' ? 'text-red-600' :
                              'text-green-600'
                            }`}>
                              → {shortInterp}
                            </p>
                          )}

                          {/* BARRE DE PROGRESSION */}
                          <div className="space-y-1 pl-6">
                            <Progress
                              value={progressValue}
                              className="h-2"
                            />
                            {indexDef.referenceRange && (
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>{indexDef.referenceRange.low}</span>
                                <span>{indexDef.referenceRange.high}</span>
                              </div>
                            )}
                          </div>

                          {/* ALERTE BIOMARQUEURS MANQUANTS */}
                          {calculated?.biomarkersMissing && calculated.biomarkersMissing.length > 0 && (
                            <Alert variant="destructive" className="bg-orange-50 border-orange-300 text-orange-800 py-1 ml-6">
                              <AlertCircle className="h-3 w-3" />
                              <AlertDescription className="text-[10px]">
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
