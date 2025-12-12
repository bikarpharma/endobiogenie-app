"use client";

import React, { useState } from "react";

// Types pour les données BdF passées à BodyMap
interface AxisData {
  status: string;
  value?: number;
  interpretation?: string;
}

interface BodyMapBdfData {
  adrenal: AxisData;
  thyroid: AxisData;
  metabolic: AxisData;
  cardiac: AxisData;
  gonadal?: AxisData;
}

interface BodyMapProps {
  scores: Record<string, number>;
  bdf: BodyMapBdfData;
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

      // === NOUVEAUX ORGANES ===

      case "Poumons":
        // Lié à l'axe respiratoire et immunitaire
        if (scores.immunitaire && scores.immunitaire > 65) {
          return {
            color: "#f59e0b",
            status: "Fragilité immunitaire pulmonaire",
            pulse: false,
            glow: "drop-shadow(0 0 6px #f59e0b)",
          };
        }
        if (scores.respiratoire && scores.respiratoire > 60) {
          return {
            color: "#ef4444",
            status: "Terrain respiratoire perturbé",
            pulse: true,
            glow: "drop-shadow(0 0 8px #ef4444)",
          };
        }
        return {
          color: "#06b6d4",
          status: "Fonction respiratoire normale",
          pulse: false,
          glow: "drop-shadow(0 0 4px #06b6d4)",
        };

      case "Reins":
        // Lié à l'axe surrénalien et métabolique
        if (bdf.adrenal.status === "EPUISEMENT") {
          return {
            color: "#3b82f6",
            status: "Filtration réduite (épuisement surrénalien)",
            pulse: false,
            glow: "drop-shadow(0 0 6px #3b82f6)",
          };
        }
        if (scores.urorenal && scores.urorenal > 60) {
          return {
            color: "#f97316",
            status: "Terrain rénal à surveiller",
            pulse: false,
            glow: "drop-shadow(0 0 6px #f97316)",
          };
        }
        return {
          color: "#10b981",
          status: "Fonction rénale normale",
          pulse: false,
          glow: "none",
        };

      case "Estomac":
        // Lié à l'axe digestif
        if (scores.digestif && scores.digestif > 70) {
          return {
            color: "#ef4444",
            status: "Hypersécrétion / Inflammation",
            pulse: true,
            glow: "drop-shadow(0 0 8px #ef4444)",
          };
        }
        if (scores.digestif && scores.digestif > 50) {
          return {
            color: "#f59e0b",
            status: "Dyspepsie fonctionnelle",
            pulse: false,
            glow: "drop-shadow(0 0 6px #f59e0b)",
          };
        }
        return {
          color: "#10b981",
          status: "Digestion gastrique normale",
          pulse: false,
          glow: "none",
        };

      case "Pancréas":
        // Lié au métabolisme glucidique
        if (bdf.metabolic.status === "RESISTANCE") {
          return {
            color: "#ef4444",
            status: "Résistance insulinique",
            pulse: true,
            glow: "drop-shadow(0 0 8px #ef4444)",
          };
        }
        if (scores.cardiovasculaire && scores.cardiovasculaire > 60) {
          return {
            color: "#f59e0b",
            status: "Stress métabolique",
            pulse: false,
            glow: "drop-shadow(0 0 6px #f59e0b)",
          };
        }
        return {
          color: "#10b981",
          status: "Fonction pancréatique normale",
          pulse: false,
          glow: "none",
        };

      case "Rate":
        // Lié à l'immunité et au sang
        if (scores.immunitaire && scores.immunitaire > 70) {
          return {
            color: "#ef4444",
            status: "Suractivité immunitaire",
            pulse: true,
            glow: "drop-shadow(0 0 8px #ef4444)",
          };
        }
        if (scores.immunitaire && scores.immunitaire > 50) {
          return {
            color: "#f59e0b",
            status: "Immunité à renforcer",
            pulse: false,
            glow: "drop-shadow(0 0 6px #f59e0b)",
          };
        }
        return {
          color: "#8b5cf6",
          status: "Fonction splénique normale",
          pulse: false,
          glow: "drop-shadow(0 0 4px #8b5cf6)",
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

    // Mapping des IDs possibles (incluant les nouveaux organes)
    const organMappings: Record<string, string[]> = {
      foie: ["foie", "liver", "hepatique"],
      surrénales: ["surrenales", "surrénales", "adrenal", "surrenal"],
      intestins: ["intestins", "intestin", "intestines", "colon"],
      cœur: ["cœur", "coeur", "heart", "cardiac", "cardiaque"],
      thyroïde: ["thyroïde", "thyroide", "thyroid"],
      cerveau: ["cerveau", "brain", "hypothalamus"],
      gonades: ["gonades", "gonadal", "ovaires", "testicules"],
      // Nouveaux organes
      poumons: ["poumons", "poumon", "lungs", "lung", "pulmonaire", "respiratoire"],
      reins: ["reins", "rein", "kidney", "kidneys", "renal", "urorenal"],
      estomac: ["estomac", "stomach", "gastrique"],
      pancréas: ["pancréas", "pancreas", "pancréatique", "insuline"],
      rate: ["rate", "spleen", "splénique"],
    };

    // Vérifier si l'organe correspond
    for (const [key, variations] of Object.entries(organMappings)) {
      if (variations.includes(normalizedHighlight) && variations.includes(normalizedOrgan)) {
        return true;
      }
    }

    return normalizedHighlight === normalizedOrgan;
  };

  // --- DONNÉES DES ORGANES (Étendu avec nouveaux organes) ---
  const organs = [
    // === TÊTE ===
    { id: "Cerveau", cx: 150, cy: 50, r: 18, shape: "circle" },

    // === COU ===
    { id: "Thyroïde", cx: 150, cy: 100, r: 10, shape: "ellipse", rx: 14, ry: 8 },

    // === THORAX ===
    { id: "Poumons", cx: 115, cy: 155, r: 15, shape: "lung-left" },   // Poumon gauche
    { id: "Poumons", cx: 185, cy: 155, r: 15, shape: "lung-right" },  // Poumon droit
    { id: "Cœur", cx: 150, cy: 175, r: 14, shape: "heart" },

    // === ABDOMEN SUPÉRIEUR ===
    { id: "Foie", cx: 118, cy: 220, r: 20, shape: "liver" },         // Foie (côté droit anatomique = gauche sur image)
    { id: "Estomac", cx: 165, cy: 225, r: 14, shape: "stomach" },    // Estomac (côté gauche)
    { id: "Rate", cx: 190, cy: 215, r: 10, shape: "spleen" },        // Rate (côté gauche)
    { id: "Pancréas", cx: 150, cy: 250, r: 8, shape: "pancreas" },   // Pancréas (transversal)

    // === ABDOMEN ===
    { id: "Surrénales", cx: 130, cy: 265, r: 7, shape: "adrenal-left" },  // Surrénale gauche
    { id: "Surrénales", cx: 170, cy: 265, r: 7, shape: "adrenal-right" }, // Surrénale droite
    { id: "Reins", cx: 120, cy: 285, r: 12, shape: "kidney-left" },  // Rein gauche
    { id: "Reins", cx: 180, cy: 285, r: 12, shape: "kidney-right" }, // Rein droit

    // === ABDOMEN INFÉRIEUR ===
    { id: "Intestins", cx: 150, cy: 330, r: 30, shape: "intestines" },

    // === BASSIN ===
    { id: "Gonades", cx: 150, cy: 400, r: 12, shape: "ellipse", rx: 18, ry: 10 },
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

        {/* SILHOUETTE HUMAINE AMÉLIORÉE (Plus anatomique) */}
        <g stroke="#334155" strokeWidth="1.5" fill="url(#bodyGradient)" opacity="0.35">
          {/* Tête - forme plus réaliste */}
          <ellipse cx="150" cy="45" rx="28" ry="32" />
          {/* Mâchoire */}
          <path d="M125,55 Q150,85 175,55" fill="none" strokeWidth="1" />

          {/* Cou */}
          <path d="M138,75 L138,105 Q150,110 162,105 L162,75" fill="url(#bodyGradient)" />

          {/* Épaules et Torse - forme anatomique */}
          <path d="M90,115 Q95,105 138,105 L162,105 Q205,105 210,115
                   L210,125 Q185,130 185,180 L185,260
                   Q185,280 170,290 L130,290
                   Q115,280 115,260 L115,180
                   Q115,130 90,125 Z" />

          {/* Cage thoracique (suggestion) */}
          <ellipse cx="150" cy="170" rx="42" ry="55" stroke="#475569" strokeWidth="0.5" fill="none" opacity="0.3" />

          {/* Bras gauche - plus anatomique */}
          <path d="M90,115 Q75,120 70,140 L65,200 Q60,220 65,240 L70,280 Q72,295 80,300"
                fill="url(#bodyGradient)" strokeLinejoin="round" />
          {/* Main gauche */}
          <ellipse cx="82" cy="310" rx="8" ry="12" />

          {/* Bras droit */}
          <path d="M210,115 Q225,120 230,140 L235,200 Q240,220 235,240 L230,280 Q228,295 220,300"
                fill="url(#bodyGradient)" strokeLinejoin="round" />
          {/* Main droite */}
          <ellipse cx="218" cy="310" rx="8" ry="12" />

          {/* Bassin / Hanches */}
          <path d="M115,290 Q100,310 105,350 L110,380
                   Q115,400 130,410 L170,410
                   Q185,400 190,380 L195,350
                   Q200,310 185,290 Z" />

          {/* Jambe gauche */}
          <path d="M110,380 Q105,400 108,450 L110,520 Q112,550 120,560" fill="url(#bodyGradient)" />
          {/* Pied gauche */}
          <ellipse cx="125" cy="568" rx="12" ry="6" />

          {/* Jambe droite */}
          <path d="M190,380 Q195,400 192,450 L190,520 Q188,550 180,560" fill="url(#bodyGradient)" />
          {/* Pied droit */}
          <ellipse cx="175" cy="568" rx="12" ry="6" />
        </g>

        {/* Lignes anatomiques subtiles (structure interne) */}
        <g stroke="#475569" strokeWidth="0.3" fill="none" opacity="0.2">
          {/* Colonne vertébrale */}
          <path d="M150,105 L150,380" strokeDasharray="4,4" />
          {/* Côtes suggérées */}
          <path d="M115,150 Q150,145 185,150" />
          <path d="M115,165 Q150,160 185,165" />
          <path d="M115,180 Q150,175 185,180" />
          <path d="M118,195 Q150,190 182,195" />
        </g>

        {/* Ligne de scan animée */}
        <line x1="0" y1="0" x2="300" y2="0" stroke="#06b6d4" strokeWidth="1" opacity="0.6" className="animate-scan">
          <animate attributeName="y1" from="0" to="600" dur="3s" repeatCount="indefinite" />
          <animate attributeName="y2" from="0" to="600" dur="3s" repeatCount="indefinite" />
        </line>

        {/* ORGANES INTERACTIFS - Rendu amélioré */}
        {organs.map((organ, idx) => {
          const state = getOrganState(organ.id);
          const isHovered = hoveredOrgan === organ.id;
          const isHighlighted = isOrganHighlighted(organ.id);

          // Props communes pour tous les organes
          const commonProps = {
            fill: state.color,
            fillOpacity: isHovered || isHighlighted ? 1 : 0.7,
            stroke: isHighlighted ? "#ffffff" : state.color,
            strokeWidth: isHovered || isHighlighted ? 3 : 1.5,
            filter: "url(#glow)",
            style: {
              filter: isHighlighted ? `drop-shadow(0 0 12px ${state.color})` : state.glow,
              transform: isHighlighted ? "scale(1.05)" : "scale(1)",
              transformOrigin: `${organ.cx}px ${organ.cy}px`
            },
            className: `cursor-pointer transition-all duration-300 ${state.pulse || isHighlighted ? "animate-pulse" : ""}`,
            onMouseEnter: (e: React.MouseEvent<SVGElement>) => handleOrganHover(organ.id, e),
            onMouseLeave: () => setHoveredOrgan(null)
          };

          // === CERVEAU ===
          if (organ.shape === "circle") {
            return (
              <circle
                key={`${organ.id}-${idx}`}
                cx={organ.cx}
                cy={organ.cy}
                r={organ.r}
                {...commonProps}
              />
            );
          }

          // === THYROÏDE / GONADES (ellipse) ===
          if (organ.shape === "ellipse") {
            return (
              <ellipse
                key={`${organ.id}-${idx}`}
                cx={organ.cx}
                cy={organ.cy}
                rx={organ.rx || organ.r}
                ry={organ.ry || organ.r * 0.6}
                {...commonProps}
              />
            );
          }

          // === CŒUR (forme de cœur anatomique) ===
          if (organ.shape === "heart") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M150,185 C150,172 140,165 132,165 C122,165 115,175 115,183 C115,195 150,210 150,210 C150,210 185,195 185,183 C185,175 178,165 168,165 C160,165 150,172 150,185 Z"
                {...commonProps}
              />
            );
          }

          // === POUMON GAUCHE ===
          if (organ.shape === "lung-left") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M105,130 Q95,140 100,165 Q100,185 108,200 Q115,210 125,205 Q135,200 138,180 Q140,155 135,135 Q130,125 120,125 Q110,125 105,130 Z"
                {...commonProps}
              />
            );
          }

          // === POUMON DROIT ===
          if (organ.shape === "lung-right") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M195,130 Q205,140 200,165 Q200,185 192,200 Q185,210 175,205 Q165,200 162,180 Q160,155 165,135 Q170,125 180,125 Q190,125 195,130 Z"
                {...commonProps}
              />
            );
          }

          // === FOIE (forme anatomique) ===
          if (organ.shape === "liver") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M95,210 Q100,200 120,200 Q140,200 145,210 Q150,220 145,235 Q135,250 115,250 Q95,245 90,230 Q88,218 95,210 Z"
                {...commonProps}
              />
            );
          }

          // === ESTOMAC (forme de J inversé) ===
          if (organ.shape === "stomach") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M155,210 Q165,210 175,220 Q180,235 175,250 Q165,260 155,255 Q148,248 150,235 Q148,220 155,210 Z"
                {...commonProps}
              />
            );
          }

          // === RATE (ovale) ===
          if (organ.shape === "spleen") {
            return (
              <ellipse
                key={`${organ.id}-${idx}`}
                cx={organ.cx}
                cy={organ.cy}
                rx={12}
                ry={8}
                {...commonProps}
              />
            );
          }

          // === PANCRÉAS (forme allongée horizontale) ===
          if (organ.shape === "pancreas") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M125,248 Q140,245 155,248 Q170,252 180,255 Q175,260 160,260 Q145,258 130,260 Q120,258 125,248 Z"
                {...commonProps}
              />
            );
          }

          // === SURRÉNALE GAUCHE (petite forme triangulaire) ===
          if (organ.shape === "adrenal-left") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M125,262 L135,262 L130,272 Z"
                {...commonProps}
              />
            );
          }

          // === SURRÉNALE DROITE ===
          if (organ.shape === "adrenal-right") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M165,262 L175,262 L170,272 Z"
                {...commonProps}
              />
            );
          }

          // === REIN GAUCHE (forme de haricot) ===
          if (organ.shape === "kidney-left") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M115,275 Q108,280 110,295 Q115,310 125,310 Q135,305 135,290 Q135,278 125,275 Q120,273 115,275 Z"
                {...commonProps}
              />
            );
          }

          // === REIN DROIT ===
          if (organ.shape === "kidney-right") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M185,275 Q192,280 190,295 Q185,310 175,310 Q165,305 165,290 Q165,278 175,275 Q180,273 185,275 Z"
                {...commonProps}
              />
            );
          }

          // === INTESTINS (forme sinueuse améliorée) ===
          if (organ.shape === "intestines") {
            return (
              <path
                key={`${organ.id}-${idx}`}
                d="M125,315 Q120,325 130,335 Q140,340 150,335 Q160,340 170,335 Q180,325 175,315
                   Q170,325 160,320 Q150,325 140,320 Q130,325 125,315
                   M130,340 Q135,355 150,360 Q165,355 170,340
                   Q160,350 150,345 Q140,350 130,340 Z"
                {...commonProps}
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
