# 🚀 GUIDE D'INSTALLATION - Endobiogénie SaaS

Ce guide vous explique **pas à pas** comment lancer le projet en local et le déployer sur Vercel.

---

## 📋 PRÉREQUIS

Vous devez avoir installé sur votre ordinateur :

1. **Node.js 20+** : [Télécharger ici](https://nodejs.org/)
2. **Docker Desktop** (pour la base de données locale) : [Télécharger ici](https://www.docker.com/products/docker-desktop/)
3. **Un compte Vercel** : [S'inscrire ici](https://vercel.com/signup)

---

## 🛠️ INSTALLATION EN LOCAL

### **Étape 1 : Cloner le projet (déjà fait)**

Vous avez déjà le projet. Passez à l'étape 2.

### **Étape 2 : Installer les dépendances**

Ouvrez un terminal dans le dossier du projet et tapez :

```bash
npm install
```

⏳ **Cela prend 1-2 minutes.** Vous verrez plein de lignes défiler, c'est normal.

---

### **Étape 3 : Configurer les variables d'environnement**

1. Ouvrez le fichier `.env.local` (il est déjà créé)
2. **IMPORTANT** : Remplacez `sk-votre-cle-actuelle-ici` par votre vraie clé OpenAI
3. Les autres variables sont déjà configurées

---

### **Étape 4 : Lancer la base de données PostgreSQL**

#### **Option A : Avec Docker (recommandé)**

Si vous avez Docker installé :

```bash
docker-compose up -d
```

✅ **C'est tout !** La base de données tourne en arrière-plan.

#### **Option B : Sans Docker**

Si vous n'avez pas Docker, vous pouvez :
- Installer PostgreSQL manuellement ([Télécharger](https://www.postgresql.org/download/))
- OU utiliser un service en ligne gratuit comme [Neon](https://neon.tech/) ou [Supabase](https://supabase.com/)

---

### **Étape 5 : Créer les tables dans la base de données**

**🤔 C'est quoi ?** Prisma va "construire" les tables (User, Chat, Message...) dans votre base de données.

```bash
npx prisma migrate dev --name init
```

⏳ **Cela prend 10-20 secondes.** Vous verrez :

```
✔ Generated Prisma Client
✔ Database migrations have been created successfully
```

---

### **Étape 6 : Lancer le serveur de développement**

```bash
npm run dev
```

✅ **Le site est accessible à** : [http://localhost:3000](http://localhost:3000)

---

## ✅ TESTER L'AUTHENTIFICATION

1. Allez sur [http://localhost:3000](http://localhost:3000)
2. Cliquez sur **"Commencer gratuitement"**
3. Remplissez le formulaire :
   - Nom : `Test User`
   - Email : `test@example.com`
   - Mot de passe : `password123`
4. Cliquez sur **"Créer mon compte"**
5. Vous serez redirigé vers la page de connexion
6. Connectez-vous avec les mêmes identifiants
7. ✅ **Vous arrivez sur le Dashboard !**

---

## 🚀 DÉPLOIEMENT SUR VERCEL (PRODUCTION)

### **Étape 1 : Créer une base de données Vercel Postgres**

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez sur **Storage** (menu de gauche)
3. Cliquez sur **Create Database**
4. Choisissez **Postgres**
5. Nommez-la : `endobiogenie-db`
6. Région : **Europe (Paris)** ou la plus proche
7. Cliquez sur **Create**

✅ **La variable `DATABASE_URL` est ajoutée automatiquement** à votre projet Vercel.

---

### **Étape 2 : Ajouter les variables d'environnement sur Vercel**

1. Allez dans **Settings → Environment Variables**
2. Ajoutez les variables suivantes :

| Nom | Valeur |
|-----|--------|
| `OPENAI_API_KEY` | Votre clé OpenAI (commence par `sk-proj-...`) |
| `OPENAI_MODEL` | `gpt-4.1-mini` |
| `AUTH_SECRET` | Générez un secret (voir ci-dessous) |
| `NEXTAUTH_URL` | `https://endobiogenie-rag.vercel.app` |

**Pour générer `AUTH_SECRET`**, ouvrez un terminal et tapez :

```bash
openssl rand -base64 32
```

Copiez le résultat et collez-le dans la variable `AUTH_SECRET`.

---

### **Étape 3 : Pousser le code sur GitHub**

Vérifiez que vous êtes sur la bonne branche :

```bash
git status
```

Vous devriez voir : `On branch claude/saas-auth-setup-011CUR2Ho71pjHdL1ervnSXE`

Si oui, ajoutez tous les fichiers :

```bash
git add .
git commit -m "feat: add authentication and database (Prisma + NextAuth)"
git push -u origin claude/saas-auth-setup-011CUR2Ho71pjHdL1ervnSXE
```

---

### **Étape 4 : Déployer sur Vercel**

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **endobiogenie-rag**
3. Vercel détecte automatiquement le nouveau push
4. Le déploiement démarre automatiquement
5. ⏳ **Attendez 2-3 minutes**
6. ✅ **Votre site est en ligne !**

---

### **Étape 5 : Tester en production**

1. Allez sur [https://endobiogenie-rag.vercel.app](https://endobiogenie-rag.vercel.app)
2. Créez un compte
3. Connectez-vous
4. ✅ **Tout fonctionne !**

---

## 🐛 PROBLÈMES COURANTS

### **Erreur : "Connection refused to localhost:5432"**

➡️ **Solution** : La base de données n'est pas lancée. Tapez :

```bash
docker-compose up -d
```

### **Erreur : "Prisma Client not generated"**

➡️ **Solution** : Générez le client Prisma :

```bash
npx prisma generate
```

### **Erreur : "Invalid email or password"**

➡️ **Solution** : Vérifiez que vous avez bien créé un compte AVANT de vous connecter.

### **Page blanche sur Vercel**

➡️ **Solution** : Vérifiez que toutes les variables d'environnement sont configurées dans **Settings → Environment Variables**.

---

## 📚 PROCHAINES ÉTAPES

Maintenant que l'authentification fonctionne, vous pouvez :

1. **Phase 2** : Ajouter la persistance des conversations (adapter `/api/chat`)
2. **Phase 3** : Créer les fiches plantes avec recherche sémantique
3. **Phase 4** : Export PDF et partage
4. **Phase 5** : Admin et gestion des documents RAG

---

## 🆘 BESOIN D'AIDE ?

Si vous êtes bloqué :

1. Vérifiez les logs dans le terminal (`npm run dev`)
2. Vérifiez les logs sur Vercel (Dashboard → Logs)
3. Lisez les messages d'erreur (ils sont souvent explicites)

**Bon courage ! 🚀**
