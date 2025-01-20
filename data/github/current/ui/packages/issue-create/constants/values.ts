export const VALUES = {
  repositoriesPreloadCount: 5,
  localStorageKeys: {
    issueCreateMore: (prefix: string) => `${prefix}.create-issue-create-more`,
    issueTitle: (prefix: string) => `${prefix}.create-issue-title`,
    issueBody: (prefix: string) => `${prefix}.create-issue-body`,
    issueLabels: (prefix: string) => `${prefix}.create-issue-labels`,
    issueAssignees: (prefix: string) => `${prefix}.create-issue-assignees`,
    issueMilestone: (prefix: string) => `${prefix}.create-issue-milestone`,
    issueProjects: (prefix: string) => `${prefix}.create-issue-projects`,
    issueRepoId: (prefix: string) => `${prefix}.create-issue-repo-id`,
    issueTemplateId: (prefix: string) => `${prefix}.create-issue-template-id`,
    issueIssueType: (prefix: string) => `${prefix}.create-issue-type`,
  },
  storageKeyPrefixes: {
    defaultFallback: 'hyperlist',
    globalAdd: 'issue-global-add',
  },
}

export function storageKeys(prefix: string) {
  return Object.values(VALUES.localStorageKeys).map(s => s(prefix))
}

// Values that we want to show the confirmation dialog for if they're not empty
const discardConfirmationStorageKeys = {
  title: VALUES.localStorageKeys.issueTitle,
  body: VALUES.localStorageKeys.issueBody,
}

export function discardStorageKeys(prefix: string) {
  return Object.values(discardConfirmationStorageKeys).map(s => s(prefix))
}
