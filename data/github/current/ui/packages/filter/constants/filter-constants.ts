import {
  AppsIcon,
  ArchiveIcon,
  CalendarIcon,
  CheckCircleFillIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeIcon,
  CodespacesIcon,
  CommentDiscussionIcon,
  CommentIcon,
  DotFillIcon,
  FileIcon,
  GitBranchIcon,
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueDraftIcon,
  IssueOpenedIcon,
  LockIcon,
  MentionIcon,
  MilestoneIcon,
  NoEntryIcon,
  NoteIcon,
  OrganizationIcon,
  PeopleIcon,
  PersonIcon,
  PlayIcon,
  RepoIcon,
  SkipIcon,
  SmileyIcon,
  SortDescIcon,
  StopIcon,
  TableIcon,
  TagIcon,
  TypographyIcon,
  UnlockIcon,
  XCircleFillIcon,
} from '@primer/octicons-react'

import {
  type FilterKey,
  type FilterSuggestion,
  type KEY_ONLY_FILTERS,
  NOT_SHOWN,
  type STATIC_VALUE_FILTERS,
  type VALUE_FILTERS,
} from '../types'
import {NUMBER_COUNT_VALUE, TIME_RANGE_VALUES} from './dynamic-filter-values'

export const FILTER_KEYS: Record<VALUE_FILTERS | KEY_ONLY_FILTERS, FilterKey> = {
  archived: {
    displayName: 'Archived',
    key: 'archived',
    priority: NOT_SHOWN,
    icon: ArchiveIcon,
    description: 'Specify archived or non-archived items only',
  },
  base: {
    displayName: 'Base',
    key: 'base',
    priority: NOT_SHOWN,
    icon: GitBranchIcon,
    description: 'Pull Request base branch',
  },
  closed: {
    displayName: 'Closed date',
    key: 'closed',
    priority: NOT_SHOWN,
    icon: CalendarIcon,
    description: 'Closing date',
  },
  comments: {
    displayName: 'Comment count',
    key: 'comments',
    priority: NOT_SHOWN,
    icon: CommentIcon,
    description: 'Item comment count',
  },
  created: {
    displayName: 'Creation date',
    key: 'created',
    priority: NOT_SHOWN,
    icon: CalendarIcon,
    description: 'Creation date',
  },
  draft: {
    displayName: 'Draft',
    key: 'draft',
    priority: NOT_SHOWN,
    icon: IssueDraftIcon,
    description: 'Search for draft items',
  },
  head: {
    displayName: 'Head',
    key: 'head',
    priority: NOT_SHOWN,
    icon: GitBranchIcon,
    description: 'Head branch commit sha',
  },
  inBody: {
    displayName: 'In body',
    key: 'in-body',
    priority: NOT_SHOWN,
    icon: NoteIcon,
    description: 'Search for text only inside the body of an item',
  },
  inComments: {
    displayName: 'In comments',
    key: 'in-comments',
    priority: NOT_SHOWN,
    icon: CommentDiscussionIcon,
    description: 'Search for text only inside the comments of an item',
  },
  interactions: {
    displayName: 'Interactions count',
    key: 'interactions',
    priority: NOT_SHOWN,
    icon: CommentDiscussionIcon,
    description: 'Interaction count',
  },
  inTitle: {
    displayName: 'In title',
    key: 'in-title',
    priority: NOT_SHOWN,
    icon: TypographyIcon,
    description: 'Search for text only inside the title of an item',
  },
  is: {
    displayName: 'Is',
    key: 'is',
    icon: AppsIcon,
    description: 'Filter only "issues", "pulls", "open", "closed", or "draft"',
    priority: 3,
  },
  language: {
    displayName: 'Code language',
    key: 'language',
    priority: NOT_SHOWN,
    icon: CodeIcon,
    description: 'Code language',
  },
  linked: {
    displayName: 'Linked',
    key: 'linked',
    icon: GitPullRequestIcon,
    description: 'Items linked to an issue or pull request',
    priority: NOT_SHOWN,
  },
  memexState: {
    displayName: 'State',
    key: 'state',
    priority: 3,
    icon: IssueDraftIcon,
    description: 'Look for open, closed, or draft issues',
  },
  merged: {
    displayName: 'Merge date',
    key: 'merged',
    priority: NOT_SHOWN,
    icon: CalendarIcon,
    description: 'Merge date',
  },
  milestone: {
    displayName: 'Milestone',
    key: 'milestone',
    priority: NOT_SHOWN,
    icon: MilestoneIcon,
    description: 'Milestone',
  },
  no: {
    key: 'no',
    displayName: 'No',
    description: 'Filter by items without a specific metadata value',
    priority: 1,
    icon: NoEntryIcon,
  },
  prState: {
    displayName: 'State',
    key: 'state',
    priority: 3,
    icon: IssueDraftIcon,
    description: 'State of Pull Requests',
  },
  reactions: {
    displayName: 'Reaction count',
    key: 'reactions',
    priority: NOT_SHOWN,
    icon: SmileyIcon,
    description: 'Reactions count',
  },
  reason: {
    displayName: 'Closed reason',
    key: 'reason',
    priority: NOT_SHOWN,
    icon: MentionIcon,
    description: 'Filter by item closed reason',
  },
  review: {
    displayName: 'Review state',
    key: 'review',
    priority: NOT_SHOWN,
    icon: GitPullRequestIcon,
    description: 'Specify a review state',
  },
  sha: {
    displayName: 'Commit SHA',
    key: 'sha',
    priority: NOT_SHOWN,
    icon: FileIcon,
    description: 'Commit SHA',
  },
  sort: {
    displayName: 'Sort',
    key: 'sort',
    priority: NOT_SHOWN,
    icon: SortDescIcon,
    description: 'Sort results',
  },
  state: {
    displayName: 'State',
    key: 'state',
    priority: 3,
    icon: IssueDraftIcon,
    description: 'Look for open / closed items',
  },
  status: {
    displayName: 'Status',
    key: 'status',
    priority: NOT_SHOWN,
    icon: IssueDraftIcon,
    description: 'Commit status: pending | success | failure',
  },
  team: {
    displayName: 'Team',
    key: 'team',
    priority: NOT_SHOWN,
    icon: PeopleIcon,
    description: 'Team name',
  },
  teamReviewRequested: {
    displayName: 'Team review requested',
    key: 'team-review-requested',
    priority: NOT_SHOWN,
    icon: PeopleIcon,
    description: 'Review requested from team',
  },
  type: {
    displayName: 'Type',
    key: 'type',
    priority: NOT_SHOWN,
    icon: IssueOpenedIcon,
    description: 'Specify the type of issue to search for',
  },
  updated: {
    displayName: 'Update date',
    key: 'updated',
    priority: NOT_SHOWN,
    icon: CalendarIcon,
    description: 'Updated date',
  },
  repo: {
    displayName: 'Repository',
    key: 'repo',
    priority: 1,
    icon: RepoIcon,
    description: 'Filter by repository',
  },
  org: {
    displayName: 'Organization',
    key: 'org',
    aliases: ['organization'],
    priority: 2,
    icon: OrganizationIcon,
    description: 'Filter by organization',
  },
  label: {
    displayName: 'Label',
    key: 'label',
    priority: 3,
    icon: TagIcon,
    description: 'Filter by label',
  },
  project: {
    displayName: 'Project',
    key: 'project',
    priority: 3,
    icon: TableIcon,
    description: 'Filter by project',
  },
}

export const USER_FILTERS = {
  assignee: {
    displayName: 'Assignee',
    key: 'assignee',
    icon: PersonIcon,
    description: 'The assignee of the item',
    priority: 3,
  },
  author: {
    displayName: 'Author',
    key: 'author',
    icon: PersonIcon,
    description: 'The author of the item',
    priority: 3,
  },
  commenter: {
    displayName: 'Commenter',
    key: 'commenter',
    icon: PersonIcon,
    description: 'Items commented on by the user',
    priority: NOT_SHOWN,
  },
  involves: {
    displayName: 'Involves',
    key: 'involves',
    icon: PersonIcon,
    description: 'The user involved in the item',
    priority: NOT_SHOWN,
  },
  mentions: {
    displayName: 'Mentions',
    key: 'mentions',
    icon: MentionIcon,
    description: 'The user mentioned in the item',
    priority: NOT_SHOWN,
  },
  reviewedBy: {
    displayName: 'Reviewed by',
    key: 'reviewed-by',
    icon: PersonIcon,
    description: 'Items reviewed by the user',
    priority: NOT_SHOWN,
  },
  reviewRequested: {
    displayName: 'Review requested',
    key: 'review-requested',
    icon: PersonIcon,
    description: 'Items with review requested for the user',
    priority: NOT_SHOWN,
  },
  user: {
    displayName: 'User',
    key: 'user',
    icon: PersonIcon,
    description: 'Items in repositories owned by the user',
    priority: NOT_SHOWN,
  },
  userReviewRequested: {
    displayName: 'User review requested',
    key: 'user-review-requested',
    icon: MentionIcon,
    description: 'Items with review requested for the user explicitly',
    priority: NOT_SHOWN,
  },
}
export const USER_VALUE_FILTERS = Object.values(USER_FILTERS)

export const FILTER_VALUES: Record<STATIC_VALUE_FILTERS, FilterSuggestion[]> = {
  archived: [
    {value: 'true', displayName: 'True', priority: 1, aliases: ['yes']},
    {value: 'false', displayName: 'False', priority: 2, aliases: ['no']},
  ],
  closed: TIME_RANGE_VALUES,
  comments: NUMBER_COUNT_VALUE,
  created: TIME_RANGE_VALUES,
  draft: [
    {value: 'true', displayName: 'True', priority: 1, aliases: ['yes']},
    {value: 'false', displayName: 'False', priority: 2, aliases: ['no']},
  ],
  interactions: NUMBER_COUNT_VALUE,
  is: [
    {value: 'issue', displayName: 'Issue', priority: 1, icon: IssueOpenedIcon},
    {value: 'pr', displayName: 'Pull Request', priority: 2, icon: GitPullRequestIcon},
  ],
  linked: [
    {value: 'issue', displayName: 'Issue', priority: 1, icon: IssueOpenedIcon},
    {value: 'pr', displayName: 'Pull Request', priority: 2, icon: GitPullRequestIcon},
  ],
  sort: [],
  // TODO: Once we have draft issues in all of GitHub, this can be removed in favor of `state` below
  memexState: [
    {
      value: 'open',
      displayName: 'Open',
      priority: 1,
      icon: IssueOpenedIcon,
      iconColor: 'var(--fgColor-success, var(--color-success-fg))',
    },
    {
      value: 'closed',
      displayName: 'Closed',
      priority: 2,
      icon: IssueClosedIcon,
      iconColor: 'var(--fgColor-done, var(--color-done-fg))',
    },
    {
      value: 'draft',
      displayName: 'Draft',
      priority: 3,
      icon: IssueDraftIcon,
      iconColor: 'var(-fgColor-muted, var(--color-neutral-emphasis))',
    },
  ],
  merged: TIME_RANGE_VALUES,
  prState: [
    {
      value: 'open',
      displayName: 'Open',
      icon: GitPullRequestIcon,
      priority: 1,
      iconColor: 'var(--fgColor-open, var(--color-open-fg))',
    },
    {
      value: 'merged',
      displayName: 'Merged',
      icon: GitMergeIcon,
      priority: 2,
      iconColor: 'var(--fgColor-done, var(--color-done-fg))',
    },
    {
      value: 'draft',
      displayName: 'Draft',
      icon: GitPullRequestDraftIcon,
      priority: 3,
      iconColor: 'var(--fgColor-muted, var(--color-fg-muted))',
    },
    {
      value: 'closed',
      displayName: 'Closed',
      icon: GitPullRequestClosedIcon,
      priority: 4,
      iconColor: 'var(--fgColor-closed, var(--color-closed-fg))',
    },
  ],
  reactions: NUMBER_COUNT_VALUE,
  reason: [
    {
      value: 'completed',
      displayName: 'Completed',
      priority: 1,
      icon: CheckCircleIcon,
      iconColor: 'var(--fgColor-done, var(--color-done-fg))',
    },
    {
      value: 'not-planned',
      displayName: 'Not planned',
      priority: 2,
      icon: SkipIcon,
      iconColor: 'var(-fgColor-muted, var(--color-neutral-emphasis))',
    },
  ],
  review: [
    {value: 'none', displayName: 'No reviews', priority: 1},
    {value: 'required', displayName: 'Review required', priority: 2},
    {value: 'approved', displayName: 'Approved', priority: 3},
    {value: 'changes_requested', displayName: 'Changes requested', priority: 4},
  ],
  state: [
    {
      value: 'open',
      displayName: 'Open',
      priority: 1,
      icon: IssueOpenedIcon,
      iconColor: 'var(--fgColor-success, var(--color-success-fg))',
    },
    {
      value: 'closed',
      displayName: 'Closed',
      priority: 2,
      icon: IssueClosedIcon,
      iconColor: 'var(--fgColor-done, var(--color-done-fg))',
    },
  ],
  status: [
    {
      value: 'pending',
      displayName: 'Pending',
      priority: 1,
      icon: DotFillIcon,
      iconColor: 'var(--fgColor-attention, var(--color-attention-fg))',
    },
    {
      value: 'success',
      displayName: 'Success',
      priority: 2,
      icon: CheckCircleFillIcon,
      iconColor: 'var(--fgColor-success, var(--color-success-fg))',
    },
    {
      value: 'failure',
      displayName: 'Failure',
      priority: 3,
      icon: XCircleFillIcon,
      iconColor: 'var(--fgColor-danger, var(--color-danger-fg))',
    },
    {
      value: 'queued',
      displayName: 'Queued',
      priority: 4,
      icon: IssueOpenedIcon,
      iconColor: 'var(--fgColor-muted, var(--color-fg-subtle))',
    },
    {
      value: 'waiting',
      displayName: 'Waiting',
      priority: 4,
      icon: ClockIcon,
      iconColor: 'var(--fgColor-muted, var(--color-fg-subtle))',
    },
    {
      value: 'cancelled',
      displayName: 'Cancelled',
      priority: 4,
      icon: StopIcon,
      iconColor: 'var(--fgColor-muted, var(--color-fg-subtle))',
    },
    {
      value: 'skipped',
      displayName: 'Skipped',
      priority: 4,
      icon: SkipIcon,
      iconColor: 'var(--fgColor-muted, var(--color-fg-subtle))',
    },
  ],
  type: [
    {value: 'issue', displayName: 'Issue', priority: 1, icon: IssueOpenedIcon},
    {value: 'pr', displayName: 'Pull Request', priority: 2, icon: GitPullRequestIcon},
  ],
  updated: TIME_RANGE_VALUES,
}

export const TEAM_VALUE_FILTERS = [FILTER_KEYS.team, FILTER_KEYS.teamReviewRequested]

export const TOP_REPOSITORIES_COUNT = 25
export const TOP_ORGANIZATION_COUNT = 100

export type IS_FILTER_PROVIDER_VALUE_KEYS =
  | 'action'
  | 'closed'
  | 'codespace'
  | 'discussion'
  | 'draft'
  | 'issue'
  | 'locked'
  | 'merged'
  | 'open'
  | 'pr'
  | 'repository'
  | 'unlocked'

export const IS_FILTER_PROVIDER_VALUES: Record<IS_FILTER_PROVIDER_VALUE_KEYS, FilterSuggestion> = {
  action: {value: 'action', displayName: 'Action', priority: 3, icon: PlayIcon},
  closed: {value: 'closed', displayName: 'Closed', priority: 2, icon: IssueClosedIcon},
  codespace: {value: 'codespace', displayName: 'Codespace', priority: 3, icon: CodespacesIcon},
  discussion: {value: 'discussion', displayName: 'Discussion', priority: 4, icon: CommentDiscussionIcon},
  draft: {value: 'draft', displayName: 'Draft', priority: 3, icon: GitPullRequestDraftIcon},
  issue: {value: 'issue', displayName: 'Issue', priority: 1, icon: IssueOpenedIcon},
  locked: {value: 'locked', displayName: 'Locked', priority: 4, icon: LockIcon},
  merged: {value: 'merged', displayName: 'Merged', priority: 3, icon: GitMergeIcon},
  open: {value: 'open', displayName: 'Open', priority: 1, icon: IssueOpenedIcon},
  pr: {value: 'pr', displayName: 'Pull Request', priority: 1, icon: GitPullRequestIcon},
  repository: {value: 'repository', displayName: 'Repository', priority: 2, icon: RepoIcon},
  unlocked: {value: 'unlocked', displayName: 'Unlocked', priority: 4, icon: UnlockIcon},
}

export type SORT_FILTER_PROVIDER_VALUE_KEYS =
  | 'created'
  | 'updated'
  | 'comments'
  | 'reactions'
  | 'committer-date'
  | 'author-date'

export const SORT_FILTER_PROVIDER_VALUES = {
  'created-desc': {
    value: 'created-desc',
    displayName: 'Newest',
    priority: 0,
    aliases: ['created'],
  },
  'created-asc': {
    value: 'created-asc',
    displayName: 'Oldest',
    priority: 1,
  },
  'updated-desc': {
    value: 'updated-desc',
    displayName: 'Recently updated',
    priority: 2,
    aliases: ['updated'],
  },
  'updated-asc': {
    value: 'updated-asc',
    displayName: 'Least recently updated',
    priority: 3,
  },
  'comments-desc': {
    value: 'comments-desc',
    displayName: 'Most commented',
    priority: 4,
    aliases: ['interactions', 'interactions-desc', 'comments'],
  },
  'comments-asc': {
    value: 'comments-asc',
    displayName: 'Least commented',
    priority: 5,
    aliases: ['interactions-asc'],
  },
  'reactions-desc': {
    value: 'reactions-desc',
    displayName: 'Most reactions',
    priority: 6,
    aliases: ['reactions'],
  },
  'reactions-asc': {
    value: 'reactions-asc',
    displayName: 'Least reactions',
    priority: 7,
  },
  'committer-date-desc': {
    value: 'committer-date-desc',
    displayName: 'Most recent committer date',
    priority: 8,
    aliases: ['committer-date'],
  },
  'committer-date-asc': {
    value: 'committer-date-asc',
    displayName: 'Least recent committer date',
    priority: 9,
  },
  'author-date-desc': {
    value: 'author-date-desc',
    displayName: 'Most recent author date',
    priority: 9,
    aliases: ['author-date'],
  },
  'author-date-asc': {
    value: 'author-date-asc',
    displayName: 'Least recent author date',
    priority: 9,
  },
}

export const SORT_REACTIONS_FILTER_PROVIDER_VALUES = [
  {
    value: 'reactions-+1',
    displayName: 'Most thumbs up (👍) reactions',
    priority: 10,
    aliases: ['reactions-+1-desc'],
  },
  {
    value: 'reactions--1',
    displayName: 'Most thumbs down (👎) reactions',
    priority: 10,
    aliases: ['reactions--1-desc'],
  },
  {
    value: 'reactions-smile',
    displayName: 'Most laugh (😄) reactions',
    priority: 10,
    aliases: ['reactions-smile-desc'],
  },
  {
    value: 'reactions-thinking_face',
    displayName: 'Most confused (😕) reactions',
    priority: 10,
    aliases: ['reactions-thinking_face-desc'],
  },
  {
    value: 'reactions-tada',
    displayName: 'Most hooray (🎉) reactions',
    priority: 10,
    aliases: ['reactions-tada-desc'],
  },
  {
    value: 'reactions-heart',
    displayName: 'Most heart (❤️) reactions',
    priority: 10,
    aliases: ['reactions-heart-desc'],
  },
  {
    value: 'reactions-eyes',
    displayName: 'Most eyes (👀) reactions',
    priority: 10,
    aliases: ['reactions-eyes-desc'],
  },
  {
    value: 'reactions-rocket',
    displayName: 'Most rocket (🚀) reactions',
    priority: 10,
    aliases: ['reactions-rocket-desc'],
  },
]

export const KEYWORDS = ['AND', 'OR']

export type LINKED_FILTER_PROVIDER_VALUE_KEYS = 'issue' | 'pr'

export const LINKED_FILTER_PROVIDER_VALUES: Record<LINKED_FILTER_PROVIDER_VALUE_KEYS, FilterSuggestion> = {
  issue: {value: 'issue', displayName: 'Issue', priority: 1, icon: IssueOpenedIcon},
  pr: {value: 'pr', displayName: 'Pull Request', priority: 2, icon: GitPullRequestIcon},
}

export const MAX_NESTED_GROUPS = 5
