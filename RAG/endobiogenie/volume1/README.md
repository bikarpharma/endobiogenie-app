# Chapitre 13 : L'Art de l'Anamnese en Endobiogenie

Extraction structuree du Volume 1 de "La Theorie de l'Endobiogenie" par Kamyar M. Hedayat.

---

## Structure des fichiers

```
volume1/
|-- README.md                     # Ce fichier
|-- chapitre13-anamnese.json      # Export JSON complet pour RAG
|
|-- anamnese/
|   (a creer: questions-cles.md, facteurs-influence.md)
|
|-- phases-vie/
|   |-- phases-recyclage-endocrinien.md   # Les 7 phases de vie
|
|-- terrains/
|   |-- correspondances-symptomes-terrain.md  # TABLE CLE POUR RAG
|   |-- stades-manifestation-maladie.md       # Les 5 stades
|
|-- revue-systemes/
    |-- ros-endobiogenique.md     # ROS enfant et adulte
```

---

## Utilisation RAG

### 1. Interrogatoire Intelligent

Fichier cle: `terrains/correspondances-symptomes-terrain.md`

Pour chaque symptome de l'interrogatoire:
1. Rechercher correspondance dans le fichier
2. Identifier le(s) axe(s) implique(s)
3. Suggerer terrain endobiogenique probable
4. Orienter vers traitement approprie

**Exemple:**
- Patient: "Je me reveille souvent vers 2h du matin"
- Correspondance: Congestion hepatique, hypercortisolisme
- Axe: Corticotrope
- Suggestion: Drainage hepatique

### 2. Contextualisation par Age

Fichier cle: `phases-vie/phases-recyclage-endocrinien.md`

Interpreter les symptomes selon:
- Phase de vie actuelle du patient
- Phases ou des traumas ont pu survenir
- Programmes endocriniens actifs a chaque phase

**Exemple:**
- Patient 43 ans avec kystes et fatigue
- Phase 6 (adulte): Pause genitale typique a 39-43 ans
- Risque: etats adaptatifs (kystes, fibromes, thyroidite)

### 3. Scoring Clinique

Fichier cle: `revue-systemes/ros-endobiogenique.md`

Enrichir le scoring avec les 5 systemes ROS:
1. Cycles menstruels (femmes)
2. Architecture du sommeil
3. Alimentation
4. Fonctionnement intestinal
5. Personnel/interpersonnel

### 4. Comprehension Pathologique

Fichier cle: `terrains/stades-manifestation-maladie.md`

Comprendre l'origine de la maladie:
1. Terrain precritique (cause profonde)
2. Agent (declencheur)
3. Terrain critique (reponse inadaptee)
4. Mecanismes
5. Effets

---

## Concepts Cles

### Terrain Precritique (3 composantes)
1. Dysfonctionnement SNA
2. Dysfonctionnement endocrinien
3. Dysfonctionnement emonctoriel

> "En cas de doute, drainer l'emonctoire-cle"

### Les 4 Axes Endocriniens
- **Corticotrope**: Stress, surrenales, cortisol
- **Thyreotrope**: Metabolisme, adaptation
- **Gonadotrope**: Hormones sexuelles, reproduction
- **Somatotrope**: Croissance, GH

### Devise de l'Anamnese
> "Rien n'est rien" - Chaque mot, expression, metaphore peut etre la cle

---

## Integration SaaS

### OngletInterrogatoire.tsx
- Utiliser `correspondances-symptomes-terrain.md` pour mapper reponses -> terrain
- Afficher terrain probable selon symptomes

### clinicalScoringV2.ts
- Enrichir avec donnees de `ros-endobiogenique.md`
- Ponderer selon phase de vie (`phases-recyclage-endocrinien.md`)

### therapeuticReasoning.ts
- Utiliser `stades-manifestation-maladie.md` pour raisonner
- Cibler terrain precritique, pas seulement symptomes

---

*Extrait automatiquement le 27/11/2024*
*Source: La Theorie de l'Endobiogenie, Volume 1, Chapitre 13*
