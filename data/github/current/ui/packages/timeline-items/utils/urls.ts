export const createIssueEventExternalUrl = (issueBaseUrl: string, databaseId: number | null | undefined) =>
  `${issueBaseUrl}#event-${databaseId}`
