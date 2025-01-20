import {
  QUERY_DATE_OFFSET_REGEX,
  QUERY_DATE_TOKENS,
  QUERY_DATE_UNITS,
  QUERY_DEFAULT_SORT_QUALIFIER,
  QUERY_FIELDS,
  QUERY_TOKEN_PREFIX,
} from '@github-ui/query-builder/constants/queries'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {
  type FilterRelayType,
  type FilterType,
  NegativeFilters,
  NOT_SHOWN,
  type UserFilterValueType,
} from '@github-ui/query-builder/constants/search-filters'
import {UserFilterProvider} from '@github-ui/query-builder/providers/user-filter-provider'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'

const STATE_REASON_REGEX = /(?:^|\s)reason:"?(completed|not(\s|-)planned)"?(?:$|\s)/g

export type ScopedRepository = {owner: string; name: string}

export type ItemsType = 'issues' | 'pullRequests' | 'any'

// Takes in the user supplied query string,
// removes some duplicate and ignored tokens,
// and returns the modified query string.
//   ex: getQuery(query: "is:issue purple type:issue", scopedRepository?: true) =>
//   "is:issue purple repo:owner/repo sort:sort:created-desc"
// Warning, this function must stay in sync with its counterpart in the backend
// see app/helpers/hyperlist_web/helper.rb#get_repo_query
export function getQuery(query: string, scopedRepository?: ScopedRepository): string {
  const advancedSearchEnabled = isFeatureEnabled('issues_advanced_search')
  const queryStringWithDates = replaceDateTokens(applyQueryDefaults(query))

  if (!scopedRepository) {
    return queryStringWithDates
  }

  let cleanQuery = ''
  const parsedQuery = parseQuery(queryStringWithDates)
  const deduplicatedQuery = removeDuplicateValues(parsedQuery)
  const sortQualifier = parsedQuery.has('sort') ? '' : QUERY_DEFAULT_SORT_QUALIFIER

  if (advancedSearchEnabled) {
    cleanQuery = queryStringWithDates
    const removedValues = mapDifference(parsedQuery, deduplicatedQuery)
    for (const [key, value] of removedValues) {
      const str = `${key}:${value}`
      cleanQuery = cleanQuery.replace(str, '')
    }
    cleanQuery = removeIgnoredQualifiers(cleanQuery)
    // Replace any whitespace with a single whitespace
    cleanQuery = cleanQuery.replaceAll(/\s+/g, ' ')
  } else {
    for (const key of deduplicatedQuery.keys()) {
      // when we scope a query to a given repo, we want to make sure to ignore
      // any user entered search qualifier about repo/org/user to make sure to pull
      // issues only from the scoped repository
      if (key !== 'repo' && key !== 'org' && key !== 'user') {
        if (key === 'searchTerms') {
          // Add search terms to the query string
          cleanQuery += `${deduplicatedQuery
            .get(key)
            ?.filter(term => !term.startsWith('@')) // For backwards compatibility reasons, '@<USER>' is treated as `user:<USER>', so we filter it out
            .join(' ')} `
        } else {
          // Add each filter key:value pair to the query string
          const filterValues = deduplicatedQuery
            .get(key)
            ?.map(v => `${key}:${v}`)
            .join(` `)
          cleanQuery += `${filterValues} `
        }
      }
    }
  }
  cleanQuery = cleanQuery.trim()
  const scopedRepoQualifier = `repo:${scopedRepository.owner}/${scopedRepository.name}`
  return [cleanQuery, scopedRepoQualifier, sortQualifier].join(' ').trim()
}

// Applying empty query logic - `archived:false`
export function applyQueryDefaults(query: string) {
  return `${query === '' ? 'archived:false' : query}`
}

// Removes all instances of the given field from the query, then adds the field with the new value
export function replaceInQuery(query: string, field: keyof typeof QUERY_FIELDS, value: string) {
  if (!query) {
    return undefined
  }
  const regex = new RegExp(`(?:^|\\s)${field}:(?:\\"[^\\"]*\\"|\\S+)`, 'g')
  const newQuery = query.replaceAll(regex, '').replace(/^\s+/, '')
  const newValue = value.indexOf(' ') > -1 ? `"${value}"` : value

  return `${newQuery.trim()} ${field}:${newValue}`
}

export function replaceDateTokens(query: string) {
  const tokenPositions = findTokenPositions(query)
  if (tokenPositions.length === 0) {
    return query
  }
  const replacements = findTokenReplacements(query, tokenPositions)
  if (replacements.length === 0) {
    return query
  }

  return replaceTokens(query, replacements)
}

export function checkIfStateReasonPresent(query: string) {
  return query.match(STATE_REASON_REGEX)
}

type tokenPosition = {
  token: string
  pos: number
}

type replacement = {
  newValue: string
  length: number
}

type tokenReplacement = {
  tokenPosition: tokenPosition
  replacement: replacement
}

// Finds all date tokens in the query, and returns their positions
function findTokenPositions(query: string) {
  const tokenPositions: tokenPosition[] = []
  let pos = query.indexOf(QUERY_TOKEN_PREFIX)
  if (pos === -1) {
    return tokenPositions
  }
  while (pos < query.length) {
    for (const tokenName in QUERY_DATE_TOKENS) {
      const token = QUERY_DATE_TOKENS[tokenName]!
      if (query.startsWith(token, pos)) {
        tokenPositions.push({token, pos})
        pos += token.length
        break
      }
    }
    pos = query.indexOf(QUERY_TOKEN_PREFIX, pos + 1)
    if (pos === -1) {
      break
    }
  }

  return tokenPositions
}

function tokenToDate(now: Date, token: string) {
  if (token === QUERY_DATE_TOKENS['today']) {
    return now.getTime()
  } else {
    // Currently only @today is supported
    return undefined
  }
}

function calculateNewDate(now: Date, value: number, unit: string, op: string) {
  const newDate = new Date(now.getTime())

  const sign = op === '-' ? -1 : 1
  switch (unit) {
    case QUERY_DATE_UNITS.day:
      newDate.setDate(now.getDate() + sign * value)
      break
    case QUERY_DATE_UNITS.week:
      newDate.setDate(now.getDate() + sign * value * 7)
      break
    case QUERY_DATE_UNITS.month:
      newDate.setMonth(now.getMonth() + sign * value)
      // This handles a descrepancy between how the Date implementation in js and ruby handle addition/subtraction of months
      // In JS: 2023-05-31 - 1 month ==> 2023-05-01
      // In rb: 2023-05-31 - 1 month ==> 2023-04-30
      if (newDate.getDate() === 1 && now.getDate() !== 1) {
        newDate.setDate(newDate.getDate() - 1)
      }
      break
    case QUERY_DATE_UNITS.year:
      newDate.setFullYear(now.getFullYear() + sign * value)
      break
    default:
      return null // Invalid unit
  }
  return newDate
}

function calculateDateWithOffset(regexResult: RegExpExecArray | null, date: Date, op: string, length: number) {
  if (!regexResult) {
    return null // Invalid offset modifer
  }
  const value = parseInt(regexResult[1]!, 10)
  const unit = regexResult[2]!

  length += op.length + regexResult[0].length

  const dateWithOffset = calculateNewDate(date, value, unit, op)
  if (dateWithOffset) {
    return {newValue: dateWithOffset.toISOString().substring(0, 10), length}
  }
  // Invalid relative value
  return null
}

function calculateReplacement(query: string, tokenPosition: tokenPosition, date: Date): replacement | null {
  const tokenLength = tokenPosition.token.length

  const op = query.substring(tokenPosition.pos + tokenLength, tokenPosition.pos + tokenLength + 1)

  if (op === '' || op === ' ') {
    return {newValue: date.toISOString().substring(0, 10), length: tokenLength}
  }
  if (op === '-' || op === '+') {
    const rest = query.substring(tokenPosition.pos + tokenPosition.token.length + op.length)
    const result = QUERY_DATE_OFFSET_REGEX.exec(rest)
    return calculateDateWithOffset(result, date, op, tokenLength)
  }
  // Invalid op
  return null
}

// For each date token in the query, returns the replacement value and the length of the string to replace
function findTokenReplacements(query: string, tokenPositions: tokenPosition[]) {
  const now = new Date()

  const replacements: tokenReplacement[] = []
  for (const tokenPosition of tokenPositions) {
    const newDateTime = tokenToDate(now, tokenPosition.token)
    if (!newDateTime) {
      continue
    }
    const replacement = calculateReplacement(query, tokenPosition, new Date(newDateTime))
    if (!replacement) {
      continue
    }
    replacements.push({tokenPosition, replacement})
  }

  return replacements
}

function replaceTokens(query: string, replacements: tokenReplacement[]) {
  let newQuery = query
  for (const tokenReplacement of replacements.reverse()) {
    newQuery =
      newQuery.substring(0, tokenReplacement.tokenPosition.pos) +
      tokenReplacement.replacement.newValue +
      newQuery.substring(tokenReplacement.tokenPosition.pos + tokenReplacement.replacement.length)
  }
  return newQuery
}

/**
 * Parse the string query into a map of search tokens
 * Values that don't contain a colon are treated as a search term and stored with the `searchTerms` key
 *
 * @param query GitHub search query
 * @returns Map of search tokens + search terms
 * @example
 * const queryMap = parseQuery('repo:github/github')
 * {
 *  repo: ['github.com'],
 *  searchTerms: []
 * }
 *
 * const queryMap = parseQuery('repo:github/github repo:github/issues state:open label:bug fun issue')
 * {
 *  repo: ['github/github', 'github/issues'],
 *  state: ['open'],
 *  label: ['bug']
 *  searchTerms: ['fun', 'issue']
 * }
 */
export function parseQuery(query: string): Map<string, string[]> {
  const queryMap: Map<string, string[]> = new Map()
  queryMap.set('searchTerms', [])

  const matchBySpaceIgnoreQuotedExp = /((?:[^\s"]+|"[^"]*")+)/g
  const tokens = query
    .trim()
    .split(matchBySpaceIgnoreQuotedExp)
    .filter(item => item.trim() !== '') // Remove duds

  for (const token of tokens) {
    const [key, value] = token.split(/:(.*)/s) // split on first occurence of : in token

    // Contains ':' so it's a filter token
    if (key && value) {
      if (!queryMap.has(key)) {
        queryMap.set(key, [value])
        continue
      }

      // We can have more than one usage of the filter, so we append if the key exists
      queryMap.set(key, [...queryMap.get(key)!, value])
      continue
    }

    // Values without ':' are considered search terms
    queryMap.set('searchTerms', [...queryMap.get('searchTerms')!, token])
  }

  return queryMap
}

export function shouldRenderSsoBanner(parsedQuery: Map<string, string[]>, orgPendingSso: string[]) {
  const orgs = parsedQuery.get(QUERY_FIELDS.org)
  const repositories = parsedQuery.get(QUERY_FIELDS.repo)

  if (orgs === undefined && repositories === undefined) {
    return true
  } else if (orgs && orgs.some(org => orgPendingSso.indexOf(org) >= 0)) {
    return true
  } else if (repositories) {
    const orgNames = repositories.filter(repo => repo.includes('/')).map(repo => repo.split('/')[0]!)
    return orgNames.some(org => orgPendingSso.indexOf(org) >= 0)
  }

  return false
}

export function findSortReactionInQuery(query: string): boolean {
  if (!query) return false
  const parsedQuery = parseQuery(query)
  const sort = parsedQuery.get('sort')

  return (sort && sort.length === 1 && sort[0]!.startsWith('reactions')) || false
}

export function replaceSortInQuery(query: string, textToReplace: string): string {
  // replace current sort:{value} in query with the selected one
  return query
    .replace(/\bsort\S+/gi, '')
    .concat(` ${textToReplace}`)
    .replaceAll('  ', ' ')
}

// These are helper functions to create negative filter providers.

export function createFilter<A extends EventTarget>(
  provider: new (q: QueryBuilderElement, f: FilterType) => A,
  filterValue: FilterType,
  queryBuilder: QueryBuilderElement,
) {
  if (filterValue.value in NegativeFilters) {
    const value = filterValue.value as keyof typeof NegativeFilters
    new provider(queryBuilder, {
      ...filterValue,
      name: NegativeFilters[value],
      value: `-${filterValue.value}`,
      valuesKey: filterValue.value,
      priority: NOT_SHOWN,
    })
  }

  new provider(queryBuilder, filterValue)
}

export function createGraphQlFilter<A extends EventTarget>(
  provider: new (q: QueryBuilderElement, f: FilterRelayType) => A,
  filterValue: FilterRelayType,
  queryBuilder: QueryBuilderElement,
) {
  if (filterValue.value in NegativeFilters) {
    const value = filterValue.value as keyof typeof NegativeFilters
    new provider(queryBuilder, {
      ...filterValue,
      name: NegativeFilters[value],
      value: `-${filterValue.value}`,
      valuesKey: filterValue.value,
      priority: NOT_SHOWN,
    })
  }

  new provider(queryBuilder, filterValue)
}

export function createFilterWithRepoScope<A extends EventTarget>(
  provider: new (q: QueryBuilderElement, f: FilterType, s: string | undefined) => A,
  filterValue: FilterType,
  queryBuilder: QueryBuilderElement,
  scopedRepository?: string | undefined,
) {
  if (filterValue.value in NegativeFilters) {
    const value = filterValue.value as keyof typeof NegativeFilters
    new provider(
      queryBuilder,
      {
        ...filterValue,
        name: NegativeFilters[value],
        value: `-${filterValue.value}`,
        valuesKey: filterValue.value,
        priority: NOT_SHOWN,
      },
      scopedRepository,
    )
  }

  new provider(queryBuilder, filterValue, scopedRepository)
}

export function createGraphQLFilterWithRepoScope<A extends EventTarget>(
  provider: new (q: QueryBuilderElement, f: FilterRelayType, s: string) => A,
  filterValue: FilterRelayType,
  queryBuilder: QueryBuilderElement,
  scopedRepository: string,
) {
  if (filterValue.value in NegativeFilters) {
    const value = filterValue.value as keyof typeof NegativeFilters
    new provider(
      queryBuilder,
      {
        ...filterValue,
        name: NegativeFilters[value],
        value: `-${filterValue.value}`,
        valuesKey: filterValue.value,
        priority: NOT_SHOWN,
      },
      scopedRepository,
    )
  }

  new provider(queryBuilder, filterValue, scopedRepository)
}

export function createUserFilter(
  filterValue: UserFilterValueType,
  queryBuilder: QueryBuilderElement,
  login: string,
  avatarUrl: string,
  scopedRepository?: string | undefined,
) {
  if (filterValue.value in NegativeFilters) {
    const value = filterValue.value as keyof typeof NegativeFilters
    new UserFilterProvider(
      queryBuilder,
      {
        ...filterValue,
        name: NegativeFilters[value],
        value: `-${filterValue.value}`,
        priority: NOT_SHOWN,
      },
      login,
      avatarUrl,
      scopedRepository,
    )
  }

  new UserFilterProvider(queryBuilder, filterValue, login, avatarUrl, scopedRepository)
}

export function checkIfQuerySupportsPr(query: string) {
  const parsedQuery = parseQuery(query)
  const searchTerms = new Set([...(parsedQuery.get('is') || []), ...(parsedQuery.get('type') || [])])
  // Query contains PR search terms if it doesn't specify the type, or it does not include the type issue,
  // or if it specifies the type as PR or pull-request
  return searchTerms.size === 0 || !searchTerms.has('issue') || searchTerms.has('pr') || searchTerms.has('pull-request')
}

function removeDuplicateValues(values: Map<string, string[]>): Map<string, string[]> {
  const newQueryMap = new Map(values)
  const valuesForIs = newQueryMap.get('is') || []
  const valuesForType = newQueryMap.get('type') || []

  const hasTypeValue: Record<string, boolean> = {
    issue: valuesForIs.includes('issue'),
    pr: valuesForIs.includes('pr'),
  }

  if (!valuesForIs.length) {
    newQueryMap.delete('is')
  }

  // do not add type:pr or type:issue to the query if is:pr or is:issue is already present
  const newValues: string[] = valuesForType.filter(value => !hasTypeValue[value])

  if (newValues.length > 0) {
    newQueryMap.set('type', newValues)
  } else {
    newQueryMap.delete('type')
  }
  return newQueryMap
}

// For compatibility, remove qualifiers about repo, org, or user
// Also remove search terms (not filters) with user handles
// e.g., remove "@monalisa" but preserve "assignee:@monalisa"
function removeIgnoredQualifiers(queryString: string) {
  // Split the query string by space, but preserve label titles with spaces (within double quotes)
  const splitQueryString = queryString.match(/(".*?"|[^"\s]+)+/g) ?? []
  const ignoredQualifiersRegex = /^(repo:|org:|user:|@)/

  return splitQueryString.filter(v => !ignoredQualifiersRegex.test(v)).join(' ')
}

// Returns a map representing the key:value pairs present in map1 that are not in map2
function mapDifference(map1: Map<string, string[] | string>, map2: Map<string, string[] | string>) {
  const diff = new Map()
  for (const [key, val] of map1) {
    if (!map2.has(key)) {
      diff.set(key, val)
    }
  }
  return diff
}
