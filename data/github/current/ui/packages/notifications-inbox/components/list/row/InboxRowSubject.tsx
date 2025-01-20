import {memo, type MouseEvent, type KeyboardEvent} from 'react'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'

import type {subjectType} from '../../../types/notification'
import type {InboxListRow_fragment$data} from './__generated__/InboxListRow_fragment.graphql'

const getNotificationTitle = (thread: InboxListRow_fragment$data): string => {
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
type NotificationNavigateCallback = (event: MouseEvent | KeyboardEvent) => void

type InboxSubjectProps = {
  thread: InboxListRow_fragment$data
  href: string
  onClick: NotificationNavigateCallback
}

const buildTitle = (title: string, number: number): string => `${title}${number > 0 ? ` #${number}` : ''}`

const InboxSubject = memo(function InboxSubject({thread, href, onClick}: InboxSubjectProps) {
  const title = getNotificationTitle(thread)
  const number = (thread.subject as subjectType).number ?? -1

  return <ListItemTitle value={buildTitle(title, number)} href={href} onClick={onClick} />
})

export default InboxSubject
// TODO: Eventually we will want to remove this export but we currently need it without a larger overhaul
export {InboxSubject as InboxRowCompactSubject}
