import {useRefObjectAsForwardedRef, useResizeObserver} from '@primer/react'
import {addDays, addMonths, addYears, eachDayOfInterval, isAfter, isBefore, isEqual, setDate} from 'date-fns'
import {createContext, type RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'

import {
  type AnchorElement,
  type CloseGesture,
  type ConfirmCloseAction,
  type DatePickerContext,
  type InternalRangeSelection,
  type InternalSelection,
  isCompleteRangeSelection,
  isMultiSelection,
  isRangeSelection,
  isSingleSelection,
  type OpenGesture,
  type RangeEnd,
  type SelectionModifiers,
  type SubmitGesture,
} from '../types'
import {clamp, closestWeekday, getFocusDate, isBetween, sanitizeDate, sanitizeSelection} from '../utils/functions'
import {fitRange} from '../utils/range'
import type {DatePickerProps} from './DatePicker'
import type {DatePickerTextInput} from './Input'

const Context = createContext<DatePickerContext | null>(null)

export const useDatePickerContext = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useDatePickerContext must be used inside a DatePickerProvider')
  }
  return context
}

export type DatePickerProviderProps = DatePickerProps & {
  children?: React.ReactNode
  forwardedAnchorRef: React.ForwardedRef<AnchorElement>
  // Using Omit<> to remove these from the type of DatePickerProps would also drop the variant-specific props like maxSelections
  anchoredOverlayProps?: undefined
  configuration?: undefined
}

export const DatePickerProvider = ({
  children,
  anchor: externalAnchor = 'button',
  anchorClassName,
  forwardedAnchorRef,
  confirmation: externalConfirmation = false,
  confirmUnsavedClose = false,
  compressedHeader = false,
  dateFormat = 'short',
  disabled,
  disableWeekends = false,
  iconPlacement = 'start',
  maxDate: externalMaxDate,
  minDate: externalMinDate,
  showTodayButton = true,
  showClearButton = false,
  view: externalView = '1-month',
  weekStartsOn = 'Sunday',
  open: externalOpen,
  onClose: externalOnClose,
  onOpen: externalOnOpen,
  placeholder = 'Choose Date...',
  value: unsanitizedExternalValue,
  showInputs: externalShowInputs = true,
  ...variantSpecificProps // keep the props that depend on the discriminated union together so they can remain type-safe
}: DatePickerProviderProps) => {
  const externalValue = useMemo(() => sanitizeSelection(unsanitizedExternalValue), [unsanitizedExternalValue])

  /**
   * Send an onChange event to the outside world. If the `selection` type does not match
   * the variant of this datepicker, the event will be ignored.
   */
  const onChange = useCallback(
    (selection: InternalSelection) => {
      if (!variantSpecificProps.onChange) return

      if (!variantSpecificProps.variant && isSingleSelection(selection)) {
        variantSpecificProps.onChange(selection)
      } else if (variantSpecificProps.variant === 'single' && isSingleSelection(selection)) {
        variantSpecificProps.onChange(selection)
      } else if (variantSpecificProps.variant === 'multi' && isMultiSelection(selection)) {
        variantSpecificProps.onChange(selection)
      } else if (variantSpecificProps.variant === 'range' && isCompleteRangeSelection(selection)) {
        variantSpecificProps.onChange(selection)
      }
    },
    // eslint wants variantSpecificProps in the deps array, but that object is rebuilt on every render.
    // It wants that because the 'this' context of the onChange call can get outdated otherwise (it's wierd),
    // but the `this` context is already unusable in arrow function components anyway so it's not really a concern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variantSpecificProps.variant, variantSpecificProps.onChange],
  )

  // Previous Selections for reverting
  const [previousSelection, setPreviousSelection] = useState<InternalSelection | undefined>(externalValue)

  const [selection, _setSelection] = useState<InternalSelection>(externalValue)
  const [isDirty, setIsDirty] = useState(false)
  const setSelection = useCallback((s: InternalSelection) => {
    _setSelection(s)
    // do not consider half-complete range selection to be 'dirty'
    setIsDirty(s === null || !isRangeSelection(s) || s.to !== null)
  }, [])

  const [hoverRange, setHoverRange] = useState<InternalRangeSelection | null>(null)
  // Current viewing month(s)
  const [currentViewingDate, setCurrentViewingDate] = useState(getFocusDate(externalValue) ?? sanitizeDate(new Date()))
  // Whether the device supports multi-month viewing
  const [multiMonthSupport, setMultiMonthSupport] = useState(true)
  const [confirmingCloseGesture, setConfirmingCloseGesture] = useState<CloseGesture | undefined>(undefined)

  const confirmation = externalConfirmation || confirmUnsavedClose

  const maxDate = useMemo(() => {
    if (!externalMaxDate) return
    const sanitized = sanitizeDate(externalMaxDate)
    return disableWeekends ? closestWeekday(sanitized, 'backward') : sanitized
  }, [externalMaxDate, disableWeekends])

  const minDate = useMemo(() => {
    if (!externalMinDate) return
    const sanitized = sanitizeDate(externalMinDate)
    return disableWeekends ? closestWeekday(sanitized, 'forward') : sanitized
  }, [externalMinDate, disableWeekends])

  const view = multiMonthSupport ? externalView : '1-month'

  // Control for focus for both keyboard and mouse
  const [focusDate, _setFocusDate] = useState(currentViewingDate)
  // Keep focused date in view
  const setFocusDate = useCallback(
    (newFocusDate: Date) => {
      setCurrentViewingDate(prevViewingDate => {
        if (view === '1-month') {
          if (
            prevViewingDate.getMonth() === newFocusDate.getMonth() &&
            prevViewingDate.getFullYear() === newFocusDate.getFullYear()
          ) {
            return prevViewingDate
          } else {
            return setDate(newFocusDate, 1)
          }
        }

        /**
         * This logic is rough, so buckle up.
         * We want to set the currently shown months based on what has focus. If the focus leaves what we're able to view,
         * we want to be able to change the currently shown month. However, this gets complicated with the 2-month view.
         * FIRST: If it's the same month/year: Easy
         * SECOND: If it's the next month, but same year: Done
         * THIRD: If it's the next month AND next year, but it's January (i.e. we're viewing Dec/Jan): Good to go
         */
        if (
          (prevViewingDate.getMonth() === newFocusDate.getMonth() &&
            prevViewingDate.getFullYear() === newFocusDate.getFullYear()) ||
          (addMonths(prevViewingDate, 1).getMonth() === newFocusDate.getMonth() &&
            prevViewingDate.getFullYear() === newFocusDate.getFullYear()) ||
          (addMonths(prevViewingDate, 1).getMonth() === newFocusDate.getMonth() &&
            newFocusDate.getMonth() === 0 &&
            addYears(prevViewingDate, 1).getFullYear() === newFocusDate.getFullYear())
        ) {
          return prevViewingDate
        } else {
          return setDate(newFocusDate, 1)
        }
      })
      _setFocusDate(newFocusDate)
    },
    [view],
  )

  // Extract variant specific props to static values type-safely
  const variant = variantSpecificProps.variant ?? 'single'
  const maxRangeSize = variantSpecificProps.variant === 'range' ? variantSpecificProps.maxRangeSize : undefined
  const minRangeSize = variantSpecificProps.variant === 'range' ? variantSpecificProps.minRangeSize : undefined
  const maxSelections = variantSpecificProps.variant === 'multi' ? variantSpecificProps.maxSelections : undefined

  const showInputs = externalShowInputs && confirmation
  const [activeRangeEnd, setActiveRangeEnd] = useState<RangeEnd | null>(variant === 'range' ? 'from' : null)

  /**
   * The end of the range that can be adjusted to make the range fit within the allowed size. When inputs are enabled,
   * we adjust the other end of the range so that the user can still make changes to the current input. When inputs
   * are disabled, we adjust the current end of the range so that we stop accepting changes to indicate invalidity.
   */
  const adjustableRangeEnd = showInputs ? (activeRangeEnd === 'to' ? 'from' : 'to') : activeRangeEnd ?? 'from'

  const inputRef = useRef<DatePickerTextInput>(null)
  const focusInput = () => setTimeout(() => inputRef.current?.focus())

  // If the passed anchor is a ref object, use that instead of the internal one
  const internalAnchorRef = useRef<AnchorElement>(null)
  const [anchorRef, anchor] =
    typeof externalAnchor === 'string' || typeof externalAnchor === 'function'
      ? [internalAnchorRef, externalAnchor]
      : [externalAnchor as RefObject<AnchorElement>, null]

  useRefObjectAsForwardedRef(forwardedAnchorRef, anchorRef)

  // For external open control
  const [isOpen, setIsOpen] = useState(externalOpen ?? false)
  useEffect(() => {
    if (externalOpen !== undefined) setIsOpen(externalOpen)
  }, [externalOpen])

  const onOpen = useCallback(
    (gesture: OpenGesture) => {
      if (disabled) return
      if (externalOpen === undefined) setIsOpen(true)
      externalOnOpen?.(gesture)
      focusInput()
    },
    [externalOpen, externalOnOpen, disabled],
  )

  const onClose = useCallback(
    (gesture: CloseGesture | SubmitGesture) => {
      if (externalOpen === undefined) setIsOpen(false)
      externalOnClose?.(gesture)
    },
    [externalOpen, externalOnClose],
  )

  /**
   * When the selection changes, set the focus to that date and fire the callback
   */
  useEffect(() => {
    const newFocusDate = getFocusDate(selection, activeRangeEnd)
    if (newFocusDate) setFocusDate(newFocusDate)
  }, [selection, activeRangeEnd, setFocusDate])

  useEffect(() => {
    if (JSON.stringify(externalValue) !== JSON.stringify(selection)) {
      setSelection(externalValue)
      setPreviousSelection(externalValue)
      setIsDirty(false) // do not consider external value to be 'dirty' since we're effectively reverting to it
    }
    // Only want to update when the external value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalValue])

  /**
   * Jump to a specific month/year
   */
  const goToMonth = useCallback(
    (date: Date) => {
      let newDate = date
      if (minDate && isBefore(date, minDate)) {
        newDate = minDate
      } else if (maxDate && isAfter(date, maxDate)) {
        newDate = maxDate
      }

      setCurrentViewingDate(sanitizeDate(newDate))
    },
    [minDate, maxDate],
  )

  const saveValue = useCallback(
    (updatedSelection: InternalSelection, submitGesture?: SubmitGesture) => {
      if (updatedSelection) {
        setSelection(updatedSelection)
        setPreviousSelection(updatedSelection)
      }
      setIsDirty(false)
      onChange(updatedSelection)
      if (isOpen) onClose(submitGesture ?? 'submit-click')
    },
    [onClose, onChange, setSelection, isOpen],
  )

  const saveValueHandler = useCallback(
    (updatedSelection?: InternalSelection) => {
      saveValue(updatedSelection ?? selection)
    },
    [saveValue, selection],
  )

  const revertValue = useCallback(() => {
    setSelection(previousSelection ?? null)
    setIsDirty(false)
    setActiveRangeEnd(variant === 'range' ? 'from' : null)
    focusInput()
  }, [previousSelection, variant, setSelection])

  // #region EVENT HANDLERS
  /**
   * When the datepicker attempts to close, if confirmUnsavedChanges is enabled, this will fire the modal
   */
  const closeHandler = useCallback(
    (gesture: CloseGesture) => {
      // Already confirming another close. This happens when the user clicks the confirm dialog, which is outside the overlay
      if (confirmingCloseGesture !== undefined) return

      if (isDirty && confirmUnsavedClose) {
        setConfirmingCloseGesture(gesture)
      } else if (isDirty && !confirmation) {
        saveValue(selection)
      } else {
        onClose(gesture)
        revertValue()
      }
    },
    [confirmingCloseGesture, isDirty, confirmUnsavedClose, confirmation, saveValue, selection, onClose, revertValue],
  )

  /**
   * Handle the confirm dialog closing (either confirming or discarding).
   */
  const confirmCloseHandler = useCallback(
    (action: ConfirmCloseAction) => {
      if (confirmingCloseGesture === undefined) return

      if (action === 'confirm') {
        // Ignores the real close gesture and closes with 'submit' gesture instead
        saveValue(selection)
      } else {
        onClose(confirmingCloseGesture)
        revertValue()
      }

      setConfirmingCloseGesture(undefined)
    },
    [confirmingCloseGesture, saveValue, onClose, revertValue, selection],
  )

  /**
   * This handles input when using a text input
   */
  const inputHandler = useCallback(
    (updatedSelection: InternalSelection) => {
      let newSelection: InternalSelection | undefined

      switch (variant) {
        case 'single': {
          if (!(updatedSelection instanceof Date)) break

          newSelection = clamp(updatedSelection, {minDate, maxDate})
          break
        }
        case 'multi': {
          if (!isMultiSelection(updatedSelection)) break

          newSelection = (updatedSelection ?? [])
            .filter(d => isBetween(d, {minDate, maxDate}))
            .slice(-(maxSelections ?? 0))

          break
        }
        case 'range': {
          if (!isRangeSelection(updatedSelection) || updatedSelection === null) break

          newSelection = fitRange(updatedSelection, {
            maxDate,
            minDate,
            maxRangeSize,
            minRangeSize,
            adjustableRangeEnd,
            disableWeekends,
          })
          break
        }
      }

      if (newSelection) {
        // Save if user is typing in input anchor without opening picker
        if (isOpen) setSelection(newSelection)
        else saveValue(newSelection)
      }
    },
    [
      maxDate,
      minDate,
      variant,
      maxSelections,
      maxRangeSize,
      minRangeSize,
      isOpen,
      saveValue,
      setSelection,
      adjustableRangeEnd,
      disableWeekends,
    ],
  )

  const clearSelectionHandler = useCallback(() => {
    setSelection(null)
    saveValue(null)
  }, [setSelection, saveValue])

  /**
   * Handles all selection events, both keyboard and mouse related
   * @param preserveFocus If true, user focus will not be reset when selecting. This is useful
   * for keyboard users, especially when range selection would auto-move focus to the end-date
   * input box.
   */
  const selectionHandler = useCallback(
    (date: Date, modifiers: SelectionModifiers, preserveFocus = false, submitGesture?: SubmitGesture) => {
      if (variant === 'multi' && isMultiSelection(selection)) {
        let targetDates = [date]

        // We mimic the File Explorer selection behavior here. If the user is holding shift, we select all dates and
        // if user is holding shift and ctrl/cmd, ctrl/cmd takes precedence and we add the selected date.
        if (modifiers.range && !modifiers.multiple) {
          const lastSelectedDate = selection?.[selection.length - 1] || focusDate
          const isForward = isAfter(date, lastSelectedDate)
          const shiftedFocusDate = addDays(lastSelectedDate, 0)
          const interval = isForward ? {start: shiftedFocusDate, end: date} : {start: date, end: shiftedFocusDate}
          targetDates = eachDayOfInterval(interval)
          // Reverse the dates so the clicked date ends up focused. eachDayOfInterval does not support backward
          // intervals so we couldn't just build the interval in reverse.
          if (!isForward) targetDates.reverse()
        }

        const selections = modifiers.multiple && selection ? [...selection] : []

        for (const d of targetDates) {
          const existingIndex = selections.findIndex(s => isEqual(s, d))

          if (existingIndex > -1) {
            selections.splice(existingIndex, 1)
          } else {
            if (isBetween(date, {minDate, maxDate})) selections.push(d)
          }
        }
        setSelection(selections.slice(-(maxSelections ?? 0)))
      } else if (variant === 'range' && isRangeSelection(selection)) {
        // If the user clicks on one of the range ends (and there is a complete range already selected),
        // activate that range end instead of updating the selection
        if (selection?.to && isEqual(selection.from, date)) {
          setActiveRangeEnd('from')
          focusInput()
          return
        } else if (selection?.to && isEqual(selection.to, date)) {
          setActiveRangeEnd('to')
          focusInput()
          return
        }

        const attemptedSelection =
          activeRangeEnd === 'to' && selection
            ? {from: selection.from, to: date}
            : {from: date, to: showInputs ? selection?.to ?? null : null}

        const corrected = fitRange(attemptedSelection, {
          minDate,
          maxDate,
          maxRangeSize,
          minRangeSize,
          disableWeekends,
          adjustableRangeEnd,
        })

        const nextActiveRangeEnd = activeRangeEnd === 'to' && selection ? 'from' : 'to'

        setHoverRange(corrected.to ? null : {from: corrected.from, to: null})
        setSelection(corrected)
        setActiveRangeEnd(nextActiveRangeEnd)

        if (!confirmation && corrected.to) {
          saveValue(corrected)
        } else if (!preserveFocus) {
          focusInput()
        }
      } else {
        setSelection(date)

        if (!confirmation) {
          saveValue(date, submitGesture)
        } else if (!preserveFocus) {
          focusInput()
        }
      }
    },
    [
      selection,
      focusDate,
      setSelection,
      maxSelections,
      minDate,
      maxDate,
      adjustableRangeEnd,
      activeRangeEnd,
      showInputs,
      maxRangeSize,
      minRangeSize,
      disableWeekends,
      confirmation,
      saveValue,
      variant,
    ],
  )

  /**
   * Handler for hover events
   */
  const hoverHandler = useCallback(
    (date: Date) => {
      if (!selection) return
      if (variant === 'range' && isRangeSelection(selection) && hoverRange && !showInputs) {
        setHoverRange(
          fitRange(
            {from: selection.from, to: date},
            {minDate, maxDate, maxRangeSize, minRangeSize, adjustableRangeEnd, disableWeekends},
          ),
        )
      }
    },
    [
      disableWeekends,
      hoverRange,
      maxDate,
      maxRangeSize,
      minRangeSize,
      minDate,
      selection,
      variant,
      showInputs,
      adjustableRangeEnd,
    ],
  )
  // #endregion

  /**
   * Callback for when the window resizes
   * @param windowEntry The window observer object
   */
  const onResize = ([windowEntry]: Array<{contentRect: DOMRect}>) => {
    if (!windowEntry) return
    // Only care about the first element, we expect one element ot be watched
    const {width} = windowEntry.contentRect
    // 610 is the panel width with 2 months
    setMultiMonthSupport(width > 640)
  }
  useResizeObserver(onResize)

  const providerValue = useMemo(
    () => ({
      configuration: {
        anchor,
        anchorClassName,
        confirmation,
        confirmUnsavedClose,
        compressedHeader,
        dateFormat,
        disabled,
        disableWeekends,
        iconPlacement,
        maxDate,
        minDate,
        placeholder,
        showInputs,
        showTodayButton,
        showClearButton,
        view,
        weekStartsOn,
        variant,
      },
      activeRangeEnd,
      setActiveRangeEnd,
      anchorRef,
      close: closeHandler,
      confirmingClose: confirmingCloseGesture !== undefined,
      currentViewingDate,
      focusDate,
      goToMonth,
      hoverRange,
      inputRef,
      isDirty,
      isOpen,
      onClearSelection: clearSelectionHandler,
      onConfirmClose: confirmCloseHandler,
      onDateHover: hoverHandler,
      onDateInput: inputHandler,
      onDateSelection: selectionHandler,
      open: onOpen,
      saveValue: saveValueHandler,
      selection,
      selectionActive: false,
      setFocusDate,
      setHoverRange,
    }),
    [
      activeRangeEnd,
      anchor,
      anchorRef,
      anchorClassName,
      clearSelectionHandler,
      closeHandler,
      compressedHeader,
      confirmCloseHandler,
      confirmUnsavedClose,
      confirmation,
      confirmingCloseGesture,
      currentViewingDate,
      dateFormat,
      disableWeekends,
      disabled,
      focusDate,
      goToMonth,
      hoverHandler,
      hoverRange,
      iconPlacement,
      inputHandler,
      isDirty,
      isOpen,
      maxDate,
      minDate,
      onOpen,
      placeholder,
      saveValueHandler,
      selection,
      selectionHandler,
      setFocusDate,
      showClearButton,
      showInputs,
      showTodayButton,
      variant,
      view,
      weekStartsOn,
    ],
  )

  return (
    // We don't memoize the context object because it would change on almost every render
    // anyway. Better would be for consuming components to unpack the values directly.
    <Context.Provider value={providerValue}>{children}</Context.Provider>
  )
}
