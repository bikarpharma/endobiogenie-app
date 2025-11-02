# 🤖 Chatbot Orchestrateur Endobiogénie - Documentation

## 📋 Vue d'ensemble

Le **Chatbot Orchestrateur** est un agent intelligent unique qui combine deux fonctionnalités majeures :

1. **Analyse automatique de bilans biologiques** (Biologie des Fonctions - BdF)
2. **Réponses aux questions générales** sur l'endobiogénie, les axes, le terrain, etc.

Le chatbot détecte automatiquement si le message utilisateur contient des valeurs biologiques et s'adapte en conséquence.

---

## 🏗️ Architecture

### Modules créés

```
lib/chatbot/
├── types.ts                 # Types TypeScript
├── classifier.ts            # Classifieur de messages
├── labExtractor.ts          # Extracteur de valeurs biologiques
├── analyseBiologie.ts       # Analyse BdF automatisée
├── answerEndobiogenie.ts    # Réponses générales endobiogénie
├── orchestrator.ts          # Orchestrateur principal
└── index.ts                 # Exports

app/api/chatbot/
└── route.ts                 # Route API POST /api/chatbot

components/
└── ChatbotOrchestrator.tsx  # Composant React d'exemple

app/chatbot/
└── page.tsx                 # Page de démonstration
```

---

## 🔄 Flux de fonctionnement

### 1️⃣ Classification du message

La fonction `classifyUserRequest()` analyse le message et retourne :
- `"BDF_ANALYSE"` si des valeurs biologiques sont détectées
- `"ENDO_DISCUSSION"` sinon

**Indicateurs de détection BdF :**
- Présence de mots-clés : GR, GB, TSH, LDH, CPK, neutrophiles, etc.
- Expressions : "analyse ce bilan", "interprète cette biologie", etc.
- Patterns : "GR 4.5", "TSH: 2.1", "GB=6.2"
- Présence de valeurs numériques associées aux mots-clés

**Règle de décision :** Au moins 2 indicateurs sur 4 → Mode BDF_ANALYSE

---

### 2️⃣ Extraction des valeurs (mode BdF)

La fonction `buildLabPayloadFromMessage()` extrait les valeurs avec des regex :

**Patterns supportés :**
- `GR 4.5` (espace)
- `TSH: 2.1` (deux-points)
- `GB=6.2` (égal)
- `LDH180` (collé)

**Valeurs extraites :**
```typescript
{
  GR?: number;
  GB?: number;
  neutrophiles?: number;
  lymphocytes?: number;
  eosinophiles?: number;
  monocytes?: number;
  plaquettes?: number;
  LDH?: number;
  CPK?: number;
  TSH?: number;
  osteocalcine?: number;
  PAOi?: number;
}
```

---

### 3️⃣ Analyse BdF (mode BdF)

La fonction `analyseBiologie()` :
1. Extrait les valeurs avec `buildLabPayloadFromMessage()`
2. Appelle l'API interne `POST /api/bdf/analyse`
3. Formate la réponse en texte structuré

**Format de sortie :**
```
🔬 ANALYSE BIOLOGIE DES FONCTIONS (BdF)

📋 Valeurs biologiques analysées :
- GR: 4.5
- GB: 6.2
- LDH: 180
- CPK: 90

📊 Résumé fonctionnel :
Le rendement fonctionnel thyroïdien apparaît efficace.

📈 Index calculés :
- Index génital : 725.81 → Empreinte androgénique tissulaire marquée
- Index thyroïdien : 2.00 → Activité métabolique thyroïdienne efficace
(...)

⚙️ Axes dominants identifiés :
- Axe thyréotrope mobilisé efficacement
- Empreinte androgénique tissulaire dominante

🧾 Note technique :
Analyse fonctionnelle du terrain selon la Biologie des Fonctions.
```

---

### 4️⃣ Réponses endobiogénie (mode Discussion)

La fonction `answerEndobiogenie()` détecte les thèmes et répond :

**Thèmes supportés :**
- Axe corticotrope (cortisol, ACTH, surrénale)
- Axe thyréotrope (thyroïde, TSH, métabolisme)
- Axe gonadotrope (FSH, œstrogènes, androgènes)
- Terrain biologique
- Axes neuroendocriniens
- Adaptation physiologique
- Questions générales

**Exemple de réponse :**
```markdown
🔬 Axe thyréotrope (TSH - T3/T4)

L'axe thyréotrope régule le métabolisme cellulaire et le rendement
fonctionnel de l'énergie en périphérie.

Rôle physiologique :
- Régulation du métabolisme basal
- Thermogenèse et dépense énergétique
(...)
```

---

## 🔌 Utilisation de l'API

### Endpoint : `POST /api/chatbot`

**Requête :**
```json
{
  "message": "GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1"
}
```

**Réponse :**
```json
{
  "mode": "BDF_ANALYSE",
  "reply": "🔬 ANALYSE BIOLOGIE DES FONCTIONS...\n(...)"
}
```

**Exemple avec question générale :**
```json
{
  "message": "Qu'est-ce que l'axe thyréotrope ?"
}
```

```json
{
  "mode": "ENDO_DISCUSSION",
  "reply": "🔬 Axe thyréotrope (TSH - T3/T4)...\n(...)"
}
```

---

## 💻 Utilisation côté frontend

### Exemple simple

```typescript
async function handleSend(message: string) {
  const res = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  console.log("Mode:", data.mode);
  console.log("Réponse:", data.reply);
}
```

### Composant React complet

Voir `components/ChatbotOrchestrator.tsx` pour un exemple complet avec :
- Interface chat
- Gestion des messages
- Badge de mode (BdF / Discussion)
- Loading state
- Exemples de messages

---

## 🧪 Tests manuels

### Test 1 : Analyse BdF

**Input :**
```
GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1 neutrophiles 3.5 lymphocytes 2.0
```

**Output attendu :**
- Mode : `BDF_ANALYSE`
- Réponse formatée avec index calculés

### Test 2 : Question générale

**Input :**
```
Explique-moi l'axe corticotrope
```

**Output attendu :**
- Mode : `ENDO_DISCUSSION`
- Réponse pédagogique sur l'axe corticotrope

### Test 3 : Question avec mot-clé biologique mais sans valeurs

**Input :**
```
C'est quoi la TSH ?
```

**Output attendu :**
- Mode : `ENDO_DISCUSSION` (car pas assez d'indicateurs)
- Réponse sur l'axe thyréotrope

---

## ⚙️ Configuration

### Variable d'environnement

Pour l'appel interne à `/api/bdf/analyse`, le chatbot utilise :

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

En production, définir l'URL correcte.

---

## 📊 Exemples de messages utilisateur

### Messages BdF (analyse)

```
✅ "GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1"
✅ "Analyse ce bilan : GR=4.5, GB=6.2, TSH:2.1"
✅ "Voici mes valeurs : neutrophiles 3.5 lymphocytes 2.0"
✅ "GR 4.5, GB 6.2, interprète ces résultats"
```

### Messages Discussion (endobiogénie)

```
✅ "Qu'est-ce que l'endobiogénie ?"
✅ "Explique-moi l'axe thyréotrope"
✅ "Comment fonctionne l'adaptation physiologique ?"
✅ "C'est quoi le terrain biologique ?"
```

---

## 🎯 Contraintes et style

### Ton clinique neutre

- ✅ "axe sollicité", "profil fonctionnel", "dynamique adaptative"
- ❌ Jamais de diagnostic ni de traitement
- ❌ Pas de langage alarmiste

### Langue

- Tout en français
- Texte structuré et lisible
- Utilisation d'emojis pour la clarté visuelle

---

## 🔗 Intégration avec l'existant

Le chatbot orchestrateur utilise :
- **Module BdF existant** (`lib/bdf/`) pour les calculs
- **API `/api/bdf/analyse`** pour l'analyse des valeurs
- **Types partagés** (`LabValues`, `InterpretationPayload`)

Il ne modifie pas la route `/api/chat` existante (RAG avec OpenAI).

---

## 📦 Livrables

### Fonctions principales

✅ `classifyUserRequest()` - Classifieur de messages
✅ `buildLabPayloadFromMessage()` - Extracteur de valeurs
✅ `analyseBiologie()` - Analyse BdF automatisée
✅ `answerEndobiogenie()` - Réponses générales
✅ `respondToUser()` - Orchestrateur principal

### Routes API

✅ `POST /api/chatbot` - Endpoint principal
✅ `GET /api/chatbot` - Healthcheck

### Frontend

✅ Composant React `ChatbotOrchestrator`
✅ Page de démonstration `/chatbot`

---

## 🚀 Prochaines étapes

### Améliorations possibles

1. **Historique de conversation** : Sauvegarder les échanges en base
2. **Multi-tours** : Contexte de conversation pour questions de suivi
3. **Export PDF** : Générer un rapport BdF téléchargeable
4. **Validation avancée** : Vérifier les plages de valeurs biologiques
5. **RAG endobiogénie** : Intégrer le Vector Store existant pour réponses enrichies

---

## 📝 Notes techniques

### Performance

- Classification : < 1ms (regex simples)
- Extraction : < 1ms (regex)
- Analyse BdF : ~50-100ms (appel API interne)
- Total : < 200ms pour une requête BdF complète

### Sécurité

- Validation des inputs
- Pas de code exécuté côté serveur depuis le message utilisateur
- Aucune donnée sensible stockée (sauf si intégration DB future)

---

## 🆘 Troubleshooting

### "Je n'ai pas pu extraire de valeurs biologiques"

→ Vérifier le format : `GR 4.5 GB 6.2 TSH 2.1`

### API retourne 500

→ Vérifier que `/api/bdf/analyse` est fonctionnel
→ Checker les logs serveur

### Classification incorrecte

→ Ajuster les seuils dans `classifier.ts`
→ Ajouter des mots-clés ou patterns

---

## 📞 Support

Pour toute question sur le chatbot orchestrateur, consulter :
- Ce README
- Le code source commenté dans `lib/chatbot/`
- Les exemples dans `components/ChatbotOrchestrator.tsx`

---

**Développé pour le SaaS Agent Endobiogénie** 🧬
