import {useState, useEffect} from 'react'
import {
  Filter,
  FilterProviderType,
  type FilterKey,
  type FilterProvider,
  type FilterQuery,
  type FilterSuggestion,
  type SuppliedFilterProviderOptions,
} from '@github-ui/filter'
import {LanguageFilterProvider, StaticFilterProvider} from '@github-ui/filter/providers'
import {
  getAllStaticProviders,
  getCustomPropertiesProviders,
  type PropertyDefinition,
} from '@github-ui/repos-filter/providers'
import {PeopleIcon, TasklistIcon} from '@primer/octicons-react'
import {TeamFilterProvider} from './Team'
import {useAppContext} from '../contexts/AppContext'
import type {OrganizationSecurityConfiguration} from '../security-products-enablement-types'
import {getFailureReasonValues} from '../utils/helpers'

interface SearchFilterProps {
  onSubmit: (request: FilterQuery) => void
  customConfigurationNames: string[]
  definitions: PropertyDefinition[]
  initialFilter: string
  githubRecommendedConfiguration?: OrganizationSecurityConfiguration
}

class ValuesFilterProvider extends StaticFilterProvider {
  constructor(filter: FilterKey, values: FilterSuggestion[], options?: SuppliedFilterProviderOptions) {
    super(filter, values, options)
    this.type = values.length === 0 ? FilterProviderType.Text : FilterProviderType.Select
  }
}

const comma: SuppliedFilterProviderOptions = {filterTypes: {multiKey: false, multiValue: true, valueless: false}}

const CONFIG_NAME = {
  displayName: 'Configuration',
  key: 'configuration',
  description: '',
  priority: 2,
  icon: TasklistIcon,
}

const CONFIG_STATUS = {
  displayName: 'Configuration status',
  key: 'config-status',
  description: '',
  priority: 2,
  icon: TasklistIcon,
}

const CONFIG_STATUS_VALUES = [
  {value: 'attached', displayName: 'Attached', priority: 1},
  {value: 'removed', displayName: 'Removed', priority: 1},
  {value: 'failed', displayName: 'Failed', priority: 1},
  {value: 'enforced', displayName: 'Enforced', priority: 1},
  {value: 'removed_by_enterprise', displayName: 'Removed by enterprise', priority: 1},
]

const FAILURE_REASON = {
  displayName: 'Failure reason',
  key: 'failure-reason',
  description: '',
  priority: 2,
  icon: TasklistIcon,
}

const CONFIG_TEAM: FilterKey = {
  displayName: 'Team',
  key: 'team',
  description: '',
  priority: 2,
  icon: PeopleIcon,
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSubmit,
  customConfigurationNames,
  definitions,
  initialFilter,
  githubRecommendedConfiguration,
}) => {
  const {capabilities, organization} = useAppContext()
  const [query, setQuery] = useState(initialFilter)

  const updateQuery = (q: string) => setQuery(q)

  // Ensure that we update our state when props change:
  useEffect(() => {
    setQuery(initialFilter)
  }, [initialFilter])

  const getConfigurationNameOptions = (): FilterSuggestion[] => {
    const options: FilterSuggestion[] = []

    for (const element of customConfigurationNames) {
      options.push({value: element, displayName: element, priority: 1})
    }

    if (githubRecommendedConfiguration)
      options.push({value: 'GitHub Recommended', displayName: 'GitHub Recommended', priority: 2})

    options.push({value: 'None', displayName: 'None', priority: 2})

    return options
  }

  const getProviders = (): FilterProvider[] => {
    // Filter out the archived provider since we no longer want to show archived repositories
    // in repositories list
    const staticProviders = getAllStaticProviders().filter(provider => provider.key !== 'archived')
    const filter: FilterProvider[] = [
      ...staticProviders,
      ...getCustomPropertiesProviders(definitions),
      new LanguageFilterProvider(),
      new ValuesFilterProvider(CONFIG_NAME, getConfigurationNameOptions(), comma),
      new ValuesFilterProvider(CONFIG_STATUS, CONFIG_STATUS_VALUES, comma),
      new ValuesFilterProvider(FAILURE_REASON, getFailureReasonValues(), comma),
    ]

    if (capabilities.hasTeams) filter.push(new TeamFilterProvider(organization, CONFIG_TEAM))

    return filter
  }

  return (
    <Filter
      providers={getProviders()}
      filterValue={query}
      onChange={updateQuery}
      onSubmit={onSubmit}
      id="repos-list-filter"
      sx={{flex: 1, mb: 3}}
      label="Search repositories"
      placeholder="Search repositories"
    />
  )
}

export default SearchFilter
