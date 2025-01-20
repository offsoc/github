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
import {Box, type OcticonProps} from '@primer/react'
import type {FC} from 'react'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'

import type {InboxListRow_fragment$data} from './__generated__/InboxListRow_fragment.graphql'

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
  thread: InboxListRow_fragment$data
}

type InboxStateVisualProps = {
  color?: string
  description: string
  icon: OcticonProps['icon']
}

/**
 * Get props for ListItem.LeadingVisual component from a thread,
 * based on the subject type and state.
 */
const getVisualProps = (thread: InboxListRow_fragment$data): InboxStateVisualProps | null => {
  const {subject} = thread
  const {__typename} = subject

  switch (__typename) {
    case 'Issue':
      switch (subject.issueState.toLocaleUpperCase()) {
        case 'OPEN':
          return {
            color: 'open.fg',
            description: 'Issue open',
            icon: IssueOpenedIcon,
          }
        case 'CLOSED':
          switch ((subject.stateReason ?? '')?.toLocaleUpperCase()) {
            case 'NOT_PLANNED':
              return {
                color: 'fg.muted',
                description: 'Issue closed, not planned',
                icon: SkipIcon,
              }
            default:
              return {
                color: 'done.fg',
                description: 'Issue closed, completed',
                icon: IssueClosedIcon,
              }
          }
        default:
          return null
      }
    case 'PullRequest':
      switch (subject.prState.toLocaleUpperCase()) {
        case 'OPEN':
          return {
            color: 'open.fg',
            description: 'Pull request open',
            icon: GitPullRequestIcon,
          }
        case 'MERGED':
          return {
            color: 'done.fg',
            description: 'Pull request merged',
            icon: GitPullRequestClosedIcon,
          }
        case 'DRAFT':
        default:
          return {
            color: 'fg.muted',
            description: 'Pull request draft',
            icon: GitPullRequestDraftIcon,
          }
      }
    case 'TeamDiscussion':
    case 'Discussion':
      return {
        color: 'open.fg',
        description: 'Discussion',
        icon: CommentDiscussionIcon,
      }
    case 'RepositoryAdvisory':
    case 'RepositoryDependabotAlertsThread':
    case 'RepositoryVulnerabilityAlert':
    case 'SecurityAdvisory':
      return {
        description: 'Security advisory',
        icon: ShieldIcon,
      }
    case 'AdvisoryCredit':
      return {
        color: 'attention.fg',
        description: 'Security advisory credit',
        icon: ShieldIcon,
      }
    case 'Gist':
      return {
        description: 'Gist',
        icon: CodeIcon,
      }
    case 'Release':
      return {
        description: 'Release',
        icon: TagIcon,
      }
    case 'Commit':
      return {
        description: 'Commit',
        icon: CommitIcon,
      }
    case 'WorkflowRun':
      return {
        description: 'Workflow run',
        icon: RocketIcon,
      }
    case 'CheckSuite':
      switch (subject.checkSuiteState.toLocaleLowerCase()) {
        // Running -- use spinner
        case 'in_progress':
          return {
            description: 'Check suite in progress',
            icon: CheckSpinner,
          }
        // Queued
        case 'queued':
          return {
            color: 'attention.fg',
            description: 'Check suite queued',
            icon: ClockIcon,
          }
        // Pending (not started)
        case 'waiting':
        case 'pending':
          return {
            color: 'attention.fg',
            description: 'Check suite pending',
            icon: ClockIcon,
          }
        // Completed -- have a result
        case 'completed':
          switch (subject.checkSuiteResult?.toLocaleLowerCase()) {
            case 'neutral':
              return {
                color: 'fg.muted',
                description: 'Check suite completed',
                icon: SquareFillIcon,
              }
            case 'success':
              return {
                color: 'done.fg',
                description: 'Check suite completed successfully',
                icon: CheckCircleIcon,
              }
            case 'failure':
            case 'timed_out':
            case 'startup_failure':
              return {
                color: 'danger.fg',
                description: 'Check suite failed',
                icon: XCircleIcon,
              }
            case 'cancelled':
              return {
                description: 'Check suite cancelled',
                icon: StopIcon,
              }
            case 'action_required':
              return {
                color: 'attention.fg',
                description: 'Check suite requires action',
                icon: AlertIcon,
              }
            case 'skipped':
              return {
                description: 'Check suite skipped',
                icon: SkipIcon,
              }
            case 'stale':
              return {
                description: 'Check suite stale',
                icon: DotFillIcon,
              }
            default:
              return {
                description: 'Check suite',
                icon: IssueReopenedIcon,
              }
          }
        // Pending (not started)
        case 'requested':
        default:
          return {
            description: 'Check suite',
            icon: CircleIcon,
          }
      }
    case 'RepositoryInvitation':
      return {
        description: 'Repository invitation',
        icon: MailIcon,
      }
    case 'MemberFeatureRequestNotification':
      return {
        description: 'Member feature request',
        icon: CircleIcon,
      }
    default:
      return {
        description: 'Unknown',
        icon: QuestionIcon,
      }
  }
}

const InboxState: FC<InboxStateProps> = ({thread}) => {
  const {isUnread} = thread
  const visualProps = getVisualProps(thread)
  if (!visualProps) return null

  return <ListItemLeadingVisual newActivity={isUnread} {...visualProps} />
}

export default InboxState
