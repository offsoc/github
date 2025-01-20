import type {FilterProvider} from '@github-ui/filter'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {
  SecurityCenterCodeScanningMetrics,
  type SecurityCenterCodeScanningMetricsProps,
} from '../code-scanning-report/SecurityCenterCodeScanningMetrics'
import {EnterprisePaths, OrgPaths, type Paths, PathsContext} from '../common/contexts/Paths'
import {
  ArchivedFilterProvider,
  CodeQLAutofixStatusFilterProvider,
  CodeQLRuleFilterProvider,
  createCustomPropertyFilterProviders,
  OwnerFilterProvider,
  RepositoryFilterProvider,
  ResolutionFilterProvider,
  SeverityFilterProvider,
  StateFilterProvider,
  TeamFilterProvider,
  TopicFilterProvider,
  VisibilityFilterProvider,
} from '../common/filter-providers'
import type {CustomProperty} from '../common/filter-providers/types'

export interface CodeScanningReportPayload extends SecurityCenterCodeScanningMetricsProps {
  customProperties?: CustomProperty[]
}

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

export function useFilterProviders(
  paths: Paths,
  allowAutofixFeatures: boolean,
  customProperties?: CustomProperty[],
): FilterProvider[] {
  const showResolutionFilter = useFeatureFlag('security_center_dashboards_show_resolution_filter')
  const showSeverityFilter = useFeatureFlag('security_center_dashboards_show_severity_filter')

  return useMemo(() => {
    // Order determins the position of the filter in suggestion list.
    const providers: FilterProvider[] = [
      new RepositoryFilterProvider(paths),
      new TopicFilterProvider(paths),
      new TeamFilterProvider(paths),
      new VisibilityFilterProvider(),
      new ArchivedFilterProvider(),
      new StateFilterProvider(),
      new CodeQLRuleFilterProvider(paths),
      ...(allowAutofixFeatures ? [new CodeQLAutofixStatusFilterProvider()] : []),
      ...(showSeverityFilter ? [new SeverityFilterProvider()] : []),
      ...(showResolutionFilter ? [new ResolutionFilterProvider()] : []),
      ...createCustomPropertyFilterProviders(paths, customProperties || []),
    ]

    if (paths instanceof EnterprisePaths) {
      // Filters that only apply to enterprise-scope experience
      providers.push(new OwnerFilterProvider(paths))
    }

    return providers
  }, [paths, allowAutofixFeatures, showSeverityFilter, showResolutionFilter, customProperties])
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

export function CodeScanningReport(): JSX.Element {
  const paths = usePaths()
  const routePayload = useRoutePayload<CodeScanningReportPayload>()

  const filterProviders = useFilterProviders(
    paths,
    routePayload.allowAutofixFeatures ?? true,
    routePayload.customProperties,
  )

  const payload = {
    ...routePayload,
    filterProviders,
  }
  return (
    <PathsContext.Provider value={paths}>
      <QueryClientProvider client={queryClient}>
        <SecurityCenterCodeScanningMetrics {...payload} />
      </QueryClientProvider>
    </PathsContext.Provider>
  )
}
