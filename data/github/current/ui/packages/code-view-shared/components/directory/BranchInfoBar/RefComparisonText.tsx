import type {RefComparison} from '@github-ui/code-view-types'
import type {Repository} from '@github-ui/current-repository'
import {comparePath} from '@github-ui/paths'
import {BranchName, Link, type LinkProps} from '@primer/react'

import {getCommitsCountText} from './get-commits-count-text'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'

interface Props {
  repo: Repository
  comparison: RefComparison
  linkify?: boolean
}

export function RefComparisonText({comparison, repo, linkify = false}: Props) {
  const {sendRepoClickEvent} = useReposAnalytics()
  const {ahead, behind, baseBranch, baseBranchRange, currentRef} = comparison

  const aheadLink = comparePath({repo, base: baseBranchRange, head: currentRef})
  const behindLink = comparePath({repo, base: currentRef, head: baseBranchRange})

  const sendAheadLinkAnalytics = () =>
    sendRepoClickEvent('AHEAD_BEHIND_LINK', {
      category: 'Branch Infobar',
      action: 'Ahead Compare',
      label: `ref_loc:bar;is_fork:${repo.isFork}`,
    })

  const sendBehindLinkAnalytics = () =>
    sendRepoClickEvent('AHEAD_BEHIND_LINK', {
      category: 'Branch Infobar',
      action: 'Behind Compare',
      label: `ref_loc:bar;is_fork:${repo.isFork}`,
    })

  if (ahead === 0 && behind === 0) {
    return (
      <span>
        This branch is up to date with <BranchName as="span">{baseBranch}</BranchName>.
      </span>
    )
  }

  if (ahead > 0 && behind > 0) {
    return (
      <span>
        This branch is{' '}
        <LinkOrText linkify={linkify} href={aheadLink} onClick={sendAheadLinkAnalytics}>
          {getCommitsCountText(ahead)} ahead of
        </LinkOrText>
        ,{' '}
        <LinkOrText linkify={linkify} href={behindLink} onClick={sendBehindLinkAnalytics}>
          {getCommitsCountText(behind)} behind
        </LinkOrText>{' '}
        <BranchName as="span">{baseBranch}</BranchName>.
      </span>
    )
  }

  if (ahead > 0) {
    return (
      <span>
        This branch is{' '}
        <LinkOrText linkify={linkify} href={aheadLink} onClick={sendAheadLinkAnalytics}>
          {getCommitsCountText(ahead)} ahead of
        </LinkOrText>{' '}
        <BranchName as="span">{baseBranch}</BranchName>.
      </span>
    )
  } else {
    return (
      <span>
        This branch is{' '}
        <LinkOrText linkify={linkify} href={behindLink} onClick={sendBehindLinkAnalytics}>
          {getCommitsCountText(behind)} behind
        </LinkOrText>{' '}
        <BranchName as="span">{baseBranch}</BranchName>.
      </span>
    )
  }
}

function LinkOrText({sx, href, linkify, children, ...props}: LinkProps & {linkify: boolean}) {
  if (linkify) {
    return (
      <Link sx={sx} href={href} {...props}>
        {children}
      </Link>
    )
  }

  return <span>{children}</span>
}
