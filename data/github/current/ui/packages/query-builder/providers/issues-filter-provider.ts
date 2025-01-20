import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FilterItem,
  type FilterProvider,
  type Icon,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch, score} from 'fzy.js'

import {FILTER_PRIORITY_DISPLAY_THRESHOLD, FILTER_VALUES} from '../constants/search-filters'

/*
  This class should fit issues & PRs static data filters.
*/
export class IssuesFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  name: string
  value: string
  description: string
  priority: number
  icon?: Icon
  valuesKey?: string

  singularItemName: string

  constructor(
    queryBuilder: QueryBuilderElement,
    {
      name,
      value,
      priority,
      icon,
      valuesKey,
    }: {
      name: string
      value: string
      description: string
      priority: number
      icon?: Icon
      valuesKey?: string
    },
  ) {
    super()
    this.name = name
    this.value = value
    this.singularItemName = name
    this.priority = priority
    this.icon = icon
    this.valuesKey = valuesKey

    queryBuilder.addEventListener('query', this)
    queryBuilder.attachProvider(this)
  }

  handleEvent(event: QueryEvent) {
    const lastElement = event.parsedQuery.at(-1)!
    if (
      (lastElement.value !== '' || this.priority <= FILTER_PRIORITY_DISPLAY_THRESHOLD) &&
      lastElement?.type !== 'filter' &&
      !event.parsedQuery.some(e => e.type === 'filter' && e.filter === this.value) &&
      (hasMatch(lastElement?.value, this.name) || hasMatch(lastElement?.value, this.value))
    ) {
      this.dispatchEvent(new Event('show'))
    }

    if (!(lastElement?.type === 'filter' && lastElement.filter === this.value)) return

    const filterKey = this.valuesKey || this.value
    FILTER_VALUES[filterKey]?.map(filterValue => {
      const {name, priority, icon} = filterValue
      const value = 'value' in filterValue ? filterValue.value : filterValue.valueFunc()
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1)
      this.emitSuggestion(this.value, value, name ?? capitalizedValue, lastElement.value, priority, icon)
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
