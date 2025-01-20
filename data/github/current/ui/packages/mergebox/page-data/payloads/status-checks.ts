export type StatusCheckState =
  | 'ACTION_REQUIRED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'ERROR'
  | 'EXPECTED'
  | 'FAILURE'
  | 'IN_PROGRESS'
  | 'NEUTRAL'
  | 'PENDING'
  | 'QUEUED'
  | 'REQUESTED'
  | 'SKIPPED'
  | 'STALE'
  | 'STARTUP_FAILURE'
  | 'SUCCESS'
  | 'TIMED_OUT'
  | 'WAITING'
  | '_UNKNOWN_VALUE'

export type CombinedState = 'FAILED' | 'PASSED' | 'PENDING' | 'PENDING_APPROVAL' | 'PENDING_FAILED' | 'SOME_FAILED'

export type CheckStateRollup = {
  state: StatusCheckState
  count: number
}

export type AliveChannels = {
  commitHeadShaChannel: string
}

export type StatusRollup = {
  summary: CheckStateRollup[]
  combinedState: CombinedState
}

export type StatusCheck = {
  additionalContext: string
  avatarUrl: string
  description: string
  displayName: string
  durationInSeconds: number
  isRequired: boolean
  state: StatusCheckState
  stateChangedAt: string
  targetUrl: string | null
}

export type StatusChecksPageData = {
  aliveChannels: AliveChannels
  statusRollup: StatusRollup
  statusChecks: StatusCheck[]
}
