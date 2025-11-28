# IntergIA - Pitch Deck
## La première plateforme d'aide à la décision en médecine endobiogénique

---

# SLIDE 1 - COUVERTURE

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                         🧬 IntergIA                              ║
║                                                                  ║
║        L'Intelligence Artificielle au service de la              ║
║           Médecine Intégrative Endobiogénique                    ║
║                                                                  ║
║  ─────────────────────────────────────────────────────────────   ║
║                                                                  ║
║     "Du terrain biologique à l'ordonnance personnalisée"         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

# SLIDE 2 - LE PROBLÈME

## 🔴 Les défis de la médecine intégrative aujourd'hui

### Pour les praticiens
| Défi | Impact |
|------|--------|
| **Complexité diagnostique** | 8 axes neuroendocriniens à analyser simultanément |
| **Temps de consultation** | 45-60 min pour une analyse complète |
| **Formation longue** | 3-5 ans pour maîtriser l'endobiogénie |
| **Littérature dispersée** | 4 volumes + centaines de monographies |

### Pour les patients
- Accès limité aux praticiens formés (< 500 en France)
- Consultations coûteuses (80-150€)
- Suivi complexe entre consultations

### Chiffres clés
```
📊 72% des Français utilisent des médecines complémentaires
📊 Marché phytothérapie France: 500M€/an (+8%/an)
📊 < 500 praticiens endobiogénie formés en France
📊 Délai moyen RDV: 3-6 mois
```

---

# SLIDE 3 - LA SOLUTION

## 🟢 IntergIA : L'assistant IA du praticien endobiogénique

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    DONNÉES PATIENT           IA ENDOBIOGÉNIQUE         RÉSULTAT│
│                                                                 │
│   ┌─────────────┐           ┌─────────────┐        ┌──────────┐│
│   │ Biologie    │           │             │        │Ordonnance││
│   │ (20 params) │ ────────► │   GPT-4o    │ ─────► │Expliquée ││
│   └─────────────┘           │      +      │        │          ││
│                             │  RAG 4 bases│        │ 3 volets ││
│   ┌─────────────┐           │             │        │ Phyto    ││
│   │Interrogatoire│ ────────►│  Lapraz &   │ ─────► │ Gemmo    ││
│   │ (60 questions)│         │  Hedayat    │        │ Micro    ││
│   └─────────────┘           └─────────────┘        └──────────┘│
│                                                                 │
│              ⏱️ 30 secondes vs 45 minutes                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Proposition de valeur unique
> **"Démocratiser l'expertise endobiogénique en augmentant le praticien par l'IA"**

---

# SLIDE 4 - COMMENT ÇA MARCHE

## 🔄 Le parcours utilisateur en 5 étapes

```
     ①                ②                ③                ④                ⑤
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ CRÉER   │     │ ANALYSER│     │INTERROGER    │ SYNTHÈSE│     │ORDONNER │
│ Patient │ ──► │   BdF   │ ──► │ Clinique│ ──►│   IA    │ ──► │Intelligente
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘

  Dossier        8 index        8 axes         Terrain +      3 volets
  médical       calculés       évalués         Drainage      personnalisés
```

### Détail de chaque étape

| Étape | Action | Temps | Résultat |
|-------|--------|-------|----------|
| ① Création patient | Saisie données démographiques + ATCD | 2 min | Dossier structuré |
| ② Analyse BdF | Saisie résultats biologiques | 3 min | 8 index + terrain |
| ③ Interrogatoire | Questionnaire 60 questions | 10 min | Profil neuro-végétatif |
| ④ Synthèse IA | Fusion automatique par GPT-4o | 30 sec | Analyse complète |
| ⑤ Ordonnance | Génération 3 volets thérapeutiques | 10 sec | Prescription prête |

**Temps total: 15 min vs 45-60 min traditionnellement**

---

# SLIDE 5 - TECHNOLOGIE

## 🧠 Architecture IA propriétaire

### Stack technique
```
┌────────────────────────────────────────────────────────────────┐
│                      FRONTEND                                   │
│         Next.js 15 + React 19 + TypeScript                     │
│         Tailwind CSS + Radix UI                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    MOTEUR IA HYBRIDE                           │
│  ┌──────────────────┐    ┌──────────────────────────────────┐ │
│  │   RAG LOCAL      │    │      OPENAI GPT-4o               │ │
│  │   (1ms, gratuit) │───►│   + File Search VectorStores     │ │
│  │   50 plantes     │    │   (4 bases, 50+ MB)              │ │
│  │   indexées       │    │                                  │ │
│  └──────────────────┘    └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      BACKEND                                    │
│         PostgreSQL + Prisma ORM + NextAuth                     │
└────────────────────────────────────────────────────────────────┘
```

### Bases de connaissances RAG
| Base | Contenu | Taille |
|------|---------|--------|
| **Endobiogénie** | 4 volumes Lapraz & Hedayat | 6 MB |
| **Phytothérapie** | Manuel clinique complet | 7.5 MB |
| **Gemmothérapie** | Monographies bourgeons | 0.4 MB |
| **Aromathérapie** | Huiles essentielles | 0.1 MB |

### Innovation clé: RAG Hybride
```
Requête → RAG Local (1ms) → Suffisant? → OUI → Réponse
                               │
                               NON
                               │
                               ▼
                    VectorStore OpenAI (3-5s) → Enrichissement
```
**Résultat: 80% des requêtes résolues localement = Coût réduit de 80%**

---

# SLIDE 6 - PRODUIT

## 📱 Captures d'écran

### Dashboard Patient
```
┌──────────────────────────────────────────────────────────────────┐
│  👤 Marie Dupont, 45 ans, F                     [Générer Ordo]   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐  │
│  │ Aperçu  │Identité │Interro. │Analyses │Synthèse │Ordonn.  │  │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘  │
│                                                                  │
│  ┌────────────────────────┐  ┌────────────────────────────────┐ │
│  │ 🧬 TERRAIN             │  │ 📊 AXES PERTURBÉS              │ │
│  │                        │  │                                │ │
│  │ Type: Alpha            │  │ ▓▓▓▓▓▓▓░░░ Corticotrope  7/10 │ │
│  │ Confiance: 85%         │  │ ▓▓▓▓▓░░░░░ Thyréotrope   5/10 │ │
│  │                        │  │ ▓▓▓▓░░░░░░ Gonadotrope   4/10 │ │
│  └────────────────────────┘  └────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🚿 DRAINAGE NÉCESSAIRE                                     │ │
│  │ Priorité: HAUTE - Foie surchargé                          │ │
│  │ Stratégie: Desmodium + Piloselle pendant 3 semaines       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Ordonnance Intelligente
```
┌──────────────────────────────────────────────────────────────────┐
│  🧬 ORDONNANCE ENDOBIOGÉNIQUE           [Brouillon] [Imprimer]   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ VOLET 1: ENDOBIOGÉNIE (Canon) ──────────────────────────┐   │
│  │ 🛡️ Priorité Absolue                                      │   │
│  │                                                          │   │
│  │ 1. Desmodium (Desmodium adscendens)                      │   │
│  │    📅 5ml matin | Durée: 3 semaines                      │   │
│  │    🎯 Drainage hépatique                                 │   │
│  │                                                          │   │
│  │ 2. Rhodiola (Rhodiola rosea)                             │   │
│  │    📅 5ml matin et midi | Durée: 2 mois                  │   │
│  │    🎯 Adaptogène surrénalien                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ VOLET 3: GEMMOTHÉRAPIE ─────────────────────────────────┐   │
│  │ 🌱 Drainage                                              │   │
│  │                                                          │   │
│  │ 1. Cassis (Ribes nigrum) MG                              │   │
│  │    📅 15 gouttes matin | Durée: 3 semaines               │   │
│  │    🎯 Anti-inflammatoire cortisone-like                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ VOLET 5: MICRO-NUTRITION ───────────────────────────────┐   │
│  │ 💊 Terrain                                               │   │
│  │                                                          │   │
│  │ 1. Magnésium Bisglycinate                                │   │
│  │    📅 300mg/jour en 2 prises | Durée: 3 mois             │   │
│  │    🎯 Terrain spasmophile                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  💡 Conseils: Cohérence cardiaque 3x/jour, éviter café         │
│  🔬 Surveillance: TSH, Cortisol libre, Magnésémie              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

# SLIDE 7 - MODÈLE ÉCONOMIQUE

## 💰 Business Model SaaS B2B

### Pricing
| Plan | Prix/mois | Cible | Fonctionnalités |
|------|-----------|-------|-----------------|
| **Starter** | 49€ | Praticien solo | 50 patients, BdF + Interro |
| **Pro** | 99€ | Cabinet | Illimité, Ordonnances IA, Export PDF |
| **Clinic** | 249€ | Centre de santé | Multi-praticiens, API, Support dédié |

### Projections financières (France)
```
                    Année 1      Année 2      Année 3
                    ────────     ────────     ────────
Clients payants        50          200          500
ARPU mensuel          89€          99€         120€
MRR                 4,450€      19,800€      60,000€
ARR                53,400€     237,600€     720,000€
```

### Unit Economics
| Métrique | Valeur |
|----------|--------|
| CAC (Coût acquisition client) | 150€ |
| LTV (Lifetime Value) | 1,800€ (18 mois) |
| LTV/CAC | 12x |
| Churn mensuel | 3% |
| Marge brute | 85% |

---

# SLIDE 8 - MARCHÉ

## 🌍 Opportunité de marché

### TAM / SAM / SOM
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                         TAM                              │   │
│  │              Médecine Intégrative Europe                 │   │
│  │                     2.5 Mrd €                            │   │
│  │   ┌─────────────────────────────────────────────────┐   │   │
│  │   │                     SAM                          │   │   │
│  │   │        Praticiens Phyto/Naturo France           │   │   │
│  │   │                  120 M€                          │   │   │
│  │   │   ┌─────────────────────────────────────────┐   │   │   │
│  │   │   │               SOM                        │   │   │   │
│  │   │   │     Endobiogénie France                  │   │   │   │
│  │   │   │            5 M€                          │   │   │   │
│  │   │   └─────────────────────────────────────────┘   │   │   │
│  │   └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Segments cibles
| Segment | Taille France | Potentiel |
|---------|---------------|-----------|
| Médecins formés endobiogénie | ~500 | 250 clients |
| Naturopathes | ~6,000 | 1,500 clients |
| Pharmaciens phyto | ~3,000 | 500 clients |
| Centres de santé intégrative | ~200 | 100 clients |

### Tendances favorables
- 📈 +15%/an croissance médecines complémentaires
- 📈 +25%/an adoption IA en santé
- 📈 Remboursement phyto par certaines mutuelles
- 📈 Demande croissante médecine personnalisée

---

# SLIDE 9 - CONCURRENCE

## 🥊 Positionnement concurrentiel

### Matrice concurrentielle
```
                    Expertise Endobiogénie
                           ▲
                           │
              IntergIA ●   │
                    ╲      │
                     ╲     │
                      ╲    │
     Doctolib ●        ╲   │         ● Logiciels
     Maiia              ╲  │           médicaux
                         ╲ │           génériques
     ─────────────────────●┼──────────────────────► Technologie IA
                           │╲
                           │ ╲
                           │  ╲  ● Herboristeries
                           │   ╲   en ligne
                           │    ╲
                           │     ● Apps bien-être
                           │
```

### Comparatif
| Critère | IntergIA | Logiciels médicaux | Apps bien-être |
|---------|----------|-------------------|----------------|
| Expertise endobiogénie | ✅ Profonde | ❌ Aucune | ❌ Aucune |
| IA diagnostic | ✅ GPT-4o + RAG | ❌ Basique | ⚠️ Générique |
| Base de connaissances | ✅ 4 volumes Lapraz | ❌ Générique | ❌ Non validée |
| Ordonnances structurées | ✅ 3 volets | ⚠️ Texte libre | ❌ Non |
| Prix | 99€/mois | 150-300€/mois | 10-30€/mois |

### Avantages compétitifs durables
1. **First mover** en IA endobiogénique
2. **Base RAG propriétaire** (4 volumes non disponibles ailleurs)
3. **Algorithmes de scoring** développés avec experts
4. **Partenariats académiques** (formations endobiogénie)

---

# SLIDE 10 - TRACTION

## 📈 Métriques actuelles

### Statut produit
```
✅ MVP Fonctionnel
✅ 20+ modules développés
✅ Base RAG 4 volumes indexée
✅ Moteur IA hybride opérationnel
✅ Tests internes validés
```

### Roadmap technique réalisée
| Fonctionnalité | Statut |
|----------------|--------|
| Gestion patients | ✅ 100% |
| Analyse BdF (8 index) | ✅ 100% |
| Interrogatoire (8 axes) | ✅ 100% |
| Synthèse IA unifiée | ✅ 100% |
| Ordonnances 3 volets | ✅ 100% |
| RAG hybride | ✅ 100% |
| Chat IA contextuel | ✅ 100% |
| Export PDF | 🔄 60% |
| Mobile responsive | 🔄 40% |
| Multi-praticien | 📅 Planifié |

### Prochaines étapes
| Milestone | Timeline | Objectif |
|-----------|----------|----------|
| Beta privée | M+1 | 10 praticiens testeurs |
| Beta publique | M+3 | 50 utilisateurs |
| Lancement commercial | M+6 | 100 clients payants |
| Expansion Belgique/Suisse | M+12 | 200 clients |

---

# SLIDE 11 - ÉQUIPE

## 👥 Fondateurs & Expertise

### Équipe fondatrice
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [Photo]              [Photo]              [Photo]             │
│                                                                │
│  Dr. [Nom]            [Nom]                [Nom]               │
│  CEO                  CTO                  CMO                 │
│                                                                │
│  • 15 ans médecine    • 10 ans dev        • 8 ans marketing   │
│    intégrative        • Ex-[Startup]      • Ex-[Pharma]       │
│  • Formé Lapraz       • Expert IA/ML      • Réseau phyto      │
│  • 2000+ patients     • Full-stack        • Growth hacking    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Advisors
| Nom | Expertise | Apport |
|-----|-----------|--------|
| Dr. [Expert] | Formation endobiogénie | Validation scientifique |
| [Investisseur] | HealthTech | Stratégie croissance |
| [Pharmacien] | Distribution phyto | Accès marché |

### Recrutements prévus (12 mois)
- 1 Développeur Full-stack senior
- 1 Data Scientist / ML Engineer
- 1 Customer Success Manager
- 1 Commercial terrain

---

# SLIDE 12 - DEMANDE DE FINANCEMENT

## 💶 Levée de fonds Seed

### Montant recherché
```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                      500 000 €                               ║
║                    Seed Round                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Utilisation des fonds
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ████████████████████░░░░░░░░░░░░░░░░  Produit (40%)       │
│  200K€ - 2 devs + infra + IA                               │
│                                                             │
│  ██████████████░░░░░░░░░░░░░░░░░░░░░░  Commercial (30%)    │
│  150K€ - 2 commerciaux + marketing                         │
│                                                             │
│  ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░  Opérations (20%)    │
│  100K€ - Support + juridique + certifications              │
│                                                             │
│  █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Réserve (10%)       │
│  50K€ - Trésorerie                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Milestones avec ce financement
| KPI | Actuel | M+12 | M+24 |
|-----|--------|------|------|
| MRR | 0€ | 20K€ | 60K€ |
| Clients payants | 0 | 200 | 500 |
| Équipe | 2 | 6 | 10 |
| Pays | 1 | 3 | 5 |

### Valorisation & Terms
- **Pre-money**: 2M€
- **Dilution**: 20%
- **Instruments**: Equity ou BSA-AIR
- **Investisseurs cibles**: Business Angels HealthTech, Fonds Seed

---

# SLIDE 13 - VISION

## 🚀 Notre ambition

### Vision 2030
> **"Rendre accessible l'expertise endobiogénique à chaque praticien de santé intégrative dans le monde"**

### Roadmap produit
```
2024                2025                2026                2027
──────────────────────────────────────────────────────────────────►

  🇫🇷                 🇧🇪🇨🇭              🇪🇺                 🌍
  France             Belgique           Europe              Global
                     Suisse             Allemagne
                     Luxembourg         Italie

  MVP ────► V1.0 ────► V2.0 ────► V3.0 ────► V4.0

  • BdF              • API              • IA Diagnostic     • Téléconsultation
  • Ordonnances      • Mobile           • Prédictif         • Patient portal
  • RAG              • Multi-langue     • Intégrations      • Marketplace
                                        • EHR               • Formation IA
```

### Impact social
- 🌱 **Démocratiser** la médecine intégrative de qualité
- 👨‍⚕️ **Augmenter** les praticiens (pas les remplacer)
- 📚 **Préserver** le savoir endobiogénique (Lapraz 80+ ans)
- 🌍 **Réduire** la dépendance aux médicaments chimiques

---

# SLIDE 14 - CALL TO ACTION

## 📞 Rejoignez l'aventure

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                    🧬 IntergIA                                   ║
║                                                                  ║
║     L'IA qui démocratise la médecine endobiogénique             ║
║                                                                  ║
║  ────────────────────────────────────────────────────────────   ║
║                                                                  ║
║     📧 contact@intergia.fr                                       ║
║     🌐 www.intergia.fr                                           ║
║     📱 +33 6 XX XX XX XX                                         ║
║                                                                  ║
║  ────────────────────────────────────────────────────────────   ║
║                                                                  ║
║     🎯 Nous recherchons:                                         ║
║        • Investisseurs Seed (500K€)                             ║
║        • Praticiens beta-testeurs                               ║
║        • Partenaires académiques                                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### Pourquoi maintenant?
1. ✅ **Produit prêt** - MVP fonctionnel
2. ✅ **Timing parfait** - IA + demande médecine naturelle
3. ✅ **Équipe complète** - Tech + Médical + Business
4. ✅ **Marché mûr** - Praticiens en demande d'outils

### Prochaines étapes
```
Semaine 1: Call découverte (30 min)
Semaine 2: Démo produit live
Semaine 3: Due diligence
Semaine 4: Term sheet
```

---

# ANNEXES

## A1 - Glossaire Endobiogénie

| Terme | Définition |
|-------|------------|
| **Endobiogénie** | Médecine intégrative basée sur l'équilibre neuroendocrinien |
| **BdF** | Biologie des Fonctions - 8 index calculés depuis la biologie standard |
| **Terrain** | Prédisposition individuelle (Alpha, Beta, Gamma, Delta) |
| **Axe** | Système hormonal (Corticotrope, Thyréotrope, Gonadotrope, Somatotrope) |
| **Drainage** | Préparation des émonctoires avant traitement de fond |
| **Émonctoire** | Organe d'élimination (Foie, Reins, Intestins, Poumons, Peau) |
| **Spasmophilie** | Terrain d'hyperexcitabilité neuromusculaire |

## A2 - Stack technique détaillé

```
Frontend:        Next.js 15, React 19, TypeScript, Tailwind CSS
Backend:         Next.js API Routes, Server Actions
Database:        PostgreSQL 14, Prisma ORM 6.1
Authentication:  NextAuth 5.0, bcrypt
AI/ML:           OpenAI GPT-4o, Embeddings, File Search
Vectorstores:    OpenAI Assistants API (4 bases)
Deployment:      Vercel (frontend), Railway/Supabase (DB)
Monitoring:      Vercel Analytics, Sentry
```

## A3 - Références scientifiques

1. Lapraz JC, Hedayat KM. **Endobiogeny & Medicine** (4 volumes)
2. Duraffourd C, Lapraz JC. **Traité de Phytothérapie Clinique**
3. Hedayat KM. **The Theory of Endobiogeny** (Academic Press, 2019)

---

*Document confidentiel - IntergIA © 2024*
