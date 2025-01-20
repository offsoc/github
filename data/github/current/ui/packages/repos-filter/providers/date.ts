import {FilterProviderType, type SuppliedFilterProviderOptions} from '@github-ui/filter'
import {StaticFilterProvider} from '@github-ui/filter/providers'
import {CalendarIcon} from '@primer/octicons-react'

export function getAllDateProviders() {
  return [
    new CreatedFilterProvider({filterTypes: {valueless: false}}),
    new PushedFilterProvider({filterTypes: {valueless: false}}),
  ]
}

const NOT_SHOWN = 10

const REPOS_DATE_FILTER_KEYS = {
  created: {
    displayName: 'Created',
    key: 'created',
    priority: NOT_SHOWN,
    icon: CalendarIcon,
    description: 'Creation date',
  },
  pushed: {
    displayName: 'Last updated',
    key: 'pushed',
    priority: NOT_SHOWN,
    icon: CalendarIcon,
    description: 'Last updated date',
  },
}

const TIME_RANGE_VALUES = [
  {displayName: 'Today', value: () => formatDate(new Date()), priority: 1},
  {displayName: 'This month', value: () => `>${formatDate(pastMonthEndDate())}`, priority: 2},
  {displayName: 'This year', value: () => `>${formatDate(pastYearEndDate())}`, priority: 3},
]

function formatDate(date: Date) {
  const [withoutTime] = date.toISOString().split('T')
  return withoutTime!
}

function pastMonthEndDate() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 0)
}

function pastYearEndDate() {
  const today = new Date()
  return new Date(today.getFullYear(), 0, 0)
}

class CreatedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(REPOS_DATE_FILTER_KEYS.created, TIME_RANGE_VALUES, options)
    this.type = FilterProviderType.Date
  }
}

class PushedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(REPOS_DATE_FILTER_KEYS.pushed, TIME_RANGE_VALUES, options)
    this.type = FilterProviderType.Date
  }
}
