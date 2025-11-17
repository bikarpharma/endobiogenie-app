"use client";

import { AXES_DEFINITION, type AxisKey } from "@/lib/interrogatoire/config";

interface AxisNavigationProps {
  activeKey: AxisKey;
  onChange: (key: AxisKey) => void;
}

export function AxisNavigation({ activeKey, onChange }: AxisNavigationProps) {
  return (
    <nav className="flex flex-col gap-2">
      {AXES_DEFINITION.map((axis) => {
        const isActive = axis.key === activeKey;
        return (
          <button
            key={axis.key}
            type="button"
            onClick={() => onChange(axis.key)}
            className={`text-left px-4 py-3 rounded-xl text-sm border transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-400 shadow-sm font-semibold text-blue-900"
                : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700"
            }`}
          >
            <div className={`font-medium ${isActive ? "text-blue-900" : "text-gray-800"}`}>
              {axis.label}
            </div>
            <div className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
              isActive ? "text-blue-700" : "text-gray-500"
            }`}>
              {axis.description}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
