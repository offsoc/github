import {isMacOS} from '@github-ui/get-os'
import {testIdProps} from '@github-ui/test-id-props'
import {clsx} from 'clsx'
import {format, isAfter, isBefore, isEqual, isToday, isWeekend} from 'date-fns'
import {useCallback, useMemo} from 'react'

import {isMultiSelection, isRangeSelection} from '../types'
import {rangeSide} from '../utils/range'
import styles from './Day.module.css'
import {useDatePickerContext} from './Provider'

export type DayProps = {
  onAction?: (date: Date, event?: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void
  date: Date
}

export const Day = ({date, onAction}: DayProps) => {
  const {
    configuration: {disableWeekends, minDate, maxDate, variant, showInputs},
    hoverRange,
    selection,
    onDateHover,
    onDateSelection,
    activeRangeEnd,
  } = useDatePickerContext()

  const today = isToday(date)

  /** Actual selected state; determines accessible state + label regardless of range preview. */
  const selected = useMemo(() => {
    switch (true) {
      case !selection:
        return false
      case isMultiSelection(selection):
        return selection.some(d => isEqual(d, date))
      case isRangeSelection(selection):
        return rangeSide(date, selection) ?? false
      default:
        return isEqual(date, selection)
    }
  }, [date, selection])

  /**
   * Preview state; overrides selected styling to help users visualize the range they are selecting. Does not affect
   * accessible state or label.
   */
  const previewSelected = useMemo(() => {
    if (!hoverRange) return selected
    return rangeSide(date, hoverRange) ?? false
  }, [date, hoverRange, selected])

  const disabled = useMemo(
    () =>
      (minDate ? isBefore(date, minDate) : false) ||
      (maxDate ? isAfter(date, maxDate) : false) ||
      (disableWeekends ? isWeekend(date) : false),
    [date, minDate, maxDate, disableWeekends],
  )

  const mouseDownHandler = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Prevent focus from leaving the inputs
      if (showInputs) event.preventDefault()
    },
    [showInputs],
  )

  const actionHandler = useCallback(
    (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }

      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      const modifiers = {range: event.shiftKey, multiple: isMacOS() ? event.metaKey : event.ctrlKey}
      if ('key' in event) {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if ([' ', 'Enter'].includes(event.key)) {
          onDateSelection(date, modifiers, true, 'submit-key-press')
          onAction?.(date, event)
          event.preventDefault()
        }
      } else {
        onDateSelection(date, modifiers)
        onAction?.(date, event)
      }
    },
    [disabled, onDateSelection, onAction, date],
  )

  const label = useMemo(() => {
    const todayLabel = today ? ' (Today)' : ''
    // No need for selected label if not range because aria-selected will already indicate boolean state
    const selectedLabel =
      selected === 'from'
        ? ' (Start of selected range)'
        : selected === 'to'
          ? ' (End of selected range)'
          : selected === 'middle'
            ? ' (Inside selected range)'
            : ''
    const minMaxLabel =
      minDate && isEqual(date, minDate)
        ? ' (Minimum allowed date)'
        : maxDate && isEqual(date, maxDate)
          ? ' (Maximum allowed date)'
          : ''
    return `${format(date, 'EEEE, MMMM d')}${todayLabel}${minMaxLabel}${selectedLabel}`
  }, [today, date, selected, minDate, maxDate])

  return (
    <div
      aria-disabled={disabled}
      aria-selected={selected !== false}
      aria-label={label}
      data-date={format(date, 'MM/dd/yyyy')}
      data-disabled={disabled ? 'true' : undefined}
      {...testIdProps(`day-${format(date, 'MM/dd/yyyy')}`)}
      onClick={actionHandler}
      onMouseDown={mouseDownHandler}
      onKeyDown={actionHandler}
      onMouseEnter={() => onDateHover(date)}
      role="gridcell"
      tabIndex={-1}
      className={clsx(styles.day, {
        [styles.today]: today,
        [styles.selected]: !!previewSelected,
        [styles.range]: variant === 'range',
        [styles.activeRangeEnd]: previewSelected === activeRangeEnd,
        [styles.rangeFrom]: previewSelected === 'from',
        [styles.rangeMiddle]: previewSelected === 'middle',
        [styles.rangeTo]: previewSelected === 'to',
      })}
    >
      <span className={styles.date}>{date.getDate()}</span>
    </div>
  )
}

export const BlankDay = () => <div role="gridcell" className={styles.day} />

export const WeekdayHeaderDay = ({date}: {date: Date}) => (
  <div
    role="columnheader"
    className={clsx(styles.day, styles.header)}
    aria-label={format(date, 'EEEE')}
    {...testIdProps('weekday-header')}
  >
    {format(date, 'EEEEEE')}
  </div>
)
