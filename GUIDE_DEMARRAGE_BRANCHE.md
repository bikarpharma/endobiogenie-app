# 🚀 GUIDE ULTRA-SIMPLE : Récupérer la Branche et Démarrer

## 📍 ÉTAPE 1 : Ouvrir le terminal

### Sur Windows :
1. Appuyez sur `Windows + R`
2. Tapez `cmd`
3. Appuyez sur Entrée

### Sur Mac :
1. Appuyez sur `Cmd + Espace`
2. Tapez `terminal`
3. Appuyez sur Entrée

---

## 📂 ÉTAPE 2 : Aller dans votre dossier projet

Dans le terminal, tapez (avec VOTRE chemin) :

```bash
cd C:\Users\DELL\Documents\endobiogenie-simple
```

**Pour vérifier que vous êtes au bon endroit**, tapez :
```bash
dir
```
(ou `ls` sur Mac/Linux)

Vous devriez voir : `package.json`, `app/`, `lib/`, etc.

✅ **Vous êtes au bon endroit !**

---

## 🔄 ÉTAPE 3 : Récupérer les dernières modifications

Tapez ces commandes **UNE PAR UNE** :

### 3.1 Récupérer toutes les branches du serveur

```bash
git fetch origin
```

Attendez que ça finisse (quelques secondes).

✅ **Ça télécharge les nouvelles branches depuis GitHub**

### 3.2 Basculer sur la bonne branche

```bash
git checkout claude/session-011CUZCiwKWj14KCJxkcrW9t
```

Vous devriez voir :
```
Switched to branch 'claude/session-011CUZCiwKWj14KCJxkcrW9t'
```

✅ **Vous êtes maintenant sur la bonne branche !**

### 3.3 Mettre à jour la branche (au cas où)

```bash
git pull origin claude/session-011CUZCiwKWj14KCJxkcrW9t
```

Si tout est à jour, vous verrez :
```
Already up to date.
```

✅ **Parfait !**

---

## 🔑 ÉTAPE 4 : Configurer votre clé API OpenAI

### 4.1 Vérifier si le fichier existe déjà

```bash
type .env.local
```
(ou `cat .env.local` sur Mac/Linux)

**Si le fichier existe** et contient déjà votre clé, **passez à l'ÉTAPE 5**.

**Si le fichier n'existe pas** ou est vide, continuez ci-dessous.

### 4.2 Créer le fichier de configuration

**Sur Windows :**
```bash
notepad .env.local
```

**Sur Mac/Linux :**
```bash
nano .env.local
```

Cela ouvre un éditeur de texte.

### 4.3 Écrire votre clé API

Dans l'éditeur, tapez (remplacez par VOTRE vraie clé) :

```
OPENAI_API_KEY=sk-proj-VOTRE_VRAIE_CLE_ICI
```

**Exemple** :
```
OPENAI_API_KEY=sk-proj-abc123xyz456789
```

### 4.4 Sauvegarder

**Sur Windows (Notepad)** :
- Cliquez sur "Fichier" → "Enregistrer"
- Fermez Notepad

**Sur Mac/Linux (nano)** :
- Appuyez sur `Ctrl + O` (pour sauvegarder)
- Appuyez sur Entrée
- Appuyez sur `Ctrl + X` (pour quitter)

### 4.5 Vérifier que ça a marché

```bash
type .env.local
```

Vous devriez voir :
```
OPENAI_API_KEY=sk-proj-...
```

✅ **C'est bon !**

---

## 📦 ÉTAPE 5 : Installer les dépendances

**Si c'est la première fois** ou si vous avez tiré de nouvelles modifications :

```bash
npm install
```

**Attendez** 1-2 minutes que tout s'installe.

Vous verrez plein de texte défiler. **C'est normal !** ✅

---

## 🚀 ÉTAPE 6 : Démarrer le serveur

Tapez :

```bash
npm run dev
```

**Attendez** quelques secondes.

Vous devriez voir :
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

🎉 **Le serveur est démarré !**

⚠️ **NE FERMEZ PAS le terminal !** Laissez-le ouvert tant que vous testez.

---

## 🌐 ÉTAPE 7 : Ouvrir le chatbot dans votre navigateur

1. Ouvrez votre navigateur (Chrome, Firefox, Safari, Edge...)
2. Dans la barre d'adresse, tapez :

```
http://localhost:3000/chatbot
```

3. Appuyez sur Entrée

🎉 **Vous devriez voir l'interface du chatbot !**

---

## 🧪 ÉTAPE 8 : Tester le chatbot

### Test 1 : Question simple

Dans la zone de texte du chatbot, tapez :
```
Qu'est-ce que l'axe thyréotrope ?
```

Cliquez sur **Envoyer**.

✅ **Attendu** : Le chatbot répond avec une explication (badge "💬 Discussion").

### Test 2 : Analyse de bilan biologique

Dans la zone de texte, copiez-collez :
```
GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1
```

Cliquez sur **Envoyer**.

✅ **Attendu** : Le chatbot fait une analyse BdF complète (badge "🔬 Analyse BdF").

Vous devriez voir :
- 📋 Valeurs analysées
- 🔬 Résumé fonctionnel
- 📊 Lecture des index
- ⚙️ Axes sollicités
- 🧠 **Lecture endobiogénique du terrain** (avec contexte du vector store)
- 🧾 Note technique

---

## 🛑 ÉTAPE 9 : Arrêter le serveur (quand vous avez fini)

1. Allez dans le terminal où tourne le serveur
2. Appuyez sur `Ctrl + C`
3. Le serveur s'arrête

---

## ❌ Problèmes fréquents et solutions

### Problème 1 : "git: command not found"

**Cause** : Git n'est pas installé.

**Solution** : Installez Git depuis https://git-scm.com/downloads

---

### Problème 2 : "branch not found"

**Cause** : La branche n'a pas été téléchargée.

**Solution** : Retapez :
```bash
git fetch origin
git checkout claude/session-011CUZCiwKWj14KCJxkcrW9t
```

---

### Problème 3 : "Port 3000 already in use"

**Cause** : Un autre programme utilise déjà le port 3000.

**Solution** : Utilisez un autre port :
```bash
PORT=3001 npm run dev
```

Puis ouvrez : http://localhost:3001/chatbot

---

### Problème 4 : "npm: command not found"

**Cause** : Node.js n'est pas installé.

**Solution** : Installez Node.js depuis https://nodejs.org/

---

### Problème 5 : "OPENAI_API_KEY non configurée"

**Cause** : Le fichier `.env.local` n'existe pas ou est mal configuré.

**Solution** : Retournez à l'ÉTAPE 4 et suivez les instructions.

---

### Problème 6 : Le chatbot répond mais avec du "contexte par défaut"

**Cause** : Le vector store n'est pas accessible (clé API invalide ou vector store manquant).

**Ce n'est pas grave !** Le chatbot fonctionne quand même, mais avec un contexte générique au lieu du contexte de votre vector store.

**Pour vérifier** :
1. Allez sur https://platform.openai.com/api-keys
2. Vérifiez que votre clé est active
3. Vérifiez que vous avez des crédits

---

## 📋 Résumé en 7 commandes

Voici toutes les commandes d'un coup (pour copier-coller) :

```bash
# 1. Aller dans le dossier
cd C:\Users\DELL\Documents\endobiogenie-simple

# 2. Récupérer les branches
git fetch origin

# 3. Basculer sur la bonne branche
git checkout claude/session-011CUZCiwKWj14KCJxkcrW9t

# 4. Mettre à jour
git pull origin claude/session-011CUZCiwKWj14KCJxkcrW9t

# 5. (Si besoin) Configurer la clé API
echo OPENAI_API_KEY=sk-proj-VOTRE_CLE > .env.local

# 6. Installer les dépendances
npm install

# 7. Démarrer !
npm run dev
```

Puis ouvrez : **http://localhost:3000/chatbot**

---

## ✅ Checklist de vérification

Avant de tester, assurez-vous que :

- [ ] Vous êtes dans le bon dossier (`endobiogenie-simple`)
- [ ] Vous êtes sur la bonne branche (`git branch` affiche `* claude/session-011CUZCiwKWj14KCJxkcrW9t`)
- [ ] Le fichier `.env.local` existe et contient votre clé API
- [ ] `npm install` s'est exécuté sans erreur
- [ ] Le serveur démarre avec `npm run dev`
- [ ] http://localhost:3000/chatbot affiche l'interface

---

## 🎉 C'est tout !

Si vous avez suivi toutes ces étapes, vous devriez maintenant voir votre chatbot fonctionner en local ! 🚀

### Pour tester :

**Questions simples** :
- "Qu'est-ce que l'endobiogénie ?"
- "Explique-moi l'axe corticotrope"
- "C'est quoi le terrain biologique ?"

**Bilans biologiques** :
- `GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1`
- `GR 4.8 GB 7.5 neutrophiles 4.2 lymphocytes 2.8 TSH 1.8`

---

**Bon test ! 🧬✨**
