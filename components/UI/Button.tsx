"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "terciary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  isLoading?: boolean;
  variant?: ButtonVariant;
  asChild?: boolean;
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
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
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
        <span className="flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {children}
        </span>
      </Comp>
    );
  }
);

Button.displayName = "Button";
export default Button;
