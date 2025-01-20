import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {ThemeProvider} from '@primer/react'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {SelectedRefContext} from '../../contexts/SelectedRefContext'
import PullRequestsAppWrapper from '../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest} from '../../test-utils/query-data'
import {CommitsSelector} from '../CommitsSelector'
import type {CommitsSelectorTestQuery} from './__generated__/CommitsSelectorTestQuery.graphql'

interface CommitsSelectorTestComponentProps {
  endOid?: string | null
  environment: ReturnType<typeof createMockEnvironment>
  onRangeUpdated?: (args: {startOid: string; endOid: string} | {singleCommitOid: string} | undefined) => void
  pullRequestId: string
  startOid?: string | null
}

function CommitsSelectorTestComponent({
  environment,
  onRangeUpdated = noop,
  pullRequestId = 'mock-id',
  ...contextData
}: CommitsSelectorTestComponentProps) {
  const WrappedCommitsSelectorComponent = () => {
    const data = useLazyLoadQuery<CommitsSelectorTestQuery>(
      graphql`
        query CommitsSelectorTestQuery($pullRequestId: ID!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ...CommitsSelector_pullRequest
          }
        }
      `,
      {pullRequestId},
    )

    if (data.pullRequest)
      return (
        <CommitsSelector
          pullRequest={data.pullRequest}
          onClose={noop}
          onRangeUpdated={onRangeUpdated}
          {...contextData}
        />
      )
    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <ThemeProvider>
        <SelectedRefContext.Provider value={{...contextData}}>
          <WrappedCommitsSelectorComponent />
        </SelectedRefContext.Provider>
      </ThemeProvider>
    </PullRequestsAppWrapper>
  )
}

const fillerCommitData = {
  messageHeadline: 'mock',
  author: {actor: {login: 'monalisa'}},
  committedDate: new Date(),
}

const baseRefOid = 'baseRefOid'
const commit1Oid = 'a631866b0075443de782a08024a2368296b83b9e'
const commit2Oid = 'e3884b7d64007768b0240b22dceaa8fc3537731c'
const commit3Oid = 'a9abc6e361fb2bece63858eff142ea361637aa5a'
const commit4Oid = 'b3ab46e361fb2bece63858eff142ea361637aa5a'
const setupPullRequest = () =>
  buildPullRequest({
    baseRefOid,
    commits: {
      totalCount: 3,
      edges: [
        {
          node: {
            commit: {
              ...fillerCommitData,
              abbreviatedOid: commit1Oid.slice(0, 7),
              messageHeadline: 'commit 1',
              oid: commit1Oid,
            },
          },
        },
        {
          node: {
            commit: {
              ...fillerCommitData,
              abbreviatedOid: commit2Oid.slice(0, 7),
              messageHeadline: 'commit 2',
              oid: commit2Oid,
            },
          },
        },
        {
          node: {
            commit: {
              ...fillerCommitData,
              abbreviatedOid: commit3Oid.slice(0, 7),
              messageHeadline: 'commit 3',
              oid: commit3Oid,
            },
          },
        },
        {
          node: {
            commit: {
              ...fillerCommitData,
              abbreviatedOid: commit4Oid.slice(0, 7),
              messageHeadline: 'commit 4',
              oid: commit4Oid,
            },
          },
        },
      ],
    },
  })

test('shows commit selector', async () => {
  const environment = createMockEnvironment()
  const pullRequest = setupPullRequest()

  render(<CommitsSelectorTestComponent environment={environment} pullRequestId={pullRequest.id} />)

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

  expect(screen.getByText('Pick one or more commits')).toBeVisible()
  expect(screen.getByText('Picking a range will select commits in between.')).toBeVisible()
  expect(screen.getByText(commit1Oid.slice(0, 7), {exact: false})).toBeVisible()
  expect(screen.getByText(commit2Oid.slice(0, 7), {exact: false})).toBeVisible()
  expect(screen.getByText(commit3Oid.slice(0, 7), {exact: false})).toBeVisible()
  expect(screen.getByText(commit4Oid.slice(0, 7), {exact: false})).toBeVisible()

  expect(screen.getAllByText('monalisa', {exact: false}).length).toBe(4)
})

describe('commit selector logic', () => {
  test('inclusively selects and de-selects items', async () => {
    const environment = createMockEnvironment()
    const pullRequest = setupPullRequest()

    const {user} = render(<CommitsSelectorTestComponent environment={environment} pullRequestId={pullRequest.id} />)

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

    expect(screen.getByText('Pick one or more commits')).toBeVisible()

    // select the first item and verify that it is selected
    await user.click(screen.getByText('commit 1'))
    expect(screen.getByRole('option', {name: /commit 1/})).toHaveAttribute('aria-selected', 'true')

    // select the third item and verify that all options selected
    await user.click(screen.getByText('commit 3'))
    expect(screen.getByRole('option', {name: /commit 1/})).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', {name: /commit 2/})).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', {name: /commit 3/})).toHaveAttribute('aria-selected', 'true')

    // click the second item and verify that items 2 and 3 are not selected
    await user.click(screen.getByText('commit 2'))
    expect(screen.getByRole('option', {name: /commit 1/})).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', {name: /commit 2/})).not.toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', {name: /commit 3/})).not.toHaveAttribute('aria-selected', 'true')

    // click the first item and verify that nothing is selected
    await user.click(screen.getByText('commit 1'))
    expect(screen.getByRole('option', {name: /commit 1/})).not.toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', {name: /commit 2/})).not.toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', {name: /commit 3/})).not.toHaveAttribute('aria-selected', 'true')
  })

  describe('initial selection state', () => {
    describe('with range', () => {
      test('including start commit', async () => {
        const environment = createMockEnvironment()
        const pullRequest = setupPullRequest()

        render(
          <CommitsSelectorTestComponent
            endOid={commit2Oid}
            environment={environment}
            pullRequestId={pullRequest.id}
            startOid={baseRefOid}
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

        expect(screen.getByText('Pick one or more commits')).toBeVisible()

        // select the first item and verify that it is selected
        expect(screen.getByRole('option', {name: /commit 1/})).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('option', {name: /commit 2/})).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('option', {name: /commit 3/})).toHaveAttribute('aria-selected', 'false')
      })

      test('including end commit', async () => {
        const environment = createMockEnvironment()
        const pullRequest = setupPullRequest()

        render(
          <CommitsSelectorTestComponent
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

        expect(screen.getByText('Pick one or more commits')).toBeVisible()

        // select the first item and verify that it is selected
        expect(screen.getByRole('option', {name: /commit 1/})).toHaveAttribute('aria-selected', 'false')
        expect(screen.getByRole('option', {name: /commit 2/})).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('option', {name: /commit 3/})).toHaveAttribute('aria-selected', 'true')
      })

      test('excluding start and end commit', async () => {
        const environment = createMockEnvironment()
        const pullRequest = setupPullRequest()

        render(
          <CommitsSelectorTestComponent
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

        expect(screen.getByText('Pick one or more commits')).toBeVisible()

        // select the first item and verify that it is selected
        expect(screen.getByRole('option', {name: /commit 1/})).toHaveAttribute('aria-selected', 'false')
        expect(screen.getByRole('option', {name: /commit 2/})).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('option', {name: /commit 3/})).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('option', {name: /commit 4/})).toHaveAttribute('aria-selected', 'false')
      })
    })

    test('with single commit', async () => {
      const environment = createMockEnvironment()
      const pullRequest = setupPullRequest()

      render(
        <CommitsSelectorTestComponent
          endOid={commit3Oid}
          environment={environment}
          pullRequestId={pullRequest.id}
          startOid={commit2Oid}
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

      expect(screen.getByText('Pick one or more commits')).toBeVisible()

      expect(screen.getByRole('option', {name: /commit 1/})).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('option', {name: /commit 2/})).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('option', {name: /commit 3/})).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('commit selector apply changes', () => {
    test('with single commit selected', async () => {
      const environment = createMockEnvironment()
      const pullRequest = setupPullRequest()

      const changeCommittedMock = jest.fn()

      const {user} = render(
        <>
          <CommitsSelectorTestComponent
            environment={environment}
            pullRequestId={pullRequest.id}
            onRangeUpdated={changeCommittedMock}
          />
        </>,
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

      expect(screen.getByText('Pick one or more commits')).toBeVisible()

      await user.click(screen.getByRole('option', {name: /commit 1/}))
      await user.click(screen.getByText('Save'))

      expect(changeCommittedMock).toHaveBeenCalledWith({singleCommitOid: commit1Oid})
    })

    test('with range selected', async () => {
      const environment = createMockEnvironment()
      const pullRequest = setupPullRequest()

      const changeCommittedMock = jest.fn()

      const {user} = render(
        <>
          <CommitsSelectorTestComponent
            environment={environment}
            pullRequestId={pullRequest.id}
            onRangeUpdated={changeCommittedMock}
          />
        </>,
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

      expect(screen.getByText('Pick one or more commits')).toBeVisible()

      await user.click(screen.getByRole('option', {name: /commit 2/}))
      await user.click(screen.getByRole('option', {name: /commit 3/}))
      await user.click(screen.getByText('Save'))

      expect(changeCommittedMock).toHaveBeenCalledWith({startOid: commit1Oid, endOid: commit3Oid})
    })

    test('with all commits selected and initial single commit', async () => {
      const environment = createMockEnvironment()
      const pullRequest = setupPullRequest()
      const changeCommittedMock = jest.fn()

      const {user} = render(
        <>
          <CommitsSelectorTestComponent
            endOid={commit1Oid}
            environment={environment}
            pullRequestId={pullRequest.id}
            startOid={baseRefOid}
            onRangeUpdated={changeCommittedMock}
          />
        </>,
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

      expect(screen.getByText('Pick one or more commits')).toBeVisible()

      await user.click(screen.getByRole('option', {name: /commit 2/}))
      await user.click(screen.getByRole('option', {name: /commit 3/}))
      await user.click(screen.getByRole('option', {name: /commit 4/}))
      await user.click(screen.getByText('Save'))

      expect(changeCommittedMock).toHaveBeenCalledWith(undefined)
    })

    test('with all commits selected and empty initial range', async () => {
      const environment = createMockEnvironment()
      const pullRequest = setupPullRequest()
      const changeCommittedMock = jest.fn()

      const {user} = render(
        <>
          <CommitsSelectorTestComponent
            environment={environment}
            pullRequestId={pullRequest.id}
            onRangeUpdated={changeCommittedMock}
          />
        </>,
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

      expect(screen.getByText('Pick one or more commits')).toBeVisible()

      await user.click(screen.getByRole('option', {name: /commit 1/}))
      await user.click(screen.getByRole('option', {name: /commit 2/}))
      await user.click(screen.getByRole('option', {name: /commit 3/}))
      await user.click(screen.getByRole('option', {name: /commit 4/}))
      await user.click(screen.getByText('Save'))

      expect(changeCommittedMock).not.toHaveBeenCalled()
    })
  })

  test('clearing selection', async () => {
    const environment = createMockEnvironment()
    const pullRequest = setupPullRequest()

    const {user} = render(
      <CommitsSelectorTestComponent
        endOid={commit3Oid}
        environment={environment}
        pullRequestId={pullRequest.id}
        startOid={commit2Oid}
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

    expect(screen.getByText('Pick one or more commits')).toBeVisible()

    expect(screen.getByRole('option', {name: /commit 1/})).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('option', {name: /commit 2/})).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('option', {name: /commit 3/})).toHaveAttribute('aria-selected', 'true')

    await user.click(screen.getByRole('button', {name: 'Clear selection'}))

    expect(screen.getByRole('option', {name: /commit 1/})).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('option', {name: /commit 2/})).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('option', {name: /commit 3/})).toHaveAttribute('aria-selected', 'false')
  })
})
