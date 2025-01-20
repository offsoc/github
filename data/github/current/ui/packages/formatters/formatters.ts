import {getLocale} from '@github-ui/client-env'

let currencyCache: Record<string, Intl.NumberFormat> = {}

/**
 * For when you need to form a number presented as a currency. This ensures that the correct
 * thousands seperator is applied, as well as being locale aware.
 *
 * @example
 * ```ts
 * expect(currency(1234.567)).toEqual('$1,234.57')
 * expect(currency(1234.567, {currency: 'EUR'})).toEqual('€1,234.57')
 * // given en-DE as the locale
 * expect(currency(1234.567)).toEqual('123,00 $')
 * ```
 */
export function currency(value: number, options?: {currency: string}) {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const currency = options?.currency ?? 'USD'
  const formatter = (currencyCache[currency] ||= new Intl.NumberFormat(getLocale(), {currency, style: 'currency'}))
  return formatter.format(value)
}

export function number(value: number, options?: {precision: number}) {
  return new Intl.NumberFormat(getLocale(), {maximumFractionDigits: options?.precision}).format(value)
}

const SUFFIXES = ['k', 'm', 'b']
/**
 * Formats a number into a human-readable string with optional precision, capping, and suffix.
 * @param value - The number to format.
 * @param options - An optional object containing formatting options.
 *    - precision - The number of decimal places to include in the formatted string. Defaults to 1.
 *    - capping - The maximum value to display before adding a capping symbol. Defaults to Infinity.
 *    - suffix - Whether to add a suffix indicating the magnitude of the number (e.g. "k" for thousands). Defaults to true.
 * @returns A human-readable string representing the formatted number.
 */
export function human(value: number, options?: {precision?: number; capping?: number; suffix?: boolean}) {
  const {suffix = true, capping = Infinity, precision = 1} = options ?? {}

  let suffixLabel = ''
  let formattedValue = Math.min(capping, value)
  if (suffix) {
    const base = getNumberBase(formattedValue)
    suffixLabel = SUFFIXES[base - 1] || ''
    formattedValue = formattedValue / 1_000 ** base
  }

  const result = number(formattedValue, {precision}) + suffixLabel

  if (value > capping) return `${result}+`

  return result
}

/**
 * Calculates the significance-based precision for a given value.
 * If the value is less than or equal to 10,000, the precision is 1.
 * Otherwise the precision depends on the order of magnitude.
 *
 * @param value - The value for which to calculate the significance-based precision.
 * @returns The significance-based precision for the given value.
 */
export function getSignificanceBasedPrecision(value: number): number {
  if (value <= 10_000) {
    return 1
  }

  const base = getNumberBase(value)
  if (value / 1_000 ** base >= 10) {
    return 0
  }

  return 1
}

/**
 * Returns the base for formatting a number.
 *
 * @param value - The number to determine the base for.
 * @returns The base for formatting the number.
 */
function getNumberBase(value: number): number {
  const base = Math.floor(Math.log(Math.max(Math.abs(value), 1)) / Math.log(1_000))
  // Limit the base by the number of available labels
  return Math.min(SUFFIXES.length, base)
}

// --

/**
 * @internal
 */
export function resetCache() {
  currencyCache = {}
}
