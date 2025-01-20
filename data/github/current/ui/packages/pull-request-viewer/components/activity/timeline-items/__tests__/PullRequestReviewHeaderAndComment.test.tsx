import {TEST_IDS} from '@github-ui/commenting/TestIds'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {act, fireEvent, screen, within} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../../../contexts/PullRequestContext'
import PullRequestsAppWrapper from '../../../../test-utils/PullRequestsAppWrapper'
import {buildReview} from '../../../../test-utils/query-data'
import {
  type OnBehalfOf,
  PullRequestReviewHeaderAndComment,
} from '../pull-request-review/PullRequestReviewHeaderAndComment'
import type {PullRequestReviewHeaderAndCommentTestQuery} from './__generated__/PullRequestReviewHeaderAndCommentTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestReviewId: string
}

function TestComponent({environment, pullRequestReviewId}: TestComponentProps) {
  const WrappedComponent = () => {
    const data = useLazyLoadQuery<PullRequestReviewHeaderAndCommentTestQuery>(
      graphql`
        query PullRequestReviewHeaderAndCommentTestQuery($pullRequestReviewId: ID!) @relay_test_operation {
          pullRequestReview: node(id: $pullRequestReviewId) {
            ...PullRequestReviewHeaderAndComment_pullRequestReview
          }
        }
      `,
      {pullRequestReviewId},
    )

    if (!data.pullRequestReview) return null

    return <PullRequestReviewHeaderAndComment isMajor={true} navigate={noop} review={data.pullRequestReview} />
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId="mock">
      <PullRequestContextProvider
        headRefOid="mock"
        isInMergeQueue={false}
        pullRequestId="mock"
        repositoryId="mock"
        state="OPEN"
      >
        <WrappedComponent />
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

describe('comment author association labels', () => {
  test('renders the author label if reviewer is PR author and review body has text', async () => {
    const environment = createMockEnvironment()
    const review = buildReview({
      bodyText: 'LGTM!',
      bodyHTML: 'LGTM!',
      login: 'monalisa',
      threadsAndReplies: [],
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.getByText('Author')).toBeVisible()
  })

  test('renders the author label if reviewer is PR author and review body is empty', async () => {
    const environment = createMockEnvironment()
    const review = buildReview({
      bodyText: '',
      bodyHTML: '',
      login: 'monalisa',
      threadsAndReplies: [],
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.getByText('Author')).toBeVisible()
  })

  test('renders the author association label if reviewer has association', async () => {
    const environment = createMockEnvironment()
    const review = buildReview({
      bodyText: 'LGTM!',
      bodyHTML: 'LGTM!',
      login: 'reviewer-with-association',
      threadsAndReplies: [],
      authorAssociation: 'CONTRIBUTOR',
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.getByText('Contributor')).toBeVisible()
  })

  test('does not render label if reviewer has no association', async () => {
    const environment = createMockEnvironment()
    const review = buildReview({
      bodyText: 'LGTM!',
      bodyHTML: 'LGTM!',
      login: 'reviewer-with-no-association',
      threadsAndReplies: [],
      authorAssociation: 'NONE',
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.queryByTestId(TEST_IDS.commentAuthorAssociation)).not.toBeInTheDocument()
  })
})

describe('pending review comment labels', () => {
  test('renders the label if the review is pending', async () => {
    const environment = createMockEnvironment()
    const review = buildReview({state: 'PENDING'})

    render(<TestComponent environment={environment} pullRequestReviewId={review.id} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.getByText('Pending')).toBeVisible()
  })

  test('does not render the label if the review is submitted', async () => {
    const environment = createMockEnvironment()
    const review = buildReview({state: 'CHANGES_REQUESTED'})

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
  })
})

test('A review cannot be deleted', async () => {
  const environment = createMockEnvironment()
  const review = buildReview({
    bodyText: 'LGTM!',
    bodyHTML: 'LGTM!',
    login: 'monalisa',
    threadsAndReplies: [],
  })

  render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequestReview() {
          return review
        },
      }),
    )
  })

  const actionMenu = await screen.findByLabelText('Comment actions')
  fireEvent.click(actionMenu)

  expect(screen.queryByLabelText('Delete')).not.toBeInTheDocument()
})

test('comment is reactable', async () => {
  const environment = createMockEnvironment()
  const review = buildReview({
    bodyText: 'LGTM!',
    bodyHTML: 'LGTM!',
    login: 'monalisa',
    threadsAndReplies: [],
  })

  const {user} = render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequestReview() {
          return review
        },
      }),
    )
  })
  expect(screen.getByRole('button', {name: 'All reactions'})).toBeVisible()

  const reactionButton = screen.getByRole('button', {name: 'All reactions'})
  await user.click(reactionButton)
  const reactionsToolbar = screen.getByRole('menu')
  const confusedEmoji = within(reactionsToolbar).getByText('😕')
  await user.click(confusedEmoji)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.fragment.node.name).toEqual('addReactionMutation')
      return MockPayloadGenerator.generate(operation)
    })
  })
})

describe('review decision messages', () => {
  test('renders previously approved if the review is dismissed and was previously approved', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return {
              dismissedReviewState: 'APPROVED',
              state: 'DISMISSED',
              createdAt: new Date().toString(),
            }
          },
        }),
      )
    })
    expect(screen.getByText('previously approved these changes')).toBeInTheDocument()
  })

  test('renders previously requested changes if the review is dismissed and previously requested changes', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return {
              dismissedReviewState: 'CHANGES_REQUESTED',
              state: 'DISMISSED',
              createdAt: new Date().toString(),
            }
          },
        }),
      )
    })
    expect(screen.getByText('previously requested changes')).toBeInTheDocument()
  })

  test('renders approved if the reviewer approved', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return {
              state: 'APPROVED',
              createdAt: new Date().toString(),
            }
          },
        }),
      )
    })
    expect(screen.getByText('approved these changes')).toBeInTheDocument()
  })

  test('renders requested changes if reviewer requested changes', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return {
              state: 'CHANGES_REQUESTED',
              createdAt: new Date().toString(),
            }
          },
        }),
      )
    })
    expect(screen.getByText('requested changes')).toBeInTheDocument()
  })

  test('renders reviewed changes if reviewer commented (neutral)', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return {
              state: 'COMMENTED',
              createdAt: new Date().toString(),
            }
          },
        }),
      )
    })
    expect(screen.getByText('reviewed changes')).toBeInTheDocument()
  })
})

describe('on behalf of text', () => {
  test('does not render on behalf of text if reviewer is not apart of a team', async () => {
    const environment = createMockEnvironment()

    const review = buildReview({
      bodyText: 'LGTM!',
      bodyHTML: 'LGTM!',
      login: 'reviewer-with-association',
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.queryByText('on behalf of')).not.toBeInTheDocument()
  })

  test('renders the single team the reviewer is part of', async () => {
    const environment = createMockEnvironment()

    const teams: OnBehalfOf[] = [
      {
        organization: {
          name: 'org1',
        },
        name: 'team1',
        url: 'https://team1.com',
      },
    ]

    const review = buildReview({
      bodyText: 'LGTM!',
      bodyHTML: 'LGTM!',
      login: 'reviewer-with-association',
      onBehalfOf: {edges: teams.map(team => ({node: team}))},
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    const textContent = screen.getByTestId('comment-header-left-side-items').textContent
    expect(textContent).toContain('on behalf of org1/team1')
  })

  test('renders both teams the reviewer is part of', async () => {
    const environment = createMockEnvironment()

    const teams: OnBehalfOf[] = [
      {
        organization: {
          name: 'org1',
        },
        name: 'team1',
        url: 'https://team1.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team2',
        url: 'https://team2.com',
      },
    ]

    const review = buildReview({
      bodyText: 'LGTM!',
      bodyHTML: 'LGTM!',
      login: 'reviewer-with-association',
      onBehalfOf: {edges: teams.map(team => ({node: team}))},
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    const textContent = screen.getByTestId('comment-header-left-side-items').textContent
    expect(textContent).toContain('on behalf of org1/team1 and org1/team2')
  })

  test('renders all three teams the reviewer is part of', async () => {
    const environment = createMockEnvironment()

    const teams: OnBehalfOf[] = [
      {
        organization: {
          name: 'org1',
        },
        name: 'team1',
        url: 'https://team1.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team2',
        url: 'https://team2.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team3',
        url: 'https://team3.com',
      },
    ]

    const review = buildReview({
      bodyText: 'LGTM!',
      bodyHTML: 'LGTM!',
      login: 'reviewer-with-association',
      onBehalfOf: {edges: teams.map(team => ({node: team}))},
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    const textContent = screen.getByTestId('comment-header-left-side-items').textContent
    expect(textContent).toContain('on behalf of org1/team1, org1/team2, and org1/team3')
  })

  test('renders all five teams the reviewer is part of', async () => {
    const environment = createMockEnvironment()

    const teams: OnBehalfOf[] = [
      {
        organization: {
          name: 'org1',
        },
        name: 'team1',
        url: 'https://team1.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team2',
        url: 'https://team2.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team3',
        url: 'https://team3.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team4',
        url: 'https://team1.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team5',
        url: 'https://team2.com',
      },
    ]

    const review = buildReview({
      bodyText: 'LGTM!',
      bodyHTML: 'LGTM!',
      login: 'reviewer-with-association',
      onBehalfOf: {edges: teams.map(team => ({node: team}))},
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    const textContent = screen.getByTestId('comment-header-left-side-items').textContent
    expect(textContent).toContain('on behalf of org1/team1, org1/team2, org1/team3, org1/team4, and org1/team5')
  })

  test('renders first five teams and displays the remaining count when the reviewer is part of more than five teams', async () => {
    const environment = createMockEnvironment()

    const teams: OnBehalfOf[] = [
      {
        organization: {
          name: 'org1',
        },
        name: 'team1',
        url: 'https://team1.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team2',
        url: 'https://team2.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team3',
        url: 'https://team3.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team4',
        url: 'https://team1.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team5',
        url: 'https://team2.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team6',
        url: 'https://team3.com',
      },
      {
        organization: {
          name: 'org1',
        },
        name: 'team7',
        url: 'https://team3.com',
      },
    ]

    const review = buildReview({
      bodyText: 'LGTM!',
      bodyHTML: 'LGTM!',
      login: 'reviewer-with-association',
      onBehalfOf: {edges: teams.map(team => ({node: team}))},
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    const textContent = screen.getByTestId('comment-header-left-side-items').textContent
    expect(textContent).toContain(
      'on behalf of org1/team1, org1/team2, org1/team3, org1/team4, org1/team5, and 2 other teams',
    )
  })
})
