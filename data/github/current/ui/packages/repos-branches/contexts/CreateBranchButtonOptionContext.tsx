import type {CreateBranchButtonProps} from '@github-ui/create-branch-button'
import {type PropsWithChildren, createContext, useContext} from 'react'

const CreateBranchButtonOptionContext = createContext<CreateBranchButtonProps | null>(null)

export function CreateBranchButtonOptionProvider({
  options,
  children,
}: PropsWithChildren<{options: CreateBranchButtonProps}>) {
  return <CreateBranchButtonOptionContext.Provider value={options}>{children}</CreateBranchButtonOptionContext.Provider>
}

export function useCreateBranchButtonOptions() {
  const context = useContext(CreateBranchButtonOptionContext)

  if (!context) {
    throw new Error('useCreateBranchButtonOptions must be used within CreateBranchButtonOptionProvider')
  }

  return context
}
