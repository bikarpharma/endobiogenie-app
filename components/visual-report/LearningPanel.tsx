/**
 * 🎓 PANNEAU PÉDAGOGIQUE PREMIUM
 * 
 * Affiche les informations détaillées sur l'organe sélectionné:
 * - Mécanisme physiologique (le POURQUOI)
 * - Signes cliniques (le QUOI observer)
 * - Stratégie thérapeutique (le COMMENT traiter)
 */

"use client";

import React from "react";
import { 
  Brain, 
  Stethoscope, 
  Leaf, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Info,
  ChevronRight
} from "lucide-react";
import type { OrganAnalysis, AxisFlowData } from "@/lib/endobiogeny/organAnalysis";

interface LearningPanelProps {
  organData: OrganAnalysis | null;
  axisFlows: AxisFlowData[];
  onAxisClick?: (axisId: string) => void;
  activeAxisId?: string | null;
}

export default function LearningPanel({ 
  organData, 
  axisFlows, 
  onAxisClick,
  activeAxisId 
}: LearningPanelProps) {
  
  // État vide - afficher le placeholder
  if (!organData) {
    return (
      <div className="h-full flex flex-col">
        {/* Placeholder élégant */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
          <div className="relative mb-6">
            {/* Cercles concentriques animés */}
            <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-cyan-500/20 animate-ping" />
            <div className="absolute inset-2 w-20 h-20 rounded-full border border-cyan-500/30 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/50 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Activity className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            Analyse Interactive
          </h3>
          <p className="text-sm text-slate-400 text-center max-w-[250px] leading-relaxed">
            Survolez un organe pour révéler son analyse endobiogénique détaillée
          </p>
          
          {/* Hint visuel */}
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span>Données basées sur la Synthèse IA</span>
          </div>
        </div>

        {/* Axes disponibles */}
        <AxisLegend 
          axisFlows={axisFlows} 
          onAxisClick={onAxisClick}
          activeAxisId={activeAxisId}
        />
      </div>
    );
  }

  // Affichage des données de l'organe
  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* HEADER avec status */}
      <div 
        className="relative overflow-hidden rounded-xl p-5 border-l-4 transition-all duration-300"
        style={{ 
          borderLeftColor: organData.color,
          background: `linear-gradient(135deg, ${hexToRgba(organData.color, 0.1)} 0%, rgba(15, 23, 42, 0.95) 100%)`,
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: organData.color }}
        />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${organData.color} 0%, ${adjustColor(organData.color, -30)} 100%)`,
                  boxShadow: `0 4px 20px ${hexToRgba(organData.color, 0.4)}`
                }}
              >
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {organData.label}
                </h2>
                <p className="text-sm text-slate-400">
                  {organData.axisName}
                </p>
              </div>
            </div>
            
            <StatusBadge status={organData.status} severity={organData.severity} />
          </div>
          
          <h3 className="text-lg font-semibold text-slate-200 mb-1">
            {organData.title}
          </h3>
          
          {organData.score !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500">Score:</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden max-w-[120px]">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, organData.score)}%`,
                    background: organData.color 
                  }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: organData.color }}>
                {organData.score}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CONTENU PÉDAGOGIQUE */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        
        {/* MÉCANISME PHYSIOLOGIQUE */}
        <ContentSection
          icon={<Brain className="w-4 h-4" />}
          title="Mécanisme Endobiogénique"
          color="#a78bfa"
          content={organData.mechanism}
        />

        {/* SIGNES CLINIQUES */}
        {organData.clinicalSigns.length > 0 && (
          <ContentSection
            icon={<Stethoscope className="w-4 h-4" />}
            title="Traduction Clinique"
            color="#06b6d4"
          >
            <ul className="space-y-2">
              {organData.clinicalSigns.map((sign, idx) => (
                <li 
                  key={idx}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </ContentSection>
        )}

        {/* STRATÉGIE THÉRAPEUTIQUE */}
        {organData.therapeuticHint && (
          <ContentSection
            icon={<Leaf className="w-4 h-4" />}
            title="Stratégie Thérapeutique"
            color="#10b981"
            highlight
          >
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              {organData.therapeuticHint}
            </p>
          </ContentSection>
        )}

        {/* BIOMARQUEURS */}
        {organData.biomarkers && organData.biomarkers.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                Biomarqueurs associés
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {organData.biomarkers.map((bio, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 text-xs bg-slate-800/80 text-slate-400 rounded-md border border-slate-700/50"
                >
                  {bio}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LÉGENDE DES AXES */}
      <AxisLegend 
        axisFlows={axisFlows} 
        onAxisClick={onAxisClick}
        activeAxisId={activeAxisId}
      />
    </div>
  );
}

// ============================================
// COMPOSANTS INTERNES
// ============================================

function StatusBadge({ status, severity }: { status: string; severity: string }) {
  const getStatusConfig = () => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: <AlertTriangle className="w-3 h-3" />,
        };
      case "warning":
        return {
          bg: "bg-orange-500/20",
          border: "border-orange-500/50",
          text: "text-orange-400",
          icon: <TrendingUp className="w-3 h-3" />,
        };
      case "exhausted":
        return {
          bg: "bg-blue-500/20",
          border: "border-blue-500/50",
          text: "text-blue-400",
          icon: <TrendingDown className="w-3 h-3" />,
        };
      default:
        return {
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/50",
          text: "text-emerald-400",
          icon: <Minus className="w-3 h-3" />,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`
      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide
      ${config.bg} ${config.text} border ${config.border}
    `}>
      {config.icon}
      {status}
    </div>
  );
}

function ContentSection({ 
  icon, 
  title, 
  color, 
  content,
  children,
  highlight = false 
}: { 
  icon: React.ReactNode;
  title: string;
  color: string;
  content?: string;
  children?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`
      rounded-xl p-4 transition-all duration-300
      ${highlight 
        ? 'bg-gradient-to-br from-emerald-950/50 to-slate-900/50 border border-emerald-500/30' 
        : 'bg-slate-900/50 border border-slate-800/50'
      }
    `}>
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: hexToRgba(color, 0.2) }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </h4>
      </div>
      
      {content && (
        <p className="text-sm text-slate-300 leading-relaxed pl-8">
          {content}
        </p>
      )}
      
      {children && (
        <div className="pl-8">
          {children}
        </div>
      )}
    </div>
  );
}

function AxisLegend({ 
  axisFlows, 
  onAxisClick,
  activeAxisId 
}: { 
  axisFlows: AxisFlowData[];
  onAxisClick?: (axisId: string) => void;
  activeAxisId?: string | null;
}) {
  if (axisFlows.length === 0) return null;

  return (
    <div className="pt-4 border-t border-slate-800/50">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-3 h-3 text-slate-500" />
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          Axes Endocriniens Actifs
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {axisFlows.map((axis) => (
          <button
            key={axis.id}
            onClick={() => onAxisClick?.(axis.id)}
            className={`
              group flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
              transition-all duration-200 cursor-pointer
              ${activeAxisId === axis.id 
                ? 'ring-2 ring-offset-2 ring-offset-slate-950' 
                : 'hover:scale-105'
              }
            `}
            style={{ 
              background: hexToRgba(axis.color, activeAxisId === axis.id ? 0.3 : 0.15),
              borderColor: axis.color,
              color: axis.color,
              ringColor: axis.color,
            }}
          >
            <div 
              className={`w-2 h-2 rounded-full ${axis.status !== 'normal' ? 'animate-pulse' : ''}`}
              style={{ background: axis.color }}
            />
            <span>{axis.name.replace('Axe ', '')}</span>
            {axis.status === 'hyper' && <TrendingUp className="w-3 h-3" />}
            {axis.status === 'hypo' && <TrendingDown className="w-3 h-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// UTILITAIRES
// ============================================

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
