/**
 * FalkorDB Client pour IntegrIA
 * ==============================
 * Connexion au graphe de connaissances endobiogénique
 */

import { FalkorDB, Graph } from 'falkordb';

// Nom du graphe
const GRAPH_NAME = 'endobiogenie';

let dbInstance: FalkorDB | null = null;
let graphInstance: Graph | null = null;

/**
 * Récupère la configuration au runtime (après chargement de .env)
 */
function getConfig() {
  return {
    host: process.env.FALKORDB_HOST || 'localhost',
    port: parseInt(process.env.FALKORDB_PORT || '6379'),
    username: process.env.FALKORDB_USERNAME || '',
    password: process.env.FALKORDB_PASSWORD || '',
  };
}

/**
 * Connexion singleton à FalkorDB
 */
export async function getDB(): Promise<FalkorDB> {
  if (!dbInstance) {
    const config = getConfig();
    console.log('[FalkorDB] Tentative de connexion à', config.host, ':', config.port);
    dbInstance = await FalkorDB.connect({
      username: config.username || undefined,
      password: config.password || undefined,
      socket: {
        host: config.host,
        port: config.port,
      }
    });
    console.log('[FalkorDB] Connecté à', config.host);
  }
  return dbInstance;
}

/**
 * Récupérer le graphe endobiogénie
 */
export async function getGraph(): Promise<Graph> {
  if (!graphInstance) {
    const db = await getDB();
    graphInstance = db.selectGraph(GRAPH_NAME);
    console.log('[FalkorDB] Graphe sélectionné:', GRAPH_NAME);
  }
  return graphInstance;
}

/**
 * Fermer la connexion
 */
export async function closeDB(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    graphInstance = null;
    console.log('[FalkorDB] Connexion fermée');
  }
}

/**
 * Exécuter une requête Cypher
 */
export async function query(cypher: string, params?: Record<string, any>) {
  const graph = await getGraph();
  return graph.query(cypher, { params });
}

export { GRAPH_NAME };
