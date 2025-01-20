import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {useMemo} from 'react'

import {useQueryContext} from '../contexts/QueryContext'
import {useRouteInfo} from '../hooks/use-route-info'

type AnalyticsWrapperProps = {
  /**
   * The category to use for analytics events.
   * e.g Issues Index, Issues Dashboard, etc.
   */
  category: string

  children: React.ReactNode
}
export function AnalyticsWrapper({children, category}: AnalyticsWrapperProps) {
  const {activeSearchQuery} = useQueryContext()
  const {viewId} = useRouteInfo()
  const analyticsMetadata = useMemo(
    () => ({viewQuery: activeSearchQuery, viewId: viewId || ''}),
    [activeSearchQuery, viewId],
  )
  return (
    <AnalyticsProvider appName="issues-react" category={category} metadata={analyticsMetadata}>
      {children}
    </AnalyticsProvider>
  )
}
