import escapeRegExp from 'lodash-es/escapeRegExp'

import type {ServerDateValue} from '../../../api/columns/contracts/date'
import type {UpdateColumnValueAction} from '../../../api/columns/contracts/domain'
import type {Iteration, IterationValue} from '../../../api/columns/contracts/iteration'
import {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import type {NumericValue} from '../../../api/columns/contracts/number'
import type {PersistedOption, SingleSelectValue} from '../../../api/columns/contracts/single-select'
import type {ColumnData} from '../../../api/columns/contracts/storage'
import type {EnrichedText} from '../../../api/columns/contracts/text'
import type {Progress} from '../../../api/columns/contracts/tracks'
import {
  IssueStateReason,
  type Label,
  type LinkedPullRequest,
  type Review,
  type User,
} from '../../../api/common-contracts'
import type {TrackedByItem} from '../../../api/issues-graph/contracts'
import {ItemType} from '../../../api/memex-items/item-type'
import {assertNever} from '../../../helpers/assert-never'
import {dateStringFromISODate} from '../../../helpers/date-string-from-iso-string'
import {getInitialState} from '../../../helpers/initial-state'
import {
  compareAscending,
  getAllIterations,
  getAllIterationsForConfiguration,
  getCustomIterationFromToken,
  getCustomIterationToken,
  IterationToken,
} from '../../../helpers/iterations'
import {not_typesafe_nonNullAssertion} from '../../../helpers/non-null-assertion'
import {
  isNumber,
  parseDate,
  parseIsoDateStringToDate,
  parseNumber,
  parseTitleDefaultRaw,
  parseTitleNumber,
  progressAsPercent,
} from '../../../helpers/parsing'
import {fullDisplayName} from '../../../helpers/tracked-by-formatter'
import {trimCharacters} from '../../../helpers/util'
import type {ColumnModel} from '../../../models/column-model'
import type {IterationColumnModel} from '../../../models/column-model/custom/iteration'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {Resources} from '../../../strings'
import {LAST_UPDATED_REGEX_DAYS, MeToken, UPDATED_REGEX} from './search-constants'
import {findLastToken, findNextToken, getTokens, tokenizeFilter} from './tokenize-filter'

export type IFieldFilters = [string, Array<string>]

const LEADING_AND_TRAILING_QUOTES = /^["'`](.*)["'`]$/

/**
 * Search for multiple, space-separated words in a string
 * @param query Array of search tokens. They are expected to be lower cased from the state, this function is not taking care of this
 * @param value Text which is being searched through
 * @returns True if all the words from the query will be found inside the value string
 */
export const freeTextMatch = (queryWords: Array<string>, value: string): boolean => {
  value = value.toLocaleLowerCase()
  return queryWords.every(word => value.includes(word.replace(LEADING_AND_TRAILING_QUOTES, '$1')))
}

/**
 *
 * Given a value to test, and a string with potential wildcard
 * characters, check whether the wilcard string matches the value.
 */
function matchWithWildcard(valueToTestAgainst: string, stringWithWildcards: string) {
  const regexWithWildcardMatchers = new RegExp(
    `^${stringWithWildcards
      .trim()
      .split('*')
      .map((string: string) => {
        // escape any regex characters in the string
        return escapeRegExp(string)
      })
      .join('.*')}$`,
    'i',
  )
  return regexWithWildcardMatchers.test(valueToTestAgainst.trim())
}

export const filterMatches = (values: Array<string>, string: string) => {
  return values.some(value => {
    return matchWithWildcard(string, value)
  })
}

const GREATER_THAN = />(.*)/
const GREATER_THAN_OR_EQUAL = />=(.*)/
const LESS_THAN = /<(.*)/
const LESS_THAN_OR_EQUAL = /<=(.*)/
const RANGE = /(.*)\.\.(.*)/
const LESS_THAN_RANGE = /\*\.\.(.*)/
const GREATER_THAN_RANGE = /(.*)\.\.\*/

type ComparisonExpression<Value = string> =
  | {operator: 'GREATER_THAN'; value: Value}
  | {operator: 'GREATER_THAN_OR_EQUAL'; value: Value}
  | {operator: 'LESS_THAN'; value: Value}
  | {operator: 'LESS_THAN_OR_EQUAL'; value: Value}
  | {operator: 'RANGE'; start: Value; end: Value}
  | {operator: 'LESS_THAN_RANGE'; end: Value}
  | {operator: 'GREATER_THAN_RANGE'; start: Value}

/**
 * Parses a string value that is expected to contain a comparison like: `>=5`, `x..y`, `2020..*`, and
 * turns it into a structured comparison expression object. Returns `null` if there does not appear to
 * be a parsable comparison.
 *
 * @param comparison A string value containing a properly formatted comparison
 * @returns A comparison expression or null if there does not appear to be a comparison
 */
export const parseComparison = (comparison: string): ComparisonExpression | null => {
  // The order of these checks is important! More specific values should be checked first,
  // since some operators are a substring of other operators, e.g. `>` is a substring of `>=`.
  let match = comparison.match(GREATER_THAN_OR_EQUAL)
  if (match && match[1]) return {operator: 'GREATER_THAN_OR_EQUAL', value: match[1]}

  match = comparison.match(GREATER_THAN)
  if (match && match[1] != null) return {operator: 'GREATER_THAN', value: match[1]}

  match = comparison.match(LESS_THAN_OR_EQUAL)
  if (match && match[1] != null) return {operator: 'LESS_THAN_OR_EQUAL', value: match[1]}

  match = comparison.match(LESS_THAN)
  if (match && match[1] != null) return {operator: 'LESS_THAN', value: match[1]}

  match = comparison.match(LESS_THAN_RANGE)
  if (match && match[1] != null) return {operator: 'LESS_THAN_RANGE', end: match[1]}

  match = comparison.match(GREATER_THAN_RANGE)
  if (match && match[1] != null) return {operator: 'GREATER_THAN_RANGE', start: match[1]}

  match = comparison.match(RANGE)
  if (match && match[1] != null && match[2] != null) return {operator: 'RANGE', start: match[1], end: match[2]}

  return null
}

/**
 * Takes a comparison expression and maps all values in the comparison with the passed-in
 * mapping function. (Similar to `Array.map`)
 *
 * @param comparisonExpression The expression to transform
 * @returns The same comparison expression, but with the values inside transformed
 */
const mapComparison = <Input, Output>(
  comparisonExpression: ComparisonExpression<Input> | null,
  mapFn: (value: Input) => Output,
): ComparisonExpression<Output> | null => {
  if (!comparisonExpression) return null
  switch (comparisonExpression.operator) {
    case 'GREATER_THAN':
    case 'GREATER_THAN_OR_EQUAL':
    case 'LESS_THAN':
    case 'LESS_THAN_OR_EQUAL':
      return {...comparisonExpression, value: mapFn(comparisonExpression.value)}
    case 'GREATER_THAN_RANGE':
      return {...comparisonExpression, start: mapFn(comparisonExpression.start)}
    case 'LESS_THAN_RANGE':
      return {...comparisonExpression, end: mapFn(comparisonExpression.end)}
    case 'RANGE':
      return {
        ...comparisonExpression,
        start: mapFn(comparisonExpression.start),
        end: mapFn(comparisonExpression.end),
      }
    default: {
      assertNever(comparisonExpression)
    }
  }
}

const numberMatches = (values: Array<string>, number: number): boolean => {
  return values.some(value => {
    const comparison = parseComparison(value)
    if (comparison?.operator === 'GREATER_THAN_OR_EQUAL') {
      return number >= parseNumber(comparison.value)
    } else if (comparison?.operator === 'GREATER_THAN') {
      return number > parseNumber(comparison.value)
    } else if (comparison?.operator === 'LESS_THAN_OR_EQUAL') {
      return number <= parseNumber(comparison.value)
    } else if (comparison?.operator === 'LESS_THAN') {
      return number < parseNumber(comparison.value)
    } else if (comparison?.operator === 'LESS_THAN_RANGE') {
      return number <= parseNumber(comparison.end)
    } else if (comparison?.operator === 'GREATER_THAN_RANGE') {
      return number >= parseNumber(comparison.start)
    } else if (comparison?.operator === 'RANGE') {
      return number >= parseNumber(comparison.start) && number <= parseNumber(comparison.end)
    } else {
      return parseNumber(value) === number
    }
  })
}

function compareDates(
  comparison: ComparisonExpression<Date | null | undefined>,
  itemDate: Date,
): boolean | undefined | null {
  if (comparison.operator === 'GREATER_THAN_OR_EQUAL') {
    return comparison.value && itemDate >= comparison.value
  } else if (comparison.operator === 'GREATER_THAN') {
    return comparison.value && itemDate > comparison.value
  } else if (comparison.operator === 'LESS_THAN_OR_EQUAL') {
    return comparison.value && itemDate <= comparison.value
  } else if (comparison.operator === 'LESS_THAN') {
    return comparison.value && itemDate < comparison.value
  } else if (comparison.operator === 'LESS_THAN_RANGE') {
    return comparison.end && itemDate <= comparison.end
  } else if (comparison.operator === 'GREATER_THAN_RANGE') {
    return comparison.start && itemDate >= comparison.start
  } else if (comparison.operator === 'RANGE') {
    // Ranges can be open-ended where either the start or end is nothing/null, so the order is important here
    if (comparison.start && comparison.end) {
      return itemDate >= comparison.start && itemDate <= comparison.end
    } else if (comparison.start) {
      return itemDate >= comparison.start
    } else if (comparison.end) {
      return itemDate <= comparison.end
    }
  }
  return false
}

const dateMatches = (values: Array<string>, date: string): boolean => {
  const itemDate = parseDate(date)
  if (!itemDate) return false

  return values.some(value => {
    const parsedComparison = parseComparison(value)
    let failedToParse = false
    const comparison = mapComparison(parsedComparison, (dateValue: string) => {
      // If any of the date values inside of the comparison fails to parse, then we
      // should treat the whole comparison as failing to parse correctly
      const parsedDate = parseDate(dateValue)
      if (dateValue && !parsedDate) {
        failedToParse = true
      }
      return parsedDate
    })

    if (failedToParse) {
      return false
    }

    if (comparison?.operator) {
      return compareDates(comparison, itemDate)
    } else {
      const parsedDate = parseDate(value)
      if (!parsedDate) return false
      const isSameDate =
        itemDate.getFullYear() === parsedDate.getFullYear() &&
        itemDate.getMonth() === parsedDate.getMonth() &&
        itemDate.getDate() === parsedDate.getDate()

      return filterMatches(values, date) || isSameDate
    }
  })
}

/**
 * Given an iteration query value, return the iteration associated
 *
 * @param value A query string value
 * @param column An iteration column
 * @returns A matching iteration or undefined
 */
export function getIterationFromExpression(value: string, column: IterationColumnModel): Iteration | null {
  const customIteration = getCustomIterationFromToken(value, column)
  if (customIteration) {
    return customIteration
  }

  const allIterations = getAllIterations(column).sort(compareAscending)

  const hasIterationToken = Object.values(IterationToken).some(token => value.includes(token))

  if (hasIterationToken) {
    // If the value has something like @current, @previous, etc. then try to tokenize it
    // so that we can parse out the relative offset, if it exists
    const iterationTokens = tokenizeFilter(value)
    const baseIterationToken = findNextToken(iterationTokens, {kind: 'string', start: 0})
    const specialIterationToken = baseIterationToken ? getCustomIterationToken(baseIterationToken.text) : null

    const iteration = specialIterationToken ? getCustomIterationFromToken(specialIterationToken, column) : null

    if (iteration && baseIterationToken) {
      // Find the offset like `+1` or `-10`, after the value, if it exists
      const offsetTokens = getTokens(iterationTokens, {
        kinds: ['keyword.operator', 'string'],
        start: baseIterationToken,
      })
      if (!offsetTokens) return null

      const [offsetOperator, offsetValue] = offsetTokens
      const offset =
        parseNumber(not_typesafe_nonNullAssertion(offsetValue).text) *
        (not_typesafe_nonNullAssertion(offsetOperator).text === '+' ? 1 : -1)

      if (!isNaN(offset)) {
        const baseIterationIndex = allIterations.findIndex(iter => iter.id === iteration.id)
        if (baseIterationIndex > -1) {
          return allIterations.at(baseIterationIndex + offset) ?? null
        }
      }
    }
  }

  // If it's not a special token value, then just treat it normally and try to find
  // an iteration with the same name
  // NOTE: titles are not unique, so this is a best effort attempt at matching a text query
  const iteration = allIterations.find(iter => value.toLowerCase().trim() === iter.title.toLowerCase().trim())

  return iteration ?? null
}

/**
 * Given an iteration query value, return a potential start date for the query
 *
 * @param value A query string value
 * @param column An iteration column
 * @returns A start date associated with a matching iteration or undefined
 */
function iterationValueToDate(value: string, column: IterationColumnModel): string | undefined {
  return getIterationFromExpression(value, column)?.startDate
}

/**
 * Given an iteration query value, determine if that column is a match using the following criteria:
 * 1. If the values contain a comparison operator, map the query to a start date to compare with item's iteration start date
 * 2. If the values contains a special token, "@current", match the token to an iteration to compare with item's iteration start date
 * 3. Match the values to compare with item's title
 * 4. If item has no iteration, return matchEmpty
 *
 * @param values An array containing the sanitized query strings
 * @param column An iteration column
 * @param matchEmpty If true, items without an iteration will be matched
 * @param selectedIterationId Iteration id for the current item
 * @returns Whether the column matches the query
 */
export function iterationMatches(
  values: Array<string>,
  column: IterationColumnModel,
  matchEmpty: boolean,
  selectedIterationId?: string,
): boolean {
  const iterations = getAllIterations(column)
  const selectedIteration = iterations.find((option: IterationValue) => option.id === selectedIterationId)

  if (!selectedIteration) {
    return matchEmpty
  }

  // Given a potential query, @current, "Iteration 1", try to find the associated start date of an iteration to be used for comparison with the current column
  const mapDatesToComparison = (value: string) => {
    const possibleDate = iterationValueToDate(value, column)
    return possibleDate ? parseDate(possibleDate) : undefined
  }

  return values.some(value => {
    // Check if the value contains a comparison: >=@current
    const comparison = mapComparison(parseComparison(value), mapDatesToComparison)
    if (comparison?.operator) {
      const parsedDate = parseDate(selectedIteration.startDate)
      return parsedDate ? compareDates(comparison, parsedDate) : false
    } else {
      const iteration = getIterationFromExpression(value, column)

      return iteration?.id === selectedIteration.id
    }
  })
}

const PERCENT_FORMAT = /(\d+)%/g
const progressMatches = (values: Array<string>, progress: Progress): boolean => {
  const progressPercent = progressAsPercent(progress)
  // HACK: Try to filter for values matching against progress percent and strip out '%'
  const progressPercentValues = values
    .filter(value => PERCENT_FORMAT.test(value))
    .map(value => value.replace(PERCENT_FORMAT, (_, percentDigits: string) => percentDigits))
  return numberMatches(progressPercentValues, progressPercent)
}

const trackedByItemMatches = (values: Array<string>, trackedByItem: TrackedByItem): boolean => {
  const trackedByItemKey = fullDisplayName(trackedByItem).toLocaleLowerCase()
  return values.some(value => value.toLocaleLowerCase() === trackedByItemKey)
}

// Checks if free text in search field has any matches with memex items.
// It loops over the visible columns and checks if the row item has a fuzzy (not exact) match with the query string.
export const matchesFreeText = (
  columnData: ColumnData,
  visibleColumns: ReadonlyArray<ColumnModel>,
  queryTokens: Array<string>,
) => {
  if (!queryTokens.length) {
    return true
  }

  return !!visibleColumns.find((column: ColumnModel) => {
    switch (column.dataType) {
      case MemexColumnDataType.Title: {
        const title = parseTitleDefaultRaw(columnData.Title)
        const number = parseTitleNumber(columnData.Title)
        const titleWithNumber = isNumber(number) ? `${title} #${number}` : title

        return titleWithNumber
          ? freeTextMatch(queryTokens, title) || freeTextMatch(queryTokens, titleWithNumber)
          : false
      }
      case MemexColumnDataType.Assignees: {
        return !!columnData[SystemColumnId.Assignees]?.find((assignee: User) => {
          return (
            freeTextMatch(queryTokens, assignee.login) || (assignee.name && freeTextMatch(queryTokens, assignee.name))
          )
        })
      }
      case MemexColumnDataType.SingleSelect: {
        const selectedOptionId = (columnData[column.id] as SingleSelectValue)?.id
        const selectedOption = column.settings.options?.find(
          (option: PersistedOption) => option.id === selectedOptionId,
        )
        const selectedOptionName = selectedOption?.name
        return selectedOptionName && freeTextMatch(queryTokens, selectedOptionName)
      }
      case MemexColumnDataType.Labels: {
        return !!columnData[SystemColumnId.Labels]?.find((label: Label) => {
          return freeTextMatch(queryTokens, label.name)
        })
      }
      case MemexColumnDataType.Repository: {
        const repository = columnData[SystemColumnId.Repository]?.nameWithOwner
        return repository ? freeTextMatch(queryTokens, repository) : false
      }
      case MemexColumnDataType.Milestone: {
        const milestone = columnData[SystemColumnId.Milestone]?.title
        return milestone ? freeTextMatch(queryTokens, milestone) : false
      }
      case MemexColumnDataType.Text: {
        const text = columnData[column.id] as EnrichedText
        return text ? freeTextMatch(queryTokens, text.raw) : false
      }
      case MemexColumnDataType.Number: {
        const number = columnData[column.id] as NumericValue
        return number ? freeTextMatch(queryTokens, number.value.toString()) : false
      }
      case MemexColumnDataType.Date: {
        const date = columnData[column.id] as ServerDateValue
        return date ? freeTextMatch(queryTokens, date.value.toString()) : false
      }
      case MemexColumnDataType.Iteration: {
        const selectedIterationId = (columnData[column.id] as IterationValue)?.id
        const iterations = getAllIterations(column)
        const selectedIteration = iterations.find((option: IterationValue) => option.id === selectedIterationId)
        const selectedIterationName = selectedIteration?.title
        return selectedIterationName && freeTextMatch(queryTokens, selectedIterationName)
      }
      case MemexColumnDataType.LinkedPullRequests: {
        return !!columnData[SystemColumnId.LinkedPullRequests]?.find((linkedPullRequest: LinkedPullRequest) => {
          return freeTextMatch(queryTokens, linkedPullRequest.number.toString())
        })
      }
      case MemexColumnDataType.Reviewers: {
        return !!columnData.Reviewers?.find((review: Review) => {
          return (
            freeTextMatch(queryTokens, review.reviewer.name) ||
            (review.reviewer.name && freeTextMatch(queryTokens, review.reviewer.name))
          )
        })
      }
      case MemexColumnDataType.Tracks: {
        // TODO: work out how to usefully handle free text search on Tracks column?
        const tracks = columnData.Tracks
        return tracks
          ? freeTextMatch(
              queryTokens,
              tracks && Resources.progressCount({percent: progressAsPercent(tracks), total: tracks.total}),
            )
          : false
      }
      case MemexColumnDataType.TrackedBy: {
        return columnData[SystemColumnId.TrackedBy]?.some(trackedBy =>
          freeTextMatch(queryTokens, fullDisplayName(trackedBy)),
        )
      }
      case MemexColumnDataType.IssueType: {
        const issueType = columnData[SystemColumnId.IssueType]?.name
        return issueType ? freeTextMatch(queryTokens, issueType) : false
      }
      case MemexColumnDataType.ParentIssue: {
        const parentIssue = columnData[SystemColumnId.ParentIssue]?.nwoReference
        return parentIssue ? freeTextMatch(queryTokens, parentIssue) : false
      }
      case MemexColumnDataType.SubIssuesProgress: {
        return false
      }
      default: {
        assertNever(column)
      }
    }
  })
}

type MatchMetaPropsOptions = {
  columnData: ColumnData
  field: 'type' | 'state' | 'reason'
  value: string
  matchNegated?: boolean
}
/**
 * A function that is used to filter a memex item by a meta property aka it's type or state
 * @param options Object that concatenates
 *  - item: the memex item which is tested
 *  - field : filter item by type ( issue | draft |pull ) or by state ( open | closed | draft )
 *  - value: the desired value for the specified field
 *  - matchNegated: optional boolean that specifies if query should return results that do not include the field specified
 * @returns True if the item is of the specified type or in the specified state
 */
export const matchMetaProps = ({columnData, field, value, matchNegated = false}: MatchMetaPropsOptions) => {
  const titleValue = columnData.Title
  if (!titleValue) {
    return false
  }

  let hasMatch
  if (field === 'type') {
    switch (titleValue.contentType) {
      case ItemType.DraftIssue:
        hasMatch = value === 'draft' || value === 'issue'
        return matchNegated ? !hasMatch : hasMatch
      case ItemType.Issue:
        hasMatch = value === 'issue'
        return matchNegated ? !hasMatch : hasMatch
      case ItemType.PullRequest: {
        const {state, isDraft} = titleValue.value

        if (value === 'draft') {
          hasMatch = state === 'open' && isDraft
        } else {
          hasMatch = value === 'pr'
        }

        return matchNegated ? !hasMatch : hasMatch
      }
      default:
        return false
    }
  }

  if (field === 'state') {
    switch (titleValue.contentType) {
      case ItemType.Issue: {
        const itemState = titleValue.value.state.toString()
        hasMatch = itemState === value
        return matchNegated ? !hasMatch : hasMatch
      }
      case ItemType.PullRequest: {
        const {isDraft, state} = titleValue.value
        hasMatch =
          state === value /* direct comparison for open | closed | merged states */ ||
          (state === 'merged' && value === 'closed') /* merged items are considered closed */ ||
          (isDraft && state === 'open' && value === 'draft') /* draft pulls count for drafts */
        return matchNegated ? !hasMatch : hasMatch
      }
      case ItemType.DraftIssue: {
        // is:open should return draft issues
        if (value === 'open') return !matchNegated
        if (value === 'closed' || value === 'merged') return matchNegated
        return false
      }
      default:
        return false
    }
  }

  if (field === 'reason') {
    switch (titleValue.contentType) {
      case ItemType.Issue: {
        const itemState = titleValue.value.state.toString()
        // Because completed value is not filled in the DB, we consider closed with no reason as completed
        const itemStateReason =
          titleValue.value.stateReason ?? (itemState === 'closed' ? IssueStateReason.Completed : undefined)
        if (
          itemState === 'closed' &&
          itemStateReason &&
          new Set<IssueStateReason>([IssueStateReason.Completed, IssueStateReason.NotPlanned]).has(itemStateReason)
        ) {
          hasMatch = itemStateReason === asStateReason(value)
        } else if (itemState === 'open' && itemStateReason === IssueStateReason.Reopened) {
          hasMatch = itemStateReason === asStateReason(value)
        } else {
          hasMatch = false
        }
        return matchNegated ? !hasMatch : hasMatch
      }
      case (ItemType.PullRequest, ItemType.DraftIssue): {
        return matchNegated
      }
      default:
        return false
    }
  }
  return false
}

type MatchesFilterOptions = {
  columnData: ColumnData
  column: ColumnModel
  values?: Array<string>
  matchEmpty?: boolean
  matchNegated?: boolean
}
const defaultValues: Array<string> = []
export const matchesFilter = ({
  column,
  columnData,
  values = defaultValues,
  matchEmpty = false,
  matchNegated = false,
}: MatchesFilterOptions) => {
  const {loggedInUser} = getInitialState()
  let hasMatch

  switch (column.dataType) {
    case MemexColumnDataType.Title: {
      const title = parseTitleDefaultRaw(columnData.Title)
      const number = parseTitleNumber(columnData.Title)
      const titleWithPossibleNumber = isNumber(number) ? `${title} #${number}` : title

      hasMatch = titleWithPossibleNumber
        ? // match the title with or without the number
          filterMatches(values, title) || filterMatches(values, titleWithPossibleNumber)
        : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.Assignees: {
      return userFieldMatchesFilter(columnData, 'Assignees', values, matchEmpty, matchNegated, loggedInUser)
    }
    case MemexColumnDataType.SingleSelect: {
      const selectedOptionId = (columnData[column.id] as SingleSelectValue)?.id
      const selectedOption = column.settings.options?.find((option: PersistedOption) => option.id === selectedOptionId)
      const selectedOptionName = selectedOption?.name
      hasMatch = selectedOptionName ? filterMatches(values, selectedOptionName) : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.Labels: {
      if (matchEmpty) {
        const hasEmptyMatch = !columnData.Labels || !columnData.Labels?.length
        return matchNegated ? !hasEmptyMatch : hasEmptyMatch
      }

      hasMatch = !!columnData.Labels?.find((label: Label) => {
        return filterMatches(values, label.name)
      })
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.Repository: {
      const repository = columnData.Repository?.nameWithOwner
      hasMatch = repository ? filterMatches(values, repository) : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.Milestone: {
      const milestone = columnData.Milestone?.title
      hasMatch = milestone ? filterMatches(values, milestone) : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.Text: {
      const text = columnData[column.id] as EnrichedText
      hasMatch = text ? filterMatches(values, text.raw) : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.Number: {
      const number = columnData[column.id] as NumericValue
      hasMatch = number ? numberMatches(values, number.value) : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.Date: {
      const date = columnData[column.id] as ServerDateValue
      hasMatch = date ? dateMatches(values, dateStringFromISODate(date.value)) : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.Iteration: {
      const selectedIterationId = (columnData[column.id] as IterationValue)?.id
      hasMatch = iterationMatches(values, column, matchEmpty, selectedIterationId)

      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.LinkedPullRequests: {
      if (matchEmpty) {
        const hasEmptyMatch =
          !columnData[SystemColumnId.LinkedPullRequests] || !columnData[SystemColumnId.LinkedPullRequests]?.length
        return matchNegated ? !hasEmptyMatch : hasEmptyMatch
      }

      hasMatch = !!columnData[SystemColumnId.LinkedPullRequests]?.find((linkedPullRequest: LinkedPullRequest) => {
        return filterMatches(values, linkedPullRequest.number.toString())
      })
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.Reviewers: {
      return userFieldMatchesFilter(columnData, 'Reviewers', values, matchEmpty, matchNegated, loggedInUser)
    }
    case MemexColumnDataType.Tracks: {
      const progress = columnData[SystemColumnId.Tracks]
      // Check if the tasklist is null or empty i.e total tasklist items = 0
      hasMatch = progress && progress.total > 0 ? progressMatches(values, progress) : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.TrackedBy: {
      hasMatch = false
      const trackedBy = columnData[SystemColumnId.TrackedBy] ?? []

      if (matchEmpty) {
        const hasEmptyMatch = trackedBy.length === 0
        return matchNegated ? !hasEmptyMatch : hasEmptyMatch
      }

      for (const trackedByItem of trackedBy) {
        if (trackedByItemMatches(values, trackedByItem)) {
          hasMatch = true
        }
      }

      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.IssueType: {
      const issueType = columnData[SystemColumnId.IssueType]?.name
      hasMatch = issueType ? filterMatches(values, issueType) : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.ParentIssue: {
      const parentIssue = columnData[SystemColumnId.ParentIssue]?.nwoReference
      hasMatch = parentIssue ? filterMatches(values, parentIssue) : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    case MemexColumnDataType.SubIssuesProgress: {
      const subIssuesProgress = columnData[SystemColumnId.SubIssuesProgress]
      // Only support presence matching for now
      if (values.length) {
        return false
      }
      hasMatch = subIssuesProgress?.total ? !matchEmpty : matchEmpty
      return matchNegated ? !hasMatch : hasMatch
    }
    default: {
      assertNever(column)
    }
  }
}

type MatchLastUpdatedOptions = {
  itemUpdateAtDate?: Date | null
  value: string
  matchNegated?: boolean
}
/**
 * A function that filters the memex item based on its updatedAt property by using the query value as a date
 * Items that have not been updated in the last XX days will be matched (unless negated)
 * @param options Object that contains
 *  - itemUpdateAtDate: optional updatedAt date of the item
 *  - value: the query value (follows the pattern of XXdays)
 *  - matchNegated: optional boolean that specifies if the filter should return items that have been updated in the last XX days
 * @returns True if the item matches the filter
 */
export const matchesLastUpdated = ({itemUpdateAtDate, value, matchNegated}: MatchLastUpdatedOptions) => {
  if (!itemUpdateAtDate) {
    return false
  }

  const match = value.match(LAST_UPDATED_REGEX_DAYS)
  const daysAgo = match ? match[1] : undefined

  if (daysAgo) {
    const lastUpdatedDate = parseDate(`@today-${daysAgo}`)

    return !!compareDates(
      {operator: !matchNegated ? 'LESS_THAN' : 'GREATER_THAN_OR_EQUAL', value: lastUpdatedDate},
      itemUpdateAtDate,
    )
  }

  return false
}

type MatchUpdatedOptions = {
  itemUpdateAtDate?: Date | null
  value: string
  matchNegated?: boolean
}

type AllowedUnit = 'd' | 'w' | 'm'

const OffsetUnitConversion: Record<AllowedUnit, number> = {
  d: 1,
  w: 7,
  m: 28,
}
/**
 * A function that filters the memex item based on its updatedAt property by using the query value as a date
 * Items that have not been updated in the last XX days will be matched (unless negated)
 * @param options Object that contains
 *  - itemUpdateAtDate: optional updatedAt date of the item
 *  - value: the query value (follows the pattern of <@today-X)
 *  - matchNegated: optional boolean that specifies if the filter should return items that have been updated in the last XX days
 * @returns True if the item matches the filter
 */
export const matchesUpdated = ({itemUpdateAtDate, value, matchNegated}: MatchUpdatedOptions) => {
  if (!itemUpdateAtDate) {
    return false
  }

  const match = value.match(UPDATED_REGEX)

  if (match) {
    const [_, offset, unit] = match

    if (offset && unit) {
      const offSetInDays = parseInt(offset) * OffsetUnitConversion[unit as AllowedUnit]

      const lastUpdatedDate = parseDate(`@today-${offSetInDays}`)

      return !!compareDates(
        {operator: !matchNegated ? 'LESS_THAN' : 'GREATER_THAN_OR_EQUAL', value: lastUpdatedDate},
        itemUpdateAtDate,
      )
    }
  }

  return false
}

/**
 * Encapsulates the logic for determining if a list of values matches for a
 * column with "user" type data.
 * Considers the `@me` value in conjunction with the logged in user.
 * @param columnData The column data for the item
 * @param columnId The column id to check
 * @param values The filter values to check against
 * @param matchEmpty Whether or not to match empty values
 * @param matchNegated Whether or not to match negated values
 * @param loggedInUser The logged in user (if any)
 */
function userFieldMatchesFilter(
  columnData: ColumnData,
  columnId: 'Assignees' | 'Reviewers',
  values: Array<string>,
  matchEmpty: boolean,
  matchNegated: boolean,
  loggedInUser?: Pick<User, 'id' | 'login'>,
) {
  if (matchEmpty) {
    const hasEmptyMatch = !columnData[columnId] || !columnData[columnId]?.length
    return matchNegated ? !hasEmptyMatch : hasEmptyMatch
  }

  const meIndex = values.indexOf(MeToken)
  if (meIndex > -1) {
    if (loggedInUser?.login) {
      values.splice(meIndex, 1, loggedInUser.login.toLocaleLowerCase())
    }
  }

  let hasMatch

  if (columnId === 'Assignees') {
    hasMatch = !!columnData[columnId]?.find((assignee: User) => {
      return filterMatches(values, assignee.login) || (assignee.name && filterMatches(values, assignee.name))
    })
  } else {
    hasMatch = !!columnData[columnId]?.find((review: Review) => {
      return (
        filterMatches(values, review.reviewer.name) ||
        (review.reviewer.name && filterMatches(values, review.reviewer.name))
      )
    })
  }
  return matchNegated ? !hasMatch : hasMatch
}

type OrderedTokenizedFilterField = {
  type: 'field'
  field: string
  value: string
  exclude?: boolean
  spaceAfter: string
}

type OrderedTokenizedFilter =
  | OrderedTokenizedFilterField
  | {
      type: 'search'
      value: string
      spaceAfter: string
    }
  | {
      type: 'no-field'
      field: string
      exclude?: boolean
      spaceAfter: string
    }
  | {
      type: 'has'
      field: string
      exclude?: boolean
      spaceAfter: string
    }
  | {
      type: 'is'
      value: string
      exclude?: boolean
      spaceAfter: string
    }
  | {
      type: 'reason'
      value: string
      exclude?: boolean
      spaceAfter: string
    }
  | {
      type: 'last-updated'
      value: string
      exclude?: boolean
      spaceAfter: string
    }
  | {
      type: 'updated'
      value: string
      exclude?: boolean
      spaceAfter: string
    }

export type OrderedTokenizedFilters = Array<OrderedTokenizedFilter>

export type ParsedFullTextQuery = {
  /**
   * A list of tokens that are used to filter the search.
   * When the query is invalid, this list is empty.
   */
  searchTokens: Array<string>
  /**
   * A list of FieldFilters that are used to filter the search.
   * When the query is invalid, this list is empty.
   */
  fieldFilters: Array<IFieldFilters>
  /**
   * An ordered list of tokens that are used to order the search.
   * When the query is invalid, this list contains 1 item: the original query.
   */
  orderedTokenizedFilters: OrderedTokenizedFilters
  /**
   * Whether the query is valid.
   */
  invalidQuery: boolean
}

// Regex to match the query at key value pairs, a standalone string is considered a compound key value
export const SPLIT_ON_VALUES_REGEX =
  /(?:[\w-]+:)+(?:[^\s"']+|"(?:[^"]*)"*|'(?:[^']*)'*)*|(?:[^\s"']+|"(?:[^"]*)"*|'(?:[^']*)'*)/g

export function parseFullTextQuery(fullQuery: string): ParsedFullTextQuery {
  // Split at the matches returning the spaces
  const spaces = fullQuery.split(SPLIT_ON_VALUES_REGEX)
  SPLIT_ON_VALUES_REGEX.lastIndex = 0

  const searchTokens: Array<string> = []
  const fieldFilters: Array<IFieldFilters> = []
  const orderedTokenizedFilters: OrderedTokenizedFilters = []

  // Check if there is whitespace at the start of the string
  const firstMatch = SPLIT_ON_VALUES_REGEX.exec(fullQuery)
  SPLIT_ON_VALUES_REGEX.lastIndex = 0
  if (firstMatch && firstMatch.index > 0)
    orderedTokenizedFilters.push({type: 'search', value: '', spaceAfter: ' '.repeat(firstMatch.index)})

  let match = null
  // ignore the space before the string
  let spacesIndex = 1

  while ((match = SPLIT_ON_VALUES_REGEX.exec(fullQuery)) !== null) {
    const value = match[0] as string | undefined

    if (!value) continue // Skip empty values

    // Check the value to ensure that there is the correct amount of quotes
    if (hasOddNumberOfQuotes(value)) {
      return {
        searchTokens: [],
        fieldFilters: [],
        orderedTokenizedFilters: [{type: 'search', value: fullQuery, spaceAfter: ''}],
        invalidQuery: true,
      }
    }

    // Pull out the space after the value
    const spaceAfter = spaces[spacesIndex] || ''
    spacesIndex += 1

    if (couldBeColumnFilter(value)) {
      const columnName = parseColumnName(value)

      const filterText = value.substring(columnName.length + 1)

      if (columnName) {
        fieldFilters.push([columnName, splitFieldFilters(filterText)])
      }
      if (columnName === 'no') {
        orderedTokenizedFilters.push({type: 'no-field', field: filterText, spaceAfter})
      } else if (columnName === '-no') {
        orderedTokenizedFilters.push({type: 'no-field', field: filterText, exclude: true, spaceAfter})
      } else if (columnName === 'has') {
        orderedTokenizedFilters.push({type: 'has', field: filterText, spaceAfter})
      } else if (columnName === '-has') {
        orderedTokenizedFilters.push({type: 'has', field: filterText, exclude: true, spaceAfter})
      } else if (columnName === 'is') {
        orderedTokenizedFilters.push({type: 'is', value: filterText, spaceAfter})
      } else if (columnName === '-is') {
        orderedTokenizedFilters.push({type: 'is', exclude: true, value: filterText, spaceAfter})
      } else if (columnName === 'reason') {
        orderedTokenizedFilters.push({type: 'reason', value: filterText, spaceAfter})
      } else if (columnName === '-reason') {
        orderedTokenizedFilters.push({type: 'reason', exclude: true, value: filterText, spaceAfter})
      } else if (columnName === 'last-updated') {
        orderedTokenizedFilters.push({type: 'last-updated', value: filterText, spaceAfter})
      } else if (columnName === '-last-updated') {
        orderedTokenizedFilters.push({type: 'last-updated', exclude: true, value: filterText, spaceAfter})
      } else if (columnName === 'updated') {
        orderedTokenizedFilters.push({type: 'updated', value: filterText, spaceAfter})
      } else if (columnName === '-updated') {
        orderedTokenizedFilters.push({type: 'updated', exclude: true, value: filterText, spaceAfter})
      } else {
        const isExclusion = columnName.startsWith('-')
        orderedTokenizedFilters.push({
          type: 'field',
          field: isExclusion ? columnName.slice(1) : columnName,
          value: filterText,
          exclude: isExclusion,
          spaceAfter,
        })
      }
    } else {
      orderedTokenizedFilters.push({type: 'search', value, spaceAfter})

      const text = value.trim()
      if (text.length) {
        searchTokens.push(text.toLowerCase())
      }
    }
  }
  return {searchTokens, fieldFilters, orderedTokenizedFilters, invalidQuery: false}
}

export function isValuePresenceFilter(text: string) {
  return text === 'no' || text === 'has'
}

export function isNegatedFilter(text: string) {
  return text.indexOf('-') === 0
}

/**
 * Determines if a string has an odd number of quotes. Uses stacks to determine if the quote is outside of any
 * existing quotes - therefore handling unbalanced quotes like apostrophes in strings
 */
export function hasOddNumberOfQuotes(text: string) {
  // Track open single / double quotes
  const singleQuoteStack: Array<string> = []
  const doubleQuoteStack: Array<string> = []

  for (const char of text) {
    const hasDoubleQuotes = doubleQuoteStack.length > 0
    const hasSingleQuotes = singleQuoteStack.length > 0

    const lastSingleQuoteStackEntry = singleQuoteStack[singleQuoteStack.length - 1] || ''
    const lastDoubleQuotesStackEntry = doubleQuoteStack[doubleQuoteStack.length - 1] || ''

    if (char === "'") {
      // Check to see if it's outside of any double quotes, and if it matches the most
      // recent opened single quote on the stack
      if (!hasDoubleQuotes || lastDoubleQuotesStackEntry < lastSingleQuoteStackEntry) {
        // Push or pop depending on if the stack has an unmatched character
        if (singleQuoteStack.length > 0 && lastSingleQuoteStackEntry === char) {
          singleQuoteStack.pop()
        } else {
          singleQuoteStack.push(char)
        }
      }
    } else if (char === '"') {
      // Perform the same check for double quotes
      if (!hasSingleQuotes || lastSingleQuoteStackEntry < lastDoubleQuotesStackEntry) {
        if (doubleQuoteStack.length > 0 && lastDoubleQuotesStackEntry === char) {
          doubleQuoteStack.pop()
        } else {
          doubleQuoteStack.push(char)
        }
      }
    }
  }
  return singleQuoteStack.length > 0 || doubleQuoteStack.length > 0
}

const ALL_DOUBLE_QUOTES = /"/g

export function splitFieldFilters(filterText: string): Array<string> {
  const parts: Array<string> = []
  let cursor = 0
  for (let i = 0; i <= filterText.length; i++) {
    const char = filterText[i]
    const subText = filterText.substring(cursor, i)
    const numberOfDoubleQuote = (subText.match(ALL_DOUBLE_QUOTES) || []).length
    if ((char === ',' && numberOfDoubleQuote % 2 === 0) || i === filterText.length) {
      const normalizedItem = subText.replace(LEADING_AND_TRAILING_QUOTES, '$1').trim()

      cursor = i + 1
      if (normalizedItem.length) parts.push(normalizedItem)
    }
  }
  return parts
}

const FILTER_NAME_REGEX = /^[^:]*/

function parseColumnName(text: string): string {
  const columnFilter = text.match(FILTER_NAME_REGEX)
  const column = columnFilter && columnFilter[0] ? columnFilter[0] : ''

  return column
}

/**
 * Convert an array of ColumnModels
 * to a Map of filterable column/field names to ColumnModel,
 * used to map filters to fields
 * To normalize a column/field name as a filterable name:
 * - locale lowercase
 * - replace all spaces with hyphens
 * - replace column aliases with filter aliases
 */
export function makeFieldsByFilterableName(allColumns: Array<ColumnModel>) {
  const indexFieldByFilterableName = new Map<string, ColumnModel>()

  for (const column of allColumns) {
    const value = normalizeToFilterName(column.name)
    indexFieldByFilterableName.set(value, column)
  }

  return indexFieldByFilterableName
}

/**
 * `name` syntax differs for filters and fields.
 * This method normalizes a filter name to a field name.
 */
export function normalizeToLowercaseFieldName(name: string) {
  let fieldName = dehyphenateName(name.toLocaleLowerCase().trim())
  const filterAliases = ['repo', 'assignee', 'label']
  if (!filterAliases.includes(fieldName)) return fieldName

  if (fieldName === 'repo') {
    fieldName = 'repository'
  }

  if (fieldName === 'assignee') {
    fieldName = 'assignees'
  }

  if (fieldName === 'label') {
    fieldName = 'labels'
  }
  return fieldName
}

/**
 * `name` syntax differs for filters and fields.
 * This method normalizes a field name to a filter name.
 */
export function normalizeToFilterName(name: string) {
  let filterName = hyphenateName(name.toLocaleLowerCase().trim())
  const fieldAliases = ['repository', 'assignees', 'labels']
  if (!fieldAliases.includes(filterName)) return filterName

  if (filterName === 'repository') {
    filterName = 'repo'
  }
  if (filterName === 'assignees') {
    filterName = 'assignee'
  }
  if (filterName === 'labels') {
    filterName = 'label'
  }
  return filterName
}

/**
 * Normalize a field name to filter syntax,
 * but without hyphenating.
 * Used for presentational purposes.
 */
export function normalizeToDehyphenatedFilterName(name: string) {
  return dehyphenateName(normalizeToFilterName(name))
}

const COLUMN_FILTER_REGEX = /^(?:(?!["']|:).)+(?=:)/

function couldBeColumnFilter(text: string): boolean {
  return text.match(COLUMN_FILTER_REGEX) !== null
}

const SINGLE_SPACE_REGEX = / /g

function hyphenateName(text: string): string {
  return text.replace(SINGLE_SPACE_REGEX, '-')
}

const SINGLE_HYPHON_REGEX = /-/g

function dehyphenateName(text: string): string {
  return text.replace(SINGLE_HYPHON_REGEX, ' ')
}

/**
 * gets the column value pertaining to a filtered field value.
 * Returning (empty) defaults for `Assignees`, `Labels` and `Milestones`
 *
 * @param items - The Memex items to search inside.
 * @param column - The column whose values are to be found.
 * @param filterValues - the filter values entered by the user
 * @returns UpdateColumnValueAction or null if no value found
 */
export const getColumnValueFromFilters = (
  items: Readonly<Array<MemexItemModel>>,
  column: ColumnModel,
  filterValues: Array<string>,
): UpdateColumnValueAction | null => {
  if (!items.length || !filterValues.length) return null
  /**
   * Getting a field value for multiple filter values is not supported in this function.
   */
  if (filterValues.length > 1) return null
  const {dataType} = column

  switch (dataType) {
    case MemexColumnDataType.SingleSelect: {
      const option = column.settings.options?.find(c => filterMatches(filterValues, c.name))
      return option ? {dataType, memexProjectColumnId: column.id, value: {id: option.id}} : null
    }
    case MemexColumnDataType.Iteration: {
      const {configuration} = column.settings
      if (!configuration) return null
      const filterValue = filterValues[0]
      if (filterValue == null) return null
      let iteration: Iteration | null

      const customIteration = getCustomIterationFromToken(filterValue, column)
      if (filterValues.length === 1 && customIteration) {
        iteration = customIteration
      } else {
        iteration =
          getAllIterationsForConfiguration(configuration).find(i => filterMatches(filterValues, i.title)) || null
      }

      return iteration ? {dataType, memexProjectColumnId: column.id, value: {id: iteration.id}} : null
    }
    case MemexColumnDataType.Text: {
      for (const item of items) {
        const columnData = item.columns
        const textColumn = columnData[column.id] as EnrichedText
        if (textColumn && filterMatches(filterValues, textColumn.raw)) {
          return {dataType, memexProjectColumnId: column.id, value: textColumn.raw}
        }
      }
      return null
    }
    case MemexColumnDataType.Date: {
      const filterValue = filterValues[0]
      if (filterValue == null) return null
      const parsedDate = parseIsoDateStringToDate(filterValue)
      if (!parsedDate) return null
      return {dataType, memexProjectColumnId: column.id, value: {value: parsedDate}}
    }
    case MemexColumnDataType.Number: {
      for (const item of items) {
        const columnData = item.columns
        const columnValue = columnData[column.id] as NumericValue
        if (columnValue && filterMatches(filterValues, `${columnValue.value}`)) {
          return {dataType, memexProjectColumnId: column.id, value: columnValue}
        }
      }
      return null
    }
    case MemexColumnDataType.ParentIssue: {
      for (const item of items) {
        const columnData = item.columns
        const parentIssueColumn = columnData[column.id]

        if (parentIssueColumn && filterMatches(filterValues, parentIssueColumn.nwoReference)) {
          return {dataType, value: parentIssueColumn}
        }
      }
      return null
    }
    // `Assignees`, `Labels` and `Milestones` are set through the suggestions code path,
    // to ensure that our filter can still process these columns we set some initial defaults
    // as to prevent exclusion from the filter value retrieval.
    case MemexColumnDataType.Assignees:
    case MemexColumnDataType.Labels:
      return {dataType, value: []}
    case MemexColumnDataType.Milestone:
      return {dataType, value: undefined}
    // `Repository` is a field that we would not want users to change, as a result we skip the field
    // from the filter
    case MemexColumnDataType.Repository:
    default:
      return null
  }
}

export type FilterOptions = {
  value?: string
  replace?: boolean
  filterForPresence?: boolean
  filterForEmpty?: boolean
  filterForNegative?: boolean
}

const DURATION_REGEX = /^(@)*\w+(-\d+(d|w|m))?$/
const EMPTY_FILTER_REGEX = /\S+:["']*$/

/**
 * This function appends a filter (with its value if provided) at the end of the query string.
 * @param searchQuery The current query value
 * @param filter The text to append as the filter e.g. `label` or `assignee`
 * @param value The value of the filter e.g. if the filter is `label` and value is `bug` then the query string will be set to `label:bug`
 * @param replace Whether to replace the filter or not. For example:
 * if the query string is `lab` & replace is true & filter is `label` & value is `bug`
 * then the query string will be set to `label: bug` (instead of `lab label:bug`).
 * @param filterForEmpty Whether to replace the entire filter to search for empty column values e.g. `no:label`
 * @param filterForNegative Whether to replace the entire filter to search for negative column values e.g. `-label:bug`
 * @returns The updated query string
 */
export function replaceQuery(
  searchQuery: string,
  filter: string,
  {value, replace, filterForPresence = false, filterForEmpty = false, filterForNegative = false}: FilterOptions = {},
) {
  const filterName = normalizeToFilterName(filter)
  let trimmedQuery = searchQuery.trim()
  // Ignore trailing quotes when replacing values
  if (replace && (trimmedQuery.endsWith('"') || trimmedQuery.endsWith("'"))) {
    trimmedQuery = trimmedQuery.slice(0, -1)
  }

  const hasEmptyFilter = trimmedQuery.match(EMPTY_FILTER_REGEX)

  let newFilter = `${filterName}:`

  // TODO: This function could use the tokens here to mostly replace the implementation of this function
  // but for now we are just using it to look for comparisons/ranges and include them in replacement
  const tokens = tokenizeFilter(trimmedQuery)

  // Look for an optional range (..) or comparison (<,>,>=,<=) token after the separator (:)
  // and add it into the new filter if it is present
  const comparisonOrRangeToken = findLastToken(tokens, {
    kind: ['keyword.operator.range', 'keyword.operator.comparison'],
    // NOTE: We are assuming arbitrarily that we should start searching from the end of the query
    // which would not work if we actually needed to replace in the middle of the query.
    start: trimmedQuery.length - 1,
    end: ['keyword.operator.separator', 'source.whitespace'],
  })

  const separatorToken = findLastToken(tokens, {
    kind: 'keyword.operator.separator',
    start: trimmedQuery.length - 1,
  })

  if (comparisonOrRangeToken) {
    const valueText = trimmedQuery.substring(
      separatorToken ? separatorToken.location.start + 1 : 0,
      comparisonOrRangeToken.location.start,
    )
    newFilter += valueText + comparisonOrRangeToken.text
  }

  const shouldSetCommaSeparated = (): boolean => {
    const lastCommaIndex = trimmedQuery.lastIndexOf(',')
    if (lastCommaIndex === -1) return false
    if (lastCommaIndex === trimmedQuery.length - 1) return true
    const lastWord = trimmedQuery.substring(lastCommaIndex + 1)

    return value?.includes(lastWord) || false
  }

  const setSpacedQueryValue = (queryValue: string) => {
    const idx = searchQuery.lastIndexOf(` `)
    const lhs = searchQuery.substring(0, idx)

    return lhs.length ? `${lhs} ${queryValue}` : `${lhs}${queryValue}`
  }

  const setCommaDelimitedQueryValue = (queryValue: string) => {
    const idx = searchQuery.lastIndexOf(',')
    const lhs = searchQuery.substring(0, idx + 1)
    return `${lhs}${queryValue}`
  }

  if (filterForPresence) {
    if (shouldSetCommaSeparated()) return setCommaDelimitedQueryValue(filterName)
    return setSpacedQueryValue(`${filterForNegative ? '-' : ''}has:${filterName}`)
  }

  if (filterForEmpty) {
    if (shouldSetCommaSeparated()) return setCommaDelimitedQueryValue(filterName)
    return setSpacedQueryValue(`${filterForNegative ? '-' : ''}no:${filterName}`)
  }

  if (filterForNegative) {
    let valueString = ''
    if (value) valueString = value.toString().match(DURATION_REGEX) ? value : `"${value}"`

    if (shouldSetCommaSeparated()) {
      return setCommaDelimitedQueryValue(valueString)
    }
    return setSpacedQueryValue(`-${newFilter}${valueString}`)
  }

  if (value) {
    const valueString = value.match(DURATION_REGEX) ? value : `"${value}"`

    if (shouldSetCommaSeparated()) return setCommaDelimitedQueryValue(valueString)
    newFilter = `${newFilter}${valueString}`
  }

  if (hasEmptyFilter) return searchQuery.replace(EMPTY_FILTER_REGEX, newFilter)

  if (replace) {
    if (value) {
      const idx = searchQuery.lastIndexOf(`${filterName}:`)
      const lhs = searchQuery.substring(0, idx)
      return `${lhs}${newFilter}`
    }
    return setSpacedQueryValue(newFilter)
  }

  return trimmedQuery.length ? `${trimmedQuery} ${newFilter}` : newFilter
}

export function parseTrimmedAndLowerCasedFilter(filterValue: string) {
  const normalisedQuery = filterValue.toLocaleLowerCase()
  const parsedQuery = parseFullTextQuery(normalisedQuery)

  return {normalisedQuery, ...parsedQuery}
}

function asStateReason(value: string) {
  const stripped = value.replace(/[-_ ]/g, '').toLocaleLowerCase()

  if (stripped === 'notplanned') return IssueStateReason.NotPlanned
  if (stripped === 'completed') return IssueStateReason.Completed
  if (stripped === 'reopened') return IssueStateReason.Reopened
  return null
}

/**
 * This function removes a filter value from the query string.
 * If it is the only filter value for the filter key, it removes
 * the filter key as well.
 * @param filterKeyNormalized The normalized filter key for the value to be removed
 * @param filterValueNormalized The normalized filter value to be removed
 * @param searchQuery The current query value
 * @returns The updated query string
 */
export const removeFilterFromQuery = (
  filterKeyNormalized: string,
  filterValueNormalized: string,
  searchQuery: string,
): string => {
  // escape special characters in filter key and value
  const filterKeyEscaped = escapeRegExp(filterKeyNormalized)
  const filterValueEscaped = escapeRegExp(filterValueNormalized)
  // Regex explanation:
  //   \s* Replace leading spaces, if any.
  //   (.*,)? Match and capture any characters before our value that
  //      end with a comma. If any are found, we must be in a list of
  //      filters. In that case, we don't want to remove both filterKey
  //      and fIlterValue -- just filterValue (including comma delimiter). Note
  //      that there is an extra \ for proper string escaping.
  //   ("?${filterValue}"?) Match and capture our value, whether or not
  //      it's surround by quotes.
  //   (,\\S)?  Check to see if there is a value following ours as
  //      indicated by a comma followed by a non-whitespace value. If so,
  //      we'll need to preserve proper delimiters. Note that the extra
  //      \ is for proper string escaping.
  //   'i' Match regardless of case.
  //   'g' Match all.
  const pattern = new RegExp(`\\s*${filterKeyEscaped}:(.*,)?("?${filterValueEscaped}"?)(,\\S)?`, 'ig')

  const match = pattern.exec(searchQuery)
  if (!match) return searchQuery

  const fullMatch = match[0]
  const preceding = match[1]
  const value = match[2] ?? '' // Escaping this one in particular since it gets interpolated into the result
  const following = match[3]

  // Preserve proper comma delimiters if preceeding or following values
  // are found in a comma-separated list.
  const replacePattern = preceding ? `,${value}` : following ? `${value},` : fullMatch

  // Trim the string of any extraneous whitespace or commas (the latter
  // is for the edge case where someone has separated their filter expressions
  // by comma instead of space).
  const newQuery = trimCharacters(searchQuery.replace(replacePattern, ''), ',')

  return newQuery
}

// This function converts OrderedTokenizedFilters into a query
export function filtersToQuery(orderedTokenizedFilters: OrderedTokenizedFilters): string {
  let query = ''

  for (const filter of orderedTokenizedFilters) {
    switch (filter.type) {
      case 'search':
        query += filter.value
        break
      case 'is':
        query += `${filter.exclude ? '-' : ''}is:${filter.value}`
        break
      case 'reason':
        query += `${filter.exclude ? '-' : ''}reason:${filter.value}`
        break
      case 'field':
        query += `${filter.exclude ? '-' : ''}${filter.field}:${filter.value}`
        break
      case 'no-field':
        query += `${filter.exclude ? '-' : ''}no:${filter.field}`
        break
    }
    query += filter.spaceAfter
  }

  return query
}

export function insertFilterIntoQuery(
  query: string,
  filterKey: string,
  filterValue: string,
  options?: {columnOptions?: Array<string>},
): string {
  const {orderedTokenizedFilters} = parseFullTextQuery(query)
  const isExcluded = isNegatedFilter(filterKey)
  const absoluteFilterKey = (isExcluded ? filterKey.slice(1) : filterKey).toLowerCase()
  const inclusiveFilterValues = new Set<string>()
  const exclusiveFilterValues = new Set<string>()
  const columnOptionMap = new Map<string, string>(options?.columnOptions?.map(option => [option.toLowerCase(), option]))

  const {firstInclusiveFilterIndex, firstExclusiveFilterIndex, filters} = forEachMatchingFieldFilter(
    orderedTokenizedFilters,
    absoluteFilterKey,
    (exclude, filter) => {
      if (exclude) {
        addFilterValuesToSet(exclusiveFilterValues, filter, {columnOptionMap})
      } else {
        addFilterValuesToSet(inclusiveFilterValues, filter, {columnOptionMap})
      }
    },
  )

  // add the new filter value
  if (isExcluded) {
    exclusiveFilterValues.add(wrapFilterValueInQuotes(filterValue))
  } else {
    inclusiveFilterValues.add(wrapFilterValueInQuotes(filterValue))
  }

  // skip deletion of exclusive filter being added is the only one inclusive/exclusive filter
  // when you add single exclusive filter to a single inclusive filter, it will be replaced
  // eg: insertFilterIntoQuery(`status:Backlog`, '-status', 'Backlog`) => `-status:Backlog`
  const fistInclusiveFilterValue = [...inclusiveFilterValues][0]
  const firstExclusiveFilterValue = [...exclusiveFilterValues][0]
  if (
    isExcluded &&
    inclusiveFilterValues.size === 1 &&
    exclusiveFilterValues.size === 1 &&
    fistInclusiveFilterValue === firstExclusiveFilterValue
  ) {
    inclusiveFilterValues.delete(not_typesafe_nonNullAssertion(fistInclusiveFilterValue))
  } else {
    // removes exclusive filters that have matching inclusive filters
    for (const value of inclusiveFilterValues) {
      if (exclusiveFilterValues.has(value)) {
        inclusiveFilterValues.delete(value)
        exclusiveFilterValues.delete(value)
      }
    }
  }
  // the exclusive filter index needs to be offset when the inclusive filter is removed
  let exclusiveFilterIndexOffset = 0

  // if sets have values, add them to the filters
  if (inclusiveFilterValues.size > 0) {
    const inclusiveFilterValue = Array.from(inclusiveFilterValues).join(',')

    const updateIndex = firstInclusiveFilterIndex === -1 ? filters.length : firstInclusiveFilterIndex
    filters[updateIndex] = {
      type: 'field',
      field: absoluteFilterKey,
      value: inclusiveFilterValue,
      exclude: false,
      spaceAfter: filters[updateIndex]?.spaceAfter || ' ',
    }
  } else if (firstInclusiveFilterIndex > -1) {
    // if the set is empty, remove the filter
    filters.splice(firstInclusiveFilterIndex, 1)
    // decrement firstExclusiveFilterIndex if it was after firstInclusiveFilterIndex
    if (firstInclusiveFilterIndex < firstExclusiveFilterIndex) {
      exclusiveFilterIndexOffset--
    }
  }

  if (exclusiveFilterValues.size > 0) {
    const exclusiveFilterValue = Array.from(exclusiveFilterValues).join(',')
    const updateIndex =
      firstExclusiveFilterIndex === -1 ? filters.length : firstExclusiveFilterIndex + exclusiveFilterIndexOffset

    filters[updateIndex] = {
      type: 'field',
      field: absoluteFilterKey,
      value: exclusiveFilterValue,
      spaceAfter: filters[updateIndex]?.spaceAfter || ' ',
      exclude: true,
    }
  } else if (firstExclusiveFilterIndex > -1) {
    // if the set is empty, remove the filter
    filters.splice(firstExclusiveFilterIndex + exclusiveFilterIndexOffset, 1)
  }

  // cleanup trailing spaces
  if (filters[filters.length - 1]) {
    not_typesafe_nonNullAssertion(filters[filters.length - 1]).spaceAfter = ''
  }

  return filtersToQuery(filters)
}

// This function splits a orderedTokenizedFilter.value into an array of values
function extractFilterValues(orderedTokenizedFilter?: OrderedTokenizedFilter): Array<string> {
  if (
    orderedTokenizedFilter?.type === 'no-field' ||
    orderedTokenizedFilter?.type === 'has' ||
    !orderedTokenizedFilter?.value
  ) {
    return []
  }

  return orderedTokenizedFilter.value.split(',').map(value => value.trim())
}

// This function adds filter values to a set
function addFilterValuesToSet(
  set: Set<string>,
  orderedTokenizedFilter?: OrderedTokenizedFilter,
  options: {columnOptionMap?: Map<string, string>} = {},
): Set<string> {
  for (const value of extractFilterValues(orderedTokenizedFilter)) {
    set.add(options.columnOptionMap?.get(value.toLowerCase()) || value)
  }

  return set
}

// wraps a filter value in quotes if it contains a space
function wrapFilterValueInQuotes(value: string): string {
  // check if the value includes a space
  if (!value.includes(' ')) {
    return value
  }

  // check if the value is already wrapped in double-quotes
  if (value.startsWith(`"`) || value.endsWith(`"`)) {
    return value
  }

  // check if the value is already wrapped in single-quotes
  if (value.startsWith(`'`) || value.endsWith(`'`)) {
    return value
  }

  return `"${value}"`
}

// iterates over all filters and executes a callback for each matching filter
// also returns the first inclusive and exclusive filter index
// filters[] only includes the first existing inclusive and exclusive filters
function forEachMatchingFieldFilter(
  orderedTokenizedFilters: OrderedTokenizedFilters,
  filterKey: string,
  callback: (exclude: boolean, filter: OrderedTokenizedFilterField) => void,
) {
  let firstInclusiveFilterIndex = -1
  let firstExclusiveFilterIndex = -1
  const filters = new Array<OrderedTokenizedFilter>()

  for (let i = 0; i < orderedTokenizedFilters.length; i++) {
    const filter = not_typesafe_nonNullAssertion(orderedTokenizedFilters[i])
    // continue if empty search filter
    if (filter.type === 'search' && filter.value === '') {
      continue
    }
    // continue if not a field filter or if not the same field (lowercased)
    if (filter.type !== 'field' || filter?.field.toLocaleLowerCase() !== filterKey.toLocaleLowerCase()) {
      filters.push({...filter, spaceAfter: ' '})
      continue
    }

    if (filter.exclude) {
      callback(true, filter)

      if (firstExclusiveFilterIndex === -1) {
        firstExclusiveFilterIndex = i
        filters.push(filter)
      }
    } else {
      callback(false, filter)

      if (firstInclusiveFilterIndex === -1) {
        firstInclusiveFilterIndex = i
        filters.push(filter)
      }
    }
  }

  return {
    firstInclusiveFilterIndex,
    firstExclusiveFilterIndex,
    filters,
  }
}

export function getColumnOptions(column?: ColumnModel): Array<string> | undefined {
  switch (column?.dataType) {
    case MemexColumnDataType.SingleSelect:
      return column.settings.options.map(option => wrapFilterValueInQuotes(option.name))
    case MemexColumnDataType.Iteration:
      return column.settings.configuration.iterations.map(iteration => wrapFilterValueInQuotes(iteration.title))
    default:
      return undefined
  }
}
