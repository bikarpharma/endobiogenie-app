"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  searchPathologies,
  getCategoryColor,
  PATHOLOGIE_CATEGORIES,
} from "@/lib/clinical/pathologies";
import type { PathologieItem } from "@/lib/clinical/pathologies";
import {
  CLINICAL_STATUS_LABELS,
  CLINICAL_STATUS_COLORS,
  createChronicDiseaseEntry,
} from "@/lib/clinical/apci";
import type {
  PatientChronicDiseaseEntry,
  ClinicalStatus,
} from "@/lib/clinical/apci";

// Liste des pathologies chroniques courantes (hors APCI)
// pour suggestion en premier
const COMMON_CHRONIC_DISEASES = [
  "Migraine chronique",
  "Fibromyalgie",
  "Syndrome de fatigue chronique",
  "Arthrose généralisée",
  "Lombalgie chronique",
  "Syndrome du côlon irritable",
  "Reflux gastro-oesophagien chronique",
  "Rhinite allergique chronique",
  "Asthme non sévère",
  "Hypertrophie bénigne de prostate",
  "Hypothyroïdie subclinique",
  "Syndrome des ovaires polykystiques",
  "Endométriose",
  "Syndrome anxio-dépressif",
  "Insomnie chronique",
  "Syndrome métabolique",
  "Obésité",
  "Ostéoporose",
  "Syndrome sec (Sjögren like)",
  "Neuropathie périphérique",
];

interface ChronicDiseaseTagSelectorProps {
  value: PatientChronicDiseaseEntry[];
  onChange: (next: PatientChronicDiseaseEntry[]) => void;
  disabled?: boolean;
}

export default function ChronicDiseaseTagSelector({
  value,
  onChange,
  disabled = false,
}: ChronicDiseaseTagSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Résultats de recherche combinés
  const searchResults = useMemo(() => {
    // Si pas de query, montrer les maladies chroniques courantes
    if (query.length < 2) {
      return COMMON_CHRONIC_DISEASES.slice(0, 8).map((label) => ({
        id: label.toLowerCase().replace(/\s+/g, "_"),
        label,
        category: "chronic",
        isCommon: true,
      }));
    }

    // Recherche dans les pathologies + maladies chroniques courantes
    const pathResults = searchPathologies(query, 6);
    const commonResults = COMMON_CHRONIC_DISEASES.filter((d) =>
      d.toLowerCase().includes(query.toLowerCase())
    )
      .slice(0, 4)
      .map((label) => ({
        id: label.toLowerCase().replace(/\s+/g, "_"),
        label,
        category: "chronic",
        isCommon: true,
      }));

    // Combiner et dédupliquer
    const combined = [...commonResults];
    for (const p of pathResults) {
      if (!combined.find((c) => c.label.toLowerCase() === p.label.toLowerCase())) {
        combined.push({ ...p, isCommon: false });
      }
    }

    return combined.slice(0, 10);
  }, [query]);

  // Filtrer les maladies déjà sélectionnées
  const filteredResults = useMemo(() => {
    const selectedLabels = new Set(value.map((v) => v.label.toLowerCase()));
    return searchResults.filter(
      (r) => !selectedLabels.has(r.label.toLowerCase())
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

  // Sélection d'une maladie
  const handleSelect = useCallback(
    (result: { id: string; label: string }) => {
      const entry = createChronicDiseaseEntry(result.label, result.id);
      onChange([...value, entry]);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  // Ajout en texte libre
  const handleAddFreeText = useCallback(() => {
    if (!query.trim()) return;

    // Vérifier si pas déjà sélectionné
    if (
      value.some((v) => v.label.toLowerCase() === query.trim().toLowerCase())
    ) {
      return;
    }

    const entry = createChronicDiseaseEntry(query.trim());
    onChange([...value, entry]);
    setQuery("");
    setIsOpen(false);
  }, [query, value, onChange]);

  // Suppression
  const handleRemove = useCallback(
    (id: string) => {
      onChange(value.filter((v) => v.id !== id));
    },
    [value, onChange]
  );

  // Changement de statut
  const handleStatusChange = useCallback(
    (id: string, status: ClinicalStatus) => {
      onChange(value.map((v) => (v.id === id ? { ...v, status } : v)));
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

  // Vérifier si la query est exactement une des options
  const isExactMatch = filteredResults.some(
    (r) => r.label.toLowerCase() === query.toLowerCase()
  );

  return (
    <div className="relative">
      <label className="block font-semibold mb-2 text-gray-700">
        Autres maladies chroniques (hors APCI)
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Maladies chroniques ne figurant pas dans la liste APCI
      </p>

      {/* Input de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-teal-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
          placeholder="Rechercher ou saisir une maladie chronique..."
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-gray-800 placeholder-gray-400 disabled:bg-gray-100"
          autoComplete="off"
        />

        {/* Bouton ajouter si texte libre */}
        {query.trim() && !isExactMatch && (
          <button
            type="button"
            onClick={handleAddFreeText}
            disabled={disabled}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-teal-600 hover:text-teal-800"
            title="Ajouter cette maladie"
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
          {query.length < 2 && (
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
              Maladies chroniques courantes
            </div>
          )}

          {filteredResults.map((result, index) => {
            const color =
              "category" in result && result.category !== "chronic"
                ? getCategoryColor(result.category)
                : "#14b8a6";

            return (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  index === highlightedIndex ? "bg-teal-50" : "hover:bg-gray-50"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800">{result.label}</div>
                  {"isCommon" in result && result.isCommon && (
                    <div className="text-xs text-teal-600">Fréquent</div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Option texte libre */}
          {query.trim() && !isExactMatch && (
            <button
              type="button"
              onClick={handleAddFreeText}
              className="w-full px-4 py-3 text-left flex items-center gap-3 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="h-5 w-5 text-teal-500"
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
              <span className="text-teal-700 font-medium">
                Ajouter "{query.trim()}" (saisie libre)
              </span>
            </button>
          )}

          {filteredResults.length === 0 && !query.trim() && (
            <div className="px-4 py-8 text-center text-gray-500">
              Commencez à taper pour rechercher
            </div>
          )}
        </div>
      )}

      {/* Tags des maladies sélectionnées */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((entry) => {
            const statusColor = CLINICAL_STATUS_COLORS[entry.status];

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-teal-50/50 border-teal-200/50 transition-all hover:shadow-md"
              >
                {/* Indicateur texte libre */}
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                    entry.isFreeText ? "bg-gray-400" : "bg-teal-500"
                  }`}
                >
                  {entry.isFreeText ? "?" : "MC"}
                </span>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800">{entry.label}</div>
                  <div className="text-xs text-gray-500">
                    {entry.isFreeText
                      ? "Saisie libre"
                      : "Maladie chronique référencée"}
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
          Aucune maladie chronique ajoutée
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
