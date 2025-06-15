"use client";

import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "terciary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  isLoading?: boolean;
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  terciary:
    "bg-background-secondary text-foreground border border-border border-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      ariaLabel,
      children,
      isLoading,
      disabled,
      variant = "primary",
      className,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-label={ariaLabel}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors duration-200 hover:brightness-90 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
