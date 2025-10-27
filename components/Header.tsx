"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

interface HeaderProps {
  session?: {
    user: {
      email?: string | null;
      role?: string;
    };
  } | null;
}

export function Header({ session }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-gradient-to-b from-[rgba(10,12,18,0.85)] to-[rgba(10,12,18,0.6)] border-b border-border">
      <div className="w-full max-w-[1100px] mx-auto px-4">
        <div className="flex items-center justify-between py-3.5">
          {/* Brand */}
          <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <span className="inline-grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent-2 text-[#00131f] font-bold text-sm">
              🌿
            </span>
            <strong className="text-text text-base">Agent Endobiogénie</strong>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3.5">
            {session ? (
              // Utilisateur connecté
              <>
                <Link
                  href="/dashboard"
                  className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent transition-all duration-200 hover:text-text hover:bg-white/5 hover:border-border"
                >
                  Dashboard
                </Link>
                <Link
                  href="/chat"
                  className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent transition-all duration-200 hover:text-text hover:bg-white/5 hover:border-border"
                >
                  Chat
                </Link>
                <span
                  className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent opacity-60 cursor-default pointer-events-none"
                  title="À venir"
                >
                  Fiches
                </span>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin/documents"
                    className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent transition-all duration-200 hover:text-text hover:bg-white/5 hover:border-border"
                  >
                    Admin
                  </Link>
                )}
                <span className="text-muted text-xs px-2">
                  {session.user.email}
                </span>
                <SignOutButton />
              </>
            ) : (
              // Utilisateur non connecté
              <>
                <Link
                  href="/"
                  className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent transition-all duration-200 hover:text-text hover:bg-white/5 hover:border-border"
                >
                  Accueil
                </Link>
                <Link
                  href="/login"
                  className="text-muted text-sm px-2.5 py-1.5 rounded-lg border border-transparent transition-all duration-200 hover:text-text hover:bg-white/5 hover:border-border"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="text-accent text-sm px-2.5 py-1.5 rounded-lg border border-accent transition-all duration-200 hover:bg-accent/10"
                >
                  Inscription
                </Link>
              </>
            )}
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
              {session ? (
                // Utilisateur connecté
                <>
                  <Link
                    href="/dashboard"
                    className="text-muted text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:text-text hover:bg-white/5"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/chat"
                    className="text-muted text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:text-text hover:bg-white/5"
                  >
                    Chat
                  </Link>
                  <span
                    className="text-muted text-sm px-3 py-2 rounded-lg opacity-60 cursor-default"
                    title="À venir"
                  >
                    Fiches
                  </span>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin/documents"
                      className="text-muted text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:text-text hover:bg-white/5"
                    >
                      Admin
                    </Link>
                  )}
                  <div className="border-t border-border mt-2 pt-2">
                    <span className="text-muted text-xs px-3 block mb-2">
                      {session.user.email}
                    </span>
                    <SignOutButton />
                  </div>
                </>
              ) : (
                // Utilisateur non connecté
                <>
                  <Link
                    href="/"
                    className="text-muted text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:text-text hover:bg-white/5"
                  >
                    Accueil
                  </Link>
                  <Link
                    href="/login"
                    className="text-muted text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:text-text hover:bg-white/5"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="text-accent text-sm px-3 py-2 rounded-lg border border-accent transition-all duration-200 hover:bg-accent/10"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
