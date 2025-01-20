import {ArrowSwitchIcon, CalendarIcon} from '@primer/octicons-react'

import type {FilterSuggestion} from '../types'

function getCurrentDate() {
  return new Date().toLocaleDateString('en-us', {year: 'numeric', month: 'long', day: 'numeric'})
}

export const TIME_RANGE_VALUES: FilterSuggestion[] = [
  {
    value: '@today',
    displayName: 'Today',
    priority: 1,
    icon: ArrowSwitchIcon,
    iconColor: 'var(--fgColor-done, var(--color-done-fg))',
  },
  {
    value: '@today-1d',
    displayName: 'Yesterday',
    priority: 2,
    icon: ArrowSwitchIcon,
    iconColor: 'var(--fgColor-done, var(--color-done-fg))',
  },
  {
    value: '>@today-1w',
    displayName: 'Past 7 days',
    priority: 3,
    icon: ArrowSwitchIcon,
    iconColor: 'var(--fgColor-done, var(--color-done-fg))',
  },
  {
    value: '>@today-30d',
    displayName: 'Past 30 days',
    priority: 4,
    icon: ArrowSwitchIcon,
    iconColor: 'var(--fgColor-done, var(--color-done-fg))',
  },
  {
    value: '>@today-1y',
    displayName: 'Past year',
    priority: 5,
    icon: ArrowSwitchIcon,
    iconColor: 'var(--fgColor-done, var(--color-done-fg))',
  },
  {
    value: () => {
      const now = new Date()
      return `${now.getFullYear()}-${`0${now.getMonth() + 1}`.slice(-2)}-${`0${now.getDate()}`.slice(-2)}`
    },
    displayName: getCurrentDate(),
    priority: 6,
    icon: CalendarIcon,
  },
]

export const NUMBER_COUNT_VALUE = [
  {value: '<10', displayName: 'Less than 10', priority: 1},
  {value: '>10', displayName: 'More than 10', priority: 2},
  {value: '10..100', displayName: 'Between 10 and 100', priority: 3},
  {value: '100', displayName: '100', priority: 4},
]
