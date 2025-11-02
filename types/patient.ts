// ========================================
// TYPES PATIENT & CONSULTATION
// ========================================

import type { BdfAnalysis } from "./bdf";

// ===== PATIENT =====

export interface Patient {
  id: string;
  userId: string;

  // Informations patient
  numeroPatient: string; // PAT-001, PAT-002, etc.
  nom: string;
  prenom: string;
  dateNaissance: string | null; // ISO string
  sexe: "H" | "F" | "Autre" | null;
  telephone: string | null;
  email: string | null;
  notes: string | null;

  // RGPD
  consentementRGPD: boolean;
  dateConsentement: string | null; // ISO string

  // Archivage
  isArchived: boolean;
  archivedAt: string | null; // ISO string

  // Timestamps
  createdAt: string; // ISO string
  updatedAt: string; // ISO string

  // Relations (optionnelles selon le fetch)
  consultations?: Consultation[];
}

// Formulaire création patient
export interface PatientCreateInput {
  nom: string;
  prenom: string;
  dateNaissance?: string; // ISO string
  sexe?: "H" | "F" | "Autre";
  telephone?: string;
  email?: string;
  notes?: string;
  consentementRGPD?: boolean;
}

// Formulaire mise à jour patient
export interface PatientUpdateInput {
  nom?: string;
  prenom?: string;
  dateNaissance?: string | null;
  sexe?: "H" | "F" | "Autre" | null;
  telephone?: string | null;
  email?: string | null;
  notes?: string | null;
  consentementRGPD?: boolean;
}

// Liste patients (avec compteur consultations)
export interface PatientListItem extends Patient {
  _count?: {
    consultations: number;
  };
  lastConsultation?: string; // Date ISO de la dernière consultation
}

// ===== CONSULTATION =====

export interface Consultation {
  id: string;
  patientId: string;
  dateConsultation: string; // ISO string

  // Type et contexte
  type: "initiale" | "suivi" | "urgence" | null;
  motifConsultation: string | null;

  // Données BdF
  inputs: BdfInputs;
  indexes: BdfIndex[];
  summary: string | null;
  axes: string[];
  ragText: string | null;

  // Suivi praticien
  commentaire: string | null;
  prescriptions: string | null;

  // Timestamps
  createdAt: string; // ISO string
  updatedAt: string; // ISO string

  // Relations (optionnelles)
  patient?: Patient;
}

// Types BdF (importés ou redéfinis)
export interface BdfInputs {
  GR?: number;
  GB?: number;
  LDH?: number;
  CPK?: number;
  TSH?: number;
  plaquettes?: number;
  VGM?: number;
  CCMH?: number;
  PN?: number;
  lymphocytes?: number;
  monocytes?: number;
  eosinophiles?: number;
  basophiles?: number;
}

export interface BdfIndex {
  label: string;
  value: number | null;
  comment: string;
  category?: string;
}

// Formulaire création consultation
export interface ConsultationCreateInput {
  patientId: string;
  dateConsultation?: string; // ISO string, défaut: now()
  type?: "initiale" | "suivi" | "urgence";
  motifConsultation?: string;

  // Données BdF (depuis BdfAnalysis)
  inputs: BdfInputs;
  indexes: BdfIndex[];
  summary: string;
  axes: string[];
  ragText?: string;

  // Suivi praticien
  commentaire?: string;
  prescriptions?: string;
}

// Formulaire mise à jour consultation
export interface ConsultationUpdateInput {
  type?: "initiale" | "suivi" | "urgence" | null;
  motifConsultation?: string | null;
  commentaire?: string | null;
  prescriptions?: string | null;
}

// ===== HELPERS =====

/**
 * Convertir BdfAnalysis en données Consultation
 */
export function bdfToConsultationData(
  bdf: BdfAnalysis,
  ragText?: string
): Pick<ConsultationCreateInput, "inputs" | "indexes" | "summary" | "axes" | "ragText"> {
  return {
    inputs: bdf.inputs,
    indexes: bdf.indexes,
    summary: bdf.summary,
    axes: bdf.axes,
    ragText: ragText || undefined,
  };
}

/**
 * Générer le prochain numéro patient (PAT-XXX)
 * @param lastNumero - Dernier numéro utilisé (ex: "PAT-042")
 * @returns Nouveau numéro (ex: "PAT-043")
 */
export function generateNumeroPatient(lastNumero?: string): string {
  if (!lastNumero) return "PAT-001";

  const match = lastNumero.match(/PAT-(\d+)/);
  if (!match) return "PAT-001";

  const nextNumber = parseInt(match[1], 10) + 1;
  return `PAT-${nextNumber.toString().padStart(3, "0")}`;
}

/**
 * Formatter le nom complet d'un patient
 */
export function formatPatientName(patient: Pick<Patient, "nom" | "prenom">): string {
  return `${patient.prenom} ${patient.nom.toUpperCase()}`;
}

/**
 * Calculer l'âge d'un patient
 */
export function calculateAge(dateNaissance: string | null): number | null {
  if (!dateNaissance) return null;

  const birthDate = new Date(dateNaissance);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;