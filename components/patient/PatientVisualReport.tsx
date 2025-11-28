"use client";

import React, { useState } from "react";
import { Printer, AlertTriangle, ArrowDown, Leaf, Activity, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BodyMap from "@/components/learning/BodyMap";

// MOCK DATA (Avec les ID pour le lien interactif)
const REPORT_DATA = [
  {
    id: "surrenales", // ID qui correspond à l'organe dans BodyMap
    title: "Surmenage Surrénalien",
    severity: "CRITIQUE",
    desc: "Vos batteries sont à plat. L'excès de stress a épuisé vos réserves de cortisol.",
    plant: "Cassis (Bourgeon)",
    plantLatin: "Ribes nigrum",
    action: "Recharge les batteries (Effet Cortison-like) et coupe l'inflammation.",
    dosage: "50 gouttes le matin (pur ou dilué)",
    color: "red"
  },
  {
    id: "foie",
    title: "Congestion Hépatique",
    severity: "MODÉRÉ",
    desc: "Votre foie est surchargé et n'élimine plus correctement les toxines (Réveils nocturnes).",
    plant: "Romarin (Klil) - Tisane", // TOUCHE TUNISIENNE
    plantLatin: "Rosmarinus officinalis CT Cinéole",
    action: "Le Klil draine la bile et relance l'énergie du foie le matin.",
    dosage: "1 pincée infusée 10min, à jeun.",
    color: "orange"
  },
  {
    id: "intestins",
    title: "Dysbiose Intestinale",
    severity: "LÉGER",
    desc: "Légère inflammation de la muqueuse digestive.",
    plant: "Figuier (Bourgeon)",
    plantLatin: "Ficus carica",
    action: "Apaise l'axe Cerveau-Intestin et régule l'acidité.",
    dosage: "30 gouttes le soir.",
    color: "yellow"
  }
];

export default function PatientVisualReport() {
  // État pour gérer le survol (Lien Carte <-> Corps)
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-100 p-6 overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Activity className="text-indigo-500" />
            Synthèse Visuelle Patient
          </h2>
          <p className="text-sm text-slate-400">Corrélation anatomo-physiologique et thérapeutique</p>
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2">
          <Printer size={16} /> Imprimer le Rapport
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">

        {/* COLONNE GAUCHE : LE CORPS (SCANNER) */}
        <div className="lg:col-span-4 relative bg-slate-900/30 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-4">

           {/* EFFET SCANNER (Ligne qui descend) */}
           <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[scan_4s_ease-in-out_infinite]" />
           </div>

           {/* Le BodyMap reçoit l'ID survolé pour s'allumer */}
           <div className="relative z-10 scale-110">
              <BodyMap
                 scores={{ corticotrope: 80, thyreotrope: 40 }}
                 bdf={{
                   adrenal: { status: 'HYPER', value: 0.8, interpretation: 'Hyperfonction' },
                   thyroid: { status: 'NORMAL', value: 0.5, interpretation: 'Normal' },
                   metabolic: { status: 'RESISTANCE', value: 0.7, interpretation: 'Résistance' },
                   cardiac: { status: 'NORMAL', value: 0.4, interpretation: 'Normal' },
                   gonadal: { status: 'NORMAL', value: 0.5, interpretation: 'Normal' }
                 }}
                 highlightedOrgan={hoveredOrgan}
              />
           </div>

           <div className="absolute bottom-4 text-xs text-slate-500 flex gap-2">
              <span className="flex items-center gap-1"><ScanLine size={10}/> Analyse en temps réel</span>
           </div>
        </div>

        {/* COLONNE DROITE : LES CARTES (SCROLLABLE) */}
        <div className="lg:col-span-8 overflow-y-auto pr-2 space-y-4">
           {REPORT_DATA.map((item, idx) => (
             <Card
                key={idx}
                // GESTION DU SURVOL
                onMouseEnter={() => setHoveredOrgan(item.id)}
                onMouseLeave={() => setHoveredOrgan(null)}
                className={`
                   border-0 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-300
                   ${hoveredOrgan === item.id ? 'ring-2 ring-indigo-500 scale-[1.02] bg-slate-800' : 'hover:bg-slate-800/80'}
                `}
             >
                <div className="flex flex-col sm:flex-row">

                   {/* ZONE PROBLÈME (Gauche) */}
                   <div className={`p-5 sm:w-1/2 border-l-4 ${
                      item.color === 'red' ? 'border-red-500 bg-red-500/5' :
                      item.color === 'orange' ? 'border-orange-500 bg-orange-500/5' :
                      'border-yellow-500 bg-yellow-500/5'
                   }`}>
                      <div className="flex justify-between items-start mb-2">
                         <div className={`flex items-center gap-2 font-bold ${
                            item.color === 'red' ? 'text-red-400' :
                            item.color === 'orange' ? 'text-orange-400' : 'text-yellow-400'
                         }`}>
                            <AlertTriangle size={18} />
                            {item.title}
                         </div>
                         <Badge variant="outline" className="text-[10px] border-slate-700">
                            {item.severity}
                         </Badge>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed mb-4">
                         {item.desc}
                      </p>

                      {/* FLÈCHE DE TRANSITION (Visible sur mobile en bas, desktop à droite) */}
                      <div className="flex justify-center sm:justify-end text-slate-600">
                         <ArrowDown className="sm:-rotate-90" />
                      </div>
                   </div>

                   {/* ZONE SOLUTION (Droite) */}
                   <div className="p-5 sm:w-1/2 bg-emerald-950/10 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                         <div className="p-1.5 bg-emerald-500/20 rounded text-emerald-400">
                            <Leaf size={16} />
                         </div>
                         <span className="font-bold text-emerald-100 text-lg">{item.plant}</span>
                      </div>
                      <span className="text-xs text-slate-500 italic mb-3 ml-9">{item.plantLatin}</span>

                      <div className="bg-slate-950/50 p-3 rounded-lg border border-white/5 text-xs">
                         <p className="text-emerald-200/80 mb-2">{item.action}</p>
                         <div className="font-mono text-slate-300 bg-black/20 p-1.5 rounded text-center">
                            {item.dosage}
                         </div>
                      </div>
                   </div>

                </div>
             </Card>
           ))}
        </div>

      </div>

      {/* CSS Animation pour le Scanner */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
