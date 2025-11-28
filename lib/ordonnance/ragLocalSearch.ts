// ========================================
// RAG LOCAL - Recherche dans les données extraites
// ========================================
// Utilise les JSON extraits des 4 volumes d'endobiogénie
// pour un filtrage rapide et précis AVANT d'appeler OpenAI
//
// AVANTAGES:
// - Instantané (<100ms vs 3-5s pour VectorStore)
// - Gratuit (pas d'appel API)
// - Filtrage exact par axe/indication
// - Fonctionne hors-ligne
//
// UTILISATION:
// 1. Filtrer les plantes par axes perturbés
// 2. Enrichir avec VectorStore si besoin de contexte

import type { AxePerturbation } from "./types";

// ========================================
// TYPES
// ========================================

export interface PlanteMedicinale {
  nomLatin: string;
  nomCommun: string;
  essence: string;
  resume: string;
  partiesUtilisees: string;
  galenique: string;
  methode: string;
  precautions: string;
  axes: string[];
  indications: string[];
}

export interface AxeEndocrinien {
  nom: string;
  description: string;
  hormones: {
    centrales: string[];
    peripheriques: string[];
  };
  metabolisme: string;
  emonctoires: string[];
  plantesReferencees: { nom: string; action: string }[];
  indexBDF: string[];
}

export interface Emonctoire {
  nom: string;
  axes: string[];
  fonctions: string[];
  signesCongestion: string[];
  conseilClinique?: string;
  plantesdraineurs: { nom: string; action: string }[];
}

export interface SNABranche {
  nom: string;
  abreviation: string;
  autacoide: string | null;
  role: string;
  actions: Record<string, string>;
  hyperactivite: { signes: string[]; terrains: string[] };
  hypoactivite: { signes: string[]; terrains: string[] };
}

export interface PathologieTerrain {
  nom: string;
  description: string;
  terrainPrecritique: {
    description: string;
    axes: string[];
    sna?: string[];
  };
  emonctoires?: string[];
  traitementEndobiogenique: Record<string, string[]>;
  conseilsCliniques: string[];
}

export interface RAGSearchResult {
  plantes: PlanteMedicinale[];
  axesDetails: AxeEndocrinien[];
  emonctoiresImpliques: Emonctoire[];
  conseilsCliniques: string[];
  score: number;
  source: string;
}

// ========================================
// CHARGEMENT DES DONNÉES (une seule fois)
// ========================================

// Import statique des JSON (compilés avec le bundle)
import matiereMedialeData from "@/RAG/endobiogenie/volume2/matiere-medicale.json";
import axesEndocrieniensData from "@/RAG/endobiogenie/volume2/axes-endocriniens.json";
import emonctoiresData from "@/RAG/endobiogenie/volume2/emonctoires.json";
import snaData from "@/RAG/endobiogenie/volume2/sna.json";
import pathologiesDBData from "@/RAG/endobiogenie/volume3/pathologies-database.json";

// Typage des données importées
const matiereMediale = matiereMedialeData as { plantes: PlanteMedicinale[]; total: number };
const axesEndocriniens = axesEndocrieniensData as Record<string, AxeEndocrinien>;
const emonctoires = emonctoiresData as Record<string, Emonctoire>;
const sna = snaData as { parasympathique: SNABranche; alphasympathique: SNABranche; betasympathique: SNABranche };
const pathologiesDB = pathologiesDBData as Record<string, PathologieTerrain>;

// ========================================
// MAPPING AXES BDF → AXES ENDOBIOGÉNIQUES
// ========================================

const AXES_MAPPING: Record<string, string[]> = {
  // Axes BDF → Axes dans les JSON
  corticotrope: ["corticotrope"],
  thyroidien: ["thyréotrope", "thyreotrope"],
  gonadotrope: ["gonadotrope"],
  somatotrope: ["somatotrope"],
  sna: ["parasympathique", "alphasympathique", "betasympathique"],
  sna_alpha: ["alphasympathique"],
  sna_beta: ["betasympathique"],
  sna_mixte: ["alphasympathique", "betasympathique"],
  histamine: ["corticotrope"], // Histamine → souvent lié au corticotrope
};

// ========================================
// FONCTIONS DE RECHERCHE
// ========================================

/**
 * Recherche les plantes par axes perturbés
 * @param axes - Liste des axes perturbés depuis l'analyse BDF
 * @returns Plantes filtrées avec score de pertinence
 */
export function searchPlantesByAxes(
  axes: AxePerturbation[]
): { plante: PlanteMedicinale; score: number; matchedAxes: string[] }[] {
  if (!matiereMediale?.plantes?.length) {
    console.warn("⚠️ Matière médicale non chargée");
    return [];
  }

  const results: { plante: PlanteMedicinale; score: number; matchedAxes: string[] }[] = [];

  // Extraire les axes recherchés
  const axesRecherches = new Set<string>();
  for (const axe of axes) {
    const mapped = AXES_MAPPING[axe.axe] || [axe.axe];
    mapped.forEach(a => axesRecherches.add(a.toLowerCase()));
  }

  // Scorer chaque plante
  for (const plante of matiereMediale.plantes) {
    let score = 0;
    const matchedAxes: string[] = [];

    // Match sur les axes
    for (const axePlante of plante.axes || []) {
      if (axesRecherches.has(axePlante.toLowerCase())) {
        score += 3; // 3 points par axe matché
        matchedAxes.push(axePlante);
      }
    }

    // Bonus si plusieurs axes matchés
    if (matchedAxes.length > 1) {
      score += matchedAxes.length;
    }

    // Bonus si essence/résumé mentionnent les axes
    const textePlante = `${plante.essence} ${plante.resume}`.toLowerCase();
    for (const axe of axes) {
      if (textePlante.includes(axe.axe.toLowerCase())) {
        score += 1;
      }
    }

    if (score > 0) {
      results.push({ plante, score, matchedAxes });
    }
  }

  // Trier par score décroissant
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Recherche les plantes par indications cliniques
 * @param indications - Liste d'indications (ex: "digestif", "nerveux")
 * @returns Plantes filtrées
 */
export function searchPlantesByIndications(
  indications: string[]
): { plante: PlanteMedicinale; score: number; matchedIndications: string[] }[] {
  if (!matiereMediale?.plantes?.length) return [];

  const results: { plante: PlanteMedicinale; score: number; matchedIndications: string[] }[] = [];
  const indicationsLower = indications.map(i => i.toLowerCase());

  for (const plante of matiereMediale.plantes) {
    let score = 0;
    const matchedIndications: string[] = [];

    for (const ind of plante.indications || []) {
      const indLower = ind.toLowerCase();
      for (const recherche of indicationsLower) {
        if (indLower.includes(recherche) || recherche.includes(indLower)) {
          score += 2;
          matchedIndications.push(ind);
        }
      }
    }

    if (score > 0) {
      results.push({ plante, score, matchedIndications });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Recherche combinée axes + indications
 */
export function searchPlantesHybride(
  axes: AxePerturbation[],
  indications: string[] = [],
  options: {
    maxResults?: number;
    excludeCI?: string[];
    sexe?: "M" | "F";
  } = {}
): RAGSearchResult {
  const { maxResults = 10, excludeCI = [], sexe } = options;

  // 1. Recherche par axes
  const parAxes = searchPlantesByAxes(axes);

  // 2. Recherche par indications
  const parIndications = indications.length > 0
    ? searchPlantesByIndications(indications)
    : [];

  // 3. Fusionner et scorer
  const scoreMap = new Map<string, { plante: PlanteMedicinale; score: number; sources: string[] }>();

  for (const r of parAxes) {
    scoreMap.set(r.plante.nomLatin, {
      plante: r.plante,
      score: r.score * 1.5, // Poids plus élevé pour les axes
      sources: [`Axes: ${r.matchedAxes.join(", ")}`]
    });
  }

  for (const r of parIndications) {
    const existing = scoreMap.get(r.plante.nomLatin);
    if (existing) {
      existing.score += r.score;
      existing.sources.push(`Indications: ${r.matchedIndications.join(", ")}`);
    } else {
      scoreMap.set(r.plante.nomLatin, {
        plante: r.plante,
        score: r.score,
        sources: [`Indications: ${r.matchedIndications.join(", ")}`]
      });
    }
  }

  // 4. Filtrer les CI
  let results = Array.from(scoreMap.values());

  if (excludeCI.length > 0) {
    results = results.filter(r => {
      const precautions = (r.plante.precautions || "").toLowerCase();
      return !excludeCI.some(ci => precautions.includes(ci.toLowerCase()));
    });
  }

  // 5. Filtrer par sexe (pas d'œstrogéniques pour hommes)
  if (sexe === "M") {
    results = results.filter(r => {
      const indics = r.plante.indications || [];
      return !indics.includes("œstrogénique");
    });
  }

  // 6. Trier et limiter
  results.sort((a, b) => b.score - a.score);
  const topPlantes = results.slice(0, maxResults).map(r => r.plante);

  // 7. Récupérer les détails des axes impliqués
  const axesDetails: AxeEndocrinien[] = [];
  for (const axe of axes) {
    const key = axe.axe.replace("sna_", "").replace("thyroidien", "thyreotrope");
    if (axesEndocriniens[key]) {
      axesDetails.push(axesEndocriniens[key]);
    }
  }

  // 8. Récupérer les émonctoires impliqués
  const emonctoiresImpliques: Emonctoire[] = [];
  const axesNoms = axes.map(a => a.axe);
  for (const [key, em] of Object.entries(emonctoires)) {
    if (em.axes?.some(a => axesNoms.some(an => a.toLowerCase().includes(an.toLowerCase())))) {
      emonctoiresImpliques.push(em);
    }
  }

  // 9. Collecter les conseils cliniques
  const conseilsCliniques: string[] = [];
  for (const em of emonctoiresImpliques) {
    if (em.conseilClinique) {
      conseilsCliniques.push(`${em.nom}: ${em.conseilClinique}`);
    }
  }

  return {
    plantes: topPlantes,
    axesDetails,
    emonctoiresImpliques,
    conseilsCliniques,
    score: results[0]?.score || 0,
    source: "RAG Local - Volume 2 Matière Médicale"
  };
}

/**
 * Récupère les draineurs pour un émonctoire
 */
export function getDraineursForEmonctoire(
  emonctoire: "foie" | "reins" | "poumons" | "peau" | "intestins"
): { nom: string; action: string }[] {
  const em = emonctoires[emonctoire];
  return em?.plantesdraineurs || [];
}

/**
 * Récupère les détails d'un axe endocrinien
 */
export function getAxeDetails(axe: string): AxeEndocrinien | null {
  const key = axe.replace("sna_", "").replace("thyroidien", "thyreotrope");
  return axesEndocriniens[key] || null;
}

/**
 * Récupère le terrain d'une pathologie
 */
export function getPathologieTerrain(pathologie: string): PathologieTerrain | null {
  // Recherche par clé ou par nom
  for (const [key, p] of Object.entries(pathologiesDB)) {
    if (key.toLowerCase().includes(pathologie.toLowerCase()) ||
        p.nom.toLowerCase().includes(pathologie.toLowerCase())) {
      return p;
    }
  }
  return null;
}

/**
 * Récupère les plantes de référence pour un axe
 */
export function getPlantesReferenceForAxe(axe: string): { nom: string; action: string }[] {
  const axeDetails = getAxeDetails(axe);
  return axeDetails?.plantesReferencees || [];
}

/**
 * Recherche une plante par nom latin
 */
export function getPlante(nomLatin: string): PlanteMedicinale | null {
  return matiereMediale.plantes.find(
    p => p.nomLatin.toLowerCase() === nomLatin.toLowerCase()
  ) || null;
}

/**
 * Statistiques du RAG local
 */
export function getRAGStats(): {
  totalPlantes: number;
  totalAxes: number;
  totalEmonctoires: number;
  totalPathologies: number;
} {
  return {
    totalPlantes: matiereMediale?.plantes?.length || 0,
    totalAxes: Object.keys(axesEndocriniens || {}).length,
    totalEmonctoires: Object.keys(emonctoires || {}).length,
    totalPathologies: Object.keys(pathologiesDB || {}).length
  };
}

// ========================================
// EXPORT PAR DÉFAUT
// ========================================

export default {
  searchPlantesByAxes,
  searchPlantesByIndications,
  searchPlantesHybride,
  getDraineursForEmonctoire,
  getAxeDetails,
  getPathologieTerrain,
  getPlantesReferenceForAxe,
  getPlante,
  getRAGStats,
  // Données brutes
  matiereMediale,
  axesEndocriniens,
  emonctoires,
  sna,
  pathologiesDB
};
