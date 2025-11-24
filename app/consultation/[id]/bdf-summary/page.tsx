import { loadBdfForConsultation } from "../bdf.queries";
import { BdfSummary } from "../components/BdfSummary";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BdfSummaryPage({ params }: PageProps) {
  const { id } = await params;
  const data = await loadBdfForConsultation(id);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BdfSummary data={data} />
      </div>
    </div>
  );
}
