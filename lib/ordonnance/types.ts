// ========================================
// TYPES - Système d'Ordonnances Intelligent
// Refactor Learning System (itergIA)
// ========================================
// Types pour le raisonnement thérapeutique en 4 étapes
// + Chat contextuel avec l'IA
// + Contexte pédagogique (lien Index → Axe → Plante)

import type { IndexResults, LabValues } from "@/lib/bdf/types";

// ========================================
// SCOPE THÉRAPEUTIQUE
// ========================================

/**
 * Scope thérapeutique sélectionné par le praticien
 * Détermine quels vectorstores seront consultés
 */
export type TherapeuticScope = {
  planteMedicinale: boolean;   // vectorstore phyto (25 MB)
  gemmotherapie: boolean;       // vectorstore gemmo (3 MB)
  aromatherapie: boolean;       // vectorstore aroma (13 MB)
  micronutrition: boolean;      // à venir
};

// ========================================
// ANALYSE DU TERRAIN
// ========================================

/**
 * Axe neuroendocrinien perturbé identifié
 */
export type AxePerturbation = {
  axe: 'thyroidien' | 'corticotrope' | 'genital' | 'somatotrope' | 'gonadotrope';
  niveau: 'hypo' | 'hyper' | 'desequilibre';
  score: number; // 0-10 (intensité de la perturbation)
  justification: string; // ex: "Index thyroïdien 1.8 < 2.0"
};

// ========================================
// RECOMMANDATIONS THÉRAPEUTIQUES
// ========================================

/**
 * Type de substance thérapeutique
 */
export type SubstanceType = 'plante' | 'gemmo' | 'HE' | 'vitamine' | 'mineral' | 'autre';

/**
 * Forme galénique
 */
export type FormeGalenique = 'EPS' | 'TM' | 'MG' | 'gélule' | 'comprimé' | 'HE' | 'poudre' | 'autre';

// ========================================
// EXTENSION PÉDAGOGIQUE (LEARNING SYSTEM)
// ========================================

/**
 * Niveau de sécurité visuel pour l'UI
 */
export type NiveauSecurite = 'sur' | 'precaution' | 'interdit';

/**
 * Métadonnées pour l'affichage éducatif (Learning System)
 * Explique le lien : Index Bio → Axe → Plante
 */
export type ContextePedagogique = {
  // Le "Pourquoi" biologique
  indexDeclencheur?: string;    // ex: "Index Thyroïdien (1.8)"
  scorePerturbation: number;    // Score de l'axe (ex: 8/10)

  // Le "Comment" physiologique
  actionSurAxe: string;         // ex: "Relance la synthèse de T3/T4 (Action thyréotrope)"

  // Le "Savoir" botanique/chimique
  constituantsClefs?: string[]; // ex: ["Iode", "L-Tyrosine"] pour Fucus

  // Niveau de certitude du système
  confianceIA: 'haute' | 'moyenne' | 'faible';
};

/**
 * Recommandation thérapeutique complète
 * MODIFIÉ: Ajout du contexte pédagogique
 */
export type RecommandationTherapeutique = {
  id: string; // UUID pour tracking
  substance: string; // "Rhodiola rosea"
  type: SubstanceType;
  forme: FormeGalenique;
  posologie: string; // "5 ml matin à jeun"
  duree: string; // "21 jours"

  // --- Structuration forte (compatibilité maintenue) ---
  axeCible: string; // "soutien corticosurrénalien"
  mecanisme: string; // "adaptogène, régule cortisol"

  // --- NOUVEAU: Contexte éducatif (Learning System) ---
  pedagogie?: ContextePedagogique;

  sourceVectorstore: 'endobiogenie' | 'phyto' | 'gemmo' | 'aroma' | 'code';
  niveauPreuve: 1 | 2 | 3; // 1=canon endobiogénie, 2=élargi, 3=micro

  // --- Sécurité Renforcée ---
  CI: string[]; // ["grossesse", "hypertension"]
  interactions: string[]; // ["IMAO", "anticoagulants"]
  niveauSecurite?: NiveauSecurite; // Pour code couleur UI (Vert/Orange/Rouge)

  priorite: number; // 1-5 (1=essentiel, 5=optionnel)
  cout?: number; // euros/mois (optionnel)
};

// ========================================
// RAISONNEMENT THÉRAPEUTIQUE
// ========================================

/**
 * Résultat du raisonnement IA en 4 étapes
 */
export type RaisonnementTherapeutique = {
  // ÉTAPE 1: Analyse terrain
  axesPerturbés: AxePerturbation[];
  hypothesesRegulatrices: string[];

  // ÉTAPE 2: Endobiogénie prioritaire
  recommandationsEndobiogenie: RecommandationTherapeutique[];

  // ÉTAPE 3: Extension thérapeutique
  recommandationsElargies: RecommandationTherapeutique[];

  // ÉTAPE 4: Micro-nutrition
  recommandationsMicronutrition: RecommandationTherapeutique[];

  // Métadonnées
  raisonnementDetaille: string; // Texte explicatif du raisonnement
  alertes: AlerteTherapeutique[];
  coutEstime: number; // euros/mois
  dateGeneration: Date;
};

/**
 * Alerte CI/interaction/attention
 */
export type AlerteTherapeutique = {
  niveau: 'info' | 'warning' | 'error';
  type: 'CI' | 'interaction' | 'terrain' | 'coherence' | 'autre';
  message: string;
  substancesConcernees: string[];
  recommandation?: string; // Action suggérée
};

// ========================================
// ORDONNANCE STRUCTURÉE
// ========================================

/**
 * Ordonnance finale structurée en 3 volets
 */
export type OrdonnanceStructuree = {
  id: string;
  patientId: string;
  bdfAnalysisId?: string; // Optionnel si créée sans BdF

  // Les 3 volets
  voletEndobiogenique: RecommandationTherapeutique[];
  voletPhytoElargi: RecommandationTherapeutique[];
  voletComplements: RecommandationTherapeutique[];

  // Scope thérapeutique utilisé (pour affichage dynamique)
  scope?: TherapeuticScope;

  // Métadonnées
  syntheseClinique: string; // Résumé global
  conseilsAssocies: string[]; // Conseils hygiéno-diététiques
  surveillanceBiologique: string[]; // Paramètres à contrôler
  dateRevaluation?: Date; // Quand revoir le patient

  // État
  statut: 'brouillon' | 'validee' | 'archivee';
  createdAt: Date;
  updatedAt: Date;
};

// ========================================
// CHAT CONTEXTUEL
// ========================================

/**
 * Message de conversation
 */
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;

  // Métadonnées
  actions?: MessageAction[]; // Actions proposées par l'IA
  modifications?: OrdonnanceModification[]; // Changements appliqués
};

/**
 * Action proposée par l'IA dans un message
 */
export type MessageAction = {
  id: string;
  type: 'replace' | 'add' | 'remove' | 'warn' | 'info';
  target?: string; // Path: "voletEndobiogenique[0]"
  from?: RecommandationTherapeutique;
  to?: RecommandationTherapeutique;
  justification: string;
  applied: boolean; // True si l'utilisateur a appliqué l'action
};

/**
 * Modification appliquée à l'ordonnance
 */
export type OrdonnanceModification = {
  id: string;
  timestamp: Date;
  type: 'replace' | 'add' | 'remove' | 'update';
  volet: 'endobiogenique' | 'elargi' | 'complements';
  before?: RecommandationTherapeutique;
  after?: RecommandationTherapeutique;
  raison: string;
};

/**
 * Contexte de conversation complet
 */
export type ConversationContext = {
  // Données patient
  patient: {
    id: string;
    nom: string;
    prenom: string;
    age: number;
    sexe: 'M' | 'F';
    CI: string[];
    traitements: string[];
    allergies: string[];
  };

  // Terrain BdF (si disponible)
  bdfAnalysis?: {
    indexes: IndexResults;
    inputs: LabValues;
    axesPerturbés: AxePerturbation[];
    lectureEndobiogenique: string;
  };

  // Ordonnance actuelle (état live)
  ordonnance: OrdonnanceStructuree;

  // Historique conversation
  messages: ChatMessage[];

  // Scope actif
  scope: TherapeuticScope;
};

// ========================================
// REQUÊTES API
// ========================================

/**
 * Requête de génération d'ordonnance
 */
export type GenerateOrdonnanceRequest = {
  patientId: string;
  bdfAnalysisId?: string;
  scope: TherapeuticScope;
  inputs?: LabValues; // Si pas de BdF existante
  symptomes?: string[];
  objectifTherapeutique?: string;
};

/**
 * Requête de chat
 */
export type ChatRequest = {
  ordonnanceId: string;
  message: string;
  context: ConversationContext;
};

/**
 * Réponse de chat
 */
export type ChatResponse = {
  message: ChatMessage;
  suggestedActions?: MessageAction[];
  ordonnanceModifiee?: OrdonnanceStructuree;
  alertes?: AlerteTherapeutique[];
};
