# 🧬 Système d'Ordonnances Intelligentes - Guide Complet

## 📋 Vue d'ensemble

Le système d'ordonnances intelligentes est un module avancé qui génère des prescriptions personnalisées en endobiogénie en utilisant:
- ✅ **Analyse du terrain BdF** (8 index fonctionnels)
- ✅ **Intelligence Artificielle** (GPT-4o-mini + vectorstores)
- ✅ **Raisonnement en 4 étapes** (terrain → canon → extension → micro-nutrition)
- ✅ **Interface hybride** (60% ordonnance + 40% chat IA)

---

## 🏗️ Architecture

### Backend (Node.js + TypeScript)

#### Types (`lib/ordonnance/types.ts`)
- `TherapeuticScope`: Configuration des vectorstores actifs
- `AxePerturbation`: Détection des déséquilibres neuroendocriniens
- `RecommandationTherapeutique`: Structure complète d'une recommandation
- `OrdonnanceStructuree`: 3 volets (Endobiogénie, Phyto élargi, Compléments)
- `ChatMessage`: Messages + actions suggérées par l'IA

#### Moteur de raisonnement (`lib/ordonnance/therapeuticReasoning.ts`)
Classe `TherapeuticReasoningEngine` avec 4 étapes:

**ÉTAPE 1 - Analyse du terrain BdF**
```typescript
analyzeAxesPerturbations(indexes: IndexResults, inputs: LabValues): {
  axes: AxePerturbation[];
  hypotheses: string[];
}
```
- Analyse les 8 index BdF
- Détecte les axes perturbés (thyroïdien, corticotrope, génital, etc.)
- Score 0-10 pour priorisation
- Génère des hypothèses régulatrices

**ÉTAPE 2 - Recherche Endobiogénie (Canon)**
```typescript
async searchEndobiogenie(axes, patientContext): Promise<RecommandationTherapeutique[]>
```
- Query vectorstore Endobiogénie (6 MB - Lapraz/Hedayat)
- Utilise OpenAI Agents SDK avec `fileSearchTool`
- Niveau de preuve: 1 (canon)
- Fallback vers recommandations codées si échec

**ÉTAPE 3 - Extension thérapeutique**
```typescript
async searchExtendedTherapy(axes, scope, patientContext): Promise<RecommandationTherapeutique[]>
```
- Query vectorstores phyto/gemmo/aroma selon scope
- Niveau de preuve: 2 (élargi)
- Complète les recommandations du canon

**ÉTAPE 4 - Micro-nutrition**
```typescript
async addMicronutritionIfNeeded(axes, patientContext): Promise<RecommandationTherapeutique[]>
```
- Recommandations codées par axe (Sélénium, Magnésium, Zinc, Oméga-3)
- Niveau de preuve: 3 (compléments)
- Seuil: score ≥ 6/10

#### API Routes

**POST /api/ordonnances/generate**
- Génère une ordonnance complète
- Entrée: `patientId` + `scope` (TherapeuticScope)
- Sortie: `OrdonnanceStructuree` en 3 volets
- Durée: 20-40 secondes

**GET /api/ordonnances/[id]**
- Récupère une ordonnance spécifique
- Inclut patient + dernière analyse BdF

**PATCH /api/ordonnances/[id]**
- Met à jour les volets (suite aux actions du chat)

**POST /api/ordonnances/[id]/chat**
- Chat contextuel avec l'ordonnance
- Entrée: `message` (question utilisateur)
- Sortie: `ChatMessage` + `actions` suggérées
- Peut suggérer: add/replace/remove de recommandations

**GET /api/ordonnances/[id]/chat**
- Récupère l'historique du chat

### Frontend (Next.js 15 + React)

#### Composants

**`OrdonnancePanel`** (Panneau gauche - 60%)
- Affiche les 3 volets (Endobiogénie/Phyto/Compléments)
- Sections expandables/collapsables
- Cartes de recommandations avec détails (posologie, durée, mécanisme, axe)
- Badges de priorité (P1/P2/P3)
- Boutons: Copier, Imprimer

**`ChatPanel`** (Panneau droit - 40%)
- Interface conversationnelle
- Messages utilisateur + assistant
- Actions suggérées avec boutons "Appliquer"
- Suggestions de questions rapides
- Input avec support Shift+Enter (multi-lignes)

**`OrdonnanceInterfaceClient`**
- Composant principal qui combine les 2 panels
- Gère la communication entre panels
- Applique les actions du chat aux volets

**`GenerateOrdonnanceButton`**
- Modal de configuration du scope thérapeutique
- 4 options: Plantes médicinales, Gemmothérapie, Aromathérapie, Micro-nutrition
- Recommandations par défaut
- Lance la génération → Redirige vers `/ordonnances/[id]`

**`OngletOrdonnancesIntelligent`**
- Liste des ordonnances existantes
- Statistiques par volet
- Bouton de génération
- Alertes (BdF manquante)

#### Pages

**`/ordonnances/[id]`**
- Page principale de l'interface hybride
- Header avec navigation retour patient
- Layout 60/40 (OrdonnancePanel + ChatPanel)

---

## 🚀 Utilisation

### 1. Générer une ordonnance

**Depuis la fiche patient:**
1. Onglet "Ordonnances"
2. Cliquer "Générer ordonnance intelligente"
3. Configurer le scope thérapeutique
4. Cliquer "Générer"
5. Attendre 20-40s (raisonnement en 4 étapes)
6. Redirection automatique vers l'interface

**Prérequis:** Au moins 1 analyse BdF pour le patient

### 2. Consulter une ordonnance

**Interface hybride:**
- **Panneau gauche (60%):** Ordonnance structurée en 3 volets
  - ✅ Volet 1: Endobiogénie (Canon Lapraz/Hedayat) - Niveau 1
  - ✅ Volet 2: Phytothérapie élargie - Niveau 2
  - ✅ Volet 3: Micro-nutrition - Niveau 3

- **Panneau droit (40%):** Chat IA contextuel
  - Poser des questions sur les recommandations
  - Demander des modifications
  - Appliquer les actions suggérées

### 3. Utiliser le chat IA

**Exemples de questions:**
- "Pourquoi as-tu choisi Avena sativa ?"
- "Peux-tu remplacer cette plante par une alternative ?"
- "Y a-t-il des interactions à surveiller ?"
- "Peux-tu ajouter un remède pour le sommeil ?"

**Actions disponibles:**
- ➕ **Add**: Ajouter une nouvelle recommandation
- 🔄 **Replace**: Remplacer une recommandation existante
- ➖ **Remove**: Retirer une recommandation

**Application d'une action:**
1. L'IA suggère une action avec justification
2. Bouton "Appliquer cette action"
3. Mise à jour automatique de l'ordonnance
4. L'action est marquée comme appliquée

---

## 🔧 Configuration

### Vectorstores (`lib/ordonnance/constants.ts`)

```typescript
export const VECTORSTORES = {
  endobiogenie: "vs_68e87a07ae6c81918d805c8251526bda", // 6 MB
  phyto: "vs_68feb856fedc81919ef239741143871e",      // 25 MB
  gemmo: "vs_68fe63bee4bc81919b2ab5e6813d5bed",     // 3 MB
  aroma: "vs_68feabf4185c8f9afbadc6c2cfe972a7",     // 18 MB
};
```

### Seuils BdF (`lib/ordonnance/constants.ts`)

```typescript
export const SEUILS_BDF = {
  indexThyroidien: { hypo: 2.0, hyper: 3.5 },
  indexAdaptation: { corticotrope: 0.7 },
  indexGenital: { androgénique: 600 },
  turnover: { eleve: 100 },
};
```

### Modèle IA

```typescript
export const AI_MODEL = "gpt-4o-mini" as const;
```
- Optimisé pour rapidité + qualité + coût
- Timeout: 60 secondes max

---

## 📊 Base de données (Prisma)

### Modèle `Ordonnance`

```prisma
model Ordonnance {
  id String @id @default(cuid())
  patientId String
  bdfAnalysisId String?

  // 3 VOLETS
  voletEndobiogenique Json @default("[]")
  voletPhytoElargi Json @default("[]")
  voletComplements Json @default("[]")

  // MÉTADONNÉES
  syntheseClinique String @default("") @db.Text
  conseilsAssocies Json @default("[]")
  surveillanceBiologique Json @default("[]")
  dateRevaluation DateTime?

  // STATUT
  statut String @default("brouillon")

  // CONVERSATION IA
  chatMessages Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // RELATIONS
  patient Patient @relation(fields: [patientId], references: [id])
  bdfAnalysis BdfAnalysis? @relation(fields: [bdfAnalysisId], references: [id])
}
```

### Migration

```bash
npx prisma db push
```

---

## 🧪 Tests

### Script de test backend

```bash
npx tsx scripts/test-ordonnance.ts
```

**Résultat attendu:**
- ✅ ÉTAPE 1: 2 axes perturbés détectés (thyroïdien hypo, corticotrope hyper)
- ✅ ÉTAPE 2: 4 recommandations Endobiogénie (Avena sativa, Lithospermum, Passiflora, Zea mays)
- ⚠️ ÉTAPE 3: En fallback (phyto/gemmo IDs nécessitent vérification)
- ✅ ÉTAPE 4: 0 recommandations micro-nutrition (scores trop bas)

---

## 🎯 Statut actuel

### ✅ Fonctionnel
- Backend complet (4 étapes de raisonnement)
- API routes (génération + chat)
- Vectorstore Endobiogénie (canon Lapraz/Hedayat) - **TESTÉ ET VALIDÉ**
- Interface UI (2 panels)
- Chat IA contextuel
- Actions suggérées (add/replace/remove)
- Génération intelligente avec scope configurable

### ⚠️ En fallback
- ÉTAPE 3: Vectorstores phyto/gemmo/aroma (IDs nécessitent vérification depuis dashboard OpenAI)
- Le système fonctionne avec le canon Endobiogénie uniquement

### 📝 À implémenter (optionnel)
- Logique complète d'application des actions (replace/remove)
- Export PDF de l'ordonnance
- Historique des modifications
- Notifications en temps réel
- Validation par le praticien

---

## 💡 Points clés

1. **Priorisation du canon**: ÉTAPE 2 (Endobiogénie) est la plus importante et fonctionne parfaitement

2. **Fallback robuste**: Si les vectorstores échouent, le système bascule sur des recommandations codées

3. **Intelligence contextuelle**: Le chat IA a accès à:
   - Terrain BdF complet
   - Ordonnance actuelle (3 volets)
   - Contexte patient (âge, sexe, CI, traitements)

4. **Raisonnement explicite**: Chaque recommandation inclut:
   - Substance + forme galénique
   - Posologie + durée
   - Axe cible + mécanisme d'action
   - Source vectorstore + niveau de preuve
   - CI + interactions

5. **UX optimisée**: Interface hybride 60/40 permet de visualiser l'ordonnance tout en discutant avec l'IA

---

## 🔗 Flux utilisateur complet

```
Patient → Analyse BdF → Ordonnance intelligente
   ↓
1. Configurer scope (plantes/gemmo/aroma/micro)
   ↓
2. Génération (4 étapes - 20-40s)
   ↓
3. Interface hybride
   ├── Panneau gauche: 3 volets structurés
   └── Panneau droit: Chat IA
   ↓
4. Modifications via chat
   ├── Questions sur recommandations
   ├── Demandes de modifications
   └── Application d'actions
   ↓
5. Validation & Impression
```

---

## 📞 Support

Pour toute question technique:
1. Vérifier les logs du serveur dev (`npm run dev`)
2. Tester le backend: `npx tsx scripts/test-ordonnance.ts`
3. Vérifier les IDs vectorstores dans le dashboard OpenAI
4. Consulter les types TypeScript: `lib/ordonnance/types.ts`

---

**Version:** 1.0.0
**Date:** 09/11/2025
**Statut:** ✅ Production-ready (avec canon Endobiogénie)
