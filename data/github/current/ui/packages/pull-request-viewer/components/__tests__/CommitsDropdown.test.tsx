import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {ThemeProvider} from '@primer/react'
import {act, screen, within} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {SelectedRefContext} from '../../contexts/SelectedRefContext'
import PullRequestsAppWrapper from '../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest} from '../../test-utils/query-data'
import {CommitsDropdown} from '../CommitsDropdown'
import type {CommitsDropdownTestQuery} from './__generated__/CommitsDropdownTestQuery.graphql'

interface CommitsDropdownTestComponentProps {
  startOid?: string | null
  endOid?: string | null
  isSingleCommit?: boolean
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId: string
}

function CommitsDropdownTestComponent({
  environment,
  pullRequestId = 'mock-id',
  ...contextData
}: CommitsDropdownTestComponentProps) {
  const WrappedCommitsDropdownComponent = () => {
    const data = useLazyLoadQuery<CommitsDropdownTestQuery>(
      graphql`
        query CommitsDropdownTestQuery($pullRequestId: ID!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ...CommitsDropdown_pullRequest
          }
        }
      `,
      {pullRequestId},
    )

    if (data.pullRequest) return <CommitsDropdown pullRequest={data.pullRequest} onRangeUpdated={noop} />
    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <ThemeProvider>
        <SelectedRefContext.Provider value={{...contextData}}>
          <WrappedCommitsDropdownComponent />
        </SelectedRefContext.Provider>
      </ThemeProvider>
    </PullRequestsAppWrapper>
  )
}

const fillerCommitData = {
  abbreviatedOid: 'mock',
  messageHeadline: 'mock',
  author: {actor: {login: 'mock'}},
  committedDate: new Date(),
}

describe('commit dropdown button text', () => {
  test('shows all changes when no commits selected', async () => {
    const environment = createMockEnvironment()
    const commit1Oid = 'a631866b0075443de782a08024a2368296b83b9e'
    const commit2Oid = 'e3884b7d64007768b0240b22dceaa8fc3537731c'
    const commit3Oid = 'a9abc6e361fb2bece63858eff142ea361637aa5a'
    const pullRequest = buildPullRequest({
      commits: {
        totalCount: 3,
        edges: [
          {node: {commit: {oid: commit1Oid, ...fillerCommitData}}},
          {node: {commit: {oid: commit2Oid, ...fillerCommitData}}},
          {node: {commit: {oid: commit3Oid, ...fillerCommitData}}},
        ],
      },
    })

    render(<CommitsDropdownTestComponent environment={environment} pullRequestId={pullRequest.id} />)

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

    expect(screen.getByText('All changes')).toBeVisible()
  })

  test('shows single commit oid when single commit selected', async () => {
    const environment = createMockEnvironment()
    const commit1Oid = 'a631866b0075443de782a08024a2368296b83b9e'
    const commit2Oid = 'e3884b7d64007768b0240b22dceaa8fc3537731c'
    const commit3Oid = 'a9abc6e361fb2bece63858eff142ea361637aa5a'
    const pullRequest = buildPullRequest({
      commits: {
        totalCount: 3,
        edges: [
          {node: {commit: {oid: commit1Oid, ...fillerCommitData}}},
          {node: {commit: {oid: commit2Oid, ...fillerCommitData}}},
          {node: {commit: {oid: commit3Oid, ...fillerCommitData}}},
        ],
      },
    })

    render(
      <CommitsDropdownTestComponent
        isSingleCommit
        endOid={commit2Oid}
        environment={environment}
        pullRequestId={pullRequest.id}
        startOid={commit1Oid}
      />,
    )

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

    expect(screen.getByText(`Commit ${commit2Oid.slice(0, 7)}`)).toBeVisible()
  })

  test('shows single commit oid when range has one commit', async () => {
    const environment = createMockEnvironment()
    const commit1Oid = 'a631866b0075443de782a08024a2368296b83b9e'
    const commit2Oid = 'e3884b7d64007768b0240b22dceaa8fc3537731c'
    const commit3Oid = 'a9abc6e361fb2bece63858eff142ea361637aa5a'
    const pullRequest = buildPullRequest({
      commits: {
        totalCount: 3,
        edges: [
          {node: {commit: {oid: commit1Oid, ...fillerCommitData}}},
          {node: {commit: {oid: commit2Oid, ...fillerCommitData}}},
          {node: {commit: {oid: commit3Oid, ...fillerCommitData}}},
        ],
      },
    })

    render(
      <CommitsDropdownTestComponent
        endOid={commit2Oid}
        environment={environment}
        pullRequestId={pullRequest.id}
        startOid={commit1Oid}
      />,
    )

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

    expect(screen.getByText(`Commit ${commit2Oid.slice(0, 7)}`)).toBeVisible()
  })

  test('shows correct commit range', async () => {
    const environment = createMockEnvironment()
    const commit1Oid = 'a631866b0075443de782a08024a2368296b83b9e'
    const commit2Oid = 'e3884b7d64007768b0240b22dceaa8fc3537731c'
    const commit3Oid = 'a9abc6e361fb2bece63858eff142ea361637aa5a'
    const pullRequest = buildPullRequest({
      commits: {
        totalCount: 3,
        edges: [
          {node: {commit: {oid: commit1Oid, ...fillerCommitData}}},
          {node: {commit: {oid: commit2Oid, ...fillerCommitData}}},
          {node: {commit: {oid: commit3Oid, ...fillerCommitData}}},
        ],
      },
    })

    render(
      <CommitsDropdownTestComponent
        endOid={commit3Oid}
        environment={environment}
        pullRequestId={pullRequest.id}
        startOid={commit1Oid}
      />,
    )

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

    expect(screen.getByText(`${commit2Oid.slice(0, 7)}..${commit3Oid.slice(0, 7)}`)).toBeVisible()
  })
})

describe('commit dropdown overlay', () => {
  test('shows expected options', async () => {
    const environment = createMockEnvironment()
    const commit1Oid = 'a631866b0075443de782a08024a2368296b83b9e'
    const pullRequest = buildPullRequest({
      commits: {
        totalCount: 1,
        edges: [{node: {commit: {oid: commit1Oid, ...fillerCommitData}}}],
      },
    })

    const {user} = render(<CommitsDropdownTestComponent environment={environment} pullRequestId={pullRequest.id} />)

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

    await user.click(screen.getByRole('button'))

    const list = screen.getByRole('menu')
    expect(within(list).getByText('All changes')).toBeVisible()
    expect(screen.getByText('Specific commit…')).toBeVisible()
  })

  test('opens commit selector', async () => {
    const environment = createMockEnvironment()
    const commit1Oid = 'a631866b0075443de782a08024a2368296b83b9e'
    const pullRequest = buildPullRequest({
      commits: {
        totalCount: 1,
        edges: [{node: {commit: {oid: commit1Oid, ...fillerCommitData}}}],
      },
    })

    const {user} = render(<CommitsDropdownTestComponent environment={environment} pullRequestId={pullRequest.id} />)

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

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Specific commit…'))

    expect(screen.getByText('Pick one or more commits')).toBeVisible()
  })
})
