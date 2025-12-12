"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  APCI_DEFINITIONS,
  MEDICAL_CATEGORY_COLORS,
  MEDICAL_CATEGORY_LABELS,
  CLINICAL_STATUS_LABELS,
  CLINICAL_STATUS_COLORS,
  searchApci,
  getFrequentApcis,
  getApciByCode,
  createApciEntry,
  formatApciEntryLabel,
} from "@/lib/clinical/apci";
import type {
  ApciDefinition,
  ApciSubtypeDefinition,
  PatientApciEntry,
  ClinicalStatus,
} from "@/lib/clinical/apci";

interface SmartApciSelectorProps {
  value: PatientApciEntry[];
  onChange: (next: PatientApciEntry[]) => void;
  disabled?: boolean;
}

type ViewState =
  | { type: "search" }
  | { type: "subtypes"; apci: ApciDefinition }
  | { type: "confirm-severe"; apci: ApciDefinition; subtypeCode?: string };

export default function SmartApciSelector({
  value,
  onChange,
  disabled = false,
}: SmartApciSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [viewState, setViewState] = useState<ViewState>({ type: "search" });
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Résultats de recherche
  const searchResults = useMemo(() => {
    if (query.length === 0) {
      return getFrequentApcis(10);
    }
    return searchApci(query, 10);
  }, [query]);

  // Filtrer les APCI déjà sélectionnées
  const filteredResults = useMemo(() => {
    const selectedCodes = new Set(value.map((v) => v.apciCode));
    return searchResults.filter((apci) => !selectedCodes.has(apci.code));
  }, [searchResults, value]);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setViewState({ type: "search" });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sélection d'une APCI
  const handleSelectApci = useCallback(
    (apci: ApciDefinition) => {
      // Si nécessite un sous-type, afficher la vue sous-types
      if (apci.requiresSubtype && apci.subtypes && apci.subtypes.length > 0) {
        setViewState({ type: "subtypes", apci });
        setHighlightedIndex(0);
        return;
      }

      // Si terrain sévère, demander confirmation
      if (apci.isSeverePattern) {
        setViewState({ type: "confirm-severe", apci });
        return;
      }

      // Sinon, ajouter directement
      const entry = createApciEntry(apci.code);
      onChange([...value, entry]);
      setQuery("");
      setIsOpen(false);
      setViewState({ type: "search" });
    },
    [value, onChange]
  );

  // Sélection d'un sous-type
  const handleSelectSubtype = useCallback(
    (apci: ApciDefinition, subtype: ApciSubtypeDefinition) => {
      // Si terrain sévère, demander confirmation
      if (apci.isSeverePattern) {
        setViewState({ type: "confirm-severe", apci, subtypeCode: subtype.code });
        return;
      }

      // Sinon, ajouter directement
      const entry = createApciEntry(apci.code, subtype.code);
      onChange([...value, entry]);
      setQuery("");
      setIsOpen(false);
      setViewState({ type: "search" });
    },
    [value, onChange]
  );

  // Confirmation terrain sévère
  const handleConfirmSevere = useCallback(() => {
    if (viewState.type !== "confirm-severe") return;

    const entry = createApciEntry(
      viewState.apci.code,
      viewState.subtypeCode
    );
    onChange([...value, entry]);
    setQuery("");
    setIsOpen(false);
    setViewState({ type: "search" });
  }, [viewState, value, onChange]);

  // Retour à la recherche
  const handleBack = useCallback(() => {
    setViewState({ type: "search" });
    setHighlightedIndex(0);
  }, []);

  // Suppression d'une APCI
  const handleRemove = useCallback(
    (id: string) => {
      onChange(value.filter((v) => v.id !== id));
    },
    [value, onChange]
  );

  // Changement de statut
  const handleStatusChange = useCallback(
    (id: string, status: ClinicalStatus) => {
      onChange(
        value.map((v) => (v.id === id ? { ...v, status } : v))
      );
    },
    [value, onChange]
  );

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const items =
      viewState.type === "subtypes"
        ? viewState.apci.subtypes || []
        : filteredResults;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < items.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (viewState.type === "search" && filteredResults[highlightedIndex]) {
          handleSelectApci(filteredResults[highlightedIndex]);
        } else if (
          viewState.type === "subtypes" &&
          viewState.apci.subtypes?.[highlightedIndex]
        ) {
          handleSelectSubtype(
            viewState.apci,
            viewState.apci.subtypes[highlightedIndex]
          );
        }
        break;
      case "Escape":
        if (viewState.type !== "search") {
          handleBack();
        } else {
          setIsOpen(false);
        }
        break;
      case "Backspace":
        if (query === "" && viewState.type !== "search") {
          handleBack();
        }
        break;
    }
  };

  return (
    <div className="relative">
      <label className="block font-semibold mb-2 text-gray-700">
        Affections chroniques APCI
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Liste des 24 affections prises en charge (vocabulaire CNAM, sans logique administrative)
      </p>

      {/* Input de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setViewState({ type: "search" });
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher par code (01, 05...) ou nom (diabète, HTA...)"
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-800 placeholder-gray-400 disabled:bg-gray-100"
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-96 overflow-hidden"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          {/* Vue recherche */}
          {viewState.type === "search" && (
            <div className="overflow-y-auto max-h-80">
              {query.length === 0 && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  APCI les plus fréquentes
                </div>
              )}

              {filteredResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  Aucune APCI trouvée
                </div>
              ) : (
                filteredResults.map((apci, index) => (
                  <button
                    key={apci.code}
                    type="button"
                    onClick={() => handleSelectApci(apci)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                      index === highlightedIndex
                        ? "bg-purple-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Code APCI */}
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        backgroundColor: MEDICAL_CATEGORY_COLORS[apci.category],
                      }}
                    >
                      {apci.code}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {apci.shortLabel}
                        </span>
                        {apci.requiresSubtype && (
                          <span className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                            Sous-types
                          </span>
                        )}
                        {apci.isSeverePattern && (
                          <span className="text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                            Sévère
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {MEDICAL_CATEGORY_LABELS[apci.category]}
                      </div>
                      {apci.clinicalHint && (
                        <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {apci.clinicalHint}
                        </div>
                      )}
                    </div>

                    {/* Flèche si sous-types */}
                    {apci.requiresSubtype && (
                      <svg
                        className="h-5 w-5 text-gray-400 flex-shrink-0 self-center"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Vue sous-types */}
          {viewState.type === "subtypes" && (
            <div>
              {/* Header avec bouton retour */}
              <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div>
                  <div className="font-medium text-purple-800">
                    {viewState.apci.shortLabel}
                  </div>
                  <div className="text-xs text-purple-600">
                    Sélectionnez le sous-type
                  </div>
                </div>
              </div>

              {/* Liste des sous-types */}
              <div className="overflow-y-auto max-h-64">
                {viewState.apci.subtypes?.map((subtype, index) => (
                  <button
                    key={subtype.code}
                    type="button"
                    onClick={() =>
                      handleSelectSubtype(viewState.apci, subtype)
                    }
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                      index === highlightedIndex
                        ? "bg-purple-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {subtype.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        Code : {subtype.code}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vue confirmation terrain sévère */}
          {viewState.type === "confirm-severe" && (
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Terrain clinique sévère
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>{viewState.apci.shortLabel}</strong> est une
                    affection généralement associée à un terrain clinique
                    complexe.
                  </p>
                  {viewState.apci.clinicalHint && (
                    <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
                      {viewState.apci.clinicalHint}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSevere}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags des APCI sélectionnées */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((entry) => {
            const apci = getApciByCode(entry.apciCode);
            if (!apci) return null;

            const color = MEDICAL_CATEGORY_COLORS[apci.category];
            const statusColor = CLINICAL_STATUS_COLORS[entry.status];

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md"
                style={{
                  backgroundColor: `${color}08`,
                  borderColor: `${color}30`,
                }}
              >
                {/* Code */}
                <span
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {apci.code}
                </span>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800">
                    {formatApciEntryLabel(entry)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {MEDICAL_CATEGORY_LABELS[apci.category]}
                    {apci.isSeverePattern && (
                      <span className="ml-2 text-red-500">• Terrain sévère</span>
                    )}
                  </div>
                </div>

                {/* Sélecteur de statut */}
                <select
                  value={entry.status}
                  onChange={(e) =>
                    handleStatusChange(entry.id, e.target.value as ClinicalStatus)
                  }
                  className="text-xs px-2 py-1 rounded-lg border font-medium transition-colors"
                  style={{
                    backgroundColor: `${statusColor}15`,
                    borderColor: `${statusColor}40`,
                    color: statusColor,
                  }}
                  disabled={disabled}
                >
                  {Object.entries(CLINICAL_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={() => handleRemove(entry.id)}
                  disabled={disabled}
                  className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
            );
          })}
        </div>
      )}

      {/* Message si aucune sélection */}
      {value.length === 0 && (
        <div className="mt-3 text-sm text-gray-400 italic">
          Aucune affection APCI sélectionnée
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
