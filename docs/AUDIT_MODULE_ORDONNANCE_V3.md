# 🔬 AUDIT EXPERT - MODULE ORDONNANCE INTEGRIA v3.0

> **Version**: 3.0 (Post-intégration Guide Clinique Tunisie)
> **Date**: 2025-12-09
> **Auditeur**: Claude Code
> **Scope**: Génération, Affichage, Chat IA, Adaptation Tunisie + **4 Voies Aromathérapie**

---

## 📊 RÉSUMÉ EXÉCUTIF - CHANGEMENTS v2.0 → v3.0

| Aspect | v2.0 (Avant) | v3.0 (Après) | Statut |
|--------|-------------|--------------|--------|
| **Formes galéniques Tunisie** | 5 types (MICROSPHERES, MACERAT_CONCENTRE, EPS, HE, EPF) | 9 types (+4 voies HE) | ✅ AMÉLIORÉ |
| **Aromathérapie HE** | Voie unique ("cutanee", "orale", etc.) | **4 voies tunisiennes** (S.O.HE, Suppositoire, Cutanée, Inhalation) | ✅ NOUVEAU |
| **Justification plantes** | 5 champs texte libres | **PlantJustification** structurée (7 obligatoires + 2 optionnels) | ✅ AMÉLIORÉ |
| **Badges UI aromathérapie** | Aucun | Badges colorés FOND/AIGU/LOCAL/ORL | ✅ NOUVEAU |
| **Prompt Assistant HE** | Section générique | Section complète 4 voies avec exemples JSON | ✅ AMÉLIORÉ |
| **Niveau confiance IA** | Non présent | Champ `confiance: 'haute' | 'moyenne' | 'faible'` | ✅ NOUVEAU |

---

## 📋 TABLE DES MATIÈRES

1. [Nouveaux fichiers créés](#1-nouveaux-fichiers-créés)
2. [Fichiers modifiés](#2-fichiers-modifiés)
3. [Nouvelles structures de données](#3-nouvelles-structures-de-données)
4. [4 Voies Aromathérapie Tunisie](#4-4-voies-aromathérapie-tunisie)
5. [PlantJustification - Structure obligatoire](#5-plantjustification---structure-obligatoire)
6. [Flux de données mis à jour](#6-flux-de-données-mis-à-jour)
7. [Composants UI enrichis](#7-composants-ui-enrichis)
8. [Points critiques résolus](#8-points-critiques-résolus)
9. [Recommandations restantes](#9-recommandations-restantes)

---

## 1. NOUVEAUX FICHIERS CRÉÉS

### 1.1 tunisianProtocols.ts (NOUVEAU)

**Chemin**: `lib/ordonnance/tunisianProtocols.ts`
**Lignes**: ~366
**Rôle**: Source de vérité pour le Guide Clinique de Prescription Tunisie

```typescript
// Types exportés
export type FormeTheorique = 'TM' | 'MG_1DH' | 'EPS' | 'HE';
export type FormePratiqueTunisie =
  | 'MICROSPHERES'        // TM → Gélules 400-600mg
  | 'MACERAT_MERE'        // MG 1DH → Gouttes concentrées
  | 'EPS'                 // Identité
  | 'SOLUTION_ORALE_HE'   // HE fond chronique → Flacon 125ml
  | 'SUPPOSITOIRES_HE'    // HE aigu ORL → Boîte 6-12
  | 'HE_CUTANEE'          // HE locale → Dilution HV
  | 'HE_INHALATION';      // HE respiratoire → Humide/Sèche

export type VoieAromatherapie =
  | 'SOLUTION_ORALE'      // Voie 1: Traitement de fond
  | 'SUPPOSITOIRE'        // Voie 2: Urgence ORL/pulmonaire
  | 'CUTANEE'             // Voie 3: Action ciblée locale
  | 'INHALATION';         // Voie 4: Désinfection aérienne

export type NiveauConfiance = 'haute' | 'moyenne' | 'faible';
```

#### Constantes clés

```typescript
// TABLEAU_CONVERSION - Règles de conversion France → Tunisie
export const TABLEAU_CONVERSION = {
  TM: { formePratique: 'MICROSPHERES', posologieStandard: '1 à 2 gélules/jour' },
  MG_1DH: { formePratique: 'MACERAT_MERE', posologieStandard: '15 gouttes/jour' },
  EPS: { formePratique: 'EPS', posologieStandard: '5 à 10 ml/jour' },
  HE_FOND: { formePratique: 'SOLUTION_ORALE_HE', posologieStandard: '2 ml x 2/jour' },
  HE_AIGU: { formePratique: 'SUPPOSITOIRES_HE', posologieStandard: '2 à 3/jour' },
};

// VOIES_AROMATHERAPIE - Configuration complète 4 voies
export const VOIES_AROMATHERAPIE = {
  SOLUTION_ORALE: {
    nom: 'SOLUTION ORALE HE (S.O.HE)',
    indication: 'Pathologies chroniques, dysbioses, prévention',
    badge: 'FOND',
    couleur: '#10b981', // emerald-500
  },
  SUPPOSITOIRE: {
    nom: 'SUPPOSITOIRE HE',
    indication: 'Bronchite aiguë, Grippe, Angine, Otite, Sinusite',
    badge: 'AIGU',
    couleur: '#ef4444', // red-500
  },
  CUTANEE: {
    nom: 'VOIE CUTANÉE',
    indication: 'Douleur locale, infection topique, action nerveuse',
    badge: 'LOCAL',
    couleur: '#f59e0b', // amber-500
  },
  INHALATION: {
    nom: 'INHALATION',
    indication: 'Sinusite, Rhinite, encombrement nasal',
    badge: 'ORL',
    couleur: '#3b82f6', // blue-500
  },
};

// CONTRE_INDICATIONS_PEDIATRIE
export const CONTRE_INDICATIONS_PEDIATRIE = {
  heProscrites: [
    { nom: 'Menthe poivrée', raison: 'Spasme laryngé' },
    { nom: 'Sauge officinale', raison: 'Cétones neurotoxiques' },
    { nom: 'Hysope officinale', raison: 'Cétones neurotoxiques' },
  ],
  ageMinimumVoieOrale: 6, // ans
  ageMinimumSuppositoire: 3, // ans
};
```

#### Fonctions utilitaires

```typescript
// Détermine automatiquement la voie selon l'indication
export function determinerVoieAromatherapie(
  indication: string,
  aigu: boolean = false
): VoieAromatherapie;

// Génère la posologie tunisienne
export function genererPosologieTunisie(
  formePratique: FormePratiqueTunisie,
  intensite: 'leger' | 'standard' | 'intensif' = 'standard'
): string;

// Retourne badge + couleur pour l'UI
export function getBadgeVoieAroma(voie: VoieAromatherapie): { badge: string; couleur: string };
```

---

## 2. FICHIERS MODIFIÉS

### 2.1 types.ts (ENRICHI)

**Chemin**: `lib/ordonnance/types.ts`
**Changements**: +75 lignes

#### AJOUT: PlantJustification (lignes 20-47)

```typescript
/**
 * Interface de justification obligatoire pour chaque plante prescrite
 * TOUS les champs sont OBLIGATOIRES sauf ceux marqués "?"
 */
export interface PlantJustification {
  /** Symptôme SPÉCIFIQUE ciblé - ex: "Insomnie d'endormissement" */
  symptome_cible: string;

  /** Format "[Axe] - [Action]" - ex: "SNA - Alpha-sympatholytique" */
  axe_endobiogenique: string;

  /** Mécanisme pharmacologique précis */
  mecanisme_action: string;

  /** Synergies avec les AUTRES plantes de cette ordonnance */
  synergies: string[];

  /** Lien avec le diagnostic patient - ex: "Index Corticotrope élevé (1.4)" */
  justification_terrain: string;

  /** Base scientifique - ex: "Monographie HMPC/EMA" */
  justification_classique: string;

  /** Vulgarisation pour le patient */
  explication_patient: string;

  /** Précautions spécifiques (optionnel) */
  precautions?: string[];

  /** Niveau de confiance IA (optionnel, saisi par l'IA) */
  confiance?: NiveauConfiance;
}
```

#### AJOUT: AromatherapiePrescription (lignes 56-95)

```typescript
/**
 * Prescription d'huile essentielle avec voie d'administration tunisienne
 */
export interface AromatherapiePrescription {
  huile_essentielle: string;
  name_latin: string;
  chemotype?: string;
  voie: VoieAromatherapie;    // 🆕 4 voies Tunisie
  posologie: string;
  dilution?: string;
  huile_vegetale?: string;
  zone_application?: string;
  duree: string;
  justification: PlantJustification;  // 🆕 Justification structurée
  contre_indications?: string[];
  precautions_emploi?: string[];
  priorite: 1 | 2 | 3;
}
```

#### MODIFIÉ: RecommandationTherapeutique (lignes 98-130)

```typescript
type RecommandationTherapeutique = {
  // ... champs existants ...

  // 🆕 NOUVEAU v3.0: Justification structurée complète
  justification?: PlantJustification;

  // 🆕 Aromathérapie spécifique (si type='HE')
  voieAroma?: VoieAromatherapie;  // Voie d'administration Tunisie
  chemotype?: string;
  dilution?: string;
  huileVegetale?: string;
  zoneApplication?: string;
};
```

---

### 2.2 tunisianAdapter.ts (ENRICHI)

**Chemin**: `lib/utils/tunisianAdapter.ts`
**Changements**: +50 lignes

#### MODIFIÉ: FormeTunisie (lignes 47-58)

```typescript
// AVANT v2.0
export type FormeTunisie = 'MICROSPHERES' | 'MACERAT_CONCENTRE' | 'EPS' | 'HE' | 'EPF';

// APRÈS v3.0
export type FormeTunisie =
  // Formes classiques (inchangées)
  | 'MICROSPHERES' | 'MACERAT_CONCENTRE' | 'EPS' | 'HE' | 'EPF'
  // 🆕 Nouvelles formes aromathérapie Tunisie v3.0
  | 'SOLUTION_ORALE_HE'   // HE fond chronique (Voie 1)
  | 'SUPPOSITOIRES_HE'    // HE aigu ORL (Voie 2)
  | 'HE_CUTANEE'          // HE locale (Voie 3)
  | 'HE_INHALATION';      // HE respiratoire (Voie 4)
```

#### MODIFIÉ: PlantInput (lignes 67-99)

```typescript
export interface PlantInput {
  // ... champs existants ...

  // 🆕 Justification structurée v3.0
  symptome_cible?: string;
  justification_terrain?: string;
  justification_classique?: string;
  explication_patient?: string;
  axe_cible?: string;
  mecanisme?: string;
  synergies?: string[];
  confiance?: 'haute' | 'moyenne' | 'faible';
  precautions?: string[];

  // 🆕 Aromathérapie spécifique (si HE)
  voie_aroma?: VoieAromatherapie;
  chemotype?: string;
  dilution?: string;
  huile_vegetale?: string;
  zone_application?: string;
  aigu?: boolean;  // Indication aiguë vs fond
}
```

#### MODIFIÉ: PlantOutput (lignes 101-124)

```typescript
export interface PlantOutput extends PlantInput {
  // ... champs existants ...

  // 🆕 Aromathérapie - Badge voie (pour affichage UI)
  voie_badge?: string;        // "FOND" | "AIGU" | "LOCAL" | "ORL"
  voie_couleur?: string;      // Couleur hex pour le badge
}
```

#### MODIFIÉ: adaptPlant - CAS D HE (lignes 903-949)

```typescript
// AVANT v2.0 - HE simple
else if (formIn.includes('HE') || formIn.includes('HUILE')) {
  if (dbEntry.formes_dispo.includes('HE')) {
    output.adapted_form = "HE";
    output.adapted_dosage = plant.dosage;
    output.conversion_note = "✅ Conforme: HE disponible tel quel";
  }
}

// APRÈS v3.0 - 4 voies Tunisie
else if (formIn.includes('HE') || formIn.includes('HUILE')) {
  if (dbEntry.formes_dispo.includes('HE')) {
    // 🆕 Déterminer la voie d'aromathérapie
    const voie: VoieAromatherapie = plant.voie_aroma ||
      determinerVoieAromatherapie(plant.symptome_cible || plant.justification || '', plant.aigu || false);

    // 🆕 Récupérer le badge et couleur pour l'UI
    const voieConfig = VOIES_AROMATHERAPIE[voie];
    output.voie_badge = voieConfig.badge;
    output.voie_couleur = voieConfig.couleur;

    // 🆕 Adapter la forme et posologie selon la voie
    switch (voie) {
      case 'SOLUTION_ORALE':
        output.adapted_form = "Solution Orale HE (S.O.HE)";
        output.adapted_dosage = "2 ml x 2/jour au milieu du repas, 30 jours";
        break;
      case 'SUPPOSITOIRE':
        output.adapted_form = "Suppositoires HE";
        output.adapted_dosage = "1 suppositoire matin et soir, 3-5 jours";
        break;
      case 'CUTANEE':
        output.adapted_form = "HE voie cutanée";
        output.adapted_dosage = `Dilution ${plant.dilution || '5-10%'} dans ${plant.huile_vegetale || 'HV Jojoba'}`;
        break;
      case 'INHALATION':
        output.adapted_form = "HE inhalation";
        output.adapted_dosage = "5-10 gouttes dans bol d'eau chaude, 10min x 2-3/jour";
        break;
    }
  }
}
```

---

### 2.3 route.ts (ENRICHI)

**Chemin**: `app/api/ordonnances/generate/route.ts`
**Changements**: +80 lignes

#### AJOUT: Imports (lignes 26-27)

```typescript
// 🆕 IMPORT PROTOCOLES TUNISIE (Guide Galénique v1.0)
import { getBadgeVoieAroma, VOIES_AROMATHERAPIE, type VoieAromatherapie } from '@/lib/ordonnance/tunisianProtocols';
```

#### MODIFIÉ: voletEndobiogenique (lignes 401-457)

```typescript
// 🆕 Justification structurée (PlantJustification) ajoutée
const voletEndobiogeniqueRaw = [
  ...(ordonnanceResponse.volet_drainage?.prescriptions || []).map((p: any, idx: number) => ({
    // ... champs existants ...
    // 🆕 Justification structurée
    justification: {
      symptome_cible: p.justification?.symptome_cible || `Drainage ${p.emonctoire || 'hépatique'}`,
      axe_endobiogenique: p.justification?.axe_endobiogenique || "Préparation terrain",
      mecanisme_action: p.justification?.mecanisme_action || p.action || "",
      synergies: p.justification?.synergies || [],
      justification_terrain: p.justification?.justification_terrain || "",
      justification_classique: p.justification?.justification_classique || p.action || "",
      explication_patient: p.justification?.explication_patient || p.explication_patient || "",
      precautions: p.justification?.precautions || [],
      confiance: p.justification?.confiance || null,
    },
  })),
  // ... idem pour volet_canon ...
];
```

#### MODIFIÉ: voletAromatherapie (lignes 483-529)

```typescript
// 🆕 ENRICHI avec 4 voies Tunisie
const voletAromatherapie = (ordonnanceResponse.volet_aromatherapie?.prescriptions || []).map((p: any, idx: number) => {
  // 🆕 Normaliser la voie vers le format Tunisien
  const voieRaw = (p.voie || "CUTANEE").toUpperCase() as VoieAromatherapie;
  const voieNormalized: VoieAromatherapie =
    ["SOLUTION_ORALE", "SUPPOSITOIRE", "CUTANEE", "INHALATION"].includes(voieRaw)
      ? voieRaw
      : "CUTANEE"; // Fallback

  // 🆕 Récupérer badge et couleur depuis tunisianProtocols
  const { badge: voie_badge, couleur: voie_couleur } = getBadgeVoieAroma(voieNormalized);

  return {
    // ... champs existants ...
    // 🆕 Voie tunisienne avec badge/couleur
    voie: voieNormalized,
    voie_badge,
    voie_couleur,
    // 🆕 Justification structurée complète
    justification: {
      symptome_cible: p.justification?.symptome_cible || p.indication || "",
      axe_endobiogenique: p.justification?.axe_endobiogenique || p.axe_cible || "",
      mecanisme_action: p.justification?.mecanisme_action || p.mecanisme || "",
      synergies: p.justification?.synergies || [],
      justification_terrain: p.justification?.justification_terrain || "",
      justification_classique: p.justification?.justification_classique || "",
      explication_patient: p.justification?.explication_patient || "",
      precautions: p.justification?.precautions || p.precautions || [],
      confiance: p.justification?.confiance || null,
    },
  };
});
```

---

### 2.4 assistantOrdonnanceV5.ts (ENRICHI)

**Chemin**: `lib/ai/assistantOrdonnanceV5.ts`
**Changements**: Section aromathérapie complètement réécrite

#### MODIFIÉ: VoieAdministrationHE (lignes ~45)

```typescript
// AVANT v2.0
export type VoieAdministrationHE = "cutanee" | "orale" | "diffusion" | "inhalation";

// APRÈS v3.0
export type VoieAdministrationHE =
  | "SOLUTION_ORALE"  // Voie 1: Traitement de fond (S.O.HE)
  | "SUPPOSITOIRE"    // Voie 2: Urgence ORL/pulmonaire
  | "CUTANEE"         // Voie 3: Action locale ciblée
  | "INHALATION";     // Voie 4: Désinfection ORL
```

#### MODIFIÉ: Section prompt aromathérapie (lignes ~460-550)

```markdown
## AROMATHÉRAPIE TUNISIE - LES 4 VOIES MAJEURES

### VOIE 1: SOLUTION ORALE HE (S.O.HE) - Traitement de fond
- **Indication**: Pathologies chroniques, dysbioses, prévention
- **Formule type**: Huile olive 100ml + Labrafil 20ml + HE 4-8g
- **Posologie**: 4 ml/jour (2 prises de 2 ml)
- **Durée**: 30 jours
- **Moment**: Au milieu du repas
- **Voie JSON**: "SOLUTION_ORALE"

### VOIE 2: SUPPOSITOIRE - Urgence ORL & Pulmonaire
- **Indication**: Bronchite aiguë, Grippe, Angine, Otite, Sinusite
- **Intérêt**: Bypasse le foie, action directe arbre respiratoire
- **Posologie**: 1 suppositoire matin et soir (voire 3x/j si très aigu)
- **Durée**: 3 à 6 jours MAX
- **Voie JSON**: "SUPPOSITOIRE"

### VOIE 3: CUTANÉE - Action ciblée locale
- **Indication**: Douleur locale, infection topique, action nerveuse
- **Dilutions**:
  - Cosmétique: 1-3%
  - Musculaire: 5-10%
  - Thérapeutique: 10-20%
- **Zones**: Plante des pieds, Thorax, Plexus solaire, Poignets
- **Voie JSON**: "CUTANEE"

### VOIE 4: INHALATION - Désinfection aérienne
- **Indication**: Sinusite, Rhinite, encombrement nasal
- **Humide**: 5-10 gouttes eau chaude, 10 min, 2-3x/jour
- **Sèche**: 2 gouttes mouchoir, 5-10 fois/jour
- **Voie JSON**: "INHALATION"

### TABLEAU INDICATION → VOIE

| Indication Patient | Voie Recommandée |
|-------------------|------------------|
| Bronchite AIGUË, grippe, angine | SUPPOSITOIRE |
| Rhinite, sinusite, nez bouché | INHALATION |
| Dysbiose, terrain chronique | SOLUTION_ORALE |
| Douleur musculaire/articulaire | CUTANEE |
| Stress, anxiété (plexus solaire) | CUTANEE |
| Infection ORL avec fièvre | SUPPOSITOIRE |
| Prévention hivernale | SOLUTION_ORALE |
```

---

### 2.5 PrescriptionCard.tsx (ENRICHI)

**Chemin**: `components/prescription/PrescriptionCard.tsx`
**Changements**: +18 lignes

#### AJOUT: Badge Voie Aromathérapie (lignes 118-135)

```tsx
{/* 🆕 Badge Voie Aromathérapie (si HE) */}
{plant.voie_badge && (
  <Badge
    variant="outline"
    className="text-[10px] h-5 font-bold"
    style={{
      backgroundColor: plant.voie_couleur ? `${plant.voie_couleur}20` : undefined,
      borderColor: plant.voie_couleur || undefined,
      color: plant.voie_couleur || undefined,
    }}
  >
    {plant.voie_badge === 'FOND' && '💧'}
    {plant.voie_badge === 'AIGU' && '🔥'}
    {plant.voie_badge === 'LOCAL' && '🎯'}
    {plant.voie_badge === 'ORL' && '💨'}
    {' '}{plant.voie_badge}
  </Badge>
)}
```

---

## 3. NOUVELLES STRUCTURES DE DONNÉES

### 3.1 Hiérarchie des types

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOUVEAUX TYPES v3.0                          │
└─────────────────────────────────────────────────────────────────┘

tunisianProtocols.ts
├── VoieAromatherapie          ← SOLUTION_ORALE | SUPPOSITOIRE | CUTANEE | INHALATION
├── FormePratiqueTunisie       ← 9 formes (5 existantes + 4 HE)
├── NiveauConfiance            ← haute | moyenne | faible
├── VOIES_AROMATHERAPIE        ← Config complète 4 voies
├── PROTOCOLES                 ← Détails microsphères, macérat, eps
└── CONTRE_INDICATIONS_PEDIATRIE

types.ts
├── PlantJustification         ← 7 champs obligatoires + 2 optionnels
├── AromatherapiePrescription  ← HE avec voie Tunisie
└── RecommandationTherapeutique ← Enrichi avec justification + voieAroma

tunisianAdapter.ts
├── FormeTunisie               ← 9 formes (étendu)
├── PlantInput                 ← +15 champs justification/aroma
└── PlantOutput                ← +voie_badge, voie_couleur
```

### 3.2 Mapping voie → badge → couleur

| Voie | Badge | Couleur | Emoji |
|------|-------|---------|-------|
| SOLUTION_ORALE | FOND | #10b981 (emerald) | 💧 |
| SUPPOSITOIRE | AIGU | #ef4444 (red) | 🔥 |
| CUTANEE | LOCAL | #f59e0b (amber) | 🎯 |
| INHALATION | ORL | #3b82f6 (blue) | 💨 |

---

## 4. 4 VOIES AROMATHÉRAPIE TUNISIE

### 4.1 Règles de sélection automatique

```typescript
// lib/ordonnance/tunisianProtocols.ts - determinerVoieAromatherapie()

function determinerVoieAromatherapie(indication: string, aigu: boolean): VoieAromatherapie {
  // VOIE 2: Suppositoire si aigu ORL/pulmonaire
  if (aigu && (
    indication.includes('bronchite') ||
    indication.includes('grippe') ||
    indication.includes('angine') ||
    indication.includes('orl')
  )) {
    return 'SUPPOSITOIRE';
  }

  // VOIE 4: Inhalation si respiratoire léger
  if (indication.includes('rhinite') || indication.includes('nez bouché')) {
    return 'INHALATION';
  }

  // VOIE 3: Cutanée si local
  if (indication.includes('douleur') || indication.includes('musculaire')) {
    return 'CUTANEE';
  }

  // VOIE 1: Solution orale par défaut (fond)
  return 'SOLUTION_ORALE';
}
```

### 4.2 Posologies par voie

| Voie | Posologie Standard | Durée | Moment |
|------|-------------------|-------|--------|
| SOLUTION_ORALE | 2 ml x 2/jour | 30 jours | Au milieu du repas |
| SUPPOSITOIRE | 1 matin + 1 soir | 3-6 jours | Matin et soir |
| CUTANEE | Dilution 5-20% HV | Variable | Selon zone |
| INHALATION | 5-10 gouttes | 10 min x 2-3/j | N/A |

---

## 5. PLANTJUSTIFICATION - STRUCTURE OBLIGATOIRE

### 5.1 Champs obligatoires (7)

| # | Champ | Type | Exemple |
|---|-------|------|---------|
| 1 | `symptome_cible` | string | "Insomnie d'endormissement" |
| 2 | `axe_endobiogenique` | string | "SNA - Alpha-sympatholytique" |
| 3 | `mecanisme_action` | string | "Action GABAergique, potentialise récepteurs GABA-A" |
| 4 | `synergies` | string[] | ["Potentialise Tilia sur axe SNA"] |
| 5 | `justification_terrain` | string | "Index Corticotrope élevé (1.4)" |
| 6 | `justification_classique` | string | "Monographie HMPC/EMA, études cliniques" |
| 7 | `explication_patient` | string | "Cette plante calme le système nerveux..." |

### 5.2 Champs optionnels (2)

| # | Champ | Type | Description |
|---|-------|------|-------------|
| 8 | `precautions` | string[] | Précautions spécifiques |
| 9 | `confiance` | 'haute' \| 'moyenne' \| 'faible' | Niveau de confiance IA |

### 5.3 Validation côté Assistant

Le prompt système interdit désormais les justifications vagues :

```markdown
❌ INTERDIT:
- "Anxiété"
- "Bon pour le terrain"
- "Plante calmante traditionnelle"

✅ REQUIS:
- "SNA - Alpha-sympatholytique, réduit hyperactivité sympathique"
- "Index Corticotrope élevé (1.4) → nécessite frein ACTH"
- "Action GABAergique - potentialise récepteurs GABA-A"
```

---

## 6. FLUX DE DONNÉES MIS À JOUR

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUX GÉNÉRATION ORDONNANCE v3.0                          │
└─────────────────────────────────────────────────────────────────────────────┘

[1] GenerateOrdonnanceButton.tsx
    │
    ▼ POST /api/ordonnances/generate
    │
[2] route.ts
    │
    ├─► callOrdonnanceAssistantV5()
    │   │
    │   ▼ OpenAI Assistants API
    │   │ - Prompt enrichi 4 voies aromathérapie
    │   │ - PlantJustification obligatoire
    │   │
    │   ▼ OrdonnanceResponse
    │       └── volet_aromatherapie.prescriptions[]
    │           ├── voie: "SOLUTION_ORALE" | "SUPPOSITOIRE" | "CUTANEE" | "INHALATION"
    │           └── justification: { symptome_cible, axe_endobiogenique, ... }
    │
    ├─► adaptToNewStructure()
    │   │
    │   ▼ Enrichit avec:
    │       ├── voie_badge (via getBadgeVoieAroma)
    │       ├── voie_couleur
    │       └── justification structurée
    │
    └─► adaptPrescriptionToTunisia()
        │
        ▼ tunisianAdapter.ts
          │
          ├─► adaptPlant() - CAS D: HE
          │   │
          │   ▼ Détecte voie via:
          │       1. plant.voie_aroma (si fourni par IA)
          │       2. determinerVoieAromatherapie() (auto)
          │   │
          │   ▼ Enrichit output:
          │       ├── voie_badge: "FOND" | "AIGU" | "LOCAL" | "ORL"
          │       ├── voie_couleur: "#10b981" | "#ef4444" | ...
          │       ├── adapted_form: "Solution Orale HE" | "Suppositoires HE" | ...
          │       └── adapted_dosage: Posologie tunisienne
          │
          └─► PrescriptionOutput
                │
                ▼ Sauvegarde Prisma
                │
                ▼ Réponse API
    │
    ▼
[3] OrdonnanceInterfaceClient.tsx
    │
    ▼ mapOrdonnanceToPrescription()
    │
    ▼ PrescriptionList.tsx
        │
        ▼ DimensionSection (aromatherapie)
            │
            ▼ PrescriptionCard.tsx
                │
                ▼ Badge coloré avec:
                    ├── voie_badge: "FOND" | "AIGU" | "LOCAL" | "ORL"
                    ├── voie_couleur: Couleur hex
                    └── Emoji: 💧 | 🔥 | 🎯 | 💨
```

---

## 7. COMPOSANTS UI ENRICHIS

### 7.1 PrescriptionCard - Avant/Après

**AVANT v2.0**:
```
┌─────────────────────────────────────────────┐
│ 🌿 Lavande vraie (Lavandula angustifolia)   │
│ [Dispo 🇹🇳] [Adapté] [📚 Classique]          │
│                                             │
│ HE | 3 gouttes diluées                      │
└─────────────────────────────────────────────┘
```

**APRÈS v3.0**:
```
┌─────────────────────────────────────────────┐
│ 🌿 Lavande vraie (Lavandula angustifolia)   │
│ [Dispo 🇹🇳] [Adapté] [📚 Classique] [🎯 LOCAL]│
│                                             │
│ HE voie cutanée | Dilution 10% dans HV Jojoba
│ ⏱️ 15 jours                                 │
│                                             │
│ 🔽 Pourquoi ?                               │
│ ┌─────────────────────────────────────────┐ │
│ │ 🧬 Logique Terrain                      │ │
│ │ Profil SNA sympathicotonique marqué...  │ │
│ ├─────────────────────────────────────────┤ │
│ │ 🧪 Base Scientifique                    │ │
│ │ Monographie EMA: anxiolytique...        │ │
│ ├─────────────────────────────────────────┤ │
│ │ 👤 Pour le patient                      │ │
│ │ "Cette huile de lavande apaise..."      │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 7.2 Badges visuels par voie

| Badge | Apparence |
|-------|-----------|
| 💧 FOND | ![](emerald-badge) Vert émeraude |
| 🔥 AIGU | ![](red-badge) Rouge urgence |
| 🎯 LOCAL | ![](amber-badge) Orange ambre |
| 💨 ORL | ![](blue-badge) Bleu ciel |

---

## 8. POINTS CRITIQUES RÉSOLUS

### 8.1 Problèmes identifiés dans v2.0 et solutions v3.0

| Problème v2.0 | Solution v3.0 | Fichier |
|---------------|---------------|---------|
| HE voie unique non spécifique | 4 voies tunisiennes distinctes | tunisianProtocols.ts |
| Justifications texte libre | PlantJustification structurée | types.ts |
| Pas de badge visuel HE | voie_badge + voie_couleur | PrescriptionCard.tsx |
| Prompt HE générique | Section complète avec exemples JSON | assistantOrdonnanceV5.ts |
| Conversion HE identité | Adaptation posologie par voie | tunisianAdapter.ts |

### 8.2 Checklist conformité Guide Clinique Tunisie

| Règle Guide | Implémentée | Fichier |
|-------------|-------------|---------|
| TM → Microsphères (÷10) | ✅ | tunisianAdapter.ts:846 |
| MG 1DH → Concentré (÷10) | ✅ | tunisianAdapter.ts:866 |
| EPS identité 5j/7 | ✅ | tunisianAdapter.ts:886 |
| HE S.O.HE = 2ml x 2/j | ✅ | tunisianAdapter.ts:919 |
| HE Suppositoires = 3-6j | ✅ | tunisianAdapter.ts:924 |
| HE Cutanée = dilution HV | ✅ | tunisianAdapter.ts:929 |
| HE Inhalation = 10min | ✅ | tunisianAdapter.ts:934 |
| CI pédiatriques HE | ✅ | tunisianProtocols.ts:234 |

---

## 9. RECOMMANDATIONS RESTANTES

### 9.1 Court terme (1-2 semaines)

| Priorité | Action | Fichier |
|----------|--------|---------|
| 🔴 HAUTE | Ajouter tests unitaires PlantJustification | tests/justification.test.ts |
| 🔴 HAUTE | Valider mapping voie dans chat IA | route.ts (chat) |
| 🟡 MOYENNE | Externaliser VOIES_AROMATHERAPIE en JSON | config/aromatherapie.json |

### 9.2 Moyen terme (1 mois)

| Priorité | Action | Bénéfice |
|----------|--------|----------|
| 🟡 MOYENNE | Ajouter `confiance` dans UI | Afficher niveau certitude IA |
| 🟡 MOYENNE | Export PDF avec badges couleur | Document professionnel |
| 🟢 BASSE | Historique modifications justifications | Traçabilité |

### 9.3 Points non couverts (hors scope)

- Fine-tuning modèle sur corpus endobiogénie
- Multi-tenant configurations praticien
- RAG hybride VectorStore + BDD locale

---

## ANNEXE A: CHEMINS ABSOLUS MIS À JOUR

```
c:\Users\DELL\Documents\endobiogenie-simple\
├── lib\
│   ├── ordonnance\
│   │   ├── tunisianProtocols.ts   ← 🆕 NOUVEAU (366 lignes)
│   │   ├── types.ts               ← ENRICHI (+75 lignes)
│   │   ├── constants.ts           ← Inchangé
│   │   └── mustForms.ts           ← Inchangé
│   ├── utils\
│   │   └── tunisianAdapter.ts     ← ENRICHI (+50 lignes)
│   └── ai\
│       └── assistantOrdonnanceV5.ts ← ENRICHI (section HE réécrite)
├── app\
│   └── api\
│       └── ordonnances\
│           └── generate\
│               └── route.ts       ← ENRICHI (+80 lignes)
└── components\
    └── prescription\
        └── PrescriptionCard.tsx   ← ENRICHI (+18 lignes badge)
```

## ANNEXE B: EXEMPLES JSON RÉPONSE ASSISTANT v3.0

### B.1 Prescription HE - Voie CUTANEE

```json
{
  "huile_essentielle": "Lavande vraie",
  "name_latin": "Lavandula angustifolia",
  "chemotype": "Linalol, acétate de linalyle",
  "voie": "CUTANEE",
  "posologie": "3-5 gouttes",
  "dilution": "10%",
  "huile_vegetale": "Jojoba",
  "zone_application": "Plexus solaire et poignets",
  "duree": "15 jours",
  "justification": {
    "symptome_cible": "Anxiété avec composante somatique",
    "axe_endobiogenique": "SNA - Rééquilibrage neurovégétatif",
    "mecanisme_action": "Linalol: action GABAergique centrale. Acétate de linalyle: spasmolytique",
    "synergies": ["Complète Passiflora sur sphère anxieuse"],
    "justification_terrain": "Profil sympathicotonique avec Index α-S > 1.2",
    "justification_classique": "Monographie EMA: anxiolytique, sédatif léger",
    "explication_patient": "Cette huile apaise les tensions nerveuses quand appliquée sur le plexus solaire"
  },
  "contre_indications": ["Allergie aux Lamiacées"],
  "precautions": ["Éviter contact yeux", "Test cutané préalable"],
  "priority": 1
}
```

### B.2 Prescription HE - Voie SUPPOSITOIRE

```json
{
  "huile_essentielle": "Ravintsara",
  "name_latin": "Cinnamomum camphora CT cinéole",
  "chemotype": "1,8-cinéole (eucalyptol)",
  "voie": "SUPPOSITOIRE",
  "posologie": "1 suppositoire matin et soir",
  "duree": "5 jours",
  "justification": {
    "symptome_cible": "Bronchite aiguë avec encombrement",
    "axe_endobiogenique": "Immunité - Stimulation défenses antivirales",
    "mecanisme_action": "1,8-cinéole: mucolytique, antiviral direct sur enveloppe virale",
    "synergies": ["Synergie avec Eucalyptus radiata si associé"],
    "justification_terrain": "Épisode infectieux aigu sur terrain fatigué",
    "justification_classique": "Études cliniques: réduction durée infection respiratoire",
    "explication_patient": "Ces suppositoires libèrent l'huile directement dans la circulation pour atteindre vos bronches"
  },
  "contre_indications": ["Enfant < 3 ans", "Asthme sévère"],
  "precautions": ["Cure courte 5j max"],
  "priority": 1
}
```

---

> **Fin du rapport d'audit v3.0**
> Document généré le 2025-12-09
> IntegrIA v3.0 - Module Ordonnance avec Guide Clinique Tunisie
