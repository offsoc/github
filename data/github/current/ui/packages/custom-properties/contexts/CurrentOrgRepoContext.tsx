import {createContext, useContext, useMemo} from 'react'
import {useParams} from 'react-router-dom'

interface CurrentOrgRepoContextState {
  org: {
    login: string
  }
  repo: {
    name: string
  }
}
const CurrentOrgRepoContext = createContext<CurrentOrgRepoContextState | null>(null)

export function CurrentOrgRepoProvider({children}: React.PropsWithChildren) {
  // Org and Repo are always defined. We provide a default value to make ts happy.
  const {org = '', repo = ''} = useParams()

  const state = useMemo(() => ({org: {login: org}, repo: {name: repo}}), [org, repo])

  return <CurrentOrgRepoContext.Provider value={state}>{children}</CurrentOrgRepoContext.Provider>
}

export function useCurrentOrg() {
  const context = useContext(CurrentOrgRepoContext)

  if (!context) {
    throw new Error('useCurrentOrg must be used within CurrentOrgRepoProvider')
  }

  return context.org
}

export function useCurrentRepo() {
  const context = useContext(CurrentOrgRepoContext)

  if (!context) {
    throw new Error('useCurrentRepo must be used within CurrentOrgRepoProvider')
  }

  return context.repo
}
