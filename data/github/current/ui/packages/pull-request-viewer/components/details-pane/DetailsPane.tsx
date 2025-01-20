import {EditIssueProjectsSection} from '@github-ui/issue-metadata/ProjectsSection'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {AlertFillIcon} from '@primer/octicons-react'
import {Box, Heading, Octicon, sx, Text} from '@primer/react'
import {memo, Suspense} from 'react'
import type {PreloadedQuery} from 'react-relay'
import {graphql, useFragment, usePreloadedQuery} from 'react-relay'

import Reviewers from '../reviewers/Reviewers'
import SkeletonMetadataPanel from '../skeletons/SkeletonMetadataPanel'
import type {DetailsPane_pullRequest$key} from './__generated__/DetailsPane_pullRequest.graphql'
import type {DetailsPaneQuery} from './__generated__/DetailsPaneQuery.graphql'
import {ActionSection} from './ActionSection'
import AssigneesSection from './AssigneesSection'
import {LabelSection} from './LabelSection'

interface DetailsPaneProps {
  queryRef: PreloadedQuery<DetailsPaneQuery>
  showTitle?: boolean
}

export const DetailsPaneWithSuspense = ({queryRef, showTitle}: DetailsPaneProps) => (
  <ErrorBoundary
    fallback={
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, ...sx}}>
        <Octicon icon={AlertFillIcon} sx={{color: 'attention.fg'}} />
        <Text sx={{fontSize: 0, color: 'fg.muted'}}>Failed to load pull request metadata</Text>
      </Box>
    }
  >
    <Suspense fallback={<SkeletonMetadataPanel />}>
      <DetailsPane queryRef={queryRef} showTitle={showTitle} />
    </Suspense>
  </ErrorBoundary>
)

const DetailsPane = memo(function DetailsPane({
  queryRef,
  showTitle = true,
}: {
  queryRef: PreloadedQuery<DetailsPaneQuery>
  showTitle?: boolean
}) {
  const queryData = usePreloadedQuery<DetailsPaneQuery>(
    graphql`
      query DetailsPaneQuery($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          name
          owner {
            login
          }
          pullRequest(number: $number) {
            number
            ...DetailsPane_pullRequest
          }
        }
      }
    `,
    queryRef,
  )

  const pullRequest = queryData.repository?.pullRequest
  if (!pullRequest) return null

  return (
    <InnerDetailsPane
      number={pullRequest.number}
      pullRequest={pullRequest}
      repoName={queryData.repository.name}
      repoOwner={queryData.repository.owner.login}
      showTitle={showTitle}
    />
  )
})

type InnerDetailsPaneProps = {
  pullRequest: DetailsPane_pullRequest$key
  repoName: string
  repoOwner: string
  number: number
  showTitle?: boolean
}

export function InnerDetailsPane({pullRequest, repoName, repoOwner, showTitle}: InnerDetailsPaneProps) {
  const pullRequestData = useFragment(
    graphql`
      fragment DetailsPane_pullRequest on PullRequest {
        ...Reviewers_pullRequest
        ...AssigneesSection_pullrequest
        ...LabelSection_pullRequest
        # fragment used by ProjectSectionInternal
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...ProjectsSectionFragment
        ...ActionSection_pullRequest
      }
    `,
    pullRequest,
  )

  return (
    <div>
      {showTitle && (
        <Heading as="h2" className="sr-only">
          Details
        </Heading>
      )}
      <Reviewers pullRequest={pullRequestData} />
      <AssigneesSection pullRequest={pullRequestData} />
      <LabelSection pullRequest={pullRequestData} repoName={repoName} repoOwner={repoOwner} />
      <EditIssueProjectsSection issueOrPullRequest={pullRequestData} singleKeyShortcutsEnabled={false} />
      <ActionSection pullRequest={pullRequestData} />
    </div>
  )
}
