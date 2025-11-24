# Module Synthèse Clinique

## Vue d'ensemble

Module de fusion clinique qui croise les données de l'**Interrogatoire endobiogénique** (symptômes subjectifs) avec les **résultats BdF** (biologie fonctionnelle objective) pour aider le praticien à prendre une décision thérapeutique éclairée.

## Composants

### ClinicalSynthesisView.tsx

Composant principal qui affiche une vue en 3 zones :

1. **Colonne Gauche (Orange) - "La Plainte"**
   - Top 3 des axes cliniques avec les scores les plus élevés
   - Tags cliniques détectés par l'analyse de l'interrogatoire
   - Orientations diagnostiques (si interprétations IA disponibles)

2. **Colonne Droite (Bleue) - "La Preuve"**
   - Index BdF hors normes (status HIGH ou LOW)
   - Mini-aperçu des 7 panels avec alertes visuelles
   - Interprétations biologiques fonctionnelles

3. **Zone Centrale (Gris foncé) - "L'Intelligence"**
   - Bouton de génération de synthèse IA
   - Statistiques rapides (axes analysés, anomalies, biomarqueurs)
   - Interface pour future intégration GPT-4

## Localisation

- **Composant** : `components/synthese/ClinicalSynthesisView.tsx`
- **Page de démo** : `app/synthese-demo/page.tsx`
- **Page réelle** : `app/(patient)/[id]/synthese/page.tsx`
- **URL de test (démo)** : `http://localhost:3006/synthese-demo`
- **URL réelle** : `http://localhost:3006/[patient-id]/synthese`

## Props du Composant

```typescript
interface ClinicalSynthesisViewProps {
  // Scores calculés des axes de l'interrogatoire
  axeScores?: Array<{
    axe: AxeType;
    score: number;
    status: "critical" | "warning" | "normal";
  }>;

  // Interprétations IA des axes (optionnel)
  axeInterpretations?: AxeInterpretation[];

  // Résultats BdF
  bdfData?: BdfResult | null;

  // Callback pour génération IA
  onGenerateSynthesis?: () => void;
}
```

## Fonctionnalités Implémentées

### ✅ Phase 1 : Affichage et Fusion Visuelle

- [x] Grille 2 colonnes responsive (Interrogatoire + BdF)
- [x] Top 3 des axes cliniques prioritaires
- [x] Affichage des index BdF hors normes
- [x] Badges colorés par statut (critical/warning/normal)
- [x] Mini-aperçu des 7 panels BdF
- [x] Zone IA avec statistiques et bouton d'action
- [x] États vides avec messages explicatifs
- [x] Guide d'utilisation intégré

### 🔄 Phase 2 : Intelligence Artificielle (À venir)

- [ ] Intégration API GPT-4 pour analyse croisée
- [ ] Génération automatique de synthèse narrative
- [ ] Détection des concordances/discordances clinico-biologiques
- [ ] Proposition d'ordonnance endobiogénique
- [ ] Export PDF de la synthèse

### 🔄 Phase 3 : Intégration Complète (À venir)

- [ ] Connexion avec la base de données patient réelle
- [ ] Historique des synthèses par patient
- [ ] Comparaison avant/après traitement
- [ ] Validation et signature électronique

## Données de Test

La page de démo utilise des données mockées représentant un cas clinique réaliste :

**Patient simulé** : Profil d'épuisement surrénalien + hypothyroïdie périphérique

- **Interrogatoire** :
  - Axe Adaptatif : 85% (CRITIQUE - épuisement)
  - Axe Thyroïdien : 65% (WARNING - hypothyroïdie)
  - Axe Neurovégétatif : 55% (WARNING - sympathique dominant)

- **Biologie (BdF)** :
  - Index Génital : 3.2 (HAUT - sympathique)
  - Index d'Adaptation : 18 (HAUT - insuffisance surrénalienne)
  - Rendement Thyroïdien : 0.3 (BAS - hypothyroïdie périphérique)

→ **Cohérence parfaite** entre symptômes et biologie !

## Utilisation dans l'Application

### En mode démo (standalone)

```bash
# Accéder à la page de démo
http://localhost:3006/synthese-demo
```

### En mode intégré (avec patient réel)

La page `app/(patient)/[id]/synthese/page.tsx` gère automatiquement :

1. **Récupération des données Prisma** :
   - Patient (nom, prénom, interrogatoire)
   - Dernière analyse BdF (biomarqueurs bruts)
   - Interprétations d'axes déjà générées par l'IA

2. **Calcul en temps réel** :
   - Recalcule les index BdF avec `calculateAllIndexes()`
   - Convertit les interprétations au bon format

3. **Sécurité** :
   - Vérifie l'authentification
   - Vérifie que le patient appartient à l'utilisateur

4. **Feedback utilisateur** :
   - Badges d'état (données complètes/manquantes)
   - Alertes avec liens pour compléter les données
   - Date de dernière analyse BdF

**Accès direct** : `http://localhost:3006/[patient-id]/synthese`

## Flux de Travail Clinique

1. **Praticien** remplit l'interrogatoire endobiogénique → Scores des 9 axes calculés
2. **Praticien** saisit les biomarqueurs du patient → Index BdF calculés (9 index)
3. **Praticien** accède à la page Synthèse → Vue croisée Clinique × Biologie
4. **Praticien** clique sur "Générer la synthèse" → IA analyse et propose (Phase 2)
5. **Praticien** valide/ajuste l'ordonnance → Export et signature (Phase 3)

## Architecture des Données

### Interrogatoire → Scores d'Axes

```typescript
// Calcul automatique des scores basé sur les réponses
{
  axe: "adaptatif",
  score: 85,  // 0-100
  status: "critical"  // critical > 70, warning > 40, normal ≤ 40
}
```

### BdF → Index Fonctionnels

```typescript
// Calculé par calculateAllIndexes()
{
  idx_adaptation: {
    value: 18,
    status: "high",  // Comparé aux seuils de référence Lapraz
    interpretation: "Insuffisance surrénalienne"
  }
}
```

### Synthèse IA (Phase 2)

```typescript
// Généré par GPT-4 en analysant les 2 sources
{
  concordance: "Excellente cohérence clinico-biologique",
  mecanismesPhysiopath: ["Épuisement surrénalien", "Hypothyroïdie type 2"],
  orientationTherapeutique: "Support adaptogène + thyroïde",
  propositionOrdonnance: {
    plantes: [...],
    posologie: [...],
    duree: "3 mois"
  }
}
```

## Design System

### Couleurs par Section

- **Interrogatoire (Clinique)** : Orange (#F97316)
  - Border: `border-orange-300`
  - Background: `from-orange-500 to-orange-600`

- **BdF (Biologie)** : Bleu (#3B82F6)
  - Border: `border-blue-300`
  - Background: `from-blue-500 to-blue-600`

- **IA (Intelligence)** : Slate foncé (#0F172A)
  - Background: `from-slate-900 via-slate-800`
  - Effets : Blur gradients bleu/purple

### Badges de Statut

- **Critical** : Rouge `bg-red-100 text-red-700`
- **Warning** : Orange `bg-orange-100 text-orange-700`
- **Normal** : Vert `bg-green-100 text-green-700`

## Notes Techniques

- **Responsive** : Grid 1 colonne sur mobile, 2 colonnes sur large écran
- **Performance** : Composant client-side (`"use client"`) pour interactivité
- **Type-safe** : Tous les types importés depuis `lib/`
- **Extensible** : Props optionnelles pour intégration progressive

## Prochaines Étapes

1. **Implémenter l'API /api/synthese/generate**
   - Endpoint POST qui reçoit interrogatoire + BdF
   - Appelle GPT-4 avec prompt spécialisé
   - Retourne synthèse structurée

2. **Créer le composant SynthesisResultDisplay**
   - Affiche la synthèse générée par l'IA
   - Sections : Concordance, Mécanismes, Thérapie, Ordonnance
   - Boutons : Éditer, Valider, Exporter PDF

3. **Intégrer dans le flow patient réel**
   - Ajouter onglet "Synthèse" dans les pages patient
   - Récupérer données depuis Prisma
   - Sauvegarder synthèses générées

## Références

- **Méthodologie** : Endobiogénie selon Lapraz & Duraffourd
- **Index BdF** : Configuration dans `lib/bdf/indexes/indexes.config.ts`
- **Axes Cliniques** : Définis dans `lib/interrogatoire/axeInterpretation.ts`
