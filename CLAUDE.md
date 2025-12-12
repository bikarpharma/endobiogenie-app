# IntegrIA - SaaS Endobiogénique

## Vue d'ensemble

IntegrIA est une plateforme SaaS de médecine intégrative basée sur la **Théorie de l'Endobiogénie** (Lapraz & Hedayat). Elle permet aux praticiens d'analyser le terrain de leurs patients via la Biologie des Fonctions (BdF), de conduire un interrogatoire clinique structuré, et de générer des ordonnances personnalisées en phytothérapie, gemmothérapie et aromathérapie.

**Stack technique** : Next.js 15 (App Router), TypeScript, Prisma/PostgreSQL, OpenAI Assistants API v2, TailwindCSS

---

## Concepts fondamentaux de l'Endobiogénie

### Philosophie
L'endobiogénie est une approche médicale qui considère l'organisme comme un **système global** régulé par le système neuro-endocrinien. Contrairement au réductionnisme médical, elle analyse le **terrain** du patient (prédispositions, équilibres hormonaux) pour comprendre l'origine des maladies, pas seulement leurs symptômes.

### Les 4 axes endocriniens majeurs
1. **Axe Corticotrope** : Chef d'orchestre de l'adaptation (CRH → ACTH → Cortisol/DHEA/Aldostérone)
2. **Axe Thyréotrope** : Métabolisme énergétique (TRH → TSH → T4/T3)
3. **Axe Gonadotrope** : Équilibre androgènes/œstrogènes (GnRH → FSH/LH → hormones sexuelles)
4. **Axe Somatotrope** : Croissance et réparation (GHRH → GH → IGF-1)

### Le Système Nerveux Autonome (SNA)
- **Parasympathique** : Récupération, digestion (sérotonine périphérique)
- **Alpha-sympathique** : Vasoconstriction, congestion splanchnique (histamine)
- **Bêta-sympathique** : Énergie, mobilisation (catécholamines)

### Concept de Terrain
Le terrain est la prédisposition individuelle à développer certaines pathologies. Il est évalué par :
- L'interrogatoire clinique (symptômes, antécédents, phases de vie)
- La Biologie des Fonctions (index calculés depuis biomarqueurs standards)

### Terrains pathologiques principaux
- **Spasmophile** : Dysfonction du SNA (10 types selon Hedayat)
- **Atopique** : Terrain allergique (histamine, cortisol insuffisant)
- **Auto-immun** : Th1 dominant, inflammation chronique
- **Congestif** : Stase veino-lymphatique
- **Métabolique** : Syndrome métabolique, insulino-résistance
- **Dégénératif** : Vieillissement accéléré, stress oxydatif

---

## Architecture du projet

```
endobiogenie-simple/
├── app/                      # Next.js App Router
│   ├── api/                  # 31 routes API
│   │   ├── bdf/              # Biologie des Fonctions
│   │   │   ├── analyse/      # Calcul des index BdF
│   │   │   ├── import-lab/   # Import résultats labo
│   │   │   ├── save/         # Sauvegarde analyse
│   │   │   └── synthesis/    # Synthèse IA diagnostic
│   │   ├── chat/             # Chat EndoBot (RAG multi-vectorstores)
│   │   ├── interrogatoire/   # Interprétation axes cliniques
│   │   ├── ordonnances/      # Génération ordonnances IA
│   │   ├── patients/         # CRUD patients
│   │   └── unified-synthesis/ # Synthèse transversale
│   ├── bdf/                  # Module BdF (formulaire standalone)
│   ├── patients/             # Dossiers patients
│   │   └── [id]/             # Détail patient avec onglets
│   └── phytodex/             # Bibliothèque plantes Tunisie
├── components/               # ~70 composants React
│   ├── bdf/                  # Composants BdF
│   ├── interrogatoire/       # Composants interrogatoire
│   ├── ordonnance/           # Composants ordonnance
│   └── patient/              # Composants patient
├── lib/                      # Logique métier
│   ├── ai/                   # OpenAI Assistants
│   ├── bdf/                  # Calcul des index
│   ├── interrogatoire/       # Configuration 14 axes
│   ├── ordonnance/           # Génération ordonnances
│   └── clinical/             # Types et mappings cliniques
├── prisma/                   # Schéma base de données
└── docs/                     # Documentation et knowledge base
```

---

## Module 1 : Biologie des Fonctions (BdF)

### Fichiers clés
- `lib/bdf/calculateIndexes.ts` : Moteur de calcul des 50+ index
- `lib/bdf/indexes/indexes.config.ts` : Définitions et normes des index
- `lib/bdf/panels/panels.config.ts` : Panels de biomarqueurs (Mini, Standard, Complet)
- `lib/bdf/biomarkers/biomarkers.config.ts` : 40+ biomarqueurs configurés

### Index principaux
| Index | Formule | Signification | Normes |
|-------|---------|---------------|--------|
| Index Génital | GR/GB | Équilibre androgènes/œstrogènes | 0.70-0.85 |
| Index Génito-Thyroïdien | NEUT/LYMPH | Couplage gonado-thyroïde | 1.5-2.5 |
| Index d'Adaptation | EOS/MONO | Capacité adaptation corticotrope | 0.25-0.50 |
| Index Thyroïdien | LDH/CPK | Métabolisme thyroïdien périphérique | 3.5-5.5 |
| IMP (Mobilisation Plaquettes) | PLAQ/(60×GR) | Activité β-sympathique | 0.85-1.15 |
| Index Starter | IML/IMP | Équilibre α/β sympathique | 0.85-1.15 |

### Flux de données
1. Saisie manuelle ou import labo (`lib/bdf/labImport/`)
2. Calcul des index (`calculateAllIndexes()`)
3. Interprétation IA via Assistant Diagnostic
4. Sauvegarde en `BdfAnalysis` (Prisma)

---

## Module 2 : Interrogatoire Endobiogénique

### Fichiers clés
- `lib/interrogatoire/config/index.ts` : 14 axes, 3 blocs, 566+ questions
- `lib/interrogatoire/clinicalScoringV3.ts` : Système de scoring 2D (2276 lignes)
- `lib/interrogatoire/prompts.ts` : Prompts d'interprétation IA

### Structure des 3 blocs

**Bloc 1 - Terrain & Histoire** (🟦)
- `historique` : Antécédents, ligne de vie, chocs
- `modeVie` : Alimentation, sommeil, toxiques
- `terrains` : Terrains pathologiques (spasmophile, atopique...)

**Bloc 2 - Les Gestionnaires** (🟪) - Système neuro-endocrinien
- `neuro` : SNA (parasympathique, α-sympathique, β-sympathique)
- `adaptatif` : Axe corticotrope (cortisol, DHEA, stress)
- `thyro` : Axe thyréotrope (énergie, métabolisme)
- `gonado` : Axe gonadotrope (cycles, hormones sexuelles)
- `somato` : Axe somatotrope (croissance, récupération)

**Bloc 3 - Émonctoires & Organes** (🟩)
- `digestif`, `immuno`, `orlRespiratoire`, `cardioMetabo`, `urorenal`, `dermato`

### Scoring clinique V3
Chaque question génère des scores sur 2 dimensions :
1. **Intensité** : Force du déséquilibre
2. **Fréquence** : Chronicité du symptôme

Scores agrégés par axe puis par terrain pathologique.

---

## Module 3 : Ordonnances Intelligentes

### Fichiers clés
- `lib/ai/assistantOrdonnanceV5.ts` : Génération via OpenAI Assistants
- `lib/ordonnance/constants.ts` : Plantes par axe, seuils BdF, validations
- `lib/ordonnance/types.ts` : Types complets (406 lignes)
- `lib/ordonnance/tunisianProtocols.ts` : Adaptation contexte tunisien

### Structure de l'ordonnance (4 volets)
1. **Volet Endobiogénique** : Traitement de fond selon terrain
2. **Volet Phyto Élargi** : Phytothérapie symptomatique
3. **Volet Aromathérapie** : Huiles essentielles
4. **Volet Compléments** : Oligoéléments, micronutrition

### Principes de prescription
1. **Drainage d'abord** : Foie → Reins → Lymphe (si capacité tampon saturée)
2. **Traiter le terrain** : Pas seulement les symptômes
3. **Hiérarchie thérapeutique** : Causes avant conséquences
4. **Double justification** : Endobiogénique + conventionnelle

### Sécurité médicale
- Filtrage par sexe (`PLANTES_FEMMES_ONLY`, `PLANTES_HOMMES_ONLY`)
- Validation bourgeons (`isValidBourgeon()`)
- Vérification contre-indications

---

## Intégration OpenAI

### Architecture VectorStores

**Chat EndoBot** (`app/api/chat/route.ts`)
Recherche parallèle dans 4 VectorStores via REST API :
```typescript
const VECTORSTORES = {
  endobiogenie: "vs_68e87a07ae6c81918d805c8251526bda",
  phyto: "vs_68feb856fedc81919ef239741143871e",
  gemmo: "vs_68fe63bee4bc8191b2ab5e6813d5bed2",
  aroma: "vs_68feabf4185c8191afbadcc2cfe972a7"
};
```

**Assistant Diagnostic** (`lib/ai/assistantDiagnostic.ts`)
- ID : `asst_546z3z48kGvh3gLhqNqugRwD`
- VectorStore : `vs_69307fd012b081918f4cf709685f924c` (4 volumes endobiogénie)
- Rôle : Analyse BdF, synthèse diagnostique, concordance bio/clinique

**Assistant Ordonnance** (`lib/ai/assistantOrdonnanceV5.ts`)
- ID : `asst_ftAPObIleEWpkQwOCSN72ERt`
- VectorStore : `vs_6931d41aebd08191b8d2365999a767ba`
- Rôle : Génération ordonnances 4 volets, raisonnement thérapeutique

### Modèles utilisés
- Chat et synthèses : `gpt-4.1` (via env `OPENAI_MODEL`)
- Assistants : OpenAI Assistants API v2 avec `file_search`

---

## Base de données (Prisma)

### Modèles principaux
```prisma
Patient {
  // Identité
  numeroPatient, nom, prenom, dateNaissance, sexe

  // Clinique
  allergiesStructured  // JSON - PatientAllergyEntry[]
  chronicProfile       // JSON - APCI + maladies chroniques
  interrogatoire       // JSON - 14 axes complets

  // Relations
  bdfAnalyses[], ordonnances[], axeInterpretations[]
}

BdfAnalysis {
  inputs   // JSON - valeurs biomarqueurs
  indexes  // JSON - index calculés
  summary  // Résumé fonctionnel
  axes     // Axes sollicités
}

Ordonnance {
  voletEndobiogenique  // JSON - RecommandationTherapeutique[]
  voletPhytoElargi
  voletAromatherapie
  voletComplements
  syntheseClinique     // Raisonnement détaillé
}
```

---

## Parcours patient type

```
1. CRÉATION PATIENT
   └─> NewPatientForm.tsx → POST /api/patients

2. INTERROGATOIRE (14 axes)
   └─> AxisForm.tsx → POST /api/interrogatoire/update
   └─> Interprétation IA → POST /api/interrogatoire/interpret

3. BIOLOGIE DES FONCTIONS
   └─> BdfInputForm.tsx → POST /api/bdf/analyse
   └─> Import labo optionnel → POST /api/bdf/import-lab
   └─> Synthèse IA → POST /api/bdf/synthesis

4. SYNTHÈSE UNIFIÉE
   └─> UnifiedSynthesisPanel.tsx → POST /api/unified-synthesis
   └─> Concordance bio/clinique

5. GÉNÉRATION ORDONNANCE
   └─> GenerateOrdonnanceButton.tsx → POST /api/ordonnances/generate
   └─> Chat ajustement → POST /api/ordonnances/[id]/chat
```

---

## Documentation de référence

### Dans `/docs/`
- `Endobiogenie_Volume1_OPTIMISE.md` : Fondamentaux, physiologie, BdF (1.3 MB)
- `Endobiogenie_Volume2_OPTIMISE.md` : Matière médicale, axes, SNA
- `Endobiogenie_Volume3_PROPRE.md` : Pathologies et cas cliniques
- `Endobiogenie_Volume4_PROPRE.md` : Approches spécifiques
- `GrandManuel_Phytotherapie_OPTIMISE.md` : 100 plantes détaillées
- `GrandLivre_Gemmotherapie_OPTIMISE.md` : 46 bourgeons
- `Aromatherapie_PROPRE.md` : Huiles essentielles

### Tables structurantes
- `docs/IntegrIA_BdF_Tableaux_Structurants.xlsx` : Normes index BdF
- `docs/biomarqueurs_tables.pdf` : Référence biomarqueurs

---

## Conventions de code

### Nommage
- Fichiers : `kebab-case.ts` pour lib, `PascalCase.tsx` pour composants
- Fonctions : `camelCase` (ex: `calculateAllIndexes`)
- Types : `PascalCase` (ex: `BdfIndex`, `PatientData`)
- Constantes : `SCREAMING_SNAKE_CASE` (ex: `VECTORSTORES`)

### API Routes
- `GET` : Lecture seule, pas d'effet de bord
- `POST` : Création ou action complexe
- `PUT/PATCH` : Mise à jour
- Toujours authentifier via `auth()` de NextAuth

### Gestion d'erreurs
```typescript
try {
  // Logique métier
} catch (e: any) {
  console.error("❌ Context:", e);
  return NextResponse.json({ error: e?.message ?? "Erreur serveur" }, { status: 500 });
}
```

---

## Variables d'environnement requises

```env
# Base de données
DATABASE_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

---

## Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Prisma
npx prisma generate    # Générer le client
npx prisma migrate dev # Appliquer migrations
npx prisma studio      # Interface admin DB

# Scripts utiles
npx tsx scripts/list-vectorstore-files.ts  # Lister fichiers VectorStores
```

---

## Points d'attention

### Performance
- Les calculs BdF sont synchrones - OK pour ~50 index
- Les appels OpenAI sont longs (~5-15s) - afficher loading states
- VectorStore search en parallèle pour le chat

### Sécurité médicale
- Toujours valider le sexe avant recommandations hormonales
- Vérifier contre-indications avant génération ordonnance
- Les ordonnances sont des suggestions, validation praticien requise

### Maintenance
- Fichiers morts à supprimer : `therapeuticReasoning.BACKUP.ts`, `therapeuticReasoning.OLD.ts`
- VectorStore aroma potentiellement sous-dimensionné (0.14 MB)

---

## Glossaire endobiogénique

| Terme | Définition |
|-------|------------|
| **BdF** | Biologie des Fonctions - système d'index calculés |
| **Terrain** | Prédisposition individuelle à développer certaines pathologies |
| **Émonctoire** | Organe d'élimination (foie, reins, peau, poumons, intestins) |
| **Drainage** | Stimulation des émonctoires pour éliminer les toxines |
| **Capacité tampon** | Capacité du foie à neutraliser les déchets métaboliques |
| **Spasmophilie** | Syndrome de dysfonction du SNA (10 types) |
| **Index Génital** | GR/GB - équilibre androgènes/œstrogènes tissulaire |
| **IMP** | Index Mobilisation Plaquettes - marqueur β-sympathique |
| **MG** | Macérat Glycériné - forme galénique en gemmothérapie |
| **TM** | Teinture Mère - extrait hydro-alcoolique de plante |
| **EPS** | Extrait de Plante Standardisé |
