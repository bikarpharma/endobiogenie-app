// ========================================
// ANALYSE BIOLOGIQUE AUTOMATISÉE
// ========================================
// Appelle l'API interne /bdf/analyse et formate
// la réponse en texte structuré et compréhensible

import type { LabValues } from "@/lib/bdf/types";
import type { InterpretationPayload } from "@/lib/bdf/types";
import { buildLabPayloadFromMessage, hasLabValues } from "./labExtractor";

/**
 * Analyse un message contenant des valeurs biologiques
 * Pipeline :
 * 1. Extrait les valeurs avec buildLabPayloadFromMessage
 * 2. Appelle POST /bdf/analyse
 * 3. Formate la réponse en texte structuré
 * @param message - Message utilisateur
 * @returns Texte formaté avec l'analyse BdF
 */
export async function analyseBiologie(message: string): Promise<string> {
  try {
    // 1️⃣ Extraire les valeurs biologiques
    const labPayload: LabValues = buildLabPayloadFromMessage(message);

    // Vérifier qu'on a au moins une valeur
    if (!hasLabValues(labPayload)) {
      return (
        "Je n'ai pas pu extraire de valeurs biologiques de votre message. " +
        "Veuillez fournir les valeurs au format : GR 4.5, GB 6.2, TSH 2.1, etc."
      );
    }

    // 2️⃣ Appeler l'API interne /bdf/analyse
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/bdf/analyse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(labPayload),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.statusText}`);
    }

    const result: InterpretationPayload = await response.json();

    // 3️⃣ Formater la réponse en texte structuré
    return formatBdfResponse(result, labPayload);
  } catch (error: any) {
    console.error("Erreur dans analyseBiologie:", error);
    return (
      "Une erreur s'est produite lors de l'analyse de votre bilan. " +
      "Veuillez réessayer ou vérifier le format de vos valeurs."
    );
  }
}

/**
 * Formate le résultat BdF en texte lisible et structuré
 * @param result - Résultat de l'API BdF
 * @param labValues - Valeurs biologiques extraites
 * @returns Texte formaté
 */
function formatBdfResponse(
  result: InterpretationPayload,
  labValues: LabValues
): string {
  const sections: string[] = [];

  // 🔬 HEADER
  sections.push("🔬 **ANALYSE BIOLOGIE DES FONCTIONS (BdF)**\n");

  // 📋 VALEURS REÇUES
  sections.push("**📋 Valeurs biologiques analysées :**");
  const valuesText = Object.entries(labValues)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
  sections.push(valuesText + "\n");

  // 📊 RÉSUMÉ FONCTIONNEL
  sections.push("**📊 Résumé fonctionnel :**");
  sections.push(result.summary + "\n");

  // 📈 INDEX CALCULÉS
  sections.push("**📈 Index calculés :**");
  const indexesText = Object.entries(result.indexes)
    .map(([key, indexValue]) => {
      if (indexValue.value === null) {
        return `- **${formatIndexName(key)}** : ${indexValue.comment}`;
      }
      return `- **${formatIndexName(key)}** : ${indexValue.value.toFixed(2)} → ${indexValue.comment}`;
    })
    .join("\n");
  sections.push(indexesText + "\n");

  // ⚙️ AXES DOMINANTS
  if (result.axesDominants.length > 0) {
    sections.push("**⚙️ Axes dominants identifiés :**");
    const axesText = result.axesDominants.map((axe) => `- ${axe}`).join("\n");
    sections.push(axesText + "\n");
  }

  // 🧾 NOTE TECHNIQUE
  sections.push("**🧾 Note technique :**");
  sections.push(result.noteTechnique);

  return sections.join("\n");
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
