import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'

export function getIssueItemIdentifier(url: string): ItemIdentifier | undefined {
  const issue_regexp = /.*\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/issues\/(?<number>\d+)$/

  const match = url.match(issue_regexp)
  const owner = match?.groups?.owner
  const repo = match?.groups?.repo
  const number = match?.groups?.number
  return owner && number && repo ? {number: parseInt(number, 10), repo, owner, type: 'Issue'} : undefined
}
