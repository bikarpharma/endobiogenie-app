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
    <nav className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Header de la sidebar */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-5 border-b border-slate-600">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <span className="text-xl">🩺</span>
          Interrogatoire Endobiogénique
        </h2>
        <p className="text-slate-300 text-xs mt-1">Analyse par axes fonctionnels</p>
      </div>

      {/* Navigation par blocs */}
      <div className="py-4">
        {BLOCS_DEFINITION.map((bloc) => {
          const axesInBloc = AXES_DEFINITION.filter(axis => axis.bloc === bloc.key);

          return (
            <div key={bloc.key} className="mb-8">
              {/* En-tête du bloc */}
              <div className={`px-4 py-4 mx-2 rounded-lg ${getBlocHeaderStyle(bloc.key)} shadow-md`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{bloc.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold uppercase tracking-wide">
                      {bloc.label}
                    </h3>
                    <p className="text-xs opacity-90 mt-1">
                      {bloc.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Axes du bloc */}
              <div className="mt-3 space-y-2">
                {axesInBloc.map((axis) => {
                  const isActive = axis.key === activeKey;
                  return (
                    <button
                      key={axis.key}
                      type="button"
                      onClick={() => onChange(axis.key)}
                      className={`
                        flex items-center w-full px-4 py-3 mx-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? getActiveAxisStyle(axis.bloc)
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                      style={{ width: "calc(100% - 1rem)" }}
                    >
                      <span className="text-lg mr-3">{axis.icon}</span>
                      <div className="flex-1 text-left min-w-0">
                        <div className={`text-sm font-semibold ${isActive ? "" : "text-slate-700"}`}>
                          {axis.label}
                        </div>
                        <div className={`text-xs mt-0.5 line-clamp-1 ${
                          isActive ? "opacity-80" : "text-slate-500"
                        }`}>
                          {axis.description}
                        </div>
                      </div>
                      {isActive && (
                        <span className="ml-2 text-sm">▸</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer de la sidebar */}
      <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-4 py-4 border-t border-slate-100">
        <div className="text-xs text-slate-500 text-center">
          <p className="text-[10px] mt-1 text-slate-400">Endobiogénie Clinique</p>
        </div>
      </div>
    </nav>
  );
}
