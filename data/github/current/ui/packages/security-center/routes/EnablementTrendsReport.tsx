import type {FilterProvider} from '@github-ui/filter'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {EnterprisePaths, OrgPaths, type Paths, PathsContext} from '../common/contexts/Paths'
import {
  createCustomPropertyFilterProviders,
  OwnerFilterProvider,
  RepositoryFilterProvider,
  TeamFilterProvider,
  TopicFilterProvider,
} from '../common/filter-providers/DynamicProviders'
import {
  ArchivedFilterProvider,
  OwnerTypeFilterProvider,
  VisibilityFilterProvider,
} from '../common/filter-providers/StaticProviders'
import type {CustomProperty} from '../common/filter-providers/types'
import {
  SecurityCenterEnablementTrendsReport,
  type SecurityCenterEnablementTrendsReportProps,
} from '../enablement-trends-report/SecurityCenterEnablementTrendsReport'

export interface EnablementTrendsReportPayload extends SecurityCenterEnablementTrendsReportProps {
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
  return useMemo(() => {
    const providers = [
      new ArchivedFilterProvider(),
      new VisibilityFilterProvider(),
      new RepositoryFilterProvider(paths),
      new TeamFilterProvider(paths),
      new TopicFilterProvider(paths),
      ...createCustomPropertyFilterProviders(paths, customProperties || []),
    ]

    if (paths instanceof EnterprisePaths) {
      providers.push(new OwnerFilterProvider(paths))
      if (allowOwnerTypeFiltering) {
        providers.push(new OwnerTypeFilterProvider())
      }
    }

    return providers
  }, [paths, customProperties, allowOwnerTypeFiltering])
}

export function EnablementTrendsReport(): JSX.Element {
  const paths = usePaths()
  const routePayload = useRoutePayload<EnablementTrendsReportPayload>()
  const filterProviders = useFilterProviders(paths, routePayload.customProperties, routePayload.allowOwnerTypeFiltering)

  const payload = {
    ...routePayload,
    filterProviders,
  }
  return (
    <PathsContext.Provider value={paths}>
      <SecurityCenterEnablementTrendsReport {...payload} />
    </PathsContext.Provider>
  )
}
