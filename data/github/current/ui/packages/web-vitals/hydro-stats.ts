import {sendEvent, stringifyObjectValues} from '@github-ui/hydro-analytics'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {loaded} from '@github-ui/document-ready'
import type {WebVitalMetric, MetricOrHPC} from './web-vitals'
import type {HPCTimingEvent} from './hpc-events'

interface WebVitalInformation {
  name: string
  value: number
  element?: string
}

interface HPCInformation extends WebVitalInformation {
  mechanism: HPCTimingEvent['mechanism']
  soft: boolean
}

interface HydroStat {
  react?: boolean
  reactApp?: string | null
  reactPartials?: string[]
  ssr?: boolean
  hpc?: HPCInformation
  ttfb?: WebVitalInformation
  fcp?: WebVitalInformation
  lcp?: WebVitalInformation
  fid?: WebVitalInformation
  inp?: WebVitalInformation
  cls?: WebVitalInformation
  controller?: string
  action?: string
  routePattern?: string
}

let queued: HydroStat | undefined

/**
 * Batched report of vital to hydro
 */
export function sendStatToHydro(metric: MetricOrHPC, ssr: boolean) {
  let hydroStat: HydroStat | undefined

  if (isFeatureEnabled('report_hydro_web_vitals')) return

  if (metric.value < 60_000) {
    if (!hydroStat) {
      const reactApp = document.querySelector('react-app')
      hydroStat = queueStat()
      hydroStat.react = !!reactApp
      hydroStat.reactApp = reactApp?.getAttribute('app-name')
      // Convert to Set and back to Array to remove duplicates.
      hydroStat.reactPartials = [
        ...new Set(
          Array.from(document.querySelectorAll('react-partial')).map(
            partial => partial.getAttribute('partial-name') || '',
          ),
        ),
      ]
      hydroStat.ssr = ssr
      hydroStat.controller = document.querySelector<HTMLMetaElement>('meta[name="route-controller"]')?.content
      hydroStat.action = document.querySelector<HTMLMetaElement>('meta[name="route-action"]')?.content
      hydroStat.routePattern = document.querySelector<HTMLMetaElement>('meta[name="route-pattern"]')?.content
    }

    if (metric.name === 'HPC') {
      hydroStat[metric.name.toLocaleLowerCase() as Lowercase<typeof metric.name>] = buildHPCInformation(metric)
    } else {
      hydroStat[metric.name.toLocaleLowerCase() as Lowercase<typeof metric.name>] = buildWebVitalInformation(metric)
    }
  }
}

function buildHPCInformation(metric: HPCTimingEvent): HPCInformation {
  return {
    name: metric.name,
    value: metric.value,
    element: metric.attribution?.element,
    soft: !!metric.soft,
    mechanism: metric.mechanism,
  }
}

function buildWebVitalInformation(metric: WebVitalMetric): WebVitalInformation {
  const vitalInformation: WebVitalInformation = {
    name: metric.name,
    value: metric.value,
  }

  switch (metric.name) {
    case 'LCP':
      vitalInformation.element = metric.attribution?.element
      break
    case 'FID':
    case 'INP':
      vitalInformation.element = metric.attribution?.eventTarget
      break
    case 'CLS':
      vitalInformation.element = metric.attribution?.largestShiftTarget
      break
  }

  return vitalInformation
}

/**
 * Create a new stat object and schedule it to be sent to hydro
 */
function queueStat(): HydroStat {
  if (!queued) {
    queued = {}
    scheduleSend()
  }
  return queued
}

/**
 * Schedule a send to hydro
 */
async function scheduleSend() {
  await loaded
  // eslint-disable-next-line compat/compat
  window.requestIdleCallback(send)
}

/**
 * Send the queued event to hydro
 */
function send() {
  if (!queued) return

  sendEvent('web-vital', stringifyObjectValues(queued))
  queued = undefined
}
