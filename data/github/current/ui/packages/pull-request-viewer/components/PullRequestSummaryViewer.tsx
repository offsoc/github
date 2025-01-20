import {assertDataPresent} from '@github-ui/assert-data-present'
import type {Subject} from '@github-ui/comment-box/subject'
import {CommentEditsContextProvider} from '@github-ui/commenting/CommentEditsContext'
import {ConversationMarkdownSubjectProvider} from '@github-ui/conversations'
import {MergeBoxWithRelaySuspense} from '@github-ui/mergebox'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {Box, Heading, PageLayout, SplitPageLayout} from '@primer/react'
import type {ForwardedRef} from 'react'
import {forwardRef, Suspense, useMemo, useRef, useState} from 'react'
import type {PreloadedQuery} from 'react-relay'
import {graphql, usePreloadedQuery, useRefetchableFragment} from 'react-relay'

import {PullRequestContextProvider} from '../contexts/PullRequestContext'
import {useEmitPageViewEvent} from '../hooks/use-emit-page-view-event'
import type {PullRequestSummaryViewerQueries} from '../types'
import type {PullRequestSummaryViewerContent_pullRequest$key} from './__generated__/PullRequestSummaryViewerContent_pullRequest.graphql'
import type {PullRequestSummaryViewerContentQuery} from './__generated__/PullRequestSummaryViewerContentQuery.graphql'
import type {PullRequestSummaryViewerSecondaryContentQuery} from './__generated__/PullRequestSummaryViewerSecondaryContentQuery.graphql'
import {ActivityView} from './activity/ActivityView'
import Description from './Description'
import {DetailsPaneWithSuspense} from './details-pane/DetailsPane'
import DetailsSidesheet from './details-pane/DetailsSidesheet'
import {FilesChangedListing} from './FilesChangedListing'
import {SkeletonPullRequestSummary} from './skeletons/SkeletonPullRequestSummary'
import {SkeletonPullRequestSummarySecondaryContent} from './skeletons/SkeletonPullRequestSummarySecondaryContent'

export const PullRequestSummaryViewerContentGraphQLQuery = graphql`
  query PullRequestSummaryViewerContentQuery($number: Int!, $owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        ...PullRequestSummaryViewerContent_pullRequest
        ...useEmitPageViewEvent_pullRequest
      }
    }
  }
`

export const PullRequestSummaryViewerSecondaryContentGraphQLQuery = graphql`
  query PullRequestSummaryViewerSecondaryContentQuery(
    $number: Int!
    $owner: String!
    $repo: String!
    $startOid: String
    $endOid: String
    $timelinePageSize: Int
  ) {
    viewer {
      ...ActivityView_viewer
    }
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        id
        ...FilesChangedListing_pullRequest
        ...ActivityView_pullRequest @arguments(timelinePageSize: $timelinePageSize)
      }
    }
  }
`

interface PullRequestSummaryViewerProps {
  owner: string
  pullRequestNumber: number
  repo: string
}

/**
 * Renders a summary of the pull request, including a description, the details pane, and the diffs
 */
export function PullRequestSummaryViewer({queries}: PullRequestSummaryViewerProps & PullRequestSummaryViewerQueries) {
  const {contentQuery, detailsPaneQuery, secondaryContentQuery} = queries
  const {screenSize} = useScreenSize()
  const isNarrow = screenSize < ScreenSize.large
  const toggleSidesheetRef = useRef<HTMLButtonElement>(null)
  const [detailsSidesheetIsOpen, setDetailsSidesheetIsOpen] = useState(false)
  const exitOverlay = () => {
    setDetailsSidesheetIsOpen(false)
  }

  return (
    <>
      <SplitPageLayout.Content as="div" padding="none" width="full">
        <PageLayout columnGap="none" containerWidth="xlarge" padding="none">
          <PageLayout.Content as="div" padding="none" sx={{p: [2, 3, 4], pr: [2, 3, 0]}}>
            <Suspense fallback={<SkeletonPullRequestSummary />}>
              <PullRequestSummaryViewerContentWrapper
                ref={toggleSidesheetRef}
                handleOpenSidesheet={() => setDetailsSidesheetIsOpen(true)}
                queryRef={contentQuery}
                secondaryContentQueryRef={secondaryContentQuery}
              />
            </Suspense>
          </PageLayout.Content>
          {detailsSidesheetIsOpen && (
            <DetailsSidesheet
              detailsPaneQuery={detailsPaneQuery}
              exitOverlay={exitOverlay}
              isNarrow={isNarrow}
              toggleSidesheetRef={toggleSidesheetRef}
            />
          )}
          <PageLayout.Pane
            aria-label="Details panel"
            hidden={isNarrow}
            padding="normal"
            position="end"
            sx={{overflow: 'initial'}}
            width="large"
          >
            <DetailsPaneWithSuspense queryRef={detailsPaneQuery} />
          </PageLayout.Pane>
        </PageLayout>
      </SplitPageLayout.Content>
    </>
  )
}

interface PullRequestDetailsSummaryProps {
  handleOpenSidesheet: () => void
}

interface PullRequestSummaryViewerContentWrapperProps extends PullRequestDetailsSummaryProps {
  queryRef: PreloadedQuery<PullRequestSummaryViewerContentQuery>
  secondaryContentQueryRef: PreloadedQuery<PullRequestSummaryViewerSecondaryContentQuery>
}
/**
 * PullRequestSummaryViewerContent loads the preloaded data and passes
 * the data to its children. This makes it easier to keep the components
 * as is (they consume data using the `useFragment` hook.)
 */
const PullRequestSummaryViewerContentWrapper = forwardRef(function PullRequestSummaryViewerContentWrapper(
  {queryRef, handleOpenSidesheet, secondaryContentQueryRef}: PullRequestSummaryViewerContentWrapperProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const data = usePreloadedQuery(PullRequestSummaryViewerContentGraphQLQuery, queryRef)

  assertDataPresent(data.repository?.pullRequest)

  useEmitPageViewEvent(data.repository.pullRequest)

  return (
    <ErrorBoundary>
      <PullRequestSummaryViewerContent
        ref={ref}
        handleOpenSidesheet={handleOpenSidesheet}
        pullRequest={data.repository.pullRequest}
        secondaryContentQueryRef={secondaryContentQueryRef}
      />
    </ErrorBoundary>
  )
})

interface PullRequestSummaryViewerContentProps extends PullRequestDetailsSummaryProps {
  pullRequest: PullRequestSummaryViewerContent_pullRequest$key
  secondaryContentQueryRef: PreloadedQuery<PullRequestSummaryViewerSecondaryContentQuery>
}

/**
 * Handles the bulk of the complexity of the page
 */
const PullRequestSummaryViewerContent = forwardRef(function PullRequestSummaryViewerContent(
  {pullRequest, handleOpenSidesheet, secondaryContentQueryRef}: PullRequestSummaryViewerContentProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  const [pullRequestData] = useRefetchableFragment(
    graphql`
      fragment PullRequestSummaryViewerContent_pullRequest on PullRequest
      @refetchable(queryName: "PullRequestViewerRefreshQuery") {
        ...Description_pullRequest
        databaseId
        id
        viewerPendingReview {
          id
        }
        headRefOid
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
        <Box sx={{pb: '3', display: 'flex', flexDirection: 'column', gap: 3}}>
          <Box data-hpc sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
            <Description ref={ref} handleOpenSidesheet={handleOpenSidesheet} pullRequest={pullRequestData} />
          </Box>
          <ErrorBoundary>
            <Suspense fallback={<SkeletonPullRequestSummarySecondaryContent />}>
              <PullRequestSummarySecondaryContent secondaryContentQueryRef={secondaryContentQueryRef} />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </ConversationMarkdownSubjectProvider>
    </PullRequestContextProvider>
  )
})

function PullRequestSummarySecondaryContent({
  secondaryContentQueryRef,
}: {
  secondaryContentQueryRef: PreloadedQuery<PullRequestSummaryViewerSecondaryContentQuery>
}) {
  const data = usePreloadedQuery(PullRequestSummaryViewerSecondaryContentGraphQLQuery, secondaryContentQueryRef)

  const pullRequestData = data.repository?.pullRequest
  const userData = data.viewer
  if (!pullRequestData) return null

  return (
    <>
      <FilesChangedListing pullRequest={pullRequestData} />
      <div>
        <Heading as="h2" sx={{fontSize: 3, mb: 2}}>
          Activity
        </Heading>
        <CommentEditsContextProvider>
          <ActivityView pullRequest={pullRequestData} viewer={userData} />
        </CommentEditsContextProvider>
      </div>
      <div>
        <Heading as="h2" sx={{fontSize: 3, mb: 2}}>
          Merge status
        </Heading>
        <MergeBoxWithRelaySuspense hideIcon={true} pullRequestId={pullRequestData.id} />
      </div>
    </>
  )
}
