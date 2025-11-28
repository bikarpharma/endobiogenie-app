# Volume 2 - Endobiogénie Clinique

Extraction structurée du Volume 2 "La Théorie de l'Endobiogénie" par K.M. Hedayat.

## Fichiers

| Fichier | Contenu | Usage RAG |
|---------|---------|-----------|
| matiere-medicale.json | 50 plantes médicinales | Raisonnement thérapeutique |
| conseils-cliniques.json | 29 conseils | Aide au diagnostic |
| axes-endocriniens.json | 4 axes + plantes | Interprétation BDF |
| sna.json | Para/Alpha/Bêta | Diagnostic terrain |
| emonctoires.json | 5 émonctoires + draineurs | Stratégie drainage |

## Intégration SaaS

### therapeuticReasoning.ts
- Utiliser `matiere-medicale.json` pour choisir les plantes
- Filtrer par axes impliqués et indications

### BdfResultsView.tsx
- Utiliser `axes-endocriniens.json` pour interpréter les index
- Afficher les conseils cliniques pertinents

### clinicalScoringV2.ts
- Utiliser `sna.json` pour qualifier le terrain SNA
- Utiliser `emonctoires.json` pour identifier les drainages nécessaires

---
*Extrait le 27/11/2025*
