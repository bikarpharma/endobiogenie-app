# 🚀 Guide de Déploiement Vercel - Endobiogénie App

**Déployez votre application en 10 minutes pour un accès public depuis PC, smartphone, tablette, partout dans le monde !**

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

1. ✅ **Compte GitHub** : Votre code doit être sur GitHub (déjà fait ✓)
2. ✅ **Clé API OpenAI** : Nécessaire pour le chatbot RAG
   - Obtenez-la sur : https://platform.openai.com/api-keys
   - Format : `sk-proj-...`

---

## 🌐 Méthode 1 : Déploiement via Interface Web (RECOMMANDÉ)

### Étape 1 : Créer un compte Vercel

1. Allez sur : **https://vercel.com/signup**
2. Cliquez sur **"Continue with GitHub"**
3. Autorisez Vercel à accéder à vos repos GitHub
4. Vous êtes connecté ! ✓

### Étape 2 : Importer votre projet

1. Sur le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Recherchez et sélectionnez le repo : **`bikarpharma/endobiogenie-app`**
3. Cliquez sur **"Import"**

### Étape 3 : Configurer les variables d'environnement

**TRÈS IMPORTANT** : Avant de déployer, configurez ces variables :

1. Dans la section **"Environment Variables"**, ajoutez :

```
Nom                 | Valeur
--------------------|------------------
OPENAI_API_KEY      | sk-proj-...
OPENAI_MODEL        | gpt-4.1-mini
```

2. Sélectionnez **Production, Preview, Development** pour chaque variable

### Étape 4 : Configurer le déploiement

**Configuration par défaut (laissez tel quel) :**
```
Framework Preset     : Next.js
Build Command        : npm run build
Output Directory     : .next
Install Command      : npm install
Root Directory       : ./
```

### Étape 5 : Déployer !

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes (compilation + déploiement)
3. Votre app est en ligne ! 🎉

**Votre URL sera :**
```
https://endobiogenie-app.vercel.app
```
(ou un nom personnalisé si vous le configurez)

---

## 💻 Méthode 2 : Déploiement via CLI (Pour développeurs)

### Installation Vercel CLI

```bash
npm install -g vercel
```

### Se connecter

```bash
vercel login
```

### Déployer

```bash
# Depuis le dossier du projet
vercel

# Suivez les instructions :
# - Link to existing project? No
# - Project name: endobiogenie-app
# - Directory: ./
# - Override settings? No
```

### Configurer les variables d'environnement

```bash
vercel env add OPENAI_API_KEY
# Collez votre clé : sk-proj-...

vercel env add OPENAI_MODEL
# Entrez : gpt-4.1-mini
```

### Déployer en production

```bash
vercel --prod
```

---

## 🔐 Configuration des Variables d'Environnement

### Via l'interface web

1. Allez sur : https://vercel.com/dashboard
2. Sélectionnez votre projet **"endobiogenie-app"**
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Production + Preview + Development |
| `OPENAI_MODEL` | `gpt-4.1-mini` | Production + Preview + Development |

5. Cliquez **"Save"**

### Redéployer après modification

Si vous modifiez les variables d'environnement :
1. Allez dans **Deployments**
2. Cliquez sur le dernier déploiement → **"Redeploy"**

---

## 📱 Tester votre application

Une fois déployée, votre application est accessible depuis :

### PC / Mac / Linux
Ouvrez votre navigateur et allez sur :
```
https://votre-app.vercel.app
```

### Smartphone (iOS / Android)
1. Ouvrez Safari / Chrome sur votre téléphone
2. Allez sur la même URL
3. Testez le responsive design :
   - Burger menu dans le header ✓
   - Sidebar en drawer avec bouton flottant 📚
   - Interface touch-friendly

### Tablette (iPad, etc.)
Même chose que smartphone, le design s'adapte automatiquement !

---

## 🔄 Déploiement Automatique

**Bonne nouvelle** : Une fois configuré, Vercel déploie automatiquement :

- ✅ **À chaque push sur la branche principale** → Déploiement en production
- ✅ **À chaque push sur une autre branche** → Déploiement preview (URL temporaire)
- ✅ **À chaque pull request** → Preview automatique

**Workflow typique :**
```bash
git add .
git commit -m "New feature"
git push
# → Vercel déploie automatiquement en 2-3 min !
```

---

## 🎯 Personnaliser votre domaine

### Option 1 : Sous-domaine Vercel gratuit

Par défaut, vous avez :
```
https://endobiogenie-app.vercel.app
```

Vous pouvez le renommer :
1. **Settings** → **Domains**
2. Ajoutez : `mon-app.vercel.app`

### Option 2 : Domaine personnalisé (ex: endobiogenie.com)

Si vous avez acheté un domaine :
1. Allez dans **Settings** → **Domains**
2. Cliquez **"Add"**
3. Entrez : `endobiogenie.com`
4. Suivez les instructions pour configurer les DNS
5. Vercel configure automatiquement le HTTPS ✓

**Recommandations de domaines :**
- Namecheap : ~10€/an
- Google Domains : ~12€/an
- OVH : ~8€/an

---

## 🛠️ Dépannage

### Erreur : "OPENAI_API_KEY is not defined"

**Solution :**
1. Vérifiez que vous avez ajouté `OPENAI_API_KEY` dans les variables d'environnement
2. Redéployez le projet

### Erreur : "Build failed"

**Solution :**
1. Vérifiez les logs dans Vercel
2. Assurez-vous que `npm run build` fonctionne en local
3. Vérifiez que toutes les dépendances sont dans `package.json`

### L'application ne répond pas

**Solution :**
1. Vérifiez que votre clé API OpenAI est valide
2. Vérifiez que vous avez des crédits OpenAI restants
3. Regardez les logs dans : **Deployments** → **Function Logs**

### Responsive ne marche pas

**Solution :**
- Le responsive est déjà implémenté ! ✓
- Essayez de redimensionner votre navigateur
- Testez sur un vrai smartphone
- Vérifiez que le cache est vidé (Ctrl+Shift+R)

---

## 📊 Monitoring & Analytics

### Voir les logs en temps réel

1. Allez sur **Deployments**
2. Cliquez sur le déploiement actif
3. Cliquez sur **"Functions"** → Sélectionnez `/api/chat`
4. Vous voyez tous les logs en temps réel !

### Analytics (optionnel)

Vercel offre des analytics gratuits :
1. Activez dans **Settings** → **Analytics**
2. Voyez le nombre de visiteurs, temps de chargement, etc.

---

## 💰 Coûts

### Vercel (Hébergement)
- **Gratuit** pour :
  - Déploiements illimités
  - Bande passante : 100 GB/mois
  - Builds : 6000 min/mois
  - HTTPS automatique
  - Domaine .vercel.app

**Pour votre usage : 100% GRATUIT ✓**

### OpenAI (API)
- **Gratuit** : 5$ de crédits pour tester
- **Ensuite** : Pay-as-you-go
  - GPT-4.1-mini : ~0.15$ / 1M tokens input
  - GPT-4.1 : ~2.5$ / 1M tokens input

**Estimation pour usage modéré** : 10-30€/mois

---

## 🎉 Résultat Final

Après déploiement, vous aurez :

```
✅ URL publique accessible partout
✅ HTTPS automatique (sécurisé)
✅ Responsive mobile/tablet/desktop
✅ Déploiements automatiques à chaque push
✅ Analytics en temps réel
✅ 99.9% uptime garanti par Vercel
```

**Partagez votre app** :
```
🌐 https://endobiogenie-app.vercel.app

Accessible depuis :
- 💻 PC (Windows, Mac, Linux)
- 📱 Smartphone (iOS, Android)
- 📱 Tablette (iPad, etc.)
```

---

## 📞 Support

### Ressources officielles
- **Vercel Docs** : https://vercel.com/docs
- **Next.js Docs** : https://nextjs.org/docs
- **OpenAI API Docs** : https://platform.openai.com/docs

### Problèmes spécifiques au projet
- Ouvrez un ticket GitHub dans le repo
- Consultez `DESIGN_MIGRATION_SUMMARY.md` pour l'architecture

---

## 🚀 Étapes Suivantes

Après déploiement, vous pouvez :

1. **Tester l'app** sur plusieurs devices
2. **Ajouter un domaine personnalisé** (optionnel)
3. **Implémenter le module BdF** (Biologie des Fonctions)
4. **Ajouter des analytics** (Google Analytics, Plausible, etc.)
5. **Améliorer l'UI** (animations, dark mode toggle, etc.)

---

**Créé avec Claude Code** 🤖
**Dernière mise à jour** : 27 octobre 2025
