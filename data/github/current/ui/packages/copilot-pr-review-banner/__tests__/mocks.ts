import {CopilotChatService} from '@github-ui/copilot-chat/utils/copilot-chat-service'
import {
  TREE_COMPARISON_REFERENCE_TYPE,
  type CopilotChatMessage,
  type CopilotChatThread,
} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import type {useLoadTreeComparisonQuery$data} from '../__generated__/useLoadTreeComparisonQuery.graphql'
import type {CopilotPrReviewBannerProps} from '../CopilotPrReviewBanner'
import {signChannel} from '@github-ui/use-alive/test-utils'
import {reviewUserMessage} from '@github-ui/copilot-chat/utils/constants'

export const mockProps: CopilotPrReviewBannerProps = {
  apiURL: 'github.localhost:2026',
  ssoOrganizations: [],
  location: 'conversation',
  baseRepoId: 1,
  headRepoId: 1,
  baseRevision: '12345',
  headRevision: '678910',
  analyticsPath: '/github-copilot/someRepoOwner/someRepo/pulls/review-banner?base_sha=12345&head_sha=678910',
  signedWebsocketChannel: signChannel('pull_request:123'),
}

const mockUserLogin = 'SomeNiceUser'

export const mockTreeComparisonResponse: useLoadTreeComparisonQuery$data = {
  node: {
    additions: 50,
    author: {
      login: mockUserLogin,
    },
    baseRefOid: mockProps.baseRevision,
    baseRepository: {databaseId: mockProps.baseRepoId},
    closed: false,
    deletions: 20,
    headRefOid: mockProps.headRevision,
    headRepository: {databaseId: mockProps.headRepoId},
    isDraft: true,
  },
  viewer: {
    login: mockUserLogin,
    isCopilotDotcomChatEnabled: true,
  },
}

export const mockThreadId = '1232342345345'

export const mockThread: CopilotChatThread = {
  id: mockThreadId,
  name: 'test',
  currentReferences: [],
  createdAt: '',
  updatedAt: '',
}

export const mockMessage: CopilotChatMessage = {
  role: 'assistant',
  id: '1232342345345',
  content: 'test completion',
  createdAt: '',
  references: [],
  threadID: mockThreadId,
}

export const mockMessages: CopilotChatMessage[] = [
  {
    role: 'user',
    content: reviewUserMessage,
    id: '',
    createdAt: '',
    threadID: mockThreadId,
    references: [
      {
        type: TREE_COMPARISON_REFERENCE_TYPE,
        baseRepoId: 1,
        headRepoId: 1,
        baseRevision: '',
        headRevision: '',
        diffHunks: [
          {
            type: 'diff-hunk',
            changeReference: '',
            diff: '',
            fileName: '',
            headerContext: '',
          },
        ],
      },
    ],
  },
  mockMessage,
]

export const mockMessagesWithoutDiffHunks: CopilotChatMessage[] = [
  {
    role: 'user',
    content: 'review',
    id: '',
    createdAt: '',
    threadID: mockThreadId,
    references: [
      {
        type: TREE_COMPARISON_REFERENCE_TYPE,
        baseRepoId: 1,
        headRepoId: 1,
        baseRevision: 'ecb31d29db78',
        headRevision: '3b882cddfb99',
        diffHunks: [],
      },
    ],
  },
  mockMessage,
]

export function getMockChatService() {
  const mockChatService = new CopilotChatService(
    mockProps.apiURL ?? 'http://github.localhost/capi',
    mockProps.ssoOrganizations ?? [],
  )
  jest.spyOn(console, 'error').mockImplementation()
  const mockFetchThreads = jest.spyOn(mockChatService, 'fetchThreads').mockResolvedValue({
    status: 200,
    ok: true,
    payload: [],
  })
  const mockListMessages = jest.spyOn(mockChatService, 'listMessages').mockResolvedValue({
    status: 200,
    ok: true,
    payload: {thread: mockThread, messages: mockMessages},
  })
  const mockCreateThread = jest.spyOn(mockChatService, 'createThread').mockResolvedValue({
    status: 200,
    ok: true,
    payload: mockThread,
  })
  const mockCreateMessage = jest.spyOn(mockChatService, 'createMessage').mockResolvedValue({
    status: 200,
    ok: true,
    payload: mockMessage,
  })
  const mockRenameThread = jest.spyOn(mockChatService, 'renameThread').mockResolvedValue({
    status: 200,
    ok: true,
    payload: 'new thread name',
  })
  return {mockChatService, mockCreateThread, mockCreateMessage, mockFetchThreads, mockListMessages, mockRenameThread}
}
