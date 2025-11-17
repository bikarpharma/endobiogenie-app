"use client";

import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
      <h3 className="font-semibold text-sm text-gray-800 border-b border-gray-100 pb-2">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
