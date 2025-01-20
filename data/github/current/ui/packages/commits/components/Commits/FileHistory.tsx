import {useCurrentRepository} from '@github-ui/current-repository'
import {commitsPath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {Spinner} from '@primer/react'

import {useIsDeferredDataLoading, useRenameHistoryData} from '../../contexts/DeferredCommitDataContext'
import {useFilters} from '../../contexts/FilterContext'
import {TimelineRow} from './TimelineRow'

export function useShouldClipTimeline() {
  const hasRenamedToHistory = useHasRenamedToHistory()
  const filters = useFilters()

  return !hasRenamedToHistory && !filters.pagination.hasPreviousPage
}

function useHasRenamedToHistory() {
  const filters = useFilters()

  return filters.newPath && filters.originalBranch
}

export function RenamedToHistory() {
  const repo = useCurrentRepository()
  const filters = useFilters()

  if (!useHasRenamedToHistory()) {
    return null
  }

  return (
    <TimelineRow sx={{pt: 1, pb: 0}}>
      <div className="d-flex flex-items-baseline">
        <TimelineRow.Heading as="h3" title={`Renamed to ${filters.newPath}`} data-testid="commit-note-title" />
        <Link
          to={commitsPath({
            owner: repo.ownerLogin,
            repo: repo.name,
            ref: filters.originalBranch!,
            path: filters.newPath!,
          })}
        >
          (Browse History)
        </Link>
      </div>
    </TimelineRow>
  )
}

function RenamedFromHistory() {
  const renameHistory = useRenameHistoryData()

  if (!renameHistory?.hasRenameCommits) {
    return null
  }

  return (
    <TimelineRow>
      <div className="d-flex flex-items-baseline">
        <TimelineRow.Heading as="h3" title={`Renamed from ${renameHistory?.oldName}`} data-testid="commit-note-title" />
        <Link to={renameHistory?.historyUrl}>(Browse History)</Link>
      </div>
    </TimelineRow>
  )
}

function EndOfFileHistory() {
  const renameHistory = useRenameHistoryData()

  if (renameHistory?.hasRenameCommits) {
    return null
  }

  return (
    <TimelineRow clipTimeline="bottom">
      <TimelineRow.Heading as="h3" title="End of commit history for this file" data-testid="commit-note-title" />
    </TimelineRow>
  )
}

export function EndOfFile() {
  const filters = useFilters()
  const isLoading = useIsDeferredDataLoading()

  if (!filters.currentBlobPath) {
    return null
  }

  if (filters.currentBlobPath && filters.pagination.hasNextPage) {
    return null
  }

  return (
    <>
      {isLoading && <TimelineRow leadingVisual={<Spinner size="small" />} />}
      {!isLoading && (
        <>
          <RenamedFromHistory />
          <EndOfFileHistory />
        </>
      )}
    </>
  )
}
