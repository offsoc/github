import {filterSort} from '@github-ui/filter-sort'
import {compare, fuzzyScore} from '@github-ui/fuzzy-filter'
import {
  type QueryEvent,
  FilterItem,
  type FilterProvider,
  Octicon,
} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {CaretPositionKind, isContentNode, isQualifier} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'
import {getSuggestions} from '../../../assets/modules/github/jump-to'

interface Project {
  name: string
  path: string
}

export class ProjectsProvider extends EventTarget implements FilterProvider {
  priority = 8
  name = 'Projects'
  singularItemName = 'project'
  value = 'project'
  type = 'filter' as const
  manuallyDetermineFilterEligibility = true

  #suggestedProjects: Project[] | null = null
  #input: HTMLElement

  constructor(
    public queryBuilder: QueryBuilderElement,
    input: HTMLElement,
  ) {
    super()
    this.queryBuilder.addEventListener('query', this)
    this.#input = input
  }

  async handleEvent(event: QueryEvent) {
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined
    const hasFocus = this.queryBuilder.hasFocus()
    if (!state || !hasFocus || state.caretPositionKind !== CaretPositionKind.Text) {
      return []
    }

    let term = state.query
    if (state.caretSelectedNode && isQualifier(state.caretSelectedNode)) {
      if (isContentNode(state.caretSelectedNode.content)) {
        term = state.caretSelectedNode.content.value as string
      } else {
        term = ''
      }
    }

    if (this.#suggestedProjects === null) {
      this.#suggestedProjects = (await getSuggestions(this.#input))
        .filter(r => r.type === 'Project')
        .map(r => {
          return {
            name: r.name,
            path: r.path,
          }
        })
    }

    let matches = this.#suggestedProjects.slice(0, 4)
    if (term.length > 0) {
      const fuzzyQuery = term.replace(/\s/g, '')
      const key = (p: Project) => {
        const score = fuzzyScore(p.name, fuzzyQuery)
        return score > 0 ? {score, text: p.name} : null
      }
      matches = filterSort(this.#suggestedProjects, key, compare)
    }

    for (const suggestion of matches.slice(0, 5)) {
      this.dispatchEvent(
        new FilterItem({
          filter: 'project',
          value: suggestion.name,
          icon: Octicon.Project,
          priority: 0,
          action: {
            url: suggestion.path,
          },
        }),
      )
    }
  }
}
