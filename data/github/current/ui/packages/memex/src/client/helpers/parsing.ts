import {addDays, isValid, parse, startOfToday} from 'date-fns'
import {sanitize} from 'dompurify'
import invariant from 'tiny-invariant'

import type {ServerDateValue} from '../api/columns/contracts/date'
import type {IterationValue} from '../api/columns/contracts/iteration'
import {SystemColumnId} from '../api/columns/contracts/memex-column'
import type {NumericValue} from '../api/columns/contracts/number'
import type {SingleSelectValue} from '../api/columns/contracts/single-select'
import type {CustomColumnValueType, DateValue, TitleValueWithContentType} from '../api/columns/contracts/storage'
import type {EnrichedText} from '../api/columns/contracts/text'
import type {Progress} from '../api/columns/contracts/tracks'
import {ItemType} from '../api/memex-items/item-type'
import {TodayToken} from '../components/filter-bar/helpers/search-constants'
import {findNextToken, getTokens, tokenizeFilter} from '../components/filter-bar/helpers/tokenize-filter'

type RequestError = {
  status: number
  message: string
}

const FORBIDDEN_ERROR_STATUS_CODE = 403

export function isRequestError(error: unknown): error is RequestError {
  if (!(typeof error === 'object')) {
    return false
  }

  if (!error) {
    return false
  }

  return hasProp(error, 'status') && hasProp(error, 'message') && typeof error.message === 'string'
}

export function isForbiddenError(e: unknown) {
  if (!isRequestError(e)) {
    return false
  }

  return e.status === FORBIDDEN_ERROR_STATUS_CODE
}

// type-safe parsing of column identifier
export function parseColumnId(colId?: string): SystemColumnId | number | undefined {
  if (!colId) {
    // we should never get an undefined value here
    return undefined
  }

  switch (colId) {
    case SystemColumnId.Assignees:
    case SystemColumnId.Labels:
    case SystemColumnId.LinkedPullRequests:
    case SystemColumnId.Milestone:
    case SystemColumnId.Repository:
    case SystemColumnId.Reviewers:
    case SystemColumnId.Tracks:
    case SystemColumnId.TrackedBy:
    case SystemColumnId.Title:
    case SystemColumnId.Status:
    case SystemColumnId.IssueType:
    case SystemColumnId.ParentIssue:
    case SystemColumnId.SubIssuesProgress:
      // for known system column names, we can return them directly
      return colId
    default: {
      // otherwise see if we can get a number from the string
      const parsed = parseInt(colId, 10)
      if (isNaN(parsed)) {
        return undefined
      }

      return parsed
    }
  }
}

/**
 * Scrubs commas from input and returns a number.
 * NOTE: This does not support I18n. A more robust solution for number
 * formatting will eventually be required.
 * @param text - Numeric-like text input
 */
export function parseNumber(text: string): number {
  return Number(text.replace(/,/g, ''))
}

/**
 * Parses a date value from a string. Handles special token values like `@today`
 * and transforms them into a date object also. If the date is malformed, then
 * this will return null to indicate that the parsing failed.
 *
 * @param date The date-like input to parse
 * @param dateFormat (optional) The date format string to use for parsing
 * @returns The parsed date object if valid, or `null` otherwise
 */
export function parseDate(date: string, dateFormat = 'yyyy-MM-dd'): Date | null {
  const dateTokens = tokenizeFilter(date)

  const dateToken = findNextToken(dateTokens, {kind: 'string', start: 0})
  if (!dateToken) return null

  // Replace @today with the start of today's date
  if (dateToken.text === TodayToken) {
    const today = startOfToday()

    // Find the offset like `+1` or `-10`, after the value, if it exists
    const offsetTokens = getTokens(dateTokens, {kinds: ['keyword.operator', 'string'], start: dateToken})
    if (!offsetTokens && dateTokens.length > 1) {
      // If there are tokens after the base date token then it means we just failed to parse
      // so we should just treat this entire date as invalid.
      return null
    }

    if (offsetTokens) {
      const [offsetOperator, offsetValue] = offsetTokens
      invariant(offsetValue != null, 'offset tokens must define offsetValue')
      invariant(offsetOperator != null, 'offset tokens must define offsetOperator')
      const offset = parseNumber(offsetValue.text) * (offsetOperator.text === '+' ? 1 : -1)
      return isNaN(offset) ? null : addDays(today, offset)
    }
    return today
  }

  const parsed = parse(dateToken.text, dateFormat, new Date())
  if (!isValid(parsed)) {
    return null
  }

  return parsed
}

function hasProp<K extends PropertyKey>(data: object, prop: K): data is Record<K, unknown> {
  return prop in data
}

export function asCustomTextValue(input: unknown): EnrichedText | null {
  if (!(typeof input === 'object')) {
    return null
  }

  if (!input) {
    return null
  }

  // assert that we have both properties of EnrichedText and that they are the expected type
  if (
    hasProp(input, 'raw') &&
    typeof input.raw === 'string' &&
    hasProp(input, 'html') &&
    typeof input.html === 'string'
  ) {
    const {raw, html} = input
    return {raw, html}
  }

  return null
}

export function asCustomNumberValue(input: unknown): NumericValue | null {
  if (!(typeof input === 'object')) {
    return null
  }

  if (!input) {
    return null
  }

  // assert that we have the property of NumericValue and that it is the correct type
  if (hasProp(input, 'value') && typeof input.value === 'number') {
    return {value: input.value}
  }

  return null
}

export function asSingleSelectValue(input: unknown): SingleSelectValue | null {
  if (!(typeof input === 'object')) {
    return null
  }

  if (!input) {
    return null
  }

  // assert that we have the property of NumericValue and that it is the correct type
  if (hasProp(input, 'id') && typeof input.id === 'string') {
    return {id: input.id}
  }

  return null
}

// adapted from https://github.com/hqoss/guards/blob/24cf9662c5bfa4aa08edcb9bf940087b5c9c6150/src/guards/primitives.ts#L11-L13
export function isNumber<U>(term: number | U): term is number {
  return typeof term === 'number'
}

function isDateValue(term: DateValue | ServerDateValue): term is DateValue {
  return typeof term.value === 'object'
}

const ISO_DATE_REGEX = /(\d{4}-[01]\d-[0-3]\d)/

export function asCustomDateValue(value: unknown) {
  if (!(typeof value === 'object')) {
    return null
  }

  if (!value) {
    return null
  }

  return parseDateValue(value as DateValue | ServerDateValue) // TODO: can we avoid the implicit cast?
}

export function asCustomDateString(value: CustomColumnValueType | ServerDateValue): string | undefined {
  const date = asCustomDateValue(value)

  if (date && date.value) {
    return formatDateString(date.value, {timeZone: 'UTC'})
  }
}

export function parseDateValue(value: DateValue | ServerDateValue): DateValue | null {
  if (isDateValue(value)) {
    return value
  }

  const date = parseIsoDateStringToDate(value.value)

  if (date) {
    return {value: date}
  }
  return null
}

export function parseIsoDateStringToDate(dateString: string): Date | null {
  // discard any time component
  dateString = dateString.slice(0, 10)

  if (dateString.match(ISO_DATE_REGEX)) {
    return new Date(`${dateString}T00:00:00Z`)
  }
  return null
}

export function parseMillisecondsToDate(millisecondsString: string): Date | null {
  const milliseconds = parseInt(millisecondsString, 10)

  if (isNaN(milliseconds)) {
    return null
  }

  return new Date(milliseconds)
}

const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
} as const

export function formatDateString(value: Date, extraFormatOptions = {}): string {
  return value.toLocaleDateString('en-us', {...DATE_FORMAT_OPTIONS, ...extraFormatOptions})
}

export function formatISODateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

/**
 * Return the raw title associated with a given column value, adapting to the
 * shape of the value found in column storage.
 *
 * This supports the legacy "rendered title" string as well as the upcoming
 * "raw + HTML" object
 *
 * @param columnValue the title column value to inspect
 *
 * @returns empty string if value is undefined, otherwise a best guess at the
 *          raw representation of the string
 */
export function parseTitleDefaultRaw(columnValue?: TitleValueWithContentType): string {
  if (!columnValue) {
    return ''
  }

  const {title} = columnValue.value

  if (typeof title === 'string') {
    return title
  }

  return title.raw
}

/**
 * Return the HTML-based title associated with a given item, adapting to the
 * shape of the value found from column storage.
 *
 * This supports the legacy "rendered title" string as well as the upcoming
 * "raw + HTML" object
 *
 * @param columnValue the title column value to inspect
 *
 * @returns empty string if no title found, otherwise a best guess at the HTML
 *          representation of the string
 */
export function parseTitleDefaultHtml(columnValue?: TitleValueWithContentType): string {
  if (!columnValue) {
    return ''
  }

  const {title} = columnValue.value

  if (typeof title === 'string') {
    return title
  }

  return title.html
}

/**
 * Return the issue or pull request number associated with a given item, if applicable.
 *
 * @param columnValue the title column value to inspect
 *
 * @returns number if the item is an issue or pull request, otherwise returns undefined
 */
export function parseTitleNumber(columnValue?: TitleValueWithContentType): number | undefined {
  return columnValue && (columnValue.contentType === ItemType.Issue || columnValue.contentType === ItemType.PullRequest)
    ? columnValue.value.number
    : undefined
}

/**
 * Return a number representing the completed fraction of the given Progress
 *
 * @param progress the progress object on which to perform calculation
 * @returns undefined if progress is undefined, or a number in the range of 0..1 representing the completed fraction
 */
export function progressAsFraction(progress?: Progress): number | undefined {
  if (!progress) {
    return
  }
  if (progress?.percent) return progress.percent / 100

  const {total, completed} = progress
  if (total === 0) {
    return undefined
  }

  return completed / total
}

/**
 * Return an integer representing the completed percent of the given Progress
 *
 * @param progress the progress object on which to perform calculation
 * @returns an integer in the range of 0..100 representing the completed percent, rounded down
 */
export function progressAsPercent(progress?: Progress): number {
  if (progress?.percent !== undefined) return progress.percent
  const fraction = progressAsFraction(progress)
  return fraction ? Math.round(fraction * 100) : 0
}

/**
 * Removes all html elements from a string containing html
 *
 * @param value - the string value to remove html from
 * @returns a purified string
 */
export function parseTextFromHtmlStr(value: string): string {
  if (!value) return value
  return sanitize(value, {ALLOWED_TAGS: []})
}

export function isTextColumnValue(value: CustomColumnValueType): value is EnrichedText {
  return typeof value === 'object' && 'raw' in value
}

export function isNumericColumnValue(value: CustomColumnValueType): value is NumericValue {
  return typeof value === 'object' && 'value' in value && typeof value.value === 'number'
}

export function isDateColumnValue(value: CustomColumnValueType): value is ServerDateValue {
  return typeof value === 'object' && 'value' in value && typeof value.value === 'string'
}

export function isSingleSelectOrIterationColumnValue(
  value: CustomColumnValueType,
): value is SingleSelectValue | IterationValue {
  return typeof value === 'object' && 'id' in value
}
