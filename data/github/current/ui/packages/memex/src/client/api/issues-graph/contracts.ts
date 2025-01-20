import type {IssueState, IssueStateReason, Label, User} from '../common-contracts'

export interface ItemCompletion {
  completed: number
  total: number
  percent: number
}

export interface TrackedByItem {
  key: {
    ownerId: number
    itemId: number
    primaryKey: {
      uuid: string
    }
  }
  title: string
  url: string
  state: IssueState
  repoName: string
  repoId: number
  userName: string
  number: number
  labels: Array<Label>
  assignees: Array<User>
  stateReason?: IssueStateReason
  completion?: ItemCompletion
  trackedByTitle?: string
}

export interface ItemTrackedByParent {
  ownerId: number
  uuid: string
  itemId: number
  title: string
  state: IssueState
  stateReason?: IssueStateReason
  url: string
  displayNumber: number
  repositoryId: number
  repositoryName: string
  ownerLogin: string
  assignees: Array<User>
  labels: Array<Label>
  position: number
  trackedByTitle?: string
}

export const TrackedBy = {
  FilterName: 'tracked-by',
} as const
export type TrackedBy = ObjectValues<typeof TrackedBy>
