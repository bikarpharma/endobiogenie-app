# Module BdF - Biologie des Fonctions

## Vue d'ensemble

Module complet pour l'analyse biologique fonctionnelle selon la méthodologie de Lapraz (Endobiogénie). Comprend la saisie, le calcul et l'affichage visuel des 7 axes physiologiques.

## Composants

### 1. BdfInputForm.tsx
Formulaire de saisie dynamique des biomarqueurs avec cas de test pré-configurés.

### 2. BdfResultsView.tsx
Affichage visuel des résultats sous forme de 7 panels physiologiques colorés.

## Localisation

- **Composants**: `components/bdf/BdfInputForm.tsx` + `BdfResultsView.tsx`
- **Page de démo**: `app/bdf-demo/page.tsx`
- **URL de test**: `http://localhost:3000/bdf-demo`

## Fonctionnalités du Module

### 1. Saisie des Biomarqueurs (BdfInputForm)
- ✅ Génération automatique depuis `BIOMARKERS` config
- ✅ Organisation par catégories médicales (6 sections colorées)
- ✅ **3 cas de test pré-configurés** (boutons de pré-remplissage)
- ✅ Inputs numériques avec unités affichées
- ✅ Bouton de réinitialisation

### 2. Calcul des Index (Moteur)
- ✅ Utilise `calculateAllIndexes()` avec formules de Lapraz
- ✅ Calcul de 9 index fondamentaux
- ✅ Gestion des dépendances entre index (récursif)
- ✅ Détection des biomarqueurs manquants

### 3. Affichage Visuel (BdfResultsView)
- ✅ **7 Panels Physiologiques** avec couleurs distinctes
- ✅ En-têtes colorés avec description de l'axe
- ✅ Valeurs formatées et barres visuelles
- ✅ Affichage de la formule pour chaque index
- ✅ Alertes pour biomarqueurs manquants
- ✅ Section "Interprétation" avec aide clinique

### 4. UX/UI
- Grille responsive (1/2/3 colonnes selon écran)
- Couleurs médicales par catégorie et par panel
- État vide avec message explicatif
- Accordéon pour JSON brut (debug)

## Données de Test

### Patient Type 1 - Profil Hypothyroïdie + Stress
```
Hématologie:
- NEUT: 3.5 G/L
- LYMPH: 2.8 G/L
- EOS: 0.15 G/L
- HB: 12.5 g/dL
- HCT: 38 %

Ionogramme:
- NA: 138 mmol/L
- K: 4.2 mmol/L

Enzymes:
- LDH: 180 U/L
- CPK: 220 U/L

Hormones:
- TSH: 4.5
```

**Résultats attendus**:
- Index Génital (NEUT/LYMPH): ~1.25 → Parasympathique dominant
- Index d'Adaptation: ~18.67 → Stress chronique
- Rendement Thyroïdien: ~0.18 → Hypothyroïdie périphérique

### Patient Type 2 - Profil Sympathique + Inflammation
```
Hématologie:
- NEUT: 6.5 G/L
- LYMPH: 1.8 G/L
- EOS: 0.08 G/L
- HB: 15.2 g/dL
- HCT: 45 %

Ionogramme:
- NA: 142 mmol/L
- K: 3.8 mmol/L

Enzymes:
- LDH: 240 U/L
- CPK: 150 U/L

Hormones:
- TSH: 1.2
```

**Résultats attendus**:
- Index Génital (NEUT/LYMPH): ~3.61 → Sympathique dominant
- Index d'Adaptation: ~22.5 → Stress
- Rendement Thyroïdien: ~1.33 → Hyperthyroïdie

## Structure du Code

```typescript
// 1. Groupement par catégories
const categories = ["hematology", "ion", "enzyme", "hormone", "bone", "tumor"];

// 2. Boucle sur chaque catégorie
{categories.map(cat => {
  const biomarkersInCategory = BIOMARKERS.filter(b => b.category === cat);

  // 3. Génération des inputs
  return biomarkersInCategory.map(bio => (
    <input {...register(bio.id)} type="number" />
  ));
})}

// 4. Calcul au submit
const onSubmit = (data) => {
  const cleanData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v ? Number(v) : null])
  );
  const res = calculateAllIndexes(cleanData);
  setResults(res);
};
```

## Catégories et Couleurs

| Catégorie | Label | Couleur |
|-----------|-------|---------|
| hematology | Hématologie (NFS) | Rouge |
| ion | Ionogramme | Bleu |
| enzyme | Enzymes | Ambre |
| hormone | Hormones | Violet |
| bone | Métabolisme Osseux | Vert émeraude |
| tumor | Marqueurs Tumoraux | Rose |

## Intégration

Pour utiliser ce composant ailleurs:

```tsx
import BdfInputForm from "@/components/bdf/BdfInputForm";

export default function MaPage() {
  return <BdfInputForm />;
}
```

## Debug

Le composant affiche 3 niveaux d'information:

1. **Résumé**: Nombre d'index calculés et biomarqueurs utilisés
2. **Index**: Liste des 9 index avec valeurs et biomarqueurs manquants
3. **JSON brut**: Structure complète retournée par `calculateAllIndexes()` (replié par défaut)

## Prochaines Étapes

- [ ] Ajouter validation des valeurs (min/max selon références biologiques)
- [ ] Intégrer les seuils de référence (low/normal/high)
- [ ] Connecter à la base de données (sauvegarde)
- [ ] Afficher les 7 panels de Lapraz avec graphiques
- [ ] Export PDF des résultats
