import type {BaseRepo} from './types'

const orgPattern = /org:[^\s]+ /i
const isPublicPattern = /is:public/i

interface Props {
  org: string
  query: string
}
export function formatQueryWithOrg({org, query}: Props): string {
  const prefix = `org:${org}`
  const qTrimmed = query.trim()

  if (!qTrimmed.length) return prefix

  const sanitized = qTrimmed.replace(orgPattern, '').replace(isPublicPattern, '')

  const withOrg = `${prefix} ${sanitized}`

  const trimmed = withOrg.replace(/ {2,}/g, ' ').trim()

  return trimmed
}

type SortFn = (a: BaseRepo, b: BaseRepo) => number

export const sortFn: SortFn = (a, b) => {
  const lowerA = a.nameWithOwner.toLowerCase()
  const lowerB = b.nameWithOwner.toLowerCase()

  if (lowerA < lowerB) return -1
  if (lowerA > lowerB) return 1
  return 0
}
