import {fuzzyScore} from '@github-ui/fuzzy-score/fuzzy-score'

import {FILTER_KEYS} from '../constants/filter-constants'
import type {FilterQuery} from '../filter-query'
import {
  type AnyBlock,
  type ARIAFilterSuggestion,
  AvatarType,
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
import {escapeString, getFilterValue, getUnescapedFilterValue} from '../utils'
import {ValueIcon} from '../utils/ValueIcon'
import {AsyncFilterProvider} from './async'

const ORG_SUGGESTION_ENDPOINT = '/_filter/organizations'
const ORG_VALIDATION_ENDPOINT = '/_filter/organizations/validate'

export type Org = {
  name: string
  login: string
  avatarUrl: string
}

export class OrgFilterProvider extends AsyncFilterProvider<Org> implements FilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.org, options)
    this.suggestionEndpoint = ORG_SUGGESTION_ENDPOINT
    this.validationEndpoint = ORG_VALIDATION_ENDPOINT
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

  private processSuggestion(org: Org, query: string): ARIAFilterSuggestion {
    const {name, login, avatarUrl} = org
    let priority = 3

    if (query) {
      if (name) priority -= fuzzyScore(query, name)
      if (login) priority -= fuzzyScore(query, login)
    }

    return {
      type: FilterValueType.Value,
      displayName: name,
      ariaLabel: `${name}, ${this.displayName}`,
      value: escapeString(login) ?? '',
      description: login,
      inlineDescription: true,
      priority,
      icon: !avatarUrl ? this.icon : undefined,
      avatar: avatarUrl ? {url: avatarUrl, type: AvatarType.Org} : undefined,
    }
  }

  override validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    org: Org | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    const extractedValue = getUnescapedFilterValue(value.value)
    if (!org || !extractedValue) return false

    return {
      avatar: org.avatarUrl ? {url: org.avatarUrl, type: AvatarType.Org} : undefined,
      value: extractedValue,
      displayName: org.name,
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
