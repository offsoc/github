import {type Icon, Octicon} from '@github-ui/query-builder-element/query-builder-api'
import type {Environment} from 'react-relay'
export const NOT_SHOWN = 10
export const FILTER_PRIORITY_DISPLAY_THRESHOLD = 5
export const FILTERS = {
  archived: {
    name: 'Archived',
    value: 'archived',
    priority: NOT_SHOWN,
    icon: Octicon.Archived,
    description: 'Specify archived or non-archived items only',
  },
  base: {
    name: 'Base',
    value: 'base',
    priority: NOT_SHOWN,
    icon: Octicon.Branch,
    description: 'Pull Request base branch',
  },
  closed: {
    name: 'Closed date',
    value: 'closed',
    priority: NOT_SHOWN,
    icon: Octicon.Calendar,
    description: 'Closing date',
  },
  comments: {
    name: 'Comment count',
    value: 'comments',
    priority: NOT_SHOWN,
    icon: Octicon.Comment,
    description: 'Item comment count',
  },
  created: {
    name: 'Creation date',
    value: 'created',
    priority: NOT_SHOWN,
    icon: Octicon.Calendar,
    description: 'Creation date',
  },
  draft: {
    name: 'Draft',
    value: 'draft',
    priority: NOT_SHOWN,
    icon: Octicon.Draft,
    description: 'Search for draft items',
  },
  head: {
    name: 'Head',
    value: 'head',
    priority: NOT_SHOWN,
    icon: Octicon.Branch,
    description: 'Head branch commit sha',
  },
  in: {
    name: 'In',
    value: 'in',
    icon: Octicon.Filter,
    description: 'Restrict your search to the title, body, comments, or any combination of these',
    priority: NOT_SHOWN,
  },
  interactions: {
    name: 'Interactions count',
    value: 'interactions',
    priority: NOT_SHOWN,
    icon: Octicon.Discussion,
    description: 'Interaction count',
  },
  is: {
    name: 'Is',
    value: 'is',
    icon: Octicon.Apps,
    description: 'Filter only "issues", "pulls", "open", "closed", or "draft"',
    priority: 3,
  },
  language: {
    name: 'Code language',
    value: 'language',
    priority: NOT_SHOWN,
    icon: Octicon.Code,
    description: 'Code language',
  },
  linked: {
    name: 'Linked',
    value: 'linked',
    icon: Octicon.PullRequest,
    description: 'Items linked to an issue or pull request',
    priority: NOT_SHOWN,
  },
  merged: {
    name: 'Merge date',
    value: 'merged',
    priority: NOT_SHOWN,
    icon: Octicon.Calendar,
    description: 'Merge date',
  },
  milestone: {
    name: 'Milestone',
    value: 'milestone',
    priority: NOT_SHOWN,
    icon: Octicon.Milestone,
    description: 'Milestone',
  },
  no: {
    name: 'No',
    value: 'no',
    priority: NOT_SHOWN,
    icon: Octicon.Forbidden,
    description: 'Filter by items without a specific metadata value',
  },
  reactions: {
    name: 'Reaction count',
    value: 'reactions',
    priority: NOT_SHOWN,
    icon: Octicon.Reaction,
    description: 'Reactions count',
  },
  reason: {
    name: 'Reason',
    value: 'reason',
    priority: NOT_SHOWN,
    icon: Octicon.Mention,
    description: 'Filter by item closed reason',
  },
  review: {
    name: 'Review state',
    value: 'review',
    priority: NOT_SHOWN,
    icon: Octicon.PullRequest,
    description: 'Specify a review state',
  },
  sha: {
    name: 'Commit SHA',
    value: 'sha',
    priority: NOT_SHOWN,
    icon: Octicon.FileCode,
    description: 'Commit SHA',
  },
  state: {
    name: 'State',
    value: 'state',
    priority: 3,
    icon: Octicon.Draft,
    description: 'Look for open / closed items',
  },
  status: {
    name: 'Status',
    value: 'status',
    priority: NOT_SHOWN,
    icon: Octicon.Draft,
    description: 'Commit status: pending | success | failure',
  },
  team: {
    name: 'Team',
    value: 'team',
    priority: NOT_SHOWN,
    icon: Octicon.Team,
    description: 'Team name',
  },
  teamReviewRequested: {
    name: 'Team review requested',
    value: 'team-review-requested',
    priority: NOT_SHOWN,
    icon: Octicon.Team,
    description: 'Review requested from team',
  },
  sort: {
    name: 'Sort',
    value: 'sort',
    priority: NOT_SHOWN,
    icon: Octicon.Sort,
    description: 'Sort results',
  },
  // The usage of type: for item type will be deprecated in favor of is:issue or is:pr
  // and the type: qualifier will be used for issueType filtering
  itemType: {
    name: 'Item Type',
    value: 'type',
    priority: NOT_SHOWN,
    icon: Octicon.Apps,
    description: 'Specify the type of item to search for: issue or pr',
  },
  type: {
    name: 'Type',
    value: 'type',
    priority: NOT_SHOWN,
    icon: Octicon.Issue,
    description: 'Specify the type of issue to search for',
  },
  updated: {
    name: 'Update date',
    value: 'updated',
    priority: NOT_SHOWN,
    icon: Octicon.Calendar,
    description: 'Updated date',
  },
  repo: {
    name: 'Repository',
    value: 'repo',
    priority: 1,
    icon: Octicon.Repo,
    singularItemName: 'Repository',
    description: 'Filter by repository',
  },
  org: {
    name: 'Organization',
    value: 'org',
    priority: 2,
    icon: Octicon.Organization,
    singularItemName: 'Organization',
    description: 'Filter by organization',
  },
  label: {
    name: 'Label',
    value: 'label',
    priority: 3,
    icon: Octicon.Tag,
    singularItemName: 'Label',
    description: 'Filter by label',
  },
  project: {
    name: 'Project',
    value: 'project',
    priority: 3,
    icon: Octicon.Project,
    singularItemName: 'Project',
    description: '',
  },
}

export const KEY_ONLY_FILTERS = [FILTERS.base, FILTERS.head, FILTERS.language, FILTERS.milestone, FILTERS.sha]

export const STATIC_VALUE_FILTERS = [
  FILTERS.archived,
  FILTERS.comments,
  FILTERS.closed,
  FILTERS.created,
  FILTERS.draft,
  FILTERS.in,
  FILTERS.interactions,
  FILTERS.is,
  FILTERS.linked,
  FILTERS.merged,
  FILTERS.no,
  FILTERS.reactions,
  FILTERS.reason,
  FILTERS.review,
  FILTERS.sort,
  FILTERS.state,
  FILTERS.status,
  FILTERS.updated,
]

export const USER_FILTERS = {
  author: {
    name: 'Author',
    value: 'author',
    icon: Octicon.Person,
    description: 'The author of the item',
    priority: 3,
  },
  assignee: {
    name: 'Assignee',
    value: 'assignee',
    icon: Octicon.Person,
    description: 'The assignee of the item',
    priority: 3,
  },
  involves: {
    name: 'Involves',
    value: 'involves',
    icon: Octicon.Person,
    description: 'The user involved in the item',
    priority: NOT_SHOWN,
  },
  mentions: {
    name: 'Mentions',
    value: 'mentions',
    icon: Octicon.Mention,
    description: 'The user mentioned in the item',
    priority: NOT_SHOWN,
  },
  commenter: {
    name: 'Commenter',
    value: 'commenter',
    icon: Octicon.Person,
    description: 'Items commented on by the user',
    priority: NOT_SHOWN,
  },
  reviewRequested: {
    name: 'Review Requested',
    value: 'review-requested',
    icon: Octicon.Person,
    description: 'Items with review requested for the user',
    priority: NOT_SHOWN,
  },
  reviewedBy: {
    name: 'Reviewed By',
    value: 'reviewed-by',
    icon: Octicon.Person,
    description: 'Items reviewed by the user',
    priority: NOT_SHOWN,
  },
  user: {
    name: 'User',
    value: 'user',
    icon: Octicon.Person,
    description: 'Items in repositories owned by the user',
    priority: NOT_SHOWN,
  },
  userReviewRequested: {
    name: 'User Review Requested',
    value: 'user-review-requested',
    icon: Octicon.Mention,
    description: 'Items with review requested for the user explicitly',
    priority: NOT_SHOWN,
  },
}
export const USER_VALUE_FILTERS = Object.values(USER_FILTERS)

export const TIME_RANGE_VALUES = [
  {value: '@today', name: 'Today', description: 'Today', priority: 1},
  {
    valueFunc: () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = (now.getDate() - 1).toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    name: 'Yesterday',
    description: 'Yesterday',
    priority: 2,
  },
  {value: '>@today-1w', name: 'Last 7 days', description: 'Last 7 days', priority: 3},
  {value: '>@today-1m', name: 'Last 30 days', description: 'Last 30 days', priority: 4},
  {
    valueFunc: () => {
      const now = new Date()
      return `>${now.getFullYear() - 1}-12-31`
    },
    name: 'This year',
    description: 'This year',
    priority: 5,
  },
]

const NUMBER_COUNT_VALUE = [
  {value: '<10', name: 'Less than 10', description: 'Less than 10', priority: 1},
  {value: '>10', name: 'More than 10', description: 'More than 10', priority: 2},
  {value: '10..100', name: 'Between 10 and 100', description: 'Between 10 and 100', priority: 3},
  {value: '100', name: '100', description: 'Exactly 100', priority: 4},
]

export const FILTER_VALUES: Record<string, FilterValueType[]> = {
  archived: [
    {value: 'true', name: 'Yes', description: 'Only archived items', priority: 1},
    {value: 'false', name: 'No', description: 'Only non-archived items', priority: 2},
  ],
  closed: TIME_RANGE_VALUES,
  comments: NUMBER_COUNT_VALUE,
  created: TIME_RANGE_VALUES,
  draft: [
    {value: 'true', name: 'Yes', description: 'Only draft items', priority: 1},
    {value: 'false', name: 'No', description: 'Only non-draft items', priority: 2},
  ],
  in: [
    {value: 'title', description: 'Match values in title', priority: 1},
    {value: 'body', description: 'Match values in body', priority: 2},
    {value: 'comments', description: 'Match values in comments', priority: 3},
  ],
  interactions: NUMBER_COUNT_VALUE,
  is: [
    {value: 'issue', description: 'Issues only', priority: 1, icon: Octicon.Issue},
    {name: 'Pull Request', value: 'pr', description: 'Pull Requests only', priority: 2, icon: Octicon.PullRequest},
    {value: 'open', description: 'Items with open state', priority: 3, icon: Octicon.Issue},
    {value: 'closed', description: 'Items with closed state', priority: 4, icon: Octicon.IssueClosed},
    {value: 'draft', description: 'Items with draft state', priority: 5, icon: Octicon.Draft},
  ],
  type: [
    {value: 'issue', description: 'Issues only', priority: 1, icon: Octicon.Issue},
    {name: 'Pull Request', value: 'pr', description: 'Pull Requests only', priority: 2, icon: Octicon.PullRequest},
  ],
  linked: [
    {value: 'issue', description: 'Pull requests that are linked to an issue', priority: 2, icon: Octicon.Issue},
    {
      name: 'Pull Request',
      value: 'pr',
      description: 'Issue that are linked to pull requests',
      priority: 1,
      icon: Octicon.PullRequest,
    },
  ],
  merged: TIME_RANGE_VALUES,
  no: [
    {value: 'assignee', description: 'Items without an assignee', priority: 1, icon: Octicon.Mention},
    {value: 'label', description: 'Items without a label', priority: 2, icon: 'tag' as Icon},
    {value: 'milestone', description: 'Items without a milestone', priority: 3, icon: 'milestone' as Icon},
    {value: 'project', description: 'Items without a project', priority: 4, icon: Octicon.Project},
  ],
  reactions: NUMBER_COUNT_VALUE,
  reason: [
    {value: 'completed', description: 'Items that were closed as completed', priority: 1},
    {value: 'not planned', description: 'Items that were closed as not planned', priority: 2},
  ],
  review: [
    {value: 'none', name: 'No reviews', description: 'No reviews', priority: 1},
    {value: 'required', name: 'Review required', description: 'Review required', priority: 2},
    {value: 'approved', description: 'Has approving review', priority: 3},
    {value: 'changes_requested', name: 'Changes requested', description: 'Review requesting changes', priority: 4},
  ],
  sort: [
    {value: 'created-desc', name: 'Newest', description: 'Newest', priority: 1},
    {value: 'created-asc', name: 'Oldest', description: 'Oldest', priority: 2},
    {value: 'comments-desc', name: 'Most commented', description: 'Most commented', priority: 3},
    {value: 'updated-desc', name: 'Recently updated', description: 'Recently updated', priority: 4},
  ],
  state: [
    {value: 'open', description: 'Items with open state', priority: 1},
    {value: 'closed', description: 'Items with closed state', priority: 2},
  ],
  status: [
    {value: 'pending', description: 'Items with pending status', priority: 1},
    {value: 'success', description: 'Items with success status', priority: 2},
    {value: 'failure', description: 'Items with failure status', priority: 3},
  ],
  updated: TIME_RANGE_VALUES,
}

export const TEAM_VALUE_FILTERS = [FILTERS.team, FILTERS.teamReviewRequested]

export const TOP_REPOSITORIES_COUNT = 25
export const TOP_ORGANIZATION_COUNT = 100

export type FilterType = {
  name: string
  value: string
  priority: number
  icon: Icon
  description: string
  valuesKey?: string
}

export type FilterRelayType = FilterType & {
  relayEnvironment: Environment
}

export type UserFilterValueType = FilterType & {
  useLogin?: boolean
}

export type BaseFilterValueType = {
  name?: string
  description: string
  priority: number
  icon?: Icon
}

export type ValueFilterType = {
  value: string
} & BaseFilterValueType

export type ValueFuncFilterType = {
  valueFunc: () => string
} & BaseFilterValueType

export type FilterValueType = ValueFilterType | ValueFuncFilterType

export const NegativeFilters = {
  archived: 'Not archived',
  base: 'Without base',
  closed: 'Not closed on date',
  comments: 'Without comments count',
  created: 'Not created on date',
  draft: 'Not draft',
  head: 'Without head',
  interactions: 'Without interactions count',
  is: 'Is not',
  language: 'Without code language',
  linked: 'Without linked',
  reactions: 'Without reactions count',
  reason: 'Without reason',
  review: 'Without review state',
  state: 'Without state',
  status: 'Without status',
  team: 'Not in team',
  'team-review-requested': 'Not in team review requested',
  type: 'Without type',
  updated: 'Not updated on date',
  repo: 'Not in repository',
  org: 'Not in organization',
  label: 'Without label',
  project: 'Not in project',
  author: 'Not authored by',
  assignee: 'Not assigned to',
  involves: 'Not involving',
  mentions: 'Not mentioned by',
  commenter: 'Not commented by',
  'review-requested': 'Without review requested by',
  'reviewed-by': 'Not reviewed by',
  user: 'Not owned by user',
  'user-review-requested': 'Without user review requested',
}
