export const IS_QUALIFIERS = {
  open: 'open',
  closed: 'closed',
  merged: 'merged',
  draft: 'draft',
  issue: 'issue',
  pr: 'pr',
}

export const STATE_REASON_QUALIFIER = {
  not_planned: 'not planned',
  completed: 'completed',
  reopened: 'reopened',
}

const LAST_UPDATED_QUALIFIERS = {
  seven_days: '7days',
  fourteen_days: '14days',
  twenty_one_days: '21days',
}

const UPDATED_QUALIFIERS = {
  seven_days: '<@today-7d',
  two_weeks: '<@today-2w',
  one_month: '<@today-1m',
}

export const META_QUALIFIERS = {
  is: IS_QUALIFIERS,
  reason: STATE_REASON_QUALIFIER,
  'last-updated': LAST_UPDATED_QUALIFIERS,
  updated: UPDATED_QUALIFIERS,
}

const AmbivalentColumNames = new Set<string>(['reason'])

export const isAmbivalentColumn = (name: string): boolean => AmbivalentColumNames.has(name.toLowerCase())
