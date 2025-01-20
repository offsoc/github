/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {ActionList, Box, Text} from '@primer/react'
import type {FC} from 'react'
import {graphql, useFragment} from 'react-relay'

import {DateFormatter} from '../../../../utils/DateFormatter'
import {useNotificationNavigate, useRouteInfo} from '../../../hooks-v1'
import type {NotificationProps, subjectType} from '../../../../types/notification'
import {InboxUnreadIndicator} from '../InboxUnreadIndicator'
import type {InboxListRow_v1_fragment$key} from './__generated__/InboxListRow_v1_fragment.graphql'
import InboxRowAside, {InboxAsideOptions, InboxRowCompactAside} from './InboxRowAside'
import InboxRowContent, {InboxRowCompactContent} from './InboxRowContent'
import InboxRowHierarchy, {InboxRowCompactHierarchy} from './InboxRowHierarchy'
import InboxRowState from './InboxRowState'
import InboxRowSubject, {InboxRowCompactSubject} from './InboxRowSubject'

/// Fragment to access the notification thread
const notificationListRowFragment = graphql`
  fragment InboxListRow_v1_fragment on NotificationThread {
    id
    isUnread
    unreadItemsCount
    lastUpdatedAt
    reason
    summaryItemAuthor {
      avatarUrl
    }
    summaryItemBody
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

type InboxListRowProps = InboxListRow_v1_fragment$key & {
  isSelected?: boolean
}

/// Component to render a notification thread
const InboxListRow: FC<InboxListRowProps> = ({isSelected, ...thread}) => {
  const data = useFragment(notificationListRowFragment, thread)
  const {isUnread, url} = data
  const handleNavigate = useNotificationNavigate(data as NotificationProps)

  // Muted state is triggered when the row is not selected and not unread
  const isMuted = !isSelected && !isUnread

  return (
    <ActionList.LinkItem
      active={isSelected ?? false}
      onClick={handleNavigate}
      href={url}
      sx={{
        width: '100%',
        color: isMuted ? 'fg.muted' : 'inherit',
        '[data-component="aside-row-options"], &:hover [data-component="aside-row-data"]': {
          display: 'none',
        },
        '&:hover [data-component="aside-row-options"], [data-component="aside-row-data"]': {
          display: 'flex',
        },
        px: 2,
      }}
    >
      <Box
        sx={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 1, py: 1}}
        data-testid="notification-thread"
      >
        <Box sx={{display: 'flex', flexDirection: 'column', mr: 2, gap: 1, alignItems: 'center', position: 'relative'}}>
          {/* Setting lineHeight to 20px to visually align with title */}
          <Box sx={{display: 'flex', height: '20px', alignItems: 'center'}}>
            <InboxRowState thread={data} isMuted={isMuted} />
          </Box>
          <InboxUnreadIndicator isReadByViewer={!isUnread} />
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: '0'}}>
          {/* Render in column when on small viewport */}
          <Box sx={{display: ['block', 'block', 'block', 'block', 'none']}}>
            <InboxRowHierarchy {...data} />
          </Box>
          <InboxRowSubject {...data} />
          <div>
            <InboxRowContent thread={data} isMuted={isMuted} />
          </div>
        </Box>
        <Box
          data-component="aside-row-data"
          sx={{
            // On small viewports, we want to align to the top with a bit of padding
            // For larger viewports, vertically align center
            alignSelf: ['flex-start', 'flex-start', 'flex-start', 'flex-start', 'center'],
            pt: ['1', '1', '1', '1', '0'],
          }}
        >
          <InboxRowAside {...data} />
        </Box>
        <Box data-component="aside-row-options" sx={{alignSelf: 'center'}}>
          <InboxAsideOptions {...data} />
        </Box>
      </Box>
    </ActionList.LinkItem>
  )
}

const InboxListCompactRow: FC<InboxListRowProps> = thread => {
  const data = useFragment(notificationListRowFragment, thread)
  const {id, isUnread, lastUpdatedAt, unreadItemsCount, url} = data
  const {notificationId} = useRouteInfo()
  const number = (data.subject as subjectType).number ?? -1
  const handleNavigate = useNotificationNavigate(data as NotificationProps)
  const isActive = notificationId === id
  const isMuted = !isActive && !isUnread

  return (
    <ActionList.LinkItem
      active={isActive}
      onClick={handleNavigate}
      // this is a hack to make the title truncated
      sx={{
        width: '100%',
        color: isMuted ? 'fg.muted' : 'inherit',
        '[data-component="ActionList.Item--DividerContainer"] > div > span:first-child': {
          minWidth: '50%',
          flexBasis: 0,
        },
        '[data-component="ActionList.Item--DividerContainer"] > div > span:last-child': {
          flexShrink: 1,
        },
      }}
      href={url}
    >
      <Box
        sx={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 1}}
        data-testid="notification-thread"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mr: 2,
            mt: 1,
            gap: 1,
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Box sx={{display: 'flex'}}>
            <InboxRowState thread={data} isMuted={isMuted} />
          </Box>
          <InboxUnreadIndicator isReadByViewer={!isUnread} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
          }}
        >
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <InboxRowCompactHierarchy {...data} />
              {number > 0 && (
                <Text as="span" sx={{color: 'fg.muted', fontSize: '12px', fontWeight: 'normal'}}>
                  &nbsp;&#x23;{number}
                </Text>
              )}
            </div>
            <Text as="span" sx={{color: 'fg.muted', fontSize: '12px', fontWeight: 'normal'}}>
              <DateFormatter timestamp={new Date(lastUpdatedAt)} />
            </Text>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'space-between', gap: unreadItemsCount ? 2 : null}}>
            <InboxRowCompactSubject {...data} />
            <InboxRowCompactAside {...data} />
          </Box>
          <div>
            <InboxRowCompactContent thread={data} isMuted={isMuted} />
          </div>
        </Box>
      </Box>
    </ActionList.LinkItem>
  )
}

export default InboxListRow
export {InboxListCompactRow}
