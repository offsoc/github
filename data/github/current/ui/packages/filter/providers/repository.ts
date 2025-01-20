import {fuzzyScore} from '@github-ui/fuzzy-score/fuzzy-score'

import {FILTER_KEYS} from '../constants/filter-constants'
import type {FilterQuery} from '../filter-query'
import {
  type AnyBlock,
  type ARIAFilterSuggestion,
  type FilterConfig,
  type FilterProvider,
  FilterProviderType,
  type FilterValueData,
  FilterValueType,
  type IndexedBlockValueItem,
  type MutableFilterBlock,
  type SuppliedFilterProviderOptions,
  type ValueRowProps,
} from '../types'
import {getFilterValue, getUnescapedFilterValue} from '../utils'
import {ValueIcon} from '../utils/ValueIcon'
import {AsyncFilterProvider} from './async'

const REPOSITORY_SUGGESTION_ENDPOINT = '/_filter/repositories'
const REPOSITORY_VALIDATION_ENDPOINT = '/_filter/repositories/validate'

export type Repository = {
  name: string
  owner: string
  visibility: string
  nameWithOwner: string
}

export class RepositoryFilterProvider extends AsyncFilterProvider<Repository> implements FilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.repo, options)
    this.suggestionEndpoint = REPOSITORY_SUGGESTION_ENDPOINT
    this.validationEndpoint = REPOSITORY_VALIDATION_ENDPOINT
    this.type = FilterProviderType.Select
  }

  async getSuggestions(
    filterQuery: FilterQuery,
    filterBlock: AnyBlock | MutableFilterBlock,
    config: FilterConfig,
    caretIndex?: number | null,
  ) {
    return this.processSuggestions(filterQuery, filterBlock, this.processSuggestion.bind(this), caretIndex)
  }

  private processSuggestion(repo: Repository, query: string): ARIAFilterSuggestion {
    const {nameWithOwner} = repo
    let priority = 3

    if (query) {
      if (nameWithOwner) priority -= fuzzyScore(query, nameWithOwner)
    }

    return {
      type: FilterValueType.Value,
      displayName: nameWithOwner,
      ariaLabel: `${nameWithOwner}, ${this.displayName}`,
      value: nameWithOwner,
      inlineDescription: false,
      priority,
      icon: this.icon,
    }
  }

  override validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    repo: Repository | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    const extractedValue = getUnescapedFilterValue(value.value)
    if (!repo || !extractedValue) return false

    return {
      displayName: repo.name,
      value: extractedValue,
    }
  }

  getValueRowProps(value: FilterValueData): ValueRowProps {
    return {
      text: value.displayName ?? getFilterValue(value.value) ?? '',
      description: value.description,
      descriptionVariant: 'block',
      leadingVisual: ValueIcon({value, providerIcon: this.icon, squareIcon: true}),
    }
  }
}
