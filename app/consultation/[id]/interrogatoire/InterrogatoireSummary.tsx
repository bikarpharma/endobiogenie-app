import type { AxisLevel } from "./interrogatoire.synthese";

interface AxisSummary {
  score: number;
  level: AxisLevel;
  summary: string;
}

interface InterrogatoireSummaryData {
  axes: Record<string, AxisSummary>;
  globalSummary: string;
}

interface InterrogatoireSummaryProps {
  summary: InterrogatoireSummaryData;
}

const AXIS_LABELS: Record<string, string> = {
  neurovegetatif: "Axe Neurovégétatif",
  corticotrope: "Axe Corticotrope",
  thyroidien: "Axe Thyroïdien",
  gonadique: "Axe Gonadique",
  somatotrope: "Axe Somatotrope",
  structure: "Axe Structure",
  detoxification: "Axe Détoxification",
  immunitaire: "Axe Immunitaire",
};

const LEVEL_CONFIG: Record<AxisLevel, { label: string; className: string }> = {
  low: {
    label: "Bas",
    className: "bg-blue-100 text-blue-800",
  },
  medium: {
    label: "Modéré",
    className: "bg-green-100 text-green-800",
  },
  high: {
    label: "Élevé",
    className: "bg-orange-100 text-orange-800",
  },
};

export function InterrogatoireSummary({ summary }: InterrogatoireSummaryProps) {
  const axisEntries = Object.entries(summary.axes);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Synthèse Interrogatoire
        </h1>
        <p className="text-sm text-gray-600">
          Analyse descriptive des axes neurovégétatifs et métaboliques
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Synthèse Globale
        </h2>
        <p className="text-gray-700 leading-relaxed">{summary.globalSummary}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Synthèse par Axe
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {axisEntries.map(([axisId, axis]) => {
            const levelConfig = LEVEL_CONFIG[axis.level];

            return (
              <div
                key={axisId}
                className="border rounded-lg p-4 bg-gray-50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {AXIS_LABELS[axisId] || axisId}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${levelConfig.className}`}
                  >
                    {levelConfig.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Score:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {axis.score.toFixed(0)}
                  </span>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {axis.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
