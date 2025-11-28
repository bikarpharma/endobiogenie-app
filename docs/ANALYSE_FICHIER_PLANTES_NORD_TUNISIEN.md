# Rapport d'Analyse - PLANTES_NORD_TUNISIEN_COMPLET_ARABE.xlsx

**Date d'analyse** : 28/11/2025
**Fichier source** : `RAG/plante TN/PLANTES_NORD_TUNISIEN_COMPLET_ARABE (1).xlsx`
**Objectif** : Évaluer la qualité des données pour import dans le module Phytodex

---

## 1. Vue d'ensemble

| Métrique | Valeur |
|----------|--------|
| **Total plantes** | 373 |
| **Feuilles Excel** | 1 |
| **Colonnes** | 6 |
| **Taille fichier** | 46 KB |

### Structure des colonnes

| # | Colonne | Type | Remplissage |
|---|---------|------|-------------|
| 1 | N° | Numérique | 100% |
| 2 | Nom scientifique | Texte | 99% (371/373) |
| 3 | Nom français | Texte | 92% (343/373) |
| 4 | Nom vernaculaire | Texte (arabe) | 79% (293/373) |
| 5 | Drogue | Texte | 82% (304/373) |
| 6 | Utilisations | Texte long | 96% (357/373) |

---

## 2. Analyse de la mise en forme

### ✅ Points positifs

1. **Structure simple et claire** - 6 colonnes bien définies
2. **Numérotation séquentielle** - 100% complète
3. **Noms scientifiques** - Format binomial correct (99.5%)
4. **Noms vernaculaires arabes** - 281/373 avec caractères arabes
5. **Pas de doublons** dans les noms scientifiques

### ✅ Taux de remplissage visuel

```
Numero               [####################] 100%
Nom_scientifique     [###################.] 99%
Nom_francais         [##################..] 92%
Utilisations         [###################.] 96%
Drogue               [################....] 82%  ← À compléter
Nom_vernaculaire     [###############.....] 79%  ← À compléter
```

### ❌ Problèmes identifiés

| Problème | Impact | Quantité |
|----------|--------|----------|
| Plantes sans "Drogue" (partie utilisée) | Modéré | 69 |
| Plantes sans nom vernaculaire | Faible | 80 |
| Plantes sans utilisations | Modéré | 16 |
| Auteurs botaniques absents | Faible | 371/373 |
| Familles botaniques absentes | Élevé | 373/373 |

---

## 3. Analyse du contenu scientifique

### Catégories thérapeutiques détectées

| Catégorie | Occurrences | Barre |
|-----------|-------------|-------|
| Digestif | 89 | ████████████████████████████░ |
| Anti-inflammatoire | 83 | ██████████████████████████░░ |
| Antibactérien | 76 | ████████████████████████░░░░ |
| Douleur/Analgésique | 69 | ██████████████████████░░░░░░ |
| Médicinal général | 67 | █████████████████████░░░░░░░ |
| Respiratoire | 51 | █████████████████░░░░░░░░░░░ |
| Dermatologique | 49 | ████████████████░░░░░░░░░░░░ |
| Diurétique | 37 | ████████████░░░░░░░░░░░░░░░░ |
| Toxique | 32 | ██████████░░░░░░░░░░░░░░░░░░ |
| Alimentaire | 27 | █████████░░░░░░░░░░░░░░░░░░░ |
| Nerveux/Calmant | 14 | ████░░░░░░░░░░░░░░░░░░░░░░░░ |
| Cosmétique | 11 | ███░░░░░░░░░░░░░░░░░░░░░░░░░ |

### Parties utilisées (Drogue) - Top 15

| Partie | Fréquence |
|--------|-----------|
| Feuille | 37 |
| Partie aérienne | 16 |
| Racine | 15 |
| Graine | 14 |
| Plante | 11 |
| Plante entière | 10 |
| Fleur | 9 |
| Sommité fleurie | 8 |
| Bulbe | 7 |
| Rhizome | 6 |
| Fruit | 6 |
| Feuille, Bourgeon | 5 |
| Sommités fleuries | 5 |
| Herbe | 4 |
| Feuille, Fleur | 4 |

### Plantes toxiques identifiées (29)

Exemples :
- *Anagallis arvensis*
- *Anagallis Monelli*
- *Arisarum vulgare*
- *Asparagus acutifolius*
- *Atractylis gummifera*
- *Atropa belladonna*
- *Bryonia dioica*
- *Calendula arvensis*
- ...

---

## 4. Analyse bibliographique

### ❌ LACUNE MAJEURE : Absence de références

| Critère | Statut |
|---------|--------|
| Citations scientifiques | ❌ Aucune |
| Auteurs cités | ❌ Aucun |
| Années de publication | ❌ 1 seule (1915) |
| Niveau de preuve (EBM) | ❌ Non indiqué |
| DOI / ISBN | ❌ Absents |

### Conséquence

Les informations d'usage sont probablement issues de :
- Tradition orale
- Enquêtes ethnobotaniques locales
- Compilation non sourcée

**→ Niveau de preuve par défaut : TRADITION_ONLY**

---

## 5. Champs absents vs standard pharmacognosie

| Champ standard | Présent ? | Priorité ajout |
|----------------|-----------|----------------|
| Famille botanique | ❌ | **HAUTE** |
| Composition chimique | ❌ | Moyenne |
| Posologie / doses | ❌ | Moyenne |
| Contre-indications | ❌ | **HAUTE** |
| Interactions médicamenteuses | ❌ | Moyenne |
| Niveau de preuve (EBM) | ❌ | **HAUTE** |
| Références bibliographiques | ❌ | **HAUTE** |
| Photos / illustrations | ❌ | Basse |
| Statut conservation (IUCN) | ❌ | Basse |
| Réglementation (AMM) | ❌ | Basse |

---

## 6. Exemples de données complètes

### Plante 1 : Acacia dealbata
```
Nom français    : Mimosa
Nom vernaculaire: Acacia (أكاسيا)
Drogue          : Fleurs
Utilisations    : L'essence extraite de la plante à une action antiseptique
                  et astringente. L'absolue de mimosa est très recherchée
                  par les grands parfumeurs. Pour la conception d'eau de toilettes.
```

### Plante 2 : Achillea millefolium
```
Nom français    : Achillée millefeuille
Nom vernaculaire: Akhilia (أخيليا) (feuille poilue)
Drogue          : Sommité fleurie
Utilisations    : Lutéotrope (stimule la progestérone). Anti-inflammatoire
                  salicylé. Antinévralgique, cicatrisant (huile). Anti infectieux
                  génito-urinaire. Décongestionnante pelvienne. Veinotonique.
                  Antihémorragique...
```

### Plante 3 : Ajuga iva
```
Nom français    : Bugle-ivette
Nom vernaculaire: Chandgoura (شندقورة)
Drogue          : Partie aérienne
Utilisations    : Anti-inflammatoire. Antidiabétique. Antalgique. Antispasmodique.
                  Hypoglycémiant. Cicatrisant (externe). Hypotenseur.
```

---

## 7. Recommandations pour import Phytodex

### Phase 1 : Import initial (373 plantes)
- [x] Nom scientifique → `latinName`
- [x] Nom français → `mainVernacularName`
- [x] Nom arabe → **Nouveau champ à créer**
- [x] Drogue → `usualForms` (partie utilisée)
- [x] Utilisations → `mainIndications`
- [x] Région → "Nord Tunisie" (par défaut)

### Phase 2 : Enrichissement progressif
- [ ] Ajouter les familles botaniques
- [ ] Ajouter les contre-indications pour plantes toxiques
- [ ] Catégoriser les indications (Digestif, Respiratoire, etc.)
- [ ] Ajouter les références bibliographiques

### Phase 3 : Validation scientifique
- [ ] Vérifier nomenclature sur IPNI/The Plant List
- [ ] Croiser avec bases pharmacopée (EMA, OMS)
- [ ] Attribuer niveaux de preuve

---

## 8. Mapping pour import

| Excel | Phytodex (Prisma) | Transformation |
|-------|-------------------|----------------|
| N° | (ignoré) | - |
| Nom scientifique | `latinName` | Trim |
| Nom français | `mainVernacularName` | Trim |
| Nom vernaculaire | `arabicName` (nouveau) | Extraire arabe |
| Drogue | `usualForms` | Trim |
| Utilisations | `mainIndications` | Trim |
| - | `region` | "Nord Tunisie" |
| - | `evidenceLevel` | TRADITION_ONLY |

---

*Document généré automatiquement - IntegrIA / Phytodex*
