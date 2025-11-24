import { loadInterrogatoireSummary } from "./interrogatoire.queries";
import { InterrogatoireSummary } from "./InterrogatoireSummary";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterrogatoireSummaryPage({ params }: PageProps) {
  const { id } = await params;
  const summary = await loadInterrogatoireSummary(id);

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Synthèse Interrogatoire
            </h1>
            <p className="text-gray-600">
              Aucune synthèse disponible pour cette consultation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <InterrogatoireSummary summary={summary} />
      </div>
    </div>
  );
}
