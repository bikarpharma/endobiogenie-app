import { BdfBiomarkerSummary } from "./BdfBiomarkerSummary";
import { BdfIndexSummary } from "./BdfIndexSummary";

interface BiomarkerResult {
  code: string;
  name: string;
  value: number;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
  category: string;
}

interface IndexResult {
  code: string;
  name: string;
  value: number | null;
  category: string;
  subCategory?: string;
  description?: string;
  formulaType?: string;
}

interface BdfData {
  panel: {
    code: string;
    name: string;
  } | null;
  biomarkers: BiomarkerResult[];
  indexes: IndexResult[];
}

interface BdfSummaryProps {
  data: BdfData;
}

export function BdfSummary({ data }: BdfSummaryProps) {
  const calculatedIndexes = data.indexes.filter((idx) => idx.value !== null);
  const missingIndexes = data.indexes.filter((idx) => idx.value === null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Synthèse BdF
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Panel utilisé</p>
            <p className="text-lg font-semibold text-gray-900">
              {data.panel?.name || "Non spécifié"}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Biomarqueurs renseignés</p>
            <p className="text-lg font-semibold text-gray-900">
              {data.biomarkers.length}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Index calculés</p>
            <p className="text-lg font-semibold text-gray-900">
              {calculatedIndexes.length} / {data.indexes.length}
            </p>
            {missingIndexes.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {missingIndexes.length} manquant(s)
              </p>
            )}
          </div>
        </div>
      </div>

      <BdfBiomarkerSummary biomarkers={data.biomarkers} />
      <BdfIndexSummary indexes={data.indexes} />
    </div>
  );
}
