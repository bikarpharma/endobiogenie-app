// ========================================
// CLASSIFIEUR DE MESSAGES
// ========================================
// Détermine si un message contient des valeurs biologiques
// ou s'il s'agit d'une discussion générale sur l'endobiogénie

import type { RequestMode } from "./types";

/**
 * Mots-clés biologiques recherchés
 */
const LAB_KEYWORDS = [
  "GR",
  "GB",
  "neutrophiles",
  "lymphocytes",
  "eosinophiles",
  "éosinophiles",
  "monocytes",
  "plaquettes",
  "LDH",
  "CPK",
  "TSH",
  "osteocalcine",
  "ostéocalcine",
  "PAOi",
];

/**
 * Phrases indiquant une demande d'analyse
 */
const ANALYSE_PHRASES = [
  "analyse ce bilan",
  "interprète cette biologie",
  "calcule les index",
  "interpréter",
  "analyser",
  "bilan biologique",
  "résultats biologiques",
  "mes analyses",
  "mon bilan",
  "voici mes valeurs",
];

/**
 * Classifie la requête utilisateur
 * @param message - Message de l'utilisateur
 * @returns "BDF_ANALYSE" si valeurs biologiques détectées, "ENDO_DISCUSSION" sinon
 */
export function classifyUserRequest(message: string): RequestMode {
  const normalizedMessage = message.toLowerCase();

  // 1️⃣ Vérifie les mots-clés biologiques
  const hasLabKeywords = LAB_KEYWORDS.some((keyword) =>
    normalizedMessage.includes(keyword.toLowerCase())
  );

  // 2️⃣ Vérifie les expressions d'analyse
  const hasAnalysePhrase = ANALYSE_PHRASES.some((phrase) =>
    normalizedMessage.includes(phrase.toLowerCase())
  );

  // 3️⃣ Vérifie la présence de nombres (valeurs biologiques)
  // Pattern : nombres avec décimales, séparés par espaces/virgules/points
  const hasNumericValues = /\d+[.,]?\d*/.test(message);

  // 4️⃣ Détecte les patterns "GR 4.5", "TSH: 2.1", "GB=6.2"
  const hasLabPattern = /[A-Z]{2,}\s*[:=]?\s*\d+/i.test(message);

  // DÉCISION : Si au moins 2 indicateurs présents → BDF_ANALYSE
  const indicators = [
    hasLabKeywords,
    hasAnalysePhrase,
    hasNumericValues && hasLabKeywords,
    hasLabPattern,
  ];

  const indicatorCount = indicators.filter(Boolean).length;

  return indicatorCount >= 2 ? "BDF_ANALYSE" : "ENDO_DISCUSSION";
}
