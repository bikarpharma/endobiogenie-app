/**
 * Schéma du Graphe Endobiogénique
 * ================================
 * Définition des Nodes et Relations selon la méthodologie Lapraz/Hedayat
 *
 * STRUCTURE DU GRAPHE:
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    GRAPHE ENDOBIOGÉNIQUE                            │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │  [Symptome] ──SUGGERE──> [Terrain] ──IMPLIQUE──> [Axe]             │
 * │       │                      │                     │                │
 * │       │                      │                     │                │
 * │  LOCALISE_DANS          DRAINE_PAR           INFLUENCE             │
 * │       │                      │                     │                │
 * │       ▼                      ▼                     ▼                │
 * │  [Emonctoire] <──DRAINE── [Plante] ──TRAITE──> [Terrain]           │
 * │                              │                                      │
 * │                         INDIQUE_POUR                                │
 * │                              │                                      │
 * │                              ▼                                      │
 * │                          [Symptome]                                 │
 * │                                                                     │
 * │  [Index_BdF] ──EVALUE──> [Axe]                                     │
 * │       │                                                             │
 * │  DERIVE_DE                                                          │
 * │       │                                                             │
 * │       ▼                                                             │
 * │  [Biomarqueur]                                                      │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import { query } from './client';

// ============================================
// TYPES - NODES
// ============================================

export interface AxeNode {
  id: string;           // ex: "corticotrope", "thyreotrope"
  nom: string;          // ex: "Axe Corticotrope"
  description: string;
  hormones: string[];   // ex: ["ACTH", "Cortisol", "DHEA"]
  organes: string[];    // ex: ["Hypothalamus", "Hypophyse", "Surrénales"]
  fonction: string;     // ex: "Gestion du stress et de l'adaptation"
}

export interface SymptomeNode {
  id: string;           // ex: "fatigue_matinale"
  nom: string;          // ex: "Fatigue matinale"
  description: string;
  localisation?: string; // ex: "général", "digestif", "cutané"
  temporalite?: string;  // ex: "matin", "soir", "permanent"
}

export interface TerrainNode {
  id: string;           // ex: "hypocorticisme"
  nom: string;          // ex: "Hypocorticisme"
  description: string;
  type: 'insuffisance' | 'sur_sollicitation' | 'dysfonction';
}

export interface PlanteNode {
  id: string;           // ex: "cassis"
  nom_commun: string;   // ex: "Cassis"
  nom_latin: string;    // ex: "Ribes nigrum"
  parties_utilisees: string[];
  actions: string[];    // ex: ["anti-inflammatoire", "cortisone-like"]
}

export interface EmontoireNode {
  id: string;           // ex: "foie"
  nom: string;          // ex: "Foie"
  fonction: string;     // ex: "Détoxification, métabolisme"
}

export interface IndexBdFNode {
  id: string;           // ex: "idx_cortico"
  nom: string;          // ex: "Index Corticotrope"
  formule?: string;     // ex: "Cortisol / DHEA"
  interpretation_bas: string;
  interpretation_haut: string;
  norme_min: number;
  norme_max: number;
}

export interface BiomarqueurNode {
  id: string;           // ex: "cortisol"
  nom: string;          // ex: "Cortisol sérique"
  unite: string;        // ex: "µg/dL"
  norme_min: number;
  norme_max: number;
}

// ============================================
// TYPES - RELATIONS
// ============================================

export type RelationType =
  | 'SUGGERE'           // Symptome -> Terrain
  | 'IMPLIQUE'          // Terrain -> Axe
  | 'INFLUENCE'         // Axe -> Axe
  | 'DRAINE'            // Plante -> Emonctoire
  | 'TRAITE'            // Plante -> Terrain
  | 'INDIQUE_POUR'      // Plante -> Symptome
  | 'EVALUE'            // Index_BdF -> Axe
  | 'DERIVE_DE'         // Index_BdF -> Biomarqueur
  | 'LOCALISE_DANS';    // Symptome -> Emonctoire

export interface Relation {
  type: RelationType;
  from: string;         // ID du node source
  to: string;           // ID du node cible
  poids?: number;       // Force de la relation (0-1)
  source?: string;      // Référence (ex: "Volume 1, p.45")
  description?: string;
}

// ============================================
// CRÉATION DU SCHÉMA
// ============================================

/**
 * Initialiser le schéma du graphe avec les index
 */
export async function initSchema(): Promise<void> {
  console.log('[FalkorDB] Initialisation du schéma...');

  // Créer les index pour recherche rapide
  const indexes = [
    'CREATE INDEX IF NOT EXISTS FOR (a:Axe) ON (a.id)',
    'CREATE INDEX IF NOT EXISTS FOR (s:Symptome) ON (s.id)',
    'CREATE INDEX IF NOT EXISTS FOR (t:Terrain) ON (t.id)',
    'CREATE INDEX IF NOT EXISTS FOR (p:Plante) ON (p.id)',
    'CREATE INDEX IF NOT EXISTS FOR (e:Emonctoire) ON (e.id)',
    'CREATE INDEX IF NOT EXISTS FOR (i:Index_BdF) ON (i.id)',
    'CREATE INDEX IF NOT EXISTS FOR (b:Biomarqueur) ON (b.id)',
  ];

  for (const idx of indexes) {
    try {
      await query(idx);
    } catch (e) {
      // Index peut déjà exister
      console.log('[FalkorDB] Index existant ou erreur:', (e as Error).message);
    }
  }

  console.log('[FalkorDB] Schéma initialisé');
}

// ============================================
// FONCTIONS CRUD - NODES
// ============================================

export async function createAxe(axe: AxeNode): Promise<void> {
  const cypher = `
    MERGE (a:Axe {id: $id})
    SET a.nom = $nom,
        a.description = $description,
        a.hormones = $hormones,
        a.organes = $organes,
        a.fonction = $fonction
  `;
  await query(cypher, axe);
}

export async function createSymptome(symptome: SymptomeNode): Promise<void> {
  const cypher = `
    MERGE (s:Symptome {id: $id})
    SET s.nom = $nom,
        s.description = $description,
        s.localisation = $localisation,
        s.temporalite = $temporalite
  `;
  await query(cypher, symptome);
}

export async function createTerrain(terrain: TerrainNode): Promise<void> {
  const cypher = `
    MERGE (t:Terrain {id: $id})
    SET t.nom = $nom,
        t.description = $description,
        t.type = $type
  `;
  await query(cypher, terrain);
}

export async function createPlante(plante: PlanteNode): Promise<void> {
  const cypher = `
    MERGE (p:Plante {id: $id})
    SET p.nom_commun = $nom_commun,
        p.nom_latin = $nom_latin,
        p.parties_utilisees = $parties_utilisees,
        p.actions = $actions
  `;
  await query(cypher, plante);
}

export async function createEmonctoire(emonctoire: EmontoireNode): Promise<void> {
  const cypher = `
    MERGE (e:Emonctoire {id: $id})
    SET e.nom = $nom,
        e.fonction = $fonction
  `;
  await query(cypher, emonctoire);
}

export async function createIndexBdF(index: IndexBdFNode): Promise<void> {
  const cypher = `
    MERGE (i:Index_BdF {id: $id})
    SET i.nom = $nom,
        i.formule = $formule,
        i.interpretation_bas = $interpretation_bas,
        i.interpretation_haut = $interpretation_haut,
        i.norme_min = $norme_min,
        i.norme_max = $norme_max
  `;
  await query(cypher, index);
}

// ============================================
// FONCTIONS CRUD - RELATIONS
// ============================================

export async function createRelation(rel: Relation): Promise<void> {
  const cypher = `
    MATCH (from {id: $from})
    MATCH (to {id: $to})
    MERGE (from)-[r:${rel.type}]->(to)
    SET r.poids = $poids,
        r.source = $source,
        r.description = $description
  `;
  await query(cypher, {
    from: rel.from,
    to: rel.to,
    poids: rel.poids || 1.0,
    source: rel.source || '',
    description: rel.description || '',
  });
}

// ============================================
// REQUÊTES DE SYNTHÈSE
// ============================================

/**
 * Trouver les terrains suggérés par un ensemble de symptômes
 */
export async function findTerrainsBySymptomes(symptomeIds: string[]): Promise<any[]> {
  const cypher = `
    MATCH (s:Symptome)-[r:SUGGERE]->(t:Terrain)
    WHERE s.id IN $symptomeIds
    WITH t, COUNT(r) as nb_symptomes, SUM(r.poids) as score
    RETURN t.id as terrain_id, t.nom as terrain_nom, t.description, nb_symptomes, score
    ORDER BY score DESC
  `;
  const result = await query(cypher, { symptomeIds });
  return result.data || [];
}

/**
 * Trouver les axes impliqués par un terrain
 */
export async function findAxesByTerrain(terrainId: string): Promise<any[]> {
  const cypher = `
    MATCH (t:Terrain {id: $terrainId})-[r:IMPLIQUE]->(a:Axe)
    RETURN a.id as axe_id, a.nom as axe_nom, a.description, r.poids as poids
    ORDER BY r.poids DESC
  `;
  const result = await query(cypher, { terrainId });
  return result.data || [];
}

/**
 * Trouver les plantes pour traiter un terrain
 */
export async function findPlantesByTerrain(terrainId: string): Promise<any[]> {
  const cypher = `
    MATCH (p:Plante)-[r:TRAITE]->(t:Terrain {id: $terrainId})
    RETURN p.id, p.nom_commun, p.nom_latin, p.actions, r.poids
    ORDER BY r.poids DESC
    LIMIT 10
  `;
  const result = await query(cypher, { terrainId });
  return result.data || [];
}

/**
 * Générer une mini-synthèse locale à partir des symptômes
 */
export async function generateLocalSynthesis(symptomeIds: string[]): Promise<{
  terrains: any[];
  axes: any[];
  plantes_suggerees: any[];
}> {
  // 1. Trouver les terrains
  const terrains = await findTerrainsBySymptomes(symptomeIds);

  // 2. Trouver les axes impliqués
  const axesSet = new Map();
  for (const terrain of terrains.slice(0, 3)) {
    const axes = await findAxesByTerrain(terrain.terrain_id);
    for (const axe of axes) {
      if (!axesSet.has(axe.axe_id)) {
        axesSet.set(axe.axe_id, axe);
      }
    }
  }

  // 3. Trouver les plantes suggérées
  const plantesSet = new Map();
  for (const terrain of terrains.slice(0, 2)) {
    const plantes = await findPlantesByTerrain(terrain.terrain_id);
    for (const plante of plantes) {
      if (!plantesSet.has(plante.id)) {
        plantesSet.set(plante.id, plante);
      }
    }
  }

  return {
    terrains: terrains.slice(0, 5),
    axes: Array.from(axesSet.values()),
    plantes_suggerees: Array.from(plantesSet.values()).slice(0, 5),
  };
}

export default {
  initSchema,
  createAxe,
  createSymptome,
  createTerrain,
  createPlante,
  createEmonctoire,
  createIndexBdF,
  createRelation,
  findTerrainsBySymptomes,
  findAxesByTerrain,
  findPlantesByTerrain,
  generateLocalSynthesis,
};
