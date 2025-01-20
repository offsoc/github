import {filterSort} from '@github-ui/filter-sort'
import {compare, fuzzyScore} from '@github-ui/fuzzy-filter'
import type {QueryEvent, SearchProvider, QueryBuilderAction} from '@github-ui/query-builder-element/query-builder-api'
import {SearchItem, Octicon} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {getSuggestions} from '../../../assets/modules/github/jump-to'
import {CaretPositionKind, extractRepoOrgScopes, extractTextQuery, isContentNode, isQualifier} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'

export class OwnersProvider extends EventTarget implements SearchProvider {
  priority = 5
  name = 'Owners'
  singularItemName = 'owner'
  value = 'owner'
  type = 'search' as const
  manuallyDetermineFilterEligibility = true

  #suggestedOwners: string[] | null = null
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
    if (!state || !hasFocus) {
      return []
    }

    if (state.caretPositionKind === CaretPositionKind.Text && state.ast) {
      // If the query is already scoped, don't suggest any more orgs
      if (extractRepoOrgScopes(state.ast).length) {
        return []
      }
      // Check that there are no existing scopes already applied
    } else if (state.caretPositionKind !== CaretPositionKind.Owner) {
      return []
    }

    let term = ''
    const scopedOrgs: string[] = []
    if (state.ast) {
      term = extractTextQuery(state.ast)
    }

    if (state.caretSelectedNode && isQualifier(state.caretSelectedNode)) {
      if (isContentNode(state.caretSelectedNode.content)) {
        term = state.caretSelectedNode.content.value as string
      } else {
        term = ''
      }
    }

    if (this.#suggestedOwners === null) {
      const owners = (await getSuggestions(this.#input))
        .filter(r => r.type === 'Repository')
        .map(r => r.name.split('/')[0]!)
      this.#suggestedOwners = [...new Set(owners)]
    }

    let matches = this.#suggestedOwners
    if (term.length > 0) {
      const fuzzyQuery = term.replace(/\s/g, '')
      const key = (r: string) => {
        const score = fuzzyScore(r, fuzzyQuery)
        return score > 0 ? {score, text: r} : null
      }
      matches = filterSort(this.#suggestedOwners, key, compare)
    }

    // Filter matches match orgs specified in the query
    if (scopedOrgs.length > 0) {
      matches = matches.filter(r => {
        const org = r.split('/')[0]!.toLowerCase()
        return scopedOrgs.find(o => org.startsWith(o))
      })
    }

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
        new SearchItem({
          value: suggestion,
          icon: Octicon.Repo,
          priority: 0,
          action,
        }),
      )
    }
  }
}
