/**
 * Script d'extraction du graphe de connaissances endobiogénique
 * ==============================================================
 *
 * Ce script parcourt les 4 volumes d'endobiogénie et extrait :
 * - Les AXES endocriniens (Corticotrope, Thyréotrope, Gonadotrope, Somatotrope)
 * - Les TERRAINS (hypocorticisme, hyperthyroïdie, etc.)
 * - Les SYMPTÔMES et leurs liens aux terrains
 * - Les PLANTES et leurs indications
 * - Les INDEX BdF et leur interprétation
 * - Les ÉMONCTOIRES
 * - Les RELATIONS entre toutes ces entités
 *
 * Utilise GPT-4 pour l'extraction intelligente.
 *
 * Usage: npx tsx scripts/extract-endobiogenie-graph.ts
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// TYPES
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
// PROMPTS D'EXTRACTION
// ============================================

const EXTRACTION_SYSTEM_PROMPT = `Tu es un expert en endobiogénie (méthode Lapraz/Hedayat). Tu dois extraire des données structurées à partir du texte médical fourni.

RÈGLES IMPORTANTES:
1. Extrais UNIQUEMENT les informations EXPLICITEMENT présentes dans le texte
2. Ne fabrique JAMAIS d'informations
3. Utilise des IDs en snake_case (ex: fatigue_matinale, hypocorticisme)
4. Sois précis sur les sources (numéro de page si disponible)
5. Les poids de relation sont de 0.0 à 1.0 (1.0 = très forte relation)

FORMAT DE SORTIE: JSON valide uniquement, sans commentaires.`;

const EXTRACTION_AXES_PROMPT = `Extrais TOUS les AXES ENDOCRINIENS mentionnés dans ce texte.

Pour chaque axe, extrais:
{
  "id": "identifiant_snake_case",
  "nom": "Nom complet de l'axe",
  "description": "Description de l'axe",
  "hormones": ["liste", "des", "hormones"],
  "organes": ["hypothalamus", "hypophyse", "glande_cible"],
  "fonction": "Fonction principale"
}

Retourne un JSON: { "axes": [...] }`;

const EXTRACTION_TERRAINS_PROMPT = `Extrais TOUS les TERRAINS PATHOLOGIQUES mentionnés dans ce texte.

Pour chaque terrain, extrais:
{
  "id": "identifiant_snake_case",
  "nom": "Nom du terrain",
  "description": "Description du terrain",
  "type": "insuffisance|sur_sollicitation|dysfonction",
  "axe_lie": "id_de_l_axe_concerné"
}

Retourne un JSON: { "terrains": [...] }`;

const EXTRACTION_SYMPTOMES_PROMPT = `Extrais TOUS les SYMPTÔMES mentionnés dans ce texte avec leurs liens aux terrains.

Pour chaque symptôme, extrais:
{
  "id": "identifiant_snake_case",
  "nom": "Nom du symptôme",
  "description": "Description détaillée",
  "localisation": "général|digestif|cardiovasculaire|cutané|psychique|etc",
  "temporalite": "matin|soir|permanent|situationnel|etc",
  "terrain_suggere": "id_du_terrain",
  "poids": 0.8,
  "source": "page ou chapitre"
}

Retourne un JSON: { "symptomes": [...] }`;

const EXTRACTION_PLANTES_PROMPT = `Extrais TOUTES les PLANTES MÉDICINALES mentionnées dans ce texte.

Pour chaque plante, extrais:
{
  "id": "identifiant_snake_case",
  "nom_commun": "Nom commun",
  "nom_latin": "Nom latin",
  "parties_utilisees": ["feuilles", "racines", "bourgeons"],
  "actions": ["anti-inflammatoire", "adaptogène", "etc"],
  "terrains_traites": ["id_terrain_1", "id_terrain_2"],
  "axes_concernes": ["corticotrope", "thyreotrope"],
  "source": "page ou chapitre"
}

Retourne un JSON: { "plantes": [...] }`;

const EXTRACTION_INDEX_PROMPT = `Extrais TOUS les INDEX de la BIOLOGIE DES FONCTIONS (BdF) mentionnés.

Pour chaque index, extrais:
{
  "id": "idx_nom",
  "nom": "Nom complet de l'index",
  "formule": "Description de la formule ou ratio",
  "interpretation_bas": "Signification si valeur basse",
  "interpretation_haut": "Signification si valeur haute",
  "axe_evalue": "id_axe_concerné"
}

Retourne un JSON: { "indexBdF": [...] }`;

const EXTRACTION_EMONCTOIRES_PROMPT = `Extrais TOUS les ÉMONCTOIRES mentionnés dans ce texte.

Pour chaque émonctoire, extrais:
{
  "id": "identifiant_snake_case",
  "nom": "Nom de l'émonctoire",
  "fonction": "Fonction de drainage/détoxification",
  "axes_lies": ["corticotrope", "thyreotrope"]
}

Retourne un JSON: { "emonctoires": [...] }`;

// ============================================
// FONCTIONS D'EXTRACTION
// ============================================

async function extractFromChunk(
  chunk: string,
  prompt: string,
  chunkIndex: number,
  totalChunks: number
): Promise<any> {
  console.log(`  Extraction chunk ${chunkIndex + 1}/${totalChunks}...`);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: `${prompt}\n\n---TEXTE À ANALYSER---\n${chunk}` }
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content);
  } catch (error) {
    console.error(`  Erreur chunk ${chunkIndex + 1}:`, error);
    return null;
  }
}

function splitIntoChunks(text: string, maxTokens: number = 6000): string[] {
  // Approximation: 1 token ≈ 4 caractères en français
  const maxChars = maxTokens * 4;
  const chunks: string[] = [];

  // Diviser par sections (##, ###, etc.)
  const sections = text.split(/(?=^#{1,3}\s)/m);

  let currentChunk = '';
  for (const section of sections) {
    if ((currentChunk + section).length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // Si la section est trop grande, la diviser par paragraphes
      if (section.length > maxChars) {
        const paragraphs = section.split(/\n\n+/);
        for (const para of paragraphs) {
          if (para.length > maxChars) {
            // Diviser par phrases
            const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
            let subChunk = '';
            for (const sentence of sentences) {
              if ((subChunk + sentence).length > maxChars) {
                if (subChunk) chunks.push(subChunk);
                subChunk = sentence;
              } else {
                subChunk += sentence;
              }
            }
            if (subChunk) chunks.push(subChunk);
          } else {
            chunks.push(para);
          }
        }
        currentChunk = '';
      } else {
        currentChunk = section;
      }
    } else {
      currentChunk += section;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function extractEntities(
  volumeText: string,
  volumeName: string
): Promise<ExtractionResult> {
  console.log(`\n📖 Extraction du ${volumeName}...`);

  const chunks = splitIntoChunks(volumeText);
  console.log(`  ${chunks.length} chunks à traiter`);

  const result: ExtractionResult = {
    axes: [],
    terrains: [],
    symptomes: [],
    plantes: [],
    indexBdF: [],
    emonctoires: [],
    relations: [],
  };

  // Extraire les axes (généralement dans les premiers chapitres)
  console.log('\n  🔬 Extraction des AXES...');
  for (let i = 0; i < Math.min(chunks.length, 5); i++) {
    const extracted = await extractFromChunk(chunks[i], EXTRACTION_AXES_PROMPT, i, chunks.length);
    if (extracted?.axes) {
      result.axes.push(...extracted.axes);
    }
  }

  // Extraire les terrains
  console.log('\n  🎯 Extraction des TERRAINS...');
  for (let i = 0; i < chunks.length; i++) {
    const extracted = await extractFromChunk(chunks[i], EXTRACTION_TERRAINS_PROMPT, i, chunks.length);
    if (extracted?.terrains) {
      result.terrains.push(...extracted.terrains);
    }
    // Pause pour éviter rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  // Extraire les symptômes
  console.log('\n  🩺 Extraction des SYMPTÔMES...');
  for (let i = 0; i < chunks.length; i++) {
    const extracted = await extractFromChunk(chunks[i], EXTRACTION_SYMPTOMES_PROMPT, i, chunks.length);
    if (extracted?.symptomes) {
      result.symptomes.push(...extracted.symptomes);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // Extraire les plantes
  console.log('\n  🌿 Extraction des PLANTES...');
  for (let i = 0; i < chunks.length; i++) {
    const extracted = await extractFromChunk(chunks[i], EXTRACTION_PLANTES_PROMPT, i, chunks.length);
    if (extracted?.plantes) {
      result.plantes.push(...extracted.plantes);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // Extraire les index BdF
  console.log('\n  📊 Extraction des INDEX BdF...');
  for (let i = 0; i < chunks.length; i++) {
    const extracted = await extractFromChunk(chunks[i], EXTRACTION_INDEX_PROMPT, i, chunks.length);
    if (extracted?.indexBdF) {
      result.indexBdF.push(...extracted.indexBdF);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // Extraire les émonctoires
  console.log('\n  🚿 Extraction des ÉMONCTOIRES...');
  for (let i = 0; i < Math.min(chunks.length, 10); i++) {
    const extracted = await extractFromChunk(chunks[i], EXTRACTION_EMONCTOIRES_PROMPT, i, chunks.length);
    if (extracted?.emonctoires) {
      result.emonctoires.push(...extracted.emonctoires);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // Dédupliquer
  result.axes = deduplicateById(result.axes);
  result.terrains = deduplicateById(result.terrains);
  result.symptomes = deduplicateById(result.symptomes);
  result.plantes = deduplicateById(result.plantes);
  result.indexBdF = deduplicateById(result.indexBdF);
  result.emonctoires = deduplicateById(result.emonctoires);

  // Générer les relations
  result.relations = generateRelations(result);

  return result;
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.set(item.id, item);
    }
  }
  return Array.from(seen.values());
}

function generateRelations(result: ExtractionResult): ExtractedRelation[] {
  const relations: ExtractedRelation[] = [];

  // Terrain -> Axe (IMPLIQUE)
  for (const terrain of result.terrains) {
    if (terrain.axe_lie) {
      relations.push({
        type: 'IMPLIQUE',
        from: terrain.id,
        to: terrain.axe_lie,
        poids: 1.0,
        source: 'Volume 1-2',
      });
    }
  }

  // Symptome -> Terrain (SUGGERE)
  for (const symptome of result.symptomes) {
    if (symptome.terrain_suggere) {
      relations.push({
        type: 'SUGGERE',
        from: symptome.id,
        to: symptome.terrain_suggere,
        poids: symptome.poids || 0.8,
        source: symptome.source,
      });
    }
  }

  // Plante -> Terrain (TRAITE)
  for (const plante of result.plantes) {
    for (const terrainId of plante.terrains_traites || []) {
      relations.push({
        type: 'TRAITE',
        from: plante.id,
        to: terrainId,
        poids: 0.85,
        source: plante.source,
      });
    }
  }

  // Index -> Axe (EVALUE)
  for (const index of result.indexBdF) {
    if (index.axe_evalue) {
      relations.push({
        type: 'EVALUE',
        from: index.id,
        to: index.axe_evalue,
        poids: 1.0,
        source: 'BdF',
      });
    }
  }

  return relations;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('🧬 EXTRACTION DU GRAPHE ENDOBIOGÉNIQUE');
  console.log('='.repeat(60));

  const docsDir = path.join(process.cwd(), 'docs');
  const outputDir = path.join(process.cwd(), 'outputs');

  // Créer le dossier outputs s'il n'existe pas
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const volumes = [
    'Endobiogenie_Volume1_OPTIMISE.md',
    'Endobiogenie_Volume2_OPTIMISE.md',
    'Endobiogenie_Volume3_PROPRE.md',
    'Endobiogenie_Volume4_PROPRE.md',
  ];

  const allResults: ExtractionResult = {
    axes: [],
    terrains: [],
    symptomes: [],
    plantes: [],
    indexBdF: [],
    emonctoires: [],
    relations: [],
  };

  for (const volumeFile of volumes) {
    const volumePath = path.join(docsDir, volumeFile);

    if (!fs.existsSync(volumePath)) {
      console.log(`⚠️ ${volumeFile} non trouvé, ignoré.`);
      continue;
    }

    const volumeText = fs.readFileSync(volumePath, 'utf-8');
    const volumeName = volumeFile.replace('.md', '');

    const result = await extractEntities(volumeText, volumeName);

    // Fusionner les résultats
    allResults.axes.push(...result.axes);
    allResults.terrains.push(...result.terrains);
    allResults.symptomes.push(...result.symptomes);
    allResults.plantes.push(...result.plantes);
    allResults.indexBdF.push(...result.indexBdF);
    allResults.emonctoires.push(...result.emonctoires);
    allResults.relations.push(...result.relations);

    // Sauvegarder le résultat intermédiaire
    const outputPath = path.join(outputDir, `${volumeName}_extracted.json`);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n✅ Résultat sauvegardé: ${outputPath}`);
  }

  // Dédupliquer le résultat final
  allResults.axes = deduplicateById(allResults.axes);
  allResults.terrains = deduplicateById(allResults.terrains);
  allResults.symptomes = deduplicateById(allResults.symptomes);
  allResults.plantes = deduplicateById(allResults.plantes);
  allResults.indexBdF = deduplicateById(allResults.indexBdF);
  allResults.emonctoires = deduplicateById(allResults.emonctoires);

  // Sauvegarder le résultat final
  const finalOutputPath = path.join(outputDir, 'endobiogenie_graph_complete.json');
  fs.writeFileSync(finalOutputPath, JSON.stringify(allResults, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE L\'EXTRACTION');
  console.log('='.repeat(60));
  console.log(`  Axes:        ${allResults.axes.length}`);
  console.log(`  Terrains:    ${allResults.terrains.length}`);
  console.log(`  Symptômes:   ${allResults.symptomes.length}`);
  console.log(`  Plantes:     ${allResults.plantes.length}`);
  console.log(`  Index BdF:   ${allResults.indexBdF.length}`);
  console.log(`  Émonctoires: ${allResults.emonctoires.length}`);
  console.log(`  Relations:   ${allResults.relations.length}`);
  console.log('='.repeat(60));
  console.log(`\n✅ Graphe complet sauvegardé: ${finalOutputPath}`);
  console.log('\n🔜 Prochaine étape: npx tsx scripts/inject-falkordb.ts');
}

main().catch(console.error);
