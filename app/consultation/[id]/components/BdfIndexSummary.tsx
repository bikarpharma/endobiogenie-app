import { BdfCategoryCard } from "./BdfCategoryCard";

interface IndexResult {
  code: string;
  name: string;
  value: number | null;
  category: string;
  subCategory?: string;
  description?: string;
  formulaType?: string;
}

interface BdfIndexSummaryProps {
  indexes: IndexResult[];
}

export function BdfIndexSummary({ indexes }: BdfIndexSummaryProps) {
  if (indexes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Index calculés
        </h2>
        <p className="text-sm text-gray-500">Aucun index calculé</p>
      </div>
    );
  }

  const indexesByCategory = indexes.reduce((acc, index) => {
    const category = index.category || "unknown";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(index);
    return acc;
  }, {} as Record<string, IndexResult[]>);

  const categoryOrder = [
    "gonadic",
    "thyroid",
    "corticotrope",
    "plaquettaire",
    "growth",
    "structure",
    "apoptosis",
    "metabolic",
    "inflammatory",
    "somatotrope",
  ];

  const sortedCategories = Object.keys(indexesByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const categoryLabels: Record<string, string> = {
    gonadic: "Gonadique",
    thyroid: "Thyroïdien",
    corticotrope: "Corticotrope",
    plaquettaire: "Plaquettaire",
    growth: "Croissance",
    structure: "Structure",
    apoptosis: "Apoptose",
    metabolic: "Métabolique",
    inflammatory: "Inflammatoire",
    somatotrope: "Somatotrope",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Index calculés
      </h2>

      <div className="space-y-4">
        {sortedCategories.map((category) => (
          <BdfCategoryCard
            key={category}
            category={categoryLabels[category] || category}
            items={indexesByCategory[category]}
          />
        ))}
      </div>
    </div>
  );
}
