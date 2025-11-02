// ========================================
// DÉTECTION - Valeurs biologiques dans un message
// ========================================
// Détecte et extrait les valeurs biologiques d'un message texte

import type { BdfInputs } from "@/types/bdf";

/**
 * Patterns de détection pour chaque valeur biologique
 * Format accepté: "GR: 4.5", "GR 4.5", "GR = 4.5", "GR:4.5"
 */
const LAB_PATTERNS: Record<keyof BdfInputs, RegExp> = {
  GR: /\b(?:GR|globules?\s*rouges?)\s*[:=]?\s*([\d.,]+)/i,
  GB: /\b(?:GB|globules?\s*blancs?)\s*[:=]?\s*([\d.,]+)/i,
  hemoglobine: /\b(?:h[ée]moglobine?|hb)\s*[:=]?\s*([\d.,]+)/i,
  neutrophiles: /\b(?:neutro(?:philes?)?)\s*[:=]?\s*([\d.,]+)/i,
  lymphocytes: /\b(?:lympho(?:cytes?)?)\s*[:=]?\s*([\d.,]+)/i,
  eosinophiles: /\b(?:[ée]osino(?:philes?)?|[ée]o)\s*[:=]?\s*([\d.,]+)/i,
  monocytes: /\b(?:mono(?:cytes?)?)\s*[:=]?\s*([\d.,]+)/i,
  plaquettes: /\b(?:plaquettes?|plt)\s*[:=]?\s*([\d.,]+)/i,
  LDH: /\b(?:ldh)\s*[:=]?\s*([\d.,]+)/i,
  CPK: /\b(?:cpk|ck)\s*[:=]?\s*([\d.,]+)/i,
  PAOi: /\b(?:paoi|pao|phosphatase\s*alcaline)\s*[:=]?\s*([\d.,]+)/i,
  osteocalcine: /\b(?:ost[ée]ocalcine?)\s*[:=]?\s*([\d.,]+)/i,
  TSH: /\b(?:tsh)\s*[:=]?\s*([\d.,]+)/i,
  VS: /\b(?:vs|vitesse?\s*s[ée]dimentation)\s*[:=]?\s*([\d.,]+)/i,
  calcium: /\b(?:calcium|ca2?\+?)\s*[:=]?\s*([\d.,]+)/i,
  potassium: /\b(?:potassium|k\+?)\s*[:=]?\s*([\d.,]+)/i,
};

/**
 * Détecte et extrait les valeurs biologiques d'un message
 * @param message - Message texte à analyser
 * @returns Objet avec les valeurs détectées et le nombre total
 */
export function detectLabValues(message: string): {
  values: BdfInputs;
  count: number;
} {
  const values: BdfInputs = {};
  let count = 0;

  // Nettoyer le message (espaces multiples, etc.)
  const cleanedMessage = message.replace(/\s+/g, " ").trim();

  // Pour chaque pattern, chercher une correspondance
  for (const [key, pattern] of Object.entries(LAB_PATTERNS)) {
    const match = cleanedMessage.match(pattern);
    if (match && match[1]) {
      // Convertir la valeur (remplacer virgule par point)
      const numericValue = parseFloat(match[1].replace(",", "."));
      if (!isNaN(numericValue)) {
        values[key as keyof BdfInputs] = numericValue;
        count++;
      }
    }
  }

  return { values, count };
}

/**
 * Vérifie si un message contient suffisamment de valeurs biologiques
 * pour proposer une analyse BdF (seuil: 4 valeurs minimum)
 */
export function shouldSuggestBdfAnalysis(message: string): boolean {
  const { count } = detectLabValues(message);
  return count >= 4;
}

/**
 * Formate les valeurs détectées pour l'affichage
 * @param values - Valeurs biologiques détectées
 * @returns Texte formaté lisible
 */
export function formatDetectedValues(values: BdfInputs): string {
  const entries = Object.entries(values)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`);

  if (entries.length === 0) return "Aucune valeur détectée";
  if (entries.length <= 3) return entries.join(", ");

  // Si plus de 3, afficher les 3 premières + "et X autres"
  const first3 = entries.slice(0, 3).join(", ");
  const remaining = entries.length - 3;
  return `${first3} et ${remaining} autre${remaining > 1 ? "s" : ""}`;
}
