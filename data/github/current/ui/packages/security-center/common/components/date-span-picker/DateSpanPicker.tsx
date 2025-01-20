import {DatePicker, type RangeSelection} from '@github-ui/date-picker'
import {CalendarIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Octicon, Text} from '@primer/react'
import {differenceInCalendarDays} from 'date-fns'
import React, {useCallback, useMemo, useState} from 'react'

import {useClickLogging} from '../../hooks/use-click-logging'
import {humanReadableDate} from '../../utils/date-formatter'
import {calculateDateRangeFromPeriod, type Period, type PeriodOptions} from '../../utils/date-period'

export type DateSpan = RangeSelection | Period
interface DateSpanPickerProps {
  maxDate: Date
  minDate: Date
  onChange: (selection: DateSpan) => void
  selectedValue: DateSpan
}

export function isPeriodSelection(selection: object): selection is Period {
  return (
    'period' in selection &&
    typeof selection.period === 'string' &&
    periodToLabel.find(opt => opt.value === selection.period) != null
  )
}

export function isRangeSelection(selection: object): selection is RangeSelection {
  return 'to' in selection && 'from' in selection && selection.to instanceof Date && selection.from instanceof Date
}

export function toDateSpan(dateSpan: DateSpan | {from: string; to: string}): DateSpan {
  if (isPeriodSelection(dateSpan)) {
    return dateSpan
  }

  return {
    from: new Date(dateSpan.from),
    to: new Date(dateSpan.to),
  }
}

export function dateSpansAreEqual(dateSpan1: DateSpan, dateSpan2: DateSpan): boolean {
  if (isPeriodSelection(dateSpan1)) {
    return isPeriodSelection(dateSpan2) && dateSpan1.period === dateSpan2.period
  }

  return isRangeSelection(dateSpan2) && dateSpan1.from === dateSpan2.from && dateSpan1.to === dateSpan2.to
}

const periodToLabel: Array<{value: PeriodOptions; label: string}> = [
  {value: 'last14days', label: 'Last 14 days'},
  {value: 'last30days', label: 'Last 30 days'},
  {value: 'last90days', label: 'Last 90 days'},
]

const DatePickerNonInteractiveAnchor = React.forwardRef(
  ({children}: React.PropsWithChildren<unknown>, ref: React.ForwardedRef<HTMLDivElement>): JSX.Element => {
    return <div ref={ref}>{children}</div>
  },
)
DatePickerNonInteractiveAnchor.displayName = 'DatePickerNonInteractiveAnchor'

function utcToLocalDateRange(range: RangeSelection): RangeSelection {
  return {
    from: new Date(range.from.getUTCFullYear(), range.from.getUTCMonth(), range.from.getUTCDate()),
    to: new Date(range.to.getUTCFullYear(), range.to.getUTCMonth(), range.to.getUTCDate()),
  }
}

function localToUTCDateRange(range: RangeSelection): RangeSelection {
  return {
    from: new Date(Date.UTC(range.from.getFullYear(), range.from.getMonth(), range.from.getDate())),
    to: new Date(Date.UTC(range.to.getFullYear(), range.to.getMonth(), range.to.getDate())),
  }
}

function MenuButton({value}: {value: DateSpan}): JSX.Element {
  let buttonText: string | undefined
  let ariaValue: string | undefined
  if (isRangeSelection(value)) {
    buttonText = [value.from, value.to].map(date => humanReadableDate(date)).join(' - ')
    ariaValue = [value.from, value.to].map(date => humanReadableDate(date, {includeYear: true})).join(' to ')
  } else {
    const option = periodToLabel.find(opt => opt.value === value.period)
    buttonText = option?.label
    ariaValue = buttonText
  }

  const defaultText = 'Choose period...'
  let ariaLabel = defaultText
  if (ariaValue) {
    ariaLabel += ` Currently selected: ${ariaValue}`
  }

  return (
    <ActionMenu.Button aria-label={ariaLabel} data-testid="date-span-picker-button">
      <Text sx={{display: 'flex'}}>
        <div data-testid="date-span-picker-calendar-icon">
          <Octicon icon={CalendarIcon} sx={{mr: 2, color: 'fg.muted'}} />
        </div>
        {buttonText || defaultText}
      </Text>
    </ActionMenu.Button>
  )
}

export function DateSpanPicker({maxDate, minDate, onChange, selectedValue}: DateSpanPickerProps): JSX.Element {
  const {logClick} = useClickLogging({category: 'DateSpanPicker'})

  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [datePickerIsOpen, setDatePickerIsOpen] = useState(false)

  const openDatePicker = useCallback(() => setDatePickerIsOpen(true), [])
  const closeDatePicker = useCallback(() => setDatePickerIsOpen(false), [])

  const datePickerOnChange = useCallback(
    (selection: RangeSelection | null) => {
      if (selection) {
        // The date picker returns the chosen dates using the user's timezone.
        // So we create new dates using the same year, month, and day but in UTC.
        onChange(localToUTCDateRange(selection))
        closeDatePicker()

        const span = differenceInCalendarDays(selection.to, selection.from) + 1
        logClick({action: 'select date range', label: `spans ${span} day${span > 1 ? 's' : ''}`})
      }
    },
    [onChange, closeDatePicker, logClick],
  )
  const datePickerValue = useMemo(() => {
    return utcToLocalDateRange(
      isRangeSelection(selectedValue) ? selectedValue : calculateDateRangeFromPeriod(selectedValue),
    )
  }, [selectedValue])

  const onMenuOpenChange = useCallback(
    (open: boolean) => {
      setMenuIsOpen(open)
      if (open) {
        // Needed to close the date picker if a user clicks on the menu button while the date picker is open since
        // we're nestling the menu button within the date picker's anchor element.
        closeDatePicker()
      }
    },
    [closeDatePicker],
  )

  return (
    <DatePicker
      anchor={props => {
        return (
          <DatePickerNonInteractiveAnchor {...props}>
            <ActionMenu open={menuIsOpen} onOpenChange={onMenuOpenChange}>
              {
                // Calling as a function instead of rendering as a Component
                // so ActionMenu.Button is a direct child of ActionMenu and gets decorated by ActionMenu with the correct aria attributes.
                MenuButton({value: selectedValue})
              }
              <ActionMenu.Overlay>
                <ActionList selectionVariant="single">
                  {periodToLabel.map(({value, label}) => (
                    <ActionList.Item
                      key={value}
                      value={value}
                      selected={isPeriodSelection(selectedValue) && selectedValue.period === value}
                      onSelect={e => {
                        onChange({period: value})
                        setMenuIsOpen(false) // Since we use 'e.preventDefault()' below, we need to manually close the menu
                        logClick({action: 'select period', label: label.toLowerCase()})
                        e.preventDefault() // Avoid page scroll when pressing space to select item
                      }}
                    >
                      {label}
                    </ActionList.Item>
                  ))}
                  <ActionList.Item
                    selected={isRangeSelection(selectedValue)}
                    onSelect={e => {
                      openDatePicker()
                      setMenuIsOpen(false) // Since we use 'e.preventDefault()' below, we need to manually close the menu
                      logClick({action: 'open date range picker'})
                      e.preventDefault() // Avoid page scroll when pressing space to select item
                    }}
                  >
                    Date range...
                  </ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </DatePickerNonInteractiveAnchor>
        )
      }}
      dateFormat="long"
      maxDate={maxDate}
      minDate={minDate}
      onOpen={openDatePicker}
      onClose={closeDatePicker}
      onChange={datePickerOnChange}
      open={datePickerIsOpen}
      value={datePickerValue}
      variant="range"
    />
  )
}
