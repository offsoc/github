/**
 * Generates multiple queries from a query string based on a given filter name.
 * If no filter is used, it defaults to the provided filter default values.
 * @param query - The query string to extract filter values from.
 * @param filterName - The name of the filter to extract values for.
 * @param filterDefaultValues - The default values for the filter if none are provided in the query string.
 * @returns An array of strings representing queries with the applicable values of the filter applied.
 */
export function getQueriesByFilterValue(query: string, filterName: string, filterDefaultValues: string[]): string[] {
  // Extract array of selected filter values from query string.
  // The query is key:value format, so for example tool filter values will be in "tool:codeql,dependabot" format.
  // We only support single filter instance at the moment, so discard all but the first filter.
  // If there is no filter used, default to filterDefaultValues

  // This regex excludes spaces unless surrounded by quotes. Ex:
  // 'archived:false tool:"Tool with spaces",ESLint' would parse to ['archived:false', 'tool:"Tool with spaces",ESLint']
  const parsedQuery = query.match(/(?:[^"\s]|"[^"]*")+/g) || []

  const includedFilterValues =
    parsedQuery
      .find(t => t.startsWith(`${filterName}:`))
      ?.split(/:(.*)/)[1] // only split on the first colon
      ?.split(',') || filterDefaultValues

  const excludedFilterValues =
    parsedQuery
      .find(t => t.startsWith(`-${filterName}:`))
      ?.split(/:(.*)/)[1] // only split on the first colon
      ?.split(',') || []

  const githubIdx = excludedFilterValues.indexOf('github')
  if (githubIdx !== -1) {
    excludedFilterValues.splice(githubIdx, 1, 'codeql', 'dependabot', 'secret-scanning')
  }

  // subtract excluded values from included values
  const filterValues = includedFilterValues.filter(t => !excludedFilterValues.includes(t))
  const excludedFilterValuesNotSubtracted = excludedFilterValues.filter(t => !includedFilterValues.includes(t))

  let splitFilterValues: [string[], string[]] | null = null
  if (filterName === 'tool') {
    // split the filter values into two arrays:
    // - those that should be submitted independently (dependabot & secret-scanning)
    // - those that should be submitted as a group (code scanning tools)
    splitFilterValues = filterValues.reduce<[string[], string[]]>(
      (acc, filterValue) => {
        switch (filterValue) {
          case 'github':
            if (!acc[0].includes('dependabot')) acc[0].push('dependabot')
            if (!acc[0].includes('secret-scanning')) acc[0].push('secret-scanning')
            if (!acc[1].includes('codeql')) acc[1].push('codeql')
            break
          case 'dependabot':
            if (!acc[0].includes(filterValue)) acc[0].push(filterValue)
            break
          case 'secret-scanning':
            if (!acc[0].includes(filterValue)) acc[0].push(filterValue)
            break
          default:
            if (!acc[1].includes(filterValue)) acc[1].push(filterValue)
            break
        }
        return acc
      },
      [[], []],
    )
  } else {
    splitFilterValues = [filterValues, []]
  }

  // Repack the rest of the query to exclude the filter key(s)
  let queryWithoutFilter = parsedQuery
    .filter(t => !(t.startsWith(`${filterName}:`) || t.startsWith(`-${filterName}:`)))
    .join(' ')

  if (excludedFilterValuesNotSubtracted.length !== 0) {
    queryWithoutFilter = queryWithoutFilter.concat(
      `${queryWithoutFilter.length === 0 ? '' : ' '}-${filterName}:${excludedFilterValuesNotSubtracted.join(',')}`,
    )
  }

  const queries = []
  if (splitFilterValues[0].length !== 0) {
    for (const filterValue of splitFilterValues[0]) {
      queries.push(`${queryWithoutFilter} ${filterName}:${filterValue}`)
    }
  }
  if (splitFilterValues[1].length !== 0) {
    queries.push(`${queryWithoutFilter} ${filterName}:${splitFilterValues[1].join(',')}`)
  }

  return queries
}
