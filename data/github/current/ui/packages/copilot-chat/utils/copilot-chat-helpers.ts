import {repositoryTreePath} from '@github-ui/paths'

import type {
  BlackbirdSuggestion,
  ChatError,
  CopilotChatMessage,
  CopilotChatMode,
  CopilotChatReference,
  CopilotChatRepo,
  CopilotChatThread,
  CopilotClientConfirmation,
  Docset,
  DocsetReference,
  FileChangesReference,
  FileDiffReference,
  FileReference,
  GitHubAgentReference,
  RepositoryReference,
  SnippetReference,
  SuggestionSymbolReference,
  TreeComparisonReference,
} from './copilot-chat-types'

export const COPILOT_PATH = '/copilot'

export function buildMessage({
  role,
  content,
  error,
  references = [],
  thread,
  confirmations,
}: {
  role: 'user' | 'assistant'
  content: string
  error?: ChatError
  references?: CopilotChatReference[]
  thread?: CopilotChatThread | null
  confirmations?: CopilotClientConfirmation[]
}): CopilotChatMessage {
  return {
    id: crypto.randomUUID(),
    threadID: thread?.id || 'temp',
    role,
    content,
    createdAt: new Date().toISOString(),
    error,
    references,
    skillExecutions: [],
    clientConfirmations: confirmations,
  }
}

export function threadName(thread: CopilotChatThread | undefined | null): string {
  return thread?.name || 'New conversation'
}

export function referenceName(ref: CopilotChatReference): string {
  switch (ref.type) {
    case 'file':
      return fileRefName(ref)
    case 'file-diff':
      return fileDiffRefName(ref)
    case 'snippet':
      return snippetRefName(ref)
    case 'repository':
      return repoRefName(ref)
    case 'symbol':
    case 'docset':
      return ref.name
    case 'commit':
      return ref.message
    case 'pull-request':
      return ref.title
    case 'tree-comparison':
      return diffRefName(ref)
    default:
      return 'unrecognized reference'
  }
}

export function referenceID(ref: CopilotChatReference): string {
  switch (ref.type) {
    case 'file':
      return `${ref.type}-${ref.repoOwner}/${ref.repoName}@${ref.commitOID}:${ref.path}`
    case 'file-changes':
      return `${ref.type}-${ref.repository.owner}/${ref.repository.owner}@${ref.ref}:${ref.path}`
    case 'file-diff':
      return `${ref.type}:${ref.baseFile?.path}@${ref.baseFile?.commitOID}-${ref.headFile?.path}@${ref.headFile?.commitOID}##${ref.selectedRange?.start}-${ref.selectedRange?.end}`
    case 'snippet':
      return `${ref.type}-${ref.repoOwner}/${ref.repoName}@${ref.commitOID}:${ref.path}#${ref.range.start}-${ref.range.end}`
    case 'repository':
      return `${ref.type}-${ref.id}-${ref.ownerLogin}/${ref.name}`
    case 'symbol':
      return `${ref.type}-${ref.kind}-${ref.name}` // TODO: attach repo?
    case 'docset':
      return `${ref.type}-${ref.name}` // TODO: repo too?
    case 'commit':
      return `${ref.type}-@${ref.oid}-${ref.repository.owner}/${ref.repository.name}`
    case 'pull-request':
      return `${ref.type}-${ref.commit}-${ref.repository.ownerLogin}/${ref.repository.name}`
    case 'web-search':
      return `${ref.type}-${ref.query}`
    default:
      return ''
  }
}

function isMarkdown(reference: CopilotChatReference): boolean {
  if (reference.type !== 'file' && reference.type !== 'snippet') return false
  if (!reference.languageName) return false
  return reference.languageName.toLowerCase() === 'markdown'
}

function plainRenderableUrl(ref: SnippetReference): string {
  // Force .md files to render the code view so line ranges can be seen
  if (isMarkdown(ref)) {
    const url = new URL(ref.url, window.location.origin)
    url.search = 'plain=1'
    return url.href
  }

  return ref.url
}

export function referenceURL(ref: CopilotChatReference): string {
  switch (ref.type) {
    case 'file':
    case 'file-diff':
    case 'pull-request':
      return ref.url
    case 'repository':
      return `/${ref.ownerLogin}/${ref.name}`
    case 'commit':
      return ref.permalink
    case 'snippet':
      return plainRenderableUrl(ref)
    // TODO: handle symbol and docset URLs
    case 'symbol':
    case 'docset':
    default:
      return '#'
  }
}

/**
 * Returns the folder of the reference.
 *
 * e.g. for "/foo/bar/file.ts" returns "foo/bar"
 */
export function referencePath(ref: FileReference | SnippetReference): string {
  const split = ref.path.split('/')
  split.pop()
  if (split.length === 0) {
    return '/'
  } else {
    return split.join('/')
  }
}

/**
 * Returns the file name of the reference.
 *
 * e.g. for "/foo/bar/file.ts" returns "file.ts"
 */
export function referenceFileName(ref: FileReference | FileChangesReference | SnippetReference): string {
  return fileRefName(ref)
}

function fileRefName(ref: FileReference | FileChangesReference | SnippetReference): string {
  const fileName = ref.path.split('/').pop()
  return fileName || ref.path
}

export function fileDiffRefName(ref: FileDiffReference): string {
  const path = ref.headFile?.path ?? ref.baseFile?.path ?? ref.head?.path ?? ref.base?.path
  const fileName = path?.split('/').pop() ?? ''

  // if we have no range or no start, just the filename
  if (!ref.selectedRange || !ref.selectedRange.start) {
    return fileName
  }

  // if we have no end or the end and start are the same, just the start line
  if (!ref.selectedRange.end || ref.selectedRange.start === ref.selectedRange.end) {
    return `${fileName} ${ref.selectedRange.start}`
  }

  // if we have a start and and end the range
  return `${fileName} ${ref.selectedRange.start}-${ref.selectedRange.end}`
}

function snippetRefName(ref: SnippetReference): string {
  if (ref.title) {
    return ref.title
  }
  const fileName = ref.path.split('/').pop()
  const lines = `${ref.range.start}-${ref.range.end}`
  return `${fileName}:${lines}`
}

function repoRefName(ref: RepositoryReference): string {
  return `${ref.ownerLogin}/${ref.name}`
}

function diffRefName(ref: TreeComparisonReference) {
  return `${ref.baseRevision.substring(0, 5)}..${ref.headRevision.substring(0, 5)}`
}

export function qualifyRef(ref: string, refType: 'branch' | 'tag'): string {
  if (refType === 'branch') return `refs/heads/${ref}`
  if (refType === 'tag') return `refs/tags/${ref}`
  return ref
}

export function parseReferencesFromLocation(location: Location, repo: CopilotChatRepo): CopilotChatReference[] {
  const refs: CopilotChatReference[] = []

  const blobMatch = location.pathname.match(/^\S+\/blob\/\w+\/(\S+)$/i)
  if (!blobMatch) return refs

  const fileRef: FileReference = {
    type: 'file',
    url: location.href,
    path: blobMatch.length > 1 ? blobMatch[1]! : blobMatch[0],
    repoID: repo.id,
    repoOwner: repo.ownerLogin,
    repoName: repo.name,
    ref: repo.ref,
    commitOID: repo.commitOID,
  }

  refs.push(fileRef)

  const lineSelection = parseBlobRange(location.hash)
  if (lineSelection) {
    const snippetRef: SnippetReference = {
      ...fileRef,
      type: 'snippet',
      range: {start: lineSelection.start.line, end: lineSelection.end.line},
    }

    refs.push(snippetRef)
  }

  return refs
}

// TODO: temporarily borrowing from github/blob-anchor.ts

interface BlobOffset {
  line: number
  column: number | null
}

interface BlobRange {
  start: BlobOffset
  end: BlobOffset
}

function parseBlobRange(str: string): BlobRange | undefined {
  const lines = str.match(/#?(?:L)(\d+)((?:C)(\d+))?/g)
  if (!lines) {
    return
  } else if (lines.length === 1) {
    const offset = parseBlobOffset(lines[0])
    if (!offset) return
    return Object.freeze({start: offset, end: offset})
  } else if (lines.length === 2) {
    const startOffset = parseBlobOffset(lines[0])
    const endOffset = parseBlobOffset(lines[1]!)
    if (!startOffset || !endOffset) return

    return ascendingBlobRange(
      Object.freeze({
        start: startOffset,
        end: endOffset,
      }),
    )
  } else {
    return
  }
}

function parseBlobOffset(str: string): BlobOffset | null {
  const lineMatch = str.match(/L(\d+)/)
  const columnMatch = str.match(/C(\d+)/)
  if (lineMatch) {
    return Object.freeze({
      line: parseInt(lineMatch[1]!),
      column: columnMatch ? parseInt(columnMatch[1]!) : null,
    })
  } else {
    return null
  }
}

function ascendingBlobRange(range: BlobRange): BlobRange {
  const offsets = [range.start, range.end]
  offsets.sort(compareBlobOffsets)

  if (offsets[0] === range.start && offsets[1] === range.end) {
    return range
  } else {
    return Object.freeze({
      start: offsets[0]!,
      end: offsets[1]!,
    })
  }
}

function compareBlobOffsets(a: BlobOffset, b: BlobOffset): number {
  if (a.line === b.line && a.column === b.column) {
    return 0
  } else if (a.line === b.line && typeof a.column === 'number' && typeof b.column === 'number') {
    return a.column - b.column
  } else {
    return a.line - b.line
  }
}

export function makeCopilotChatReference(file: string, repository: CopilotChatRepo): FileReference {
  const blobPath = repositoryTreePath({
    repo: repository,
    commitish: repository.refInfo.name,
    action: 'blob',
    path: file,
  })

  const fileRef: FileReference = {
    type: 'file',
    url: new URL(blobPath, window.location.origin).href,
    path: file,
    repoID: repository.id,
    repoOwner: repository.ownerLogin,
    repoName: repository.name,
    ref: repository.ref,
    commitOID: repository.commitOID,
  }

  return fileRef
}

export function makeSymbolReference(
  suggestion: BlackbirdSuggestion,
  repository: CopilotChatRepo,
): SuggestionSymbolReference {
  const fullyQualifiedName: string = suggestion.symbol?.fully_qualified_name || ''
  const symbolRef: CopilotChatReference = {
    type: 'symbol',
    kind: 'suggestionSymbol',
    name: fullyQualifiedName,
    suggestionDefinitions: [
      {
        identOffset: {start: suggestion.symbol?.ident_start || 0, end: suggestion.symbol?.ident_end || 0},
        extentOffset: {start: suggestion.symbol?.extent_start || 0, end: suggestion.symbol?.extent_end || 0},
        kind: suggestion.symbol?.kind || '',
        fullyQualifiedName,
        repoID: repository.id,
        repoOwner: repository.ownerLogin,
        repoName: repository.name,
        ref: suggestion.commit_sha,
        commitOID: suggestion.commit_sha,
        path: suggestion.path,
      },
    ],
    languageID: suggestion.language_id,
  }

  return symbolRef
}

/**
 * Making a docset reference from a docset is as simple as adding the 'docset' type
 * discriminator to the docset object. We don't have a good reason to limit the
 * fields in the object at runtime.
 */
export function makeDocsetReference(docset: Docset): DocsetReference {
  return {
    ...docset,
    type: 'docset',
  }
}

export function makeRepositoryReference(repo: CopilotChatRepo): RepositoryReference {
  return {...repo, type: 'repository'}
}

export function isDocset(
  repoOrDocset: CopilotChatRepo | Docset | CopilotChatReference | undefined,
): repoOrDocset is Docset {
  return !!repoOrDocset && 'scopingQuery' in repoOrDocset
}

export function isRepository(repoOrDocset: CopilotChatRepo | Docset | undefined): repoOrDocset is CopilotChatRepo {
  return !!repoOrDocset && !isDocset(repoOrDocset)
}

export function referencesAreEqual(a: CopilotChatReference | undefined, b: CopilotChatReference | undefined): boolean {
  // if both are undefined, they're equal
  if (a === b) {
    return true
  }

  // if either is undefined now, they are not equal
  if (a === undefined || b === undefined) {
    return false
  }

  return referenceID(a) === referenceID(b)
}

export function referenceArraysAreEqual(
  a: CopilotChatReference[] | undefined,
  b: CopilotChatReference[] | undefined,
): boolean {
  if (a === undefined && b === undefined) return true
  if (a === undefined || b === undefined) return false

  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (!referencesAreEqual(a[i], b[i])) {
      return false
    }
  }

  return true
}

export function navigateToAllTopics(showTopicPicker: (show: boolean) => void, mode: CopilotChatMode) {
  showTopicPicker(true)
  if (mode === 'immersive') {
    window.history.pushState(null, '', `${COPILOT_PATH}`)
  }
}

export function isFileReference(reference: CopilotChatReference): reference is FileReference {
  return reference.type === 'file'
}

type Author = {
  name: string
  avatarURL: string
  type: 'user' | 'copilot' | 'agent'
}

/**
 * Returns the author of a message.
 */
export function findAuthor(message: CopilotChatMessage, currentUserLogin: string): Author {
  if (message.role === 'user') {
    return {
      name: currentUserLogin,
      avatarURL: `/${currentUserLogin}.png`,
      type: 'user',
    }
  }

  if (message.references) {
    const agentReference = message.references.find(ref => ref.type === 'github.agent') as GitHubAgentReference | null
    if (agentReference) {
      return {
        name: agentReference.login,
        avatarURL: agentReference.avatarURL,
        type: 'agent',
      }
    }
  }

  return {
    name: 'Copilot',
    avatarURL: '',
    type: 'copilot',
  }
}

export function isAgent(author: Author): boolean {
  return author.type === 'agent'
}

/**
 * Finds all the agents who have sent messages to the thread.
 */
export function findAgentCorrespondents(messages: CopilotChatMessage[]): Author[] {
  const agentMessages = messages.map(message => findAuthor(message, '')).filter(author => author?.type === 'agent')
  const uniqueAgents = new Map<string, Author>()
  for (const agent of agentMessages) {
    uniqueAgents.set(agent.name, agent)
  }
  return Array.from(uniqueAgents.values())
}

export function isThreadOlderThan4Hours(thread: CopilotChatThread) {
  const threadUpdatedAt = new Date(thread.updatedAt).getTime()
  const now = new Date().getTime()
  const timeSinceLastMessage = now - threadUpdatedAt
  const fourHours = 4 * 60 * 60 * 1000

  return timeSinceLastMessage > fourHours
}
