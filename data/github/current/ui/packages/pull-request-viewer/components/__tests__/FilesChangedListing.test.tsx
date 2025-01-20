import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../contexts/PullRequestContext'
import PullRequestsAppWrapper from '../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest} from '../../test-utils/query-data'
import {FilesChangedListing} from '../FilesChangedListing'
import type {FilesChangedListingTestQuery} from './__generated__/FilesChangedListingTestQuery.graphql'

interface FilesChangedListingTestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId?: string
}

function FilesChangedListingTestComponent({
  environment,
  pullRequestId = 'test-id',
}: FilesChangedListingTestComponentProps) {
  const WrappedFilesChangedListingComponent = () => {
    const data = useLazyLoadQuery<FilesChangedListingTestQuery>(
      graphql`
        query FilesChangedListingTestQuery($pullRequestId: ID!, $startOid: String, $endOid: String)
        @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...FilesChangedListing_pullRequest
            }
          }
        }
      `,
      {pullRequestId},
    )

    if (data.pullRequest) return <FilesChangedListing pullRequest={data.pullRequest} />
    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <PullRequestContextProvider
        headRefOid="mock"
        isInMergeQueue={false}
        pullRequestId={pullRequestId}
        repositoryId="mock"
        state="OPEN"
      >
        <WrappedFilesChangedListingComponent />
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

test('renders the listing', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    comparison: {
      linesAdded: 3,
      linesDeleted: 3,
      summary: [
        {
          additions: 1,
          deletions: 1,
          path: '.secrets/hidden.md',
          pathDigest: '.secrets/hidden.md',
          changeType: 'DELETED',
          unresolvedCommentCount: 0,
        },
        {additions: 1, deletions: 1, path: '.env', pathDigest: '.env', changeType: 'ADDED', unresolvedCommentCount: 0},
        {
          additions: 1,
          deletions: 1,
          path: 'test.md',
          pathDigest: 'test.md',
          changeType: 'ADDED',
          unresolvedCommentCount: 0,
        },
        {
          additions: 1,
          deletions: 1,
          path: 'path/ruby_file.rb',
          pathDigest: 'path_ruby_file.rb',
          changeType: 'DELETED',
          unresolvedCommentCount: 3,
        },
        {
          additions: 1,
          deletions: 1,
          path: 'README.md',
          pathDigest: 'README.md',
          changeType: 'MODIFIED',
          unresolvedCommentCount: 0,
        },
      ],
    },
  })

  render(<FilesChangedListingTestComponent environment={environment} pullRequestId={pullRequest.id} />)

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

  // check the heading
  const filesChangedHeading = screen.getAllByRole('heading')[0]
  expect(filesChangedHeading).toHaveTextContent('Files changed')

  // check counter labels within files changed heading container
  // query by test id because there are too many "files changed" elements
  const filesChangedHeadingContainer = screen.getByTestId('files-changed-heading-container')
  expect(filesChangedHeadingContainer).toHaveTextContent('+3')
  expect(filesChangedHeadingContainer).toHaveTextContent('-3')

  // check row elements
  const rows = screen.getAllByRole('listitem')
  expect(rows).toHaveLength(5)

  const hiddenFolder = screen.getByLabelText('.secrets/hidden.md: 1 addition, 1 deletion')
  expect(hiddenFolder).toHaveTextContent('.secrets/hidden.md')

  const hiddenFile = screen.getByLabelText('.env: 1 addition, 1 deletion')
  expect(hiddenFile).toHaveTextContent('.env')

  const row1 = screen.getByLabelText('test.md: 1 addition, 1 deletion')
  expect(row1).toHaveTextContent('test.md')
  expect(row1).toHaveTextContent('+1')
  expect(row1).toHaveTextContent('-1')

  const row2 = screen.getByLabelText('path/ruby_file.rb: 3 unresolved comments, 1 addition, 1 deletion')
  expect(row2).toHaveTextContent('path/ruby_file.rb')
  expect(row2).toHaveTextContent('+1')
  expect(row2).toHaveTextContent('-1')
  expect(row2).toHaveTextContent('3')

  const row3 = screen.getByLabelText('README.md: 1 addition, 1 deletion')
  expect(row3).toHaveTextContent('README.md')
  expect(row3).toHaveTextContent('+1')
  expect(row3).toHaveTextContent('-1')

  // check for sr-only text
  const srOnlyText = screen.getAllByText('has 3 comments', {selector: '.sr-only'})
  expect(srOnlyText).toHaveLength(1)
})
