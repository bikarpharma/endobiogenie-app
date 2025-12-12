/**
 * ============================================================================
 * INTEGRIA - PRESCRIPTION LIST (Orchestrateur)
 * ============================================================================
 * Version 2.0 : Radar Global + Terrain Coverage + Timeline Thérapeutique
 *
 * PLACEMENT: /components/prescription/PrescriptionList.tsx
 * ============================================================================
 */

'use client';

import React, { useState, useMemo } from 'react';
import { PrescriptionCard } from './PrescriptionCard';
import type { PrescriptionOutput, PlantOutput, OligoOutput } from "@/lib/utils/tunisianAdapter";
import {
  Activity,
  Brain,
  Zap,
  Droplets,
  FlaskConical,
  AlertTriangle,
  Target,
  Printer,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  Clock,
  ArrowRight,
  Leaf,
  Lightbulb,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { PrescriptionPdfExport } from "./PrescriptionPdfExport";

interface PrescriptionListProps {
  data: PrescriptionOutput;
  patientName?: string;
  consultationDate?: string;
  // Infos complémentaires de l'ordonnance legacy
  syntheseTerrain?: string | null;
  conseilsHygiene?: string[] | null;
  surveillanceBio?: string[] | null;
}

// Configuration Pédagogique des 6 Dimensions
const DIMENSIONS = [
  {
    key: 'symptomatic',
    label: '1. Action Symptomatique',
    desc: 'Soulagement immédiat du motif de consultation',
    icon: Zap,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  {
    key: 'neuro_endocrine',
    label: '2. Régulation Neuro-Endocrinienne',
    desc: 'Traitement de fond des axes (Corticotrope, Gonadotrope...)',
    icon: Brain,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    key: 'ans',
    label: '3. Système Neuro-Végétatif',
    desc: 'Rééquilibrage SNA (Alpha/Bêta/Para)',
    icon: Activity,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    key: 'drainage',
    label: '4. Drainage & Émonctoires',
    desc: "Soutien des organes d'élimination",
    icon: Droplets,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  {
    key: 'aromatherapie',
    label: '5. Aromathérapie',
    desc: 'Huiles essentielles ciblées',
    icon: Leaf,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    key: 'oligos',
    label: '6. Oligoéléments',
    desc: 'Catalyseurs enzymatiques',
    icon: FlaskConical,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    borderColor: 'border-slate-200',
  },
] as const;

// =============================================================================
// COMPOSANT: RADAR GLOBAL DES 5 DIMENSIONS
// =============================================================================
interface RadarChartProps {
  data: PrescriptionOutput;
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  // Calculer les scores pour chaque dimension (0-100)
  const scores = useMemo(() => {
    const getScore = (plants: PlantOutput[] | undefined) => {
      if (!plants || plants.length === 0) return 0;
      // Score basé sur: nombre de plantes * (bonus si endo_covered)
      const baseScore = Math.min(plants.length * 25, 100);
      const endoBonus = plants.filter(p => p.endo_covered).length * 10;
      return Math.min(baseScore + endoBonus, 100);
    };

    return {
      symptomatic: getScore(data.prescription.symptomatic),
      neuro_endocrine: getScore(data.prescription.neuro_endocrine),
      ans: getScore(data.prescription.ans),
      drainage: getScore(data.prescription.drainage),
      aromatherapie: getScore(data.prescription.aromatherapie),
      oligos: data.prescription.oligos?.length ? Math.min(data.prescription.oligos.length * 30, 100) : 0,
    };
  }, [data]);

  // Dimensions du radar (6 dimensions = 60° chacune)
  const size = 200;
  const center = size / 2;
  const maxRadius = 80;

  // Calculer les points du polygone
  const getPoint = (index: number, value: number) => {
    const angle = (index * 60 - 90) * (Math.PI / 180); // 60° = 360/6
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const dimensions = [
    { key: 'symptomatic', label: 'Symptom.', color: '#e11d48' },
    { key: 'neuro_endocrine', label: 'Neuro-Endo', color: '#4f46e5' },
    { key: 'ans', label: 'SNA', color: '#d97706' },
    { key: 'drainage', label: 'Drainage', color: '#0891b2' },
    { key: 'aromatherapie', label: 'Aroma', color: '#059669' },
    { key: 'oligos', label: 'Oligos', color: '#475569' },
  ];

  const points = dimensions.map((dim, i) =>
    getPoint(i, scores[dim.key as keyof typeof scores])
  );
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Points pour les lignes de grille (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grille de fond */}
        {gridLevels.map((level) => {
          const gridPoints = dimensions.map((_, i) => getPoint(i, level));
          return (
            <polygon
              key={level}
              points={gridPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Lignes vers les sommets */}
        {dimensions.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Polygone de données */}
        <polygon
          points={polygonPoints}
          fill="rgba(79, 70, 229, 0.2)"
          stroke="#4f46e5"
          strokeWidth="2"
        />

        {/* Points sur les sommets */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={dimensions[i].color}
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {dimensions.map((dim, i) => {
          const labelPoint = getPoint(i, 120);
          return (
            <text
              key={dim.key}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-medium fill-slate-600"
            >
              {dim.label}
            </text>
          );
        })}
      </svg>

      {/* Légende avec scores */}
      <div className="mt-4 grid grid-cols-6 gap-1 text-center">
        {dimensions.map((dim) => (
          <div key={dim.key} className="text-xs">
            <div
              className="w-3 h-3 rounded-full mx-auto mb-1"
              style={{ backgroundColor: dim.color }}
            />
            <span className="font-bold">{scores[dim.key as keyof typeof scores]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// COMPOSANT: TERRAIN COVERAGE (Barre de progression)
// =============================================================================
interface TerrainCoverageProps {
  data: PrescriptionOutput;
}

const TerrainCoverage: React.FC<TerrainCoverageProps> = ({ data }) => {
  // Calculer le pourcentage de plantes avec endo_covered
  const stats = useMemo(() => {
    const allPlants = [
      ...(data.prescription.symptomatic || []),
      ...(data.prescription.neuro_endocrine || []),
      ...(data.prescription.ans || []),
      ...(data.prescription.drainage || []),
    ];

    const total = allPlants.length;
    const endoCovered = allPlants.filter(p => p.endo_covered).length;
    const percentage = total > 0 ? Math.round((endoCovered / total) * 100) : 0;

    return { total, endoCovered, percentage };
  }, [data]);

  const getColorClass = () => {
    if (stats.percentage >= 80) return 'bg-emerald-500';
    if (stats.percentage >= 60) return 'bg-indigo-500';
    if (stats.percentage >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getMessage = () => {
    if (stats.percentage >= 80) return 'Excellent ! Ordonnance très orientée terrain';
    if (stats.percentage >= 60) return 'Bonne couverture du terrain endobiogénique';
    if (stats.percentage >= 40) return 'Couverture terrain modérée';
    return 'Approche principalement symptomatique';
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-500" />
          Couverture Terrain
        </h4>
        <span className="text-lg font-bold text-indigo-600">{stats.percentage}%</span>
      </div>

      {/* Barre de progression */}
      <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColorClass())}
          style={{ width: `${stats.percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{stats.endoCovered}/{stats.total} plantes avec profil terrain</span>
        <span className="font-medium">{getMessage()}</span>
      </div>
    </div>
  );
};

// =============================================================================
// COMPOSANT: TIMELINE THÉRAPEUTIQUE
// =============================================================================
interface TimelineProps {
  data: PrescriptionOutput;
}

const TherapeuticTimeline: React.FC<TimelineProps> = ({ data }) => {
  const hasDrainage = data.prescription.drainage && data.prescription.drainage.length > 0;
  const hasNeuroEndocrine = data.prescription.neuro_endocrine && data.prescription.neuro_endocrine.length > 0;

  // Extraire les plantes par phase
  const drainagePlants = data.prescription.drainage?.map(p => p.name_fr || p.name_latin) || [];
  const fondPlants = [
    ...(data.prescription.neuro_endocrine?.map(p => p.name_fr || p.name_latin) || []),
    ...(data.prescription.ans?.map(p => p.name_fr || p.name_latin) || []),
  ];

  if (!hasDrainage && !hasNeuroEndocrine) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-lg border border-slate-200 shadow-sm">
      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-cyan-600" />
        Timeline Thérapeutique
      </h4>

      <div className="flex items-stretch gap-2">
        {/* Phase 1: Drainage */}
        {hasDrainage && (
          <>
            <div className="flex-1 p-3 bg-white rounded-lg border-2 border-cyan-300 relative">
              <div className="absolute -top-2 left-3 bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                PHASE 1
              </div>
              <div className="pt-2">
                <h5 className="font-bold text-cyan-700 text-sm flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  Drainage
                </h5>
                <p className="text-xs text-cyan-600 font-medium mt-1">15-21 jours</p>
                <div className="mt-2 space-y-1">
                  {drainagePlants.slice(0, 3).map((plant, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-center gap-1">
                      <Leaf className="w-2 h-2 text-cyan-400" />
                      {plant}
                    </div>
                  ))}
                  {drainagePlants.length > 3 && (
                    <div className="text-xs text-slate-400">
                      +{drainagePlants.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Flèche */}
            <div className="flex items-center">
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
          </>
        )}

        {/* Phase 2: Traitement de Fond */}
        {hasNeuroEndocrine && (
          <div className="flex-1 p-3 bg-white rounded-lg border-2 border-indigo-300 relative">
            <div className="absolute -top-2 left-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              PHASE {hasDrainage ? '2' : '1'}
            </div>
            <div className="pt-2">
              <h5 className="font-bold text-indigo-700 text-sm flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Traitement de Fond
              </h5>
              <p className="text-xs text-indigo-600 font-medium mt-1">2-3 mois</p>
              <div className="mt-2 space-y-1">
                {fondPlants.slice(0, 3).map((plant, i) => (
                  <div key={i} className="text-xs text-slate-600 flex items-center gap-1">
                    <Leaf className="w-2 h-2 text-indigo-400" />
                    {plant}
                  </div>
                ))}
                {fondPlants.length > 3 && (
                  <div className="text-xs text-slate-400">
                    +{fondPlants.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      <p className="text-[10px] text-slate-500 mt-3 italic text-center">
        {hasDrainage
          ? "Le drainage prépare le terrain avant le traitement de fond"
          : "Traitement de fond direct - pas de drainage nécessaire"}
      </p>
    </div>
  );
};

// Composant Carte Oligoélément (simplifié)
const OligoCard: React.FC<{ oligo: OligoOutput }> = ({ oligo }) => (
  <div className="mb-3 p-4 rounded-lg border border-amber-200 bg-amber-50/50 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-amber-600" />
          <h4 className="font-bold text-amber-900">{oligo.name}</h4>
          <Badge variant="outline" className="text-[10px] h-5 border-amber-300">
            {oligo.form}
          </Badge>
        </div>
        <div className="mt-1 pl-6">
          <span className="text-amber-700 font-medium">{oligo.dosage}</span>
        </div>
        <p className="mt-2 pl-6 text-sm text-amber-600 italic">
          {oligo.justification}
        </p>
      </div>
    </div>
  </div>
);

// Composant Section Dimension (avec collapse optionnel)
interface DimensionSectionProps {
  config: typeof DIMENSIONS[number];
  plants?: PlantOutput[];
  oligos?: OligoOutput[];
  defaultOpen?: boolean;
}

const DimensionSection: React.FC<DimensionSectionProps> = ({ 
  config, 
  plants, 
  oligos,
  defaultOpen = true 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const items = config.key === 'oligos' ? oligos : plants;
  const isEmpty = !items || items.length === 0;
  const Icon = config.icon;

  if (isEmpty) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header de section (cliquable) */}
        <CollapsibleTrigger asChild>
          <button className={cn(
            "w-full flex items-center justify-between gap-3 p-3 rounded-lg mb-3 transition-colors",
            config.bg,
            "hover:opacity-90 cursor-pointer group"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-lg shadow-sm bg-white", config.borderColor, "border")}>
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
              <div className="text-left">
                <h3 className={cn("text-lg font-bold", config.color)}>
                  {config.label}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {config.desc}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {items?.length || 0}
              </Badge>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Contenu (liste des cartes) */}
        <CollapsibleContent>
          <div className="pl-4 border-l-2 border-slate-100 mb-6">
            {config.key === 'oligos' 
              ? oligos?.map((oligo, idx) => (
                  <OligoCard key={`${oligo.oligo_id}-${idx}`} oligo={oligo} />
                ))
              : plants?.map((plant, idx) => (
                  <PrescriptionCard key={`${plant.plant_id}-${idx}`} plant={plant} />
                ))
            }
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
};

// Composant Principal
export const PrescriptionList: React.FC<PrescriptionListProps> = ({
  data,
  patientName,
  consultationDate,
  syntheseTerrain,
  conseilsHygiene,
  surveillanceBio,
}) => {
  const [showPdfExport, setShowPdfExport] = useState(false);

  if (!data) return null;

  const { meta } = data;
  const hasIssues = meta.warnings_count > 0 || meta.critical_count > 0;
  const isFullyCompliant = meta.warnings_count === 0 && meta.critical_count === 0;

  // Handler pour ouvrir l'export PDF
  const handleOpenPdfExport = () => {
    setShowPdfExport(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 pb-20">
      
      {/* === EN-TÊTE STRATÉGIQUE === */}
      <div className="bg-slate-900 text-slate-50 p-6 rounded-xl shadow-lg border border-slate-800 relative overflow-hidden">
        {/* Effet visuel de fond */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl font-bold">Ordonnance IntegrIA</h1>
            </div>
            {(patientName || consultationDate) && (
              <p className="text-sm text-slate-400">
                {patientName && <span className="font-medium text-slate-300">{patientName}</span>}
                {patientName && consultationDate && <span> • </span>}
                {consultationDate && <span>{consultationDate}</span>}
              </p>
            )}
          </div>
          
          {/* Bouton Export PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPdfExport}
            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white print:hidden"
          >
            <Printer className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Stratégie */}
        <div className="relative">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2 flex items-center gap-2">
            <Target className="w-3 h-3" />
            Stratégie Thérapeutique
          </h2>
          <p className="text-lg font-light leading-relaxed opacity-90 italic">
            "{data.global_strategy_summary}"
          </p>
          
          {/* Axe prioritaire */}
          {data.priority_axis && (
            <Badge className="mt-3 bg-indigo-600 hover:bg-indigo-700">
              Axe prioritaire : {data.priority_axis}
            </Badge>
          )}
        </div>
        
        {/* Métadonnées */}
        <div className="relative mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            📅 {new Date(meta.conversion_date).toLocaleDateString('fr-FR')}
          </span>
          <span className="flex items-center gap-1">
            🌿 {meta.available_count}/{meta.total_plants} plantes dispo
          </span>
          <span className="flex items-center gap-1">
            {isFullyCompliant ? (
              <>
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">100% Conforme</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 font-bold">
                  {meta.warnings_count + meta.critical_count} alerte(s)
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* === SECTION ANALYTICS: Radar + Coverage + Timeline === */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Radar Global */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-indigo-500" />
            Profil Thérapeutique
          </h4>
          <RadarChart data={data} />
        </div>

        {/* Terrain Coverage + Timeline */}
        <div className="space-y-4">
          <TerrainCoverage data={data} />
          <TherapeuticTimeline data={data} />
        </div>
      </div>

      {/* === SYNTHÈSE DU TERRAIN (si disponible) === */}
      {syntheseTerrain && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 shadow-sm">
          <h4 className="text-sm font-bold text-indigo-700 flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4" />
            Synthèse du Terrain
          </h4>
          <p className="text-slate-700 leading-relaxed">{syntheseTerrain}</p>
        </div>
      )}

      {/* === LES 5 DIMENSIONS === */}
      <div className="space-y-4">
        {DIMENSIONS.map((config) => (
          <DimensionSection
            key={config.key}
            config={config}
            plants={
              config.key !== 'oligos' 
                ? data.prescription[config.key as keyof Omit<typeof data.prescription, 'oligos'>] as PlantOutput[]
                : undefined
            }
            oligos={
              config.key === 'oligos' 
                ? data.prescription.oligos 
                : undefined
            }
            defaultOpen={true}
          />
        ))}
      </div>

      {/* === HYGIÈNE DE VIE & SURVEILLANCE === */}
      {(conseilsHygiene?.length || surveillanceBio?.length) && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Hygiène de vie */}
          {conseilsHygiene && conseilsHygiene.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4" />
                Hygiène de vie
              </h4>
              <ul className="space-y-2 text-sm text-amber-900">
                {conseilsHygiene.map((conseil, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{conseil}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Surveillance biologique */}
          {surveillanceBio && surveillanceBio.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4" />
                Surveillance
              </h4>
              <ul className="space-y-2 text-sm text-blue-900">
                {surveillanceBio.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* === FOOTER === */}
      <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500 print:mt-4">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          Généré par <span className="font-bold text-slate-700">IntegrIA v2.0</span>
          <span className="text-slate-300">|</span>
          Adapté au contexte tunisien
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Ce document est un support d'aide à la décision. Le médecin reste responsable de la prescription finale.
        </p>
      </div>

      {/* === MODAL EXPORT PDF === */}
      {showPdfExport && (
        <PrescriptionPdfExport
          data={data}
          patientName={patientName}
          consultationDate={consultationDate}
          onClose={() => setShowPdfExport(false)}
        />
      )}
    </div>
  );
};

export default PrescriptionList;
