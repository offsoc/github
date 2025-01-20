import type {ItemIdentifier} from '../types/issue'

export const issueUrl = (issue: Omit<ItemIdentifier, 'type'>) => `/${issue.owner}/${issue.repo}/issues/${issue.number}`
export const labelsUrl = (issue: Omit<ItemIdentifier, 'type' | 'number'>) => `/${issue.owner}/${issue.repo}/labels`
export const userUrl = (login: string) => `/${login}`
export const pullRequestUrl = (pullRequest: Omit<ItemIdentifier, 'type'>) =>
  `/${pullRequest.owner}/${pullRequest.repo}/pull/${pullRequest.number}`
export const repoExternalUrl = (issue: ItemIdentifier) => `/${issue.owner}/${issue.repo}`
export const issueOwnerExternalUrl = (issue: ItemIdentifier) => `/${issue.owner}`
export const issueCommentExternalUrl = (issue: ItemIdentifier, databaseId?: number) =>
  `/${issue.owner}/${issue.repo}/issues/${issue.number}#issuecomment-${databaseId}`
export const issueEventExternalUrl = (issue: ItemIdentifier, databaseId?: number | null) =>
  `/${issue.owner}/${issue.repo}/issues/${issue.number}#event-${databaseId}`
export const issueReferenceEventExternalUrl = (issue: ItemIdentifier, isIssue: boolean, databaseId?: number | null) =>
  `/${issue.owner}/${issue.repo}/issues/${issue.number}#ref-${isIssue ? 'issue' : 'pullrequest'}-${databaseId}`

export const disableFeatureInUrl = (url: string, featureName: string): string | undefined => {
  if (url.includes(`_features=!${featureName}`)) return

  let baseUrl = url
  let hash = ''

  // check if there is a hash parameter, if that's the case, add it add the end of the returned url
  const hashIndex = url.indexOf('#')
  if (hashIndex !== -1) {
    baseUrl = url.substring(0, hashIndex)
    hash = url.substring(hashIndex)
  }

  baseUrl = baseUrl.includes('?') ? `${baseUrl}&_features=!${featureName}` : `${baseUrl}?_features=!${featureName}`
  return `${baseUrl}${hash}`
}
