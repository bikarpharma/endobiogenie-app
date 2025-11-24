"use client";

import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { CORTICO_DATA } from "@/lib/galaxy-data";
import { NODE_DETAILS } from "@/lib/galaxy-details"; // Import du dictionnaire
import { X, Info, Activity, Layers, Filter, Eye, ChevronDown } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="flex h-screen w-screen items-center justify-center text-indigo-400 bg-[#020617]">Chargement des Systèmes...</div>
});

export default function SystemGalaxy({ fullScreen = false }: { fullScreen?: boolean }) {
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // États
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [showLegend, setShowLegend] = useState(true);

  // --- FILTRES (TACTICAL CONTROLS) ---
  const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>({
    Master: true,
    Hormone: true,
    Glande: true,
    Systeme: true,
    Symptome: true,
    Plante: true,
  });

  const toggleGroup = (group: string) => {
    setVisibleGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Filtrage des données en temps réel
  const filteredData = useMemo(() => {
    const hiddenGroups = new Set(Object.keys(visibleGroups).filter(k => !visibleGroups[k]));
    
    // On garde les noeuds visibles
    const nodes = CORTICO_DATA.nodes.filter(n => !hiddenGroups.has(n.group));
    const nodeIds = new Set(nodes.map(n => n.id));

    // On ne garde que les liens dont les DEUX bouts sont visibles
    const links = CORTICO_DATA.links.filter(l => {
        const source = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const target = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return nodeIds.has(source) && nodeIds.has(target);
    });

    return { nodes, links };
  }, [visibleGroups]);

  // --- CONFIG VISUELLE ---
  const CONFIG = {
    Master:   { color: "#ef4444", shape: "octagon", icon: "🧠", label: "Master" },
    Hormone:  { color: "#a855f7", shape: "circle",  icon: "⚡", label: "Hormone" },
    Glande:   { color: "#3b82f6", shape: "rect",    icon: "🏭", label: "Organe" },
    Systeme:  { color: "#06b6d4", shape: "rect",    icon: "🌐", label: "Système" },
    Symptome: { color: "#f59e0b", shape: "triangle",icon: "⚠️", label: "Symptôme" },
    Plante:   { color: "#10b981", shape: "hexagon", icon: "🌿", label: "Plante" },
    Default:  { color: "#94a3b8", shape: "circle",  icon: "•",  label: "Autre" }
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    const resizeObserver = new ResizeObserver(() => updateDimensions());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateDimensions();
    }
    return () => resizeObserver.disconnect();
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (node) {
      // Clic sur un nœud : ouvrir le panneau
      setSelectedNode(node);
      if (fgRef.current) {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(3, 1000);
      }
    } else {
      // Clic sur le fond : fermer le panneau
      setSelectedNode(null);
    }
  }, []);

  // Nouveau handler pour clic sur fond (mode Zen)
  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setShowLegend(false);
  }, []);

  // --- PEINTURE (RENDER) ---
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Sécurité si le noeud est censé être caché
    if (!visibleGroups[node.group]) return;

    const isHover = highlightNodes.has(node);
    const isSelected = selectedNode === node;
    const isDimmed = (highlightNodes.size > 0 && !isHover) && !isSelected;
    
    const style = CONFIG[node.group as keyof typeof CONFIG] || CONFIG.Default;
    const color = style.color;
    const size = (isHover || isSelected) ? 10 : 6; 
    
    ctx.globalAlpha = isDimmed ? 0.1 : 1;
    ctx.shadowColor = color;
    ctx.shadowBlur = (isHover || isSelected) ? 25 : 8;
    ctx.fillStyle = color;
    
    ctx.beginPath();
    if (style.shape === 'circle') ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    else if (style.shape === 'rect') ctx.rect(node.x - size, node.y - size, size * 2, size * 2);
    else if (style.shape === 'triangle') {
      ctx.moveTo(node.x, node.y - size * 1.2);
      ctx.lineTo(node.x - size, node.y + size);
      ctx.lineTo(node.x + size, node.y + size);
      ctx.closePath();
    }
    else if (style.shape === 'hexagon' || style.shape === 'octagon') {
        const sides = style.shape === 'hexagon' ? 6 : 8;
        const radius = size * 1.1;
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const x = node.x + radius * Math.cos(angle);
            const y = node.y + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
    }
    ctx.fill();

    if (globalScale > 1.5 || isHover || isSelected) {
        ctx.shadowBlur = 0;
        ctx.font = `${(isHover || isSelected) ? size : size - 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(style.icon, node.x, node.y + 1); 
    }

    if (globalScale > 1.1 || node.group === "Master" || isHover || isSelected) {
        const fontSize = 12 / globalScale;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "black";
        ctx.font = `${(node.group === "Master" || isSelected) ? "bold" : ""} ${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = (isHover || isSelected) ? '#ffffff' : '#e2e8f0';
        ctx.fillText(node.id.replace(/_/g, " "), node.x, node.y + size + 2);
    }
    ctx.globalAlpha = 1;
  }, [highlightNodes, selectedNode, visibleGroups]);

  // Données détaillées du noeud sélectionné
  const nodeDetails = selectedNode ? NODE_DETAILS[selectedNode.id] : null;

  return (
    <div ref={containerRef} className={`relative w-full ${fullScreen ? 'h-full' : 'h-[600px]'} bg-[#020617] flex overflow-hidden`}>
      
      {/* 1. ZONE GRAPHE */}
      <div className="flex-1 relative h-full">
        <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={filteredData} // On utilise les données filtrées !
            nodeCanvasObject={paintNode}
            d3AlphaDecay={0.02} 
            d3VelocityDecay={0.4}
            cooldownTicks={100}
            linkColor={() => "#334155"}
            linkWidth={link => (highlightLinks.has(link) ? 2.5 : 0.5)}
            linkDirectionalParticles={link => (highlightLinks.has(link) ? 3 : 0)}
            linkDirectionalParticleWidth={3}
            onNodeHover={(node: any) => {
                // Logique Hover identique...
                const newHNodes = new Set();
                const newHLinks = new Set();
                if (node) {
                  newHNodes.add(node);
                  filteredData.links.forEach((link: any) => {
                    if (link.source.id === node.id || link.target.id === node.id) {
                      newHLinks.add(link);
                      newHNodes.add(link.source);
                      newHNodes.add(link.target);
                    }
                  });
                }
                setHighlightNodes(newHNodes);
                setHighlightLinks(newHLinks);
            }}
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            backgroundColor="#020617"
            d3Force={(d3Force) => {
                d3Force('charge').strength(-200);
                d3Force('link').distance(70);
            }}
        />

        {/* 2. FILTRES TACTIQUES (HUD BAS) - Mode Réduit/Complet */}
        {!showLegend ? (
          // Mode réduit : Petit bouton discret pour réafficher la légende
          <button
            onClick={() => setShowLegend(true)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/10 hover:bg-black/80 transition-all shadow-2xl group"
            title="Afficher la légende"
          >
            <Eye className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        ) : (
          // Mode complet : Légende complète avec bouton de fermeture
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
            {/* Header avec titre et bouton fermer */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                Filtres
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Masquer la légende"
              >
                <ChevronDown className="h-4 w-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Filtres */}
            <div className="p-2 flex gap-2">
              {Object.keys(CONFIG).filter(k => k !== 'Default').map((group) => {
                  const conf = CONFIG[group as keyof typeof CONFIG];
                  const isActive = visibleGroups[group];
                  return (
                      <button
                          key={group}
                          onClick={() => toggleGroup(group)}
                          className={`
                              px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2
                              ${isActive
                                  ? `bg-white/10 text-white shadow-[0_0_10px_${conf.color}40] border border-${conf.color}/50`
                                  : "bg-transparent text-slate-500 hover:text-slate-300 border border-transparent"}
                          `}
                          style={{ borderColor: isActive ? conf.color : 'transparent' }}
                      >
                          <span>{conf.icon}</span>
                          <span className="hidden sm:inline">{conf.label}</span>
                      </button>
                  )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. PANNEAU LATÉRAL INTELLIGENT */}
      {selectedNode && (
        <div className="absolute right-0 top-0 h-full w-[400px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 p-0 text-slate-100 shadow-2xl transition-transform animate-in slide-in-from-right duration-300 z-30 flex flex-col">
            {/* Header avec Image/Couleur */}
            <div className="relative h-32 overflow-hidden shrink-0">
                <div 
                    className="absolute inset-0 opacity-20" 
                    style={{ backgroundColor: CONFIG[selectedNode.group as keyof typeof CONFIG]?.color }} 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
                
                <button 
                    onClick={() => setSelectedNode(null)}
                    className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 p-1 rounded-full text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="absolute bottom-4 left-6">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 border ${
                         CONFIG[selectedNode.group as keyof typeof CONFIG]?.color === "#ef4444" ? "border-red-500 text-red-400" : "border-slate-500 text-slate-300"
                    }`}>
                        {selectedNode.group}
                    </span>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {nodeDetails?.title || selectedNode.id.replace(/_/g, " ")}
                    </h2>
                </div>
            </div>

            {/* Contenu Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Description Principale */}
                <div className="prose prose-invert prose-sm">
                    <p className="text-slate-300 text-base leading-relaxed">
                        {nodeDetails?.desc || "Aucune description disponible pour cet élément."}
                    </p>
                </div>

                {/* Section Signes Cliniques */}
                {nodeDetails?.clinical && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                        <h4 className="flex items-center gap-2 text-orange-400 font-bold mb-3 text-sm uppercase tracking-wide">
                            <Activity size={14} /> 
                            {selectedNode.group === "Plante" ? "Indications Clés" : "Signes Cliniques"}
                        </h4>
                        <ul className="space-y-2">
                            {nodeDetails.clinical.map((sign: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-500/50" />
                                    {sign}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                 {/* Section Action / Mécanisme */}
                 {nodeDetails?.action && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                        <h4 className="flex items-center gap-2 text-indigo-400 font-bold mb-3 text-sm uppercase tracking-wide">
                            <Info size={14} /> Mécanisme
                        </h4>
                        <p className="text-sm text-slate-400 italic">
                            {nodeDetails.action}
                        </p>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20 text-center">
                 <p className="text-[10px] text-slate-600">Endobiogeny Learning System v4.0</p>
            </div>
        </div>
      )}
    </div>
  );
}