import {useRefObjectAsForwardedRef} from '@primer/react'
import type React from 'react'
import {createContext, useContext, useEffect, useId, useMemo, useRef} from 'react'

import {defaultFilterConfig, defaultFilterSettings} from '../constants/defaults'
import type {FilterQuery} from '../filter-query'
import type {
  FilterConfig,
  FilterContext as FilterContextType,
  FilterProvider,
  FilterSettings,
  FilterVariant,
  Parser,
  SubmitEvent,
} from '../types'
import {FilterQueryContextProvider} from './FilterQueryContext'
import {InputContextProvider, type InputContextRef} from './InputContext'
import {SuggestionsContextProvider} from './SuggestionsContext'

export const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const useFilter = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used inside a FilterProvider')
  }

  return context
}

export type FilterProviderProps = {
  children: React.ReactNode
  context?: Record<string, string>
  customParser?: Parser<FilterQuery>
  rawFilter: string
  filterDelimiter?: string
  inputRef?: React.RefObject<HTMLInputElement> | null
  onChange: (value: string) => void
  onParse?: (request: FilterQuery) => void
  onSubmit?: (request: FilterQuery, eventType: SubmitEvent) => void
  onValidation: (messages: string[], filterQuery: FilterQuery) => void
  providers: FilterProvider[]
  settings?: FilterSettings
  valueDelimiter?: string
  variant: FilterVariant
}

export const FilterContextProvider = ({
  children,
  context,
  customParser,
  rawFilter,
  filterDelimiter = defaultFilterConfig.filterDelimiter,
  inputRef: forwardedInputRef = null,
  onChange,
  onParse,
  onSubmit,
  onValidation,
  providers,
  settings: suppliedSettings,
  valueDelimiter = defaultFilterConfig.valueDelimiter,
  variant,
}: FilterProviderProps) => {
  const filterConfig = useMemo((): FilterConfig => {
    return {
      filterDelimiter,
      valueDelimiter,
      ...defaultFilterSettings,
      ...suppliedSettings,
      variant,
    }
  }, [filterDelimiter, suppliedSettings, valueDelimiter, variant])

  const inputRef = useRef<HTMLInputElement>(null)
  useRefObjectAsForwardedRef(forwardedInputRef, inputRef)
  const caretRef = useRef<HTMLSpanElement>(null)
  const inputContextRef = useRef<InputContextRef>(null)
  const id = useId()

  const contextValue: FilterContextType = useMemo(
    () => ({
      config: filterConfig,
      id,
      inputContextRef,
    }),
    [filterConfig, id, inputContextRef],
  )

  useEffect(() => {
    inputContextRef.current?.updateRawFilterValue(rawFilter)
  }, [rawFilter])

  return (
    <FilterContext.Provider value={contextValue}>
      <FilterQueryContextProvider
        customParser={customParser}
        context={context}
        filterConfig={filterConfig}
        providers={providers}
        inputRef={inputRef}
        onChange={onChange}
        onParse={onParse}
        onSubmit={onSubmit}
        onValidation={onValidation}
        rawFilter={rawFilter}
      >
        <SuggestionsContextProvider caretRef={caretRef} inputRef={inputRef}>
          <InputContextProvider caretRef={caretRef} inputRef={inputRef} ref={inputContextRef} value={rawFilter}>
            {children}
          </InputContextProvider>
        </SuggestionsContextProvider>
      </FilterQueryContextProvider>
    </FilterContext.Provider>
  )
}
