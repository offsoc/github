/**
 * Takes a number and returns the number of decimal places (i.e., number of significant digits after the decimal point)
 *
 * ```js
 * getDecimalPlaces(0.1) // 1
 * getDecimalPlaces(9.12) // 2
 * getDecimalPlaces(100) // 0
 * getDecimalPlaces(100.123456789) // 9
 * ```
 */
export function getDecimalPlaces(n: number): number {
  if (Number.isNaN(n)) return 0
  if (!Number.isFinite(n)) return 0
  if (Number.isInteger(n)) return 0
  const decimalPart = n
    .toString()
    // Get part after the decimal point
    .split('.')[1]
    // Remove trailing zeroes (adds no precision, e.g. 0.1 vs 0.1000000)
    ?.replace(/0+$/, '')
  return decimalPart ? decimalPart.length : 0
}
