/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import type {FC} from 'react'
import {graphql, useFragment} from 'react-relay'

import {useNotificationNavigate, useRouteInfo} from '../../../hooks'
import type {NotificationProps} from '../../../types/notification'
import type {InboxListRow_fragment$key} from './__generated__/InboxListRow_fragment.graphql'
import InboxRowAside, {InboxRowCompactAside} from './InboxRowAside'
import InboxRowOptions from './InboxRowOptions'
import InboxRowContentWrapper, {InboxRowCompactContent} from './InboxRowContent'
import InboxRowHierarchy from './InboxRowHierarchy'
import InboxRowState from './InboxRowState'
import InboxRowSubject, {InboxRowCompactSubject} from './InboxRowSubject'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItem} from '@github-ui/list-view/ListItem'
import {useRepositoryGroupContext} from '../../../contexts'

/// Fragment to access the notification thread
const notificationListRowFragment = graphql`
  fragment InboxListRow_fragment on NotificationThread {
    ...InboxRowContent_fragment
    id
    isUnread
    unreadItemsCount
    lastUpdatedAt
    reason
    url
    isDone
    subscriptionStatus
    subject {
      __typename
      ... on AdvisoryCredit {
        ghsaId
        advisory {
          summary
        }
      }
      ... on CheckSuite {
        databaseId
        checkSuiteState: status
        checkSuiteResult: conclusion
      }
      ... on Commit {
        id
        oid
        message
      }
      ... on Discussion {
        id
        title
        number
      }
      ... on Gist {
        id
        gistName: name
        gistTitle: title
      }
      ... on Issue {
        id
        issueState: state
        stateReason
        title
        number
        url
      }
      ... on PullRequest {
        id
        prState: state
        title
        number
      }
      ... on Release {
        tagName
        name
      }
      ... on RepositoryAdvisory {
        ghsaId
        title
      }
      ... on RepositoryDependabotAlertsThread {
        id
      }
      ... on RepositoryInvitation {
        repositoryInvitation: repository {
          name
          owner {
            login
          }
        }
        inviter {
          login
        }
      }
      ... on RepositoryVulnerabilityAlert {
        alertNumber: number
      }
      ... on SecurityAdvisory {
        ghsaId
        summary
      }
      ... on TeamDiscussion {
        id
        title
        number
      }
      ... on WorkflowRun {
        runNumber
        workflowTitle: title
      }
      ... on MemberFeatureRequestNotification {
        title
        body
      }
    }
    list {
      __typename
      ... on Repository {
        name
        owner {
          login
        }
      }
      ... on Team {
        name
        slug
        organization {
          login
        }
      }
      ... on User {
        login
      }
      ... on Organization {
        login
      }
      ... on Enterprise {
        slug
      }
    }
  }
`

type InboxListRowProps = InboxListRow_fragment$key & {
  isSelected?: boolean
  onSelect: (id: string, selected: boolean) => void
}

type InboxListCompactRowProps = InboxListRow_fragment$key & {
  isSelected?: boolean
}

/// Component to render a notification thread
const InboxListRow: FC<InboxListRowProps> = ({isSelected, onSelect, ...thread}) => {
  const data = useFragment(notificationListRowFragment, thread)
  const {isUnread, url} = data
  const handleNavigate = useNotificationNavigate(data as NotificationProps)
  const {isGrouped} = useRepositoryGroupContext()

  // Muted state is triggered when the row is not selected and not unread
  const isMuted = !isSelected && !isUnread

  return (
    <ListItem
      data-testid="notification-thread"
      isSelected={isSelected}
      onSelect={newIsSelected => onSelect(data.id, newIsSelected)}
      title={<InboxRowSubject thread={data} href={url} onClick={handleNavigate} />}
      metadata={
        <>
          <ListItemMetadata variant="primary" alignment="right">
            {!isGrouped && <InboxRowHierarchy {...data} />}
            <InboxRowAside {...data} />
          </ListItemMetadata>
          <ListItemMetadata variant="secondary" alignment="right" sx={{width: '100px'}}>
            <InboxRowOptions {...data} />
          </ListItemMetadata>
        </>
      }
      sx={{
        width: '100%',
        color: isMuted ? 'fg.muted' : 'inherit',
      }}
    >
      <ListItemLeadingContent>
        <InboxRowState thread={data} />
      </ListItemLeadingContent>
      <ListItemMainContent>
        <InboxRowContentWrapper {...data} />
      </ListItemMainContent>
    </ListItem>
  )
}

const InboxListCompactRow: FC<InboxListCompactRowProps> = thread => {
  const data = useFragment(notificationListRowFragment, thread)
  const {id, isUnread, url} = data
  const {notificationId} = useRouteInfo()
  const handleNavigate = useNotificationNavigate(data as NotificationProps)
  const isActive = notificationId === id
  const isMuted = !isActive && !isUnread

  return (
    <ListItem
      data-testid="notification-thread"
      title={<InboxRowCompactSubject thread={data} href={url} onClick={handleNavigate} />}
      metadata={
        <>
          <ListItemMetadata variant="secondary" alignment="right">
            <InboxRowCompactAside {...data} />
          </ListItemMetadata>
        </>
      }
      sx={{
        width: '100%',
        color: isMuted ? 'fg.muted' : 'inherit',
        backgroundColor: isActive ? 'canvas.subtle' : 'inherit',
      }}
    >
      <ListItemLeadingContent>
        <InboxRowState thread={data} />
      </ListItemLeadingContent>
      <ListItemMainContent>
        <InboxRowCompactContent {...data} />
      </ListItemMainContent>
    </ListItem>
  )
}

export default InboxListRow
export {InboxListCompactRow}
