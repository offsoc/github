import {assertDataPresent} from '@github-ui/assert-data-present'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Heading, PageLayout, SplitPageLayout} from '@primer/react'
import {Suspense} from 'react'
import {graphql, usePreloadedQuery} from 'react-relay'

import {PullRequestContextProvider} from '../contexts/PullRequestContext'
import {useEmitPageViewEvent} from '../hooks/use-emit-page-view-event'
import type {PullRequestCommitsViewerQueries} from '../types'
import {CommitsView} from './commits/CommitsView'

export const PullRequestCommitsViewerContentGraphQLQuery = graphql`
  query PullRequestCommitsViewerContentQuery($number: Int!, $owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      ...CommitsView_repository
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
        ...useEmitPageViewEvent_pullRequest
      }
    }
  }
`

interface PullRequestCommitsViewerProps {
  owner: string
  pullRequestNumber: number
  repo: string
}

/**
 * Renders an Commits timeline for the pull request
 */
export function PullRequestCommitsViewer({queries}: PullRequestCommitsViewerProps & PullRequestCommitsViewerQueries) {
  return (
    <>
      <SplitPageLayout.Content padding="normal" width="full">
        <PageLayout containerWidth="xlarge" padding="none">
          <PageLayout.Content padding="none">
            <Suspense>
              <ErrorBoundary>
                <PullRequestCommitsViewerContentWrapper queries={queries} />
              </ErrorBoundary>
            </Suspense>
          </PageLayout.Content>
        </PageLayout>
      </SplitPageLayout.Content>
    </>
  )
}

type PullRequestCommitsViewerContentWrapperProps = PullRequestCommitsViewerQueries

/**
 * PullRequestCommitsViewerContent loads the preloaded data and passes
 * the data to its children. This makes it easier to keep the components
 * as is (they consume data using the `useFragment` hook.)
 */
function PullRequestCommitsViewerContentWrapper({queries}: PullRequestCommitsViewerContentWrapperProps) {
  const {contentQuery, deferredCommitsDataQuery} = queries
  const data = usePreloadedQuery(PullRequestCommitsViewerContentGraphQLQuery, contentQuery)

  const repository = data.repository
  const pullRequest = repository?.pullRequest
  assertDataPresent(pullRequest)
  assertDataPresent(repository)
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
      <Heading as="h2" sx={{fontSize: 3, mb: 3}}>
        Commits
      </Heading>
      <CommitsView deferredCommitsDataQuery={deferredCommitsDataQuery} repository={repository} />
    </PullRequestContextProvider>
  )
}
