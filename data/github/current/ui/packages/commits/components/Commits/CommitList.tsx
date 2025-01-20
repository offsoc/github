import {useCurrentRepository} from '@github-ui/current-repository'
import {Heading} from '@primer/react'

import {useFilters} from '../../contexts/FilterContext'
import {Commits} from '../../shared/Commits'
import {useLoadDeferredCommitData} from '../../shared/use-load-deferred-commit-data'
import type {CommitGroup as CommitGroupType} from '../../types/commits-types'
import {EndOfFile, RenamedToHistory, useShouldClipTimeline} from './FileHistory'

export function CommitList({
  commitGroups,
  deferredDataUrl,
  softNavToCommit,
}: {
  commitGroups: CommitGroupType[]
  deferredDataUrl: string
  softNavToCommit: boolean
}) {
  const filters = useFilters()
  const repo = useCurrentRepository()
  const deferredCommitData = useLoadDeferredCommitData(deferredDataUrl)

  return (
    <div className="mb-3" data-hpc>
      <Heading as="h2" className="sr-only">
        Commit History
      </Heading>

      <Commits
        leadingContent={<RenamedToHistory />}
        commitGroups={commitGroups}
        trailingContent={<EndOfFile />}
        repository={repo}
        deferredCommitData={deferredCommitData}
        shouldClipTimeline={useShouldClipTimeline()}
        currentBlobPath={filters.currentBlobPath}
        softNavToCommit={softNavToCommit}
      />
    </div>
  )
}
