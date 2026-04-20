/**
 * Utility: className merger
 * Combines clsx conditional classes.
 * Pattern inspired by shadcn/ui.
 */
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
