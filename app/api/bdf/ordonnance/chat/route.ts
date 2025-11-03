// ========================================
// API CHAT ORDONNANCE BDF
// ========================================
// 📖 Explication simple :
// API pour discuter de l'ordonnance générée avec l'assistant.
// Multi-VS : Priorité Endo, secondaires Gemmo+Aroma+Phyto

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
    const { message, ordonnance, bdfContext, chatHistory } = body;

    if (!message || !ordonnance) {
      return NextResponse.json(
        { error: "Message et ordonnance requis" },
        { status: 400 }
      );
    }

    // 1️⃣ Construire le contexte complet pour la conversation
    const indexesFormatted = bdfContext.indexes
      ?.map((idx: any) => `${idx.label}: ${idx.value.toFixed(2)} (${idx.comment})`)
      .join("\n") || "";

    const inputsFormatted = Object.entries(bdfContext.inputs || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    const contextComplet = `
CONTEXTE DE LA CONSULTATION
============================

📊 ANALYSE BDF :
${inputsFormatted}

📈 INDEX CALCULÉS :
${indexesFormatted}

${bdfContext.ragEnrichment?.resumeFonctionnel ? `
🔬 RÉSUMÉ FONCTIONNEL :
${bdfContext.ragEnrichment.resumeFonctionnel}
` : ""}

${bdfContext.ragEnrichment?.axesSollicites?.length > 0 ? `
⚙️ AXES SOLLICITÉS :
${bdfContext.ragEnrichment.axesSollicites.map((axe: string) => `- ${axe}`).join("\n")}
` : ""}

${bdfContext.ragEnrichment?.lectureEndobiogenique ? `
🌿 LECTURE ENDOBIOGÉNIQUE :
${bdfContext.ragEnrichment.lectureEndobiogenique}
` : ""}

💊 ORDONNANCE GÉNÉRÉE :
${ordonnance}
`;

    // 2️⃣ Préparer l'historique des messages pour l'agent
    const conversationHistory = chatHistory?.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })) || [];

    // 3️⃣ Agent avec tous les vector stores (Endo + Gemmo + Aroma + Phyto)
    const agent = new Agent({
      name: "Expert Ordonnance - Discussion",
      instructions: `Tu es un expert en Endobiogénie et phytothérapie spécialisé dans l'accompagnement des prescriptions.

CONTEXTE PATIENT ET ORDONNANCE :
${contextComplet}

MISSION :
Réponds aux questions du médecin sur l'ordonnance ci-dessus avec précision et pédagogie.

DIRECTIVES :

1. **Justifications scientifiques** :
   - Base tes réponses sur l'analyse BdF (index, axes sollicités)
   - Référence la lecture endobiogénique
   - Cite les sources documentaires pertinentes (Endobiogénie, Gemmo, Aroma, Phyto)

2. **Alternatives et adaptations** :
   - Propose des alternatives si demandées
   - Suggère des adaptations selon le profil (âge, terrain, contre-indications)
   - Explique les équivalences galéniques (TM, EPS, Gemmo, HE)

3. **Contre-indications et précautions** :
   - Signale systématiquement les CI et interactions
   - Adapte selon le terrain (femme enceinte, enfant, personne âgée, insuffisance organique)

4. **Posologie et durée** :
   - Justifie les dosages par rapport aux axes sollicités
   - Explique la logique temporelle (cure courte/longue, réévaluation)

5. **Pédagogie** :
   - Reste concis (2-4 paragraphes maximum)
   - Structure tes réponses (utilise des sous-titres si pertinent)
   - Évite le jargon excessif, privilégie la clarté

6. **Ton** :
   - Professionnel mais accessible
   - Factuel, neutre, scientifique
   - Aucun emoji (c'est un échange médical)

IMPORTANT :
- Ne modifie pas l'ordonnance sauf si le médecin le demande explicitement
- Base-toi TOUJOURS sur le contexte BdF fourni
- Cite tes sources quand tu proposes des alternatives`,
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [VS_ENDO, VS_GEMMO, VS_AROMA, VS_PHYTO],
        },
      },
      max_tokens: 2000,
    });

    const runner = new Runner();

    // 4️⃣ Construire les messages à envoyer (historique + nouveau message)
    const messages: AgentInputItem[] = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: [{ type: "input_text" as const, text: msg.content }],
      })),
      {
        role: "user" as const,
        content: [{ type: "input_text" as const, text: message }],
      },
    ];

    console.log("🔄 Chat ordonnance - Message:", message);
    const result = await runner.run(agent, messages);

    const reply = result.finalOutput || "Désolé, je n'ai pas pu générer de réponse.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("❌ Erreur chat ordonnance:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la discussion sur l'ordonnance" },
      { status: 500 }
    );
  }
}
