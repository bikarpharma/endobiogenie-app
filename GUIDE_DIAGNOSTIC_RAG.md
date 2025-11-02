# 🔍 Guide de diagnostic - Problème de chargement RAG

## Symptôme

Quand vous cliquez sur le bouton "🧠 Obtenir la lecture endobiogénique du terrain", le chargement prend du temps mais ne se termine jamais, ou vous obtenez une erreur.

---

## 🛠️ Étapes de diagnostic

### ÉTAPE 1 : Vérifier les logs du serveur

#### A. Où trouver les logs ?
Dans le terminal où vous avez lancé `npm run dev`, vous devriez voir apparaître des messages pendant le chargement.

#### B. Logs normaux (si tout fonctionne)
```
🔍 Création/récupération de l'assistant...
✅ Assistant ID: asst_xxxxxxxxxxxxx
🔍 Création du thread...
✅ Thread ID: thread_xxxxxxxxxxxxx
🔍 Ajout du message utilisateur...
🔍 Lancement du run avec file_search...
✅ Run status: completed
🔍 Récupération des messages...
✅ Nombre de messages: 2
✅ Texte reçu de l'assistant (longueur): 1234
✅ Paragraphes extraits: 3
✅ Nombre total de chunks: 3
✅ Thread supprimé
```

#### C. Logs d'erreur possibles

**Erreur 1 : Clé API manquante**
```
❌ Erreur lors de la requête vector store: Error: OPENAI_API_KEY non configurée
```
➡️ **Solution :** Vérifiez votre fichier `.env.local` (voir ÉTAPE 2)

**Erreur 2 : Clé API invalide**
```
❌ Erreur lors de la requête vector store: Error: Incorrect API key provided
```
➡️ **Solution :** Régénérez votre clé API sur https://platform.openai.com/api-keys

**Erreur 3 : Pas de crédits**
```
❌ Erreur lors de la requête vector store: Error: You exceeded your current quota
```
➡️ **Solution :** Ajoutez des crédits sur votre compte OpenAI

**Erreur 4 : Timeout**
```
❌ Erreur lors de la requête vector store: Error: Timeout: le vector store met trop de temps à répondre
```
➡️ **Solution :** Réessayez, ou vérifiez votre connexion internet

**Erreur 5 : Vector store inaccessible**
```
❌ Run non complété: failed
❌ Erreur détaillée: { code: 'invalid_vector_store_id', message: '...' }
```
➡️ **Solution :** Le vector store `vs_68e87a07ae6c81918d805c8251526bda` n'est pas accessible avec votre clé API

---

### ÉTAPE 2 : Vérifier le fichier .env.local

#### A. Localisation du fichier
```
C:\Users\DELL\Documents\endobiogenie-simple\.env.local
```

#### B. Contenu attendu
```
OPENAI_API_KEY=sk-proj-VOTRE_VRAIE_CLE_ICI
```

#### C. Comment vérifier
Ouvrez un terminal et tapez :
```bash
cd C:\Users\DELL\Documents\endobiogenie-simple
type .env.local
```

Vous devriez voir votre clé API.

#### D. Si le fichier n'existe pas
Créez-le avec :
```bash
echo OPENAI_API_KEY=sk-proj-VOTRE_CLE > .env.local
```

**⚠️ IMPORTANT :** Remplacez `sk-proj-VOTRE_CLE` par votre vraie clé API !

#### E. Obtenir une clé API OpenAI

1. Allez sur https://platform.openai.com/api-keys
2. Connectez-vous à votre compte OpenAI
3. Cliquez sur "Create new secret key"
4. Donnez-lui un nom (ex: "Agent Endobiogenie")
5. Copiez la clé (elle commence par `sk-proj-...`)
6. Collez-la dans `.env.local`

---

### ÉTAPE 3 : Vérifier les crédits OpenAI

#### A. Où vérifier ?
Allez sur : https://platform.openai.com/usage

#### B. Que vérifier ?
- Vous avez un solde positif (au moins $1)
- Votre carte bancaire est bien enregistrée
- Vous n'avez pas atteint votre limite mensuelle

#### C. Ajouter des crédits
1. Allez sur https://platform.openai.com/settings/organization/billing
2. Cliquez sur "Add payment method"
3. Ajoutez votre carte bancaire
4. Achetez des crédits (minimum $5)

---

### ÉTAPE 4 : Vérifier le vector store

#### A. Vérifier l'accès au vector store
Le vector store utilisé est : `vs_68e87a07ae6c81918d805c8251526bda`

Pour vérifier que vous y avez accès, regardez les logs du serveur :
- Si vous voyez "❌ Erreur détaillée: { code: 'invalid_vector_store_id' }", vous n'avez pas accès
- Ce vector store est peut-être privé et lié à un compte OpenAI spécifique

#### B. Solution si vous n'avez pas accès
Vous avez deux options :

**Option 1 : Créer votre propre vector store**

1. Allez sur https://platform.openai.com/storage/vector_stores
2. Créez un nouveau vector store
3. Uploadez vos documents sur l'endobiogénie (PDF, TXT, etc.)
4. Copiez l'ID du vector store (ex: `vs_abc123...`)
5. Modifiez le fichier `lib/chatbot/ragClient.ts` :
   ```typescript
   const VECTOR_STORE_ID = "vs_VOTRE_ID_ICI";
   ```

**Option 2 : Utiliser le contexte par défaut**

Le code utilise déjà un contexte par défaut si le vector store n'est pas accessible. Vous devriez voir quand même une réponse, mais moins personnalisée.

---

### ÉTAPE 5 : Vérifier les logs du navigateur

#### A. Ouvrir les DevTools
1. Dans Chrome/Edge : Appuyez sur `F12`
2. Allez dans l'onglet "Console"

#### B. Logs normaux
```
🔍 Appel API chatbot avec message: GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1
✅ Réponse API chatbot: { mode: 'BDF_ANALYSE', reply: '...' }
✅ Section RAG extraite (longueur): 1234
```

#### C. Logs d'erreur
```
❌ Erreur RAG complète: Error: Timeout
```

---

### ÉTAPE 6 : Tester manuellement l'API

#### A. Tester l'endpoint chatbot
Ouvrez un nouvel onglet et allez sur :
```
http://localhost:3000/api/chatbot
```

Vous devriez voir :
```json
{
  "ok": true,
  "message": "Chatbot orchestrateur opérationnel - Version enrichie avec RAG",
  "capabilities": [...]
}
```

#### B. Tester avec une requête POST
Utilisez un outil comme Postman, ou utilisez curl dans le terminal :

```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1\"}"
```

Vous devriez obtenir une réponse JSON avec `mode: "BDF_ANALYSE"` et un champ `reply` contenant le texte de l'analyse.

---

## 🔧 Solutions rapides

### Solution 1 : Redémarrer le serveur
```bash
# Arrêtez le serveur : Ctrl+C dans le terminal
# Redémarrez :
npm run dev
```

### Solution 2 : Vider le cache
```bash
rm -rf .next
npm run dev
```

### Solution 3 : Réinstaller les dépendances
```bash
npm install
npm run dev
```

### Solution 4 : Vérifier la version d'OpenAI SDK
```bash
npm list openai
```

Vous devriez voir une version >= 4.0.0

Si ce n'est pas le cas :
```bash
npm install openai@latest
```

---

## 📊 Tableau de diagnostic

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Chargement infini (> 30s) | Timeout du vector store | Vérifier connexion internet, réessayer |
| Erreur "OPENAI_API_KEY non configurée" | Fichier .env.local manquant | Créer .env.local avec la clé |
| Erreur "Incorrect API key" | Clé API invalide | Régénérer la clé sur OpenAI |
| Erreur "exceeded your current quota" | Pas de crédits | Ajouter des crédits sur OpenAI |
| Contexte générique affiché | Vector store inaccessible | Créer votre propre vector store |
| Pas d'erreur mais résultat vide | Extraction RAG échouée | Vérifier les logs serveur |

---

## 🚨 Mode dégradé (si rien ne fonctionne)

Si le RAG ne fonctionne vraiment pas, le système utilisera automatiquement un **contexte par défaut** générique.

Vous verrez alors un texte comme :
```
L'axe corticotrope (ACTH → cortisol) coordonne la réponse d'urgence...
L'axe thyréotrope régule la vitesse métabolique tissulaire...
Le système gonadotrope module l'anabolisme de fond...
```

Ce n'est pas personnalisé à votre bilan, mais c'est mieux que rien !

---

## 📝 Checklist complète

Avant de demander de l'aide, vérifiez :

- [ ] Le serveur `npm run dev` est bien lancé
- [ ] Le fichier `.env.local` existe et contient `OPENAI_API_KEY=sk-proj-...`
- [ ] La clé API est valide (testée sur https://platform.openai.com/api-keys)
- [ ] Vous avez des crédits sur votre compte OpenAI
- [ ] Vous avez consulté les logs du serveur (terminal)
- [ ] Vous avez consulté les logs du navigateur (F12 → Console)
- [ ] Vous avez testé l'endpoint `/api/chatbot` manuellement
- [ ] Vous avez essayé de redémarrer le serveur
- [ ] Vous avez attendu au moins 30-40 secondes avant de conclure à un timeout
- [ ] Vous avez vérifié votre connexion internet

---

## 🆘 Besoin d'aide supplémentaire ?

Si aucune de ces solutions ne fonctionne :

1. **Copiez les logs du serveur** (tout le texte du terminal)
2. **Faites une capture d'écran** de l'erreur dans le navigateur
3. **Vérifiez** que votre `.env.local` contient bien la clé (sans partager la clé complète !)
4. **Partagez** ces informations pour obtenir de l'aide

---

## ✅ Ce qui doit fonctionner

Avec la correction apportée, le système a maintenant :

1. **Timeout de 30 secondes** sur l'appel OpenAI (au lieu d'attendre indéfiniment)
2. **Timeout de 40 secondes** côté frontend (pour laisser le temps au serveur)
3. **Logs détaillés** à chaque étape pour diagnostiquer facilement
4. **Messages d'erreur clairs** avec suggestions de résolution
5. **Bouton "Réessayer"** si une erreur se produit
6. **Contexte par défaut** si le vector store est inaccessible
7. **Mode dégradé gracieux** - le système fonctionne même si le RAG échoue

---

**Bonne chance avec le diagnostic !** 🔧✨
