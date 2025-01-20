import type {RemoteProvider} from '@github/codespaces-lsp'
import type {ReposFileTreeData, WebCommitInfo} from '@github-ui/code-view-types'
import type {
  CopilotChatOrg,
  CopilotChatPayload,
  CopilotChatRepo,
} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import type {Repository} from '@github-ui/current-repository'
import type {CurrentUser, RefInfo} from '@github-ui/repos-types'
import type {SafeHTMLString} from '@github-ui/safe-html'
import type {FileStatuses} from '@github-ui/web-commit-dialog'
import type {ParsedDiff} from 'diff'

export interface Label {
  color: string
  name: string
}

export interface PullRequestData {
  number: string
  title: string
  headBranch: string
  headSHA: string
  baseBranch: string
}

interface CopilotTaskChatPayload extends CopilotChatPayload {
  ssoOrganizations: CopilotChatOrg[]
  currentTopic: CopilotChatRepo
}

export interface CopilotTaskBasePayload {
  compareRef?: string
  copilotAccessAllowed: boolean
  currentUser?: CurrentUser
  diffPaths?: ReposFileTreeData
  fileStatuses?: FileStatuses
  fileTree: ReposFileTreeData
  fileTreeProcessingTime: number
  findFileWorkerPath: string
  foldersToFetch: string[]
  helpUrl: string
  path: string
  pullRequest: PullRequestData
  refInfo: RefInfo
  repo: Repository
  webCommitInfo: WebCommitInfo
  copilot: CopilotTaskChatPayload
  focusedTask?: FocusedTaskData
  showOverview?: boolean
}

export const TaskTypes = {
  Suggestion: 'suggestion',
  Generative: 'generative',
}

export interface FocusedTaskData {
  sourceId: number
  sourceType: string
  suggester?: Suggester
  html: SafeHTMLString
  suggestions: FocusedTaskSuggestion[]
  type: string
}

export interface FocusedSuggestionTaskData extends FocusedTaskData {
  type: typeof TaskTypes.Suggestion
}

export interface Suggester {
  displayLogin: string
  avatarUrl: string
}
// Subset of ParsedDiff we need to apply suggestion
export interface FocusedTaskSuggestion {
  filePath: string
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: string[]
}

export interface FocusedGenerativeTaskData extends FocusedTaskData {
  comments: ThreadComment[]
  type: typeof TaskTypes.Generative
}

export interface ThreadComment {
  author: {
    avatarUrl: string
    login: string
  }
  body: string
  createdAt: string
  id: number
}

export interface ITunnelProperties {
  tunnelId: string
  clusterId: string
  domain: string
  connectAccessToken: string
  managePortsAccessToken: string
  serviceUri: string
}

export interface CodespaceInfoBase {
  cloud_environment: {
    guid: string
  }
  environment_data: {
    state: string
    connection: {
      sessionPath: string
      tunnelProperties: ITunnelProperties
    }
  }
}

export interface ConnectedCodespaceData {
  codespaceInfo: CodespaceInfoBase | null
  isCodespaceReady: boolean
  workspaceRoot: string
  remoteProvider?: RemoteProvider
}

export interface OverviewPullRequestData extends PullRequestData {
  baseBranch: string
  bodyHtml: string
  labels: Label[]
  titleHtml: string
}

export interface OverviewPayload extends CopilotTaskBasePayload {
  pullRequest: OverviewPullRequestData
}

export interface CodeEditorPayload extends CopilotTaskBasePayload {
  blobContents?: string
  blobLanguage?: string
  compareBlobContents?: string
}

export type BlobPayload = Pick<CodeEditorPayload, 'blobContents' | 'path'>

export interface FileDataStore {
  addFile: (path: string) => void
  applySuggestionsToContent: (originals: BlobPayload[]) => void
  editFile: (args: {filePath: string; originalContent?: string; newFilePath?: string; newFileContent?: string}) => void
  getAppliedSuggestions: () => number[]
  getChangedFiles: () => ChangedFile[]
  getCurrentFileContent: (path: string, originalContent: string | undefined) => string | undefined
  getFileStatuses: () => FileStatuses
  getFileTreeData: (mode: FileFilter) => ReposFileTreeData | undefined
  markFilesCommitted: (paths: Iterable<string>) => void
  renameFile(args: {oldFilePath: string; newFilePath: string; originalContent: string | undefined}): void
  resetFiles: () => void
}

export enum FileFilter {
  All = 'All files in this repository',
  PR = 'Files in this pull request',
}

export interface ChangedFile {
  patch: ParsedDiff
  path: string
  status: 'A' | 'D' | 'M' | 'R' | undefined
}
