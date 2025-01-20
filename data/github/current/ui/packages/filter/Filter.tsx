import {type TestIdProps, testIdProps} from '@github-ui/test-id-props'
import {Box, type SxProp, useResponsiveValue} from '@primer/react'
import type {ResponsiveValue} from '@primer/react/lib-esm/hooks/useResponsiveValue'
import type React from 'react'
import {useCallback, useState} from 'react'

import {AdvancedFilterDialog, type FilterButtonVariant} from './advanced-filter-dialog/AdvancedFilterDialog'
import {ClearButton} from './clear-button/ClearButton'
import {defaultFilterSettings} from './constants/defaults'
import {FilterContextProvider} from './context/RootContext'
import {FilterQuery} from './filter-query'
import {FilterInputIcon} from './FilterInputIcon'
import {FilterInputWrapper} from './FilterInputWrapper'
import {Input} from './input/Input'
import {SubmitButton} from './input/SubmitButton'
import {SuggestionsList} from './suggestions/SuggestionsList'
import type {FilterProvider, FilterSettings, FilterVariant, SubmitEvent} from './types'
import {ValidationMessage} from './ValidationMessage'

// Exports from the root of the package
export * from './constants/defaults'
export * from './filter-query'
export * from './FilterRevert'
export * from './types'
export * from './ValidationMessage'

const filterInputWrapperStyles = ({variant, onSubmit}: {variant: FilterProps['variant']; onSubmit: boolean}) => {
  const leftRounded = variant === 'input'
  const rightRounded = (variant === 'input' && !onSubmit) || (variant !== 'input' && !onSubmit)

  return {
    display: 'grid',
    gridTemplateColumns: onSubmit ? '1fr min-content' : 'min-content 1fr min-content',
    alignItems: 'center',
    pl: onSubmit ? '12px' : 1,
    pr: '1px',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'border.default',
    marginInlineEnd: -1,
    ...(leftRounded && {
      borderTopLeftRadius: 2,
      borderBottomLeftRadius: 2,
    }),
    ...(rightRounded && {
      borderTopRightRadius: 2,
      borderBottomRightRadius: 2,
    }),
    ':has(input:focus-visible)': {
      zIndex: 1,
      outline: '2px solid var(--borderColor-accent-emphasis, var(--color-accent-emphasis))',
      outlineOffset: '-2px',
    },
  }
}

export type FilterProps = {
  /** ID of the Filter Component */
  id: string
  /** Change event callback, passing the updated filter value */
  onChange?: (value: string) => void
  /** Event callback, triggered by the filter query being parsed, and passing the updated filter query request*/
  onParse?: (request: FilterQuery) => void
  /** Submit event callback, triggered by Enter or pressing Submit, and passing the updated filter query and the
   * originating event type */
  onSubmit?: (request: FilterQuery, eventType: SubmitEvent) => void
  /** Array of FilterProviders that are being used/supported */
  providers: FilterProvider[]
  /** Context to be applied for all API queries */
  context?: Record<string, string>
  /** Variant of the filter button, whether to show the title or just the icon */
  filterButtonVariant?: FilterButtonVariant
  /** Initial value to use for the input. DO NOT USE in conjuction with `filterValue`.
   * Only use this if you want the Filter to have an initial value but remain uncontrolled. */
  initialFilterValue?: string
  /** Supplied filter value to use. By using this, the Filter is externally controlled
   * and will not use it's own state. */
  filterValue?: string
  /** React Ref to the input element */
  inputRef?: React.RefObject<HTMLInputElement>
  /** Label displayed atop the Filter bar. This is only shown when `visuallyHideLabel` is `false` */
  label: string
  /** Input keydown event callback */
  onKeyDown?: React.KeyboardEventHandler<Element>
  /** Validation callback, passing the validation message and the validation query */
  onValidation?: (messages: string[], filterQuery: FilterQuery) => void
  /** Placeholder text for the input */
  placeholder?: string
  /** Settings for the Filter, such as support of the legacy No filter provider and alias matching */
  settings?: FilterSettings
  /** Whether to show any validation messages or not. If this is disabled, use `onValidation` to receive the messages to display elsewhere */
  showValidationMessage?: boolean
  /** Variant of the Filter to render. `button` or `input` for one or the other, `full` (default) renders both.  */
  variant?: FilterVariant
  /** Whether to visually hide the Label or not */
  visuallyHideLabel?: boolean
} & TestIdProps &
  SxProp

const defaultFilterQuery = new FilterQuery()

export function Filter({
  context,
  'data-testid': dataTestId,
  filterButtonVariant = 'normal',
  filterValue,
  id,
  initialFilterValue,
  inputRef,
  label,
  onChange,
  onParse,
  onSubmit,
  onKeyDown,
  onValidation,
  placeholder,
  providers,
  settings,
  showValidationMessage = true,
  sx,
  variant = 'full',
  visuallyHideLabel = true,
}: FilterProps) {
  const [validationMessage, setValidationMessage] = useState<string[]>([])
  const hasValidationMessage = showValidationMessage && validationMessage.length > 0

  const validationCallback = useCallback(
    (messages: string[] = [], filterQuery: FilterQuery = defaultFilterQuery) => {
      setValidationMessage(messages)
      onValidation?.(messages, filterQuery)
    },
    [onValidation],
  )

  const filterButtonResponsive = useResponsiveValue<ResponsiveValue<FilterButtonVariant>, FilterButtonVariant>(
    {regular: filterButtonVariant, narrow: variant === 'button' ? 'normal' : 'compact'},
    filterButtonVariant,
  )

  const externallyControlled = typeof filterValue === 'string'
  const [innerValue, setInnerValue] = useState<string>(initialFilterValue || '')

  const changeCallback = useCallback(
    (value: string) => {
      if (!externallyControlled) {
        setInnerValue(value)
      }
      onChange?.(value)
    },
    [externallyControlled, onChange],
  )

  return (
    <FilterContextProvider
      context={context}
      inputRef={inputRef}
      rawFilter={externallyControlled ? filterValue : innerValue}
      onChange={changeCallback}
      onParse={onParse}
      onSubmit={onSubmit}
      onValidation={validationCallback}
      providers={providers}
      settings={{...defaultFilterSettings, ...settings}}
      variant={variant}
    >
      <Box
        id={id}
        role="form"
        className="FormControl FormControl--fullWidth"
        sx={{...sx, gap: 0}}
        {...testIdProps(dataTestId ?? 'filter')}
      >
        <label
          id={`${id}-label`}
          htmlFor={`${id}-input`}
          className={`FormControl-label ${visuallyHideLabel ? 'sr-only' : ''}`}
          {...testIdProps('filter-bar-label')}
        >
          {label}
        </label>
        <Box sx={{display: 'grid', gap: 3, width: '100%', position: 'relative'}}>
          <FilterInputWrapper isStandalone={variant === 'button'}>
            {variant !== 'input' && (
              <AdvancedFilterDialog isStandalone={variant === 'button'} filterButtonVariant={filterButtonResponsive} />
            )}
            {variant !== 'button' && (
              <>
                <Box
                  sx={filterInputWrapperStyles({
                    variant,
                    onSubmit: !!onSubmit,
                  })}
                >
                  {!onSubmit && <FilterInputIcon />}
                  <Input
                    id={id}
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                    hasValidationMessage={hasValidationMessage}
                  />
                  <ClearButton />
                </Box>
                {onSubmit && <SubmitButton />}
              </>
            )}
          </FilterInputWrapper>
          <SuggestionsList id={id} />
          {/* This needs to move outside the Filter component because we can't predict where the consumer wants to put the error message. In memex this would go above the table view. */}
          {showValidationMessage && <ValidationMessage messages={validationMessage} id={`${id}-validation-message`} />}
        </Box>
      </Box>
    </FilterContextProvider>
  )
}
