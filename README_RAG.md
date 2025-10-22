Parfait — voici un **README_RAG.md** prêt à **copier-coller tel quel** dans ton repo.
Il récapitule l’approche générale, l’archi, les fichiers clés, la procédure GitHub/Vercel, les variables d’environnement, les tests, et une checklist de dépannage.

---

# RAG Endobiogénie – Mémo de mise en place (README)

> **But** : Chatbot RAG basé sur mes PDF (Vector Stores OpenAI) – Next.js + Agents SDK (`@openai/agents`) – déployé sur Vercel.

## 0) Vue d’ensemble

* **Stack** :

  * Frontend : Next.js (App Router), React
  * Backend : Route API Next (`app/api/chat/route.ts`)
  * LLM : OpenAI – **Agents SDK** (pas d’Assistants API)
  * RAG : **File Search** OpenAI avec **Vector Stores** (mes PDF indexés)
* **Principe** : la route API crée un **Agent** avec `fileSearchTool([...])`, exécute `Runner().run(...)`, renvoie `{ reply }`.
* **Hébergement** : Vercel (build & prod), env vars sécurisées.

---

## 1) Pré-requis

* Node.js LTS + npm
* Compte OpenAI + accès au **Vector Store** (où mes PDF sont indexés)
* Compte GitHub + Vercel

---

## 2) Installation & dépendances

```bash
# Cloner le repo (ou en créer un)
git clone <mon-repo>
cd <mon-repo>

# Installer les libs
npm i @openai/agents openai next react react-dom
```

**package.json** (extrait – versions indicatives) :

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start"
  },
  "dependencies": {
    "@openai/agents": "^0.1.x",
    "openai": "^6.x",
    "next": "15.5.6",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
```

**tsconfig.json** (recommandé) :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "strict": true,
    "skipLibCheck": true,
    "allowJs": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 3) Variables d’environnement

**Local** : créer `.env.local` à la racine :

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4.1-mini
```

**Vercel (Production)** : Project → Settings → **Environment Variables**

* `OPENAI_API_KEY = sk-...`
* `OPENAI_MODEL = gpt-4.1-mini` *(ou un modèle dispo sur mon compte)*

> ⚠️ La clé doit appartenir au **même Project** OpenAI que mes Vector Stores.

---

## 4) Fichiers clés

### `app/api/chat/route.ts`

* Rôle : endpoint POST `/api/chat` qui exécute l’agent RAG et renvoie `{ reply }`.
* Important : `export const runtime = "nodejs"` pour lire les env vars sur Vercel.

```ts
import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, AgentInputItem, Runner } from "@openai/agents";

export const runtime = "nodejs";

// 1) Attacher MES Vector Stores
const fileSearch = fileSearchTool([
  "vs_XXXXXXXXXXXXXXXXXXXXXXXXXXXX", // ← mes IDs VS
]);

// 2) Modèle
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

// 3) Agent
const agent = new Agent({
  name: "Agent Endobiogénie",
  instructions: `Réponds UNIQUEMENT à partir des extraits File Search. 
Si non trouvé, dis-le clairement. Citer (Source : Volume X – …).`,
  model: MODEL,
  tools: [fileSearch],
  modelSettings: { store: true }, // pas de reasoning.* si modèle mini
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    const conversation: AgentInputItem[] = [
      { role: "user", content: [{ type: "input_text", text: message }] },
    ];

    const runner = new Runner();
    const result = await runner.run(agent, conversation);
    const text = (result.finalOutput ?? "").trim();
    if (!text) return NextResponse.json({ error: "Pas de sortie" }, { status: 500 });

    return NextResponse.json({ reply: text });
  } catch (e: any) {
    console.error("Erreur API:", e);
    return NextResponse.json({ error: e?.message ?? "Erreur serveur" }, { status: 500 });
  }
}

// Healthcheck
export async function GET() {
  return NextResponse.json({ ok: true });
}
```

### `app/page.tsx`

* Rôle : page simple pour envoyer la question et afficher `reply`.

```tsx
"use client";
import { useState } from "react";

export default function Home() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setError(""); setAnswer("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      if (!res.ok) setError(data?.error || res.statusText);
      else if (data?.reply) setAnswer(data.reply);
      else setError("Réponse vide du serveur.");
    } catch (err: any) {
      setError(err?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "32px auto" }}>
      <h1>Agent Endobiogénie</h1>
      <form onSubmit={ask} style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Posez votre question…" style={{ flex: 1, padding: 8 }} />
        <button disabled={loading || !q.trim()}>{loading ? "..." : "Envoyer"}</button>
      </form>
      {error && <p style={{ color: "crimson" }}>❌ {error}</p>}
      {answer && <pre style={{ whiteSpace: "pre-wrap" }}>{answer}</pre>}
    </main>
  );
}
```

---

## 5) Vector Stores (RAG)

* Mes PDF sont chargés dans la plateforme OpenAI → créent un **Vector Store**.
* Je récupère les **IDs** `vs_...` et je les mets dans `fileSearchTool([...])`.
* **Règle d’or** : la clé `OPENAI_API_KEY` et les **Vector Stores** doivent être dans le **même Project** OpenAI.

---

## 6) Lancer en local

```bash
npm run dev
# ouvrir http://localhost:3000
```

---

## 7) GitHub

```bash
git init
git add .
git commit -m "feat: RAG endobiogenie MVP"
# créer le repo sur GitHub (ou via gh cli)
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

---

## 8) Vercel – déploiement

**Option A (UI)** : Importer le repo → définir env vars → Deploy
**Option B (CLI)** :

```bash
vercel --prod
```

**À vérifier après déploiement :**

* `/api/chat` (GET) → `{"ok": true}`
* POST `/api/chat` → renvoie `{ reply: "..." }`
* Logs Vercel : pas d’erreurs 500

---

## 9) Test rapide (curl)

```bash
# Healthcheck
curl -s https://<mon-domaine>.vercel.app/api/chat

# Chat
curl -s -X POST "https://<mon-domaine>.vercel.app/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"Quels sont les axes endobiogéniques associés au cassis ?"}'
```

---

## 10) Contrôler que le bot répond **depuis mes sources**

* **Instructions fortes** (dans `Agent.instructions`) :

  > “Réponds UNIQUEMENT à partir des extraits File Search ; sinon dis ‘je n’ai pas trouvé…’. Cite (Source : Volume X – …).”
* **Test** : poser une question **non présente** dans mes PDF → doit répondre “je n’ai pas trouvé…”.
* (Optionnel) **Garde-fou** dans la route : refuser les réponses **sans** “(Source : …)”.

---

## 11) Structure du projet (simplifiée)

```
app/
  api/
    chat/
      route.ts      # endpoint RAG
  page.tsx          # UI minimal
public/
README_RAG.md
.next/
node_modules/
package.json
tsconfig.json
.env.local          # local seulement (NE PAS COMMIT)
```

---

## 12) Dépannage (checklist)

* **Build Vercel échoue**

  * `Module not found '@openai/agents'` → `npm i @openai/agents openai` + commit + redeploy
  * Type error `reasoning.effort unsupported` → enlever `reasoning.*` ou changer de modèle (ex. `o4-mini`)
  * `model does not exist` → passer à `gpt-4.1-mini` ou un modèle disponible

* **Prod 200 mais pas de réponse visible**

  * Front lit **`data.reply`** (et pas un message dur “clé API”)

* **RAG ne semble pas utilisé**

  * Vérifier `fileSearchTool([... vs_...])` avec les **bons IDs**
  * Vérifier que la **clé API** pointe vers le **même Project** que les Vector Stores
  * Forcer les **citations** dans la réponse (instruction + regex côté serveur)

* **Env vars**

  * `OPENAI_API_KEY` bien définie en **Production** (Vercel)
  * (optionnel) `OPENAI_MODEL` cohérent

* **Runtime**

  * `export const runtime = "nodejs"` dans la route

---

## 13) Évolutions possibles (notes rapides)

* Historique de conversation (stocker `AgentInputItem[]` en DB par session)
* Page **Upload** + ingestion auto dans Vector Store
* Génération de **fiches/PDF** (schema JSON → rendu PDF)
* Auth (Clerk/Auth0), Stripe (abos), multi-tenant (1 Vector Store par org)

---

## License / Mentions

* Utilisation éducative / interne.
* Les réponses ne substituent pas un avis médical.
* Respect RGPD si données personnelles.

---

**Fin du mémo.**
Si je reprends le projet plus tard : vérifier **env vars**, **Vector Stores**, **modèle**, **shape `{ reply }`**, puis redeployer.
