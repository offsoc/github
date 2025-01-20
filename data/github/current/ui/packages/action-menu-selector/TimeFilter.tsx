import {ClockIcon} from '@primer/octicons-react'
import {ActionMenuSelector} from './ActionMenuSelector'
import type {TimePeriod} from './action-menu-types'

const orderedPeriods: TimePeriod[] = ['hour', 'day', 'week', 'month']

const timePeriods: Record<TimePeriod, string> = {
  hour: 'Last hour',
  day: 'Last 24 hours',
  week: 'Last week',
  month: 'Last month',
}

export type TimeFilterProps = {
  currentTimePeriod: TimePeriod
  onSelect: (selectedTimePeriod: TimePeriod) => void
}

export function TimeFilter({currentTimePeriod, onSelect}: TimeFilterProps) {
  return (
    <ActionMenuSelector
      buttonProps={{leadingVisual: ClockIcon}}
      currentSelection={currentTimePeriod}
      orderedValues={orderedPeriods}
      displayValues={timePeriods}
      onSelect={onSelect}
    />
  )
}
