// lib/ai/assistantOrdonnance.ts
// Service pour générer des ordonnances via OpenAI
// VERSION 4.0 - CHAT COMPLETIONS API (Solution B - sans VectorStore)
//
// HISTORIQUE:
// v3.0 - Assistants API avec VectorStore (~29k tokens/requête → Rate limit)
// v4.0 - Chat Completions API direct (~4.5k tokens/requête → OK)

import OpenAI from "openai";
import type { DiagnosticResponse } from "./assistantDiagnostic";

// ========================================
// CONFIGURATION
// ========================================

const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 5000, // 5 secondes (plus besoin de 15s car pas de rate limit)
  model: "gpt-4.1", // Modèle premium pour qualité maximale
};

// ========================================
// TYPES D'ENTRÉE
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
  // PAS DE SCOPE - L'IA choisit la meilleure forme selon l'indication
}

// ========================================
// TYPES DE SORTIE (Ordonnance générée)
// ========================================

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
  partie?: string;
  forme: string;
  posologie: string;
  frequence?: string;
  moment?: string;
  duree: string;
  action: string;
  emonctoire?: string;
}

export interface VoletPrescription {
  description: string;
  prescriptions: PrescriptionPhyto[];
}

export interface PrescriptionPhyto {
  plante: string;
  forme: string;
  posologie: string;
  frequence?: string;
  moment?: string;
  duree?: string;
  axe_cible?: string;
  indication?: string;
  mecanisme?: string;
  synergie_avec?: string[];
  endo_covered?: boolean; // true = profil terrain documenté, false = propriétés classiques
  justification_terrain?: string;
  justification_classique?: string;
  explication_patient?: string;
  priority?: 1 | 2 | 3; // 1=Aigu/Urgent, 2=Déséquilibre principal, 3=Soutien/Drainage
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
// TYPES D'ERREUR
// ========================================

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
      throw new OrdonnanceError(
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formate les données pour l'Assistant Ordonnance
 * VERSION 3.0 - SANS SCOPE
 */
function formatMessageForOrdonnance(input: OrdonnanceInput): string {
  const parts: string[] = [];

  // En-tête
  parts.push("# DONNÉES POUR GÉNÉRATION D'ORDONNANCE\n");

  // Patient
  parts.push("## PATIENT");
  parts.push(`- Âge : ${input.patient.age || "Non renseigné"} ans`);
  parts.push(`- Sexe : ${input.patient.sexe === "F" ? "Femme" : "Homme"}`);
  if (input.patient.poids) {
    parts.push(`- Poids : ${input.patient.poids} kg`);
  }

  // Allergies - CRITIQUE POUR LA SÉCURITÉ
  if (input.patient.allergies.length > 0) {
    parts.push(`\n### ⚠️ ALLERGIES (VÉRIFIER CHAQUE PRESCRIPTION)`);
    input.patient.allergies.forEach(a => parts.push(`- ${a}`));
  } else {
    parts.push(`\n### Allergies : Aucune connue`);
  }

  // Médicaments actuels - CRITIQUE POUR LES INTERACTIONS
  if (input.patient.medicaments_actuels.length > 0) {
    parts.push(`\n### 💊 MÉDICAMENTS EN COURS (VÉRIFIER INTERACTIONS)`);
    input.patient.medicaments_actuels.forEach(m => parts.push(`- ${m}`));
  } else {
    parts.push(`\n### Médicaments : Aucun`);
  }

  // Antécédents
  if (input.patient.antecedents.length > 0) {
    parts.push(`\n### 📋 ANTÉCÉDENTS`);
    input.patient.antecedents.forEach(a => parts.push(`- ${a}`));
  }

  // Grossesse / Allaitement - CRITIQUE
  if (input.patient.sexe === "F") {
    parts.push(`\n### État physiologique`);
    parts.push(`- Grossesse : ${input.patient.grossesse ? "OUI ⚠️ ADAPTER LES PRESCRIPTIONS" : "Non"}`);
    parts.push(`- Allaitement : ${input.patient.allaitement ? "OUI ⚠️ ADAPTER LES PRESCRIPTIONS" : "Non"}`);
  }

  // Contre-indications majeures
  if (input.patient.contre_indications_majeures && input.patient.contre_indications_majeures.length > 0) {
    parts.push(`\n### 🚫 CONTRE-INDICATIONS MAJEURES`);
    input.patient.contre_indications_majeures.forEach(ci => parts.push(`- ${ci}`));
  }

  // Diagnostic reçu
  parts.push("\n---\n");
  parts.push("## DIAGNOSTIC (de l'Assistant Diagnostic)\n");

  // Terrain
  parts.push("### Terrain");
  parts.push(`- Axe dominant : ${input.diagnostic.terrain.axeDominant}`);
  parts.push(`- Profil SNA : ${input.diagnostic.terrain.profilSNA}`);
  if (input.diagnostic.terrain.terrainsPrincipaux) {
    parts.push(`- Terrains : ${input.diagnostic.terrain.terrainsPrincipaux.join(", ")}`);
  }
  parts.push(`\n${input.diagnostic.terrain.description}`);

  // Axes endocriniens
  if (input.diagnostic.axesEndocriniens && input.diagnostic.axesEndocriniens.length > 0) {
    parts.push("\n### Axes endocriniens (par priorité)");
    input.diagnostic.axesEndocriniens.forEach(axe => {
      parts.push(`\n**${axe.rang}. ${axe.axe}** - ${axe.status}`);
      parts.push(`   Score perturbation : ${axe.score_perturbation}/10`);
      parts.push(`   → ${axe.implication_therapeutique}`);
    });
  }

  // Spasmophilie
  if (input.diagnostic.spasmophilie?.detectee) {
    parts.push("\n### ⚡ Spasmophilie DÉTECTÉE");
    parts.push(`- Type : ${input.diagnostic.spasmophilie.type_probable || "Non précisé"}`);
    parts.push(`- Probabilité : ${Math.round((input.diagnostic.spasmophilie.probabilite || 0) * 100)}%`);
    parts.push(`→ INCLURE obligatoirement : Magnésium bisglycinate + Vit B6`);
  }

  // Drainage
  if (input.diagnostic.drainage?.necessaire) {
    parts.push("\n### 🌿 Drainage NÉCESSAIRE");
    parts.push(`- Priorité : ${input.diagnostic.drainage.priorite}`);
    if (input.diagnostic.drainage.emonctoires_prioritaires) {
      input.diagnostic.drainage.emonctoires_prioritaires.forEach(em => {
        parts.push(`- ${em.emonctoire} : ${em.plantes.join(", ")}`);
      });
    }
  }

  // Contre-indications détectées par le diagnostic
  if (input.diagnostic.contre_indications_detectees && input.diagnostic.contre_indications_detectees.length > 0) {
    parts.push("\n### 🚫 SUBSTANCES À ÉVITER (CI détectées)");
    input.diagnostic.contre_indications_detectees.forEach(ci => {
      parts.push(`- ${ci.substance} : ${ci.raison} → Alternative : ${ci.alternative || "à définir"}`);
    });
  }

  // Synthèse praticien
  parts.push("\n### Synthèse");
  parts.push(input.diagnostic.synthese_pour_praticien);

  // INSTRUCTIONS OPTIMISÉES (réduction tokens ~50%)
  parts.push("\n---\n## INSTRUCTIONS\n");
  parts.push(`Choisis la MEILLEURE FORME pour chaque indication:
- EPS: standard, bonne biodispo
- MG 1DH: OBLIGATOIRE si axe corticotrope (Ribes), SNA (Tilia, Crataegus)
- HE: actions ciblées
- Gélules: micronutrition

## FORMAT JSON OBLIGATOIRE
{
  "meta": {"version":"3.0","generatedAt":"ISO","duree_traitement":"2-3 mois","renouvellement":"selon évolution"},
  "alertes_securite": [{"type":"contre_indication|interaction|allergie","severite":"faible|modere|majeur","message":"...","action":"..."}],
  "volet_drainage": {"necessaire":bool,"duree":"15-21j","prescriptions":[{"name_latin":"Taraxacum officinale","name_fr":"Pissenlit","forme":"EPS","posologie":"5ml matin","duree":"15j","action":"Drainage hépatique","emonctoire":"Foie","priority":3,"justification_terrain":"Prépare le terrain - décongestionnant hépatobiliaire avant traitement de fond","justification_classique":"Taraxacine et lactones sesquiterpéniques: stimulation sécrétion biliaire (+40%), activation CYP450. Inuline: prébiotique intestinal","explication_patient":"Cette plante aide votre foie à mieux éliminer les toxines"}]},
  "volet_canon_endobiogenique": {"description":"Traitement terrain","prescriptions":[{"name_latin":"Ribes nigrum","name_fr":"Cassis","forme":"MG","posologie":"15 gouttes matin à jeun","duree":"2 mois","axe_cible":"Axe corticotrope","mecanisme":"Cortisol-like, anti-inflammatoire","priority":2,"justification_terrain":"Stimulation axe HPA, soutien surrénalien","justification_classique":"Flavonoïdes, proanthocyanidines - inhibition COX-2, modulation cortisol","explication_patient":"Cette plante aide votre corps à mieux gérer le stress"}]},
  "volet_phyto_elargi": {"description":"Symptomatique","prescriptions":[{"name_latin":"Passiflora incarnata","name_fr":"Passiflore","forme":"EPS","posologie":"5ml soir","duree":"1 mois","axe_cible":"SNA","mecanisme":"GABAergique, anxiolytique","priority":1,"justification_terrain":"Régulation sympathique","justification_classique":"Flavonoïdes C-glycosylés - agoniste GABA-A","explication_patient":"Calme naturellement l'anxiété et améliore le sommeil"}]},
  "volet_micronutrition": {"description":"Cofacteurs","prescriptions":[{"substance":"Magnésium bisglycinate","posologie":"300mg soir","indication":"Cofacteur enzymatique, SNA","duree":"3 mois"}]},
  "conseils_hygiene_vie": ["Marche 30min/jour","Éviter écrans 1h avant coucher","Respiration abdominale 5min matin","Hydratation 1.5L/jour"],
  "calendrier_prise": {"matin_jeun":["Cassis MG 15gtt"],"matin_petit_dejeuner":["EPS 5ml"],"soir_apres_diner":["Passiflore EPS 5ml","Magnésium 300mg"]},
  "suivi": {"prochaine_consultation":"4-6 sem","parametres_surveiller":["Qualité sommeil","Niveau stress"],"examens_suggeres":[]},
  "cout_estime": {"mensuel":"45-60€","details":"MG ~15€, EPS ~25€, Magnésium ~10€"}
}

## RÈGLES
1. SÉCURITÉ: Vérifier allergies/médicaments/CI pour CHAQUE plante
2. DRAINAGE D'ABORD si nécessaire (15-21j)
3. MG obligatoire si axe corticotrope/SNA
4. TOUTES les plantes (y compris drainage): justification_terrain + justification_classique SCIENTIFIQUE (principes actifs, mécanismes, études. JAMAIS "traditionnel")
5. explication_patient: phrase simple motivante pour le patient
6. calendrier_prise: QUAND prendre chaque produit
7. MAX 8-10 substances

Réponds UNIQUEMENT JSON valide.`);

  return parts.join("\n");
}

/**
 * Parse la réponse JSON de l'Assistant
 */
function parseOrdonnanceResponse(content: string): OrdonnanceResponse {
  console.log("[AssistantOrdonnance] Réponse brute (500 premiers caractères):", content.substring(0, 500));
  console.log("[AssistantOrdonnance] Longueur totale:", content.length);

  let cleanContent = content.trim();

  // Enlever les balises markdown
  if (cleanContent.startsWith("```json")) {
    cleanContent = cleanContent.slice(7);
  } else if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.slice(3);
  }

  if (cleanContent.endsWith("```")) {
    cleanContent = cleanContent.slice(0, -3);
  }

  cleanContent = cleanContent.trim();

  // Essayer de trouver le JSON dans la réponse si ce n'est pas déjà du JSON pur
  if (!cleanContent.startsWith("{") && !cleanContent.startsWith("[")) {
    // Chercher le premier { et le dernier }
    const startIndex = cleanContent.indexOf("{");
    const endIndex = cleanContent.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      console.log("[AssistantOrdonnance] JSON extrait de la position", startIndex, "à", endIndex);
      cleanContent = cleanContent.substring(startIndex, endIndex + 1);
    }
  }

  console.log("[AssistantOrdonnance] Contenu nettoyé (200 premiers caractères):", cleanContent.substring(0, 200));

  try {
    const parsed = JSON.parse(cleanContent);
    
    // Validation minimale
    if (!parsed.volet_canon_endobiogenique && !parsed.volet_phyto_elargi) {
      console.warn("[AssistantOrdonnance] ⚠️ Réponse sans volets principaux");
    }
    
    return parsed as OrdonnanceResponse;
  } catch (e) {
    console.error("[AssistantOrdonnance] Erreur JSON:", (e as Error).message);
    console.error("[AssistantOrdonnance] Contenu problématique:", cleanContent.substring(0, 1000));
    throw new OrdonnanceError(
      "Impossible de parser la réponse JSON de l'Assistant Ordonnance",
      "PARSE_ERROR",
      { content: content.substring(0, 1000), error: (e as Error).message }
    );
  }
}

// ========================================
// SYSTEM PROMPT - Connaissances intégrées
// ========================================

const SYSTEM_PROMPT = `Tu es le Dr LAPRAZ, expert en endobiogénie et médecine fonctionnelle.
Tu génères des ordonnances thérapeutiques personnalisées selon les principes de l'Endobiogénie.

## RÈGLE CRITIQUE - STRUCTURE DE L'ORDONNANCE PAR PRIORITÉ

L'ordonnance DOIT être organisée par PRIORITÉ SYMPTOMATIQUE dans cet ordre :

### PRIORITÉ 1 - SYMPTÔMES AIGUS / URGENTS
- Douleur (dysménorrhée, céphalées, douleurs articulaires)
- Inflammation active (infection ORL, digestive, cutanée)
- Troubles aigus (insomnie sévère, anxiété aiguë, spasmes)

### PRIORITÉ 2 - DÉSÉQUILIBRES PRINCIPAUX (Axes neuro-endocriniens)
- Axe corticotrope (fatigue chronique, stress, adaptation)
- Axe thyréotrope (métabolisme, frilosité, prise de poids)
- Axe gonadotrope (troubles hormonaux, SPM, ménopause)
- Axe somatotrope (croissance, réparation tissulaire)
- SNA (sympathicotonie, vagotonie)

### PRIORITÉ 3 - SOUTIEN / DRAINAGE / TERRAIN
- Drainage hépatique, rénal, lymphatique
- Reminéralisation, micronutrition
- Soutien immunitaire de fond

## RÈGLE CRITIQUE - NOMS DES PLANTES
Pour CHAQUE plante prescrite, tu DOIS fournir:
- **name_latin**: Nom latin complet (ex: "Eleutherococcus senticosus")
- **name_fr**: Nom français (ex: "Éleuthérocoque")
- **priority**: 1, 2 ou 3 selon la priorité symptomatique

## BASE SCIENTIFIQUE PHYTOTHÉRAPIQUE (Manuel de Phytothérapie Lorrain 2024)

### Principales Plantes et leurs Mécanismes d'Action

**ANXIÉTÉ / STRESS / SOMMEIL**
- Passiflore (Passiflora incarnata): GABAergique, récepteurs benzodiazépines, anxiolytique sans dépendance
- Valériane (Valeriana officinalis): GABA, sédatif, améliore qualité du sommeil
- Eschscholtzia (Eschscholtzia californica): Alcaloïdes isoquinoléiques, anxiolytique-sédatif
- Mélisse (Melissa officinalis): Inhibition GABA-transaminase, anxiolytique léger, antispasmodique

**INFLAMMATION / DOULEUR**
- Harpagophytum (Harpagophytum procumbens): Anti-COX-2, anti-inflammatoire articulaire
- Saule (Salix alba): Salicine → acide salicylique, antalgique naturel
- Curcuma (Curcuma longa): Curcuminoïdes, anti-NF-κB, anti-inflammatoire puissant
- Boswellia (Boswellia serrata): Acides boswelliques, anti-5-lipoxygénase

**DIGESTION / HÉPATO-BILIAIRE**
- Artichaut (Cynara scolymus): Cynarine, cholérétique, hépatoprotecteur
- Chardon-Marie (Silybum marianum): Silymarine, régénérateur hépatocyte
- Desmodium (Desmodium adscendens): Hépatoprotecteur majeur, cytolyse
- Achillée (Achillea millefolium): Antispasmodique, cholérétique, gastroprotecteur

**IMMUNITÉ / INFECTIONS**
- Échinacée (Echinacea purpurea): Immunostimulant, activation macrophages
- Cyprès (Cupressus sempervirens): Antiviral (proanthocyanidines), ORL
- Sureau (Sambucus nigra): Antiviral, fébrifuge, sudorifique
- Propolis: Antibactérien large spectre, immunomodulateur

**CIRCULATION / CARDIOVASCULAIRE**
- Vigne rouge (Vitis vinifera): Anthocyanes, veinotonique, insuffisance veineuse
- Ginkgo (Ginkgo biloba): Ginkgolides, microcirculation cérébrale
- Olivier (Olea europaea): Hypotenseur, antioxydant cardiovasculaire
- Aubépine (Crataegus): Flavonoïdes, cardiotonique, régulateur rythme

**HORMONES FÉMININES**
- Gattilier (Vitex agnus-castus): Dopaminergique, anti-prolactine, régulateur cycle
- Alchémille (Alchemilla vulgaris): Progestatif-like, SPM, règles abondantes
- Achillée (Achillea millefolium): Antispasmodique utérin, dysménorrhée
- Sauge officinale (Salvia officinalis): Oestrogen-like, bouffées de chaleur (CI cancer hormono-dépendant)

**ADAPTOGÈNES / FATIGUE**
- Rhodiola (Rhodiola rosea): Salidroside, adaptogène, résistance au stress
- Éleuthérocoque (Eleutherococcus senticosus): Éleuthérosides, adaptogène, performance
- Ginseng (Panax ginseng): Ginsénosides, tonique général, fatigue chronique
- Ashwagandha (Withania somnifera): Withanolides, adaptogène, anxiolytique

## AXES NEURO-ENDOCRINIENS (Endobiogénie)

### Axe Corticotrope (HPA)
- Cassis (Ribes nigrum) - MG obligatoire: Cortisol-like, anti-inflammatoire, adaptogène
- Réglisse (Glycyrrhiza glabra): Glycyrrhizine, cortisol-like (CI HTA, hypokaliémie)
- Éleuthérocoque: Adaptogène, soutien surrénalien
- Rhodiola: Modulation cortisol, résistance stress

### Axe Thyréotrope
- Fucus (Fucus vesiculosus): Iode organique, stimulant thyroïdien (CI hyperthyroïdie)
- Avoine (Avena sativa): Tonique nerveux et thyroïdien
- Lycope (Lycopus europaeus): Anti-TSH, hyperthyroïdie fonctionnelle

### Axe Gonadotrope
- Gattilier (Vitex agnus-castus): Femme, dopaminergique, régulateur LH/FSH
- Framboisier (Rubus idaeus) MG: Femme, utérotrope, régulateur hormonal
- Tribulus (Tribulus terrestris): Homme, LH, testostérone
- Séquoia (Sequoiadendron giganteum) MG: Homme, androgènes surrénaliens

### Système Nerveux Autonome (SNA)
- **Sympathicotonie** (stress, tachycardie, HTA):
  - Aubépine (Crataegus laevigata) MG: Cardiotonique, régulateur rythme
  - Tilleul (Tilia tomentosa) MG: Anxiolytique profond, sédatif SNA
  - Passiflore: GABAergique, anxiolytique

- **Vagotonie** (hypotension, bradycardie, fatigue):
  - Romarin (Rosmarinus officinalis): Tonique, sympathomimétique léger
  - Thym (Thymus vulgaris): Tonique général, immunostimulant

### Formes Galéniques (Tunisie)
- **EPS** (Extraits Plantes Standardisés): 5ml le matin dans un peu d'eau (flacon 180ml = max 4 plantes)
- **MG** (Macérats concentrés de bourgeons): 15 gouttes le matin à jeun, 5 JOURS SUR 7
- **HE** (Huiles Essentielles):
  - Voie orale: 1-2 gouttes sur support (miel, huile), 2-3x/jour
  - Voie cutanée: Diluée 5-20% dans huile végétale
  - Diffusion: 20-30 minutes, 2-3x/jour
- **Microsphères**: 2-3 gélules/jour (400mg ou 600mg/gélule)
- **EPF** (Extraits Plantes Fraîches): 15 gouttes matin et soir sous la langue (~16 plantes dispo en Tunisie)

### FORMES GALÉNIQUES OBLIGATOIRES (MUST)
ATTENTION: Certaines plantes DOIVENT être prescrites dans une forme spécifique pour garantir l'efficacité thérapeutique.

**Bourgeons OBLIGATOIREMENT en MG (Macérat concentré):**
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

**HE OBLIGATOIREMENT en forme pure (pas microsphères):**
- Lavande vraie (Lavandula angustifolia) - ABSOLU: anxiolytique/cicatrisant
- Sauge sclarée (Salvia sclarea) - ABSOLU: oestrogen-like
- Thym à thymol/carvacrol (Thymus vulgaris CT phénols) - ABSOLU: anti-infectieux puissant
- Cannelle de Ceylan (Cinnamomum verum) - ABSOLU: antidiabétique/anti-infectieux
- Origan compact (Origanum compactum) - ABSOLU: anti-infectieux majeur
- Tea tree (Melaleuca alternifolia) - FORT: immunostimulant
- Eucalyptus radié (Eucalyptus radiata) - FORT: ORL/bronches
- Ravintsara (Cinnamomum camphora CT cinéole) - FORT: antiviral
- Menthe poivrée (Mentha x piperita) - FORT: digestif/antalgique
- Hélichryse italienne (Helichrysum italicum) - FORT: hématomes/cicatrices
- Anis vert (Pimpinella anisum) - FORT: digestif/expectorant

**RÈGLE CRITIQUE**: Ne JAMAIS convertir ces plantes MUST vers une autre forme. Si le patient a besoin de Cassis → prescrire MG, même si EPS demandé.

### Drainage (15-21 jours AVANT traitement de fond)
- **Foie**:
  - Pissenlit (Taraxacum officinalis)
  - Artichaut (Cynara scolymus)
  - Desmodium (Desmodium adscendens)

- **Rein** (⚠️ Solidago NON DISPONIBLE en Tunisie):
  - Orthosiphon (Orthosiphon aristatus)
  - Piloselle (Hieracium pilosella)
  - Prêle (Equisetum arvense)

- **Peau**:
  - Bardane (Arctium lappa)
  - Pensée sauvage (Viola tricolor)
  - Fumeterre (Fumaria officinalis)

## RÈGLES DE PRESCRIPTION

### Posologies Standard Tunisie
- EPS: 5ml le matin dans un peu d'eau
- MG concentré: 15 gouttes le matin à jeun, 5 JOURS SUR 7
- Microsphères: 2 gélules matin et soir (400-600mg)
- HE orale: 1-2 gouttes sur support, 2-3x/jour
- EPF: 15 gouttes matin et soir sous la langue

### Justifications OBLIGATOIRES pour chaque plante
1. **justification_terrain**: Logique endobiogénique
2. **justification_classique**: Base scientifique (principes actifs, mécanisme)
3. **explication_patient**: Phrase simple et motivante

## SÉCURITÉ IMPÉRATIVE
- Vérifier CHAQUE plante vs allergies déclarées
- Vérifier interactions médicamenteuses
- CI grossesse: HE, Vitex, plantes hormonales
- CI HTA: Glycyrrhiza glabra
- CI photosensibilisation: Hypericum perforatum

## FORMAT DE RÉPONSE
Réponds UNIQUEMENT en JSON valide. Pour chaque plante:
{
  "plant_id": "nom_latin_en_snake_case",
  "name_latin": "Nom Latin Complet",
  "name_fr": "Nom Français",
  "form": "EPS|MG|HE|MICROSPHERES|EPF",
  "dosage": "posologie précise",
  "priority": 1|2|3,
  "justification_terrain": "...",
  "justification_classique": "...",
  "explication_patient": "..."
}

## ORGANISATION DES VOLETS PAR PRIORITÉ
- **volet_drainage**: Toujours PRIORITÉ 3 (soutien/terrain)
- **volet_canon_endobiogenique**: Organiser les prescriptions par priority (1 d'abord, puis 2, puis 3)
- **volet_phyto_elargi**: Organiser les prescriptions par priority (1 d'abord, puis 2, puis 3)
- **volet_micronutrition**: Généralement PRIORITÉ 2 ou 3`;

// ========================================
// FONCTION PRINCIPALE - Chat Completions API
// ========================================

export interface CallOrdonnanceOptions {
  maxRetries?: number;
}

/**
 * Génère une ordonnance via Chat Completions API
 * VERSION 4.0 - Sans VectorStore (~4.5k tokens vs 29k)
 */
export async function callOrdonnanceAssistant(
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
      console.log(`[OrdonnanceV4] Tentative ${attempt}/${config.maxRetries} via Chat Completions API...`);

      // Préparer le message utilisateur
      const userMessage = formatMessageForOrdonnance(input);
      console.log(`[OrdonnanceV4] Message utilisateur: ${userMessage.length} caractères`);

      // Appel Chat Completions API (PAS Assistants API)
      const completion = await openai.chat.completions.create({
        model: DEFAULT_CONFIG.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3, // Réponses cohérentes
        max_tokens: 4000, // Suffisant pour une ordonnance complète
        response_format: { type: "json_object" }, // Force JSON valide
      });

      // Extraire la réponse
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new OrdonnanceError("Réponse vide de l'API", "EMPTY_RESPONSE");
      }

      // Stats d'utilisation
      const usage = completion.usage;
      console.log(`[OrdonnanceV4] Tokens utilisés: prompt=${usage?.prompt_tokens}, completion=${usage?.completion_tokens}, total=${usage?.total_tokens}`);

      // Parser la réponse
      const response = parseOrdonnanceResponse(content);
      console.log(`[OrdonnanceV4] ✅ Ordonnance générée avec succès`);

      // Log des stats
      const stats = {
        drainage: response.volet_drainage?.prescriptions?.length || 0,
        canon: response.volet_canon_endobiogenique?.prescriptions?.length || 0,
        phyto: response.volet_phyto_elargi?.prescriptions?.length || 0,
        micro: response.volet_micronutrition?.prescriptions?.length || 0,
        alertes: response.alertes_securite?.length || 0,
      };
      console.log(`[OrdonnanceV4] Stats: Drainage=${stats.drainage}, Canon=${stats.canon}, Phyto=${stats.phyto}, Micro=${stats.micro}, Alertes=${stats.alertes}`);

      return response;

    } catch (error) {
      lastError = error as Error;
      console.error(`[OrdonnanceV4] ❌ Erreur tentative ${attempt}:`, lastError.message);

      // Ne pas réessayer pour certaines erreurs
      if (error instanceof OrdonnanceError) {
        if (["MISSING_API_KEY", "PARSE_ERROR"].includes(error.code)) {
          throw error;
        }
      }

      // Réessayer avec délai
      if (attempt < config.maxRetries) {
        const delay = DEFAULT_CONFIG.retryDelayMs * attempt;
        console.log(`[OrdonnanceV4] Attente ${delay}ms avant retry...`);
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
// FONCTION SIMPLIFIÉE
// ========================================

/**
 * Génère une ordonnance à partir d'un diagnostic
 * VERSION 4.0 - Chat Completions API (sans VectorStore)
 */
export async function generateOrdonnance(
  patient: PatientInfoForOrdonnance,
  diagnostic: DiagnosticResponse
): Promise<OrdonnanceResponse> {
  return callOrdonnanceAssistant({ patient, diagnostic });
}

// ========================================
// EXPORT
// ========================================

export default {
  callOrdonnanceAssistant,
  generateOrdonnance,
  OrdonnanceError,
};

// ========================================
// NOTES DE VERSION
// ========================================
// v4.0 (Solution B) - Chat Completions API
//   - Suppression VectorStore (économie ~26k tokens/requête)
//   - System prompt enrichi avec connaissances endobiogéniques
//   - response_format: json_object pour parsing fiable
//   - ~4.5k tokens total vs ~29k avant
//   - Plus de rate limit errors
//
// v3.0 (Ancien) - Assistants API + VectorStore
//   - VectorStore file_search automatique
//   - ~26k tokens ajoutés par requête
//   - Rate limit systématique (30k TPM)