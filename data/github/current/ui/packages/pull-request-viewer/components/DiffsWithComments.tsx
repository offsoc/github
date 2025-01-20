import type {DiffAnnotation, NavigationThread} from '@github-ui/conversations'
import {SelectedDiffRowRangeContextProvider} from '@github-ui/diff-lines'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {memo, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import {useFilteredFilesContext} from '../contexts/FilteredFilesContext'
import {
  type GlobalMarkerNavigationState,
  PullRequestMarkersDialogContextProvider,
} from '../contexts/PullRequestMarkersContext'
import {useHasCommitRange, useSelectedRefContext} from '../contexts/SelectedRefContext'
import type {DiffAnnotationsByPathMap} from '../helpers/annotation-helpers'
import type {DiffsWithComments_pullRequest$key} from './__generated__/DiffsWithComments_pullRequest.graphql'
import type {DiffsWithComments_viewer$key} from './__generated__/DiffsWithComments_viewer.graphql'
import {CommitDiffHeading} from './diffs/CommitDiffHeading'
import Diffs from './diffs/Diffs'
import FilesChangedHeading from './diffs/FilesChangedHeading'
import {PullRequestMarkersLoader} from './PullRequestMarkers'

export type MarkersState = {
  navigationThreads: NavigationThread[]
  annotationMap: DiffAnnotationsByPathMap
  diffAnnotations: DiffAnnotation[]
}

interface DiffsWithCommentsProps {
  pullRequest: DiffsWithComments_pullRequest$key
  viewer: DiffsWithComments_viewer$key
}

const DiffsWithComments = memo(function DiffsWithComments({
  pullRequest,
  viewer,
  ...diffsProps
}: DiffsWithCommentsProps) {
  const userData = useFragment(
    graphql`
      fragment DiffsWithComments_viewer on User {
        ...CommitDiffHeading_viewer
        ...Diffs_viewer
        ...FilesChangedHeading_viewer
      }
    `,
    viewer,
  )

  const pullRequestData = useFragment(
    graphql`
      fragment DiffsWithComments_pullRequest on PullRequest {
        id
        ...Diffs_pullRequest
        ...Diffs_pullRequestComparison
        ...FilesChangedHeading_pullRequest
        comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
          newCommit @include(if: $isSingleCommit) {
            ...CommitDiffHeading_commit
          }
        }
        repository {
          name
          owner {
            login
          }
        }
        number
      }
    `,
    pullRequest,
  )

  const {filteredFileAnchors} = useFilteredFilesContext()
  const hasCommitRange = useHasCommitRange()
  const {isSingleCommit} = useSelectedRefContext()
  const [markers, setMarkers] = useState<MarkersState>({
    navigationThreads: [],
    annotationMap: {},
    diffAnnotations: [],
  })

  const [globalMarkerNavigationState, setGlobalMarkerNavigationState] = useState<GlobalMarkerNavigationState>({
    activePathDigest: undefined,
    activeGlobalMarkerID: undefined,
  })

  return (
    <SelectedDiffRowRangeContextProvider>
      {/* If this query fails to load, we can gracefully degrade by not showing the thread navigation */}
      {!hasCommitRange && (
        <ErrorBoundary fallback={<div />}>
          <PullRequestMarkersLoader
            number={pullRequestData.number}
            repoName={pullRequestData.repository.name}
            repoOwner={pullRequestData.repository.owner.login}
            onMarkerDataLoaded={setMarkers}
          />
        </ErrorBoundary>
      )}
      <PullRequestMarkersDialogContextProvider
        annotationMap={markers.annotationMap}
        diffAnnotations={markers.diffAnnotations}
        filteredFiles={filteredFileAnchors}
        setGlobalMarkerNavigationState={setGlobalMarkerNavigationState}
        threads={markers.navigationThreads}
      >
        <FilesChangedHeading pullRequest={pullRequestData} viewer={userData} />
        {isSingleCommit && pullRequestData.comparison?.newCommit && (
          <CommitDiffHeading commit={pullRequestData.comparison.newCommit} sx={{mx: 3, mb: 3}} viewer={userData} />
        )}
        <Diffs
          globalMarkerNavigationState={globalMarkerNavigationState}
          pullRequest={pullRequestData}
          pullRequestComparison={pullRequestData}
          pullRequestId={pullRequestData.id}
          viewer={userData}
          {...diffsProps}
        />
      </PullRequestMarkersDialogContextProvider>
    </SelectedDiffRowRangeContextProvider>
  )
})

export default DiffsWithComments
