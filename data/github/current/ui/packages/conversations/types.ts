import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import type {CommentSubjectTypes} from '@github-ui/commenting/CommentHeader'
import type {CommentAuthorAssociation as GraphQlCommentAuthorAssociation} from '@github-ui/commenting/IssueCommentHeader.graphql'
import type {DiffLine, LineRange} from '@github-ui/diff-lines'
import type {DiffLineType} from '@github-ui/diffs/types'
import type {FragmentRefs} from 'relay-runtime'

export type DiffAnnotationLocation = {
  start: {
    line: number
  }
  end: {
    line: number
  }
}

export enum DiffAnnotationLevels {
  Failure = 'FAILURE',
  Notice = 'NOTICE',
  Warning = 'WARNING',
}

export type DiffAnnotation = {
  id: string
  __id: string
  annotationLevel: DiffAnnotationLevels
  databaseId: number | null | undefined
  location: DiffAnnotationLocation
  message: string
  rawDetails: string | null | undefined
  path: string
  pathDigest: string
  title: string | null | undefined
  checkRun: {
    name: string
    detailsUrl: string | null | undefined
  }
  checkSuite: {
    app:
      | {
          name: string
          logoUrl: string
        }
      | null
      | undefined
    name: string | null | undefined
  }
}

export type DiffSide = 'LEFT' | 'RIGHT'

export type SuggestedChangeLineRange = {
  endLineNumber: number
  endOrientation: DiffSide
  startLineNumber: number
  startOrientation: DiffSide
}

export type SuggestedChange = {
  authorLogin: string
  commentId: string
  path: string
  suggestion: string[]
  threadId: string
  lineRange: SuggestedChangeLineRange
}

export type ApplySuggestedChangesValidationData = {
  lineRange?: SuggestedChangeLineRange
}

export type CommentingImplementation = {
  batchingEnabled: boolean
  multilineEnabled: boolean
  resolvingEnabled: boolean
  pendingSuggestedChangesBatch: SuggestedChange[]
  suggestedChangesEnabled: boolean
  lazyFetchReactionGroups: boolean
  lazyFetchEditHistory: boolean

  // submit single suggested change callback
  submitSuggestedChanges: (args: {
    commitMessage: string
    suggestedChanges: SuggestedChange[]
    onError: (error: Error, type?: string, friendlyMessage?: string) => void
    onCompleted?: () => void
  }) => void
  // add suggested change to pending batch callback
  addSuggestedChangeToPendingBatch: (suggestedChange: SuggestedChange) => void
  // remove suggested change from pending batch callback
  removeSuggestedChangeFromPendingBatch: (suggestedChange: SuggestedChange) => void
  // thread mutation callbacks
  addThread: (args: {
    diffLine?: DiffLine
    filePath: string
    isLeftSide?: boolean
    onCompleted?: (threadId: string, commentDatabaseId?: number) => void
    onError: (error: Error) => void
    selectedDiffRowRange?: LineRange
    submitBatch?: boolean
    text: string
    /**
     * Relay-specific field that allows us to update relay store
     */
    threadsConnectionId?: string
  }) => void
  addThreadReply: (args: {
    /**
     * Relay-specific field that allows us to update relay store
     */
    commentsConnectionIds?: string[]
    filePath: string
    onCompleted?: (commentDatabaseId?: number) => void
    onError: (error: Error) => void
    submitBatch?: boolean
    text: string
    thread: Thread
    /**
     * Relay-specific field that allows us to update relay store
     */
    threadsConnectionId?: string
  }) => void
  addFileLevelThread: (args: {
    filePath: string
    onCompleted?: (threadId: string, commentDatabaseId?: number) => void
    onError: (error: Error) => void
    submitBatch?: boolean
    text: string
    /**
     * Relay-specific field that allows us to update relay store
     */
    threadsConnectionId?: string
  }) => void
  deleteComment: (args: {
    commentConnectionId?: string
    commentId: string
    filePath: string
    onCompleted?: () => void
    onError: (error: Error) => void
    threadCommentCount?: number
    threadsConnectionId?: string
    threadId: string
  }) => void
  editComment: (args: {
    comment: Comment
    onCompleted?: () => void
    onError: (error: Error) => void
    text: string
  }) => void
  hideComment: (args: {
    commentId: string
    reason: string
    onCompleted?: () => void
    onError: (error: Error) => void
  }) => void
  unhideComment: (args: {commentId: string; onCompleted?: () => void; onError: (error: Error) => void}) => void
  resolveThread: (args: {onCompleted?: () => void; onError: (error: Error) => void; thread: Thread}) => void
  unresolveThread: (args: {onCompleted?: () => void; onError: (error: Error) => void; thread: Thread}) => void

  // data fetching
  fetchThread: (threadId: string, includeAssociatedDiffLines?: boolean) => Promise<Thread | undefined>

  // comment box presentation
  commentBoxConfig: CommentBoxConfig

  /**
   * The type of the subject that comments are associated to.
   * Used to determine the correct reference tooltip text to display.
   */
  commentSubjectType?: CommentSubjectTypes
}

export type Thread = {
  commentsData: Comments
  diffSide?: DiffSide
  id: string
  isOutdated?: boolean
  isResolved?: boolean
  subject?: ThreadSubject
  viewerCanReply?: boolean
  subjectType?: 'LINE' | 'FILE'
}

export type ThreadSubject = {
  diffLines?: StaticDiffLine[]
  endLine?: number | null
  endDiffSide?: DiffSide
  originalEndLine?: number | null
  originalStartLine?: number | null
  pullRequestCommit?: {
    commit: {
      abbreviatedOid: string
    }
  }
  startDiffSide?: DiffSide | null
  startLine?: number | null
}

export type StaticDiffLine = {
  __id: string
  left: number | null
  right: number | null
  type: DiffLineType
  html: string
  text: string
}

export type Comments = {
  comments: Comment[]
  __id?: string
}

export type Comment = {
  author: Author | null | undefined
  authorAssociation: GraphQlCommentAuthorAssociation
  body: string
  bodyHTML: string
  createdAt: string
  publishedAt: string | null | undefined
  currentDiffResourcePath?: string | null
  id: string
  databaseId?: number | null | undefined
  isHidden: boolean
  lastUserContentEdit: UserContentEdit | null | undefined
  minimizedReason: string | null | undefined
  outdated?: boolean
  // reference is the associated PullRequest
  reference: {
    number: number | undefined
    text?: string | null | undefined
    author:
      | {
          login: string
        }
      | null
      | undefined
  }
  repository: {
    id: string
    isPrivate: boolean
    name: string
    owner: {
      id: string
      login: string
      url: string
    }
  }
  state: string
  viewerCanBlockFromOrg: boolean
  viewerCanMinimize: boolean
  viewerCanSeeMinimizeButton: boolean
  viewerCanSeeUnminimizeButton: boolean
  viewerCanReport: boolean
  viewerCanReportToMaintainer: boolean
  viewerCanUnblockFromOrg: boolean
  viewerDidAuthor: boolean
  viewerRelationship: string
  subjectType?: string | undefined
  stafftoolsUrl?: string | null
  url: string
  viewerCanDelete: boolean
  viewerCanUpdate: boolean
  ' $fragmentSpreads': FragmentRefs<'MarkdownEditHistoryViewer_comment' | 'ReactionViewerGroups'>
}

export type Author = {
  avatarUrl: string
  id: string
  login: string
  url: string
  __typename?: 'Author'
}

export type CommentAuthor = {
  avatarUrl: string
  login: string
  url: string
}

export type UserContentEdit = {
  editor: Partial<Author> | null | undefined
  id?: string
  __typename?: 'UserContentEdit'
}

export type ThreadSummary = {
  id: string
  author: {
    avatarUrl: string
    login: string
  }
  commentCount: number
  commentsConnectionId?: string
  diffSide?: DiffSide | null
  isOutdated: boolean
  line?: number | null
  startLine?: number | null
  startDiffSide?: DiffSide | null
}

export type NavigationThread = {
  id: string
  pathDigest: string
  isResolved: boolean
  firstReviewCommentId: number | undefined | null
  line: number | null | undefined
  path: string
}

export interface MarkerNavigationImplementation {
  /**
   * Navigate to the next marker
   */
  incrementActiveMarker: (currentMarkerId: string) => void
  /**
   * Navigate to the previous marker
   */
  decrementActiveMarker: (currentMarkerId: string) => void
  /**
   * The threads and annotations available for navigation
   */
  filteredMarkers: Array<NavigationThread | DiffAnnotation>
  /**
   * Function to call after global marker navigation has been activated
   */
  onActivateGlobalMarkerNavigation: () => void
  /**
   * Active global marker id
   */
  activeGlobalMarkerID: string | undefined
}

export type SuggestedChangesConfiguration = {
  showSuggestChangesButton: boolean
  isValidSuggestionRange: boolean
  sourceContentFromDiffLines: string | undefined
  onInsertSuggestedChange: () => void
  shouldInsertSuggestedChange?: boolean
}

export type ConfigureSuggestedChangesImplementation = {
  selectedDiffRowRange: LineRange | undefined
  configureSuggestedChangesFromLineRange: (
    rowRange?: LineRange,
    shouldInsertSuggestedChange?: boolean,
  ) => SuggestedChangesConfiguration | undefined
  shouldStartNewConversationWithSuggestedChange: boolean | undefined
}

// The subject of the comment
// e.g. PullRequest or a Commit
export type Subject = {
  isInMergeQueue?: boolean
  state?: string
}

export interface ViewerData {
  avatarUrl: string
  diffViewPreference: string
  isSiteAdmin: boolean
  login: string
  tabSizePreference: number
  viewerCanComment: boolean
  viewerCanApplySuggestion: boolean
}
