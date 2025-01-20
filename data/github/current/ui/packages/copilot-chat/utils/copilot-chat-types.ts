import type {SafeHTMLString} from '@github-ui/safe-html'

export type TopicItem = {
  key: string
  actionItem: JSX.Element
}

export type CopilotChatRepo = {
  id: number
  name: string
  ownerLogin: string
  ownerType: 'User' | 'Organization'
  readmePath?: string
  description?: string
  commitOID: string
  ref: string
  refInfo: {
    name: string
    type: 'branch' | 'tag'
  }
  visibility: string
  languages?: Array<{name: string; percent: number}>
}

export type CopilotChatPlan = Record<string, never>

export type CopilotChatOrg = {
  id: string
  login: string
  avatarUrl: string
}

export type CopilotChatThread = {
  id: string
  name: string
  repoID?: number
  currentReferences: CopilotChatReference[] | undefined
  createdAt: string
  updatedAt: string
}

export type CopilotChatSuggestions = {
  referenceType?: string
  suggestions: GeneratedSuggestion[]
}

export type GeneratedSuggestion = {
  question: string
  skill: string
}

export type SkillExecution = {
  slug: string
  status: FunctionCalledStatus
  arguments?: string
  errorMessage?: string
  references?: CopilotChatReference[]
}

export type CopilotChatAgent = {
  name: string
  slug: string
  avatarUrl: string
  integrationUrl: string
}

export type CopilotChatMessage = {
  id: string
  intent?: string
  role: 'user' | 'assistant'
  content?: string
  createdAt: string
  threadID: string
  error?: ChatError
  references: CopilotChatReference[] | null
  skillExecutions?: SkillExecution[]
  copilotAnnotations?: CopilotAnnotations
  interrupted?: boolean
  confirmations?: CopilotAgentConfirmation[] | null // confirmation from copilot/agent
  clientConfirmations?: CopilotClientConfirmation[] | null // users response to agent confirmation
  agentErrors?: CopilotAgentError[]
}

export type CopilotAgentConfirmation = {
  title: string
  message: string
  confirmation: object
}

export type CopilotAgentError = {
  type: string
  code: string
  message: string
  identifier: string
}

export type CopilotClientConfirmation = {
  state: CopilotClientConfirmationState
  confirmation: object
}

export type CopilotClientConfirmationState = 'accepted' | 'dismissed'

export type CopilotAnnotations = {
  CodeVulnerability?: CodeVulnerability[]
}

type CodeVulnerability = {
  startOffset: number
  endOffset: number
  details: CodeVulnerabilityDetails
}

type CodeVulnerabilityDetails = {
  type: string
  uiType: string
  description: string
  uiDescription: string
}

export type RepositoryReference = CopilotChatRepo & {
  type: 'repository'
}

export interface ReferenceHeaderInfo {
  blobSize: string
  displayName: string
  isLfs: boolean
  lineInfo: {truncatedLoc: number; truncatedSloc: number}
  rawBlobUrl: string
  viewable: boolean
}

type APIResponseResource =
  | {resourceType: 'Repository'; data: Omit<RepositoryAPIReference, 'type'>}
  | {resourceType: 'Issue'; data: Omit<IssueAPIReference, 'type'>}
  | {resourceType: 'Release'; data: Omit<ReleaseAPIReference, 'type'>}
  | {resourceType: 'PullRequest'; data: Omit<PullRequestAPIReference, 'type'>}
  | {resourceType: 'Commit'; data: Omit<CommitAPIReference, 'type'>}
  | {resourceType: 'Topic'; data: Omit<TopicAPIReference, 'type'>}

export type APIResponseReference = APIResponseResource & {
  type: 'api-response'
  id: number
  repo?: string
}

export type FileReference = {
  type: 'file' | 'file-v2'
  url: string
  path: string
  repoID: number
  repoOwner: string
  repoName: string
  ref: string
  commitOID: string
  languageName?: string
  languageId?: number
}

export type FileChangesReference = {
  type: 'file-changes'
  ref: string
  path: string
  url: string
  commits: Array<{
    oid: string
    shortSha: string
    message: string
    createdAt: string
    author: {
      name: string
      email: string
      login: string
    }
    blameLines: Array<{
      lineNo: number
      text: string
    }>
  }>
  repository: {
    id: number
    name: string
    owner: string
  }
}

export interface FileReferenceDetails extends FileReference {
  contents: string
  highlightedContents: SafeHTMLString[]
  repoIsOrgOwned: boolean
  range: LineRange
  expandedRange: LineRange
  headerInfo: ReferenceHeaderInfo
}

export interface FileDiffReference {
  type: 'file-diff'
  id: string
  url: string
  base: SnippetReference | null // will be null if a file was 'added'
  head: SnippetReference | null // will be null if a file was 'removed'
  baseFile: FileReference | null // will be null if a file was 'added'
  headFile: FileReference | null // will be null if a file was 'removed'
  // user-selected, shown in location.hash, ex L1-R5
  // won't be populated in the server props but should be present when calling CAPI
  selectedRange?: {
    start?: string
    end?: string
  }
}

export interface FileDiffReferenceDetails extends FileDiffReference {
  contents: string
  highlightedContents: SafeHTMLString[]
  repoIsOrgOwned: boolean
  expandedRange: LineRange
}

export interface SnippetReference {
  type: 'snippet'
  url: string
  path: string
  repoID: number
  repoOwner: string
  repoName: string
  ref: string
  commitOID: string
  range: LineRange
  languageID?: number
  languageName?: string
  title?: string
}

export interface SnippetReferenceDetails extends SnippetReference {
  contents: string
  highlightedContents: SafeHTMLString[]
  repoIsOrgOwned: boolean
  expandedRange: LineRange
  headerInfo: ReferenceHeaderInfo
}

export interface CommitReference {
  type: 'commit'
  oid: string
  message: string
  permalink: string
  author: {
    name: string
    email: string
    login: string
  }
  repository: {
    id: number
    name: string
    owner: string
  }
}

export interface PullRequestReference {
  type: 'pull-request'
  title: string
  url: string
  commit?: string
  authorLogin: string
  repository: CopilotChatRepo
}

export const TREE_COMPARISON_REFERENCE_TYPE = 'tree-comparison'
export interface TreeComparisonReference {
  type: typeof TREE_COMPARISON_REFERENCE_TYPE
  baseRepoId: number
  headRepoId: number
  baseRevision: string
  headRevision: string
  diffHunks: DiffHunk[]
}

export interface DiffHunk {
  type: 'diff-hunk'
  changeReference: string
  diff: string
  fileName: string
  headerContext: string
}

export interface IssueReference {
  type: 'issue'
  id: number
  number: number
  repository: {
    id: number
    name: string
    owner: string
  }
  title?: string
  body?: string
  state?: string
  authorLogin?: string
  url?: string
  assignees?: string[]
  pullRequestUrl?: string
}

export interface DiscussionReference {
  type: 'discussion'
  number: number
  title: string
  body: string
  user: {
    login: string
  }
  state: string
  id: number
  url: string
  authorLogin: string
  repository: {
    id: number
    name: string
    owner: string
  }
}

export interface ReleaseReference {
  type: 'release'
  name?: string
  tagName?: string
  url?: string
  repository: {
    id: number
    name: string
    owner: string
  }
  body?: string
  isDraft: boolean
  isPrerelease: boolean
  authorLogin?: string
  targetCommitish?: string
}

export interface ReleaseAPIReference {
  type: 'release.api'
  name?: string
  tag_name: string
  html_url?: string
}

export interface PullRequestAPIReference {
  type: 'pull-request.api'
  title?: string
  html_url?: string
  number: number
  repo?: string
}

export interface AlertReference {
  type: 'alert.api'
  number: number
  repo?: string
}

export interface IssueAPIReference {
  type: 'issue.api'
  title?: string
  html_url: string
  number: number
  repo?: string
  state: string
}

export interface RepositoryAPIReference {
  type: 'repository.api'
  name: string
  description?: string
  html_url?: string
}

export interface CommitAPIReference {
  type: 'commit.api'
  sha: string
  commit: {
    message?: string
  }
  html_url?: string
}

export interface DiffAPIReference {
  type: 'diff.api'
}

export interface FileAPIReference {
  type: 'file.api'
}

export interface TopicAPIReference {
  type: 'topic.api'
  name: string
  display_name?: string
  short_description?: string
}

export interface TextReference {
  type: 'text'
  text?: string
}

export interface UnsupportedAPIReference {
  type: 'unsupported'
  text?: string
}

export interface LineRange {
  start: number
  end: number
}

export interface CodeNavSymbolReference {
  type: 'symbol'
  kind: 'codeNavSymbol'
  name: string
  languageID?: number
  codeNavDefinitions?: CodeNavSymbol[]
  codeNavReferences?: CodeReference[]
  languageName?: string
}

export interface CodeNavSymbolReferenceDetails extends CodeNavSymbolReference {
  codeNavDefinitions?: CodeNavSymbolDetails[]
  codeNavReferences?: CodeReferenceDetails[]
}

export interface SuggestionSymbolReference {
  type: 'symbol'
  kind: 'suggestionSymbol'
  name: string
  languageID?: number
  suggestionDefinitions?: SuggestionSymbol[]
}

export interface SuggestionSymbolReferenceDetails extends SuggestionSymbolReference {
  suggestionDefinitions?: SuggestionSymbolDetails[]
}

export type DocsetReference = {
  type: 'docset'
  name: string
  id: string
  scopingQuery: string // TODO: is this the correct name for CAPI?
  avatarUrl: string
  // Docset references coming from previous threads in CAPI currently don't have their
  // repos serialized.
  repos?: string[]
  description: string
}

export type GitHubAgentReference = {
  type: 'github.agent'
  login: string
  avatarURL: string
}

export type WebSearchReference = {
  type: 'web-search'
  query: string
  results: Array<{title: string; excerpt: string; url: string}>
  status: string
}

export type SupportDocumentReference = {
  type: 'support-document'
  query: string
  results: Array<{title: string; content: string; url: string}>
  status: string
}

export type JobReference = {
  type: 'job'
  id: string
  repoId: number
  repoName: string
  repoOwner: string
}

export type PlanReference = {
  type: 'plan'
}

type CodeNavSymbol = {
  ident: Range
  extent: Range
} & CodeSymbol

type SuggestionSymbol = {
  identOffset?: ByteOffset
  extentOffset?: ByteOffset
} & CodeSymbol

type CodeSymbol = {
  kind: string
  fullyQualifiedName: string
  repoID: number
  repoOwner: string
  repoName: string
  ref: string
  commitOID: string
  path: string
}

type CodeReference = {
  ident: Range
  repoID: number
  repoOwner: string
  repoName: string
  ref: string
  commitOID: string
  path: string
}

type SymbolDetails = {
  repoIsOrgOwned: boolean
  highlightedContents?: SafeHTMLString[]
  range?: LineRange
}

export type CodeNavSymbolDetails = CodeNavSymbol & SymbolDetails
export type SuggestionSymbolDetails = SuggestionSymbol & SymbolDetails
export type CodeReferenceDetails = CodeReference & SymbolDetails

type Range = {
  start: Position
  end: Position
}

type Position = {
  line: number
  column: number
}

type ByteOffset = {
  start: number
  end: number
}

export type CopilotChatReference =
  | FileReference
  | FileChangesReference
  | SnippetReference
  | FileDiffReference
  | RepositoryReference
  | CodeNavSymbolReference
  | SuggestionSymbolReference
  | DocsetReference
  | CommitReference
  | PullRequestReference
  | GitHubAgentReference
  | WebSearchReference
  | TreeComparisonReference
  | IssueReference
  | TextReference
  | ReleaseReference
  | DiscussionReference
  | JobReference
  | PlanReference
  | ReleaseAPIReference
  | PullRequestAPIReference
  | AlertReference
  | IssueAPIReference
  | RepositoryAPIReference
  | CommitAPIReference
  | DiffAPIReference
  | FileAPIReference
  | TopicAPIReference
  | APIResponseReference
  | UnsupportedAPIReference

export type NumberedCopilotChatReference = CopilotChatReference & {n: number}

export type CopilotChatReferenceDetails = SnippetReferenceDetails

export type ReferenceDetails<TReference extends CopilotChatReference> = TReference extends SnippetReference
  ? SnippetReferenceDetails
  : TReference extends FileReference
    ? FileReferenceDetails
    : TReference extends CodeNavSymbolReference
      ? CodeNavSymbolReferenceDetails
      : TReference extends SuggestionSymbolReference
        ? SuggestionSymbolReferenceDetails
        : TReference extends FileDiffReference
          ? FileDiffReferenceDetails
          : unknown

type CopilotChatExplainEventPayload = {
  intent: typeof CopilotChatIntents.explain
  content: string
  references: CopilotChatReference[]
  id?: string
}

type CopilotChatAskEventPayload = {
  intent: typeof CopilotChatIntents.conversation
  references?: CopilotChatReference[]
  id?: string
}

type CopilotChatAskPrEventPayload = {
  intent: typeof CopilotChatIntents.conversation
  references: CopilotChatReference[]
  id?: string
}

type CopilotChatExplainPrEventPayload = {
  intent: typeof CopilotChatIntents.explainFileDiff
  content: string
  references: CopilotChatReference[]
  id?: string
}

type CopilotChatSuggestEventPayload = {
  intent: typeof CopilotChatIntents.suggest
  content: string
  references: CopilotChatReference[]
  id?: string
}

type CopilotChatReviewPrEventPayload = {
  intent: typeof CopilotChatIntents.reviewPr
  content: string
  references: CopilotChatReference[]
  completion: string
  thread: CopilotChatThread
  id?: string
}

type CopilotChatStartConversationPayload = {
  intent: typeof CopilotChatIntents.conversation
  content: string
  references: CopilotChatReference[]
  id?: string
}

export type CopilotChatEventPayload =
  | CopilotChatExplainEventPayload
  | CopilotChatAskEventPayload
  | CopilotChatSuggestEventPayload
  | CopilotChatAskPrEventPayload
  | CopilotChatExplainPrEventPayload
  | CopilotChatReviewPrEventPayload
  | CopilotChatStartConversationPayload

export const CopilotChatIntents = {
  explain: 'explain',
  conversation: 'conversation',
  suggest: 'suggest',
  askDocs: 'ask-docs',
  discussFileDiff: 'discuss-file-diff',
  explainFileDiff: 'explain-file-diff',
  reviewPr: 'review-pull-request',
} as const
export type CopilotChatIntentsType = (typeof CopilotChatIntents)[keyof typeof CopilotChatIntents]

interface ChatErrorBase {
  type: MessageStreamingErrorType | 'basic'
  isError: boolean
  message?: string
  details?: unknown
}

interface BasicChatError extends ChatErrorBase {
  type: 'basic'
  isError: true
}

interface AgentError<TType extends MessageStreamingErrorType, TDetails> extends ChatErrorBase {
  type: TType
  isError: true
  details: TDetails
}

export type AgentUnauthorizedChatError = AgentError<'agentUnauthorized', NotAuthorizedForAgentErrorPayload>
export type AgentRequestChatError = AgentError<'agentRequest', AppAgentRequestErrorPayload>
export type AgentChatError = AgentUnauthorizedChatError | AgentRequestChatError

export type ChatError = BasicChatError | AgentChatError

export type BlackbirdSymbol = {
  fully_qualified_name: string
  kind: string
  ident_start: number
  ident_end: number
  extent_start: number
  extent_end: number
}

export interface BlackbirdSuggestion {
  kind: string
  query: string
  repository_nwo: string
  language_id: number
  path: string
  repository_id: number
  commit_sha: string
  line_number: number
  symbol: BlackbirdSymbol | null
}

export type SuggestionsResponse = {
  suggestions: BlackbirdSuggestion[]
  queryErrors: string[]
  failed: boolean
}

export type KnowledgeBasesResponse = {
  knowledgeBases: Docset[]
  administratedCopilotEnterpriseOrganizations: CopilotChatOrg[] | null
}

export interface Docset {
  id: string
  name: string
  description: string
  createdByID: number
  ownerID: number
  ownerLogin: string
  ownerType: string
  visibility: string
  scopingQuery: string
  repos: string[]
  sourceRepos?: SourceRepo[]
  visibleOutsideOrg: boolean
  iconHtml?: SafeHTMLString
  avatarUrl: string
  adminableByUser: boolean
  /**
   * Orgs which own at least one repo in the docset but that the current user is not currently SSO'd into
   */
  protectedOrganizations: string[]
}

export interface RepoData {
  databaseId: number | null | undefined
  name: string
  nameWithOwner: string
  isInOrganization: boolean
  shortDescriptionHTML: string
  paths?: string[]
  owner: {
    databaseId: number | null | undefined
    avatarUrl: string
    login: string
  }
}

export interface DocsetRepo extends RepoData {
  paths: string[]
}

export interface SourceRepo {
  id: number
  ownerID: number
  paths: string[]
}

export type MessageStreamingResponse =
  | MessageStreamingResponseContent
  | MessageStreamingResponseError
  | MessageStreamingResponseComplete
  | MessageStreamingResponseDebug
  | MessageStreamingResponseFunctionCall
  | MessageStreamingResponseConfirmation
  | MessageStreamingResponseAgentError

export type MessageStreamingResponseContent = {
  type: 'content'
  body: string
}

export type MessageStreamingResponseDebug = {
  type: 'debug'
  body: string
}

export const MESSAGE_STREAMING_ERROR_TYPES = [
  'exception',
  'filtered',
  'contentTooLarge',
  'rateLimit',
  'agentUnauthorized',
  'agentRequest',
  'networkError',
  'multipleAgentsAttempt',
] as const

type MessageStreamingErrorTypes = typeof MESSAGE_STREAMING_ERROR_TYPES
export type MessageStreamingErrorType = MessageStreamingErrorTypes[number]

export type MessageStreamingResponseError = {
  type: 'error'
  errorType: MessageStreamingErrorType
  description: string
}

export type MessageStreamingResponseComplete = {
  type: 'complete'
  id: string
  turnID: string
  createdAt: string
  intent: string
  references: CopilotChatReference[] | null
  copilotAnnotations?: CopilotAnnotations
}

export type MessageStreamingResponseFunctionCall = {
  arguments: string
  type: 'functionCall'
  name: string
  status: FunctionCalledStatus
  errorMessage: string
  references: CopilotChatReference[]
}

export type MessageStreamingResponseConfirmation = {
  type: 'confirmation'
  title: string
  message: string
  confirmation: object
}

export type MessageStreamingResponseAgentError = {
  type: 'agentError'
  agentErrorType: string
  code: string
  message: string
  identifier: string
}

export type FunctionArguments =
  | BingSearchArguments
  | FilePathSearchArguments
  | SymbolSearchArguments
  | CodeSearchArguments
  | CreateIssueArguments
  | GetIssueArguments
  | GetPullRequestCommitsArguments
  | GetCommitArguments
  | GetAlertArguments
  | GetReleaseArguments
  | GetRepoArguments
  | JobLogsArguments
  | GetDiffArguments
  | GetDiffByRangeArguments
  | KnowledgeBaseSearchArguments
  | GetFileArguments
  | GetFileChangesArguments
  | GetDiscussionArguments
  | GetPullRequestArguments
  | PlanArguments
  | GitHubAPIArguments
  | SupportSearchArguments

export type BingSearchArguments = {kind: 'bing-search'; query: string; freshness?: string}
export type SupportSearchArguments = {kind: 'support-search'; rawUserQuery: string}
export type CodeSearchArguments = {kind: 'codesearch'; query: string; scopingQuery: string}
export type KnowledgeBaseSearchArguments = {kind: 'kb-search'; query: string; kbID: string}
export type FilePathSearchArguments = {kind: 'pathsearch'; filename: string; scopingQuery: string}
export type GetFileArguments = {kind: 'getfile'; repo: string; path: string; ref?: string}
export type GetFileChangesArguments = {kind: 'getfilechanges'; repo: string; path: string; ref: string; max?: number}
export type SymbolSearchArguments = {kind: 'show-symbol-definition'; symbolName: string; scopingQuery: string}
export type CreateIssueArguments = {
  kind: 'githubissuecreate'
  repo: string
  assignees: string[]
  labels: string[]
  title: string
  body: string
}
export type GetIssueArguments = {kind: 'getissue'; issueNumber: number; repo: string}
export type GetAlertArguments = {kind: 'getalert'; url: string}
export type GetPullRequestCommitsArguments = {kind: 'getprcommits'; pullRequestNumber: number; repo: string}
export type GetCommitArguments = {kind: 'getcommit'; commitish: number; repo: string}
export type GetReleaseArguments = {kind: 'getrelease'; repo: string; tagName?: string}
export type GetRepoArguments = {kind: 'getrepo'; repo: string}
export type JobLogsArguments = {
  kind: 'get-actions-job-logs'
  repo: string
  jobId?: number
  pullRequestNumber?: number
  runId?: number
  workflowPath?: string
}
export type GetDiffArguments = {
  kind: 'getdiff'
  baseRepoId: number
  headRepoId: number
  baseRevision: string
  headRevision: string
}
export type GetDiffByRangeArguments = {kind: 'get-diff-by-range'; repo: string; range: string}
export type GetDiscussionArguments = {kind: 'getdiscussion'; repo: string; discussionNumber: number; owner: string}
export type GetPullRequestArguments = {kind: 'getpullrequest'; pullRequestNumber: number; repo: string}
export type PlanArguments = {kind: 'planskill'; user_query: string}
export type GitHubAPIArguments = {
  kind: 'get-github-data'
  endpoint: string
  repo: string
  endpointDescription?: string
  task?: string
}

export const SUPPORTED_FUNCTIONS = [
  'bing-search',
  'codesearch',
  'kb-search',
  'pathsearch',
  'show-symbol-definition',
  'getissue',
  'getprcommits',
  'getcommit',
  'getrelease',
  'getrepo',
  'getdiff',
  'get-diff-by-range',
  'getfile',
  'getfilechanges',
  'getdiscussion',
  'get-actions-job-logs',
  'getpullrequest',
  'getalert',
  'planskill',
  'get-github-data',
  'support-search',
]

export type FunctionCalledStatus = 'completed' | 'started' | 'error' | 'unsupported'

export type NotAuthorizedForAgentErrorPayload = {
  authorize_url: string
  client_id: string
  name: string
  avatar_url: string
  slug: string
  description: string
}

export type AppAgentRequestErrorPayload = {
  type: string
  code: string
  identifier: string
  message: string
}

export type CopilotChatMode = 'immersive' | 'assistive'

export type SuccessfulAPIResult<T> = {
  status: number
  ok: true
  payload: T
}

export type FailedAPIResult = {
  status: number
  ok: false
  error: string
}

export type APIResult<T> = SuccessfulAPIResult<T> | FailedAPIResult

type SuccessfulAPIStreamingResult = {
  status: number
  ok: true
  response: Response
}

export type APIStreamingResult = SuccessfulAPIStreamingResult | FailedAPIResult

export interface CopilotChatPayload {
  agentsPath: string
  apiURL: string
  currentUserLogin: string
  customInstructions?: string
  renderKnowledgeBases?: boolean
  optedInToUserFeedback: boolean
  renderAttachKnowledgeBaseHerePopover?: boolean
  renderKnowledgeBaseAttachedToChatPopover?: boolean
  reviewLab: boolean
}
