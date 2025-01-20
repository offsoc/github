import {filterSort} from '@github-ui/filter-sort'
import {compare, fuzzyScore} from '@github-ui/fuzzy-filter'
import type {QueryEvent, FilterProvider} from '@github-ui/query-builder-element/query-builder-api'
import {FilterItem, Octicon} from '@github-ui/query-builder-element/query-builder-api'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {CaretPositionKind, isContentNode, isQualifier} from '../parsing/common'
import type {ParsedIntermediateRepresentation} from '../qbsearch-input-element'
import type {BaseNode} from '@github/blackbird-parser'
// eslint-disable-next-line import/no-namespace
import type * as Parsing from '../parsing/parsing'

export class FixedValuesProvider extends EventTarget implements FilterProvider {
  priority = 3
  name = 'Values'
  singularItemName = 'value'
  value = 'value'
  type = 'filter' as const
  manuallyDetermineFilterEligibility = true

  #parsing: typeof Parsing | undefined

  constructor(public queryBuilder: QueryBuilderElement) {
    super()
    this.queryBuilder.addEventListener('query', this)
  }

  async handleEvent(event: QueryEvent) {
    const state = event.parsedMetadata as ParsedIntermediateRepresentation | undefined

    if (!state) {
      return []
    }

    if (
      state.caretPositionKind !== CaretPositionKind.OtherQualifier &&
      state.caretPositionKind !== CaretPositionKind.Is
    ) {
      return []
    }

    if (!state.caretSelectedNode || !isQualifier(state.caretSelectedNode)) {
      return []
    }

    if (!this.#parsing) {
      this.#parsing = await import('../parsing/parsing')
    }

    let matches = []

    const isLicense = state.caretSelectedNode.qualifier === 'License'
    const isLanguage = state.caretSelectedNode.qualifier === 'Language'

    if (isLicense) {
      matches = [
        ['BSD Zero Clause License', '0bsd'],
        ['MIT License', 'mit'],
        ['Apache License 2.0', 'apache-2.0'],
        ['Creative Commons', 'cc'],
        ['GNU General Public License', 'gpl'],
        ['GNU Lesser General Public License', 'lgpl'],
      ]
    } else {
      matches = this.#parsing
        .getPossibleQualifierValues(
          this.#parsing.chooseSearchType(state.ast as BaseNode, true),
          state.caretSelectedNode.qualifier,
        )
        .map(r => [r, r])
    }

    let term = state.query
    if (state.caretSelectedNode && isQualifier(state.caretSelectedNode)) {
      if (isContentNode(state.caretSelectedNode.content)) {
        term = state.caretSelectedNode.content.value as string
      } else {
        term = ''
      }
    }

    if (term.length > 0) {
      const fuzzyQuery = term.replace(/\s/g, '')
      const key = (r: string[]) => {
        const t = r[0] === r[1] ? r[0]! : `${r[0]} ${r[1]}`
        const score = fuzzyScore(t, fuzzyQuery)
        return score > 0 ? {score, text: t} : undefined
      }
      matches = filterSort(matches, key, compare)
    }

    for (const suggestion of matches.slice(0, 5)) {
      if (state.caretSelectedNode && isQualifier(state.caretSelectedNode)) {
        let rewriteStart = state.caretSelectedNode.location.end
        let rewriteEnd = state.caretSelectedNode.location.end
        if (isContentNode(state.caretSelectedNode.content)) {
          rewriteStart = state.caretSelectedNode.content.location.start
          rewriteEnd = state.caretSelectedNode.content.location.end
        }

        const quotedValue = suggestion[1]!.includes(' ') ? `"${suggestion[1]}"` : suggestion[1]!

        const newQuery = `${state.query.slice(0, rewriteStart) + quotedValue} ${state.query.slice(rewriteEnd)}`
        const action = {
          replaceQueryWith: newQuery,
          moveCaretTo: rewriteStart + quotedValue.length + 1,
        }
        this.dispatchEvent(
          new FilterItem({
            filter: 'owner',
            value: suggestion[0]!,
            icon: isLanguage ? Octicon.Circle : undefined,
            priority: 0,
            action,
          }),
        )
      }
    }
  }
}
