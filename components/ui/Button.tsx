import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    const baseStyles =
      "appearance-none border border-border rounded-xl px-4 py-3 cursor-pointer font-semibold tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gradient-to-b from-[#0e1320] to-[#0b1020] text-text hover:bg-[#0f1a33]",
      secondary: "bg-[#0e1422] text-muted hover:bg-[#111827]",
      ghost: "bg-transparent border-transparent text-muted hover:bg-white/5",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
