import type {CopilotChatFileDiffReferenceData} from '@github-ui/copilot-code-chat/use-file-diff-reference'
import type {DiffDelta} from '@github-ui/diff-file-tree'
import type {DiffEntryData} from '@github-ui/diff-lines'
import type {FileRendererBlobData} from '@github-ui/file-renderer-blob'
import type {SafeHTMLString} from '@github-ui/safe-html'
import type {VirtualItem} from 'react-virtual'

import type {Commit, CommitsBasePayload} from './shared'

export type CommitFile = Omit<DiffDelta, 'totalCommentsCount' | 'totalAnnotationsCount'>

export interface CommitPayload extends CommitsBasePayload {
  commit: CommitExtended
  //is false if it is available, otherwise is a string saying why it isn't available
  unavailableReason?: 'timeout' | 'too busy' | 'corrupt' | 'missing commits'
  commentInfo: InitialCommentInfo
  diffEntryData: DiffEntryDataWithExtraInfo[] | DiffEntryDataPathOnly[]
  splitViewPreference: SplitPreference
  fileTreeExpanded: boolean
  ignoreWhitespace: boolean
  path: string
  headerInfo: HeaderInfo
  moreDiffsToLoad: boolean
  asyncDiffLoadInfo: AsyncDiffLoadInfo
}

export interface CommitAppPayload {
  helpUrl: string
  findInDiffWorkerPath: string
}

interface AsyncDiffLoadInfo {
  byteCount: number
  lineShownCount: number
  startIndex: number
  truncated: boolean
}

export interface HeaderInfo {
  additions: number
  deletions: number
  //filesChanged is sum of other 3 filesX entries
  filesChanged: number
  filesChangedString: string
}

export type DiffEntryDataPathOnly = Pick<DiffEntryData, 'path' | 'status' | 'pathDigest'>

interface RichDiff {
  readonly canToggleRichDiff: boolean
  readonly defaultToRichDiff: boolean
  readonly proseDifffHtml?: SafeHTMLString
  readonly renderInfo?: FileRendererBlobData
  readonly dependencyDiffPath?: string
}

export interface DiffEntryDataWithExtraInfo extends DiffEntryData, RichDiff {
  readonly diffNumber: number
  readonly deletedSha?: string
  readonly linesAdded: number
  readonly linesDeleted: number
  readonly newTreeEntry:
    | {
        readonly isGenerated: boolean
        readonly lineCount: number | null | undefined
        readonly mode: number
        readonly path: string
      }
    | null
    | undefined
  readonly oldTreeEntry:
    | {
        readonly lineCount: number | null | undefined
        readonly mode: number
        readonly path: string
      }
    | null
    | undefined
  collapsed: boolean
  diffManuallyExpanded: boolean
  readonly isSubmodule: boolean
  readonly newOid: string
  readonly oldOid: string
  copilotChatReferenceData?: CopilotChatFileDiffReferenceData
}

type ScrollAlignment = 'start' | 'center' | 'end' | 'auto'

interface ScrollToOptions {
  align: ScrollAlignment
}

interface ScrollToOffsetOptions extends ScrollToOptions {}
export interface ScrollToIndexOptions extends ScrollToOptions {}

export interface VirtualizerType {
  virtualItems: VirtualItem[]
  totalSize: number
  scrollToOffset: (index: number, options?: ScrollToOffsetOptions | undefined) => void
  scrollToIndex: (index: number, options?: ScrollToIndexOptions | undefined) => void
  measure: () => void
}

export interface CommitExtended extends Commit {
  shortMessageMarkdown: SafeHTMLString
  parents: string[]
  globalRelayId: string
}

export interface InitialCommentInfo {
  canComment: boolean
  locked: boolean
  canLock: boolean
  repoArchived: boolean
}

export interface CommitComment {
  id: number
  relayId: string
  body: string
  bodyVersion: string
  htmlBody: SafeHTMLString
  createdAt: string
  updatedAt: string
  urlFragment: string
  lastUserContentEdit: {
    relayId: string
    editedAt: string | null
    editor: {
      relayId: string
      login: string
      url: string
    } | null
  } | null
  author: {
    id: string
    login: string
    avatarUrl: string
  }
  path: string | null
  position: number | null
  authorAssociation: string
  isHidden: boolean
  viewerCanDelete: boolean
  viewerCanMinimize: boolean
  viewerCanUpdate: boolean
  viewerCanReport: boolean
  viewerCanReportToMaintainer: boolean
  viewerCanBlockFromOrg: boolean
  viewerCanUnblockFromOrg: boolean
  viewerCanReadUserContentEdits: boolean
  viewerDidAuthor: boolean
  minimizedReason: string | null
}

export type SplitPreference = 'split' | 'unified'

export type DiffViewSettings = {
  hideWhitespace: boolean
  splitPreference: SplitPreference
}
