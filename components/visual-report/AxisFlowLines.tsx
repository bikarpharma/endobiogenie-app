/**
 * 🔗 LIGNES DE FLUX ANIMÉES
 * 
 * Visualise les connexions entre le cerveau (hypothalamus) et les organes cibles
 * selon les axes endocriniens de l'endobiogénie.
 * 
 * Axes visualisés:
 * - Corticotrope: Cerveau → Surrénales (CRH → ACTH → Cortisol)
 * - Thyréotrope: Cerveau → Thyroïde (TRH → TSH → T3/T4)
 * - Gonadotrope: Cerveau → Gonades (GnRH → FSH/LH → Hormones sexuelles)
 * - Somatotrope: Cerveau → Pancréas/Foie (GHRH → GH → IGF)
 * - Neurovégétatif: Cerveau → Cœur (SNA)
 */

"use client";

import React, { useMemo } from "react";
import type { AxisFlowData } from "@/lib/endobiogeny/organAnalysis";

interface AxisFlowLinesProps {
  axisFlows: AxisFlowData[];
  activeAxisId: string | null;
  hoveredOrgan: string | null;
  organPositions: Record<string, { cx: number; cy: number }>;
}

// Coordonnées du cerveau (point de départ de tous les axes)
const BRAIN_POSITION = { cx: 150, cy: 50 };

export default function AxisFlowLines({
  axisFlows,
  activeAxisId,
  hoveredOrgan,
  organPositions,
}: AxisFlowLinesProps) {
  
  // Calculer les chemins SVG pour chaque axe
  const flowPaths = useMemo(() => {
    return axisFlows.map((axis) => {
      const paths: { path: string; targetOrgan: string }[] = [];
      
      axis.toOrgans.forEach((targetOrgan) => {
        const targetPos = organPositions[targetOrgan];
        if (!targetPos) return;
        
        // Créer un chemin courbe de Bézier du cerveau vers l'organe
        const path = createFlowPath(BRAIN_POSITION, targetPos, targetOrgan);
        paths.push({ path, targetOrgan });
      });
      
      return { ...axis, paths };
    });
  }, [axisFlows, organPositions]);

  // Déterminer quels axes sont visibles
  const getAxisVisibility = (axis: AxisFlowData): boolean => {
    // Si un axe est sélectionné, ne montrer que celui-là
    if (activeAxisId) {
      return axis.id === activeAxisId;
    }
    
    // Si un organe est survolé, montrer les axes qui le concernent
    if (hoveredOrgan) {
      const organLower = hoveredOrgan.toLowerCase();
      // Montrer l'axe si l'organe survolé est le cerveau OU fait partie des cibles
      if (organLower === "cerveau") return true;
      return axis.toOrgans.some(o => o.toLowerCase() === organLower);
    }
    
    // Par défaut, montrer les axes anormaux (hyper/hypo)
    return axis.status !== "normal";
  };

  return (
    <g className="axis-flow-lines">
      {/* Définitions des gradients et filtres */}
      <defs>
        {flowPaths.map((axis) => (
          <React.Fragment key={`defs-${axis.id}`}>
            {/* Gradient pour le flux */}
            <linearGradient 
              id={`flow-gradient-${axis.id}`} 
              x1="0%" 
              y1="0%" 
              x2="100%" 
              y2="100%"
            >
              <stop offset="0%" stopColor={axis.color} stopOpacity="0.2" />
              <stop offset="50%" stopColor={axis.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={axis.color} stopOpacity="0.2" />
            </linearGradient>
            
            {/* Filtre de glow pour les lignes */}
            <filter id={`flow-glow-${axis.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={axis.color} floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </React.Fragment>
        ))}
        
        {/* Marqueur de flèche animé */}
        <marker
          id="flow-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L6,3 z" fill="currentColor" opacity="0.8" />
        </marker>
      </defs>

      {/* Rendu des chemins de flux */}
      {flowPaths.map((axis) => {
        const isVisible = getAxisVisibility(axis);
        const isActive = activeAxisId === axis.id;
        const isHyperOrHypo = axis.status === "hyper" || axis.status === "hypo";
        
        return axis.paths.map(({ path, targetOrgan }, pathIdx) => (
          <g 
            key={`${axis.id}-${pathIdx}`}
            className={`
              transition-all duration-500
              ${isVisible ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {/* Ligne de base (plus large, plus floue) */}
            <path
              d={path}
              fill="none"
              stroke={axis.color}
              strokeWidth={isActive ? 6 : 4}
              strokeOpacity={isActive ? 0.3 : 0.15}
              strokeLinecap="round"
              filter={`url(#flow-glow-${axis.id})`}
              className="transition-all duration-300"
            />
            
            {/* Ligne principale */}
            <path
              d={path}
              fill="none"
              stroke={axis.color}
              strokeWidth={isActive ? 3 : 2}
              strokeOpacity={isActive ? 0.9 : 0.6}
              strokeLinecap="round"
              strokeDasharray={isHyperOrHypo ? "0" : "8 4"}
              className="transition-all duration-300"
            />
            
            {/* Particules animées le long du chemin */}
            {isVisible && (
              <>
                <FlowParticle 
                  path={path} 
                  color={axis.color} 
                  duration={isActive ? 1.5 : 2.5}
                  delay={0}
                  size={isActive ? 6 : 4}
                />
                <FlowParticle 
                  path={path} 
                  color={axis.color} 
                  duration={isActive ? 1.5 : 2.5}
                  delay={0.5}
                  size={isActive ? 5 : 3}
                />
                {isActive && (
                  <FlowParticle 
                    path={path} 
                    color={axis.color} 
                    duration={1.5}
                    delay={1}
                    size={4}
                  />
                )}
              </>
            )}
            
            {/* Label de l'axe (visible quand actif) */}
            {isActive && (
              <FlowLabel 
                path={path}
                text={axis.description}
                color={axis.color}
              />
            )}
          </g>
        ));
      })}
    </g>
  );
}

// ============================================
// COMPOSANTS INTERNES
// ============================================

/**
 * Particule animée qui voyage le long du chemin
 */
function FlowParticle({ 
  path, 
  color, 
  duration, 
  delay,
  size 
}: { 
  path: string;
  color: string;
  duration: number;
  delay: number;
  size: number;
}) {
  const id = useMemo(() => `particle-${Math.random().toString(36).substr(2, 9)}`, []);
  
  return (
    <>
      <circle
        r={size}
        fill={color}
        opacity="0.9"
        filter="url(#flow-glow)"
      >
        <animateMotion
          dur={`${duration}s`}
          repeatCount="indefinite"
          begin={`${delay}s`}
          path={path}
        />
        {/* Effet de pulsation */}
        <animate
          attributeName="r"
          values={`${size};${size * 1.3};${size}`}
          dur="0.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3;0.9;0.3"
          dur={`${duration}s`}
          repeatCount="indefinite"
          begin={`${delay}s`}
        />
      </circle>
      
      {/* Traînée de la particule */}
      <circle
        r={size * 0.6}
        fill={color}
        opacity="0.4"
      >
        <animateMotion
          dur={`${duration}s`}
          repeatCount="indefinite"
          begin={`${delay + 0.1}s`}
          path={path}
        />
      </circle>
    </>
  );
}

/**
 * Label textuel le long du chemin
 */
function FlowLabel({
  path,
  text,
  color,
}: {
  path: string;
  text: string;
  color: string;
}) {
  const pathId = useMemo(() => `label-path-${Math.random().toString(36).substr(2, 9)}`, []);
  
  return (
    <>
      <defs>
        <path id={pathId} d={path} />
      </defs>
      <text
        fill={color}
        fontSize="8"
        fontWeight="500"
        opacity="0.8"
        className="animate-in fade-in duration-500"
      >
        <textPath
          href={`#${pathId}`}
          startOffset="30%"
          textAnchor="middle"
        >
          {text}
        </textPath>
      </text>
    </>
  );
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Crée un chemin de Bézier courbe entre deux points
 */
function createFlowPath(
  from: { cx: number; cy: number },
  to: { cx: number; cy: number },
  targetOrgan: string
): string {
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  
  // Points de contrôle pour la courbe de Bézier
  // Ajustés selon la position de l'organe cible
  let cp1x: number, cp1y: number, cp2x: number, cp2y: number;
  
  switch (targetOrgan.toLowerCase()) {
    case "surrenales":
      // Courbe qui descend puis s'écarte vers les surrénales
      cp1x = from.cx;
      cp1y = from.cy + dy * 0.4;
      cp2x = to.cx;
      cp2y = to.cy - dy * 0.2;
      break;
      
    case "thyroide":
      // Ligne presque droite vers le bas
      cp1x = from.cx;
      cp1y = from.cy + dy * 0.5;
      cp2x = to.cx;
      cp2y = to.cy - dy * 0.3;
      break;
      
    case "gonades":
      // Grande courbe descendante
      cp1x = from.cx;
      cp1y = from.cy + dy * 0.3;
      cp2x = to.cx;
      cp2y = to.cy - dy * 0.2;
      break;
      
    case "coeur":
      // Courbe courte vers le cœur
      cp1x = from.cx - 20;
      cp1y = from.cy + dy * 0.5;
      cp2x = to.cx - 10;
      cp2y = to.cy - 20;
      break;
      
    case "pancreas":
    case "foie":
      // Courbe vers l'abdomen
      cp1x = from.cx + (dx > 0 ? 20 : -20);
      cp1y = from.cy + dy * 0.4;
      cp2x = to.cx;
      cp2y = to.cy - dy * 0.15;
      break;
      
    default:
      // Courbe générique
      cp1x = from.cx + dx * 0.3;
      cp1y = from.cy + dy * 0.5;
      cp2x = to.cx - dx * 0.3;
      cp2y = to.cy - dy * 0.3;
  }
  
  return `M ${from.cx} ${from.cy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.cx} ${to.cy}`;
}

// ============================================
// POSITIONS DES ORGANES (Export pour le BodyMap)
// ============================================

export const ORGAN_POSITIONS: Record<string, { cx: number; cy: number }> = {
  cerveau: { cx: 150, cy: 50 },
  thyroide: { cx: 150, cy: 100 },
  coeur: { cx: 150, cy: 175 },
  poumons: { cx: 150, cy: 155 }, // Centre des deux poumons
  foie: { cx: 118, cy: 220 },
  estomac: { cx: 165, cy: 225 },
  rate: { cx: 190, cy: 215 },
  pancreas: { cx: 150, cy: 250 },
  surrenales: { cx: 150, cy: 265 }, // Centre des deux surrénales
  reins: { cx: 150, cy: 285 }, // Centre des deux reins
  intestins: { cx: 150, cy: 330 },
  gonades: { cx: 150, cy: 400 },
};
