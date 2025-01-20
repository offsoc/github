/* eslint eslint-comments/no-use: off */
import type {TruncateProps} from '@primer/react'
import {Box, Text, Truncate} from '@primer/react'
import {type FC, memo} from 'react'
import styled from 'styled-components'

import type {subjectType} from '../../../../types/notification'
import type {InboxListRow_v1_fragment$data} from './__generated__/InboxListRow_v1_fragment.graphql'

const getNotificationTitle = (thread: InboxListRow_v1_fragment$data): string => {
  const {subject} = thread
  const {__typename} = subject
  switch (__typename) {
    case 'AdvisoryCredit':
      return subject.advisory?.summary
    case 'CheckSuite':
      return `Check suite #${subject.databaseId}`
    case 'Commit':
      return `${subject.message}`
    case 'Discussion':
      return subject.title
    case 'Gist':
      return subject.gistTitle ?? subject.gistName
    case 'Issue':
      return subject.title
    case 'PullRequest':
      return subject.title
    case 'Release':
      return `${subject.name}`
    case 'RepositoryAdvisory':
      return `${subject.title}`
    case 'RepositoryDependabotAlertsThread':
      return `Your repository has dependencies with security vulnerabilities`
    case 'RepositoryInvitation':
      return `Invitation to join ${subject.repositoryInvitation?.owner?.login}/${subject.repositoryInvitation?.name} from ${subject.inviter?.login}`
    case 'RepositoryVulnerabilityAlert':
      return `Vulnerability alert #${subject.alertNumber}`
    case 'SecurityAdvisory':
      return `${subject.summary}`
    case 'TeamDiscussion':
      return subject.title
    case 'WorkflowRun':
      return `${subject.workflowTitle}`
    case 'MemberFeatureRequestNotification':
      return subject.title
    default:
      return `Unknown notification subject type: ${__typename}`
  }
}

const InboxSubject: FC<InboxListRow_v1_fragment$data> = memo(function InboxSubject(thread) {
  const title = getNotificationTitle(thread)
  const number = (thread.subject as subjectType).number ?? -1

  return (
    <Box sx={{display: 'flex', whiteSpace: 'nowrap', mr: 4}}>
      <Text sx={{overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'semibold'}}>{title}</Text>
      {number > 0 && (
        <Text as="span" sx={{color: 'fg.muted'}}>
          &nbsp;&#x23;{number}
        </Text>
      )}
    </Box>
  )
})

const StyledLineClamp = styled(Truncate)<TruncateProps>`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`

/// Render the notification thread "subject", i.e. the issue, pull request, etc. that the notification is for
const InboxRowCompactSubject: FC<InboxListRow_v1_fragment$data> = memo(function InboxCompactSubject(thread) {
  const title = getNotificationTitle(thread)
  return (
    <StyledLineClamp
      as="span"
      inline
      sx={{
        maxWidth: '100%',
        whiteSpace: 'normal',
      }}
      title={title}
    >
      <Text sx={{fontWeight: 'semibold'}}>{title}</Text>
    </StyledLineClamp>
  )
})

export default InboxSubject
export {InboxRowCompactSubject}
