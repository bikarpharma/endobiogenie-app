export function computeRatio(a: number | null, b: number | null) {
  if (a == null || b == null || b === 0) return null;
  return a / b;
}

export function computeProduct(a: number | null, b: number | null) {
  if (a == null || b == null) return null;
  return a * b;
}

export function computeComposite(
  formula: string,
  context: Record<string, number | null>
): number | null {
  if (!formula) return null;

  // Remplacer tous les identifiants (biomarqueurs ou index) par leurs valeurs
  const expression = formula.replace(/\b[A-Z0-9_]+\b/gi, (match) => {
    const value = context[match];
    if (value == null) {
      // Marquage pour retour null si une dépendance manque
      return "NaN";
    }
    return String(value);
  });

  try {
    // Évaluation contrôlée de l'expression arithmétique
    // Supporte: +, -, *, /, (), nombres décimaux
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${expression});`);
    const result = fn();
    if (typeof result !== "number" || Number.isNaN(result) || !Number.isFinite(result)) {
      return null;
    }
    return result;
  } catch {
    return null;
  }
}

/**
 * Calcule une somme de biomarqueurs ou index
 * @param values - Liste de valeurs à sommer
 * @returns Somme ou null si une valeur manque
 */
export function computeSum(...values: (number | null)[]): number | null {
  if (values.some((v) => v == null)) return null;
  return values.reduce((sum, v) => sum! + v!, 0);
}
