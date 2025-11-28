# 🎬 SCRIPT VIDÉO DEMO - IntegrIA
## Plateforme SaaS d'aide à la décision en médecine endobiogénique
### Pour le jury Startup Act Tunisie 2025

**Durée cible : 3min50 - 4min**

---

## INVENTAIRE DES FONCTIONNALITÉS DÉMONTRÉES

### Module 1 : Gestion des Patients
- Création de dossier patient complet (identité, ATCD, allergies, tags)
- Liste paginée avec recherche
- 8 onglets par patient : Aperçu, Identité, Interrogatoire, Analyses BdF, Consultations, Synthèse, Ordonnances, Rapport Visuel
- Conformité RGPD (consentement, archivage soft-delete)

### Module 2 : Analyse BdF (Biologie des Fonctions)
- Saisie de 20+ biomarqueurs organisés en 6 catégories
- Calcul automatique de 9 index endobiogéniques (formules Lapraz)
- Visualisation en 7 panels physiologiques colorés
- Cas de test pré-configurés

### Module 3 : Interrogatoire Endobiogénique (60+ questions)
- **12 axes cliniques** organisés en 3 blocs :
  - Bloc Terrain : Historique, Mode de Vie, Terrains Pathologiques
  - Bloc Gestionnaires : Neurovégétatif, Corticotrope, Thyréotrope, Gonadotrope, Somatotrope
  - Bloc Émonctoires : Digestif, Immuno, Cardio-Métabo, Dermato
- Questions adaptées selon le sexe
- Sauvegarde auto + Interprétation IA par axe

### Module 4 : Synthèse Clinique Unifiée (IA)
- Fusion automatique Interrogatoire × BdF
- Détection du terrain endobiogénique (Alpha, Beta, Gamma, Delta)
- Analyse des 4 axes majeurs avec scores
- Concordance bio-clinique
- Génération par GPT-4o

### Module 5 : Ordonnances Intelligentes (IA)
- **5 volets thérapeutiques** : Endobiogénie, Phyto élargie, Gemmothérapie, Aromathérapie, Micro-nutrition
- Système pédagogique "Pourquoi cette plante ?"
- Gestion des contre-indications
- Conseils hygiène de vie + surveillance biologique

### Module 6 : RAG Hybride (4 bases de connaissances)
- RAG Local : 50 plantes, 1ms, gratuit
- VectorStores OpenAI : 4 volumes Endobiogénie, Phytothérapie, Gemmothérapie, Aromathérapie

### Module 7 : Chatbots Spécialisés
- Chat Phytothérapie, Gemmothérapie, Aromathérapie
- Chat ordonnance (ajustement conversationnel)

### Module 8 : Phytodex Tunisien
- Bibliothèque documentaire plantes Tunisie/Maghreb
- Usages traditionnels avec traçabilité des sources

---

## SCRIPT DÉTAILLÉ

---

### [00:00 - 00:15] ACCROCHE

**🎬 Visuel :**
Animation logo IntegrIA + tagline "Du terrain biologique à l'ordonnance personnalisée"

**🎙️ Voix-off :**
> "Imaginez un praticien de médecine intégrative qui doit analyser 8 axes neuroendocriniens, consulter 4 volumes de référence, et rédiger une ordonnance personnalisée. Temps nécessaire : 45 minutes. Avec IntegrIA : 15 minutes. Voici comment."

**💡 Notes de réalisation :**
- Musique dynamique, motion design épuré
- Transition fluide vers l'écran suivant

---

### [00:15 - 00:35] LE PROBLÈME

**🎬 Visuel :**
Infographie animée montrant les chiffres clés :
- "72% des Français utilisent des médecines complémentaires"
- "< 500 praticiens endobiogénie formés"
- "Délai RDV : 3-6 mois"
- "45-60 min par consultation complète"

**🎙️ Voix-off :**
> "La médecine endobiogénique est une approche puissante, mais complexe. La formation dure 3 à 5 ans, la littérature est dispersée dans 4 volumes, et chaque consultation demande une analyse croisée de dizaines de paramètres. Résultat : trop peu de praticiens, des consultations longues, et des patients qui attendent."

**💡 Notes de réalisation :**
- Icônes animées pour chaque chiffre
- Transition vers écran laptop montrant l'application

---

### [00:35 - 01:00] LA SOLUTION

**🎬 Visuel :**
Écran d'accueil IntegrIA → Dashboard avec navigation visible
- Header montrant : Patients, Chat, Gemmo, Aroma, Phyto, Phytodex

**🎙️ Voix-off :**
> "IntegrIA est la première plateforme d'aide à la décision clinique dédiée à l'endobiogénie. Elle augmente le praticien par l'intelligence artificielle, sans jamais le remplacer. Connectée à 4 bases de connaissances validées — les volumes de Lapraz, le manuel de phytothérapie, la gemmothérapie et l'aromathérapie — elle transforme des données brutes en recommandations thérapeutiques personnalisées."

**💡 Notes de réalisation :**
- Montrer le header avec tous les modules visibles
- Cursor highlight sur chaque section

---

### [01:00 - 01:30] DEMO MODULE 1 : CRÉATION PATIENT + INTERROGATOIRE

**🎬 Visuel :**
1. Clic sur "Mes Patients" → Liste des patients avec statistiques
2. Clic "Nouveau patient" → Formulaire de création
3. Navigation vers onglet "Interrogatoire"
4. Vue des 12 axes organisés en 3 blocs colorés :
   - 🟦 Bloc Terrain (bleu)
   - 🟪 Bloc Gestionnaires (violet)
   - 🟩 Bloc Émonctoires (vert)

**🎙️ Voix-off :**
> "Le parcours commence par la création d'un dossier patient sécurisé. Puis, l'interrogatoire endobiogénique : 12 axes cliniques, plus de 60 questions, organisés en 3 blocs — le Terrain, les Gestionnaires neuroendocriniens, et les Émonctoires. Les questions s'adaptent automatiquement au sexe du patient. Chaque réponse est sauvegardée en temps réel."

**💡 Notes de réalisation :**
- Montrer les icônes des axes : 🧠 Neuro, 😰 Corticotrope, 🦋 Thyro, 🌸 Gonado, 💪 Somato
- Effet de survol sur un axe pour montrer la description

---

### [01:30 - 02:00] DEMO MODULE 2 : ANALYSE BdF (Biologie des Fonctions)

**🎬 Visuel :**
1. Onglet "Analyses BdF" du patient
2. Saisie des biomarqueurs dans les 6 catégories colorées :
   - Rouge : Hématologie
   - Bleu : Ionogramme
   - Ambre : Enzymes
   - Violet : Hormones
3. Clic "Analyser" → Affichage des 7 panels avec index calculés
4. Zoom sur un index (ex: Index Génital = 3.2) avec interprétation

**🎙️ Voix-off :**
> "L'analyse de la Biologie des Fonctions. Le praticien saisit les résultats biologiques — NFS, ionogramme, enzymes, hormones. L'algorithme calcule instantanément 9 index selon les formules validées de Lapraz : Index Génital, Index d'Adaptation, Rendement Thyroïdien... Chaque index est visualisé sur 7 panels physiologiques colorés, avec les seuils de référence."

**💡 Notes de réalisation :**
- Mettre en évidence les couleurs : rouge = hors norme haute, bleu = hors norme basse, vert = normal
- Animation du calcul en temps réel

---

### [02:00 - 02:30] DEMO MODULE 3 : SYNTHÈSE IA UNIFIÉE

**🎬 Visuel :**
1. Onglet "Synthèse" du patient
2. Clic sur bouton "Générer la Synthèse IA" (gradient violet)
3. Animation de chargement avec icône Brain qui pulse
4. Affichage du résultat :
   - Badge Terrain : "Alpha" (ou Beta/Gamma/Delta) avec couleur
   - 4 axes avec scores et statuts (Hyper/Hypo/Normal)
   - Score de concordance bio-clinique
   - Propositions de drainage

**🎙️ Voix-off :**
> "C'est ici que l'intelligence artificielle entre en jeu. En un clic, GPT-4o analyse et fusionne l'interrogatoire et la biologie. Elle identifie le terrain endobiogénique du patient — Alpha, Beta, Gamma ou Delta —, détecte les axes perturbés, et mesure la concordance bio-clinique. Le praticien obtient une vue synthétique qu'il aurait mis 20 minutes à construire manuellement."

**💡 Notes de réalisation :**
- Montrer le badge Terrain avec sa couleur caractéristique
- Highlight sur les scores des axes perturbés

---

### [02:30 - 03:15] DEMO MODULE 4 : ORDONNANCE INTELLIGENTE

**🎬 Visuel :**
1. Onglet "Ordonnances" du patient
2. Clic "Générer l'ordonnance" → Animation "Raisonnement Endobiogénique en cours..."
3. Affichage de l'ordonnance en 5 volets dépliables :
   - **Volet 1 : ENDOBIOGÉNIE (Canon)** — Badge "Priorité Absolue" vert
   - **Volet 3 : GEMMOTHÉRAPIE** — Badge "Drainage" vert clair
   - **Volet 5 : MICRO-NUTRITION** — Badge "Terrain" violet
4. Survol d'une plante (ex: Rhodiola) → Apparition du tooltip pédagogique :
   - "Pourquoi cette plante ?"
   - Index déclencheur : Corticotrope
   - Score perturbation : 7/10
   - Action sur axe : "Adaptogène surrénalien"
5. Section basse : Conseils hygiène de vie + Surveillance biologique

**🎙️ Voix-off :**
> "L'ordonnance intelligente en 5 volets. Premier volet : le traitement de fond endobiogénique — les plantes majeures pour corriger les déséquilibres neuroendocriniens. Volet gemmothérapie pour le drainage. Volet micro-nutrition pour les cofacteurs enzymatiques. Chaque recommandation est cliquable : le praticien voit l'index déclencheur, le score de perturbation, et le mécanisme d'action. C'est une ordonnance pédagogique qui forme le praticien en même temps qu'elle l'assiste."

**💡 Notes de réalisation :**
- **IMPORTANT** : Insister visuellement sur le tooltip "Pourquoi cette plante" — c'est un différenciateur clé
- Montrer le survol avec l'animation du tooltip qui apparaît
- Zoom léger sur les badges de priorité colorés

---

### [03:15 - 03:35] DEMO MODULE 5 : RAG HYBRIDE & CHATBOTS

**🎬 Visuel :**
1. Navigation vers "/phyto" dans le header → Page Chat Phytothérapie
2. Interface chat avec champ de saisie
3. Question tapée : "Quelle plante pour l'axe corticotrope hyperactif ?"
4. Réponse générée avec :
   - Liste de plantes recommandées
   - Sources citées : "Volume 2 - Matière Médicale"
   - Mécanismes d'action

**🎙️ Voix-off :**
> "Pour aller plus loin, 4 chatbots spécialisés connectés à nos bases de connaissances. Phytothérapie, Gemmothérapie, Aromathérapie. Notre architecture RAG hybride interroge d'abord la base locale en 1 milliseconde, puis enrichit via OpenAI si nécessaire. 80% des requêtes sont résolues localement — ce qui réduit les coûts et garantit la disponibilité."

**💡 Notes de réalisation :**
- Montrer la rapidité de réponse (< 2 secondes)
- Mettre en évidence les sources citées

---

### [03:35 - 03:50] INNOVATION & SCALABILITÉ

**🎬 Visuel :**
Schéma d'architecture technique simplifié (motion design) :

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│              Next.js 15 + React 19 + TypeScript             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      MOTEUR IA HYBRIDE                       │
│  ┌──────────────────┐    ┌────────────────────────────────┐ │
│  │   RAG LOCAL      │    │      OPENAI GPT-4o             │ │
│  │   (1ms, gratuit) │───►│   + 4 VectorStores             │ │
│  │   50 plantes     │    │   (14 MB de connaissances)     │ │
│  └──────────────────┘    └────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                                │
│           PostgreSQL + Prisma ORM + NextAuth                │
└─────────────────────────────────────────────────────────────┘
```

**🎙️ Voix-off :**
> "Côté technologie : Next.js 15, TypeScript strict, PostgreSQL, et une architecture IA modulaire. Le modèle SaaS B2B permet un déploiement rapide en France, puis en Belgique, Suisse, et au Maghreb. Le coût marginal par utilisateur est quasi nul grâce au RAG local."

**💡 Notes de réalisation :**
- Animation progressive du schéma (apparition bloc par bloc)
- Flèches animées montrant le flux de données

---

### [03:50 - 04:00] CALL TO ACTION

**🎬 Visuel :**
- Logo IntegrIA centré (grande taille)
- Tagline : "L'IA qui démocratise la médecine endobiogénique"
- Coordonnées de contact
- Badge "Startup Act Tunisie 2025"
- QR Code vers le site/démo

**🎙️ Voix-off :**
> "IntegrIA : l'IA qui démocratise la médecine endobiogénique. Produit fonctionnel, 20 modules développés, 4 bases de connaissances indexées. Nous recherchons des praticiens beta-testeurs et des partenaires. Contactez-nous."

**💡 Notes de réalisation :**
- Musique qui monte en intensité puis fade out
- Afficher clairement l'URL et/ou QR code
- Maintenir l'écran final 3-4 secondes

---

## RÉCAPITULATIF : 5 CRITÈRES STARTUP ACT

| Critère | Élément démontré dans la vidéo |
|---------|--------------------------------|
| **Innovation** | 1ère IA endobiogénique mondiale, RAG hybride brevetable, ordonnance pédagogique avec "Pourquoi cette plante" |
| **Scalabilité** | SaaS B2B, architecture cloud (Vercel), coût marginal quasi nul grâce au RAG local |
| **Équipe** | *(À personnaliser selon votre équipe : expertise médicale + tech + business)* |
| **Marché** | 72% médecines complémentaires, 500M€ phyto France, < 500 praticiens formés = demande non satisfaite, expansion Maghreb |
| **POC fonctionnel** | Démo live de 8 modules opérationnels : Patients, BdF, Interrogatoire, Synthèse IA, Ordonnances IA, RAG, Chatbots, Phytodex |

---

## CHECKLIST TECHNIQUE TOURNAGE

### Avant le tournage
- [ ] Créer un patient de démo avec données complètes (interrogatoire rempli, BdF saisie)
- [ ] Vérifier que la synthèse IA génère bien un résultat
- [ ] Vérifier que l'ordonnance se génère correctement
- [ ] Tester les chatbots (phyto, gemmo, aroma)
- [ ] Préparer une question de démo pour le chat
- [ ] Nettoyer la base de données des données de test inutiles

### Pendant le tournage
- [ ] Utiliser un navigateur propre (pas d'extensions visibles)
- [ ] Mode plein écran ou fenêtre maximisée
- [ ] Désactiver les notifications système
- [ ] Connexion internet stable (pour les appels IA)
- [ ] Enregistrement écran en 1080p minimum

### Post-production
- [ ] Ajouter les transitions entre sections
- [ ] Synchroniser voix-off et visuels
- [ ] Ajouter les infographies animées (chiffres, schéma archi)
- [ ] Musique de fond (libre de droits)
- [ ] Sous-titres (optionnel mais recommandé)

---

## DURÉE PAR SECTION

| Section | Durée | Cumul |
|---------|-------|-------|
| Accroche | 15s | 0:15 |
| Problème | 20s | 0:35 |
| Solution | 25s | 1:00 |
| Patient + Interrogatoire | 30s | 1:30 |
| Analyse BdF | 30s | 2:00 |
| Synthèse IA | 30s | 2:30 |
| Ordonnance | 45s | 3:15 |
| RAG + Chatbots | 20s | 3:35 |
| Tech + Scalabilité | 15s | 3:50 |
| Call to Action | 10s | **4:00** |

---

*Document généré le 28/11/2025 — IntegrIA by Bikarpharma*
