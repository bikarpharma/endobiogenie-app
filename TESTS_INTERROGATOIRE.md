# 🧪 TESTS INTERROGATOIRE - Guide de Débogage

## 🔍 Vérifier si l'interrogatoire est sauvegardé

### Méthode 1 : Console Navigateur

1. **Ouvrir la console** : Appuyez sur `F12` dans votre navigateur
2. **Aller sur l'onglet "Console"**
3. **Remplir l'interrogatoire** et cliquer sur "Enregistrer"
4. **Observer les logs** :
   ```
   📤 Envoi interrogatoire pour patient: clxxx...
   📋 Données: { sexe: 'F', axeNeuroVegetatif: {...}, ... }
   📡 Statut réponse: 200
   📥 Réponse: { success: true, message: '...', patientId: '...', dateEnregistrement: '...' }
   ```

Si vous voyez **"success: true"**, la sauvegarde a fonctionné !

---

### Méthode 2 : Vérifier en Base de Données (Prisma Studio)

1. **Ouvrir Prisma Studio** :
   ```bash
   npx prisma studio
   ```

2. **Naviguer vers** : `http://localhost:5555`

3. **Cliquer sur le modèle "Patient"**

4. **Trouver votre patient** et regarder la colonne `interrogatoire`

5. **Vérifier** que le champ contient un objet JSON avec vos données

---

### Méthode 3 : Tester l'API directement

**Test sauvegarde (POST)** :

Ouvrez la console navigateur et exécutez :

```javascript
// Remplacez PATIENT_ID par l'ID réel de votre patient
const patientId = 'clxxx...';

const testData = {
  patientId: patientId,
  interrogatoire: {
    sexe: 'F',
    axeNeuroVegetatif: {
      palpitations: 'oui',
      troubles_sommeil: 'parfois',
    },
    axeAdaptatif: {
      stress_chronique: 'oui',
      fatigue: 'moderee',
    },
    axeThyroidien: {},
    axeGonadiqueFemme: {},
    axeDigestifMetabolique: {},
    axeImmunoInflammatoire: {},
    rythmes: {},
    axesDeVie: {},
  }
};

fetch('/api/interrogatoire/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => {
  console.log('✅ Résultat:', data);
  if (data.success) {
    alert('✅ Test sauvegarde réussi !');
  } else {
    alert('❌ Erreur: ' + data.error);
  }
})
.catch(err => {
  console.error('❌ Erreur:', err);
  alert('❌ Erreur réseau');
});
```

**Test récupération (GET)** :

```javascript
// Remplacez PATIENT_ID par l'ID réel
const patientId = 'clxxx...';

fetch(`/api/interrogatoire/update?patientId=${patientId}`)
.then(res => res.json())
.then(data => {
  console.log('📥 Interrogatoire récupéré:', data);
  if (data.interrogatoire) {
    console.log('✅ Interrogatoire existe !', data.interrogatoire);
  } else {
    console.log('⚠️ Aucun interrogatoire trouvé');
  }
})
.catch(err => console.error('❌ Erreur:', err));
```

---

## 🐛 Problèmes Courants

### Problème 1 : "Non authentifié" (401)

**Symptôme** : Message d'erreur "Non authentifié"

**Cause** : Vous n'êtes pas connecté ou la session a expiré

**Solution** :
1. Déconnectez-vous et reconnectez-vous
2. Vérifiez que vous êtes bien connecté (`/login`)

---

### Problème 2 : "Patient introuvable" (404)

**Symptôme** : Message d'erreur "Patient introuvable"

**Cause** : L'ID du patient est incorrect ou le patient n'existe pas

**Solution** :
1. Vérifiez l'URL : `/patients/[id]/interrogatoire`
2. Vérifiez que le patient existe dans la base de données
3. Copiez l'ID exact depuis l'URL de la page patient

---

### Problème 3 : "Accès non autorisé" (403)

**Symptôme** : Message d'erreur "Accès non autorisé à ce patient"

**Cause** : Vous essayez d'accéder à un patient qui ne vous appartient pas

**Solution** :
1. Vérifiez que vous êtes connecté avec le bon compte
2. Vérifiez que le patient a bien été créé par votre compte

---

### Problème 4 : "Données invalides" (400)

**Symptôme** : Message d'erreur "Données invalides" avec détails Zod

**Cause** : Les données envoyées ne respectent pas le schéma de validation

**Solution** :
1. Vérifiez que le champ `sexe` est bien renseigné ('H' ou 'F')
2. Vérifiez que tous les axes sont des objets `{}`
3. Regardez les détails de l'erreur dans la console

---

### Problème 5 : L'interrogatoire ne se charge pas

**Symptôme** : Le formulaire est vide alors que vous avez déjà sauvegardé

**Causes possibles** :
1. Erreur lors du chargement
2. Problème de connexion base de données
3. Cache navigateur

**Solutions** :
1. **Vider le cache** : Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
2. **Vérifier la console** : Y a-t-il des erreurs ?
3. **Vérifier en base** : Utiliser Prisma Studio (voir Méthode 2)
4. **Tester l'API GET** : Utiliser le script de test ci-dessus

---

### Problème 6 : Erreur de connexion base de données

**Symptôme** : "Can't reach database server"

**Cause** : Problème de connexion à Neon

**Solution** :
1. Vérifiez votre connexion internet
2. Vérifiez que le `.env.local` contient la bonne `DATABASE_URL`
3. Essayez la connexion directe (sans `-pooler`) comme je l'ai fait précédemment
4. Redémarrez le serveur après modification du `.env.local`

---

## ✅ Workflow de Test Complet

### Étape 1 : Vérifier que le serveur fonctionne

```bash
npm run dev
```

Attendez : `✓ Compiled successfully`

---

### Étape 2 : Créer un patient de test

1. Allez sur `/patients`
2. Créez un nouveau patient avec :
   - Nom : Test
   - Prénom : Interrogatoire
   - Sexe : F
   - Date de naissance : 01/01/1990

---

### Étape 3 : Remplir l'interrogatoire

1. Cliquez sur le patient créé
2. Onglet "🩺 Interrogatoire"
3. Cliquez "Ouvrir le formulaire"
4. **IMPORTANT** : Sélectionnez le sexe en haut (même si déjà pré-rempli)
5. Remplissez au moins 2-3 champs dans chaque onglet
6. Cliquez "Enregistrer"

---

### Étape 4 : Vérifier la sauvegarde

**Option A - Console Navigateur** :
- Ouvrez F12 avant de cliquer sur "Enregistrer"
- Regardez les logs :
  - `📤 Envoi interrogatoire...`
  - `📡 Statut réponse: 200`
  - `📥 Réponse: { success: true }`

**Option B - Rechargement** :
1. Après redirection vers la page patient
2. Cliquez à nouveau sur "🩺 Interrogatoire"
3. Cliquez "Ouvrir le formulaire"
4. **Vérifiez** que vos données sont là !

**Option C - Prisma Studio** :
1. Ouvrez un nouveau terminal
2. `npx prisma studio`
3. Allez sur http://localhost:5555
4. Cliquez "Patient"
5. Trouvez votre patient et regardez `interrogatoire`

---

### Étape 5 : Générer une ordonnance avec fusion

1. Retournez sur la page du patient
2. Assurez-vous qu'il a aussi une **analyse BdF** (sinon, ajoutez-en une)
3. Onglet "💊 Ordonnances"
4. "Générer une nouvelle ordonnance"
5. Sélectionnez les volets
6. Générez

**Dans la console serveur, vous devriez voir** :

```
📋 Interrogatoire endobiogénique trouvé, calcul des scores cliniques...
✅ Scores cliniques calculés:
  - Neurovégétatif: sympathicotonique
  - Adaptatif: hyperadaptatif
  - Thyroïdien: hypo
  - Gonadique: hyper
🔀 Fusion complète : 8 axes perturbés fusionnés
  - axe neurovégétatif (modéré) : score 6/10 | confiance: moderee
  - axe adaptatif (sévère) : score 8/10 | confiance: elevee
  ...
```

---

## 🆘 Si Rien ne Fonctionne

1. **Envoyez-moi** :
   - Screenshot de la console navigateur (F12)
   - Logs du serveur terminal
   - L'ID exact du patient que vous testez

2. **Vérifiez** :
   - Que vous êtes bien connecté
   - Que la base de données Neon fonctionne
   - Que le serveur Next.js tourne sans erreur

3. **Réinitialisez** :
   ```bash
   # Arrêter le serveur (Ctrl+C)
   # Redémarrer
   npm run dev
   ```

---

**Que voyez-vous exactement quand vous essayez de sauvegarder ?**
- Message de succès ? ✅
- Message d'erreur ? ❌ (Lequel ?)
- Rien du tout ? 🤔
