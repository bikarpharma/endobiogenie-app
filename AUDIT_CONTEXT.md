# IntegrIA - Contexte d'Audit SaaS

## Instructions pour l'IA Auditrice

Ce document fournit le contexte nécessaire pour auditer IntegrIA, un SaaS médical de médecine intégrative basé sur l'Endobiogénie.

---

## 1. Vue d'Ensemble du Projet

### Mission
Plateforme SaaS permettant aux praticiens de médecine intégrative de :
1. Analyser le **terrain** de leurs patients via la Biologie des Fonctions (BdF)
2. Conduire un **interrogatoire clinique** structuré (14 axes, 566+ questions)
3. Générer des **ordonnances personnalisées** en phytothérapie, gemmothérapie, aromathérapie

### Stack Technique
- **Frontend** : Next.js 15 (App Router), React 18, TailwindCSS
- **Backend** : Next.js API Routes, TypeScript strict
- **Base de données** : PostgreSQL via Prisma ORM
- **IA** : OpenAI Assistants API v2 avec VectorStores (RAG)
- **Auth** : NextAuth.js

### Métriques Clés
- ~31 routes API
- ~70 composants React
- 14 axes d'interrogatoire clinique
- 50+ index biologiques calculés
- 4 VectorStores (endobiogénie, phyto, gemmo, aroma)

---

## 2. Architecture à Auditer

### Structure des Dossiers

```
app/
├── api/                    # Routes API (audit sécurité, performance)
│   ├── bdf/                # Biologie des Fonctions
│   ├── chat/               # Chat RAG multi-vectorstores
│   ├── interrogatoire/     # Interprétation axes cliniques
│   ├── ordonnances/        # Génération ordonnances IA
│   └── patients/           # CRUD patients
├── patients/[id]/          # Pages dynamiques patients
└── phytodex/               # Bibliothèque plantes

components/
├── bdf/                    # Formulaires et résultats BdF
├── interrogatoire/         # 14 formulaires d'axes
├── ordonnance/             # Interface ordonnances
└── patient/                # Dashboard et détails patient

lib/
├── ai/                     # Intégration OpenAI Assistants
├── bdf/                    # Calcul des index biologiques
│   ├── indexes/            # Définitions des 50+ index
│   ├── panels/             # Panels biomarqueurs
│   └── labImport/          # Import résultats labo
├── interrogatoire/         # Configuration 14 axes
│   └── config/             # Questions par axe
└── ordonnance/             # Génération ordonnances
```

### Fichiers Critiques à Auditer en Priorité

| Fichier | Criticité | Raison |
|---------|-----------|--------|
| `lib/bdf/calculateIndexes.ts` | HAUTE | Calculs médicaux - précision critique |
| `lib/bdf/indexes/indexes.config.ts` | HAUTE | Formules et normes des 50+ index |
| `lib/interrogatoire/clinicalScoringV3.ts` | HAUTE | Scoring clinique (2276 lignes) |
| `lib/ai/assistantOrdonnanceV5.ts` | HAUTE | Génération ordonnances IA |
| `app/api/ordonnances/generate/route.ts` | HAUTE | Route critique ordonnances |
| `prisma/schema.prisma` | MOYENNE | Modèle de données |
| `lib/ordonnance/constants.ts` | MOYENNE | Règles métier ordonnances |

---

## 3. Points d'Audit Recommandés

### 3.1 Sécurité
- [ ] Validation des entrées dans les routes API
- [ ] Protection contre les injections (SQL, XSS)
- [ ] Authentification/Autorisation sur toutes les routes
- [ ] Gestion des secrets (clés API OpenAI)
- [ ] Validation des données patient (RGPD médical)

### 3.2 Qualité du Code
- [ ] Typage TypeScript (any à éliminer)
- [ ] Gestion des erreurs cohérente
- [ ] Séparation des responsabilités (lib/ vs api/)
- [ ] Duplication de code
- [ ] Complexité cyclomatique

### 3.3 Performance
- [ ] Optimisation des appels OpenAI (coûteux)
- [ ] Mise en cache des calculs BdF
- [ ] Requêtes Prisma N+1
- [ ] Taille des bundles client

### 3.4 Fiabilité Médicale
- [ ] Précision des formules d'index (lib/bdf/indexes/)
- [ ] Validation des normes biologiques
- [ ] Cohérence du scoring clinique
- [ ] Sécurité des recommandations thérapeutiques

### 3.5 Architecture
- [ ] Cohérence App Router Next.js 15
- [ ] Gestion d'état (server vs client components)
- [ ] Flux de données patient
- [ ] Scalabilité de l'architecture

---

## 4. Domaine Métier : L'Endobiogénie

### Concepts Clés
- **Terrain** : Prédisposition individuelle aux pathologies
- **BdF** : Biologie des Fonctions - 50+ index calculés depuis biomarqueurs standards
- **4 Axes Endocriniens** : Corticotrope, Thyréotrope, Gonadotrope, Somatotrope
- **SNA** : Système Nerveux Autonome (para, α-sympathique, β-sympathique)

### Flux Patient Type
```
Création Patient → Interrogatoire (14 axes) → BdF (biomarqueurs)
                                           ↓
                         Synthèse Unifiée → Génération Ordonnance
```

### Index Biologiques Principaux
| Index | Formule | Signification |
|-------|---------|---------------|
| Index Génital | GR/GB | Équilibre androgènes/œstrogènes |
| Index Génito-Thyroïdien | NEUT/LYMPH | Couplage gonado-thyroïde |
| Index d'Adaptation | EOS/MONO | Capacité adaptation corticotrope |
| IMP | PLAQ/(60×GR) | Activité β-sympathique |

---

## 5. Intégration OpenAI

### Architecture RAG
```
Chat EndoBot
    ├── VectorStore Endobiogénie (vs_68e87...)
    ├── VectorStore Phyto (vs_68feb...)
    ├── VectorStore Gemmo (vs_68fe6...)
    └── VectorStore Aroma (vs_68fea...)

Assistant Diagnostic (asst_546z3...)
    └── VectorStore 4 volumes (vs_69307...)

Assistant Ordonnance (asst_ftAPO...)
    └── VectorStore thérapeutique (vs_6931d...)
```

### Modèles
- Chat/Synthèses : `gpt-4.1` (via env OPENAI_MODEL)
- Assistants : OpenAI Assistants API v2 avec `file_search`

---

## 6. Base de Données (Prisma)

### Modèles Principaux
```
Patient
├── Identité (nom, prénom, dateNaissance, sexe)
├── allergiesStructured (JSON)
├── chronicProfile (JSON)
├── interrogatoire (JSON - 14 axes)
├── bdfAnalyses[] (1:N)
├── ordonnances[] (1:N)
└── axeInterpretations[] (1:N)

BdfAnalysis
├── inputs (JSON - biomarqueurs)
├── indexes (JSON - index calculés)
├── summary (résumé fonctionnel)
└── axes (axes sollicités)

Ordonnance
├── voletEndobiogenique (JSON)
├── voletPhytoElargi (JSON)
├── voletAromatherapie (JSON)
├── voletComplements (JSON)
└── syntheseClinique
```

---

## 7. Questions pour l'Audit

1. **Sécurité** : Les routes API sont-elles correctement protégées ?
2. **Typage** : Y a-t-il des `any` dangereux dans le code critique ?
3. **Calculs** : Les formules d'index biologiques sont-elles correctement implémentées ?
4. **Performance** : Les appels OpenAI sont-ils optimisés ?
5. **Architecture** : La séparation client/server est-elle correcte ?
6. **Erreurs** : La gestion d'erreurs est-elle robuste ?
7. **Tests** : Y a-t-il des tests unitaires sur les calculs critiques ?
8. **Duplication** : Y a-t-il du code dupliqué à factoriser ?

---

## 8. Fichiers de Référence

- `CLAUDE.md` : Documentation technique complète
- `docs/AUDIT_BDF.md` : Audit existant du module BdF
- `docs/AUDIT_MODULE_ORDONNANCE_V3.md` : Audit module ordonnances
- `docs/REFERENCE_BDF_V2_CORRIGE.md` : Référence formules BdF

---

## 9. Commandes Utiles

```bash
# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Build production
npm run build

# Générer client Prisma
npx prisma generate

# Voir le schéma DB
npx prisma studio
```

---

*Document généré pour l'audit IntegrIA - $(date)*
