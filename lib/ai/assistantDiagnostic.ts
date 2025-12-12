// lib/ai/assistantDiagnostic.ts
// Service pour appeler l'Assistant OpenAI "Expert Endobiogénie IntegrIA"

import OpenAI from "openai";
import { AIReadyData } from "./prepareDataForAI";

// ========================================
// CONFIGURATION
// ========================================

/**
 * ID de l'Assistant OpenAI (à récupérer depuis la plateforme)
 * Tu peux aussi le mettre dans .env : OPENAI_ASSISTANT_DIAGNOSTIC_ID
 */
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_DIAGNOSTIC_ID || "asst_546z3z48kGvh3gLhqNqugRwD";

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 1000,
  timeoutMs: 120000, // 2 minutes max
  pollingIntervalMs: 3000, // Vérifier toutes les 3 secondes (réduit coûts API)
};

// ========================================
// TYPES DE SORTIE (ce que l'Assistant retourne)
// ========================================

/**
 * Structure de la réponse de l'Assistant Diagnostic
 */
export interface DiagnosticResponse {
  meta: {
    version: string;
    timestamp: string;
    sources_analysees: string[];
    type_analyse: "unifiee" | "bdf_seule" | "interro_seule";
  };

  terrain: {
    description: string;
    axeDominant: "Corticotrope" | "Thyréotrope" | "Gonadotrope" | "Somatotrope" | "Mixte";
    profilSNA: "Sympathicotonique" | "Vagotonique" | "Amphotonique" | "Dystonique";
    terrainsPrincipaux: string[];
    justification: string;
  };

  axesEndocriniens: AxeAnalysis[];

  concordances?: Concordance[];
  discordances?: Discordance[];

  spasmophilie: {
    detectee: boolean;
    probabilite?: number;
    type_probable?: string;
    arguments?: string[];
    recommendations?: string[];
  };

  drainage: {
    necessaire: boolean;
    priorite: "urgent" | "modere" | "faible";
    emonctoires_prioritaires?: EmonctoireDrainage[];
    duree_recommandee?: string;
  };

  strategie_therapeutique?: {
    hierarchie_respectee: boolean;
    phases: PhaseTherapeutique[];
  };

  contre_indications_detectees?: ContreIndication[];
  examens_complementaires?: string[];
  synthese_pour_praticien: string;
  confidenceScore: number;
  warnings: string[];
}

export interface AxeAnalysis {
  rang: number;
  axe: string;
  status: "Hypo" | "Normo" | "Hyper";
  score_perturbation: number;
  confiance: number;
  sources?: {
    bdf?: { index: string; interpretation: string };
    interrogatoire?: { score: number; symptomes: string[] };
  };
  concordance?: boolean;
  mecanisme: string;
  implication_therapeutique: string;
}

export interface Concordance {
  axe: string;
  observation: string;
  source_bdf: string;
  source_interro: string;
  confiance: number;
  interpretation?: string;
}

export interface Discordance {
  axe: string;
  source_bdf: string;
  source_interro: string;
  interpretation: string;
  recommandation: string;
}

export interface EmonctoireDrainage {
  emonctoire: "foie" | "reins" | "intestins" | "poumons" | "peau";
  justification: string;
  plantes: string[];
}

export interface PhaseTherapeutique {
  phase: number;
  nom: string;
  duree: string;
  objectif: string;
  prescriptions: Prescription[];
}

export interface Prescription {
  type: "phyto" | "gemmo" | "aroma" | "complement";
  plante: string;
  partie?: string;
  forme: string;
  posologie: string;
  action: string;
}

export interface ContreIndication {
  substance: string;
  raison: string;
  alternative?: string;
}

// ========================================
// TYPES D'ERREUR
// ========================================

export class AssistantError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "AssistantError";
  }
}

// ========================================
// CLIENT OPENAI
// ========================================

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AssistantError(
        "Clé API OpenAI non configurée",
        "MISSING_API_KEY"
      );
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Pause avec délai
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formater les données pour le message à l'Assistant
 */
function formatMessageForAssistant(data: AIReadyData): string {
  const parts: string[] = [];

  // En-tête
  parts.push("# DONNÉES PATIENT POUR ANALYSE ENDOBIOGÉNIQUE\n");

  // Type d'analyse
  parts.push(`## Type d'analyse : ${data.meta.type_synthese.toUpperCase()}\n`);

  // Informations patient
  parts.push("## PATIENT");
  parts.push(`- Âge : ${data.patient.age || "Non renseigné"} ans`);
  parts.push(`- Sexe : ${data.patient.sexe === "F" ? "Femme" : "Homme"}`);
  
  if (data.patient.allergies && data.patient.allergies.length > 0) {
    parts.push(`- Allergies : ${data.patient.allergies.join(", ")}`);
  }
  if (data.patient.medicaments_actuels && data.patient.medicaments_actuels.length > 0) {
    parts.push(`- Traitements en cours : ${data.patient.medicaments_actuels.join(", ")}`);
  }
  if (data.patient.antecedents && data.patient.antecedents.length > 0) {
    parts.push(`- Antécédents : ${data.patient.antecedents.join(", ")}`);
  }
  if (data.patient.motif_consultation) {
    parts.push(`- Motif : ${data.patient.motif_consultation}`);
  }
  parts.push("");

  // Données BdF si présentes
  if (data.bdf) {
    parts.push("## BIOLOGIE DES FONCTIONS (BdF)\n");
    
    if (data.bdf.hors_normes && data.bdf.hors_normes.length > 0) {
      parts.push("### Index HORS NORMES :");
      data.bdf.hors_normes.forEach(idx => {
        const arrow = idx.interpretation === "bas" ? "↓" : "↑";
        parts.push(`- ${idx.nom} = ${idx.valeur} ${arrow} [norme: ${idx.norme_min}-${idx.norme_max}] → ${idx.interpretation.toUpperCase()}`);
      });
      parts.push("");
    }

    if (data.bdf.axes_sollicites && data.bdf.axes_sollicites.length > 0) {
      parts.push(`### Axes sollicités détectés : ${data.bdf.axes_sollicites.join(", ")}`);
    }

    if (data.bdf.orientation_globale) {
      parts.push(`### Orientation globale : ${data.bdf.orientation_globale}`);
    }
    parts.push("");

    // Index complets - OPTIMISÉ : Format compact pour réduire les tokens
    if (data.bdf.index && Object.keys(data.bdf.index).length > 0) {
      parts.push("### Tous les index (format compact) :");
      // Format compact : nom=valeur (sans JSON lourd)
      const indexList = Object.entries(data.bdf.index)
        .filter(([_, val]) => val !== null && val !== undefined)
        .map(([name, val]) => {
          const numVal = typeof val === 'number' ? val : (val as any)?.value;
          return numVal !== null && numVal !== undefined
            ? `${name}=${numVal.toFixed(2)}`
            : null;
        })
        .filter(Boolean);
      parts.push(indexList.join(" | "));
      parts.push("");
    }
  }

  // Données Interrogatoire si présentes
  if (data.interrogatoire) {
    parts.push("## INTERROGATOIRE CLINIQUE (scores pré-calculés V3)\n");

    // Synthèse globale
    if (data.interrogatoire.synthese) {
      const s = data.interrogatoire.synthese;
      parts.push("### Synthèse globale :");
      if (s.terrain_principal) parts.push(`- Terrain principal : ${s.terrain_principal}`);
      if (s.axe_prioritaire) parts.push(`- Axe prioritaire : ${s.axe_prioritaire}`);
      parts.push(`- Capacité d'adaptation : ${s.capacite_adaptation}`);
      parts.push(`- Risque spasmophilie : ${s.risque_spasmophilie ? "OUI" : "Non"}`);
      parts.push("");
    }

    // Scores par axe
    if (data.interrogatoire.axes) {
      parts.push("### Scores par axe :");
      
      const axeNames: Record<string, string> = {
        neuro_vegetatif: "Neuro-végétatif",
        corticotrope: "Corticotrope",
        thyreotrope: "Thyréotrope",
        gonadotrope: "Gonadotrope",
        somatotrope: "Somatotrope",
        digestif: "Digestif",
        immuno_inflammatoire: "Immuno-inflammatoire",
      };

      for (const [key, score] of Object.entries(data.interrogatoire.axes)) {
        if (!score) continue;
        const name = axeNames[key] || key;
        parts.push(`\n#### ${name}`);
        parts.push(`- Insuffisance : ${score.score_insuffisance}%`);
        parts.push(`- Sur-sollicitation : ${score.score_sur_sollicitation}%`);
        parts.push(`- Orientation : ${score.orientation}`);
        parts.push(`- Intensité : ${score.intensite}/10`);
        parts.push(`- Confiance : ${Math.round(score.confiance * 100)}%`);
        if (score.symptomes_cles && score.symptomes_cles.length > 0) {
          parts.push(`- Symptômes clés : ${score.symptomes_cles.join(", ")}`);
        }
      }
      parts.push("");
    }

    // Terrains détectés
    if (data.interrogatoire.terrains_detectes && data.interrogatoire.terrains_detectes.length > 0) {
      parts.push("### Terrains pathologiques détectés :");
      data.interrogatoire.terrains_detectes.forEach(t => {
        parts.push(`- **${t.terrain}** (score: ${t.score})`);
        parts.push(`  Indicateurs : ${t.indicateurs.join(", ")}`);
        parts.push(`  Axes impliqués : ${t.axes_impliques.join(", ")}`);
      });
      parts.push("");
    }

    // Complétude
    if (data.interrogatoire.completude) {
      const c = data.interrogatoire.completude;
      parts.push(`### Complétude : ${c.axes_remplis}/${c.axes_total} axes (${c.pourcentage}%)`);
      parts.push("");
    }
  }

  // Instructions finales
  parts.push("---");
  parts.push("## INSTRUCTION CRITIQUE");
  parts.push("Analyse ces données selon la méthodologie endobiogénique Duraffourd/Lapraz.");
  parts.push("Réponds UNIQUEMENT en JSON valide selon le format défini dans tes instructions.");
  parts.push("Identifie les CONCORDANCES et DISCORDANCES entre BdF et Interrogatoire si les deux sont présents.");
  parts.push("");
  parts.push("⚠️ RÈGLE ABSOLUE POUR LES VALEURS D'INDEX:");
  parts.push("- Tu DOIS citer les valeurs EXACTES fournies ci-dessus (ex: si idx_thyroidien = 2.85, écris 2.85, PAS 5.85)");
  parts.push("- NE JAMAIS inventer, arrondir ou modifier les valeurs numériques des index");
  parts.push("- Si tu mentionnes un index dans ton analyse, REPRENDS SA VALEUR EXACTE des données ci-dessus");
  parts.push("- Toute valeur différente de celles fournies sera considérée comme une erreur grave");

  return parts.join("\n");
}

/**
 * Valide et corrige les valeurs d'index dans la synthèse pour éviter les hallucinations
 * Compare les valeurs mentionnées dans synthese_pour_praticien avec les vraies valeurs
 */
function validateAndCorrectIndexValues(
  response: DiagnosticResponse,
  originalData: AIReadyData
): DiagnosticResponse {
  if (!originalData.bdf?.index || !response.synthese_pour_praticien) {
    return response;
  }

  let correctedSynthese = response.synthese_pour_praticien;
  const corrections: string[] = [];

  // Parcourir tous les index connus
  for (const [indexName, actualValue] of Object.entries(originalData.bdf.index)) {
    if (actualValue === null || actualValue === undefined) continue;

    // Créer un pattern pour trouver le nom de l'index suivi d'une valeur
    // Ex: "Index Thyroïdien (5.85)" ou "idx_thyroidien = 5.85"
    const readableName = indexName
      .replace(/^idx_/, "Index ")
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());

    // Pattern pour trouver les valeurs entre parenthèses ou après =
    const patterns = [
      // "Index Thyroïdien (5.85)" -> capture la valeur
      new RegExp(`${readableName}\\s*\\(([\\d.,]+)\\)`, "gi"),
      // "Index Thyroïdien : 5.85" ou "Index Thyroïdien = 5.85"
      new RegExp(`${readableName}\\s*[:=]\\s*([\\d.,]+)`, "gi"),
      // Version snake_case: "idx_thyroidien (5.85)"
      new RegExp(`${indexName}\\s*\\(([\\d.,]+)\\)`, "gi"),
      new RegExp(`${indexName}\\s*[:=]\\s*([\\d.,]+)`, "gi"),
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(correctedSynthese)) !== null) {
        const mentionedValue = parseFloat(match[1].replace(",", "."));
        const tolerance = actualValue * 0.05; // 5% de tolérance

        // Si la valeur mentionnée est très différente de la valeur réelle
        if (Math.abs(mentionedValue - actualValue) > tolerance) {
          const roundedActual = Math.round(actualValue * 100) / 100;

          // Remplacer dans la synthèse
          const originalText = match[0];
          const correctedText = originalText.replace(
            match[1],
            roundedActual.toString().replace(".", ",")
          );

          correctedSynthese = correctedSynthese.replace(originalText, correctedText);
          corrections.push(
            `${indexName}: ${mentionedValue} → ${roundedActual} (valeur corrigée)`
          );
        }
      }
    }
  }

  // Logger les corrections
  if (corrections.length > 0) {
    console.warn(`[AssistantDiagnostic] ⚠️ Corrections d'hallucinations détectées:`);
    corrections.forEach(c => console.warn(`  - ${c}`));

    // Ajouter un warning dans la réponse
    response.warnings = response.warnings || [];
    response.warnings.push(
      `${corrections.length} valeur(s) d'index corrigée(s) automatiquement (hallucinations détectées)`
    );
  }

  response.synthese_pour_praticien = correctedSynthese;
  return response;
}

/**
 * Parser la réponse JSON de l'Assistant
 */
function parseAssistantResponse(content: string): DiagnosticResponse {
  // Nettoyer le contenu (enlever les balises markdown si présentes)
  let cleanContent = content.trim();
  
  // Enlever les balises ```json ... ```
  if (cleanContent.startsWith("```json")) {
    cleanContent = cleanContent.slice(7);
  } else if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.slice(3);
  }
  
  if (cleanContent.endsWith("```")) {
    cleanContent = cleanContent.slice(0, -3);
  }
  
  cleanContent = cleanContent.trim();

  try {
    const parsed = JSON.parse(cleanContent);
    return parsed as DiagnosticResponse;
  } catch (e) {
    throw new AssistantError(
      "Impossible de parser la réponse JSON de l'Assistant",
      "PARSE_ERROR",
      { content: content.substring(0, 500), error: (e as Error).message }
    );
  }
}

// ========================================
// FONCTION PRINCIPALE : APPELER L'ASSISTANT
// ========================================

export interface CallAssistantOptions {
  maxRetries?: number;
  timeoutMs?: number;
}

/**
 * Appelle l'Assistant OpenAI avec les données patient
 * 
 * @param data - Données préparées par prepareDataForAI
 * @param options - Options (retries, timeout)
 * @returns DiagnosticResponse - La réponse structurée de l'Assistant
 */
export async function callDiagnosticAssistant(
  data: AIReadyData,
  options: CallAssistantOptions = {}
): Promise<DiagnosticResponse> {
  const config = {
    maxRetries: options.maxRetries ?? DEFAULT_CONFIG.maxRetries,
    timeoutMs: options.timeoutMs ?? DEFAULT_CONFIG.timeoutMs,
  };

  const openai = getOpenAIClient();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      console.log(`[AssistantDiagnostic] Tentative ${attempt}/${config.maxRetries}...`);

      // 1. Créer un Thread
      const thread = await openai.beta.threads.create();

      if (!thread || !thread.id) {
        throw new AssistantError(
          "Impossible de créer un thread OpenAI",
          "THREAD_CREATION_FAILED"
        );
      }

      const threadId = thread.id; // Capturer l'ID immédiatement
      console.log(`[AssistantDiagnostic] Thread créé: ${threadId}`);

      // 2. Ajouter le message avec les données patient
      const messageContent = formatMessageForAssistant(data);
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: messageContent,
      });
      console.log(`[AssistantDiagnostic] Message envoyé (${messageContent.length} caractères)`);

      // 3. Lancer le Run
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: ASSISTANT_ID,
      });

      if (!run || !run.id) {
        throw new AssistantError(
          "Impossible de créer un run OpenAI",
          "RUN_CREATION_FAILED"
        );
      }

      const runId = run.id; // Capturer l'ID immédiatement
      console.log(`[AssistantDiagnostic] Run créé: ${runId}`);

      // 4. Attendre la complétion (polling)
      const startTime = Date.now();
      let runStatus = run;

      while (runStatus.status === "queued" || runStatus.status === "in_progress") {
        // Vérifier le timeout
        if (Date.now() - startTime > config.timeoutMs) {
          // Annuler le run
          try {
            // OpenAI SDK v6+: runs.cancel(runId, { thread_id })
            await openai.beta.threads.runs.cancel(runId, { thread_id: threadId });
          } catch {
            // Ignorer l'erreur d'annulation
          }
          throw new AssistantError(
            `Timeout après ${config.timeoutMs / 1000} secondes`,
            "TIMEOUT"
          );
        }

        await sleep(DEFAULT_CONFIG.pollingIntervalMs);
        // OpenAI SDK v6+: runs.retrieve(runId, { thread_id })
        runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
        console.log(`[AssistantDiagnostic] Status: ${runStatus.status}`);
      }

      // 5. Vérifier le status final
      if (runStatus.status === "failed") {
        throw new AssistantError(
          `Le Run a échoué: ${runStatus.last_error?.message || "Erreur inconnue"}`,
          "RUN_FAILED",
          runStatus.last_error
        );
      }

      if (runStatus.status === "cancelled") {
        throw new AssistantError("Le Run a été annulé", "RUN_CANCELLED");
      }

      if (runStatus.status !== "completed") {
        throw new AssistantError(
          `Status inattendu: ${runStatus.status}`,
          "UNEXPECTED_STATUS"
        );
      }

      // 6. Récupérer les messages
      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(m => m.role === "assistant");

      if (!assistantMessage) {
        throw new AssistantError(
          "Aucune réponse de l'Assistant",
          "NO_RESPONSE"
        );
      }

      // 7. Extraire le contenu texte
      const textContent = assistantMessage.content.find(c => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new AssistantError(
          "La réponse ne contient pas de texte",
          "NO_TEXT_CONTENT"
        );
      }

      // 8. Parser le JSON
      let response = parseAssistantResponse(textContent.text.value);
      console.log(`[AssistantDiagnostic] ✅ Réponse reçue (confiance: ${response.confidenceScore})`);

      // 9. Valider et corriger les valeurs d'index (anti-hallucination)
      response = validateAndCorrectIndexValues(response, data);

      // 10. Nettoyer le thread (optionnel, pour économiser)
      try {
        await openai.beta.threads.delete(threadId);
      } catch {
        // Ignorer l'erreur de suppression
      }

      return response;

    } catch (error) {
      lastError = error as Error;
      console.error(`[AssistantDiagnostic] ❌ Erreur tentative ${attempt}:`, lastError.message);

      // Ne pas retry pour certaines erreurs
      if (error instanceof AssistantError) {
        if (["MISSING_API_KEY", "PARSE_ERROR"].includes(error.code)) {
          throw error;
        }
      }

      // Attendre avant de réessayer
      if (attempt < config.maxRetries) {
        const delay = DEFAULT_CONFIG.retryDelayMs * attempt;
        console.log(`[AssistantDiagnostic] Attente ${delay}ms avant retry...`);
        await sleep(delay);
      }
    }
  }

  // Toutes les tentatives ont échoué
  throw new AssistantError(
    `Échec après ${config.maxRetries} tentatives: ${lastError?.message}`,
    "MAX_RETRIES_EXCEEDED",
    { lastError }
  );
}

// ========================================
// FONCTION SIMPLIFIÉE POUR USAGE COURANT
// ========================================

/**
 * Analyse un patient et retourne le diagnostic
 * Fonction simplifiée qui combine prepareDataForAI + callDiagnosticAssistant
 */
export async function analyzePatient(
  patient: AIReadyData["patient"],
  bdfResults?: AIReadyData["bdf"],
  interrogatoireResults?: AIReadyData["interrogatoire"]
): Promise<DiagnosticResponse> {
  // Construire les données
  const data: AIReadyData = {
    meta: {
      timestamp: new Date().toISOString(),
      sources_disponibles: {
        interrogatoire: !!interrogatoireResults,
        bdf: !!bdfResults,
        clinique: false,
      },
      type_synthese: bdfResults && interrogatoireResults 
        ? "unifiee" 
        : bdfResults 
          ? "bdf_seule" 
          : "interro_seule",
    },
    patient,
  };

  if (bdfResults) {
    data.bdf = bdfResults;
  }

  if (interrogatoireResults) {
    data.interrogatoire = interrogatoireResults;
  }

  return callDiagnosticAssistant(data);
}

// ========================================
// EXPORT PAR DÉFAUT
// ========================================

export default {
  callDiagnosticAssistant,
  analyzePatient,
  AssistantError,
};