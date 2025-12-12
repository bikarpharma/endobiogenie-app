"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  searchSymptomes,
  getSymptomeCategoryColor,
  getSymptomeCategoryLabel,
  SYMPTOME_CATEGORIES,
} from "@/lib/clinical/symptomes";
import type { SymptomeItem } from "@/lib/clinical/symptomes";

interface SmartSymptomeSearchProps {
  selectedSymptomes: string[];
  onAddSymptome: (symptome: string) => void;
  onRemoveSymptome: (index: number) => void;
  placeholder?: string;
  label?: string;
}

export default function SmartSymptomeSearch({
  selectedSymptomes,
  onAddSymptome,
  onRemoveSymptome,
  placeholder = "Rechercher un symptôme...",
  label = "Symptômes actuels",
}: SmartSymptomeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymptomeItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const searchResults = searchSymptomes(query, 8);
      const filtered = searchResults.filter(
        (s) => !selectedSymptomes.includes(s.label)
      );
      setResults(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, selectedSymptomes]);

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

  const handleSelect = useCallback(
    (symptome: SymptomeItem) => {
      onAddSymptome(symptome.label);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onAddSymptome]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleAddCustom = () => {
    if (query.trim() && !selectedSymptomes.includes(query.trim())) {
      onAddSymptome(query.trim());
      setQuery("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <label className="block font-semibold mb-2 text-gray-700">{label}</label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-blue-400"
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
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400"
          autoComplete="off"
        />

        {query.trim() && !results.find((r) => r.label.toLowerCase() === query.toLowerCase()) && (
          <button
            type="button"
            onClick={handleAddCustom}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-800"
            title="Ajouter ce symptôme"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          {results.map((symptome, index) => (
            <button
              key={symptome.id}
              type="button"
              onClick={() => handleSelect(symptome)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                index === highlightedIndex ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getSymptomeCategoryColor(symptome.category) }}
              />

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">
                  {symptome.label}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {getSymptomeCategoryLabel(symptome.category)}
                  {symptome.synonyms && symptome.synonyms.length > 0 && (
                    <span className="ml-2 text-gray-400">
                      ({symptome.synonyms.slice(0, 2).join(", ")})
                    </span>
                  )}
                </div>
              </div>

              {index === highlightedIndex && (
                <svg
                  className="h-5 w-5 text-blue-500 flex-shrink-0"
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
          ))}

          {query.trim() && !results.find((r) => r.label.toLowerCase() === query.toLowerCase()) && (
            <button
              type="button"
              onClick={handleAddCustom}
              className="w-full px-4 py-3 text-left flex items-center gap-3 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="h-5 w-5 text-blue-500"
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
              <span className="text-blue-700 font-medium">
                Ajouter "{query.trim()}" (personnalisé)
              </span>
            </button>
          )}
        </div>
      )}

      {selectedSymptomes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedSymptomes.map((symptome, idx) => {
            const found = searchSymptomes(symptome, 1)[0];
            const color = found ? getSymptomeCategoryColor(found.category) : "#3b82f6";

            return (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:shadow-md"
                style={{
                  backgroundColor: `${color}15`,
                  border: `1px solid ${color}40`,
                  color: color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {symptome}
                <button
                  type="button"
                  onClick={() => onRemoveSymptome(idx)}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}

      <details className="mt-4">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          Voir les catégories de symptômes
        </summary>
        <div className="mt-2 flex flex-wrap gap-2">
          {SYMPTOME_CATEGORIES.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: `${cat.color}15`,
                color: cat.color,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.label}
            </span>
          ))}
        </div>
      </details>

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
