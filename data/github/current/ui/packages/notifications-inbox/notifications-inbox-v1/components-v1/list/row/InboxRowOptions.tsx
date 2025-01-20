/* eslint eslint-comments/no-use: off */
import {BellSlashIcon, CheckIcon} from '@primer/octicons-react'
import {Box, IconButton} from '@primer/react'
import {type FC, memo} from 'react'
import {useRelayEnvironment} from 'react-relay'

import MarkAsReadIcon from '../../../../notifications/components/MarkAsReadIcon'
import MarkAsUnreadIcon from '../../../../notifications/components/MarkAsUnreadIcon'
import {UNSUBSCRIBABLE_TYPES, UNSUBSCRIBE_STATE} from '../../../../notifications/constants/subscriptions'
import {
  markNotificationAsDone,
  markNotificationAsRead,
  markNotificationAsUnread,
  updateSubscription,
} from '../../../../notifications/mutations'
import type {InboxListRow_v1_fragment$data} from './__generated__/InboxListRow_v1_fragment.graphql'

// Render the row subtitle: avatar of the user who triggered the notification and the notification body truncated
const InboxRowOptions: FC<InboxListRow_v1_fragment$data> = memo(function InboxSubject(thread) {
  const {id, isUnread, isDone, subscriptionStatus, subject} = thread
  const {__typename} = subject
  const subjectId =
    __typename === 'Discussion' ||
    __typename === 'Issue' ||
    __typename === 'PullRequest' ||
    __typename === 'Commit' ||
    __typename === 'TeamDiscussion'
      ? subject.id
      : null

  const environment = useRelayEnvironment()
  const markAsRead = () => {
    markNotificationAsRead({
      environment,
      notificationId: id,
    })
  }

  const markAsUnread = () => {
    markNotificationAsUnread({
      environment,
      notificationId: id,
    })
  }

  const markAsDone = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    markNotificationAsDone({
      environment,
      notificationId: id,
    })
  }

  const unsubscribe = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (subjectId === null) return
    updateSubscription({
      environment,
      subscribableId: subjectId,
      state: 'UNSUBSCRIBED',
      onCompleted: () => markAsDone(event),
    })
  }

  const buttonStyles = {
    color: 'fg.muted',
    '&:hover:not([disabled])': {
      backgroundColor:
        'var(--control-transparent-bgColor-hover, var(--color-action-list-item-default-hover-bg)) !important',
    },
  }

  return (
    <Box sx={{display: 'flex', borderRadius: '6px'}}>
      {isUnread && (
        // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
        <IconButton
          unsafeDisableTooltip={true}
          variant="invisible"
          title="Read"
          aria-label="Mark as read"
          sx={buttonStyles}
          onClick={event => {
            markAsRead()
            event.preventDefault()
            event.stopPropagation()
          }}
          icon={MarkAsReadIcon}
        />
      )}
      {!isUnread && (
        // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
        <IconButton
          unsafeDisableTooltip={true}
          variant="invisible"
          title="Unread"
          aria-label="Mark as unread"
          sx={buttonStyles}
          onClick={event => {
            markAsUnread()
            event.preventDefault()
            event.stopPropagation()
          }}
          icon={MarkAsUnreadIcon}
        />
      )}
      {!isDone && (
        // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
        <IconButton
          unsafeDisableTooltip={true}
          variant="invisible"
          sx={buttonStyles}
          title="Done"
          aria-label="Mark as done"
          icon={CheckIcon}
          onClick={markAsDone}
        />
      )}
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        variant="invisible"
        sx={buttonStyles}
        title="Unsubscribe"
        aria-label="Unsubscribe"
        icon={BellSlashIcon}
        onClick={unsubscribe}
        disabled={
          subscriptionStatus !== UNSUBSCRIBE_STATE && UNSUBSCRIBABLE_TYPES.includes(subject.__typename) ? false : true
        }
        aria-disabled={
          subscriptionStatus !== UNSUBSCRIBE_STATE && UNSUBSCRIBABLE_TYPES.includes(subject.__typename) ? false : true
        }
      />
    </Box>
  )
})

export default InboxRowOptions
