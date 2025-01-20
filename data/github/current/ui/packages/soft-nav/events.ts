import {SOFT_NAV_STATE} from './states'

export type SoftNavMechanism = 'turbo' | 'react' | 'turbo.frame'

class SoftNavEvent extends Event {
  mechanism: SoftNavMechanism

  constructor(mechanism: SoftNavMechanism, type: string) {
    super(type)
    this.mechanism = mechanism
  }
}

export class SoftNavStartEvent extends SoftNavEvent {
  constructor(mechanism: SoftNavMechanism) {
    super(mechanism, SOFT_NAV_STATE.START)
  }
}

export class SoftNavSuccessEvent extends SoftNavEvent {
  visitCount: number

  constructor(mechanism: SoftNavMechanism, visitCount: number) {
    super(mechanism, SOFT_NAV_STATE.SUCCESS)
    this.visitCount = visitCount
  }
}

export class SoftNavErrorEvent extends SoftNavEvent {
  error: string

  constructor(mechanism: SoftNavMechanism, error: string) {
    super(mechanism, SOFT_NAV_STATE.ERROR)
    this.error = error
  }
}

export class SoftNavEndEvent extends SoftNavEvent {
  constructor(mechanism: SoftNavMechanism) {
    super(mechanism, SOFT_NAV_STATE.END)
  }
}
