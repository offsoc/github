import {KeyboardKey} from '@github-ui/keyboard-key'
import {useSelectAll} from '@github-ui/use-select-all'
import {ValidationErrorPopover} from '@github-ui/validation-error-popover'
import {CalendarIcon, CheckIcon, XIcon} from '@primer/octicons-react'
import {
  FormControl,
  IconButton,
  Octicon,
  TextInput,
  type TextInputProps,
  TextInputWithTokens,
  type TokenProps,
  useRefObjectAsForwardedRef,
} from '@primer/react'
import {clsx} from 'clsx'
import {isAfter, isBefore, isEqual, isWeekend} from 'date-fns'
import {forwardRef, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState} from 'react'

import {useOnAnchorAction, useShortcutCalculator} from '../hooks/index'
import {DateResources} from '../strings.en-us'
import {type AnchorElement, isMultiSelection, isRangeSelection, isSingleSelection} from '../types'
import {formatDate, getDateFormat, parseDate} from '../utils/parser'
import {HiddenDescription} from './HiddenDescription'
import styles from './Input.module.css'
import {useDatePickerContext} from './Provider'

interface CalendarButtonProps {
  Component: React.ComponentType<unknown>
  position: 'start' | 'end'
}

interface UseFreeformDateInputProps {
  value: Date | null
  onChange: (value: Date | null) => void
  calendarButton?: CalendarButtonProps
}

interface ValidityProps {
  status?: 'error' | 'success'
  message?: string
}

const ValidityIndicator = ({status}: ValidityProps) => {
  if (status === 'success') {
    return <Octicon icon={CheckIcon} className={styles.successIcon} />
  } else if (status === 'error') {
    return <Octicon icon={XIcon} className={styles.dangerIcon} />
  } else {
    return null
  }
}

/**
 * Generate props for an input where the user can type anything, but `onChange` will only
 * be called when the user has typed a valid date.
 */
const useFreeformDateInput = (
  {value, onChange, calendarButton}: UseFreeformDateInputProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
): {
  inputProps: Partial<TextInputProps & React.RefAttributes<HTMLInputElement>>
  format: (date: Date) => string
  resetText: () => void
  inputRef: React.RefObject<HTMLInputElement>
  validity: ValidityProps
  isFocused: () => boolean
} => {
  const inputRef = useRef<HTMLInputElement>(null)
  useRefObjectAsForwardedRef(forwardedRef, inputRef)

  const {
    configuration: {dateFormat, minDate, maxDate, disableWeekends},
  } = useDatePickerContext()

  /** Either the user's custom format function or the default formatter. */
  const format = useCallback(
    (date: Date | null) => (date ? formatDate(date, getDateFormat(dateFormat)) : ''),
    [dateFormat],
  )

  const [validity, setValidity] = useState<ValidityProps>({})
  const clearValidity = () => setValidity({})

  /** User-inputted raw (unparsed) input value. */
  const [text, setText] = useState(format(value))
  const resetText = () => {
    setText(format(value))
    clearValidity()
  }

  // activeElement will be null if nothing is focused
  const isFocused = useCallback(
    () => inputRef.current !== null && document.activeElement === inputRef.current,
    [inputRef],
  )

  const parse = useCallback((s: string) => parseDate(s, [dateFormat]), [dateFormat])

  /**
   * We need to parse as the user types to show their results in realtime. But if we overwrite
   * their input as they type (ie, change 2/22/22 => Feb 2, 2022) they will get frustrated, so
   * we only update if not focused or if the incoming value is different from what's typed.
   */
  useEffect(() => {
    setText(current => (!isFocused() || parse(current)?.valueOf() !== value?.valueOf() ? format(value) : current))
  }, [value, format, isFocused, parse])

  const changeHandler = ({target}: React.ChangeEvent<HTMLInputElement>) => {
    setText(target.value)

    if (!target.value) {
      setValidity({})
      onChange(null)
      return
    }

    const parsed = parse(target.value)

    if (!parsed) {
      setValidity({status: 'error'})
      onChange(null)
    } else if (minDate && isBefore(parsed, minDate)) {
      setValidity({status: 'error', message: DateResources.beforeMinDate(minDate)})
      onChange(null)
    } else if (maxDate && isAfter(parsed, maxDate)) {
      setValidity({status: 'error', message: DateResources.afterMaxDate(maxDate)})
      onChange(null)
    } else if (disableWeekends && isWeekend(parsed)) {
      setValidity({status: 'error', message: DateResources.weekend})
      onChange(null)
    } else {
      setValidity({status: 'success'})
      onChange(parsed)
    }
  }

  const onFocus = useCallback(() => {
    if (text) {
      setValidity({status: 'success'})
    } else {
      setValidity({})
    }
  }, [text, setValidity])

  const ValidIcon: React.ComponentType = () => <ValidityIndicator {...validity} />
  const [leadingVisual, trailingVisual] =
    calendarButton?.position === 'end' ? [ValidIcon, calendarButton.Component] : [calendarButton?.Component, ValidIcon]

  return {
    inputProps: {
      value: text,
      onChange: changeHandler,
      onFocus,
      onBlur: () => clearValidity(),
      ref: inputRef,
      leadingVisual,
      trailingVisual,
      validationStatus: validity.status === 'error' ? 'error' : undefined,
      'aria-invalid': validity.status === 'error',
    },
    format,
    resetText,
    inputRef,
    validity,
    isFocused,
  }
}

type SingleDateInputProps = {
  value: Date | null
  onChange: (value: Date) => void
  onFocus?: () => void
  placeholder?: string
  'aria-label'?: string
  fullWidth?: boolean
  disableShortcuts?: boolean
  activeRangeEnd?: boolean
  calendarButton?: {
    Component: React.ComponentType<unknown>
    position: 'start' | 'end'
  }
  disabled?: boolean
  className?: string
}

const SingleDateInput = forwardRef<HTMLInputElement, SingleDateInputProps>(
  (
    {
      value,
      onChange,
      placeholder,
      'aria-label': ariaLabel,
      onFocus,
      fullWidth,
      disableShortcuts = false,
      calendarButton,
      activeRangeEnd = false,
      className,
      disabled,
    },
    forwardedRef,
  ) => {
    const {inputProps, resetText, inputRef, validity} = useFreeformDateInput(
      {value, onChange: d => d && onChange(d), calendarButton},
      forwardedRef,
    )

    /**
     * In arrow key mode, all text is always selected and the arrow keys can be used to
     * increment/decrement the value. Typing or clicking again exits arrow key mode.
     */
    const arrowKeyModeRef = useRef(false)
    const selectAll = useSelectAll(inputRef)
    // Needs to be in a timeout to select all after the value of the input is set, or the selection will clear when value changes
    setTimeout(() => {
      // Querying arrowKeyModeRef.current here inside the timeout allows cancelling the select all
      // on blur to avoid refocusing the input(in Safari). This is why we use ref instead of state.
      if (arrowKeyModeRef.current) selectAll()
    })

    const calculateShortcut = useShortcutCalculator()
    const keyDownHandler = (e: React.KeyboardEvent) => {
      if (e.defaultPrevented || !arrowKeyModeRef.current || !value) return

      const newValue = calculateShortcut(value, e)
      if (newValue) {
        e.preventDefault()
        onChange(newValue)
        resetText()
      }
    }

    const descriptionId = useId()
    const errorId = useId()

    return (
      <div
        className={clsx(
          styles.singleDateInputContainer,
          fullWidth && styles.fullWidth,
          calendarButton && styles.hasCalendarButton,
        )}
      >
        <TextInput
          {...inputProps}
          onFocus={e => {
            inputProps.onFocus?.(e)
            if (!disableShortcuts) arrowKeyModeRef.current = true
            onFocus?.()
          }}
          onBlur={e => {
            arrowKeyModeRef.current = false
            inputProps.onBlur?.(e)
            resetText()
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            inputProps.onChange?.(e)
            arrowKeyModeRef.current = false
          }}
          onKeyDown={keyDownHandler}
          // Order is onMouseDown -> onFocus -> onClick -> onMouseUp, so mouseDown will set false and then
          // focus will set true, unless it was already focused in which case it will stay false.
          // This lets the user click again inside the input to exit arrow key mode.
          onMouseDown={() => (arrowKeyModeRef.current = false)}
          onMouseUp={() => {
            // Sometimes if the user moves their mouse slightly on the initial click, the browser will treat it
            // as selecting text and then we won't have all text selected, so we have to re-trigger selectAll.
            if (arrowKeyModeRef.current) selectAll()
          }}
          size="small"
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-describedby={descriptionId}
          aria-errormessage={errorId}
          ref={inputRef}
          className={clsx(styles.singleDateInput, activeRangeEnd && styles.activeRangeEnd, className)}
          disabled={disabled}
        />
        <ValidationErrorPopover id={errorId} message={validity.message} position="above" />
        <HiddenDescription id={descriptionId}>
          {!disableShortcuts ? DateResources.shortcutInputDescription : DateResources.dateInputDescription}
        </HiddenDescription>
      </div>
    )
  },
)

SingleDateInput.displayName = 'SingleDateInput'

type MultiDateInputProps = {
  value: Date[]
  onChange: (value: Date[]) => void
  onDateClick: (value: Date) => void
  fullWidth?: boolean
  calendarButton?: CalendarButtonProps
  isAnchor?: boolean
  disabled?: boolean
  className?: string
}

const MultiDateInput = forwardRef<HTMLInputElement, MultiDateInputProps>(
  ({value, onChange, fullWidth, onDateClick, calendarButton, isAnchor, className, disabled}, forwardedRef) => {
    const [typedDate, setTypedDate] = useState<Date | null>(null)

    const clearInput = () => {
      setTypedDate(null)
      resetText()
    }

    const addTypedDate = () => {
      if (!typedDate) return

      onChange(value.filter(d => !isEqual(d, typedDate)).concat(typedDate))
      clearInput()
    }

    const keyDownHandler = (event: React.KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.key === 'Enter' && typedDate) {
        event.preventDefault()
        addTypedDate()
      }
    }

    const {inputProps, format, resetText, validity} = useFreeformDateInput(
      {
        value: typedDate,
        onChange: setTypedDate,
        calendarButton,
      },
      forwardedRef,
    )

    const tokenRemoveHandler = (dateValue: string | number) => {
      onChange(value.filter(d => d.valueOf() !== dateValue))
    }

    const tokens: TokenProps[] = useMemo(
      () =>
        value.map(date => ({
          id: date.valueOf(),
          text: format(date),
          onClick: () => onDateClick(date),
        })),
      [value, format, onDateClick],
    )

    const descriptionId = useId()
    const errorId = useId()

    const input = (
      <TextInputWithTokens
        {...inputProps}
        tokens={tokens}
        onTokenRemove={tokenRemoveHandler}
        onKeyDown={keyDownHandler}
        onBlur={e => {
          inputProps.onBlur?.(e)
          clearInput()
        }}
        className={clsx(styles.multiDateInput, className)}
        size="medium"
        aria-describedby={descriptionId}
        aria-errormessage={isAnchor ? errorId : undefined}
        disabled={disabled}
      />
    )

    return isAnchor ? (
      <div className={clsx(styles.multiDateInputContainer, styles.fullWidth)}>
        {input}
        <ValidationErrorPopover message={validity.message} id={errorId} />
        <HiddenDescription id={descriptionId}>{DateResources.dateInputDescription}</HiddenDescription>
      </div>
    ) : (
      <FormControl
        // FormControl does not support className yet (https://github.com/primer/react/issues/4823)
        // eslint-disable-next-line @github-ui/github-monorepo/no-sx
        sx={{
          width: '14ch',
          maxWidth: '100%',
          flexGrow: fullWidth ? 1 : 0,
          position: 'relative',
        }}
      >
        <FormControl.Label visuallyHidden>Selected Dates</FormControl.Label>
        {typedDate && validity.status === 'success' ? (
          <FormControl.Validation variant="success" aria-live="polite">
            Press <KeyboardKey keys="enter" format="condensed" /> to add {format(typedDate)}.
          </FormControl.Validation>
        ) : validity.status === 'error' && validity.message ? (
          <FormControl.Validation variant="error" aria-live="polite">
            {validity.message}
          </FormControl.Validation>
        ) : (
          <FormControl.Caption aria-live="polite">
            Hold <KeyboardKey keys="Mod" format="condensed" /> to click multiple dates.
          </FormControl.Caption>
        )}
        {input}
        <HiddenDescription id={descriptionId}>{DateResources.dateInputDescription}</HiddenDescription>
      </FormControl>
    )
  },
)

MultiDateInput.displayName = 'MultiDateInput'

const CalendarIconButton = ({onAction}: {onAction: (event: React.KeyboardEvent | React.MouseEvent) => void}) => (
  <IconButton
    variant="invisible"
    icon={CalendarIcon}
    aria-label="Open date picker"
    type="button"
    onClick={onAction}
    onKeyDown={onAction}
    size="small"
    className={styles.calendarIconButton}
  />
)

type DatePickerTextInputProps = {
  fullWidth?: boolean
  /** If this is used as the anchor, this ref is given to the `AnchoredOverlay` to position the overlay. */
  anchorRef?: React.ForwardedRef<AnchorElement>
  disabled?: boolean
  className?: string
}

export interface DatePickerTextInput {
  focus(): void
}

/** Internal text box(es) to show inside the datepicker panel. */
export const DatePickerTextInput = forwardRef<DatePickerTextInput, DatePickerTextInputProps>(
  ({fullWidth, anchorRef, className, disabled}, ref) => {
    const {
      selection,
      onDateInput,
      activeRangeEnd,
      setActiveRangeEnd,
      setFocusDate,
      configuration: {variant, iconPlacement},
    } = useDatePickerContext()

    const isAnchor = anchorRef !== undefined

    const firstRef = useRef<HTMLInputElement>(null)
    const secondRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => (activeRangeEnd === 'to' ? secondRef.current?.focus() : firstRef.current?.focus()),
    }))

    const onAction = useOnAnchorAction()

    const calendarButtonProps = useMemo<CalendarButtonProps | undefined>(
      () =>
        isAnchor && iconPlacement !== 'none'
          ? {
              Component: () => <CalendarIconButton onAction={onAction} />,
              position: iconPlacement,
            }
          : undefined,
      [iconPlacement, isAnchor, onAction],
    )

    const rangeEndCalendarButtonProps = useMemo<CalendarButtonProps | undefined>(
      () =>
        isAnchor && iconPlacement !== 'none'
          ? {
              Component: () => (
                <CalendarIconButton
                  onAction={event => {
                    setActiveRangeEnd('to')
                    onAction(event)
                  }}
                />
              ),
              position: iconPlacement,
            }
          : undefined,
      [iconPlacement, isAnchor, onAction, setActiveRangeEnd],
    )

    const input =
      isRangeSelection(selection) && variant === 'range' ? (
        <div ref={anchorRef} className={styles.rangeInputs}>
          <SingleDateInput
            aria-label="Start date"
            ref={firstRef}
            value={selection?.from ?? null}
            onChange={from => onDateInput({from, to: selection?.to ?? null})}
            onFocus={() => setActiveRangeEnd('from')}
            fullWidth={fullWidth}
            disableShortcuts={isAnchor}
            activeRangeEnd={!isAnchor && activeRangeEnd === 'from'}
            calendarButton={calendarButtonProps}
            className={className}
            disabled={disabled}
          />
          <span className={styles.rangeInputsSeparator}>{' - '}</span>
          <SingleDateInput
            aria-label="End date"
            ref={secondRef}
            value={selection?.to ?? null}
            onChange={to => onDateInput({from: selection?.from ?? to, to})}
            onFocus={() => setActiveRangeEnd('to')}
            fullWidth={fullWidth}
            disableShortcuts={isAnchor}
            activeRangeEnd={!isAnchor && activeRangeEnd === 'to'}
            calendarButton={rangeEndCalendarButtonProps}
            className={className}
            disabled={disabled}
          />
        </div>
      ) : isSingleSelection(selection) && variant === 'single' ? (
        <SingleDateInput
          aria-label={isAnchor ? undefined : 'Selected date'}
          ref={anchorRef ?? firstRef}
          value={selection}
          onChange={onDateInput}
          fullWidth={fullWidth}
          disableShortcuts={isAnchor}
          calendarButton={calendarButtonProps}
          className={className}
          disabled={disabled}
        />
      ) : isMultiSelection(selection) && variant === 'multi' ? (
        <MultiDateInput
          aria-label={isAnchor ? undefined : 'Selected dates'}
          ref={anchorRef ?? firstRef}
          value={selection ?? []}
          onChange={onDateInput}
          onDateClick={setFocusDate}
          fullWidth={fullWidth}
          isAnchor={isAnchor}
          calendarButton={calendarButtonProps}
          className={className}
          disabled={disabled}
        />
      ) : null

    return isAnchor ? input : <div className={styles.container}>{input}</div>
  },
)

DatePickerTextInput.displayName = 'DatePickerTextInput'
