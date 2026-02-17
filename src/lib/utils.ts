import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Safe IDR currency formatter – handles strings, numbers, null/undefined. */
export function formatCurrency(val: unknown): string {
  const numberVal = Number(val);
  if (!val || isNaN(numberVal) || numberVal === 0) {
    return "Hubungi Admin";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numberVal);
}
