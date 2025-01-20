import {testIdProps} from '@github-ui/test-id-props'
import {clsx} from 'clsx'
import {eachDayOfInterval, endOfWeek, format, getDaysInMonth, lastDayOfMonth, startOfWeek} from 'date-fns'
import chunk from 'lodash-es/chunk'
import {type ReactNode, useId, useMemo} from 'react'

import type {DayNumber, DayOfWeek} from '../types'
import {BlankDay, Day, WeekdayHeaderDay} from './Day'
import styles from './Month.module.css'
import {useDatePickerContext} from './Provider'

const weekdayEnum: Record<DayOfWeek, DayNumber> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

export interface MonthProps {
  date: Date
  'aria-describedby': string
}

export const Month = ({date, 'aria-describedby': descriptionId}: MonthProps) => {
  const {
    configuration: {weekStartsOn, compressedHeader, variant},
  } = useDatePickerContext()
  const title = useMemo(() => format(date, 'MMMM yyyy'), [date])

  const weekdayHeaders = useMemo(() => {
    const now = new Date(date)
    const weekOptions: {weekStartsOn: DayNumber} = {
      weekStartsOn: weekdayEnum[weekStartsOn],
    }

    return eachDayOfInterval({start: startOfWeek(now, weekOptions), end: endOfWeek(now, weekOptions)}).map(d => (
      <WeekdayHeaderDay key={`weekday-${d.toISOString()}-header`} date={d} />
    ))
  }, [weekStartsOn, date])

  const dayComponents = useMemo(() => {
    const components: ReactNode[] = []
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)

    // Adding blank spots for previous month
    const preBlanks = (firstDay.getDay() + (7 - weekdayEnum[weekStartsOn])) % 7
    for (let i = 0; i < preBlanks; i++) {
      components.push(<BlankDay key={`month-pre-blank-${i}`} />)
    }

    for (let i = 1; i <= getDaysInMonth(firstDay); i++) {
      const day = new Date(date.getFullYear(), date.getMonth(), i)
      components.push(<Day key={`day-component-${day.toString()}`} date={day} />)
    }

    const lastDay = lastDayOfMonth(firstDay)
    // Adding blank spots for next month
    const postBlanks = (lastDay.getDay() + (7 - weekdayEnum[weekStartsOn])) % 7
    for (let i = 6; i > postBlanks; i--) {
      components.push(<BlankDay key={`month-post-blank-${i}`} />)
    }
    const rows = chunk(components, 7).map((days, index) => (
      <div className={styles.row} key={`month-week-${index}`} role="row" aria-label={`Week ${index + 1}`}>
        {days}
      </div>
    ))
    return rows
  }, [weekStartsOn, date])

  const labelId = useId()

  // Hide the label with clip-path so it remains in the document for screen readers
  // Column headers are hidden because days are labeled with the week day name

  return (
    <div
      className={styles.container}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      role="dialog"
      {...testIdProps('month')}
    >
      <span className={clsx(styles.title, compressedHeader && styles.compressedHeader)} aria-live="polite" id={labelId}>
        {title}
      </span>
      <div role="grid" aria-multiselectable={variant === 'multi'}>
        <div className={styles.row} role="row" aria-hidden>
          {weekdayHeaders}
        </div>
        {dayComponents}
      </div>
    </div>
  )
}
