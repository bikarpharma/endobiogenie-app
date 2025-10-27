import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
}

export function Card({ gradient = true, className = "", children, ...props }: CardProps) {
  const baseStyles =
    "border border-border rounded-custom shadow-custom";

  const bgStyles = gradient
    ? "bg-gradient-to-b from-panel to-panel-2"
    : "bg-panel";

  return (
    <div className={`${baseStyles} ${bgStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
