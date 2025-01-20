import {useContext} from 'react'

import {IssueContext} from './issue-state-provider'

/**
 * Helper to use the issue context from IssueStateProvider. Using this context will cause
 * rerenders, as it will be updated when the issue state changes.
 * @returns The value of the IssueContext
 */
export const useIssueContext = () => {
  const context = useContext(IssueContext)
  if (!context) {
    throw new Error('useIssueContext must be used within a IssueContext.Provider.')
  }

  return context
}
