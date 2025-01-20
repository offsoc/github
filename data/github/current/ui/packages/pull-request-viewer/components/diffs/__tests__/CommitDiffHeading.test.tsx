import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {CommitDiffHeading} from '../CommitDiffHeading'
import type {CommitDiffHeadingTestQuery} from './__generated__/CommitDiffHeadingTestQuery.graphql'

interface CommitDiffHeadingTestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  commitId?: string
}

function CommitDiffHeadingTestComponent({environment, commitId = 'mock-id'}: CommitDiffHeadingTestComponentProps) {
  const WrappedCommitDiffHeadingComponent = () => {
    const data = useLazyLoadQuery<CommitDiffHeadingTestQuery>(
      graphql`
        query CommitDiffHeadingTestQuery($commitId: ID!) @relay_test_operation {
          commit: node(id: $commitId) {
            ...CommitDiffHeading_commit
          }
          viewer {
            ...CommitDiffHeading_viewer
          }
        }
      `,
      {commitId},
    )

    if (data.commit) {
      return <CommitDiffHeading commit={data.commit} viewer={data.viewer} />
    }

    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId="mock-pr-id">
      <WrappedCommitDiffHeadingComponent />
    </PullRequestsAppWrapper>
  )
}

const commit1Oid = 'a631866b0075443de782a08024a2368296b83b9e'
const commitDate1 = '2024-02-20 23:02:23'
const authorshipData = {
  authors: {
    edges: [
      {
        node: {
          user: {
            avatarUrl: '',
            login: 'monalisa',
            name: 'Mona',
            resourcePath: '/monalisa',
          },
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

const setupCommit = () => ({
  abbreviatedOid: 'a631866',
  authoredByCommitter: true,
  authoredDate: commitDate1,
  committedDate: commitDate1,
  hasSignature: true,
  messageHeadlineHTML: 'commit 1 title',
  messageBodyHTML: 'commit 1 description',
  oid: commit1Oid,
  verificationStatus: 'VERIFIED',
  ...authorshipData,
})

test('renders commit diff heading with commit metadata', async () => {
  const environment = createMockEnvironment()
  const commit = setupCommit()

  render(<CommitDiffHeadingTestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        Commit() {
          return commit
        },
      })
    })
  })

  expect(await screen.findByText('commit 1 title')).toBeVisible()
  expect(screen.getByText('commit 1 description')).toBeVisible()
  expect(screen.getByText('monalisa')).toBeVisible()
  expect(screen.getByText('Verified')).toBeVisible()
  expect(screen.getByText('Browse files')).toBeVisible()
  // We need to use element type and textContent mapper here as the "commit hash" is wrapped in a parent <span> element to style differently
  expect(screen.getByText((_, element) => element?.textContent === 'Commit a631866')).toBeInTheDocument()
})
