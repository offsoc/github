import {type Repository, useCurrentRepository} from '@github-ui/current-repository'
import {branchPath, issueLinkedPullRequestHovercardPath, pullRequestPath} from '@github-ui/paths'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {GitBranchIcon} from '@primer/octicons-react'
import {BranchName, Link, Octicon} from '@primer/react'
import React from 'react'

import type {BranchCommitState, BranchInfo, LinkedPullRequest} from '../../hooks/use-load-branch-commits'

export interface CommitBranchInfoProps {
  data: BranchCommitState
}

export function CommitBranchInfo({data}: CommitBranchInfoProps) {
  const repo = useCurrentRepository()

  if (!data.loading && data.branches.length === 0) {
    return null
  }

  return (
    <div className="d-flex flex-items-center flex-wrap fgColor-muted border-bottom p-3 gap-1">
      <Octicon className="mr-1" icon={GitBranchIcon} />
      {data.loading ? (
        <LoadingSkeleton width="60px" variant="rounded" height="22px" />
      ) : (
        data.branches.map((branch, branchIndex) => {
          return (
            <div key={branch.branch}>
              <BranchFragment branch={branch} repo={repo} />

              {branchIndex !== data.branches.length - 1 ? <span className="ml-1 user-select-none">+</span> : null}
            </div>
          )
        })
      )}
    </div>
  )
}

function BranchFragment({branch, repo}: {branch: BranchInfo; repo: Repository}) {
  return (
    <>
      <BranchName className="mx-1" href={branchPath({owner: repo.ownerLogin, repo: repo.name, branch: branch.branch})}>
        {branch.branch}
      </BranchName>
      {branch.prs.length > 0 ? (
        <>
          {'('}
          {branch.prs.map((pr, index) => (
            <React.Fragment key={`pr-${pr.repo.ownerLogin}-${pr.repo.name}-${pr.number}`}>
              <PullRequestLink pullRequest={pr} />
              {index !== branch.prs.length - 1 ? <>,&nbsp;</> : null}
            </React.Fragment>
          ))}
          {')'}
        </>
      ) : null}
    </>
  )
}

function PullRequestLink({pullRequest}: {pullRequest: LinkedPullRequest}) {
  const {repo, number, showPrefix} = pullRequest
  const prefix = showPrefix ? `${repo.ownerLogin}/${repo.name}` : ''

  return (
    <Link
      href={pullRequestPath({repo, number})}
      className="fgColor-muted"
      data-hovercard-url={issueLinkedPullRequestHovercardPath({
        owner: repo.ownerLogin,
        repo: repo.name,
        pullRequestNumber: number,
      })}
    >
      {prefix}#{number}
    </Link>
  )
}
