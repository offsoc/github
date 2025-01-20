import {filterSort} from '@github-ui/filter-sort'
import {compare, fuzzyScore} from '@github-ui/fuzzy-filter'
import type {
  QueryEvent,
  FilterProvider,
  QueryBuilderAction,
  SearchProvider,
} from '@github-ui/query-builder-element/query-builder-api'
import {FilterItem, Octicon, SearchItem} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {getSuggestions} from '../../../assets/modules/github/jump-to'
import {CaretPositionKind, extractRepoOrgScopes, extractTextQuery, isContentNode, isQualifier} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'

class ReposProviderBase extends EventTarget {
  #input: HTMLElement
  #suggestedRepos: string[] | null = null

  constructor(input: HTMLElement) {
    super()
    this.#input = input
  }

  protected async getMatchingRepositories({state}: {state: ParsedIntermediateRepresentation}) {
    let term = ''
    const scopedOrgs: string[] = []
    if (state.ast) {
      const scopes = extractRepoOrgScopes(state.ast)
      let isScopedToRepository = false
      for (const scope of scopes) {
        if (scope.kind === 'repo' || scope.kind === 'saved') {
          isScopedToRepository = true
        } else if (scope.kind === 'org') {
          scopedOrgs.push(scope.value.toLowerCase())
        }
      }

      // Don't suggest repositories if we are scoped to a repo and aren't currently
      // editing that qualifier
      if (isScopedToRepository && state.caretPositionKind !== CaretPositionKind.Repository) {
        return []
      }

      term = extractTextQuery(state.ast)
    }

    if (state.caretSelectedNode && isQualifier(state.caretSelectedNode)) {
      if (isContentNode(state.caretSelectedNode.content)) {
        term = state.caretSelectedNode.content.value as string
      } else {
        term = ''
      }
    }

    if (this.#suggestedRepos === null) {
      this.#suggestedRepos = (await getSuggestions(this.#input)).filter(r => r.type === 'Repository').map(r => r.name)
    }

    let matches = this.#suggestedRepos
    if (term.length > 0) {
      const fuzzyQuery = term.replace(/\s/g, '')
      const key = (r: string) => {
        const score = fuzzyScore(r, fuzzyQuery)
        return score > 0 ? {score, text: r} : null
      }
      matches = filterSort(this.#suggestedRepos, key, compare)
    }

    // Filter matches match orgs specified in the query
    if (scopedOrgs.length > 0) {
      matches = matches.filter(r => {
        const org = r.split('/')[0]!.toLowerCase()
        return scopedOrgs.find(o => org.startsWith(o))
      })
    }

    return matches
  }
}

export class ReposFilterProvider extends ReposProviderBase implements FilterProvider {
  priority = 6
  name = 'Repositories'
  singularItemName = 'repository'
  value = 'repository-filter'
  type = 'filter' as const
  manuallyDetermineFilterEligibility = true

  constructor(
    public queryBuilder: QueryBuilderElement,
    input: HTMLElement,
  ) {
    super(input)
    this.queryBuilder.addEventListener('query', this)
  }

  async handleEvent(event: QueryEvent) {
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined
    const hasFocus = this.queryBuilder.hasFocus()
    if (!state || !hasFocus) {
      return []
    }

    if (
      state.caretPositionKind !== CaretPositionKind.Repository &&
      state.caretPositionKind !== CaretPositionKind.Owner
    ) {
      return []
    }

    const matches = await this.getMatchingRepositories({state})

    for (const suggestion of matches.slice(0, 5)) {
      let action: QueryBuilderAction = {
        url: `/${suggestion}`,
      }

      if (state.caretSelectedNode && isQualifier(state.caretSelectedNode)) {
        let rewriteStart = state.caretSelectedNode.location.end
        let rewriteEnd = state.caretSelectedNode.location.end
        if (isContentNode(state.caretSelectedNode.content)) {
          rewriteStart = state.caretSelectedNode.content.location.start
          rewriteEnd = state.caretSelectedNode.content.location.end
        }

        const newQuery = `${state.query.slice(0, rewriteStart) + suggestion} ${state.query.slice(rewriteEnd)}`
        action = {
          replaceQueryWith: newQuery,
          moveCaretTo: rewriteStart + suggestion.length + 1,
        }
      }

      this.dispatchEvent(
        new FilterItem({
          filter: 'repo',
          value: suggestion,
          icon: Octicon.Repo,
          priority: 0,
          action,
        }),
      )
    }
  }
}

export class ReposSearchProvider extends ReposProviderBase implements SearchProvider {
  priority = 6
  name = 'Repositories'
  singularItemName = 'repository'
  value = 'repository-search'
  type = 'search' as const
  manuallyDetermineFilterEligibility = true

  constructor(
    public queryBuilder: QueryBuilderElement,
    input: HTMLElement,
  ) {
    super(input)
    this.queryBuilder.addEventListener('query', this)
  }

  async handleEvent(event: QueryEvent) {
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined
    const hasFocus = this.queryBuilder.hasFocus()
    if (!state || !hasFocus || state.caretPositionKind !== CaretPositionKind.Text) {
      return []
    }

    const matches = await this.getMatchingRepositories({
      state,
    })

    for (const suggestion of matches.slice(0, 5)) {
      this.dispatchEvent(
        new SearchItem({
          value: suggestion,
          icon: Octicon.Repo,
          priority: 0,
          action: {
            url: `/${suggestion}`,
          },
        }),
      )
    }
  }
}
