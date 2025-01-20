import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'

import {FilterQuery} from '../filter-query'
// eslint-disable-next-line import/no-deprecated
import {FilterQueryParser} from '../parser/v1'
import {FilterQueryParser as FilterQueryParser2} from '../parser/v2'
import {NoFilterProvider} from '../providers/no'
import {
  FILTER_PRIORITY_DISPLAY_THRESHOLD,
  type FilterConfig,
  type FilterProvider,
  type FilterSuggestion,
  FilterValueType,
  type Parser,
  SubmitEvent,
} from '../types'
import {checkFilterQuerySync, promiseTimeout} from '../utils'
import {useFilter} from '.'

interface FilterQueryContext {
  clearFilter: () => void
  filterQuery: FilterQuery
  filterProviders: Record<string, FilterProvider>
  insertIntoQuery: (value: string, caretIndex: number, triggerSubmit?: boolean) => void
  isInitialValidation: boolean
  forceReparse: (cursor?: number, callback?: (query: FilterQuery) => void) => void
  onSubmit: (eventType: SubmitEvent, updatedQuery?: FilterQuery) => void
  rawFilterRef: React.MutableRefObject<string> | null
  replaceActiveBlockWithNoBlock: () => void
  updateFilter: (
    unparsedFilter?: string,
    caret?: number,
    callback?: (query: FilterQuery) => void,
    eventType?: SubmitEvent,
  ) => void
  updateFromExternal: (callback: (query: FilterQuery) => void) => void
}

export const FilterQueryContext = createContext<FilterQueryContext | undefined>(undefined)

export const useFilterQuery = () => {
  const context = useContext(FilterQueryContext)
  if (!context) {
    throw new Error('useFilterQuery must be used inside a FilterQueryContext')
  }

  return context
}

interface FilterQueryContextProviderProps {
  children: React.ReactNode
  context?: Record<string, string>
  customParser?: Parser<FilterQuery>
  filterConfig: FilterConfig
  providers: FilterProvider[]
  inputRef: React.RefObject<HTMLInputElement>
  onChange: (value: string) => void
  onParse?: (request: FilterQuery) => void
  onSubmit?: (request: FilterQuery, eventType: SubmitEvent) => void
  onValidation: (messages: string[], filterQuery: FilterQuery) => void
  rawFilter: string
}

export const FilterQueryContextProvider = ({
  children,
  context: externalContext,
  customParser,
  filterConfig,
  providers: externalProviders,
  inputRef,
  onChange,
  onParse,
  onSubmit,
  onValidation,
  rawFilter,
}: FilterQueryContextProviderProps) => {
  // eslint-disable-next-line import/no-deprecated
  const DefaultParser = filterConfig.groupAndKeywordSupport ? FilterQueryParser2 : FilterQueryParser

  const latestRawFilterRef = useRef('')
  const parser = useRef(customParser ?? new DefaultParser([], filterConfig))
  const [filterQuery, setFilterQuery] = useState<FilterQuery>(new FilterQuery('', [], filterConfig))
  const [isInitialValidation, setIsInitialValidation] = useState(true)
  const {inputContextRef} = useFilter()

  useEffect(() => {
    filterQuery.staticContext = externalContext
  }, [externalContext, filterQuery])

  const clearFilter = useCallback(() => {
    onChange('')
    inputRef.current?.focus()
  }, [inputRef, onChange])

  const filterProviders = useMemo<Record<string, FilterProvider>>(() => {
    const record: Record<string, FilterProvider> = {}
    const noProviders: FilterProvider[] = []
    externalProviders.map(provider => {
      record[provider.key] = provider
      if (provider.options.filterTypes.valueless) {
        noProviders.push(provider)
      }
    })

    if (noProviders.length) {
      const noProviderValues: FilterSuggestion[] = noProviders
        .sort((a, b) => (a.displayName ?? a.key)?.localeCompare(b.displayName ?? b.key) ?? 0)
        .map(provider => ({
          value: provider.key,
          priority: FILTER_PRIORITY_DISPLAY_THRESHOLD,
          displayName: provider.displayName,
          type: FilterValueType.Value,
          icon: provider.icon,
        }))
      record.no = new NoFilterProvider(noProviderValues)
    }

    parser.current.filterProviders = Object.values(record)
    return record
  }, [externalProviders])

  const postQueryValidate = useCallback(
    (request: FilterQuery, showAllErrors = false) => {
      onValidation(
        request.getErrors(showAllErrors || document.activeElement !== inputRef.current),
        new FilterQuery(request.raw, request.blocks, filterConfig, request.activeBlock),
      )
    },
    [filterConfig, inputRef, onValidation],
  )

  const parseAndValidate = useCallback(
    (caret: number, callback?: (query: FilterQuery) => void, newRaw?: string) => {
      new Promise<FilterQuery>((resolve, reject) => {
        const query = parser.current.parse(newRaw ?? rawFilter, filterQuery, caret)
        if (checkFilterQuerySync(query, latestRawFilterRef.current)) {
          setFilterQuery(query)
          resolve(query)
        } else {
          reject(new Error('Query out of sync, Aborted...'))
        }
      })
        // * While we do want to use async/await, in this case it actually results in a broken experience as it blocks
        // * the UI from updating
        // eslint-disable-next-line github/no-then
        .then((query: FilterQuery) => parser.current.validateFilterQuery(query))
        // eslint-disable-next-line github/no-then
        .then((newQuery: FilterQuery) => {
          return new Promise<FilterQuery>((resolve, reject) => {
            if (newQuery && checkFilterQuerySync(newQuery)) {
              setIsInitialValidation(false)
              setFilterQuery(newQuery)
              return resolve(newQuery)
            }
            return reject(new Error(newQuery ? 'Out of sync' : 'Empty Query, Aborted...'))
          })
        })
        // eslint-disable-next-line github/no-then
        .then((query: FilterQuery) => {
          callback?.(query)
        })
        // eslint-disable-next-line github/no-then
        .catch(() => {})
    },
    [filterQuery, rawFilter],
  )

  const forceReparse = useCallback(
    (cursorLocation?: number, callback?: (query: FilterQuery) => void) => {
      const caret = cursorLocation ? cursorLocation : inputContextRef.current?.caretStart ?? -1
      parseAndValidate(caret, query => {
        postQueryValidate(query)
        callback?.(query)
      })
    },
    [inputContextRef, parseAndValidate, postQueryValidate],
  )

  const onSubmitHandler = useCallback(
    async (eventType: SubmitEvent, updatedQuery?: FilterQuery) => {
      const query = updatedQuery ?? filterQuery

      // Clearing the active block so validation errors will show
      query.clearActiveBlock()

      let retry = 0
      let hasSubmitted = false
      while (retry <= 3) {
        if (checkFilterQuerySync(query, rawFilter)) {
          onSubmit?.(query, eventType)
          postQueryValidate(query, true)
          hasSubmitted = true
          break
        } else {
          retry += 1
          await promiseTimeout(10)
        }
      }

      if (!hasSubmitted) {
        //Final attempt
        parseAndValidate(inputContextRef.current?.caretStart ?? -1, q => {
          if (checkFilterQuerySync(q, rawFilter)) {
            onSubmit?.(q, eventType)
            postQueryValidate(query, true)
          }
        })
      }
    },
    [filterQuery, inputContextRef, onSubmit, parseAndValidate, postQueryValidate, rawFilter],
  )

  const updateFilter = useCallback(
    (
      unparsedFilter?: string,
      caret: number = -1,
      callback?: (query: FilterQuery) => void | null,
      eventType?: SubmitEvent,
    ) => {
      const updatedRaw = unparsedFilter ?? filterQuery.raw

      onChange?.(updatedRaw)
      if (eventType) {
        latestRawFilterRef.current = updatedRaw
        parseAndValidate(
          caret,
          query => {
            if (checkFilterQuerySync(query, latestRawFilterRef.current)) {
              callback?.(query)
              onSubmit?.(query, eventType)
            }
          },
          updatedRaw,
        )
      }
    },
    [filterQuery.raw, onChange, onSubmit, parseAndValidate],
  )

  const replaceActiveBlockWithNoBlock = useCallback(() => {
    const [raw, cursorIndex] = parser.current.replaceActiveBlockWithNoBlock(filterQuery)
    inputContextRef.current?.updateCaretPosition(cursorIndex)
    updateFilter(raw, cursorIndex)
  }, [filterQuery, inputContextRef, updateFilter])

  const insertIntoQuery = useCallback(
    (value: string, caretIndex: number, triggerSubmit: boolean = false) => {
      const [raw, cursorIndex] = parser.current.insertSuggestion(filterQuery, value, caretIndex)
      inputContextRef.current?.updateCaretPosition(cursorIndex)
      // Insert the updated raw query into the input context
      inputContextRef.current?.updateRawFilterValue(raw)
      updateFilter(raw, cursorIndex, undefined, triggerSubmit ? SubmitEvent.SuggestionSelected : undefined)
    },
    [filterQuery, inputContextRef, updateFilter],
  )

  const updateFromExternal = useCallback(
    (callback: (query: FilterQuery) => void) => {
      if (rawFilter !== latestRawFilterRef.current) {
        latestRawFilterRef.current = rawFilter
        parseAndValidate(inputContextRef.current?.caretStart ?? -1, query => {
          postQueryValidate(query)
          onParse?.(query)
          callback(query)
        })
      }
    },
    [inputContextRef, onParse, parseAndValidate, postQueryValidate, rawFilter],
  )

  const filterQueryContextValue: FilterQueryContext = useMemo(
    () => ({
      clearFilter,
      filterQuery,
      filterProviders,
      forceReparse,
      insertIntoQuery,
      isInitialValidation,
      onSubmit: onSubmitHandler,
      rawFilterRef: latestRawFilterRef,
      replaceActiveBlockWithNoBlock,
      updateFilter,
      updateFromExternal,
    }),
    [
      clearFilter,
      filterProviders,
      filterQuery,
      forceReparse,
      insertIntoQuery,
      isInitialValidation,
      onSubmitHandler,
      replaceActiveBlockWithNoBlock,
      updateFilter,
      updateFromExternal,
    ],
  )

  return <FilterQueryContext.Provider value={filterQueryContextValue}>{children}</FilterQueryContext.Provider>
}
