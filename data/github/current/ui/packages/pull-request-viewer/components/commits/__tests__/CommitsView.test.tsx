import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {startTransition, useEffect} from 'react'
import {graphql, useLazyLoadQuery, useQueryLoader} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import type {DeferredCommitsDataLoaderQuery} from '../__generated__/DeferredCommitsDataLoaderQuery.graphql'
import {CommitsView} from '../CommitsView'
import {DeferredCommitsDataQuery} from '../DeferredCommitsDataLoader'
import type {CommitsViewTestQuery} from './__generated__/CommitsViewTestQuery.graphql'

interface CommitsViewTestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestNumber?: number
  repositoryId?: string
}

function CommitsViewTestComponent({
  environment,
  pullRequestNumber = 1,
  repositoryId = 'mock-id',
}: CommitsViewTestComponentProps) {
  const WrappedCommitsViewComponent = () => {
    const [queryReference, loadQuery] = useQueryLoader<DeferredCommitsDataLoaderQuery>(DeferredCommitsDataQuery)

    const data = useLazyLoadQuery<CommitsViewTestQuery>(
      graphql`
        query CommitsViewTestQuery($repositoryId: ID!, $number: Int!) @relay_test_operation {
          repository: node(id: $repositoryId) {
            ...CommitsView_repository
          }
        }
      `,
      {number: pullRequestNumber, repositoryId},
    )

    useEffect(() => {
      startTransition(() => {
        loadQuery({owner: 'mock', repo: 'mock', number: 1}, {fetchPolicy: 'store-or-network'})
      })
    }, [loadQuery])

    if (data.repository && queryReference) {
      return <CommitsView deferredCommitsDataQuery={queryReference} repository={data.repository} />
    }

    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId="mock-pr-id">
      <WrappedCommitsViewComponent />
    </PullRequestsAppWrapper>
  )
}

const commit1Oid = 'a631866b0075443de782a08024a2368296b83b9e'
const commit2Oid = 'e3884b7d64007768b0240b22dceaa8fc3537731c'
const commit3Oid = 'a9abc6e361fb2bece63858eff142ea361637aa5a'
const commit4Oid = 'b3ab46e361fb2bece63858eff142ea361637aa5a'
const commitDate1 = '2024-02-20 23:02:23'
const commitDate2 = '2024-02-28 23:02:23'
const authorshipData = {
  authors: {
    edges: [
      {
        node: {
          avatarUrl: '',
          login: 'monalisa',
          name: 'Mona',
          resourcePath: '/monalisa',
        },
      },
    ],
  },
  committer: {
    user: {
      avatarUrl: '',
      login: 'monalisa',
      name: 'Mona',
      resourcePath: '/monalisa',
    },
  },
}

const setupPullRequest = () => ({
  commits: {
    edges: [
      {
        node: {
          messageHeadlineHTMLLink: 'commit 1 title',
          commit: {
            authoredByCommitter: true,
            authoredDate: commitDate1,
            committedDate: commitDate1,
            messageHeadline: 'commit 1 title',
            messageBodyHTML: 'commit 1',
            oid: commit1Oid,
            ...authorshipData,
          },
        },
      },
      {
        node: {
          messageHeadlineHTMLLink: 'commit 2 title',
          commit: {
            authoredByCommitter: true,
            authoredDate: commitDate1,
            committedDate: commitDate1,
            messageHeadline: 'commit 2 title',
            messageBodyHTML: 'commit 2',
            oid: commit2Oid,
            ...authorshipData,
          },
        },
      },
      {
        node: {
          messageHeadlineHTMLLink: 'commit 3 title',
          commit: {
            authoredByCommitter: true,
            authoredDate: commitDate2,
            committedDate: commitDate2,
            messageHeadline: 'commit 3 title',
            messageBodyHTML: 'commit 3',
            oid: commit3Oid,
            ...authorshipData,
          },
        },
      },
      {
        node: {
          messageHeadlineHTMLLink: 'commit 4 title',
          commit: {
            authoredByCommitter: true,
            authoredDate: commitDate2,
            committedDate: commitDate2,
            messageHeadline: 'commit 4 title',
            messageBodyHTML: 'commit 4',
            oid: commit4Oid,
            ...authorshipData,
          },
        },
      },
    ],
  },
})

const setupPullRequestWithDeferredData = () => ({
  commits: {
    edges: [
      {
        node: {
          commit: {
            hasSignature: true,
            verificationStatus: 'VERIFIED',
            oid: commit1Oid,
          },
        },
      },
      {
        node: {
          commit: {
            verificationStatus: 'unverified',
            oid: commit2Oid,
          },
        },
      },
      {
        node: {
          commit: {
            verificationStatus: 'unverified',
            oid: commit3Oid,
          },
        },
      },
      {
        node: {
          commit: {
            verificationStatus: 'unverified',
            oid: commit4Oid,
          },
        },
      },
    ],
  },
})

test('renders pull request commits list without deferred data', async () => {
  const environment = createMockEnvironment()
  const pullRequest = setupPullRequest()

  render(<CommitsViewTestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
      })
    })
  })

  expect(await screen.findByText('Commits on Feb 20, 2024')).toBeVisible()
  expect(screen.getByText('Commits on Feb 28, 2024')).toBeVisible()
  expect(screen.getByText('commit 1 title')).toBeVisible()
  expect(screen.getByText('commit 2 title')).toBeVisible()
  expect(screen.getByText('commit 3 title')).toBeVisible()
  expect(screen.getByText('commit 4 title')).toBeVisible()
})

test('renders pull request commits deferred data', async () => {
  const environment = createMockEnvironment()
  const pullRequest = setupPullRequest()

  render(<CommitsViewTestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
      })
    })
  })

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return setupPullRequestWithDeferredData()
        },
      })
    })
  })

  expect(await screen.findByText('Commits on Feb 20, 2024')).toBeVisible()
  expect(screen.getByText('Verified')).toBeVisible()
})
