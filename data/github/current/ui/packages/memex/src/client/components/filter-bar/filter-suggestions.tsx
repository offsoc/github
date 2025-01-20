import {FilterIcon, type IconProps} from '@primer/octicons-react'
import {Text} from '@primer/react'
import {createContext, forwardRef, memo, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import invariant from 'tiny-invariant'

import {isFieldComparable} from '../../helpers/field-comparable'
import {IS_QUALIFIERS, isAmbivalentColumn, META_QUALIFIERS, STATE_REASON_QUALIFIER} from '../../helpers/meta-qualifiers'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {regexLastMatch, regexLastMatchIndex} from '../../helpers/util'
import {isAutoAddWorkflow} from '../../helpers/workflow-utilities'
import {useElementSizes} from '../../hooks/common/use-element-sizes'
import {useFilterKeywords} from '../../hooks/use-filter-keywords'
import {useFilterSuggestions} from '../../hooks/use-filter-suggestions'
import {useFindFilterableFieldByName} from '../../hooks/use-find-filterable-field-by-name'
import {
  type RepoSuggestions,
  SuggestionsPriority,
  useSearchFilterSuggestions,
} from '../../hooks/use-search-filter-suggestions'
import type {ColumnModel} from '../../models/column-model'
import type {MemexItemModel} from '../../models/memex-item-model'
import {useAllColumns} from '../../state-providers/columns/use-all-columns'
import {useFindColumnByDatabaseId} from '../../state-providers/columns/use-find-column-by-database-id'
import {useWorkflows} from '../../state-providers/workflows/use-workflows'
import {Resources} from '../../strings'
import SuggestionsList, {type SuggestionItems} from '../suggestions-list'
import {isUpdatedQualifier, ShowColumnSuggestionModeEnum} from './helpers/filter-suggestions'
import {
  hasOddNumberOfQuotes,
  isNegatedFilter,
  normalizeToDehyphenatedFilterName,
  replaceQuery,
  SPLIT_ON_VALUES_REGEX,
} from './helpers/search-filter'
import {findLastToken, tokenizeFilter} from './helpers/tokenize-filter'
import {useSearch} from './search-context'

// FilterCommand represents the different kinds of actions a user can perform via search.
// For example: filtering, sorting, grouping etc.
type FilterCommand = {
  name: string
  icon: React.FC<IconProps>
}

// Right now, only filtering is supported.
const FilterCommands: Array<FilterCommand> = [
  {
    name: 'Filter by',
    icon: FilterIcon,
  },
]

export type SuggestionOptionsProps = {
  /**
   * Define whether the suggestions should include column names
   */
  suggestColumns: boolean

  /**
   * An optional prop to define whether a column suggestion should be shown or not.
   * This is useful when you want to show suggestions for columns but not for all of them.
   *
   * TODO: This should be refactored as part of https://github.com/github/memex/discussions/13314#discussioncomment-4291443
   */
  showColumnSuggestionIf?: (suggestion: string) => ShowColumnSuggestionModeEnum | undefined
}

type FilterSuggestionsProps = {
  filterInputRef: React.RefObject<HTMLInputElement>
  query: string
  setQuery: (query: string) => void
  areFilterSuggestionsVisible: boolean
  setAreFilterSuggestionsVisible: (visible: boolean) => void
  testId: string
  anchorRef: React.RefObject<HTMLElement>
} & Partial<SuggestionOptionsProps>

type FilterSuggestionsMode =
  | 'none' // No suggestions
  | 'commands' // Suggest commands e.g. Filter by, Sort by, Group by
  | 'filterQualifier' // Suggest columns e.g. assignee:, label: or keywords like is: no: reason:
  | 'values' // Suggest values for a column

const unfilterableColumnNames = new Set<string>(['title'])

const isFilterable = (column: ColumnModel): boolean => !unfilterableColumnNames.has(column.name.toLowerCase())

type ValueOptions = {
  filterForPresence?: boolean
  filterForEmpty?: boolean
  filterForNegative?: boolean
}

function formatColumnNameForSuggestions(name: string): string {
  return `${normalizeToDehyphenatedFilterName(name)}:`
}

export type FilterSuggestionsItemsContextProps = {
  items: ReadonlyArray<MemexItemModel>
  repoSuggestions?: RepoSuggestions | undefined
  issueTypeSuggestedNames?: ReadonlyArray<string> | undefined
}

export const FilterSuggestionsItemsContext = createContext<FilterSuggestionsItemsContextProps | null>(null)

export const useFilterSuggestionsItemsContext = () => {
  const ctx = useContext(FilterSuggestionsItemsContext)
  if (!ctx) throw new Error('useFilterSuggestionsItemsContext can only be used inside a FilterSuggestionsItemsContext')
  return ctx
}

const INVALID_VALUE_REGEX = /\b([\w-]+:\S+)/g
const COMMA_OUTSIDE_QUOTES_REGEX = /(?=(?:[^"]*"[^"]*")*[^"]*$)(?=(?:[^']*'[^']*')*[^']*$),/g
const WHITESPACE_OUTSIDE_SINGLE_QUOTES = /\s(?=(?:'[^']*'|[^'])*$)/g
const WHITESPACE_OUTSIDE_DOUBLE_QUOTES = /\s(?=(?:"[^"]*"|[^"])*$)/g

export const FilterSuggestions = memo(
  forwardRef(function FilterSuggestions(
    {
      filterInputRef,
      query,
      areFilterSuggestionsVisible,
      setAreFilterSuggestionsVisible,
      setQuery,
      suggestColumns = true,
      showColumnSuggestionIf,
      testId,
      anchorRef,
    }: FilterSuggestionsProps,
    listRef: React.Ref<HTMLUListElement>,
  ) {
    const {items, repoSuggestions, issueTypeSuggestedNames} = useFilterSuggestionsItemsContext()
    const {allColumns} = useAllColumns()
    const [filterCommand, setFilterCommand] = useState<FilterCommand | null>(null)
    const {fieldFilters} = useSearch()
    const {findColumnByDatabaseId} = useFindColumnByDatabaseId()
    const {findFilterableFieldByName} = useFindFilterableFieldByName()
    const {clientWidth} = useElementSizes(anchorRef.current)
    const filterSuggestionStyle = useMemo(
      () => ({minWidth: '300px', width: clientWidth ?? 'fit-content', marginLeft: 0}) as const,
      [clientWidth],
    )
    const {activeWorkflow} = useWorkflows()

    // Do not show last updated for auto-add workflow.
    // TODO: This should be refactored as part of:
    // https://github.com/github/memex/discussions/13314#discussioncomment-4389522
    const showLastUpdated = activeWorkflow && !isAutoAddWorkflow(activeWorkflow)

    const {isKeywordQualifier} = useFilterKeywords()
    const filterableColumns = useMemo(() => allColumns.filter(isFilterable), [allColumns])
    const {displayableColumns, displayableCommands, displayableKeywords} = useFilterSuggestions({
      query,
      // Remove columns from suggestions that should not be filterable
      columns: filterableColumns,
      commands: FilterCommands,
      options: {suggestColumns, showColumnSuggestionIf},
    })

    const {getSuggestionsForColumn} = useSearchFilterSuggestions(items, repoSuggestions, issueTypeSuggestedNames)
    const [mode, setMode] = useState<FilterSuggestionsMode>('none')
    const [currentFilterValue, setCurrentFilterValue] = useState<string>('')
    const [activeFilterQualifierState, setActiveFilterQualifierState] = useState<{
      keyword: string | null
      columnDatabaseId: ColumnModel['databaseId'] | null
      value: string
      filterForNegative: boolean
    } | null>(null)

    const setFilter = useCallback(
      (column: ColumnModel | null, keyword: string | null, filterForNegative = false) => {
        if (!(column && column.name) && !keyword) {
          return
        }

        const filterValue = column?.name ?? keyword
        setQuery(replaceQuery(query, not_typesafe_nonNullAssertion(filterValue), {replace: true, filterForNegative}))
        setActiveFilterQualifierState({
          keyword,
          filterForNegative,
          columnDatabaseId: column && column.databaseId,
          value: '',
        })
        filterInputRef.current?.focus()
      },
      [query, filterInputRef, setQuery],
    )

    const setValue = useCallback(
      (
        value: string,
        {filterForPresence = false, filterForEmpty = false, filterForNegative = false}: ValueOptions = {},
      ) => {
        if (activeFilterQualifierState) {
          if (activeFilterQualifierState.columnDatabaseId) {
            const column = findColumnByDatabaseId(activeFilterQualifierState.columnDatabaseId)
            if (!column) return
            setQuery(
              replaceQuery(query, column.name, {
                value,
                replace: true,
                filterForPresence,
                filterForEmpty,
                filterForNegative,
              }),
            )
          } else if (activeFilterQualifierState.keyword) {
            if (!showLastUpdated && isUpdatedQualifier(activeFilterQualifierState.keyword)) return
            // This is done to avoid adding quotes during the `replaceQuery` operation
            const [modifiedQuery, modifiedValue] =
              activeFilterQualifierState.keyword === 'updated' ? [`${query}<`, value.replace('<', '')] : [query, value]
            setQuery(
              replaceQuery(modifiedQuery, activeFilterQualifierState.keyword, {
                value: modifiedValue,
                replace: true,
                filterForPresence,
                filterForEmpty,
                filterForNegative,
              }),
            )
          }
          setActiveFilterQualifierState(null)
          setAreFilterSuggestionsVisible(false)
        }
        filterInputRef.current?.focus()
      },
      [
        activeFilterQualifierState,
        filterInputRef,
        setAreFilterSuggestionsVisible,
        findColumnByDatabaseId,
        setQuery,
        query,
        showLastUpdated,
      ],
    )

    const issueStateFilterValue = useMemo(() => {
      let stateFilterValue = ''
      const isFilterValue = fieldFilters.find(filter => filter[0] === 'is')?.[1]?.[0]
      if (isFilterValue) {
        stateFilterValue = isFilterValue
      }
      return stateFilterValue
    }, [fieldFilters])

    const setStateForKeywordOrField = useCallback(
      (fieldNameText: string, commaOrColonIndex: number, cursorPos: number) => {
        const filterForNegative = isNegatedFilter(fieldNameText)
        if (filterForNegative) {
          fieldNameText = fieldNameText.substring(1, fieldNameText.length)
        }

        const column = findFilterableFieldByName(fieldNameText)
        const isKeyword = isKeywordQualifier(fieldNameText)

        if (column && isFilterable(column)) {
          setMode('values')

          const tokens = tokenizeFilter(query)

          // Check if there is a comparison or range token somewhere after the field token but before the cursor
          const comparisonToken = findLastToken(tokens, {
            kind: ['keyword.operator.comparison', 'keyword.operator.range'],
            start: cursorPos,
            end: 'variable',
          })

          // If the field can be compared, then the comparison is not part of the value,
          // otherwise, the comparison operator is just part of the value
          const fieldValue =
            comparisonToken && isFieldComparable(column)
              ? query.substring(comparisonToken.location.end + 1, cursorPos)
              : query.substring(commaOrColonIndex + 1, cursorPos)

          setActiveFilterQualifierState({
            keyword: isAmbivalentColumn(column.name) ? fieldNameText : null,
            columnDatabaseId: column.databaseId,
            value: fieldValue,
            filterForNegative,
          })
          return
        } else if (isKeyword) {
          setMode('values')
          setActiveFilterQualifierState({
            keyword: fieldNameText,
            columnDatabaseId: null,
            value: query.substring(commaOrColonIndex + 1, cursorPos),
            filterForNegative,
          })
          return
        } else {
          setMode('none')
          return
        }
      },
      [query, isKeywordQualifier, findFilterableFieldByName],
    )

    const setStateFromQuery = useCallback(
      (queryStr: string, cursorPos: number | null) => {
        // If the cursor is not at the end of the text, we don't show any suggestions.
        if (typeof cursorPos !== 'number' || cursorPos !== queryStr.length) {
          setMode('none')
          setActiveFilterQualifierState(null)
          return
        }

        // Right now, the only available filter-command is filtering.
        // So just set it as the default.
        if (!filterCommand) {
          const defaultFilterCommand = FilterCommands[0]
          invariant(defaultFilterCommand, 'Default filter command must exist')
          setFilterCommand(defaultFilterCommand)
          setMode('filterQualifier')
        }

        // If there are characters before and after the cursor, we don't show any suggestions.
        if ((cursorPos === 0 || queryStr[cursorPos - 1]) && queryStr[cursorPos]) {
          setMode('none')
          return
        }

        if (!queryStr) {
          setMode(!filterCommand ? 'commands' : 'filterQualifier')
          return
        }

        // Get the last character before the end of the string / cursor
        const lastCharacter = queryStr.charAt(cursorPos - 1)
        // Check if the query has an odd number of quotes
        const oddNumberQuotes = hasOddNumberOfQuotes(queryStr)
        // Determine which regex to use based on the balancing of the quotes, and look for the last match
        const match = regexLastMatch(oddNumberQuotes ? INVALID_VALUE_REGEX : SPLIT_ON_VALUES_REGEX, queryStr)

        let matchIndex = 0
        let matchValue = queryStr
        let columnName = ''
        let columnValue = ''

        // If there is a match, then set the match value - there should be regardless of the string
        if (match) {
          matchValue = match[0]
          matchIndex = match.index
        }

        // Find the first colon in the key value - this will be between the key and the value
        const matchValueColonIndex = matchValue.indexOf(':')

        const trimDanglingQuote = oddNumberQuotes && ["'", '"'].includes(lastCharacter)

        columnName = matchValue.substring(0, matchValueColonIndex)
        columnValue = matchValue.substring(matchValueColonIndex + 1, cursorPos - (trimDanglingQuote ? 1 : 0))

        // Set the current filter value
        setCurrentFilterValue(columnValue)

        // Find the last comma in the query string
        const commaMatch = regexLastMatch(COMMA_OUTSIDE_QUOTES_REGEX, queryStr)

        // Find the whitespace index, we have to check if it's outside of different variants of
        // quotations. Default to 0 if it's not found.
        const wsIndex = Math.max(
          regexLastMatchIndex(WHITESPACE_OUTSIDE_DOUBLE_QUOTES, queryStr),
          regexLastMatchIndex(WHITESPACE_OUTSIDE_SINGLE_QUOTES, queryStr),
          0,
        )

        // Which is greater the comma or the colon? This is in relation to the entire query str
        const commaOrColonIndex = Math.max(
          (matchIndex + columnName.length || 0) + (oddNumberQuotes ? 1 : 0),
          (commaMatch ? commaMatch.index : queryStr.lastIndexOf(',')) || 0,
        )

        if (wsIndex >= commaOrColonIndex) {
          // If there is not an odd number of quotes, look at the previous character and see if
          // it's a terminator
          if (!oddNumberQuotes) {
            if (['"', "'", ' '].includes(lastCharacter)) {
              setMode('none')
              return
            } else {
              setMode('filterQualifier')
              setActiveFilterQualifierState({
                keyword: null,
                filterForNegative: isNegatedFilter(not_typesafe_nonNullAssertion(queryStr[cursorPos - 1])),
                columnDatabaseId: null,
                value: '',
              })
              return
            }
          }
        }
        setStateForKeywordOrField(columnName, commaOrColonIndex, cursorPos)
      },
      [filterCommand, setStateForKeywordOrField],
    )

    useEffect(() => {
      const localQuery = query

      // requestAnimationFrame is used here to ensure the correct cursor position is passed
      // into the setStateFromQuery function
      const animationFrame = requestAnimationFrame(() => {
        if (!localQuery.length) {
          return
        }

        let cursorPos = null
        if (filterInputRef.current) {
          cursorPos = filterInputRef.current.selectionStart
        }
        setStateFromQuery(localQuery, cursorPos)
      })

      return () => {
        cancelAnimationFrame(animationFrame)
      }
    }, [setStateFromQuery, query, filterInputRef, areFilterSuggestionsVisible])

    const columnNames = useMemo(() => new Set(filterableColumns.map(c => c.name.toLowerCase())), [filterableColumns])

    const keywordsFiltersOptions = useMemo(
      () =>
        displayableKeywords
          .filter(keyword => {
            return !isAmbivalentColumn(keyword) || (isAmbivalentColumn(keyword) && !columnNames.has(keyword))
          })
          .filter(keyword => !isUpdatedQualifier(keyword) || showLastUpdated)
          .map(item => ({
            key: item,
            value: formatColumnNameForSuggestions(item),
            asHTML: false,
            onSelect: () => setFilter(null, item, !!activeFilterQualifierState?.filterForNegative),
            testId: `search-suggestions-item-${item}`,
          })),
      [displayableKeywords, columnNames, showLastUpdated, setFilter, activeFilterQualifierState?.filterForNegative],
    )

    const setCommand = useCallback(
      (command: FilterCommand) => {
        if (filterInputRef.current) {
          filterInputRef.current.value = ''
          filterInputRef.current?.focus()
        }
        setFilterCommand(command)
      },
      [filterInputRef, setFilterCommand],
    )

    if (!query.length || !areFilterSuggestionsVisible) {
      return null
    }

    switch (mode) {
      case 'commands': {
        return (
          <SuggestionsList
            xAlign="left"
            xOriginEdgeAlign="left"
            testId={testId}
            listRef={listRef}
            style={filterSuggestionStyle}
            controllingElementRef={anchorRef}
            inputRef={filterInputRef}
            items={displayableCommands.map(command => {
              return {
                key: command.name,
                value: command.name,
                asHTML: false,
                onSelect: () => setCommand(command),
                testId: `search-suggestions-item-${command.name}`,
              }
            })}
          />
        )
      }

      // suggestions for filter qualifiers (before the colon)
      case 'filterQualifier': {
        return (
          <SuggestionsList
            xAlign="left"
            xOriginEdgeAlign="left"
            testId={testId}
            listRef={listRef}
            controllingElementRef={anchorRef}
            inputRef={filterInputRef}
            style={filterSuggestionStyle}
            items={displayableColumns
              .map(column => {
                return {
                  key: column.name,
                  value: formatColumnNameForSuggestions(column.name),
                  asHTML: false,
                  onSelect: () =>
                    setFilter(
                      column,
                      isAmbivalentColumn(column.name) ? column.name.toLowerCase() : null,
                      !!activeFilterQualifierState?.filterForNegative,
                    ),
                  testId: `search-suggestions-item-${column.name}`,
                }
              })
              .concat(keywordsFiltersOptions)}
          />
        )
      }

      // suggestions for filter values e.g. after the colon
      case 'values': {
        if (!activeFilterQualifierState) {
          return null
        }
        const qualifierValue = activeFilterQualifierState.value.toLowerCase()
        const suggestions: SuggestionItems = []

        if (activeFilterQualifierState.columnDatabaseId && suggestColumns) {
          const isNegativeFilterActive = activeFilterQualifierState.filterForNegative
          const column = not_typesafe_nonNullAssertion(
            findColumnByDatabaseId(activeFilterQualifierState.columnDatabaseId),
          )

          // do not suggest values for columns that are not filterable
          if (
            showColumnSuggestionIf !== undefined &&
            showColumnSuggestionIf(column.name) !== ShowColumnSuggestionModeEnum.ColumnAndValues
          ) {
            return null
          }

          const {filteredKeys, uniqueColumnValues} = getSuggestionsForColumn(
            column,
            currentFilterValue,
            qualifierValue,
            activeFilterQualifierState.filterForNegative,
          )

          const emptyFilterColName = normalizeToDehyphenatedFilterName(column.name)

          suggestions.push(
            ...filteredKeys.flatMap(key => {
              // add the `Has column` suggestion
              if (key === `present-${activeFilterQualifierState.columnDatabaseId}`) {
                const presentSuggestionValue = `${Resources.hasSuggestion} ${emptyFilterColName}`
                return {
                  key,
                  value: presentSuggestionValue,
                  asHTML: true,
                  onSelect: () => setValue(key, {filterForPresence: true, filterForNegative: isNegativeFilterActive}),
                  testId: `search-suggestions-item-${presentSuggestionValue}`,
                }
              }

              // add the `No column` suggestion
              if (key === `empty-${activeFilterQualifierState.columnDatabaseId}`) {
                const emptySuggestionValue = `${Resources.noSuggestion} ${emptyFilterColName}`
                return {
                  key,
                  value: emptySuggestionValue,
                  asHTML: true,
                  onSelect: () => setValue(key, {filterForEmpty: true, filterForNegative: isNegativeFilterActive}),
                  testId: `search-suggestions-item-${emptySuggestionValue}`,
                }
              }

              // add the `Exclude column` suggestion
              if (key === `exclude-${activeFilterQualifierState.columnDatabaseId}`) {
                const excludeSuggestionValue = `${Resources.excludeSuggestion} ${emptyFilterColName}`
                return {
                  key,
                  value: excludeSuggestionValue,
                  asHTML: true,
                  onSelect: () => setFilter(column, null, true),
                  testId: `search-suggestions-item-${excludeSuggestionValue}`,
                }
              }

              const result = uniqueColumnValues.get(key)
              const value = result ? result.value : ''
              const isPriority = result && result.priority ? result.priority > SuggestionsPriority.UserDefined : false

              const renderItem = isPriority ? () => <Text sx={{color: 'accent.fg'}}>{value}</Text> : result?.renderItem

              return {
                key,
                value,
                renderItem,
                asHTML: true,
                onSelect: () =>
                  setValue(key, {
                    filterForNegative: isNegativeFilterActive,
                  }),
                testId: `search-suggestions-item-${key}`,
              }
            }),
          )
        }

        if (activeFilterQualifierState.keyword) {
          if (activeFilterQualifierState.keyword === 'no' || activeFilterQualifierState.keyword === 'has') {
            const filteredColumns = activeFilterQualifierState.value
              ? displayableColumns.filter(key => key.name.toLowerCase().indexOf(activeFilterQualifierState.value) >= 0)
              : displayableColumns

            const isNegativeFilterActive = activeFilterQualifierState.filterForNegative

            const filterableColumnNames = filteredColumns
              .map(column => normalizeToDehyphenatedFilterName(column.name))
              .filter(columnName => !currentFilterValue.includes(columnName))

            return (
              <SuggestionsList
                style={filterSuggestionStyle}
                xAlign="right"
                xOriginEdgeAlign="left"
                testId={testId}
                listRef={listRef}
                controllingElementRef={anchorRef}
                inputRef={filterInputRef}
                items={filterableColumnNames.map(columnName => {
                  return {
                    key: columnName,
                    value: columnName,
                    asHTML: true,
                    onSelect: () =>
                      setValue(columnName, {
                        filterForNegative: isNegativeFilterActive,
                      }),
                    testId: `search-suggestions-item-${columnName}`,
                  }
                })}
              />
            )
          }

          if (suggestions.length > 0) {
            return (
              <SuggestionsList
                xAlign="right"
                xOriginEdgeAlign="left"
                testId={testId}
                listRef={listRef}
                controllingElementRef={anchorRef}
                inputRef={filterInputRef}
                items={suggestions}
                style={filterSuggestionStyle}
              />
            )
          }

          if (isUpdatedQualifier(activeFilterQualifierState.keyword) && !showLastUpdated) return null
          if (!Object.keys(META_QUALIFIERS).includes(activeFilterQualifierState.keyword)) return null

          const metaKeyword = activeFilterQualifierState.keyword as keyof typeof META_QUALIFIERS
          const metaQualifierValues = Object.values(META_QUALIFIERS[metaKeyword])

          let filteredMetaProps = (
            activeFilterQualifierState.value
              ? metaQualifierValues.filter(key => key.indexOf(activeFilterQualifierState.value) >= 0)
              : metaQualifierValues
          ).filter(metaProp => !currentFilterValue.includes(metaProp))

          if (metaKeyword === 'reason') {
            switch (issueStateFilterValue) {
              case IS_QUALIFIERS.open:
                filteredMetaProps = filteredMetaProps.filter(metaProp => metaProp === STATE_REASON_QUALIFIER.reopened)
                break
              case IS_QUALIFIERS.closed:
                filteredMetaProps = filteredMetaProps.filter(metaProp => metaProp !== STATE_REASON_QUALIFIER.reopened)
                break
            }
          }

          const isNegativeFilterActive = activeFilterQualifierState.filterForNegative

          suggestions.push(
            ...filteredMetaProps.map(key => {
              return {
                key,
                value: key,
                asHTML: true,
                onSelect: () =>
                  setValue(key, {
                    filterForNegative: isNegativeFilterActive,
                  }),
                testId: `search-suggestions-item-${key}`,
              }
            }),
          )
        }

        if (suggestions.length > 0) {
          return (
            <SuggestionsList
              xAlign="right"
              xOriginEdgeAlign="left"
              testId={testId}
              listRef={listRef}
              controllingElementRef={anchorRef}
              inputRef={filterInputRef}
              items={suggestions}
              style={filterSuggestionStyle}
            />
          )
        }

        return null
      }

      default: {
        return null
      }
    }
  }),
)
