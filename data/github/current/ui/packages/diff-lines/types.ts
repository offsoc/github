import type {DiffAnnotation} from '@github-ui/conversations'
import type {PatchStatus} from '@github-ui/diff-file-helpers'
import type {DiffLineType} from '@github-ui/diffs/types'

export type {CopilotChatFileDiffReferenceData} from '@github-ui/copilot-code-chat/use-file-diff-reference'

//can add more contexts here in the future as needed
export type DiffContext = 'commit' | 'pr'

export type DiffEntryData = {
  readonly diffLines: DiffLine[]
  readonly isBinary: boolean
  readonly isTooBig: boolean
  readonly linesChanged: number
  readonly newTreeEntry:
    | {
        readonly isGenerated: boolean
        readonly lineCount: number | null | undefined
        readonly mode: number
      }
    | null
    | undefined
  readonly newCommitOid?: string
  readonly objectId: string
  readonly oldTreeEntry:
    | {
        readonly lineCount: number | null | undefined
        readonly mode: number
      }
    | null
    | undefined
  readonly oldCommitOid?: string
  readonly path: string
  readonly pathDigest: string
  readonly status: PatchStatus
  readonly truncatedReason: string | null | undefined
}

export type DiffLine = {
  readonly __id?: string
  readonly left: number | null
  readonly right: number | null
  readonly blobLineNumber: number
  readonly position?: number | null
  readonly type: DiffLineType
  readonly html: string
  readonly text: string
  threadsData?: Threads
  annotationsData?: {
    readonly totalCount: number
    readonly annotations: ReadonlyArray<DiffAnnotation | null> | null
  }
}

export type Threads = {
  readonly __id?: string
  readonly totalCommentsCount: number
  readonly totalCount: number
  readonly threads: ReadonlyArray<Thread | null> | null
}

export type Thread = {
  readonly id: string
  readonly isOutdated: boolean
  readonly commentsData: Comments
  readonly diffSide: DiffSide | null
  readonly line?: number | null
  readonly startDiffSide?: DiffSide | null
  readonly startLine?: number | null
}

export type Comments = {
  readonly __id?: string
  readonly totalCount: number
  readonly comments: ReadonlyArray<Comment | null> | null
}

export type Comment = {
  readonly author: CommentAuthor | null
}

export type CommentAuthor = {
  avatarUrl: string
  login: string
  url: string
}

export const EMPTY_DIFF_LINE = 'empty-diff-line'
export type EmptyDiffLine = 'empty-diff-line'

export type ClientDiffLine = DiffLine | EmptyDiffLine

export type DiffSide = 'LEFT' | 'RIGHT'

export interface LineRange {
  diffAnchor: string
  endLineNumber: number
  endOrientation: 'left' | 'right'
  startLineNumber: number
  firstSelectedLineNumber: number
  firstSelectedOrientation: 'left' | 'right'
  startOrientation: 'left' | 'right'
}
