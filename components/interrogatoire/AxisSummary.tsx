// components/interrogatoire/AxisSummary.tsx
// SUPPRIMÉ - L'ancienne "Synthèse préliminaire" n'est plus utilisée
// La synthèse est maintenant gérée par l'Assistant IA

"use client";

import type { AxisKey } from "@/lib/interrogatoire/config";

interface AxisSummaryProps {
  axisKey: AxisKey;
  values: Record<string, any>;
}

/**
 * Composant désactivé - retourne null
 * La synthèse préliminaire a été remplacée par la Synthèse IA
 */
export function AxisSummary({ axisKey, values }: AxisSummaryProps) {
  // Ne rien afficher - composant désactivé
  return null;
}