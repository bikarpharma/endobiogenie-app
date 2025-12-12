// ========================================
// API CHAT FALKOR - VERSION NEXT.JS COMPATIBLE
// ========================================
// 📖 Architecture :
// - Redis client direct pour FalkorDB (évite les problèmes BigInt)
// - GPT-4 Vision pour analyse d'images cliniques
// - Visualisations (charts, arbres de décision)
// - RAG VectorStore en backup

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { removeAnnotations } from "@/lib/utils/removeAnnotations";
import { auth } from "@/lib/auth";
import { VECTORSTORES } from "@/lib/ordonnance/constants";
import { graphQuery, getRedisClient } from "@/lib/falkordb/client-nextjs";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Modèles
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1";
const VISION_MODEL = "gpt-4o";

// ============================================================
// SYSTEM PROMPT AVEC FALKORDB
// ============================================================
const SYSTEM_PROMPT_FALKOR = `Tu es **EndoBot**, un expert senior en médecine intégrative spécialisé en **Endobiogénie** (approche Lapraz & Hedayat).

## TON IDENTITÉ
Tu es un médecin-chercheur avec 30 ans d'expérience en :
- Théorie de l'Endobiogénie et Bilan de Fonctionnement (BdF)
- Phytothérapie clinique intégrative
- Gemmothérapie (médecine des bourgeons)
- Aromathérapie scientifique
- Physiologie neuro-endocrinienne

## ACCÈS AU GRAPHE DE CONNAISSANCES
Tu as accès à un GRAPHE DE CONNAISSANCES FalkorDB qui contient :
- Les 4 AXES endocriniens (Corticotrope, Thyréotrope, Gonadotrope, Somatotrope)
- Les TERRAINS pathologiques (hypocorticisme, hyperthyroïdie, etc.)
- Les SYMPTÔMES et leurs liens aux terrains
- Les PLANTES et leurs indications par terrain
- Les INDEX BdF et leur interprétation

Quand tu reçois des données du graphe, UTILISE-LES EN PRIORITÉ.

## RÈGLES DE RÉPONSE

### 1. PRIORISE LE GRAPHE FALKORDB
- Les données du graphe sont VALIDÉES par des experts
- Utilise-les comme base de ta réponse
- Enrichis avec tes connaissances si nécessaire

### 2. TOUJOURS L'ANGLE ENDOBIOGÉNIQUE
- Relie aux AXES neuro-endocriniens
- Mentionne les INDEX BdF pertinents
- Explique le lien avec le TERRAIN
- Pense DRAINAGE et ÉMONCTOIRES

### 3. STYLE DE RÉPONSE
- PÉDAGOGIQUE : explique comme à un confrère curieux
- PRÉCIS : donne des posologies, des mécanismes
- PRATIQUE : orienté clinique
- STRUCTURÉ : utilise le markdown

### 4. VISUALISATIONS
Quand c'est pertinent, génère des graphiques avec ce format :

\`\`\`chart
{
  "type": "radar|bar|line|pie",
  "title": "Titre du graphique",
  "data": {
    "labels": ["Label1", "Label2"],
    "values": [50, 80]
  }
}
\`\`\`

## ANALYSE D'IMAGES CLINIQUES
Si l'utilisateur envoie une image (photo de peau, visage, langue, etc.) :
1. Décris ce que tu observes objectivement
2. Relie les observations aux AXES endocriniens
3. Suggère des hypothèses de TERRAIN
4. Propose des questions complémentaires pour affiner
5. Suggère des plantes SI tu as des données du graphe

Tu es un EXPERT avec un cerveau ET un graphe de connaissances validé.`;

// ============================================================
// EXTRACTION INTELLIGENTE VIA GPT (mini)
// ============================================================

interface ExtractedEntities {
  symptomes: string[];
  terrains: string[];
  axes: string[];
  plantes: string[];
  concepts: string[];
}

/**
 * Utilise GPT pour extraire les entités médicales de la question
 */
async function extractEntitiesWithGPT(message: string): Promise<ExtractedEntities> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modèle rapide et économique
      messages: [
        {
          role: "system",
          content: `Tu es un extracteur d'entités médicales spécialisé en endobiogénie.
Analyse la question et extrais les entités pertinentes en JSON.

Catégories à extraire:
- symptomes: symptômes mentionnés (fatigue, insomnie, douleur, etc.)
- terrains: terrains pathologiques (hypercorticisme, hypothyroïdie, etc.)
- axes: axes endocriniens (corticotrope, thyréotrope, gonadotrope, somatotrope)
- plantes: plantes médicinales mentionnées
- concepts: autres concepts médicaux pertinents (cortisol, TSH, drainage, émonctoire, etc.)

Réponds UNIQUEMENT avec un JSON valide, sans markdown.
Exemple: {"symptomes":["fatigue","stress"],"terrains":["hypercorticisme"],"axes":["corticotrope"],"plantes":[],"concepts":["cortisol"]}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "{}";

    // Parser le JSON
    try {
      const parsed = JSON.parse(content);
      return {
        symptomes: parsed.symptomes || [],
        terrains: parsed.terrains || [],
        axes: parsed.axes || [],
        plantes: parsed.plantes || [],
        concepts: parsed.concepts || [],
      };
    } catch {
      console.log('[GPT Extractor] Erreur parsing JSON:', content);
      return { symptomes: [], terrains: [], axes: [], plantes: [], concepts: [] };
    }
  } catch (error) {
    console.error('[GPT Extractor] Erreur:', error);
    return { symptomes: [], terrains: [], axes: [], plantes: [], concepts: [] };
  }
}

// ============================================================
// REQUÊTES FALKORDB VIA REDIS DIRECT
// ============================================================

/**
 * Recherche les terrains par symptômes OU par nom direct
 */
async function findTerrains(entities: ExtractedEntities): Promise<any[]> {
  try {
    const conditions: string[] = [];

    // Recherche par symptômes
    if (entities.symptomes.length > 0) {
      const symptomeTerms = entities.symptomes.map(s => `toLower(s.nom) CONTAINS toLower('${s}')`).join(' OR ');
      conditions.push(`((${symptomeTerms}) AND (s)-[:SUGGERE]->(t))`);
    }

    // Recherche directe par nom de terrain
    if (entities.terrains.length > 0) {
      const terrainTerms = entities.terrains.map(t => `toLower(t.nom) CONTAINS toLower('${t}')`).join(' OR ');
      conditions.push(`(${terrainTerms})`);
    }

    // Recherche par concepts liés
    if (entities.concepts.length > 0) {
      const conceptTerms = entities.concepts.map(c => `toLower(t.description) CONTAINS toLower('${c}')`).join(' OR ');
      conditions.push(`(${conceptTerms})`);
    }

    if (conditions.length === 0) return [];

    const cypher = `
      MATCH (t:Terrain)
      OPTIONAL MATCH (s:Symptome)-[:SUGGERE]->(t)
      WHERE ${conditions.join(' OR ')}
      RETURN DISTINCT t.id as id, t.nom as terrain_nom, t.description as description, t.type as type
      LIMIT 8
    `;

    console.log('[FalkorDB] Requête terrains:', cypher);
    return await graphQuery(cypher);
  } catch (error) {
    console.error('[FalkorDB] Erreur recherche terrains:', error);
    return [];
  }
}

/**
 * Recherche les plantes par terrain OU par nom direct
 */
async function findPlantes(entities: ExtractedEntities, terrainIds: string[]): Promise<any[]> {
  try {
    const conditions: string[] = [];

    // Recherche par terrains trouvés
    if (terrainIds.length > 0) {
      const terrainTerms = terrainIds.map(t => `t.id = '${t}'`).join(' OR ');
      conditions.push(`((${terrainTerms}) AND (p)-[:TRAITE]->(t))`);
    }

    // Recherche directe par nom de plante
    if (entities.plantes.length > 0) {
      const planteTerms = entities.plantes.map(p => `toLower(p.nom_commun) CONTAINS toLower('${p}')`).join(' OR ');
      conditions.push(`(${planteTerms})`);
    }

    if (conditions.length === 0) return [];

    const cypher = `
      MATCH (p:Plante)
      OPTIONAL MATCH (p)-[:TRAITE]->(t:Terrain)
      WHERE ${conditions.join(' OR ')}
      RETURN DISTINCT p.nom_commun as nom_commun, p.nom_latin as nom_latin, p.actions as actions
      LIMIT 10
    `;

    return await graphQuery(cypher);
  } catch (error) {
    console.error('[FalkorDB] Erreur recherche plantes:', error);
    return [];
  }
}

/**
 * Recherche les axes par terrain OU par nom direct
 */
async function findAxes(entities: ExtractedEntities, terrainIds: string[]): Promise<any[]> {
  try {
    const conditions: string[] = [];

    // Recherche par terrains trouvés
    if (terrainIds.length > 0) {
      const terrainTerms = terrainIds.map(t => `t.id = '${t}'`).join(' OR ');
      conditions.push(`((${terrainTerms}) AND (t)-[:IMPLIQUE]->(a))`);
    }

    // Recherche directe par nom d'axe
    if (entities.axes.length > 0) {
      const axeTerms = entities.axes.map(ax => `toLower(a.nom) CONTAINS toLower('${ax}')`).join(' OR ');
      conditions.push(`(${axeTerms})`);
    }

    if (conditions.length === 0) return [];

    const cypher = `
      MATCH (a:Axe)
      OPTIONAL MATCH (t:Terrain)-[:IMPLIQUE]->(a)
      WHERE ${conditions.join(' OR ')}
      RETURN DISTINCT a.nom as axe_nom, a.description as description, a.hormones as hormones
      LIMIT 4
    `;

    return await graphQuery(cypher);
  } catch (error) {
    console.error('[FalkorDB] Erreur recherche axes:', error);
    return [];
  }
}

/**
 * Recherche les index BdF pertinents
 */
async function findIndexBdF(entities: ExtractedEntities): Promise<any[]> {
  try {
    const allTerms = [...entities.concepts, ...entities.axes, ...entities.terrains];
    if (allTerms.length === 0) return [];

    const searchTerms = allTerms.map(t => `toLower(i.nom) CONTAINS toLower('${t}') OR toLower(i.interpretation_bas) CONTAINS toLower('${t}') OR toLower(i.interpretation_haut) CONTAINS toLower('${t}')`).join(' OR ');

    const cypher = `
      MATCH (i:Index_BdF)
      WHERE ${searchTerms}
      RETURN i.nom as nom, i.formule as formule, i.interpretation_bas as interpretation_bas, i.interpretation_haut as interpretation_haut
      LIMIT 5
    `;

    return await graphQuery(cypher);
  } catch (error) {
    console.error('[FalkorDB] Erreur recherche index:', error);
    return [];
  }
}

/**
 * Recherche dans FalkorDB avec extraction intelligente via GPT
 */
async function searchFalkorDB(message: string): Promise<string | null> {
  try {
    // Vérifier la connexion
    await getRedisClient();
    console.log('[FalkorDB] Connexion OK');

    // 1️⃣ EXTRACTION INTELLIGENTE via GPT-4o-mini
    console.log('[FalkorDB] Extraction des entités via GPT...');
    const entities = await extractEntitiesWithGPT(message);

    console.log('[FalkorDB] Entités extraites:', JSON.stringify(entities, null, 2));

    // Vérifier si on a des entités à chercher
    const hasEntities =
      entities.symptomes.length > 0 ||
      entities.terrains.length > 0 ||
      entities.axes.length > 0 ||
      entities.plantes.length > 0 ||
      entities.concepts.length > 0;

    if (!hasEntities) {
      console.log('[FalkorDB] Aucune entité médicale détectée');
      return null;
    }

    // 2️⃣ RECHERCHE DANS LE GRAPHE

    // Rechercher les terrains (basé sur symptômes, terrains directs, concepts)
    const terrains = await findTerrains(entities);
    console.log(`[FalkorDB] ${terrains.length} terrain(s) trouvé(s)`);

    // Extraire les IDs des terrains pour les recherches liées
    const terrainIds = terrains.map(t => t.id).filter(Boolean);

    // Rechercher en parallèle: plantes, axes, et index BdF
    const [plantes, axes, indexBdF] = await Promise.all([
      findPlantes(entities, terrainIds),
      findAxes(entities, terrainIds),
      findIndexBdF(entities),
    ]);

    console.log(`[FalkorDB] ${plantes.length} plante(s), ${axes.length} axe(s), ${indexBdF.length} index trouvé(s)`);

    // 3️⃣ CONSTRUIRE LE CONTEXTE
    const hasResults = terrains.length > 0 || plantes.length > 0 || axes.length > 0 || indexBdF.length > 0;

    if (!hasResults) {
      console.log('[FalkorDB] Aucun résultat dans le graphe');
      return null;
    }

    let context = '## 🎯 DONNÉES DU GRAPHE FALKORDB (VALIDÉES)\n\n';
    context += `> Entités détectées: ${[...entities.symptomes, ...entities.terrains, ...entities.concepts].slice(0, 5).join(', ')}\n\n`;

    if (axes.length > 0) {
      context += '### 🔬 Axes endocriniens impliqués\n';
      for (const axe of axes) {
        context += `- **${axe.axe_nom}**\n`;
        if (axe.description) {
          context += `  ${axe.description}\n`;
        }
        if (axe.hormones) {
          const hormones = Array.isArray(axe.hormones) ? axe.hormones.join(', ') : axe.hormones;
          context += `  Hormones: ${hormones}\n`;
        }
      }
      context += '\n';
    }

    if (terrains.length > 0) {
      context += '### 🎯 Terrains pathologiques identifiés\n';
      for (const terrain of terrains) {
        context += `- **${terrain.terrain_nom}** (${terrain.type || 'N/A'})\n`;
        if (terrain.description) {
          context += `  ${terrain.description}\n`;
        }
      }
      context += '\n';
    }

    if (indexBdF.length > 0) {
      context += '### 📊 Index BdF pertinents\n';
      for (const idx of indexBdF) {
        context += `- **${idx.nom}**\n`;
        if (idx.formule) context += `  Formule: ${idx.formule}\n`;
        if (idx.interpretation_bas) context += `  ↓ Bas: ${idx.interpretation_bas}\n`;
        if (idx.interpretation_haut) context += `  ↑ Haut: ${idx.interpretation_haut}\n`;
      }
      context += '\n';
    }

    if (plantes.length > 0) {
      context += '### 🌿 Plantes thérapeutiques suggérées\n';
      for (const plante of plantes) {
        context += `- **${plante.nom_commun}**`;
        if (plante.nom_latin) context += ` (_${plante.nom_latin}_)`;
        context += '\n';
        if (plante.actions) {
          const actions = Array.isArray(plante.actions) ? plante.actions.join(', ') : plante.actions;
          context += `  Actions: ${actions}\n`;
        }
      }
      context += '\n';
    }

    console.log('[FalkorDB] ✅ Contexte généré avec succès');
    return context;

  } catch (error) {
    console.error('[FalkorDB] Erreur:', error);
    return null;
  }
}

// ============================================================
// BACKUP: RECHERCHE VECTORSTORE
// ============================================================
async function searchVectorStore(
  vectorStoreId: string,
  query: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.openai.com/v1/vector_stores/${vectorStoreId}/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({
          query,
          max_num_results: 3,
        }),
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const texts: string[] = [];

    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.content && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c.text) texts.push(c.text);
          }
        }
      }
    }

    return texts;
  } catch {
    return [];
  }
}

async function searchRAGBackup(query: string): Promise<string | null> {
  try {
    const [endoResults, phytoResults, gemmoResults, aromaResults] =
      await Promise.all([
        searchVectorStore(VECTORSTORES.endobiogenie, query),
        searchVectorStore(VECTORSTORES.phyto, query),
        searchVectorStore(VECTORSTORES.gemmo, query),
        searchVectorStore(VECTORSTORES.aroma, query),
      ]);

    const allTexts = [...endoResults, ...phytoResults, ...gemmoResults, ...aromaResults];

    if (allTexts.length === 0) return null;

    return '## CONTEXTE RAG (Backup)\n\n' + allTexts.join('\n\n---\n\n');
  } catch {
    return null;
  }
}

// ============================================================
// TYPES
// ============================================================
interface ChatRequestBody {
  message: string;
  chatId?: string;
  image?: string;
  imageType?: string;
}

// ============================================================
// ENDPOINT POST
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body: ChatRequestBody = await req.json();
    const { message, chatId, image, imageType } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    const hasImage = !!image && !!imageType;

    // 1️⃣ Créer ou récupérer le Chat
    let currentChatId = chatId as string | null;
    let chatRecord: { id: string; title: string; userId: string } | null = null;
    let isNewChat = false;

    if (currentChatId) {
      const existingChat = await prisma.chat.findUnique({
        where: { id: currentChatId },
        select: { id: true, userId: true, title: true },
      });

      if (!existingChat || existingChat.userId !== session.user.id) {
        return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
      }
      chatRecord = existingChat;
    } else {
      const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
      const newChat = await prisma.chat.create({
        data: { userId: session.user.id, title },
        select: { id: true, title: true, userId: true },
      });
      currentChatId = newChat.id;
      chatRecord = newChat;
      isNewChat = true;
    }

    // 2️⃣ Sauvegarder le message utilisateur
    await prisma.message.create({
      data: { chatId: currentChatId, role: "user", content: message },
    });

    // 3️⃣ Récupérer l'historique
    const history = await prisma.message.findMany({
      where: { chatId: currentChatId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    // 4️⃣ PRIORITÉ: Chercher dans FalkorDB
    let falkorContext = await searchFalkorDB(message);
    let ragContext: string | null = null;
    let sourceUsed: 'falkordb' | 'rag' | 'gpt' = 'gpt';

    if (falkorContext) {
      sourceUsed = 'falkordb';
      console.log('✅ Utilisation de FalkorDB');
    } else {
      // 5️⃣ BACKUP: Chercher dans VectorStore
      ragContext = await searchRAGBackup(message);
      if (ragContext) {
        sourceUsed = 'rag';
        console.log('✅ Fallback sur RAG VectorStore');
      } else {
        console.log('ℹ️ Utilisation des connaissances GPT');
      }
    }

    // 6️⃣ Construire le prompt enrichi
    let enrichedSystemPrompt = SYSTEM_PROMPT_FALKOR;
    if (falkorContext) {
      enrichedSystemPrompt += `\n\n${falkorContext}`;
    } else if (ragContext) {
      enrichedSystemPrompt += `\n\n${ragContext}`;
    }

    // 7️⃣ Construire les messages
    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: enrichedSystemPrompt },
      ...history.slice(0, -1).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    // 8️⃣ Ajouter le dernier message (avec image si présente)
    if (hasImage) {
      chatMessages.push({
        role: "user",
        content: [
          { type: "text", text: message },
          {
            type: "image_url",
            image_url: {
              url: `data:${imageType};base64,${image}`,
              detail: "high",
            },
          },
        ],
      });
    } else {
      chatMessages.push({ role: "user", content: message });
    }

    // 9️⃣ Appeler le modèle
    const response = await openai.chat.completions.create({
      model: hasImage ? VISION_MODEL : MODEL,
      messages: chatMessages,
      temperature: 0.4,
      max_tokens: 4000,
    });

    // 🔟 Extraire la réponse
    let reply = response.choices[0]?.message?.content || "";

    if (!reply) {
      return NextResponse.json({ error: "Pas de réponse générée" }, { status: 500 });
    }

    reply = removeAnnotations(reply);

    // 1️⃣1️⃣ Sauvegarder la réponse
    await prisma.message.create({
      data: { chatId: currentChatId, role: "assistant", content: reply },
    });

    await prisma.chat.update({
      where: { id: currentChatId },
      data: { updatedAt: new Date() },
    });

    // 1️⃣2️⃣ Retourner avec info sur la source
    return NextResponse.json({
      reply,
      chatId: currentChatId,
      chatTitle: chatRecord?.title,
      created: isNewChat,
      source: sourceUsed, // falkordb, rag, ou gpt
    });

  } catch (e: any) {
    console.error("❌ Erreur API Chat Falkor:", e);
    return NextResponse.json({ error: e?.message ?? "Erreur serveur" }, { status: 500 });
  }
}
