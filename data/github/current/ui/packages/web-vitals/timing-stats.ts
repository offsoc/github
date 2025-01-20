import {isReactLazyPayload, isReactAlternate, isHeaderRedesign} from './web-vitals'
import type {MetricOrHPC, SoftWebVitalMetric} from './web-vitals'
import {loaded} from '@github-ui/document-ready'
import {wasServerRendered} from '@github-ui/ssr-utils'
import {sendStats} from '@github-ui/stats'
import {sendStatToHydro} from './hydro-stats'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {getCurrentReactAppName, getLatestMechanism} from '@github-ui/soft-nav/utils'
import {MECHANISM_MAPPING} from '@github-ui/soft-nav/stats'

const initialRenderIsSSR = wasServerRendered()
const initialRenderIsLazy = isReactLazyPayload()
const initialRenderIsAlternate = isReactAlternate()

interface NetworkInformation extends EventTarget {
  readonly effectiveType: string
}

export function sendSoftVitals(metric: SoftWebVitalMetric) {
  if (metric.navigationType !== 'soft-navigation') return
  sendVitals(metric, {experimentalSoftNav: true})
}

interface SendVitalsOptions {
  experimentalSoftNav?: boolean
  url?: string
}
export function sendVitals(metric: MetricOrHPC, opts: SendVitalsOptions = {}) {
  const {name, value} = metric
  const stat: PlatformBrowserPerformanceWebVitalTiming = {
    name: opts.url || window.location.href,
    app: getCurrentReactAppName() || 'rails',
  }
  stat[name.toLowerCase() as Lowercase<typeof name>] = value

  if (isFeatureEnabled('SAMPLE_NETWORK_CONN_TYPE')) {
    stat.networkConnType = getConnectionType()
  }

  if (opts.experimentalSoftNav) {
    stat.mechanism = MECHANISM_MAPPING[getLatestMechanism()]
  }

  if (name === 'HPC') {
    stat.soft = metric.soft
    stat.ssr = metric.ssr
    stat.mechanism = MECHANISM_MAPPING[metric.mechanism]
    stat.lazy = metric.lazy
    stat.alternate = metric.alternate
    stat.hpcFound = metric.found
    stat.hpcGqlFetched = metric.gqlFetched
    stat.hpcJsFetched = metric.jsFetched
    stat.headerRedesign = isHeaderRedesign()
  } else {
    stat.ssr = initialRenderIsSSR
    stat.lazy = initialRenderIsLazy
    stat.alternate = initialRenderIsAlternate
  }

  const syntheticTest = document.querySelector('meta[name="synthetic-test"]')
  if (syntheticTest) {
    stat.synthetic = true
  }

  sendStats({webVitalTimings: [stat]})

  sendStatToHydro(metric, stat.ssr)

  updateStaffBar(name, value)
}

function updateStaffBar(name: string, value: number) {
  const staffBarContainer = document.querySelector('#staff-bar-web-vitals')
  const metricContainer = staffBarContainer?.querySelector(`[data-metric=${name.toLowerCase()}]`)

  if (!metricContainer) {
    return
  }

  metricContainer.textContent = value.toPrecision(6)
}

function isTimingSuppported(): boolean {
  return !!(window.performance && window.performance.timing && window.performance.getEntriesByType)
}

function getConnectionType() {
  if (
    'connection' in navigator &&
    navigator.connection &&
    'effectiveType' in (navigator.connection as NetworkInformation)
  ) {
    return (navigator.connection as NetworkInformation).effectiveType
  }

  return 'N/A'
}

export async function sendTimingResults() {
  if (!isTimingSuppported()) return

  await loaded
  await new Promise(resolve => setTimeout(resolve))

  sendResourceTimings()
  sendNavigationTimings()
}

const sendResourceTimings = () => {
  const resourceTimings = window.performance
    .getEntriesByType('resource')

    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (timing: any): PlatformBrowserPerformanceNavigationTiming => ({
        name: timing.name,
        entryType: timing.entryType,
        startTime: timing.startTime,
        duration: timing.duration,
        initiatorType: timing.initiatorType,
        nextHopProtocol: timing.nextHopProtocol,
        workerStart: timing.workerStart,
        redirectStart: timing.redirectStart,
        redirectEnd: timing.redirectEnd,
        fetchStart: timing.fetchStart,
        domainLookupStart: timing.domainLookupStart,
        domainLookupEnd: timing.domainLookupEnd,
        connectStart: timing.connectStart,
        connectEnd: timing.connectEnd,
        secureConnectionStart: timing.secureConnectionStart,
        requestStart: timing.requestStart,
        responseStart: timing.responseStart,
        responseEnd: timing.responseEnd,
        transferSize: timing.transferSize,
        encodedBodySize: timing.encodedBodySize,
        decodedBodySize: timing.decodedBodySize,
      }),
    )

  if (resourceTimings.length) {
    sendStats({resourceTimings}, false, 0.05)
  }
}

const sendNavigationTimings = () => {
  const navigationTimings = window.performance
    .getEntriesByType('navigation')

    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (timing: any): PlatformBrowserPerformanceNavigationTiming => ({
        activationStart: timing.activationStart,
        name: timing.name,
        entryType: timing.entryType,
        startTime: timing.startTime,
        duration: timing.duration,
        initiatorType: timing.initiatorType,
        nextHopProtocol: timing.nextHopProtocol,
        workerStart: timing.workerStart,
        redirectStart: timing.redirectStart,
        redirectEnd: timing.redirectEnd,
        fetchStart: timing.fetchStart,
        domainLookupStart: timing.domainLookupStart,
        domainLookupEnd: timing.domainLookupEnd,
        connectStart: timing.connectStart,
        connectEnd: timing.connectEnd,
        secureConnectionStart: timing.secureConnectionStart,
        requestStart: timing.requestStart,
        responseStart: timing.responseStart,
        responseEnd: timing.responseEnd,
        transferSize: timing.transferSize,
        encodedBodySize: timing.encodedBodySize,
        decodedBodySize: timing.decodedBodySize,
        unloadEventStart: timing.unloadEventStart,
        unloadEventEnd: timing.unloadEventEnd,
        domInteractive: timing.domInteractive,
        domContentLoadedEventStart: timing.domContentLoadedEventStart,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
        domComplete: timing.domComplete,
        loadEventStart: timing.loadEventStart,
        loadEventEnd: timing.loadEventEnd,
        type: timing.type,
        redirectCount: timing.redirectCount,
      }),
    )

  if (navigationTimings.length) {
    sendStats({navigationTimings}, false, 0.05)
  }
}
