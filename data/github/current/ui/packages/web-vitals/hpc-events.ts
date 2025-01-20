import type {SoftNavMechanism} from '@github-ui/soft-nav/events'
import {getSelector} from './get-selector'

export interface HPCEventTarget extends EventTarget {
  addEventListener(
    type: 'hpc:timing',
    listener: (event: HPCTimingEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(
    type: 'hpc:dom-insertion',
    listener: (event: HPCDomInsertionEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void
}

export class HPCTimingEvent extends Event {
  name = 'HPC' as const
  value: number
  attribution: {
    element?: string
  }

  constructor(
    public soft: boolean,
    public ssr: boolean,
    public lazy: boolean,
    public alternate: boolean,
    public mechanism: SoftNavMechanism | 'hard',
    public found: boolean,
    public gqlFetched: boolean,
    public jsFetched: boolean,
    start: number,
    element: Element | null,
  ) {
    super('hpc:timing')
    this.value = performance.now() - start
    this.attribution = {
      element: getSelector(element),
    }
  }
}

export class HPCDomInsertionEvent extends Event {
  constructor(public element: Element | null) {
    super('hpc:dom-insertion')
  }
}
