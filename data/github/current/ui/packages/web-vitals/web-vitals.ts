import type {
  CLSMetricWithAttribution,
  FCPMetricWithAttribution,
  FIDMetricWithAttribution,
  INPMetricWithAttribution,
  LCPMetricWithAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals/attribution'
import type {HPCTimingEvent} from './hpc-events'
import type {INPMetric} from './inp/metric'

export type WebVitalMetric =
  | CLSMetricWithAttribution
  | FCPMetricWithAttribution
  | FIDMetricWithAttribution
  | INPMetricWithAttribution
  | LCPMetricWithAttribution
  | TTFBMetricWithAttribution
  | INPMetric

export type SoftWebVitalMetric =
  | CLSMetricWithAttribution
  | FCPMetricWithAttribution
  | FIDMetricWithAttribution
  | INPMetricWithAttribution
  | LCPMetricWithAttribution
  | TTFBMetricWithAttribution

export type MetricOrHPC = WebVitalMetric | HPCTimingEvent

export function isReactLazyPayload() {
  return Boolean(document.querySelector('react-app[data-lazy="true"]'))
}

export function isReactAlternate() {
  return Boolean(document.querySelector('react-app[data-alternate="true"]'))
}

export function isHeaderRedesign() {
  return Boolean(document.querySelector('header.AppHeader'))
}

export function hasFetchedGQL(): boolean {
  return performance.getEntriesByType('resource').some(e => e.initiatorType === 'fetch' && e.name.includes('_graphql?'))
}

export function hasFetchedJS(): boolean {
  return performance.getEntriesByType('resource').some(e => e.initiatorType === 'script')
}
