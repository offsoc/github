/* eslint eslint-comments/no-use: off */
import {
  AlertIcon,
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  CodeIcon,
  CommentDiscussionIcon,
  CommitIcon,
  DotFillIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  IssueReopenedIcon,
  MailIcon,
  QuestionIcon,
  RocketIcon,
  ShieldIcon,
  SkipIcon,
  SquareFillIcon,
  StopIcon,
  TagIcon,
  XCircleIcon,
} from '@primer/octicons-react'
import {Box, Octicon} from '@primer/react'
import type {FC} from 'react'

import type {InboxListRow_v1_fragment$data} from './__generated__/InboxListRow_v1_fragment.graphql'

/// Replicated from `app/components/actions/workflow_runs/status_component.html.erb`
const CheckSpinner = () => (
  <Box sx={{height: '16px', width: '16px'}}>
    <svg
      aria-label="In progress"
      width="92%"
      height="92%"
      fill="none"
      viewBox="0 0 16 16"
      className="anim-rotate"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path opacity=".5" d="M8 15A7 7 0 108 1a7 7 0 000 14v0z" stroke="#dbab0a" strokeWidth="2" />
      <path d="M15 8a7 7 0 01-7 7" stroke="#dbab0a" strokeWidth="2" />
      <path d="M8 12a4 4 0 100-8 4 4 0 000 8z" fill="#dbab0a" />
    </svg>
  </Box>
)

type InboxStateProps = {
  thread: InboxListRow_v1_fragment$data
  isMuted?: boolean
}

const MUTED_OPACITY = 0.6

const InboxState: FC<InboxStateProps> = ({thread, isMuted}) => {
  const {subject} = thread
  const {__typename} = subject

  const sxProps = {
    opacity: isMuted ? MUTED_OPACITY : undefined,
  }

  switch (__typename) {
    case 'Issue':
      switch (subject.issueState.toLocaleUpperCase()) {
        case 'OPEN':
          return <Octicon icon={IssueOpenedIcon} sx={{color: 'open.fg', ...sxProps}} />
        case 'CLOSED':
          switch ((subject.stateReason ?? '')?.toLocaleUpperCase()) {
            case 'NOT_PLANNED':
              return <Octicon icon={SkipIcon} sx={{color: 'fg.muted', ...sxProps}} />
            default:
              return <Octicon icon={IssueClosedIcon} sx={{color: 'done.fg', ...sxProps}} />
          }
        default:
          return null
      }
    case 'PullRequest':
      switch (subject.prState.toLocaleUpperCase()) {
        case 'OPEN':
          return <Octicon icon={GitPullRequestIcon} sx={{color: 'open.fg', ...sxProps}} />
        case 'MERGED':
          return <Octicon icon={GitPullRequestClosedIcon} sx={{color: 'done.fg', ...sxProps}} />
        case 'DRAFT':
        default:
          return <Octicon icon={GitPullRequestDraftIcon} sx={{color: 'fg.muted', ...sxProps}} />
      }
    case 'TeamDiscussion':
    case 'Discussion':
      return <Octicon icon={CommentDiscussionIcon} sx={{color: 'open.fg', ...sxProps}} />
    case 'RepositoryAdvisory':
    case 'RepositoryDependabotAlertsThread':
    case 'RepositoryVulnerabilityAlert':
    case 'SecurityAdvisory':
      return <Octicon icon={AlertIcon} sx={{...sxProps}} />
    case 'AdvisoryCredit':
      return <Octicon icon={ShieldIcon} sx={{color: 'attention.fg', ...sxProps}} />
    case 'Gist':
      return <Octicon icon={CodeIcon} sx={{...sxProps}} />
    case 'Release':
      return <Octicon icon={TagIcon} sx={{...sxProps}} />
    case 'Commit':
      return <Octicon icon={CommitIcon} sx={{...sxProps}} />
    case 'WorkflowRun':
      return <Octicon icon={RocketIcon} sx={{...sxProps}} />
    case 'CheckSuite':
      switch (subject.checkSuiteState.toLocaleLowerCase()) {
        // Running -- use spinner
        case 'in_progress':
          return <CheckSpinner />
        // Queued
        case 'queued':
          return <Octicon icon={DotFillIcon} sx={{color: 'attention.fg', ...sxProps}} />
        // Pending (not started)
        case 'waiting':
        case 'pending':
          return <Octicon icon={ClockIcon} sx={{color: 'attention.fg', ...sxProps}} />
        // Completed -- have a result
        case 'completed':
          switch (subject.checkSuiteResult?.toLocaleLowerCase()) {
            case 'neutral':
              return <Octicon icon={SquareFillIcon} sx={{color: 'fg.muted', ...sxProps}} />
            case 'success':
              return <Octicon icon={CheckCircleIcon} sx={{color: 'done.fg', ...sxProps}} />
            case 'failure':
            case 'timed_out':
            case 'startup_failure':
              return <Octicon icon={XCircleIcon} sx={{color: 'danger.fg', ...sxProps}} />
            case 'cancelled':
              return <Octicon icon={StopIcon} sx={{...sxProps}} />
            case 'action_required':
              return <Octicon icon={AlertIcon} sx={{color: 'attention.fg', ...sxProps}} />
            case 'skipped':
              return <Octicon icon={SkipIcon} sx={{...sxProps}} />
            case 'stale':
              return <Octicon icon={CircleIcon} sx={{...sxProps}} />
            default:
              return <Octicon icon={IssueReopenedIcon} sx={{...sxProps}} />
          }
        // Pending (not strted)
        case 'requested':
        default:
          return <Octicon icon={CircleIcon} sx={{...sxProps}} />
      }
    case 'RepositoryInvitation':
      return <Octicon icon={MailIcon} sx={{...sxProps}} />
    case 'MemberFeatureRequestNotification':
      return <Octicon icon={CircleIcon} sx={{...sxProps}} />
    default:
      return <Octicon icon={QuestionIcon} sx={{...sxProps}} />
  }
}

export default InboxState
