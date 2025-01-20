import {assertDataPresent} from '@github-ui/assert-data-present'
import type {Subject} from '@github-ui/comment-box/subject'
import {ConversationMarkdownSubjectProvider} from '@github-ui/conversations'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {SplitPageLayout} from '@primer/react'
import {Suspense, useMemo} from 'react'
import type {PreloadedQuery} from 'react-relay'
import {graphql, useFragment, usePreloadedQuery} from 'react-relay'

import {PullRequestContextProvider} from '../contexts/PullRequestContext'
import {useEmitPageViewEvent} from '../hooks/use-emit-page-view-event'
import type {PullRequestFilesViewerQueries} from '../types'
import type {PullRequestFilesViewerContent_pullRequest$key} from './__generated__/PullRequestFilesViewerContent_pullRequest.graphql'
import type {PullRequestFilesViewerContent_viewer$key} from './__generated__/PullRequestFilesViewerContent_viewer.graphql'
import type {PullRequestFilesViewerContentQuery} from './__generated__/PullRequestFilesViewerContentQuery.graphql'
import DiffsWithComments from './DiffsWithComments'
import {FilesChangedContentLoading} from './skeletons/FilesChangedContentLoading'

export const PullRequestFilesViewerContentGraphQLQuery = graphql`
  query PullRequestFilesViewerContentQuery(
    $diffEntryCount: Int = 5
    $diffEntryCursor: String
    $endOid: String
    $injectedContextLines: [DiffLineRange!]
    $inlineThreadCount: Int = 20
    $isSingleCommit: Boolean = false
    $number: Int!
    $owner: String!
    $repo: String!
    $singleCommitOid: String
    $startOid: String
  ) {
    viewer {
      ...PullRequestFilesViewerContent_viewer
      # cache warming for ui/packages/copilot-code-chat
      # eslint-disable-next-line relay/unused-fields
      isCopilotDotcomChatEnabled
    }
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        ...PullRequestFilesViewerContent_pullRequest
        ...useEmitPageViewEvent_pullRequest
          @arguments(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid)
      }
    }
  }
`

interface PullRequestFilesViewerProps {
  owner: string
  pullRequestNumber: number
  repo: string
}

/**
 * Renders the files of the diff in full-width mode
 */
export function PullRequestFilesViewer({queries}: PullRequestFilesViewerProps & PullRequestFilesViewerQueries) {
  const {contentQuery} = queries

  return (
    <Suspense fallback={<FilesChangedContentLoading />}>
      <PullRequestFilesViewerContentWrapper queryRef={contentQuery} />
    </Suspense>
  )
}

/**
 * PullRequestFilesViewerContent loads the preloaded data (fetched in PullRequestFilesViewerPage) and passes
 * the data to its children. This makes it easier to keep the components
 * as is (they consume data using the `useFragment` hook.)
 */
function PullRequestFilesViewerContentWrapper({
  queryRef,
}: {
  queryRef: PreloadedQuery<PullRequestFilesViewerContentQuery>
}) {
  const data = usePreloadedQuery(PullRequestFilesViewerContentGraphQLQuery, queryRef)

  assertDataPresent(data.repository?.pullRequest)
  assertDataPresent(data.viewer)

  useEmitPageViewEvent(data.repository.pullRequest)

  return (
    <ErrorBoundary>
      <PullRequestFilesViewerContent pullRequest={data.repository.pullRequest} viewer={data.viewer} />
    </ErrorBoundary>
  )
}

/**
 * Handles the bulk of the complexity of the page
 */
function PullRequestFilesViewerContent({
  pullRequest,
  viewer,
}: {
  pullRequest: PullRequestFilesViewerContent_pullRequest$key
  viewer: PullRequestFilesViewerContent_viewer$key
}): JSX.Element {
  const userData = useFragment(
    graphql`
      fragment PullRequestFilesViewerContent_viewer on User {
        ...DiffsWithComments_viewer
      }
    `,
    viewer,
  )

  const pullRequestData = useFragment(
    graphql`
      fragment PullRequestFilesViewerContent_pullRequest on PullRequest {
        ...DiffsWithComments_pullRequest
        databaseId
        id
        headRefOid
        viewerPendingReview {
          id
        }
        repository {
          databaseId
          id
          nameWithOwner
          slashCommandsEnabled
        }
        isInMergeQueue
        state
        viewerCanComment
        viewerCanApplySuggestion
      }
    `,
    pullRequest,
  )

  const markdownSubject = useMemo<Subject>(
    () => ({
      repository: {
        databaseId: pullRequestData.repository.databaseId!,
        nwo: pullRequestData.repository.nameWithOwner,
        slashCommandsEnabled: pullRequestData.repository.slashCommandsEnabled,
      },
      type: 'pull_request',
      id: {
        databaseId: pullRequestData.databaseId!,
        id: pullRequestData.id,
      },
    }),
    [
      pullRequestData.databaseId,
      pullRequestData.id,
      pullRequestData.repository.databaseId,
      pullRequestData.repository.nameWithOwner,
      pullRequestData.repository.slashCommandsEnabled,
    ],
  )

  return (
    <PullRequestContextProvider
      headRefOid={pullRequestData.headRefOid as string}
      isInMergeQueue={pullRequestData.isInMergeQueue}
      pullRequestId={pullRequestData.id}
      repositoryId={pullRequestData.repository.id}
      state={pullRequestData.state}
      viewerCanApplySuggestion={pullRequestData.viewerCanApplySuggestion}
      viewerCanComment={pullRequestData.viewerCanComment}
      viewerPendingReviewId={pullRequestData.viewerPendingReview?.id}
    >
      <ConversationMarkdownSubjectProvider value={markdownSubject}>
        <SplitPageLayout.Content as="div" padding="none" width="full">
          <DiffsWithComments pullRequest={pullRequestData} viewer={userData} />
        </SplitPageLayout.Content>
      </ConversationMarkdownSubjectProvider>
    </PullRequestContextProvider>
  )
}
