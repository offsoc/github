import {useMemo} from 'react'
import type {PropsWithChildren} from 'react'
import {AnalyticsContext, type AnalyticsProviderProps} from './context'

export function AnalyticsProvider({children, appName, category, metadata}: PropsWithChildren<AnalyticsProviderProps>) {
  const value = useMemo(() => ({appName, category, metadata}), [appName, category, metadata])
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}
