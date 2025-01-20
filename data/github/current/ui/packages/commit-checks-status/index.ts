export interface CombinedStatusResult {
  checksStatusSummary: string
  checksHeaderState: string
  checkRuns: CheckRun[]
}

export interface CheckRun {
  name: string
  description: string
  state: string
  targetUrl: string
  icon: string
  avatarUrl: string
  avatarDescription: string
  avatarLogo: string
  additionalContext: string
  pending: boolean
  avatarBackgroundColor: string
}

export {ChecksStatusBadge} from './ChecksStatusBadge'
export {CheckStatusDialog} from './CheckStatusDialog'
export {useCommitChecksStatusDetails} from './hooks/use-commit-checks-status-details'
