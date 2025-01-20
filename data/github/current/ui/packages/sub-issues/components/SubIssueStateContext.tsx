import {createContext, useCallback, useContext, useMemo, useState} from 'react'

export type SubIssueStateContext = {
  createDialogOpen: boolean
  activeIssueId: string | undefined
  closeCreateDialog: () => void
  openCreateDialog: (issueId: string) => void
}

/**
 * Context sub-issues-related state in the issue viewer.
 */
export const SubIssueStateContext = createContext<SubIssueStateContext | undefined>(undefined)

export function SubIssueStateProvider({children}: {children: React.ReactNode}) {
  const [activeIssueId, setActiveIssueId] = useState<string | undefined>(undefined)

  const createDialogOpen = activeIssueId !== undefined
  const openCreateDialog = useCallback((issueId: string) => setActiveIssueId(issueId), [])
  const closeCreateDialog = useCallback(() => setActiveIssueId(undefined), [])

  return (
    <SubIssueStateContext.Provider
      value={useMemo(
        () => ({
          createDialogOpen,
          activeIssueId,
          closeCreateDialog,
          openCreateDialog,
        }),
        [activeIssueId, closeCreateDialog, createDialogOpen, openCreateDialog],
      )}
    >
      {children}
    </SubIssueStateContext.Provider>
  )
}

export const useSubIssueState = (): SubIssueStateContext => {
  const context = useContext(SubIssueStateContext)
  if (!context) {
    throw new Error('useSubIssueState must be used within a SubIssueStateContext')
  }
  return context
}
