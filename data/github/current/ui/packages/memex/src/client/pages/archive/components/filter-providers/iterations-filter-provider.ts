import {FILTER_PRIORITY_DISPLAY_THRESHOLD} from '@github-ui/query-builder/constants/search-filters'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FilterItem,
  type FilterProvider,
  type Icon,
  Octicon,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch} from 'fzy.js'

import type {Iteration} from '../../../../api/columns/contracts/iteration'
import type {IterationColumnModel} from '../../../../models/column-model/custom/iteration'

/*
  This class should fit issues & PRs static data filters.
*/
export class IterationsFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  name: string
  value: string
  priority: number
  icon?: Icon
  options: Array<Iteration>
  singularItemName: string

  constructor(queryBuilder: QueryBuilderElement, iteration: IterationColumnModel) {
    super()
    this.name = iteration.name
    this.singularItemName = iteration.name
    this.value = iteration.name.match(/\s/) ? `"${iteration.name}"` : iteration.name
    this.priority = 4
    this.icon = Octicon.Iterations
    this.options = iteration.settings.configuration.iterations

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
    this.options.map(iteration => {
      this.emitSuggestion(this.value, iteration.title, lastElement.value)
    })
  }

  emitSuggestion(filter: string, title: string, query: string) {
    if (query && !hasMatch(query, title)) return
    this.dispatchEvent(new FilterItem({filter, value: title}))
  }
}
