export function pluralize(
  count: number,
  singular: string,
  pluralStringOrLookup: string | {[singular: string]: string},
  showCount = true,
) {
  let plural: string

  if (typeof pluralStringOrLookup === 'object') {
    plural = pluralStringOrLookup[singular]!
  } else {
    plural = pluralStringOrLookup
  }

  const text = count === 1 ? singular : plural

  if (!showCount) {
    return text
  }

  return count > 100 ? `100+ ${text}` : `${count} ${text}`
}

export function capitalize(text: string) {
  return text[0]!.toUpperCase() + text.slice(1)
}

export function humanize(text: string) {
  return text.replaceAll('_', ' ')
}
