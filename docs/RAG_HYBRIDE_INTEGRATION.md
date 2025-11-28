# Intégration RAG Hybride - Endobiogénie

## Vue d'ensemble

L'application utilise une **approche hybride** pour la recherche de plantes médicinales:

1. **RAG Local** (Phase 1): Filtrage instantané dans les JSON extraits
2. **VectorStore OpenAI** (Phase 2): Enrichissement si nécessaire

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RECHERCHE HYBRIDE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Axes perturbés (BDF)                                       │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────┐                                       │
│  │   RAG LOCAL      │  ◄─── 1ms, gratuit                    │
│  │   (50 plantes)   │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │  ≥ 3 plantes ?   │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
│     OUI   │   NON                                           │
│     │     │                                                  │
│     │     ▼                                                  │
│     │  ┌──────────────────┐                                 │
│     │  │ VECTORSTORE      │ ◄─── 3-5s, payant               │
│     │  │ (4 volumes PDF)  │                                 │
│     │  └────────┬─────────┘                                 │
│     │           │                                            │
│     ▼           ▼                                            │
│  ┌──────────────────┐                                       │
│  │  RECOMMANDATIONS │                                       │
│  │  (max 4 plantes) │                                       │
│  └──────────────────┘                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Fichiers clés

### RAG Local
- `lib/ordonnance/ragLocalSearch.ts` - Module de recherche locale
- `RAG/endobiogenie/volume2/matiere-medicale.json` - 50 plantes
- `RAG/endobiogenie/volume2/axes-endocriniens.json` - 4 axes
- `RAG/endobiogenie/volume2/emonctoires.json` - 5 émonctoires
- `RAG/endobiogenie/volume2/sna.json` - SNA (para/alpha/bêta)
- `RAG/endobiogenie/volume3/pathologies-database.json` - Pathologies

### VectorStores OpenAI
- `vs_68e87a07ae6c81918d805c8251526bda` - 4 volumes endobiogénie
- `vs_68feb856fedc81919ef239741143871e` - Manuel phytothérapie
- `vs_68fe63bee4bc8191b2ab5e6813d5bed2` - Gemmothérapie
- `vs_68feabf4185c8191afbadcc2cfe972a7` - Aromathérapie

### Moteur thérapeutique
- `lib/ordonnance/therapeuticReasoning.ts` - Méthode `searchEndobiogenie()`

## Flux de données

### Phase 1: RAG Local

```typescript
const ragResult = ragLocal.searchPlantesHybride(
  axes,                    // [{axe: "corticotrope", niveau: "hyper", score: 7}]
  symptomes,               // ["fatigue", "insomnie"]
  {
    maxResults: 8,
    excludeCI: ["grossesse"],
    sexe: "F"
  }
);
```

**Retour:**
```typescript
{
  plantes: PlanteMedicinale[],   // Triées par score
  axesDetails: AxeEndocrinien[], // Détails des axes
  emonctoiresImpliques: [],      // Émonctoires concernés
  conseilsCliniques: string[],   // Conseils de drainage
  score: number,                 // Score max
  source: "RAG Local"
}
```

### Phase 2: VectorStore (si nécessaire)

Appelé uniquement si `ragResult.plantes.length < 3`

```typescript
const fileSearch = fileSearchTool([VECTORSTORES.endobiogenie]);
const agent = new Agent({
  name: "endobiogenie-agent",
  model: "gpt-4o-mini",
  instructions: `CONTEXTE: Le RAG local a identifié...`,
  tools: [fileSearch]
});
```

### Fusion des résultats

```typescript
// RAG local prioritaire
const merged = mergeRecommandations(
  recommandationsLocales,  // Priorité
  recommandationsOpenAI    // Enrichissement
);
// → Max 4 recommandations
```

## Performances

| Métrique | RAG Local | VectorStore OpenAI |
|----------|-----------|-------------------|
| Temps | 1-5ms | 3-5 secondes |
| Coût | Gratuit | ~$0.01-0.05/requête |
| Précision | Exacte (par axe) | Sémantique |
| Disponibilité | Hors-ligne | Requiert Internet |

## Mapping des axes

```typescript
const AXES_MAPPING = {
  corticotrope: ["corticotrope"],
  thyroidien: ["thyréotrope", "thyreotrope"],
  gonadotrope: ["gonadotrope"],
  somatotrope: ["somatotrope"],
  sna: ["parasympathique", "alphasympathique", "betasympathique"],
  sna_alpha: ["alphasympathique"],
  sna_beta: ["betasympathique"],
  histamine: ["corticotrope"]
};
```

## Tests

```bash
# Test RAG local seul
node scripts/test-rag-local.ts

# Test intégration hybride
node scripts/test-hybrid-rag.js

# Test VectorStore OpenAI
node scripts/test-rag-direct.js
```

## Données extraites

### Volume 2 - Matière Médicale
- 50 plantes avec:
  - nomLatin, nomCommun
  - essence (signification thérapeutique)
  - resume (actions principales)
  - axes (corticotrope, gonadotrope, etc.)
  - indications (digestif, nerveux, etc.)
  - galenique (TM, EPS, MG, HE)
  - precautions

### Volume 3 - Pathologies
- Allergies, Hypothyroïdie, etc.
- Pour chaque pathologie:
  - terrainPrecritique (axes impliqués)
  - emonctoires à drainer
  - traitementEndobiogenique
  - conseilsCliniques

## Exemple d'utilisation

```typescript
// Dans therapeuticReasoning.ts
const recommandations = await this.searchEndobiogenie(
  [
    { axe: "corticotrope", niveau: "hyper", score: 7, justification: "Stress" },
    { axe: "gonadotrope", niveau: "desequilibre", score: 6, justification: "Périménopause" }
  ],
  {
    age: 45,
    sexe: "F",
    CI: ["grossesse"],
    traitements: [],
    symptomes: ["fatigue", "bouffées de chaleur"]
  }
);

// Résultat: 4 recommandations max avec:
// - Ficus carica (Figuier) - corticotrope + gonadotrope
// - Viola tricolor (Pensée sauvage) - corticotrope + gonadotrope + thyréotrope
// - etc.
```
