"use client";

import { AXES_DEFINITION, BLOCS_DEFINITION, type AxisKey } from "@/lib/interrogatoire/config";

interface AxisNavigationProps {
  activeKey: AxisKey;
  onChange: (key: AxisKey) => void;
}

export function AxisNavigation({ activeKey, onChange }: AxisNavigationProps) {
  // Fonction pour obtenir le style du bloc selon sa clé
  const getBlocHeaderStyle = (blocKey: string) => {
    switch (blocKey) {
      case "terrain":
        return "bg-gradient-to-r from-slate-700 to-slate-600 text-white";
      case "gestionnaires":
        return "bg-gradient-to-r from-indigo-700 to-purple-600 text-white";
      case "emonctoires":
        return "bg-gradient-to-r from-emerald-600 to-teal-600 text-white";
      default:
        return "bg-gray-700 text-white";
    }
  };

  // Fonction pour obtenir le style de l'axe actif selon son bloc
  const getActiveAxisStyle = (blocKey: string | undefined) => {
    switch (blocKey) {
      case "terrain":
        return "bg-slate-50 text-slate-900 border-l-4 border-slate-600 shadow-sm";
      case "gestionnaires":
        return "bg-indigo-50 text-indigo-900 border-l-4 border-indigo-600 shadow-sm";
      case "emonctoires":
        return "bg-emerald-50 text-emerald-900 border-l-4 border-emerald-600 shadow-sm";
      default:
        return "bg-blue-50 text-blue-900 border-l-4 border-blue-600 shadow-sm";
    }
  };

  return (
    <nav className="w-full bg-white rounded-xl overflow-y-auto max-h-[60vh]">
      {/* Header supprimé - déjà présent dans la page parent */}

      {/* Navigation par blocs */}
      <div className="py-4">
        {BLOCS_DEFINITION.map((bloc) => {
          const axesInBloc = AXES_DEFINITION.filter(axis => axis.bloc === bloc.key);

          return (
            <div key={bloc.key} className="mb-4">
              {/* En-tête du bloc - compact */}
              <div className={`px-3 py-2 mx-2 rounded-lg ${getBlocHeaderStyle(bloc.key)} shadow-sm`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{bloc.icon}</span>
                  <h3 className="text-xs font-bold uppercase tracking-wide">
                    {bloc.label}
                  </h3>
                </div>
              </div>

              {/* Axes du bloc */}
              <div className="mt-2 space-y-1 px-2">
                {axesInBloc.map((axis) => {
                  const isActive = axis.key === activeKey;
                  return (
                    <button
                      key={axis.key}
                      type="button"
                      onClick={() => onChange(axis.key)}
                      className={`
                        flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? getActiveAxisStyle(axis.bloc)
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                    >
                      <span className="text-base mr-2">{axis.icon}</span>
                      <span className={`text-xs font-semibold truncate ${isActive ? "" : "text-slate-700"}`}>
                        {axis.label}
                      </span>
                      {isActive && (
                        <span className="ml-auto text-xs">▸</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </nav>
  );
}
