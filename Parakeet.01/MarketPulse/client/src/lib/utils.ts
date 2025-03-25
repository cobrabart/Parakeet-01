import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price value to a currency string
 * @param price - The price to format in cents
 * @param currency - The currency code (default: USD)
 * @returns Formatted price string (e.g. $10.99)
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  // Price is stored in cents, convert to dollars for display
  const amount = price / 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
