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
  INDETERMINANT,
  type IndexedBlockValueItem,
  type MutableFilterBlock,
  type QueryContext,
  type SuppliedFilterProviderOptions,
  type ValueRowProps,
} from '../types'
import {getFilterValue, getUnescapedFilterValue} from '../utils'
import {ValueIcon} from '../utils/ValueIcon'
import {AsyncFilterProvider} from './async'

const LABEL_SUGGESTIONS_ENDPOINT = '/_filter/labels'
const LABEL_VALIDATION_ENDPOINT = '/_filter/labels/validate'

export type Label = {
  name: string
  nameHtml?: string
  description?: string
  color?: string
}

export class LabelFilterProvider extends AsyncFilterProvider<Label> implements FilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.label, options)
    this.suggestionEndpoint = LABEL_SUGGESTIONS_ENDPOINT
    this.validationEndpoint = LABEL_VALIDATION_ENDPOINT
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

  getIconData(label: Label, context: QueryContext) {
    if (!context['repo']) {
      return {icon: this.icon}
    } else {
      const iconColor = label.color?.startsWith('#') ? label.color : `#${label.color}`
      return {iconColor, description: label.description, inlineDescription: false}
    }
  }

  protected processSuggestion(label: Label, query: string, filterQuery: FilterQuery): ARIAFilterSuggestion {
    let priority = 3

    if (query) {
      if (label.name) priority -= fuzzyScore(query, label.name)
    }
    return {
      type: FilterValueType.Value,
      displayName: label.nameHtml ?? label.name,
      ariaLabel: `${label.name}, ${this.displayName}`,
      value: label.name ?? '',
      priority,
      ...this.getIconData(label, filterQuery.context),
    }
  }

  override validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    label: Label | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    const extractedValue = getUnescapedFilterValue(value.value)
    if (!extractedValue) return false

    if (label)
      return {
        iconColor: label.color?.startsWith('#') ? label.color : `#${label.color}`,
        value: extractedValue,
        displayName: label.name,
        ...this.getIconData(label, filterQuery.context),
      }

    if (!filterQuery.context.repo && !filterQuery.context.org) {
      return {
        value: INDETERMINANT,
      }
    }

    return false
  }

  getValueRowProps(value: FilterValueData): ValueRowProps {
    return {
      text: value.displayName ?? getFilterValue(value.value) ?? '',
      description: value.description,
      descriptionVariant: 'block',
      leadingVisual: ValueIcon({value, providerIcon: this.icon}),
    }
  }
}
