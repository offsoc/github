import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest} from '../../../test-utils/query-data'
import {ActionSection} from '../ActionSection'
import type {ActionSectionTestQuery} from './__generated__/ActionSectionTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
}

function TestComponent(props: TestComponentProps) {
  const TestComponentWithQuery = () => {
    const data = useLazyLoadQuery<ActionSectionTestQuery>(
      graphql`
        query ActionSectionTestQuery @relay_test_operation {
          pullRequest: node(id: "test-id") {
            ... on PullRequest {
              ...ActionSection_pullRequest
            }
          }
        }
      `,
      {},
    )
    if (!data.pullRequest) {
      return null
    }

    return <ActionSection pullRequest={data.pullRequest} />
  }

  return (
    <PullRequestsAppWrapper environment={props.environment} pullRequestId={'mock'}>
      <TestComponentWithQuery />
    </PullRequestsAppWrapper>
  )
}

describe('when draft PRs are supported', () => {
  test('when pull request is not in draft', async () => {
    const environment = createMockEnvironment()

    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              isDraft: false,
              viewerCanUpdate: true,
              baseRepository: {
                nameWithOwner: 'monalisa/smile',
                planSupportsDraftPullRequests: true,
              },
              state: 'OPEN',
            })
          },
        }),
      )
    })

    expect(screen.queryByText('Mark as ready for review')).not.toBeInTheDocument()
    expect(screen.getByText('Convert to draft')).toBeInTheDocument()
  })

  test('when pull request is in draft', async () => {
    const environment = createMockEnvironment()

    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              isDraft: true,
              viewerCanUpdate: true,
              baseRepository: {
                nameWithOwner: 'monalisa/smile',
                planSupportsDraftPullRequests: true,
              },
              state: 'OPEN',
            })
          },
        }),
      )
    })

    expect(screen.getByText('Mark as ready for review')).toBeInTheDocument()
    expect(screen.queryByText('Convert to draft')).not.toBeInTheDocument()
  })
})

describe('when draft PRs are not supported', () => {
  test('when the plan does not support draft PRs', async () => {
    const environment = createMockEnvironment()

    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              isDraft: true,
              viewerCanUpdate: true,
              baseRepository: {
                nameWithOwner: 'monalisa/smile',
                planSupportsDraftPullRequests: false,
              },
              state: 'OPEN',
            })
          },
        }),
      )
    })

    expect(screen.queryByText('Mark as ready for review')).not.toBeInTheDocument()
    expect(screen.queryByText('Convert to draft')).not.toBeInTheDocument()
  })

  test('when the user does not have permission to update the PR', async () => {
    const environment = createMockEnvironment()

    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              isDraft: true,
              viewerCanUpdate: false,
              baseRepository: {
                nameWithOwner: 'monalisa/smile',
                planSupportsDraftPullRequests: true,
              },
              state: 'OPEN',
            })
          },
        }),
      )
    })

    expect(screen.queryByText('Mark as ready for review')).not.toBeInTheDocument()
    expect(screen.queryByText('Convert to draft')).not.toBeInTheDocument()
  })

  test('when the pr is not open', async () => {
    const environment = createMockEnvironment()

    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              isDraft: true,
              viewerCanUpdate: false,
              baseRepository: {
                nameWithOwner: 'monalisa/smile',
                planSupportsDraftPullRequests: true,
              },
              state: 'CLOSED',
            })
          },
        }),
      )
    })

    expect(screen.queryByText('Mark as ready for review')).not.toBeInTheDocument()
    expect(screen.queryByText('Convert to draft')).not.toBeInTheDocument()
  })
})
