import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  isFriday,
  isMonday,
  isSaturday,
  isSunday,
  isWeekend,
  nextFriday,
  nextMonday,
  nextSaturday,
  previousFriday,
  previousMonday,
  previousSunday,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns'

import {useDatePickerContext} from '../components/Provider'
import {clamp, sanitizeDate} from '../utils/index'

/**
 * Returns a function that accepts a date and a keyboard event and returns the date that
 * should be the new value (if the keyboard event is a valid shortcut, otherwise returns
 * `null`).
 *
 * Requires `DatePickerContext` to be available.
 */
export const useShortcutCalculator = () => {
  const {
    configuration: {minDate, maxDate, disableWeekends},
  } = useDatePickerContext()

  return (fromDate: Date, event: React.KeyboardEvent | KeyboardEvent) => {
    let newDate: Date | null = null

    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    switch (event.key) {
      case 'ArrowRight': {
        // Increase selection by 1 day
        newDate = addDays(fromDate, 1)
        if (disableWeekends && isWeekend(newDate)) {
          newDate = nextMonday(newDate)
        }
        break
      }
      case 'ArrowLeft': {
        // Decrease selection by 1 day
        newDate = subDays(fromDate, 1)
        if (disableWeekends && isWeekend(newDate)) {
          newDate = previousFriday(newDate)
        }
        break
      }
      case 'ArrowUp': {
        // Decrease selection by 1 week
        newDate = subWeeks(fromDate, 1)
        break
      }
      case 'ArrowDown': {
        // Increase selection by 1 week
        newDate = addWeeks(fromDate, 1)
        break
      }
      case 'Home': {
        // Go to beginning of the week
        if (disableWeekends) {
          newDate = isMonday(fromDate) ? fromDate : previousMonday(fromDate)
        } else {
          newDate = isSunday(fromDate) ? fromDate : previousSunday(fromDate)
        }
        break
      }
      case 'End': {
        // Go to end of the week
        if (disableWeekends) {
          newDate = isFriday(fromDate) ? fromDate : nextFriday(fromDate)
        } else {
          newDate = isSaturday(fromDate) ? fromDate : nextSaturday(fromDate)
        }
        break
      }
      case 'PageUp': {
        // Decrease 1 Month, or with Shift, 1 year
        newDate = event.shiftKey ? subYears(fromDate, 1) : subMonths(fromDate, 1)
        break
      }
      case 'PageDown': {
        // Increase 1 Month, or with Shift, 1 year
        newDate = event.shiftKey ? addYears(fromDate, 1) : addMonths(fromDate, 1)
        break
      }
    }

    // The date should still be sanitized since we only add multiples of 1 day, but dates are never logical
    return newDate && sanitizeDate(clamp(newDate, {minDate, maxDate}))
  }
}
