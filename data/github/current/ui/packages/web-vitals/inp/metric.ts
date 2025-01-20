import {getSelector} from '../get-selector'

interface INPAttribution {
  eventTarget?: string
}

/*
 * The INP metric. This class is compatible with web-vitals' INPMetric interface that we expect to report to DataDog and Hydro.
 */
export class INPMetric {
  name = 'INP' as const
  value: number
  entries: PerformanceEventTiming[]
  attribution: INPAttribution

  constructor(value: number, entries: PerformanceEventTiming[]) {
    this.value = value
    this.entries = entries

    const firstEntryWithTarget = entries.find(entry => entry.target)
    this.attribution = {
      eventTarget: getSelector(firstEntryWithTarget?.target),
    }
  }
}
