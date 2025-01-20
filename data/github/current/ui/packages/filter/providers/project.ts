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
  type FilterValueValidator,
  INDETERMINANT,
  type IndexedBlockValueItem,
  type MutableFilterBlock,
  type SuppliedFilterProviderOptions,
  type ValueRowProps,
} from '../types'
import {escapeString, getFilterValue, getUnescapedFilterValue} from '../utils'
import {AsyncFilterProvider} from './async'

// NEW ENDPOINTS
const PROJECT_SUGGESTION_ENDPOINT = '/_filter/projects'
const PROJECT_VALIDATION_ENDPOINT = '/_filter/projects/validate'

export type Project = {
  title: string
  value: string
}

export class ProjectFilterProvider
  extends AsyncFilterProvider<Project>
  implements FilterProvider, FilterValueValidator<Project>
{
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.project, options)
    this.suggestionEndpoint = PROJECT_SUGGESTION_ENDPOINT
    this.validationEndpoint = PROJECT_VALIDATION_ENDPOINT
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

  private processSuggestion(project: Project, query: string): ARIAFilterSuggestion {
    const {title, value: url} = project
    let priority = 3

    if (query) {
      if (title) priority -= fuzzyScore(query, title)
      if (url) priority -= fuzzyScore(query, url)
    }

    return {
      type: FilterValueType.Value,
      displayName: title,
      ariaLabel: `${title}, ${this.displayName}`,
      value: escapeString(url) ?? '',
      description: url,
      inlineDescription: false,
      priority,
    }
  }

  override validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    project: Project | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    const extractedValue = getUnescapedFilterValue(value.value)
    if (!extractedValue) return false

    if (project) return {displayName: project.title, value: extractedValue}

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
    }
  }
}
