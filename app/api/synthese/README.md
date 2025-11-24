# API Synthèse Endobiogénique - "Cerveau IA"

## Vue d'ensemble

Cette API est le **cœur intelligent** de l'application : elle fusionne les données cliniques (Interrogatoire) avec les preuves biologiques (BdF) pour générer une analyse médicale structurée et une ordonnance de phytothérapie personnalisée.

**Endpoint** : `POST /api/synthese/generate`

**Modèle IA** : GPT-4 Turbo (ou GPT-4o)

---

## 🎯 Fonctionnement

```
┌─────────────────────────────────────────────────────────────────┐
│  1. RÉCEPTION DONNÉES                                           │
│     - Interrogatoire (scores d'axes cliniques)                  │
│     - BdF (index biologiques fonctionnels)                      │
│     - Contexte patient (âge, sexe, ATCD, CI)                    │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. PROMPT EXPERT ENDOBIOGÉNIE                                  │
│     - Règles de concordance clinico-biologique                  │
│     - Hiérarchie thérapeutique (Surrénales→Drainage→Thyroïde)  │
│     - Matière médicale (350+ plantes par axe)                   │
│     - Contre-indications                                        │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. APPEL GPT-4                                                 │
│     - temperature: 0.4 (rigoureux médicalement)                 │
│     - response_format: json_object (structured output)          │
│     - max_tokens: 4000                                          │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. RÉPONSE STRUCTURÉE                                          │
│     - Analyse de concordance                                    │
│     - Mécanismes physiopathologiques                            │
│     - Stratégie thérapeutique hiérarchisée                      │
│     - Ordonnance (Phyto + Gemmo + Aroma + Conseils)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📥 Format de Requête

### Headers
```http
POST /api/synthese/generate
Content-Type: application/json
Cookie: next-auth.session-token=...  (authentification requise)
```

### Body
```json
{
  "interrogatoire": [
    {
      "axe": "adaptatif",
      "score": 85,
      "status": "critical"
    },
    {
      "axe": "thyroidien",
      "score": 65,
      "status": "warning"
    }
  ],

  "bdf": {
    "indexes": {
      "idx_genital": {
        "value": 3.6,
        "status": "high",
        "interpretation": "Sympathique dominant"
      },
      "idx_adaptation": {
        "value": 18.0,
        "status": "high",
        "interpretation": "Insuffisance surrénalienne"
      },
      "idx_thyroid_yield": {
        "value": 0.35,
        "status": "low",
        "interpretation": "Hypothyroïdie périphérique"
      }
    },
    "metadata": {
      "calculatedAt": "2025-11-22T10:00:00.000Z",
      "biomarkersCount": 12
    }
  },

  "patientContext": {
    "age": 42,
    "sexe": "F",
    "atcd": "Burnout 2020",
    "traitements": "Aucun",
    "CI": ["Grossesse"]
  }
}
```

---

## 📤 Format de Réponse

### Success (200)
```json
{
  "analyse_concordance": "La patiente se plaint de fatigue intense et de frilosité. L'analyse biologique CONFIRME ces symptômes : Index d'Adaptation élevé (18.0) traduisant une insuffisance surrénalienne fonctionnelle, et Rendement Thyroïdien bas (0.35) confirmant une hypothyroïdie périphérique. La sympathicotonie (Index Génital 3.6) aggrave la vasoconstriction et explique la frilosité malgré une TSH normale. CONCORDANCE PARFAITE.",

  "mecanismes": "Épuisement surrénalien chronique (axe corticotrope) → Diminution conversion T4→T3 → Hypothyroïdie type 2. Le terrain sympathicotonique (stress chronique) entretient un cercle vicieux : stress → cortisol ↑ → blocage thyroïde → fatigue → stress. La vasoconstriction périphérique (sympathique alpha) explique la frilosité malgré une fonction thyroïdienne centrale normale.",

  "strategie_therapeutique": [
    "1. Restaurer l'axe corticotrope (surrénales) en PRIORITÉ absolue",
    "2. Soutenir la conversion thyroïdienne périphérique (T4→T3)",
    "3. Réguler le système nerveux sympathique (vasodilatation)",
    "4. Drainer le foie pour améliorer la conversion hormonale"
  ],

  "ordonnance": {
    "phytotherapie": [
      {
        "plante": "Avena sativa TM",
        "forme": "Teinture-Mère",
        "posologie": "50 gouttes matin et midi dans un verre d'eau",
        "justification": "Tonique nerveux et surrénalien, soutient l'axe adaptatif en cas d'épuisement chronique (burnout). Nourrit le système nerveux."
      },
      {
        "plante": "Rosmarinus officinalis TM",
        "forme": "Teinture-Mère",
        "posologie": "40 gouttes le matin",
        "justification": "Triple action : stimule la thyroïde, améliore la conversion T4→T3, draineur hépato-biliaire. Essentiel dans les hypothyroïdies type 2."
      }
    ],

    "gemmotherapie": [
      {
        "plante": "Ribes nigrum (Cassis) - Macérat Glycériné 1D",
        "forme": "Macérat de bourgeons",
        "posologie": "50 gouttes le matin à jeun",
        "justification": "Adaptogène majeur, cortisone-like naturel, soutient les surrénales en cas d'insuffisance fonctionnelle. Plante de référence en endobiogénie."
      },
      {
        "plante": "Quercus robur (Chêne) - Macérat Glycériné 1D",
        "forme": "Macérat de bourgeons",
        "posologie": "50 gouttes le matin",
        "justification": "Tonique surrénalien puissant, indiqué dans les épuisements profonds avec baisse de la vitalité. Renforce l'axe corticotrope."
      },
      {
        "plante": "Tilia tomentosa (Tilleul) - Macérat Glycériné 1D",
        "forme": "Macérat de bourgeons",
        "posologie": "50 gouttes le soir",
        "justification": "Régule le sympathique, anxiolytique doux, améliore le sommeil. Compense la sympathicotonie détectée (Index Génital 3.6)."
      }
    ],

    "aromatherapie": [
      {
        "plante": "Pinus sylvestris (Pin sylvestre) HE",
        "usage": "Cutané (dilué 20% dans HV Noisette)",
        "posologie": "5 gouttes sur les surrénales (zone lombaire) matin et midi",
        "justification": "Stimulant cortical surrénalien, tonique général en cas de fatigue profonde. Action directe sur l'axe corticotrope."
      }
    ],

    "conseils_hygiene": [
      "Éviter les excitants (café, thé noir, alcool) qui épuisent davantage les surrénales",
      "Petit-déjeuner protéiné (œufs, fromage blanc, oléagineux) pour soutenir la production hormonale",
      "Activité physique DOUCE uniquement (marche 30min/jour, yoga doux) - PAS de sport intensif",
      "Coucher AVANT 23h pour respecter le pic de cortisol matinal (cycle circadien)",
      "Gestion du stress : Cohérence cardiaque 3×5 minutes/jour (6 respirations/min)",
      "Exposition à la lumière naturelle le matin (régulation mélatonine/cortisol)",
      "Éviter les écrans 1h avant le coucher (favorise mélatonine)"
    ]
  },

  "surveillance": [
    "Contrôle biologique : TSH, T4L, T3L, Cortisol dans 2 mois",
    "Réévaluation clinique (fatigue, frilosité, sommeil) à 1 mois",
    "Adapter les doses selon l'évolution des symptômes",
    "Si amélioration insuffisante : envisager bilan complémentaire (Vit D, Fer, B12)"
  ],

  "duree_traitement": "3 mois minimum, puis réévaluation complète. Traitement de fond sur 6-12 mois si épuisement chronique installé.",

  "metadata": {
    "generatedAt": "2025-11-22T13:30:00.000Z",
    "model": "gpt-4-turbo-preview",
    "tokens": 3200,
    "userId": "user-id-123"
  }
}
```

### Error (400)
```json
{
  "error": "Données insuffisantes : interrogatoire ou BdF requis"
}
```

### Error (401)
```json
{
  "error": "Non authentifié"
}
```

### Error (429)
```json
{
  "error": "Quota OpenAI dépassé, réessayez plus tard"
}
```

### Error (500)
```json
{
  "error": "Erreur lors de la génération de la synthèse",
  "details": "Invalid API key provided"
}
```

---

## 🧠 Règles de Raisonnement (Prompt Expert)

### 1. Concordance Clinico-Biologique

Le prompt force l'IA à croiser SYSTÉMATIQUEMENT les plaintes (symptômes) avec les preuves (bio).

**Exemples de concordance** :

| Symptôme | Index BdF | Conclusion |
|----------|-----------|------------|
| Fatigue intense | Index Adaptation >15 (HAUT) | ✅ **CONFIRMÉ** - Insuffisance surrénalienne |
| Frilosité | Rendement Thyroïdien <0.5 (BAS) | ✅ **CONFIRMÉ** - Hypothyroïdie périphérique |
| Stress chronique | Index Génital >2.5 (HAUT) | ✅ **CONFIRMÉ** - Sympathicotonie |

**Exemples de discordance** (faux positifs à détecter) :

| Symptôme | Index BdF | Vraie Cause |
|----------|-----------|-------------|
| Frilosité | Rendement Thyroïdien NORMAL + Index Génital HAUT | ⚠️ **Vasoconstriction sympathique** (pas la thyroïde) |
| Fatigue | Index Adaptation NORMAL + Index Génital BAS | ⚠️ **Parasympathicotonie** (ralentissement vagal, pas surrénales) |

### 2. Hiérarchie Thérapeutique

Le prompt impose un ordre de priorité STRICT :

```
1️⃣ AXE CORTICOTROPE (Surrénales) - Le Chef d'Orchestre
   → Si épuisé : TRAITER EN PRIORITÉ
   → Plantes : Ribes nigrum, Quercus robur, Avena sativa

2️⃣ DRAINAGE (Foie, Rein, Lymphe)
   → Préparer le terrain avant de stimuler
   → Plantes : Rosmarinus, Cynara, Silybum

3️⃣ AXE THYRÉOTROPE (Métabolisme)
   → Seulement si surrénales soutenues
   → Plantes : Laminaria, Avena, Rosmarinus

4️⃣ NEUROVÉGÉTATIF (Sympathique/Parasympathique)
   → Sympathicotonie : Crataegus, Tilia, Passiflora
   → Parasympathicotonie : Rosmarinus, Thymus

5️⃣ AUTRES AXES (Gonadique, Somatotrope...)
   → Seulement si axes fondamentaux stabilisés
```

### 3. Matière Médicale (350+ Plantes)

Le prompt contient une **base de connaissance exhaustive** des plantes par axe :

**Surrénales** : Ribes nigrum, Quercus robur, Avena sativa, Pinus sylvestris, Ficus carica...
**Thyroïde** : Laminaria, Fucus, Rosmarinus, Avena, Lycopus, Cornus sanguinea...
**Neurovégétatif** : Crataegus, Tilia, Passiflora, Olea europaea, Juglans regia, Alnus glutinosa...
**Foie/Drainage** : Cynara, Silybum, Rosmarinus, Taraxacum, Chelidonium...

### 4. Contre-Indications

Le prompt intègre les **CI majeures** :

- **Grossesse** : Éviter HE (sauf Lavande), éviter emménagogues
- **HTA** : Contre-indication Réglisse (Glycyrrhiza)
- **Hyperthyroïdie** : Contre-indication absolue algues iodées
- **Insuffisance rénale** : Adapter drainage
- **Anticoagulants** : Prudence Ginkgo, Ail

---

## 🔐 Sécurité

### Authentification
- ✅ Requiert session Next-Auth valide
- ✅ Vérifie `session.user` avant traitement

### Validation
- ✅ Vérifie présence `interrogatoire` OU `bdf`
- ✅ Parse et valide le JSON retourné par GPT-4
- ✅ Gestion erreurs OpenAI (401, 429, 500)

### Logging
- ✅ Console logs pour debug (`🤖 Génération...`, `✅ Synthèse générée`)
- ✅ Erreurs détaillées en cas d'échec

---

## ⚙️ Configuration

### Variables d'Environnement

Ajouter dans `.env.local` :

```bash
# OpenAI API Key (OBLIGATOIRE)
OPENAI_API_KEY=sk-proj-...

# Next-Auth (déjà configuré normalement)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
```

### Modèles Recommandés

| Modèle | Qualité | Coût | Vitesse |
|--------|---------|------|---------|
| `gpt-4o` | ⭐⭐⭐⭐⭐ | $$$ | Rapide |
| `gpt-4-turbo-preview` | ⭐⭐⭐⭐⭐ | $$$ | Rapide |
| `gpt-4` | ⭐⭐⭐⭐ | $$$$ | Lent |
| `gpt-3.5-turbo` | ⭐⭐⭐ | $ | Très rapide |

**Recommandation** : `gpt-4-turbo-preview` ou `gpt-4o` pour la précision médicale.

---

## 📊 Coûts Estimés

### Tokens par Requête

| Type | Tokens |
|------|--------|
| Prompt système (matière médicale) | ~2,500 |
| Prompt utilisateur (données patient) | ~500 |
| Réponse GPT-4 (ordonnance complète) | ~1,500 |
| **TOTAL** | **~4,500 tokens** |

### Tarifs GPT-4 Turbo (au 22/11/2025)

- Input : $0.01 / 1K tokens
- Output : $0.03 / 1K tokens

**Coût par synthèse** : ~$0.06 (6 centimes)

**Pour 100 patients/mois** : ~$6

---

## 🧪 Test de l'API

### Avec cURL

```bash
curl -X POST http://localhost:3006/api/synthese/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "interrogatoire": [
      {"axe": "adaptatif", "score": 85, "status": "critical"},
      {"axe": "thyroidien", "score": 65, "status": "warning"}
    ],
    "bdf": {
      "indexes": {
        "idx_adaptation": {"value": 18.0, "status": "high"},
        "idx_thyroid_yield": {"value": 0.35, "status": "low"}
      }
    },
    "patientContext": {
      "age": 42,
      "sexe": "F",
      "CI": []
    }
  }'
```

### Avec Postman

1. **Method** : POST
2. **URL** : `http://localhost:3006/api/synthese/generate`
3. **Headers** :
   - `Content-Type: application/json`
   - `Cookie: next-auth.session-token=...` (copier depuis DevTools)
4. **Body** : Voir exemple ci-dessus

---

## 🐛 Debugging

### Activer les Logs Détaillés

Modifier `route.ts` :

```typescript
// Avant l'appel GPT-4
console.log("📤 Prompt envoyé :", userPrompt);

// Après la réponse
console.log("📥 Réponse brute GPT-4 :", rawContent);
```

### Erreurs Fréquentes

**Erreur : "Invalid API key"**
- ✅ Vérifier `.env.local` : `OPENAI_API_KEY=sk-proj-...`
- ✅ Redémarrer le serveur Next.js après modification

**Erreur : "Non authentifié"**
- ✅ Se connecter à l'application (`/auth/signin`)
- ✅ Copier le cookie `next-auth.session-token` depuis DevTools

**Erreur : "Quota dépassé"**
- ✅ Vérifier le quota OpenAI sur https://platform.openai.com/usage
- ✅ Ajouter du crédit si nécessaire

**Erreur : "Format de réponse invalide"**
- ✅ GPT-4 n'a pas retourné du JSON valide
- ✅ Vérifier les logs console (`rawContent`)
- ✅ Augmenter `max_tokens` si tronqué

---

## 🚀 Prochaines Améliorations

### Phase 2.1 : Sauvegarde en Base
- [ ] Créer modèle Prisma `Synthese`
- [ ] Sauvegarder chaque génération
- [ ] Historique par patient

### Phase 2.2 : Affichage UI
- [ ] Créer composant `SynthesisResultDisplay`
- [ ] Afficher ordonnance formatée
- [ ] Bouton "Éditer" / "Valider"
- [ ] Export PDF

### Phase 2.3 : Optimisations
- [ ] Cache Redis (éviter regénération identique)
- [ ] Streaming GPT-4 (affichage progressif)
- [ ] Retry automatique si erreur temporaire

---

## 📚 Références

- **Méthodologie** : Endobiogénie Duraffourd & Lapraz (Vol 1-4)
- **OpenAI Docs** : https://platform.openai.com/docs/api-reference
- **Structured Outputs** : https://platform.openai.com/docs/guides/structured-outputs
- **Matière Médicale** : `lib/bdf/indexes/indexes.config.ts` + Prompt système

---

**Auteur** : Claude Code (Anthropic)
**Date** : 22 novembre 2025
**Statut** : ✅ API Opérationnelle - Prête pour intégration UI
