import {createContext} from 'react'

interface AnalyticsContextType {
  appName: string
  category: string
  metadata: {[key: string]: string}
}

export type AnalyticsProviderProps = AnalyticsContextType

export const AnalyticsContext = createContext<AnalyticsContextType | null>(null)
