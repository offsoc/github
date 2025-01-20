import {PortalTooltip} from '@github-ui/portal-tooltip/portalled'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {Fragment, memo, useCallback, useMemo, useRef} from 'react'
import invariant from 'tiny-invariant'

import {type MemexColumn, MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {assertNever} from '../../helpers/assert-never'
import {getCustomIterationToken} from '../../helpers/iterations'
import {META_QUALIFIERS} from '../../helpers/meta-qualifiers'
import {parseDate} from '../../helpers/parsing'
import {isContainedWithin} from '../../helpers/util'
import {isAutoAddWorkflow} from '../../helpers/workflow-utilities'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useFindFilterableFieldByName} from '../../hooks/use-find-filterable-field-by-name'
import {useOnPointerMove} from '../../hooks/use-on-pointer-move'
import type {RepoSuggestions} from '../../hooks/use-search-filter-suggestions'
import type {ColumnModel} from '../../models/column-model'
import {useWorkflows} from '../../state-providers/workflows/use-workflows'
import {FilterQueryResources} from '../../strings'
import type {IssueType, Label, Milestone} from '../automation/fragments/search-input'
import {type SuggestionOptionsProps, useFilterSuggestionsItemsContext} from './filter-suggestions'
import {ShowColumnSuggestionModeEnum} from './helpers/filter-suggestions'
import {LAST_UPDATED_REGEX_DAYS, UPDATED_REGEX} from './helpers/search-constants'
import {
  filterMatches,
  getIterationFromExpression,
  type OrderedTokenizedFilters,
  parseComparison,
  parseFullTextQuery,
  splitFieldFilters,
} from './helpers/search-filter'

const getErrorStyles = (
  opts: {invalid: true; variant?: 'danger' | 'attention'} | {invalid: false},
): BetterSystemStyleObject => {
  if (!opts.invalid) return {}
  return {
    ['&::before']: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '0.25em',
      content: '""',
      background: (theme: FixMeTheme) => {
        return `linear-gradient(135deg, transparent, transparent 45%, ${
          theme.colors[opts.variant ?? 'danger'].emphasis
        }, transparent 55%, transparent 100%),linear-gradient(45deg, transparent, transparent 45%, ${
          theme.colors[opts.variant ?? 'danger'].emphasis
        }, transparent 55%, transparent 100%)`
      },
      backgroundRepeat: 'repeat-x,repeat-x',
      backgroundSize: '0.5em 0.5em',
    },
  }
}

const Spaces = ({length}: {length: number}) => {
  if (length === 0) return null
  return (
    <>
      {Array.from({length}).map((_, spaceIndex) => {
        return <Fragment key={spaceIndex}>&nbsp;</Fragment>
      })}
    </>
  )
}

type TokenizedQueryProps = {
  /**
   * The value of the filter input representing the query that should be tokenized
   */
  query: string
} & Partial<SuggestionOptionsProps>

const tokenizedQuerySx = {
  position: 'absolute',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  wordBreak: 'break-word',
  fontSize: 1,
  flex: 1,
  width: '100%',
  padding: '0px',
  top: '50%',
  transform: 'translateY(-50%)',
}
export const TokenizedQuery = memo(function TokenizedQuery({
  query,
  suggestColumns = true,
  showColumnSuggestionIf,
}: TokenizedQueryProps) {
  const containerRef = useRef(null)

  const {orderedTokenizedFilters, invalidQuery} = useMemo(() => parseFullTextQuery(query), [query])

  const hovering = useOnPointerMove(
    useCallback(point => {
      if (!containerRef.current) return false
      return isContainedWithin(containerRef.current, point)
    }, []),
  )

  const leadingSpace = query.split(' ').findIndex(char => char !== ' ')

  return (
    <>
      <Box
        sx={tokenizedQuerySx}
        ref={containerRef}
        {...testIdProps(`tokenized-query`)}
        aria-errormessage={invalidQuery ? 'tokenized-query-invalid-query-errormessage' : undefined}
      >
        <Spaces length={leadingSpace} />
        {orderedTokenizedFilters.map((token, index) => {
          return (
            <Fragment key={index}>
              <Token
                {...token}
                id={`tokenized-query-token-${index}`}
                invalid={invalidQuery}
                suggestColumns={suggestColumns}
                showColumnSuggestionIf={showColumnSuggestionIf}
              />
              <Spaces length={token.spaceAfter.length} />
            </Fragment>
          )
        })}
      </Box>
      {invalidQuery ? (
        <PortalTooltip
          contentRef={containerRef}
          direction="se"
          open={hovering}
          aria-label={invalidQuery ? FilterQueryResources.invalidFilterQuotes : undefined}
          id="tokenized-query-invalid-query-errormessage"
          aria-live="polite"
          anchorSide="inside-bottom"
          anchorOffset={-2}
        />
      ) : null}
    </>
  )
})

function makeValueErrorFromMessage(message: string) {
  return {
    message,
  }
}

function unwrapToken(tokenValue: string) {
  let unwrappedTokenValue = tokenValue
  const tokenValueWrappedInQuotes = tokenValue.match(/(["])(.*?[^\\])\1/)

  if (tokenValueWrappedInQuotes) {
    const value = tokenValueWrappedInQuotes[2]
    invariant(value, 'Value must be returned from match')
    unwrappedTokenValue = value
  }

  return unwrappedTokenValue
}

// These includes all possible modifier combinations e.g. >, >=, ..*, etc.
const NUMBER_VALIDATION = /^(?:[+\-><]?[=]?|(\*\.\.))\d+(\.\d+)?(?:\.\.\*|\.\.)?(?:\d+(\.\d+)?)?$/

function getColumnValueErrors(
  column: ColumnModel | undefined,
  tokenValue: string,
  showValueError = false,
  repoSuggestions?: RepoSuggestions,
): {message: string} | undefined {
  if (!column) return
  const unwrappedTokenValues = splitFieldFilters(tokenValue)

  switch (column.dataType) {
    case MemexColumnDataType.SingleSelect: {
      const {options} = column.settings

      const invalidTokens = new Set<string>()
      for (const unwrappedTokenValue of unwrappedTokenValues) {
        if (!options.some(option => filterMatches([unwrappedTokenValue], option.name))) {
          invalidTokens.add(unwrappedTokenValue)
        }
      }

      if (invalidTokens.size > 0) {
        return makeValueErrorFromMessage(FilterQueryResources.noOptionsMatch([...invalidTokens].join(','), column.name))
      }

      return
    }

    case MemexColumnDataType.Number: {
      const invalidTokens = new Set<string>()
      for (const unwrappedTokenValue of unwrappedTokenValues) {
        if (!NUMBER_VALIDATION.test(unwrappedTokenValue)) {
          invalidTokens.add(unwrappedTokenValue)
        }
      }

      if (invalidTokens.size > 0) {
        return makeValueErrorFromMessage(FilterQueryResources.invalidNumberValue([...invalidTokens].join(',')))
      }

      return
    }

    case MemexColumnDataType.Date: {
      const invalidTokens = new Set<string>()
      for (const unwrappedTokenValue of unwrappedTokenValues) {
        const comparison = parseComparison(unwrappedTokenValue)
        if (comparison) {
          switch (comparison.operator) {
            case 'GREATER_THAN':
            case 'GREATER_THAN_OR_EQUAL':
            case 'LESS_THAN':
            case 'LESS_THAN_OR_EQUAL': {
              if (parseDate(comparison.value) === null) {
                invalidTokens.add(comparison.value)
              }
              break
            }
            case 'RANGE': {
              const isStartValid = comparison.start ? parseDate(comparison.start) !== null : true
              const isEndValid = comparison.end ? parseDate(comparison.end) !== null : true
              if (!isStartValid && !isEndValid) {
                invalidTokens.add(unwrappedTokenValue)
              } else if (!isStartValid) {
                invalidTokens.add(comparison.start)
              } else if (!isEndValid) {
                invalidTokens.add(comparison.end)
              }
              break
            }
            case 'LESS_THAN_RANGE': {
              if (comparison.end && parseDate(comparison.end) === null) {
                invalidTokens.add(comparison.end)
              }
              break
            }
            case 'GREATER_THAN_RANGE': {
              if (comparison.start && parseDate(comparison.start) === null) {
                invalidTokens.add(comparison.start)
              }
              break
            }
            default: {
              assertNever(comparison)
            }
          }
        } else if (parseDate(unwrappedTokenValue) === null) {
          invalidTokens.add(unwrappedTokenValue)
        }
      }
      if (invalidTokens.size > 0) {
        return makeValueErrorFromMessage(FilterQueryResources.invalidDateValue([...invalidTokens].join(',')))
      }
      return
    }

    case MemexColumnDataType.Iteration: {
      const invalidTokens = new Set<string>()
      for (const unwrappedTokenValue of unwrappedTokenValues) {
        if (getCustomIterationToken(unwrappedTokenValue)) {
          continue
        }

        const comparison = parseComparison(unwrappedTokenValue)
        if (comparison) {
          switch (comparison.operator) {
            case 'GREATER_THAN':
            case 'GREATER_THAN_OR_EQUAL':
            case 'LESS_THAN':
            case 'LESS_THAN_OR_EQUAL': {
              if (getIterationFromExpression(comparison.value, column) === null) {
                invalidTokens.add(comparison.value)
              }
              break
            }
            case 'RANGE': {
              const isStartValid = comparison.start
                ? getIterationFromExpression(comparison.start, column) !== null
                : true
              const isEndValid = comparison.end ? getIterationFromExpression(comparison.end, column) !== null : true
              if (!isStartValid && !isEndValid) {
                invalidTokens.add(unwrappedTokenValue)
              } else if (!isStartValid) {
                invalidTokens.add(comparison.start)
              } else if (!isEndValid) {
                invalidTokens.add(comparison.end)
              }
              break
            }
            case 'LESS_THAN_RANGE': {
              if (comparison.end && getIterationFromExpression(comparison.end, column) === null) {
                invalidTokens.add(comparison.end)
              }
              break
            }
            case 'GREATER_THAN_RANGE': {
              if (comparison.start && getIterationFromExpression(comparison.start, column) === null) {
                invalidTokens.add(comparison.start)
              }
              break
            }
            default: {
              assertNever(comparison)
            }
          }
        } else if (getIterationFromExpression(unwrappedTokenValue, column) === null) {
          invalidTokens.add(unwrappedTokenValue)
        }
      }

      if (invalidTokens.size > 0) {
        return makeValueErrorFromMessage(
          FilterQueryResources.noIterationMatch([...invalidTokens].join(','), column.name),
        )
      }

      return
    }

    case MemexColumnDataType.Labels: {
      if (!showValueError) return

      const labelValues = repoSuggestions?.labels ? getRepoLabelValues(repoSuggestions.labels) : undefined

      const invalidTokens = new Set<string>()
      for (const unwrappedTokenValue of unwrappedTokenValues) {
        if (!labelValues?.has(unwrappedTokenValue)) {
          invalidTokens.add(unwrappedTokenValue)
        }
      }

      if (invalidTokens.size > 0) {
        return makeValueErrorFromMessage(FilterQueryResources.noOptionsMatch([...invalidTokens].join(','), column.name))
      }

      return
    }

    case MemexColumnDataType.Milestone: {
      if (!showValueError) return

      const milestoneValues = repoSuggestions?.milestones
        ? getRepoMilestoneValues(repoSuggestions.milestones)
        : undefined

      const invalidTokens = new Set<string>()
      for (const unwrappedTokenValue of unwrappedTokenValues) {
        if (!milestoneValues?.has(unwrappedTokenValue)) {
          invalidTokens.add(unwrappedTokenValue)
        }
      }

      if (invalidTokens.size > 0) {
        return makeValueErrorFromMessage(FilterQueryResources.noOptionsMatch([...invalidTokens].join(','), column.name))
      }

      return
    }

    /**
     * Not yet validated
     */
    case MemexColumnDataType.Text:
    case MemexColumnDataType.Title:
    case MemexColumnDataType.Repository:
    case MemexColumnDataType.Reviewers:
    case MemexColumnDataType.LinkedPullRequests:
    case MemexColumnDataType.Assignees:
    case MemexColumnDataType.Tracks:
    case MemexColumnDataType.IssueType:
    case MemexColumnDataType.ParentIssue:
    case MemexColumnDataType.SubIssuesProgress:
    case MemexColumnDataType.TrackedBy: {
      return
    }
    default: {
      assertNever(column)
    }
  }
}

function getIssueTypeErrors(tokenValue: string, repoSuggestions?: RepoSuggestions): {message: string} | undefined {
  const unwrappedTokenValues = splitFieldFilters(tokenValue)

  const issueTypesValues = repoSuggestions?.issueTypes ? getRepoIssueTypeValues(repoSuggestions.issueTypes) : undefined

  const invalidTokens = new Set<string>()
  for (const unwrappedTokenValue of unwrappedTokenValues) {
    if (!issueTypesValues?.has(unwrappedTokenValue)) {
      invalidTokens.add(unwrappedTokenValue)
    }
  }

  if (invalidTokens.size > 0) {
    return makeValueErrorFromMessage(FilterQueryResources.noOptionsMatch([...invalidTokens].join(','), 'type'))
  }

  return
}

function getMetaQualifierErrors(
  actualValues: string,
  expectedValues: ObjectValues<typeof META_QUALIFIERS>,
): {message: string} | undefined {
  const qualifiers = splitFieldFilters(actualValues)
  const QUALIFIERS = new Set<string>(Object.values(expectedValues))

  const invalidTokens = new Set(
    qualifiers.filter(qualifier => {
      return !QUALIFIERS.has(unwrapToken(qualifier).toLowerCase())
    }),
  )

  if (invalidTokens.size === 0) return

  return {
    message: FilterQueryResources.invalidQualifier([...invalidTokens], expectedValues),
  }
}

type TokenProps = OrderedTokenizedFilters[number] & {invalid: boolean; id: string} & Partial<SuggestionOptionsProps>

const Token = memo(function Token({invalid, id, suggestColumns, showColumnSuggestionIf, ...token}: TokenProps) {
  const {findFilterableFieldByName} = useFindFilterableFieldByName()
  const {repoSuggestions} = useFilterSuggestionsItemsContext()
  const {issue_types} = useEnabledFeatures()
  const {activeWorkflow} = useWorkflows()

  const issueTypeFieldEnabled = issue_types && activeWorkflow && isAutoAddWorkflow(activeWorkflow)

  const hasColumnRestrictions = showColumnSuggestionIf !== undefined

  switch (token.type) {
    case 'search': {
      return <SingleFilterToken id={id} value={token.value} invalid={invalid} />
    }

    case 'field': {
      let valueErrors = undefined
      let isValidColumn = true

      if (issueTypeFieldEnabled && token.field === 'type') {
        valueErrors = getIssueTypeErrors(token.value, repoSuggestions)
      } else {
        let column = findFilterableFieldByName(token.field)

        const showColumnSuggestionMode =
          hasColumnRestrictions && column ? showColumnSuggestionIf(column.name) : undefined

        column = hasColumnRestrictions
          ? showColumnSuggestionMode === ShowColumnSuggestionModeEnum.ColumnOnly ||
            showColumnSuggestionMode === ShowColumnSuggestionModeEnum.ColumnAndValues
            ? column
            : undefined
          : column

        isValidColumn = !!suggestColumns && !!column

        const showValueErrors =
          hasColumnRestrictions && showColumnSuggestionMode === ShowColumnSuggestionModeEnum.ColumnAndValues

        valueErrors = getColumnValueErrors(column, token.value, showValueErrors, repoSuggestions)
      }
      return (
        <PairFilterToken
          id={id}
          leftSide={token.field}
          rightSide={token.value}
          invalid={invalid || !isValidColumn}
          valueErrors={valueErrors}
          keyErrors={isValidColumn ? undefined : {message: FilterQueryResources.unknownFieldFilter(token.field)}}
          exclude={token.exclude}
        />
      )
    }

    case 'is':
    case 'reason': {
      const valueErrors = getMetaQualifierErrors(token.value, META_QUALIFIERS[token.type])

      return (
        <PairFilterToken
          id={id}
          leftSide={token.type}
          invalid={invalid}
          exclude={token.exclude}
          rightSide={token.value}
          valueErrors={valueErrors}
        />
      )
    }

    case 'last-updated': {
      const isDisabled =
        (hasColumnRestrictions && showColumnSuggestionIf('last-updated') === ShowColumnSuggestionModeEnum.None) ?? false

      const match = token.value.match(LAST_UPDATED_REGEX_DAYS)
      const valueErrors = match ? undefined : {message: FilterQueryResources.lastUpdatedValueErrorMessage}
      return (
        <PairFilterToken
          id={id}
          leftSide={token.type}
          invalid={invalid || isDisabled}
          exclude={token.exclude}
          rightSide={token.value}
          valueErrors={!isDisabled ? valueErrors : undefined}
          keyErrors={invalid || isDisabled ? {message: FilterQueryResources.unknownFieldFilter(token.type)} : undefined}
        />
      )
    }

    case 'updated': {
      const isDisabled =
        (hasColumnRestrictions && showColumnSuggestionIf('updated') === ShowColumnSuggestionModeEnum.None) ?? false

      const match = token.value.match(UPDATED_REGEX)
      const valueErrors = match ? undefined : {message: FilterQueryResources.updatedValueErrorMessage}
      return (
        <PairFilterToken
          id={id}
          leftSide={token.type}
          invalid={invalid || isDisabled}
          exclude={token.exclude}
          rightSide={token.value}
          valueErrors={!isDisabled ? valueErrors : undefined}
          keyErrors={invalid || isDisabled ? {message: FilterQueryResources.unknownFieldFilter(token.type)} : undefined}
        />
      )
    }

    case 'no-field':
    case 'has': {
      const fieldErrors = getNoFieldErrors(token.field, findFilterableFieldByName, issueTypeFieldEnabled)
      const leftSide = token.type === 'no-field' ? 'no' : 'has'
      return (
        <PairFilterToken
          id={id}
          leftSide={leftSide}
          rightSide={token.field}
          exclude={token.exclude}
          invalid={invalid}
          valueErrors={fieldErrors ? {message: FilterQueryResources.unknownFieldFilter(token.field)} : undefined}
        />
      )
    }

    default: {
      assertNever(token)
    }
  }
})

function getNoFieldErrors(
  tokenValue: string,
  getFilterableFieldFromToken: (fieldName: string) => MemexColumn | undefined,
  issueTypeFieldEnabled: boolean = false,
) {
  const unwrappedFields = splitFieldFilters(tokenValue)
  const invalidTokens = new Set<string>()

  for (const unwrappedField of unwrappedFields) {
    const column = getFilterableFieldFromToken(unwrappedField)
    if (!column) {
      if (issueTypeFieldEnabled && unwrappedField === 'type') continue
      invalidTokens.add(unwrappedField)
    }
  }

  if (invalidTokens.size === 0) return

  return {message: FilterQueryResources.unknownFieldFilter([...invalidTokens].join(','))}
}

const PairFilterToken = memo(function PairFilterToken({
  id,
  leftSide,
  rightSide,
  invalid,
  exclude = false,
  valueErrors,
  keyErrors,
}: {
  id: string
  leftSide: string
  rightSide: string
  invalid: boolean
  exclude?: boolean
  valueErrors?: {message: string}
  keyErrors?: {message: string}
}) {
  const keyContainerRef = useRef<HTMLDivElement>(null)
  const valueContainerRef = useRef<HTMLDivElement>(null)

  const isHoveringKey = useOnPointerMove(
    useCallback(point => {
      return !!keyContainerRef.current && isContainedWithin(keyContainerRef.current, point)
    }, []),
  )
  const isHoveringValue = useOnPointerMove(
    useCallback(point => {
      return !!valueContainerRef.current && isContainedWithin(valueContainerRef.current, point)
    }, []),
  )

  return (
    <Box
      id={id}
      ref={keyContainerRef}
      sx={{
        position: 'relative',
        display: 'inline-block',
        ...getErrorStyles({
          invalid: Boolean(invalid || keyErrors),
        }),
      }}
    >
      <Text
        sx={{
          display: 'inline-block',
          whiteSpace: 'pre',
          color: 'fg.muted',
        }}
        role="textbox"
        aria-errormessage={keyErrors ? `${id}-key-errormessage` : undefined}
      >
        {`${exclude ? '-' : ''}${leftSide}:`}
        {keyErrors ? (
          <PortalTooltip
            direction="se"
            open={isHoveringKey}
            aria-label={keyErrors.message}
            contentRef={keyContainerRef}
            id={`${id}-key-errormessage`}
            aria-live="polite"
            anchorSide="inside-bottom"
            anchorOffset={-2}
          />
        ) : null}
      </Text>
      <Text
        ref={valueContainerRef}
        sx={{
          position: 'relative',
          display: 'inline-block',
          color: 'accent.fg',
          whiteSpace: 'pre',
          ...getErrorStyles({
            invalid: Boolean(valueErrors),
            variant: 'attention',
          }),
        }}
        role="textbox"
        aria-errormessage={valueErrors ? `${id}-value-errormessage` : undefined}
      >
        {rightSide}
        {valueErrors ? (
          <PortalTooltip
            contentRef={valueContainerRef}
            direction="se"
            open={isHoveringValue}
            aria-label={valueErrors.message}
            id={`${id}-value-errormessage`}
            aria-live="polite"
            anchorSide="inside-bottom"
            anchorOffset={-2}
          />
        ) : null}
      </Text>
    </Box>
  )
})

const SingleFilterToken = memo(function SingleFilterToken({
  value,
  invalid,
  id,
}: {
  value: string
  invalid: boolean
  id: string
}) {
  return (
    <Text
      id={id}
      sx={{
        color: 'fg.default',
        position: 'relative',
        display: 'inline-block',
        whiteSpace: 'pre',
        ...getErrorStyles({
          invalid,
          variant: 'danger',
        }),
      }}
    >
      {value}
    </Text>
  )
})

function getRepoLabelValues(repoLabels: ReadonlyArray<Label>): Set<string> {
  const uniqueColumnValues = new Set<string>()
  for (const label of repoLabels) {
    uniqueColumnValues.add(label.name)
  }

  return uniqueColumnValues
}

function getRepoMilestoneValues(repoMilestones: ReadonlyArray<Milestone>): Set<string> {
  const uniqueColumnValues = new Set<string>()
  for (const milestone of repoMilestones) {
    uniqueColumnValues.add(milestone.title)
  }

  return uniqueColumnValues
}

function getRepoIssueTypeValues(repoIssueTypes: ReadonlyArray<IssueType>): Set<string> {
  const uniqueColumnValues = new Set<string>()
  for (const issueType of repoIssueTypes) {
    if (issueType.isEnabled) uniqueColumnValues.add(issueType.name)
  }

  return uniqueColumnValues
}
