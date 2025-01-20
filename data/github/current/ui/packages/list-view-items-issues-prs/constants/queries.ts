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
