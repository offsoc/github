import {type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState} from 'react'
import {verifiedFetch} from '@github-ui/verified-fetch'

interface AnalyticsContextProps {
  makeAnalyticsRequest: (method: string, body?: FormData) => void
  /*
   * Track when the pre-review banner was displayed.
   */
  loadingMessageShownTime: number | undefined
  /*
   * Use to record the time the banner rendered a loading message.
   */
  markLoadingMessageAsShown: () => void
}

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined)

export interface AnalyticsProviderProps {
  analyticsPath: string
}

export const AnalyticsProvider = ({analyticsPath, children}: PropsWithChildren<AnalyticsProviderProps>) => {
  const [loadingMessageShownTime, setLoadingMessageShownTime] = useState<number | undefined>()
  const markLoadingMessageAsShown = useCallback(() => {
    if (loadingMessageShownTime === undefined) {
      setLoadingMessageShownTime(performance.now())
    }
  }, [loadingMessageShownTime])
  const makeAnalyticsRequest = useCallback(
    async (method: string, formData?: FormData) => {
      const body = formData ?? new FormData()
      body.append('_method', method)
      await verifiedFetch(analyticsPath, {body, method})
    },
    [analyticsPath],
  )
  const providerData = useMemo(
    () =>
      ({
        makeAnalyticsRequest,
        loadingMessageShownTime,
        markLoadingMessageAsShown,
      }) satisfies AnalyticsContextProps,
    [makeAnalyticsRequest, loadingMessageShownTime, markLoadingMessageAsShown],
  )
  return <AnalyticsContext.Provider value={providerData}>{children}</AnalyticsContext.Provider>
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) throw new Error('useAnalytics must be used with AnalyticsProvider.')
  return context
}
