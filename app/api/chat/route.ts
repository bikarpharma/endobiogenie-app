// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fileSearchTool, Agent, AgentInputItem, Runner } from "@openai/agents";

export const runtime = "nodejs";

// Vector Stores (remplace/ajoute si besoin)
const fileSearch = fileSearchTool([
  "vs_68e87a07ae6c81918d805c8251526bda",
]);

// Modèle (celui-ci ne supporte pas 'reasoning', c'est OK)
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const agent = new Agent({
  name: "Agent Endobiogénie",
  instructions: `Tu es EndoBot, une intelligence experte en théorie de l'endobiogénie et en phytothérapie clinique intégrative.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT à partir des extraits retrouvés via File Search (Vector Stores).
2. Si aucune information fiable n'est disponible, dis-le clairement : "Ce point n'est pas explicitement détaillé dans les volumes consultés."
3. NE FOURNIS JAMAIS de références de type "(Source : Volume X, section Y)" ou "(Volume X - section Y)".
4. Ne mentionne JAMAIS les numéros de volume, sections, chapitres ou pages dans ta réponse.
5. Réponds de manière naturelle et fluide, comme si tu expliquais directement à partir de tes connaissances.

STRUCTURE DE RÉPONSE :
- Contexte physiopathologique
- Mécanismes endobiogéniques impliqués
- Lecture fonctionnelle du terrain
- Intégration thérapeutique (phytothérapie si pertinent)

Sois précis, pédagogique et appliqué. Ta réponse doit être autonome et complète, sans aucune référence bibliographique.`,
  model: MODEL,
  tools: [fileSearch],
  // pas de 'reasoning' ici car le modèle ne le supporte pas
  modelSettings: { store: true },
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

    if (!result.finalOutput) {
      return NextResponse.json({ error: "Pas de sortie" }, { status: 500 });
    }

    return NextResponse.json({ reply: result.finalOutput });
  } catch (e: any) {
    console.error("Erreur API:", e);
    return NextResponse.json(
      { error: e?.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Healthcheck simple
export async function GET() {
  return NextResponse.json({ ok: true });
}
