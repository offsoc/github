import {createRepository} from '@github-ui/current-repository/test-helpers'
import type {SafeHTMLString} from '@github-ui/safe-html'

import type {CommentThreadData} from '../contexts/InlineCommentsContext'
import type {DeferredCommentData} from '../hooks/use-fetch-deferred-comment-data'
import type {CommitPayload, DiffEntryDataWithExtraInfo} from '../types/commit-types'
import {sampleCommitRowData} from './mock-data'

export function getCommitRoutePayload(): CommitPayload {
  return {
    commit: {
      ...sampleCommitRowData,
      shortMessageMarkdown: 'This is a commit message' as SafeHTMLString,
      parents: [],
      globalRelayId: '5',
    },
    unavailableReason: undefined,
    diffEntryData: [],
    splitViewPreference: 'split',
    fileTreeExpanded: true,
    ignoreWhitespace: false,
    path: '',
    headerInfo: {
      additions: 3,
      deletions: 2,
      filesChanged: 1,
      filesChangedString: '1',
    },
    moreDiffsToLoad: false,
    asyncDiffLoadInfo: {
      byteCount: 50,
      lineShownCount: 10,
      startIndex: 0,
      truncated: false,
    },
    repo: createRepository(),
    commentInfo: {
      canComment: true,
      canLock: true,
      locked: false,
      repoArchived: false,
    },
  }
}

const basePayload = getCommitRoutePayload()

export const payloadWithDiffs: CommitPayload = {
  ...basePayload,
  diffEntryData: [
    {
      path: 'src/index.js',
      status: 'ADDED',
      diffNumber: 0,
      linesAdded: 1,
      linesDeleted: 0,
      collapsed: false,
      isSubmodule: false,
      newTreeEntry: {
        isGenerated: false,
        lineCount: 1,
        mode: 100644,
        path: 'src/index.js',
      },
      oldTreeEntry: null,
      diffLines: [
        {
          left: 1,
          right: 1,
          blobLineNumber: 1,
          html: 'text1',
          text: 'text1',
          type: 'ADDITION',
        },
      ],
      newOid: 'newOid',
      oldOid: 'oldOid',
      isBinary: false,
      isTooBig: false,
      linesChanged: 1,
      objectId: 'objectId',
      pathDigest: 'pathDigest1',
      truncatedReason: null,
      diffManuallyExpanded: false,
      canToggleRichDiff: false,
      defaultToRichDiff: false,
    },
    {
      path: 'src/components/Component.ts',
      status: 'CHANGED',
      diffNumber: 1,
      linesAdded: 2,
      linesDeleted: 1,
      collapsed: false,
      isSubmodule: false,
      newTreeEntry: {
        isGenerated: false,
        lineCount: 2,
        mode: 100644,
        path: 'src/components/Component.ts',
      },
      oldTreeEntry: {
        lineCount: 2,
        mode: 100644,
        path: 'src/components/Component.ts',
      },
      diffLines: [
        {
          left: 1,
          right: 1,
          blobLineNumber: 1,
          html: 'text2',
          text: 'text2',
          type: 'CONTEXT',
        },
        {
          left: 2,
          right: 2,
          blobLineNumber: 2,
          html: 'text3',
          text: 'text3',
          type: 'ADDITION',
        },
        {
          left: 2,
          right: 2,
          blobLineNumber: 2,
          html: 'text4',
          text: 'text4',
          type: 'DELETION',
        },
        {
          left: 3,
          right: 3,
          blobLineNumber: 3,
          html: 'text5',
          text: 'text5',
          type: 'CONTEXT',
        },
      ],
      newOid: 'newOid',
      oldOid: 'oldOid',
      isBinary: false,
      isTooBig: false,
      linesChanged: 3,
      objectId: 'objectId',
      pathDigest: 'pathDigest2',
      truncatedReason: null,
      diffManuallyExpanded: false,
      canToggleRichDiff: false,
      defaultToRichDiff: false,
    },
    {
      path: 'src/components/Component.test.js',
      status: 'REMOVED',
      diffNumber: 2,
      linesAdded: 0,
      linesDeleted: 1,
      collapsed: false,
      isSubmodule: false,
      newTreeEntry: null,
      oldTreeEntry: {
        lineCount: 10,
        mode: 100644,
        path: 'src/components/Component.test.js',
      },
      diffLines: [
        {
          left: 1,
          right: 1,
          blobLineNumber: 1,
          html: 'text6',
          text: 'text6',
          type: 'DELETION',
        },
      ],
      newOid: 'newOid',
      oldOid: 'oldOid',
      isBinary: false,
      isTooBig: false,
      linesChanged: 1,
      objectId: 'objectId',
      pathDigest: 'pathDigest3',
      truncatedReason: null,
      diffManuallyExpanded: false,
      canToggleRichDiff: false,
      defaultToRichDiff: false,
    },
    {
      path: 'src/components/Component.css',
      status: 'RENAMED',
      diffNumber: 3,
      linesAdded: 0,
      linesDeleted: 0,
      collapsed: false,
      isSubmodule: false,
      newTreeEntry: {
        isGenerated: false,
        lineCount: 5,
        mode: 100644,
        path: 'src/components/Component.css',
      },
      oldTreeEntry: {
        lineCount: 5,
        mode: 100644,
        path: 'src/components/Component.css.old',
      },
      diffLines: [],
      newOid: 'newOid',
      oldOid: 'oldOid',
      isBinary: false,
      isTooBig: false,
      linesChanged: 0,
      objectId: 'objectId',
      pathDigest: 'pathDigest4',
      truncatedReason: null,
      diffManuallyExpanded: false,
      canToggleRichDiff: false,
      defaultToRichDiff: false,
    },
  ],
}

export const payloadWithRichDiffNotLoaded: CommitPayload = {
  ...basePayload,
  diffEntryData: [
    {
      path: 'src/index.js',
      status: 'ADDED',
      diffNumber: 0,
      linesAdded: 1,
      linesDeleted: 0,
      collapsed: false,
      isSubmodule: false,
      newTreeEntry: {
        isGenerated: false,
        lineCount: 1,
        mode: 100644,
        path: 'src/index.js',
      },
      oldTreeEntry: null,
      diffLines: [
        {
          left: 1,
          right: 1,
          blobLineNumber: 1,
          html: 'text1',
          text: 'text1',
          type: 'ADDITION',
        },
      ],
      newOid: 'newOid',
      oldOid: 'oldOid',
      isBinary: false,
      isTooBig: false,
      linesChanged: 1,
      objectId: 'objectId',
      pathDigest: 'pathDigest1',
      truncatedReason: null,
      diffManuallyExpanded: false,
      canToggleRichDiff: true,
      defaultToRichDiff: true,
    },
  ],
}

export const payloadWithRichDiff: CommitPayload = {
  ...payloadWithRichDiffNotLoaded,
  diffEntryData: [
    {
      ...(payloadWithRichDiffNotLoaded.diffEntryData[0] as DiffEntryDataWithExtraInfo),
      proseDifffHtml: 'proseDiffHtml' as SafeHTMLString,
    },
  ],
}

export const payloadWithRichRenderedDiff: CommitPayload = {
  ...payloadWithRichDiffNotLoaded,
  diffEntryData: [
    {
      ...(payloadWithRichDiffNotLoaded.diffEntryData[0] as DiffEntryDataWithExtraInfo),
      renderInfo: {
        identityUuid: 'identityUuid',
        type: 'renderType',
        size: 100,
        url: 'displayUrl',
      },
    },
  ],
}

export const payloadWithRichDependencyDiff: CommitPayload = {
  ...payloadWithRichDiffNotLoaded,
  diffEntryData: [
    {
      ...(payloadWithRichDiffNotLoaded.diffEntryData[0] as DiffEntryDataWithExtraInfo),
      dependencyDiffPath: 'path',
    },
  ],
}

export const fileTreePayload: CommitPayload = {
  ...basePayload,
  diffEntryData: [
    {
      path: 'src/index.js',
      pathDigest: 'src/index.js',
      status: 'ADDED',
    },
    {
      path: 'src/components/Component.js',
      pathDigest: 'src/components/Component.js',
      status: 'CHANGED',
    },
    {
      path: 'src/components/Component.test.js',
      pathDigest: 'src/components/Component.test.js',
      status: 'DELETED',
    },
    {
      path: 'src/components/Component.css',
      pathDigest: 'src/components/Component.css',
      status: 'RENAMED',
    },
  ],
}

const commentThreadData: CommentThreadData[] = [
  {
    path: 'src/components/Component.js',
    position: 1,
    count: 5,
    threads: [
      {
        id: 'src/components/Component.js::1',
        diffSide: 'RIGHT',
        commentsData: {
          totalCount: 5,
          comments: [], // author comments, generate as needed for testing
        },
      },
    ],
  },
  {
    path: 'src/components/Component.test.js',
    position: 2,
    count: 12,
    threads: [
      {
        id: 'src/components/Component.test.js::1',
        diffSide: 'RIGHT',
        commentsData: {
          totalCount: 12,
          comments: [], // author comments, generate as needed for testing
        },
      },
    ],
  },
  {
    path: 'src/components/Component.css',
    position: 3,
    count: 2,
    threads: [
      {
        id: 'src/components/Component.css::1',
        diffSide: 'RIGHT',
        commentsData: {
          totalCount: 2,
          comments: [], // author comments, generate as needed for testing
        },
      },
    ],
  },
]

export const asyncCommentThreadData: DeferredCommentData = {
  threadMarkers: commentThreadData,
  discussionComments: {
    comments: [],
    count: 0,
    canLoadMore: false,
  },
  subscribed: false,
}
