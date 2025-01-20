import {testIdProps} from '@github-ui/test-id-props'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef, useCallback} from 'react'

import {themeGetSx} from '../../helpers/theme-get-sx'
import {Resources} from '../../strings'
import {AutosizeTextInput} from '../common/autosize-text-input'
import {BorderlessTextInput} from '../common/borderless-text-input'

interface RawFilterInputProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  /**
   * Whether or not we're currently showing filter suggestions - used for aria expanded state
   */
  areFilterSuggestionsVisible: boolean
}

function stopEvent(e: React.MouseEvent<HTMLInputElement>) {
  e.stopPropagation()
  e.preventDefault()
}

export const FILTER_INPUT_LIST_ID = 'search-suggestions-box'
export const FILTER_BAR_INPUT_ID = 'filter-bar-input'

export const RawFilterInput = forwardRef<HTMLInputElement, RawFilterInputProps>(function RawFilterInput(
  {areFilterSuggestionsVisible, value, onChange, onKeyDown, onFocus, onBlur, onClick, disabled, ...props},
  forwardedRef,
) {
  const handleClick: React.MouseEventHandler<HTMLInputElement> = useCallback(
    e => {
      stopEvent(e)
      onClick?.(e)
    },
    [onClick],
  )
  return (
    <AutosizeTextInput
      as={BorderlessTextInput}
      role="combobox"
      id={FILTER_BAR_INPUT_ID}
      aria-haspopup="listbox"
      aria-expanded={areFilterSuggestionsVisible}
      aria-autocomplete="list"
      aria-controls={FILTER_INPUT_LIST_ID}
      aria-label={Resources.filterByKeyboardOrByField}
      name="Filter"
      value={value}
      disabled={disabled}
      onChange={onChange}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={Resources.filterByKeyboardOrByField}
      autoComplete="off"
      autoCorrect="false"
      autoCapitalize="false"
      spellCheck="false"
      {...testIdProps('filter-bar-input')}
      ref={forwardedRef}
      tabIndex={0}
      sx={textInputSx}
      containerSx={containerSx}
      {...props}
    />
  )
})

const containerSx = {minWidth: '100%', height: '100%'}
const textInputSx: BetterSystemStyleObject = {
  position: 'relative',
  display: 'flex',
  resize: 'none',
  outline: 'none',
  border: '0px',
  width: '100%',
  padding: '0px',
  background: 'transparent',
  overflow: 'hidden',
  overflowX: 'auto',
  color: 'transparent',
  minWidth: '100%',
  caretColor: themeGetSx('colors.fg.default'),
  fontSize: 1,
  flex: 1,
  height: '100%',
  maxHeight: 'unset',
  '&::-webkit-autofill, &::-webkit-contacts-auto-fill-button, &::-webkit-credentials-auto-fill-button': {
    visibility: 'hidden',
    display: 'none !important',
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },
}
