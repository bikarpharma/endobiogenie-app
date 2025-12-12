# AUDIT COMPLET DU MODULE BIOLOGIE DES FONCTIONS (BdF)

*Généré le 5 Décembre 2024*

---

## RÉSUMÉ EXÉCUTIF

Le module BdF est un système sophistiqué de calcul et d'interprétation d'index biologiques fonctionnels basé sur la théorie de l'endobiogénie (Lapraz/Hedayat). Le code est bien structuré mais présente **plusieurs problèmes critiques** :

1. **Index orphelins** : Plusieurs index sont référencés mais jamais définis
2. **Normes incomplètes** : Les normes de l'IA sont décalées par rapport aux normes du système principal
3. **Formules manquantes** : Certains index critiques manquent complètement
4. **Gestion des panneaux** : Mismatch entre les index définis et ceux utilisés dans les panels

---

## 1. ARCHITECTURE DES FICHIERS

```
lib/bdf/
├── calculateIndexes.ts          # Fonction principale - calcul avec conversions BdF
├── types.ts                      # Types legacy (deprecated)
├── convertToAnalysis.ts          # Conversion format ancien → nouveau
├── detectLabValues.ts            # Détection de valeurs biologiques en texte libre
│
├── biomarkers/
│   └── biomarkers.config.ts      # Définition 40+ biomarqueurs
│
├── indexes/
│   ├── indexes.config.ts         # ⚠️ CONFIG PRINCIPALE (25+ index définis)
│   ├── index-types.ts            # Types TypeScript pour les index
│   ├── index-formulas.ts         # Fonctions de calcul (ratio, product, composite)
│   ├── index-categories.ts       # Catégories d'index
│   └── calculateIndex.ts         # Moteur de calcul récursif avec cache
│
└── panels/
    ├── panels.config.ts          # ⚠️ Organisation en 7 panneaux/axes
    └── panel-types.ts            # Types d'interface
```

---

## 2. ARCHITECTURE DÉTAILLÉE DES CALCULS

### 2.1 FLUX DE CALCUL PRINCIPAL

```typescript
// lib/bdf/calculateIndexes.ts

calculateAllIndexes(biomarkers) {
  1. ÉTAPE 1: CONVERSIONS BDF AUTOMATIQUES
     ├─ GR: ÷10⁶ (5200000 → 5.2 si > 100)
     ├─ GB: ÷10³ (6500 → 6.5 si > 100)
     ├─ PLAQUETTES: ÷10³ si > 10000
     └─ CA: ÷2 si > 5

  2. ÉTAPE 2: CORRECTION TSH
     ├─ Si TSH < 0.5 → 0.5 + warning
     └─ Si TSH > 5 → 5 + warning (jamais hyperthyroïdie!)

  3. ÉTAPE 3: CALCUL DES INDEX
     └─ calculateIndex() pour chaque IndexDefinition
        ├─ Résout les dépendances (cache)
        ├─ Valide les biomarqueurs
        ├─ Applique la formule
        └─ Détermine le status (low/normal/high)

  4. ÉTAPE 4: DÉTECTION HYPOTHYROÏDIE LATENTE
     └─ Si TSH [0.5-4] ∧ IdxThyroïdien < 3.5 → warning
}
```

### 2.2 MOTEUR DE CALCUL RÉCURSIF

```typescript
// lib/bdf/indexes/calculateIndex.ts

calculateIndex(indexDef, biomarkers, indexCache) {
  // Gère 4 types d'index:

  1. RATIO: a / b
     ├─ indexGenital = GR / GB
     └─ indexThyroidien = LDH / CPK

  2. PRODUCT: a * b
     └─ Rare, peu utilisé

  3. COMPOSITE: formules complexes
     ├─ Résout les dépendances récursivement
     ├─ Supporte opérateurs: +, -, *, /, ()
     └─ Exemples:
        - idx_cortisol_cortex = idx_cortisol / idx_cortex_surrenalien
        - idx_mobilisation_plaquettes = PLAQUETTES / (60 * GR)

  4. SECRET: masque la formule
     └─ Retourne null (prototype/debug)
}
```

---

## 3. LISTE COMPLÈTE DES INDEX BDF

### 3.1 INDEX DÉFINIS (25 index + 5 orphelins)

#### SECTION 1: GONADOTROPE (Androgènes vs Œstrogènes)

| ID | Formule | Normes | Description |
|---|---|---|---|
| `idx_genital` | GR / GB | [0.70, 0.85] | Index fondamental - équilibre hormonal |
| `idx_genito_thyroidien` | NEUT / LYMPH | [1.5, 2.5] | Couplage gonado-thyroïde |
| `idx_oestrogenes` | TSH / OSTEO | [0.14, 0.24] | Activité œstrogénique métabolique |
| `idx_genital_corrige` | idx_genital × idx_starter | [0.70, 0.85] | Adaptation aiguë hormones génitales |

#### SECTION 2: CORTICOTROPE (Adaptation au stress)

| ID | Formule | Normes | Description |
|---|---|---|---|
| `idx_adaptation` | EOS / MONO | [0.25, 0.50] | Capacité adaptation corticotrope |
| `idx_cortisol_cortex` | idx_cortisol / idx_cortex | [2.0, 4.0] | Déséquilibre cortisol/cortex |

❌ **MANQUANTS**: `idx_cortisol`, `idx_cortex_surrenalien` → Ces index sont référencés mais jamais définis !

#### SECTION 3: SNA - SYSTÈME NERVEUX AUTONOME

| ID | Formule | Normes | Description |
|---|---|---|---|
| `idx_mobilisation_plaquettes` | PLAQUETTES / (60 × GR) | [0.85, 1.15] | Marqueur Bêta-sympathique |
| `idx_mobilisation_leucocytes` | GB / (NEUT+LYMPH+MONO+EOS+BASO) | [0.85, 1.15] | Marqueur Alpha-sympathique |
| `idx_starter` | IML / IMP | [0.85, 1.35] | Énergie adaptation SNA |
| `idx_histamine_potentielle` | (EOS × PLAQUETTES) / idx_cortisol | [6.0, 12.0] | Risque histaminique |

#### SECTION 4: THYRÉOTROPE (Métabolisme)

| ID | Formule | Normes | Description |
|---|---|---|---|
| `idx_thyroidien` | LDH / CPK | [3.5, 5.5] | Index thyroïdien principal |
| `idx_rendement_thyroidien` | LDH / (TSH × CPK) | [2.0, 4.0] | Rendement métabolique thyroïdien |
| `idx_trh_tsh` | TRH / TSH | [0.33, 1.70] | Évalue axe hypothalamo-hypophysaire |

#### SECTION 5: SOMATOTROPE (Croissance)

| ID | Formule | Normes | Description |
|---|---|---|---|
| `idx_croissance` | PAOI / OSTEO | [2.0, 6.0] | Index de croissance |
| `idx_remodelage_osseux` | (TSH × PAOI) / OSTEO | [2.5, 8.5] | Turn-over osseux |
| `idx_osteomusculaire` | idx_genital_corrige × (CPK/PAOI) | [0.75, 5.56] | Prédominance os vs muscle |

#### SECTION 6: MÉTABOLIQUE

| ID | Formule | Normes | Description |
|---|---|---|---|
| `idx_catabolisme` | idx_thyroidien / idx_cortisol | [1.3, 1.6] | Équilibre catabolique |
| `idx_cata_ana` | idx_catabolisme / idx_anabolisme | [1.8, 3.0] | Équilibre global métabolique |
| `idx_hepatique` | ALAT / ASAT | [0.8, 1.2] | Ratio transaminases |
| `idx_capacite_tampon` | GGT / (ALAT+ASAT) | [0.3, 0.8] | Capacité drainage foie |

❌ **MANQUANTS**: `idx_anabolisme` → Référencé mais jamais défini !

#### SECTION 7: MINÉRALOCORTICOÏDE

| ID | Formule | Normes | Description |
|---|---|---|---|
| `idx_mineralo` | NA / K | [28, 34] | Activité aldostérone |

#### SECTION 8: AUTRES

| ID | Formule | Normes | Description |
|---|---|---|---|
| `idx_inflammation` | CRP × VS / 10 | [0, 5] | Inflammation systémique |
| `idx_pth` | CA / P | [2.0, 42.0] | Activité parathyroïdienne |
| `idx_insuline` | TG / GLY | [1.5, 5.0] | Sensibilité insulinique |
| `idx_oxydo_reduction` | idx_oxydation / idx_reduction | [0.7, 2.0] | Équilibre redox |

❌ **MANQUANTS**: `idx_oxydation`, `idx_reduction` → Référencés mais jamais définis !

---

### 3.2 RÉSUMÉ DES PROBLÈMES D'INDEX

```
ÉTAT DES INDEX:

✅ DÉFINIS COMPLÈTEMENT:        25 index
⚠️  ORPHELINS (référencés mais pas définis): 5
    - idx_cortisol (référencé dans idx_cortisol_cortex, idx_histamine)
    - idx_cortex_surrenalien (référencé dans idx_cortisol_cortex)
    - idx_anabolisme (référencé dans idx_cata_ana)
    - idx_oxydation (référencé dans idx_oxydo_reduction)
    - idx_reduction (référencé dans idx_oxydo_reduction)

❌ IMPOSSIBLES À CALCULER:
    - idx_cortisol_cortex (dépend de idx_cortisol + idx_cortex)
    - idx_histamine_potentielle (dépend de idx_cortisol)
    - idx_catabolisme (dépend de idx_cortisol)
    - idx_cata_ana (dépend de idx_anabolisme)
    - idx_oxydo_reduction (dépend de idx_oxydation + idx_reduction)
```

---

## 4. BIOMARQUEURS DISPONIBLES (40 biomarqueurs)

```typescript
// lib/bdf/biomarkers/biomarkers.config.ts

HÉMATOLOGIE (10):
  GR, GB, HB, HCT, NEUT, LYMPH, EOS, MONO, BASO, PLAQUETTES

ENZYMES (2):
  LDH, CPK

HORMONES (3):
  TSH, T3L, T4L

OS/STRUCTURE (3):
  OSTEO, PAOI, PAL

IONOGRAMME (6):
  K, CA, NA, CL, P, MG

MARQUEURS HÉPATIQUES (4):
  ALAT, ASAT, GGT, BILI

MARQUEURS LIPIDIQUES (2):
  CHOL, TG

MARQUEURS RÉNAUX (2):
  CREAT, UREA

MARQUEURS GLYCÉMIQUES (2):
  GLY, HBA1C

MARQUEURS INFLAMMATOIRES (3):
  CRP, VS, FERRITINE

MARQUEURS TUMORAUX (5 optionnels):
  ACE, CA19_9, CA15_3, CA125, PSA
```

---

## 5. CONVERSION BDF ET NORMALISATION

### 5.1 Conversions Automatiques

```typescript
// lib/bdf/calculateIndexes.ts - applyBdfConversion()

// CONVERSION AUTOMATIQUE (Excel: "conversion_bdf")
GR:         Si > 100 → ÷ 1,000,000  (ex: 5200000 → 5.2)
GB:         Si > 100 → ÷ 1,000      (ex: 6500 → 6.5)
PLAQUETTES: Si > 10000 → ÷ 1,000    (ex: 280000 → 280)
CA:         Si > 5 → ÷ 2            (ex: 10 → 5)

// CORRECTION TSH (règle endobiogénie)
TSH < 0.5:  → 0.5 + warning "Désynchronisation somatotrope possible"
TSH > 5:    → 5 + warning "HYPOTHYROÏDIE fonctionnelle (jamais hyper!)"
```

### 5.2 Détections Spéciales

```typescript
// HYPOTHYROÏDIE LATENTE
if (TSH [0.5 - 4] ∧ idx_thyroidien < 3.5) {
  → Warning: "TSH normale MAIS Index Thyroïdien BAS → Hypothyroïdie LATENTE"
}

// Métadonnées retournées
metadata: {
  calculatedAt: Date
  biomarkersCount: int
  conversionsApplied: string[]
  tshCorrected?: { original, corrected, reason }
}
```

---

## 6. CONFIGURATION DES PANELS (7 axes)

```typescript
// lib/bdf/panels/panels.config.ts

PANEL 1: SNA (Système Nerveux Autonome)
  ├─ idx_starter
  ├─ idx_mobilisation_leucocytes
  ├─ idx_mobilisation_plaquettes
  └─ idx_histamine ❌ (orphelin - ne peut pas être calculé)

PANEL 2: CORTICOTROPE (Adaptation)
  ├─ idx_adaptation
  ├─ idx_cortisol_ratio ❌ (nom incorrect - idx_cortisol_cortex)
  └─ idx_mineralo

PANEL 3: THYRÉOTROPE
  ├─ idx_thyroidien
  ├─ idx_rendement_thyroidien
  └─ idx_pth

PANEL 4: GONADOTROPE
  ├─ idx_genital
  ├─ idx_genital_corrige
  ├─ idx_genito_thyroidien
  └─ idx_oestrogenes

PANEL 5: SOMATOTROPE
  ├─ idx_croissance
  ├─ idx_turnover ❌ (nom incorrect - pas de idx_turnover défini)
  ├─ idx_remodelage_osseux
  └─ idx_insuline

PANEL 6: MÉTABOLIQUE
  ├─ idx_catabolisme ❌ (orphelin - dépend de idx_cortisol)
  ├─ idx_rendement_metabolique ❌ (pas défini)
  ├─ idx_hepatique
  └─ idx_capacite_tampon

PANEL 7: IMMUNITAIRE
  ├─ idx_inflammation
  └─ idx_genito_thyroidien
```

---

## 7. INTÉGRATION IA

### 7.1 Préparation des Données pour l'Assistant

```typescript
// lib/ai/prepareDataForAI.ts

Fonction: prepareFullContextForAI()

ÉTAPE 1: Normalisation des données patient
  ├─ Calcul d'âge
  ├─ Normalisation sexe
  ├─ Parsing allergies/médicaments

ÉTAPE 2: Transformation Interrogatoire (V3)
  ├─ Calcul des scores axiaux (clinicalScoringV3)
  ├─ Détection des terrains pathologiques
  └─ Synthèse avec capacité d'adaptation

ÉTAPE 3: Transformation BdF
  ├─ Détection des index hors normes
  ├─ Tri par importance (déviation)
  ├─ Génération orientation globale
  └─ Mappage aux axes concernés

ÉTAPE 4: Fusion en AIReadyData
  └─ Format JSON structuré pour l'Assistant GPT
```

### 7.2 Normes dans prepareDataForAI (PROBLÈME!)

```typescript
const NORMES_BDF_DEFAULT: BdfNormes = {
  // ⚠️ ATTENTION: Ces normes sont DIFFÉRENTES des normes officielles!
  indexThyroidien: { min: 0.85, max: 1.15 },  // ❌ Devrait être 3.5-5.5
  indexRendementThyroidien: { min: 21, max: 27 },  // ❌ Devrait être 2.0-4.0
  indexGenital: { min: 50, max: 100 },  // ❌ Devrait être 0.70-0.85
  // ...
}
```

---

## 8. POINTS D'AMÉLIORATION CRITIQUES

### 8.1 BUGS CRITIQUES (à corriger d'urgence)

#### Bug #1: Index Orphelins
```
PROBLÈME: 5 index référencés mais jamais définis
  - idx_cortisol (utilisé dans 3 calculs)
  - idx_cortex_surrenalien
  - idx_anabolisme
  - idx_oxydation
  - idx_reduction

CONSÉQUENCE: 5 index + leurs dépendants = calcul impossible

SOLUTION:
  1. Ajouter les définitions manquantes dans indexes.config.ts
  2. Définir leurs formules biologiques
  3. Définir leurs normes de référence
```

#### Bug #2: Noms Incorrects dans Panels
```
PROBLÈME: panels.config.ts référence des index inexistants
  - idx_histamine (devrait être: idx_histamine_potentielle)
  - idx_cortisol_ratio (devrait être: idx_cortisol_cortex)
  - idx_turnover (pas défini, peut-être idx_remodelage_osseux?)
  - idx_rendement_metabolique (pas défini)

SOLUTION: Corriger les noms ou ajouter les définitions
```

#### Bug #3: Mismatch Normes IA vs Système
```
PROBLÈME: prepareDataForAI.ts a ses propres normes INCORRECTES

Example:
  NORMES OFFICIELLES (indexes.config.ts):
    idx_thyroidien = [3.5, 5.5]

  NORMES DANS IA (prepareDataForAI.ts):
    indexThyroidien = [0.85, 1.15]  ← COMPLÈTEMENT FAUX!

SOLUTION: Générer les normes dynamiquement depuis indexes.config.ts
```

### 8.2 AMÉLIORATIONS FONCTIONNELLES

#### Amélioration #1: Formules Manquantes
```
Besoin: Définir les formules biologiques manquantes

idx_cortisol:
  ├─ Probable: ratio de biomarqueurs (à valider Excel)
  └─ Biomarqueurs: ??? (Cortisol direct? Ratio?)

idx_cortex_surrenalien:
  └─ Probable: fonction cortex via ions (K/Na?) ou ACTH indirect?

idx_anabolisme:
  ├─ Inverse de idx_catabolisme?
  └─ Ou formule indépendante?

idx_oxydation / idx_reduction:
  └─ Marqueurs d'état redox (lactate? Ratio enzyme redox?)
```

#### Amélioration #2: Index Potentiellement Utiles
```
À ajouter (si biomarqueurs disponibles):
  - Indices de coagulation (Plaquettes, Temps prothrombine)
  - Marqueurs de fonction rénale (Créatinine/Urée ratio)
  - Rapport insuline/glucose (HOMA-IR si insuline disponible)
  - Ratio inflammatoire (IL-6/TNF-alpha si dosages)
  - Marqueurs de perméabilité intestinale
```

#### Amélioration #3: Robustesse des Calculs
```
Suggestions:
  1. Ajouter validation des ranges normaux
     └─ Ex: GR doit être entre 4 et 6 après conversion

  2. Détection de patterns anormaux
     └─ Ex: Tous les biomarqueurs très hauts = erreur lab

  3. Calcul de "confiance"
     └─ Score basé sur % biomarqueurs disponibles

  4. Logging amélioré
     └─ Trace complète du calcul pour debug
```

---

## 9. NORMES COMPLÈTES (TABLEAU CONSOLIDÉ)

| Index | Formule | Min | Max | Interprétation Basse | Interprétation Haute |
|---|---|---|---|---|---|
| idx_genital | GR/GB | 0.70 | 0.85 | Prédominance œstrogénique | Prédominance androgénique |
| idx_genito_thyroidien | NEUT/LYMPH | 1.5 | 2.5 | Hyperimmunité | Auto-immunité |
| idx_adaptation | EOS/MONO | 0.25 | 0.50 | Hypo-adaptation | Bonne adaptation |
| idx_thyroidien | LDH/CPK | 3.5 | 5.5 | Hypothyroïdie latente | Hypermétabolisme |
| idx_rendement_thyroidien | LDH/(TSH×CPK) | 2.0 | 4.0 | Rendement insuffisant | Rendement élevé |
| idx_mobilisation_plaquettes | PLT/(60×GR) | 0.85 | 1.15 | Spasmophilie | Hypermobilisation |
| idx_mobilisation_leucocytes | GB/(NEUT+LYMPH+...) | 0.85 | 1.15 | Congestion | Congestion |
| idx_starter | IML/IMP | 0.85 | 1.35 | Dysfonction SNA | Dysfonction SNA |
| idx_croissance | PAOI/OSTEO | 2.0 | 6.0 | Hypo-GH | Hyper-GH |
| idx_oestrogenes | TSH/OSTEO | 0.14 | 0.24 | Hypo-œstrogénie | Hyper-œstrogénie |
| idx_remodelage_osseux | (TSH×PAOI)/OSTEO | 2.5 | 8.5 | Hypo-remodelage | Hyper-remodelage |
| idx_mineralo | NA/K | 28 | 34 | Hypominéralocorticisme | Hyperminéralocorticisme |
| idx_hepatique | ALAT/ASAT | 0.8 | 1.2 | Souffrance extra-hépatique | Souffrance hépatique |
| idx_capacite_tampon | GGT/(ALAT+ASAT) | 0.3 | 0.8 | Foie préservé | Foie saturé |
| idx_pth | CA/P | 2.0 | 42.0 | Hypo-parathyroïdie | Hyper-parathyroïdie |
| idx_insuline | TG/GLY | 1.5 | 5.0 | Hypo-insulinémie | Hyper-insulinémie |

---

## 10. FICHIERS CLÉS À CORRIGER

### PRIORITÉ 1 (CRITIQUE)
- [x] **lib/bdf/indexes/indexes.config.ts** → ✅ FAIT (5 Dec 2024)
  - Ajout 5 index orphelins (idx_cortisol, idx_cortex_surrenalien, idx_anabolisme, idx_oxydation, idx_reduction)
  - Formules marquées "secret" (non documentées) - normes issues du PDF biomarqueurs_tables.pdf
  - Correction idx_starter: max 1.35 → 1.15
  - Correction idx_inflammation: [0,5] → [2,6]
- [x] **lib/bdf/panels/panels.config.ts** → Corriger noms d'index ✅ FAIT (5 Dec 2024)
- [x] **lib/ai/prepareDataForAI.ts** → Corriger normes BDF ✅ FAIT (5 Dec 2024)
  - Synchronisé avec indexes.config.ts
  - Ajout normes pour les 5 index orphelins

### PRIORITÉ 2 (IMPORTANT)
- [ ] **lib/bdf/indexes/calculateIndex.ts** → Documenter récursion + ajouter trace
- [ ] **app/api/bdf/synthesis/route.ts** → Meilleure validation JSON + test edge cases

### PRIORITÉ 3 (NICE-TO-HAVE)
- [ ] **lib/bdf/calculateIndexes.ts** → Ajouter scoring de confiance
- [ ] **components/** → Afficher tous les index (pas juste 8)

---

## 11. EXEMPLE COMPLET DE CALCUL

### Scenario: Patient femme 45 ans

**INPUT**
```json
{
  "GR": 4200000,
  "GB": 6800,
  "NEUT": 65,
  "LYMPH": 28,
  "EOS": 2,
  "MONO": 4,
  "BASO": 1,
  "PLAQUETTES": 250000,
  "LDH": 450,
  "CPK": 90,
  "TSH": 2.5,
  "PAOI": 60,
  "OSTEO": 15,
  "CA": 8.5,
  "K": 4.2,
  "NA": 138,
  "P": 3.5
}
```

**ÉTAPE 1: Conversions**
```
GR: 4200000 ÷ 1000000 = 4.2 (> 100 → conversion)
GB: 6800 ÷ 1000 = 6.8
PLAQUETTES: 250000 ÷ 1000 = 250
CA: pas de conversion (8.5 < 5)
TSH: 2.5 (pas de correction, dans range normal)
```

**ÉTAPE 2: Calcul Index**
```
idx_genital = GR / GB = 4.2 / 6.8 = 0.618
  Status: LOW (< 0.70) → "Prédominance œstrogénique"

idx_thyroidien = LDH / CPK = 450 / 90 = 5.0
  Status: NORMAL (dans [3.5, 5.5])

idx_genito_thyroidien = NEUT / LYMPH = 65 / 28 = 2.32
  Status: NORMAL (dans [1.5, 2.5])

idx_adaptation = EOS / MONO = 2 / 4 = 0.5
  Status: NORMAL (limite haute [0.25, 0.50])

idx_mineralo = NA / K = 138 / 4.2 = 32.86
  Status: NORMAL (dans [28, 34])
```

---

## CONCLUSION

Le module BdF est **architecturally sound** mais souffre de **problèmes d'intégrité des données** :

1. ✅ **Points forts:**
   - Calcul robuste avec cache récursif
   - Conversions automatiques intelligentes
   - Détection des pathologies (hypo latente, spasmophilie)
   - Intégration IA structurée

2. ⚠️ **Points faibles:**
   - 5 index orphelins → 25% du système non fonctionnel
   - Mismatch normes IA vs système principal
   - Panels référencent index inexistants
   - Documentation incomplète des formules

3. 🎯 **Actions recommandées:**
   - Corriger les index orphelins (priorité haute)
   - Synchroniser les normes IA (priorité haute)
   - Tester scénarios critiques
   - Compléter la documentation Excel

---

*Audit généré par Claude Code - Décembre 2024*
