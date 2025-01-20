import {assertDataPresent} from '@github-ui/assert-data-present'
import {CommentEditsContextProvider} from '@github-ui/commenting/CommentEditsContext'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Heading, PageLayout, SplitPageLayout} from '@primer/react'
import {Suspense} from 'react'
import type {PreloadedQuery} from 'react-relay'
import {graphql, usePreloadedQuery} from 'react-relay'

import {PullRequestContextProvider} from '../contexts/PullRequestContext'
import {useEmitPageViewEvent} from '../hooks/use-emit-page-view-event'
import type {PullRequestActivityViewerQueries} from '../types'
import type {PullRequestActivityViewerContentQuery} from './__generated__/PullRequestActivityViewerContentQuery.graphql'
import {ActivityView} from './activity/ActivityView'
import {SkeletonPullRequestActivity} from './skeletons/SkeletonPullRequestActivity'

export const PullRequestActivityViewerContentGraphQLQuery = graphql`
  query PullRequestActivityViewerContentQuery($number: Int!, $owner: String!, $repo: String!, $timelinePageSize: Int) {
    viewer {
      ...ActivityView_viewer
    }
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        id
        repository {
          id
        }
        headRefOid
        isInMergeQueue
        state
        viewerCanComment
        viewerCanApplySuggestion
        ...ActivityView_pullRequest @arguments(timelinePageSize: $timelinePageSize)
        ...useEmitPageViewEvent_pullRequest
      }
    }
  }
`

interface PullRequestActivityViewerProps {
  owner: string
  pullRequestNumber: number
  repo: string
}

/**
 * Renders an activity timeline for the pull request
 */
export function PullRequestActivityViewer({
  queries,
}: PullRequestActivityViewerProps & PullRequestActivityViewerQueries) {
  const {contentQuery} = queries
  return (
    <>
      <SplitPageLayout.Content as="div" padding="normal" width="full">
        <PageLayout containerWidth="xlarge" padding="none">
          <PageLayout.Content as="div" padding="none">
            <Suspense fallback={<SkeletonPullRequestActivity />}>
              <PullRequestActivityViewerContentWrapper queryRef={contentQuery} />
            </Suspense>
          </PageLayout.Content>
        </PageLayout>
      </SplitPageLayout.Content>
    </>
  )
}

interface PullRequestActivityViewerContentWrapperProps {
  queryRef: PreloadedQuery<PullRequestActivityViewerContentQuery>
}

/**
 * PullRequestActivityViewerContent loads the preloaded data and passes
 * the data to its children. This makes it easier to keep the components
 * as is (they consume data using the `useFragment` hook.)
 */
function PullRequestActivityViewerContentWrapper({queryRef}: PullRequestActivityViewerContentWrapperProps) {
  const data = usePreloadedQuery(PullRequestActivityViewerContentGraphQLQuery, queryRef)

  const pullRequest = data.repository?.pullRequest
  assertDataPresent(pullRequest)
  useEmitPageViewEvent(pullRequest)

  return (
    <PullRequestContextProvider
      headRefOid={pullRequest.headRefOid as string}
      isInMergeQueue={pullRequest.isInMergeQueue}
      pullRequestId={pullRequest.id}
      repositoryId={pullRequest.repository.id}
      state={pullRequest.state}
      viewerCanApplySuggestion={pullRequest.viewerCanApplySuggestion}
      viewerCanComment={pullRequest.viewerCanComment}
    >
      <ErrorBoundary>
        <Heading as="h2" sx={{fontSize: 3, mb: 3}}>
          Activity
        </Heading>
        <CommentEditsContextProvider>
          <ActivityView pullRequest={pullRequest} viewer={data.viewer} />
        </CommentEditsContextProvider>
      </ErrorBoundary>
    </PullRequestContextProvider>
  )
}
