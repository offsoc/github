import {render} from '@github-ui/react-core/test-utils'
import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import {act, screen, within} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildLabel, buildPullRequest, buildReviewRequest} from '../../../test-utils/query-data'
import {InnerDetailsPane} from '../DetailsPane'
import type {DetailsPaneTestQuery} from './__generated__/DetailsPaneTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  showTitle?: boolean
}

function TestComponent({environment, showTitle = true}: TestComponentProps) {
  const TestComponentWithQuery = () => {
    const data = useLazyLoadQuery<DetailsPaneTestQuery>(
      graphql`
        query DetailsPaneTestQuery @relay_test_operation {
          pullRequest: node(id: "test-id") {
            ... on PullRequest {
              ...DetailsPane_pullRequest
            }
          }
        }
      `,
      {},
    )
    if (!data.pullRequest) {
      return null
    }

    return (
      <InnerDetailsPane
        number={2}
        pullRequest={data.pullRequest}
        repoName="monalisa"
        repoOwner="smile"
        showTitle={showTitle}
      />
    )
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={'mock'}>
      <TestComponentWithQuery />
    </PullRequestsAppWrapper>
  )
}

test('can conditionally render the title', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} showTitle={false} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'CLOSED',
            viewerCanUpdate: false,
          })
        },
      }),
    )
  })

  expect(screen.queryByText('Details')).toBeNull()
})

test('renders the details', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'CLOSED',
            viewerCanUpdate: false,
            reviewRequests: [
              buildReviewRequest({login: 'monalisa', assignedFromTeam: 'Team1'}),
              buildReviewRequest({login: 'Team1', isTeam: true}),
            ],
          })
        },
      }),
    )
  })

  expect(screen.getByText('Details')).toBeInTheDocument()
})

test('renders the reviewers section', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'CLOSED',
            viewerCanUpdate: false,
            reviewRequests: [
              buildReviewRequest({login: 'monalisa', assignedFromTeam: 'Team1'}),
              buildReviewRequest({login: 'Team1', isTeam: true}),
            ],
          })
        },
      }),
    )
  })

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('Team1')).toBeInTheDocument()
})

test('renders the assignees section with no assignees', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest()
        },
      }),
    )
  })

  const section = screen.getByTestId('assignees-section')
  expect(within(section).getByText('None')).toBeInTheDocument()
})

test('renders the assignees section with current assignees', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            assignees: {
              nodes: [
                {login: 'monalisa', name: 'Mona Lisa', id: mockRelayId(), avatarUrl: ''},
                {login: 'hubot', name: 'Hubot', id: mockRelayId(), avatarUrl: ''},
              ],
            },
          })
        },
      }),
    )
  })

  const section = screen.getByTestId('assignees-section')

  expect(within(section).queryByText('None')).not.toBeInTheDocument()
  expect(within(section).getByText('monalisa')).toBeInTheDocument()
  expect(within(section).getByText('hubot')).toBeInTheDocument()
})

// This is a smoke test, more tests are in LabelSection.test.tsx
test('renders the labels from the label section', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'CLOSED',
            viewerCanUpdate: false,
            labels: [
              buildLabel({
                name: 'good for new contributors',
              }),
              buildLabel({
                name: 'here there be dragons',
              }),
            ],
          })
        },
      }),
    )
  })

  const section = screen.getByTestId('labels-section')
  expect(within(section).getByText('good for new contributors')).toBeInTheDocument()
  expect(within(section).getByText('here there be dragons')).toBeInTheDocument()
})

test('renders the labels section with no labels', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest()
        },
      }),
    )
  })

  const section = screen.getByTestId('labels-section')
  expect(within(section).getByText('None')).toBeInTheDocument()
})
