/**
 * FalkorDB Client pour Next.js
 * ============================
 * Utilise directement le package redis pour éviter les problèmes de BigInt
 * avec la librairie falkordb native dans l'environnement Next.js
 */

import { createClient, RedisClientType } from 'redis';

// Nom du graphe
const GRAPH_NAME = 'endobiogenie';

let redisClient: RedisClientType | null = null;

/**
 * Récupère la configuration au runtime
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
 * Connexion singleton à Redis/FalkorDB
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    const config = getConfig();

    const url = config.password
      ? `redis://${config.username}:${config.password}@${config.host}:${config.port}`
      : `redis://${config.host}:${config.port}`;

    console.log('[FalkorDB-NextJS] Connexion à', config.host, ':', config.port);

    redisClient = createClient({ url }) as RedisClientType;

    redisClient.on('error', (err) => {
      console.error('[FalkorDB-NextJS] Erreur Redis:', err);
    });

    await redisClient.connect();
    console.log('[FalkorDB-NextJS] Connecté!');
  }

  return redisClient;
}

/**
 * Exécuter une requête Cypher via GRAPH.QUERY
 */
export async function graphQuery(cypher: string): Promise<any[]> {
  const client = await getRedisClient();

  try {
    // FalkorDB utilise GRAPH.QUERY
    const result = await client.sendCommand(['GRAPH.QUERY', GRAPH_NAME, cypher]);
    return parseGraphResult(result);
  } catch (error) {
    console.error('[FalkorDB-NextJS] Erreur requête:', error);
    throw error;
  }
}

/**
 * Parser le résultat d'une requête GRAPH.QUERY
 * Le format est: [[headers], [row1], [row2], ...] avec metadata à la fin
 */
function parseGraphResult(result: any): any[] {
  if (!result || !Array.isArray(result)) {
    return [];
  }

  // Structure typique: [headers, data_rows, metadata]
  // ou juste [metadata] si pas de résultats

  if (result.length === 0) {
    return [];
  }

  // Si c'est juste des métadonnées (ex: "Nodes created: 1")
  if (result.length === 1 && Array.isArray(result[0]) && typeof result[0][0] === 'string') {
    return [];
  }

  // Si on a des headers et des données
  if (result.length >= 2 && Array.isArray(result[0]) && Array.isArray(result[1])) {
    const headers = result[0];
    const dataRows = result.slice(1, -1); // Tout sauf le premier (headers) et dernier (metadata)

    // Si le dernier élément ressemble à des métadonnées, on l'exclut
    const lastItem = result[result.length - 1];
    const isLastMetadata = Array.isArray(lastItem) &&
      lastItem.some((item: any) => typeof item === 'string' && item.includes(':'));

    const rows = isLastMetadata ? result.slice(1, -1) : result.slice(1);

    return rows.map((row: any[]) => {
      const obj: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = parseNodeOrValue(row[index]);
      });
      return obj;
    });
  }

  return [];
}

/**
 * Parser un nœud ou une valeur du graphe
 */
function parseNodeOrValue(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }

  // Si c'est un tableau (nœud avec propriétés)
  if (Array.isArray(value)) {
    // Format nœud: [[id, labels, properties]]
    if (value.length === 3 && Array.isArray(value[1]) && Array.isArray(value[2])) {
      const properties: Record<string, any> = {};
      const props = value[2];
      for (let i = 0; i < props.length; i += 2) {
        if (props[i + 1] !== undefined) {
          properties[props[i]] = props[i + 1];
        }
      }
      return {
        _id: value[0],
        _labels: value[1],
        ...properties
      };
    }
    // Sinon retourner tel quel
    return value;
  }

  return value;
}

/**
 * Fermer la connexion
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('[FalkorDB-NextJS] Connexion fermée');
  }
}

export { GRAPH_NAME };
