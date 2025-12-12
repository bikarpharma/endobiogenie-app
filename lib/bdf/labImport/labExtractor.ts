/**
 * SMART LAB IMPORT - Extracteur GPT-4 Vision
 * ===========================================
 * Utilise GPT-4 Vision (gpt-4o) pour extraire les valeurs biologiques
 * d'une image ou PDF de résultats de laboratoire.
 *
 * Stratégie:
 * 1. L'image/PDF est envoyée à GPT-4 Vision
 * 2. Le modèle retourne un JSON structuré avec les valeurs détectées
 * 3. Ces valeurs brutes sont ensuite normalisées par labNormalizer.ts
 *
 * NOTE: Pour les PDF, on utilise l'API Responses avec file_search
 * ou on convertit en image côté client avant l'upload.
 */

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// ==========================================
// TYPES
// ==========================================

/**
 * Valeur brute extraite du PDF (avant normalisation)
 */
export interface RawLabValue {
  /** Nom tel qu'il apparaît sur le PDF */
  originalName: string;
  /** Valeur numérique extraite */
  value: number;
  /** Unité telle qu'elle apparaît sur le PDF */
  unit: string;
  /** Valeurs de référence (si présentes) */
  referenceRange?: {
    min?: number;
    max?: number;
  };
  /** Niveau de confiance de l'extraction (0-1) */
  confidence: number;
}

/**
 * Résultat de l'extraction GPT-4 Vision
 */
export interface LabExtractionResult {
  /** Succès de l'extraction */
  success: boolean;
  /** Valeurs extraites */
  values: RawLabValue[];
  /** Métadonnées du document */
  metadata?: {
    laboratoryName?: string;
    patientName?: string;
    date?: string;
    documentType?: string;
  };
  /** Message d'erreur si échec */
  error?: string;
  /** Tokens utilisés */
  tokensUsed?: number;
}

// ==========================================
// PROMPT SYSTÈME
// ==========================================

const EXTRACTION_PROMPT = `Tu es un expert en analyse de documents médicaux.
Tu dois extraire TOUTES les valeurs biologiques d'un résultat d'analyse de laboratoire.

INSTRUCTIONS:
1. Analyse l'image du document de laboratoire
2. Extrais CHAQUE valeur biologique avec son nom exact, sa valeur numérique et son unité
3. Inclus les valeurs de référence si elles sont visibles
4. Donne un score de confiance (0-1) pour chaque extraction

IMPORTANT:
- Garde les noms EXACTEMENT comme ils apparaissent sur le document
- Garde les unités EXACTEMENT comme elles apparaissent
- Pour les valeurs en pourcentage (ex: Neutrophiles 72%), extrais le pourcentage
- Si une valeur apparaît en double format (ex: mmol/L et g/L), extrais LES DEUX
- N'invente JAMAIS de valeurs - si tu n'es pas sûr, mets confidence < 0.5

FORMAT DE RÉPONSE (JSON strict):
{
  "success": true,
  "metadata": {
    "laboratoryName": "Nom du labo si visible",
    "patientName": "Nom du patient si visible",
    "date": "Date au format YYYY-MM-DD si visible"
  },
  "values": [
    {
      "originalName": "HÉMOGLOBINE",
      "value": 14.0,
      "unit": "g/dL",
      "referenceRange": { "min": 13, "max": 17 },
      "confidence": 0.95
    }
  ]
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

// ==========================================
// FONCTION D'EXTRACTION
// ==========================================

/**
 * Extrait les valeurs biologiques d'une image/PDF via GPT-4 Vision
 *
 * @param imageBase64 Image en base64 (avec ou sans préfixe data:image/...)
 * @param mimeType Type MIME de l'image (image/jpeg, image/png, application/pdf)
 * @returns Résultat de l'extraction
 */
export async function extractLabValuesFromImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<LabExtractionResult> {
  // Vérifier la clé API
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      values: [],
      error: "OPENAI_API_KEY non configurée",
    };
  }

  const openai = new OpenAI({ apiKey });

  try {
    // Préparer l'URL de l'image pour GPT-4 Vision
    // Nettoyer le base64 si nécessaire
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(",")) {
      cleanBase64 = imageBase64.split(",")[1];
    }

    // Construire l'URL data
    const imageUrl = `data:${mimeType};base64,${cleanBase64}`;

    // Appel GPT-4.1 Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4.1", // GPT-4.1 Vision - Qualité maximale
      messages: [
        {
          role: "system",
          content: EXTRACTION_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high", // Haute résolution pour meilleure OCR
              },
            },
            {
              type: "text",
              text: "Extrais toutes les valeurs biologiques de ce document de laboratoire. Réponds en JSON.",
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0, // Déterministe pour extraction
    });

    // Parser la réponse
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        values: [],
        error: "Réponse vide de GPT-4 Vision",
      };
    }

    // Nettoyer le JSON (parfois GPT ajoute des backticks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    }
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }

    // Parser le JSON
    const result = JSON.parse(jsonContent.trim()) as LabExtractionResult;

    // Ajouter les tokens utilisés
    result.tokensUsed = response.usage?.total_tokens;

    return result;
  } catch (error) {
    console.error("[LabExtractor] Erreur:", error);

    // Erreur de parsing JSON
    if (error instanceof SyntaxError) {
      return {
        success: false,
        values: [],
        error: "Erreur de parsing de la réponse GPT-4 Vision",
      };
    }

    // Autres erreurs
    return {
      success: false,
      values: [],
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Extrait les valeurs d'un PDF en utilisant l'API Responses (gpt-4o avec PDF natif)
 *
 * NOTE: GPT-4o supporte les PDF via l'API responses (pas chat.completions)
 * On utilise la nouvelle API avec input type "file"
 *
 * @param pdfBase64 PDF en base64
 * @returns Résultat de l'extraction
 */
export async function extractLabValuesFromPDF(
  pdfBase64: string
): Promise<LabExtractionResult> {
  // Vérifier la clé API
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      values: [],
      error: "OPENAI_API_KEY non configurée",
    };
  }

  try {
    // Utiliser l'API responses avec support PDF natif
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                file_data: `data:application/pdf;base64,${pdfBase64}`,
              },
              {
                type: "input_text",
                text: `${EXTRACTION_PROMPT}

Extrais toutes les valeurs biologiques de ce document de laboratoire. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.`,
              },
            ],
          },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[LabExtractor] API Error:", errorData);

      // Fallback: suggérer d'utiliser une image
      return {
        success: false,
        values: [],
        error: "L'extraction PDF n'est pas disponible. Veuillez prendre une photo ou capture d'écran du document.",
      };
    }

    const data = await response.json();

    // Extraire le contenu de la réponse
    let content = "";
    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === "message" && item.content) {
          for (const c of item.content) {
            if (c.type === "output_text") {
              content += c.text;
            }
          }
        }
      }
    }

    if (!content) {
      return {
        success: false,
        values: [],
        error: "Réponse vide de l'API",
      };
    }

    // Nettoyer et parser le JSON
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    }
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }

    const result = JSON.parse(jsonContent.trim()) as LabExtractionResult;
    return result;
  } catch (error) {
    console.error("[LabExtractor] Erreur PDF:", error);

    if (error instanceof SyntaxError) {
      return {
        success: false,
        values: [],
        error: "Erreur de parsing de la réponse. Essayez avec une photo du document.",
      };
    }

    return {
      success: false,
      values: [],
      error: "L'extraction PDF n'est pas disponible. Veuillez utiliser une photo ou capture d'écran.",
    };
  }
}

/**
 * Valide et nettoie les valeurs extraites
 * Supprime les valeurs aberrantes ou incohérentes
 */
export function validateExtractedValues(
  values: RawLabValue[]
): RawLabValue[] {
  return values.filter((v) => {
    // Filtrer les valeurs avec confiance trop basse
    if (v.confidence < 0.3) return false;

    // Filtrer les valeurs non numériques
    if (isNaN(v.value) || !isFinite(v.value)) return false;

    // Filtrer les valeurs négatives (sauf température)
    if (v.value < 0 && !v.originalName.toLowerCase().includes("temp")) {
      return false;
    }

    return true;
  });
}

// ==========================================
// EXPORT PAR DÉFAUT
// ==========================================

export default {
  extractLabValuesFromImage,
  extractLabValuesFromPDF,
  validateExtractedValues,
};
