# 🚀 Guide d'intégration BdF dans le Chat

## 📋 Objectif

Permettre d'ouvrir l'analyse BdF depuis la page Chat via un Drawer réutilisable, avec détection automatique des valeurs biologiques et appel RAG optionnel.

---

## ✅ Ce qui a été fait

### 1. **Types partagés** (`types/bdf.ts`)
- `BdfInputs` : Valeurs biologiques en entrée
- `BdfIndex` : Un index calculé avec son statut
- `BdfAnalysis` : Résultat complet d'une analyse
- `BdfResultDrawerProps` : Props du Drawer

### 2. **Composants réutilisables**

#### `components/BdfIndexGrid.tsx`
Affiche les 8 cartes d'index en grille 2×4 avec couleurs dégradées.

**Usage:**
```tsx
<BdfIndexGrid indexes={analysis.indexes} />
```

#### `components/BdfResultDrawer.tsx`
Drawer complet avec:
- Grille des 8 index
- Résumé fonctionnel
- Axes sollicités
- Bouton "🧠 Lecture endobiogénique du terrain"
- Disclaimer

**Usage:**
```tsx
<BdfResultDrawer
  analysis={bdfAnalysis}
  isOpen={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  onRequestRag={handleRagRequest}
/>
```

### 3. **Store de session** (`store/useBdfSession.ts`)
Store Zustand pour mémoriser la dernière analyse BdF.

**Usage:**
```tsx
const { lastAnalysis, setLastAnalysis } = useBdfSession();
```

### 4. **Utilitaires**

#### `lib/bdf/convertToAnalysis.ts`
Convertit `InterpretationPayload` (API) vers `BdfAnalysis` (format partagé).

```tsx
const analysis = convertToBdfAnalysis(apiPayload, labValues);
```

#### `lib/bdf/detectLabValues.ts`
Détecte les valeurs biologiques dans un message texte.

```tsx
const { values, count } = detectLabValues(message);
const shouldSuggest = shouldSuggestBdfAnalysis(message); // >= 4 valeurs
const formatted = formatDetectedValues(values);
```

---

## 🔨 Intégration dans ChatInterface

### Étape 1 : Imports nécessaires

Ajoutez en haut de `components/ChatInterface.tsx`:

```tsx
import { useState } from "react";
import { BdfResultDrawer } from "./BdfResultDrawer";
import { useBdfSession } from "@/store/useBdfSession";
import { detectLabValues, shouldSuggestBdfAnalysis, formatDetectedValues } from "@/lib/bdf/detectLabValues";
import { convertToBdfAnalysis } from "@/lib/bdf/convertToAnalysis";
import type { BdfAnalysis } from "@/types/bdf";
```

### Étape 2 : État local

Ajoutez dans le composant:

```tsx
// État pour le Drawer BdF
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const { lastAnalysis, setLastAnalysis } = useBdfSession();

// État pour la suggestion de BdF
const [showBdfSuggestion, setShowBdfSuggestion] = useState(false);
const [detectedValues, setDetectedValues] = useState<any>(null);
```

### Étape 3 : Détection des valeurs dans le message

Dans la fonction qui gère l'envoi du message (probablement `handleSend` ou similaire), ajoutez:

```tsx
// Avant d'envoyer le message
const { values, count } = detectLabValues(userMessage);
if (shouldSuggestBdfAnalysis(userMessage)) {
  setDetectedValues(values);
  setShowBdfSuggestion(true);
}
```

### Étape 4 : Fonction d'analyse BdF

Ajoutez une nouvelle fonction:

```tsx
const handleLaunchBdfAnalysis = async (inputs: any) => {
  try {
    setShowBdfSuggestion(false);

    // Appel API
    const res = await fetch("/api/bdf/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });

    if (!res.ok) throw new Error("Erreur API BdF");

    const apiPayload = await res.json();
    const analysis = convertToBdfAnalysis(apiPayload, inputs);

    // Stocker et ouvrir
    setLastAnalysis(analysis);
    setIsDrawerOpen(true);

    // Optionnel: Ajouter un message système dans le chat
    // "✅ Analyse BdF effectuée. [Voir les résultats]"
  } catch (error) {
    console.error("Erreur BdF:", error);
    // Toast d'erreur
  }
};
```

### Étape 5 : Bouton global "Ouvrir l'analyse BdF"

Dans le header ou au-dessus du composer, ajoutez:

```tsx
{/* Bouton BdF */}
<button
  onClick={() => lastAnalysis && setIsDrawerOpen(true)}
  disabled={!lastAnalysis}
  style={{
    padding: "10px 20px",
    background: lastAnalysis
      ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
      : "#e5e7eb",
    color: lastAnalysis ? "white" : "#9ca3af",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: lastAnalysis ? "pointer" : "not-allowed",
    transition: "all 0.3s",
  }}
  title={lastAnalysis ? "Ouvrir la dernière analyse BdF" : "Aucune analyse BdF disponible"}
>
  🔬 Ouvrir l'analyse BdF
</button>
```

### Étape 6 : Carte suggestion

Dans le flux des messages, si `showBdfSuggestion` est vrai, affichez:

```tsx
{showBdfSuggestion && detectedValues && (
  <div
    style={{
      background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
      border: "2px solid #3b82f6",
      borderRadius: "12px",
      padding: "20px",
      margin: "16px 0",
    }}
  >
    <div style={{ fontSize: "1rem", fontWeight: "600", color: "#1e3a8a", marginBottom: "8px" }}>
      💊 Valeurs biologiques détectées
    </div>
    <div style={{ fontSize: "0.9rem", color: "#1e40af", marginBottom: "16px" }}>
      {formatDetectedValues(detectedValues)}
    </div>
    <button
      onClick={() => handleLaunchBdfAnalysis(detectedValues)}
      style={{
        padding: "12px 24px",
        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
      }}
    >
      🔬 Lancer l'analyse BdF
    </button>
  </div>
)}
```

### Étape 7 : Drawer en fin de composant

Ajoutez avant le `</div>` final:

```tsx
{/* Drawer BdF */}
<BdfResultDrawer
  analysis={lastAnalysis}
  isOpen={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  onRequestRag={handleRequestRag}
/>
```

### Étape 8 : Fonction RAG

Ajoutez la fonction pour gérer l'appel RAG:

```tsx
const handleRequestRag = async (analysis: BdfAnalysis) => {
  try {
    // Construire le prompt RAG
    const indexesSummary = analysis.indexes
      .map((idx) => `${idx.label}: ${idx.value?.toFixed(2) || "N/A"}`)
      .join(", ");

    const ragQuery = `
Analyse BdF:
- Index: ${indexesSummary}
- Résumé: ${analysis.summary}
- Axes: ${analysis.axes.join(", ")}

Produis une lecture endobiogénique contextualisée, pédagogique, non médicale.
    `.trim();

    // Appeler l'API OpenAI avec le vector store
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en endobiogénie. Utilise uniquement les informations du vector store.",
          },
          {
            role: "user",
            content: ragQuery,
          },
        ],
        temperature: 0.3,
        // TODO: Ajouter le vector store avec file_search
        // tools: [{ type: "file_search" }],
        // tool_resources: { file_search: { vector_store_ids: ["vs_68e87a07ae6c81918d805c8251526bda"] } }
      }),
    });

    const data = await response.json();
    const ragContent = data.choices[0]?.message?.content || "Pas de réponse";

    // TODO: Passer le ragContent au Drawer
    // Option 1: Via un état partagé
    // Option 2: Via une prop du Drawer
    // Option 3: Via un store

    console.log("Contenu RAG:", ragContent);
  } catch (error) {
    console.error("Erreur RAG:", error);
    // Toast d'erreur
  }
};
```

---

## 🧪 Tests d'acceptation

### Test 1 : Détection et analyse

**Message utilisateur:**
```
GR: 4.5, GB: 6, Neutro: 3.5, Lympho: 2, TSH: 2.5, LDH: 180, CPK: 90, PAOi: 45, Ostéocalcine: 15.5
```

**Résultat attendu:**
1. ✅ Carte suggestion "Valeurs biologiques détectées" apparaît
2. ✅ Clic sur "Lancer l'analyse BdF"
3. ✅ Drawer s'ouvre avec:
   - 8 cartes d'index
   - Résumé fonctionnel
   - Axes sollicités
   - Bouton RAG

**Valeurs calculées attendues:**
- Index génital: 0.75
- Index thyroïdien: 2.00
- g/T: 1.75
- Index adaptation: (dépend des éosinophiles/monocytes)
- Index œstrogénique: (dépend de l'ostéocalcine)
- Turnover: 112.50
- Rendement thyroïdien: 0.80
- Remodelage osseux: 7.26

### Test 2 : Bouton global

1. ✅ Après une analyse, le bouton "Ouvrir l'analyse BdF" devient actif
2. ✅ Clic → Drawer s'ouvre sans re-calcul
3. ✅ Fermeture puis réouverture → même analyse affichée

### Test 3 : Valeurs insuffisantes

**Message:**
```
GR: 4.5, GB: 6
```

**Résultat attendu:**
- ❌ Pas de carte suggestion (< 4 valeurs)
- ✅ Message traité normalement par le chatbot

### Test 4 : RAG

1. ✅ Analyse BdF affichée dans le Drawer
2. ✅ Clic sur "🧠 Obtenir la lecture endobiogénique du terrain"
3. ✅ Spinner de chargement
4. ✅ Après 1-2 secondes : texte RAG affiché
5. ✅ Texte contextualisé avec les valeurs de l'analyse

---

## 📊 Architecture finale

```
┌─────────────────────────────────────────────────────────────┐
│ ChatInterface.tsx                                            │
│  - État: lastAnalysis, isDrawerOpen                         │
│  - Détection: shouldSuggestBdfAnalysis(message)             │
│  - Actions: handleLaunchBdfAnalysis(), handleRequestRag()   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Header                                                   │ │
│ │   [🔬 Ouvrir l'analyse BdF] ← disabled si pas d'analyse │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Messages                                                 │ │
│ │   • Message utilisateur                                 │ │
│ │   • [Carte suggestion si >= 4 valeurs détectées]        │ │
│ │   • Réponse chatbot                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Input / Composer                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ BdfResultDrawer (Overlay + Drawer côté droit)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Header: 🔬 Analyse BdF                         [✕]    │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 📋 Valeurs biologiques analysées                      │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 📊 Grille 8 cartes (BdfIndexGrid)                     │  │
│  │   [IG] [IT] [g/T] [Adapt]                             │  │
│  │   [Œstro] [Turnover] [RendThy] [RemoOs]              │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 🔬 Résumé fonctionnel                                 │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ⚙️ Axes sollicités                                    │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ [🧠 Obtenir la lecture endobiogénique du terrain]    │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ [Zone RAG si chargé]                                  │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ⚠️ Disclaimer                                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Fichiers créés/modifiés

### Créés
- ✅ `types/bdf.ts` - Types partagés
- ✅ `components/BdfIndexGrid.tsx` - Grille des 8 cartes
- ✅ `components/BdfResultDrawer.tsx` - Drawer complet
- ✅ `store/useBdfSession.ts` - Store Zustand
- ✅ `lib/bdf/convertToAnalysis.ts` - Conversion API → BdfAnalysis
- ✅ `lib/bdf/detectLabValues.ts` - Détection des valeurs biologiques

### À modifier
- ⏳ `components/ChatInterface.tsx` - Intégration complète (voir étapes ci-dessus)

---

## 🎯 Points d'attention

### 1. Appel RAG
L'implémentation actuelle de `handleRequestRag` utilise l'API OpenAI directe. Vous pouvez améliorer en:
- Utilisant le `ragClient.ts` existant
- Créant un endpoint `/api/bdf/rag` côté serveur
- Gérant mieux l'affichage du contenu RAG dans le Drawer

### 2. Message système après analyse
Optionnel: Ajouter un message dans le flux du chat après analyse:
```tsx
{
  role: "system",
  content: "✅ Analyse BdF effectuée. [Voir les résultats]",
  onClick: () => setIsDrawerOpen(true)
}
```

### 3. Persistance
Le store `useBdfSession` est en mémoire uniquement. Pour persister:
- Zustand persist middleware
- localStorage
- Base de données avec chatId

### 4. Responsive
Le Drawer est fixé à `min(90vw, 1200px)`. Sur mobile, ajuster:
```tsx
width: window.innerWidth < 768 ? "100vw" : "min(90vw, 1200px)"
```

---

## 🚀 Prochaines étapes

1. **Intégrer dans ChatInterface.tsx** selon les étapes ci-dessus
2. **Tester avec des messages réels** contenant des valeurs biologiques
3. **Améliorer l'appel RAG** (endpoint serveur + vector store)
4. **Ajouter des toasts** pour les erreurs/succès
5. **Responsive design** pour mobile
6. **Persistance** de la dernière analyse

---

## 📚 Ressources

- Store Zustand: https://zustand-demo.pmnd.rs/
- API BdF existante: `/api/bdf/analyse`
- Vector Store OpenAI: `vs_68e87a07ae6c81918d805c8251526bda`
- RAG Client: `lib/chatbot/ragClient.ts`

---

**Bon courage pour l'intégration finale !** 🎉

Si vous avez des questions ou besoin d'aide pour une étape spécifique, n'hésitez pas à demander.
