import {noop} from '@github-ui/noop'

import {
  type Author,
  type Comment,
  type CommentingImplementation,
  type DiffAnnotation,
  DiffAnnotationLevels,
  type MarkerNavigationImplementation,
  type NavigationThread,
  type StaticDiffLine,
  type Thread,
  type ThreadSubject,
  type ThreadSummary,
  type ViewerData,
} from '../types'

export const mockCommentingImplementation: CommentingImplementation = {
  addSuggestedChangeToPendingBatch: noop,
  removeSuggestedChangeFromPendingBatch: noop,
  addThread: noop,
  addThreadReply: noop,
  addFileLevelThread: noop,
  batchingEnabled: false,
  deleteComment: noop,
  editComment: noop,
  fetchThread: () => Promise.resolve(undefined),
  multilineEnabled: false,
  pendingSuggestedChangesBatch: [],
  resolveThread: noop,
  unresolveThread: noop,
  hideComment: noop,
  unhideComment: noop,
  resolvingEnabled: true,
  submitSuggestedChanges: noop,
  commentBoxConfig: {
    pasteUrlsAsPlainText: false,
    useMonospaceFont: false,
  },
  suggestedChangesEnabled: true,
  lazyFetchReactionGroups: false,
  lazyFetchEditHistory: false,
}

export function mockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function twoDaysAgoDateTime() {
  const date = new Date()
  date.setDate(date.getDate() - 2)
  return date.toISOString()
}

export function buildComment({
  id = mockUUID(),
  author = buildCommentAuthor({}),
  authorAssociation = 'OWNER',
  // eslint-disable-next-line github/unescaped-html-literal
  bodyHTML = '<p dir="auto">This is a test comment with <strong>Markdown</strong> code enabled for testing links at <a href="github.com">github</a> and stuff</p>',
  body = 'test comment',
  createdAt = twoDaysAgoDateTime(),
  currentDiffResourcePath = '/monalisa/smile/pull/4/files#discussion_r3',
  databaseId = null,
  isHidden = false,
  lastUserContentEdit = {
    __typename: 'UserContentEdit',
    id: mockUUID(),
    editor: {
      login: 'monalisa',
      id: mockUUID(),
      url: '#',
      __typename: 'Author',
    },
  },
  minimizedReason = null,
  outdated = false,
  publishedAt = twoDaysAgoDateTime(),
  // reference is the associated PullRequest
  reference = {
    number: 4,
    author: {
      login: 'monalisa',
    },
  },
  repository = {
    id: mockUUID(),
    isPrivate: false,
    name: 'smile',
    owner: {
      id: mockUUID(),
      login: 'monalisa',
      url: '/monalisa',
    },
  },
  stafftoolsUrl = '/stafftools/repositories/monalisa/smile/pull_requests/4/review_comments/3',
  state = 'SUBMITTED',
  url = '/monalisa/smile/pull/4/files#discussion_r3',
  viewerRelationship = 'OWNER',
  viewerDidAuthor = true,
  viewerCanBlockFromOrg = true,
  viewerCanDelete = true,
  viewerCanMinimize = true,
  viewerCanReport = true,
  viewerCanReportToMaintainer = true,
  viewerCanSeeMinimizeButton = true,
  viewerCanSeeUnminimizeButton = true,
  viewerCanUnblockFromOrg = true,
  viewerCanUpdate = true,
  subjectType = 'LINE',
}: Partial<Comment>): Required<Comment> {
  return {
    id,
    author,
    authorAssociation,
    bodyHTML,
    body,
    createdAt,
    currentDiffResourcePath,
    databaseId,
    isHidden,
    lastUserContentEdit,
    minimizedReason,
    outdated,
    publishedAt,
    reference,
    repository,
    stafftoolsUrl,
    state,
    subjectType,
    url,
    viewerRelationship,
    viewerDidAuthor,
    viewerCanBlockFromOrg,
    viewerCanDelete,
    viewerCanMinimize,
    viewerCanReport,
    viewerCanReportToMaintainer,
    viewerCanSeeMinimizeButton,
    viewerCanSeeUnminimizeButton,
    viewerCanUnblockFromOrg,
    viewerCanUpdate,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ' $fragmentSpreads': [] as any,
  }
}

export function buildCommentAuthor({
  id = mockUUID(),
  login = 'monalisa',
  avatarUrl = 'http://alambic.github.localhost/avatars/u/2',
  url = '/monalisa',
}): Author {
  return {
    id,
    login,
    avatarUrl,
    url,
    __typename: 'Author',
  }
}

type BuildThreadInput = Partial<Omit<Thread, 'commentsData'>> & {
  comments?: Comment[]
}

export function buildReviewThread(thread: BuildThreadInput = {}): Thread {
  return {
    id: thread.id ?? mockUUID(),
    commentsData: {comments: thread.comments ?? [], totalCount: thread.comments?.length ?? 0},
    isResolved: thread.isResolved ?? true,
    viewerCanReply: thread.viewerCanReply ?? false,
    isOutdated: thread.isOutdated ?? false,
    subject: thread.subject,
    subjectType: thread.subjectType,
  } as unknown as Thread
}

/**
 * Build a pull request diff thread, one of the possible subjects of the pull request thread
 */
export function buildPullRequestDiffThread(diffThread: {
  abbreviatedOid: string
  diffLines?: StaticDiffLine[] | null
  endDiffSide?: string
  endLine?: number
  originalEndLine?: number
  originalStartLine?: number
  startDiffSide?: string
  startLine?: number
}): ThreadSubject {
  return {
    pullRequestCommit: {
      commit: {
        abbreviatedOid: diffThread.abbreviatedOid,
      },
    },
    diffLines: diffThread.diffLines,
    endDiffSide: diffThread.endDiffSide,
    endLine: diffThread.endLine,
    originalEndLine: diffThread.originalEndLine,
    originalStartLine: diffThread.originalStartLine,
    startDiffSide: diffThread.startDiffSide,
    startLine: diffThread.startLine,
  } as ThreadSubject
}

export function buildStaticDiffLine(diffLine: Partial<StaticDiffLine> = {}): StaticDiffLine {
  return {
    __id: mockUUID(),
    left: diffLine.left || null,
    right: diffLine.right || null,
    html: diffLine.html || '',
    text: diffLine.text || '',
    type: diffLine.type || 'ADDITION',
  } as StaticDiffLine
}

export const mockMarkerNavigationImplementation: MarkerNavigationImplementation = {
  incrementActiveMarker: noop,
  decrementActiveMarker: noop,
  filteredMarkers: [],
  onActivateGlobalMarkerNavigation: noop,
  activeGlobalMarkerID: undefined,
}

export function threadSummary(threads: Thread[]): ThreadSummary[] {
  const lineThreads =
    threads?.flatMap(thread => {
      const id = thread?.id
      const firstAuthor = thread?.commentsData?.comments?.[0]?.author
      const commentCount = thread?.commentsData.comments?.length ?? 0
      const commentsConnectionId = thread?.commentsData?.__id
      return id && firstAuthor
        ? [
            {
              id,
              author: firstAuthor,
              commentCount,
              commentsConnectionId,
              diffSide: thread.diffSide,
              isOutdated: thread.isOutdated ?? false,
              startDiffSide: thread.diffSide,
            },
          ]
        : []
    }) ?? []

  return lineThreads
}

export function flattenThreadsForNavigation(threads: Thread[]): NavigationThread[] {
  return threads.map(thread => {
    return {
      id: thread.id,
      isResolved: thread.isResolved ?? false,
      pathDigest: 'mock-path-digest',
      firstReviewCommentId: 1,
      path: 'mock-path',
      line: 1,
    }
  })
}

export const mockViewerData: ViewerData = {
  avatarUrl: 'http://alambic.github.localhost/avatars/u/2',
  diffViewPreference: 'UNIFIED',
  isSiteAdmin: false,
  login: 'monalisa',
  tabSizePreference: 4,
  viewerCanComment: true,
  viewerCanApplySuggestion: true,
}

type BuildAnnotationInput = Partial<Omit<DiffAnnotation, 'checkSuite'>> & {
  checkSuite?: {
    name?: string
    app?: {
      name: string
      logoUrl: string
    } | null
  }
}
export function buildAnnotation(data: BuildAnnotationInput): DiffAnnotation {
  const id = mockUUID()
  return {
    id,
    __id: id,
    annotationLevel: data.annotationLevel ?? DiffAnnotationLevels.Warning,
    databaseId: data.databaseId ?? Math.floor(Math.random() * 1000),
    location: {
      start: {
        line: data.location?.start?.line ?? 1,
      },
      end: {
        line: data.location?.end?.line ?? 1,
      },
    },
    message: data.message ?? 'message',
    rawDetails: data.rawDetails ?? 'raw details',
    path: data.path ?? 'my-file-path',
    pathDigest: data.pathDigest ?? mockUUID(),
    title: data.title ?? 'annotation-title',
    checkRun: {
      name: data.checkRun?.name ?? 'check-run-name',
      detailsUrl: data.checkRun?.detailsUrl
        ? data.checkRun.detailsUrl
        : data.checkRun?.detailsUrl == null
          ? null
          : 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
    },
    checkSuite: {
      name: data.checkSuite?.name ?? 'check-suite-name',
      app: data.checkSuite?.app
        ? data.checkSuite.app
        : data.checkSuite?.app == null
          ? null
          : {
              name: 'github-app',
              logoUrl: 'http://alambic.github.localhost/avatars/u/2',
            },
    },
  }
}
