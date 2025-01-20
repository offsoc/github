export function pluralize(count: number, singular: string, includeCount: boolean = true): string {
  const text = count === 1 ? singular : `${singular}s`
  return includeCount ? `${count} ${text}` : text
}
