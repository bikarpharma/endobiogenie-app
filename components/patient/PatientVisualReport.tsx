"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BodyMap from "@/components/learning/BodyMap";
import { Printer, AlertCircle, Leaf, ArrowDown, CheckCircle } from "lucide-react";
import { BdfIndexes } from "@/lib/bdf/calculateIndexes";

// ========================================
// TYPES & INTERFACES
// ========================================

interface TherapeuticCard {
  id: string;
  problem: {
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    organ: string;
  };
  solution: {
    plant: string;
    plantLatin?: string;
    action: string;
    dosage?: string;
  };
}

interface PatientVisualReportProps {
  patientName: string;
  scores?: Record<string, number>;
  bdf?: BdfIndexes;
  therapeuticCards?: TherapeuticCard[];
}

// ========================================
// MOCK DATA POUR DEMO
// ========================================

const MOCK_SCORES = {
  corticotrope: 75,
  thyroide: 45,
  digestif: 68,
  cardiovasculaire: 55,
  genital: 50,
};

const MOCK_BDF: BdfIndexes = {
  adrenal: {
    status: "HYPER",
    value: 0.85,
    interpretation: "Hyperfonction surrénalienne",
  },
  thyroid: {
    status: "NORMAL",
    value: 0.5,
    interpretation: "Fonction thyroïdienne normale",
  },
  metabolic: {
    status: "RESISTANCE",
    value: 0.7,
    interpretation: "Résistance métabolique",
  },
  cardiac: {
    status: "NORMAL",
    value: 0.45,
    interpretation: "Fonction cardiaque normale",
  },
  gonadal: {
    status: "NORMAL",
    value: 0.5,
    interpretation: "Équilibre gonadique",
  },
};

const MOCK_THERAPEUTIC_CARDS: TherapeuticCard[] = [
  {
    id: "1",
    problem: {
      title: "Surmenage Surrénalien",
      description:
        "Votre corps n'arrive plus à gérer le stress efficacement. Cela se traduit par une fatigue matinale, des difficultés à démarrer la journée, et une sensibilité accrue au stress.",
      severity: "high",
      organ: "Surrénales",
    },
    solution: {
      plant: "Cassis",
      plantLatin: "Ribes nigrum (Bourgeon)",
      action:
        "Relance votre production d'énergie naturelle et soutient vos glandes surrénales pour mieux gérer le stress quotidien.",
      dosage: "50 gouttes matin et midi dans un verre d'eau",
    },
  },
  {
    id: "2",
    problem: {
      title: "Congestion Hépatique",
      description:
        "Votre foie travaille en surcharge. Cela peut causer des digestions difficiles, de la fatigue après les repas, et une accumulation de toxines.",
      severity: "medium",
      organ: "Foie",
    },
    solution: {
      plant: "Romarin",
      plantLatin: "Rosmarinus officinalis (Jeune Pousse)",
      action:
        "Draine et régénère votre foie pour améliorer votre digestion et votre niveau d'énergie.",
      dosage: "50 gouttes avant le déjeuner et le dîner",
    },
  },
  {
    id: "3",
    problem: {
      title: "Inflammation Digestive",
      description:
        "Votre système digestif est irrité. Vous pouvez ressentir des ballonnements, des inconforts abdominaux, et une sensibilité alimentaire accrue.",
      severity: "medium",
      organ: "Intestins",
    },
    solution: {
      plant: "Figuier",
      plantLatin: "Ficus carica (Bourgeon)",
      action:
        "Apaise les muqueuses digestives et régule le système nerveux entérique (le cerveau de votre ventre).",
      dosage: "50 gouttes matin et soir, 15 minutes avant les repas",
    },
  },
];

// ========================================
// SOUS-COMPOSANTS
// ========================================

const SeverityBadge = ({ severity }: { severity: "high" | "medium" | "low" }) => {
  const config = {
    high: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Prioritaire",
    },
    medium: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Important",
    },
    low: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <AlertCircle className="w-4 h-4" />,
      label: "À surveiller",
    },
  };

  const { color, icon, label } = config[severity];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
      {icon}
      {label}
    </div>
  );
};

const TherapeuticCardComponent = ({ card }: { card: TherapeuticCard }) => {
  return (
    <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              {card.problem.title}
            </CardTitle>
            <p className="text-sm text-gray-600 leading-relaxed">{card.problem.description}</p>
          </div>
          <SeverityBadge severity={card.problem.severity} />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Flèche de séparation */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-500 text-white rounded-full p-2">
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>

        {/* Solution */}
        <div className="bg-gradient-to-r from-green-50 to-white rounded-lg p-4 border border-green-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-green-500 text-white rounded-full p-2">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-green-800 mb-1">{card.solution.plant}</h4>
              {card.solution.plantLatin && (
                <p className="text-xs text-green-600 italic mb-2">{card.solution.plantLatin}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mb-3">{card.solution.action}</p>

          {card.solution.dosage && (
            <div className="bg-white rounded-md p-3 border border-green-300">
              <p className="text-xs font-semibold text-green-800 mb-1">💊 Posologie recommandée :</p>
              <p className="text-sm text-gray-700">{card.solution.dosage}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function PatientVisualReport({
  patientName = "Patient",
  scores = MOCK_SCORES,
  bdf = MOCK_BDF,
  therapeuticCards = MOCK_THERAPEUTIC_CARDS,
}: PatientVisualReportProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header avec bouton d'impression */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapport Thérapeutique Visuel</h1>
              <p className="text-gray-600">
                Patient : <span className="font-semibold text-gray-900">{patientName}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Ce rapport explique les déséquilibres identifiés et les solutions naturelles recommandées.
              </p>
            </div>
            <Button onClick={handlePrint} size="lg" className="gap-2 print:hidden">
              <Printer className="w-5 h-5" />
              Imprimer cette fiche
            </Button>
          </div>
        </div>
      </div>

      {/* Layout Grid : BodyMap + Cartes Thérapeutiques */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLONNE GAUCHE : BodyMap (1/3) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <CardTitle className="text-center text-lg">Cartographie de votre corps</CardTitle>
              <p className="text-xs text-slate-300 text-center mt-1">
                Les zones en rouge nécessitent une attention particulière
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <BodyMap scores={scores} bdf={bdf} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLONNE DROITE : Cartes Thérapeutiques (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête des cartes */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
            <CardContent className="py-4">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6" />
                Votre Plan de Traitement Personnalisé
              </h2>
              <p className="text-sm text-blue-100">
                Pour chaque problème identifié, nous avons sélectionné une plante médicinale adaptée à votre profil.
              </p>
            </CardContent>
          </Card>

          {/* Liste des cartes */}
          {therapeuticCards.map((card) => (
            <TherapeuticCardComponent key={card.id} card={card} />
          ))}

          {/* Footer informatif */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="py-4">
              <h3 className="text-sm font-semibold text-amber-900 mb-2">ℹ️ Important</h3>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• Ces recommandations sont basées sur votre bilan biologique fonctionnel</li>
                <li>• Prenez les bourgeons à distance des repas (15-30 minutes avant)</li>
                <li>• Cure recommandée : 3 mois minimum, réévaluation tous les 2 mois</li>
                <li>• En cas de doute ou d'effets indésirables, consultez votre praticien</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CSS pour l'impression */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
