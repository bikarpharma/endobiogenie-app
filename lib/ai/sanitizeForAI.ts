/**
 * ============================================================================
 * SANITIZATION DES DONNÉES AVANT ENVOI À L'IA
 * ============================================================================
 *
 * Ce module garantit qu'aucune donnée personnelle identifiable (PII)
 * n'est envoyée aux services d'IA externes (OpenAI, etc.)
 *
 * CONFORMITÉ: RGPD / HDS (Hébergement Données de Santé)
 * ============================================================================
 */

import crypto from "crypto";

// ============================================================================
// TYPES
// ============================================================================

export interface PatientPII {
  id?: string;
  nom?: string;
  prenom?: string;
  numeroPatient?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  dateNaissance?: Date | string | null;
  sexe?: string | null;
  // Données médicales (non-PII, peuvent être envoyées)
  allergies?: string | string[] | null;
  traitementActuel?: string | null;
  atcdMedicaux?: string | null;
  motifConsultation?: string | null;
}

export interface SanitizedPatient {
  // Pseudonyme temporaire (hash)
  pseudoId: string;

  // Données démographiques anonymisées
  ageRange: string | null; // "20-30", "30-40", etc.
  sexe: "H" | "F";

  // Données médicales (sans PII)
  allergies: string[];
  medicaments_actuels: string[];
  antecedents: string[];
  motif_consultation?: string;
}

export interface SanitizationResult {
  sanitized: SanitizedPatient;
  mapping: {
    originalId: string | undefined;
    pseudoId: string;
    timestamp: string;
  };
  warnings: string[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Liste des champs PII à ne JAMAIS envoyer à l'IA
 */
const PII_FIELDS = [
  "nom",
  "prenom",
  "numeroPatient",
  "email",
  "telephone",
  "adresse",
  "nss", // Numéro de sécurité sociale
  "iban",
  "carte_identite",
];

/**
 * Patterns regex pour détecter des PII dans les textes libres
 */
const PII_PATTERNS = [
  // Email
  /[\w.-]+@[\w.-]+\.\w+/gi,
  // Téléphone français
  /(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g,
  // Numéro de sécu
  /[12]\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{3}\s*\d{3}\s*\d{2}/g,
  // Nom propre potentiel (M./Mme/Dr suivi d'un nom)
  /(?:M\.|Mme|Dr|Pr)\s+[A-Z][a-zéèêëàâäùûüôöîï]+(?:\s+[A-Z][a-zéèêëàâäùûüôöîï]+)?/g,
];

// ============================================================================
// FONCTIONS DE SANITIZATION
// ============================================================================

/**
 * Génère un pseudonyme temporaire à partir de l'ID patient
 * Le hash est reproductible pour permettre le tracking de session
 */
function generatePseudoId(originalId: string | undefined): string {
  const source = originalId || crypto.randomUUID();
  const hash = crypto
    .createHash("sha256")
    .update(source + process.env.NEXTAUTH_SECRET || "integria-salt")
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();

  return `PAT_${hash}`;
}

/**
 * Convertit une date de naissance en tranche d'âge anonymisée
 */
function dateToAgeRange(dateNaissance: Date | string | null | undefined): string | null {
  if (!dateNaissance) return null;

  const birthDate = new Date(dateNaissance);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Arrondir à la décennie inférieure
  const lowerBound = Math.floor(age / 10) * 10;
  const upperBound = lowerBound + 10;

  return `${lowerBound}-${upperBound} ans`;
}

/**
 * Normalise le sexe
 */
function normalizeSexe(sexe: string | null | undefined): "H" | "F" {
  if (sexe === "F" || sexe === "Femme" || sexe === "female") return "F";
  return "H";
}

/**
 * Parse une chaîne en tableau
 */
function parseToArray(input: string | string[] | null | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);

  return input
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Nettoie un texte libre de toute PII potentielle
 */
function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";

  let sanitized = text;

  // Remplacer les patterns PII détectés
  for (const pattern of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  return sanitized;
}

/**
 * Nettoie un tableau de textes de toute PII
 */
function sanitizeArray(arr: string[]): string[] {
  return arr.map(sanitizeText).filter((s) => s && s !== "[REDACTED]");
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

/**
 * Sanitize complètement les données patient avant envoi à l'IA
 *
 * @param patient - Données patient potentiellement avec PII
 * @returns Données sanitizées + mapping pour retrouver le patient
 */
export function sanitizePatientForAI(patient: PatientPII): SanitizationResult {
  const warnings: string[] = [];

  // Vérifier si des champs PII sont présents
  for (const field of PII_FIELDS) {
    if ((patient as Record<string, unknown>)[field]) {
      warnings.push(`⚠️ Champ PII "${field}" détecté et supprimé`);
    }
  }

  // Générer le pseudonyme
  const pseudoId = generatePseudoId(patient.id);

  // Construire l'objet sanitizé
  const sanitized: SanitizedPatient = {
    pseudoId,
    ageRange: dateToAgeRange(patient.dateNaissance),
    sexe: normalizeSexe(patient.sexe),
    allergies: sanitizeArray(parseToArray(patient.allergies)),
    medicaments_actuels: sanitizeArray(parseToArray(patient.traitementActuel)),
    antecedents: sanitizeArray(parseToArray(patient.atcdMedicaux)),
    motif_consultation: sanitizeText(patient.motifConsultation),
  };

  // Créer le mapping pour traçabilité
  const mapping = {
    originalId: patient.id,
    pseudoId,
    timestamp: new Date().toISOString(),
  };

  return {
    sanitized,
    mapping,
    warnings,
  };
}

/**
 * Vérifie qu'un objet ne contient pas de PII avant envoi
 * Lève une erreur si des PII sont détectées
 */
export function assertNoPII(data: Record<string, unknown>): void {
  const jsonStr = JSON.stringify(data);

  // Vérifier les champs interdits
  for (const field of PII_FIELDS) {
    if (jsonStr.toLowerCase().includes(`"${field}"`)) {
      throw new Error(`PII détectée: champ "${field}" présent dans les données`);
    }
  }

  // Vérifier les patterns dans les valeurs
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(jsonStr)) {
      throw new Error(`PII détectée: pattern suspect dans les données`);
    }
  }
}

/**
 * Mode strict: Sanitize ET vérifie qu'aucune PII ne reste
 */
export function sanitizePatientStrict(patient: PatientPII): SanitizedPatient {
  const result = sanitizePatientForAI(patient);

  // Vérification supplémentaire
  assertNoPII(result.sanitized as unknown as Record<string, unknown>);

  return result.sanitized;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  sanitizePatientForAI,
  sanitizePatientStrict,
  assertNoPII,
  generatePseudoId,
};
