import {filterSort} from '@github-ui/filter-sort'
import {html} from '@github-ui/jtml-shimmed'
import {compare, fuzzyScore} from '@github-ui/fuzzy-filter'
import type {QueryEvent, CustomIcon, FilterProvider} from '@github-ui/query-builder-element/query-builder-api'
import {FilterItem} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import type {Language} from '../suggestions/languages'
import {PopularLanguages} from '../suggestions/languages'
import {CaretPositionKind, isContentNode, isQualifier} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'
import type {SafeHTMLString} from '@github-ui/safe-html'

export class LanguagesProvider extends EventTarget implements FilterProvider {
  priority = 10
  name = 'Languages'
  singularItemName = 'language'
  value = 'language'
  type = 'filter' as const
  manuallyDetermineFilterEligibility = true

  constructor(public queryBuilder: QueryBuilderElement) {
    super()
    this.queryBuilder.addEventListener('query', this)
  }

  #icon(color: string): CustomIcon {
    const node = document.createElement('div')
    const tmpl = html`<div
      style="border-radius: 8px; display: inline-block; height: 10px; width: 10px; background-color: ${color}"
    ></div>`

    tmpl.renderInto(node)

    return {
      html: node.innerHTML as SafeHTMLString,
    }
  }

  handleEvent(event: QueryEvent) {
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined

    if (!state || state.caretPositionKind !== CaretPositionKind.Language) {
      return []
    }

    let term = ''

    if (state.caretSelectedNode && isQualifier(state.caretSelectedNode)) {
      if (isContentNode(state.caretSelectedNode.content)) {
        term = state.caretSelectedNode.content.value as string
      }
    } else {
      return []
    }

    let suggestions: Language[] = PopularLanguages.slice(0, 7)
    if (term.length === 1) {
      suggestions = PopularLanguages.filter(r => r.name.startsWith(term.toUpperCase())).slice(0, 7)
    } else if (term.length > 1) {
      const fuzzyQuery = term.replace(/\s/g, '')
      const key = (r: {name: string; color: string}) => {
        const score = fuzzyScore(r.name, fuzzyQuery)
        return score > 0 ? {score, text: r.name} : null
      }
      suggestions = filterSort(PopularLanguages, key, compare)
    }

    const suggestionCount = 0
    for (const suggestion of suggestions) {
      if (suggestionCount >= 8) break

      let rewriteStart = state.caretSelectedNode.location.end
      let rewriteEnd = state.caretSelectedNode.location.end
      if (isContentNode(state.caretSelectedNode.content)) {
        rewriteStart = state.caretSelectedNode.content.location.start
        rewriteEnd = state.caretSelectedNode.content.location.end
      }

      const quotedName = suggestion.name.includes(' ') ? `"${suggestion.name}"` : suggestion.name
      const newQuery = `${state.query.slice(0, rewriteStart) + quotedName} ${state.query.slice(rewriteEnd)}`

      this.dispatchEvent(
        new FilterItem({
          filter: 'lang',
          value: suggestion.name,
          icon: this.#icon(suggestion.color),
          priority: 0,
          action: {
            query: newQuery,
            replaceQueryWith: newQuery,
            moveCaretTo: rewriteStart + quotedName.length + 1,
          },
        }),
      )
    }
  }
}
