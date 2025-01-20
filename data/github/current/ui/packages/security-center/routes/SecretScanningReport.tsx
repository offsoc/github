import type {FilterProvider} from '@github-ui/filter'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {EnterprisePaths, OrgPaths, type Paths, PathsContext} from '../common/contexts/Paths'
import {
  createCustomPropertyFilterProviders,
  OwnerFilterProvider,
  RepositoryFilterProvider,
  SecretProviderFilterProvider,
  SecretTypeFilterProvider,
  TeamFilterProvider,
  TopicFilterProvider,
} from '../common/filter-providers/DynamicProviders'
import {
  ArchivedFilterProvider,
  OwnerTypeFilterProvider,
  SecretValidityFilterProvider,
  VisibilityFilterProvider,
} from '../common/filter-providers/StaticProviders'
import type {CustomProperty} from '../common/filter-providers/types'
import {SecretScanningMetrics, type SecretScanningMetricsProps} from '../secret-scanning-report/SecretScanningMetrics'

export interface SecretScanningReportPayload extends SecretScanningMetricsProps {
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
  customProperties?: CustomProperty[],
  allowOwnerTypeFiltering?: boolean,
): FilterProvider[] {
  const isEnterpriseView = paths instanceof EnterprisePaths

  return useMemo(() => {
    const providers = [
      new ArchivedFilterProvider(),
      new VisibilityFilterProvider(),
      new RepositoryFilterProvider(paths),
      new TeamFilterProvider(paths),
      new TopicFilterProvider(paths),
      new SecretTypeFilterProvider(paths, true),
      new SecretProviderFilterProvider(paths, true),
      new SecretValidityFilterProvider(true),
      ...(isEnterpriseView ? [new OwnerFilterProvider(paths)] : []),
      ...(isEnterpriseView && allowOwnerTypeFiltering ? [new OwnerTypeFilterProvider()] : []),
      ...createCustomPropertyFilterProviders(paths, customProperties || []),
    ]

    return providers
  }, [paths, customProperties, allowOwnerTypeFiltering, isEnterpriseView])
}

const queryClient = new QueryClient()

export function SecretScanningReport(): JSX.Element {
  const paths = usePaths()
  const routePayload = useRoutePayload<SecretScanningReportPayload>()
  const filterProviders = useFilterProviders(paths, routePayload.customProperties, routePayload.allowOwnerTypeFiltering)
  const payload = {
    ...routePayload,
    filterProviders,
  }

  return (
    <PathsContext.Provider value={paths}>
      <QueryClientProvider client={queryClient}>
        <SecretScanningMetrics {...payload} />
      </QueryClientProvider>
    </PathsContext.Provider>
  )
}
