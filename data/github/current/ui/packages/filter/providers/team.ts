import {fuzzyScore} from '@github-ui/fuzzy-score/fuzzy-score'

import {FILTER_KEYS} from '../constants/filter-constants'
import type {FilterQuery} from '../filter-query'
import {
  type AnyBlock,
  type ARIAFilterSuggestion,
  AvatarType,
  type FilterConfig,
  type FilterKey,
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
import {escapeString, getFilterValue, getUnescapedFilterValue} from '../utils'
import {ValueIcon} from '../utils/ValueIcon'
import {AsyncFilterProvider} from './async'

const TEAM_SUGGESTION_ENDPOINT = '/_filter/teams'
const TEAM_VALIDATION_ENDPOINT = '/_filter/teams/validate'

export type Team = {
  name: string
  combinedSlug: string
  avatarUrl: string
}

export class BaseTeamFilterProvider extends AsyncFilterProvider<Team> implements FilterProvider {
  constructor(filterKey: FilterKey, staticScope?: string, options?: SuppliedFilterProviderOptions) {
    super(filterKey, options)
    this.suggestionEndpoint = TEAM_SUGGESTION_ENDPOINT
    this.validationEndpoint = TEAM_VALIDATION_ENDPOINT
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

  private processSuggestion(team: Team, query: string): ARIAFilterSuggestion {
    const {name, combinedSlug, avatarUrl} = team
    let priority = 3

    if (query) {
      if (name) priority -= fuzzyScore(query, name)
      if (combinedSlug) priority -= fuzzyScore(query, combinedSlug)
    }

    return {
      type: FilterValueType.Value,
      displayName: name,
      value: escapeString(combinedSlug) ?? '',
      ariaLabel: `${name}, ${this.displayName}`,
      description: combinedSlug,
      inlineDescription: true,
      priority,
      icon: !avatarUrl ? this.icon : undefined,
      avatar: avatarUrl ? {url: avatarUrl, type: AvatarType.Team} : undefined,
    }
  }

  override validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    team: Team | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    const extractedValue = getUnescapedFilterValue(value.value)
    if (!extractedValue) return false

    if (team)
      return {
        avatar: team.avatarUrl ? {url: team.avatarUrl, type: AvatarType.Team} : undefined,
        value: extractedValue,
        displayName: team.name,
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
      descriptionVariant: 'inline',
      leadingVisual: ValueIcon({value, providerIcon: this.icon}),
    }
  }
}

export class TeamFilterProvider extends BaseTeamFilterProvider {
  constructor(repositoryScope?: string, options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.team, repositoryScope, options)
  }
}

export class TeamReviewRequestedFilterProvider extends BaseTeamFilterProvider {
  constructor(repositoryScope?: string, options?: SuppliedFilterProviderOptions) {
    super(FILTER_KEYS.teamReviewRequested, repositoryScope, options)
  }
}
