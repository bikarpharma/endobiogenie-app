"use client";

import React, { useState } from "react";
import { BdfIndexes } from "@/lib/bdf/calculateIndexes";

interface BodyMapProps {
  scores: Record<string, number>;
  bdf: BdfIndexes;
  highlightedOrgan?: string | null;
}

interface OrganState {
  color: string;
  status: string;
  pulse: boolean;
  glow: string;
}

export default function BodyMap({ scores, bdf, highlightedOrgan }: BodyMapProps) {
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // --- LOGIQUE DE DÉTECTION D'ÉTAT ---
  const getOrganState = (organ: string): OrganState => {
    switch (organ) {
      case "Surrénales":
        if (scores.corticotrope > 70 || bdf.adrenal.status === "HYPER") {
          return {
            color: "#ef4444",
            status: "Hyperfonction (Stress)",
            pulse: true,
            glow: "drop-shadow(0 0 8px #ef4444)",
          };
        } else if (bdf.adrenal.status === "EPUISEMENT") {
          return {
            color: "#3b82f6",
            status: "Épuisement",
            pulse: false,
            glow: "drop-shadow(0 0 6px #3b82f6)",
          };
        }
        return {
          color: "#10b981",
          status: "Fonction normale",
          pulse: false,
          glow: "none",
        };

      case "Thyroïde":
        if (bdf.thyroid.status === "BLOCAGE" || bdf.thyroid.status === "HYPO") {
          return {
            color: "#3b82f6",
            status: "Blocage / Hypothyroïdie",
            pulse: false,
            glow: "drop-shadow(0 0 6px #3b82f6)",
          };
        } else if (bdf.thyroid.status === "HYPER") {
          return {
            color: "#ef4444",
            status: "Hyperthyroïdie",
            pulse: true,
            glow: "drop-shadow(0 0 8px #ef4444)",
          };
        }
        return {
          color: "#10b981",
          status: "Euthyroïdie",
          pulse: false,
          glow: "none",
        };

      case "Foie":
        if (bdf.metabolic.status === "RESISTANCE" || (scores.digestif && scores.digestif > 60)) {
          return {
            color: "#f97316",
            status: "Congestion / Résistance",
            pulse: false,
            glow: "drop-shadow(0 0 6px #f97316)",
          };
        }
        return {
          color: "#10b981",
          status: "Drainage optimal",
          pulse: false,
          glow: "none",
        };

      case "Cœur":
        if (bdf.cardiac.status === "HYPER" || (scores.cardiovasculaire && scores.cardiovasculaire > 70)) {
          return {
            color: "#ef4444",
            status: "Surcharge cardiaque",
            pulse: true,
            glow: "drop-shadow(0 0 8px #ef4444)",
          };
        }
        return {
          color: "#10b981",
          status: "Fonction cardiaque normale",
          pulse: false,
          glow: "none",
        };

      case "Cerveau":
        return {
          color: "#a78bfa",
          status: "Centre de commande (Hypothalamus)",
          pulse: false,
          glow: "drop-shadow(0 0 10px #a78bfa)",
        };

      case "Intestins":
        if (scores.digestif && scores.digestif > 65) {
          return {
            color: "#f59e0b",
            status: "Dysbiose / Inflammation",
            pulse: false,
            glow: "drop-shadow(0 0 6px #f59e0b)",
          };
        }
        return {
          color: "#10b981",
          status: "Microbiote équilibré",
          pulse: false,
          glow: "none",
        };

      case "Gonades":
        if (bdf.gonadal?.status === "HYPO" || (scores.genital && scores.genital > 60)) {
          return {
            color: "#ec4899",
            status: "Déséquilibre hormonal",
            pulse: false,
            glow: "drop-shadow(0 0 6px #ec4899)",
          };
        }
        return {
          color: "#10b981",
          status: "Équilibre gonadique",
          pulse: false,
          glow: "none",
        };

      default:
        return {
          color: "#64748b",
          status: "Non évalué",
          pulse: false,
          glow: "none",
        };
    }
  };

  const handleOrganHover = (organ: string, event: React.MouseEvent<SVGElement>) => {
    setHoveredOrgan(organ);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  // Helper pour vérifier si un organe doit être surligné
  const isOrganHighlighted = (organId: string): boolean => {
    if (!highlightedOrgan) return false;

    // Normalisation des noms pour le matching
    const normalizedHighlight = highlightedOrgan.toLowerCase().trim();
    const normalizedOrgan = organId.toLowerCase().trim();

    // Mapping des IDs possibles
    const organMappings: Record<string, string[]> = {
      foie: ["foie", "liver"],
      surrénales: ["surrenales", "surrénales", "adrenal"],
      intestins: ["intestins", "intestin", "intestines"],
      cœur: ["cœur", "coeur", "heart", "cardiac"],
      thyroïde: ["thyroïde", "thyroide", "thyroid"],
      cerveau: ["cerveau", "brain"],
      gonades: ["gonades", "gonadal"],
    };

    // Vérifier si l'organe correspond
    for (const [key, variations] of Object.entries(organMappings)) {
      if (variations.includes(normalizedHighlight) && variations.includes(normalizedOrgan)) {
        return true;
      }
    }

    return normalizedHighlight === normalizedOrgan;
  };

  // --- DONNÉES DES ORGANES ---
  const organs = [
    { id: "Cerveau", cx: 150, cy: 50, r: 18, shape: "circle" },
    { id: "Thyroïde", cx: 150, cy: 100, r: 10, shape: "ellipse", rx: 12, ry: 8 },
    { id: "Cœur", cx: 150, cy: 180, r: 14, shape: "heart" },
    { id: "Foie", cx: 180, cy: 230, r: 20, shape: "polygon", points: "180,210 200,230 190,250 160,245" },
    { id: "Surrénales", cx: 120, cy: 220, r: 8, shape: "circle-left" },
    { id: "Surrénales", cx: 180, cy: 220, r: 8, shape: "circle-right" },
    { id: "Intestins", cx: 150, cy: 320, r: 30, shape: "path" },
    { id: "Gonades", cx: 150, cy: 420, r: 12, shape: "ellipse", rx: 18, ry: 10 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-white/5 shadow-2xl overflow-hidden">
      {/* Grille de fond futuriste */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* SVG Corps Humain */}
      <svg viewBox="0 0 300 600" className="w-full h-full max-w-md relative z-10">
        <defs>
          {/* Gradient de scan futuriste */}
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#0f172a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.3" />
          </linearGradient>

          {/* Filtre de glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* SILHOUETTE HUMAINE (Contour filaire) */}
        <g stroke="#334155" strokeWidth="2" fill="url(#bodyGradient)" opacity="0.4">
          {/* Tête */}
          <ellipse cx="150" cy="50" rx="30" ry="35" />
          {/* Cou */}
          <rect x="140" y="80" width="20" height="25" rx="3" />
          {/* Torse */}
          <ellipse cx="150" cy="180" rx="55" ry="80" />
          {/* Bras gauche */}
          <rect x="85" y="120" width="15" height="120" rx="8" transform="rotate(-10 92 180)" />
          {/* Bras droit */}
          <rect x="200" y="120" width="15" height="120" rx="8" transform="rotate(10 208 180)" />
          {/* Bassin */}
          <ellipse cx="150" cy="320" rx="45" ry="60" />
          {/* Jambe gauche */}
          <rect x="120" y="360" width="20" height="200" rx="10" />
          {/* Jambe droite */}
          <rect x="160" y="360" width="20" height="200" rx="10" />
        </g>

        {/* Ligne de scan animée */}
        <line x1="0" y1="0" x2="300" y2="0" stroke="#06b6d4" strokeWidth="1" opacity="0.6" className="animate-scan">
          <animate attributeName="y1" from="0" to="600" dur="3s" repeatCount="indefinite" />
          <animate attributeName="y2" from="0" to="600" dur="3s" repeatCount="indefinite" />
        </line>

        {/* ORGANES INTERACTIFS */}
        {organs.map((organ, idx) => {
          const state = getOrganState(organ.id);
          const isHovered = hoveredOrgan === organ.id;
          const isHighlighted = isOrganHighlighted(organ.id);

          // Gestion des shapes multiples
          if (organ.shape === "circle" || organ.shape === "circle-left" || organ.shape === "circle-right") {
            return (
              <circle
                key={`${organ.id}-${idx}`}
                cx={organ.cx}
                cy={organ.cy}
                r={organ.r}
                fill={state.color}
                fillOpacity={isHovered || isHighlighted ? 1 : 0.7}
                stroke={isHighlighted ? "#ffffff" : state.color}
                strokeWidth={isHovered || isHighlighted ? 4 : 2}
                filter="url(#glow)"
                style={{
                  filter: isHighlighted ? `drop-shadow(0 0 12px ${state.color})` : state.glow,
                  transform: isHighlighted ? "scale(1.1)" : "scale(1)",
                  transformOrigin: "center"
                }}
                className={`cursor-pointer transition-all duration-300 ${state.pulse || isHighlighted ? "animate-pulse" : ""}`}
                onMouseEnter={(e) => handleOrganHover(organ.id, e)}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
            );
          }

          if (organ.shape === "ellipse") {
            return (
              <ellipse
                key={`${organ.id}-${idx}`}
                cx={organ.cx}
                cy={organ.cy}
                rx={organ.rx}
                ry={organ.ry}
                fill={state.color}
                fillOpacity={isHovered || isHighlighted ? 1 : 0.7}
                stroke={isHighlighted ? "#ffffff" : state.color}
                strokeWidth={isHovered || isHighlighted ? 4 : 2}
                filter="url(#glow)"
                style={{
                  filter: isHighlighted ? `drop-shadow(0 0 12px ${state.color})` : state.glow,
                  transform: isHighlighted ? "scale(1.1)" : "scale(1)",
                  transformOrigin: "center"
                }}
                className={`cursor-pointer transition-all duration-300 ${state.pulse || isHighlighted ? "animate-pulse" : ""}`}
                onMouseEnter={(e) => handleOrganHover(organ.id, e)}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
            );
          }

          if (organ.shape === "heart") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M150,190 C150,175 135,165 125,165 C115,165 105,175 105,185 C105,200 150,215 150,215 C150,215 195,200 195,185 C195,175 185,165 175,165 C165,165 150,175 150,190 Z"
                fill={state.color}
                fillOpacity={isHovered || isHighlighted ? 1 : 0.7}
                stroke={isHighlighted ? "#ffffff" : state.color}
                strokeWidth={isHovered || isHighlighted ? 4 : 2}
                filter="url(#glow)"
                style={{
                  filter: isHighlighted ? `drop-shadow(0 0 12px ${state.color})` : state.glow,
                  transform: isHighlighted ? "scale(1.1)" : "scale(1)",
                  transformOrigin: "center"
                }}
                className={`cursor-pointer transition-all duration-300 ${state.pulse || isHighlighted ? "animate-pulse" : ""}`}
                onMouseEnter={(e) => handleOrganHover(organ.id, e)}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
            );
          }

          if (organ.shape === "polygon") {
            return (
              <polygon
                key={`${organ.id}-${idx}`}
                points={organ.points}
                fill={state.color}
                fillOpacity={isHovered || isHighlighted ? 1 : 0.7}
                stroke={isHighlighted ? "#ffffff" : state.color}
                strokeWidth={isHovered || isHighlighted ? 4 : 2}
                filter="url(#glow)"
                style={{
                  filter: isHighlighted ? `drop-shadow(0 0 12px ${state.color})` : state.glow,
                  transform: isHighlighted ? "scale(1.1)" : "scale(1)",
                  transformOrigin: "center"
                }}
                className={`cursor-pointer transition-all duration-300 ${state.pulse || isHighlighted ? "animate-pulse" : ""}`}
                onMouseEnter={(e) => handleOrganHover(organ.id, e)}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
            );
          }

          if (organ.shape === "path") {
            // Intestins (forme sinueuse)
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M130,300 Q120,320 130,340 T150,360 T170,340 Q180,320 170,300 Z"
                fill={state.color}
                fillOpacity={isHovered || isHighlighted ? 1 : 0.7}
                stroke={isHighlighted ? "#ffffff" : state.color}
                strokeWidth={isHovered || isHighlighted ? 4 : 2}
                filter="url(#glow)"
                style={{
                  filter: isHighlighted ? `drop-shadow(0 0 12px ${state.color})` : state.glow,
                  transform: isHighlighted ? "scale(1.1)" : "scale(1)",
                  transformOrigin: "center"
                }}
                className={`cursor-pointer transition-all duration-300 ${state.pulse || isHighlighted ? "animate-pulse" : ""}`}
                onMouseEnter={(e) => handleOrganHover(organ.id, e)}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
            );
          }

          return null;
        })}

        {/* Labels des organes (apparaissent au zoom) */}
        {hoveredOrgan && (
          <text
            x="150"
            y="580"
            textAnchor="middle"
            fill="#06b6d4"
            fontSize="14"
            fontWeight="bold"
            className="animate-fade-in"
          >
            {hoveredOrgan}
          </text>
        )}
      </svg>

      {/* TOOLTIP FLOTTANT */}
      {hoveredOrgan && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur border border-cyan-500/50 rounded-lg px-4 py-2 shadow-2xl">
            <div className="text-cyan-400 font-bold text-sm mb-1">{hoveredOrgan}</div>
            <div className="text-slate-300 text-xs">{getOrganState(hoveredOrgan).status}</div>
            <div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-cyan-500/50"
            />
          </div>
        </div>
      )}

      {/* HUD Corner Decoration */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30" />
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30" />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30" />

      {/* Status Badge */}
      <div className="absolute top-4 left-4 bg-cyan-500/10 border border-cyan-500/30 rounded px-3 py-1 text-xs text-cyan-400 font-mono">
        SCAN ACTIF
      </div>
    </div>
  );
}
