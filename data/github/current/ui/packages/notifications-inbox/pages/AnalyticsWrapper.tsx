import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {type FC, useMemo} from 'react'

import {useQueryContext} from '../contexts'
import {useRouteInfo} from '../hooks'

export type AnalyticsWrapperProps = {
  category?: string
  metadata?: Record<string, unknown>
  children: React.ReactNode
}

export const AnalyticsWrapper: FC<AnalyticsWrapperProps> = ({category, children, metadata}) => {
  const {activeSearchQuery} = useQueryContext()
  const {viewId, notificationId} = useRouteInfo()
  const analyticsMetadata = useMemo(
    () => ({
      viewQuery: activeSearchQuery ?? '',
      viewId: viewId ?? '',
      notificationId: notificationId ?? '',
      ...metadata,
    }),
    [activeSearchQuery, metadata, notificationId, viewId],
  )
  return (
    <AnalyticsProvider appName="inbox" category={category ?? 'v2'} metadata={analyticsMetadata}>
      {children}
    </AnalyticsProvider>
  )
}
