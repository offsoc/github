import invariant from 'tiny-invariant'

export function dateStringFromISODate(value: string): string {
  const [date] = value.split('T')
  invariant(date, 'A date string must have been passed')
  return date
}
