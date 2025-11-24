interface IndexResult {
  code: string;
  name: string;
  value: number | null;
  category: string;
  subCategory?: string;
  description?: string;
  formulaType?: string;
}

interface BdfCategoryCardProps {
  category: string;
  items: IndexResult[];
}

export function BdfCategoryCard({ category, items }: BdfCategoryCardProps) {
  const getStatusBadge = (item: IndexResult) => {
    if (item.value === null) {
      if (item.formulaType === "secret") {
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Secret
          </span>
        );
      }
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
          Manquant
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
        Calculé
      </span>
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold text-gray-900 mb-3 capitalize">
        {category}
      </h3>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.code}
            className="flex items-center justify-between p-3 bg-white rounded border"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{item.name}</p>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {item.value !== null && (
                <p className="text-lg font-bold text-blue-600 min-w-[80px] text-right">
                  {item.value.toFixed(3)}
                </p>
              )}
              {getStatusBadge(item)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
