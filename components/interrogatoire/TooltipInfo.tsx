"use client";

import { useState } from "react";

export function TooltipInfo({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex flex-shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
        className="text-white bg-blue-500 hover:bg-blue-600 transition rounded-full w-4 h-4 min-w-[1rem] min-h-[1rem] max-w-[1rem] max-h-[1rem] flex items-center justify-center text-[10px] font-bold leading-none"
        style={{ fontSize: '10px', padding: 0 }}
      >
        i
      </button>

      {open && (
        <div className="absolute z-50 bg-white shadow-xl border border-gray-300 rounded-md p-3 text-xs w-64 right-0 mt-1 text-gray-700">
          {text}
        </div>
      )}
    </span>
  );
}
