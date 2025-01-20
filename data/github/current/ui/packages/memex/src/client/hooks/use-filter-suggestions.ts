import {useCallback, useMemo} from 'react'

import {ShowColumnSuggestionModeEnum} from '../components/filter-bar/helpers/filter-suggestions'
import {
  isNegatedFilter,
  normalizeToDehyphenatedFilterName,
  normalizeToFilterName,
  parseFullTextQuery,
} from '../components/filter-bar/helpers/search-filter'
import {useFilterKeywords} from './use-filter-keywords'

type FilterOptions = {
  suggestColumns: boolean
  showColumnSuggestionIf?: (suggestion: string) => ShowColumnSuggestionModeEnum | undefined
}
const defaultCommands: Array<any> = []
/**
 * Returns type-ahead suggestions for possible filter qualifiers,
 * either field names (`status`, `priority`, etc.) or keywords (`is`, `no`).
 *
 * NOTE: Does not handle value suggestions, i.e., anything after the colon in a query
 * like `is:` or `assignee:`. (See `useSearchFilterSuggestions` for that.)
 */
export function useFilterSuggestions<
  TColumn extends {name: string} = {name: string},
  TCommand extends {name: string} = {name: string},
>({
  query,
  columns,
  commands = defaultCommands,
  options = {suggestColumns: true},
}: {
  query: string
  columns: Array<TColumn>
  commands?: Array<TCommand>
  options?: FilterOptions
}) {
  const {searchTokens} = useMemo(() => parseFullTextQuery(query), [query])

  const matchesTypedInput = useCallback(
    (columnName: string) => {
      let searchText = ''
      if (searchTokens.length) {
        const text = searchTokens[searchTokens.length - 1]
        if (text !== undefined) {
          searchText = text
        }
      }

      if (isNegatedFilter(searchText)) {
        searchText = searchText.substr(1)
      }

      // Show all options when the search text is empty
      if (searchText.length === 0) {
        return true
      }

      // 1. Check if the search text matches the column's presentational name
      if (normalizeToFilterName(columnName).startsWith(searchText.toLowerCase())) {
        return true
      }
      // 2. Check if the search text matches the column's filterable name
      if (normalizeToDehyphenatedFilterName(columnName).startsWith(searchText.toLowerCase())) {
        return true
      }

      return false
    },
    [searchTokens],
  )

  const displayableCommands = useMemo(
    () =>
      commands.filter(command => {
        if (query && !command.name.toLowerCase().startsWith(query.toLowerCase())) {
          return false
        }
        return true
      }),
    [commands, query],
  )

  const displayableColumns = useMemo(() => {
    let cols = options.suggestColumns ? columns.filter(column => matchesTypedInput(column.name)) : []

    if (options.showColumnSuggestionIf !== undefined) {
      cols = cols.filter(col => {
        const columnSuggestionMode = options.showColumnSuggestionIf?.(col.name)

        return (
          columnSuggestionMode === ShowColumnSuggestionModeEnum.ColumnOnly ||
          columnSuggestionMode === ShowColumnSuggestionModeEnum.ColumnAndValues
        )
      })
    }

    return cols
  }, [columns, matchesTypedInput, options])

  const {FilterKeywords} = useFilterKeywords()
  const filterKeywords = useMemo(() => {
    const keywords = FilterKeywords.map((k: {keyword: string; isFilterable: boolean}) => k.keyword)
    return options.suggestColumns ? keywords : keywords.filter(k => k !== 'no')
  }, [FilterKeywords, options.suggestColumns])

  const displayableKeywords = useMemo(
    () => filterKeywords.filter(keyword => matchesTypedInput(keyword)),
    [matchesTypedInput, filterKeywords],
  )

  return {displayableColumns, displayableCommands, displayableKeywords}
}
