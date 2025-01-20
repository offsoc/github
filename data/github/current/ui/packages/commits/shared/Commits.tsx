import type {RepositoryNWO} from '@github-ui/current-repository'
import {Timeline} from '@primer/react'

import {CommitGroup} from '../components/Commits/CommitGroup'
import {CommitsLoggingInfoProvider} from '../contexts/CommitsLoggingContext'
import {baseEmptyStateNotLoading, DeferredCommitDataProvider} from '../contexts/DeferredCommitDataContext'
import type {CommitGroup as CommitGroupType, DeferredData, LoggingInformation} from '../types/commits-types'

export type CommitsProps = {
  leadingContent?: React.ReactNode
  commitGroups: CommitGroupType[]
  trailingContent?: React.ReactNode
  repository: RepositoryNWO
  deferredCommitData?: DeferredData
  currentBlobPath?: string
  shouldClipTimeline?: boolean
  softNavToCommit?: boolean
  loggingPayload?: {[key: string]: unknown}
  loggingPrefix?: string
}

export function Commits({
  leadingContent,
  commitGroups,
  trailingContent,
  deferredCommitData = baseEmptyStateNotLoading,
  repository,
  currentBlobPath,
  loggingPayload,
  loggingPrefix,
  shouldClipTimeline = true,
  softNavToCommit = false,
}: CommitsProps) {
  const loggingInfo: LoggingInformation = {loggingPayload, loggingPrefix}

  return (
    <DeferredCommitDataProvider deferredData={deferredCommitData}>
      <CommitsLoggingInfoProvider loggingInfo={loggingInfo}>
        <Timeline clipSidebar>
          {leadingContent}
          {commitGroups.map((commitGroup, index) => {
            return (
              <CommitGroup
                key={commitGroup.title}
                title={commitGroup.title}
                commits={commitGroup.commits}
                shouldClipTimeline={shouldClipTimeline && index === 0}
                currentBlobPath={currentBlobPath}
                repo={repository}
                softNavToCommit={softNavToCommit}
              />
            )
          })}
          {trailingContent}
        </Timeline>
      </CommitsLoggingInfoProvider>
    </DeferredCommitDataProvider>
  )
}
