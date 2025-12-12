"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Activity, ScanLine, Info, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BodyMap from "@/components/learning/BodyMap";
import type { UnifiedAnalysisOutput } from "@/types/clinical-engine";

// ============================================
// TYPES
// ============================================

interface PatientVisualReportProps {
  patientId: string;
  patientName: string;
  onNavigateToSynthese?: () => void; // Callback pour naviguer vers l'onglet Synthèse
}

interface TerrainProblem {
  id: string;           // ID organe pour le lien interactif (foie, surrenales, etc.)
  organLabel: string;   // Label affiché (Foie, Surrénales, etc.)
  title: string;        // Titre du problème
  severity: "CRITIQUE" | "MODERE" | "LEGER";
  description: string;  // Description vulgarisée du problème
  color: "red" | "orange" | "yellow" | "blue";
}

// ============================================
// EXTRACTION DES SCORES DEPUIS SYNTHÈSE IA
// Pour passer à BodyMap
// ============================================

function extractScoresFromSynthesis(synthesis: UnifiedAnalysisOutput): Record<string, number> {
  const scores: Record<string, number> = {};

  // Scores depuis les axes endocriniens
  if (synthesis.endocrineAxes) {
    for (const axe of synthesis.endocrineAxes) {
      const score = axe.score || 50;

      if (axe.axis?.toLowerCase().includes("cortico")) {
        scores.corticotrope = score;
      } else if (axe.axis?.toLowerCase().includes("thyré") || axe.axis?.toLowerCase().includes("thyro")) {
        scores.thyroidien = score;
      } else if (axe.axis?.toLowerCase().includes("gonado")) {
        scores.genital = score;
      } else if (axe.axis?.toLowerCase().includes("somato")) {
        scores.somatotrope = score;
      }
    }
  }

  // Score digestif depuis drainage
  if (synthesis.drainage?.emonctoires) {
    for (const em of synthesis.drainage.emonctoires) {
      if (em.organe === "foie" || em.organe === "intestin") {
        const emScore = em.score || (em.statut === "sature" ? 80 : em.statut === "sollicite" ? 60 : 30);
        scores.digestif = Math.max(scores.digestif || 0, emScore);
      }
      if (em.organe === "rein") {
        scores.urorenal = em.score || (em.statut === "sature" ? 80 : em.statut === "sollicite" ? 60 : 30);
      }
    }
  }

  // Score immunitaire depuis spasmophilie ou terrain
  if (synthesis.spasmophilie?.score) {
    // Spasmophilie affecte le SNA
    scores.nerveux = synthesis.spasmophilie.score;
  }

  // Score cardiovasculaire depuis terrain
  if (synthesis.terrain?.profilSNA === "Sympathicotonique") {
    scores.cardiovasculaire = 70;
  } else if (synthesis.terrain?.profilSNA === "Dystonique") {
    scores.cardiovasculaire = 65;
  }

  return scores;
}

// ============================================
// EXTRACTION DES DONNÉES BDF DEPUIS SYNTHÈSE IA
// Pour passer à BodyMap
// ============================================

function extractBdfDataFromSynthesis(synthesis: UnifiedAnalysisOutput) {
  const bdfData = {
    adrenal: { status: "NORMAL", value: 0, interpretation: "" },
    thyroid: { status: "NORMAL", value: 0, interpretation: "" },
    metabolic: { status: "NORMAL", value: 0, interpretation: "" },
    cardiac: { status: "NORMAL", value: 0, interpretation: "" },
    gonadal: { status: "NORMAL", value: 0, interpretation: "" },
  };

  // Mapper depuis les axes endocriniens
  if (synthesis.endocrineAxes) {
    for (const axe of synthesis.endocrineAxes) {
      const status = axe.status?.toLowerCase().includes("hyper") ? "HYPER" :
                     axe.status?.toLowerCase().includes("hypo") ? "HYPO" : "NORMAL";

      if (axe.axis?.toLowerCase().includes("cortico")) {
        bdfData.adrenal = { status, value: axe.score || 0, interpretation: axe.mechanism || "" };
      } else if (axe.axis?.toLowerCase().includes("thyré") || axe.axis?.toLowerCase().includes("thyro")) {
        bdfData.thyroid = { status, value: axe.score || 0, interpretation: axe.mechanism || "" };
      } else if (axe.axis?.toLowerCase().includes("gonado")) {
        bdfData.gonadal = { status, value: axe.score || 0, interpretation: axe.mechanism || "" };
      }
    }
  }

  // Métabolique depuis drainage (foie)
  if (synthesis.drainage?.emonctoires) {
    const foie = synthesis.drainage.emonctoires.find(e => e.organe === "foie");
    if (foie && (foie.statut === "sature" || foie.statut === "sollicite")) {
      bdfData.metabolic = {
        status: "RESISTANCE",
        value: foie.score || 70,
        interpretation: foie.strategieDrainage || "Drainage hépatique nécessaire"
      };
    }
  }

  // Cardiaque depuis profil SNA
  if (synthesis.terrain?.profilSNA === "Sympathicotonique" ||
      synthesis.neuroVegetative?.status === "Sympathicotonia") {
    bdfData.cardiac = { status: "HYPER", value: 70, interpretation: "Profil sympathicotonique" };
  }

  return bdfData;
}

// ============================================
// EXTRACTION DES PROBLÈMES DEPUIS SYNTHÈSE IA
// ============================================

function extractProblemsFromSynthesis(synthesis: UnifiedAnalysisOutput): TerrainProblem[] {
  const problems: TerrainProblem[] = [];

  // 1. Depuis les axes endocriniens
  if (synthesis.endocrineAxes) {
    for (const axe of synthesis.endocrineAxes) {
      const isHyper = axe.status?.toLowerCase().includes("hyper");
      const isHypo = axe.status?.toLowerCase().includes("hypo");
      const isDysfonctionnel = axe.status?.toLowerCase().includes("dysfonctionnel");

      if (!isHyper && !isHypo && !isDysfonctionnel) continue;

      let organId = "";
      let organLabel = "";

      if (axe.axis?.toLowerCase().includes("cortico")) {
        organId = "surrenales";
        organLabel = "Surrénales";
      } else if (axe.axis?.toLowerCase().includes("thyré") || axe.axis?.toLowerCase().includes("thyro")) {
        organId = "thyroide";
        organLabel = "Thyroïde";
      } else if (axe.axis?.toLowerCase().includes("gonado")) {
        organId = "gonades";
        organLabel = "Gonades";
      } else if (axe.axis?.toLowerCase().includes("somato")) {
        organId = "cerveau";
        organLabel = "Hypophyse";
      }

      if (organId) {
        problems.push({
          id: organId,
          organLabel,
          title: `${axe.axis} - ${axe.status}`,
          severity: isHyper ? "CRITIQUE" : isDysfonctionnel ? "MODERE" : "MODERE",
          description: axe.mechanism || axe.therapeuticImplication || `Déséquilibre de l'axe ${axe.axis} détecté.`,
          color: isHyper ? "red" : "blue",
        });
      }
    }
  }

  // 2. Depuis le drainage (émonctoires)
  if (synthesis.drainage?.emonctoires) {
    for (const emonctoire of synthesis.drainage.emonctoires) {
      // Vérifier statut (lowercase: sature, sollicite, normal)
      if (emonctoire.statut === "sature" || emonctoire.statut === "sollicite") {
        let organId = "";
        let organLabel = "";

        // Mapper organe (lowercase dans le type)
        switch (emonctoire.organe) {
          case "foie":
            organId = "foie";
            organLabel = "Foie";
            break;
          case "intestin":
            organId = "intestins";
            organLabel = "Intestins";
            break;
          case "rein":
            organId = "reins";
            organLabel = "Reins";
            break;
          case "peau":
            organId = "peau";
            organLabel = "Peau";
            break;
          case "lymphe":
            organId = "rate";
            organLabel = "Système Lymphatique";
            break;
        }

        if (organId) {
          problems.push({
            id: organId,
            organLabel,
            title: `${organLabel} - ${emonctoire.statut === "sature" ? "Saturé" : "Sollicité"}`,
            severity: emonctoire.statut === "sature" ? "CRITIQUE" : "MODERE",
            description: emonctoire.indicateurs?.join(", ") ||
                        (typeof emonctoire.strategieDrainage === 'string'
                          ? emonctoire.strategieDrainage.replace(/\[object Object\]/g, '').trim()
                          : (emonctoire.strategieDrainage as any)?.description || "") ||
                        `Émonctoire ${organLabel} ${emonctoire.statut}, drainage recommandé.`,
            color: emonctoire.statut === "sature" ? "red" : "orange",
          });
        }
      }
    }
  }

  // 3. Depuis la spasmophilie
  if (synthesis.spasmophilie?.severite && synthesis.spasmophilie.severite !== "Absent") {
    const signes = Array.isArray(synthesis.spasmophilie.signesCliniques)
      ? synthesis.spasmophilie.signesCliniques.join(", ")
      : "";

    problems.push({
      id: "cerveau",
      organLabel: "Système Nerveux",
      title: `Spasmophilie - ${synthesis.spasmophilie.severite}`,
      severity: synthesis.spasmophilie.severite === "Sévère" ? "CRITIQUE" :
               synthesis.spasmophilie.severite === "Modéré" ? "MODERE" : "LEGER",
      description: signes || synthesis.spasmophilie.terrainAssocié || "Terrain spasmophile détecté.",
      color: synthesis.spasmophilie.severite === "Sévère" ? "red" : "yellow",
    });
  }

  // 4. Depuis le profil neuro-végétatif
  if (synthesis.neuroVegetative?.status &&
      synthesis.neuroVegetative.status !== "Eutonia" &&
      synthesis.neuroVegetative.status !== "Amphotonia") {

    const status = synthesis.neuroVegetative.status;
    problems.push({
      id: "cerveau",
      organLabel: "SNA",
      title: `Profil ${status === "Sympathicotonia" ? "Sympathicotonique" :
              status === "Parasympathicotonia" ? "Vagotonique" : "Dystonique"}`,
      severity: status === "Dystonia" ? "MODERE" : "LEGER",
      description: synthesis.neuroVegetative.explanation ||
                  synthesis.neuroVegetative.mecanismePhysiopath ||
                  `Déséquilibre du système nerveux autonome.`,
      color: status === "Sympathicotonia" ? "red" :
             status === "Parasympathicotonia" ? "blue" : "yellow",
    });
  }

  return problems;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function PatientVisualReport({
  patientId,
  patientName,
  onNavigateToSynthese
}: PatientVisualReportProps) {
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const [synthesis, setSynthesis] = useState<UnifiedAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<TerrainProblem[]>([]);

  // Charger la synthèse IA au montage
  useEffect(() => {
    const loadSynthesis = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/unified-synthesis?patientId=${patientId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.synthesis?.content) {
            setSynthesis(data.synthesis.content as UnifiedAnalysisOutput);
          }
        }
      } catch (error) {
        console.error("Erreur chargement synthèse IA:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSynthesis();
  }, [patientId]);

  // Extraire les problèmes quand la synthèse change
  useEffect(() => {
    if (synthesis) {
      const extractedProblems = extractProblemsFromSynthesis(synthesis);

      // Dédupliquer par organe (garder le plus sévère)
      const uniqueProblems = new Map<string, TerrainProblem>();
      const severityOrder = { "CRITIQUE": 0, "MODERE": 1, "LEGER": 2 };

      for (const p of extractedProblems) {
        const existing = uniqueProblems.get(p.id);
        if (!existing || severityOrder[p.severity] < severityOrder[existing.severity]) {
          uniqueProblems.set(p.id, p);
        }
      }

      // Trier par sévérité
      const sorted = Array.from(uniqueProblems.values()).sort((a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity]
      );

      setProblems(sorted);
    }
  }, [synthesis]);

  // Construire les données pour BodyMap depuis la synthèse IA
  const bodyMapBdf = synthesis ? extractBdfDataFromSynthesis(synthesis) : {
    adrenal: { status: "NORMAL", value: 0, interpretation: "" },
    thyroid: { status: "NORMAL", value: 0, interpretation: "" },
    metabolic: { status: "NORMAL", value: 0, interpretation: "" },
    cardiac: { status: "NORMAL", value: 0, interpretation: "" },
    gonadal: { status: "NORMAL", value: 0, interpretation: "" },
  };

  // Extraire les scores depuis la synthèse pour les nouveaux organes
  const scores = synthesis ? extractScoresFromSynthesis(synthesis) : {};

  // ============================================
  // RENDER
  // ============================================

  // État de chargement
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement de la synthèse IA...</p>
        </div>
      </div>
    );
  }

  // ⚠️ PAS DE SYNTHÈSE IA - Message explicite
  if (!synthesis) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6">
        <div className="text-center max-w-lg">
          {/* Icône animée */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
            <div className="relative flex items-center justify-center w-full h-full bg-slate-800 rounded-full border-2 border-indigo-500/50">
              <Info className="w-12 h-12 text-indigo-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Synthèse IA Requise
          </h2>

          <p className="text-slate-400 mb-6 leading-relaxed">
            Le <strong className="text-indigo-400">Rapport Visuel</strong> est généré à partir de la
            <strong className="text-indigo-400"> Synthèse IA</strong> pour garantir une cohérence
            parfaite avec l'analyse clinique complète.
          </p>

          <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-indigo-400" />
              Pour afficher ce rapport :
            </h3>
            <ol className="text-left text-slate-400 space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-sm font-bold">1</span>
                <span>Allez dans l'onglet <strong className="text-white">Synthèse</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-sm font-bold">2</span>
                <span>Cliquez sur <strong className="text-white">Générer Synthèse IA</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-sm font-bold">3</span>
                <span>Revenez ici pour voir le rapport visuel</span>
              </li>
            </ol>
          </div>

          {onNavigateToSynthese && (
            <Button
              onClick={onNavigateToSynthese}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              Aller à l'onglet Synthèse
              <ArrowRight size={18} />
            </Button>
          )}

          <p className="text-xs text-slate-500 mt-6">
            Cette approche garantit que les données affichées sont cohérentes et validées par l'IA.
          </p>
        </div>
      </div>
    );
  }

  // Pas de problème détecté
  if (problems.length === 0) {
    return (
      <div className="h-full flex flex-col bg-slate-950 text-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Activity className="text-green-500" />
              Synthèse Visuelle - {patientName}
            </h2>
            <p className="text-sm text-slate-400">
              Basé sur Synthèse IA • {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Source: Synthèse IA
          </Badge>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">
              Terrain Équilibré
            </h3>
            <p className="text-slate-400 max-w-md">
              Aucun déséquilibre majeur n'a été détecté par la Synthèse IA.
              Le terrain endobiogénique est globalement équilibré.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage normal avec problèmes détectés
  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-100 p-6 overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Activity className="text-indigo-500" />
            Synthèse Visuelle - {patientName}
          </h2>
          <p className="text-sm text-slate-400">
            Corrélation anatomo-physiologique • Source: Synthèse IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
            Synthèse IA
          </Badge>
          <Badge variant="outline" className="border-slate-700 text-slate-400">
            {problems.length} déséquilibre{problems.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">

        {/* COLONNE GAUCHE : LE CORPS (SCANNER) */}
        <div className="lg:col-span-4 relative bg-slate-900/30 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-4">

          {/* EFFET SCANNER (Ligne qui descend) */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[scan_4s_ease-in-out_infinite]" />
          </div>

          {/* Le BodyMap avec les données de la Synthèse IA */}
          <div className="relative z-10 scale-110">
            <BodyMap
              scores={scores}
              bdf={bodyMapBdf}
              highlightedOrgan={hoveredOrgan}
            />
          </div>

          <div className="absolute bottom-4 text-xs text-slate-500 flex gap-2">
            <span className="flex items-center gap-1">
              <ScanLine size={10}/>
              Données Synthèse IA
            </span>
          </div>
        </div>

        {/* COLONNE DROITE : LES CARTES DE PROBLÈMES */}
        <div className="lg:col-span-8 overflow-y-auto pr-2 space-y-4">
          {problems.map((item, idx) => (
            <Card
              key={idx}
              onMouseEnter={() => setHoveredOrgan(item.id)}
              onMouseLeave={() => setHoveredOrgan(null)}
              className={`
                border-0 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-300
                ${hoveredOrgan === item.id ? 'ring-2 ring-indigo-500 scale-[1.02] bg-slate-800' : 'hover:bg-slate-800/80'}
              `}
            >
              <div className={`p-5 border-l-4 ${
                item.color === 'red' ? 'border-red-500 bg-red-500/5' :
                item.color === 'orange' ? 'border-orange-500 bg-orange-500/5' :
                item.color === 'blue' ? 'border-blue-500 bg-blue-500/5' :
                'border-yellow-500 bg-yellow-500/5'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className={`flex items-center gap-2 font-bold ${
                    item.color === 'red' ? 'text-red-400' :
                    item.color === 'orange' ? 'text-orange-400' :
                    item.color === 'blue' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    <AlertTriangle size={18} />
                    {item.title}
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${
                    item.severity === 'CRITIQUE' ? 'border-red-500 text-red-400' :
                    item.severity === 'MODERE' ? 'border-orange-500 text-orange-400' :
                    'border-yellow-500 text-yellow-400'
                  }`}>
                    {item.severity}
                  </Badge>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-slate-800 rounded">
                    {item.organLabel}
                  </span>
                </div>
              </div>
            </Card>
          ))}

          {/* Note informative */}
          <div className="mt-4 p-4 bg-slate-900/30 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-500 text-center">
              Ce rapport est généré à partir de la <strong className="text-indigo-400">Synthèse IA</strong>.
              <br />
              Pour voir les recommandations thérapeutiques, consultez l'onglet <strong>Ordonnances</strong>.
            </p>
          </div>
        </div>

      </div>

      {/* CSS Animation pour le Scanner */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
