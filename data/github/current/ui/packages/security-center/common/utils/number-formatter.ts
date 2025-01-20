/**
 * Format a number into something user-friendly for display.
 *  - Falsy values return '0'
 *  - Values less than 1 will return '<1'
 *  - All other values return a rounded integer
 *
 * @param value
 * @returns
 */
export function formatFriendly(value?: number): string {
  if (!value) return '0'
  if (value < 1) return '<1'

  return `${Math.round(value)}`
}
