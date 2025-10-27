"use client";

import { useState } from "react";
import { Card } from "./ui";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarContent = (
    <Card className="p-3.5 h-fit">
      <h3 className="m-0 mb-2.5 font-bold text-text">Rubriques</h3>
      <div className="grid gap-2.5">
        <div className="text-sm text-muted px-3 py-2.5 border border-dashed border-border rounded-lg">
          🌿 Plantes médicinales (bientôt)
        </div>
        <div className="text-sm text-muted px-3 py-2.5 border border-dashed border-border rounded-lg">
          🧪 Molécules / constituants (bientôt)
        </div>
        <div className="text-sm text-muted px-3 py-2.5 border border-dashed border-border rounded-lg">
          🧩 Indications & axes (bientôt)
        </div>
        <div className="text-sm text-muted px-3 py-2.5 border border-dashed border-border rounded-lg">
          ⚗️ Formes galéniques & posologies (bientôt)
        </div>
        <div className="text-sm text-muted px-3 py-2.5 border border-dashed border-border rounded-lg">
          📚 Références & niveaux d'évidence (bientôt)
        </div>
      </div>
      <div className="mt-3.5 border-t border-dashed border-border pt-3">
        <h4 className="m-0 mb-2 text-sm font-semibold text-text">Astuce</h4>
        <p className="m-0 text-sm text-muted">
          Demandez toujours les références explicitement : "Ajoute (Source : Volume – section)".
        </p>
      </div>
    </Card>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">{sidebarContent}</aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-2 text-[#00131f] shadow-lg flex items-center justify-center font-bold text-xl"
        aria-label="Toggle sidebar"
      >
        {isOpen ? "✕" : "📚"}
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-40 w-80 max-w-[85vw] bg-bg p-4 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text p-2"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
