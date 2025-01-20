import {useCurrentRepository} from '@github-ui/current-repository'
import {ownerPath, pullRequestPath, repositoryPath} from '@github-ui/paths'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useSearchParams} from '@github-ui/use-navigate'
import {
  CodeReviewIcon,
  CopilotIcon,
  GearIcon,
  GitCompareIcon,
  GitPullRequestIcon,
  MarkGithubIcon,
  TriangleDownIcon,
} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, IconButton, Link, LinkButton, Octicon} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {clsx} from 'clsx'
import type React from 'react'
import {memo, useCallback, useState} from 'react'

import {useFilesContext} from '../contexts/FilesContext'
import {useFocusedTask} from '../hooks/use-focused-task'
import type {CopilotTaskBasePayload} from '../utilities/copilot-task-types'
import styles from './Header.module.css'
import {MessageDialog} from './MessageDialog'

function CommitChangesButton({
  onCommitClick,
  commitButtonRef,
}: {
  onCommitClick?: () => void
  commitButtonRef: React.RefObject<HTMLButtonElement>
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const {getFileStatuses} = useFilesContext()
  const changedFileCount = Object.values(getFileStatuses()).length
  const hasChanges = changedFileCount > 0
  const tooltipText = hasChanges ? 'Commit changes' : 'No changes to commit.'

  return (
    <>
      <Tooltip text={tooltipText} type="label" ref={commitButtonRef}>
        <Button
          variant="primary"
          aria-disabled={!hasChanges}
          inactive={!hasChanges}
          onClick={hasChanges ? onCommitClick : () => setIsDialogOpen(true)}
          count={hasChanges ? changedFileCount : undefined}
        >
          Commit changes...
        </Button>
      </Tooltip>
      {isDialogOpen && (
        <MessageDialog
          title="No changes detected"
          message="You do not have any local changes. Make edits before trying to commit."
          onClose={() => setIsDialogOpen(false)}
          returnFocusRef={commitButtonRef}
        />
      )}
    </>
  )
}

const BreadcrumbLink = memo(function BreadcrumbLink({name, href}: {name: string; href: string}) {
  return (
    <>
      <LinkButton href={href} variant="invisible" className={clsx('color-fg-default', styles.breadcrumbLinkButton)}>
        {name}
      </LinkButton>
      {'/'}
    </>
  )
})

const CompareDropdown = memo(function CompareDropdown() {
  const {pullRequest, compareRef, repo} = useRoutePayload<CopilotTaskBasePayload>()
  const [searchParams, setSearchParams] = useSearchParams()

  const onCompareRefSelected = useCallback(
    (ref: string) => {
      searchParams.set('compare_ref', ref)
      setSearchParams(searchParams)
    },
    [searchParams, setSearchParams],
  )
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <Button leadingVisual={GitCompareIcon} trailingVisual={TriangleDownIcon} aria-label="Compare picker">
          {compareRef && compareRef !== pullRequest.headBranch ? (
            <>
              <span className="color-fg-muted">Compare:</span> {compareRef}
            </>
          ) : (
            'Compare'
          )}
        </Button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="medium">
        <ActionList>
          <div className="px-3 py-1 d-flex flex-column">
            <span className="text-bold">Compare changes</span>
            <span className="color-fg-muted">Select a base ref to compare changes against</span>
          </div>
          <ActionList.Divider />
          <ActionList.Group selectionVariant="single">
            <ActionList.GroupHeading>Compare changes</ActionList.GroupHeading>
            <ActionList.Item
              selected={!compareRef || compareRef === pullRequest.headBranch}
              onSelect={() => onCompareRefSelected(pullRequest.headBranch)}
            >
              {`Pull request #${pullRequest.number} branch`}
              <ActionList.Description variant="block">{pullRequest.headBranch}</ActionList.Description>
            </ActionList.Item>
            <ActionList.Item
              selected={compareRef === repo.defaultBranch}
              onSelect={() => onCompareRefSelected(repo.defaultBranch)}
            >
              Default branch
              <ActionList.Description variant="block">{repo.defaultBranch}</ActionList.Description>
            </ActionList.Item>
            {pullRequest.baseBranch !== repo.defaultBranch && (
              <ActionList.Item
                selected={compareRef === pullRequest.baseBranch}
                onSelect={() => onCompareRefSelected(pullRequest.baseBranch)}
              >
                Pull request base branch
                <ActionList.Description variant="block">{pullRequest.baseBranch}</ActionList.Description>
              </ActionList.Item>
            )}
          </ActionList.Group>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
})

const SettingsDropdown = memo(function SettingsDropdown() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchParamDiffView = searchParams.get('view')
  const {initialDiffState} = useFocusedTask()

  const setDiffViewEnabled = (userPreference: string) => {
    if (searchParamDiffView === userPreference) {
      // toggle off
      searchParams.delete('view')
    } else {
      searchParams.set('view', userPreference)
    }

    setSearchParams(searchParams)
  }

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButton icon={GearIcon} aria-label="More editor actions" />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList>
          <ActionList.Group selectionVariant="single">
            <ActionList.GroupHeading>Show active changes</ActionList.GroupHeading>
            <ActionList.Item
              selected={searchParamDiffView === 'diff-inline' || initialDiffState}
              onSelect={() => setDiffViewEnabled('diff-inline')}
            >
              Inline view
            </ActionList.Item>
            <ActionList.Item
              selected={searchParamDiffView === 'diff-split'}
              onSelect={() => setDiffViewEnabled('diff-split')}
            >
              Split view
            </ActionList.Item>
          </ActionList.Group>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
})

export interface HeaderProps {
  subjectNumber: string
  subjectTitle: string
  onCommitClick?: () => void
  onCopilotClick: () => void
  onSuggestionsClick?: () => void
  copilotHeaderButtonRef: React.RefObject<HTMLButtonElement>
  suggestionsHeaderButtonRef?: React.RefObject<HTMLButtonElement>
  commitButtonRef: React.RefObject<HTMLButtonElement>
  onOverviewClick: () => void
  overviewHeaderButtonRef?: React.RefObject<HTMLButtonElement>
}

export const Header = memo(function Header({
  subjectNumber,
  subjectTitle,
  onCommitClick,
  onCopilotClick,
  onSuggestionsClick,
  copilotHeaderButtonRef,
  suggestionsHeaderButtonRef,
  commitButtonRef,
  onOverviewClick,
  overviewHeaderButtonRef,
}: HeaderProps) {
  const repo = useCurrentRepository()
  const pullHref = pullRequestPath({repo, number: Number(subjectNumber)})
  const repoHref = repositoryPath({owner: repo.ownerLogin, repo: repo.name})
  const ownerHref = ownerPath({owner: repo.ownerLogin})

  const hadronSuggestionsUI = useFeatureFlag('copilot_hadron_suggestions_ui')

  return (
    <div className="d-flex flex-row flex-items-center flex-justify-between gap-2 py-2">
      <div className="d-flex flex-row flex-items-center flex-grow-1">
        <Link aria-label="Homepage" className="d-flex color-fg-default f2 ml-2" href="/">
          <Octicon icon={MarkGithubIcon} size={24} />
        </Link>
        <BreadcrumbLink name={repo.ownerLogin} href={ownerHref} />
        <BreadcrumbLink name={repo.name} href={repoHref} />
        <LinkButton
          href={pullHref}
          className={clsx('color-fg-default', styles.breadcrumbLocationButton)}
          variant="invisible"
        >
          <span className="d-flex">
            <span className={styles.titleWrapper}>
              <span className={styles.title}>{subjectTitle}</span>
            </span>
            <span className="ml-1 color-fg-muted">#{subjectNumber}</span>
          </span>
        </LinkButton>
      </div>
      <div className={clsx('d-flex flex-row flex-items-center flex-justify-end gap-2', styles.endContent)}>
        <SettingsDropdown />
        <IconButton
          aria-label="Toggle Copilot panel"
          icon={CopilotIcon}
          onClick={onCopilotClick}
          ref={copilotHeaderButtonRef}
        />
        {hadronSuggestionsUI && (
          <IconButton
            aria-label="Toggle suggestions panel"
            icon={CodeReviewIcon}
            onClick={onSuggestionsClick}
            ref={suggestionsHeaderButtonRef}
          />
        )}
        <IconButton
          aria-label="Toggle Overview panel"
          icon={GitPullRequestIcon}
          onClick={onOverviewClick}
          ref={overviewHeaderButtonRef}
        />
        <CompareDropdown />
        <CommitChangesButton onCommitClick={onCommitClick} commitButtonRef={commitButtonRef} />
      </div>
    </div>
  )
})
