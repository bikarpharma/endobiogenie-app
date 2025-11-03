// ========================================
// API GÉNÉRATION ORDONNANCE BDF
// ========================================
// 📖 Explication simple :
// API qui génère une ordonnance personnalisée basée sur :
// 1. Les index BdF calculés
// 2. L'enrichissement RAG
// 3. Multi-VS : Priorité Endo, secondaires Gemmo+Aroma+Phyto

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fileSearchTool, Agent, Runner } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";

// Vector stores IDs
const VS_ENDO = "vs_68e87a07ae6c81918d805c8251526bda"; // Endobiogénie (priorité absolue)
const VS_GEMMO = "vs_68fe63bee4bc8191b2ab5e6813d5bed2"; // Gemmothérapie
const VS_AROMA = "vs_68feabf4185c8191afbadcc2cfe972a7"; // Aromathérapie
const VS_PHYTO = "vs_68feb856fedc81919ef239741143871e"; // Phytothérapie

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { indexes, inputs, ragEnrichment } = body;

    if (!indexes || !inputs) {
      return NextResponse.json(
        { error: "Données BdF manquantes (indexes, inputs)" },
        { status: 400 }
      );
    }

    // 1️⃣ Préparer le contexte BdF pour la génération
    const indexesFormatted = indexes
      .map((idx: any) => `${idx.label}: ${idx.value.toFixed(2)} (${idx.comment})`)
      .join("\n");

    const inputsFormatted = Object.entries(inputs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    const contextBdf = `
ANALYSE BDF COMPLÈTE
====================

📊 VALEURS BIOLOGIQUES :
${inputsFormatted}

📈 INDEX CALCULÉS :
${indexesFormatted}

${ragEnrichment?.resumeFonctionnel ? `
🔬 RÉSUMÉ FONCTIONNEL :
${ragEnrichment.resumeFonctionnel}
` : ""}

${ragEnrichment?.axesSollicites?.length > 0 ? `
⚙️ AXES SOLLICITÉS :
${ragEnrichment.axesSollicites.map((axe: string) => `- ${axe}`).join("\n")}
` : ""}

${ragEnrichment?.lectureEndobiogenique ? `
🌿 LECTURE ENDOBIOGÉNIQUE :
${ragEnrichment.lectureEndobiogenique}
` : ""}
`;

    // 2️⃣ Agent principal avec vector store Endobiogénie (priorité absolue)
    const agentEndo = new Agent({
      name: "Endobiogénie Expert - Prescription",
      instructions: `Tu es un expert en Endobiogénie spécialisé dans la prescription de plantes médicinales.

CONTEXTE :
${contextBdf}

MISSION :
Génère une ordonnance phytothérapeutique personnalisée basée sur l'analyse BdF ci-dessus.

STRUCTURE OBLIGATOIRE DE L'ORDONNANCE :

1. **OBJECTIF THÉRAPEUTIQUE**
   - Résumé en 2-3 phrases de la stratégie thérapeutique
   - Axes neuroendocriniens ciblés

2. **PRESCRIPTION**
   Pour chaque plante :
   - 🌿 Nom latin (Nom français)
   - Forme galénique : TM / EPS / Macérat glycériné / Infusion
   - Dosage précis
   - Moment de prise (matin/midi/soir, avant/après repas)
   - Durée du traitement
   - Justification endobiogénique (axe sollicité, action spécifique)

3. **POSOLOGIE QUOTIDIENNE SYNTHÉTIQUE**
   - Tableau récapitulatif : Matin | Midi | Soir

4. **CONSEILS D'HYGIÈNE DE VIE**
   - Alimentation spécifique
   - Rythmes biologiques (sommeil, activité physique)
   - Gestion du stress (si pertinent)

5. **DURÉE ET SUIVI**
   - Durée du traitement initial
   - Moment de réévaluation
   - Signes d'amélioration attendus

CONTRAINTES :
- Privilégier 3-5 plantes maximum (éviter la polypharmacie)
- Justifier CHAQUE plante par l'analyse BdF
- Préciser les contre-indications si nécessaire
- Style : professionnel, précis, pédagogique`,
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [VS_ENDO],
        },
      },
      max_tokens: 4000,
    });

    const runnerEndo = new Runner();

    // 3️⃣ Génération de l'ordonnance avec source principale (Endo)
    console.log("🔄 Génération ordonnance avec VS Endobiogénie...");
    const resultEndo = await runnerEndo.run(agentEndo, [
      {
        role: "user",
        content: [{
          type: "input_text",
          text: "Génère l'ordonnance phytothérapeutique complète en suivant exactement la structure demandée."
        }],
      },
    ] as AgentInputItem[]);

    let ordonnanceText = resultEndo.finalOutput || "";

    // 4️⃣ Enrichissement optionnel avec sources secondaires (Gemmo, Aroma, Phyto)
    // On enrichit uniquement si on peut apporter des précisions galéniques
    const agentSecondary = new Agent({
      name: "Galénique Expert - Enrichissement",
      instructions: `Tu es un expert en galénique (gemmothérapie, aromathérapie, phytothérapie).

ORDONNANCE GÉNÉRÉE :
${ordonnanceText}

MISSION :
Enrichis l'ordonnance UNIQUEMENT si tu peux apporter des précisions galéniques utiles :
- Équivalences entre formes galéniques (TM vs EPS vs Gemmo)
- Synergies en aromathérapie (huiles essentielles complémentaires)
- Alternatives en gemmothérapie (bourgeons spécifiques)

Si tu n'as rien d'utile à ajouter, réponds simplement "AUCUN ENRICHISSEMENT".

Format de réponse (si enrichissement pertinent) :
📝 ENRICHISSEMENTS GALÉNIQUES :
- [Plante] : [Précision/Alternative/Synergie]

Reste concis (3-5 lignes maximum).`,
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [VS_GEMMO, VS_AROMA, VS_PHYTO],
        },
      },
      max_tokens: 800,
    });

    console.log("🔄 Enrichissement avec VS secondaires (Gemmo/Aroma/Phyto)...");
    const resultSecondary = await runnerEndo.run(agentSecondary, [
      {
        role: "user",
        content: [{
          type: "input_text",
          text: "Enrichis l'ordonnance avec des précisions galéniques si pertinent."
        }],
      },
    ] as AgentInputItem[]);

    const enrichmentText = resultSecondary.finalOutput || "";

    // 5️⃣ Ajouter l'enrichissement si pertinent
    if (enrichmentText && !enrichmentText.includes("AUCUN ENRICHISSEMENT")) {
      ordonnanceText += `\n\n---\n\n${enrichmentText}`;
    }

    // 6️⃣ Ajouter métadonnées pour le chat de continuité
    const metadata = {
      indexes,
      inputs,
      ragEnrichment,
      vectorStores: {
        primary: VS_ENDO,
        secondary: [VS_GEMMO, VS_AROMA, VS_PHYTO],
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      ordonnance: ordonnanceText,
      metadata,
    });
  } catch (error: any) {
    console.error("❌ Erreur génération ordonnance:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la génération de l'ordonnance" },
      { status: 500 }
    );
  }
}
