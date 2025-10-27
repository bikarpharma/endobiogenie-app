import { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function Chip({ className = "", children, ...props }: ChipProps) {
  const baseStyles =
    "rounded-full px-3 py-2 text-sm bg-[#0d1424] border border-border text-muted cursor-pointer transition-all duration-200 hover:text-text hover:bg-[#111a2e] hover:border-accent/30";

  return (
    <button type="button" className={`${baseStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
