// ========================================
// MODULE RAG - Recherche dans les 4 Vectorstores
// ========================================
// Utilise les vectorstores OpenAI via Agent SDK pour enrichir le raisonnement
// - endobiogenie: Théorie endobiogénique (Lapraz & Hedayat)
// - phyto: Phytothérapie clinique
// - gemmo: Gemmothérapie
// - aroma: Aromathérapie

import { VECTORSTORES } from "./constants";

// ========================================
// TYPES
// ========================================

export type VectorstoreType = "endobiogenie" | "phyto" | "gemmo" | "aroma";

export interface RAGContext {
  endobiogenie: string;
  phytotherapie: string;
  gemmotherapie: string;
  aromatherapie: string;
  summary: string;
}

export interface SearchQuery {
  terrain: string;
  axes: string[];
  drainage?: boolean;
  spasmophilie?: boolean;
  sexe: "M" | "F";
  symptomes?: string[];
}

// ========================================
// RECHERCHE AVEC AGENT SDK (FILE SEARCH)
// ========================================

/**
 * Recherche dans un vectorstore avec l'Agent SDK
 */
async function searchWithAgent(
  vectorstoreId: string,
  query: string,
  systemPrompt: string
): Promise<string> {
  try {
    const { Agent, fileSearchTool, Runner } = await import("@openai/agents");

    const fileSearch = fileSearchTool([vectorstoreId]);

    const agent = new Agent({
      name: "rag-search-agent",
      model: "gpt-4o-mini",
      instructions: systemPrompt,
      tools: [fileSearch],
    });

    const runner = new Runner();
    const result = await runner.run(agent, [
      { role: "user", content: [{ type: "input_text", text: query }] },
    ]);

    return result.finalOutput || "";
  } catch (error) {
    console.error(`❌ Erreur agent RAG:`, error);
    return "";
  }
}

// ========================================
// RECHERCHE MULTI-VECTORSTORES
// ========================================

/**
 * Recherche complète dans les 4 vectorstores
 */
export async function searchAllVectorstores(
  query: SearchQuery,
  scope: {
    planteMedicinale: boolean;
    gemmotherapie: boolean;
    aromatherapie: boolean;
  }
): Promise<RAGContext> {
  const startTime = Date.now();

  console.log("🔍 RAG: Démarrage recherche dans les vectorstores...");

  // Construire la requête de base
  const baseQuery = `
Patient ${query.sexe === "F" ? "femme" : "homme"}.
Terrain: ${query.terrain}
Axes perturbés: ${query.axes.join(", ")}
${query.drainage ? "Nécessite drainage hépatique/rénal." : ""}
${query.spasmophilie ? "Terrain spasmophile." : ""}
${query.symptomes?.length ? `Symptômes: ${query.symptomes.join(", ")}` : ""}
  `.trim();

  // Résultats
  const ragContext: RAGContext = {
    endobiogenie: "",
    phytotherapie: "",
    gemmotherapie: "",
    aromatherapie: "",
    summary: "",
  };

  // Recherches en parallèle
  const searchPromises: Promise<void>[] = [];

  // 1. ENDOBIOGÉNIE (toujours)
  searchPromises.push(
    searchWithAgent(
      VECTORSTORES.endobiogenie,
      `${baseQuery}

Quelles sont les recommandations endobiogéniques pour ce terrain ?
Focus sur:
- Hiérarchie thérapeutique (drainage → axes)
- Plantes spécifiques pour chaque axe perturbé
- Mécanismes d'action endobiogéniques
- Posologies recommandées
`,
      `Tu es un expert en endobiogénie (méthode Lapraz & Hedayat).
Recherche dans la documentation les recommandations thérapeutiques.
Réponds de manière structurée avec les plantes recommandées et leur mécanisme d'action.
IMPORTANT: Cite les sources (volume, page) si disponibles.
Format: Liste des plantes avec nom latin, indication, posologie.`
    ).then(result => { ragContext.endobiogenie = result; })
  );

  // 2. PHYTOTHÉRAPIE (si scope)
  if (scope.planteMedicinale) {
    searchPromises.push(
      searchWithAgent(
        VECTORSTORES.phyto,
        `${baseQuery}

Quelles plantes médicinales sont indiquées ?
Pour chaque plante, préciser:
- Nom latin et français
- Forme galénique optimale (EPS, TM, gélules)
- Posologie recommandée
- Mécanisme d'action
- Contre-indications
`,
        `Tu es un expert en phytothérapie clinique.
Recherche les plantes les plus adaptées au terrain décrit.
IMPORTANT: Donne des posologies PRÉCISES (ex: 5ml matin, 3 gélules/jour).
Liste les contre-indications principales.`
      ).then(result => { ragContext.phytotherapie = result; })
    );
  }

  // 3. GEMMOTHÉRAPIE (si scope)
  if (scope.gemmotherapie) {
    searchPromises.push(
      searchWithAgent(
        VECTORSTORES.gemmo,
        `${baseQuery}

Quels macérats de bourgeons (gemmothérapie) sont indiqués ?
Pour chaque bourgeon:
- Nom latin et français
- Tropisme principal
- Posologie (gouttes/jour)
- Mécanisme d'action spécifique
`,
        `Tu es un expert en gemmothérapie.
Recherche les bourgeons adaptés au terrain décrit.
Explique le tropisme de chaque bourgeon.
POSOLOGIES: Toujours en gouttes/jour (ex: 15 gouttes matin).`
      ).then(result => { ragContext.gemmotherapie = result; })
    );
  }

  // 4. AROMATHÉRAPIE (si scope)
  if (scope.aromatherapie) {
    searchPromises.push(
      searchWithAgent(
        VECTORSTORES.aroma,
        `${baseQuery}

Quelles huiles essentielles sont indiquées ?
Pour chaque HE:
- Nom latin et français
- Voie d'administration (cutanée, orale, diffusion)
- Posologie et dilution
- Précautions d'emploi
- Contre-indications absolues
`,
        `Tu es un expert en aromathérapie clinique.
Recherche les huiles essentielles adaptées.
SÉCURITÉ: Toujours mentionner précautions et CI.
Privilégier voies cutanée et olfactive.`
      ).then(result => { ragContext.aromatherapie = result; })
    );
  }

  // Exécuter toutes les recherches en parallèle
  await Promise.all(searchPromises);

  // Générer un résumé
  const parts: string[] = [];
  if (ragContext.endobiogenie) parts.push(`ENDOBIOGÉNIE: ${ragContext.endobiogenie.length} caractères`);
  if (ragContext.phytotherapie) parts.push(`PHYTO: ${ragContext.phytotherapie.length} caractères`);
  if (ragContext.gemmotherapie) parts.push(`GEMMO: ${ragContext.gemmotherapie.length} caractères`);
  if (ragContext.aromatherapie) parts.push(`AROMA: ${ragContext.aromatherapie.length} caractères`);
  ragContext.summary = parts.join(" | ");

  const elapsed = Date.now() - startTime;
  console.log(`✅ RAG: Recherche terminée en ${elapsed}ms - ${ragContext.summary}`);

  return ragContext;
}

// ========================================
// RECHERCHES CIBLÉES
// ========================================

/**
 * Recherche spécifique pour un axe perturbé
 */
export async function searchForAxis(
  axis: string,
  status: string,
  sexe: "M" | "F"
): Promise<string> {
  const query = `
Axe ${axis} en ${status} chez ${sexe === "F" ? "une femme" : "un homme"}.

Quelles sont les plantes recommandées pour réguler cet axe ?
Donner pour chaque plante:
- Nom latin
- Mécanisme d'action sur l'axe
- Posologie
- Durée de traitement
  `;

  return searchWithAgent(
    VECTORSTORES.endobiogenie,
    query,
    `Expert en endobiogénie. Recherche les plantes pour réguler l'axe ${axis}.`
  );
}

/**
 * Recherche spécifique pour le drainage
 */
export async function searchForDrainage(
  emonctoires: string[]
): Promise<string> {
  const query = `
Drainage des émonctoires: ${emonctoires.join(", ")}.

Quelles plantes et bourgeons utiliser pour drainer ?
Donner:
- Ordre de drainage (foie → rein → lymphe)
- Plantes pour chaque émonctoire avec posologie
- Durée du drainage
- Précautions
  `;

  return searchWithAgent(
    VECTORSTORES.endobiogenie,
    query,
    `Expert en drainage endobiogénique. Recherche le protocole de drainage adapté.`
  );
}

/**
 * Recherche spécifique pour la spasmophilie
 */
export async function searchForSpasmophilie(
  type: number,
  signes: string[]
): Promise<string> {
  const query = `
Spasmophilie type ${type}.
Signes: ${signes.join(", ")}.

Recommandations thérapeutiques:
- Plantes anti-spasmophiliques
- Supplémentation (Mg, Ca, Vit D)
- Conseils hygiéno-diététiques
  `;

  return searchWithAgent(
    VECTORSTORES.endobiogenie,
    query,
    `Expert en spasmophilie endobiogénique. Recherche le traitement adapté au type ${type}.`
  );
}
