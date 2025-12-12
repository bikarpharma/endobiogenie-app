/**
 * Types pour le moteur d'analyse clinique unifié
 * BEST du BEST - Version complète avec tout optionnel
 */

// ============== TYPES D'ENTRÉE ==============

export interface PatientInfo {
  sexe: string;
  age: number | null;
  allergies: string | null;
  antecedentsMedicaux: string | null;
  antecedentsChirurgicaux: string | null;
  traitements: string | null;
}

export interface BiologyData {
  disponible: true;
  inputs: Record<string, number | undefined>;
  indexes: Array<{
    key: string;
    label: string;
    value?: number;
    unit?: string;
    status: 'ok' | 'na';
    note?: string;
  }>;
  summary: string | null;
  axes: string[];
  dateAnalyse: Date;
}

export interface BiologyUnavailable {
  disponible: false;
  message: string;
}

export interface AnamnesisData {
  disponible: true;
  motifConsultation: string;
  type: string;
  commentaire: string;
  dateConsultation: Date;
}

export interface AnamnesisUnavailable {
  disponible: false;
  message: string;
}

export interface InterrogatoireData {
  disponible: true;
  data: Record<string, unknown>;
  dateInterrogatoire: Date;
}

export interface InterrogatoireUnavailable {
  disponible: false;
  message: string;
}

export interface DataAvailability {
  hasBiology: boolean;
  hasAnamnesis: boolean;
  hasInterrogatoire: boolean;
  summary: string;
}

/**
 * Contexte d'entrée pour le moteur d'analyse clinique unifié.
 * TOUT EST OPTIONNEL - L'IA s'adapte aux données disponibles.
 */
export interface ClinicalInputContext {
  patient: PatientInfo;
  biology: BiologyData | BiologyUnavailable;
  anamnesis: AnamnesisData | AnamnesisUnavailable;
  interrogatoire: InterrogatoireData | InterrogatoireUnavailable;
  dataAvailability: DataAvailability;
  ragContext: string;
}

// ============== TYPES DE SORTIE ==============

export interface TherapeuticPlant {
  nom: string;
  nomLatin?: string;
  forme: string; // EPS, TM, gélules, infusion...
  posologie: string;
  duree: string;
  indication: string;
  pedagogicalHint?: string;
}

export interface GemmotherapyBud {
  nom: string;
  nomLatin?: string;
  posologie: string;
  duree: string;
  indication: string;
  pedagogicalHint?: string;
}

export interface Aromatherapy {
  huile: string;
  nomLatin?: string;
  voie: string; // cutanée, orale, diffusion
  posologie: string;
  duree: string;
  indication: string;
  precautions?: string;
  pedagogicalHint?: string;
}

export interface TherapeuticStrategy {
  priorites: string[];
  objectifsCourtTerme: string[];
  objectifsMoyenTerme: string[];
  precautions: string[];
  pedagogicalHint?: string;
  // NOUVEAU: Champs enrichis depuis VectorStore
  hierarchieTraitement?: string;
  surveillanceSuggeree?: string[];
}

export interface MicronutritionItem {
  nom: string;
  type: string;
  forme: string;
  posologie: string;
  duree: string;
  indication: string;
}

export interface SuggestedPrescription {
  phytotherapie: TherapeuticPlant[];
  gemmotherapie: GemmotherapyBud[];
  aromatherapie: Aromatherapy[];
  micronutrition?: MicronutritionItem[];
  conseilsHygiene: string[];
  conseilsAlimentaires: string[];
}

export interface EndocrineAxis {
  axis: 'Corticotrope' | 'Thyréotrope' | 'Gonadotrope' | 'Somatotrope';
  status: 'Hyper' | 'Hypo' | 'Normo' | 'Dysfonctionnel';
  biomarkers: string[];
  mechanism: string;
  pedagogicalHint?: string;
  // NOUVEAU: Champs enrichis depuis VectorStore
  score?: number;
  clinicalSigns?: string[];
  therapeuticImplication?: string;
}

export interface ClinicalConcordance {
  coherences: string[];
  incoherences: string[];
  hypotheses: string[];
}

// ============== TYPES DRAINAGE ==============

export interface Emonctoire {
  organe: 'Foie' | 'Reins' | 'Intestins' | 'Peau' | 'Poumons';
  statut: 'Surchargé' | 'Fonctionnel' | 'Insuffisant';
  signesBio: string[];
  signesCliniques: string[];
  plantesRecommandees: string[];
  prioriteDrainage: number;
}

export interface DrainageAnalysis {
  necessite: boolean;
  priorite: 'Urgente' | 'Haute' | 'Moyenne' | 'Basse';
  emonctoires: EmonctoireVS[];
  strategieDrainage: string;
  dureeTotale: string;
  precautions: string[];
  pedagogicalHint?: string;
  // NOUVEAU: Champs enrichis depuis VectorStore
  capaciteTampon?: number;
  justification?: string;
}

// NOUVEAU: Type émonctoire enrichi depuis VectorStore
export interface EmonctoireVS {
  organe: 'foie' | 'rein' | 'lymphe' | 'intestin' | 'peau';
  statut: 'sature' | 'sollicite' | 'normal';
  score: number;
  indicateurs: string[];
  strategieDrainage?: string;
}

// ============== TYPES SPASMOPHILIE ==============

export interface SigneBiologiqueSpasmophilie {
  parametre: string;
  valeur: string;
  interpretation: string;
}

export interface SupplementationSpasmophilie {
  magnesium?: { forme: string; posologie: string; duree: string };
  calcium?: { forme: string; posologie: string; duree: string };
  vitamineD?: { forme: string; posologie: string; duree: string };
  vitamineB6?: { posologie: string; duree: string };
}

export interface SpasmophilieAnalysis {
  score: number; // 0-100
  severite: 'Absent' | 'Léger' | 'Modéré' | 'Sévère';
  signesBiologiques: SigneBiologiqueSpasmophilie[] | string[];
  signesCliniques: string[];
  facteursAggravants: string[];
  terrainAssocié: string;
  supplementation: SupplementationSpasmophilie | Record<string, unknown>;
  plantesAntiSpasmophiliques: string[];
  conseilsSpecifiques: string[];
  pedagogicalHint?: string;
  // NOUVEAU: Champs enrichis depuis VectorStore
  type?: number;
  nom?: string;
  description?: string;
  mecanisme?: string;
  indexCles?: string[];
  strategieTherapeutique?: string;
}

// ============== TYPES PRESCRIPTION ENRICHIS ==============

export interface DrainagePlant {
  nom: string;
  nomLatin?: string;
  forme: string;
  posologie: string;
  indication: string;
}

export interface PhaseDrainage {
  duree: string;
  formule: DrainagePlant[];
}

export interface OligoElement {
  element: string;
  forme?: string;
  posologie: string;
  indication: string;
}

export interface SuggestedPrescriptionEnriched extends SuggestedPrescription {
  phaseDrainage?: PhaseDrainage;
  oligoElements?: OligoElement[];
}

/**
 * Structure JSON de sortie du moteur d'analyse clinique unifié.
 * BEST du BEST - Version complète avec DRAINAGE et SPASMOPHILIE.
 */
export interface UnifiedAnalysisOutput {
  meta: {
    modelUsed: string;
    confidenceScore: number;
    processingTime: number;
    dataUsed: {
      biology: boolean;
      anamnesis: boolean;
      interrogatoire: boolean;
    };
  };

  terrain: {
    // IMPORTANT: Il n'existe PAS de classification Alpha/Beta/Gamma/Delta en endobiogénie !
    // Le terrain est décrit par l'axe dominant et le profil SNA
    description: string;
    axeDominant: 'Corticotrope' | 'Thyréotrope' | 'Gonadotrope' | 'Somatotrope' | 'Mixte';
    profilSNA: 'Sympathicotonique' | 'Vagotonique' | 'Amphotonique' | 'Dystonique';
    justification: string;
    pedagogicalHint?: string;
    // Champs enrichis depuis VectorStore
    mecanismesCles?: string[];
    facteursPredisposants?: string[];
  };

  neuroVegetative: {
    status: 'Sympathicotonia' | 'Parasympathicotonia' | 'Amphotonia' | 'Eutonia' | 'Dystonia';
    dominance: 'Relative' | 'Absolute';
    explanation: string;
    // NOUVEAU: Champs enrichis depuis VectorStore
    signesCliniques?: string[];
    mecanismePhysiopath?: string;
  };

  endocrineAxes: EndocrineAxis[];

  // NOUVEAU: Analyse du drainage (émonctoires)
  drainage?: DrainageAnalysis;

  // NOUVEAU: Analyse de la spasmophilie
  spasmophilie?: SpasmophilieAnalysis;

  clinicalConcordance: ClinicalConcordance;

  clinicalSynthesis: {
    summary: string;
    concordanceScore: number;
    discordances: string[] | Array<{ axe: string; severite: string; description: string; hypotheses?: string[] }>;
    mecanismesPhysiopathologiques: string[];
    // NOUVEAU: Champs enrichis depuis VectorStore
    correlationBdfInterrogatoire?: string;
    pronosticFonctionnel?: string;
  };

  therapeuticStrategy: TherapeuticStrategy;

  // DÉSACTIVÉ: prescription déplacée vers onglet Ordonnance pour éviter double appel VectorStore
  suggestedPrescription?: SuggestedPrescription | SuggestedPrescriptionEnriched | undefined;

  warnings: string[];
}
