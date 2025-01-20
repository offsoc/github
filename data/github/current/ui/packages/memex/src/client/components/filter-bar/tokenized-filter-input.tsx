import type {TestIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {FilterIcon, type Icon} from '@primer/octicons-react'
import {Box, Octicon} from '@primer/react'
import {type HTMLAttributes, memo, useCallback, useImperativeHandle, useRef, useState} from 'react'
import {flushSync} from 'react-dom'

import {shortcutFromEvent, SHORTCUTS} from '../../helpers/keyboard-shortcuts'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useIsFocusWithinElements} from '../../hooks/use-is-focus-within-elements'
import {ClearFilterButton} from './clear-filter-button'
import {FilterBar} from './filter-bar'
import {FilterContainer} from './filter-container'
import {FilterCounterLabel} from './filter-counter-label'
import {FilterInputActions} from './filter-input-actions'
import {FilterInputContainer} from './filter-input-container'
import {FilterSuggestions, type SuggestionOptionsProps} from './filter-suggestions'
import {FILTER_INPUT_LIST_ID, RawFilterInput} from './raw-filter-input'
import {TokenizedQuery} from './tokenized-query'
import {TokenizedQueryContainer} from './tokenized-query-container'

export type TokenizedFilterInputProps = {
  height: number | string
  /**
   * An optional ref for the container
   */
  containerRef?: React.Ref<HTMLDivElement | null>
  /**
   * An optional prop to make the container visible or not.
   *
   * Defaults to true
   */
  visible?: boolean
  /**
   * An optional click handler for the filter icon
   */
  onFilterIconButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * The value of the input. It will be parsed and displayed as colored
   * tokens, as well as populate the input
   */
  value: string
  /**
   * A handler for the input change event
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * An optional handler for the input value change, used specifically for the new Filter component
   */
  onChangeValue?: (value: string) => void
  /**
   * A function that immediately updates the query, replacing it with whatever
   * the call is passed
   */
  setValueFromSuggestion: (value: string) => void
  /**
   * A handler for the input keydown event
   */
  onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  /**
   * A handler for the input focus event
   */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  /**
   * A handler for the input blur event
   */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  /**
   * A ref for the input, optional
   */
  inputRef?: React.RefObject<HTMLInputElement | null>
  /**
   * When given, a count of results is displayed to the right of the input.
   */
  filterCount?: number | null | undefined

  /**
   * When given, a clear button is displayed to the right of the input (and filter count, if it exists).
   */
  onClearButtonClick?: React.MouseEventHandler<HTMLButtonElement> | undefined
  /**
   * A handler for keydown events on the clear button
   */
  onClearButtonKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void

  /**
   * An optional handler for the reset changes button, when passed the button will be shown
   */
  onResetChanges?: (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void
  /**
   * An optional handler for the save changes button, when passed the button will be shown
   */
  onSaveChanges?: (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void

  saveButtonText?: string

  hideSuggestions?: boolean
  hideSaveButton?: boolean
  hideResetChangesButton?: boolean
  hideCounterLabel?: boolean

  // The icon to use for the filter button
  filterIconButtonIcon?: Icon
  onInputClick?: (e: React.MouseEvent<HTMLInputElement>) => void
} & Partial<SuggestionOptionsProps> &
  TestIdProps &
  Pick<HTMLAttributes<HTMLInputElement>, 'aria-describedby'>

const iconSx = {color: 'fg.subtle'}
export const TokenizedFilterInput = memo<React.PropsWithChildren<TokenizedFilterInputProps>>(
  function TokenizedFilterInput({
    height,
    containerRef: givenContainerRef,
    value,
    onChange,
    onChangeValue,
    onInputKeyDown,
    onFocus,
    onBlur,
    inputRef: givenInputRef,
    filterCount,
    onClearButtonClick,
    onClearButtonKeyDown,
    onResetChanges,
    onSaveChanges,
    setValueFromSuggestion,
    saveButtonText,
    suggestColumns = true,
    showColumnSuggestionIf,
    hideSuggestions = false,
    filterIconButtonIcon = FilterIcon,
    hideSaveButton = false,
    hideCounterLabel = false,
    hideResetChangesButton = false,
    children,
    onInputClick,
    ...props
  }) {
    const {memex_table_without_limits} = useEnabledFeatures()

    const inputRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(givenInputRef, () => inputRef.current)

    const containerRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(givenContainerRef, () => containerRef.current)

    const suggestionsListRef = useRef<HTMLUListElement>(null)

    const isFocusWithin = useIsFocusWithinElements<HTMLElement>([suggestionsListRef, inputRef, containerRef])

    const isClearButtonVisible = Boolean(value && (onClearButtonClick || onClearButtonKeyDown))

    const [areFilterSuggestionsVisible, setAreFilterSuggestionsVisible] = useState(isFocusWithin)

    useLayoutEffect(() => {
      setAreFilterSuggestionsVisible(isFocusWithin && value.trim().length > 0)
    }, [isFocusWithin, value])

    const onInputKeyDownRef = useTrackingRef(onInputKeyDown)
    const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
      e => {
        switch (shortcutFromEvent(e)) {
          case SHORTCUTS.ESCAPE: {
            if (areFilterSuggestionsVisible) {
              setAreFilterSuggestionsVisible(false)
              return
            }
            onInputKeyDownRef.current?.(e)
            return
          }
          case SHORTCUTS.ARROW_DOWN: {
            if (areFilterSuggestionsVisible) {
              return
            }
            onInputKeyDownRef.current?.(e)
            return
          }
          case SHORTCUTS.TAB: {
            if (value.length > 0) return
            if (areFilterSuggestionsVisible) {
              setAreFilterSuggestionsVisible(false)
            }
            onInputKeyDownRef.current?.(e)
            return
          }
        }
      },
      [areFilterSuggestionsVisible, onInputKeyDownRef, setAreFilterSuggestionsVisible, value.length],
    )

    const handleResetChanges: React.MouseEventHandler<HTMLButtonElement> = useCallback(
      event => {
        event.stopPropagation()
        flushSync(() => {
          onResetChanges?.(event)
        })
        inputRef.current?.focus()
      },
      [onResetChanges],
    )

    const handleSaveChanges: React.MouseEventHandler<HTMLButtonElement> = useCallback(
      event => {
        event.stopPropagation()
        flushSync(() => {
          onSaveChanges?.(event)
        })
        inputRef.current?.focus()
      },
      [onSaveChanges],
    )

    const handleClearButtonClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
      event => {
        event.preventDefault()
        event.stopPropagation()
        // we need to clear before we focus the input, since otherwise this can race
        flushSync(() => {
          onClearButtonClick?.(event)
        })
        inputRef.current?.focus()
      },
      [onClearButtonClick],
    )

    const onIconContainerClick = useCallback(() => {
      inputRef.current?.focus()
    }, [])

    const useNewFilterComponent = memex_table_without_limits && onChangeValue

    return (
      <FilterContainer {...props}>
        {useNewFilterComponent ? (
          <Box sx={{display: 'flex', position: 'relative', width: '100%', minHeight: 32}}>
            {/* The Filter component doesn't currently respect height passed in via style prop */}
            {/* This might be an issue when it eventually gets adopted outside of project views */}
            <FilterBar value={value} onChange={onChangeValue} />
            <Box
              sx={{
                // This z-index should be lower than OmnibarContainer's
                zIndex: 6,
                position: 'absolute',
                right: 28,
                top: '2px',
                // This should be `${height - 4}px` if the Filter component respects the height prop
                // Subtract 4px to account for regular & focus border
                // For now, the Filter component's height is set to 32px
                height: 28,
                paddingLeft: 2,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme => `${theme.colors.canvas.default}`,
              }}
            >
              <FilterCounterLabel hideCounterLabel={hideCounterLabel} filterCount={filterCount} />
            </Box>
          </Box>
        ) : (
          <FilterInputContainer ref={containerRef}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div onClick={onIconContainerClick}>
              <Octicon sx={iconSx} icon={filterIconButtonIcon} />
            </div>

            <TokenizedQueryContainer>
              <TokenizedQuery
                query={value}
                suggestColumns={suggestColumns}
                showColumnSuggestionIf={showColumnSuggestionIf}
              />
              <RawFilterInput
                areFilterSuggestionsVisible={areFilterSuggestionsVisible}
                onKeyDown={handleInputKeyDown}
                ref={inputRef}
                onChange={onChange}
                value={value}
                onBlur={onBlur}
                onFocus={onFocus}
                onClick={onInputClick}
                {...props}
              />
            </TokenizedQueryContainer>

            <Box sx={trailingActionSx}>
              <FilterCounterLabel hideCounterLabel={hideCounterLabel} filterCount={filterCount} />
              <ClearFilterButton
                onClick={isClearButtonVisible ? handleClearButtonClick : undefined}
                onKeyDown={onClearButtonKeyDown}
              />
            </Box>
          </FilterInputContainer>
        )}
        <FilterInputActions
          hideSaveButton={hideSaveButton}
          hideResetChangesButton={hideResetChangesButton}
          onResetChanges={onResetChanges ? handleResetChanges : undefined}
          onSaveChanges={onSaveChanges && !hideSaveButton ? handleSaveChanges : undefined}
          saveButtonText={saveButtonText}
        >
          {children}
        </FilterInputActions>

        {!hideSuggestions && !useNewFilterComponent ? (
          <FilterSuggestions
            testId={FILTER_INPUT_LIST_ID}
            ref={suggestionsListRef}
            filterInputRef={inputRef}
            anchorRef={containerRef}
            query={value}
            setQuery={setValueFromSuggestion}
            suggestColumns={suggestColumns}
            showColumnSuggestionIf={showColumnSuggestionIf}
            areFilterSuggestionsVisible={areFilterSuggestionsVisible}
            setAreFilterSuggestionsVisible={setAreFilterSuggestionsVisible}
          />
        ) : null}
      </FilterContainer>
    )
  },
)

const trailingActionSx = {display: 'flex', alignItems: 'center'} as const
