"use client";

import { useState } from "react";
import {
  BrainCircuit, X, ArrowLeft, Sparkles,
  Maximize2, BookOpen, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle
} from "@/components/ui/dialog";
import SystemGalaxy from "@/components/learning/SystemGalaxy";

interface CorticotropeTriggerProps {
  variant?: "default" | "compact" | "hero";
  className?: string;
}

export default function CorticotropeTrigger({
  variant = "default",
  className = ""
}: CorticotropeTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Variante compacte (pour les barres d'outils)
  if (variant === "compact") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 ${className}`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span className="hidden sm:inline">Physiologie</span>
          </Button>
        </DialogTrigger>
        <ModalContent onClose={() => setIsOpen(false)} />
      </Dialog>
    );
  }

  // Variante Hero (grande carte d'introduction)
  if (variant === "hero") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div
            className={`
              group relative overflow-hidden rounded-2xl border border-indigo-200/50
              bg-gradient-to-br from-indigo-50 via-white to-purple-50
              p-6 cursor-pointer transition-all duration-300
              hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10
              hover:scale-[1.01]
              ${className}
            `}
          >
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {/* Icône */}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BrainCircuit className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* Contenu */}
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              Axe Corticotrope
              <Sparkles className="h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Explorez la physiologie complète de l'axe de l'adaptation.
              Visualisez les deux boucles, les couplages inter-axiaux et les cibles thérapeutiques.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                🔴 1ère Boucle
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                🔵 2ème Boucle
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                🌿 Phytothérapie
              </span>
            </div>

            {/* Bouton */}
            <div className="flex items-center gap-2 text-indigo-600 font-medium group-hover:text-indigo-700">
              <Maximize2 className="h-4 w-4" />
              <span>Explorer en mode immersif</span>
              <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </DialogTrigger>
        <ModalContent onClose={() => setIsOpen(false)} />
      </Dialog>
    );
  }

  // Variante par défaut (bouton standard amélioré)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`
            relative overflow-hidden gap-2.5
            border-indigo-200 text-indigo-700
            hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
            hover:text-indigo-800 hover:border-indigo-300
            transition-all duration-300 shadow-sm hover:shadow-md
            group
            ${className}
          `}
        >
          {/* Effet de brillance au hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          <div className="relative flex items-center gap-2">
            <div className="relative">
              <BrainCircuit className="h-4 w-4" />
              <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="hidden sm:inline font-medium">
              Explorer la Physiologie
            </span>
            <span className="sm:hidden font-medium">Physiologie</span>
          </div>
        </Button>
      </DialogTrigger>
      <ModalContent onClose={() => setIsOpen(false)} />
    </Dialog>
  );
}

// Composant Modal séparé pour réutilisation
function ModalContent(_props: { onClose: () => void }) {
  return (
    <DialogContent className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-none bg-[#020617] flex flex-col overflow-hidden">
      <DialogTitle className="sr-only">
        Exploration Physiologique - Axe Corticotrope
      </DialogTitle>

      {/* HEADER FLOTTANT */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">

        {/* Panneau info gauche */}
        <div className="bg-black/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 text-white pointer-events-auto max-w-lg shadow-2xl">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/30 flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              MODE IMMERSIF
            </span>
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30">
              INTERACTIF
            </span>
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold flex items-center gap-3 text-white mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <BrainCircuit className="h-5 w-5" />
            </div>
            Axe Corticotrope
          </h2>

          {/* Instructions */}
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">🖱️</span>
              <span>Cliquer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">⚲</span>
              <span>Zoomer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">✋</span>
              <span>Déplacer</span>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="gap-2 bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </DialogClose>

            <Button
              variant="ghost"
              className="gap-2 text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => window.open('https://endobiogeny.com', '_blank')}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">En savoir plus</span>
            </Button>
          </div>
        </div>

        {/* Bouton fermer (gros et visible) */}
        <DialogClose asChild>
          <Button
            variant="ghost"
            className="h-14 w-14 rounded-2xl bg-black/60 backdrop-blur-xl text-white hover:bg-red-500/30 hover:text-red-400 border border-white/10 pointer-events-auto shadow-2xl transition-all"
          >
            <X className="h-7 w-7" />
          </Button>
        </DialogClose>
      </div>

      {/* GRAPHE (prend tout l'espace) */}
      <div className="flex-1 w-full h-full relative">
        <SystemGalaxy fullScreen={true} />
      </div>
    </DialogContent>
  );
}
