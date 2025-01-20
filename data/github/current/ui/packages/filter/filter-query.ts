import {fuzzyScore} from '@github-ui/fuzzy-score/fuzzy-score'
import {hasMatch} from 'fzy.js'

import {defaultFilterConfig} from './constants/defaults'
import {Strings} from './constants/strings'
import {
  type AnyBlock,
  type ARIAFilterSuggestion,
  BlockType,
  FILTER_PRIORITY_DISPLAY_THRESHOLD,
  type FilterBlock,
  type FilterConfig,
  type FilterProvider,
  type FilterSuggestionGroup,
  FilterValueType,
  ProviderSupportStatus,
  type QueryContext,
} from './types'
import {
  checkFilterQuerySync,
  getAndKeySuggestion,
  getExcludeKeySuggestion,
  getFilterBlockChunkByCaret,
  getFilterValue,
  getOrKeySuggestion,
  getProviderKey,
  getUnescapedFilterValue,
  isFilterBlock,
  isIndexedFilterBlock,
  isIndexedGroupBlock,
  isIndexedTextBlock,
  isIndexedUnmatchedCloseParenBlock,
  isIndexedUnmatchedOpenParenBlock,
  sanitizeOperators,
} from './utils'

type TransferFilterQueryContext = {
  cachedFilterCount?: number
  staticContext?: Record<string, string>
}

export class FilterQuery {
  cachedFilterCount: number = 0
  config: FilterConfig
  isValidated: boolean = false
  #activeBlock?: AnyBlock
  #blocks: AnyBlock[]
  #staticContext?: Record<string, string> = {}
  #errors: string[] = []
  #unFocusedErrors: string[] = []
  #raw: string

  constructor(
    raw: string = '',
    blocks: AnyBlock[] = [],
    config?: FilterConfig,
    activeBlock?: AnyBlock,
    instanceContext?: TransferFilterQueryContext,
    isValidated = false,
  ) {
    this.#blocks = blocks
    this.#raw = raw
    this.#activeBlock = activeBlock
    this.isValidated = isValidated
    if (instanceContext) {
      this.#staticContext = instanceContext.staticContext
      this.cachedFilterCount = instanceContext.cachedFilterCount ?? 0
    }

    this.config = config ?? defaultFilterConfig
    this.#processErrorBlocks(blocks)
  }

  get activeBlock() {
    return this.#activeBlock
  }

  get activeBlockId() {
    return this.#activeBlock?.id ?? -1
  }

  get blocks() {
    return this.#blocks
  }

  clearActiveBlock() {
    this.#activeBlock = undefined
  }

  get context(): QueryContext {
    const context: QueryContext = this.#staticContext ?? {}
    if (!this.#staticContext?.['repo']) {
      const repoBLocks = this.#blocks.filter(b => isFilterBlock(b) && b.provider.key === 'repo') as FilterBlock[]
      const repos = repoBLocks
        .map(r => r.value.values.map(v => (v.valid !== false ? getFilterValue(v.value) ?? '' : '')))
        .flat()
      if (repos.length > 0) context['repo'] = repos.join(',')

      if (!this.#staticContext?.['org']) {
        const orgBlocks = this.#blocks.filter(b => isFilterBlock(b) && b.provider.key === 'org') as FilterBlock[]
        const orgs = orgBlocks
          .map(r => r.value.values.map(v => (v.valid !== false ? getFilterValue(v.value) ?? '' : '')))
          .flat()

        if (orgs.length > 0) context['org'] = orgs.join(',')
      }
    }

    return context
  }

  get contextURLParams() {
    return new URLSearchParams(this.context)
  }

  get errors() {
    return this.#errors ? Array.from(this.#errors) : []
  }

  getErrors(allErrors: boolean = false) {
    return !allErrors ? this.#errors : [...this.#errors, ...this.#unFocusedErrors]
  }

  get filterCount() {
    if (!this.isValidated || !checkFilterQuerySync(this)) return this.cachedFilterCount
    const updatedCount = this.blocks.filter(b => isFilterBlock(b) && b.value.values.some(v => v.valid)).length
    this.cachedFilterCount = updatedCount
    return updatedCount
  }

  get instanceContext() {
    return {
      cachedFilterCount: this.cachedFilterCount,
      staticContext: this.#staticContext,
    }
  }

  get raw() {
    return this.#raw
  }

  get staticContext() {
    return this.#staticContext
  }

  set staticContext(staticContext: QueryContext | undefined) {
    this.#staticContext = staticContext
  }

  async getSuggestions(
    caretIndex: number,
    filterProviders: Record<string, FilterProvider>,
    filterConfig: FilterConfig,
  ): Promise<FilterSuggestionGroup[]> {
    const activeBlock = this.activeBlock

    // later on, we may want to combine these into an array of objects
    // to allow for grouped suggestions with optional headings
    // https://github.com/github/github/pull/315881#discussion_r1515334291
    let aggregatedSuggestionGroups: FilterSuggestionGroup[] = []
    /** FIRST CASE: Show recommended providers
     * If there is no active block and the query is empty
     * If the active block is a space
     * If the active block is an unmatched `(`, or within an empty group `()`
     */

    if (
      (!activeBlock && this.raw === '') ||
      activeBlock?.type === BlockType.Space ||
      activeBlock?.type === BlockType.UnmatchedOpenParen ||
      (activeBlock?.type === BlockType.Group && (activeBlock?.raw.endsWith('(') || activeBlock?.raw === '()'))
    ) {
      const providers = Object.values(filterProviders)
        /** Filter out providers that:
         *  - Are not multikey and already have a block in the query
         *  - Are not supported
         */
        .filter(provider => {
          return (
            (provider.options.filterTypes?.multiKey !== false ||
              (provider.options.filterTypes?.multiKey === false &&
                this.blocks.filter(block => isFilterBlock(block) && block.key.value === provider.key).length < 1)) &&
            provider.options.support.status === ProviderSupportStatus.Supported
          )
        })
        /** Filter by priority and then sort by display name */
        .filter(provider => provider.priority <= FILTER_PRIORITY_DISPLAY_THRESHOLD)
        .sort((a, b) => a.priority - b.priority)
        .map(
          (provider): ARIAFilterSuggestion => ({
            type: FilterValueType.Key,
            displayName: provider.displayName,
            // only add the ` ,` if `provider.description` is not empty
            ariaLabel: `${provider.displayName}, Filter${provider.description ? `, ${provider.description}` : ''}`,
            priority: provider.priority,
            icon: provider.icon,
            value: provider.key,
          }),
        )

      aggregatedSuggestionGroups = [
        {
          id: 'providers-suggestion-group',
          suggestions: providers,
        },
      ]

      // Show the AND and OR keys as suggestions
      const utilitySuggestions = []
      if (filterConfig.groupAndKeywordSupport) {
        utilitySuggestions.push(getAndKeySuggestion())
        utilitySuggestions.push(getOrKeySuggestion())
      }

      // an item can be exclusive:true, but also be multiKey:false, which would mean that if that block is already in the query, it can't be inserted again and thus would take it off the Exclusions list too
      const showExcludeSuggestions = (provider: FilterProvider) => {
        return (
          provider.options.filterTypes.exclusive === true &&
          (provider.options.filterTypes?.multiKey !== false ||
            (provider.options.filterTypes?.multiKey === false &&
              this.blocks.filter(block => isFilterBlock(block) && block.key.value === provider.key).length < 1))
        )
      }
      if (Object.values(filterProviders).filter(showExcludeSuggestions).length > 0) {
        utilitySuggestions.push(getExcludeKeySuggestion())
      }

      aggregatedSuggestionGroups.push({
        id: 'utility-suggestion-group',
        suggestions: utilitySuggestions,
      })
    } else if (activeBlock?.type === BlockType.Text && activeBlock.raw === '-') {
      /** SECOND CASE: Show providers that support exclusions
       * If the active block is a text block and the raw value is a dash (indicating a potential exclusive filter)
       */
      const providers = Object.values(filterProviders)
        /** Filter out providers that:
         *  - Support exclusions
         *  - Are supported
         */
        .filter(provider => {
          return (
            provider.options.filterTypes.exclusive &&
            provider.options.support.status === ProviderSupportStatus.Supported
          )
        })
        /** Filter by priority and then sort by display name */
        .filter(provider => provider.priority <= FILTER_PRIORITY_DISPLAY_THRESHOLD)
        .sort((a, b) => a.priority - b.priority)
        .map(
          (provider): ARIAFilterSuggestion => ({
            type: FilterValueType.Key,
            displayName: provider.displayName,
            // only add the ` ,` if `provider.description` is not empty
            ariaLabel: `${provider.displayName}, Filter${provider.description ? `, ${provider.description}` : ''}`,
            priority: provider.priority,
            icon: provider.icon,
            value: `-${provider.key}`,
          }),
        )
      aggregatedSuggestionGroups = [
        {
          id: 'exclude-providers',
          title: Strings.exclude,
          suggestions: providers,
        },
      ]
    } else if (activeBlock?.type === BlockType.Text) {
      /** THIRD CASE: Show filtered providers
       * If the active block is a text block
       */

      const matches: ARIAFilterSuggestion[] = []

      const textBlock = isIndexedTextBlock(activeBlock) ? activeBlock : null
      const matchFilterTo =
        textBlock && caretIndex - textBlock.startIndex <= textBlock.raw.indexOf(filterConfig.filterDelimiter)
          ? textBlock.raw.substring(0, caretIndex - textBlock.startIndex)
          : activeBlock.raw

      Object.values(filterProviders).map(provider => {
        /**
         * If the activeBlock raw text partially matches the providers key
         * If the activeBlock raw text partially matches the providers display name, if it's available
         * If alias matching is turned on and it matches one of the provider's aliases
         * If the provider supports exclusive and the raw text partially matches the provider key with a dash
         * If the provider supports exclusive and the raw text partially matches one of the provider's aliases with a dash
         * If the provider supports multikey
         * If the provider doesn't support multikey and there is not already a block with this key in the query
         * If the provider is supported
         */
        if (
          (provider.key.startsWith(matchFilterTo) ||
            (provider.displayName && provider.displayName.startsWith(matchFilterTo)) ||
            (filterConfig.aliasMatching && provider.aliases?.some(a => a.startsWith(matchFilterTo))) ||
            (provider.options.filterTypes.exclusive &&
              (`-${provider.key}`.startsWith(matchFilterTo) ||
                (filterConfig.aliasMatching && provider.aliases?.some(a => `-${a}`.startsWith(matchFilterTo)))))) &&
          (provider.options.filterTypes.multiKey !== false ||
            this.blocks.filter(block => isFilterBlock(block) && block.key.value === provider.key).length < 1) &&
          provider.options.support.status === ProviderSupportStatus.Supported
        ) {
          let value = provider.key
          // "Exclusion" mode, meaning user has started with a dash
          if (activeBlock.raw.startsWith('-') && provider.options.filterTypes.exclusive) {
            value = `-${provider.key}`
          }
          matches.push({
            type: FilterValueType.Key,
            displayName: provider.displayName,
            // only add the ` ,` if `provider.description` is not empty
            ariaLabel: `${provider.displayName}, Filter${provider.description ? `, ${provider.description}` : ''}`,
            priority: provider.priority - fuzzyScore(matchFilterTo, provider.key),
            icon: provider.icon,
            value,
          })
        }
      })

      matches.sort((a, b) => a.priority - b.priority)
      aggregatedSuggestionGroups = [
        {
          id: 'providers-suggestion-group',
          suggestions: matches,
        },
      ]

      const utilitySuggestions = []
      if (filterConfig.groupAndKeywordSupport) {
        if ('and'.startsWith(matchFilterTo.toLocaleLowerCase())) utilitySuggestions.push(getAndKeySuggestion())
        if ('or'.startsWith(matchFilterTo.toLocaleLowerCase())) utilitySuggestions.push(getOrKeySuggestion())
      }

      aggregatedSuggestionGroups.push({
        id: 'utility-suggestion-group',
        suggestions: utilitySuggestions,
      })
    } else if (activeBlock && isFilterBlock(activeBlock)) {
      /*^ FOURTH CASE: It's complicated
       * If the active block is a filter block
       * This case is usually for when a block has been added and the user goes back to edit later
       */
      let filteredSuggestions: ARIAFilterSuggestion[] = []
      const filterKey = getProviderKey(activeBlock.key.value)
      // Check to make sure the filter block has indexes we can check to determine where the caret is
      if (isIndexedFilterBlock(activeBlock)) {
        // Get the chunk of the filter block the caret is in: key, value
        const [type, chunk] = getFilterBlockChunkByCaret(activeBlock, caretIndex)
        // If the caret is in the key, show provider suggestions
        if (type === 'key') {
          const matches: ARIAFilterSuggestion[] = []
          Object.values(filterProviders).map(provider => {
            if (
              (hasMatch(chunk.value, provider.key) ||
                (provider.options.filterTypes.exclusive && hasMatch(chunk.value, `-${provider.key}`))) &&
              (provider.options.filterTypes.multiKey !== false ||
                this.blocks.filter(block => isFilterBlock(block) && block.key.value === provider.key).length < 1)
            ) {
              matches.push({
                type: FilterValueType.Key,
                displayName: provider.displayName,
                // only add the ` ,` if `provider.description` is not empty
                ariaLabel: `${provider.displayName}, Filter${provider.description ? `, ${provider.description}` : ''}`,
                priority: provider.priority - fuzzyScore(chunk.value, provider.key),
                icon: provider.icon,
                value: provider.key,
              })
            }
          })
          matches.sort((a, b) => a.priority - b.priority)
          aggregatedSuggestionGroups = [
            {
              id: 'providers-suggestion-group',
              suggestions: matches,
            },
          ]
          // If the caret is in the value, show value suggestions for the block's provider
        } else if (type === 'value') {
          const provider =
            filterProviders[filterKey] ??
            (filterConfig.aliasMatching
              ? Object.values(filterProviders).find(p => p.aliases?.includes(filterKey))
              : null)

          const providerSuggestions = await provider?.getSuggestions(this, activeBlock, filterConfig, caretIndex)

          // Filter out suggestions from this block
          filteredSuggestions =
            providerSuggestions
              ?.filter(
                suggestion =>
                  activeBlock.value.values.findIndex(
                    value => getUnescapedFilterValue(value.value) === suggestion.value && !value.hasCaret,
                  ) < 0,
              )
              .sort((a, b) => a.priority - b.priority) ?? []
        }
      }
      aggregatedSuggestionGroups = [
        {
          id: 'values-suggestion-group',
          suggestions: filteredSuggestions,
        },
      ]
    }

    return aggregatedSuggestionGroups
  }

  #processErrorBlocks(blocks: AnyBlock[]) {
    const errorSet = new Set<string>()
    const unFocusedErrorSet = new Set<string>()

    const processBlocks = (allBlocks: AnyBlock[]) => {
      for (const block of allBlocks) {
        if (isIndexedGroupBlock(block)) {
          if (!block.valid) {
            for (const v of block.validations ?? []) {
              if (v.message) {
                errorSet.add(v.message)
              }
            }
          }
          processBlocks(block.blocks)
        } else if (isFilterBlock(block) && block.valid === false && this.activeBlockId !== block.id) {
          if (block.validationMessage) errorSet.add(block.validationMessage ?? '')
          if (!block.key.valid) {
            for (const v of block.key.validations ?? []) {
              if (v.message) {
                errorSet.add(v.message)
              }
            }
          }
          for (const value of block.value.values) {
            if (value.valid !== false) continue
            if (value.validations) {
              for (const v of value.validations ?? []) {
                if (v.message) {
                  errorSet.add(v.message)
                }
              }
            } else {
              errorSet.add(
                Strings.filterInvalidValue(block.key.value, sanitizeOperators(getFilterValue(value.value)) ?? ''),
              )
            }
          }
        } else if (
          (isIndexedUnmatchedOpenParenBlock(block) || isIndexedUnmatchedCloseParenBlock(block)) &&
          block.validations
        ) {
          unFocusedErrorSet.add(Strings.unbalancedParentheses)
        } else if (isIndexedTextBlock(block)) {
          for (const v of block.validations ?? []) {
            if (v.message) {
              unFocusedErrorSet.add(v.message)
            }
          }
        }
      }
    }

    if ((this.#raw.match(/"/g) ?? []).length % 2 !== 0) {
      unFocusedErrorSet.add(Strings.unbalancedQuotations)
    }

    processBlocks(blocks)

    this.#errors = Array.from(errorSet)
    this.#unFocusedErrors = Array.from(unFocusedErrorSet)
  }
}
