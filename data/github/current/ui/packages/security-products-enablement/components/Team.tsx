import {FilterProviderType, FilterValueType, AvatarType} from '@github-ui/filter'
import type {
  FilterQuery,
  FilterValueData,
  ValueRowProps,
  FilterKey,
  FilterProvider,
  AnyBlock,
  MutableFilterBlock,
  FilterConfig,
  ARIAFilterSuggestion,
  IndexedBlockValueItem,
} from '@github-ui/filter'
import {AsyncFilterProvider} from '@github-ui/filter/providers'
import {escapeString, getFilterValue, getUnescapedFilterValue} from '@github-ui/filter/utils'
import {encodePart} from '@github-ui/paths'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {Octicon} from '@primer/react'
import {score} from 'fzy.js'

type Team = {
  name: string
  combined_slug: string
  avatar_url: string
}

export class TeamFilterProvider extends AsyncFilterProvider<Team> implements FilterProvider {
  constructor(organization: string, filterKey: FilterKey) {
    const endpoint = `/organizations/${encodePart(
      organization,
    )}/settings/security_products/configurations/filter-suggestions/teams`
    super(filterKey, {filterTypes: {valueless: false}})
    this.suggestionEndpoint = endpoint
    this.validationEndpoint = endpoint
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
    const {name, combined_slug: combinedSlug} = team
    let priority = 3

    if (query) {
      if (name) priority -= score(query, name)
      if (combinedSlug) priority -= score(query, combinedSlug)
    }

    return {
      type: FilterValueType.Value,
      displayName: name,
      value: escapeString(name) ?? '',
      ariaLabel: `${name}, ${this.displayName}`,
      priority,
      avatar: {url: team.avatar_url, type: AvatarType.Team},
    }
  }

  override validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    team: Team | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    const extractedValue = getUnescapedFilterValue(value.value)
    if (!team || !extractedValue) return false

    return {
      value: extractedValue,
      displayName: team.name,
    }
  }

  // how the suggestion is displayed in the filter builder ui
  getValueRowProps(value: FilterValueData): ValueRowProps {
    const filterValue = getFilterValue(value.value)
    const visual = value.avatar ? (
      <GitHubAvatar src={value.avatar.url} alt={filterValue ?? 'User Avatar'} sx={{minWidth: '20px'}} />
    ) : (
      <Octicon icon={this.icon} />
    )

    return {
      text: value.displayName ?? filterValue ?? '',
      leadingVisual: visual,
    }
  }
}
