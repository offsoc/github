import type {FilterProvider} from '@github-ui/filter'

export function sanitizeQuery(sourceQuery: string, destinationFilterProviders: FilterProvider[]): string {
  if (!sourceQuery) {
    return sourceQuery
  }

  const filterClauseSeparator: string = ' '
  const filterKeyValueSeparator: string = ':'
  const destFilterKeyLookup = new Map<string, string>()

  // When alias exists, alias of destination filter should match filter key from source query.
  // Otherwise, consider the same key is used on both source and destination page.
  for (const provider of destinationFilterProviders) {
    const destFilterKey = provider.key

    if (!provider.aliases) {
      destFilterKeyLookup.set(destFilterKey, destFilterKey)
      continue
    }

    const destFilterAlias = provider.aliases[0]
    if (destFilterAlias) {
      destFilterKeyLookup.set(destFilterAlias, destFilterKey)
    } else {
      destFilterKeyLookup.set(destFilterKey, destFilterKey)
    }
  }

  const remainingFilters: string[] = []
  for (const filter of sourceQuery.split(filterClauseSeparator)) {
    if (filter.indexOf(filterKeyValueSeparator) <= 0) {
      // Keep unqualified filter
      remainingFilters.push(filter)
      continue
    }

    // The Regex is to make sure we only split once on ':'
    const splitPattern = new RegExp(`${filterKeyValueSeparator}(.+)?`)
    const [key, value] = filter.split(splitPattern)
    if (key && destFilterKeyLookup.has(key)) {
      // Replace source filter key with destination filter key
      const destKey = destFilterKeyLookup.get(key) || key
      remainingFilters.push([destKey, value].join(':'))
    }
  }

  if (remainingFilters.length === 0) {
    // No remaining filter
    return ''
  }

  return remainingFilters.join(filterClauseSeparator)
}
