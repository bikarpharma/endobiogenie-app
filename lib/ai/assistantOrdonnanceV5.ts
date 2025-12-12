// lib/ai/assistantOrdonnanceV5.ts
// Service pour générer des ordonnances via OpenAI Assistants API
// VERSION 5.0 - ASSISTANTS API avec VectorStore (26MB docs)
//
// HISTORIQUE:
// v4.0 - Chat Completions API (~4.5k tokens, sans VectorStore)
// v5.0 - Assistants API avec VectorStore complet (meilleure qualité)

import OpenAI from "openai";
import type { DiagnosticResponse } from "./assistantDiagnostic";

// ========================================
// CONFIGURATION
// ========================================

const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 5000,
  pollingIntervalMs: 3000, // Vérifier toutes les 3 secondes (réduit coûts API)
  model: "gpt-4.1",
  // Assistant Expert Ordonnance (configuré dans OpenAI Platform avec VectorStore)
  assistantId: "asst_ftAPObIleEWpkQwOCSN72ERt",
  maxWaitSeconds: 120, // 2 minutes max pour le run
};

// ========================================
// TYPES (réutilisés de v4)
// ========================================

export interface PatientInfoForOrdonnance {
  id: string;
  nom?: string;
  prenom?: string;
  age: number | null;
  sexe: "H" | "F";
  poids?: number | null;
  allergies: string[];
  medicaments_actuels: string[];
  antecedents: string[];
  grossesse?: boolean;
  allaitement?: boolean;
  contre_indications_majeures?: string[];
}

export interface OrdonnanceInput {
  patient: PatientInfoForOrdonnance;
  diagnostic: DiagnosticResponse;
}

export interface OrdonnanceResponse {
  meta: {
    version: string;
    generatedAt: string;
    duree_traitement: string;
    renouvellement: string;
  };
  alertes_securite: AlerteSecurite[];
  volet_drainage?: VoletDrainage;
  volet_canon_endobiogenique: VoletPrescription;
  volet_phyto_elargi: VoletPrescription;
  volet_aromatherapie?: VoletAromatherapie;  // HE dédiées
  volet_micronutrition: VoletMicronutrition;
  conseils_hygiene_vie: string[];
  calendrier_prise: {
    matin_jeun: string[];
    matin_petit_dejeuner: string[];
    midi_avant_repas: string[];
    midi_apres_repas?: string[];
    soir_avant_diner?: string[];
    soir_apres_diner: string[];
    coucher?: string[];
  };
  suivi: {
    prochaine_consultation: string;
    parametres_surveiller: string[];
    examens_suggeres: string[];
  };
  cout_estime: {
    mensuel: string;
    details?: string;
  };
}

export interface AlerteSecurite {
  type: "interaction" | "contre_indication" | "allergie" | "prudence";
  severite: "faible" | "modere" | "majeur";
  message: string;
  action: string;
}

export interface VoletDrainage {
  necessaire: boolean;
  duree: string;
  prescriptions: PrescriptionDrainage[];
}

export interface PrescriptionDrainage {
  plante: string;
  name_latin?: string;
  name_fr?: string;
  partie?: string;
  forme: string;
  posologie: string;
  frequence?: string;
  moment?: string;
  duree: string;
  action: string;
  emonctoire?: string;
  priority?: number;
  justification_terrain?: string;
  justification_classique?: string;
  explication_patient?: string;
}

export interface VoletPrescription {
  description: string;
  prescriptions: PrescriptionPhyto[];
}

export interface PrescriptionPhyto {
  plante: string;
  name_latin?: string;
  name_fr?: string;
  forme: string;
  posologie: string;
  frequence?: string;
  moment?: string;
  duree?: string;
  axe_cible?: string;
  indication?: string;
  mecanisme?: string;
  synergie_avec?: string[];
  endo_covered?: boolean;
  justification_terrain?: string;
  justification_classique?: string;
  explication_patient?: string;
  priority?: 1 | 2 | 3;
}

export interface VoletMicronutrition {
  description: string;
  prescriptions: PrescriptionMicronutrition[];
}

export interface PrescriptionMicronutrition {
  substance: string;
  posologie: string;
  frequence?: string;
  indication: string;
  duree?: string;
  remarque?: string;
}

// ========================================
// VOLET AROMATHÉRAPIE (HE)
// ========================================

/**
 * Voie d'administration HE (Guide Clinique Tunisie)
 */
export type VoieAdministrationHE =
  | "SOLUTION_ORALE"    // Voie 1: Traitement de fond (flacon 125ml, 2ml x 2/j, 30j)
  | "SUPPOSITOIRE"      // Voie 2: Urgence ORL/pulmonaire (2-3/j, 3-6j max)
  | "CUTANEE"           // Voie 3: Action locale ciblée (dilution 5-20% HV)
  | "INHALATION";       // Voie 4: Désinfection ORL (humide/sèche)

/**
 * Prescription d'une huile essentielle
 */
export interface PrescriptionHE {
  huile_essentielle: string;       // Nom courant
  name_latin: string;              // Nom latin botanique OBLIGATOIRE
  chemotype?: string;              // CT spécifique si pertinent
  voie: VoieAdministrationHE;      // Mode d'administration
  posologie: string;               // Ex: "2 gouttes 3x/jour" ou "3 gttes dans 1 CS huile végétale"
  dilution?: string;               // Ex: "10% dans huile végétale" (pour voie cutanée)
  huile_vegetale?: string;         // Ex: "Huile de jojoba" si dilution requise
  duree: string;                   // Ex: "7 jours", "10 jours max"
  moment?: string;                 // Ex: "Matin et soir", "Avant repas"
  zone_application?: string;       // Pour voie cutanée: "Plexus solaire", "Poignets"

  // Justifications (obligatoires)
  axe_cible: string;               // Action endobiogénique
  mecanisme: string;               // Mécanisme d'action
  justification_terrain: string;   // Lien avec diagnostic
  justification_classique: string; // Indication reconnue
  explication_patient: string;     // Vulgarisation

  // Sécurité HE (CRITIQUE)
  contre_indications: string[];    // CI spécifiques HE
  precautions: string[];           // Précautions d'emploi
  synergie_avec?: string[];        // Synergies

  priority: 1 | 2 | 3;
}

/**
 * Volet aromathérapie complet
 */
export interface VoletAromatherapie {
  description: string;
  prescriptions: PrescriptionHE[];
  precautions_generales: string[]; // Précautions globales HE
}

export class OrdonnanceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "OrdonnanceError";
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
      throw new OrdonnanceError("Clé API OpenAI non configurée", "MISSING_API_KEY");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// MUST_FORMS - Formes galéniques obligatoires
// ========================================

const MUST_FORMS_CONTEXT = `
## FORMES GALÉNIQUES OBLIGATOIRES (MUST_FORMS) - NE JAMAIS CONVERTIR

### Bourgeons OBLIGATOIREMENT en MG (Macérat concentré):
- Cassis (Ribes nigrum) - ABSOLU: cortisone-like, JAMAIS en EPS/microsphères
- Tilleul (Tilia tomentosa) - ABSOLU: anxiolytique profond SNA
- Aubépine (Crataegus laevigata) - ABSOLU: cardiotonique/SNA
- Figuier (Ficus carica) - ABSOLU: régulation neurovégétative
- Séquoia (Sequoiadendron giganteum) - ABSOLU: axe somatotrope
- Chêne (Quercus robur) - ABSOLU: adaptogène majeur
- Olivier (Olea europaea) - ABSOLU: HTA/circulation cérébrale
- Romarin (Rosmarinus officinalis MG) - ABSOLU: hépatoprotection
- Noyer (Juglans regia) - FORT: pancréas/flore
- Framboisier (Rubus idaeus) - FORT: axe gonadotrope femme
- Airelle (Vaccinium vitis-idaea) - FORT: régulation hormonale
- Myrtillier (Vaccinium myrtillus) - FORT: microcirculation/rétine
- Bouleau pubescent (Betula pubescens) - FORT: reminéralisation
- Genévrier (Juniperus communis) - FORT: drainage hépatique profond
- Sapin blanc (Abies alba) - FORT: axe somatotrope enfant

### HE OBLIGATOIREMENT en forme pure (pas microsphères):
- Lavande vraie (Lavandula angustifolia) - ABSOLU: anxiolytique/cicatrisant
- Sauge sclarée (Salvia sclarea) - ABSOLU: oestrogen-like
- Thym à thymol (Thymus vulgaris CT phénols) - ABSOLU: anti-infectieux puissant
- Cannelle de Ceylan (Cinnamomum verum) - ABSOLU: antidiabétique/anti-infectieux
- Origan compact (Origanum compactum) - ABSOLU: anti-infectieux majeur
- Tea tree (Melaleuca alternifolia) - FORT: immunostimulant
- Eucalyptus radié (Eucalyptus radiata) - FORT: ORL/bronches
- Ravintsara (Cinnamomum camphora CT cinéole) - FORT: antiviral
- Menthe poivrée (Mentha x piperita) - FORT: digestif/antalgique
- Hélichryse italienne (Helichrysum italicum) - FORT: hématomes/cicatrices

### RÈGLE CRITIQUE
Ne JAMAIS convertir ces plantes MUST vers une autre forme.
Si le terrain nécessite Cassis → prescrire MG 15 gouttes matin à jeun, 5j/7
`;

// ========================================
// FORMATAGE MESSAGE POUR ASSISTANT
// ========================================

function formatMessageForAssistant(input: OrdonnanceInput): string {
  const parts: string[] = [];

  parts.push("# GÉNÉRATION D'ORDONNANCE ENDOBIOGÉNIQUE\n");
  parts.push("Utilise le VectorStore (file_search) pour rechercher les plantes adaptées au terrain.\n");

  // Patient
  parts.push("## PATIENT");
  parts.push(`- Âge: ${input.patient.age || "Non renseigné"} ans`);
  parts.push(`- Sexe: ${input.patient.sexe === "F" ? "Femme" : "Homme"}`);
  if (input.patient.poids) parts.push(`- Poids: ${input.patient.poids} kg`);

  // Allergies
  if (input.patient.allergies.length > 0) {
    parts.push(`\n### ⚠️ ALLERGIES (VÉRIFIER CHAQUE PRESCRIPTION)`);
    input.patient.allergies.forEach(a => parts.push(`- ${a}`));
  } else {
    parts.push(`\n### Allergies: Aucune connue`);
  }

  // Médicaments
  if (input.patient.medicaments_actuels.length > 0) {
    parts.push(`\n### 💊 MÉDICAMENTS EN COURS (VÉRIFIER INTERACTIONS)`);
    input.patient.medicaments_actuels.forEach(m => parts.push(`- ${m}`));
  }

  // Antécédents
  if (input.patient.antecedents.length > 0) {
    parts.push(`\n### 📋 ANTÉCÉDENTS`);
    input.patient.antecedents.forEach(a => parts.push(`- ${a}`));
  }

  // Grossesse/Allaitement
  if (input.patient.sexe === "F") {
    parts.push(`\n### État physiologique`);
    parts.push(`- Grossesse: ${input.patient.grossesse ? "OUI ⚠️" : "Non"}`);
    parts.push(`- Allaitement: ${input.patient.allaitement ? "OUI ⚠️" : "Non"}`);
  }

  // CI majeures
  if (input.patient.contre_indications_majeures?.length) {
    parts.push(`\n### 🚫 CONTRE-INDICATIONS MAJEURES`);
    input.patient.contre_indications_majeures.forEach(ci => parts.push(`- ${ci}`));
  }

  // Diagnostic
  parts.push("\n---\n## DIAGNOSTIC ENDOBIOGÉNIQUE\n");

  parts.push("### Terrain");
  parts.push(`- Axe dominant: ${input.diagnostic.terrain.axeDominant}`);
  parts.push(`- Profil SNA: ${input.diagnostic.terrain.profilSNA}`);
  if (input.diagnostic.terrain.terrainsPrincipaux) {
    parts.push(`- Terrains: ${input.diagnostic.terrain.terrainsPrincipaux.join(", ")}`);
  }
  parts.push(`\n${input.diagnostic.terrain.description}`);

  // Axes
  if (input.diagnostic.axesEndocriniens?.length) {
    parts.push("\n### Axes endocriniens (par priorité)");
    input.diagnostic.axesEndocriniens.forEach(axe => {
      parts.push(`\n**${axe.rang}. ${axe.axe}** - ${axe.status}`);
      parts.push(`   Score: ${axe.score_perturbation}/10`);
      parts.push(`   → ${axe.implication_therapeutique}`);
    });
  }

  // Spasmophilie
  if (input.diagnostic.spasmophilie?.detectee) {
    parts.push("\n### ⚡ Spasmophilie DÉTECTÉE");
    parts.push(`→ INCLURE: Magnésium bisglycinate + Vit B6`);
  }

  // Drainage
  if (input.diagnostic.drainage?.necessaire) {
    parts.push("\n### 🌿 Drainage NÉCESSAIRE");
    parts.push(`- Priorité: ${input.diagnostic.drainage.priorite}`);
    input.diagnostic.drainage.emonctoires_prioritaires?.forEach(em => {
      parts.push(`- ${em.emonctoire}: ${em.plantes.join(", ")}`);
    });
  }

  // CI détectées
  if (input.diagnostic.contre_indications_detectees?.length) {
    parts.push("\n### 🚫 SUBSTANCES À ÉVITER");
    input.diagnostic.contre_indications_detectees.forEach(ci => {
      parts.push(`- ${ci.substance}: ${ci.raison}`);
    });
  }

  // Synthèse
  parts.push("\n### Synthèse praticien");
  parts.push(input.diagnostic.synthese_pour_praticien);

  // MUST_FORMS - CRITIQUE
  parts.push("\n---");
  parts.push(MUST_FORMS_CONTEXT);

  // Instructions de format
  parts.push(`\n---
## FORMAT DE RÉPONSE JSON OBLIGATOIRE

Réponds UNIQUEMENT en JSON valide avec cette structure:
{
  "meta": {"version":"5.0","generatedAt":"ISO","duree_traitement":"2-3 mois","renouvellement":"selon évolution"},
  "alertes_securite": [{"type":"contre_indication|interaction|allergie","severite":"faible|modere|majeur","message":"...","action":"..."}],
  "volet_drainage": {"necessaire":bool,"duree":"15-21j","prescriptions":[{"name_latin":"...","name_fr":"...","forme":"EPS","posologie":"...","duree":"15j","action":"...","emonctoire":"Foie","priority":3,"justification_terrain":"...","justification_classique":"...","explication_patient":"...","synergie_avec":["..."]}]},
  "volet_canon_endobiogenique": {"description":"...","prescriptions":[{"name_latin":"...","name_fr":"...","forme":"MG|EPS","posologie":"...","duree":"2 mois","axe_cible":"...","mecanisme":"...","priority":2,"justification_terrain":"...","justification_classique":"...","explication_patient":"...","synergie_avec":["..."]}]},
  "volet_phyto_elargi": {"description":"...","prescriptions":[{"name_latin":"...","name_fr":"...","forme":"...","posologie":"...","duree":"1 mois","axe_cible":"...","mecanisme":"...","priority":1,"justification_terrain":"...","justification_classique":"...","explication_patient":"...","synergie_avec":["..."]}]},
  "volet_aromatherapie": {"description":"...","precautions_generales":["Toujours diluer avant application cutanée","Ne jamais appliquer pure sur muqueuses"],"prescriptions":[{"huile_essentielle":"...","name_latin":"...","chemotype":"...","voie":"cutanee|orale|diffusion|inhalation","posologie":"...","dilution":"10% HV","huile_vegetale":"Jojoba","duree":"7-10j","zone_application":"...","axe_cible":"...","mecanisme":"...","justification_terrain":"...","justification_classique":"...","explication_patient":"...","contre_indications":["..."],"precautions":["..."],"priority":1}]},
  "volet_micronutrition": {"description":"...","prescriptions":[{"substance":"...","posologie":"...","indication":"...","duree":"3 mois","mecanisme":"..."}]},
  "conseils_hygiene_vie": ["..."],
  "calendrier_prise": {"matin_jeun":["..."],"matin_petit_dejeuner":["..."],"soir_apres_diner":["..."]},
  "suivi": {"prochaine_consultation":"4-6 sem","parametres_surveiller":["..."],"examens_suggeres":[]},
  "cout_estime": {"mensuel":"45-60€","details":"..."}
}

## ⚠️ JUSTIFICATIONS OBLIGATOIRES (Pour CHAQUE plante)

### Règle: JAMAIS de justification vague ou générique !

Pour CHAQUE plante prescrite, tu DOIS fournir :

1. **axe_cible** (OBLIGATOIRE) - Format: "[Axe] - [Action spécifique]"
   ❌ INTERDIT: "Anxiété", "Stress", "Fatigue" (trop vague)
   ✅ REQUIS: "SNA - Alpha-sympatholytique, réduit hyperactivité sympathique"
   ✅ REQUIS: "Corticotrope - Adaptogène, soutient cortisol endogène"
   ✅ REQUIS: "Thyréotrope - Stimule conversion T4→T3 périphérique"

2. **mecanisme** (OBLIGATOIRE) - Mécanisme pharmacologique précis (1-2 phrases)
   ❌ INTERDIT: "Plante calmante traditionnelle"
   ✅ REQUIS: "Action GABAergique - potentialise récepteurs GABA-A. Inhibe recapture sérotonine."
   ✅ REQUIS: "Saponines triterpéniques stimulent synthèse cortisol. Action cortisone-like sans effets secondaires."

3. **justification_terrain** (OBLIGATOIRE) - Connexion avec le DIAGNOSTIC du patient
   ❌ INTERDIT: "Bon pour le terrain"
   ✅ REQUIS: "Index Corticotrope élevé (1.4) → nécessite frein ACTH + soutien surrénalien"
   ✅ REQUIS: "Profil SNA sympathicotonique avec Index α-S > 1.2 → alpha-sympatholytique indiqué"

4. **justification_classique** (OBLIGATOIRE) - Indication phytothérapique reconnue
   ✅ REQUIS: "Monographie HMPC/EMA: anxiolytique, spasmolytique. Études cliniques vs placebo (Akhondzadeh 2001)."
   ✅ REQUIS: "Pharmacopée européenne: draineur hépatobiliaire. Action cholérétique et cholagogue documentée."

5. **explication_patient** (OBLIGATOIRE) - Vulgarisation pour le patient
   ✅ REQUIS: "Cette plante calme le système nerveux suractivé et réduit les tensions musculaires liées au stress."
   ✅ REQUIS: "Ce bourgeon soutient vos glandes surrénales fatiguées pour retrouver de l'énergie naturellement."

6. **synergie_avec** (OPTIONNEL mais recommandé) - Synergies avec CETTE ordonnance
   ✅ REQUIS: ["Potentialise Tilia tomentosa sur axe SNA", "Complète Crataegus sur sphère cardiovasculaire"]
   ⚠️ Ne citer QUE des plantes présentes dans cette ordonnance !

### EXEMPLE COMPLET (volet_canon_endobiogenique)
\`\`\`json
{
  "name_latin": "Ribes nigrum",
  "name_fr": "Cassis",
  "forme": "MG",
  "posologie": "15 gouttes le matin à jeun, 5j/7",
  "duree": "2 mois",
  "priority": 2,
  "axe_cible": "Corticotrope - Adaptogène cortisol-like, soutien surrénalien",
  "mecanisme": "Stimulation du cortex surrénalien via flavonoïdes. Action anti-inflammatoire de type cortisone-like sans effets secondaires. Régulation axe HHS (hypothalamo-hypophyso-surrénalien).",
  "justification_terrain": "Index Corticotrope à 1.35 avec fatigue matinale → hypocorticisme relatif nécessitant soutien adaptatif. Profil d'épuisement surrénalien confirmé par interrogatoire.",
  "justification_classique": "Monographie EMA: anti-inflammatoire, adaptogène. Études Tétau/Bergeret sur gemmothérapie corticotrope. Action synergique cortex/médullosurrénale.",
  "explication_patient": "Ce bourgeon de cassis agit comme un soutien naturel de vos glandes surrénales. Il vous aide à mieux gérer le stress et à retrouver votre énergie, surtout le matin.",
  "synergie_avec": ["Base adaptogène soutenant Sequoia sur axe somatotrope", "Potentialise Passiflora sur régulation SNA"]
}
\`\`\`

## RÈGLES CRITIQUES
1. SÉCURITÉ: Vérifier allergies/médicaments/CI pour CHAQUE plante
2. DRAINAGE D'ABORD si nécessaire (15-21j avant traitement de fond)
3. MUST_FORMS: MG obligatoire pour Cassis/Tilleul/Aubépine/etc.
4. JUSTIFICATIONS OBLIGATOIRES: Remplir TOUS les champs ci-dessus pour CHAQUE plante
5. priority: 1=Aigu/Urgent, 2=Déséquilibre principal, 3=Soutien/Drainage
6. NOMBRE DE PLANTES: Prescrire le nombre NÉCESSAIRE selon la complexité du terrain (typiquement 6-12 plantes). Ne PAS se limiter artificiellement à 4-5 plantes si le cas nécessite plus. Chaque plante doit être justifiée.
7. Utilise file_search pour trouver les meilleures plantes selon le terrain

## 🌿 AROMATHÉRAPIE TUNISIE (volet_aromatherapie) - ⚠️ OBLIGATOIRE SI INDIQUÉ

### 🚨 RÈGLE MAJEURE: Inclure OBLIGATOIREMENT 1-3 HE si UN de ces critères est présent:
- ✅ Profil sympathicotonique ou spasmophilie → HE anxiolytiques OBLIGATOIRES
- ✅ Stress, anxiété, nervosité mentionnés → HE relaxantes OBLIGATOIRES
- ✅ Troubles du sommeil/insomnie → HE sédatives OBLIGATOIRES
- ✅ Infections ORL/bronchiques/sinusite → HE anti-infectieuses OBLIGATOIRES (SUPPOSITOIRES!)
- ✅ Douleurs musculo-articulaires → HE antalgiques OBLIGATOIRES (CUTANÉE!)
- ✅ Troubles digestifs fonctionnels → HE carminatives OBLIGATOIRES
- ✅ Troubles cutanés → HE cicatrisantes OBLIGATOIRES (CUTANÉE!)

### ⛔ NE PAS inclure d'HE UNIQUEMENT si:
- Grossesse 1er trimestre
- Enfant < 3 ans
- Allergie connue aux HE
- Patient refuse explicitement les HE

### 🇹🇳 LES 4 VOIES D'ADMINISTRATION TUNISIE (Guide Clinique)

**VOIE 1: SOLUTION_ORALE (Traitement de FOND - Pathologies chroniques)**
- Formule: 100ml Huile d'Olive + 20ml Labrafil + 4-8g HE
- Posologie: 2ml x 2/jour au milieu du repas
- Durée: 30 jours (1 flacon)
- Indications: dysbiose, prévention, terrain chronique
- Badge: "FOND"

**VOIE 2: SUPPOSITOIRE (URGENCE ORL/Pulmonaire - Infections aiguës)**
- Formule: Base Witepsol + 50-100mg HE/suppo
- Posologie: 2-3 suppositoires/jour
- Durée: 3-6 jours MAX
- Indications: Bronchite aiguë, Grippe, Angine, Otite, Sinusite
- Intérêt: Bypasse le foie, action directe sur arbre respiratoire
- Badge: "AIGU"

**VOIE 3: CUTANEE (Action LOCALE ciblée)**
- Dilutions:
  - Cosmétique: 1-3%
  - Musculaire/Articulaire: 5-10%
  - Thérapeutique systémique: 10-20% (plante des pieds, thorax)
- Huiles végétales: Jojoba, Amande douce, Noisette
- Indications: Douleurs locales, infections cutanées, action nerveuse
- Badge: "LOCAL"

**VOIE 4: INHALATION (Désinfection ORL)**
- Humide: 5-10 gouttes dans eau chaude, 10 min, 2-3x/jour
- Sèche: 2 gouttes sur mouchoir/stick, 5-10x/jour
- Indications: Sinusite, Rhinite, encombrement nasal
- Badge: "ORL"

### CHOIX DE LA VOIE (OBLIGATOIRE - champ "voie")
| Indication | Voie à prescrire |
|------------|------------------|
| Pathologie chronique, dysbiose, terrain | SOLUTION_ORALE |
| Bronchite, Grippe, Angine, Otite, Sinusite AIGUË | SUPPOSITOIRE |
| Douleur musculaire/articulaire locale | CUTANEE |
| Rhinite, Nez bouché, Encombrement | INHALATION |
| Anxiété, Stress, SNA (application plexus) | CUTANEE |
| Prévention infections hiver | SOLUTION_ORALE |

### HE INCONTOURNABLES (selon terrain)
- **Anxiété/Stress**: Lavandula angustifolia (Lavande vraie) → CUTANEE, Citrus aurantium feuilles (Petit grain) → CUTANEE
- **Insomnie**: Citrus reticulata (Mandarine) → CUTANEE, Cananga odorata (Ylang-ylang) → CUTANEE
- **Infections ORL AIGUËS**: Eucalyptus radiata, Cinnamomum camphora (Ravintsara), Melaleuca alternifolia (Tea tree) → SUPPOSITOIRE
- **Infections chroniques**: Mêmes HE → SOLUTION_ORALE
- **Anti-inflammatoire local**: Helichrysum italicum (Hélichryse), Gaultheria procumbens (Gaulthérie) → CUTANEE
- **Digestif**: Mentha x piperita (Menthe poivrée), Ocimum basilicum (Basilic) → SOLUTION_ORALE
- **Spasmophilie/SNA**: Lavandula angustifolia, Chamaemelum nobile (Camomille romaine), Origanum majorana (Marjolaine) → CUTANEE

### CI ABSOLUES HE (ALERTES)
- ⛔ Grossesse 1er trimestre: AUCUNE HE
- ⛔ Grossesse 2-3ème trimestre: très limité (Lavande vraie CUTANEE possible)
- ⛔ Enfants <3 ans: AUCUNE HE par voie orale ni suppositoire
- ⛔ Enfants <6 ans: AUCUNE HE par voie orale (suppositoire possible doses adaptées)
- ⛔ Épilepsie: éviter menthe, romarin, eucalyptus, sauge
- ⛔ HE hépatotoxiques (phénols): cure courte 7-10j max
- ⛔ Asthme: prudence inhalation, éviter menthe
- ⛔ PÉDIATRIE ABSOLUE: Menthe poivrée (spasme laryngé), Sauge officinale, Hysope (cétones neurotoxiques)

### EXEMPLE HE - VOIE CUTANÉE (SNA/Stress)
\`\`\`json
{
  "huile_essentielle": "Lavande vraie",
  "name_latin": "Lavandula angustifolia",
  "voie": "CUTANEE",
  "posologie": "3 gouttes diluées 10% matin et soir",
  "dilution": "10%",
  "huile_vegetale": "Jojoba",
  "duree": "15 jours renouvelables",
  "zone_application": "Plexus solaire et poignets",
  "axe_cible": "SNA - Rééquilibrage neurovégétatif, action parasympathomimétique",
  "mecanisme": "Linalol et acétate de linalyle: action GABAergique, inhibition recapture sérotonine.",
  "justification_terrain": "Profil sympathicotonique marqué (Index α-S: 1.35). Spasmophilie détectée.",
  "justification_classique": "Monographie EMA: anxiolytique, sédatif léger.",
  "explication_patient": "Cette huile de lavande apaise votre système nerveux suractivé.",
  "contre_indications": ["Allergie aux Lamiacées"],
  "precautions": ["Éviter contact yeux", "Test cutané préalable"],
  "priority": 1
}
\`\`\`

### EXEMPLE HE - SUPPOSITOIRE (Infection ORL aiguë)
\`\`\`json
{
  "huile_essentielle": "Ravintsara",
  "name_latin": "Cinnamomum camphora CT cinéole",
  "voie": "SUPPOSITOIRE",
  "posologie": "1 suppositoire matin et soir",
  "duree": "5 jours",
  "axe_cible": "Immunité - Antiviral majeur",
  "mecanisme": "1,8-cinéole: mucolytique, antiviral. Bypasse métabolisme hépatique.",
  "justification_terrain": "Bronchite aiguë avec encombrement. Terrain viral actif.",
  "justification_classique": "Antiviral large spectre reconnu. Action directe pulmonaire via circulation.",
  "explication_patient": "Ce suppositoire agit directement sur vos bronches sans fatiguer votre foie.",
  "contre_indications": ["Enfant < 6 ans", "Grossesse"],
  "precautions": ["Cure courte 5 jours max"],
  "priority": 1
}
\`\`\`

### EXEMPLE HE - SOLUTION ORALE (Fond chronique)
\`\`\`json
{
  "huile_essentielle": "Tea tree",
  "name_latin": "Melaleuca alternifolia",
  "voie": "SOLUTION_ORALE",
  "posologie": "2ml matin et 2ml soir au repas",
  "duree": "30 jours",
  "axe_cible": "Immunité - Antibactérien, antifongique",
  "mecanisme": "Terpinène-4-ol: immunostimulant, antibactérien large spectre.",
  "justification_terrain": "Infections ORL récidivantes. Terrain immunodéprimé.",
  "justification_classique": "Monographie EMA: infections cutanées et muqueuses.",
  "explication_patient": "Cette préparation renforce vos défenses sur la durée.",
  "contre_indications": ["Enfant < 6 ans"],
  "precautions": ["Prendre au repas pour tolérance digestive"],
  "priority": 2
}
\`\`\`

Réponds UNIQUEMENT JSON valide.`);

  return parts.join("\n");
}

// ========================================
// PARSER RÉPONSE
// ========================================

function parseOrdonnanceResponse(content: string): OrdonnanceResponse {
  console.log("[AssistantOrdonnanceV5] Parsing réponse...");

  let cleanContent = content.trim();

  // Enlever markdown
  if (cleanContent.startsWith("```json")) cleanContent = cleanContent.slice(7);
  else if (cleanContent.startsWith("```")) cleanContent = cleanContent.slice(3);
  if (cleanContent.endsWith("```")) cleanContent = cleanContent.slice(0, -3);
  cleanContent = cleanContent.trim();

  // Extraire JSON si nécessaire
  if (!cleanContent.startsWith("{")) {
    const startIndex = cleanContent.indexOf("{");
    const endIndex = cleanContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex > startIndex) {
      cleanContent = cleanContent.substring(startIndex, endIndex + 1);
    }
  }

  try {
    return JSON.parse(cleanContent) as OrdonnanceResponse;
  } catch (e) {
    console.error("[AssistantOrdonnanceV5] Erreur JSON:", (e as Error).message);
    throw new OrdonnanceError(
      "Impossible de parser la réponse JSON",
      "PARSE_ERROR",
      { content: content.substring(0, 500), error: (e as Error).message }
    );
  }
}

// ========================================
// FONCTION PRINCIPALE - ASSISTANTS API
// ========================================

export interface CallOrdonnanceOptions {
  maxRetries?: number;
}

/**
 * Génère une ordonnance via OpenAI Assistants API
 * VERSION 5.0 - Avec VectorStore (26MB docs phyto/gemmo/aroma/endobiogénie)
 */
export async function callOrdonnanceAssistantV5(
  input: OrdonnanceInput,
  options: CallOrdonnanceOptions = {}
): Promise<OrdonnanceResponse> {
  const config = {
    maxRetries: options.maxRetries ?? DEFAULT_CONFIG.maxRetries,
  };

  const openai = getOpenAIClient();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      console.log(`[OrdonnanceV5] Tentative ${attempt}/${config.maxRetries} via Assistants API...`);
      console.log(`[OrdonnanceV5] Assistant ID: ${DEFAULT_CONFIG.assistantId}`);

      // Préparer le message
      const userMessage = formatMessageForAssistant(input);
      console.log(`[OrdonnanceV5] Message: ${userMessage.length} caractères`);

      // Créer un thread
      const thread = await openai.beta.threads.create({
        messages: [{ role: "user", content: userMessage }],
      });
      console.log(`[OrdonnanceV5] Thread créé: ${thread.id}`);

      // Lancer le run
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: DEFAULT_CONFIG.assistantId,
      });
      console.log(`[OrdonnanceV5] Run lancé: ${run.id}`);

      // Polling jusqu'à complétion
      let runStatus = run;
      let waitTime = 0;
      const maxWait = DEFAULT_CONFIG.maxWaitSeconds * 1000;

      while (
        runStatus.status !== "completed" &&
        runStatus.status !== "failed" &&
        runStatus.status !== "cancelled" &&
        waitTime < maxWait
      ) {
        await sleep(DEFAULT_CONFIG.pollingIntervalMs);
        waitTime += DEFAULT_CONFIG.pollingIntervalMs;
        runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });

        if (waitTime % 15000 === 0) {
          console.log(`[OrdonnanceV5] Status: ${runStatus.status} (${waitTime / 1000}s)`);
        }
      }

      if (runStatus.status === "failed") {
        throw new OrdonnanceError(
          `Run failed: ${runStatus.last_error?.message || "Unknown error"}`,
          "RUN_FAILED",
          runStatus.last_error
        );
      }

      if (runStatus.status !== "completed") {
        throw new OrdonnanceError(
          `Run timeout after ${DEFAULT_CONFIG.maxWaitSeconds}s`,
          "RUN_TIMEOUT"
        );
      }

      console.log(`[OrdonnanceV5] Run complété en ${waitTime / 1000}s`);

      // Récupérer les messages
      const messages = await openai.beta.threads.messages.list(thread.id, {
        order: "desc",
        limit: 1,
      });

      const assistantMsg = messages.data[0];
      if (!assistantMsg || assistantMsg.role !== "assistant") {
        throw new OrdonnanceError("Pas de réponse de l'assistant", "NO_RESPONSE");
      }

      const textContent = assistantMsg.content.find(c => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new OrdonnanceError("Réponse sans contenu texte", "NO_TEXT_CONTENT");
      }

      const content = textContent.text.value;
      console.log(`[OrdonnanceV5] Réponse: ${content.length} caractères`);

      // Parser
      const response = parseOrdonnanceResponse(content);
      console.log(`[OrdonnanceV5] ✅ Ordonnance V5 générée avec succès`);

      // Stats
      const stats = {
        drainage: response.volet_drainage?.prescriptions?.length || 0,
        canon: response.volet_canon_endobiogenique?.prescriptions?.length || 0,
        phyto: response.volet_phyto_elargi?.prescriptions?.length || 0,
        micro: response.volet_micronutrition?.prescriptions?.length || 0,
        alertes: response.alertes_securite?.length || 0,
      };
      console.log(`[OrdonnanceV5] Stats: Drainage=${stats.drainage}, Canon=${stats.canon}, Phyto=${stats.phyto}, Micro=${stats.micro}, Alertes=${stats.alertes}`);

      return response;

    } catch (error) {
      lastError = error as Error;
      console.error(`[OrdonnanceV5] ❌ Erreur tentative ${attempt}:`, lastError.message);

      if (error instanceof OrdonnanceError) {
        if (["MISSING_API_KEY", "PARSE_ERROR"].includes(error.code)) {
          throw error;
        }
      }

      if (attempt < config.maxRetries) {
        const delay = DEFAULT_CONFIG.retryDelayMs * attempt;
        console.log(`[OrdonnanceV5] Attente ${delay}ms avant retry...`);
        await sleep(delay);
      }
    }
  }

  throw new OrdonnanceError(
    `Échec après ${config.maxRetries} tentatives: ${lastError?.message}`,
    "MAX_RETRIES_EXCEEDED",
    { lastError }
  );
}

// ========================================
// EXPORT
// ========================================

export default {
  callOrdonnanceAssistantV5,
  OrdonnanceError,
};
