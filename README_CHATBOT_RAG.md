# 🧠 Chatbot Enrichi avec RAG Endobiogénie - Étape 3

## 📋 Vue d'ensemble

L'**Étape 3** améliore le mode `BDF_ANALYSE` pour fusionner :
1. **Les calculs quantitatifs** de la Biologie des Fonctions (BdF)
2. **L'intelligence endobiogénique** issue du vector store

Le résultat est une **analyse enrichie** qui combine chiffres BdF + lecture fonctionnelle experte du terrain.

---

## 🎯 Objectif

Quand l'utilisateur fournit des valeurs biologiques, il obtient :
- ✅ Calculs des index BdF
- ✅ Interprétation chiffrée
- ✅ **NOUVEAU** : Lecture endobiogénique enrichie avec le contexte du vector store `vs_68e87a07ae6c81918d805c8251526bda`

---

## 🏗️ Architecture enrichie

### Nouveau module créé

```
lib/chatbot/
└── vectorStoreRetrieval.ts    # Récupération contexte RAG
```

### Module mis à jour

```
lib/chatbot/
└── analyseBiologie.ts         # VERSION 2.0 enrichie avec RAG
```

---

## 🔄 Nouveau pipeline (Étape 3)

### Pipeline BDF_ANALYSE enrichi

```
1️⃣ EXTRACTION
   └─> buildLabPayloadFromMessage(message)
   └─> Extrait : { GR, GB, TSH, LDH, CPK, ... }

2️⃣ CALCUL BDF
   └─> POST /api/bdf/analyse
   └─> Retour : { indexes, summary, axesDominants, noteTechnique }

3️⃣ CONSTRUCTION QUERY RAG
   └─> buildRagQuery(interpretation)
   └─> Génère requête optimisée pour vector store
   └─> Ex: "Profil: [...] Axes: [...] Explique la logique d'adaptation..."

4️⃣ RÉCUPÉRATION CONTEXTE ENDO
   └─> retrieveEndobiogenieContext(ragQuery)
   └─> Interroge vector store vs_68e87a07ae6c81918d805c8251526bda
   └─> Retour : 2-3 passages contextuels

5️⃣ GÉNÉRATION RÉPONSE ENRICHIE
   └─> formatEnrichedResponse()
   └─> Fusionne : BdF + contexte RAG
   └─> Retour : texte structuré en français
```

---

## 📡 retrieveEndobiogenieContext()

### Signature

```typescript
async function retrieveEndobiogenieContext(
  query: string
): Promise<string[]>
```

### Fonctionnement

1. **Utilise l'API OpenAI Agents** (`@openai/agents`)
2. **Interroge le vector store** `vs_68e87a07ae6c81918d805c8251526bda`
3. **Retourne 2-3 passages** textuels pertinents

### Exemple de query

```typescript
const query = `
Profil fonctionnel : Le rendement fonctionnel thyroïdien apparaît efficace.

Axes neuroendocriniens dominants identifiés :
- Axe thyréotrope mobilisé efficacement
- Empreinte androgénique tissulaire dominante

Explique la logique d'adaptation du terrain en langage endobiogénie :
- Dynamique de l'axe corticotrope (ACTH → cortisol)
- Dynamique de l'axe thyréotrope
- Dynamique de l'axe gonadotrope
- Équilibre catabolisme/anabolisme
`;
```

### Exemple de retour

```typescript
[
  "L'axe thyréotrope régule la vitesse métabolique tissulaire...",
  "L'empreinte androgénique dominante soutient la structure...",
  "L'équilibre adaptatif privilégie ici le renouvellement..."
]
```

### Fallback

Si le vector store n'est pas accessible (erreur réseau, clé API manquante), la fonction retourne un **contexte par défaut** générique.

---

## 📊 Format de sortie enrichi

### Avant (Étape 2)

```
🔬 ANALYSE BIOLOGIE DES FONCTIONS

📋 Valeurs analysées
📊 Lecture des index
⚙️ Axes sollicités
🧾 Note technique
```

### Après (Étape 3)

```
🔬 ANALYSE BIOLOGIE DES FONCTIONS - ENRICHIE

📋 Valeurs biologiques analysées
🔬 Résumé fonctionnel
📊 Lecture des index
⚙️ Axes sollicités
🧠 Lecture endobiogénique du terrain ⬅️ NOUVEAU (avec RAG)
🧾 Note technique
```

---

## 🧠 Section "Lecture endobiogénique"

### Construction

La fonction `synthesizeEndobiogenicReading()` génère cette section en :

1. **Introduisant le profil** avec une phrase d'accroche
2. **Intégrant les passages RAG** du vector store
3. **Ajoutant des analyses spécifiques** selon les axes dominants détectés
4. **Concluant** avec une note de prudence clinique

### Exemple de sortie

```
🧠 Lecture endobiogénique du terrain :

Ce profil fonctionnel révèle une dynamique adaptative particulière
du terrain biologique. L'axe thyréotrope régule la vitesse métabolique
tissulaire et la capacité de réponse cellulaire. Un index thyroïdien
efficace reflète un bon rendement fonctionnel des hormones thyroïdiennes
en périphérie. L'empreinte androgénique dominante soutient la structure
et la densité tissulaire, orientant le terrain vers une stabilité
anabolique de fond.

L'axe thyréotrope module la vitesse métabolique et la capacité de
réponse cellulaire. Son activité conditionne l'efficacité avec laquelle
le terrain répond aux sollicitations. Le système gonadotrope participe
à la dynamique anabolique de fond, soutenant le renouvellement
tissulaire et la pression pro-croissance.

Cette lecture fonctionnelle s'inscrit dans une perspective globale
du terrain, non comme un diagnostic, mais comme un outil d'analyse
des régulations en cours.
```

### Vocabulaire utilisé

- ✅ "axe corticotrope", "axe thyréotrope", "axe gonadotrope"
- ✅ "catabolisme", "anabolisme", "pression pro-croissance"
- ✅ "dynamique adaptative", "orientation fonctionnelle"
- ✅ "sollicitation", "mobilisation", "rendement"
- ❌ Jamais de diagnostic
- ❌ Jamais de prescription

---

## 🔌 Configuration requise

### Variables d'environnement

```env
# Clé API OpenAI (pour le vector store)
OPENAI_API_KEY=sk-...

# Modèle OpenAI (optionnel)
OPENAI_MODEL=gpt-4o-mini

# URL de base (pour appel interne /bdf/analyse)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Vector Store

**ID** : `vs_68e87a07ae6c81918d805c8251526bda`

**Contenu** :
- Logique terrain (axes neuroendocriniens)
- Lecture fonctionnelle du cortisol, TSH, axes
- Principes d'adaptation πΣ / αΣ / βΣ
- Interprétation clinique en langage endobiogénie

---

## 📝 Exemple complet

### Input utilisateur

```
GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1 neutrophiles 3.5 lymphocytes 2.0
```

### Étapes internes

1. **Classification** : `BDF_ANALYSE` ✅
2. **Extraction** : `{ GR: 4.5, GB: 6.2, LDH: 180, CPK: 90, ... }`
3. **Calcul BdF** : Appel `/api/bdf/analyse` → indexes
4. **Query RAG** : Construction query pour vector store
5. **Contexte RAG** : Récupération passages endobiogénie
6. **Fusion** : Génération réponse enrichie

### Output enrichi

```markdown
🔬 ANALYSE BIOLOGIE DES FONCTIONS (BdF) - ENRICHIE

📋 Valeurs biologiques analysées :
- GR: 4.5
- GB: 6.2
- LDH: 180
- CPK: 90
- TSH: 2.1
- neutrophiles: 3.5
- lymphocytes: 2.0

🔬 Résumé fonctionnel :
Le rendement fonctionnel thyroïdien apparaît efficace.

📊 Lecture des index :
- Index génital : 725.81 → Empreinte androgénique tissulaire marquée
- Index thyroïdien : 2.00 → Activité métabolique thyroïdienne efficace
- Index génito-thyroïdien (gT) : 1.75 → Réponse thyroïdienne suffisante
- Index d'adaptation : 0.58 → Orientation ACTH/cortisol
- Index œstrogénique : Calcul impossible (données manquantes)
- Turn-over tissulaire : Calcul impossible (données manquantes)

⚙️ Axes sollicités :
- Axe thyréotrope mobilisé efficacement
- Adaptation orientée ACTH/cortisol
- Empreinte androgénique tissulaire dominante

🧠 Lecture endobiogénique du terrain :
Ce profil fonctionnel révèle une dynamique adaptative particulière du
terrain biologique. L'axe thyréotrope régule la vitesse métabolique
tissulaire et la capacité de réponse cellulaire. Un index thyroïdien
efficace reflète un bon rendement fonctionnel des hormones thyroïdiennes
en périphérie. Le système gonadotrope module l'anabolisme de fond via
les androgènes et les œstrogènes, impactant le renouvellement tissulaire.

La sollicitation de l'axe corticotrope oriente le terrain vers une
gestion de l'urgence adaptative, avec mobilisation des substrats et
orientation catabolique. L'axe thyréotrope module la vitesse métabolique
et la capacité de réponse cellulaire. Son activité conditionne
l'efficacité avec laquelle le terrain répond aux sollicitations. Le
système gonadotrope participe à la dynamique anabolique de fond,
soutenant le renouvellement tissulaire et la pression pro-croissance.

Cette lecture fonctionnelle s'inscrit dans une perspective globale du
terrain, non comme un diagnostic, mais comme un outil d'analyse des
régulations en cours.

🧾 Note technique :
Analyse fonctionnelle du terrain selon la Biologie des Fonctions.
À corréler au contexte clinique.
```

---

## 🧪 Tests

### Test 1 : Vérifier le vector store

```bash
curl http://localhost:3000/api/chatbot
```

**Attendu** :
```json
{
  "ok": true,
  "message": "Chatbot orchestrateur opérationnel - Version enrichie avec RAG",
  "capabilities": [
    "Analyse automatique de valeurs biologiques (BdF)",
    "Enrichissement avec contexte endobiogénique (Vector Store)",
    ...
  ]
}
```

### Test 2 : Analyse enrichie

```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1"}'
```

**Attendu** :
- Mode : `BDF_ANALYSE`
- Reply contient : section "🧠 Lecture endobiogénique du terrain"

---

## 📊 Performance

### Temps de réponse attendu

- **Extraction** : < 1ms
- **Classification** : < 1ms
- **API /bdf/analyse** : ~50-100ms
- **Vector Store RAG** : ~500-1500ms (selon charge OpenAI)
- **Formatage** : < 10ms
- **TOTAL** : ~600-1700ms

### Optimisations possibles

1. **Cache des queries RAG** : Mémoriser les réponses fréquentes
2. **Exécution parallèle** : Appeler BdF + RAG en même temps
3. **Timeout RAG** : Fallback rapide si vector store lent

---

## 🔧 Troubleshooting

### "Contexte par défaut utilisé"

**Cause** : Vector store non accessible ou clé API manquante

**Solution** :
1. Vérifier `OPENAI_API_KEY` dans `.env`
2. Vérifier que le vector store ID est correct
3. Checker les logs serveur

### "Réponse vide de la section endobiogénique"

**Cause** : Passages RAG trop courts ou filtrés

**Solution** :
- Améliorer la query RAG dans `buildRagQuery()`
- Ajuster le seuil de longueur minimale (actuellement 30 caractères)

### "Erreur API BdF"

**Cause** : Route `/api/bdf/analyse` non accessible

**Solution** :
- Vérifier que le serveur tourne
- Vérifier `NEXT_PUBLIC_BASE_URL`

---

## 🚀 Prochaines améliorations

### Possibilités

1. **Streaming** : Afficher la réponse au fur et à mesure
2. **Cache intelligent** : Mémoriser les analyses récentes
3. **Multi-turns** : Permettre des questions de suivi sur l'analyse
4. **Visualisations** : Graphiques des index (radar chart)
5. **Export enrichi** : PDF avec contexte endobiogénique intégré

---

## 📚 Références

### Fichiers clés

- `lib/chatbot/vectorStoreRetrieval.ts` : Récupération contexte RAG
- `lib/chatbot/analyseBiologie.ts` : Analyse enrichie (v2.0)
- `lib/chatbot/orchestrator.ts` : Orchestrateur (inchangé)
- `app/api/chatbot/route.ts` : Endpoint API (mise à jour)

### Documentation

- [README_CHATBOT.md](./README_CHATBOT.md) : Étapes 1 & 2
- Ce fichier : Étape 3 (enrichissement RAG)

---

## ✅ Résumé de l'Étape 3

### Ce qui a été fait

✅ Fonction `retrieveEndobiogenieContext()` avec OpenAI Agents SDK
✅ Mise à jour `analyseBiologie()` pour intégrer le RAG
✅ Nouvelle section "🧠 Lecture endobiogénique du terrain"
✅ Fallback par défaut si vector store indisponible
✅ Vocabulaire endobiogénie cohérent et pédagogique
✅ Documentation complète

### Résultat

Un chatbot qui **fusionne** :
- La rigueur quantitative de la BdF
- L'intelligence fonctionnelle de l'endobiogénie

Pour une **lecture enrichie** du terrain biologique. 🎯

---

**Développé pour le SaaS Agent Endobiogénie** 🧬
