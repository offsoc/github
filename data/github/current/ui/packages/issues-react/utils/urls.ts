import {VALUES, IS_FILTER_PROVIDER_VALUES, STATE_FILTER_PROVIDER_VALUES} from '../constants/values'
import {QUERIES} from '@github-ui/query-builder/constants/queries'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {ROUTE_SUFFIXES} from '../constants/route-suffixes'
import {CUSTOM_VIEWS, VIEW_IDS} from '../constants/view-constants'
import type {Variables} from 'relay-runtime'

const issuesAtRepoIndexUrl = new RegExp('^\\/([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)\\/(([\\-_\\.a-zA-Z0-9])*)\\/issues')
export const issueRegexpWithoutDomain = /\/(?<owner>.*)\/(?<repo>.*)\/issues\/(?<number>\d+)/

export const isNewIssuePath = (path: string) => {
  return isNewIssuePathForIndex(path) || isNewIssuePathForRepo(path)
}

export const isNewIssuePathForIndex = (path: string) => {
  return path === '/issues/new'
}

export const isNewIssuePathForRepo = (path: string) => {
  // it is not the dashboard path but allows query after /new
  return path.indexOf('/issues/new') > 0
}

export const isCustomViewIssuePathForRepo = (path: string) => {
  return CUSTOM_VIEWS.some(customPath => path.indexOf(`/issues/${customPath}`) > 0)
}

export const cleanCustomViewIssueUrl = (url: string, value?: string) => {
  return value ? CUSTOM_VIEWS.reduce((customUrl, path) => customUrl.replace(`/${path}/${value}`, ''), url) : url
}

export const explodeIssueNewPathToRepositoryData = (url: string) => {
  if (!isNewIssuePathForRepo(url) || url.length === 0) {
    return undefined
  }

  // We assume that the url is within a repository scope new page.
  const match = url.match(/^\/([^/]+)\/([^/]+)\/issues/)
  if (match) {
    const [, owner, repo] = match
    if (owner && repo) {
      return {owner, name: repo}
    }
  }
  return undefined
}

export const urlSuffix = () => {
  const url = ssrSafeLocation?.pathname
  const components = url.split('/')

  return components.length === 0 ? '' : components[components.length - 1]
}

export const searchUrl = ({viewId, query}: {viewId?: string; query?: string}) => {
  let newQuery = ''

  if (viewId !== VIEW_IDS.repository) {
    if (viewId && viewId !== VIEW_IDS.empty) {
      if (ROUTE_SUFFIXES[viewId]) {
        newQuery = `/${ROUTE_SUFFIXES[viewId]}`
      } else {
        newQuery = `/${viewId}`
      }
    } else {
      if (query === QUERIES.assignedToMe) {
        return `/issues/${ROUTE_SUFFIXES.assigned}`
      } else if (query === QUERIES.mentioned) {
        return `/issues/${ROUTE_SUFFIXES.mentioned}`
      } else if (query === QUERIES.createdByMe) {
        return `/issues/${ROUTE_SUFFIXES.createdByMe}`
      } else if (query === QUERIES.recentActivity) {
        return `/issues/${ROUTE_SUFFIXES.recentActivity}`
      }
    }
  }

  if (query !== undefined && query.trim() !== '') {
    newQuery = `${newQuery}?${VALUES.searchUrlParameterName}=${encodeURIComponent(query)}`
  }

  if (viewId === VIEW_IDS.repository) {
    // this is when hyperlist is running at the repository level
    const path = ssrSafeLocation?.pathname
    const match = path.match(issuesAtRepoIndexUrl)

    if (match) {
      return path + newQuery
    }
  }

  return `/issues${newQuery}`
}

export const isUrlInRepoIssuesContext = (url: string, owner: string, name: string) => {
  if (!url.startsWith(window.location.origin)) {
    return false
  }
  return url.indexOf(`/${owner}/${name}/issues`) > -1
}

// assumes that the currentView is a repo route: new, show or index
export function getCurrentRepoIssuesUrl({query}: {query?: string} = {}): string {
  const url = ssrSafeLocation?.pathname
  // Consider the last match of the array, to function for repos called `issues` too :)
  const matcher = url.match(/issues(\/\d+|\/new(\/choose)*|\/)*/g)

  const queryStr =
    query && query.length > 0 && query !== QUERIES.defaultRepoLevelOpen
      ? `?${VALUES.searchUrlParameterName}=${encodeURIComponent(query)}`
      : ''
  if (matcher) {
    const repoUrl = url.substring(0, url.length - matcher[matcher.length - 1]!.length)
    return `${repoUrl}issues${queryStr}`
  }

  return `${url}${queryStr}`
}

export const timelineEventBaseUrl = (repoName?: string, repoOwner?: string) =>
  repoOwner ? `/${repoOwner}/${repoName}/issues` : '/issues'

export const isOpenQuery = (activeSearchQuery: string) => {
  return activeSearchQuery.includes(QUERIES.open)
}

export const isClosedQuery = (activeSearchQuery: string) => {
  return activeSearchQuery.includes(QUERIES.closed)
}

export const isNegatedOpenQuery = (activeSearchQuery: string) => {
  return activeSearchQuery.includes(`-${QUERIES.open}`)
}

export const isNegatedClosedQuery = (activeSearchQuery: string) => {
  return activeSearchQuery.includes(`-${QUERIES.closed}`)
}

export const isDefaultView = (activeSearchQuery: string) => {
  return [QUERIES.defaultRepoLevelOpen, QUERIES.defaultRepoLevelClosed].includes(
    activeSearchQuery
      .split(' ')
      .filter(s => s && s !== ' ')
      .sort(s => (s === 'is:issue' ? -1 : 1))
      .join(' '),
  )
}

export const getOpenHref = (activeSearchQuery: string) => {
  activeSearchQuery = activeSearchQuery.trim()
  if (!activeSearchQuery) return ''
  if (isDefaultView(activeSearchQuery)) return ''

  activeSearchQuery = replaceIsKeywordWithState(activeSearchQuery)

  const isOpen = isOpenQuery(activeSearchQuery)
  const isClosed = isClosedQuery(activeSearchQuery)

  const isNegatedOpen = isNegatedOpenQuery(activeSearchQuery)
  const isNegatedClosed = isNegatedClosedQuery(activeSearchQuery)

  if (isNegatedOpen && !isNegatedClosed) return activeSearchQuery.replace(`-${QUERIES.open}`, `-${QUERIES.closed}`) //-state:open and NOT -state:closed -> handles negated open
  if (isClosed && !isOpen && !isNegatedClosed) return activeSearchQuery.replace(QUERIES.closed, QUERIES.open) //state:closed and NOT state:open and NOT -state:closed -> handles closed
  if (isOpen || isNegatedClosed) return activeSearchQuery.trim() //state:open or -state:closed -> handles open and negated closed situations

  activeSearchQuery = activeSearchQuery.trim()
  return activeSearchQuery.length > 0 ? `${activeSearchQuery.trim()} ${QUERIES.open}` : QUERIES.open
}

const replaceIsKeywordWithState = (query: string) => {
  // Use a regex to replace all instances of is:open or is:closed with state:open or state:closed
  return query.replace(/(^|\s)is:(open|closed)(\s|$)/g, '$1state:$2$3')
}

export const getClosedHref = (activeSearchQuery: string, openHref?: string) => {
  activeSearchQuery = activeSearchQuery.trim()
  if (!activeSearchQuery) return ''

  activeSearchQuery = replaceIsKeywordWithState(activeSearchQuery)

  if (typeof openHref === 'undefined') {
    openHref = getOpenHref(activeSearchQuery)
  }
  if (!openHref) return QUERIES.defaultRepoLevelClosed
  const isOpen = isOpenQuery(openHref)
  const isNegatedClosed = isNegatedClosedQuery(openHref)
  if (isNegatedClosed) return openHref.replace(`-${QUERIES.closed}`, `-${QUERIES.open}`)
  if (isOpen) return openHref.replace(QUERIES.open, QUERIES.closed)

  return ''
}

export const getHrefForTabs = (activeSearchQuery: string): [string, string] => {
  const openHref = getOpenHref(activeSearchQuery)
  const closedHref = getClosedHref(activeSearchQuery, openHref)
  return [openHref, closedHref]
}

// We expect the urlParameter to be a comma separated list of projects, and only wish to extract
// the project numbers for the current owner
export const parseValidProjectNumbersFromUrlParameter = (urlParameter: string, currentOwner: string | undefined) => {
  if (!urlParameter || !currentOwner) {
    return []
  }

  return urlParameter
    .split(',')
    .map(project => {
      const [owner, number] = project.split('/')
      if (owner === currentOwner && number) {
        // Ensure number is a valid integer and return that
        const convertedNumber = parseInt(number)
        return isNaN(convertedNumber) || convertedNumber < 0 ? undefined : convertedNumber
      }
    })
    .filter(project => project !== undefined)
    .splice(0, 20)
}

export const getUrlWithHash = (url: string, href: string) => {
  if (href.split('#').length === 2 && href.split('#')[1]) {
    return `${url}#${href.split('#')[1]}`
  }
  return url
}

export const replacePageNumberInUrl = (url: string, pageNumber: number) => {
  if (url.match(/(\?|&)page=-?\d+/) === null) {
    if (url.indexOf('?') === -1) {
      return `${url}?page=${pageNumber}`
    }
    return `${url}&page=${pageNumber}`
  }
  return url.replace(/(\?|&)page=-?\d+/, `$1page=${pageNumber}`)
}

export const getPageNumberFromUrlQuery = (urlQuery: string) => {
  const urlParams = new URLSearchParams(urlQuery)
  const pageNumber = urlParams.get('page')
  return pageNumber ? parseInt(pageNumber, 10) : 1
}

export const addPagingParams = (urlSearchParams: URLSearchParams, variables: Variables) => {
  let parsedPageSize = NaN
  const pageSize = urlSearchParams.get('pageSize')

  if (pageSize) {
    parsedPageSize = parseInt(pageSize)
    parsedPageSize = parsedPageSize && Number.isInteger(parsedPageSize) && parsedPageSize >= 0 ? parsedPageSize : NaN
    parsedPageSize = Math.min(parsedPageSize, VALUES.issuesPageSizeMax)
    if (parsedPageSize) {
      variables['first'] = parsedPageSize
    }
  }

  const page = urlSearchParams.get('page')

  const pageNum = page ? parseInt(page) : undefined

  if (pageNum && Number.isInteger(pageNum) && pageNum > 1) {
    const size = parsedPageSize ? parsedPageSize : VALUES.issuesPageSizeDefault
    variables['skip'] = (pageNum - 1) * size
  } else {
    variables['skip'] = 0
  }
}

export type TokenType = 'label' | 'project' | 'author' | 'assignee' | 'milestone' | 'type'

// \\b${type}: matches the token type followed by a colon.
// ("([^"]*)"|[^,\\s]+) matches either a sequence of characters surrounded by double quotes (allowing for escaped
//    quotes within the sequence) or a sequence of non-comma and non-whitespace characters.
// (\\s*,\\s*("(?:\\"|.)*?"|[^,\\s]+))* matches zero or more occurrences of a comma followed by any number of
//     whitespace characters and another token.

const TOKENS_BY_TYPE = (type: TokenType) =>
  new RegExp(`\\b${type}:("([^"]*)"|[^,\\s]+)(\\s*,\\s*("(?:\\"|.)*?"|[^,\\s]+))*`, 'gim')

export const getTokensByType = (searchQuery: string, type: TokenType) => {
  const re = TOKENS_BY_TYPE(type)
  let match
  const matches = []
  while ((match = re.exec(searchQuery)) !== null) {
    matches.push(match[0])
  }

  const values = []
  if (matches && matches.length) {
    for (match of matches) {
      const tokens = match.slice(`${type}:`.length).split(',')
      if (!tokens) continue
      for (const token of tokens) {
        values.push(token.trim())
      }
    }
    return values
  }
  return []
}

// Remove any consecutive spaces in the query (but doesn't remove spaces within quotes)
// eg. `is:open   type:issue title:"spaces  in between" -> `is:open type:issue title:"spaces  in between"
function cleanConsecutiveSpaces(query: string): string {
  let inQuotes = false
  let newQuery = ''
  let prevChar = ''

  for (const char of query) {
    // Toggle inQuotes status on encountering a quote that is not escaped
    if (char === '"' && prevChar !== '\\') {
      inQuotes = !inQuotes
    }

    // Add the character to newQuery if:
    // - It's not a space
    // - It's a space, but we're inside quotes
    // - It's a space, we're not inside quotes, and the previous character is not a space
    if (char !== ' ' || inQuotes || prevChar !== ' ') {
      newQuery += char
    }

    prevChar = char
  }

  return newQuery.trim()
}

export const replaceTokensDifferentially = (searchQuery: string, newTokens: string[], type: TokenType) => {
  const existingTokens = getTokensByType(searchQuery, type)

  // Handle no:type case
  if (searchQuery.includes(`no:${type}`)) {
    searchQuery = searchQuery.replace(`no:${type}`, '')
  }

  const tokensToAdd = newTokens.filter(token => !existingTokens.includes(token))
  const tokensToRemove = existingTokens.filter(token => !newTokens.includes(token))

  let newQuery = searchQuery.slice()
  for (const token of tokensToRemove) {
    newQuery = newQuery.replace(new RegExp(`${type}:${token}`, 'g'), '')
  }
  for (const token of tokensToAdd) {
    if (token === `no:${type}`) {
      newQuery = `${newQuery} ${token} `
      continue
    }
    newQuery = `${newQuery} ${type}:${token}`
  }

  newQuery = cleanConsecutiveSpaces(newQuery)

  return newQuery
}

export const replaceAllFiltersByTypeInSearchQuery = (
  searchQuery: string,
  tokens: string[],
  type: TokenType,
  isNegatedFilter?: boolean,
) => {
  // Match the type followed by a colon, followed by one or a comma-separated list of a quoted string or a non-whitespace string
  const re = TOKENS_BY_TYPE(type)

  const cleanSearchQuery = searchQuery.replace(re, '').replace(`no:${type}`, '').trim()

  if (!tokens.length) {
    return cleanConsecutiveSpaces(cleanSearchQuery)
  }

  const formattedTokens = tokens.map(token => (token.includes(' ') ? `"${token}"` : token))

  const newQuery = isNegatedFilter ? `no:${type}` : `${type}:${formattedTokens.join(',')}`

  const query = `${cleanSearchQuery} ${newQuery}`

  return cleanConsecutiveSpaces(query)
}

const validateQuery = (query: string, key: string, validValues: string[]) => {
  const isQuery = query.match(new RegExp(`${key}:([^\\s]+)`))
  if (isQuery) {
    const [filter, value] = isQuery
    if (!validValues.includes(value || '')) {
      return query.replace(filter, '').replace(/\s+/g, ' ').trim()
    }
  }
  return query
}

export const validateSearchQuery = (searchQuery: string) => {
  const queryIsValidated = validateQuery(searchQuery, 'is', IS_FILTER_PROVIDER_VALUES)
  const queryStateValidated = validateQuery(queryIsValidated, 'state', STATE_FILTER_PROVIDER_VALUES)

  return queryStateValidated
}
