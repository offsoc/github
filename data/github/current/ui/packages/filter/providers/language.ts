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

const LANGUAGE_SUGGESTION_ENDPOINT = '/_filter/languages'
const LANGUAGE_VALIDATION_ENDPOINT = '/_filter/languages/validate'

export type Language = {
  name: string
  color: string
}

export class LanguageFilterProvider extends AsyncFilterProvider<Language> implements FilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.language, options)
    this.suggestionEndpoint = LANGUAGE_SUGGESTION_ENDPOINT
    this.validationEndpoint = LANGUAGE_VALIDATION_ENDPOINT
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

  private processSuggestion(language: Language, query: string): ARIAFilterSuggestion {
    let priority = 3

    if (query) {
      if (language.name) priority -= fuzzyScore(query, language.name)
    }

    return {
      type: FilterValueType.Value,
      displayName: language.name,
      ariaLabel: `${language.name}, ${this.displayName}`,
      value: language.name ?? '',
      priority,
      iconColor: language.color?.startsWith('#') ? language.color : `#${language.color}`,
    }
  }

  override validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    language: Language | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    const extractedValue = getUnescapedFilterValue(value.value)
    if (!language || !extractedValue) return false

    return {
      iconColor: language.color?.startsWith('#') ? language.color : `#${language.color}`,
      value: extractedValue,
      displayName: language.name,
    }
  }

  getValueRowProps(value: FilterValueData): ValueRowProps {
    return {
      text: value.displayName ?? getFilterValue(value.value) ?? '',
      description: value.description,
      descriptionVariant: 'block',
      leadingVisual: ValueIcon({value, providerIcon: this.icon}) ?? undefined,
    }
  }
}
