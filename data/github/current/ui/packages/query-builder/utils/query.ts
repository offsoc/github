import {
  type FilterValueType,
  type FilterType,
  NegativeFilters,
  NOT_SHOWN,
  type UserFilterValueType,
} from './../constants/search-filters'
import {Octicon, type QueryBuilderElement} from '@github-ui/query-builder-element'

import {UserFilterProvider} from '../providers/user-filter-provider'
import {
  QUERY_DATE_OFFSET_REGEX,
  QUERY_DATE_TOKENS,
  QUERY_DATE_UNITS,
  QUERY_FIELDS,
  QUERY_TOKEN_PREFIX,
} from '../constants/queries'
import {CustomFilterProvider} from '../providers/custom-filter-provider'

// Get a query to execute from a user input query and an optional scoped repository
export function getQuery(query: string, scopedRepository?: {owner: string; name: string}) {
  let actualQuery = replaceDateTokens(applyQueryDefaults(query))
  if (scopedRepository) {
    actualQuery += ` repo:${scopedRepository.owner}/${scopedRepository.name}`
  }

  return actualQuery
}

// Applying empty query logic - `archived:false`
export function applyQueryDefaults(query: string) {
  return `${query === '' ? 'archived:false' : query}`
}

// Removes all instances of the given field from the query, then adds the field with the new value
export function replaceInQuery(query: string, field: string, value: string) {
  if (!query) {
    return undefined
  }
  const regex = new RegExp(`(?:^|\\s)${field}:(?:\\"[^\\"]*\\"|\\S+)`, 'g')
  const newQuery = query.replaceAll(regex, '').replace(/^\s+/, '')
  const newValue = value.indexOf(' ') > -1 ? `"${value}"` : value

  return `${newQuery} ${field}:${newValue}`
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
 *  is: ['open'],
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
    const [key, value] = token.split(':')

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
  provider: new (q: QueryBuilderElement, f: FilterType, v?: FilterValueType[]) => A,
  filterValue: FilterType,
  queryBuilder: QueryBuilderElement,
  values?: FilterValueType[],
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
      values,
    )
  }

  new provider(queryBuilder, filterValue, values)
}

export function createCustomFilter(
  filterValue: FilterType,
  queryBuilder: QueryBuilderElement,
  values: FilterValueType[],
) {
  if (filterValue.value in NegativeFilters) {
    const value = filterValue.value as keyof typeof NegativeFilters
    new CustomFilterProvider(
      queryBuilder,
      {
        ...filterValue,
        name: NegativeFilters[value],
        icon: Octicon.Not,
        value: `-${filterValue.value}`,
        valuesKey: filterValue.value,
        priority: NOT_SHOWN,
      },
      values,
    )
  }

  new CustomFilterProvider(queryBuilder, filterValue, values)
}

export function createFilterWithRepoScope<A extends EventTarget>(
  provider: new (q: QueryBuilderElement, f: FilterType, s: string | undefined) => A,
  filterValue: FilterType,
  queryBuilder: QueryBuilderElement,
  scopedRepository: string | undefined,
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
