"use client";

/**
 * SMART LAB IMPORT - Modal d'Import Multi-Images
 * ================================================
 * Interface de réconciliation pour l'import intelligent
 * de résultats de laboratoire.
 *
 * Features:
 * - Support multi-images (pour PDF multi-pages)
 * - Drag & Drop / Click pour upload
 * - Preview des fichiers
 * - Traitement séquentiel de chaque image
 * - Fusion automatique des valeurs de toutes les pages
 * - Indicateurs de confiance (vert/orange/rouge)
 * - Tooltips pédagogiques pour les conversions
 */

import { useState, useCallback, useRef } from "react";
import type { NormalizedLabValue } from "@/lib/bdf/labImport";

// ==========================================
// TYPES
// ==========================================

interface LabImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (values: Record<string, number>) => void;
}

interface FileWithPreview {
  id: string;
  file: File;
  preview: string | null;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
  valuesCount?: number;
}

interface ImportResult {
  success: boolean;
  normalized: NormalizedLabValue[];
  bdfInputs: Record<string, number>;
  summary: string;
  missingCritical: string[];
  unmatched: Array<{
    originalName: string;
    value: number;
    unit: string;
    reason: string;
  }>;
  metadata?: {
    laboratoryName?: string;
    patientName?: string;
    date?: string;
  };
  error?: string;
}

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

export default function LabImportModal({
  isOpen,
  onClose,
  onImport,
}: LabImportModalProps) {
  // États
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(Array.from(selectedFiles));
      }
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFiles(Array.from(droppedFiles));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const processFiles = async (newFiles: File[]) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const validFiles: FileWithPreview[] = [];

    for (const file of newFiles) {
      // Vérifier le type (seulement images, pas PDF)
      if (!allowedTypes.includes(file.type)) {
        setError(`Type de fichier non supporté: ${file.name}. Utilisez JPG ou PNG.`);
        continue;
      }

      // Vérifier la taille (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        setError(`Fichier trop volumineux: ${file.name} (max 20MB)`);
        continue;
      }

      // Créer l'aperçu
      const preview = await createPreview(file);

      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        status: "pending",
      });
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setError(null);
      setResult(null);
    }
  };

  const createPreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError(null);

    // Résultats agrégés
    let allNormalized: NormalizedLabValue[] = [];
    let allUnmatched: ImportResult["unmatched"] = [];
    let allBdfInputs: Record<string, number> = {};
    let lastMetadata: ImportResult["metadata"] = undefined;

    try {
      // Traiter chaque fichier séquentiellement
      for (const fileWithPreview of files) {
        setCurrentProcessing(fileWithPreview.id);

        // Mettre à jour le statut
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithPreview.id ? { ...f, status: "processing" as const } : f
          )
        );

        try {
          // Convertir en base64
          const base64 = await fileToBase64(fileWithPreview.file);

          // Appeler l'API
          const response = await fetch("/api/bdf/import-lab", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64,
              mimeType: fileWithPreview.file.type,
            }),
          });

          const data: ImportResult = await response.json();

          if (data.success) {
            // Fusionner les résultats (éviter les doublons par code)
            for (const normalized of data.normalized) {
              const existingIndex = allNormalized.findIndex(
                (n) => n.code === normalized.code
              );
              if (existingIndex === -1) {
                allNormalized.push(normalized);
              } else {
                // Garder la valeur avec la meilleure confiance
                const existing = allNormalized[existingIndex];
                const confidenceOrder = { high: 3, medium: 2, low: 1, unknown: 0 };
                if (
                  confidenceOrder[normalized.confidence] >
                  confidenceOrder[existing.confidence]
                ) {
                  allNormalized[existingIndex] = normalized;
                }
              }
            }

            // Fusionner unmatched
            if (data.unmatched) {
              for (const u of data.unmatched) {
                if (!allUnmatched.some((au) => au.originalName === u.originalName)) {
                  allUnmatched.push(u);
                }
              }
            }

            // Fusionner bdfInputs
            allBdfInputs = { ...allBdfInputs, ...data.bdfInputs };

            // Garder les métadonnées
            if (data.metadata) {
              lastMetadata = data.metadata;
            }

            // Marquer comme terminé
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileWithPreview.id
                  ? {
                      ...f,
                      status: "done" as const,
                      valuesCount: data.normalized.length,
                    }
                  : f
              )
            );
          } else {
            // Erreur pour ce fichier
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileWithPreview.id
                  ? { ...f, status: "error" as const, error: data.error }
                  : f
              )
            );
          }
        } catch (err) {
          // Erreur réseau ou autre
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithPreview.id
                ? {
                    ...f,
                    status: "error" as const,
                    error: err instanceof Error ? err.message : "Erreur",
                  }
                : f
            )
          );
        }
      }

      // Créer le résultat final agrégé
      if (allNormalized.length > 0) {
        const finalResult: ImportResult = {
          success: true,
          normalized: allNormalized,
          bdfInputs: allBdfInputs,
          summary: `${allNormalized.length} valeurs extraites de ${files.length} image(s)`,
          missingCritical: [],
          unmatched: allUnmatched,
          metadata: lastMetadata,
        };

        setResult(finalResult);

        // Sélectionner toutes les valeurs à haute/moyenne confiance par défaut
        const highConfidence = new Set(
          allNormalized
            .filter((v) => v.confidence === "high" || v.confidence === "medium")
            .map((v) => v.code)
        );
        setSelectedValues(highConfidence);
      } else {
        setError("Aucune valeur n'a pu être extraite des images.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'analyse"
      );
    } finally {
      setLoading(false);
      setCurrentProcessing(null);
    }
  };

  const handleImport = () => {
    if (!result) return;

    // Filtrer les valeurs sélectionnées
    const valuesToImport: Record<string, number> = {};
    for (const normalized of result.normalized) {
      if (selectedValues.has(normalized.code)) {
        valuesToImport[normalized.code] = normalized.value;
      }
    }

    onImport(valuesToImport);
    handleClose();
  };

  const handleClose = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setSelectedValues(new Set());
    setCurrentProcessing(null);
    onClose();
  };

  const toggleValue = (code: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(code)) {
      newSelected.delete(code);
    } else {
      newSelected.add(code);
    }
    setSelectedValues(newSelected);
  };

  const selectAll = () => {
    if (result) {
      setSelectedValues(new Set(result.normalized.map((v) => v.code)));
    }
  };

  const deselectAll = () => {
    setSelectedValues(new Set());
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (!isOpen) return null;

  const pendingFiles = files.filter((f) => f.status === "pending").length;
  const processingFile = files.find((f) => f.status === "processing");
  const doneFiles = files.filter((f) => f.status === "done").length;
  const errorFiles = files.filter((f) => f.status === "error").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
          <div>
            <h2 className="text-xl font-bold text-white">
              Import Intelligent de Résultats
            </h2>
            <p className="text-blue-100 text-sm">
              Importez les photos de votre bilan de laboratoire
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white p-2"
          >
            <svg
              className="w-6 h-6"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Zone de Drop - toujours visible si pas de résultat */}
          {!result && (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  files.length > 0
                    ? "border-green-400 bg-green-50"
                    : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="text-5xl mb-4">📸</div>
                <p className="text-lg font-medium text-slate-700">
                  {files.length > 0
                    ? "Cliquez pour ajouter d'autres photos"
                    : "Glissez vos photos ici ou cliquez pour sélectionner"}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Formats acceptés: JPG, PNG (max 20MB par image)
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Pour un PDF multi-pages, prenez une capture d'écran de chaque page
                </p>
              </div>

              {/* Liste des fichiers sélectionnés */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-slate-700 mb-3">
                    Photos sélectionnées ({files.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {files.map((fileWithPreview) => (
                      <div
                        key={fileWithPreview.id}
                        className={`relative rounded-lg overflow-hidden border-2 ${
                          fileWithPreview.status === "done"
                            ? "border-green-400"
                            : fileWithPreview.status === "error"
                              ? "border-red-400"
                              : fileWithPreview.status === "processing"
                                ? "border-blue-400 animate-pulse"
                                : "border-slate-200"
                        }`}
                      >
                        {/* Preview image */}
                        {fileWithPreview.preview ? (
                          <img
                            src={fileWithPreview.preview}
                            alt={fileWithPreview.file.name}
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          <div className="w-full h-24 bg-slate-100 flex items-center justify-center">
                            <span className="text-3xl">📄</span>
                          </div>
                        )}

                        {/* Status overlay */}
                        {fileWithPreview.status === "processing" && (
                          <div className="absolute inset-0 bg-blue-500/50 flex items-center justify-center">
                            <svg
                              className="animate-spin w-8 h-8 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </div>
                        )}

                        {fileWithPreview.status === "done" && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}

                        {fileWithPreview.status === "error" && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                            <svg
                              className="w-4 h-4"
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
                          </div>
                        )}

                        {/* Remove button (only when pending) */}
                        {fileWithPreview.status === "pending" && !loading && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(fileWithPreview.id);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg
                              className="w-4 h-4"
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
                        )}

                        {/* File info */}
                        <div className="p-2 bg-white">
                          <p className="text-xs text-slate-600 truncate">
                            {fileWithPreview.file.name}
                          </p>
                          {fileWithPreview.valuesCount !== undefined && (
                            <p className="text-xs text-green-600 font-medium">
                              {fileWithPreview.valuesCount} valeur(s)
                            </p>
                          )}
                          {fileWithPreview.error && (
                            <p className="text-xs text-red-600 truncate">
                              {fileWithPreview.error}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progression */}
                  {loading && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <svg
                          className="animate-spin w-5 h-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium text-blue-800">
                            Analyse en cours...
                          </p>
                          <p className="text-sm text-blue-600">
                            {doneFiles}/{files.length} images traitées
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Erreur */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Résultats */}
          {result && (
            <div className="space-y-6">
              {/* Résumé */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-700">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-semibold">{result.summary}</span>
                </div>
              </div>

              {/* Métadonnées */}
              {result.metadata && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-slate-700 mb-2">
                    Document détecté
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {result.metadata.laboratoryName && (
                      <div>
                        <span className="text-slate-500">Laboratoire:</span>
                        <span className="ml-2 font-medium">
                          {result.metadata.laboratoryName}
                        </span>
                      </div>
                    )}
                    {result.metadata.patientName && (
                      <div>
                        <span className="text-slate-500">Patient:</span>
                        <span className="ml-2 font-medium">
                          {result.metadata.patientName}
                        </span>
                      </div>
                    )}
                    {result.metadata.date && (
                      <div>
                        <span className="text-slate-500">Date:</span>
                        <span className="ml-2 font-medium">
                          {result.metadata.date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions de sélection */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">
                  Valeurs détectées ({result.normalized.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Tout sélectionner
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={deselectAll}
                    className="text-sm text-slate-500 hover:underline"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>

              {/* Liste des valeurs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.normalized.map((value) => (
                  <ValueCard
                    key={value.code}
                    value={value}
                    isSelected={selectedValues.has(value.code)}
                    onToggle={() => toggleValue(value.code)}
                  />
                ))}
              </div>

              {/* Valeurs non reconnues */}
              {result.unmatched && result.unmatched.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="font-medium text-amber-800 mb-2">
                    Valeurs non reconnues ({result.unmatched.length})
                  </h4>
                  <div className="text-sm text-amber-700 space-y-1">
                    {result.unmatched.map((u, i) => (
                      <div key={i}>
                        • {u.originalName}: {u.value} {u.unit}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    Ces valeurs ne correspondent pas aux biomarqueurs utilisés
                    pour le calcul des index BdF.
                  </p>
                </div>
              )}

              {/* Valeurs critiques manquantes */}
              {result.missingCritical && result.missingCritical.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Biomarqueurs clés non détectés
                  </h4>
                  <p className="text-sm text-blue-700">
                    {result.missingCritical.join(", ")}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Ces valeurs peuvent être saisies manuellement après
                    l'import.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-sm text-slate-500">
            {result ? (
              <>
                {selectedValues.size} valeur(s) sélectionnée(s) sur{" "}
                {result.normalized.length}
              </>
            ) : files.length > 0 ? (
              <>
                {files.length} photo(s) prête(s) à analyser
              </>
            ) : null}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              Annuler
            </button>

            {!result && files.length > 0 && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Analyser {files.length} photo(s)
                  </>
                )}
              </button>
            )}

            {result && (
              <button
                onClick={handleImport}
                disabled={selectedValues.size === 0}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Importer {selectedValues.size} valeur(s)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPOSANT CARTE VALEUR
// ==========================================

interface ValueCardProps {
  value: NormalizedLabValue;
  isSelected: boolean;
  onToggle: () => void;
}

function ValueCard({ value, isSelected, onToggle }: ValueCardProps) {
  const confidenceColors = {
    high: "border-green-400 bg-green-50",
    medium: "border-amber-400 bg-amber-50",
    low: "border-red-400 bg-red-50",
    unknown: "border-slate-300 bg-slate-50",
  };

  const confidenceLabels = {
    high: "Confiance élevée",
    medium: "À vérifier",
    low: "Incertain",
    unknown: "Non reconnu",
  };

  const confidenceIcons = {
    high: "✓",
    medium: "⚠",
    low: "?",
    unknown: "×",
  };

  return (
    <div
      onClick={onToggle}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        confidenceColors[value.confidence]
      } ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "opacity-80 hover:opacity-100"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Nom et code */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold text-slate-800">{value.label}</span>
            <span className="text-xs text-slate-500 font-mono">
              ({value.code})
            </span>
          </div>

          {/* Valeur */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {value.value}
            </span>
            <span className="text-sm text-slate-600">{value.unit}</span>
          </div>

          {/* Conversion info */}
          {value.wasConverted && (
            <div className="mt-2 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-lg inline-flex items-center gap-1">
              <svg
                className="w-3 h-3"
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
              <span>
                Converti: {value.originalValue} {value.originalUnit} →{" "}
                {value.value} {value.unit}
              </span>
            </div>
          )}

          {/* Nom original si différent */}
          {value.originalName.toLowerCase() !== value.label.toLowerCase() && (
            <div className="mt-1 text-xs text-slate-500">
              PDF: "{value.originalName}"
            </div>
          )}
        </div>

        {/* Badge confiance */}
        <div
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            value.confidence === "high"
              ? "bg-green-200 text-green-800"
              : value.confidence === "medium"
                ? "bg-amber-200 text-amber-800"
                : "bg-red-200 text-red-800"
          }`}
        >
          {confidenceIcons[value.confidence]} {confidenceLabels[value.confidence]}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// UTILITAIRES
// ==========================================

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Retirer le préfixe data:...;base64,
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
