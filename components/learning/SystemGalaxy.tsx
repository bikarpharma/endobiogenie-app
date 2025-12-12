"use client";

import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { CORTICO_DATA, GROUP_CONFIG, LINK_STYLES, RING_RADII, type NodeGroup } from "@/lib/galaxy-data";
import { NODE_DETAILS } from "@/lib/galaxy-details";
import {
  X, Info, Beaker,
  ChevronDown, Eye, Zap, CircleDot, Leaf,
  Brain, AlertTriangle,
  Target, Layers, Maximize2, Minimize2, Search
} from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#020617]">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-400" />
        </div>
        <p className="mt-4 text-indigo-400 font-medium">Chargement de l'Axe Corticotrope...</p>
        <p className="text-xs text-slate-500 mt-1">Disposition concentrique</p>
      </div>
    </div>
  )
});

interface SystemGalaxyProps {
  fullScreen?: boolean;
}

export default function SystemGalaxy({ fullScreen = false }: SystemGalaxyProps) {
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);

  // États
  const [highlightNodes, setHighlightNodes] = useState<Set<any>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<any>>(new Set());
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [showLegend, setShowLegend] = useState(true);
  const [showRings, setShowRings] = useState(true); // Afficher les cercles guides
  const [isFullscreen, setIsFullscreen] = useState(false);

  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Filtres par groupe
  const [visibleGroups, setVisibleGroups] = useState<Record<NodeGroup, boolean>>({
    Cerveau: true,
    SNA: true,
    Boucle1: true,
    Boucle2: true,
    Glande: true,
    Liaison: true,
    Metabolisme: true,
    Clinique: true,
    Couplage: true,
    Plante: true,
  });

  const toggleGroup = (group: NodeGroup) => {
    setVisibleGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Filtrage des données
  const filteredData = useMemo(() => {
    const hiddenGroups = new Set(
      (Object.keys(visibleGroups) as NodeGroup[]).filter(k => !visibleGroups[k])
    );

    const nodes = CORTICO_DATA.nodes.filter(n => !hiddenGroups.has(n.group));
    const nodeIds = new Set(nodes.map(n => n.id));

    const links = CORTICO_DATA.links.filter(l => {
      const source = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const target = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return nodeIds.has(source) && nodeIds.has(target);
    });

    return { nodes, links };
  }, [visibleGroups]);

  // Gestion du plein écran
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Erreur lors du passage en plein écran:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error("Erreur lors de la sortie du plein écran:", err);
      });
    }
  }, []);

  // Écouter les changements de plein écran (ex: touche Échap)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fonction de recherche
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = CORTICO_DATA.nodes.filter(node => {
      const nodeDetail = NODE_DETAILS[node.id];
      const title = nodeDetail?.title || node.id;
      const groupConfig = GROUP_CONFIG[node.group as NodeGroup];
      const groupLabel = groupConfig?.label || node.group;

      return (
        node.id.toLowerCase().includes(lowerQuery) ||
        title.toLowerCase().includes(lowerQuery) ||
        groupLabel.toLowerCase().includes(lowerQuery) ||
        node.group.toLowerCase().includes(lowerQuery)
      );
    }).slice(0, 6); // Max 6 résultats

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, []);

  // Sélectionner un résultat de recherche
  const selectSearchResult = useCallback((node: any) => {
    setSelectedNode(node);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);

    if (fgRef.current) {
      fgRef.current.centerAt(node.fx || node.x, node.fy || node.y, 600);
      fgRef.current.zoom(2, 600);
    }
  }, []);

  // Gestion dimensions
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

  // Zoom initial pour voir tout le graphe
  useEffect(() => {
    if (fgRef.current) {
      // Attendre que le graphe soit prêt
      setTimeout(() => {
        fgRef.current?.zoomToFit(500, 80);
      }, 300);
    }
  }, [filteredData]);

  // Handlers
  const handleNodeClick = useCallback((node: any) => {
    if (node) {
      setSelectedNode(node);
      if (fgRef.current) {
        fgRef.current.centerAt(node.fx || node.x, node.fy || node.y, 600);
        fgRef.current.zoom(2, 600);
      }
    } else {
      setSelectedNode(null);
    }
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setShowSearchResults(false);
  }, []);

  // Dessin du fond avec cercles concentriques
  const paintCanvas = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (!showRings) return;

    const ringColors = [
      'rgba(139, 92, 246, 0.15)',   // Ring 1 - Violet
      'rgba(249, 115, 22, 0.12)',   // Ring 2 - Orange
      'rgba(239, 68, 68, 0.10)',    // Ring 3 - Rouge
      'rgba(236, 72, 153, 0.08)',   // Ring 4 - Rose
      'rgba(234, 179, 8, 0.07)',    // Ring 5 - Jaune
      'rgba(244, 63, 94, 0.06)',    // Ring 6 - Rose vif
      'rgba(34, 197, 94, 0.05)',    // Ring 7 - Vert
    ];

    // Dessiner les cercles du plus grand au plus petit
    Object.entries(RING_RADII).reverse().forEach(([ringNum, radius]) => {
      if (radius === 0) return;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = ringColors[parseInt(ringNum) - 1] || 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();

      // Labels des anneaux (seulement si assez zoomé)
      if (globalScale > 0.4) {
        const labels: Record<number, string> = {
          1: "Commande",
          2: "Hypothalamus",
          3: "Hormones",
          4: "Glandes",
          5: "Métabolisme",
          6: "Clinique",
          7: "Phyto"
        };
        const label = labels[parseInt(ringNum)];
        if (label) {
          ctx.font = `${10 / globalScale}px Inter, sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.textAlign = 'left';
          ctx.fillText(label, radius + 5, 0);
        }
      }
    });
  }, [showRings]);

  // Peinture des nœuds
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Protection contre valeurs non-finies
    const x = node.fx ?? node.x;
    const y = node.fy ?? node.y;

    if (typeof x !== 'number' || typeof y !== 'number' || !isFinite(x) || !isFinite(y)) {
      return;
    }

    if (!visibleGroups[node.group as NodeGroup]) return;

    const isHover = highlightNodes.has(node);
    const isSelected = selectedNode?.id === node.id;
    const isDimmed = highlightNodes.size > 0 && !isHover && !isSelected;

    const config = GROUP_CONFIG[node.group as NodeGroup];
    if (!config) return;

    const baseSize = (node.val || 20) / 4;
    const size = (isHover || isSelected) ? baseSize * 1.3 : baseSize;
    const finalSize = size;

    if (!isFinite(finalSize) || finalSize <= 0) return;

    ctx.globalAlpha = isDimmed ? 0.2 : 1;

    // Glow
    ctx.shadowColor = config.glow;
    ctx.shadowBlur = (isHover || isSelected) ? 25 : 10;

    // Gradient
    const gradient = ctx.createRadialGradient(
      x - finalSize * 0.3, y - finalSize * 0.3, 0,
      x, y, finalSize * 1.2
    );
    gradient.addColorStop(0, config.gradient[0]);
    gradient.addColorStop(1, config.gradient[1]);
    ctx.fillStyle = gradient;

    // Forme
    ctx.beginPath();
    switch (config.shape) {
      case 'circle':
        ctx.arc(x, y, finalSize, 0, Math.PI * 2);
        break;
      case 'rect':
        const rectSize = finalSize * 0.85;
        ctx.rect(x - rectSize, y - rectSize, rectSize * 2, rectSize * 2);
        break;
      case 'diamond':
        ctx.moveTo(x, y - finalSize * 1.2);
        ctx.lineTo(x + finalSize, y);
        ctx.lineTo(x, y + finalSize * 1.2);
        ctx.lineTo(x - finalSize, y);
        ctx.closePath();
        break;
      case 'hexagon':
      case 'octagon':
        const sides = config.shape === 'hexagon' ? 6 : 8;
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          const px = x + finalSize * Math.cos(angle);
          const py = y + finalSize * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      case 'triangle':
        ctx.moveTo(x, y - finalSize * 1.1);
        ctx.lineTo(x - finalSize, y + finalSize * 0.6);
        ctx.lineTo(x + finalSize, y + finalSize * 0.6);
        ctx.closePath();
        break;
    }
    ctx.fill();

    // Bordure si sélectionné
    if (isHover || isSelected) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Emoji
    ctx.shadowBlur = 0;
    const emoji = node.emoji || config.icon;
    const emojiSize = finalSize * 0.75;
    ctx.font = `${emojiSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y + 1);

    // Label
    if (globalScale > 0.5 || node.group === 'Cerveau' || node.group === 'SNA' || isHover || isSelected) {
      const fontSize = Math.max(9, 11 / globalScale);
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 3;
      ctx.font = `${(node.group === 'Cerveau' || node.group === 'SNA' || isSelected) ? 'bold ' : ''}${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isHover || isSelected ? '#ffffff' : '#94a3b8';

      const label = node.id.replace(/_/g, ' ').replace('Ant', 'Ant.').replace('Post', 'Post.');
      ctx.fillText(label, x, y + finalSize + 3);
    }

    ctx.globalAlpha = 1;
  }, [highlightNodes, selectedNode, visibleGroups]);

  // Peinture des liens
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const source = link.source;
    const target = link.target;

    const sx = source.fx ?? source.x;
    const sy = source.fy ?? source.y;
    const tx = target.fx ?? target.x;
    const ty = target.fy ?? target.y;

    if (!isFinite(sx) || !isFinite(sy) || !isFinite(tx) || !isFinite(ty)) {
      return;
    }

    const isHighlighted = highlightLinks.has(link);
    const linkStyle = LINK_STYLES[link.type || 'stimule'] || LINK_STYLES.stimule;

    ctx.strokeStyle = isHighlighted ? linkStyle.color : `${linkStyle.color}25`;
    ctx.lineWidth = isHighlighted ? linkStyle.width * 1.5 : linkStyle.width * 0.4;

    if (linkStyle.dashArray) {
      ctx.setLineDash(linkStyle.dashArray.split(',').map(Number));
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Flèche
    if (isHighlighted && globalScale > 0.6) {
      const angle = Math.atan2(ty - sy, tx - sx);
      const midX = (sx + tx) / 2;
      const midY = (sy + ty) / 2;
      const arrowSize = 5;

      ctx.fillStyle = linkStyle.color;
      ctx.beginPath();
      ctx.moveTo(midX + arrowSize * Math.cos(angle), midY + arrowSize * Math.sin(angle));
      ctx.lineTo(midX + arrowSize * Math.cos(angle + 2.5), midY + arrowSize * Math.sin(angle + 2.5));
      ctx.lineTo(midX + arrowSize * Math.cos(angle - 2.5), midY + arrowSize * Math.sin(angle - 2.5));
      ctx.closePath();
      ctx.fill();
    }

    ctx.setLineDash([]);
  }, [highlightLinks]);

  // Données du nœud sélectionné
  const nodeDetails = selectedNode ? NODE_DETAILS[selectedNode.id] : null;
  const nodeConfig = selectedNode ? GROUP_CONFIG[selectedNode.group as NodeGroup] : null;

  // Groupes pour la légende
  const legendGroups: NodeGroup[] = [
    'Cerveau', 'SNA', 'Boucle1', 'Boucle2', 'Glande',
    'Liaison', 'Metabolisme', 'Clinique', 'Couplage', 'Plante'
  ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${fullScreen ? 'h-full' : 'h-[700px]'} bg-[#020617] flex overflow-hidden`}
    >
      {/* GRAPHE */}
      <div className="flex-1 relative h-full">
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width - (selectedNode ? 400 : 0)}
          height={dimensions.height}
          graphData={filteredData}
          nodeCanvasObject={paintNode}
          linkCanvasObject={paintLink}
          onRenderFramePre={paintCanvas}
          // Désactiver les forces pour positions fixes
          d3AlphaDecay={1}
          d3VelocityDecay={1}
          cooldownTicks={0}
          warmupTicks={0}
          // Interactions
          onNodeHover={(node: any) => {
            const newHNodes = new Set();
            const newHLinks = new Set();
            if (node) {
              newHNodes.add(node);
              filteredData.links.forEach((link: any) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                if (sourceId === node.id || targetId === node.id) {
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
          enableNodeDrag={false}
        />

        {/* Barre de recherche */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              placeholder="Rechercher un nœud..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />

            {/* Liste des résultats */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {searchResults.map((node) => {
                  const nodeDetail = NODE_DETAILS[node.id];
                  const config = GROUP_CONFIG[node.group as NodeGroup];
                  return (
                    <button
                      key={node.id}
                      onClick={() => selectSearchResult(node)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                    >
                      <span className="text-lg">{node.emoji || config?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {nodeDetail?.title || node.id.replace(/_/g, ' ')}
                        </p>
                        <p className="text-slate-500 text-xs truncate">{config?.label}</p>
                      </div>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: config?.color }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bouton toggle cercles */}
        <button
          onClick={() => setShowRings(!showRings)}
          className={`absolute top-4 left-4 z-20 p-2.5 rounded-xl border transition-all ${
            showRings
              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
              : 'bg-black/40 border-white/10 text-slate-500 hover:text-slate-300'
          }`}
          title={showRings ? "Masquer les anneaux" : "Afficher les anneaux"}
        >
          <Target className="h-4 w-4" />
        </button>

        {/* Bouton plein écran */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-xl border bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-black/60 transition-all"
          title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>

        {/* LÉGENDE / FILTRES */}
        {!showLegend ? (
          <button
            onClick={() => setShowLegend(true)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-xl p-3 rounded-full border border-white/10 hover:bg-black/80 transition-all"
          >
            <Eye className="h-5 w-5 text-slate-400 hover:text-white" />
          </button>
        ) : (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-w-[95vw]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-white font-semibold">Layout Concentrique</span>
              </div>
              <button onClick={() => setShowLegend(false)} className="p-1 hover:bg-white/10 rounded-full">
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="p-3 flex flex-wrap gap-2 justify-center">
              {legendGroups.map((group) => {
                const conf = GROUP_CONFIG[group];
                const isActive = visibleGroups[group];
                const count = CORTICO_DATA.nodes.filter(n => n.group === group).length;

                return (
                  <button
                    key={group}
                    onClick={() => toggleGroup(group)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5
                      ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    style={{
                      backgroundColor: isActive ? `${conf.color}25` : 'transparent',
                      borderWidth: 1,
                      borderColor: isActive ? conf.color : 'transparent',
                    }}
                  >
                    <span>{conf.icon}</span>
                    <span className="hidden sm:inline">{conf.label}</span>
                    <span className="text-[10px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-2 border-t border-white/5 flex flex-wrap gap-3 justify-center text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-4 h-0.5 bg-green-500" /> Stimule
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-0.5 bg-red-500" style={{ background: 'repeating-linear-gradient(90deg, #ef4444, #ef4444 2px, transparent 2px, transparent 4px)' }} /> Inhibe
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-0.5 bg-amber-500" style={{ background: 'repeating-linear-gradient(90deg, #f59e0b, #f59e0b 4px, transparent 4px, transparent 8px)' }} /> Rétrocontrôle
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-0.5 bg-purple-500" /> Produit
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PANNEAU LATÉRAL */}
      {selectedNode && nodeDetails && nodeConfig && (
        <div className="absolute right-0 top-0 h-full w-[400px] bg-slate-900/98 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="relative h-32 overflow-hidden shrink-0">
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${nodeConfig.gradient[0]}40, ${nodeConfig.gradient[1]}20)` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

            <div className="absolute top-4 right-16 text-5xl opacity-20">{selectedNode.emoji || nodeConfig.icon}</div>

            <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 bg-black/30 hover:bg-red-500/30 p-2 rounded-full text-white/80 hover:text-red-400 transition-all z-10">
              <X size={18} />
            </button>

            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  style={{ borderColor: nodeConfig.color, color: nodeConfig.color, backgroundColor: `${nodeConfig.color}15` }}>
                  {nodeConfig.icon} {nodeConfig.label}
                </span>
                {selectedNode.boucle && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedNode.boucle === 1 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {selectedNode.boucle === 1 ? '🔴 1ère Boucle' : '🔵 2ème Boucle'}
                  </span>
                )}
                {selectedNode.ring !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700/50 text-slate-400">
                    Anneau {selectedNode.ring}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">{nodeDetails.title}</h2>
              {nodeDetails.subtitle && <p className="text-sm text-slate-400 mt-0.5">{nodeDetails.subtitle}</p>}
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">

              {/* Rôle */}
              <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${nodeConfig.color}20` }}>
                  <Zap className="h-4 w-4" style={{ color: nodeConfig.color }} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Rôle</h4>
                  <p className="text-white font-medium">{nodeDetails.role}</p>
                </div>
              </div>

              {/* Citation Lapraz */}
              {nodeDetails.laprazQuote && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                    <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">📖 Selon Lapraz</span>
                  </div>
                  <p className="text-slate-300 text-sm italic leading-relaxed pl-3">"{nodeDetails.laprazQuote}"</p>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  <Info size={12} /> Description
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">{nodeDetails.description}</p>
              </div>

              {/* Signes Cliniques */}
              {nodeDetails.clinical && nodeDetails.clinical.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <h4 className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-3">
                    <AlertTriangle size={14} />
                    {selectedNode.group === 'Plante' ? 'Indications' : 'Signes Cliniques'}
                  </h4>
                  <ul className="space-y-2">
                    {nodeDetails.clinical.map((sign: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: nodeConfig.color }} />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Index BDF */}
              {nodeDetails.bdfIndex && nodeDetails.bdfIndex.length > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <h4 className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
                    <Beaker size={14} /> Index BDF
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {nodeDetails.bdfIndex.map((idx: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-lg border border-emerald-500/30">{idx}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              {nodeDetails.action && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <h4 className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-2">
                    <CircleDot size={14} /> Action
                  </h4>
                  <p className="text-slate-300 text-sm">{nodeDetails.action}</p>
                </div>
              )}

              {/* Plantes */}
              {nodeDetails.relatedPlants && nodeDetails.relatedPlants.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <h4 className="flex items-center gap-2 text-green-400 font-semibold text-sm mb-2">
                    <Leaf size={14} /> Phytothérapie
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {nodeDetails.relatedPlants.map((plant: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg border border-green-500/30 italic">🌿 {plant}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
