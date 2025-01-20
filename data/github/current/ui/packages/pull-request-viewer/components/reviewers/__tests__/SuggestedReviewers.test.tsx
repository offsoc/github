import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest, buildSuggestedReviewer} from '../../../test-utils/query-data'
import type {SuggestedReviewersTestQuery} from '../__tests__/__generated__/SuggestedReviewersTestQuery.graphql'
import {SuggestedReviewersInner} from '../SuggestedReviewers'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  hasCodeowners?: boolean
}

function TestComponent({environment}: TestComponentProps) {
  const TestComponentWithQuery = () => {
    const data = useLazyLoadQuery<SuggestedReviewersTestQuery>(
      graphql`
        query SuggestedReviewersTestQuery @relay_test_operation {
          pullRequest: node(id: "test-id") {
            ... on PullRequest {
              ...SuggestedReviewers_pullRequest
            }
          }
        }
      `,
      {},
    )
    if (!data.pullRequest) {
      return null
    }

    return <SuggestedReviewersInner isRequestingReviews={false} pullRequest={data.pullRequest} onRequestReview={noop} />
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={'mock'}>
      <TestComponentWithQuery />
    </PullRequestsAppWrapper>
  )
}

test('renders nothing if the pull request is closed', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'CLOSED',
            suggestedReviewers: [buildSuggestedReviewer({login: 'suggestedReviewer'})],
            viewerCanUpdate: true,
          })
        },
      }),
    )
  })
  expect(screen.queryByText('suggestedReviewer')).not.toBeInTheDocument()
})

test('renders nothing if the pull request is merged', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'MERGED',
            suggestedReviewers: [buildSuggestedReviewer({login: 'suggestedReviewer'})],
            viewerCanUpdate: true,
          })
        },
      }),
    )
  })
  expect(screen.queryByText('suggestedReviewer')).not.toBeInTheDocument()
})

test('renders text if there are no suggested reviewers', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({state: 'OPEN', suggestedReviewers: [], viewerCanUpdate: true})
        },
      }),
    )
  })
  expect(screen.getByText('None')).toBeInTheDocument()
})

test('renders the suggested reviewers', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'OPEN',
            suggestedReviewers: [
              buildSuggestedReviewer({login: 'suggestedReviewer1'}),
              buildSuggestedReviewer({login: 'suggestedReviewer2'}),
            ],
            viewerCanUpdate: true,
          })
        },
      }),
    )
  })
  expect(screen.getByText('suggestedReviewer1')).toBeInTheDocument()
  expect(screen.getByText('suggestedReviewer2')).toBeInTheDocument()
})

test('does not show request button if viewer cannot update pull request', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'OPEN',
            suggestedReviewers: [buildSuggestedReviewer({login: 'suggestedReviewer1'})],
            viewerCanUpdate: false,
          })
        },
      }),
    )
  })
  expect(screen.getByText('suggestedReviewer1')).toBeInTheDocument()
  expect(screen.queryByRole('button', {name: 'Request'})).not.toBeInTheDocument()
})
