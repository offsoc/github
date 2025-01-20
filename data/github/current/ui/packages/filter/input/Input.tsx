import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {Box} from '@primer/react'
import type React from 'react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {useInput, useSuggestions} from '../context'
import {StyledInput} from './StyledInput'

type FilterInputProps = {
  id: string
  hasValidationMessage?: boolean
  placeholder?: string
  onKeyDown?: React.KeyboardEventHandler<Element>
}

export const Input = ({
  id,
  hasValidationMessage = false,
  placeholder = 'Search or filter',
  onKeyDown,
}: FilterInputProps) => {
  const {suggestionsVisible, activeSuggestion, suggestionGroups} = useSuggestions()
  const {
    caretRef,
    inputFocused,
    inputKeyDown,
    inputOnBlur,
    inputOnCompositionStart,
    inputOnCompositionEnd,
    inputOnChange,
    inputOnFocus,
    inputRef,
    inputSelectionEnd,
    inputSelectionStart,
    inputValue,
    updateInputSelection,
  } = useInput()
  const sizerRef = useRef<HTMLDivElement>(null)
  const [inputScrollLeft, setInputScrollLeft] = useState(0)
  const styledInputContainerRef = useRef<HTMLDivElement>(null)

  const checkCursorPosition = useCallback(
    (el: HTMLInputElement) => {
      updateInputSelection(el.selectionStart ?? 0, el.selectionEnd ?? 0)
    },
    [updateInputSelection],
  )

  const onKeyDownHandler = useCallback<React.KeyboardEventHandler<HTMLInputElement>>(
    e => {
      checkCursorPosition(e.currentTarget as HTMLInputElement)
      inputKeyDown(e)
      onKeyDown?.(e)
    },
    [checkCursorPosition, inputKeyDown, onKeyDown],
  )

  const onClickHandler = useCallback<React.MouseEventHandler<HTMLInputElement>>(
    e => {
      checkCursorPosition(e.currentTarget as HTMLInputElement)
    },
    [checkCursorPosition],
  )

  const inputWidth = useMemo(() => {
    const minWidth = 100
    const currentSizerScrollWidth = sizerRef.current?.scrollWidth ?? 0
    const newInputWidth = Math.max(currentSizerScrollWidth + 2, minWidth)

    return `${newInputWidth}px`

    // This adds a subscriptions to recalculate in the event of state changes that impact the input width
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSelectionStart, sizerRef.current?.scrollWidth, inputValue])

  useLayoutEffect(() => {
    const minWidth = 100

    const cursor = caretRef.current
    const styledInputContainer = styledInputContainerRef.current

    if (cursor && styledInputContainer) {
      //If the cursor is out of view to the left
      if (cursor.offsetLeft < inputScrollLeft) {
        setInputScrollLeft(cursor.offsetLeft - styledInputContainer.clientWidth - minWidth)
        //If the cursor is out of view to the right
      } else if (cursor.offsetLeft > inputScrollLeft + styledInputContainer.clientWidth) {
        setInputScrollLeft(cursor.offsetLeft - styledInputContainer.clientWidth + minWidth)
      } else {
        styledInputContainer.scrollLeft = inputScrollLeft
      }
    }
  }, [caretRef, inputScrollLeft, inputSelectionStart, inputValue])

  const shadowInput = useMemo(() => {
    return (
      <>
        <span>{inputSelectionStart ? inputValue.substring(0, inputSelectionStart) : inputValue}</span>
        <span {...testIdProps('filter-cursor')} ref={caretRef} />
        <span>{inputSelectionStart && inputValue.substring(inputSelectionStart)}</span>
      </>
    )
  }, [caretRef, inputSelectionStart, inputValue])

  const ariaExpandedValue = useMemo(() => {
    return suggestionsVisible && suggestionGroups.some(s => s.suggestions.length > 0)
  }, [suggestionGroups, suggestionsVisible])

  useEffect(() => {
    if (inputRef.current && inputSelectionStart > -1 && inputFocused) {
      inputRef.current.selectionStart = inputSelectionStart
      inputRef.current.selectionEnd = inputSelectionEnd
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRef, inputSelectionStart, inputSelectionEnd, inputValue])

  return (
    <Box
      {...testIdProps('styled-input-container')}
      ref={styledInputContainerRef}
      tabIndex={-1}
      className="styled-input-container"
      sx={{
        position: 'relative',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        fontSize: 'inherit',
        alignItems: 'center',
        scrollbarWidth: 'none',
        flex: 1,
        alignSelf: 'stretch',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }}
    >
      <Box
        {...testIdProps('styled-input-content')}
        aria-hidden="true"
        className="styled-input-content"
        sx={{
          position: 'absolute',
          display: 'inline-flex',
          padding: 0,
          wordBreak: 'break-word',
          whiteSpace: 'pre',
          userSelect: 'none',
          flex: 1,
        }}
      >
        {/* This is a visual-only component and is intentionally hidden from screen readers.
        It will use the Input below instead */}
        <StyledInput />
      </Box>
      <Box {...testIdProps('filter-input-wrapper')} sx={{height: '30px', width: '100%', alignSelf: 'stretch'}}>
        <Box
          {...testIdProps('filter-sizer')}
          ref={sizerRef}
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: 0,
            overflow: 'scroll',
            whiteSpace: 'pre',
            visibility: 'hidden',
          }}
        >
          {shadowInput}
        </Box>
        <Box
          id={`${id}-input`}
          as="input"
          role="combobox"
          aria-expanded={ariaExpandedValue}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls={`${id}-results`}
          aria-activedescendant={
            activeSuggestion !== null && activeSuggestion !== -1 && suggestionsVisible
              ? `suggestion-${activeSuggestion}`
              : undefined
          }
          aria-describedby={hasValidationMessage ? `${id}-validation-message` : ''}
          placeholder={placeholder}
          ref={inputRef}
          value={inputValue}
          onFocus={inputOnFocus}
          onBlur={inputOnBlur}
          onCompositionStart={inputOnCompositionStart}
          onCompositionEnd={inputOnCompositionEnd}
          onKeyDown={onKeyDownHandler}
          onClick={onClickHandler}
          onChange={inputOnChange}
          name={`${id}-inputname`}
          autoComplete="off"
          spellCheck="false"
          sx={{
            height: '30px',
            width: inputWidth,
            position: 'relative',
            display: 'flex',
            minWidth: '100%',
            p: 0,
            overflowX: 'auto',
            overflowY: 'hidden',
            color: 'transparent',
            resize: 'none',
            background: 'transparent',
            border: 0,
            caretColor: 'var(--fgColor-default, var(--color-fg-default))',
            ':focus': {
              outline: 'none',
              boxShadow: 'none !important',
            },
          }}
          {...testIdProps('filter-input')}
        />
      </Box>
    </Box>
  )
}
