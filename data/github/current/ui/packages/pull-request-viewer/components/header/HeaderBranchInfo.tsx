import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {branchPath, repositoryPath, userHovercardPath} from '@github-ui/paths'
import type {RefSelectorProps} from '@github-ui/ref-selector'
import {RefSelector} from '@github-ui/ref-selector'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {Box, BranchName, Link, RelativeTime, Text, Truncate} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {usePullRequestAnalytics} from '../../hooks/use-pull-request-analytics'
import type {HeaderBranchInfo_pullRequest$key} from './__generated__/HeaderBranchInfo_pullRequest.graphql'

export function HeaderBranchInfo({
  isEditing,
  onSelectBaseBranch,
  pullRequest,
  refListCacheKey,
  selectedBaseBranch,
  isSticky,
}: {
  isEditing: boolean
  onSelectBaseBranch: RefSelectorProps['onSelectItem']
  pullRequest: HeaderBranchInfo_pullRequest$key
  refListCacheKey: string
  selectedBaseBranch: string
  isSticky?: boolean
}) {
  const data = useFragment(
    graphql`
      fragment HeaderBranchInfo_pullRequest on PullRequest {
        mergedAt
        baseRefName
        baseRef {
          repository {
            defaultBranch
            name
            owner {
              login
            }
          }
        }
        headRefName
        state
        commits {
          totalCount
        }
        baseRepository {
          name
          owner {
            login
          }
          defaultBranchRef {
            name
          }
        }
        headRepository {
          name
          isFork
          owner {
            login
          }
        }
        author {
          login
        }
        viewerCanChangeBaseBranch
      }
    `,
    pullRequest,
  )
  const totalCommits = data.commits.totalCount
  const isMerged = data.state === 'MERGED' && data.mergedAt
  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()
  const baseRepositoryOwner = data.baseRepository?.owner?.login
  const headRepositoryOwner = data.headRepository?.owner?.login
  const isFork = data.headRepository?.isFork

  const generateBaseURL = (): string => {
    // Potentially throw an error instead. Could be discussed/addressed in:
    // https://github.com/github/pull-requests/issues/4652
    if (!data.baseRepository || !data.baseRepository.name) {
      return ''
    }
    const baseRefName = data.baseRefName
    if (baseRefName === data.baseRepository.defaultBranchRef?.name) {
      return repositoryPath({owner: data.baseRepository.owner.login, repo: data.baseRepository.name})
    } else {
      return branchPath({owner: data.baseRepository.owner.login, repo: data.baseRepository.name, branch: baseRefName})
    }
  }

  const generateRepositoryURL = (): string => {
    if (!data.headRepository || !data.headRepository.name) {
      return ''
    }
    return branchPath({
      owner: data.headRepository.owner.login,
      repo: data.headRepository.name,
      branch: data.headRefName,
    })
  }

  const {screenSize} = useScreenSize()
  const maxBranchNameLength = screenSize < ScreenSize.xlarge ? 150 : 300

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: isSticky ? 'nowrap' : 'wrap', alignItems: 'center'}}>
      <Box
        data-testid="files-page-header-branch-text"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: isSticky ? 'nowrap' : 'wrap',
          alignItems: 'center',
          fontSize: isSticky ? 0 : 1,
        }}
      >
        <Text sx={{fontWeight: 'bold', color: 'fg.muted'}}>
          {data.author?.login && (
            <Link
              data-hovercard-url={userHovercardPath({owner: data.author.login})}
              href={`/${data.author.login}`}
              sx={{
                color: 'fg.muted',
              }}
            >
              {data.author.login}
            </Link>
          )}
        </Text>
        <Text sx={{color: 'fg.muted', pl: 1, pr: 1, whiteSpace: 'nowrap'}}>
          {isMerged ? ' merged ' : ' wants to merge '}
          {totalCommits}
          {totalCommits > 1 ? ' commits into ' : ' commit into '}
        </Text>
        {isEditing && !isSticky && data.viewerCanChangeBaseBranch && data.baseRef ? (
          <RefSelector
            hideShowAll
            cacheKey={refListCacheKey}
            canCreate={false}
            currentCommitish={selectedBaseBranch}
            defaultBranch={data.baseRef.repository.defaultBranch}
            owner={data.baseRef.repository.owner.login}
            repo={data.baseRef.repository.name}
            types={['branch']}
            onSelectItem={onSelectBaseBranch}
          />
        ) : (
          <BranchName
            href={generateBaseURL()}
            sx={{
              fontSize: isSticky ? '11px' : 0, // Setting to magic number as we don't have a small mono font size variable yet
              lineHeight: isSticky ? 'var(--text-display-lineHeight)' : 'initial',
              ':hover': {textDecoration: 'none'},
            }}
          >
            <Truncate sx={{maxWidth: maxBranchNameLength}} title={selectedBaseBranch}>
              {isFork ? `${baseRepositoryOwner}:${selectedBaseBranch}` : selectedBaseBranch}
            </Truncate>
          </BranchName>
        )}
        <Text sx={{color: 'fg.muted', pl: 1, pr: 1}}> from </Text>
        <BranchName
          href={generateRepositoryURL()}
          sx={{
            fontSize: isSticky ? '11px' : 0, // Setting to magic number as we don't have a small mono font size variable yet
            lineHeight: isSticky ? 'var(--text-display-lineHeight)' : 'initial',
            ':hover': {textDecoration: 'none'},
          }}
        >
          <Truncate sx={{maxWidth: maxBranchNameLength}} title={data.headRefName}>
            {isFork ? `${headRepositoryOwner}:${data.headRefName}` : data.headRefName}
          </Truncate>
        </BranchName>
      </Box>
      <CopyToClipboardButton
        ariaLabel="Copy branch name to clipboard"
        className="ml-1"
        size="small"
        textToCopy={isFork ? `${headRepositoryOwner}:${data.headRefName}` : data.headRefName}
        onCopy={() => {
          sendPullRequestAnalyticsEvent('header.copy_head_branch_name', 'COPY_HEAD_BRANCH_NAME_BUTTON')
        }}
      />
      {isMerged && (
        <RelativeTime
          date={new Date(data.mergedAt)}
          sx={{color: 'fg.muted', pl: 1, fontSize: isSticky ? 0 : 1}}
          tense="past"
        />
      )}
    </Box>
  )
}
