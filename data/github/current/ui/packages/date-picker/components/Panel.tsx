import {isMacOS} from '@github-ui/get-os'
import {testIdProps} from '@github-ui/test-id-props'
import {type Direction, FocusKeys} from '@primer/behaviors'
import {ChevronLeftIcon, ChevronRightIcon} from '@primer/octicons-react'
import {Button, Octicon, useFocusZone} from '@primer/react'
import {addMonths, format, isAfter, isBefore, subMonths} from 'date-fns'
import {type ReactNode, useCallback, useId, useMemo, useRef} from 'react'
import {flushSync} from 'react-dom'

import {useShortcutCalculator} from '../hooks/index'
import {DateResources} from '../strings.en-us'
import type {Months} from '../types'
import {sanitizeDate} from '../utils/functions'
import {HiddenDescription} from './HiddenDescription'
import {DatePickerTextInput} from './Input'
import {Month} from './Month'
import styles from './Panel.module.css'
import {useDatePickerContext} from './Provider'

const months: Months[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getDateElement = (panelRef: React.RefObject<HTMLDivElement>, date: Date) =>
  panelRef.current?.querySelector<HTMLElement>(`[data-date="${format(date, 'MM/dd/yyyy')}"]`) ?? undefined

const getFirstEnabledDate = (panelRef: React.RefObject<HTMLDivElement>) =>
  panelRef.current?.querySelector<HTMLElement>('[data-date][aria-disabled="false"]') ?? undefined

export const DatePickerPanel = () => {
  const {
    configuration: {
      minDate,
      maxDate,
      confirmation,
      view,
      showTodayButton: configShowTodayButton,
      showClearButton,
      compressedHeader,
      showInputs,
      variant,
    },
    isDirty,
    saveValue,
    currentViewingDate,
    goToMonth,
    onClearSelection,
    onDateHover,
    setFocusDate,
    inputRef,
    focusDate,
    activeRangeEnd,
  } = useDatePickerContext()
  const panelRef = useRef(null)
  const datePanelRef = useRef<HTMLDivElement>(null)

  const calculateShortcutDate = useShortcutCalculator()

  const getNextFocusable = useCallback(
    (_: Direction, from: Element | undefined, event: KeyboardEvent): HTMLElement | undefined => {
      const rawFromDate = from?.getAttribute('data-date')
      const fromDate = sanitizeDate(rawFromDate ? new Date(rawFromDate) : new Date())
      const newDate = calculateShortcutDate(fromDate, event) ?? fromDate

      onDateHover(newDate)

      // setFocusDate updates the view to ensure the new date is visible. Thus we need flushSync to ensure that the
      // new date element is visible and rendered before we can look for it and focus it.
      flushSync(() => setFocusDate(newDate))

      return getDateElement(panelRef, newDate)
    },
    [calculateShortcutDate, onDateHover, setFocusDate],
  )

  useFocusZone(
    {
      containerRef: datePanelRef,
      bindKeys: FocusKeys.ArrowAll | FocusKeys.HomeAndEnd | FocusKeys.PageUpDown,
      focusInStrategy: () => getDateElement(panelRef, focusDate) ?? getFirstEnabledDate(panelRef),
      getNextFocusable,
    },
    [getNextFocusable, focusDate],
  )

  const previousDisabled = useMemo(() => {
    if (!minDate) return false

    const previous = subMonths(currentViewingDate, 1)
    return minDate.getFullYear() >= previous.getFullYear() && minDate.getMonth() > previous.getMonth()
  }, [minDate, currentViewingDate])

  const nextDisabled = useMemo(() => {
    if (!maxDate) return false

    const next = addMonths(currentViewingDate, view === '2-month' ? 2 : 1)
    return maxDate.getFullYear() <= next.getFullYear() && maxDate.getMonth() < next.getMonth()
  }, [maxDate, view, currentViewingDate])

  const showTodayButton = useMemo(() => {
    if (!configShowTodayButton) return false
    const today = sanitizeDate(new Date())
    if (minDate && isAfter(minDate, today)) return false
    if (maxDate && isBefore(maxDate, today)) return false
    return true
  }, [maxDate, minDate, configShowTodayButton])

  const showApplyButton = confirmation

  const currentMonth = useMemo(() => currentViewingDate.getMonth(), [currentViewingDate])
  const currentYear = useMemo(() => currentViewingDate.getFullYear(), [currentViewingDate])

  const headerSelectionHandler = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const int = parseInt(e.currentTarget.value, 10)
      if (e.currentTarget.id === 'picker-header-year') {
        goToMonth(new Date(int, currentMonth))
      } else {
        goToMonth(new Date(currentYear, int))
      }
    },
    [currentMonth, currentYear, goToMonth],
  )

  const getMonthPicker = useMemo(() => {
    let filteredMonths = months
    const monthElements: ReactNode[] = []
    if (minDate && currentYear === minDate.getFullYear()) {
      filteredMonths = filteredMonths.filter(month => months.indexOf(month) >= minDate.getMonth())
    }
    if (maxDate && currentYear === maxDate.getFullYear()) {
      filteredMonths = filteredMonths.filter(month => months.indexOf(month) <= maxDate.getMonth())
    }
    for (const month of filteredMonths) {
      monthElements.push(
        <option className={styles.option} key={month} value={months.indexOf(month)}>
          {month}
        </option>,
      )
    }

    return (
      <select
        id="picker-header-month"
        onChange={headerSelectionHandler}
        className={styles.picker}
        value={currentMonth}
        aria-label="Go to month"
      >
        {monthElements}
      </select>
    )
  }, [minDate, maxDate, currentMonth, currentYear, headerSelectionHandler])

  const getYearPicker = useMemo(() => {
    const years: ReactNode[] = []
    const todaysYear = sanitizeDate(new Date()).getFullYear()
    const minYear = minDate ? minDate.getFullYear() : todaysYear - 200
    const maxYear = maxDate ? maxDate.getFullYear() : todaysYear + 200
    for (let i = minYear; i <= maxYear; i++) {
      years.push(
        <option className={styles.option} key={i} value={i}>
          {i}
        </option>,
      )
    }

    return (
      <select
        className={styles.picker}
        id="picker-header-year"
        onChange={headerSelectionHandler}
        value={currentYear}
        aria-label="Go to year"
      >
        {years}
      </select>
    )
  }, [minDate, maxDate, currentYear, headerSelectionHandler])

  // The date calculation is cheap, but memoizing it preserves the date object reference
  // to avoid unnecessary re-rendering of the second month and its Day children.
  const secondMonthDate = useMemo(
    () => (view === '2-month' ? addMonths(currentViewingDate, 1) : null),
    [view, currentViewingDate],
  )

  const showButtons = showClearButton || showTodayButton || showApplyButton

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Submit on ctrl/cmd+enter, but not when variant is multi because ctrl/cmd+enter is there used to add multiple dates
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    const modifierKey = isMacOS() ? event.metaKey : event.ctrlKey
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (isDirty && modifierKey && event.key === 'Enter' && variant !== 'multi') {
      event.stopPropagation()
      saveValue()
    }
  }

  const goToToday = useCallback(() => {
    setFocusDate(sanitizeDate(new Date()))
  }, [setFocusDate])

  const clearDate = useCallback(() => {
    onClearSelection()
  }, [onClearSelection])

  const descriptionId = useId()

  const description =
    variant === 'single'
      ? DateResources.monthSingleDescription
      : variant === 'multi'
        ? DateResources.monthMultiDescription(isMacOS())
        : variant === 'range' && activeRangeEnd !== null
          ? DateResources.monthRangeDescription[activeRangeEnd]
          : ''

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={styles.container} ref={panelRef} onKeyDown={handleKeyDown} {...testIdProps('datepicker-panel')}>
      <header className={styles.topNav}>
        {compressedHeader && (
          <div {...testIdProps('datepicker-compressed-header')} className={styles.pickers}>
            {getMonthPicker}
            {getYearPicker}
          </div>
        )}
        <Button
          size="small"
          className={styles.arrowButton}
          onClick={() => goToMonth(subMonths(currentViewingDate, 1))}
          disabled={previousDisabled}
          aria-label="Go to previous month"
          {...testIdProps('previous-button')}
        >
          <Octicon icon={ChevronLeftIcon} className={styles.icon} />
        </Button>
        <Button
          size="small"
          className={styles.arrowButton}
          onClick={() => goToMonth(addMonths(currentViewingDate, 1))}
          disabled={nextDisabled}
          aria-label="Go to next month"
          {...testIdProps('next-button')}
        >
          <Octicon icon={ChevronRightIcon} className={styles.icon} />
        </Button>
      </header>

      <div className={styles.months} ref={datePanelRef}>
        <HiddenDescription id={descriptionId}>{description}</HiddenDescription>

        <Month date={currentViewingDate} aria-describedby={descriptionId} />
        {secondMonthDate && <Month date={secondMonthDate} aria-describedby={descriptionId} />}
      </div>

      {(showButtons || showInputs) && (
        <footer className={styles.footer}>
          {(view === '1-month' || !showButtons || variant === 'multi') && showInputs && (
            <div className={styles.footerRow}>
              <DatePickerTextInput ref={inputRef} fullWidth />
            </div>
          )}
          {showButtons && (
            <div className={styles.footerRow}>
              <div className={styles.footerButtons}>
                {showClearButton && (
                  <Button
                    variant="invisible"
                    size="small"
                    onClick={clearDate}
                    aria-label="Clear selected date"
                    disabled={!currentViewingDate}
                  >
                    Clear
                  </Button>
                )}
                {showTodayButton && (
                  <Button
                    variant="invisible"
                    size="small"
                    onClick={goToToday}
                    aria-label="Go to today's date"
                    disabled={
                      currentViewingDate.getFullYear() === new Date().getFullYear() &&
                      currentViewingDate.getMonth() === new Date().getMonth()
                    }
                  >
                    Today
                  </Button>
                )}
              </div>
              {view === '2-month' && showInputs && variant !== 'multi' && <DatePickerTextInput ref={inputRef} />}
              {showApplyButton && (
                <Button
                  variant="primary"
                  size="small"
                  disabled={!isDirty}
                  onClick={() => saveValue()}
                  aria-label="Apply selection and close"
                  type="submit"
                  {...testIdProps('datepicker-apply')}
                >
                  Apply
                </Button>
              )}
            </div>
          )}
        </footer>
      )}
    </div>
  )
}
