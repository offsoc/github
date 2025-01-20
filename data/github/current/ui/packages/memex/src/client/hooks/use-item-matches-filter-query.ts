import {useCallback, useMemo} from 'react'

import {
  isNegatedFilter,
  isValuePresenceFilter,
  makeFieldsByFilterableName,
  matchesFilter,
  matchesFreeText,
  matchesLastUpdated,
  matchesUpdated,
  matchMetaProps,
  normalizeToFilterName,
  type ParsedFullTextQuery,
} from '../components/filter-bar/helpers/search-filter'
import {dateStringFromISODate} from '../helpers/date-string-from-iso-string'
import {isAmbivalentColumn, META_QUALIFIERS} from '../helpers/meta-qualifiers'
import {parseDate} from '../helpers/parsing'
import type {ColumnModel} from '../models/column-model'
import {type MemexItemModel, RedactedItemModel} from '../models/memex-item-model'
import {useAllColumns} from '../state-providers/columns/use-all-columns'
import {useFilterKeywords} from './use-filter-keywords'

/**
 * Check if a given item matches a given query by field filters or free text search
 * Excludes redacted items that should not be visible to the user
 * @param item - The item to check
 * @param query - The parsed query to check against
 * @param allFieldsByFilterableName - All fields in the item's memex, indexed by filterable name
 * @param textSearchableFields - An optional array of fields to limit free text searches to
 * @returns True if the item matches a field filter or free text search
 */
export function useItemMatchesFilterQuery() {
  const {allColumns} = useAllColumns()
  const allFieldsByFilterableName = useMemo(() => {
    return makeFieldsByFilterableName(allColumns)
  }, [allColumns])

  const {isKeywordQualifier} = useFilterKeywords()

  const itemMatchesFilterQueryCallback = useCallback(
    (
      item: MemexItemModel,
      query: ParsedFullTextQuery & {normalisedQuery: string},
      textSearchableFields?: ReadonlyArray<ColumnModel>,
    ): boolean => {
      return itemMatchesFilterQuery(item, query, allFieldsByFilterableName, isKeywordQualifier, textSearchableFields)
    },
    [allFieldsByFilterableName, isKeywordQualifier],
  )

  return {itemMatchesFilterQuery: itemMatchesFilterQueryCallback}
}

export function itemMatchesFilterQuery(
  item: MemexItemModel,
  query: ParsedFullTextQuery & {normalisedQuery: string},
  allFieldsByFilterableName: Map<string, ColumnModel>,
  isKeywordQualifier: (text: string) => boolean,
  textSearchableFields?: ReadonlyArray<ColumnModel>,
): boolean {
  if (item instanceof RedactedItemModel) {
    return false
  }

  const columnData = item.columns

  // Checks if a filterable field is present in the query
  const hasFieldFilter = !!query.fieldFilters.length
  // Checks if at least one value is present in the field filters
  const hasFilterValue = hasFieldFilter && query.fieldFilters.some(fieldFilter => fieldFilter[1].length > 0)
  // If a list of text searchable fields isn't provided, assume all fields are text searchable
  const freeTextSearchFields = textSearchableFields || [...allFieldsByFilterableName.values()]

  // Checks if any field filters are specified, eg `status:done,"in progress" labels:`
  if (hasFieldFilter && hasFilterValue) {
    let keepSearching = true
    // Loop through each field filter
    for (const fieldFilter of query.fieldFilters) {
      let fieldName = fieldFilter[0]
      const filterText = fieldFilter[1]

      const shouldMatchNegated = isNegatedFilter(fieldName)
      if (shouldMatchNegated) {
        fieldName = fieldName.substring(1)
      }
      const field = allFieldsByFilterableName.get(normalizeToFilterName(fieldName))
      // Early return if the filterName is not a valid field or keyword
      if (!isKeywordQualifier(fieldName) && !field) return false

      const isAmbivalentField = isAmbivalentColumn(fieldName)
      let continueCheckingAmbivalentField = false

      // Checks present or empty field value filters eg `no:status` or `has:status`
      if (isValuePresenceFilter(fieldName) && filterText.length) {
        for (const emptyValueField of filterText) {
          const fieldToQuery = allFieldsByFilterableName.get(normalizeToFilterName(emptyValueField))
          // no: matchEmpty true, matchNegated false
          // -no: matchEmpty true, matchNegated true
          // has: matchEmpty true, matchNegated true
          // -has: matchEmpty true, matchNegated false
          const matchNegated =
            (shouldMatchNegated && fieldName === 'no') || (!shouldMatchNegated && fieldName === 'has')
          if (fieldToQuery) {
            keepSearching = matchesFilter({
              columnData,
              column: fieldToQuery,
              matchEmpty: true,
              matchNegated,
            })
          } else {
            continue
          }
          // Continue to check the other emptyValueFields if a match is found, eg `no:status,labels` or `has:status,labels`
          if (keepSearching) break
        }
      } else if (isKeywordQualifier(fieldName)) {
        if (!filterText.length) return true

        // matches for type or state filtering
        // is:open|closed|merged|issue|pull|draft
        // reason:completed|"not planned"
        // last-updated:XXdays
        for (const property of filterText) {
          if (fieldName === 'last-updated') {
            const itemUpdateAtDate = item.updatedAt ? parseDate(dateStringFromISODate(item.updatedAt)) : undefined
            keepSearching = matchesLastUpdated({
              itemUpdateAtDate,
              value: property,
              matchNegated: shouldMatchNegated,
            })

            break
          } else if (fieldName === 'updated') {
            const itemUpdateAtDate = item.updatedAt ? parseDate(dateStringFromISODate(item.updatedAt)) : undefined
            keepSearching = matchesUpdated({
              itemUpdateAtDate,
              value: property,
              matchNegated: shouldMatchNegated,
            })

            break
          } else {
            switch (property) {
              case META_QUALIFIERS.is.open:
              case META_QUALIFIERS.is.closed:
              case META_QUALIFIERS.is.merged:
                keepSearching = matchMetaProps({
                  columnData,
                  field: 'state',
                  value: property,
                  matchNegated: shouldMatchNegated,
                })
                break
              case META_QUALIFIERS.is.issue:
              case META_QUALIFIERS.is.pr:
                keepSearching = matchMetaProps({
                  columnData,
                  field: 'type',
                  value: property,
                  matchNegated: shouldMatchNegated,
                })
                break
              case META_QUALIFIERS.is.draft:
                keepSearching =
                  matchMetaProps({
                    columnData,
                    field: 'state',
                    value: property,
                    matchNegated: shouldMatchNegated,
                  }) ||
                  matchMetaProps({
                    columnData,
                    field: 'type',
                    value: property,
                    matchNegated: shouldMatchNegated,
                  })
                break
              case META_QUALIFIERS.reason.not_planned:
              case META_QUALIFIERS.reason.completed:
              case META_QUALIFIERS.reason.reopened:
                keepSearching = matchMetaProps({
                  columnData,
                  field: 'reason',
                  value: property,
                  matchNegated: shouldMatchNegated,
                })
                break
              default:
                if (!isAmbivalentField) {
                  return false
                } else {
                  continueCheckingAmbivalentField = true
                  break
                }
            }
          }
          if ((shouldMatchNegated && !keepSearching) || (!shouldMatchNegated && keepSearching)) break
        }
      }

      // Keep searching if it's a field, and if it's an ambivalent field search only if it hasn't been already matched
      if ((field && !isAmbivalentField) || (isAmbivalentField && continueCheckingAmbivalentField)) {
        if (!field) {
          return false
        }

        // if it's an empty filter (eg labels:), skip it and go onto next field filter
        if (!filterText.length) continue
        keepSearching = matchesFilter({
          columnData,
          column: field,
          values: filterText,
          matchNegated: shouldMatchNegated,
        })
      }
      // if no matches found, stop searching
      if (!keepSearching) break
    }

    if (!keepSearching) return false

    // If there were field filter matches, keep searching with a free text search
    if (query.searchTokens.length) {
      keepSearching = matchesFreeText(columnData, freeTextSearchFields, query.searchTokens)
    }
    return keepSearching
  } else if (hasFieldFilter) {
    // If a field name has been entered but no filter text,
    // filter on free text, eg labels: fix, will only search for "fix"
    if (query.searchTokens.length) {
      return matchesFreeText(columnData, freeTextSearchFields, query.searchTokens)
    }

    // Otherwise, show all items
    return true
  } else if (query.normalisedQuery.length > 0 && query.searchTokens.length === 0) {
    // some query text did not result in anything searchable - no valid results
    return false
  } else {
    // If no filter is provided, do a free text search
    return matchesFreeText(columnData, freeTextSearchFields, query.searchTokens)
  }
}
