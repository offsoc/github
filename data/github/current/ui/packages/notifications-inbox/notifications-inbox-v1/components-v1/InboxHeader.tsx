/* eslint eslint-comments/no-use: off */
import {useKeyPress} from '@github-ui/use-key-press'
import {BellSlashIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, CopyIcon} from '@primer/octicons-react'
import {Box, Button, IconButton} from '@primer/react'
import {type MouseEvent, useCallback, useMemo} from 'react'
import {graphql, useFragment} from 'react-relay'

import MarkAsReadIcon from '../../notifications/components/MarkAsReadIcon'
import MarkAsUnreadIcon from '../../notifications/components/MarkAsUnreadIcon'
import {HOTKEYS} from '../../notifications/constants/hotkeys'
import {LABELS} from '../../notifications/constants/labels'
import {UNSUBSCRIBABLE_TYPES, UNSUBSCRIBE_STATE} from '../../notifications/constants/subscriptions'
import {useNotificationContext} from '../contexts-v1/NotificationContext'
import {
  useAppNavigate,
  useMarkNotificationAsDone,
  useMarkNotificationAsRead,
  useMarkNotificationAsUnread,
  useNotificationUnsubscribe,
} from '../hooks-v1'
import type {NotificationPosition} from '../../types/notification'
import type {InboxHeader_notification_v1$key} from './__generated__/InboxHeader_notification_v1.graphql'

type InboxHeaderProps = {
  queryReference: InboxHeader_notification_v1$key
}

const InboxHeader = ({queryReference}: InboxHeaderProps) => {
  const {neighbours} = useNotificationContext()
  const {navigateToNotification, navigateToUrl} = useAppNavigate()

  const data = useFragment<InboxHeader_notification_v1$key>(
    graphql`
      fragment InboxHeader_notification_v1 on NotificationThread {
        id
        isUnread
        subscriptionStatus
        url
        subject {
          __typename
          ... on Issue {
            id
          }
          ... on Commit {
            id
          }
          ... on PullRequest {
            id
          }
          ... on Discussion {
            id
          }
          ... on TeamDiscussion {
            id
          }
        }
      }
    `,
    queryReference,
  )

  const {id, isUnread, subject, subscriptionStatus, url} = data
  const notificationPosition = useMemo(() => neighbours[id] ?? ({} as NotificationPosition), [neighbours, id])

  const markAsReadCallback = useMarkNotificationAsRead(id)
  const markAsRead = useCallback(
    function markAsReadIfUnread(event: KeyboardEvent | MouseEvent) {
      isUnread && markAsReadCallback(event)
    },
    [markAsReadCallback, isUnread],
  )

  const markAsUnreadCallback = useMarkNotificationAsUnread(id)
  const markAsUnread = useCallback(
    function marAsUnreadIfRead(event: KeyboardEvent | MouseEvent) {
      !isUnread && markAsUnreadCallback(event)
    },
    [markAsUnreadCallback, isUnread],
  )

  const markAsDoneCallback = useMarkNotificationAsDone(id)
  const markAsDone = useCallback(
    function markAsDoneAndNavigate(event: KeyboardEvent | MouseEvent) {
      markAsDoneCallback(event)
      const {next, previous} = notificationPosition
      // Checking the object exists is not enough here, we need to check the values are not null.
      if (next?.id) {
        navigateToNotification(next.id)
      } else if (previous?.id) {
        navigateToNotification(previous.id)
      }
    },
    [markAsDoneCallback, notificationPosition, navigateToNotification],
  )
  const unsubscribe = useNotificationUnsubscribe(
    UNSUBSCRIBABLE_TYPES.includes(subject.__typename) && subject.__typename !== '%other' ? subject.id : null,
    markAsDone,
  )

  const navigateNext = useCallback(
    (e: KeyboardEvent | MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      notificationPosition.next?.id && navigateToNotification(notificationPosition.next?.id)
    },
    [navigateToNotification, notificationPosition],
  )

  const navigatePrev = useCallback(
    (e: KeyboardEvent | MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      notificationPosition.previous?.id && navigateToNotification(notificationPosition.previous?.id)
    },
    [navigateToNotification, notificationPosition],
  )

  const navigateBack = useCallback(
    (e: KeyboardEvent | MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      navigateToUrl(LABELS.inboxPath)
    },
    [navigateToUrl],
  )

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(url)
  }, [url])

  // Keyboard bindings
  useKeyPress([HOTKEYS.markAsRead], markAsRead)
  useKeyPress([HOTKEYS.markAsUnread], markAsUnread)
  useKeyPress([HOTKEYS.markAsDone], markAsDone)
  useKeyPress([HOTKEYS.unsubscribe], unsubscribe)
  useKeyPress([HOTKEYS.nextThread], navigateNext)
  useKeyPress([HOTKEYS.prevThread], navigatePrev)
  useKeyPress([HOTKEYS.back], navigateBack)

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', pr: 2}}>
      {/* LHS – next/previous buttons */}
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center'}}>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          className="tooltipped tooltipped-s"
          size="small"
          aria-label={`Previous (${HOTKEYS.prevThread})`}
          icon={ChevronUpIcon}
          disabled={notificationPosition.isFirst}
          onClick={navigatePrev}
        />
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          className="tooltipped tooltipped-s"
          size="small"
          aria-label={`Next (${HOTKEYS.nextThread})`}
          icon={ChevronDownIcon}
          disabled={notificationPosition.isLast}
          onClick={navigateNext}
        />
      </Box>
      {/* RHS – notification action buttons */}
      <Box sx={{display: 'flex', flexDirection: 'row', pl: 2}}>
        <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Button
            className="tooltipped tooltipped-s"
            sx={{zIndex: 1, color: 'var(--fgColor-muted, var(--color-fg-muted))'}}
            variant="invisible"
            aria-label={`${LABELS.markAsDone} (${HOTKEYS.markAsDoneLabel})`}
            leadingVisual={CheckCircleIcon}
            onClick={markAsDone}
          >
            {LABELS.markAsDone}
          </Button>
          <Box
            sx={{width: 1, height: 16, backgroundColor: 'var(--borderColor-muted, var(--color-border-muted))', mx: 1}}
          />
        </Box>

        {isUnread ? (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            className="tooltipped tooltipped-s"
            sx={{color: 'var(--fgColor-muted, var(--color-fg-muted))'}}
            variant="invisible"
            aria-label={`Mark as read (${HOTKEYS.markAsReadLabel})`}
            icon={MarkAsReadIcon}
            onClick={markAsRead}
          />
        ) : (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            className="tooltipped tooltipped-s"
            sx={{color: 'var(--fgColor-muted, var(--color-fg-muted))'}}
            variant="invisible"
            aria-label={`Mark as unread (${HOTKEYS.markAsUnreadLabel})`}
            icon={MarkAsUnreadIcon}
            onClick={markAsUnread}
          />
        )}
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          className="tooltipped tooltipped-s"
          sx={{color: 'var(--fgColor-muted, var(--color-fg-muted))'}}
          variant="invisible"
          aria-label={`Unsubscribe (${HOTKEYS.unsubscribeLabel})`}
          icon={BellSlashIcon}
          onClick={unsubscribe}
          disabled={
            subscriptionStatus !== UNSUBSCRIBE_STATE && UNSUBSCRIBABLE_TYPES.includes(subject.__typename) ? false : true
          }
          aria-disabled={
            subscriptionStatus !== UNSUBSCRIBE_STATE && UNSUBSCRIBABLE_TYPES.includes(subject.__typename) ? false : true
          }
        />
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          className="tooltipped tooltipped-s"
          sx={{color: 'var(--fgColor-muted, var(--color-fg-muted))'}}
          variant="invisible"
          aria-label={`Copy link`}
          icon={CopyIcon}
          onClick={copyLink}
        />
      </Box>
    </Box>
  )
}

export default InboxHeader
