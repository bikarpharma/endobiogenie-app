/**
 * ============================================================================
 * INTEGRIA - SERVER ACTIONS (API)
 * ============================================================================
 * 
 * Ce fichier contient les Server Actions Next.js 14+ qui orchestrent :
 * 1. L'appel à l'IA (OpenAI Assistant ou Chat Completion)
 * 2. La validation Zod (pare-feu)
 * 3. L'adaptation Tunisie (middleware)
 * 
 * PLACEMENT: /app/actions/prescription.ts
 * 
 * UTILISATION:
 * import { generatePrescription } from '@/app/actions/prescription';
 * const result = await generatePrescription(diagnosticData);
 * ============================================================================
 */

'use server';

import { openai, ASSISTANT_ID, MODEL_CONFIG, PRESCRIBER_SYSTEM_PROMPT } from '@/lib/openai';
import { validateAIResponse, DiagnosticInput, DiagnosticInputSchema } from '@/lib/validations';
import { adaptPrescriptionToTunisia, PrescriptionOutput } from '@/lib/utils/tunisianAdapter';
import { getKnowledgeBridgeContext } from '@/lib/knowledgeBridge';

// =============================================================================
// TYPES
// =============================================================================

export interface GenerationResult {
  success: boolean;
  data?: PrescriptionOutput;
  error?: string;
  debug?: {
    rawResponse?: string;
    validationErrors?: string[];
    duration?: number;
  };
}

// =============================================================================
// ACTION PRINCIPALE : Génération de Prescription
// =============================================================================

/**
 * Génère une prescription endobiogénique complète
 * 
 * FLUX:
 * 1. Validation de l'input (diagnostic)
 * 2. Appel IA (OpenAI)
 * 3. Validation de l'output (Zod)
 * 4. Adaptation Tunisie (Middleware)
 * 5. Retour du résultat sécurisé
 * 
 * @param diagnostic - Les données du diagnostic endobiogénique
 * @returns Prescription adaptée au contexte tunisien
 */
export async function generatePrescription(
  diagnostic: DiagnosticInput
): Promise<GenerationResult> {
  const startTime = Date.now();
  
  try {
    // =========================================
    // ÉTAPE 1: Validation de l'input
    // =========================================
    const inputValidation = DiagnosticInputSchema.safeParse(diagnostic);
    
    if (!inputValidation.success) {
      return {
        success: false,
        error: "Données de diagnostic invalides",
        debug: {
          validationErrors: inputValidation.error.errors.map(e => e.message),
        },
      };
    }

    // =========================================
    // ÉTAPE 2: Construction du prompt utilisateur
    // =========================================
    const userPrompt = buildUserPrompt(inputValidation.data);

    // =========================================
    // ÉTAPE 3: Appel à l'IA
    // =========================================
    let rawAIResponse: string;

// Après (force Chat Completion) :
// MODE CHAT COMPLETION (plus fiable)
rawAIResponse = await callChatCompletion(userPrompt);

    // =========================================
    // ÉTAPE 4: Parse du JSON
    // =========================================
    let parsedResponse: unknown;
    
    try {
      // Nettoyer la réponse (enlever les ```json si présents)
      const cleanedResponse = cleanJSONResponse(rawAIResponse);
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON:", parseError);
      return {
        success: false,
        error: "L'IA a généré une réponse non-JSON. Veuillez réessayer.",
        debug: {
          rawResponse: rawAIResponse.substring(0, 500),
        },
      };
    }

    // =========================================
    // ÉTAPE 5: Validation Zod (Pare-feu)
    // =========================================
    const validatedData = validateAIResponse(parsedResponse);

    // =========================================
    // ÉTAPE 6: Adaptation Tunisie (Middleware)
    // =========================================
    const tunisianPrescription = adaptPrescriptionToTunisia(validatedData);

    // =========================================
    // SUCCÈS !
    // =========================================
    return {
      success: true,
      data: tunisianPrescription,
      debug: {
        duration: Date.now() - startTime,
      },
    };

  } catch (error) {
    console.error("❌ Erreur génération prescription:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      debug: {
        duration: Date.now() - startTime,
      },
    };
  }
}

// =============================================================================
// FONCTIONS AUXILIAIRES
// =============================================================================

/**
 * Construit le prompt utilisateur à partir du diagnostic
 */
function buildUserPrompt(diagnostic: DiagnosticInput): string {
  let prompt = `CONTEXTE CLINIQUE:\n\n`;
  
  // Motif de consultation
  prompt += `📋 MOTIF DE CONSULTATION:\n${diagnostic.motif}\n\n`;
  
  // Terrain endobiogénique
  if (diagnostic.terrain) {
    prompt += `🧬 TERRAIN ENDOBIOGÉNIQUE:\n`;
    
    if (diagnostic.terrain.axes_desequilibres?.length) {
      prompt += `- Axes déséquilibrés: ${diagnostic.terrain.axes_desequilibres.join(', ')}\n`;
    }
    
    if (diagnostic.terrain.index_bdf) {
      prompt += `- Index BdF:\n`;
      for (const [key, value] of Object.entries(diagnostic.terrain.index_bdf)) {
        prompt += `  • ${key}: ${value}\n`;
      }
    }
    
    if (diagnostic.terrain.emonctoires?.length) {
      prompt += `- Émonctoires surchargés: ${diagnostic.terrain.emonctoires.join(', ')}\n`;
    }
    
    prompt += `\n`;
  }
  
  // Patient
  if (diagnostic.patient) {
    prompt += `👤 PATIENT:\n`;
    if (diagnostic.patient.age) prompt += `- Âge: ${diagnostic.patient.age} ans\n`;
    if (diagnostic.patient.sexe) prompt += `- Sexe: ${diagnostic.patient.sexe}\n`;
    if (diagnostic.patient.antecedents?.length) {
      prompt += `- Antécédents: ${diagnostic.patient.antecedents.join(', ')}\n`;
    }
    prompt += `\n`;
  }
  
  prompt += `---\nGénère la prescription en respectant le format JSON strict défini dans tes instructions.`;
  
  return prompt;
}

/**
 * Appel via OpenAI Assistant API
 * 
 * NOTE IMPORTANTE: Pour que l'Assistant ait accès au Knowledge Bridge,
 * vous devez l'ajouter dans le VectorStore de l'Assistant via OpenAI Platform:
 * 1. Aller sur https://platform.openai.com/assistants
 * 2. Sélectionner votre Assistant
 * 3. Dans "Files", uploader knowledge_bridge_tunisia_final.json
 * 4. Activer "File Search" dans les outils
 */
async function callAssistant(userPrompt: string): Promise<string> {
  // Créer un thread
  const thread = await openai.beta.threads.create();
  
  // Ajouter le message utilisateur
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: userPrompt,
  });
  
  // Lancer le run
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: ASSISTANT_ID,
  });
  
  // Attendre la complétion (polling) - intervalle 3s pour réduire les coûts API
  // OpenAI SDK v6+: runs.retrieve(runId, { thread_id })
  const POLLING_INTERVAL_MS = 3000;
  let runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });

  const maxWaitTime = 120000; // 2 minutes max
  const startTime = Date.now();
  let pollCount = 0;

  while (runStatus.status !== 'completed') {
    if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
      throw new Error(`Assistant run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
    }

    if (Date.now() - startTime > maxWaitTime) {
      throw new Error('Timeout: L\'IA met trop de temps à répondre');
    }

    // Attendre 3 secondes avant de vérifier à nouveau (réduit coûts API)
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    // OpenAI SDK v6+: runs.retrieve(runId, { thread_id })
    runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
    pollCount++;

    // Log périodique
    if (pollCount % 5 === 0) {
      console.log(`[Prescription] Polling: ${pollCount} attempts (${pollCount * 3}s), status: ${runStatus.status}`);
    }
  }
  
  // Récupérer les messages
  const messages = await openai.beta.threads.messages.list(thread.id);
  
  // Trouver la réponse de l'assistant
  const assistantMessage = messages.data.find(m => m.role === 'assistant');
  
  if (!assistantMessage || !assistantMessage.content[0]) {
    throw new Error('Aucune réponse de l\'assistant');
  }
  
  // Extraire le texte
  const content = assistantMessage.content[0];
  if (content.type !== 'text') {
    throw new Error('Réponse non-textuelle de l\'assistant');
  }
  
  return content.text.value;
}

/**
 * Appel via Chat Completion API (fallback)
 */
async function callChatCompletion(userPrompt: string): Promise<string> {
  // Récupérer le Knowledge Bridge
  const knowledgeContext = getKnowledgeBridgeContext();
  
  const completion = await openai.chat.completions.create({
    model: MODEL_CONFIG.model,
    temperature: MODEL_CONFIG.temperature,
    max_tokens: MODEL_CONFIG.max_tokens,
    response_format: { type: 'json_object' }, // Force JSON
    messages: [
      {
        role: 'system',
        content: PRESCRIBER_SYSTEM_PROMPT,
      },
      {
        // INJECTION DU KNOWLEDGE BRIDGE
        role: 'system',
        content: `[BASE DE CONNAISSANCES - PLANTES ENDOBIOGÉNIQUES]\n\n${knowledgeContext}`,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });
  
  const content = completion.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Aucune réponse du modèle');
  }
  
  return content;
}

/**
 * Nettoie une réponse JSON (enlève les backticks markdown si présents)
 */
function cleanJSONResponse(response: string): string {
  let cleaned = response.trim();
  
  // Enlever ```json au début
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  // Enlever ``` à la fin
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  return cleaned.trim();
}

// =============================================================================
// ACTIONS AUXILIAIRES
// =============================================================================

/**
 * Régénère une prescription (simple wrapper avec log)
 */
export async function regeneratePrescription(
  diagnostic: DiagnosticInput
): Promise<GenerationResult> {
  console.log("🔄 Régénération demandée...");
  return generatePrescription(diagnostic);
}

/**
 * Vérifie la santé de l'API OpenAI
 */
export async function checkAPIHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    // Simple test de connexion
    const models = await openai.models.list();
    
    return {
      healthy: true,
      message: `Connexion OK. ${models.data.length} modèles disponibles.`,
    };
  } catch (error) {
    return {
      healthy: false,
      message: error instanceof Error ? error.message : 'Erreur de connexion',
    };
  }
}
