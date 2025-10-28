// ========================================
// ANALYSE BIOLOGIQUE ENRICHIE (VERSION 2.0)
// ========================================
// Pipeline complet :
// 1. Extrait valeurs biologiques
// 2. Appelle API /bdf/analyse pour calculs quantitatifs
// 3. Récupère contexte endobiogénique du vector store
// 4. Fusionne tout en réponse enrichie et structurée

import type { LabValues } from "@/lib/bdf/types";
import type { InterpretationPayload } from "@/lib/bdf/types";
import { buildLabPayloadFromMessage, hasLabValues } from "./labExtractor";
import { retrieveEndobiogenieContext } from "./vectorStoreRetrieval";

/**
 * Analyse enrichie d'un message contenant des valeurs biologiques
 * VERSION 2.0 avec contexte endobiogénique du vector store
 * @param message - Message utilisateur
 * @returns Texte formaté avec analyse BdF + contexte endobiogénie
 */
export async function analyseBiologie(message: string): Promise<string> {
  try {
    // ========================================
    // ÉTAPE 1 : EXTRACTION DES VALEURS
    // ========================================
    const labPayload: LabValues = buildLabPayloadFromMessage(message);

    if (!hasLabValues(labPayload)) {
      return (
        "Je n'ai pas pu extraire de valeurs biologiques de votre message. " +
        "Veuillez fournir les valeurs au format : GR 4.5, GB 6.2, TSH 2.1, etc."
      );
    }

    // ========================================
    // ÉTAPE 2 : APPEL API BdF POUR CALCULS
    // ========================================
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/bdf/analyse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(labPayload),
    });

    if (!response.ok) {
      throw new Error(`Erreur API BdF: ${response.statusText}`);
    }

    const interpretation: InterpretationPayload = await response.json();

    // ========================================
    // ÉTAPE 3 : CONSTRUCTION QUERY RAG
    // ========================================
    const ragQuery = buildRagQuery(interpretation);

    // ========================================
    // ÉTAPE 4 : RÉCUPÉRATION CONTEXTE ENDO
    // ========================================
    const contextPassages = await retrieveEndobiogenieContext(ragQuery);

    // ========================================
    // ÉTAPE 5 : GÉNÉRATION RÉPONSE ENRICHIE
    // ========================================
    return formatEnrichedResponse(interpretation, labPayload, contextPassages);
  } catch (error: any) {
    console.error("Erreur dans analyseBiologie enrichie:", error);
    return (
      "Une erreur s'est produite lors de l'analyse de votre bilan. " +
      "Veuillez réessayer ou vérifier le format de vos valeurs."
    );
  }
}

/**
 * Construit la requête pour le RAG endobiogénie
 * @param interpretation - Résultat BdF
 * @returns Query optimisée pour le vector store
 */
function buildRagQuery(interpretation: InterpretationPayload): string {
  const axesList = interpretation.axesDominants.join(", ");

  return `
Profil fonctionnel : ${interpretation.summary}

Axes neuroendocriniens dominants identifiés : ${axesList}

Explique la logique d'adaptation du terrain en langage endobiogénie :
- Dynamique de l'axe corticotrope (ACTH → cortisol) : gestion d'urgence, catabolisme
- Dynamique de l'axe thyréotrope : vitesse métabolique, réponse cellulaire
- Dynamique de l'axe gonadotrope : anabolisme, renouvellement tissulaire
- Équilibre catabolisme/anabolisme et pression pro-croissance

Fournis une interprétation fonctionnelle claire et pédagogique.
`.trim();
}

/**
 * Formate la réponse enrichie finale
 * @param interpretation - Résultat BdF
 * @param labValues - Valeurs biologiques
 * @param contextPassages - Contexte du vector store
 * @returns Texte structuré en français
 */
function formatEnrichedResponse(
  interpretation: InterpretationPayload,
  labValues: LabValues,
  contextPassages: string[]
): string {
  const sections: string[] = [];

  // ========================================
  // HEADER
  // ========================================
  sections.push("🔬 **ANALYSE BIOLOGIE DES FONCTIONS (BdF) - ENRICHIE**\n");

  // ========================================
  // VALEURS ANALYSÉES
  // ========================================
  sections.push("**📋 Valeurs biologiques analysées :**");
  const valuesText = Object.entries(labValues)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
  sections.push(valuesText + "\n");

  // ========================================
  // RÉSUMÉ FONCTIONNEL
  // ========================================
  sections.push("**🔬 Résumé fonctionnel :**");
  sections.push(interpretation.summary + "\n");

  // ========================================
  // INDEX CALCULÉS
  // ========================================
  sections.push("**📊 Lecture des index :**");
  const indexesText = Object.entries(interpretation.indexes)
    .map(([key, indexValue]) => {
      const name = formatIndexName(key);
      if (indexValue.value === null) {
        return `- **${name}** : ${indexValue.comment}`;
      }
      return `- **${name}** : ${indexValue.value.toFixed(2)} → ${indexValue.comment}`;
    })
    .join("\n");
  sections.push(indexesText + "\n");

  // ========================================
  // AXES SOLLICITÉS
  // ========================================
  if (interpretation.axesDominants.length > 0) {
    sections.push("**⚙️ Axes sollicités :**");
    const axesText = interpretation.axesDominants
      .map((axe) => `- ${axe}`)
      .join("\n");
    sections.push(axesText + "\n");
  }

  // ========================================
  // 🆕 LECTURE ENDOBIOGÉNIQUE DU TERRAIN
  // (NOUVEAU : enrichi avec vector store)
  // ========================================
  sections.push("**🧠 Lecture endobiogénique du terrain :**");
  const endoReading = synthesizeEndobiogenicReading(
    interpretation,
    contextPassages
  );
  sections.push(endoReading + "\n");

  // ========================================
  // NOTE TECHNIQUE
  // ========================================
  sections.push("**🧾 Note technique :**");
  sections.push(interpretation.noteTechnique);

  return sections.join("\n");
}

/**
 * Synthétise la lecture endobiogénique à partir du contexte RAG
 * @param interpretation - Résultat BdF
 * @param contextPassages - Passages du vector store
 * @returns Paragraphe de lecture fonctionnelle
 */
function synthesizeEndobiogenicReading(
  interpretation: InterpretationPayload,
  contextPassages: string[]
): string {
  const parts: string[] = [];

  // Introduction basée sur le summary
  parts.push(
    `Ce profil fonctionnel révèle une dynamique adaptative particulière du terrain biologique.`
  );

  // Intégration des passages du vector store
  if (contextPassages.length > 0) {
    // On utilise les passages pour enrichir la lecture
    contextPassages.forEach((passage) => {
      // Nettoie et intègre le passage
      const cleaned = passage.trim();
      if (cleaned.length > 30) {
        parts.push(cleaned);
      }
    });
  } else {
    // Fallback si pas de contexte RAG
    parts.push(
      "La lecture des index suggère une orientation spécifique des axes neuroendocriniens. " +
        "Chaque axe (corticotrope, thyréotrope, gonadotrope) contribue à l'équilibre global " +
        "entre catabolisme et anabolisme, entre adaptation d'urgence et renouvellement de fond."
    );
  }

  // Analyse spécifique basée sur les axes dominants
  const axesLower = interpretation.axesDominants
    .map((a) => a.toLowerCase())
    .join(" ");

  if (axesLower.includes("cortico") || axesLower.includes("acth")) {
    parts.push(
      "La sollicitation de l'axe corticotrope oriente le terrain vers une gestion de l'urgence adaptative, " +
        "avec mobilisation des substrats et orientation catabolique."
    );
  }

  if (axesLower.includes("thyréo") || axesLower.includes("thyro")) {
    parts.push(
      "L'axe thyréotrope module la vitesse métabolique et la capacité de réponse cellulaire. " +
        "Son activité conditionne l'efficacité avec laquelle le terrain répond aux sollicitations."
    );
  }

  if (
    axesLower.includes("gonado") ||
    axesLower.includes("génital") ||
    axesLower.includes("androgén") ||
    axesLower.includes("œstrogén")
  ) {
    parts.push(
      "Le système gonadotrope participe à la dynamique anabolique de fond, " +
        "soutenant le renouvellement tissulaire et la pression pro-croissance."
    );
  }

  // Conclusion
  parts.push(
    "Cette lecture fonctionnelle s'inscrit dans une perspective globale du terrain, " +
      "non comme un diagnostic, mais comme un outil d'analyse des régulations en cours."
  );

  return parts.join(" ");
}

/**
 * Formate les noms d'index pour l'affichage
 * @param key - Clé de l'index
 * @returns Nom formaté
 */
function formatIndexName(key: string): string {
  const names: Record<string, string> = {
    indexGenital: "Index génital",
    indexThyroidien: "Index thyroïdien",
    gT: "Index génito-thyroïdien (gT)",
    indexAdaptation: "Index d'adaptation",
    indexOestrogenique: "Index œstrogénique",
    turnover: "Index de turn-over tissulaire",
  };
  return names[key] || key;
}
