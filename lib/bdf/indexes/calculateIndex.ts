// @ts-nocheck
import type { IndexDefinition, CalculatedIndexValue } from "./index-types";
import { INDEXES } from "./indexes.config";
import { computeRatio, computeProduct, computeComposite } from "./index-formulas";

export function calculateIndex(
  index: IndexDefinition,
  biomarkers: Record<string, number | null>,
  indexCache: Record<string, number | null>
): CalculatedIndexValue {
  const missing: string[] = [];
  const dependencies: string[] = [];

  // a) et b) Vérifier les biomarqueurs requis
  for (const code of index.required_biomarkers) {
    dependencies.push(code);
    if (biomarkers[code] == null) {
      missing.push(code);
    }
  }

  // c) Si index secret, ne pas calculer
  if (index.formula_type === "secret") {
    return {
      id: index.id,
      value: null,
      missing,
      dependencies,
      status: "unknown"
    };
  }

  let value: number | null = null;

  // Gestion des index COMPOSITES
  if (index.formula_type === "composite") {
    // a) Résoudre les index requis (requires_indexes)
    const requiredIndexes = index.requires_indexes || [];

    for (const requiredId of requiredIndexes) {
      dependencies.push(requiredId);

      // Vérifier dans le cache
      if (indexCache[requiredId] === undefined) {
        // Calculer l'index dépendant de manière récursive
        const requiredDef = INDEXES.find((idx) => idx.id === requiredId);

        if (!requiredDef) {
          // Index non trouvé dans la configuration
          missing.push(requiredId);
          continue;
        }

        // Appel récursif
        const result = calculateIndex(requiredDef, biomarkers, indexCache);
        indexCache[requiredId] = result.value;
      }

      // Si la valeur résolue est null, marquer comme manquant
      if (indexCache[requiredId] == null && !missing.includes(requiredId)) {
        missing.push(requiredId);
      }
    }

    // b) Construire le context pour computeComposite
    const context: Record<string, number | null> = {};

    // Ajouter les biomarqueurs
    for (const biomarkerId of index.required_biomarkers) {
      context[biomarkerId] = biomarkers[biomarkerId] ?? null;
    }

    // Ajouter les index requis
    for (const indexId of requiredIndexes) {
      context[indexId] = indexCache[indexId] ?? null;
    }

    // c) Si des dépendances manquent, ne pas calculer
    if (missing.length > 0) {
      return {
        id: index.id,
        value: null,
        missing,
        dependencies,
        status: "unknown"
      };
    }

    // d) Calculer la formule composite
    value = computeComposite(index.formula ?? "", context);
  }

  // Gestion des index DIRECTS
  else {
    // d) Si des biomarqueurs manquent, ne pas calculer
    if (missing.length > 0) {
      return {
        id: index.id,
        value: null,
        missing,
        dependencies,
        status: "unknown"
      };
    }

    // e) Calcul ratio
    if (index.formula_type === "ratio") {
      const [aKey, bKey] = index.required_biomarkers;
      value = computeRatio(biomarkers[aKey], biomarkers[bKey]);
    }

    // f) Calcul product
    else if (index.formula_type === "product") {
      const [aKey, bKey] = index.required_biomarkers;
      value = computeProduct(biomarkers[aKey], biomarkers[bKey]);
    }
  }

  // h) Déterminer le status basé sur les seuils de référence
  let status: import("./index-types").IndexStatus = "normal";
  let interpretation: string | undefined = undefined;

  if (index.referenceRange && value !== null) {
    if (value < index.referenceRange.low) {
      status = "low";
      interpretation = index.referenceRange.interpretation?.low;
    } else if (value > index.referenceRange.high) {
      status = "high";
      interpretation = index.referenceRange.interpretation?.high;
    } else {
      status = "normal";
      interpretation = index.referenceRange.interpretation?.normal;
    }
  } else if (value === null) {
    status = "unknown";
  }

  // i) Retourner le résultat
  return {
    id: index.id,
    value,
    missing,
    dependencies,
    status,
    interpretation
  };
}

export function calculateIndexById(
  id: string,
  biomarkers: Record<string, number | null>,
  indexCache: Record<string, number | null> = {}
): CalculatedIndexValue | null {
  const def = INDEXES.find((idx) => idx.id === id);
  if (!def) return null;
  return calculateIndex(def, biomarkers, indexCache);
}
