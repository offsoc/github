export const getCacheKey = (onlyWithIssueTypes: boolean, milestone?: string): string => {
  if (milestone) return `milestone: ${milestone}`
  return onlyWithIssueTypes ? 'withIssueTypes' : 'default'
}
