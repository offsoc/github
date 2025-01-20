export type LinkedPullRequest = {
  number: number
  path: string
  title: string
  state: 'open' | 'closed'
  createdAt: string
  closedAt: string | null
  mergedAt: string | null
  draft: boolean
}
