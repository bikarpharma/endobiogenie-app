# 🔬 AUDIT EXPERT - MODULE ORDONNANCE INTEGRIA

> **Version**: 2.0
> **Date**: 2025-12-09
> **Auditeur**: Claude Code
> **Scope**: Génération, Affichage, Chat IA, Adaptation Tunisie

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du flux](#1-vue-densemble-du-flux)
2. [Fichiers clés et responsabilités](#2-fichiers-clés-et-responsabilités)
3. [API Routes - Analyse détaillée](#3-api-routes---analyse-détaillée)
4. [Assistant OpenAI V5 - Prompts système](#4-assistant-openai-v5---prompts-système)
5. [Middleware Tunisie - Adaptation formes](#5-middleware-tunisie---adaptation-formes)
6. [Composants UI - Affichage](#6-composants-ui---affichage)
7. [Structures de données](#7-structures-de-données)
8. [Schéma Prisma](#8-schéma-prisma)
9. [Points critiques et recommandations](#9-points-critiques-et-recommandations)
10. [Diagramme de séquence](#10-diagramme-de-séquence)

---

## 1. VUE D'ENSEMBLE DU FLUX

### 1.1 Flux complet utilisateur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUX GÉNÉRATION ORDONNANCE                           │
└─────────────────────────────────────────────────────────────────────────────┘

[1] UTILISATEUR
    │
    ▼
┌─────────────────────────────────────┐
│ GenerateOrdonnanceButton.tsx        │  ← Bouton "Générer Ordonnance"
│ Ligne 20: onClick → handleGenerate  │
│ Ligne 52: Validation BdF/Interrogatoire
└─────────────────────────────────────┘
    │
    ▼ POST /api/ordonnances/generate
    │ Body: { patientId: string }
    │
┌─────────────────────────────────────┐
│ generate/route.ts                   │  ← API PRINCIPALE
│ Ligne 164: Auth check               │
│ Ligne 184: Lookup Patient + BdF     │
│ Ligne 211: Lookup UnifiedSynthesis  │
│ Ligne 302: callOrdonnanceAssistantV5│
│ Ligne 335: adaptPrescriptionToTunisia
│ Ligne 593: Prisma.create            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ assistantOrdonnanceV5.ts            │  ← ASSISTANT OPENAI
│ Ligne 574: callOrdonnanceAssistantV5│
│ Ligne 595: Créer Thread             │
│ Ligne 601: Lancer Run               │
│ Ligne 663: Parse JSON response      │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ tunisianAdapter.ts                  │  ← MIDDLEWARE TUNISIE
│ Ligne 1036: adaptPrescriptionToTunisia
│ - Conversion TM → MICROSPHERES      │
│ - Conversion MG 1DH → CONCENTRÉ     │
│ - Vérification disponibilité        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Prisma - Table ordonnances          │  ← SAUVEGARDE BDD
│ - voletEndobiogenique (JSON)        │
│ - voletPhytoElargi (JSON)           │
│ - voletAromatherapie (JSON)         │
│ - voletComplements (JSON)           │
│ - adaptedContent (JSON Tunisie)     │
└─────────────────────────────────────┘
    │
    ▼ Redirect /ordonnances/[id]
    │
┌─────────────────────────────────────┐
│ OrdonnanceInterfaceClient.tsx       │  ← AFFICHAGE
│ Ligne 19: mapOrdonnanceToPrescription
│ Ligne 142: <PrescriptionList>       │
│ Ligne 166: <ChatPanel>              │
└─────────────────────────────────────┘
```

---

## 2. FICHIERS CLÉS ET RESPONSABILITÉS

### 2.1 Tableau récapitulatif

| Fichier | Chemin | Rôle | Lignes |
|---------|--------|------|--------|
| **API Generate** | `app/api/ordonnances/generate/route.ts` | Handler POST génération | 709 |
| **Assistant V5** | `lib/ai/assistantOrdonnanceV5.ts` | Appel OpenAI + Prompts | 710 |
| **Tunisian Adapter** | `lib/utils/tunisianAdapter.ts` | Conversion formes galéniques | 1222 |
| **Types** | `lib/ordonnance/types.ts` | TypeScript interfaces | 310 |
| **Constants** | `lib/ordonnance/constants.ts` | Plantes par axe, seuils BdF | 624 |
| **Must Forms** | `lib/ordonnance/mustForms.ts` | Formes obligatoires (MG, HE) | 200+ |
| **Generate Button** | `components/ordonnance/GenerateOrdonnanceButton.tsx` | UI Déclencheur | 139 |
| **Panel Ordonnance** | `components/ordonnance/OrdonnancePanel.tsx` | Affichage legacy 5 volets | 392 |
| **Interface Client** | `components/ordonnance/OrdonnanceInterfaceClient.tsx` | Orchestrateur 60/40 | 174 |
| **Chat Panel** | `components/ordonnance/ChatPanel.tsx` | Conversation IA | 200+ |
| **Prescription List** | `components/prescription/PrescriptionList.tsx` | Affichage Tunisie 6D | 737 |
| **Prescription Card** | `components/prescription/PrescriptionCard.tsx` | Carte plante individuelle | 200+ |
| **API Chat** | `app/api/ordonnances/[id]/chat/route.ts` | POST/GET messages | 300+ |

### 2.2 Dépendances entre fichiers

```
GenerateOrdonnanceButton.tsx
    └── POST /api/ordonnances/generate
            ├── lib/ai/assistantOrdonnanceV5.ts
            │       └── OpenAI Assistants API
            ├── lib/utils/tunisianAdapter.ts
            │       └── TUNISIA_DB (271 plantes)
            ├── lib/ordonnance/constants.ts
            │       └── PLANTES_PAR_AXE, SEUILS_BDF
            └── prisma/schema.prisma
                    └── model Ordonnance

OrdonnanceInterfaceClient.tsx
    ├── components/prescription/PrescriptionList.tsx
    │       └── PrescriptionCard.tsx (par plante)
    ├── components/ordonnance/OrdonnancePanel.tsx (fallback)
    └── components/ordonnance/ChatPanel.tsx
            └── POST /api/ordonnances/[id]/chat
```

---

## 3. API ROUTES - ANALYSE DÉTAILLÉE

### 3.1 POST /api/ordonnances/generate

**Fichier**: `app/api/ordonnances/generate/route.ts`

#### Imports critiques (lignes 15-24)
```typescript
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { callOrdonnanceAssistantV5, OrdonnanceError } from "@/lib/ai/assistantOrdonnanceV5";
import type { DiagnosticResponse } from "@/lib/ai/assistantDiagnostic";
import { adaptPrescriptionToTunisia } from '@/lib/utils/tunisianAdapter';
```

#### Configuration (lignes 26-27)
```typescript
export const runtime = "nodejs";
export const maxDuration = 120; // 2 minutes timeout
```

#### Étapes du handler POST

| Étape | Lignes | Description |
|-------|--------|-------------|
| 1. Auth | 164-167 | `auth()` vérifie session |
| 2. Validation | 172-179 | Vérifie `patientId` présent |
| 3. Lookup Patient | 184-199 | Récupère patient + dernière BdF |
| 4. Lookup Diagnostic | 211-247 | Récupère `UnifiedSynthesis` (OBLIGATOIRE) |
| 5. Prépare Patient Data | 250-291 | Parse allergies, traitements, antécédents |
| 6. Appel Assistant | 302-332 | `callOrdonnanceAssistantV5(input)` |
| 7. Adaptation Tunisie | 335-357 | `adaptPrescriptionToTunisia()` |
| 8. Déduplication | 388-423 | `deduplicatePrescriptions()` |
| 9. Sauvegarde BDD | 593-616 | `prisma.ordonnance.create()` |
| 10. Réponse | 633-698 | JSON avec tous volets + alertes |

#### Fonction adaptToNewStructure (lignes 33-150)

Convertit la réponse de l'Assistant vers le format du middleware Tunisie :

```typescript
function adaptToNewStructure(oldResponse: any) {
  // Identifie plantes ANS/SNA pour éviter doublons
  const isAnsPlant = (p: any) => {
    const planteLower = (p.name_latin || p.plante || '').toLowerCase();
    return planteLower.includes('tilia') ||      // Tilleul
           planteLower.includes('passiflora') || // Passiflore
           planteLower.includes('crataegus') ||  // Aubépine
           planteLower.includes('valeriana') ||  // Valériane
           planteLower.includes('ficus');        // Figuier
  };

  return {
    prescription: {
      symptomatic: phytoElargiPrescriptions.map(...),
      neuro_endocrine: canonPrescriptions.filter(p => !isAnsPlant(p)).map(...),
      ans: canonPrescriptions.filter(isAnsPlant).map(...),
      drainage: drainagePrescriptions.map(...),
      oligos: microPrescriptions.map(...)
    }
  };
}
```

#### Fonction déduplication (lignes 388-399)

```typescript
const deduplicatePrescriptions = (prescriptions: any[]) => {
  const seen = new Map<string, any>();
  for (const p of prescriptions) {
    // Clé unique = nom latin normalisé + forme
    const key = `${(p.substance || '').toLowerCase().trim()}_${(p.forme || '').toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.set(key, p);
    }
  }
  return Array.from(seen.values());
};
```

### 3.2 GET/POST /api/ordonnances/[id]/chat

**Fichier**: `app/api/ordonnances/[id]/chat/route.ts`

#### Détection type question (lignes 30-83)

```typescript
type QuestionType = "diagnostic" | "ordonnance" | "mixte";

function detectQuestionType(message: string): QuestionType {
  const motsDiagnostic = ['terrain', 'diagnostic', 'bdf', 'axe', 'sna', 'index', 'analyse'];
  const motsOrdonnance = ['plante', 'ajouter', 'retirer', 'posologie', 'eps', 'mg', 'he', 'remplacer'];

  const hasDiag = motsDiagnostic.some(m => message.toLowerCase().includes(m));
  const hasOrdo = motsOrdonnance.some(m => message.toLowerCase().includes(m));

  if (hasDiag && hasOrdo) return "mixte";
  if (hasDiag) return "diagnostic";
  return "ordonnance";
}
```

#### Sélection Assistant (lignes 88-100)

```typescript
const questionType = detectQuestionType(message);
let assistantId: string;

switch (questionType) {
  case "diagnostic":
    assistantId = process.env.ASSISTANT_DIAGNOSTIC_ID!;
    break;
  case "ordonnance":
    assistantId = process.env.ASSISTANT_ORDONNANCE_ID!;
    break;
  case "mixte":
    // Double appel parallèle
    break;
}
```

---

## 4. ASSISTANT OPENAI V5 - PROMPTS SYSTÈME

### 4.1 Configuration

**Fichier**: `lib/ai/assistantOrdonnanceV5.ts`

```typescript
// Lignes 16-23
const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 5000,
  model: "gpt-4.1",
  assistantId: "asst_ftAPObIleEWpkQwOCSN72ERt",
  maxWaitSeconds: 120
};
```

### 4.2 Types de données

#### PatientInfoForOrdonnance (lignes 29-42)
```typescript
interface PatientInfoForOrdonnance {
  id: string;
  nom?: string;
  prenom?: string;
  age: number | null;
  sexe: 'H' | 'F';
  allergies: string[];
  medicaments_actuels: string[];
  antecedents: string[];
  grossesse?: boolean;
  allaitement?: boolean;
  contre_indications_majeures?: string[];
}
```

#### OrdonnanceResponse (lignes 49-81)
```typescript
interface OrdonnanceResponse {
  volet_drainage?: VoletDrainage;
  volet_canon_endobiogenique?: VoletPrescription;
  volet_phyto_elargi?: VoletPrescription;
  volet_aromatherapie?: VoletAromatherapie;
  volet_micronutrition?: VoletMicronutrition;
  alertes_securite?: AlerteSecurite[];
  calendrier_prise?: CalendrierPrise;
  suivi?: SuiviRecommandation;
  cout_estime?: { mensuel: string; details?: string };
  meta?: { version: string; generatedAt: string; duree_traitement: string };
}
```

### 4.3 PROMPT SYSTÈME COMPLET

#### Section 1: MUST_FORMS (lignes 242-277)

```markdown
## FORMES GALÉNIQUES OBLIGATOIRES (MUST_FORMS) - NE JAMAIS CONVERTIR

### Bourgeons OBLIGATOIREMENT en MG (Macérat concentré):

| Plante | Nom Latin | Niveau | Raison |
|--------|-----------|--------|--------|
| Cassis | Ribes nigrum | ABSOLU | Cortisone-like, JAMAIS en EPS/microsphères |
| Tilleul | Tilia tomentosa | ABSOLU | Anxiolytique profond SNA |
| Aubépine | Crataegus laevigata | ABSOLU | Cardiotonique/SNA |
| Figuier | Ficus carica | ABSOLU | Régulation neurovégétative |
| Séquoia | Sequoiadendron giganteum | ABSOLU | Axe somatotrope |
| Chêne | Quercus robur | ABSOLU | Adaptogène majeur |
| Olivier | Olea europaea | ABSOLU | HTA/circulation cérébrale |
| Romarin MG | Rosmarinus officinalis | ABSOLU | Hépatoprotection |
| Genévrier | Juniperus communis | FORT | Drainage rénal |
| Bouleau | Betula pubescens | FORT | Dépuratif général |
| Noyer | Juglans regia | FORT | Pancréas/intestin |

### HE OBLIGATOIREMENT en forme pure (pas microsphères):

| HE | Nom Latin | Niveau | Raison |
|----|-----------|--------|--------|
| Lavande vraie | Lavandula angustifolia | ABSOLU | Anxiolytique/cicatrisant |
| Sauge sclarée | Salvia sclarea | ABSOLU | Oestrogen-like |
| Thym à thymol | Thymus vulgaris CT phénols | ABSOLU | Anti-infectieux puissant |
| Ravintsara | Cinnamomum camphora | FORT | Antiviral majeur |
| Tea tree | Melaleuca alternifolia | FORT | Antibactérien large spectre |
| Eucalyptus radiata | Eucalyptus radiata | FORT | ORL/bronches |

### RÈGLE CRITIQUE
Ne JAMAIS convertir ces plantes MUST vers une autre forme.
Si le terrain nécessite Cassis → prescrire MG 15 gouttes matin à jeun, 5j/7
```

#### Section 2: JUSTIFICATIONS OBLIGATOIRES (lignes 399-449)

```markdown
## JUSTIFICATIONS OBLIGATOIRES - TOUS LES CHAMPS REQUIS

Pour CHAQUE plante prescrite, TOUS ces champs sont OBLIGATOIRES:

### 1. axe_cible (OBLIGATOIRE)
Format: "[Axe] - [Action spécifique]"

❌ INTERDIT:
- "Anxiété"
- "Stress"
- "Fatigue"
- "Pour calmer"

✅ REQUIS:
- "SNA - Alpha-sympatholytique, réduit hyperactivité sympathique"
- "Corticotrope - Adaptogène, soutient cortisol endogène"
- "Thyréotrope - Stimule conversion T4→T3 périphérique"
- "Gonadotrope - Progestérone-like, régule phase lutéale"

### 2. mecanisme (OBLIGATOIRE)
Mécanisme pharmacologique précis en 1-2 phrases.

❌ INTERDIT:
- "Plante calmante traditionnelle"
- "Utilisée depuis longtemps"

✅ REQUIS:
- "Action GABAergique - potentialise récepteurs GABA-A. Inhibe recapture sérotonine."
- "Saponines triterpéniques stimulent synthèse cortisol. Action cortisone-like sans effets secondaires."
- "Flavonoïdes à action phyto-oestrogénique. Modulation récepteurs ER-beta sélective."

### 3. justification_terrain (OBLIGATOIRE)
Connexion avec le DIAGNOSTIC du patient.

❌ INTERDIT:
- "Bon pour le terrain"
- "Adapté au patient"

✅ REQUIS:
- "Index Corticotrope élevé (1.4) → nécessite frein ACTH + soutien surrénalien"
- "Profil SNA sympathicotonique avec Index α-S > 1.2 → alpha-sympatholytique indiqué"
- "Spasmophilie Type 1 détectée → magnésium + régulateurs SNA prioritaires"

### 4. justification_classique (OBLIGATOIRE)
Indication phytothérapique reconnue avec références.

✅ REQUIS:
- "Monographie HMPC/EMA: anxiolytique, spasmolytique. Études cliniques vs placebo (Akhondzadeh 2001)."
- "Pharmacopée européenne: draineur hépatobiliaire. Action cholérétique et cholagogue documentée."
- "Commission E allemande: indiqué dans troubles nerveux légers. Niveau de preuve B."

### 5. explication_patient (OBLIGATOIRE)
Vulgarisation pour le patient (langage simple).

✅ REQUIS:
- "Cette plante calme le système nerveux suractivé et réduit les tensions musculaires liées au stress."
- "Ce bourgeon soutient vos glandes surrénales fatiguées pour retrouver de l'énergie naturellement."
- "Cette huile essentielle aide à mieux dormir en apaisant le mental agité."

### 6. synergie_avec (RECOMMANDÉ)
Synergies avec les AUTRES plantes de CETTE ordonnance.

✅ REQUIS:
- ["Potentialise Tilia tomentosa sur axe SNA", "Complète Crataegus sur sphère cardiovasculaire"]

⚠️ Ne citer QUE des plantes présentes dans cette ordonnance !
```

#### Section 3: AROMATHÉRAPIE (lignes 460-519)

```markdown
## AROMATHÉRAPIE - RÈGLES D'INCLUSION

### 🚨 RÈGLE MAJEURE: Inclure OBLIGATOIREMENT 1-3 HE si UN de ces critères:

| Critère Patient | HE Obligatoires |
|-----------------|-----------------|
| Profil sympathicotonique / spasmophilie | HE anxiolytiques (Lavande, Petit grain) |
| Stress, anxiété, nervosité | HE relaxantes (Lavande, Marjolaine) |
| Troubles du sommeil / insomnie | HE sédatives (Mandarine, Ylang-ylang) |
| Infections ORL / bronchiques | HE anti-infectieuses (Ravintsara, Tea tree) |
| Douleurs musculo-articulaires | HE antalgiques (Gaulthérie, Hélichryse) |
| Troubles digestifs fonctionnels | HE carminatives (Menthe, Basilic) |
| Troubles cutanés | HE cicatrisantes (Lavande, Tea tree) |

### ⛔ NE PAS inclure d'HE UNIQUEMENT si:
- Grossesse 1er trimestre
- Enfant < 3 ans
- Allergie connue aux HE
- Patient refuse explicitement

### HE INCONTOURNABLES PAR INDICATION

| Indication | HE Recommandées |
|------------|-----------------|
| Anxiété/Stress | Lavandula angustifolia, Citrus aurantium feuilles |
| Insomnie | Citrus reticulata, Cananga odorata |
| Infections ORL | Eucalyptus radiata, Cinnamomum camphora, Melaleuca alternifolia |
| Anti-inflammatoire | Helichrysum italicum, Gaultheria procumbens |
| Digestif | Mentha x piperita, Ocimum basilicum |
| Spasmophilie/SNA | Lavandula angustifolia, Chamaemelum nobile, Origanum majorana |

### CI ABSOLUES HE

| Population | Restriction |
|------------|-------------|
| Grossesse 1er trimestre | AUCUNE HE |
| Grossesse 2-3ème trimestre | Très limité (Lavande vraie possible) |
| Enfants < 3 ans | AUCUNE HE voie orale |
| Épilepsie | Éviter menthe, romarin, eucalyptus, sauge |
| Asthme | Prudence diffusion, éviter menthe |
| HE hépatotoxiques (phénols) | Cure courte 7-10j max |

### Voies d'administration

| Voie | Consignes |
|------|-----------|
| cutanee | TOUJOURS diluer 5-20% dans huile végétale (jojoba, amande douce) |
| orale | Gouttes sur miel/comprimé neutre - RÉSERVÉE adultes |
| diffusion | 10-15 min max, pièce aérée, pas en continu |
| inhalation | Sèche (mouchoir) ou humide (bol eau chaude) |
```

#### Section 4: FORMAT JSON RÉPONSE (lignes 381-397)

```json
{
  "meta": {
    "version": "5.0",
    "generatedAt": "ISO timestamp",
    "duree_traitement": "2-3 mois",
    "renouvellement": "Oui, après consultation de contrôle"
  },
  "alertes_securite": [
    {
      "type": "interaction | contre_indication | allergie | prudence",
      "severite": "faible | modere | majeur",
      "message": "Description de l'alerte",
      "action": "Action recommandée"
    }
  ],
  "volet_drainage": {
    "prescriptions": [
      {
        "name_latin": "Taraxacum officinale",
        "name_fr": "Pissenlit",
        "forme": "EPS",
        "posologie": "5ml matin à jeun",
        "duree": "21 jours",
        "action": "Cholagogue, cholérétique",
        "emonctoire": "Foie",
        "priority": 3,
        "justification_terrain": "...",
        "justification_classique": "...",
        "explication_patient": "..."
      }
    ]
  },
  "volet_canon_endobiogenique": {
    "prescriptions": [
      {
        "name_latin": "Ribes nigrum",
        "name_fr": "Cassis",
        "forme": "MG",
        "posologie": "15 gouttes matin à jeun, 5j/7",
        "duree": "2 mois",
        "axe_cible": "Corticotrope - Adaptogène cortisol-like",
        "mecanisme": "Stimulation cortex surrénalien via flavonoïdes...",
        "justification_terrain": "Index Corticotrope à 1.35...",
        "justification_classique": "Monographie EMA...",
        "explication_patient": "Ce bourgeon soutient vos glandes surrénales...",
        "synergie_avec": ["Base adaptogène soutenant Sequoia..."],
        "priority": 2
      }
    ]
  },
  "volet_phyto_elargi": {
    "prescriptions": [...]
  },
  "volet_aromatherapie": {
    "prescriptions": [
      {
        "huile_essentielle": "Lavande vraie",
        "name_latin": "Lavandula angustifolia",
        "chemotype": "Linalol, acétate de linalyle",
        "voie": "cutanee",
        "posologie": "3 gouttes diluées matin et soir",
        "dilution": "10%",
        "huile_vegetale": "Jojoba",
        "zone_application": "Plexus solaire et poignets",
        "duree": "15 jours renouvelables",
        "axe_cible": "SNA - Rééquilibrage neurovégétatif",
        "mecanisme": "Linalol: action GABAergique...",
        "justification_terrain": "Profil sympathicotonique marqué...",
        "justification_classique": "Monographie EMA: anxiolytique...",
        "explication_patient": "Cette huile de lavande apaise...",
        "contre_indications": ["Allergie aux Lamiacées"],
        "precautions": ["Éviter contact yeux"],
        "priority": 1
      }
    ],
    "precautions_generales": [
      "Toujours diluer avant application cutanée",
      "Test cutané préalable recommandé"
    ]
  },
  "volet_micronutrition": {
    "prescriptions": [
      {
        "substance": "Magnésium bisglycinate",
        "posologie": "300mg le soir",
        "indication": "Spasmophilie, terrain carencé",
        "duree": "3 mois"
      }
    ]
  },
  "calendrier_prise": {
    "matin_jeun": ["Cassis MG 15gt", "Pissenlit EPS 5ml"],
    "matin_petit_dejeuner": [],
    "midi_avant_repas": ["Passiflore EPS 5ml"],
    "midi_apres_repas": [],
    "soir_avant_diner": [],
    "soir_apres_diner": ["Lavande HE application"],
    "coucher": ["Magnésium 300mg", "Tilleul MG 15gt"]
  },
  "suivi": {
    "prochaine_consultation": "Dans 6-8 semaines",
    "parametres_surveiller": ["Qualité sommeil", "Niveau anxiété"],
    "examens_suggeres": ["Bilan thyroïdien si persistance fatigue"]
  },
  "cout_estime": {
    "mensuel": "45-60€",
    "details": "MG ~15€, EPS ~25€, HE ~10€"
  }
}
```

---

## 5. MIDDLEWARE TUNISIE - ADAPTATION FORMES

### 5.1 Configuration

**Fichier**: `lib/utils/tunisianAdapter.ts`

#### Types de formes (lignes 31-35)

```typescript
export type FormeFrance = 'TM' | 'MG 1DH' | 'EPS' | 'HE';
export type FormeTunisie = 'MICROSPHERES' | 'MACERAT_CONCENTRE' | 'EPS' | 'HE' | 'EPF';
export type AlertLevel = 'NONE' | 'INFO' | 'WARNING' | 'CRITICAL';
```

### 5.2 Règles de conversion

| Forme France | Forme Tunisie | Ratio | Note |
|--------------|---------------|-------|------|
| TM (Teinture Mère) | MICROSPHERES | 1g = 10g TM | Concentration 10x |
| MG 1DH | MACERAT_CONCENTRE | ÷10 dose | **CRITIQUE**: 15gt → 5gt |
| EPS | EPS | 1:1 | Identité |
| HE | HE | 1:1 | Identité |

### 5.3 Base de données Tunisienne

**271 plantes** documentées depuis `plantes_extraits_complet.xlsx`

```typescript
// Extrait TUNISIA_DB (ligne 146+)
const TUNISIA_DB = new Map<string, TunisiaPlantProfile>([
  ['ribes_nigrum', {
    nom_fr: 'CASSIS',
    nom_latin: 'Ribes nigrum',
    formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS']
  }],
  ['lavandula_angustifolia', {
    nom_fr: 'LAVANDE',
    nom_latin: 'Lavandula angustifolia',
    formes_dispo: ['HE', 'MICROSPHERES']
  }],
  // ... 269 autres plantes
]);
```

### 5.4 Fonction principale

```typescript
// Ligne 1036
export function adaptPrescriptionToTunisia(input: PrescriptionInput): PrescriptionOutput {
  const result: PrescriptionOutput = {
    ...input,
    prescription: {
      symptomatic: input.prescription.symptomatic.map(adaptPlant),
      neuro_endocrine: input.prescription.neuro_endocrine.map(adaptPlant),
      ans: input.prescription.ans.map(adaptPlant),
      drainage: input.prescription.drainage.map(adaptPlant),
      aromatherapie: input.prescription.aromatherapie?.map(adaptPlant),
      oligos: input.prescription.oligos.map(adaptOligo),
    },
    meta: {
      conversion_date: new Date().toISOString(),
      total_plants: 0,
      available_count: 0,
      warnings_count: 0,
      critical_count: 0,
      conversions_applied: [],
    }
  };

  // Calcul métriques...
  return result;
}
```

### 5.5 Métriques retournées

```typescript
meta: {
  conversion_date: string;      // ISO timestamp
  total_plants: number;         // Nombre total prescrit
  available_count: number;      // Disponibles en Tunisie
  warnings_count: number;       // Conversions avec dégradation
  critical_count: number;       // Non disponibles
  conversions_applied: string[]; // Ex: "Cassis: TM → MICROSPHERES"
}
```

---

## 6. COMPOSANTS UI - AFFICHAGE

### 6.1 Architecture composants

```
OrdonnanceInterfaceClient.tsx (Orchestrateur)
├── width: 60% ─── PrescriptionList.tsx (Tunisie)
│                   ├── RadarChart (6 dimensions)
│                   ├── TerrainCoverage (barre progression)
│                   ├── TherapeuticTimeline (phases)
│                   └── DimensionSection × 6
│                       └── PrescriptionCard × N
│
└── width: 40% ─── ChatPanel.tsx (Conversation IA)
                    ├── MessageList
                    └── InputMessage
```

### 6.2 Les 6 Dimensions

**Fichier**: `components/prescription/PrescriptionList.tsx` (lignes 56-111)

| # | Clé | Label | Icône | Couleur |
|---|-----|-------|-------|---------|
| 1 | symptomatic | Action Symptomatique | Zap | Rose |
| 2 | neuro_endocrine | Régulation Neuro-Endocrinienne | Brain | Indigo |
| 3 | ans | Système Neuro-Végétatif | Activity | Amber |
| 4 | drainage | Drainage & Émonctoires | Droplets | Cyan |
| 5 | aromatherapie | Aromathérapie | Leaf | Emerald |
| 6 | oligos | Oligoéléments | FlaskConical | Slate |

### 6.3 Mapping données (OrdonnanceInterfaceClient)

```typescript
// Ligne 19-103
function mapOrdonnanceToPrescription(ordonnance: any): PrescriptionOutput | null {
  // 1. Mapper aromathérapie depuis voletAromatherapie
  const aromatherapiePlants = (ordonnance.voletAromatherapie || [])
    .map((rec: any) => mapPlant(rec, false));

  // 2. Si adaptedContent existe, l'enrichir avec aromathérapie
  if (ordonnance.adaptedContent) {
    const adapted = ordonnance.adaptedContent as PrescriptionOutput;
    return {
      ...adapted,
      prescription: {
        ...adapted.prescription,
        aromatherapie: aromatherapiePlants.length > 0
          ? aromatherapiePlants
          : adapted.prescription.aromatherapie,
      },
    };
  }

  // 3. Sinon, construire depuis les volets France
  // ...
}
```

---

## 7. STRUCTURES DE DONNÉES

### 7.1 Flux de transformation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TRANSFORMATION DES DONNÉES                           │
└─────────────────────────────────────────────────────────────────────────────┘

[INPUT API]
body: { patientId: string }
         │
         ▼
[LOOKUP BDD]
Patient + BdfAnalysis + UnifiedSynthesis
         │
         ▼
[FORMAT ASSISTANT]
OrdonnanceInput {
  patient: PatientInfoForOrdonnance
  diagnostic: DiagnosticResponse
}
         │
         ▼
[RÉPONSE ASSISTANT]
OrdonnanceResponse {
  volet_drainage: { prescriptions: [...] }
  volet_canon_endobiogenique: { prescriptions: [...] }
  volet_phyto_elargi: { prescriptions: [...] }
  volet_aromatherapie: { prescriptions: [...] }
  volet_micronutrition: { prescriptions: [...] }
  alertes_securite: [...]
  calendrier_prise: {...}
  suivi: {...}
}
         │
         ▼
[ADAPTATION STRUCTURE]
adaptToNewStructure() → PrescriptionInput {
  prescription: {
    symptomatic, neuro_endocrine, ans, drainage, oligos
  }
}
         │
         ▼
[MIDDLEWARE TUNISIE]
adaptPrescriptionToTunisia() → PrescriptionOutput {
  prescription: {
    symptomatic, neuro_endocrine, ans, drainage, aromatherapie, oligos
  }
  meta: { conversions_applied, warnings_count, ... }
}
         │
         ▼
[SAUVEGARDE BDD]
Prisma.ordonnance.create({
  voletEndobiogenique: [...],
  voletPhytoElargi: [...],
  voletAromatherapie: [...],
  voletComplements: [...],
  adaptedContent: PrescriptionOutput
})
         │
         ▼
[RÉPONSE API]
{
  success: true,
  ordonnance: {...},
  alertesTunisie: {...},
  sourcesUtilisees: {...}
}
```

### 7.2 Types TypeScript clés

#### RecommandationTherapeutique (lib/ordonnance/types.ts:98-124)

```typescript
type RecommandationTherapeutique = {
  id: string;
  substance: string;           // Nom latin
  nomFrancais?: string;        // Nom français
  type: 'plante' | 'gemmo' | 'HE' | 'vitamine' | 'mineral';
  forme: 'EPS' | 'TM' | 'MG' | 'gélule' | 'HE' | 'poudre';
  posologie: string;
  duree: string;
  axeCible: string;
  mecanisme: string;
  pedagogie?: ContextePedagogique;
  sourceVectorstore: 'endobiogenie' | 'phyto' | 'gemmo' | 'aroma';
  niveauPreuve: 1 | 2 | 3;
  CI: string[];
  interactions: string[];
  niveauSecurite?: 'sur' | 'precaution' | 'interdit';
  priorite: number;            // 1-5
  cout?: number;
};
```

#### OrdonnanceStructuree (lib/ordonnance/types.ts:172-196)

```typescript
type OrdonnanceStructuree = {
  id: string;
  patientId: string;
  bdfAnalysisId?: string;

  // Les 4 volets
  voletEndobiogenique: RecommandationTherapeutique[];
  voletPhytoElargi: RecommandationTherapeutique[];
  voletAromatherapie?: RecommandationTherapeutique[];
  voletComplements: RecommandationTherapeutique[];

  scope?: TherapeuticScope;
  syntheseClinique: string;
  conseilsAssocies: string[];
  surveillanceBiologique: string[];
  dateRevaluation?: Date;
  statut: 'brouillon' | 'validee' | 'archivee';
  createdAt: Date;
  updatedAt: Date;
};
```

#### PrescriptionOutput (lib/utils/tunisianAdapter.ts:110-129)

```typescript
interface PrescriptionOutput {
  global_strategy_summary: string;
  priority_axis: string;
  prescription: {
    symptomatic: PlantOutput[];
    neuro_endocrine: PlantOutput[];
    ans: PlantOutput[];
    drainage: PlantOutput[];
    aromatherapie?: PlantOutput[];
    oligos: OligoOutput[];
  };
  meta: {
    conversion_date: string;
    total_plants: number;
    available_count: number;
    warnings_count: number;
    critical_count: number;
    conversions_applied: string[];
  };
}
```

---

## 8. SCHÉMA PRISMA

### 8.1 Model Ordonnance

```prisma
model Ordonnance {
  id            String  @id @default(cuid())
  patientId     String
  bdfAnalysisId String?

  // === 4 VOLETS (JSON) ===
  voletEndobiogenique Json @default("[]")
  voletPhytoElargi    Json @default("[]")
  voletAromatherapie  Json @default("[]")
  voletComplements    Json @default("[]")

  // === VERSION TUNISIE ===
  adaptedContent Json?  // PrescriptionOutput complet

  // === MÉTADONNÉES ===
  syntheseClinique       String    @default("") @db.Text
  conseilsAssocies       Json      @default("[]")
  surveillanceBiologique Json      @default("[]")
  dateRevaluation        DateTime?

  // === STATUT ===
  statut String @default("brouillon")

  // === CONVERSATION IA ===
  chatMessagesJson Json?
  threadId         String?

  // === RELATIONS ===
  patient     Patient          @relation(...)
  chatHistory OrdonnanceChat[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([patientId, createdAt])
  @@map("ordonnances")
}
```

### 8.2 Model OrdonnanceChat

```prisma
model OrdonnanceChat {
  id           String @id @default(cuid())
  ordonnanceId String
  patientId    String
  role         String  // "user" | "assistant"
  message      String @db.Text

  ordonnance Ordonnance @relation(...)
  patient    Patient    @relation(...)

  createdAt DateTime @default(now())

  @@index([ordonnanceId, createdAt])
  @@map("ordonnance_chats")
}
```

### 8.3 Model UnifiedSynthesis

```prisma
model UnifiedSynthesis {
  id        String  @id @default(cuid())
  patientId String
  content   Json    @db.Json  // DiagnosticResponse
  isLatest  Boolean @default(false)

  patient   Patient @relation(...)
  createdAt DateTime @default(now())

  @@index([patientId, isLatest])
  @@map("unified_syntheses")
}
```

---

## 9. POINTS CRITIQUES ET RECOMMANDATIONS

### 9.1 Points Forts ✅

| Point | Description |
|-------|-------------|
| **Architecture en couches** | Séparation claire: API → Assistant → Middleware → BDD |
| **Double sécurité sexe** | Filtrage constants.ts + filterSubstancesBySexe() |
| **Prompts exhaustifs** | 280 lignes de contexte détaillé pour l'IA |
| **Justifications obligatoires** | 5 champs requis pour chaque plante |
| **Traçabilité** | sourcesUtilisees retourné dans réponse API |
| **Déduplication** | Évite doublons drainage/canon |
| **VectorStore 26MB** | Tous docs (phyto, gemmo, aroma) intégrés |
| **Adaptation Tunisie** | 271 plantes avec formes disponibles |

### 9.2 Points d'Attention ⚠️

| Point | Description | Recommandation |
|-------|-------------|----------------|
| **Diagnostic obligatoire** | Si UnifiedSynthesis manquante, tout échoue | Ajouter message d'erreur explicite |
| **Timeout 2 minutes** | Cas complexes peuvent dépasser | Monitorer temps réponse |
| **Conversion Tunisie** | 271 plantes, risque oublis | Audit régulier Excel ↔ Code |
| **MUST_FORMS hardcodé** | 23 éléments dans prompt | Externaliser en config |
| **Calendrier prise** | Non adapté Tunisie | Recalculer après conversion |

### 9.3 Recommandations d'amélioration

#### Court terme
1. **Externaliser MUST_FORMS** dans un fichier JSON configurable
2. **Ajouter logs structurés** pour monitoring temps Assistant
3. **Créer script validation** Excel ↔ TUNISIA_DB

#### Moyen terme
1. **Cache Redis** pour diagnostics récents (éviter re-lookup)
2. **Queue async** pour génération (Vercel background functions)
3. **Tests E2E** sur flux complet génération

#### Long terme
1. **Fine-tuning modèle** sur corpus endobiogénie
2. **RAG hybride** VectorStore + BDD locale
3. **Multi-tenant** avec configurations par praticien

---

## 10. DIAGRAMME DE SÉQUENCE

```
┌─────────┐    ┌─────────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐    ┌────────┐
│  User   │    │ Frontend    │    │ API     │    │ OpenAI   │    │Tunisian│    │ Prisma │
└────┬────┘    └──────┬──────┘    └────┬────┘    └────┬─────┘    └───┬────┘    └───┬────┘
     │                │                │              │              │             │
     │  Clic Générer  │                │              │              │             │
     │───────────────>│                │              │              │             │
     │                │                │              │              │             │
     │                │ POST /generate │              │              │             │
     │                │───────────────>│              │              │             │
     │                │                │              │              │             │
     │                │                │ Lookup Patient              │             │
     │                │                │─────────────────────────────────────────>│
     │                │                │<─────────────────────────────────────────│
     │                │                │              │              │             │
     │                │                │ Lookup Synthesis            │             │
     │                │                │─────────────────────────────────────────>│
     │                │                │<─────────────────────────────────────────│
     │                │                │              │              │             │
     │                │                │ Create Thread│              │             │
     │                │                │─────────────>│              │             │
     │                │                │<─────────────│              │             │
     │                │                │              │              │             │
     │                │                │ Run Assistant│              │             │
     │                │                │─────────────>│              │             │
     │                │                │              │              │             │
     │                │                │   (polling)  │              │             │
     │                │                │─────────────>│              │             │
     │                │                │<─────────────│              │             │
     │                │                │              │              │             │
     │                │                │ Ordonnance JSON             │             │
     │                │                │<─────────────│              │             │
     │                │                │              │              │             │
     │                │                │ Adapt Tunisia│              │             │
     │                │                │─────────────────────────────>│             │
     │                │                │<─────────────────────────────│             │
     │                │                │              │              │             │
     │                │                │ Create Ordonnance           │             │
     │                │                │─────────────────────────────────────────>│
     │                │                │<─────────────────────────────────────────│
     │                │                │              │              │             │
     │                │ Response JSON  │              │              │             │
     │                │<───────────────│              │              │             │
     │                │                │              │              │             │
     │                │ Redirect /ordonnances/[id]    │              │             │
     │<───────────────│                │              │              │             │
     │                │                │              │              │             │
```

---

## ANNEXE: CHEMINS ABSOLUS

```
c:\Users\DELL\Documents\endobiogenie-simple\
├── app\
│   └── api\
│       └── ordonnances\
│           ├── generate\
│           │   └── route.ts          ← API principale (709 lignes)
│           └── [id]\
│               ├── route.ts          ← GET/PATCH ordonnance
│               └── chat\
│                   └── route.ts      ← Chat IA (300+ lignes)
├── lib\
│   ├── ai\
│   │   ├── assistantOrdonnanceV5.ts  ← Assistant OpenAI (710 lignes)
│   │   └── assistantDiagnostic.ts    ← Assistant Diagnostic
│   ├── ordonnance\
│   │   ├── types.ts                  ← Types TypeScript (310 lignes)
│   │   ├── constants.ts              ← Plantes par axe (624 lignes)
│   │   └── mustForms.ts              ← Formes obligatoires (200+ lignes)
│   └── utils\
│       └── tunisianAdapter.ts        ← Middleware Tunisie (1222 lignes)
├── components\
│   ├── ordonnance\
│   │   ├── GenerateOrdonnanceButton.tsx  ← Bouton génération
│   │   ├── OrdonnancePanel.tsx           ← Affichage legacy
│   │   ├── OrdonnanceInterfaceClient.tsx ← Orchestrateur
│   │   └── ChatPanel.tsx                 ← Conversation IA
│   └── prescription\
│       ├── PrescriptionList.tsx          ← Affichage 6D (737 lignes)
│       ├── PrescriptionCard.tsx          ← Carte plante
│       └── PrescriptionPdfExport.tsx     ← Export PDF
└── prisma\
    └── schema.prisma                     ← Tables BDD (lignes 271-327)
```

---

> **Fin du rapport d'audit**
> Document généré le 2025-12-09
> IntegrIA v2.0 - Module Ordonnance
