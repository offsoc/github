import {
  type FilterKey,
  FilterProviderType,
  type FilterSuggestion,
  type SuppliedFilterProviderOptions,
} from '@github-ui/filter'
import {StaticFilterProvider} from '@github-ui/filter/providers'
import {FileIcon, IssueOpenedIcon, RepoForkedIcon, StarIcon, TelescopeIcon} from '@primer/octicons-react'

export function getAllNumberProviders() {
  return REPOS_KEY_ONLY_FILTERS.map(
    filter => new NumberFilterProvider(filter, NUMBER_COUNT_VALUE, {filterTypes: {valueless: false}}),
  )
}

const NOT_SHOWN = 10

const REPOS_KEY_ONLY_FILTERS: FilterKey[] = [
  {displayName: 'Total stars', key: 'stars', priority: NOT_SHOWN, icon: StarIcon},
  {displayName: 'Total help-wanted issues', key: 'help-wanted-issues', priority: NOT_SHOWN, icon: IssueOpenedIcon},
  {displayName: 'Total good-first issues', key: 'good-first-issues', priority: NOT_SHOWN, icon: IssueOpenedIcon},
  {displayName: 'Total forks', key: 'forks', priority: NOT_SHOWN, icon: RepoForkedIcon},
  {displayName: 'Size (Kb)', key: 'size', priority: NOT_SHOWN, icon: FileIcon},
  {displayName: 'Total topics', key: 'topics', priority: NOT_SHOWN, icon: TelescopeIcon},
]

const NUMBER_COUNT_VALUE = [
  {value: '>0', displayName: 'At least 1', priority: 1},
  {value: '>10', displayName: 'More than 10', priority: 2},
]

class NumberFilterProvider extends StaticFilterProvider {
  constructor(filter: FilterKey, values: FilterSuggestion[], options?: SuppliedFilterProviderOptions) {
    super(filter, values, options)
    this.type = FilterProviderType.Number
  }
}
