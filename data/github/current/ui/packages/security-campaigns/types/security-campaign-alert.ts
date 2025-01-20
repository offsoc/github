import type {Repository} from '@github-ui/security-campaigns-shared/types/repository'
import type {LinkedBranch} from './linked-branch'
import type {LinkedPullRequest} from './linked-pull-request'

export type SecurityCampaignAlert = {
  number: number
  title: string
  ruleSeverity: RuleSeverity
  securitySeverity: SecuritySeverity | null
  toolName: string
  truncatedPath: string
  startLine: number
  createdAt: string
  isFixed: boolean
  isDismissed: boolean
  hasSuggestedFix: boolean
  campaignPath: string
  repository: Repository
  linkedPullRequests: LinkedPullRequest[]
  linkedBranches?: LinkedBranch[]
}

export enum SecuritySeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export enum RuleSeverity {
  None = 'none',
  Note = 'note',
  Warning = 'warning',
  Error = 'error',
}
