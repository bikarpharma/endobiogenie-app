"use client";

import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-gradient-to-b from-[rgba(10,12,18,0.85)] to-[rgba(10,12,18,0.6)] border-b border-border">
      <div className="w-full max-w-[1100px] mx-auto px-4">
        <div className="flex items-center justify-between py-3.5">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="inline-grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent-2 text-[#00131f] font-bold text-sm">
              🌿
            </span>
            <strong className="text-text text-base">Agent Endobiogénie</strong>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3.5">
            <a
              href="/"
              className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent transition-all duration-200 hover:text-text hover:bg-white/5 hover:border-border"
            >
              Chat
            </a>
            <a
              className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent opacity-60 cursor-default pointer-events-none"
              title="À venir"
            >
              Fiches
            </a>
            <a
              className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent opacity-60 cursor-default pointer-events-none"
              title="À venir"
            >
              Plantes
            </a>
            <a
              className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent opacity-60 cursor-default pointer-events-none"
              title="À venir"
            >
              Indications
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-border mt-2 pt-3">
            <div className="flex flex-col gap-2">
              <a
                href="/"
                className="text-muted text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:text-text hover:bg-white/5"
              >
                Chat
              </a>
              <a
                className="text-muted text-sm px-3 py-2 rounded-lg opacity-60 cursor-default"
                title="À venir"
              >
                Fiches
              </a>
              <a
                className="text-muted text-sm px-3 py-2 rounded-lg opacity-60 cursor-default"
                title="À venir"
              >
                Plantes
              </a>
              <a
                className="text-muted text-sm px-3 py-2 rounded-lg opacity-60 cursor-default"
                title="À venir"
              >
                Indications
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
