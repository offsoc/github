import {MemexWorkflowContentType} from '../../../api/workflows/contracts'
import {getInitialState} from '../../../helpers/initial-state'

export const SEARCH_DEBOUNCE_DELAY_MS = 200

const ALL_CONTENT_TYPES_MATCHER = /is:issues?,prs?|is:prs?,issues?/gi
const IS_ISSUE_MATCHER = /is:issue/gi
const IS_PR_MATCHER = /is:pr/gi
const ME_MATCHER = /\s*assignee:(.*,)?("?(@me)"?)(,\S)*/gi
// Look for the assignee qualifier, and capture the value, up until the end of the string or the next qualifier
const ASSIGNEE_VALUE_MATCHER = /\s*assignee:(?<assignees>[^\s+]*)\s*/i
const DISALLOWED_ASSIGNEE_CHARACTERS = /[@|\s]/g

const IS_MATCHER = /is:(\S+)/gi
const ISSUE_MATCHER = /issues?/
const PR_MATCHER = /prs?/
const ISSUE = 'issue'
const PR = 'pr'

const ALL_CONTENT_TYPES = [MemexWorkflowContentType.Issue, MemexWorkflowContentType.PullRequest]

export const formatAssigneeMeQuery = (searchQuery: string) => {
  const {loggedInUser} = getInitialState()

  if (loggedInUser?.login) {
    const match = [...searchQuery.matchAll(ME_MATCHER)]
    if (match.length) {
      const [fullMatch, preceding, value, following] = match[0] as unknown as [string, string, string, string]
      const replacePattern = preceding ? value : following ? value : fullMatch
      searchQuery = searchQuery.replace(replacePattern, loggedInUser.login)
    }
  }

  const matchAssignees = searchQuery.match(ASSIGNEE_VALUE_MATCHER)
  if (matchAssignees && matchAssignees.groups?.assignees) {
    const assignees = matchAssignees.groups.assignees
    // Remove the leading @, and whitespace, and deduplicate assignees
    const updatedAssignees = [
      ...new Set(assignees.toLowerCase().replace(DISALLOWED_ASSIGNEE_CHARACTERS, '').split(',')),
    ].join(',')
    return searchQuery.replace(assignees, updatedAssignees)
  }

  return searchQuery
}

export const formatQuery = (searchQuery: string) => {
  return formatIsQuery(formatAssigneeMeQuery(searchQuery)).trim()
}

export const getContentTypes = (searchQuery: string): Array<MemexWorkflowContentType> => {
  const formattedQuery = formatIsQuery(searchQuery)
  if (formattedQuery.match(IS_ISSUE_MATCHER)) {
    return [MemexWorkflowContentType.Issue]
  } else if (formattedQuery.match(IS_PR_MATCHER)) {
    return [MemexWorkflowContentType.PullRequest]
  }

  return ALL_CONTENT_TYPES
}

export const initializeQuery = (initialQuery: string, workflowContentTypes: Array<MemexWorkflowContentType>) => {
  if (containsAllContentTypes(workflowContentTypes) && !initialQuery.match(ALL_CONTENT_TYPES_MATCHER)) {
    return `is:issue,pr ${initialQuery}`
  }

  if (workflowContentTypes.length === 1) {
    if (workflowContentTypes[0] === MemexWorkflowContentType.Issue && !initialQuery.match(ISSUE_MATCHER)) {
      return `is:issue ${initialQuery}`
    }

    if (workflowContentTypes[0] === MemexWorkflowContentType.PullRequest && !initialQuery.match(PR_MATCHER)) {
      return `is:pr ${initialQuery}`
    }
  }
  return initialQuery
}

const containsAllContentTypes = (workflowContentTypes: Array<MemexWorkflowContentType>) => {
  if (!workflowContentTypes || workflowContentTypes?.length < ALL_CONTENT_TYPES.length) return false

  return ALL_CONTENT_TYPES.every(contentType => workflowContentTypes.includes(contentType))
}

const normalizeIsQualifierValue = (value: string) => {
  if (value.match(ISSUE_MATCHER)) return ISSUE
  if (value.match(PR_MATCHER)) return PR
  return value
}

const formatIsQualifierValues = (qualifierValues: string) => {
  const valuesSet = new Set(qualifierValues.split(',').map(value => normalizeIsQualifierValue(value)))

  let contentTypeSegment = ''

  if (valuesSet.has(ISSUE)) {
    valuesSet.delete(ISSUE)
    contentTypeSegment = 'is:issue'
  }

  if (valuesSet.has(PR)) {
    valuesSet.delete(PR)
    // we do not pass the content type part if both are selected because dotcom search does not support it
    contentTypeSegment = contentTypeSegment.length === 0 ? 'is:pr' : ''
  }

  return valuesSet.size > 0
    ? `${contentTypeSegment} is:${Array.from(valuesSet.values()).join(',')}`.trim()
    : contentTypeSegment
}

const formatIsQuery = (searchQuery: string) => {
  let formattedQuery = searchQuery
  const isQualifierValues = [...formattedQuery.matchAll(IS_MATCHER)]

  for (const [fullMatch, values] of isQualifierValues) {
    if (values) {
      formattedQuery = formattedQuery.replace(fullMatch, formatIsQualifierValues(values))
    }
  }

  return formattedQuery
}
