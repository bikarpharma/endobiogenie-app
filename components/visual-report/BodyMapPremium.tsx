/**
 * 🏆 BODY MAP PREMIUM
 * 
 * Visualisation anatomique interactive du terrain endobiogénique.
 * 
 * Caractéristiques:
 * - Silhouette humaine SVG détaillée
 * - 12 organes interactifs avec états visuels
 * - Lignes de flux animées montrant les axes endocriniens
 * - Effets visuels premium (glow, pulse, scan)
 * - Intégration avec le panneau pédagogique
 * 
 * @author Claude - Pour un SaaS à 120€/mois 💎
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import type { UnifiedAnalysisOutput } from "@/types/clinical-engine";
import { 
  analyzeOrganFromSynthesis, 
  getAxisFlows,
  type OrganAnalysis,
  type AxisFlowData 
} from "@/lib/endobiogeny/organAnalysis";
import AxisFlowLines, { ORGAN_POSITIONS } from "./AxisFlowLines";
import LearningPanel from "./LearningPanel";

// ============================================
// TYPES
// ============================================

interface BodyMapPremiumProps {
  synthesis: UnifiedAnalysisOutput | null;
}

interface OrganDefinition {
  id: string;
  shape: string;
  path?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
}

// ============================================
// DÉFINITIONS DES ORGANES (SVG Paths)
// ============================================

const ORGAN_DEFINITIONS: OrganDefinition[] = [
  // TÊTE
  { id: "cerveau", shape: "path", path: "M130,38 C130,28 170,28 170,38 C172,48 168,58 160,62 L140,62 C132,58 128,48 130,38 Z" },
  
  // COU
  { id: "thyroide", shape: "path", path: "M140,95 Q150,102 160,95 Q162,102 150,108 Q138,102 140,95 Z" },
  
  // THORAX - Poumons
  { id: "poumons-gauche", shape: "path", path: "M108,125 Q98,135 102,160 Q102,180 110,195 Q118,205 128,200 Q138,195 140,175 Q142,150 138,130 Q133,120 123,120 Q113,120 108,125 Z" },
  { id: "poumons-droit", shape: "path", path: "M192,125 Q202,135 198,160 Q198,180 190,195 Q182,205 172,200 Q162,195 160,175 Q158,150 162,130 Q167,120 177,120 Q187,120 192,125 Z" },
  
  // THORAX - Cœur
  { id: "coeur", shape: "path", path: "M150,182 C150,170 140,163 132,163 C122,163 115,173 115,183 C115,198 150,215 150,215 C150,215 185,198 185,183 C185,173 178,163 168,163 C160,163 150,170 150,182 Z" },
  
  // ABDOMEN SUPÉRIEUR
  { id: "foie", shape: "path", path: "M95,208 Q100,198 122,198 Q145,198 148,208 Q152,220 148,235 Q138,252 115,252 Q92,248 88,232 Q85,218 95,208 Z" },
  { id: "estomac", shape: "path", path: "M155,208 Q168,208 178,220 Q183,238 178,255 Q168,265 155,260 Q145,252 148,235 Q145,218 155,208 Z" },
  { id: "rate", shape: "ellipse", cx: 192, cy: 218, rx: 14, ry: 10 },
  { id: "pancreas", shape: "path", path: "M122,250 Q140,246 158,250 Q175,255 185,260 Q180,268 162,268 Q145,265 128,268 Q115,265 122,250 Z" },
  
  // ABDOMEN - Surrénales et Reins
  { id: "surrenale-gauche", shape: "path", path: "M122,268 L135,268 L128,282 Z" },
  { id: "surrenale-droite", shape: "path", path: "M165,268 L178,268 L172,282 Z" },
  { id: "rein-gauche", shape: "path", path: "M112,282 Q105,288 108,305 Q112,322 125,322 Q138,318 138,300 Q138,285 128,280 Q120,278 112,282 Z" },
  { id: "rein-droit", shape: "path", path: "M188,282 Q195,288 192,305 Q188,322 175,322 Q162,318 162,300 Q162,285 172,280 Q180,278 188,282 Z" },
  
  // ABDOMEN INFÉRIEUR
  { id: "intestins", shape: "path", path: "M122,328 Q115,340 125,355 Q138,365 150,358 Q162,365 175,355 Q185,340 178,328 Q172,340 162,335 Q150,342 138,335 Q128,340 122,328 M128,360 Q135,378 150,385 Q165,378 172,360 Q162,372 150,368 Q138,372 128,360 Z" },
  
  // BASSIN
  { id: "gonades", shape: "ellipse", cx: 150, cy: 420, rx: 22, ry: 14 },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function BodyMapPremium({ synthesis }: BodyMapPremiumProps) {
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const [activeAxisId, setActiveAxisId] = useState<string | null>(null);

  // Analyser tous les organes
  const organAnalyses = useMemo(() => {
    const organs = [
      "cerveau", "surrenales", "thyroide", "gonades", "coeur",
      "foie", "intestins", "reins", "poumons", "pancreas", "estomac", "rate"
    ];
    const analyses: Record<string, OrganAnalysis> = {};
    organs.forEach(org => {
      analyses[org] = analyzeOrganFromSynthesis(org, synthesis);
    });
    return analyses;
  }, [synthesis]);

  // Obtenir les flux d'axes
  const axisFlows = useMemo(() => getAxisFlows(synthesis), [synthesis]);

  // Données de l'organe actif
  const activeOrganId = hoveredOrgan;
  const activeOrganData = activeOrganId ? organAnalyses[normalizeOrganId(activeOrganId)] : null;

  // Handler pour clic sur un axe
  const handleAxisClick = useCallback((axisId: string) => {
    setActiveAxisId(prev => prev === axisId ? null : axisId);
  }, []);

  // Handler pour survol d'organe
  const handleOrganHover = useCallback((organId: string | null) => {
    setHoveredOrgan(organId);
    // Reset l'axe actif quand on survole un organe
    if (organId) setActiveAxisId(null);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-[700px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800/50 text-slate-100 relative overflow-hidden shadow-2xl">
      
      {/* ═══════════════════════════════════════════════════════════════
          SECTION GAUCHE : VISUALISATION DU CORPS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative flex-1 flex items-center justify-center min-h-[500px] bg-slate-900/30 rounded-2xl border border-slate-800/30 overflow-hidden">
        
        {/* Grille de fond médicale */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="medical-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
              </pattern>
              <pattern id="medical-grid-large" width="90" height="90" patternUnits="userSpaceOnUse">
                <path d="M 90 0 L 0 0 0 90" fill="none" stroke="#06b6d4" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#medical-grid)" />
            <rect width="100%" height="100%" fill="url(#medical-grid-large)" />
          </svg>
        </div>

        {/* Effet de vignette */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-950/80 pointer-events-none" />

        {/* SVG Corps Humain */}
        <svg 
          viewBox="0 0 300 550" 
          className="w-full h-full max-w-lg relative z-10"
          style={{ filter: "drop-shadow(0 0 30px rgba(0, 0, 0, 0.5))" }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="body-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0f172a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.4" />
            </linearGradient>
            
            <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="45%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="55%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
            
            {/* Filtre de glow pour les organes */}
            <filter id="organ-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="organ-glow-intense" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* SILHOUETTE HUMAINE ANATOMIQUE */}
          <g className="silhouette" stroke="#334155" strokeWidth="1.5" fill="url(#body-gradient)" opacity="0.4">
            {/* Tête */}
            <ellipse cx="150" cy="42" rx="32" ry="38" />
            {/* Mâchoire */}
            <path d="M122,55 Q150,88 178,55" fill="none" strokeWidth="1" />
            
            {/* Cou */}
            <path d="M135,78 L135,108 Q150,115 165,108 L165,78" />
            
            {/* Épaules et Torse */}
            <path d="M85,118 Q90,108 135,108 L165,108 Q210,108 215,118 L215,130 Q188,135 188,185 L188,270 Q188,295 170,305 L130,305 Q112,295 112,270 L112,185 Q112,135 85,130 Z" />
            
            {/* Cage thoracique (subtile) */}
            <ellipse cx="150" cy="175" rx="45" ry="60" stroke="#475569" strokeWidth="0.5" fill="none" opacity="0.3" />
            
            {/* Bras gauche */}
            <path d="M85,118 Q68,125 62,148 L55,215 Q48,240 55,265 L62,310 Q65,328 75,335" strokeLinejoin="round" />
            <ellipse cx="78" cy="348" rx="10" ry="15" />
            
            {/* Bras droit */}
            <path d="M215,118 Q232,125 238,148 L245,215 Q252,240 245,265 L238,310 Q235,328 225,335" strokeLinejoin="round" />
            <ellipse cx="222" cy="348" rx="10" ry="15" />
            
            {/* Bassin */}
            <path d="M112,305 Q95,328 100,375 L105,410 Q112,435 130,448 L170,448 Q188,435 195,410 L200,375 Q205,328 188,305 Z" />
            
            {/* Jambe gauche */}
            <path d="M105,410 Q98,435 102,490 L105,560 Q108,595 118,608" />
            <ellipse cx="125" cy="620" rx="15" ry="8" />
            
            {/* Jambe droite */}
            <path d="M195,410 Q202,435 198,490 L195,560 Q192,595 182,608" />
            <ellipse cx="175" cy="620" rx="15" ry="8" />
          </g>

          {/* Lignes anatomiques subtiles */}
          <g stroke="#475569" strokeWidth="0.3" fill="none" opacity="0.15">
            <path d="M150,108 L150,420" strokeDasharray="6,6" />
            <path d="M112,155 Q150,148 188,155" />
            <path d="M112,172 Q150,165 188,172" />
            <path d="M112,189 Q150,182 188,189" />
            <path d="M115,206 Q150,199 185,206" />
          </g>

          {/* LIGNES DE FLUX DES AXES ENDOCRINIENS */}
          <AxisFlowLines
            axisFlows={axisFlows}
            activeAxisId={activeAxisId}
            hoveredOrgan={hoveredOrgan}
            organPositions={ORGAN_POSITIONS}
          />

          {/* ORGANES INTERACTIFS */}
          {ORGAN_DEFINITIONS.map((organ, idx) => {
            const normalizedId = normalizeOrganId(organ.id);
            const analysis = organAnalyses[normalizedId];
            
            if (!analysis) return null;

            const isHovered = hoveredOrgan === organ.id || 
                            (organ.id.startsWith("poumons") && hoveredOrgan === "poumons") ||
                            (organ.id.startsWith("surrenale") && hoveredOrgan === "surrenales") ||
                            (organ.id.startsWith("rein") && hoveredOrgan === "reins");
            
            const isCritical = analysis.severity === "critical";
            const isExhausted = analysis.severity === "exhausted";
            
            // Props communes
            const commonProps = {
              fill: analysis.color,
              fillOpacity: isHovered ? 1 : 0.7,
              stroke: isHovered ? "#ffffff" : analysis.color,
              strokeWidth: isHovered ? 3 : 1.5,
              filter: isHovered ? "url(#organ-glow-intense)" : isCritical || isExhausted ? "url(#organ-glow)" : "",
              style: {
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: isHovered ? "scale(1.08)" : "scale(1)",
                transformOrigin: `${organ.cx || 150}px ${organ.cy || 150}px`,
              },
              className: `${analysis.pulse ? "animate-pulse" : ""} ${isHovered ? "drop-shadow-2xl" : ""}`,
              onMouseEnter: () => handleOrganHover(organ.id),
              onMouseLeave: () => handleOrganHover(null),
            };

            if (organ.shape === "path" && organ.path) {
              return (
                <path
                  key={`organ-${organ.id}-${idx}`}
                  d={organ.path}
                  {...commonProps}
                />
              );
            }

            if (organ.shape === "ellipse") {
              return (
                <ellipse
                  key={`organ-${organ.id}-${idx}`}
                  cx={organ.cx}
                  cy={organ.cy}
                  rx={organ.rx}
                  ry={organ.ry}
                  {...commonProps}
                />
              );
            }

            return null;
          })}

          {/* Effet de scan animé */}
          <rect
            x="0"
            y="0"
            width="300"
            height="15"
            fill="url(#scan-gradient)"
            opacity="0.6"
            className="pointer-events-none"
          >
            <animate
              attributeName="y"
              from="-15"
              to="550"
              dur="4s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </rect>

          {/* Label de l'organe survolé */}
          {hoveredOrgan && (
            <g className="animate-in fade-in duration-200">
              <rect
                x="100"
                y="520"
                width="100"
                height="24"
                rx="12"
                fill="rgba(15, 23, 42, 0.9)"
                stroke="#06b6d4"
                strokeWidth="1"
              />
              <text
                x="150"
                y="536"
                textAnchor="middle"
                fill="#06b6d4"
                fontSize="12"
                fontWeight="600"
              >
                {activeOrganData?.label || hoveredOrgan}
              </text>
            </g>
          )}
        </svg>

        {/* Badge SCAN ACTIF */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-4 py-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-cyan-400 font-mono font-medium tracking-wider">
            SCAN ACTIF
          </span>
        </div>

        {/* Indicateur de source */}
        <div className="absolute bottom-4 left-4 text-[10px] text-slate-600 flex items-center gap-2">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>Données: Synthèse IA Endobiogénique</span>
        </div>

        {/* Coins décoratifs HUD */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-500/40 rounded-tl" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/40 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-500/40 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-500/40 rounded-br" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION DROITE : PANNEAU PÉDAGOGIQUE
          ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0">
        <LearningPanel
          organData={activeOrganData}
          axisFlows={axisFlows}
          onAxisClick={handleAxisClick}
          activeAxisId={activeAxisId}
        />
      </div>

      {/* Styles CSS personnalisés */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, var(--tw-gradient-stops));
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.9);
        }
      `}</style>
    </div>
  );
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Normalise l'ID d'un organe pour le matching avec les analyses
 */
function normalizeOrganId(id: string): string {
  const lower = id.toLowerCase();
  
  if (lower.includes("poumon")) return "poumons";
  if (lower.includes("surrenal")) return "surrenales";
  if (lower.includes("rein")) return "reins";
  if (lower === "coeur" || lower === "cœur") return "coeur";
  if (lower === "thyroide" || lower === "thyroïde") return "thyroide";
  if (lower === "pancreas" || lower === "pancréas") return "pancreas";
  
  return lower;
}
