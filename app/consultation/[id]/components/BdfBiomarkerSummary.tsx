interface BiomarkerResult {
  code: string;
  name: string;
  value: number;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
  category: string;
}

interface BdfBiomarkerSummaryProps {
  biomarkers: BiomarkerResult[];
}

export function BdfBiomarkerSummary({
  biomarkers,
}: BdfBiomarkerSummaryProps) {
  if (biomarkers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Biomarqueurs
        </h2>
        <p className="text-sm text-gray-500">Aucun biomarqueur renseigné</p>
      </div>
    );
  }

  const isInRange = (
    value: number,
    min?: number,
    max?: number
  ): boolean | null => {
    if (min === undefined && max === undefined) return null;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Biomarqueurs</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {biomarkers.map((biomarker) => {
          const inRange = isInRange(
            biomarker.value,
            biomarker.referenceMin,
            biomarker.referenceMax
          );

          return (
            <div
              key={biomarker.code}
              className="p-4 border rounded-lg bg-gray-50 space-y-2"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-gray-900 text-sm">
                  {biomarker.name}
                </h3>
                {inRange !== null && (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      inRange
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {inRange ? "Normal" : "Hors normes"}
                  </span>
                )}
              </div>

              <p className="text-2xl font-bold text-blue-600">
                {biomarker.value.toFixed(2)}
                {biomarker.unit && (
                  <span className="text-sm text-gray-500 ml-1 font-normal">
                    {biomarker.unit}
                  </span>
                )}
              </p>

              {(biomarker.referenceMin !== undefined ||
                biomarker.referenceMax !== undefined) && (
                <p className="text-xs text-gray-500">
                  Normes:{" "}
                  {biomarker.referenceMin !== undefined
                    ? biomarker.referenceMin.toFixed(2)
                    : "—"}{" "}
                  -{" "}
                  {biomarker.referenceMax !== undefined
                    ? biomarker.referenceMax.toFixed(2)
                    : "—"}
                </p>
              )}

              <p className="text-xs text-gray-400 capitalize">
                {biomarker.category}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
