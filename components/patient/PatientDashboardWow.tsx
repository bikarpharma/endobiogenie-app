"use client";

import { useMemo } from "react";

interface PatientDashboardWowProps {
  patient: any;
  bdfAnalysis?: any;
  scores?: any;
}

// Composant Jauge circulaire animée
function CircularGauge({
  value,
  max,
  label,
  color,
  size = 120,
  subtitle,
}: {
  value: number;
  max: number;
  label: string;
  color: string;
  size?: number;
  subtitle?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = size * 0.12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Cercle de fond */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Arc animé */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        </svg>
        {/* Valeur centrale */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-bold"
            style={{ color }}
          >
            {value.toFixed(1)}
          </span>
          {subtitle && (
            <span className="text-xs text-slate-400">{subtitle}</span>
          )}
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-slate-300">{label}</span>
    </div>
  );
}

// Barre de progression avec gradient
function GradientBar({
  value,
  min,
  max,
  label,
  unit,
  normalMin,
  normalMax,
}: {
  value: number;
  min: number;
  max: number;
  label: string;
  unit?: string;
  normalMin?: number;
  normalMax?: number;
}) {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const isNormal = normalMin !== undefined && normalMax !== undefined
    ? value >= normalMin && value <= normalMax
    : true;

  const normalMinPct = normalMin !== undefined ? ((normalMin - min) / (max - min)) * 100 : 0;
  const normalMaxPct = normalMax !== undefined ? ((normalMax - min) / (max - min)) * 100 : 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className={`text-sm font-bold ${isNormal ? "text-green-400" : "text-amber-400"}`}>
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
        {/* Zone normale */}
        {normalMin !== undefined && normalMax !== undefined && (
          <div
            className="absolute h-full bg-green-900/30"
            style={{
              left: `${normalMinPct}%`,
              width: `${normalMaxPct - normalMinPct}%`,
            }}
          />
        )}
        {/* Barre de valeur */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: isNormal
              ? "linear-gradient(90deg, #22c55e, #4ade80)"
              : percentage > 50
              ? "linear-gradient(90deg, #f59e0b, #ef4444)"
              : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            boxShadow: `0 0 10px ${isNormal ? "#22c55e50" : "#f59e0b50"}`,
          }}
        />
        {/* Indicateur de position */}
        <div
          className="absolute top-0 w-1 h-full bg-white/80 rounded-full transition-all duration-700"
          style={{ left: `${percentage}%`, transform: "translateX(-50%)" }}
        />
      </div>
    </div>
  );
}

// Card avec effet glassmorphism
function GlassCard({
  children,
  title,
  icon,
  className = "",
  accentColor = "#8b5cf6",
}: {
  children: React.ReactNode;
  title: string;
  icon?: string;
  className?: string;
  accentColor?: string;
}) {
  return (
    <div
      className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-hidden ${className}`}
    >
      {/* Accent glow */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20"
        style={{ background: accentColor }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

// Badge status animé
function StatusBadge({
  status,
  label,
}: {
  status: "normal" | "warning" | "critical" | "low";
  label: string;
}) {
  const colors = {
    normal: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    warning: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    critical: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", pulse: true },
    low: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  };

  const c = colors[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${status === "critical" ? "animate-pulse" : ""}`}
        style={{
          backgroundColor:
            status === "normal"
              ? "#22c55e"
              : status === "warning"
              ? "#f59e0b"
              : status === "critical"
              ? "#ef4444"
              : "#3b82f6",
          boxShadow:
            status === "critical"
              ? "0 0 8px #ef4444"
              : status === "warning"
              ? "0 0 6px #f59e0b"
              : "none",
        }}
      />
      {label}
    </span>
  );
}

export default function PatientDashboardWow({
  patient,
  bdfAnalysis,
  scores,
}: PatientDashboardWowProps) {
  // Calcul des métriques clés
  const metrics = useMemo(() => {
    if (!bdfAnalysis?.indexes) return null;

    const indexes = bdfAnalysis.indexes;
    const findIndex = (name: string) =>
      indexes.find((i: any) => i.name.toLowerCase().includes(name.toLowerCase()));

    // Index principaux pour affichage
    const adaptation = findIndex("adaptation");
    const thyroid = findIndex("thyro") || findIndex("t3");
    const starter = findIndex("starter");
    const inflammation = findIndex("inflammat");
    const cortisol = findIndex("cortisol");
    const histamine = findIndex("histamine");

    // Compter les anomalies
    const abnormalCount = indexes.filter(
      (i: any) => i.comment && (i.comment.includes("↑") || i.comment.includes("↓") || i.comment.includes("HORS"))
    ).length;

    return {
      adaptation,
      thyroid,
      starter,
      inflammation,
      cortisol,
      histamine,
      abnormalCount,
      totalIndexes: indexes.length,
    };
  }, [bdfAnalysis]);

  // Déterminer le statut global
  const globalStatus = useMemo(() => {
    if (!metrics) return { status: "normal" as const, label: "Données insuffisantes" };

    const ratio = metrics.abnormalCount / metrics.totalIndexes;
    if (ratio > 0.5) return { status: "critical" as const, label: "Déséquilibre important" };
    if (ratio > 0.3) return { status: "warning" as const, label: "Attention requise" };
    if (ratio > 0.15) return { status: "low" as const, label: "Ajustements mineurs" };
    return { status: "normal" as const, label: "Équilibre global" };
  }, [metrics]);

  // Si pas de données BdF
  if (!bdfAnalysis?.indexes || bdfAnalysis.indexes.length === 0) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-300 mb-2">Aucune analyse BdF</h3>
        <p className="text-slate-500 max-w-md">
          Effectuez une analyse biologique fonctionnelle pour visualiser le profil endobiogénique du patient.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-6 space-y-6">
      {/* En-tête avec statut global */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Profil Endobiogénique
          </h2>
          <p className="text-slate-400 text-sm">
            {patient?.prenom} {patient?.nom} · {metrics?.totalIndexes || 0} index calculés
          </p>
        </div>
        <StatusBadge status={globalStatus.status} label={globalStatus.label} />
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1: Jauges principales */}
        <GlassCard title="Index Majeurs" icon="⚡" accentColor="#8b5cf6">
          <div className="grid grid-cols-2 gap-4">
            {metrics?.adaptation && (
              <CircularGauge
                value={metrics.adaptation.value}
                max={2}
                label="Adaptation"
                color={metrics.adaptation.value > 1 ? "#ef4444" : metrics.adaptation.value < 0.5 ? "#3b82f6" : "#22c55e"}
                size={100}
              />
            )}
            {metrics?.starter && (
              <CircularGauge
                value={metrics.starter.value}
                max={2}
                label="Starter"
                color={metrics.starter.value > 1.15 ? "#ef4444" : metrics.starter.value < 0.5 ? "#3b82f6" : "#22c55e"}
                size={100}
              />
            )}
          </div>
          {metrics?.inflammation && (
            <div className="mt-4">
              <GradientBar
                value={metrics.inflammation.value}
                min={0}
                max={10}
                label="Inflammation"
                normalMin={2}
                normalMax={6}
              />
            </div>
          )}
        </GlassCard>

        {/* Colonne 2: Axes thyroïdien et surrénalien */}
        <GlassCard title="Axes Hormonaux" icon="🎯" accentColor="#06b6d4">
          {metrics?.thyroid && (
            <GradientBar
              value={metrics.thyroid.value}
              min={0}
              max={3}
              label="Axe Thyroïdien"
              normalMin={0.8}
              normalMax={1.5}
            />
          )}
          {metrics?.cortisol && (
            <GradientBar
              value={metrics.cortisol.value}
              min={0}
              max={10}
              label="Index Cortisol"
              normalMin={3}
              normalMax={7}
            />
          )}
          {metrics?.histamine && (
            <GradientBar
              value={metrics.histamine.value}
              min={0}
              max={5}
              label="Histamine Potentielle"
              normalMin={0.8}
              normalMax={2}
            />
          )}
        </GlassCard>

        {/* Colonne 3: Résumé anomalies */}
        <GlassCard title="Analyse Globale" icon="📊" accentColor="#f59e0b">
          <div className="space-y-4">
            {/* Compteur anomalies */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <div className="text-3xl font-bold text-white">
                  {metrics?.abnormalCount || 0}
                </div>
                <div className="text-xs text-slate-400">Index hors normes</div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {metrics ? Math.round((metrics.abnormalCount / metrics.totalIndexes) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Top anomalies */}
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Anomalies principales
              </div>
              <div className="space-y-2">
                {bdfAnalysis?.indexes
                  ?.filter((i: any) => i.comment?.includes("↑") || i.comment?.includes("↓"))
                  ?.slice(0, 4)
                  ?.map((index: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg"
                    >
                      <span className="text-sm text-slate-300 truncate">{index.name}</span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          index.comment?.includes("↑")
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {index.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Section inférieure: tous les index */}
      <GlassCard title="Tous les Index" icon="📋" accentColor="#22c55e" className="mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {bdfAnalysis?.indexes?.map((index: any, idx: number) => {
            const isAbnormal = index.comment?.includes("↑") || index.comment?.includes("↓");
            const isHigh = index.comment?.includes("↑");

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl transition-all hover:scale-105 cursor-default ${
                  isAbnormal
                    ? isHigh
                      ? "bg-red-500/10 border border-red-500/30"
                      : "bg-blue-500/10 border border-blue-500/30"
                    : "bg-slate-800/30 border border-slate-700/30"
                }`}
              >
                <div className="text-xs text-slate-400 truncate" title={index.name}>
                  {index.name}
                </div>
                <div
                  className={`text-lg font-bold ${
                    isAbnormal
                      ? isHigh
                        ? "text-red-400"
                        : "text-blue-400"
                      : "text-green-400"
                  }`}
                >
                  {index.value.toFixed(2)}
                </div>
                {isAbnormal && (
                  <div className="text-xs mt-1">
                    {isHigh ? "↑ Élevé" : "↓ Bas"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Footer avec timestamp */}
      <div className="text-center text-xs text-slate-600">
        Analyse générée le {new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })}
      </div>
    </div>
  );
}
