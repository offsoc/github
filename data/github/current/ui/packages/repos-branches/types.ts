export type BranchPageType = 'overview' | 'yours' | 'active' | 'stale' | 'all'

type IssueReference = {
  title: string
  permalink: string
  isPullRequest: boolean
  state: string
  reviewableState: string | undefined
  merged: boolean
}

export type PullRequest = IssueReference & {number: number}

export type BranchPage = {
  type: BranchPageType
  title: string
  href: string
  onlyShowForPushUsers?: boolean
}

export type Author = {
  login: string
  name: string
  path: string
  avatarUrl: string
}

export type Branch = {
  name: string
  isDefault: boolean
  mergeQueueEnabled: boolean
  path: string
  rulesetsPath?: string
  protectedByBranchProtections?: boolean
  author?: Author
  authoredDate: string
  deleteable?: boolean
  deleteProtected?: boolean
  isBeingRenamed?: boolean
  renameable?: boolean
}

export type BranchMetadata = {
  oid: string
  aheadBehind: [number, number]
  maxDiverged?: number
  statusCheckRollup?: {
    state: string
    shortText: string | undefined
  }
  pullRequest?: PullRequest
  mergeQueue?: {
    path: string
    count: number
  }
  author?: Author
}

export type RenameBranchEffects = {
  prRetargetCount: number
  prRetargetRepoCount: number
  prClosureCount: number
  draftReleaseCount: number
  protectedBranchCount: number
  willPagesChange: boolean | null
}

export enum PullRequestStatus {
  Open = 'OPEN',
  Closed = 'CLOSED',
  Merged = 'MERGED',
  Draft = 'DRAFT',
}
