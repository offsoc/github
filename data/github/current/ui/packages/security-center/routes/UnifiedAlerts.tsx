import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {OrgPaths, type Paths, PathsContext} from '../common/contexts/Paths'
import {
  ArchivedFilterProvider,
  CodeQLRuleFilterProvider,
  createCustomPropertyFilterProviders,
  DependabotEcosystemFilterProvider,
  DependabotPackageFilterProvider,
  DependabotScopeFilterProvider,
  OpenClosedFilterProvider,
  RepositoryFilterProvider,
  SecretBypassedFilterProvider,
  SecretProviderFilterProvider,
  SecretTypeFilterProvider,
  SecretValidityFilterProvider,
  SeverityFilterProvider,
  TeamFilterProvider,
  ThirdPartyRuleFilterProvider,
  ToolFilterProvider,
  TopicFilterProvider,
  VisibilityFilterProvider,
} from '../common/filter-providers'
import {
  SecurityCenterUnifiedAlerts,
  type SecurityCenterUnifiedAlertsProps,
} from '../unified-alerts/SecurityCenterUnifiedAlerts'

export interface UnifiedAlertsPayload extends SecurityCenterUnifiedAlertsProps {}

function usePaths(): Paths {
  const {org} = useParams()
  if (org == null) {
    throw new Error('Failed to parse organization from current location')
  }

  const paths = useMemo(() => {
    return new OrgPaths(org)
  }, [org])

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

export function UnifiedAlerts(): JSX.Element {
  const paths = usePaths()
  const routePayload = useRoutePayload<UnifiedAlertsPayload>()
  const showSeverityFilter = useFeatureFlag('security_center_dashboards_show_severity_filter')

  // Order determins the position of the filter in suggestion list.
  const filterProviders = [
    new RepositoryFilterProvider(paths),
    new ArchivedFilterProvider(),
    new VisibilityFilterProvider(),
    new TeamFilterProvider(paths),
    new TopicFilterProvider(paths),
    new OpenClosedFilterProvider(),
    ...(showSeverityFilter ? [new SeverityFilterProvider()] : []),
    new ToolFilterProvider(paths),
    new DependabotEcosystemFilterProvider(paths),
    new DependabotPackageFilterProvider(paths),
    new DependabotScopeFilterProvider(),
    new CodeQLRuleFilterProvider(paths),
    new ThirdPartyRuleFilterProvider(paths),
    new SecretTypeFilterProvider(paths),
    new SecretProviderFilterProvider(paths),
    new SecretValidityFilterProvider(),
    new SecretBypassedFilterProvider(),
    ...createCustomPropertyFilterProviders(paths, routePayload.customProperties),
  ]

  const payload = {
    ...routePayload,
    filterProviders,
  }
  return (
    <PathsContext.Provider value={paths}>
      <QueryClientProvider client={queryClient}>
        <SecurityCenterUnifiedAlerts {...payload} />
      </QueryClientProvider>
    </PathsContext.Provider>
  )
}
