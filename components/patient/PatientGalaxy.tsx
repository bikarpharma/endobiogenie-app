"use client";

import React, { useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { transformPatientData } from "@/lib/galaxy/patient-transformer";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-slate-500">Chargement du Neuro-Gramme...</div>
});

export default function PatientGalaxy({ scores, bdf }: { scores: any, bdf: any }) {
  const fgRef = useRef<any>();

  // Transformation des données cliniques en objets Graphe
  const graphData = useMemo(() => transformPatientData(scores, bdf), [scores, bdf]);

  // --- MOTEUR DE DESSIN (CANVAS) ---
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = node.val / 2; // Taille de base

    // 1. EFFET DE PULSATION (Si alerte rouge)
    if (node.pulsing) {
        const time = Date.now() / 600;
        const pulseSize = size + Math.sin(time) * 3;

        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize + 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = `${node.color}33`; // Glow semi-transparent
        ctx.fill();
    }

    // 2. CORPS DU NOEUD
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3. TEXTE (LABEL)
    const fontSize = 14 / globalScale;
    if (globalScale > 0.6 || node.group === 'Master') {
        ctx.font = `bold ${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(node.id, node.x, node.y);

        // Sous-titre (Status clinique)
        if (globalScale > 0.9) {
            ctx.font = `${fontSize * 0.8}px Sans-Serif`;
            ctx.fillStyle = node.color === '#ef4444' ? '#fca5a5' : '#cbd5e1';
            ctx.fillText(node.status, node.x, node.y + size + fontSize);
        }
    }
  }, []);

  return (
    <div className="w-full h-full bg-[#020617] relative overflow-hidden rounded-xl border border-white/5 shadow-2xl">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={paintNode}

        // Physique fluide
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.4}
        cooldownTicks={100}

        // Style des liens
        linkColor={(link: any) => link.color}
        linkWidth={(link: any) => link.width}
        linkDirectionalParticles={(link: any) => link.particles ? 4 : 0}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={4}

        backgroundColor="#020617"

        // Ecarter les noeuds pour lisibilité
        d3Force={(d3Force) => {
            d3Force('charge').strength(-120);
            d3Force('link').distance(70);
        }}
      />

      {/* HUD LÉGENDE */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-4 py-3 rounded-lg border border-white/10 text-xs text-slate-300 shadow-lg pointer-events-none select-none">
         <h4 className="font-bold text-slate-500 mb-2 uppercase tracking-wider text-[10px]">État Fonctionnel</h4>
         <div className="flex items-center gap-2 mb-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"></span> Hyper / Stress</div>
         <div className="flex items-center gap-2 mb-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_blue]"></span> Hypo / Blocage</div>
         <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Équilibre</div>
      </div>
    </div>
  );
}
