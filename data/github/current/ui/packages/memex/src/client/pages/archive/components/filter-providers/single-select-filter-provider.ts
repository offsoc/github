import {
  FILTER_PRIORITY_DISPLAY_THRESHOLD,
  type FilterType,
  NOT_SHOWN,
} from '@github-ui/query-builder/constants/search-filters'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FilterItem,
  type FilterProvider,
  type Icon,
  Octicon,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch, score} from 'fzy.js'

import {normalizeToFilterName} from '../../../../components/filter-bar/helpers/search-filter'
import type {SingleSelectColumnModel} from '../../../../models/column-model/custom/single-select'
import type {StatusColumnModel} from '../../../../models/column-model/system/status'

/*
  This class should fit issues & PRs static data filters.
*/
export class SingleSelectFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  name: string
  singularItemName: string
  value: string
  priority: number
  icon?: Icon
  filterValues: Array<string>

  constructor(
    queryBuilder: QueryBuilderElement,
    {name, value, priority, icon}: FilterType,
    filterValues: Array<string>,
  ) {
    super()
    this.name = name
    this.singularItemName = name
    this.value = value
    this.priority = priority
    this.icon = icon
    this.filterValues = filterValues

    queryBuilder.addEventListener('query', this)
    queryBuilder.attachProvider(this)
  }

  handleEvent(event: QueryEvent) {
    const lastElement = event.parsedQuery.at(-1)
    if (!lastElement) return

    if (
      (lastElement.value !== '' || this.priority <= FILTER_PRIORITY_DISPLAY_THRESHOLD) &&
      lastElement.type !== 'filter' &&
      !event.parsedQuery.some(e => e.type === 'filter' && e.filter === this.value) &&
      (hasMatch(lastElement.value, this.name) || hasMatch(lastElement.value, this.value))
    ) {
      this.dispatchEvent(new Event('show'))
    }

    if (!(lastElement.type === 'filter' && lastElement.filter === this.value)) return

    this.filterValues.map(filterValue => {
      if (!filterValue) return
      const capitalizedValue = filterValue.charAt(0).toUpperCase() + filterValue.slice(1)
      if (filterValue.indexOf(' ') > -1) filterValue = `${filterValue}`
      this.emitSuggestion(this.value, filterValue, capitalizedValue, lastElement.value, NOT_SHOWN, undefined)
    })
  }

  emitSuggestion(
    filter: string,
    value: string,
    name: string | undefined,
    query: string,
    priority: number,
    icon?: Icon,
  ) {
    if (query && !hasMatch(query, value)) return
    if (query) priority -= score(query, value)
    this.dispatchEvent(new FilterItem({filter, value, name, priority, icon}))
  }
}

export function createSingleSelectFilter(
  queryBuilder: QueryBuilderElement,
  column: SingleSelectColumnModel | StatusColumnModel,
) {
  const columnValue = normalizeToFilterName(column.name)

  const filterValue: FilterType = {
    name: column.name,
    value: columnValue,
    priority: 4,
    description: `Filter for ${column.name}`,
    icon: Octicon.SingleSelect,
  }
  const values = column.settings.options.map(option => option.name.replaceAll('-', ' '))

  // Exclude Filter
  new SingleSelectFilterProvider(
    queryBuilder,
    {
      ...filterValue,
      name: `Exclude ${column.name}`,
      icon: Octicon.Not,
      value: `-${filterValue.value}`,
      priority: NOT_SHOWN,
    },
    values,
  )

  new SingleSelectFilterProvider(queryBuilder, filterValue, values)
}
