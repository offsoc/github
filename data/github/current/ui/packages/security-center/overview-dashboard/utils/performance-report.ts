import {SOFT_NAV_DURATION_MARK} from '@github-ui/soft-nav/stats'
import {sendStats} from '@github-ui/stats'
import {useEffect} from 'react'

/**
 * This hook is used to measure the performance of the dashboard's main chart data fetch.
 * It will only run once, on the initial page load.
 * @param setInitialPageLoad - function to set the initial page load state. This is used to prevent the hook from running more than once.
 * @param initialPageLoad - boolean indicating whether this is the initial page load. This is used to prevent the hook from running more than once.
 * @param isLoading - boolean indicating whether the chart data is loading. This is used as dependencty, to emit the performance metric when the data is loaded.
 * @param startMark - marks when the fetch request began
 * @param endMark - marks when the fetch request finished
 * @returns void
 */
export function usePerformanceReport(
  setInitialPageLoad: (initalPageLoad: boolean) => void,
  initialPageLoad: boolean,
  isLoading: boolean,
  startMark: string,
  endMark: string,
): void {
  useEffect(() => {
    async function report(): Promise<void> {
      if (window.performance.getEntriesByName(endMark).length === 0) {
        return
      }

      const dashboardStartedMeasure = 'security_overview_dashboard_started'

      const chartTrendsMeasure = 'security_overview_dashboard_alert_trends_loaded'

      if (initialPageLoad) {
        setInitialPageLoad(false)

        if (window.performance.getEntriesByName('security_overview_dashboard_loaded').length > 0) {
          const tags: PlatformBrowserDistributionTag[] = []

          if (window.performance.getEntriesByName(SOFT_NAV_DURATION_MARK).length > 0) {
            tags.push('NAV_TURBO')
            try {
              window.performance.measure(
                dashboardStartedMeasure,
                SOFT_NAV_DURATION_MARK,
                'security_overview_dashboard_loaded',
              )
            } catch (error) {
              // We've seen cases where the soft nav duration mark is not available even after we get here,
              // so we should fall back to the default
              window.performance.measure(
                dashboardStartedMeasure,
                'navigationStart',
                'security_overview_dashboard_loaded',
              )
            }
          } else {
            window.performance.measure(dashboardStartedMeasure, 'navigationStart', 'security_overview_dashboard_loaded')
          }

          const measures = window.performance.getEntriesByName(dashboardStartedMeasure)
          const measure = measures.pop()
          if (measure && measure.duration > 0) {
            sendStats({
              distributionKey: 'SECURITY_OVERVIEW_DASHBOARD_INITIAL_START_TIME',
              distributionValue: Math.round(measure.duration),
              distributionTags: tags,
            })
          }
        }

        if (
          window.performance.getEntriesByName(startMark).length > 0 &&
          window.performance.getEntriesByName(endMark).length > 0
        ) {
          window.performance.measure(chartTrendsMeasure, startMark, endMark)
          const measures = window.performance.getEntriesByName(chartTrendsMeasure)
          const measure = measures.pop()
          if (measure && measure.duration > 0) {
            sendStats({
              distributionKey: 'SECURITY_OVERVIEW_DASHBOARD_INITIAL_ALERT_TRENDS_LOAD_TIME',
              distributionValue: Math.round(measure.duration),
            })
          }
        }
      }
      window.performance.clearMarks(startMark)
      window.performance.clearMarks(endMark)
      window.performance.clearMarks('security_overview_dashboard_loaded')
      window.performance.clearMeasures(dashboardStartedMeasure)
      window.performance.clearMeasures(chartTrendsMeasure)
    }
    report()
  }, [setInitialPageLoad, initialPageLoad, isLoading, startMark, endMark])
}
