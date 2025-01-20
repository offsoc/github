export const MESSAGES = {
  suggested: 'Suggested',
  confirmLeave: 'Are you sure you want to leave? You have unsaved changes.',
  errorLoadingIssues: 'We encountered an error trying to load issues.',
  failedToLoadIssues: 'Failed to load issues.',
  searchTeams: 'Enter team name',
  searchTeamsLabel: 'Search for a team',
  notAllTeamsLoaded: (nrOfTeams: number) => `Warning: Loaded ${nrOfTeams} of your teams.`,
  nrSelectedTeams: (nrOfSelected: number) => `${nrOfSelected} teams selected`,
  title: 'Title',
  icon: 'Icon',
  description: 'Description',
  query: 'Query',
  moreItemsAvailableTitle: (issuesOrPRs: string) => `More ${issuesOrPRs} available`,
  moreItemsAvailableDescription: (nrOfItems: number, issuesOrPRs: string) =>
    `Showing the first ${nrOfItems} ${issuesOrPRs}. To view additional ${issuesOrPRs}, please refine your search.`,
}
