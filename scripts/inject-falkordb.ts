/**
 * Script d'injection des données dans FalkorDB
 * =============================================
 *
 * Ce script lit le JSON extrait par extract-endobiogenie-graph.ts
 * et injecte toutes les données dans FalkorDB.
 *
 * Prérequis:
 * 1. FalkorDB doit être accessible (Docker local ou Cloud)
 * 2. Variables d'environnement configurées:
 *    - FALKORDB_HOST (défaut: localhost)
 *    - FALKORDB_PORT (défaut: 6379)
 *    - FALKORDB_PASSWORD (optionnel)
 *
 * Usage: npx tsx scripts/inject-falkordb.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();
import {
  initSchema,
  createAxe,
  createSymptome,
  createTerrain,
  createPlante,
  createEmonctoire,
  createIndexBdF,
  createRelation,
} from '../lib/falkordb/schema';
import { getGraph, closeDB } from '../lib/falkordb/client';

// ============================================
// TYPES (doivent correspondre à l'extraction)
// ============================================

interface ExtractedAxe {
  id: string;
  nom: string;
  description: string;
  hormones: string[];
  organes: string[];
  fonction: string;
}

interface ExtractedTerrain {
  id: string;
  nom: string;
  description: string;
  type: 'insuffisance' | 'sur_sollicitation' | 'dysfonction';
  axe_lie: string;
}

interface ExtractedSymptome {
  id: string;
  nom: string;
  description: string;
  localisation: string;
  temporalite: string;
  terrain_suggere: string;
  poids: number;
  source: string;
}

interface ExtractedPlante {
  id: string;
  nom_commun: string;
  nom_latin: string;
  parties_utilisees: string[];
  actions: string[];
  terrains_traites: string[];
  axes_concernes: string[];
  source: string;
}

interface ExtractedIndexBdF {
  id: string;
  nom: string;
  formule: string;
  interpretation_bas: string;
  interpretation_haut: string;
  axe_evalue: string;
}

interface ExtractedEmonctoire {
  id: string;
  nom: string;
  fonction: string;
  axes_lies: string[];
}

interface ExtractedRelation {
  type: string;
  from: string;
  to: string;
  poids: number;
  source: string;
}

interface ExtractionResult {
  axes: ExtractedAxe[];
  terrains: ExtractedTerrain[];
  symptomes: ExtractedSymptome[];
  plantes: ExtractedPlante[];
  indexBdF: ExtractedIndexBdF[];
  emonctoires: ExtractedEmonctoire[];
  relations: ExtractedRelation[];
}

// ============================================
// FONCTIONS D'INJECTION
// ============================================

async function injectAxes(axes: ExtractedAxe[]): Promise<number> {
  let count = 0;
  for (const axe of axes) {
    try {
      await createAxe({
        id: axe.id,
        nom: axe.nom,
        description: axe.description || '',
        hormones: axe.hormones || [],
        organes: axe.organes || [],
        fonction: axe.fonction || '',
      });
      count++;
    } catch (error) {
      console.error(`  Erreur axe ${axe.id}:`, error);
    }
  }
  return count;
}

async function injectTerrains(terrains: ExtractedTerrain[]): Promise<number> {
  let count = 0;
  for (const terrain of terrains) {
    try {
      await createTerrain({
        id: terrain.id,
        nom: terrain.nom,
        description: terrain.description || '',
        type: terrain.type || 'dysfonction',
      });
      count++;
    } catch (error) {
      console.error(`  Erreur terrain ${terrain.id}:`, error);
    }
  }
  return count;
}

async function injectSymptomes(symptomes: ExtractedSymptome[]): Promise<number> {
  let count = 0;
  for (const symptome of symptomes) {
    try {
      await createSymptome({
        id: symptome.id,
        nom: symptome.nom,
        description: symptome.description || '',
        localisation: symptome.localisation,
        temporalite: symptome.temporalite,
      });
      count++;
    } catch (error) {
      console.error(`  Erreur symptome ${symptome.id}:`, error);
    }
  }
  return count;
}

async function injectPlantes(plantes: ExtractedPlante[]): Promise<number> {
  let count = 0;
  for (const plante of plantes) {
    try {
      await createPlante({
        id: plante.id,
        nom_commun: plante.nom_commun,
        nom_latin: plante.nom_latin || '',
        parties_utilisees: plante.parties_utilisees || [],
        actions: plante.actions || [],
      });
      count++;
    } catch (error) {
      console.error(`  Erreur plante ${plante.id}:`, error);
    }
  }
  return count;
}

async function injectIndexBdF(indexes: ExtractedIndexBdF[]): Promise<number> {
  let count = 0;
  for (const index of indexes) {
    try {
      await createIndexBdF({
        id: index.id,
        nom: index.nom,
        formule: index.formule || '',
        interpretation_bas: index.interpretation_bas || '',
        interpretation_haut: index.interpretation_haut || '',
        norme_min: 0.8, // Valeurs par défaut
        norme_max: 1.2,
      });
      count++;
    } catch (error) {
      console.error(`  Erreur index ${index.id}:`, error);
    }
  }
  return count;
}

async function injectEmonctoires(emonctoires: ExtractedEmonctoire[]): Promise<number> {
  let count = 0;
  for (const emonctoire of emonctoires) {
    try {
      await createEmonctoire({
        id: emonctoire.id,
        nom: emonctoire.nom,
        fonction: emonctoire.fonction || '',
      });
      count++;
    } catch (error) {
      console.error(`  Erreur emonctoire ${emonctoire.id}:`, error);
    }
  }
  return count;
}

async function injectRelations(relations: ExtractedRelation[]): Promise<number> {
  let count = 0;
  for (const rel of relations) {
    try {
      await createRelation({
        type: rel.type as any,
        from: rel.from,
        to: rel.to,
        poids: rel.poids || 0.8,
        source: rel.source || '',
      });
      count++;
    } catch (error) {
      // Les erreurs de relation sont souvent dues à des nœuds manquants
      // On les ignore silencieusement
    }
  }
  return count;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 INJECTION DES DONNÉES DANS FALKORDB');
  console.log('='.repeat(60));

  // Vérifier le fichier d'entrée - Volume 1 extrait
  const inputPath = path.join(process.cwd(), 'outputs', 'Endobiogenie_Volume1_OPTIMISE_extracted.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`\n❌ Fichier non trouvé: ${inputPath}`);
    console.error('   Vérifiez que le fichier existe dans outputs/');
    process.exit(1);
  }

  // Lire les données
  console.log(`\n📖 Lecture de ${inputPath}...`);
  const data: ExtractionResult = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log(`\n📊 Données à injecter:`);
  console.log(`   Axes:        ${data.axes?.length || 0}`);
  console.log(`   Terrains:    ${data.terrains?.length || 0}`);
  console.log(`   Symptômes:   ${data.symptomes?.length || 0}`);
  console.log(`   Plantes:     ${data.plantes?.length || 0}`);
  console.log(`   Index BdF:   ${data.indexBdF?.length || 0}`);
  console.log(`   Émonctoires: ${data.emonctoires?.length || 0}`);
  console.log(`   Relations:   ${data.relations?.length || 0}`);

  // Connexion à FalkorDB
  console.log('\n🔌 Connexion à FalkorDB...');
  try {
    await getGraph();
    console.log('   ✅ Connecté!');
  } catch (error) {
    console.error('   ❌ Erreur de connexion:', error);
    console.error('\n   Vérifiez que FalkorDB est accessible:');
    console.error('   - Docker: docker run -p 6379:6379 falkordb/falkordb');
    console.error('   - Cloud: configurez FALKORDB_HOST et FALKORDB_PASSWORD dans .env');
    process.exit(1);
  }

  // Initialiser le schéma
  console.log('\n📋 Initialisation du schéma...');
  await initSchema();

  // Injection des données
  console.log('\n💉 Injection des données...\n');

  console.log('  🔬 Injection des AXES...');
  const axesCount = await injectAxes(data.axes || []);
  console.log(`     ✅ ${axesCount} axes injectés`);

  console.log('  🎯 Injection des TERRAINS...');
  const terrainsCount = await injectTerrains(data.terrains || []);
  console.log(`     ✅ ${terrainsCount} terrains injectés`);

  console.log('  🩺 Injection des SYMPTÔMES...');
  const symptomesCount = await injectSymptomes(data.symptomes || []);
  console.log(`     ✅ ${symptomesCount} symptômes injectés`);

  console.log('  🌿 Injection des PLANTES...');
  const plantesCount = await injectPlantes(data.plantes || []);
  console.log(`     ✅ ${plantesCount} plantes injectées`);

  console.log('  📊 Injection des INDEX BdF...');
  const indexCount = await injectIndexBdF(data.indexBdF || []);
  console.log(`     ✅ ${indexCount} index injectés`);

  console.log('  🚿 Injection des ÉMONCTOIRES...');
  const emontoiresCount = await injectEmonctoires(data.emonctoires || []);
  console.log(`     ✅ ${emontoiresCount} émonctoires injectés`);

  console.log('  🔗 Injection des RELATIONS...');
  const relationsCount = await injectRelations(data.relations || []);
  console.log(`     ✅ ${relationsCount} relations injectées`);

  // Fermer la connexion
  await closeDB();

  console.log('\n' + '='.repeat(60));
  console.log('✅ INJECTION TERMINÉE');
  console.log('='.repeat(60));
  console.log(`
Total injecté:
  - ${axesCount} axes
  - ${terrainsCount} terrains
  - ${symptomesCount} symptômes
  - ${plantesCount} plantes
  - ${indexCount} index BdF
  - ${emontoiresCount} émonctoires
  - ${relationsCount} relations

🔜 Prochaine étape: Testez le chat avec le toggle FalkorDB activé!
`);
}

main().catch(console.error);
