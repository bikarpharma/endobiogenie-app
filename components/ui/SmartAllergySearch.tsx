"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ALLERGY_DEFINITIONS,
  ALLERGY_CATEGORY_LABELS,
  ALLERGY_CATEGORY_COLORS,
  ALLERGY_SEVERITY_LABELS,
  ALLERGY_SEVERITY_COLORS,
  searchAllergies,
  getAllergyById,
  createAllergyEntry,
  createFreeTextAllergyEntry,
} from "@/lib/clinical/allergies";
import type {
  AllergyDefinition,
  PatientAllergyEntry,
  AllergySeverity,
} from "@/lib/clinical/allergies";

interface SmartAllergySearchProps {
  value: PatientAllergyEntry[];
  onChange: (next: PatientAllergyEntry[]) => void;
  disabled?: boolean;
  showClinicalDetails?: boolean; // Afficher réaction/sévérité inline
}

export default function SmartAllergySearch({
  value,
  onChange,
  disabled = false,
  showClinicalDetails = false,
}: SmartAllergySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Résultats de recherche
  const searchResults = useMemo(() => {
    return searchAllergies(query, 10);
  }, [query]);

  // Filtrer les allergies déjà sélectionnées
  const filteredResults = useMemo(() => {
    const selectedIds = new Set(
      value.map((v) => v.allergyId).filter((id): id is string => Boolean(id))
    );
    const selectedLabels = new Set(value.map((v) => v.label.toLowerCase()));
    return searchResults.filter(
      (a) => !selectedIds.has(a.id) && !selectedLabels.has(a.label.toLowerCase())
    );
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
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sélection d'un allergène du référentiel
  const handleSelect = useCallback(
    (allergy: AllergyDefinition) => {
      const entry = createAllergyEntry(allergy.id, allergy.label);
      onChange([...value, entry]);
      setQuery("");
      setIsOpen(false);
      setHighlightedIndex(0);
    },
    [value, onChange]
  );

  // Ajout en texte libre
  const handleAddFreeText = useCallback(() => {
    const text = query.trim();
    if (!text) return;

    // Vérifier si pas déjà sélectionné
    if (value.some((v) => v.label.toLowerCase() === text.toLowerCase())) {
      return;
    }

    const entry = createFreeTextAllergyEntry(text);
    onChange([...value, entry]);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(0);
  }, [query, value, onChange]);

  // Suppression
  const handleRemove = useCallback(
    (id: string) => {
      onChange(value.filter((v) => v.id !== id));
    },
    [value, onChange]
  );

  // Mise à jour d'une entrée (réaction, sévérité)
  const handleUpdate = useCallback(
    (id: string, patch: Partial<PatientAllergyEntry>) => {
      onChange(value.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    },
    [value, onChange]
  );

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredResults[highlightedIndex]) {
          handleSelect(filteredResults[highlightedIndex]);
        } else if (query.trim()) {
          handleAddFreeText();
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Vérifier si la query match exactement une option
  const isExactMatch = filteredResults.some(
    (r) => r.label.toLowerCase() === query.toLowerCase()
  );

  return (
    <div className="relative">
      <label className="block font-semibold mb-2 text-gray-700">
        Allergies
      </label>

      {/* Tags des allergies sélectionnées */}
      {value.length > 0 && (
        <div className="mb-3 space-y-2">
          {value.map((entry) => {
            const def = entry.allergyId ? getAllergyById(entry.allergyId) : undefined;
            const category = def?.category ?? "OTHER";
            const categoryColor = ALLERGY_CATEGORY_COLORS[category];
            const severityColor = entry.severity
              ? ALLERGY_SEVERITY_COLORS[entry.severity]
              : undefined;

            return (
              <div
                key={entry.id}
                className="flex flex-col p-3 rounded-xl border transition-all hover:shadow-md"
                style={{
                  backgroundColor: `${categoryColor}08`,
                  borderColor: `${categoryColor}30`,
                }}
              >
                <div className="flex items-center gap-2">
                  {/* Badge catégorie */}
                  <span
                    className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {ALLERGY_CATEGORY_LABELS[category]}
                  </span>

                  {/* Label */}
                  <span className="font-medium text-gray-800 flex-1">
                    {entry.label}
                  </span>

                  {/* Badge texte libre */}
                  {entry.isFreeText && (
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-200 text-[9px] text-gray-600">
                      libre
                    </span>
                  )}

                  {/* Badge sévérité */}
                  {entry.severity && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        backgroundColor: `${severityColor}20`,
                        color: severityColor,
                      }}
                    >
                      {ALLERGY_SEVERITY_LABELS[entry.severity]}
                    </span>
                  )}

                  {/* Bouton supprimer */}
                  <button
                    type="button"
                    onClick={() => handleRemove(entry.id)}
                    disabled={disabled}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors text-gray-400 hover:text-red-500"
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

                {/* Détails cliniques (réaction + sévérité) */}
                {showClinicalDetails && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Réaction (ex: urticaire, anaphylaxie...)"
                      className="flex-1 min-w-[200px] rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-200"
                      value={entry.reaction ?? ""}
                      onChange={(e) =>
                        handleUpdate(entry.id, {
                          reaction: e.target.value || undefined,
                        })
                      }
                      disabled={disabled}
                    />
                    <select
                      className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-200"
                      value={entry.severity ?? ""}
                      onChange={(e) =>
                        handleUpdate(entry.id, {
                          severity: e.target.value
                            ? (e.target.value as AllergySeverity)
                            : undefined,
                        })
                      }
                      disabled={disabled}
                    >
                      <option value="">Sévérité</option>
                      <option value="MILD">Légère</option>
                      <option value="MODERATE">Modérée</option>
                      <option value="SEVERE">Sévère</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Input de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-red-400"
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
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez pour rechercher (ex: pénicilline, arachides...)"
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-gray-800 placeholder-gray-400 disabled:bg-gray-100"
          autoComplete="off"
        />

        {/* Bouton ajouter si texte libre */}
        {query.trim() && !isExactMatch && (
          <button
            type="button"
            onClick={handleAddFreeText}
            disabled={disabled}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-500 hover:text-red-700"
            title="Ajouter cette allergie"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          {query.length < 1 && (
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
              Allergènes courants
            </div>
          )}

          {filteredResults.length === 0 && !query.trim() && (
            <div className="px-4 py-8 text-center text-gray-500">
              Commencez à taper pour rechercher
            </div>
          )}

          {filteredResults.map((result, index) => {
            const categoryColor = ALLERGY_CATEGORY_COLORS[result.category];

            return (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  index === highlightedIndex ? "bg-red-50" : "hover:bg-gray-50"
                }`}
              >
                {/* Indicateur catégorie */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: categoryColor }}
                />

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800">{result.label}</div>
                  {result.synonyms.length > 0 && (
                    <div className="text-xs text-gray-400 truncate">
                      {result.synonyms.slice(0, 3).join(" · ")}
                    </div>
                  )}
                </div>

                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                  style={{
                    backgroundColor: `${categoryColor}15`,
                    color: categoryColor,
                  }}
                >
                  {ALLERGY_CATEGORY_LABELS[result.category]}
                </span>
              </button>
            );
          })}

          {/* Option texte libre */}
          {query.trim() && !isExactMatch && (
            <button
              type="button"
              onClick={handleAddFreeText}
              className="w-full px-4 py-3 text-left flex items-center gap-3 border-t border-gray-100 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-red-700 font-medium text-sm">
                Ajouter « {query.trim()} » comme allergie personnalisée
              </span>
            </button>
          )}
        </div>
      )}

      {/* Message si aucune allergie */}
      {value.length === 0 && (
        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Laisser vide si aucune allergie connue
        </p>
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
