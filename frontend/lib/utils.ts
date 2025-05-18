import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a readable format
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Get full name from first and last name
 * @param firstName First name
 * @param lastName Last name
 * @returns Full name
 */
export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}