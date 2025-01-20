import {RelativeTime} from '@primer/react'
import {LABELS} from '../constants/labels'

export type RelativeTimeDescriptionProps = {
  closed: boolean
  givenDate: Date
  currentDate: Date
}

export const RelativeTimeDescription = ({closed, givenDate, currentDate}: RelativeTimeDescriptionProps) => {
  const relativeMonth = closed ? 'short' : 'long'
  const relativeYear = closed && !isInPreviousYears(givenDate, currentDate) ? undefined : 'numeric'
  const relativeTense = closed && isGreaterThanAMonth(currentDate, givenDate) ? 'auto' : 'past'
  const relativeFormat = closed ? 'auto' : 'elapsed'
  const relativePrecision = closed ? 'second' : isGreaterThanAMonth(givenDate, currentDate) ? 'month' : 'day'

  return (
    <RelativeTime
      date={givenDate}
      day={'numeric'}
      month={relativeMonth}
      tense={isInPreviousYears(givenDate, currentDate) ? undefined : relativeTense}
      year={relativeYear}
      format={relativeFormat}
      precision={relativePrecision}
      data-testid={LABELS.testIds.relativeTimeDescription}
    />
  )
}

// check if a date falls in previous years
const isInPreviousYears = (givenDate: Date, currentDate: Date) => {
  const currentYear = currentDate.getFullYear()
  const givenDateYear = givenDate.getFullYear()

  return givenDateYear < currentYear
}

// check if a date is more than a month from the current date
const isGreaterThanAMonth = (givenDate: Date, currentDate: Date): boolean => {
  const yearDiff = givenDate.getFullYear() - currentDate.getFullYear()
  const monthDiff = givenDate.getMonth() - currentDate.getMonth()

  const totalMonthDiff = yearDiff * 12 + monthDiff

  return totalMonthDiff >= 1
}
