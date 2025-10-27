import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    const baseStyles =
      "w-full bg-[#0c1017] text-text border border-border rounded-xl px-3.5 py-3 text-[15px] resize-vertical min-h-[80px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent";

    return (
      <textarea
        ref={ref}
        className={`${baseStyles} ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
