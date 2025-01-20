import {GitPullRequestClosedIcon, GitPullRequestIcon} from '@primer/octicons-react'
import {Button, Text} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {PullRequestCommentActionButtons_pullRequest$key} from './__generated__/PullRequestCommentActionButtons_pullRequest.graphql'

export type CloseButtonState = 'CLOSED' | 'OPEN'

interface PullRequestCommentActionButtonsProps {
  pullRequest: PullRequestCommentActionButtons_pullRequest$key
  onAction: () => void
  onClose: () => void
  onReopen: () => void
  hasComment: boolean
}

export function PullRequestCommentActionButtons({
  pullRequest,
  onAction,
  hasComment,
  onClose,
  onReopen,
}: PullRequestCommentActionButtonsProps) {
  const pullRequestData = useFragment(
    graphql`
      fragment PullRequestCommentActionButtons_pullRequest on PullRequest {
        viewerCanClose
        viewerCanReopen
        state
        # eslint-disable-next-line relay/unused-fields
        id
      }
    `,
    pullRequest,
  )

  if (pullRequestData.viewerCanReopen && pullRequestData.state === 'CLOSED') {
    return (
      <Button
        onClick={() => {
          onAction?.()
          onReopen()
        }}
        leadingVisual={GitPullRequestIcon}
        sx={{color: 'open.fg'}}
        disabled={!onReopen}
        size="medium"
      >
        <Text sx={{color: 'fg.default'}}>Reopen pull request</Text>
      </Button>
    )
  }

  if (pullRequestData.viewerCanClose && pullRequestData.state === 'OPEN') {
    return (
      <Button
        onClick={() => {
          onAction?.()
          onClose()
        }}
        leadingVisual={GitPullRequestClosedIcon}
        sx={{color: 'danger.fg'}}
        disabled={!onClose}
        size="medium"
      >
        <Text sx={{color: 'fg.default'}}>{hasComment ? 'Close with comment' : 'Close pull request'}</Text>
      </Button>
    )
  }

  return null
}
