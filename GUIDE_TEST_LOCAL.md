# 🚀 GUIDE SIMPLE : Tester le Chatbot en Local

## Prérequis (vérifier d'abord)

Avant de commencer, assurez-vous d'avoir :
- ✅ Node.js installé (version 18 ou plus)
- ✅ Une clé API OpenAI
- ✅ Le projet téléchargé sur votre ordinateur

---

## 📍 ÉTAPE 1 : Ouvrir le terminal

### Sur Windows :
1. Appuyez sur `Windows + R`
2. Tapez `cmd` et appuyez sur Entrée

### Sur Mac :
1. Appuyez sur `Cmd + Espace`
2. Tapez `terminal` et appuyez sur Entrée

### Sur Linux :
1. Appuyez sur `Ctrl + Alt + T`

---

## 📂 ÉTAPE 2 : Aller dans le dossier du projet

Dans le terminal, tapez (remplacez le chemin par le vôtre) :

**Sur Windows :**
```bash
cd C:\Users\DELL\Documents\endobiogenie-simple
```

**Sur Mac/Linux :**
```bash
cd ~/Documents/endobiogenie-simple
```

**Pour vérifier que vous êtes au bon endroit**, tapez :
```bash
dir
```
(ou `ls` sur Mac/Linux)

Vous devriez voir des fichiers comme `package.json`, `app/`, `lib/`, etc.

---

## 🔑 ÉTAPE 3 : Configurer la clé API OpenAI

### 3.1 Récupérer votre clé API

1. Allez sur https://platform.openai.com/api-keys
2. Connectez-vous avec votre compte OpenAI
3. Cliquez sur "Create new secret key"
4. **COPIEZ** la clé (elle commence par `sk-proj-...`)
   ⚠️ **IMPORTANT** : Sauvegardez-la quelque part, vous ne pourrez plus la voir après !

### 3.2 Créer le fichier de configuration

Dans le terminal, tapez :

**Sur Windows :**
```bash
echo OPENAI_API_KEY=VOTRE_CLE_ICI > .env.local
```

**Sur Mac/Linux :**
```bash
echo "OPENAI_API_KEY=VOTRE_CLE_ICI" > .env.local
```

**⚠️ REMPLACEZ `VOTRE_CLE_ICI` par votre vraie clé !**

**Exemple** :
```bash
echo OPENAI_API_KEY=sk-proj-abc123xyz456 > .env.local
```

### 3.3 Vérifier que ça a marché

Tapez :
```bash
type .env.local
```
(ou `cat .env.local` sur Mac/Linux)

Vous devriez voir :
```
OPENAI_API_KEY=sk-proj-...votre clé...
```

---

## 📦 ÉTAPE 4 : Installer les dépendances

**Si c'est la première fois**, tapez :
```bash
npm install
```

**Attendez** que ça se termine (peut prendre 1-2 minutes).

Vous verrez plein de texte défiler. C'est normal ! ✅

---

## 🚀 ÉTAPE 5 : Démarrer le serveur

Tapez :
```bash
npm run dev
```

**Attendez** quelques secondes. Vous devriez voir :
```
✓ Ready in Xms
○ Local: http://localhost:3000
```

✅ **Le serveur est démarré !**

⚠️ **NE FERMEZ PAS cette fenêtre de terminal !** Le serveur doit rester ouvert.

---

## 🧪 ÉTAPE 6 : Tester le chatbot

Maintenant vous avez **2 options** pour tester :

---

### 🌐 OPTION A : Tester dans le navigateur (PLUS FACILE)

#### Test 1 : Vérifier que ça marche

1. Ouvrez votre navigateur (Chrome, Firefox, etc.)
2. Allez sur cette adresse : http://localhost:3000/chatbot
3. Vous devriez voir l'interface du chatbot ! 🎉

#### Test 2 : Poser une question simple

Dans la zone de texte, tapez :
```
Qu'est-ce que l'axe thyréotrope ?
```

Cliquez sur **Envoyer**.

✅ **Attendu** : Le chatbot répond avec une explication sur l'axe thyréotrope.

#### Test 3 : Analyser un bilan biologique

Dans la zone de texte, tapez (ou copiez-collez) :
```
GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1
```

Cliquez sur **Envoyer**.

✅ **Attendu** : Le chatbot analyse les valeurs et donne une interprétation BdF enrichie !

---

### 💻 OPTION B : Tester avec des commandes (POUR LES PLUS AVENTUREUX)

**Ouvrez un DEUXIÈME terminal** (gardez le premier ouvert avec le serveur).

#### Test 1 : Healthcheck

Tapez :
```bash
curl http://localhost:3000/api/chatbot
```

✅ **Attendu** : Vous voyez un message JSON comme :
```json
{
  "ok": true,
  "message": "Chatbot orchestrateur opérationnel - Version enrichie avec RAG"
}
```

#### Test 2 : Question endobiogénie

Tapez :
```bash
curl -X POST http://localhost:3000/api/chatbot -H "Content-Type: application/json" -d "{\"message\": \"Qu'est-ce que l'axe thyréotrope ?\"}"
```

✅ **Attendu** : Vous voyez une réponse JSON avec `"mode": "ENDO_DISCUSSION"` et une explication.

#### Test 3 : Analyse BdF

Tapez :
```bash
curl -X POST http://localhost:3000/api/chatbot -H "Content-Type: application/json" -d "{\"message\": \"GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1\"}"
```

✅ **Attendu** : Vous voyez une réponse JSON avec `"mode": "BDF_ANALYSE"` et une analyse complète.

---

## 📊 ÉTAPE 7 : Voir les résultats

### Dans le navigateur :
- Les réponses s'affichent directement dans l'interface
- Vous voyez un badge "🔬 Analyse BdF" ou "💬 Discussion"

### Dans le terminal (avec curl) :
- La réponse est en JSON
- Cherchez le champ `"reply"` pour voir le texte de la réponse

---

## 🎯 Ce que vous devez voir

### Pour une question simple :
```
💬 Discussion

🧬 L'axe thyréotrope (TSH - T3/T4)

L'axe thyréotrope régule le métabolisme cellulaire et le rendement
fonctionnel de l'énergie en périphérie.

Rôle physiologique :
- Régulation du métabolisme basal
- Thermogenèse et dépense énergétique
(...)
```

### Pour un bilan biologique :
```
🔬 Analyse BdF

🔬 ANALYSE BIOLOGIE DES FONCTIONS (BdF) - ENRICHIE

📋 Valeurs biologiques analysées :
- GR: 4.5
- GB: 6.2
- LDH: 180
- CPK: 90
- TSH: 2.1

🔬 Résumé fonctionnel :
Le rendement fonctionnel thyroïdien apparaît efficace.

📊 Lecture des index :
- Index génital : 725.81 → Empreinte androgénique tissulaire marquée
- Index thyroïdien : 2.00 → Activité métabolique thyroïdienne efficace
(...)

🧠 Lecture endobiogénique du terrain :
Ce profil fonctionnel révèle une dynamique adaptative...
(contexte enrichi depuis le vector store OpenAI)
```

---

## 🛑 ÉTAPE 8 : Arrêter le serveur

Quand vous avez fini de tester :

1. Allez dans le terminal où le serveur tourne
2. Appuyez sur `Ctrl + C`
3. Le serveur s'arrête

---

## ❌ Problèmes courants

### Problème 1 : "OPENAI_API_KEY non configurée"

**Solution** : Retournez à l'ÉTAPE 3 et vérifiez que le fichier `.env.local` contient bien votre clé.

Vérifiez avec :
```bash
type .env.local
```

### Problème 2 : "Port 3000 déjà utilisé"

**Solution** : Un autre programme utilise le port 3000.

Tuez le processus ou utilisez un autre port :
```bash
PORT=3001 npm run dev
```

Puis testez sur http://localhost:3001

### Problème 3 : "npm: command not found"

**Solution** : Node.js n'est pas installé.

Téléchargez-le sur : https://nodejs.org/

### Problème 4 : "Cannot find module 'openai'"

**Solution** : Les dépendances ne sont pas installées.

Tapez :
```bash
npm install
```

### Problème 5 : Le chatbot répond avec le "contexte par défaut"

**Cause** : Le vector store n'est pas accessible.

**Vérifiez** :
1. Que votre clé API OpenAI est valide
2. Que vous avez des crédits sur votre compte OpenAI
3. Que le vector store `vs_68e87a07ae6c81918d805c8251526bda` existe

**Ce n'est pas grave** : Le chatbot fonctionne quand même avec un contexte générique !

---

## 📝 Récapitulatif ultra-rapide

```bash
# 1. Aller dans le dossier
cd C:\Users\DELL\Documents\endobiogenie-simple

# 2. Configurer la clé API
echo OPENAI_API_KEY=sk-proj-VOTRE_CLE > .env.local

# 3. Installer (première fois seulement)
npm install

# 4. Démarrer
npm run dev

# 5. Tester dans le navigateur
# Ouvrir http://localhost:3000/chatbot
```

---

## 🎓 Exemples de messages à tester

### Questions théoriques :
```
- Qu'est-ce que l'endobiogénie ?
- Explique-moi l'axe corticotrope
- C'est quoi le terrain biologique ?
- Comment fonctionne l'adaptation physiologique ?
```

### Bilans biologiques :
```
- GR 4.5 GB 6.2 LDH 180 CPK 90 TSH 2.1
- GR 4.8 GB 7.5 neutrophiles 4.2 lymphocytes 2.8 TSH 1.8
- Analyse ce bilan : GR 4.2 GB 5.8 LDH 165 CPK 85 TSH 2.5
```

---

## ✅ Checklist de test

- [ ] Le serveur démarre sans erreur
- [ ] http://localhost:3000/chatbot affiche l'interface
- [ ] Une question simple retourne une réponse (mode ENDO_DISCUSSION)
- [ ] Un bilan biologique retourne une analyse (mode BDF_ANALYSE)
- [ ] La section "🧠 Lecture endobiogénique" est présente
- [ ] Pas d'erreur dans le terminal du serveur

---

## 🆘 Besoin d'aide ?

Si ça ne marche toujours pas :

1. **Vérifiez les logs** dans le terminal où tourne le serveur
2. **Cherchez les erreurs** en rouge
3. **Copiez l'erreur** et cherchez-la sur Google ou demandez de l'aide

---

## 🎉 Félicitations !

Si vous voyez des réponses du chatbot, **ça marche** ! 🚀

Votre SaaS Agent Endobiogénie est opérationnel en local ! 🧬✨

---

**Développé pour vous simplifier la vie** 💙
