import type {FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'

export const MockViewerResolvedData = {
  __typename: 'User',
  id: 'U_kgAC',
  isCopilotDotcomChatEnabled: true,
} as const

// actual query result for the test file that used this first
export const MockPullRequestResolvedData = {
  id: 'PR_kwADzmil8Rc',
  __typename: 'PullRequest',
  comparison: {
    ' $fragmentType': 'useFileDiffReference_Comparison',
    oldCommit: {
      oid: '98c015b340b2efc2312316fed8b83c7b19a47034',
      repository: {
        databaseId: 3,
        name: 'github',
        url: 'https://github.com/github/github',
        owner: {
          __typename: 'Organization',
          login: 'github',
          id: 'MDEyOk9yZ2FuaXphdGlvbjk5MTk=',
        },
        id: 'MDEwOlJlcG9zaXRvcnkz',
        __typename: 'Repository',
      },
      id: 'C_kwAD2gAoOThjMDE1YjM0MGIyZWZjMjMxMjMxNmZlZDhiODNjN2IxOWE0NzAzNA',
      __typename: 'Commit',
    },
    newCommit: {
      oid: 'b9ebe71d062d958adec437285bcfca71c864dfd1',
      repository: {
        databaseId: 3,
        name: 'github',
        url: 'https://github.com/github/github',
        owner: {
          __typename: 'Organization',
          login: 'github',
          id: 'MDEyOk9yZ2FuaXphdGlvbjk5MTk=',
        },
        id: 'MDEwOlJlcG9zaXRvcnkz',
        __typename: 'Repository',
      },
      id: 'C_kwAD2gAoYjllYmU3MWQwNjJkOTU4YWRlYzQzNzI4NWJjZmNhNzFjODY0ZGZkMQ',
      __typename: 'Commit',
    },
    diffEntry: {
      ' $fragmentType': 'useFileDiffReference_DiffEntry',
      __typename: 'PullRequestDiffEntry',
      pathDigest: '151a6b1b4e8a342656439799127992e10657c1d56fe4365c502178eb7c05f9ae',
      path: 'ui/packages/copilot-code-chat/__tests__/use-file-diff-reference.test.tsx',
      rawUrl:
        'https://github.com/github/github/raw/b9ebe71d062d958adec437285bcfca71c864dfd1/ui/packages/copilot-code-chat/__tests__/use-file-diff-reference.test.tsx',
      isBinary: false,
      isSubmodule: false,
      isLfsPointer: false,
      oldTreeEntry: null,
      newTreeEntry: {
        path: 'ui/packages/copilot-code-chat/__tests__/use-file-diff-reference.test.tsx',
        size: 1933,
      },
      id: 'MDIwOlB1bGxSZXF1ZXN0RGlmZkVudHJ5MTc1NTcwNTYyMzo5OGMwMTViMzQwYjJlZmMyMzEyMzE2ZmVkOGI4M2M3YjE5YTQ3MDM0OmI5ZWJlNzFkMDYyZDk1OGFkZWM0MzcyODViY2ZjYTcxYzg2NGRmZDE6OThjMDE1YjM0MGIyZWZjMjMxMjMxNmZlZDhiODNjN2IxOWE0NzAzNDp1aS9wYWNrYWdlcy9jb3BpbG90LWNvZGUtY2hhdC9fX3Rlc3RzX18vdXNlLWZpbGUtZGlmZi1yZWZlcmVuY2UudGVzdC50c3g6Mw==',
    },
  },
} as const

// actual reference from the above data
export const MockFileDiffReference: FileDiffReference = {
  type: 'file-diff',
  id: 'diff-151a6b1b4e8a342656439799127992e10657c1d56fe4365c502178eb7c05f9ae',
  url: 'https://github.com/github/github/raw/b9ebe71d062d958adec437285bcfca71c864dfd1/ui/packages/copilot-code-chat/__tests__/use-file-diff-reference.test.tsx',
  baseFile: null,
  headFile: {
    type: 'file',
    repoID: 3,
    repoName: 'github',
    repoOwner: 'github',
    path: 'ui/packages/copilot-code-chat/__tests__/use-file-diff-reference.test.tsx',
    commitOID: 'b9ebe71d062d958adec437285bcfca71c864dfd1',
    url: 'https://github.com/github/github/raw/b9ebe71d062d958adec437285bcfca71c864dfd1/ui/packages/copilot-code-chat/__tests__/use-file-diff-reference.test.tsx',
    ref: 'b9ebe71d062d958adec437285bcfca71c864dfd1',
  },
  head: null,
  base: null,
} as const
