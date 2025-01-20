import type {FilterProvider} from '@github-ui/filter'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {EnterprisePaths, OrgPaths, type Paths, PathsContext} from '../common/contexts/Paths'
import {
  CodeQLRuleFilterProvider,
  createCustomPropertyFilterProviders,
  DependabotEcosystemFilterProvider,
  DependabotPackageFilterProvider,
  OwnerFilterProvider,
  RepositoryFilterProvider,
  SecretProviderFilterProvider,
  SecretTypeFilterProvider,
  TeamFilterProvider,
  ThirdPartyRuleFilterProvider,
  ToolFilterProvider,
  TopicFilterProvider,
} from '../common/filter-providers/DynamicProviders'
import {
  ArchivedFilterProvider,
  DependabotScopeFilterProvider,
  OwnerTypeFilterProvider,
  ResolutionFilterProvider,
  SecretBypassedFilterProvider,
  SecretValidityFilterProvider,
  SeverityFilterProvider,
  VisibilityFilterProvider,
} from '../common/filter-providers/StaticProviders'
import {
  SecurityCenterOverviewDashboard,
  type SecurityCenterOverviewDashboardProps,
} from '../overview-dashboard/SecurityCenterOverviewDashboard'
import {SecurityCenterOverviewSplitDashboard} from '../overview-dashboard/SecurityCenterOverviewSplitDashboard'

export interface OverviewPayload extends SecurityCenterOverviewDashboardProps {}

function usePaths(): Paths {
  const {org, business} = useParams()
  const paths = useMemo(() => {
    if (org != null) {
      return new OrgPaths(org)
    } else if (business != null) {
      return new EnterprisePaths(business)
    }
  }, [org, business])

  if (paths == null) {
    throw new Error('Failed to parse path params from current location')
  }

  return paths
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // retry up to 3 failures
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minute stale time before cache invalidation
    },
  },
})

export function Overview(): JSX.Element {
  const paths = usePaths()
  const payload = useRoutePayload<OverviewPayload>()
  const {business} = useParams()
  const showThreeTabDashboard = useFeatureFlag('security_center_dashboards_show_three_tab_dashboard')
  const showResolutionFilter = useFeatureFlag('security_center_dashboards_show_resolution_filter')
  const showSeverityFilter = useFeatureFlag('security_center_dashboards_show_severity_filter')

  const filterProviders = useMemo((): FilterProvider[] => {
    const customProperties = payload.customProperties

    const providers = [
      new RepositoryFilterProvider(paths),
      new ToolFilterProvider(paths),
      new TopicFilterProvider(paths),
      new TeamFilterProvider(paths),
      new VisibilityFilterProvider(),
      new ArchivedFilterProvider(),
      new DependabotEcosystemFilterProvider(paths),
      new DependabotPackageFilterProvider(paths),
      new DependabotScopeFilterProvider(),
      new CodeQLRuleFilterProvider(paths),
      new ThirdPartyRuleFilterProvider(paths),
      new SecretTypeFilterProvider(paths),
      new SecretProviderFilterProvider(paths),
      new SecretValidityFilterProvider(),
      new SecretBypassedFilterProvider(),
      ...createCustomPropertyFilterProviders(paths, customProperties),
      ...(showSeverityFilter ? [new SeverityFilterProvider()] : []),
      ...(showResolutionFilter ? [new ResolutionFilterProvider()] : []),
    ]

    if (business != null) {
      providers.push(new OwnerFilterProvider(paths))
      if (payload.allowOwnerTypeFiltering) {
        providers.push(new OwnerTypeFilterProvider())
      }
    }

    return providers
  }, [
    payload.customProperties,
    showSeverityFilter,
    showResolutionFilter,
    payload.allowOwnerTypeFiltering,
    paths,
    business,
  ])

  return (
    <PathsContext.Provider value={paths}>
      <QueryClientProvider client={queryClient}>
        {showThreeTabDashboard ? (
          <SecurityCenterOverviewSplitDashboard {...payload} filterProviders={filterProviders} />
        ) : (
          <SecurityCenterOverviewDashboard {...payload} filterProviders={filterProviders} />
        )}
      </QueryClientProvider>
    </PathsContext.Provider>
  )
}
