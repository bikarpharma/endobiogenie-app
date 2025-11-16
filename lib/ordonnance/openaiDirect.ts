// ========================================
// HELPER API OPENAI DIRECTE
// ========================================
// Appels directs à l'API OpenAI pour contrôle fin de température et seed

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Appel API OpenAI directe avec contrôle de température
 * Utilisé pour synthèses et post-traitement où on veut cohérence maximale
 */
export async function callOpenAIDirect(
  systemPrompt: string,
  userPrompt: string,
  options: {
    temperature?: number;
    seed?: number;
    model?: string;
    maxTokens?: number;
    responseFormat?: "text" | "json_object";
  } = {}
): Promise<string> {
  const {
    temperature = 0.3, // Température basse par défaut pour cohérence
    seed,
    model = "gpt-4o-mini",
    maxTokens = 2000,
    responseFormat = "text",
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      seed,
      max_tokens: maxTokens,
      response_format: responseFormat === "json_object" ? { type: "json_object" } : undefined,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("❌ Erreur API OpenAI directe:", error);
    throw error;
  }
}

/**
 * Générer une synthèse clinique cohérente et reproductible
 */
export async function generateClinicalSynthesis(
  axes: Array<{ axe: string; niveau: string; score: number; justification: string }>,
  patientContext: { age: number; sexe: "M" | "F"; symptomes: string[] },
  recommendations: Array<{ substance: string; axeCible: string; mecanisme: string }>
): Promise<string> {
  const systemPrompt = `Tu es un expert en endobiogénie. Génère une synthèse clinique concise et précise basée sur les axes perturbés et les recommandations.

RÈGLES:
1. Style professionnel et concis (2-3 phrases maximum)
2. Mentionner les axes principaux et leur orientation
3. Justifier brièvement la stratégie thérapeutique
4. Utiliser le vocabulaire endobiogénique approprié`;

  const userPrompt = `PATIENT: ${patientContext.sexe}, ${patientContext.age} ans
${patientContext.symptomes.length > 0 ? `Symptômes: ${patientContext.symptomes.join(", ")}\n` : ""}
AXES PERTURBÉS:
${axes.map(a => `- ${a.axe} (${a.niveau}): score ${a.score}/10 - ${a.justification}`).join("\n")}

STRATÉGIE THÉRAPEUTIQUE:
${recommendations.slice(0, 4).map(r => `- ${r.substance}: ${r.axeCible}`).join("\n")}

Génère une synthèse clinique professionnelle qui explique le terrain fonctionnel et la logique thérapeutique.`;

  return callOpenAIDirect(systemPrompt, userPrompt, {
    temperature: 0.2, // Très faible pour cohérence maximale
    maxTokens: 300,
  });
}

/**
 * Normaliser et améliorer les recommandations brutes avec cohérence
 */
export async function normalizeRecommendations(
  rawRecommendations: string,
  axes: Array<{ axe: string; niveau: string }>,
  patientSexe: "M" | "F"
): Promise<string> {
  const systemPrompt = `Tu es un expert qui normalise les recommandations thérapeutiques en endobiogénie.

TÂCHE: Extraire et structurer les recommandations en JSON valide.

RÈGLES STRICTES:
1. Format JSON array: [{ "substance": "...", "forme": "...", "posologie": "...", "duree": "...", "axeCible": "...", "mecanisme": "..." }]
2. IMPÉRATIF: Respecter le sexe du patient (${patientSexe})
   - Si HOMME: éliminer toute substance œstrogénique ou action cycle menstruel
   - Si FEMME: vérifier pertinence hormonale
3. Vérifier cohérence posologies (standard endobiogénique)
4. Maximum 4 recommandations les plus pertinentes
5. Retourner UNIQUEMENT le JSON, rien d'autre`;

  const userPrompt = `AXES PERTURBÉS: ${axes.map(a => `${a.axe} (${a.niveau})`).join(", ")}
PATIENT: ${patientSexe}

RECOMMANDATIONS BRUTES À NORMALISER:
${rawRecommendations}

Retourne le JSON normalisé.`;

  return callOpenAIDirect(systemPrompt, userPrompt, {
    temperature: 0.1, // Très faible pour cohérence maximale
    responseFormat: "json_object",
    maxTokens: 1500,
  });
}
