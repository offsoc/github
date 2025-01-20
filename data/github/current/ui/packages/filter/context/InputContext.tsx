import {useRefObjectAsForwardedRef} from '@primer/react'
import type React from 'react'
import {createContext, forwardRef, useCallback, useContext, useImperativeHandle, useMemo, useRef, useState} from 'react'

import {SubmitEvent} from '../types'
import {checkFilterQuerySync, getFlatSuggestionsList} from '../utils'
import {useFilter} from '.'
import {useFilterQuery} from './FilterQueryContext'
import {useSuggestions} from './SuggestionsContext'

interface InputContext {
  caretRef: React.RefObject<HTMLSpanElement>
  inputFocused: boolean
  inputKeyDown: React.KeyboardEventHandler<Element>
  inputOnCompositionStart: React.CompositionEventHandler<Element>
  inputOnCompositionEnd: React.CompositionEventHandler<Element>
  inputOnChange: React.ChangeEventHandler<Element>
  inputOnFocus: React.FocusEventHandler<Element>
  inputOnBlur: React.FocusEventHandler<Element>
  inputRef: React.RefObject<HTMLInputElement>
  inputSelectionEnd: number
  inputSelectionStart: number
  inputValue: string
  updateStyledInputBlockCount: (count: number) => void
  suspendFocus: (element: HTMLElement) => void
  updateInputSelection: (selectionStart: number, selectionEnd?: number) => void
}

export const InputContext = createContext<InputContext | undefined>(undefined)

export const useInput = () => {
  const context = useContext(InputContext)
  if (!context) {
    throw new Error('useInput must be used inside a InputContext')
  }

  return context
}

interface InputContextProviderProps {
  caretRef: React.RefObject<HTMLSpanElement> | null
  children: React.ReactNode
  inputRef: React.RefObject<HTMLInputElement> | null
  value: string
}

export type InputContextRef = {
  updateCaretPosition: (start: number, end?: number) => void
  caretStart: number
  caretEnd: number
  isComposing: boolean
  inputHasFocus: boolean
  styledInputBlockCount: number
  updateRawFilterValue: (value: string) => void
}

export const InputContextProvider = forwardRef<InputContextRef, InputContextProviderProps>(
  (
    {caretRef: forwardedCaretRef = null, children, inputRef: forwardedInputRef = null, value: externalValue = ''},
    ref,
  ) => {
    const caretRef = useRef<HTMLSpanElement>(null)
    useRefObjectAsForwardedRef(forwardedCaretRef, caretRef)
    const inputRef = useRef<HTMLInputElement>(null)
    useRefObjectAsForwardedRef(forwardedInputRef, inputRef)
    const [isInteractingWithSuggestions, setIsInteractingWithSuggestions] = useState(false)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const [inputSelectionStart, setInputSelectionStart] = useState(-1)
    const [inputSelectionEnd, setInputSelectionEnd] = useState(-1)

    const isComposing = useRef<boolean>(false)
    const [filterValue, setFilterValue] = useState(externalValue)

    const styledInputBlockCount = useRef<number>(0)

    const {
      hideSuggestions,
      suggestionGroups: suggestions,
      activeSuggestion,
      setActiveSuggestion,
      suggestionsVisible,
      suggestionSelected,
      updateSuggestions,
    } = useSuggestions()
    const {forceReparse, onSubmit, rawFilterRef, updateFilter} = useFilterQuery()
    const {config} = useFilter()

    const updateInputSelection = useCallback((selectionStart: number, selectionEnd?: number | null) => {
      setInputSelectionStart(selectionStart)
      setInputSelectionEnd(selectionEnd ?? selectionStart)
    }, [])

    useImperativeHandle(ref, () => ({
      caretStart: inputSelectionStart,
      caretEnd: inputSelectionEnd,
      isComposing: isComposing.current,
      inputHasFocus: isInputFocused,
      styledInputBlockCount: styledInputBlockCount.current,
      updateCaretPosition: updateInputSelection,
      updateRawFilterValue,
    }))

    const inputKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (isComposing.current) return

        const flatSuggestions = getFlatSuggestionsList(suggestions)

        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          hideSuggestions()
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        } else if (event.key === 'ArrowDown') {
          if (activeSuggestion + 1 >= flatSuggestions.length) {
            setActiveSuggestion(-1)
          } else {
            setActiveSuggestion(activeSuggestion + 1)
          }
          event.preventDefault()
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        } else if (event.key === 'ArrowUp') {
          // If the current suggestion is the top of the list, then move to the end
          if (activeSuggestion < 0) {
            setActiveSuggestion(flatSuggestions.length - 1)
          } else {
            setActiveSuggestion(activeSuggestion - 1)
          }
          event.preventDefault()
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        } else if (event.key === 'Enter') {
          if (suggestionsVisible && activeSuggestion !== null) {
            const suggestion = flatSuggestions[activeSuggestion]
            if (suggestion) {
              event.preventDefault()
              suggestionSelected(suggestion)
              inputRef.current?.focus()
            } else {
              onSubmit(SubmitEvent.ExplicitSubmit)
            }
          } else {
            onSubmit(SubmitEvent.ExplicitSubmit)
          }
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        } else if (event.key === 'Escape') {
          hideSuggestions()
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        } else if (event.key === 'Home' || event.key === 'End') {
          setActiveSuggestion(-1)
        }
      },
      [
        activeSuggestion,
        hideSuggestions,
        onSubmit,
        setActiveSuggestion,
        suggestionSelected,
        suggestions,
        suggestionsVisible,
      ],
    )

    const inputOnFocus = useCallback(() => {
      setIsInputFocused(true)
      if (isInteractingWithSuggestions) {
        setIsInteractingWithSuggestions(false)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        forceReparse(-1, async query => {
          if (checkFilterQuerySync(query, rawFilterRef?.current)) await updateSuggestions(query, inputSelectionStart)
        })
      }
    }, [isInteractingWithSuggestions, forceReparse, rawFilterRef, updateSuggestions, inputSelectionStart])

    const inputOnBlur = useCallback(() => {
      if (isInteractingWithSuggestions) {
        return
      }
      setIsInputFocused(false)
      forceReparse(-1)
      hideSuggestions()
    }, [isInteractingWithSuggestions, forceReparse, hideSuggestions])

    // Input composition events for use with IME keyboards (e.g. Japanese, Chinese character composition)
    const inputOnCompositionStart: React.CompositionEventHandler = useCallback(() => {
      isComposing.current = true
      hideSuggestions()
    }, [hideSuggestions])

    const inputOnCompositionEnd: React.CompositionEventHandler = useCallback(() => {
      isComposing.current = false
    }, [])

    const inputOnChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
      e => {
        // Prevent the input from getting into an infinite loop
        if (e.currentTarget.value === filterValue) return

        setFilterValue(e.currentTarget.value)

        e.preventDefault()
        const caretStartIndex = config.variant !== 'button' ? e.currentTarget.selectionStart ?? -1 : -1
        const caretEndIndex = config.variant !== 'button' ? e.currentTarget.selectionEnd ?? -1 : -1

        updateFilter(e.currentTarget.value, caretStartIndex, query => {
          void updateSuggestions(query, caretStartIndex)
        })

        updateInputSelection(caretStartIndex, caretEndIndex)
      },
      [config.variant, updateFilter, updateInputSelection, updateSuggestions, filterValue],
    )

    const updateRawFilterValue = useCallback(
      (value: string) => {
        if (value === filterValue) return

        setFilterValue(value)
        updateFilter(value, -1)
      },
      [filterValue, updateFilter],
    )

    const updateStyledInputBlockCount = useCallback((count: number) => {
      styledInputBlockCount.current = count
    }, [])

    const suspendFocus = useCallback(() => {
      setIsInteractingWithSuggestions(true)
    }, [])

    const inputContextValue = useMemo<InputContext>(
      () => ({
        caretRef,
        inputFocused: isInputFocused,
        inputKeyDown,
        inputOnBlur,
        inputOnCompositionStart,
        inputOnCompositionEnd,
        inputOnChange,
        inputOnFocus,
        inputRef,
        inputSelectionEnd,
        inputSelectionStart,
        inputValue: filterValue,
        suspendFocus,
        updateInputSelection,
        updateStyledInputBlockCount,
      }),
      [
        isInputFocused,
        inputKeyDown,
        inputOnBlur,
        inputOnCompositionStart,
        inputOnCompositionEnd,
        inputOnChange,
        inputOnFocus,
        inputSelectionEnd,
        inputSelectionStart,
        filterValue,
        suspendFocus,
        updateInputSelection,
        updateStyledInputBlockCount,
      ],
    )

    return <InputContext.Provider value={inputContextValue}>{children}</InputContext.Provider>
  },
)

InputContextProvider.displayName = 'InputContextProvider'
