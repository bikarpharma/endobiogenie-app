import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error";
}

export function Badge({ variant = "success", className = "", children, ...props }: BadgeProps) {
  const baseStyles =
    "inline-block text-xs font-bold px-2 py-1 rounded-full";

  const variants = {
    success: "bg-ok text-[#0a2315]",
    warning: "bg-warn text-[#1a1108]",
    error: "bg-err text-white",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
