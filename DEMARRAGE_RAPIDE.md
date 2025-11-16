# 🚀 DÉMARRAGE RAPIDE - INTERROGATOIRE ENDOBIOGÉNIQUE

## ⚡ Test en 5 minutes

### Étape 1 : Démarrer le serveur

```bash
npm run dev
```

Attendez que le serveur démarre sur `http://localhost:3000`

---

### Étape 2 : Accéder à un patient

1. Ouvrez votre navigateur
2. Allez sur `http://localhost:3000/patients`
3. Cliquez sur un patient existant dans la liste

---

### Étape 3 : Ouvrir l'interrogatoire

Dans la page du patient, vous verrez maintenant **6 onglets** :

- 📊 Aperçu
- 👤 Identité & ATCD
- **🩺 Interrogatoire** ← **NOUVEAU !**
- 🧬 Analyses BdF
- 📋 Consultations
- 💊 Ordonnances

**Cliquez sur l'onglet "🩺 Interrogatoire"**

---

### Étape 4 : Remplir le formulaire

1. Cliquez sur le bouton **"Ouvrir le formulaire d'interrogatoire"**
2. Vous arrivez sur une page avec **8 onglets thématiques** :
   - 🧠 Neurovégétatif
   - 😰 Adaptatif (Stress)
   - 🦋 Thyroïdien
   - 🌸 Gonadique
   - 🍽️ Digestif & Métabolique
   - 🛡️ Immuno-inflammatoire
   - ⏰ Rythmes biologiques
   - 🌱 Axes de vie

3. **Sélectionnez le sexe** du patient en haut (important pour les questions gonadiques)

4. **Remplissez quelques champs** dans chaque onglet (pas besoin de tout remplir pour tester)

5. Cliquez sur **"Enregistrer"** en bas du formulaire

6. Vérifiez le message de confirmation ✅

---

### Étape 5 : Générer une ordonnance avec fusion

1. **Retournez à la page du patient** (cliquez sur "← Retour à la page du patient")

2. Cliquez sur l'onglet **"💊 Ordonnances"**

3. Cliquez sur **"Générer une nouvelle ordonnance IA"** (ou similaire)

4. Sélectionnez les volets souhaités :
   - ✅ Plantes médicinales
   - ✅ Gemmothérapie
   - ✅ Micronutrition
   - ❌ Aromathérapie (optionnel)

5. Cliquez sur **"Générer l'ordonnance"**

---

### Étape 6 : Vérifier la fusion dans la console

Pendant que l'ordonnance se génère, **ouvrez la console du terminal** (là où vous avez lancé `npm run dev`).

Vous devriez voir des logs comme :

```
✅ Interrogatoire trouvé pour patient clxxx...
✅ Scores cliniques calculés:
  - Neurovégétatif: sympathicotonique (score: 6)
  - Adaptatif: hyperadaptatif (score: 7)
  - Thyroïdien: hypo (score: 5)
  - Gonadique: hyper (score: 4)
  - Digestif: dysbiose (score: 6)
  - Immuno: hypo (score: 5)
  - Rythmes: désynchronisé (score: 6)
  - Axes de vie: stress chronique (score: 8)

✅ Fusion multi-sources effectuée: 8 axes fusionnés
  - Axe neurovégétatif: score 8, confiance élevée (3 sources)
  - Axe adaptatif: score 6, confiance modérée (2 sources)
  - Axe thyroïdien: score 4, confiance faible (1 source)
  ...
```

---

### Étape 7 : Consulter l'ordonnance enrichie

1. L'ordonnance générée s'affiche

2. Dans la **synthèse clinique**, vous devriez voir :
   - Le préfixe **`[ANALYSE INTÉGRÉE]`**
   - Les axes perturbés détectés par fusion multi-sources
   - Les plantes/gemmes recommandées en fonction des 3 sources

3. Les **3 volets** sont générés :
   - Volet 1 : Endobiogénique (canon Lapraz/Hedayat)
   - Volet 2 : Phyto/Gemmo/Aroma élargi
   - Volet 3 : Micronutrition

---

## 🎯 Ce que vous venez de tester

✅ **Saisie interrogatoire** : Formulaire complet avec 8 axes
✅ **Sauvegarde en base** : Données stockées en JSON dans PostgreSQL
✅ **Calcul des scores** : Analyse automatique des réponses
✅ **Fusion 3 sources** : Vote majoritaire (clinique + BdF + RAG)
✅ **Confiance multi-sources** : Score de confiance pour chaque axe
✅ **Génération enrichie** : Ordonnance basée sur l'analyse intégrée

---

## 🔍 Détails techniques visibles

### Dans la console serveur

- Chargement de l'interrogatoire
- Calcul des scores pour chaque axe
- Fusion des 3 sources avec comptage
- Niveau de confiance pour chaque axe

### Dans l'ordonnance générée

- Synthèse avec préfixe `[ANALYSE INTÉGRÉE]`
- Recommandations basées sur les axes fusionnés
- Cohérence entre les 3 volets

---

## 🐛 En cas de problème

### "Interrogatoire non trouvé"

- Vérifiez que vous avez bien cliqué sur "Enregistrer" dans le formulaire
- Retournez au formulaire et vérifiez que les champs sont remplis
- Consultez la console navigateur (F12) pour voir les erreurs d'API

### "Erreur lors de la génération"

- Vérifiez que le patient a bien des données BdF (onglet "Analyses BdF")
- Vérifiez que votre clé OpenAI est configurée dans `.env`
- Consultez les logs du serveur pour voir l'erreur exacte

### "Page 404" sur /patients/[id]/interrogatoire

- Vérifiez que le serveur Next.js est bien redémarré
- Essayez de rafraîchir la page (Ctrl+R ou Cmd+R)

---

## 📚 Aller plus loin

Après ce test, consultez :

- **[ACCES_INTERROGATOIRE.md](ACCES_INTERROGATOIRE.md)** : Guide complet d'utilisation
- **[INTEGRATION_FUSION_CLINIQUE.md](INTEGRATION_FUSION_CLINIQUE.md)** : Documentation technique
- **[RESUME_TRAVAUX_FUSION.md](RESUME_TRAVAUX_FUSION.md)** : Résumé des livrables

---

## ✨ Prochaines fonctionnalités à développer (optionnel)

1. **Affichage visuel des axes fusionnés** : Voir les sources et la confiance en un coup d'œil
2. **Chat ordonnance** : Interface de chat pour ajuster l'ordonnance de manière interactive
3. **Export PDF** : Générer un PDF de l'interrogatoire complet
4. **Statistiques patient** : Tableaux de bord avec évolution des scores cliniques

---

**Votre SaaS Endobiogénie est maintenant prêt à utiliser le système de fusion clinique complet !** 🎉
