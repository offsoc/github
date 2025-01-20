export function addSortToQuery(query: string | undefined, sort: string): string {
  const sortFilter = sort ? `sort:${sort}` : ''

  if (!query) return sortFilter

  const filterTerms = query.split(' ')
  const nonSortTerms = filterTerms.filter(term => !term.startsWith('sort:'))
  if (nonSortTerms.length === 0) return sortFilter

  const newQuery = filterTerms.length === nonSortTerms.length ? query : nonSortTerms.join(' ')
  return sortFilter ? `${newQuery} ${sortFilter}` : newQuery
}

export function getSortFromQuery(query: string | undefined): string {
  if (!query) return ''

  const sortTerms = query.split(' ').filter(term => term.startsWith('sort:'))
  if (sortTerms.length === 0) return ''

  return sortTerms[0]!.substring('sort:'.length)
}
