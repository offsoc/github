import type {EnrichedText} from '../columns/contracts/text'
import type {IssueState, IssueStateReason, Label, Milestone, Repository, User} from '../common-contracts'
import type {ItemTrackedByParent} from '../issues-graph/contracts'
import type {ItemCompletion} from '../memex-items/side-panel-item'

type SidePanelItemCapability = 'editTitle' | 'editDescription' | 'react' | 'comment' | 'close' | 'reopen'

export interface SidePanelMetadata {
  itemKey: IssueKey | ProjectDraftIssueKey
  /** If undefined, the item does not support reactions. */
  reactions?: Reactions
  /** If undefined, the item does not support comments. */
  comments?: ReadonlyArray<IssueComment>
  title: EnrichedText
  description: IssueMetadataDescription
  createdAt: string
  updatedAt: string
  liveUpdateChannel: string
  user: User
  state: IssueMetadataState
  /** Lists the actions that the current user can take on this item, regardless of their permissions within the current project. */
  capabilities?: ReadonlyArray<SidePanelItemCapability>
  labels?: Array<Label>
  assignees?: Array<User>
  milestone?: Milestone
  projectItemId?: number
  url?: string
  issueNumber?: number
  completion?: ItemCompletion
  slashCommandsSubjectGid?: string
  trackedBy?: Array<ItemTrackedByParent & {titleHtml: string}>
  repository?: Repository
  repositoryName?: string
}

export const ItemKeyType = {
  ISSUE: 'issue',
  PROJECT_DRAFT_ISSUE: 'project_draft_issue',
} as const
export type ItemKeyType = ObjectValues<typeof ItemKeyType>

export type IssueKey = {
  kind: typeof ItemKeyType.ISSUE
  itemId: number
  repositoryId: number
}

export type ProjectDraftIssueKey = {
  kind: typeof ItemKeyType.PROJECT_DRAFT_ISSUE
  projectItemId: number
}

export type GetSidePanelDataRequest = (IssueKey | ProjectDraftIssueKey) & {
  omitComments?: boolean
  omitCapabilities?: boolean
}

export type UpdateSidePanelDataRequest =
  | (IssueKey & UpdateSidePanelItemData)
  | (ProjectDraftIssueKey & UpdateSidePanelItemData)

export type UpdateSidePanelItemData = {
  update: Partial<{
    title: string
    body: string
    labels: Array<number>
    assignees: Array<number>
    // clear is a convention to obviously clear the milestone field on the item, since we can't
    // rely on a request with empty arrays the same way we do for labels and assignees
    milestone: number | 'clear'
  }>
  tasklist_blocks_operation?: string | null
  tasklist_blocks_operation_tracker?: string
}

export type UpdateSidePanelDataResponse = {
  title: EnrichedText
}

export interface IssueMetadataDescription {
  body: string | null
  bodyHtml: string | null
  editedAt?: string
}

export interface IssueMetadataState {
  state: IssueState
  stateReason?: IssueStateReason
}

export interface UpdateIssueStateRequest extends IssueMetadataState {
  itemId: number
  repositoryId: number
  kind: typeof ItemKeyType.ISSUE
}

type IssueCommentCapability = 'editDescription' | 'react'

export interface IssueComment {
  id: number
  createdAt: string
  updatedAt: string
  description: IssueMetadataDescription
  issueId: number
  repositoryId: number
  user: User
  authorAssociation: CommentAuthorAssociation
  viewerCanReact: boolean
  reactions: Reactions
  capabilities?: ReadonlyArray<IssueCommentCapability>
}

export interface EditCommentRequest {
  kind: typeof ItemKeyType.ISSUE
  repositoryId: number
  itemId: number
  commentId: number
  body: string
}

export interface AddCommentRequest {
  kind: typeof ItemKeyType.ISSUE
  itemId: number
  repositoryId: number
  comment: string
  updateState?: IssueState
  stateReason?: IssueStateReason
}

export interface UpdateSidePanelItemReactionRequest {
  commentId?: number
  reaction: ReactionEmotion
  command: 'react' | 'unreact'
  actor: string
  itemId: number
  repositoryId: number
  kind: typeof ItemKeyType.ISSUE
}

// Reactions are a subset of the reactions mapped to an array of users who gave that reaction
export type Reactions = {[value in ReactionEmotion]?: Array<string>}

export const ReactionEmotion = {
  HEART: 'heart',
  TADA: 'tada',
  SMILE: 'smile',
  ROCKET: 'rocket',
  EYES: 'eyes',
  THUMBS_UP: '+1',
  THUMBS_DOWN: '-1',
  THINKING_FACE: 'thinking_face',
} as const
export type ReactionEmotion = ObjectValues<typeof ReactionEmotion>

// More information can be found at https://docs.github.com/graphql/reference/enums#commentauthorassociation
export const CommentAuthorAssociation = {
  COLLABORATOR: 'COLLABORATOR',
  CONTRIBUTOR: 'CONTRIBUTOR',
  FIRST_TIMER: 'FIRST_TIMER',
  FIRST_TIME_CONTRIBUTOR: 'FIRST_TIME_CONTRIBUTOR',
  MANNEQUIN: 'MANNEQUIN',
  MEMBER: 'MEMBER',
  NONE: 'NONE',
  OWNER: 'OWNER',
} as const
export type CommentAuthorAssociation = ObjectValues<typeof CommentAuthorAssociation>
