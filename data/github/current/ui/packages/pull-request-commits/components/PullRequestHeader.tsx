import {useState} from 'react'

import {Button, PageHeader} from '@primer/react'
import {DiffStats} from '@github-ui/diffs/DiffParts'
import {PullRequestBanners} from './PullRequestBanners'
import {PullRequestHeaderSummary} from './PullRequestHeaderSummary'
import {PullRequestEditTitleForm} from './PullRequestEditTitleForm'
import {PullRequestStateLabel} from './PullRequestStateLabel'
import type {HeaderPageData} from '../page-data/payloads/header'
import {PullRequestHeaderNavigation} from './PullRequestHeaderNavigation'
import {SafeHTMLText} from '@github-ui/safe-html'
import {PullRequestCodeButton} from './PullRequestCodeButton'

export type PullRequestHeaderProps = HeaderPageData

export function PullRequestHeader({bannersData, pullRequest, repository, urls, user}: PullRequestHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)

  const titleActions = (
    <>
      {user.canEditTitle && (
        <Button onClick={() => setIsEditing(true)} size="small">
          Edit
        </Button>
      )}
      <PullRequestCodeButton
        codespacesEnabled={repository.codespacesEnabled}
        copilotEnabled={repository.copilotEnabled}
        editorEnabled={repository.editorEnabled}
        headBranch={pullRequest.headBranch}
        isEnterprise={repository.isEnterprise}
        pullRequestNumber={pullRequest.number}
        repository={repository}
      />
    </>
  )

  return (
    <>
      {isEditing && (
        <PullRequestEditTitleForm
          initialTitle={pullRequest.title}
          pullRequestNumber={pullRequest.number}
          onCloseForm={() => setIsEditing(false)}
        />
      )}
      {/* This is a hack to make the title actions appear above the title on mobile */}
      {!isEditing && (
        <div className="d-block d-sm-none pb-2 mb-3 flex-md-order-1 flex-shrink-0 d-flex flex-items-center gap-1">
          {titleActions}
        </div>
      )}
      <PageHeader className="flex-items-center">
        {!isEditing && (
          <>
            <PageHeader.TitleArea>
              <PageHeader.Title as="h1" className="lh-condensed">
                <SafeHTMLText className="f1 text-normal markdown-title" html={pullRequest.titleHtml} />
                <span className="pl-2 fgColor-muted f1-light d-inline">#{pullRequest.number}</span>
              </PageHeader.Title>
            </PageHeader.TitleArea>
            <PageHeader.Actions className="d-none d-sm-flex flex-items-center gap-1">{titleActions}</PageHeader.Actions>
          </>
        )}
        <PageHeader.Description className="d-flex flex-column flex-items-start">
          <div className="d-flex flex-column flex-sm-row gap-2">
            <PullRequestStateLabel state={pullRequest.state} />
            <PullRequestHeaderSummary
              author={pullRequest.author}
              baseBranch={pullRequest.baseBranch}
              baseRepositoryDefaultBranch={repository.defaultBranch}
              baseRepositoryName={repository.name}
              baseRepositoryOwnerLogin={repository.ownerLogin}
              canChangeBase={user.canChangeBase}
              commitsCount={pullRequest.commitsCount}
              headBranch={pullRequest.headBranch}
              headRepositoryOwnerLogin={pullRequest.headRepositoryOwnerLogin}
              headRepositoryName={pullRequest.headRepositoryName}
              isInAdvisoryRepo={pullRequest.isInAdvisoryRepo}
              isEditing={isEditing}
              mergedBy={pullRequest.mergedBy}
              setIsEditing={setIsEditing}
              state={pullRequest.state}
            />
          </div>
          <PullRequestBanners bannersData={bannersData} pullRequest={pullRequest} repository={repository} />
        </PageHeader.Description>
        <PageHeader.Navigation as="nav" aria-label="Pull request navigation tabs">
          <div className="float-right d-none d-md-block ml-2 pt-4">
            <DiffStats
              linesAdded={pullRequest.linesAdded}
              linesDeleted={pullRequest.linesDeleted}
              linesChanged={pullRequest.linesChanged}
              tooltipDirection="nw"
            />
          </div>
          <PullRequestHeaderNavigation commitsCount={pullRequest.commitsCount} urls={urls} />
        </PageHeader.Navigation>
      </PageHeader>
    </>
  )
}
