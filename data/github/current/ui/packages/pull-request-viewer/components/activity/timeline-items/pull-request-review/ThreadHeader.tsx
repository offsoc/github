// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {CheckCircleFillIcon, CheckCircleIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {usePullRequestContext} from '../../../../contexts/PullRequestContext'
import {usePullRequestAnalytics} from '../../../../hooks/use-pull-request-analytics'
import resolvePullRequestThreadMutation from '../../../../mutations/resolve-pull-request-thread-mutation'
import unresolvePullRequestThreadMutation from '../../../../mutations/unresolve-pull-request-thread-mutation'
import type {ThreadHeader_pullRequestThread$key} from './__generated__/ThreadHeader_pullRequestThread.graphql'
import {ConversationHeader} from './ConversationHeader'

type ThreadHeaderProps = {
  isCollapsed: boolean
  onNavigateToDiffThread: () => void
  onToggleCollapsed: () => void
  thread: ThreadHeader_pullRequestThread$key
}

export function ThreadHeader({isCollapsed, onToggleCollapsed, onNavigateToDiffThread, thread}: ThreadHeaderProps) {
  const data = useFragment(
    graphql`
      fragment ThreadHeader_pullRequestThread on PullRequestThread {
        id
        isOutdated
        isResolved
        line
        path
      }
    `,
    thread,
  )

  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()
  const {addToast} = useToastContext()
  const {pullRequestId} = usePullRequestContext()
  const environment = useRelayEnvironment()

  const handleResolveThread = () => {
    resolvePullRequestThreadMutation({
      environment,
      input: {threadId: data.id},
      onCompleted: () => !isCollapsed && onToggleCollapsed(),
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to resolve thread',
        })
      },
      pullRequestId,
    })

    sendPullRequestAnalyticsEvent('comments.resolve_thread', 'RESOLVE_CONVERSATION_BUTTON')
  }

  const handleUnresolveThread = () => {
    unresolvePullRequestThreadMutation({
      environment,
      input: {threadId: data.id},
      onCompleted: () => isCollapsed && onToggleCollapsed(),
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to unresolve thread',
        })
      },
      pullRequestId,
    })

    sendPullRequestAnalyticsEvent('comments.unresolve_thread', 'RESOLVE_CONVERSATION_BUTTON')
  }

  return (
    <ConversationHeader
      isCollapsed={isCollapsed}
      isOutdated={data.isOutdated}
      isResolved={data.isResolved}
      line={data.line}
      path={data.path}
      rightSideContent={
        <>
          <Tooltip
            direction="sw"
            id="resolve-conversation"
            text={data.isResolved ? 'Unresolve conversation' : 'Resolve conversation'}
            type="label"
          >
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              aria-labelledby="resolve-conversation"
              icon={data.isResolved ? CheckCircleFillIcon : CheckCircleIcon}
              // need to be specific in order to override default IconButton color
              sx={{color: data.isResolved ? 'var(--fgColor-done, var(--color-done-fg)) !important' : undefined}}
              unsafeDisableTooltip={true}
              variant="invisible"
              onClick={data.isResolved ? handleUnresolveThread : handleResolveThread}
            />
          </Tooltip>
        </>
      }
      onNavigateToDiffThread={onNavigateToDiffThread}
      onToggleCollapsed={onToggleCollapsed}
    />
  )
}
