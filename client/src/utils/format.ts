/**
 * Formatting and Display Utilities
 * Centralizes currency, date, and string formatting across the application.
 */

export function formatCurrency(amount: number, currency = 'INR'): string {
  const num = Number(amount) || 0;
  return `${currency} ${num.toLocaleString()}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  } catch {
    return dateStr;
  }
}

export function calculatePerGuest(total: number, guestCount: number): number {
  if (!guestCount || guestCount <= 0) return 0;
  return Math.round((Number(total) || 0) / guestCount);
}

export function truncateText(text: string, maxLen = 100): string {
  if (!text || text.length <= maxLen) return text || '';
  return `${text.slice(0, maxLen).trim()}...`;
}
