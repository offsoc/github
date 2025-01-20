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
  type SuppliedFilterProviderOptions,
  type ValueRowProps,
} from '../types'
import {getFilterValue, getUnescapedFilterValue} from '../utils'
import {ValueIcon} from '../utils/ValueIcon'
import {AsyncFilterProvider} from './async'

// NEW ENDPOINTS
const MILESTONE_SUGGESTION_ENDPOINT = '/_filter/milestones'
const MILESTONE_VALIDATION_ENDPOINT = '/_filter/milestones/validate'

export type Milestone = {
  id: string
  title: string
  description: string
  value: string
}

export class MilestoneFilterProvider extends AsyncFilterProvider<Milestone> implements FilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.milestone, options)
    this.suggestionEndpoint = MILESTONE_SUGGESTION_ENDPOINT
    this.validationEndpoint = MILESTONE_VALIDATION_ENDPOINT
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

  private processSuggestion(milestone: Milestone, query: string): ARIAFilterSuggestion {
    const {id, title, description} = milestone
    let priority = 3

    if (query) {
      if (title) priority -= fuzzyScore(query, title)
    }

    return {
      id,
      type: FilterValueType.Value,
      displayName: title,
      ariaLabel: `${title}, ${this.displayName}`,
      // TODO: This is a temporary fix to unblock Issues. Discussion here: https://github.com/github/collaboration-workflows-flex/discussions/294#discussioncomment-8609500
      value: title,
      description,
      inlineDescription: false,
      priority,
      icon: this.icon,
    }
  }

  override validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    milestone: Milestone | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    const extractedValue = getUnescapedFilterValue(value.value)
    if (!extractedValue) return false

    if (milestone)
      return {
        value: extractedValue,
        displayName: milestone.title,
        description: milestone.description,
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
      leadingVisual: ValueIcon({value, providerIcon: this.icon, squareIcon: true}),
    }
  }
}
