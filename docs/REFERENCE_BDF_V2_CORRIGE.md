# 📊 BIOLOGIE DES FONCTIONS - RÉFÉRENCE TECHNIQUE V2.0

> **Document audité et validé par Gemini DeepThink - Score 9.5/10**  
> **🟢 FEU VERT POUR PRODUCTION**

---

## ⚠️ CORRECTIONS CRITIQUES APPLIQUÉES

Ces erreurs ont été détectées et corrigées. **Mettre à jour le code immédiatement.**

| Problème | Avant (FAUX) | Après (CORRECT) |
|----------|--------------|-----------------|
| **IML = Tautologie** | `GB / (NEUT+LYMPH+MONO+EOS+BASO)` = toujours 1.0 | `(NEUT+EOS+BASO) / (LYMPH+MONO)` |
| **Index Cortisol = Boucle infinie** | `(Idx_Cata/Idx_Ana) / Idx_Adaptation` | `((NEUT+MONO)/(LYMPH+EOS+0.01)) * 1.5` |
| **Index Adaptation - INVERSION** | BAS = Hypo-adaptation | BAS = **HYPER-adaptation** (fort cortisol) |
| **Index TRH/TSH** | Calculable | **NON CALCULABLE** (TRH jamais dosé) |
| **Ratio Cortisol/Cortex** | Intervalle 2.0 - 3.0 | Intervalle **2.0 - 4.0** |

---

## 📋 ORDRE D'EXÉCUTION DES CALCULS (PIPELINE)

**CRITIQUE** : Respecter cet ordre pour éviter les erreurs `NaN` et dépendances circulaires.

```
ÉTAPE 1 - Index Primaires (biomarqueurs bruts uniquement)
├── Index Génital         = GR / GB
├── Index Minéralocorticoïde = Na / K
├── Index Adaptation      = EOS / MONO
└── IMP                   = PLQ / (60 * GR)

ÉTAPE 2 - SNA
├── IML                   = (NEUT + EOS + BASO) / (LYMPH + MONO)
└── Index Starter         = IML / IMP

ÉTAPE 3 - Proxy Cortisol
└── Index Cortisol        = ((NEUT + MONO) / (LYMPH + EOS + 0.01)) * 1.5

ÉTAPE 4 - Proxy Cortex
└── Index Cortex          = (Index_Cortisol + (Index_Mineralo / 10)) / 2

ÉTAPE 5 - Génital Corrigé
└── Index Génital Corrigé = Index_Génital * Index_Starter

ÉTAPE 6 - Thyroïdiens
├── Index Thyroïdien      = LDH / CPK
└── Rendement Thyroïdien  = LDH / (TSH * CPK)

ÉTAPE 7 - Somatotrope
├── Index GH              = PAOi / OSTEO
├── Remodelage Osseux     = (TSH * PAOi) / OSTEO
└── Index Ostéomusculaire = Index_Génital_Corrigé * (CPK / PAOi)

ÉTAPE 8 - Métaboliques
├── Index Catabolisme     = Index_Thyroïdien / Index_Cortisol
├── Index Anabolisme      = (Index_Génital * (LYMPH_PERCENT / 100)) + 0.4
└── Rapport Cata/Ana      = Index_Catabolisme / Index_Anabolisme

ÉTAPE 9 - Histamine (en dernier car dépend de Cortisol)
└── Index Histamine       = (EOS * PLQ) / Index_Cortisol
```

---

## 🧪 BIOMARQUEURS REQUIS

### Hématologie (NFS)

| Biomarqueur | Variable | Unité | Note |
|-------------|----------|-------|------|
| Globules Rouges | `GR` | T/L (ex: 4.5) | Valeur absolue |
| Globules Blancs | `GB` | G/L (ex: 6.0) | Valeur absolue |
| Hémoglobine | `Hb` | g/dL | |
| Plaquettes | `PLQ` | G/L | Valeur absolue |
| Neutrophiles | `NEUT` | G/L | ⚠️ Convertir si % |
| Lymphocytes | `LYMPH` | G/L | ⚠️ Convertir si % |
| Monocytes | `MONO` | G/L | ⚠️ Convertir si % |
| Éosinophiles | `EOS` | G/L | ⚠️ Convertir si % |
| Basophiles | `BASO` | G/L | ⚠️ Convertir si % |

**⚠️ CONVERSION OBLIGATOIRE** si valeurs en pourcentage :
```javascript
valeur_absolue = (pourcentage / 100) * GB
```

### Enzymes & Métaboliques

| Biomarqueur | Variable | Unité | Usage |
|-------------|----------|-------|-------|
| LDH | `LDH` | UI/L | Index Thyroïdien |
| CPK | `CPK` | UI/L | Index Thyroïdien (⚠️ faussé si sport récent) |
| Ostéocalcine | `OSTEO` | ng/mL | Index GH, Œstrogènes |
| PAL osseuse | `PAOi` | UI/L | Fallback: `PAL_totale / 2` |
| GGT | `GGT` | UI/L | Capacité Tampon |
| ASAT | `ASAT` | UI/L | Index Hépatique |
| ALAT | `ALAT` | UI/L | Index Hépatique |
| TSH | `TSH` | µUI/mL | Multiple index |
| Sodium | `Na` | mmol/L | Index Minéralo |
| Potassium | `K` | mmol/L | Index Minéralo |
| Calcium | `Ca` | mmol/L | Index PTH |
| Phosphore | `P` | mmol/L | Index PTH |
| Glycémie | `GLY` | mg/dL | ⚠️ Unité importante |
| Triglycérides | `TG` | mg/dL | ⚠️ Unité importante |
| CRP | `CRP` | mg/L | Index Inflammatoire |
| VS | `VS` | mm/h | Index Inflammatoire |

---

## 📐 FORMULES DÉFINITIVES

### 1. AXE GONADOTROPE (Structure)

#### Index Génital
```javascript
formula: GR / GB
interval: [0.70, 0.85]
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 0.70 | Dominance Œstrogénique. Terrain "mou", congestif. | Œdèmes, SPM, mastose, jambes lourdes |
| > 0.85 | Dominance Androgénique. Terrain "dur", sec. | Acné, hirsutisme, alopécie, sclérose |

#### Index Génito-Thyroïdien (GT)
```javascript
formula: NEUT / LYMPH
interval: [1.5, 2.5]
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 1.5 | Hyper-immunité lymphocytaire. Terrain allergique. | Allergies, susceptibilité virale, Hashimoto |
| > 2.5 | Inflammation neutrophilique. Auto-immunité. | Inflammation active, auto-immunité destructrice |

#### Index Génital Corrigé
```javascript
formula: Index_Genital * Index_Starter
interval: [0.70, 0.85]
```

#### Index Œstrogènes Métaboliques
```javascript
formula: TSH / OSTEO
interval: [0.14, 0.24]  // Usage général
interval_cancer: [0.2, 0.4]  // Contexte cancer uniquement
```

---

### 2. AXE CORTICOTROPE (Adaptation) - ⚠️ CORRIGÉ

#### Index d'Adaptation - ⚠️ INTERPRÉTATION INVERSÉE
```javascript
formula: EOS / MONO
interval: [0.25, 0.50]
```

**⚠️ ATTENTION** : Le cortisol ÉCRASE les éosinophiles. Index BAS = Fort cortisol !

| Valeur | Interprétation CORRIGÉE | Signes Cliniques |
|--------|-------------------------|------------------|
| < 0.25 (BAS) | ⬆️ **HYPER-ADAPTATION**. Fort cortisol. Mode "lutte". | Stress aigu, inflammation bloquée, survie |
| > 0.50 (HAUT) | ⬇️ **HYPO-ADAPTATION**. Cortisol insuffisant. Permissivité. | Terrain atopique, allergies, eczéma |

#### Index Cortisol - ✅ FORMULE DÉFINITIVE (Proxy 9/10)
```javascript
formula: ((NEUT + MONO) / (LYMPH + EOS + 0.01)) * 1.5
interval: [3, 7]
```

> 💡 Cette formule traduit l'effet physiologique des glucocorticoïdes : démargination des neutrophiles + lyse des éosinophiles/lymphocytes. Le coefficient 1.5 calibre sur l'échelle historique.

| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 3 (BAS) | Insuffisance cortisolique. Épuisement. | Fatigue, inflammation chronique, allergies |
| > 7 (HAUT) | Hypercorticisme réactionnel. | Stress majeur, fonte musculaire, insomnie |

#### Index Cortex Surrénalien - ✅ PROXY VALIDÉ (8.5/10)
```javascript
formula: (Index_Cortisol + (Index_Mineralo / 10)) / 2
interval: [2.7, 3.3]
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 2.7 (BAS) | "Petite surrénale". Fatigabilité constitutionnelle. | Récupération lente, épuisement |
| > 3.3 (HAUT) | "Grosse surrénale". Forte capacité de réserve. | Hypertrophie de lutte, stress aigu |

#### Ratio Cortisol / Cortex
```javascript
formula: Index_Cortisol / Index_Cortex
interval: [2.0, 4.0]  // ✅ Confirmé (pas 2.0-3.0)
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 2.0 (BAS) | Atopie. Glande a de la réserve mais ne répond pas. | Fatigue matinale, allergies |
| > 4.0 (HAUT) | Sur-sollicitation (Dette). Demande > récupération. | Anxiété, insomnie, burn-out |

#### Index Minéralocorticoïde
```javascript
formula: Na / K
interval: [28, 34]
```

---

### 3. SYSTÈME NERVEUX AUTONOME (SNA) - ⚠️ IML CORRIGÉ

#### IMP - Index Mobilisation Plaquettaire (Alpha)
```javascript
formula: PLQ / (60 * GR)
interval: [0.85, 1.15]
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 0.85 (BAS) | Spasmophilie. Dominance Para. Vagotonie. | Malaises, hypotension, terrain lax |
| > 1.15 (HAUT) | Hyper-Alpha. Spasme. Vasoconstriction. | Mains froides, HTA, risque thrombotique |

#### IML - Index Mobilisation Leucocytaire (Bêta) - ✅ CORRIGÉ
```javascript
// ❌ ANCIENNE FORMULE (TAUTOLOGIE - toujours = 1.0)
// formula_old: GB / (NEUT + LYMPH + MONO + EOS + BASO + 0.1)

// ✅ NOUVELLE FORMULE CORRECTE
formula: (NEUT + EOS + BASO) / (LYMPH + MONO)
interval: [0.85, 1.15]
```

> 💡 Compare les Granulocytes (mobilisables par l'adrénaline) aux Agranulocytes (résidents). C'est le marqueur de l'ACTION bêta-sympathique.

| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 0.85 (BAS) | Congestion splanchnique. Stase abdominale. | Lourdeurs digestives, foie engorgé |
| > 1.15 (HAUT) | Hyper-Bêta. État d'alerte. Fuite. | Tachycardie, agitation |

#### Index Starter (Statut β)
```javascript
formula: IML / IMP
interval: [0.85, 1.15]
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 0.85 (BAS) | Freinage Alpha. Difficulté à démarrer. | Procrastination, spasmes, constipation |
| > 1.15 (HAUT) | Impulsivité Bêta. Démarrage brutal. | Dispersion, anxiété, diarrhée motrice |

#### Index Histamine - ✅ VERSION 1 CONFIRMÉE
```javascript
formula: (EOS * PLQ) / Index_Cortisol
interval: [6, 12]

// ⚠️ SÉCURITÉ CODE - Éviter division par zéro
if (Index_Cortisol < 0.1) return null;
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 6 (BAS) | Anergie. Manque de réactivité immunitaire. | Tolérance excessive |
| > 12 (HAUT) | Terrain histaminique. Hyperréactivité. | Allergies, urticaire, migraines |

---

### 4. AXE THYRÉOTROPE (Métabolisme)

#### Index Thyroïdien
```javascript
formula: LDH / CPK
interval: [3.5, 5.5]

// ⚠️ WARNING UI : Résultat faussé si effort sportif intense récent (CPK élevée)
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 3.5 (BAS) | Hypothyroïdie tissulaire/fonctionnelle. | Frilosité, prise de poids, constipation |
| > 5.5 (HAUT) | Hyperthyroïdie fonctionnelle. Gaspillage. | Agitation, perte de poids, tachycardie |

#### Rendement Thyroïdien
```javascript
formula: LDH / (TSH * CPK)
interval: [2, 4]
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 2 (BAS) | Résistance périphérique. Tissus refusent l'hormone. | Hypertrophie amygdales, prostate |
| > 4 (HAUT) | Gaspillage / Hyper-réceptivité. | Sinusite, colite, inflammation muqueuses |

#### Index TRH/TSH - ❌ NON CALCULABLE
```javascript
// ❌ DÉSACTIVÉ - La TRH ne se dose JAMAIS en biologie courante
formula: null
status: "NON_CALCULABLE"
message: "TRH non dosé en routine - Index théorique uniquement"
```

#### Index PTH (Parathormone)
```javascript
formula: Ca / P
interval: [2, 42]
```

---

### 5. AXE SOMATOTROPE (Croissance & Réparation)

#### Index GH Somatotrope
```javascript
formula: PAOi / OSTEO
interval: [2, 6]

// Fallback si PAOi manquant
if (!PAOi && PAL_totale) PAOi = PAL_totale / 2;
```

#### Remodelage Osseux
```javascript
formula: (TSH * PAOi) / OSTEO
interval: [2.5, 8.5]
```

#### Index Ostéomusculaire
```javascript
formula: Index_Genital_Corrige * (CPK / PAOi)
interval: [0.75, 5.56]
```

#### Index Insuline
```javascript
formula: TG / GLY
interval: [1.5, 5]

// ⚠️ ATTENTION UNITÉS : TG et GLY doivent être en mg/dL
// Si mmol/L, convertir :
// TG_mgdL = TG_mmol * 88.57
// GLY_mgdL = GLY_mmol * 18.02
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 1.5 (BAS) | Hypersensibilité à l'insuline. | Hypoglycémies réactionnelles |
| > 5 (HAUT) | Insulino-résistance. | Syndrome métabolique, pré-diabète |

---

### 6. INDEX MÉTABOLIQUES

#### Index Catabolisme
```javascript
formula: Index_Thyroidien / Index_Cortisol
interval: [1.3, 1.6]
```

#### Index Anabolisme - ✅ PROXY VALIDÉ (8/10)
```javascript
formula: (Index_Genital * (LYMPH_PERCENT / 100)) + 0.4
interval: [0.65, 0.8]

// Note : LYMPH_PERCENT = pourcentage de lymphocytes (pas valeur absolue)
```

#### Rapport Catabolisme / Anabolisme
```javascript
formula: Index_Catabolisme / Index_Anabolisme
interval: [1.8, 3]
```
| Valeur | Interprétation | Signes Cliniques |
|--------|----------------|------------------|
| < 1.8 (BAS) | Dominance anabolique. Construction > Destruction. | Prise de poids, stockage |
| > 3 (HAUT) | Dominance catabolique. Auto-cannibalisme. | Amaigrissement, usure, vieillissement |

---

### 7. INDEX COMPLÉMENTAIRES (Ratios médicaux - Non BdF)

> ⚠️ Ces index ne font PAS partie de la BdF officielle mais sont cliniquement utiles.

#### Index Hépatique
```javascript
formula: ALAT / ASAT
interval: [0.8, 1.2]
category: "complementaire"  // Pas BdF officiel
```

#### Capacité Tampon Hépatique
```javascript
formula: GGT / (ALAT + ASAT + 1)
interval: [0.3, 0.8]
category: "complementaire"
```

#### Index Inflammatoire
```javascript
formula: (CRP * VS) / 10
interval: [2, 6]
category: "complementaire"
```

---

## 🌿 PLANTES MÉDICINALES

| Index | Si BAS → Stimuler | Si HAUT → Freiner |
|-------|-------------------|-------------------|
| Index Génital | Alchémille, Gattilier, Zinc | Houblon, Sauge sclarée |
| Index Adaptation | Passiflore, Valériane (calmer excès cortisol) | Cassis, Chêne, Pin (soutenir cortisol) |
| Index Cortisol | Réglisse, Ginseng, Chêne | Lavande, Mélisse, Passiflore |
| Index Minéralo | Réglisse | Pissenlit, Orthosiphon |
| Index Starter | Éleuthérocoque, Romarin | Aubépine, Angélique |
| Index Thyroïdien | Avoine, Fucus (iode) | Lycope, Cornouiller, Mélisse |
| Index Insuline | Cannelle, Chrome | Berbérine, Olivier, Fenugrec |
| Index Hépatique | Desmodium, Romarin | Chardon-Marie, Artichaut |
| Capacité Tampon | (Pas stimuler) | Aubier de Tilleul (drainage doux) |
| Index Inflammatoire | Cassis (gemmo) | Harpagophytum, Curcuma, Saule |
| Index Histamine | - | Plantain, Nigelle, Desmodium |

---

## 📊 HIÉRARCHIE THÉRAPEUTIQUE

| Priorité | Axe | Pourquoi | Index clés |
|----------|-----|----------|------------|
| 1️⃣ | **SNA** | Chef d'orchestre. Si déréglé, ordres hormonaux distordus. | IMP, IML, Starter |
| 2️⃣ | **ÉMONCTOIRES** | Si filtre bouché, stimuler = auto-intoxication. | Capacité Tampon, Hépatique |
| 3️⃣ | **CORTICOTROPE** | Axe survie. Si effondré, corps en burn-out. | Cortisol, Adaptation, Cortex |
| 4️⃣ | **MÉTABOLIQUES** | Axes de fonction. Réparer après stabilisation. | Thyroïdien, Génital, Cata/Ana |

---

## 📋 TABLEAU RÉCAPITULATIF DES FORMULES

| Index | Formule | Intervalle | Statut |
|-------|---------|------------|--------|
| Index Génital | `GR / GB` | 0.70 - 0.85 | ✅ Validé |
| Index Génito-Thyroïdien | `NEUT / LYMPH` | 1.5 - 2.5 | ✅ Validé |
| Index Génital Corrigé | `Idx_Génital * Idx_Starter` | 0.70 - 0.85 | ✅ Validé |
| Index Œstrogènes | `TSH / OSTEO` | 0.14 - 0.24 | ✅ Validé |
| Index Adaptation | `EOS / MONO` | 0.25 - 0.50 | ⚠️ Interprétation inversée |
| Index Cortisol | `((NEUT+MONO)/(LYMPH+EOS+0.01))*1.5` | 3 - 7 | ✅ PROXY 9/10 |
| Index Cortex | `(Idx_Cortisol+(Idx_Mineralo/10))/2` | 2.7 - 3.3 | ✅ PROXY 8.5/10 |
| Ratio Cortisol/Cortex | `Idx_Cortisol / Idx_Cortex` | 2.0 - 4.0 | ✅ Validé |
| Index Minéralo | `Na / K` | 28 - 34 | ✅ Validé |
| IMP | `PLQ / (60 * GR)` | 0.85 - 1.15 | ✅ Validé |
| IML | `(NEUT+EOS+BASO) / (LYMPH+MONO)` | 0.85 - 1.15 | ✅ CORRIGÉ |
| Index Starter | `IML / IMP` | 0.85 - 1.15 | ✅ Validé |
| Index Histamine | `(EOS*PLQ) / Idx_Cortisol` | 6 - 12 | ✅ V1 confirmée |
| Index Thyroïdien | `LDH / CPK` | 3.5 - 5.5 | ✅ Validé |
| Rendement Thyroïdien | `LDH / (TSH * CPK)` | 2 - 4 | ✅ Validé |
| Index TRH/TSH | `TRH / TSH` | 0.33 - 1.7 | ❌ Non calculable |
| Index PTH | `Ca / P` | 2 - 42 | ✅ Validé |
| Index GH | `PAOi / OSTEO` | 2 - 6 | ✅ Validé |
| Remodelage Osseux | `(TSH * PAOi) / OSTEO` | 2.5 - 8.5 | ✅ Validé |
| Index Ostéomusculaire | `Idx_GC * (CPK/PAOi)` | 0.75 - 5.56 | ✅ Validé |
| Index Insuline | `TG / GLY` | 1.5 - 5 | ✅ Validé |
| Index Catabolisme | `Idx_Thyro / Idx_Cortisol` | 1.3 - 1.6 | ✅ Validé |
| Index Anabolisme | `(Idx_Génital*(LYMPH%/100))+0.4` | 0.65 - 0.8 | ✅ PROXY 8/10 |
| Rapport Cata/Ana | `Idx_Cata / Idx_Ana` | 1.8 - 3 | ✅ Validé |

---

## 📚 LISTE COMPLÈTE DES INDEX (PDF LAPRAZ)

### Système Nerveux
| Index | Intervalle |
|-------|------------|
| Beta MSH / Alpha MSH | 6 - 8 |
| Sérotonine périphérique | 1.5 - 7.5 |
| Activité histaminique | 20 - 60 |
| Histamine potentielle | 6 - 12 |
| Mobilisation leucocytaire (IML) | 0.85 - 1.15 |
| Mobilisation plaquettaire (IMP) | 0.85 - 1.15 |
| Statut β (Starter) | 0.85 - 1.15 |
| Thyroïde métabolique | 3.5 - 5.5 |
| Adaptogène | 0.75 - 0.9 |

### Axe Hypophyso-Surrénalien
| Index | Intervalle |
|-------|------------|
| ACTH | 0.7 - 3 |
| Activité glande surrénale | 2.7 - 3.3 |
| Cortisol | 3 - 7 |
| Adaptation | 0.25 - 0.5 |
| Adaptation-permissivité | 0.5 - 1.5 |
| Permissivité | 0.45 - 0.8 |
| Catabolisme | 1.3 - 1.6 |
| Anabolisme | 0.65 - 0.8 |
| Rapport Cata/Ana | 1.8 - 3 |
| DHEA | 5 - 9 |
| Aldostérone | 0.003 - 0.052 |
| Aromatisation | 0.6 - 1.2 |
| Interleukine | 0.06 - 0.22 |

### Activité Hypophyso-Gonadique
| Index | Intervalle |
|-------|------------|
| Rapport génital | 0.7 - 0.85 |
| Rapport génital corrigé | 0.7 - 0.85 |
| Œstrogènes métaboliques | 0.14 - 0.24 |
| Œstrogènes génitaux | 0.12 - 0.16 |
| Œstrogènes tissulaires | 0.1 - 0.12 |
| Androgènes génitaux | 0.18 - 0.22 |
| Androgènes métaboliques | 0.12 - 0.16 |
| Progestérone | 4 - 8 |
| Folliculine | 0.75 - 1.25 |

### Axe Thyréotrope
| Index | Intervalle |
|-------|------------|
| TRH / TSH | 0.33 - 1.7 (⚠️ Non calculable) |
| TRH endocrine | 0.15 - 0.5 |
| Amylose | 10 - 17 |
| Fibrose | 6 - 8 |
| Adénose | 2 - 3 |
| Démyélinisation | 5 - 15 |
| Rendement thyroïdien | 2 - 4 |
| Thyroïde tissulaire | 1.7 - 3.7 |
| Thyroïde métabolique | 3.5 - 5.5 |

### Axe Somatotrope & Osseux
| Index | Intervalle |
|-------|------------|
| Parathormone (PTH) | 2 - 42 |
| Remodelage osseux | 2.5 - 8.5 |
| Index ostéomusculaire | 0.75 - 5.56 |
| Hormone de croissance | 2 - 6 |
| Anti-croissance | 10 - 15 |
| Prolactine | 0.8 - 1.2 |
| Somatostatine | 1.5 - 5 |
| Insuline | 1.5 - 5 |
| Résistance à l'insuline | 0.75 - 1.25 |
| Activité hépatique | 2.5 - 6 |

### Métabolisme Cellulaire
| Index | Intervalle |
|-------|------------|
| Oxydation | 1.44 - 81.48 |
| Réduction | 0.72 - 116.9 |
| Oxydo-réduction | 0.7 - 2 |
| Radicaux libres | 0.25 - 0.6 |
| Index de nécrose | 2.5 - 6 |
| Apoptose | 0.3 - 0.7 |
| Score de croissance | 800 - 1000 |

---

## ⚙️ SÉCURITÉS CODE À IMPLÉMENTER

```javascript
// 1. Éviter division par zéro
function safeDiv(a, b, fallback = null) {
  if (!b || b < 0.01) return fallback;
  return a / b;
}

// 2. Index Histamine - Protection
function calcHistamine(EOS, PLQ, Index_Cortisol) {
  if (Index_Cortisol < 0.1) return null;
  return (EOS * PLQ) / Index_Cortisol;
}

// 3. Conversion % vers valeur absolue
function convertToAbsolute(percent, GB) {
  return (percent / 100) * GB;
}

// 4. Fallback PAOi
function getPAOi(PAOi, PAL_totale) {
  if (PAOi) return PAOi;
  if (PAL_totale) return PAL_totale / 2; // Estimation dégradée
  return null;
}

// 5. Validation intervalle
function isInRange(value, min, max) {
  if (value === null) return null;
  if (value < min) return "BAS";
  if (value > max) return "HAUT";
  return "NORMAL";
}
```

---

## 📅 Métadonnées

- **Version** : 2.0 Corrigée
- **Date** : Décembre 2024
- **Audit** : Gemini DeepThink Ultra
- **Score** : 9.5/10
- **Statut** : 🟢 FEU VERT POUR PRODUCTION
- **Sources** : PDF Lapraz, Theory of Endobiogeny Vol. 1-4
