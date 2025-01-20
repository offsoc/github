import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {useMemo} from 'react'

import {useQueryContext} from '../contexts-v1'
import {useRouteInfo} from '../hooks-v1'

export function AnalyticsWrapper({category, children}: {category?: string; children: React.ReactNode}) {
  const {activeSearchQuery} = useQueryContext()
  const {viewId} = useRouteInfo()
  const analyticsMetadata = useMemo(
    () => ({viewQuery: activeSearchQuery, viewId: viewId || ''}),
    [activeSearchQuery, viewId],
  )
  return (
    <AnalyticsProvider appName="inbox" category={category ?? 'v1'} metadata={analyticsMetadata}>
      {children}
    </AnalyticsProvider>
  )
}
