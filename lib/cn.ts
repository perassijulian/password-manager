import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names in a safe, predictable, and Tailwind-friendly way.
 *
 * @param inputs - Any number of class names, conditionally applied, including strings, arrays, or objects.
 * @returns A single merged className string with Tailwind conflict resolution.
 *
 * This function wraps `clsx` (for flexible input parsing) and `tailwind-merge` (for conflict resolution).
 *
 * ### Why use `cn()`?
 * - Ensures conditional classNames are handled cleanly (null, undefined, false are ignored).
 * - Automatically resolves Tailwind class conflicts (e.g., `bg-red-500 bg-blue-600` → `bg-blue-600`).
 * - Helps write cleaner, more scalable UI code in modern apps.
 *
 * ### Example:
 * ```tsx
 * <button className={cn("bg-blue-500", isActive && "bg-green-500", className)}>
 *   Click me
 * </button>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
