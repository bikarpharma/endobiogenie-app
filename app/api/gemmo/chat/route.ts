import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Corps de requête invalide. JSON requis." },
      { status: 400 }
    );
  }

  const question =
    typeof body === "object" && body !== null && "question" in body
      ? (body as { question?: unknown }).question
      : undefined;

  if (typeof question !== "string" || question.trim() === "") {
    return NextResponse.json(
      { error: "Le champ 'question' est requis." },
      { status: 400 }
    );
  }

  const vectorStoreId = process.env.GEMMO_VECTOR_STORE_ID;
  // TODO: Utiliser `vectorStoreId` et interroger le vector store pour obtenir une réponse pertinente.
  void vectorStoreId;

  const answer = `Réponse factice pour : ${question}`;
  // TODO: Remplacer la réponse factice par les résultats renvoyés par le vector store.

  return NextResponse.json({ answer, citations: [] });
}
