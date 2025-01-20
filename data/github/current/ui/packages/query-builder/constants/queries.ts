// note that this list also exists in app/helpers/hyperlist_web/helper.rb
export const QUERIES = {
  open: 'state:open',
  closed: 'state:closed',
  default: 'state:open archived:false assignee:@me sort:updated-desc',
  defaultRepoLevelOpen: 'is:issue state:open',
  defaultRepoLevelClosed: 'is:issue state:closed',
  assignedToMe: 'state:open archived:false assignee:@me sort:updated-desc',
  pullsAssignedToMe: 'state:open archived:false assignee:@me is:pr sort:updated-desc',
  mentioned: 'state:open archived:false mentions:@me sort:updated-desc',
  createdByMe: 'state:open archived:false author:@me sort:updated-desc',
  recentActivity: 'involves:@me updated:>@today-1w sort:updated-desc',
  pullsAuthored: 'state:open archived:false author:@me is:pr updated:>@today-60d sort:updated-desc',
  pullsReviewed: 'state:open archived:false reviewed-by:@me -author:@me is:pr updated:>@today-60d sort:updated-desc',
  pullsReviewRequested:
    'state:open archived:false user-review-requested:@me is:pr updated:>@today-60d sort:updated-desc',
  pullsMentioned: 'state:open archived:false mentions:@me is:pr updated:>@today-60d sort:updated-desc',
}

export const QUERY_FIELDS = {
  label: 'label',
  author: 'author',
  assignee: 'assignee',
  org: 'org',
  repo: 'repo',
  type: 'type',
} as const

export const QUERY_DATE_TOKENS: Record<string, string> = {
  today: '@today',
}

export const QUERY_DATE_UNITS = {
  day: 'd',
  week: 'w',
  month: 'm',
  year: 'y',
}

// This regex matches and captures the value and unit for the date offset ("<VALUE><UNIT>")
export const QUERY_DATE_OFFSET_REGEX = new RegExp(`^(\\d+)(${Object.values(QUERY_DATE_UNITS).join('|')})`)

export const QUERY_TOKEN_PREFIX = '@'

export const QUERY_DEFAULT_SORT_QUALIFIER = 'sort:created-desc'
