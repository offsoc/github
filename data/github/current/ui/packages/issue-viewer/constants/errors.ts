export const ERRORS = {
  couldNotUpdateLinkedPullRequests: 'Could not update linked pull requests',
  couldNotUpdateLinkedBranches: 'Could not update linked branches',
  couldNotUpdateIssueTitle: 'Could not update issue title',
  couldNotPinIssue: 'Could not pin issue',
  couldNotUnpinIssue: 'Could not unpin issue',
  couldNotStartTransfer: 'Could not initiate issue transfer',
  issueTypeUpdateError: 'Something went wrong, could not set the issue type. Please reload and try again.',
  issueTypeUpdateErrorReporting: (message: string) => `Changing issue type failed with error:${message}`,
}
