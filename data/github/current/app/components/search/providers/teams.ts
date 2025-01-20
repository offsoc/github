import {filterSort} from '@github-ui/filter-sort'
import {compare, fuzzyScore} from '@github-ui/fuzzy-filter'
import type {QueryEvent, SearchProvider} from '@github-ui/query-builder-element/query-builder-api'
import {SearchItem, Octicon} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {CaretPositionKind, isContentNode, isQualifier} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'
import {getSuggestions} from '../../../assets/modules/github/jump-to'

interface Team {
  name: string
  path: string
}

export class TeamsProvider extends EventTarget implements SearchProvider {
  priority = 7
  name = 'Teams'
  singularItemName = 'team'
  value = 'team'
  type = 'search' as const
  manuallyDetermineFilterEligibility = true

  #suggestedTeams: Team[] | null = null
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

    if (this.#suggestedTeams === null) {
      this.#suggestedTeams = (await getSuggestions(this.#input))
        .filter(r => r.type === 'Team')
        .map(r => {
          return {
            name: r.name,
            path: r.path,
          }
        })
    }

    let matches = this.#suggestedTeams.slice(0, 4)
    if (term.length > 0) {
      const fuzzyQuery = term.replace(/\s/g, '')
      const key = (team: Team) => {
        const score = fuzzyScore(team.name, fuzzyQuery)
        return score > 0 ? {score, text: team.name} : null
      }
      matches = filterSort(this.#suggestedTeams, key, compare)
    }

    for (const suggestion of matches.slice(0, 5)) {
      this.dispatchEvent(
        new SearchItem({
          value: suggestion.name,
          icon: Octicon.Team,
          priority: 0,
          action: {
            url: suggestion.path,
          },
        }),
      )
    }
  }
}
