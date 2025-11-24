import type { IndexCategory } from "./index-categories";

export type IndexFormulaType =
  | "ratio"
  | "product"
  | "composite"
  | "secret";

export interface IndexDefinition {
  id: string;
  label: string;
  category: IndexCategory;
  formula: string | null;
  formula_type: IndexFormulaType;
  required_biomarkers: string[];
  requires_indexes?: string[];
  description: string;
  referenceRange?: {
    low: number;
    high: number;
    interpretation?: {
      veryLow?: string;
      low?: string;
      normal?: string;
      high?: string;
      veryHigh?: string;
    };
  };
}

export type IndexStatus = "low" | "normal" | "high" | "error" | "unknown";

export interface CalculatedIndexValue {
  id: string;
  value: number | null;
  missing: string[];
  dependencies: string[];
  status: IndexStatus;
  interpretation?: string;
}

export type { IndexCategory } from "./index-categories";
