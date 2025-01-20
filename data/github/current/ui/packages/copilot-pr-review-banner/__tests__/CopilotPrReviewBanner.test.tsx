import {screen, waitFor} from '@testing-library/react'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {render} from '@github-ui/react-core/test-utils'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import type {OperationDescriptor} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
import {CopilotPrReviewBanner} from '../CopilotPrReviewBanner'
import type {useLoadTreeComparisonQuery$data} from '../__generated__/useLoadTreeComparisonQuery.graphql'
import {
  getMockChatService,
  mockMessage,
  mockProps,
  mockTreeComparisonResponse,
  mockThreadId,
  mockThread,
  mockMessagesWithoutDiffHunks,
} from './mocks'
import {AliveTestProvider} from '@github-ui/use-alive/test-utils'
import {TREE_COMPARISON_REFERENCE_TYPE} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {clickAskCopilotForReview} from './test-helpers'
import {reviewUserMessage} from '@github-ui/copilot-chat/utils/constants'

const mockedIsFeatureEnabled = jest.mocked(isFeatureEnabled)
const mockedVerifiedFetch = jest.mocked(verifiedFetch)

const mockedPerformanceNow = jest.fn()
Object.defineProperty(window, 'performance', {value: {now: mockedPerformanceNow}})

jest.mock('@github-ui/feature-flags', () => ({isFeatureEnabled: jest.fn()}))
jest.mock('@github-ui/verified-fetch', () => ({verifiedFetch: jest.fn()}))
jest.mock('@github-ui/copilot-chat/utils/copilot-chat-events', () => {
  return {
    ...jest.requireActual('@github-ui/copilot-chat/utils/copilot-chat-events'),
    publishOpenCopilotChat: jest.fn(),
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

test('Does not render the banner when feature flag is disabled', () => {
  mockedIsFeatureEnabled.mockReturnValue(false)

  render(<CopilotPrReviewBanner {...mockProps} />, {wrapper: AliveTestProvider})

  expect(screen.queryByTestId('copilot-review-banner')).not.toBeInTheDocument()
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
})

test('Renders the CopilotPrReviewBanner in loading mode', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')

  const {mockChatService} = getMockChatService()

  render(<CopilotPrReviewBanner {...mockProps} chatService={mockChatService} />, {wrapper: AliveTestProvider})
  clickAskCopilotForReview()

  const banner = screen.getByTestId('copilot-review-banner')
  expect(banner).toBeInTheDocument()
  expect(banner).toHaveTextContent('Copilot is analyzing the changes in this pull request…')
  // includes staff feedback link
  expect(banner).toHaveTextContent('Give feedback')
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
})

test('Renders the CopilotPrReviewBanner in loading mode when a pull request ID is given', async () => {
  const environment = createMockEnvironment()
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService} = getMockChatService()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    expect(operation.request.node.operation.name).toBe('useLoadTreeComparisonQuery')
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return mockTreeComparisonResponse
      },
    })
  })

  render(
    <CopilotPrReviewBanner
      apiURL={mockProps.apiURL}
      ssoOrganizations={mockProps.ssoOrganizations}
      analyticsPath="/github-copilot/someRepoOwner/someRepo/pulls/review-banner?pull_request_node_id=PR_kwADzmg6Pjw"
      pullRequestId="PR_kwADzmg6Pjw"
      environment={environment}
      signedWebsocketChannel={mockProps.signedWebsocketChannel}
      chatService={mockChatService}
    />,
    {wrapper: AliveTestProvider},
  )
  clickAskCopilotForReview()

  const banner = screen.getByTestId('copilot-review-banner')
  expect(banner).toHaveTextContent('Copilot is analyzing the changes in this pull request…')
  expect(banner).toHaveTextContent('Give feedback')
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
})

test('Does not render the CopilotPrReviewBanner when given pull request ID is for a non-draft PR', async () => {
  const environment = createMockEnvironment()
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    expect(operation.request.node.operation.name).toBe('useLoadTreeComparisonQuery')
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return {
          node: {
            ...mockTreeComparisonResponse.node,
            isDraft: false,
          },
          viewer: {
            ...mockTreeComparisonResponse.viewer,
          },
        } satisfies useLoadTreeComparisonQuery$data
      },
    })
  })

  render(
    <CopilotPrReviewBanner
      apiURL={mockProps.apiURL}
      ssoOrganizations={mockProps.ssoOrganizations}
      analyticsPath="/github-copilot/someRepoOwner/someRepo/pulls/review-banner?pull_request_node_id=PR_kwADzmg6Pjw"
      pullRequestId="PR_kwADzmg6Pjw"
      environment={environment}
      signedWebsocketChannel={mockProps.signedWebsocketChannel}
    />,
    {wrapper: AliveTestProvider},
  )

  expect(screen.queryByTestId('copilot-review-banner')).not.toBeInTheDocument()
})

test('Does not render the CopilotPrReviewBanner when given pull request ID is for a closed PR', async () => {
  const environment = createMockEnvironment()
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    expect(operation.request.node.operation.name).toBe('useLoadTreeComparisonQuery')
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return {
          node: {
            ...mockTreeComparisonResponse.node,
            closed: true,
          },
          viewer: {
            ...mockTreeComparisonResponse.viewer,
          },
        } satisfies useLoadTreeComparisonQuery$data
      },
    })
  })

  render(
    <CopilotPrReviewBanner
      apiURL={mockProps.apiURL}
      ssoOrganizations={mockProps.ssoOrganizations}
      analyticsPath="/github-copilot/someRepoOwner/someRepo/pulls/review-banner?pull_request_node_id=PR_kwADzmg6Pjw"
      pullRequestId="PR_kwADzmg6Pjw"
      environment={environment}
      signedWebsocketChannel={mockProps.signedWebsocketChannel}
    />,
    {wrapper: AliveTestProvider},
  )

  expect(screen.queryByTestId('copilot-review-banner')).not.toBeInTheDocument()
})

test('Does not render the CopilotPrReviewBanner when given pull request ID has an empty diff', async () => {
  const environment = createMockEnvironment()
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    expect(operation.request.node.operation.name).toBe('useLoadTreeComparisonQuery')
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return {
          node: {
            ...mockTreeComparisonResponse.node,
            additions: 0,
            deletions: 0,
          },
          viewer: {
            ...mockTreeComparisonResponse.viewer,
          },
        } satisfies useLoadTreeComparisonQuery$data
      },
    })
  })

  render(
    <CopilotPrReviewBanner
      apiURL={mockProps.apiURL}
      ssoOrganizations={mockProps.ssoOrganizations}
      analyticsPath="/github-copilot/someRepoOwner/someRepo/pulls/review-banner?pull_request_node_id=PR_kwADzmg6Pjw"
      pullRequestId="PR_kwADzmg6Pjw"
      environment={environment}
      signedWebsocketChannel={mockProps.signedWebsocketChannel}
    />,
    {wrapper: AliveTestProvider},
  )

  expect(screen.queryByTestId('copilot-review-banner')).not.toBeInTheDocument()
})

test('Hides banner when X button is clicked and there was no error', async () => {
  const expectedDismissFormData = new FormData()
  expectedDismissFormData.append('button', 'X')
  expectedDismissFormData.append('error', 'false')
  expectedDismissFormData.append('_method', 'DELETE')
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService} = getMockChatService()

  const {user} = render(<CopilotPrReviewBanner {...mockProps} chatService={mockChatService} />, {
    wrapper: AliveTestProvider,
  })

  const bannerContainer = screen.getByTestId('copilot-review-banner')
  expect(bannerContainer).toBeInTheDocument()
  expect(bannerContainer).toBeVisible()

  const dismissButton = screen.getByLabelText('Dismiss')
  expect(dismissButton).toBeInTheDocument()

  await user.click(dismissButton)

  expect(bannerContainer).not.toBeVisible()
  expect(mockedVerifiedFetch).toHaveBeenCalledTimes(1)
  expect(mockedVerifiedFetch).toHaveBeenCalledWith(mockProps.analyticsPath, {
    method: 'DELETE',
    body: expectedDismissFormData,
  })
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
})

test('Hides banner when Dismiss button is clicked and there was an error', async () => {
  const expectedDismissFormData = new FormData()
  expectedDismissFormData.append('button', 'DISMISS')
  expectedDismissFormData.append('error', 'true')
  expectedDismissFormData.append('_method', 'DELETE')
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService, mockCreateMessage, mockCreateThread} = getMockChatService()
  mockCreateThread.mockResolvedValue({
    status: 500,
    ok: false,
    error: 'o noes',
  })

  const {user} = render(<CopilotPrReviewBanner {...mockProps} chatService={mockChatService} />, {
    wrapper: AliveTestProvider,
  })
  clickAskCopilotForReview()

  const bannerContainer = screen.getByTestId('copilot-review-banner')
  expect(bannerContainer).toBeInTheDocument()
  expect(bannerContainer).toBeVisible()
  await waitFor(() =>
    expect(bannerContainer).toHaveTextContent('Copilot had trouble creating a review for this pull request'),
  )

  const dismissButton = screen.getByText('Dismiss')
  expect(dismissButton).toBeInTheDocument()

  await user.click(dismissButton)

  expect(bannerContainer).not.toBeVisible()
  expect(mockedVerifiedFetch).toHaveBeenCalledTimes(1)
  expect(mockedVerifiedFetch).toHaveBeenCalledWith(mockProps.analyticsPath, {
    method: 'DELETE',
    body: expectedDismissFormData,
  })
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
  expect(mockCreateMessage).not.toHaveBeenCalled()
})

test('Hides banner when X button is clicked and there was an error', async () => {
  const expectedDismissFormData = new FormData()
  expectedDismissFormData.append('button', 'X')
  expectedDismissFormData.append('error', 'true')
  expectedDismissFormData.append('_method', 'DELETE')
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService, mockCreateThread, mockCreateMessage} = getMockChatService()
  mockCreateThread.mockResolvedValue({
    status: 500,
    ok: false,
    error: 'o noes',
  })

  const {user} = render(<CopilotPrReviewBanner {...mockProps} chatService={mockChatService} />, {
    wrapper: AliveTestProvider,
  })
  clickAskCopilotForReview()

  const bannerContainer = screen.getByTestId('copilot-review-banner')
  expect(bannerContainer).toBeInTheDocument()
  expect(bannerContainer).toBeVisible()
  await waitFor(() =>
    expect(bannerContainer).toHaveTextContent('Copilot had trouble creating a review for this pull request'),
  )

  const dismissButton = screen.getByLabelText('Dismiss')
  expect(dismissButton).toBeInTheDocument()

  await user.click(dismissButton)

  expect(bannerContainer).not.toBeVisible()
  expect(mockedVerifiedFetch).toHaveBeenCalledTimes(1)
  expect(mockedVerifiedFetch).toHaveBeenCalledWith(mockProps.analyticsPath, {
    method: 'DELETE',
    body: expectedDismissFormData,
  })
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
  expect(mockCreateMessage).not.toHaveBeenCalled()
})

test('Shows an error when chat thread creation fails', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService, mockCreateMessage, mockCreateThread, mockRenameThread} = getMockChatService()
  mockCreateThread.mockResolvedValue({status: 500, ok: false, error: 'o noes'})

  render(<CopilotPrReviewBanner {...mockProps} threadName="My new thread" chatService={mockChatService} />)
  clickAskCopilotForReview()

  const bannerContainer = screen.getByTestId('copilot-review-banner')
  expect(bannerContainer).toBeInTheDocument()
  expect(bannerContainer).toBeVisible()
  await waitFor(() =>
    expect(bannerContainer).toHaveTextContent('Copilot had trouble creating a review for this pull request'),
  )
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
  expect(mockCreateMessage).not.toHaveBeenCalled()
  expect(mockRenameThread).not.toHaveBeenCalled()
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
})

test('Shows an error when chat message creation fails', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService, mockCreateMessage, mockRenameThread} = getMockChatService()
  mockCreateMessage.mockResolvedValue({status: 500, ok: false, error: 'o noes'})

  render(<CopilotPrReviewBanner {...mockProps} threadName="My new thread" chatService={mockChatService} />)
  clickAskCopilotForReview()

  const bannerContainer = screen.getByTestId('copilot-review-banner')
  expect(bannerContainer).toBeInTheDocument()
  expect(bannerContainer).toBeVisible()
  await waitFor(() =>
    expect(bannerContainer).toHaveTextContent('Copilot had trouble creating a review for this pull request'),
  )
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
  expect(mockRenameThread).not.toHaveBeenCalled()
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
})

test('Renders the CopilotPrReviewBanner when response from Copilot API is received', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService, mockCreateMessage, mockRenameThread, mockFetchThreads, mockListMessages} =
    getMockChatService()

  render(<CopilotPrReviewBanner {...mockProps} chatService={mockChatService} />, {wrapper: AliveTestProvider})
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
  clickAskCopilotForReview()

  const banner = await screen.findByTestId('copilot-review-banner')
  await waitFor(() => expect(banner).toHaveTextContent('Copilot has found some possible improvements'))
  // includes staff feedback link
  expect(banner).toHaveTextContent('Give feedback')
  await waitFor(() => expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1))
  expect(mockedVerifiedFetch).toHaveBeenCalledTimes(1)
  expect(mockCreateMessage).toHaveBeenCalledTimes(1)
  expect(mockCreateMessage).toHaveBeenCalledWith(mockThreadId, reviewUserMessage, 'review-pull-request', [
    {
      baseRepoId: mockProps.baseRepoId,
      baseRevision: mockProps.baseRevision,
      headRepoId: mockProps.headRepoId,
      headRevision: mockProps.headRevision,
      type: TREE_COMPARISON_REFERENCE_TYPE,
      diffHunks: [],
    },
  ])
  expect(mockRenameThread).not.toHaveBeenCalled()
  expect(mockFetchThreads).not.toHaveBeenCalled()
  expect(mockListMessages).toHaveBeenCalledTimes(1)
})

test('Does not render the CopilotPrReviewBanner when given pull request was not authored by the viewer', async () => {
  const environment = createMockEnvironment()
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    expect(operation.request.node.operation.name).toBe('useLoadTreeComparisonQuery')
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return {
          node: {
            ...mockTreeComparisonResponse.node,
            author: {
              login: 'someUser',
            },
          },
          viewer: {
            ...mockTreeComparisonResponse.viewer,
            login: 'OtherUser',
          },
        } satisfies useLoadTreeComparisonQuery$data
      },
    })
  })

  render(
    <CopilotPrReviewBanner
      apiURL={mockProps.apiURL}
      ssoOrganizations={mockProps.ssoOrganizations}
      analyticsPath="/github-copilot/someRepoOwner/someRepo/pulls/review-banner?pull_request_node_id=PR_kwADzmg6Pjw"
      pullRequestId="PR_kwADzmg6Pjw"
      environment={environment}
      signedWebsocketChannel={mockProps.signedWebsocketChannel}
    />,
    {wrapper: AliveTestProvider},
  )

  expect(screen.queryByTestId('copilot-review-banner')).not.toBeInTheDocument()
})

test('Does not render the CopilotPrReviewBanner when the viewer does not have Copilot chat', async () => {
  const environment = createMockEnvironment()
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    expect(operation.request.node.operation.name).toBe('useLoadTreeComparisonQuery')
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return {
          node: {
            ...mockTreeComparisonResponse.node,
            author: {
              login: 'someUser',
            },
          },
          viewer: {
            ...mockTreeComparisonResponse.viewer,
            isCopilotDotcomChatEnabled: false,
          },
        } satisfies useLoadTreeComparisonQuery$data
      },
    })
  })

  render(
    <CopilotPrReviewBanner
      apiURL={mockProps.apiURL}
      ssoOrganizations={mockProps.ssoOrganizations}
      analyticsPath="/github-copilot/someRepoOwner/someRepo/pulls/review-banner?pull_request_node_id=PR_kwADzmg6Pjw"
      pullRequestId="PR_kwADzmg6Pjw"
      environment={environment}
      signedWebsocketChannel={mockProps.signedWebsocketChannel}
    />,
    {wrapper: AliveTestProvider},
  )

  expect(screen.queryByTestId('copilot-review-banner')).not.toBeInTheDocument()
})

test('Opens Copilot chat and hits analytics endpoint when Show in Chat button is clicked', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  mockedPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(1000)
  const expectedOpenInChatFormData = new FormData()
  expectedOpenInChatFormData.append('round_trip_time_ms', '1000')
  expectedOpenInChatFormData.append('_method', 'POST')
  const {mockChatService, mockCreateMessage} = getMockChatService()

  render(<CopilotPrReviewBanner {...mockProps} chatService={mockChatService} />, {wrapper: AliveTestProvider})
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
  clickAskCopilotForReview()

  const banner = await screen.findByTestId('copilot-review-banner')
  await waitFor(() => expect(banner).toHaveTextContent('Copilot has found some possible improvements'))
  expect(banner).toHaveTextContent('Give feedback')
  expect(mockCreateMessage).toHaveBeenCalledTimes(1)

  const showInChatButton = screen.getByText('Show in Chat')
  expect(showInChatButton).toBeInTheDocument()

  await waitFor(() => expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1))
  expect(publishOpenCopilotChat).toHaveBeenCalledWith({
    content: reviewUserMessage,
    intent: 'review-pull-request',
    references: [
      {
        baseRepoId: mockProps.baseRepoId,
        baseRevision: mockProps.baseRevision,
        headRepoId: mockProps.headRepoId,
        headRevision: mockProps.headRevision,
        type: TREE_COMPARISON_REFERENCE_TYPE,
        diffHunks: [],
      },
    ],
    completion: mockMessage.content,
    thread: mockThread,
  })
  expect(mockedVerifiedFetch).toHaveBeenCalledTimes(1)
  expect(mockedVerifiedFetch).toHaveBeenCalledWith(mockProps.analyticsPath, {
    method: 'POST',
    body: expectedOpenInChatFormData,
  })
})

test('Renders the CopilotPrReviewBanner when response from Copilot API is received when a pull request ID is given', async () => {
  const environment = createMockEnvironment()
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService, mockCreateMessage, mockRenameThread, mockFetchThreads, mockListMessages} =
    getMockChatService()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    expect(operation.request.node.operation.name).toBe('useLoadTreeComparisonQuery')
    return MockPayloadGenerator.generate(operation, {
      Query() {
        return mockTreeComparisonResponse
      },
    })
  })

  render(
    <CopilotPrReviewBanner
      analyticsPath="/github-copilot/someRepoOwner/someRepo/pulls/review-banner?pull_request_node_id=PR_kwADzmg6Pjw"
      pullRequestId="PR_kwADzmg6Pjw"
      environment={environment}
      chatService={mockChatService}
      signedWebsocketChannel={mockProps.signedWebsocketChannel}
    />,
    {wrapper: AliveTestProvider},
  )
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
  clickAskCopilotForReview()

  const banner = await screen.findByTestId('copilot-review-banner')
  await waitFor(() => expect(banner).toHaveTextContent('Copilot has found some possible improvements'))
  // includes staff feedback link
  expect(banner).toHaveTextContent('Give feedback')
  await waitFor(() => expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1))
  expect(mockedVerifiedFetch).toHaveBeenCalledTimes(1)
  expect(mockCreateMessage).toHaveBeenCalledTimes(1)
  expect(mockCreateMessage).toHaveBeenCalledWith(mockThreadId, reviewUserMessage, 'review-pull-request', [
    {
      baseRepoId: mockProps.baseRepoId,
      baseRevision: mockProps.baseRevision,
      headRepoId: mockProps.headRepoId,
      headRevision: mockProps.headRevision,
      type: TREE_COMPARISON_REFERENCE_TYPE,
      diffHunks: [],
    },
  ])
  expect(mockRenameThread).not.toHaveBeenCalled()
  expect(mockFetchThreads).not.toHaveBeenCalled()
  expect(mockListMessages).toHaveBeenCalledTimes(1)
})

test('Renders banner and renames thread when name is given', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService, mockRenameThread} = getMockChatService()
  const threadName = 'bestie pls tell me about programming best practices'

  render(<CopilotPrReviewBanner {...mockProps} threadName={threadName} chatService={mockChatService} />, {
    wrapper: AliveTestProvider,
  })
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
  clickAskCopilotForReview()

  const banner = await screen.findByTestId('copilot-review-banner')
  await waitFor(() => expect(banner).toHaveTextContent('Copilot has found some possible improvements'))
  await waitFor(() => expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1))
  expect(mockedVerifiedFetch).toHaveBeenCalledTimes(1)
  expect(mockRenameThread).toHaveBeenCalledTimes(1)
  expect(mockRenameThread).toHaveBeenCalledWith(mockThreadId, threadName)
})

test('Does not create a new thread when a thread with the same name exists', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const threadName = 'We have a great conversation for you today, folks.'
  const {mockFetchThreads, mockCreateThread, mockCreateMessage, mockChatService, mockListMessages, mockRenameThread} =
    getMockChatService()
  mockFetchThreads.mockResolvedValue({
    status: 200,
    ok: true,
    payload: [mockThread],
  })

  render(<CopilotPrReviewBanner {...mockProps} threadName={threadName} chatService={mockChatService} />, {
    wrapper: AliveTestProvider,
  })
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
  clickAskCopilotForReview()

  const banner = await screen.findByTestId('copilot-review-banner')
  await waitFor(() => expect(banner).toHaveTextContent('Copilot has found some possible improvements'))
  await waitFor(() => expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1))
  expect(mockedVerifiedFetch).toHaveBeenCalledTimes(1)
  expect(mockRenameThread).not.toHaveBeenCalled()
  expect(mockCreateThread).not.toHaveBeenCalled()
  expect(mockCreateMessage).not.toHaveBeenCalled()
  expect(mockFetchThreads).toHaveBeenCalledTimes(1)
  expect(mockFetchThreads).toHaveBeenCalledWith({name: threadName})
  expect(mockListMessages).toHaveBeenCalledTimes(1)
  expect(mockListMessages).toHaveBeenCalledWith(mockThreadId)
})

test('Opens chat with existing thread when thread name is given and Show in Chat is clicked', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const threadName = 'it was the best of threads, it was the worst of threads'
  const {mockFetchThreads, mockCreateThread, mockCreateMessage, mockChatService, mockListMessages, mockRenameThread} =
    getMockChatService()
  mockFetchThreads.mockResolvedValue({
    status: 200,
    ok: true,
    payload: [mockThread],
  })

  render(<CopilotPrReviewBanner {...mockProps} threadName={threadName} chatService={mockChatService} />, {
    wrapper: AliveTestProvider,
  })
  expect(publishOpenCopilotChat).not.toHaveBeenCalled()
  clickAskCopilotForReview()

  const banner = await screen.findByTestId('copilot-review-banner')
  await waitFor(() => expect(banner).toHaveTextContent('Copilot has found some possible improvements'))
  const showInChatButton = screen.getByText('Show in Chat')
  expect(showInChatButton).toBeInTheDocument()

  await waitFor(() => expect(publishOpenCopilotChat).toHaveBeenCalledTimes(1))
  expect(publishOpenCopilotChat).toHaveBeenCalledWith({
    content: reviewUserMessage,
    intent: 'review-pull-request',
    references: [
      {
        baseRepoId: mockProps.baseRepoId,
        baseRevision: mockProps.baseRevision,
        headRepoId: mockProps.headRepoId,
        headRevision: mockProps.headRevision,
        type: TREE_COMPARISON_REFERENCE_TYPE,
        diffHunks: [],
      },
    ],
    completion: mockMessage.content,
    thread: mockThread,
  })
  expect(mockedVerifiedFetch).toHaveBeenCalledTimes(1)
  expect(mockRenameThread).not.toHaveBeenCalled()
  expect(mockCreateThread).not.toHaveBeenCalled()
  expect(mockCreateMessage).not.toHaveBeenCalled()
  expect(mockFetchThreads).toHaveBeenCalledTimes(1)
  expect(mockFetchThreads).toHaveBeenCalledWith({name: threadName})
  expect(mockListMessages).toHaveBeenCalledTimes(1)
  expect(mockListMessages).toHaveBeenCalledWith(mockThreadId)
})

test('Render no review available message when no diffHunks from CAPI', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const {mockChatService, mockListMessages} = getMockChatService()
  const threadName = 'bestie pls tell me about programming best practices'

  // Remove diffHunks from the message, to simulate no suggestions from Copilot
  mockListMessages.mockResolvedValue({
    status: 200,
    ok: true,
    payload: {thread: mockThread, messages: mockMessagesWithoutDiffHunks},
  })

  render(<CopilotPrReviewBanner {...mockProps} threadName={threadName} chatService={mockChatService} />)
  clickAskCopilotForReview()

  const banner = await screen.findByTestId('copilot-review-banner')
  await waitFor(() => expect(banner).toHaveTextContent('Copilot found no suggestions for this pull request'))
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
})

test('Renders RequestReviewMessage without backend calls', async () => {
  mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
  const threadName = 'We have a great conversation for you today, folks.'
  const {mockFetchThreads, mockCreateThread, mockCreateMessage, mockChatService, mockListMessages, mockRenameThread} =
    getMockChatService()
  mockFetchThreads.mockResolvedValue({
    status: 200,
    ok: true,
    payload: [mockThread],
  })

  render(<CopilotPrReviewBanner {...mockProps} threadName={threadName} chatService={mockChatService} />)

  const banner = await screen.findByTestId('copilot-review-banner')

  await waitFor(() => expect(banner).toHaveTextContent('Copilot can help you review this pull request'))
  expect(mockedVerifiedFetch).not.toHaveBeenCalled()
  expect(mockRenameThread).not.toHaveBeenCalled()
  expect(mockCreateThread).not.toHaveBeenCalled()
  expect(mockCreateMessage).not.toHaveBeenCalled()
  expect(mockFetchThreads).not.toHaveBeenCalled()
  expect(mockListMessages).not.toHaveBeenCalled()
})
