/**
 * ============================================================================
 * INTEGRIA - PDF EXPORT ÉDITABLE
 * ============================================================================
 * Composant pour exporter l'ordonnance en PDF avec possibilité de modifier
 * les posologies avant impression.
 *
 * PLACEMENT: /components/prescription/PrescriptionPdfExport.tsx
 * ============================================================================
 */

'use client';

import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  FileText,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PrescriptionOutput, PlantOutput, OligoOutput } from '@/lib/utils/tunisianAdapter';

interface PrescriptionPdfExportProps {
  data: PrescriptionOutput;
  patientName?: string;
  consultationDate?: string;
  onClose?: () => void;
}

interface EditablePlant extends PlantOutput {
  isDeleted?: boolean;
  modifiedDosage?: string;
}

interface EditableOligo extends OligoOutput {
  isDeleted?: boolean;
  modifiedDosage?: string;
}

export const PrescriptionPdfExport: React.FC<PrescriptionPdfExportProps> = ({
  data,
  patientName,
  consultationDate,
  onClose,
}) => {
  // État pour les modifications
  const [editedPlants, setEditedPlants] = useState<Map<string, EditablePlant>>(new Map());
  const [editedOligos, setEditedOligos] = useState<Map<string, EditableOligo>>(new Map());
  const printRef = useRef<HTMLDivElement>(null);

  // Fusionner toutes les plantes pour l'ordonnance simple
  const allPlants = [
    ...(data.prescription.drainage || []),
    ...(data.prescription.neuro_endocrine || []),
    ...(data.prescription.ans || []),
    ...(data.prescription.symptomatic || []),
  ];

  const allOligos = data.prescription.oligos || [];

  // Obtenir une plante avec ses modifications
  const getPlant = (plant: PlantOutput): EditablePlant => {
    const edited = editedPlants.get(plant.plant_id);
    return edited || plant;
  };

  const getOligo = (oligo: OligoOutput): EditableOligo => {
    const edited = editedOligos.get(oligo.oligo_id);
    return edited || oligo;
  };

  // Modifier la posologie d'une plante
  const adjustDosage = (plant: PlantOutput, delta: number) => {
    const current = getPlant(plant);
    const currentDosage = current.modifiedDosage || current.adapted_dosage || current.dosage;

    // Extraire le nombre de la posologie (ex: "5 ml" -> 5)
    const match = currentDosage.match(/(\d+(?:[.,]\d+)?)/);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      const newNum = Math.max(0.5, num + delta);
      const newDosage = currentDosage.replace(match[1], newNum.toString().replace('.', ','));

      setEditedPlants(new Map(editedPlants.set(plant.plant_id, {
        ...current,
        modifiedDosage: newDosage,
      })));
    }
  };

  // Supprimer une plante
  const toggleDelete = (plant: PlantOutput) => {
    const current = getPlant(plant);
    setEditedPlants(new Map(editedPlants.set(plant.plant_id, {
      ...current,
      isDeleted: !current.isDeleted,
    })));
  };

  // Modifier la posologie d'un oligo
  const adjustOligoDosage = (oligo: OligoOutput, delta: number) => {
    const current = getOligo(oligo);
    const currentDosage = current.modifiedDosage || current.dosage;

    const match = currentDosage.match(/(\d+(?:[.,]\d+)?)/);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      const newNum = Math.max(50, num + delta * 50);
      const newDosage = currentDosage.replace(match[1], newNum.toString());

      setEditedOligos(new Map(editedOligos.set(oligo.oligo_id, {
        ...current,
        modifiedDosage: newDosage,
      })));
    }
  };

  // Supprimer un oligo
  const toggleOligoDelete = (oligo: OligoOutput) => {
    const current = getOligo(oligo);
    setEditedOligos(new Map(editedOligos.set(oligo.oligo_id, {
      ...current,
      isDeleted: !current.isDeleted,
    })));
  };

  // Réinitialiser les modifications
  const resetAll = () => {
    setEditedPlants(new Map());
    setEditedOligos(new Map());
  };

  // Imprimer
  const handlePrint = () => {
    window.print();
  };

  // Compter les modifications
  const modCount = [...editedPlants.values()].filter(p => p.isDeleted || p.modifiedDosage).length
    + [...editedOligos.values()].filter(o => o.isDeleted || o.modifiedDosage).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Export PDF - Ordonnance</h2>
            {modCount > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {modCount} modification(s)
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {modCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetAll}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Réinitialiser
              </Button>
            )}
            <Button variant="default" size="sm" onClick={handlePrint} className="bg-indigo-600">
              <Printer className="w-4 h-4 mr-1" />
              Imprimer
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Contenu éditable (visible à l'écran) */}
        <div className="flex-1 overflow-auto p-6">
          <div className="text-xs text-slate-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
            💡 <strong>Astuce :</strong> Utilisez les boutons +/- pour ajuster les posologies et 🗑️ pour retirer un traitement avant impression.
          </div>

          {/* Zone d'impression */}
          <div ref={printRef} className="print:p-8">

            {/* En-tête Ordonnance */}
            <div className="text-center mb-6 pb-4 border-b-2 border-slate-300 print:border-black">
              <h1 className="text-2xl font-bold text-slate-900 print:text-black">ORDONNANCE</h1>
              <div className="mt-2 text-sm text-slate-600 print:text-black">
                {patientName && <p><strong>Patient :</strong> {patientName}</p>}
                {consultationDate && <p><strong>Date :</strong> {consultationDate}</p>}
              </div>
            </div>

            {/* Liste des prescriptions */}
            <div className="space-y-3">
              {/* Plantes */}
              {allPlants.map((plant, idx) => {
                const edited = getPlant(plant);
                if (edited.isDeleted) {
                  return (
                    <div
                      key={plant.plant_id + idx}
                      className="p-3 bg-slate-100 rounded-lg opacity-50 print:hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="line-through text-slate-500">
                          {plant.name_fr || plant.name_latin}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDelete(plant)}
                          className="text-emerald-600"
                        >
                          Restaurer
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={plant.plant_id + idx}
                    className="p-3 bg-white border border-slate-200 rounded-lg print:border-black print:border-b print:rounded-none print:px-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Info plante */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 print:text-black">
                            {idx + 1}. {plant.name_fr || plant.name_latin}
                          </span>
                          <span className="text-sm text-slate-500 italic print:text-black">
                            ({plant.name_latin})
                          </span>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="font-medium text-indigo-700 print:text-black print:font-bold">
                            {edited.adapted_form || edited.form}
                          </span>
                          {' - '}
                          <span className={cn(
                            "font-medium",
                            edited.modifiedDosage ? "text-amber-600 print:text-black" : "text-slate-700 print:text-black"
                          )}>
                            {edited.modifiedDosage || edited.adapted_dosage || edited.dosage}
                          </span>
                          {plant.duree && (
                            <span className="text-slate-500 print:text-black"> - {plant.duree}</span>
                          )}
                        </div>
                      </div>

                      {/* Contrôles (masqués à l'impression) */}
                      <div className="flex items-center gap-1 print:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustDosage(plant, -1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustDosage(plant, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDelete(plant)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Oligoéléments */}
              {allOligos.length > 0 && (
                <>
                  <div className="mt-6 pt-4 border-t border-slate-200 print:border-black">
                    <h3 className="font-bold text-slate-700 mb-3 print:text-black">Micronutrition</h3>
                  </div>
                  {allOligos.map((oligo, idx) => {
                    const edited = getOligo(oligo);
                    if (edited.isDeleted) {
                      return (
                        <div
                          key={oligo.oligo_id + idx}
                          className="p-3 bg-slate-100 rounded-lg opacity-50 print:hidden"
                        >
                          <div className="flex items-center justify-between">
                            <span className="line-through text-slate-500">{oligo.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOligoDelete(oligo)}
                              className="text-emerald-600"
                            >
                              Restaurer
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={oligo.oligo_id + idx}
                        className="p-3 bg-amber-50 border border-amber-200 rounded-lg print:bg-white print:border-black print:border-b print:rounded-none print:px-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <span className="font-bold text-amber-900 print:text-black">
                              {allPlants.filter(p => !getPlant(p).isDeleted).length + idx + 1}. {oligo.name}
                            </span>
                            <div className="mt-1 text-sm">
                              <span className="font-medium text-amber-700 print:text-black print:font-bold">
                                {oligo.form}
                              </span>
                              {' - '}
                              <span className={cn(
                                "font-medium",
                                edited.modifiedDosage ? "text-amber-600 print:text-black" : "text-slate-700 print:text-black"
                              )}>
                                {edited.modifiedDosage || oligo.dosage}
                              </span>
                            </div>
                          </div>

                          {/* Contrôles */}
                          <div className="flex items-center gap-1 print:hidden">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustOligoDosage(oligo, -1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustOligoDosage(oligo, 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOligoDelete(oligo)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Signature */}
            <div className="mt-8 pt-6 border-t border-slate-200 print:border-black flex justify-between">
              <div className="text-sm text-slate-500 print:text-black">
                <p>À renouveler selon évolution clinique</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 print:text-black mb-12">Signature du médecin</p>
                <div className="w-48 border-b border-slate-300 print:border-black"></div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-slate-400 print:text-black">
              <p>Généré par IntegrIA - Système Expert en Endobiogénie</p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles pour l'impression */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrescriptionPdfExport;
