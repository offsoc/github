import {copyText} from '@github-ui/copy-to-clipboard'
import type {RepositoryNWO} from '@github-ui/current-repository'
import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {blobPath, repositoryTreePath} from '@github-ui/paths'
import {useAnalytics} from '@github-ui/use-analytics'
import {ChecklistIcon, CodeIcon, CopyIcon, FileCodeIcon, GitCommitIcon} from '@primer/octicons-react'
import {ActionList} from '@primer/react'

import {useIsLoggingInformationProvided, useLoggingInfo} from '../../contexts/CommitsLoggingContext'
import type {DeferredCommitData} from '../../types/commits-types'
import type {Commit} from '../../types/shared'
import {shortSha} from '../../utils/short-sha'

export interface CommitActionBarProps {
  commit: Commit
  repo: RepositoryNWO
  path: string
  deferredData: DeferredCommitData | undefined
  fetchCheckDetails: () => void
  setDialogOpen: (arg: boolean) => void
}

export function CommitActionBar({
  path,
  commit,
  repo,
  deferredData,
  setDialogOpen,
  fetchCheckDetails,
}: CommitActionBarProps) {
  const checkStatus = deferredData?.statusCheckStatus

  const {sendAnalyticsEvent} = useAnalytics()
  const {loggingPrefix, loggingPayload} = useLoggingInfo()
  const shouldLog = useIsLoggingInformationProvided()
  const loggingFunction = () => {
    if (shouldLog) {
      sendAnalyticsEvent(`${loggingPrefix}click`, 'COMMITS_CHECKS_CLICKED', loggingPayload)
    }
  }

  return (
    <ListItemActionBar
      label="actions"
      sx={{display: ['flex', 'none']}}
      staticMenuActions={[
        {
          key: 'view-commit-details',
          render: () => (
            <ActionList.LinkItem href={commit.url}>
              <ActionList.LeadingVisual>
                <GitCommitIcon />
              </ActionList.LeadingVisual>
              View commit details
            </ActionList.LinkItem>
          ),
        },
        {
          key: 'copy-full-sha',
          render: () => (
            <ActionList.Item
              onSelect={() => {
                copyText(commit.oid)
              }}
            >
              <ActionList.LeadingVisual>
                <CopyIcon />
              </ActionList.LeadingVisual>
              Copy full SHA for <span className="text-mono">{shortSha(commit.oid)}</span>
            </ActionList.Item>
          ),
        },
        {
          key: 'view-code',
          render: () => {
            if (!path) return null

            return (
              <ActionList.LinkItem
                href={blobPath({owner: repo.ownerLogin, repo: repo.name, commitish: commit.oid, filePath: path})}
              >
                <ActionList.LeadingVisual>
                  <FileCodeIcon />
                </ActionList.LeadingVisual>
                View code at this point
              </ActionList.LinkItem>
            )
          },
        },
        {
          key: 'browse-repository',
          render: () => (
            <ActionList.LinkItem href={repositoryTreePath({repo, action: 'tree', commitish: commit.oid})}>
              <ActionList.LeadingVisual>
                <CodeIcon />
              </ActionList.LeadingVisual>
              Browse repository at this point
            </ActionList.LinkItem>
          ),
        },
        {
          key: 'view-checks',
          render: () => {
            if (!checkStatus) return null

            return (
              <ActionList.Item
                onSelect={() => {
                  loggingFunction()
                  setDialogOpen(true)
                  fetchCheckDetails()
                }}
                onMouseEnter={() => {
                  fetchCheckDetails()
                }}
              >
                <ActionList.LeadingVisual>
                  <ChecklistIcon />
                </ActionList.LeadingVisual>
                View checks
              </ActionList.Item>
            )
          },
        },
      ]}
    />
  )
}
