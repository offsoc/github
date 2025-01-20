import {isFeatureEnabled} from '@github-ui/feature-flags'
import {render} from '@github-ui/react-core/test-utils'
import safeStorage from '@github-ui/safe-storage'
import {AliveTestProvider, signChannel} from '@github-ui/use-alive/test-utils'
import {act, fireEvent, screen, within} from '@testing-library/react'
import {graphql, type OperationDescriptor, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../contexts/PullRequestContext'
import type {CopilotPreReviewBannerPayload} from '../../hooks/use-pull-request-page-app-payload'
import PullRequestsAppWrapper from '../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest, twoDaysAgoDateTime} from '../../test-utils/query-data'
import Description from '../Description'
import type {DescriptionTestQuery} from './__generated__/DescriptionTestQuery.graphql'

jest.setTimeout(5000)

const mockedIsFeatureEnabled = jest.mocked(isFeatureEnabled)
jest.mock('@github-ui/feature-flags', () => ({isFeatureEnabled: jest.fn()}))

interface DescriptionTestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId: string
}

function DescriptionTestComponent({environment, pullRequestId}: DescriptionTestComponentProps) {
  const WrappedDescriptionComponent = () => {
    const data = useLazyLoadQuery<DescriptionTestQuery>(
      graphql`
        query DescriptionTestQuery($pullRequestId: ID!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ...Description_pullRequest
          }
        }
      `,
      {pullRequestId},
    )

    if (data.pullRequest)
      return <Description ref={null} handleOpenSidesheet={() => {}} pullRequest={data.pullRequest} />
    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <PullRequestContextProvider
        headRefOid="mock"
        isInMergeQueue={false}
        pullRequestId="mock"
        repositoryId="mock"
        state="OPEN"
      >
        <WrappedDescriptionComponent />
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  sessionStorage.clear()
})

describe('Description body', () => {
  test('when not provided, renders fallback message', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({bodyHTML: ''})

    render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    expect(screen.getByText('No description provided.')).toBeVisible()
  })

  test('when provided, renders body html', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({bodyHTML: 'My awesome description'})

    render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    expect(screen.getByText(pullRequest.bodyHTML)).toBeVisible()
  })
})

describe('Description author details', () => {
  test('Displays author login, avatar, pull request created date, and label', async () => {
    const environment = createMockEnvironment()
    const authorLogin = 'monalisa'
    const createdAt = twoDaysAgoDateTime()
    const pullRequest = buildPullRequest({
      author: {
        login: authorLogin,
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
      },
      bodyHTML: 'hi',
      createdAt,
    })

    const {container} = render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    screen.getByText(authorLogin)
    screen.getByText('Author')
    screen.getByText('created')
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const relativeTime = container.querySelector(`[datetime="${createdAt}"]`)?.shadowRoot?.innerHTML
    expect(relativeTime).toEqual('2 days ago')
  })

  test('displays createdAt and author label, even if author is null (possible according to the generated type)', async () => {
    const environment = createMockEnvironment()
    const createdAt = twoDaysAgoDateTime()
    const pullRequest = buildPullRequest({author: null, createdAt})

    const {container} = render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    screen.getByText('Author')
    screen.getByText('created')
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const relativeTime = container.querySelector(`[datetime="${createdAt}"]`)?.shadowRoot?.innerHTML
    expect(relativeTime).toEqual('2 days ago')
  })
})

describe('when viewer does not have viewerCanUpdate access', () => {
  test('then cannot update description body', async () => {
    const environment = createMockEnvironment()
    const authorLogin = 'monalisa'
    const createdAt = twoDaysAgoDateTime()
    const pullRequest = buildPullRequest({
      author: {
        login: authorLogin,
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
      },
      bodyHTML: 'Original content',
      createdAt,
      viewerCanUpdate: false,
    })

    render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    expect(screen.queryByLabelText('Edit issue')).toBeNull()
  })
})

describe('when viewer has viewerCanUpdate access', () => {
  test('they can update description body', async () => {
    const environment = createMockEnvironment()
    const authorLogin = 'monalisa'
    const createdAt = twoDaysAgoDateTime()
    const pullRequest = buildPullRequest({
      author: {
        login: authorLogin,
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
      },
      body: 'Original content',
      bodyHTML: 'Original content',
      createdAt,
      viewerCanUpdate: true,
    })

    const {user} = render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    // Assert Edit button and description body are present
    const issueBodyMenuButton = screen.getByRole('button', {name: 'Issue body actions'})
    expect(issueBodyMenuButton).toBeInTheDocument()
    act(() => {
      issueBodyMenuButton.click()
    })
    const issueBodyActionsMenu = screen.getByRole('menu', {
      name: (accessibleName, element) => accessibleName === 'Issue body actions' && element.nodeName === 'UL',
    })
    expect(issueBodyActionsMenu).toBeInTheDocument()
    const editIssueBodyButton = within(issueBodyActionsMenu).getByText('Edit')
    expect(editIssueBodyButton).toBeInTheDocument()
    const descriptionBody = screen.getByText(pullRequest.body)

    // Click Edit button
    await user.click(editIssueBodyButton)

    // Assert that we are in edit mode and the description body and edit button are not present
    expect(descriptionBody).not.toBeInTheDocument()
    expect(editIssueBodyButton).not.toBeInTheDocument()
    screen.getByText('Write')
    screen.getByText('Preview')
    const descriptionTextArea = screen.getByPlaceholderText('Type your description here…')
    expect(descriptionTextArea).toHaveValue(pullRequest.body)

    // Type additional content and click Save
    await user.type(descriptionTextArea, ' + additional content')
    expect(descriptionTextArea).toHaveValue('Original content + additional content')
    const saveButton = screen.getByRole('button', {name: 'Save'})
    // await user.click(saveButton)

    // Mock out updatePullRequestMutation response
    const updatePullRequestMutationResponse = {
      ...pullRequest,
      body: 'Original content + additional content',
      bodyHTML: 'Original content + additional content',
    }

    fireEvent.click(saveButton)

    act(() =>
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.request.node.operation.name).toEqual('updatePullRequestMutation')
        return MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return updatePullRequestMutationResponse
          },
        })
      }),
    )

    // Assert that the description body has been updated and we are back to viewer with edit icon view
    await screen.findByText(updatePullRequestMutationResponse.body)
  })

  test('presaved sessionStorage data will be shown on edit', async () => {
    const environment = createMockEnvironment()
    const authorLogin = 'monalisa'
    const createdAt = twoDaysAgoDateTime()
    const pullRequest = buildPullRequest({
      author: {
        login: authorLogin,
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
      },
      body: 'Original content',
      bodyHTML: 'Original content',
      createdAt,
      viewerCanUpdate: true,
    })
    const preSavedComment = 'presaved comment'
    const key = `pull-request-${pullRequest.id}.description-edit-text`
    const safeSessionStorage = safeStorage('sessionStorage')
    safeSessionStorage.setItem(key, JSON.stringify(preSavedComment))

    const {user} = render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    // Assert Edit button and description body are present
    const issueBodyMenuButton = screen.getByRole('button', {name: 'Issue body actions'})
    expect(issueBodyMenuButton).toBeInTheDocument()
    act(() => {
      issueBodyMenuButton.click()
    })
    const issueBodyActionsMenu = screen.getByRole('menu', {
      name: (accessibleName, element) => accessibleName === 'Issue body actions' && element.nodeName === 'UL',
    })
    expect(issueBodyActionsMenu).toBeInTheDocument()
    const editIssueBodyButton = within(issueBodyActionsMenu).getByText('Edit')
    expect(editIssueBodyButton).toBeInTheDocument()

    // Click Edit button
    await user.click(editIssueBodyButton)

    // Assert that we are in edit mode and edit button is not present
    expect(editIssueBodyButton).not.toBeInTheDocument()
    screen.getByText('Write')
    screen.getByText('Preview')

    // Description text area should have presaved comment in sessionStorage
    const descriptionTextArea = screen.getByPlaceholderText('Type your description here…')
    expect(descriptionTextArea).toHaveValue(preSavedComment)
  })

  test('edit changes will be stored in sessionStorage when typing', async () => {
    const environment = createMockEnvironment()
    const authorLogin = 'monalisa'
    const createdAt = twoDaysAgoDateTime()
    const pullRequest = buildPullRequest({
      author: {
        login: authorLogin,
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
      },
      body: 'Original content',
      bodyHTML: 'Original content',
      createdAt,
      viewerCanUpdate: true,
    })
    const preSavedComment = 'presaved comment'
    const key = `pull-request-${pullRequest.id}.description-edit-text`
    const safeSessionStorage = safeStorage('sessionStorage')
    safeSessionStorage.setItem(key, JSON.stringify(preSavedComment))

    const {user} = render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    // Assert Edit button and description body are present
    const issueBodyMenuButton = screen.getByRole('button', {name: 'Issue body actions'})
    expect(issueBodyMenuButton).toBeInTheDocument()
    act(() => {
      issueBodyMenuButton.click()
    })
    const issueBodyActionsMenu = screen.getByRole('menu', {
      name: (accessibleName, element) => accessibleName === 'Issue body actions' && element.nodeName === 'UL',
    })
    expect(issueBodyActionsMenu).toBeInTheDocument()
    const editIssueBodyButton = within(issueBodyActionsMenu).getByText('Edit')
    expect(editIssueBodyButton).toBeInTheDocument()

    // Click Edit button
    await user.click(editIssueBodyButton)

    // Assert that we are in edit mode and edit button is not present
    expect(editIssueBodyButton).not.toBeInTheDocument()
    screen.getByText('Write')
    screen.getByText('Preview')

    // Description text area should have presaved comment in sessionStorage
    const descriptionTextArea = screen.getByPlaceholderText('Type your description here…')
    expect(descriptionTextArea).toHaveValue(preSavedComment)

    // Add additional content and confirm it is stored in sessionStorage
    await user.type(descriptionTextArea, ' + additional content')
    expect(safeSessionStorage.getItem(key)).toEqual(JSON.stringify(`${preSavedComment} + additional content`))
  })

  test('edit changes will be removed from sessionStorage if "Cancel" button is clicked', async () => {
    const environment = createMockEnvironment()
    const authorLogin = 'monalisa'
    const createdAt = twoDaysAgoDateTime()
    const pullRequest = buildPullRequest({
      author: {
        login: authorLogin,
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
      },
      body: 'Original content',
      bodyHTML: 'Original content',
      createdAt,
      viewerCanUpdate: true,
    })
    const preSavedComment = 'presaved comment'
    const key = `pull-request-${pullRequest.id}.description-edit-text`
    const safeSessionStorage = safeStorage('sessionStorage')
    safeSessionStorage.setItem(key, JSON.stringify(preSavedComment))

    const {user} = render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    // Assert Edit button and description body are present
    const issueBodyMenuButton = screen.getByRole('button', {name: 'Issue body actions'})
    expect(issueBodyMenuButton).toBeInTheDocument()
    act(() => {
      issueBodyMenuButton.click()
    })
    const issueBodyActionsMenu = screen.getByRole('menu', {
      name: (accessibleName, element) => accessibleName === 'Issue body actions' && element.nodeName === 'UL',
    })
    expect(issueBodyActionsMenu).toBeInTheDocument()
    const editIssueBodyButton = within(issueBodyActionsMenu).getByText('Edit')
    expect(editIssueBodyButton).toBeInTheDocument()

    // Click Edit button
    await user.click(editIssueBodyButton)

    // Assert that we are in edit mode and edit button is not present
    expect(editIssueBodyButton).not.toBeInTheDocument()
    screen.getByText('Write')
    screen.getByText('Preview')

    // Description text area should have presaved comment in sessionStorage
    const descriptionTextArea = screen.getByPlaceholderText('Type your description here…')
    expect(descriptionTextArea).toHaveValue(preSavedComment)

    // Click "Cancel" button alongside "Close and discard" confirmation dialog button and assert sessionStorage has been cleared of data
    const cancelButton = screen.getByRole('button', {name: 'Cancel'})
    await user.click(cancelButton)
    const closeAndDiscardButton = screen.getByRole('button', {name: 'Close and discard'})
    await user.click(closeAndDiscardButton)
    expect(safeSessionStorage.getItem(key)).toBeNull()
  })
})

describe('Copilot pre-review banner', () => {
  test('renders when Copilot props are given and necessary preconditions are met', async () => {
    const environment = createMockEnvironment()
    mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
    const pullRequest = buildPullRequest({isDraft: true})

    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      expect(operation.request.node.operation.name).toBe('DescriptionTestQuery')
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
      })
    })

    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      expect(operation.request.node.operation.name).toBe('useLoadTreeComparisonQuery')
      return MockPayloadGenerator.generate(operation, {
        Query() {
          return {
            node: {
              ...pullRequest,
              baseRepository: {
                ...pullRequest.baseRepository,
                databaseId: pullRequest.repository.databaseId,
              },
              headRepository: {
                ...pullRequest.headRepository,
                databaseId: pullRequest.repository.databaseId,
              },
              closed: false,
              additions: 1,
              deletions: 0,
            },
            viewer: {
              login: pullRequest.author.login,
              isCopilotDotcomChatEnabled: true,
            },
          }
        },
      })
    })

    const copilotPreReviewBannerPayload: CopilotPreReviewBannerPayload = {
      apiURL: 'https://api.copilot.localhost',
      ssoOrganizations: [],
      analyticsPath: `/github-copilot/${pullRequest.baseRef.repository.nameWithOwner}/pulls/review-banner?pull_request_node_id=${pullRequest.id}`,
      threadName: 'A very nice conversation about a pull request',
      signedWebsocketChannel: signChannel('some:channel'),
    }

    render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />, {
      appPayload: {copilotPreReviewBannerPayload},
      wrapper: AliveTestProvider,
    })

    const banner = await screen.findByTestId('copilot-review-banner')
    expect(banner).toBeInTheDocument()
  })

  test('does not render when Copilot props are omitted from app payload', () => {
    const environment = createMockEnvironment()
    mockedIsFeatureEnabled.mockImplementation(flag => flag === 'copilot_reviews')
    const pullRequest = buildPullRequest({isDraft: true})

    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      expect(operation.request.node.operation.name).toBe('DescriptionTestQuery')
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
      })
    })

    render(<DescriptionTestComponent environment={environment} pullRequestId={pullRequest.id} />, {appPayload: {}})

    expect(screen.queryByTestId('copilot-review-banner')).not.toBeInTheDocument()
  })
})
