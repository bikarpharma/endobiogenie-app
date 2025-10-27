# 🌿 CONTEXTE PROJET - ENDOBIOGÉNIE SAAS (Session suivante)

**Date session précédente :** 27 octobre 2025  
**Branche de travail :** `claude/fix-admin-document-bug-011CURyhi5y9ujz2uQSgR9Mq`  
**État :** Code propre, 4 modules fonctionnels, prêt pour améliorations

---

## 📊 ÉTAT ACTUEL DU PROJET

### ✅ MODULES FONCTIONNELS (100%)

| Module | URL | Status | Description |
|--------|-----|--------|-------------|
| 🌿 **Gemmothérapie** | `/gemmo` | ✅ COMPLET | Chatbot bourgeons (Vector Store connecté) - 6 suggestions |
| 🌺 **Aromathérapie** | `/aroma` | ✅ COMPLET | Chatbot HE (Vector Store connecté) - 6 suggestions |
| 🌿 **Phytothérapie** | `/phyto` | ✅ COMPLET | Chatbot plantes (Vector Store connecté) - 6 suggestions |
| 📚 **Fiches Maladies** | `/fiches` | ✅ COMPLET | 10 fiches multi-approches avec recherche et filtres |
| 💬 **Chat Endobiogénie** | `/chat` | ✅ EXISTANT | Chat principal endobiogénie (déjà présent avant) |
| 🏠 **Dashboard** | `/dashboard` | ✅ EXISTANT | Page d'accueil utilisateur |

### 🗑️ CE QUI A ÉTÉ SUPPRIMÉ

- ❌ **Panel Admin** : Supprimé car bugué et inutile (upload direct sur platform.openai.com)

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack
- **Framework :** Next.js 15 (App Router + Turbopack)
- **Language :** TypeScript
- **Styling :** Inline styles (pas de CSS framework pour l'instant)
- **Base de données :** PostgreSQL (Neon) via Prisma ORM
- **Auth :** NextAuth v5
- **AI :** OpenAI Agents SDK (`@openai/agents`) avec File Search Tool
- **Déploiement :** Pas encore déployé (localhost uniquement)

### Structure des dossiers
```
endobiogenie-app/
├── app/
│   ├── api/
│   │   ├── gemmo/chat/route.ts
│   │   ├── aroma/chat/route.ts
│   │   ├── phyto/chat/route.ts
│   │   └── chat/route.ts (Endobiogénie)
│   ├── gemmo/page.tsx
│   ├── aroma/page.tsx
│   ├── phyto/page.tsx
│   ├── fiches/
│   │   ├── page.tsx (liste avec recherche)
│   │   └── [slug]/page.tsx (détails)
│   ├── chat/page.tsx
│   ├── dashboard/page.tsx
│   ├── layout.tsx (navigation globale)
│   └── globals.css
├── components/
│   ├── GemmoChat.tsx (client component)
│   ├── AromaChat.tsx (client component)
│   └── PhytoChat.tsx (client component)
├── lib/
│   ├── data/
│   │   └── fiches-maladies.ts (10 fiches complètes)
│   ├── auth.ts
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
└── .env.local (OPENAI_API_KEY, DATABASE_URL, etc.)
```

### Vector Stores (OpenAI)
- **Gemmothérapie :** `vs_68fe63bee4bc8191b2ab5e6813d5bed2`
- **Aromathérapie :** `vs_68feabf4185c8191afbadcc2cfe972a7`
- **Phytothérapie :** `vs_68feb856fedc81919ef239741143871e`
- **Endobiogénie :** (existant, ID dans le code `/api/chat/route.ts`)

---

## 🎨 DESIGN ACTUEL

### Thèmes couleurs par module
- 🌿 **Gemmo** : Vert nature `#2d5016`
- 🌺 **Aroma** : Violet/Lavande `#7c3aed`
- 🌿 **Phyto** : Orange/Terre `#ea580c`
- 📚 **Fiches** : Multi-couleurs par catégorie

### Style général
- **Inline styles** (pas de Tailwind/CSS-in-JS)
- **Responsive** : Basique (fonctionne mais peut être amélioré)
- **Typography** : System fonts
- **Cards** : Border-radius 8-12px, shadows subtiles
- **Navigation** : Header avec liens simples

### Points faibles design
- ❌ Pas de design system cohérent
- ❌ Mobile non optimisé (utilisable mais pas idéal)
- ❌ Pas d'animations avancées
- ❌ Typography basique
- ❌ Pas de dark mode
- ❌ Interface fonctionnelle mais pas "wow"

---

## 📋 TÂCHES RESTANTES (Priorités)

### 🎨 1. MISE EN PAGE / DESIGN (URGENT)

**Objectif :** Passer d'une interface fonctionnelle à une interface professionnelle et moderne.

**Sous-tâches :**
- [ ] **Adopter un framework CSS** :
  - Option 1 : Tailwind CSS (recommandé - rapide, moderne)
  - Option 2 : shadcn/ui (composants React + Tailwind)
  - Option 3 : Chakra UI ou MUI (plus lourd)
- [ ] **Créer un design system** :
  - Palette de couleurs cohérente
  - Typographie (fonts Google : Inter, Manrope, etc.)
  - Spacing scale (4px, 8px, 16px, 24px, 32px...)
  - Components réutilisables (Button, Card, Input, Badge...)
- [ ] **Refonte layout global** :
  - Sidebar navigation (au lieu du header actuel)
  - Meilleur header avec logo professionnel
  - Footer avec liens utiles
  - Breadcrumbs pour navigation
- [ ] **Améliorer les pages chatbot** :
  - Meilleure UI messages (bulles style WhatsApp/Telegram)
  - Animation typing indicator
  - Meilleurs avatars/icones
  - Markdown rendering pour réponses formatées
- [ ] **Améliorer fiches maladies** :
  - Cards plus élégantes
  - Meilleure typography
  - Icons SVG professionnels
  - Animations smooth

**Temps estimé :** 4-6 heures

---

### 📱 2. VERSION MOBILE (URGENT)

**Objectif :** Rendre l'app 100% responsive et agréable sur mobile/tablet.

**Sous-tâches :**
- [ ] **Navigation mobile** :
  - Burger menu (hamburger icon)
  - Bottom navigation bar (style app mobile)
  - Drawer/Sidebar responsive
- [ ] **Chatbots mobile** :
  - Input fixé en bas (style WhatsApp)
  - Messages optimisés pour petit écran
  - Suggestions en scroll horizontal
  - Keyboard handling correct
- [ ] **Fiches mobile** :
  - Cards stacked (1 colonne)
  - Filtres en drawer/modal
  - Touch-friendly buttons (min 44px)
- [ ] **Responsive breakpoints** :
  - Mobile : <640px
  - Tablet : 640-1024px
  - Desktop : >1024px
- [ ] **Tests** :
  - Tester sur iPhone (Safari)
  - Tester sur Android (Chrome)
  - Tester rotation landscape

**Temps estimé :** 3-4 heures

---

### 🚀 3. DÉPLOIEMENT (PRIORITÉ HAUTE)

**Objectif :** Mettre l'app en ligne (production).

**Sous-tâches :**
- [ ] **Choisir plateforme** :
  - Option 1 : **Vercel** (recommandé - Next.js natif, gratuit pour starter)
  - Option 2 : Netlify
  - Option 3 : Railway/Render (si besoin backend custom)
- [ ] **Préparer environnement** :
  - Variables d'environnement (OPENAI_API_KEY, DATABASE_URL, NEXTAUTH_SECRET, etc.)
  - Configurer domaine custom (optionnel)
  - Configurer NEXTAUTH_URL pour production
- [ ] **Base de données production** :
  - Vérifier Neon PostgreSQL (déjà configuré ?)
  - Migrer schéma Prisma : `prisma migrate deploy`
  - Seed data si nécessaire
- [ ] **Build & Deploy** :
  - Tester build : `npm run build`
  - Corriger erreurs TypeScript/build
  - Push sur Vercel via GitHub (auto-deploy)
- [ ] **Configuration post-déploiement** :
  - Tester toutes les pages
  - Vérifier les chatbots fonctionnent
  - Monitoring (Vercel Analytics)
  - SEO : meta tags, sitemap, robots.txt

**Temps estimé :** 2-3 heures

---

### 📖 4. AJOUT MODULE BdF (BIOLOGIE DES FONCTIONS)

**Objectif :** Ajouter l'outil Biologie des Fonctions (BdF) selon cahier des charges.

**Contexte cahier des charges :**
- **BdF V1 (0-2 mois) :** Intégrer PDF formules (index + formules)
- **BdF V2 (2-6 mois) :** Calcul automatique en JavaScript

**Sous-tâches V1 (PDF formules) :**
- [ ] **Créer page `/bdf`** :
  - Liste des formules par catégorie
  - Recherche par nom/indication
  - PDF viewer intégré ou liens de téléchargement
- [ ] **Structure de données** :
  - `lib/data/bdf-formules.ts` (index des formules)
  - Champs : nom, catégorie, indications, composition, PDF path
- [ ] **Upload PDFs** :
  - Stocker PDFs dans `/public/bdf/` ou CDN
  - Ou intégrer via Vector Store (si pertinent)
- [ ] **Interface** :
  - Cards par formule
  - Filtres par catégorie/indication
  - Bouton télécharger/voir PDF
- [ ] **Navigation** :
  - Ajouter lien "📖 BdF" dans menu

**Sous-tâches V2 (Calculs auto - plus tard) :**
- [ ] Créer calculateur interactif
- [ ] Inputs : poids, âge, sexe, symptômes
- [ ] Logique calcul posologie
- [ ] Génération ordonnance PDF

**Temps estimé V1 :** 3-4 heures

---

### 📚 5. AUTRES MODULES (SELON CAHIER DES CHARGES)

**À ajouter (priorité moyenne/basse) :**

#### **Plantes médicinales de Tunisie** 🇹🇳
- Page `/plantes-tunisie`
- Base de données ethnobotanique + scientifique
- Fiches plantes locales
- Photos/illustrations
- **Temps :** 4-6 heures

#### **Espace Patient** 👤
- Page `/patient` (profil utilisateur)
- Historique consultations
- Recommandations personnalisées IA
- Export PDF
- **Temps :** 6-8 heures (V1 simple)

#### **Chatbot multi-approches pour Fiches Maladies** (V2)
- Orchestration des 4 agents (Endo/Gemmo/Aroma/Phyto)
- Synthèse intelligente
- Recommandations croisées
- **Temps :** 8-10 heures

---

## 🎯 ORDRE RECOMMANDÉ DES TÂCHES

**Session prochaine (4-6h) :**
1. ✅ **Design/Mise en page** (Tailwind + refonte UI) - 3h
2. ✅ **Mobile responsive** - 2h
3. ✅ **Tests et ajustements** - 1h

**Session suivante (3-4h) :**
1. ✅ **Déploiement Vercel** - 2h
2. ✅ **Tests production** - 1h
3. ✅ **Ajout BdF V1** (début) - 1h

**Sessions ultérieures :**
- Finaliser BdF V1
- Plantes Tunisie
- Espace Patient
- Améliorations UX/UI continues

---

## 🔑 INFORMATIONS IMPORTANTES

### Variables d'environnement (.env.local)
```env
# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# (Ajouter autres vars si besoin)
```

### Commandes utiles
```bash
# Développement
npm run dev

# Build
npm run build

# Prisma
npx prisma generate
npx prisma migrate dev
npx prisma studio

# Git
git status
git add .
git commit -m "message"
git push origin claude/fix-admin-document-bug-011CURyhi5y9ujz2uQSgR9Mq
```

### Branches Git
- **Branche actuelle :** `claude/fix-admin-document-bug-011CURyhi5y9ujz2uQSgR9Mq`
- **Branche main :** `main` (à merger quand prêt pour prod)

---

## 💡 RECOMMANDATIONS TECHNIQUES

### Pour le design (Tailwind)
```bash
# Installer Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configurer `tailwind.config.js` :
```js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gemmo: '#2d5016',
        aroma: '#7c3aed',
        phyto: '#ea580c',
      },
    },
  },
}
```

### Pour le responsive
- Utiliser Tailwind breakpoints : `sm:`, `md:`, `lg:`, `xl:`
- Mobile-first approach
- Test avec Chrome DevTools responsive mode

### Pour le déploiement Vercel
1. Créer compte Vercel
2. Connecter repo GitHub
3. Configurer variables d'env dans Vercel dashboard
4. Auto-deploy à chaque push sur branche

---

## 📞 DEMANDES UTILISATEUR (DERNIÈRE SESSION)

**Utilisateur a dit :**
> "on va ouvrir une autre discussion et on va garder le contexte, donner le prompt, les tâches à faire sont la mise en page, la version pour mobile, le déploiement, ajout de certaines rubriques comme BdF (biologie des fonctions)....."

**Priorités utilisateur :**
1. Mise en page (design professionnel)
2. Version mobile
3. Déploiement
4. BdF

---

## 🎯 PROMPT POUR NOUVELLE SESSION

**Copiez-collez ce prompt dans la nouvelle discussion Claude Code :**

```
Bonjour ! Je continue le projet Endobiogénie SaaS.

CONTEXTE :
- Projet Next.js 15 + TypeScript + OpenAI Agents
- 4 modules fonctionnels : Gemmo/Aroma/Phyto chatbots + Fiches Maladies (10 fiches)
- Code propre, admin supprimé, tout fonctionne en localhost
- Branche : claude/fix-admin-document-bug-011CURyhi5y9ujz2uQSgR9Mq
- Voir fichier CONTEXT_FOR_NEXT_SESSION.md pour détails complets

TÂCHES PRIORITAIRES :
1. DESIGN/MISE EN PAGE : Intégrer Tailwind CSS, refonte UI professionnelle
2. MOBILE RESPONSIVE : Optimiser pour mobile/tablet
3. DÉPLOIEMENT : Mettre en prod sur Vercel
4. BdF (Biologie des Fonctions) : Ajouter module V1 (PDF formules)

OBJECTIF SESSION : Améliorer design + responsive mobile

Commençons par le design. Que proposes-tu comme approche ?
```

---

## 📝 NOTES FINALES

- **Code actuel :** Propre, fonctionnel, bien structuré
- **Qualité :** Production-ready côté logique, à améliorer côté UI/UX
- **Performance :** Bonne (Next.js 15 optimisé)
- **Sécurité :** NextAuth configuré, variables d'env sécurisées
- **SEO :** Basique (à améliorer : meta tags, sitemap)

**Le projet est solide. Il faut maintenant le rendre beau et le déployer !** 🚀

---

**Préparé par Claude Code - 27 octobre 2025**
