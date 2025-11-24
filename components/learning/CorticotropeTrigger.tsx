"use client";

import { BrainCircuit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle
} from "@/components/ui/dialog";
import SystemGalaxy from "@/components/learning/SystemGalaxy";

export default function CorticotropeTrigger() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all shadow-sm"
        >
          <BrainCircuit className="h-4 w-4" />
          <span className="hidden sm:inline">Explorer la Physiologie (Vue Immersive)</span>
        </Button>
      </DialogTrigger>
      
      {/* MODALE PLEIN ÉCRAN */}
      <DialogContent className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-none bg-[#020617] flex flex-col overflow-hidden">

        <DialogTitle className="sr-only">Exploration Physiologique - Axe Corticotrope</DialogTitle>

        {/* HEADER FLOTTANT */}
        <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
            {/* Titre et info */}
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white pointer-events-auto max-w-md">
                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                    <BrainCircuit /> Axe Corticotrope
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                    Mode immersif. Utilisez la molette pour zoomer, cliquez-glissez pour vous déplacer.
                </p>
            </div>

            {/* Bouton Fermer (Gros et visible) */}
            <DialogClose asChild>
                <Button variant="ghost" className="h-12 w-12 rounded-full bg-black/40 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/10 pointer-events-auto">
                    <X className="h-6 w-6" />
                </Button>
            </DialogClose>
        </div>

        {/* CONTENEUR GRAPHIQUE (Prend tout l'espace restant) */}
        <div className="flex-1 w-full h-full relative">
             <SystemGalaxy fullScreen={true} />
        </div>

      </DialogContent>
    </Dialog>
  );
}